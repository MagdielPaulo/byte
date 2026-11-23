/*
  GET /api/ranking?turma=2A&nome=Ana%20Lima  ->  { turma, alunos: [{ nome, xp, py, bd, estrelas, voce }] }
  Mostra só o primeiro nome e a inicial do sobrenome. "voce" marca quem pediu.
  Usa um resumo pequeno por aluno (bab:r:<turma>), atualizado a cada salvamento.
*/
const db = require("./_db");

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 503, { erro: "Banco não conectado" });
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return db.send(res, 405, { erro: "Método não permitido" });
  }
  try {
    const q = db.query(req);
    const tk = db.turmaKey(q.turma);
    if (!tk) return db.send(res, 400, { erro: "Informe a turma" });
    const eu = db.keyOf(q.nome);
    const [flat, membros, nomeTurma] = await db.pipeline([["HGETALL", db.K.placar(tk)], ["SMEMBERS", db.K.turma(tk)], ["HGET", db.K.turmas, tk]]);
    const placar = {};
    for (let i = 0; i < (flat || []).length; i += 2) placar[flat[i]] = JSON.parse(flat[i + 1]);
    // alunos salvos antes de existir o ranking: monta o resumo uma vez a partir do progresso
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
    const alunos = Object.entries(placar)
      .filter(([nk]) => (membros || []).includes(nk))
      .map(([nk, r]) => Object.assign({}, r, { voce: nk === eu }))
      .sort((a, b) => b.xp - a.xp || a.nome.localeCompare(b.nome, "pt-BR"));
    db.send(res, 200, { turma: nomeTurma || q.turma, alunos });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
