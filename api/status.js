/* GET /api/status  ->  { online: true } quando o banco está conectado */
const db = require("./_db");

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 200, { online: false, motivo: "banco não conectado" });
  try {
    // turmas oficiais: na tela inicial o aluno escolhe uma delas, em vez de digitar
    const oficiais = await db.oficiais();
    db.send(res, 200, { online: true, professor: Boolean(process.env.PROFESSOR_SENHA), oficiais, turmas: oficiais });
  } catch (e) {
    db.send(res, 200, { online: false, motivo: String(e.message || e) });
  }
};
