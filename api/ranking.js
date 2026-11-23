/*
  GET /api/ranking?escopo=todas&turma=2A&nome=Ana%20Lima
      -> { escopo, turmas: [{ nome, alunos, xp, media, licoes }], alunos: [{ nome, turma, xp, py, bd, estrelas, voce }] }
  GET /api/ranking?turma=2A&nome=Ana%20Lima   (só a turma)
  Mostra só o primeiro nome e a inicial do sobrenome. "voce" marca quem pediu.
  Usa um resumo pequeno por aluno (bab:r:<turma>), atualizado a cada salvamento.
*/
const db = require("./_db");

/** Resumos de uma turma; monta os que faltam (alunos salvos antes de existir o ranking) */
async function placarDaTurma(tk) {
  const [flat, membros] = await db.pipeline([["HGETALL", db.K.placar(tk)], ["SMEMBERS", db.K.turma(tk)]]);
  const placar = {};
  for (let i = 0; i < (flat || []).length; i += 2) placar[flat[i]] = JSON.parse(flat[i + 1]);
  const faltam = (membros || []).filter((nk) => !placar[nk]);
  if (faltam.length) {
    const [vals] = await db.pipeline([["MGET", ...faltam.map((nk) => db.K.aluno(tk, nk))]]);
    const cmds = [];
    faltam.forEach((nk, i) => {
      if (!vals[i]) return;
      const r = db.resumo(JSON.parse(vals[i]));
      placar[nk] = r;
      cmds.push(["HSET", db.K.placar(tk), nk, JSON.stringify(r)]);
    });
    if (cmds.length) await db.pipeline(cmds);
  }
  return Object.entries(placar)
    .filter(([nk]) => (membros || []).includes(nk))
    .map(([nk, r]) => Object.assign({ nk }, r));
}

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 503, { erro: "Banco não conectado" });
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return db.send(res, 405, { erro: "Método não permitido" });
  }
  try {
    const q = db.query(req);
    const minhaTk = db.turmaKey(q.turma);
    const eu = db.keyOf(q.nome);
    const [flat] = await db.pipeline([["HGETALL", db.K.turmas]]);
    const ofs = await db.oficiais();
    // agrupa as turmas escritas de jeitos diferentes ("1 info A", "1° A INF") numa só
    const grupos = {};
    for (let i = 0; i < (flat || []).length; i += 2) {
      const tk = flat[i];
      const nome = flat[i + 1];
      const c = db.turmaKey(nome);
      if (!grupos[c]) grupos[c] = { nome: db.oficialDe(c, ofs) || nome, chaves: [] };
      grupos[c].chaves.push(tk);
    }
    let alvo;
    if (q.escopo === "todas") alvo = Object.keys(grupos);
    else {
      if (!minhaTk) return db.send(res, 400, { erro: "Informe a turma" });
      alvo = grupos[minhaTk] ? [minhaTk] : [];
    }
    const alunos = [];
    const turmas = [];
    for (const c of alvo) {
      const g = grupos[c];
      const porAluno = {};
      for (const tk of g.chaves) for (const r of await placarDaTurma(tk)) if (!porAluno[r.nk] || r.atualizado > porAluno[r.nk].atualizado) porAluno[r.nk] = r;
      const lista = Object.values(porAluno);
      if (!lista.length) continue;
      const xp = lista.reduce((a, r) => a + r.xp, 0);
      // a disputa entre turmas mostra só as turmas oficiais ("Professor" e testes ficam de fora)
      if (db.oficialDe(c, ofs)) turmas.push({ nome: g.nome, alunos: lista.length, xp, media: Math.round(xp / lista.length), licoes: lista.reduce((a, r) => a + r.py + r.bd, 0) });
      lista.forEach((r) => {
        const voce = r.nk === eu && c === minhaTk;
        delete r.nk;
        alunos.push(Object.assign(r, { turma: g.nome, voce }));
      });
    }
    alunos.sort((a, b) => b.xp - a.xp || a.nome.localeCompare(b.nome, "pt-BR"));
    turmas.sort((a, b) => b.media - a.media || b.xp - a.xp);
    db.send(res, 200, { escopo: q.escopo === "todas" ? "todas" : "turma", turma: (grupos[minhaTk] && grupos[minhaTk].nome) || q.turma || "", turmas, alunos });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
