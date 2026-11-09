/*
  Área do professor (precisa do cabeçalho x-senha igual à variável PROFESSOR_SENHA).
  GET    /api/professor                      -> { turmas: [{ chave, nome, alunos }] }
  GET    /api/professor?turma=2A             -> { alunos: [progresso, ...] }
  DELETE /api/professor?turma=2A&nome=Ana    -> apaga um aluno (nome digitado errado, por exemplo)
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
      const turmas = pares
        .map(([tk, nome], i) => ({ chave: tk, nome, alunos: counts[i] || 0 }))
        .filter((t) => t.alunos > 0)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      return db.send(res, 200, { turmas });
    }
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
      const [, , restantes] = await db.pipeline([["DEL", db.K.aluno(tk, nk)], ["SREM", db.K.turma(tk), nk], ["SCARD", db.K.turma(tk)]]);
      if (!restantes) await db.pipeline([["HDEL", db.K.turmas, tk], ["DEL", db.K.turma(tk)]]);
      return db.send(res, 200, { ok: true });
    }
    res.setHeader("Allow", "GET, DELETE");
    db.send(res, 405, { erro: "Método não permitido" });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
