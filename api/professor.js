/*
  Área do professor (precisa do cabeçalho x-senha igual à variável PROFESSOR_SENHA).
  GET    /api/professor                      -> { turmas: [{ chave, nome, alunos }] }
  GET    /api/professor?turma=2A             -> { alunos: [progresso, ...] }
  DELETE /api/professor?turma=2A&nome=Ana    -> apaga um aluno (nome digitado errado, por exemplo)
  POST   /api/professor { acao: "oficiais", lista: ["1º A", ...] }      -> define as turmas oficiais
  POST   /api/professor { acao: "organizar", plano: [{ chave, destino }] }
         destino = nome de uma turma oficial (junta os alunos nela) ou "__apagar__" (apaga os alunos)
*/
const db = require("./_db");
const crypto = require("crypto");

function senhaOk(req) {
  const certa = process.env.PROFESSOR_SENHA || "";
  const dada = String(req.headers["x-senha"] || "");
  if (!certa) return false;
  const a = crypto.createHash("sha256").update(certa).digest();
  const b = crypto.createHash("sha256").update(dada).digest();
  return crypto.timingSafeEqual(a, b);
}

async function acao(req, res) {
  const b = await db.readBody(req);
  if (b.acao === "oficiais") {
    const lista = (Array.isArray(b.lista) ? b.lista : []).map((x) => db.clean(x, 30)).filter(Boolean).slice(0, 20);
    if (!lista.length) return db.send(res, 400, { erro: "Informe pelo menos uma turma" });
    await db.pipeline([["SET", "bab:oficiais", JSON.stringify(lista)]]);
    return db.send(res, 200, { ok: true, oficiais: lista });
  }
  if (b.acao !== "organizar" || !Array.isArray(b.plano)) return db.send(res, 400, { erro: "Ação inválida" });
  const ofs = await db.oficiais();
  const plano = b.plano
    .map((x) => ({ de: db.safeKey(x.chave), para: x.destino === "__apagar__" ? "__apagar__" : ofs.find((o) => o === x.destino) }))
    .filter((x) => x.de && x.para);
  if (!plano.length) return db.send(res, 200, { ok: true, movidos: 0, apagados: 0 });
  // lê os alunos de todas as turmas de origem e de destino
  const destinos = Array.from(new Set(plano.filter((x) => x.para !== "__apagar__").map((x) => db.turmaKey(x.para))));
  const chaves = Array.from(new Set(plano.map((x) => x.de).concat(destinos)));
  const membrosL = await db.pipeline(chaves.map((tk) => ["SMEMBERS", db.K.turma(tk)]));
  const membros = {};
  chaves.forEach((tk, i) => (membros[tk] = membrosL[i] || []));
  const leituras = [];
  plano.forEach((x) => membros[x.de].forEach((nk) => leituras.push([x.de, nk])));
  plano.forEach((x) => {
    if (x.para === "__apagar__") return;
    const dk = db.turmaKey(x.para);
    membros[x.de].forEach((nk) => {
      if (dk !== x.de && membros[dk].includes(nk)) leituras.push([dk, nk]);
    });
  });
  const vals = leituras.length ? (await db.pipeline([["MGET", ...leituras.map(([tk, nk]) => db.K.aluno(tk, nk))]]))[0] : [];
  const reg = {};
  leituras.forEach(([tk, nk], i) => (reg[tk + ":" + nk] = vals[i] ? JSON.parse(vals[i]) : null));
  const cmds = [];
  let movidos = 0,
    apagados = 0;
  const limpar = (tk, nk) => cmds.push(["DEL", db.K.aluno(tk, nk)], ["SREM", db.K.turma(tk), nk], ["HDEL", db.K.placar(tk), nk]);
  plano.forEach((x) => {
    membros[x.de].forEach((nk) => {
      const p = reg[x.de + ":" + nk];
      if (x.para === "__apagar__") {
        limpar(x.de, nk);
        apagados++;
        return;
      }
      const dk = db.turmaKey(x.para);
      if (dk === x.de) {
        // já está na chave certa: só acerta o nome da turma
        if (p) {
          p.turma = x.para;
          cmds.push(["SET", db.K.aluno(dk, nk), JSON.stringify(p)], ["HSET", db.K.placar(dk), nk, JSON.stringify(db.resumo(p))]);
        }
        return;
      }
      if (!p) {
        cmds.push(["SREM", db.K.turma(x.de), nk]);
        return;
      }
      // o mesmo aluno nas duas turmas: fica o progresso mais recente
      const atual = reg[dk + ":" + nk];
      const fica = atual && (atual.updated || 0) > (p.updated || 0) ? atual : p;
      fica.turma = x.para;
      cmds.push(["SET", db.K.aluno(dk, nk), JSON.stringify(fica)], ["SADD", db.K.turma(dk), nk], ["HSET", db.K.placar(dk), nk, JSON.stringify(db.resumo(fica))]);
      limpar(x.de, nk);
      movidos++;
    });
    if (x.para !== "__apagar__" && db.turmaKey(x.para) === x.de) cmds.push(["HSET", db.K.turmas, x.de, x.para]);
    else cmds.push(["HDEL", db.K.turmas, x.de], ["DEL", db.K.turma(x.de)], ["DEL", db.K.placar(x.de)]);
  });
  destinos.forEach((dk) => cmds.push(["HSET", db.K.turmas, dk, db.oficialDe(dk, ofs)]));
  // grava em partes, para não mandar um pedido grande demais
  for (let i = 0; i < cmds.length; i += 200) await db.pipeline(cmds.slice(i, i + 200));
  return db.send(res, 200, { ok: true, movidos, apagados });
}

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 503, { erro: "Banco não conectado" });
  if (!process.env.PROFESSOR_SENHA) return db.send(res, 503, { erro: "Crie a variável PROFESSOR_SENHA na Vercel" });
  if (!senhaOk(req)) {
    await new Promise((r) => setTimeout(r, 600));
    return db.send(res, 401, { erro: "Senha incorreta" });
  }
  try {
    const q = db.query(req);
    if (req.method === "GET" && !q.turma) {
      const [flat] = await db.pipeline([["HGETALL", db.K.turmas]]);
      const pares = [];
      for (let i = 0; i < (flat || []).length; i += 2) pares.push([flat[i], flat[i + 1]]);
      const counts = pares.length ? await db.pipeline(pares.map(([tk]) => ["SCARD", db.K.turma(tk)])) : [];
      const ofs = await db.oficiais();
      const turmas = pares
        .map(([tk, nome], i) => ({ chave: tk, nome, alunos: counts[i] || 0, oficial: db.oficialDe(db.turmaKey(nome), ofs), certa: db.turmaKey(nome) === tk && db.oficialDe(tk, ofs) === nome }))
        .filter((t) => t.alunos > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      return db.send(res, 200, { turmas, oficiais: ofs });
    }
    if (req.method === "POST") return await acao(req, res);
    const tk = db.safeKey(q.chave) || db.turmaKey(q.turma);
    if (!tk) return db.send(res, 400, { erro: "Turma inválida" });
    if (req.method === "GET") {
      const [membros] = await db.pipeline([["SMEMBERS", db.K.turma(tk)]]);
      if (!membros || !membros.length) return db.send(res, 200, { alunos: [] });
      const [vals] = await db.pipeline([["MGET", ...membros.map((nk) => db.K.aluno(tk, nk))]]);
      const alunos = vals.filter(Boolean).map((v) => JSON.parse(v));
      return db.send(res, 200, { alunos });
    }
    if (req.method === "DELETE") {
      const nk = db.keyOf(q.nome);
      if (!nk) return db.send(res, 400, { erro: "Nome inválido" });
      const [, , , restantes] = await db.pipeline([["DEL", db.K.aluno(tk, nk)], ["SREM", db.K.turma(tk), nk], ["HDEL", db.K.placar(tk), nk], ["SCARD", db.K.turma(tk)]]);
      if (!restantes) await db.pipeline([["HDEL", db.K.turmas, tk], ["DEL", db.K.turma(tk)], ["DEL", db.K.placar(tk)]]);
      return db.send(res, 200, { ok: true });
    }
    res.setHeader("Allow", "GET, POST, DELETE");
    db.send(res, 405, { erro: "Método não permitido" });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
