/* GET /api/status  ->  { online: true } quando o banco está conectado */
const db = require("./_db");

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 200, { online: false, motivo: "banco não conectado" });
  try {
    // nomes das turmas (sem alunos), para sugerir no campo "Sua turma" e evitar "1º ano" e "1 A" virarem turmas diferentes
    const [flat] = await db.pipeline([["HGETALL", db.K.turmas]]);
    const turmas = [];
    for (let i = 1; i < (flat || []).length && turmas.length < 60; i += 2) turmas.push(flat[i]);
    db.send(res, 200, { online: true, professor: Boolean(process.env.PROFESSOR_SENHA), turmas });
  } catch (e) {
    db.send(res, 200, { online: false, motivo: String(e.message || e) });
  }
};
