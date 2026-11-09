/*
  Acesso ao banco (Upstash Redis, pela API REST). Sem dependências: usa fetch.
  As variáveis de ambiente são criadas pela Vercel quando você conecta o banco:
  KV_REST_API_URL e KV_REST_API_TOKEN (ou UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN).

  Estrutura:
    bab:turmas            hash   chaveTurma -> nome da turma como foi digitado
    bab:t:<turma>         set    chaves dos alunos da turma
    bab:a:<turma>:<aluno> string progresso do aluno (JSON)
*/
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

const configured = () => Boolean(URL_ && TOKEN);

async function pipeline(cmds) {
  const r = await fetch(URL_.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("Banco respondeu " + r.status);
  const out = await r.json();
  return out.map((x) => {
    if (x.error) throw new Error(x.error);
    return x.result;
  });
}

/** "2º A", "2a", "2 A" viram a mesma turma; "Ana  Lima" e "ana lima", o mesmo aluno */
function keyOf(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[ºª°]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/ /g, "-");
}
const clean = (s, max) => String(s || "").replace(/\s+/g, " ").trim().slice(0, max);
/** "1º ano", "primeiro ano", "1 ano" e "1ano" viram a mesma turma ("1"); "2º ano A" e "2A" viram "2a" */
function turmaKey(t) {
  const base = keyOf(t).replace(/-/g, "");
  const k = base
    .replace(/primeir[oa]/g, "1")
    .replace(/segund[oa]/g, "2")
    .replace(/terceir[oa]/g, "3")
    .replace(/quart[oa]/g, "4")
    .replace(/anos?|series?|turma/g, "");
  return k || base;
}
const safeKey = (k) => (/^[a-z0-9]{1,60}$/.test(String(k || "")) ? String(k) : "");
const K = {
  turmas: "bab:turmas",
  turma: (tk) => "bab:t:" + tk,
  aluno: (tk, nk) => "bab:a:" + tk + ":" + nk,
};

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const txt = Buffer.concat(chunks).toString("utf8");
  return txt ? JSON.parse(txt) : {};
}

function query(req) {
  const u = new URL(req.url, "http://x");
  return Object.fromEntries(u.searchParams.entries());
}

module.exports = { configured, pipeline, keyOf, turmaKey, safeKey, clean, K, send, readBody, query };
