/* Python no navegador (Skulpt) + correção dos exercícios + mensagens de erro em português */
(function () {
  const PY = {};
  let loading = null;
  let running = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("load " + src));
      document.head.appendChild(s);
    });
  }

  PY.ensure = function () {
    if (window.Sk && window.Sk.builtinFiles) return Promise.resolve(true);
    if (!loading)
      loading = loadScript("vendor/skulpt.min.js")
        .then(() => loadScript("vendor/skulpt-stdlib.js"))
        .then(() => true)
        .catch(() => {
          loading = null;
          return false;
        });
    return loading;
  };

  PY.isRunning = () => running !== null;
  PY.stop = function () {
    if (!running) return;
    running.stop = true;
    if (running.reject) running.reject(new Error("PARADO"));
  };

  /** opts: { inputs?: string[], onOut?(text), onInput?(prompt) => Promise<string> } */
  PY.run = function (code, opts) {
    opts = opts || {};
    const Sk = window.Sk;
    return new Promise((resolve) => {
      let out = "";
      const queue = opts.inputs ? opts.inputs.slice() : null;
      let busySince = Date.now();
      const ctl = { stop: false, reject: null };
      running = ctl;
      Sk.configure({
        output: (t) => {
          out += t;
          if (opts.onOut) opts.onOut(t);
        },
        read: (x) => {
          if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) throw "Arquivo nao encontrado: '" + x + "'";
          return Sk.builtinFiles.files[x];
        },
        __future__: Sk.python3,
        inputfunTakesPrompt: true,
        inputfun: (prompt) => {
          if (queue) {
            if (!queue.length) throw new Error("SEM_INPUT");
            return queue.shift();
          }
          return new Promise((res, rej) => {
            ctl.reject = rej;
            (opts.onInput ? opts.onInput(prompt == null ? "" : String(prompt)) : Promise.resolve("")).then((v) => {
              busySince = Date.now();
              ctl.reject = null;
              res(v);
            }, rej);
          });
        },
        execLimit: queue ? 3000 : Number.POSITIVE_INFINITY,
        yieldLimit: queue ? null : 100,
        killableWhile: !queue,
        killableFor: !queue,
      });
      const handlers = queue
        ? undefined
        : {
            "*": () => {
              if (ctl.stop) throw new Error("PARADO");
              if (Date.now() - busySince > 6000) throw new Error("LACO_INFINITO");
            },
          };
      Sk.misceval
        .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true), handlers)
        .then(() => {
          if (running === ctl) running = null;
          resolve({ out, err: null });
        })
        .catch((e) => {
          if (running === ctl) running = null;
          resolve({ out, err: parseError(e) });
        });
    });
  };

  function parseError(e) {
    let type = (e && e.tp$name) || (e && e.constructor && e.constructor.name) || "Erro";
    let msg = "";
    try {
      msg = e.toString();
    } catch (x) {
      msg = String(e);
    }
    let line = null;
    try {
      if (e.traceback && e.traceback.length) line = e.traceback[0].lineno;
    } catch (x) {}
    if (/SEM_INPUT/.test(msg)) type = "SEM_INPUT";
    if (/LACO_INFINITO/.test(msg)) type = "TimeLimitError";
    if (/PARADO/.test(msg)) type = "PARADO";
    return { type, msg, line };
  }

  /* ---------- correção ---------- */
  const MARK = "<<<VERIFICACAO>>>";
  PY.buildTestCode = function (code, t) {
    let src = code;
    if (t.replace && src.includes(t.replace[0])) src = src.split(t.replace[0]).join(t.replace[1]);
    if (t.call) src += '\nprint("' + MARK + '")\n' + t.call + "\n";
    return src;
  };
  PY.extractOutput = function (out, t) {
    if (!t.call) return out;
    const i = out.lastIndexOf(MARK);
    if (i === -1) return null;
    return out.slice(i + MARK.length).replace(/^\n/, "");
  };
  function tokens(line) {
    const s = line.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    return s.match(/-?\d+(?:\.\d+)?|[^\s\d]/g) || [];
  }
  PY.splitLines = function (s) {
    return s
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length);
  };
  const NUM = /^-?\d+(\.\d+)?$/;
  function sameLine(a, b) {
    const ta = tokens(a);
    const tb = tokens(b);
    if (ta.length !== tb.length) return false;
    for (let i = 0; i < ta.length; i++) {
      if (ta[i] === tb[i]) continue;
      if (NUM.test(ta[i]) && NUM.test(tb[i]) && Math.abs(parseFloat(ta[i]) - parseFloat(tb[i])) < 0.011) continue;
      return false;
    }
    return true;
  }
  PY.compare = function (got, expected, last) {
    let g = PY.splitLines(got);
    const e = PY.splitLines(expected);
    if (last) g = g.slice(-e.length);
    for (let i = 0; i < Math.max(g.length, e.length); i++) {
      if (g[i] === undefined || e[i] === undefined || !sameLine(g[i], e[i])) return { ok: false, badLine: i };
    }
    return { ok: true, badLine: -1 };
  };

  /* ---------- mensagens em português ---------- */
  PY.lint = function (code) {
    const L = code.split("\n");
    for (let i = 0; i < L.length; i++) {
      const raw = L[i];
      const t = raw.trim();
      if (!t || t.startsWith("#")) continue;
      const noComment = t.replace(/\s+#.*$/, "");
      const kw = t.split(/[\s(:]/)[0];
      if (/^(if|elif|for|while|def)\b/.test(t) && !/:$/.test(noComment)) return "Linha " + (i + 1) + ": faltaram os dois-pontos (:) no final da linha do " + kw + ".";
      if (/^else\b/.test(t) && !/:$/.test(noComment)) return "Linha " + (i + 1) + ": o else precisa terminar com dois-pontos (:).";
      if (/^(if|elif|while)\b[^=!<>]*[^=!<>]=[^=]/.test(noComment)) return "Linha " + (i + 1) + ": para comparar use == (dois iguais). Um = sozinho serve para guardar valor.";
      const quotes = (noComment.replace(/\\"/g, "").match(/"/g) || []).length;
      if (quotes % 2) return "Linha " + (i + 1) + ": tem aspas que abriram e não fecharam.";
      const open = (noComment.match(/\(/g) || []).length;
      const close = (noComment.match(/\)/g) || []).length;
      if (open !== close) return "Linha " + (i + 1) + ": os parênteses não fecham (abriu " + open + ", fechou " + close + ").";
      if (/^[A-Za-z_]\w*( [A-Za-z_]\w*)+\s*=[^=]/.test(noComment)) return "Linha " + (i + 1) + ": nome de variável não pode ter espaço. Use _ no lugar (ex: minha_variavel).";
      if (/:$/.test(noComment)) {
        let j = i + 1;
        while (j < L.length && (!L[j].trim() || L[j].trim().startsWith("#"))) j++;
        const ind = (raw.match(/^ */) || [""])[0].length;
        if (j >= L.length || (L[j].match(/^ */) || [""])[0].length <= ind) {
          const fn = (t.match(/^def\s+(\w+)/) || [])[1];
          if (fn) return "Linha " + (i + 1) + ": a função " + fn + " ainda está vazia. Escreva o corpo dela com 4 espaços de recuo.";
          const n = j < L.length ? j + 1 : i + 1;
          return "Linha " + n + ": essa linha deveria estar recuada (4 espaços), porque a linha " + (i + 1) + " termina com dois-pontos.";
        }
      }
    }
    return null;
  };

  PY.friendly = function (err, code, fn) {
    const nLines = code.split("\n").length;
    const inTest = err.line !== null && err.line > nLines;
    const at = err.line && !inTest ? "Linha " + err.line + ": " : "";
    const name = (err.msg.match(/name '(\w+)' is not defined/) || [])[1];
    switch (err.type) {
      case "SEM_INPUT":
        return "O programa pediu mais input() do que o esperado. Confira se não tem um input sobrando ou um input no lugar errado do laço.";
      case "TimeLimitError":
        return "O programa não terminou: provavelmente é um laço infinito. Alguma linha dentro do while muda a condição?";
      case "PARADO":
        return "Programa interrompido.";
      case "SyntaxError":
      case "IndentationError":
      case "TokenError":
        return PY.lint(code) || at + "erro de escrita (SyntaxError). Confira dois-pontos, aspas, parênteses e o recuo de 4 espaços.";
      case "NameError":
        if (inTest && fn && name === fn) return "Não encontrei a função " + fn + ". O nome precisa ser exatamente esse: def " + fn + "(...).";
        if (name && ["true", "false", "none"].includes(name)) return at + "em Python se escreve " + name[0].toUpperCase() + name.slice(1) + ", com a primeira letra maiúscula.";
        if (name && /^(Print|Input|Int|Float|prnt|pirnt|imput|inpt|lenght|Len)$/.test(name))
          return at + '"' + name + '" não existe. Confira a escrita: os comandos são print, input, int, float e len, tudo minúsculo.';
        return at + 'o Python não conhece "' + (name || "?") + '". Se era um texto, faltaram as aspas. Se era uma variável, confira se ela foi criada antes e se o nome está igual (maiúscula conta).';
      case "TypeError":
        if (/NoneType/.test(err.msg)) return at + "apareceu None numa conta. Quase sempre é uma função que usa print no lugar de return.";
        if (/concatenate|unsupported operand|can't multiply/.test(err.msg)) return at + "conta misturando texto com número. O valor veio de um input? Converta com int(...) ou float(...).";
        if (/argument/.test(err.msg)) return at + "a função foi chamada com a quantidade errada de valores. Confira os parâmetros.";
        if (/not callable/.test(err.msg)) return at + "você usou parênteses depois de algo que não é uma função.";
        return at + err.msg;
      case "IndexError":
        return at + "você pediu uma posição que não existe na lista. A primeira é 0 e a última é len(lista) - 1.";
      case "ValueError":
        return at + "int() recebeu algo que não é número inteiro (um texto ou um decimal como 8.5). Para decimal, use float().";
      case "ZeroDivisionError":
        return at + "divisão por zero.";
      case "AttributeError":
        return at + "esse tipo de valor não tem esse comando. Ex.: append só funciona em listas.";
      default:
        return at + err.msg;
    }
  };

  window.PY = PY;
})();
