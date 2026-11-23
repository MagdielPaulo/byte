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
/**
  Chave da turma. Junta as formas diferentes de escrever a mesma turma:
  "1 info A", "1° A INF", "1•A informatica", "1 ano a" e "1a" viram "1a";
  "2 TEC", "2° informática", "Segundo TEC" e "2ANO" viram "2".
  O que não segue o padrão ano + letra (ex.: "Professor") fica como está.
*/
function turmaKey(t) {
  const base = keyOf(t).replace(/-/g, "");
  const k = base
    .replace(/primeir[oa]/g, "1")
    .replace(/segund[oa]/g, "2")
    .replace(/terceir[oa]/g, "3")
    .replace(/informatica|infor|info|inf|tecnico|tech|tec|anos?|series?|turma/g, "");
  const m = k.match(/^(\d)([a-z])?\2?$/);
  if (m) return m[1] + (m[2] || "");
  return k || base;
}
/** Turmas oficiais: o aluno escolhe uma delas na tela inicial */
const OFICIAIS_PADRAO = ["1º A", "1º B", "1º C", "2º Tech"];
async function oficiais() {
  const [raw] = await pipeline([["GET", "bab:oficiais"]]);
  try {
    const l = JSON.parse(raw || "null");
    if (Array.isArray(l) && l.length) return l;
  } catch (e) {}
  return OFICIAIS_PADRAO.slice();
}
/** nome oficial da turma desta chave, se houver */
const oficialDe = (tk, lista) => lista.find((o) => turmaKey(o) === tk) || null;
const safeKey = (k) => (/^[a-z0-9]{1,60}$/.test(String(k || "")) ? String(k) : "");
const K = {
  turmas: "bab:turmas",
  placar: (tk) => "bab:r:" + tk,
  turma: (tk) => "bab:t:" + tk,
  aluno: (tk, nk) => "bab:a:" + tk + ":" + nk,
};

/** "Ana Lima Souza" -> "Ana S." (o ranking não mostra o nome completo) */
function nomeCurto(nome) {
  const p = clean(nome, 40).split(" ").filter(Boolean);
  if (p.length < 2) return p[0] || "";
  return p[0] + " " + p[p.length - 1].charAt(0).toUpperCase() + ".";
}
/** Resumo leve do progresso, usado no ranking */
function resumo(p) {
  const ls = Object.keys(p.lessons || {});
  return {
    nome: nomeCurto(p.name),
    xp: Number(p.xp) || 0,
    py: ls.filter((id) => /^m\d/.test(id)).length,
    bd: ls.filter((id) => /^b\d/.test(id)).length,
    estrelas: Object.values(p.lessons || {}).reduce((a, l) => a + (Number(l.stars) || 0), 0),
    atualizado: Number(p.updated) || 0,
  };
}

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

module.exports = { configured, pipeline, keyOf, turmaKey, oficiais, oficialDe, OFICIAIS_PADRAO, safeKey, clean, nomeCurto, resumo, K, send, readBody, query };
