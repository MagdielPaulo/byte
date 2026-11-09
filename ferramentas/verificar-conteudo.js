/*
  Confere todo o conteúdo das lições (Python e Banco de Dados).
  Uso, dentro da pasta do site:   node ferramentas/verificar-conteudo.js

  - Roda a solução de cada exercício de código contra a correção (tem que passar).
  - Confere que o código inicial NÃO passa (senão o exercício já viria pronto).
  - Confere quizzes (uma resposta certa), lacunas e montagens.
*/
const path = require("path");
const fs = require("fs");
const vm = require("vm");
const ROOT = path.join(__dirname, "..");

global.window = global;
if (!global.navigator) Object.defineProperty(global, "navigator", { value: { userAgent: "node" } });
global.CONTENT = [];
global.document = { createElement: () => ({}), head: { appendChild() {} } };

const load = (f) => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f });
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
for (const m of html.matchAll(/<script src="(content\/[^"]+)"><\/script>/g)) load(m[1]);
load("vendor/skulpt.min.js");
load("vendor/skulpt-stdlib.js");
load("assets/python.js");
load("assets/sql.js");
const initSqlJs = require(path.join(ROOT, "vendor/sql-asm.js"));

let problems = 0;
const fail = (m) => {
  problems++;
  console.log("  X " + m);
};
const warn = (m) => console.log("  ! " + m);

function pyRun(code, inputs) {
  const Sk = global.Sk;
  return new Promise((res) => {
    let out = "";
    const q = (inputs || []).slice();
    Sk.configure({
      output: (t) => (out += t),
      read: (f) => Sk.builtinFiles.files[f],
      __future__: Sk.python3,
      inputfunTakesPrompt: true,
      inputfun: () => {
        if (!q.length) throw new Error("SEM_INPUT");
        return q.shift();
      },
      execLimit: 3000,
    });
    Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true)).then(
      () => res({ out }),
      (e) => res({ out, err: String(e) })
    );
  });
}
async function pyPasses(step, code) {
  for (const t of step.tests) {
    const x = await pyRun(PY.buildTestCode(code, t), t.inputs);
    const got = x.err ? null : PY.extractOutput(x.out, t);
    if (got === null || !PY.compare(got, t.expect, t.last).ok) return { ok: false, info: x.err || JSON.stringify(got) };
  }
  return { ok: true };
}

function starterOf(mod, lesson, index, step) {
  if (!step.carry) return step.starter || "";
  for (let i = index - 1; i >= 0; i--) if (lesson.steps[i].kind === "code") return lesson.steps[i].solution.replace(/\s+$/, "") + "\n" + (step.append || "");
  const li = mod.lessons.indexOf(lesson);
  const before = mod.lessons[li - 1];
  if (before)
    for (let i = before.steps.length - 1; i >= 0; i--) if (before.steps[i].kind === "code") return before.steps[i].solution.replace(/\s+$/, "") + "\n" + (step.append || "");
  return "";
}

(async () => {
  SQ._setEngine(await initSqlJs());
  let code = 0;
  const ids = new Set();
  for (const m of CONTENT) {
    const sql = m.course === "bd";
    for (const l of m.lessons) {
      if (ids.has(l.id)) fail("id de lição repetido: " + l.id);
      ids.add(l.id);
      console.log(l.id + "  " + l.title);
      for (let i = 0; i < l.steps.length; i++) {
        const s = l.steps[i];
        const tag = "#" + i + " " + s.kind + (s.title ? " (" + s.title + ")" : "");
        if (s.kind === "quiz") {
          const n = s.options.filter((o) => o.correct).length;
          if (n !== 1) fail(tag + ": " + n + " respostas certas");
        } else if (s.kind === "fill") {
          const blanks = (s.code.match(/__\d+__/g) || []).length;
          if (blanks !== s.answers.length) fail(tag + ": lacunas e respostas não batem");
          s.answers.forEach((a) => s.bank.includes(a.split("|")[0]) || fail(tag + ": resposta " + a + " fora das opções"));
        } else if (s.kind === "order") {
          const all = s.lines.concat(s.extra || []);
          if (new Set(all).size !== all.length) fail(tag + ": linhas repetidas");
        } else if (s.kind === "explain" && s.run && s.code && sql) {
          const db = SQ.open(["arena"]);
          const r = SQ.exec(db, s.code);
          if (r.err && !/constraint failed/.test(r.err.msg)) warn(tag + ": exemplo dá erro: " + r.err.msg);
          db.close();
        } else if (s.kind === "code") {
          code++;
          const starter = starterOf(m, l, i, s);
          if (sql) {
            const v = SQ.verify(s, s.solution);
            if (!v.ok) fail(tag + ": solução não passa: " + JSON.stringify(v).slice(0, 300));
            const st = SQ.verify(s, starter);
            if (st.ok) fail(tag + ": código inicial já passa");
          } else {
            const v = await pyPasses(s, s.solution);
            if (!v.ok) fail(tag + ": solução não passa: " + v.info);
            const st = await pyPasses(s, starter);
            if (st.ok) fail(tag + ": código inicial já passa");
          }
        }
      }
    }
  }
  console.log("\n" + CONTENT.length + " módulos, " + ids.size + " lições, " + code + " exercícios de código. Problemas: " + problems);
  process.exit(problems ? 1 : 0);
})();
