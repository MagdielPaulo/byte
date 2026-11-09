/* GET /api/status  ->  { online: true } quando o banco está conectado */
const db = require("./_db");

module.exports = async (req, res) => {
  if (!db.configured()) return db.send(res, 200, { online: false, motivo: "banco não conectado" });
  try {
    await db.pipeline([["PING"]]);
    db.send(res, 200, { online: true, professor: Boolean(process.env.PROFESSOR_SENHA) });
  } catch (e) {
    db.send(res, 200, { online: false, motivo: String(e.message || e) });
  }
};
