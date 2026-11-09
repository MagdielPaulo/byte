/*
  GET  /api/progresso?nome=...&turma=...   -> { progresso } (ou progresso: null)
  POST /api/progresso  { nome, turma, progresso, turmaAntes? }  -> { ok, updated }
  Guarda só nome, turma e progresso nas lições.
*/
const db = require("./_db");
const MAX = 900 * 1024;

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 503, { erro: "Banco não conectado" });
  try {
    if (req.method === "GET") {
      const q = db.query(req);
      const tk = db.turmaKey(q.turma);
      const nk = db.keyOf(q.nome);
      if (!tk || !nk) return db.send(res, 400, { erro: "Informe nome e turma" });
      const [raw] = await db.pipeline([["GET", db.K.aluno(tk, nk)]]);
      return db.send(res, 200, { progresso: raw ? JSON.parse(raw) : null });
    }
    if (req.method === "POST") {
      const b = await db.readBody(req);
      const nome = db.clean(b.nome, 40);
      const turma = db.clean(b.turma, 30);
      const p = b.progresso;
      const tk = db.turmaKey(turma);
      const nk = db.keyOf(nome);
      if (!tk || !nk || !p || typeof p !== "object" || p.app !== "byte-a-byte") return db.send(res, 400, { erro: "Dados inválidos" });
      p.name = nome;
      p.turma = turma;
      const json = JSON.stringify(p);
      if (json.length > MAX) return db.send(res, 413, { erro: "Progresso grande demais" });
      const key = db.K.aluno(tk, nk);
      const [raw] = await db.pipeline([["GET", key]]);
      if (raw) {
        const cur = JSON.parse(raw);
        // outro computador salvou algo mais novo: não sobrescreve, devolve o mais novo
        if ((cur.updated || 0) > (p.updated || 0) && !b.forcar) return db.send(res, 409, { erro: "Há uma versão mais nova", progresso: cur });
      }
      const cmds = [
        ["SET", key, json],
        ["SADD", db.K.turma(tk), nk],
        ["HSETNX", db.K.turmas, tk, turma],
      ];
      const atk = b.turmaAntes ? db.turmaKey(b.turmaAntes) : "";
      if (atk && atk !== tk) cmds.push(["DEL", db.K.aluno(atk, nk)], ["SREM", db.K.turma(atk), nk]);
      await db.pipeline(cmds);
      return db.send(res, 200, { ok: true, updated: p.updated || 0 });
    }
    res.setHeader("Allow", "GET, POST");
    db.send(res, 405, { erro: "Método não permitido" });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
