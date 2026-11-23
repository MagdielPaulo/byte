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
    const nomes = {};
    for (let i = 0; i < (flat || []).length; i += 2) nomes[flat[i]] = flat[i + 1];
    let chaves;
    if (q.escopo === "todas") chaves = Object.keys(nomes);
    else {
      if (!minhaTk) return db.send(res, 400, { erro: "Informe a turma" });
      chaves = [minhaTk];
    }
    const alunos = [];
    const turmas = [];
    for (const tk of chaves) {
      const lista = await placarDaTurma(tk);
      if (!lista.length) continue;
      const nomeTurma = nomes[tk] || q.turma || tk;
      const xp = lista.reduce((a, r) => a + r.xp, 0);
      turmas.push({ nome: nomeTurma, alunos: lista.length, xp, media: Math.round(xp / lista.length), licoes: lista.reduce((a, r) => a + r.py + r.bd, 0) });
      lista.forEach((r) => {
        const voce = r.nk === eu && tk === minhaTk;
        delete r.nk;
        alunos.push(Object.assign(r, { turma: nomeTurma, voce }));
      });
    }
    alunos.sort((a, b) => b.xp - a.xp || a.nome.localeCompare(b.nome, "pt-BR"));
    turmas.sort((a, b) => b.media - a.media || b.xp - a.xp);
    db.send(res, 200, { escopo: q.escopo === "todas" ? "todas" : "turma", turma: nomes[minhaTk] || q.turma || "", turmas, alunos });
  } catch (e) {
    db.send(res, 500, { erro: String(e.message || e) });
  }
};
