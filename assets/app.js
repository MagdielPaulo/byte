/* Byte a Byte: aplicação inteira em JavaScript puro, sem build. */
(function () {
  "use strict";

  /* ================= Configuração ================= */
  const SITE = "Byte a Byte";
  const STORAGE_KEY = "byteabyte:v1";

  /* ================= Conteúdo ================= */
  const COURSES = [
    { id: "py", name: "Python", short: "Python", lang: "py", tagline: "Lógica e programação, do print às funções" },
    { id: "bd", name: "Banco de Dados", short: "Banco de Dados", lang: "sql", tagline: "SGBD, SQL, integridade, segurança e backup" },
  ];
  const COURSE_BY_ID = {};
  COURSES.forEach((c) => (COURSE_BY_ID[c.id] = c));
  const MODULES = (window.CONTENT || []).map((m) => {
    if (!m.course) m.course = "py";
    return m;
  });
  const modulesOf = (c) => MODULES.filter((m) => m.course === c);
  const LESSONS = [];
  MODULES.forEach((module) => {
    const cIndex = modulesOf(module.course).indexOf(module);
    module.lessons.forEach((lesson, lIndex) => LESSONS.push({ module, lesson, mIndex: cIndex, lIndex, order: LESSONS.length, course: module.course }));
  });
  const LESSON_BY_ID = {};
  LESSONS.forEach((r) => (LESSON_BY_ID[r.lesson.id] = r));
  const lessonsOf = (c) => LESSONS.filter((r) => r.course === c);
  const MODULE_BY_ID = {};
  MODULES.forEach((m) => (MODULE_BY_ID[m.id] = m));
  /** linguagem de destaque do código na tela atual */
  let CUR_LANG = "py";
  const stepKey = (lid, i) => lid + "#" + i;
  function findStep(key) {
    const [lid, idx] = key.split("#");
    const ref = LESSON_BY_ID[lid];
    if (!ref) return null;
    const step = ref.lesson.steps[Number(idx)];
    return step ? { ref, step, index: Number(idx) } : null;
  }
  function carrySource(ref, index) {
    for (let i = index - 1; i >= 0; i--) if (ref.lesson.steps[i].kind === "code") return { lessonId: ref.lesson.id, index: i, step: ref.lesson.steps[i] };
    const before = ref.module.lessons[ref.lIndex - 1];
    if (!before) return null;
    for (let i = before.steps.length - 1; i >= 0; i--) if (before.steps[i].kind === "code") return { lessonId: before.id, index: i, step: before.steps[i] };
    return null;
  }

  /* ================= Utilidades ================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const pad2 = (n) => String(n).padStart(2, "0");

  function rich(text) {
    let out = "";
    let last = 0;
    const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)/g;
    let m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      out += m[2] ? "<strong>" + esc(m[2]) + "</strong>" : '<code class="ic">' + esc(m[4]) + "</code>";
      last = re.lastIndex;
    }
    return out + esc(text.slice(last));
  }

  const TOKEN_RE =
    /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(__\d+__)|\b(def|return|if|elif|else|for|while|in|and|or|not|break|continue|import|from|pass)\b|\b(True|False|None)\b|\b(print|input|int|float|str|len|range|type|round|append|max|min|sum|abs)\b(?=\s*\()|(\b\d+(?:\.\d+)?\b)/g;
  const SQL_KW =
    "SELECT|FROM|WHERE|AND|OR|NOT|IN|LIKE|BETWEEN|IS|NULL|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|AS|JOIN|ON|LEFT|INNER|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|VIEW|DATABASE|USE|DROP|ALTER|ADD|COLUMN|RENAME|TO|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK|BEGIN|COMMIT|ROLLBACK|GRANT|REVOKE|USER|IDENTIFIED|ALL|PRIVILEGES|DISTINCT|ASC|DESC|IF|EXISTS|PRAGMA|CASE|WHEN|THEN|ELSE|END";
  const SQL_RE = new RegExp(
    "(--[^\\n]*)|('(?:[^'\\n]|'')*'?)|(__\\d+__)|\\b(" +
      SQL_KW +
      ")\\b|\\b(INTEGER|INT|TEXT|REAL|VARCHAR|DECIMAL|DATE|BOOLEAN)\\b|\\b(COUNT|SUM|AVG|MIN|MAX|RANDOM|ROUND|UPPER|LOWER|LENGTH)\\b(?=\\s*\\()|(\\b\\d+(?:\\.\\d+)?\\b)",
    "gi"
  );
  function highlight(src, lang) {
    const RE = (lang || CUR_LANG) === "sql" ? SQL_RE : TOKEN_RE;
    let out = "";
    let last = 0;
    let m;
    RE.lastIndex = 0;
    while ((m = RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      const c = m[1] ? "c" : m[2] ? "s" : m[3] ? "gap" : m[4] ? "k" : m[5] ? "v" : m[6] ? "b" : "n";
      out += '<span class="tk-' + c + '">' + esc(m[0]) + "</span>";
      last = RE.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  const codeView = (code, label, lang) => '<div class="codeview">' + (label ? '<div class="codeview-label">' + esc(label) + "</div>" : "") + "<pre>" + highlight(code, lang) + "</pre></div>";
  const outView = (text, label) => '<div class="outview"><div class="codeview-label">' + esc(label || "Saída") + "</div><pre>" + esc(text) + "</pre></div>";

  const ICON = {
    lock: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor"/><path d="M5 7V5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    check: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flame: (on) =>
      '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="flame' + (on ? " on" : "") + '"><path d="M8 1c.5 2.6 3.8 4.2 3.8 8A3.8 3.8 0 0 1 8 13a3.8 3.8 0 0 1-3.8-4c0-1.6.8-2.6 1.5-3.4.2 1 .7 1.7 1.4 2C7.3 5.1 7.4 2.8 8 1z"/></svg>',
  };
  function stars(n, max, size) {
    max = max || 3;
    let s = '<span class="stars stars-' + (size || "md") + '" aria-label="' + n + " de " + max + ' estrelas">';
    for (let i = 0; i < max; i++)
      s += '<svg viewBox="0 0 20 20" class="' + (i < n ? "on" : "off") + '" aria-hidden="true"><path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>';
    return s + "</span>";
  }
  function seededShuffle(arr, seed) {
    let h = 7;
    for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
    const a = arr.slice();
    for (let k = 0; k < 3; k++)
      for (let i = a.length - 1; i > 0; i--) {
        h = (h * 1664525 + 1013904223) >>> 0;
        const j = h % (i + 1);
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
      }
    return a;
  }
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type: type || "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  }
  const slug = (s) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "aluno";
  const fmtDate = (t) => (t ? new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "-");

  /* ================= Progresso ================= */
  const XP = { explain: 2, quiz: 6, fill: 8, order: 8, code: 15, retry: 3, lesson: 20, star: 5 };
  const TITLES = ["Iniciante", "Explorador", "Aprendiz", "Construtor", "Programador", "Desenvolvedor", "Especialista", "Arquiteto", "Mestre"];

  function emptyProgress(name) {
    return {
      v: 1,
      app: "byte-a-byte",
      name: name,
      created: Date.now(),
      updated: Date.now(),
      xp: 0,
      lessons: {},
      steps: {},
      answers: {},
      drafts: {},
      passed: {},
      help: {},
      review: [],
      current: null,
      turma: "",
      course: "py",
      badges: [],
      lab: null,
      labSql: null,
      stats: { runs: 0, hints: 0, solutions: 0, codeClean: 0, perfect: 0, reviewed: 0, cards: 0 },
    };
  }
  function normalize(raw, name) {
    const base = emptyProgress(name || (raw && raw.name) || "Aluno");
    if (!raw || typeof raw !== "object") return base;
    const p = Object.assign({}, base, raw);
    p.stats = Object.assign({}, base.stats, raw.stats || {});
    ["lessons", "steps", "answers", "drafts", "passed", "help"].forEach((k) => (p[k] = raw[k] && typeof raw[k] === "object" ? raw[k] : {}));
    p.review = Array.isArray(raw.review) ? raw.review : [];
    p.badges = Array.isArray(raw.badges) ? raw.badges : [];
    return p;
  }
  const xpForLevel = (n) => 50 * (n - 1) * n;
  function levelInfo(xp) {
    let level = 1;
    while (xp >= xpForLevel(level + 1)) level++;
    const from = xpForLevel(level);
    const to = xpForLevel(level + 1);
    return { level, title: TITLES[Math.min(level - 1, TITLES.length - 1)], into: xp - from, need: to - from, pct: Math.round(((xp - from) / (to - from)) * 100) };
  }
  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function starsFor(mistakes, revealed) {
    if (revealed === 0 && mistakes === 0) return 3;
    if (revealed === 0 && mistakes <= 2) return 2;
    return 1;
  }
  /** Todas as lições ficam abertas: o aluno escolhe por onde começar */
  function lessonUnlocked(p, id) {
    return Boolean(LESSON_BY_ID[id]);
  }
  function moduleProgress(p, m) {
    const done = m.lessons.filter((l) => p.lessons[l.id]).length;
    const st = m.lessons.reduce((a, l) => a + ((p.lessons[l.id] && p.lessons[l.id].stars) || 0), 0);
    return { done, total: m.lessons.length, stars: st, maxStars: m.lessons.length * 3 };
  }
  /** Lição sugerida: a que está em andamento, ou a primeira não feita (dentro do foco da aula, se houver) */
  function nextLesson(p, course, onlyMods) {
    const inScope = (r) => r.course === course && (!onlyMods || onlyMods.includes(r.module.id));
    if (p.current && LESSON_BY_ID[p.current.lessonId] && !p.lessons[p.current.lessonId] && inScope(LESSON_BY_ID[p.current.lessonId])) return LESSON_BY_ID[p.current.lessonId];
    return LESSONS.find((r) => inScope(r) && !p.lessons[r.lesson.id]) || null;
  }
  const courseDone = (p, c) => lessonsOf(c).filter((r) => p.lessons[r.lesson.id]).length;
  const modDone = (p, id) => {
    const m = MODULES.find((x) => x.id === id);
    return m && m.lessons.every((l) => p.lessons[l.id]);
  };
  const BADGES = [
    { id: "first", name: "Hello, world", desc: "Concluiu a primeira lição", test: (p) => Object.keys(p.lessons).length >= 1 },
    { id: "runner", name: "Executor", desc: "Rodou 25 programas", test: (p) => p.stats.runs >= 25 },
    { id: "clean", name: "Código limpo", desc: "5 exercícios de código sem dica nem erro", test: (p) => p.stats.codeClean >= 5 },
    { id: "perfect", name: "Três estrelas", desc: "3 lições com nota máxima", test: (p) => p.stats.perfect >= 3 },
    { id: "review", name: "Revisor", desc: "Refez 5 exercícios da revisão", test: (p) => p.stats.reviewed >= 5 },
    { id: "cards", name: "Memória RAM", desc: "Passou por 20 cartões de revisão", test: (p) => p.stats.cards >= 20 },
    { id: "lab", name: "Cientista", desc: "Usou o Laboratório", test: (p) => Boolean(p.lab || p.labSql) },
    { id: "decide", name: "Tomador de decisão", desc: "Concluiu o módulo Decisões", test: (p) => modDone(p, "m05") },
    { id: "loops", name: "Loop de estudo", desc: "Concluiu os dois módulos de repetição", test: (p) => modDone(p, "m06") && modDone(p, "m07") },
    { id: "lists", name: "Inventário cheio", desc: "Concluiu o módulo Listas", test: (p) => modDone(p, "m08") },
    { id: "funcs", name: "def mestre():", desc: "Concluiu o módulo Funções", test: (p) => modDone(p, "m09") },
    { id: "arena", name: "Campeão da Arena", desc: "Concluiu o projeto Arena", test: (p) => modDone(p, "m10") },
    { id: "all", name: "Pythonista", desc: "Concluiu todas as lições de Python", test: (p) => lessonsOf("py").every((r) => p.lessons[r.lesson.id]) },
    { id: "sql1", name: "SELECT * FROM conquistas", desc: "Concluiu a primeira lição de Banco de Dados", test: (p) => lessonsOf("bd").some((r) => p.lessons[r.lesson.id]) },
    { id: "keys", name: "Chave mestra", desc: "Concluiu o módulo Chaves e relacionamentos", test: (p) => modDone(p, "b04") },
    { id: "integ", name: "Guardião da integridade", desc: "Concluiu o módulo Restrições de integridade", test: (p) => modDone(p, "b06") },
    { id: "stats", name: "Cientista de dados", desc: "Concluiu o módulo Agrupamentos e estatística", test: (p) => modDone(p, "b09") },
    { id: "backup", name: "Plano B", desc: "Concluiu o módulo Segurança, transações e backup", test: (p) => modDone(p, "b12") },
    { id: "allbd", name: "DBA em formação", desc: "Concluiu todas as lições de Banco de Dados", test: (p) => lessonsOf("bd").every((r) => p.lessons[r.lesson.id]) },
  ];

  /* ================= Armazenamento (no navegador) ================= */
  let DB = { current: null, profiles: {} };
  let P = null;
  let storageOk = true;
  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const o = JSON.parse(raw);
        if (o && o.profiles) DB = o;
      }
    } catch (e) {
      storageOk = false;
    }
    if (DB.current && DB.profiles[DB.current]) P = DB.profiles[DB.current] = normalize(DB.profiles[DB.current], DB.current);
  }
  function saveDB() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
    } catch (e) {
      if (storageOk) toast("error", "Não foi possível salvar", "O navegador bloqueou o armazenamento. Baixe seu relatório para não perder o progresso.");
      storageOk = false;
    }
  }
  function profileKey(name) {
    const lower = name.trim().toLowerCase();
    return Object.keys(DB.profiles).find((k) => k.toLowerCase() === lower) || null;
  }
  function login(name, turma) {
    const existing = profileKey(name);
    const key = existing || name.trim();
    if (!existing) DB.profiles[key] = emptyProgress(key);
    DB.current = key;
    P = DB.profiles[key] = normalize(DB.profiles[key], key);
    if (turma) P.turma = turma;
    saveDB();
  }
  /** Sair: com o salvamento online, o progresso vai para o servidor e é apagado deste computador */
  async function logout() {
    const key = DB.current;
    if (CLOUD.online && P && P.turma) {
      const ok = await cloudFlush();
      if (ok) delete DB.profiles[key];
      else toast("error", "Sem conexão com o servidor", "O progresso ficou guardado neste computador. Entre de novo com o mesmo nome e turma quando a internet voltar.");
    }
    DB.current = null;
    P = null;
    saveDB();
    location.hash = "#/";
    route();
  }

  function update(fn, opts) {
    if (!P) return;
    const before = levelInfo(P.xp).level;
    fn(P);
    P.updated = Date.now();
    const fresh = [];
    BADGES.forEach((b) => {
      if (!P.badges.includes(b.id) && b.test(P)) {
        P.badges.push(b.id);
        fresh.push(b);
      }
    });
    const after = levelInfo(P.xp);
    DB.profiles[DB.current] = P;
    saveDB();
    renderHud();
    cloudSaveSoon();
    fresh.forEach((b, i) => setTimeout(() => toast("badge", "Conquista: " + b.name, b.desc), 300 + i * 600));
    if (after.level > before) toast("level", "Nível " + after.level, after.title);
  }

  /* ================= Salvamento online (quando o site está na Vercel com o banco conectado) ================= */
  const CLOUD = { online: false, checked: false, professor: false, state: "off", timer: null, saving: false, again: false, turmaAntes: null, checking: null };
  function cloudKey(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[ºª°]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }
  function cloudCheck() {
    if (CLOUD.checking) return CLOUD.checking;
    CLOUD.checking = (async () => {
      if (location.protocol === "file:") {
        CLOUD.checked = true;
        return false;
      }
      try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 5000);
        const r = await fetch("api/status", { cache: "no-store", signal: ctl.signal });
        clearTimeout(t);
        const j = r.ok ? await r.json() : null;
        CLOUD.online = Boolean(j && j.online);
        CLOUD.professor = Boolean(j && j.professor);
      } catch (e) {
        CLOUD.online = false;
      }
      CLOUD.checked = true;
      CLOUD.state = CLOUD.online ? "saved" : "off";
      return CLOUD.online;
    })();
    return CLOUD.checking;
  }
  async function cloudGet(nome, turma) {
    const r = await fetch("api/progresso?nome=" + encodeURIComponent(nome) + "&turma=" + encodeURIComponent(turma), { cache: "no-store" });
    if (!r.ok) throw new Error("Falha ao buscar (" + r.status + ")");
    const j = await r.json();
    return j.progresso;
  }
  function setCloudState(s) {
    CLOUD.state = s;
    const d = $("#cloudDot");
    if (d) {
      d.className = "cloud-dot " + s;
      d.title = CLOUD_TXT[s] || "";
      d.setAttribute("aria-label", CLOUD_TXT[s] || "");
    }
  }
  const CLOUD_TXT = { saved: "Progresso salvo online", saving: "Salvando online...", pending: "Salvando online...", error: "Sem conexão: salvo neste computador. Tento de novo sozinho." };
  function cloudSaveSoon(ms) {
    if (!CLOUD.online || !P || !P.turma) return;
    setCloudState("pending");
    clearTimeout(CLOUD.timer);
    CLOUD.timer = setTimeout(cloudSave, ms == null ? 2500 : ms);
  }
  async function cloudSave() {
    clearTimeout(CLOUD.timer);
    if (!CLOUD.online || !P || !P.turma) return;
    if (CLOUD.saving) {
      CLOUD.again = true;
      return;
    }
    CLOUD.saving = true;
    setCloudState("saving");
    const me = P;
    try {
      const r = await fetch("api/progresso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: me.name, turma: me.turma, progresso: me, turmaAntes: CLOUD.turmaAntes }),
      });
      if (r.status === 409) {
        const j = await r.json();
        if (j.progresso && P === me) adoptCloud(j.progresso, true);
        setCloudState("saved");
      } else if (r.ok) {
        CLOUD.turmaAntes = null;
        setCloudState("saved");
      } else throw new Error(String(r.status));
    } catch (e) {
      setCloudState("error");
      CLOUD.timer = setTimeout(cloudSave, 15000);
    }
    CLOUD.saving = false;
    if (CLOUD.again) {
      CLOUD.again = false;
      cloudSave();
    }
  }
  /** Espera o que estiver salvando e envia o progresso agora. Devolve true se ficou salvo online. */
  async function cloudFlush() {
    for (let i = 0; i < 80 && CLOUD.saving; i++) await new Promise((r) => setTimeout(r, 100));
    clearTimeout(CLOUD.timer);
    await cloudSave();
    clearTimeout(CLOUD.timer);
    return CLOUD.state === "saved";
  }
  /** Troca o progresso deste computador pelo que veio do servidor (mais novo) */
  function adoptCloud(remote, notify) {
    const key = DB.current;
    P = DB.profiles[key] = normalize(Object.assign(remote, { name: key }), key);
    saveDB();
    if (notify) toast("info", "Progresso atualizado", "Havia uma versão mais nova salva online (de outro computador).");
    if (!/^#\/licao\//.test(location.hash)) route();
    else renderHud();
  }
  /** Ao abrir o site já logado: confere se o servidor tem algo mais novo */
  async function cloudSync() {
    if (!(await cloudCheck()) || !P || !P.turma) return;
    try {
      const remote = await cloudGet(P.name, P.turma);
      if (remote && (remote.updated || 0) > (P.updated || 0)) adoptCloud(remote, false);
      else if (!remote || (remote.updated || 0) < (P.updated || 0)) cloudSave();
      setCloudState("saved");
    } catch (e) {
      setCloudState("error");
    }
    renderHud();
  }
  window.addEventListener("pagehide", () => {
    if (!CLOUD.online || !P || !P.turma || (CLOUD.state !== "pending" && CLOUD.state !== "error")) return;
    const body = JSON.stringify({ nome: P.name, turma: P.turma, progresso: P, turmaAntes: CLOUD.turmaAntes });
    if (body.length < 60000)
      try {
        fetch("api/progresso", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      } catch (e) {}
  });

  /* ================= Avisos ================= */
  function toast(tone, title, text) {
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast toast-" + tone;
    el.innerHTML =
      '<span class="toast-icon" aria-hidden="true">' +
      (tone === "level" ? "▲" : tone === "badge" ? "◆" : tone === "error" ? "!" : "i") +
      "</span><div><strong>" +
      esc(title) +
      "</strong>" +
      (text ? "<span>" + esc(text) + "</span>" : "") +
      "</div>";
    box.appendChild(el);
    setTimeout(() => el.remove(), 4800);
  }
  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.createElement("canvas");
    cv.className = "confetti";
    document.body.appendChild(cv);
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = innerWidth;
    const H = innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    const colors = ["#2de2e6", "#b46bff", "#ff4fa3", "#3ff0a4", "#ffd166"];
    const parts = Array.from({ length: 110 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 240,
      y: H * 0.3,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 12 - 4,
      w: 3 + Math.random() * 4,
      h: 8 + Math.random() * 10,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    function frame(t) {
      const el = t - t0;
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => {
        p.vy += 0.32;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - el / 2200);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (el < 2200) requestAnimationFrame(frame);
      else cv.remove();
    }
    requestAnimationFrame(frame);
  }

  /* ================= Editor de código ================= */
  function createEditor(host, value, opts) {
    opts = opts || {};
    const minLines = opts.minLines || 8;
    const lang = opts.lang || CUR_LANG;
    host.innerHTML =
      '<div class="editor"><pre class="editor-gutter" aria-hidden="true"></pre><div class="editor-area"><pre class="editor-hl" aria-hidden="true"></pre>' +
      '<textarea class="editor-ta" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Editor de código ' +
      (lang === "sql" ? "SQL" : "Python") +
      '"></textarea></div></div>';
    const wrap = $(".editor", host);
    const ta = $(".editor-ta", host);
    const hl = $(".editor-hl", host);
    const gut = $(".editor-gutter", host);
    ta.value = value;
    function paint() {
      const v = ta.value;
      hl.innerHTML = highlight(v, lang) + "\n\n";
      const n = v.split("\n").length;
      let s = "";
      for (let i = 1; i <= n; i++) s += i + "\n";
      gut.textContent = s + "\n";
      wrap.style.height = Math.max(minLines, Math.min(n + 1, 24)) * 24 + 28 + "px";
      sync();
    }
    function sync() {
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
      gut.scrollTop = ta.scrollTop;
    }
    function changed() {
      paint();
      if (opts.onChange) opts.onChange(ta.value);
    }
    function insert(text) {
      ta.focus();
      let ok = false;
      try {
        ok = text === "" ? document.execCommand("delete") : document.execCommand("insertText", false, text);
      } catch (e) {}
      if (!ok) {
        ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
        changed();
      }
    }
    if (opts.noPaste) {
      const block = (e) => {
        e.preventDefault();
        if (opts.onPasteBlocked) opts.onPasteBlocked();
      };
      ta.addEventListener("paste", block);
      ta.addEventListener("drop", block);
      ta.addEventListener("dragover", (e) => e.preventDefault());
      ta.addEventListener("beforeinput", (e) => {
        if (/^insertFrom(Paste|Drop|PasteAsQuotation)$/.test(e.inputType)) block(e);
      });
    }
    ta.addEventListener("input", changed);
    ta.addEventListener("scroll", sync);
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (opts.onRun) opts.onRun();
        return;
      }
      if (e.key === "Tab" && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        if (e.shiftKey) {
          const v = ta.value;
          const ls = v.lastIndexOf("\n", ta.selectionStart - 1) + 1;
          const lead = v.slice(ls).match(/^ {1,4}/);
          if (lead) {
            ta.setSelectionRange(ls, ls + lead[0].length);
            insert("");
          }
        } else insert("    ");
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const v = ta.value;
        const s = ta.selectionStart;
        const ls = v.lastIndexOf("\n", s - 1) + 1;
        const line = v.slice(ls, s);
        let indent = (line.match(/^ */) || [""])[0];
        if (lang !== "sql" && /:\s*(#.*)?$/.test(line)) indent += "    ";
        insert("\n" + indent);
        return;
      }
      if (e.key === "Backspace" && ta.selectionStart === ta.selectionEnd) {
        const v = ta.value;
        const s = ta.selectionStart;
        const ls = v.lastIndexOf("\n", s - 1) + 1;
        const before = v.slice(ls, s);
        if (before.length >= 4 && /^ +$/.test(before) && before.length % 4 === 0) {
          e.preventDefault();
          ta.setSelectionRange(s - 4, s);
          insert("");
        }
      }
    });
    paint();
    return {
      get: () => ta.value,
      set: (v) => {
        ta.value = v;
        changed();
      },
      focus: () => ta.focus(),
    };
  }

  /* ================= Console ================= */
  function createConsole(host, opts) {
    opts = opts || {};
    host.innerHTML =
      '<div class="console' +
      (opts.compact ? " compact" : "") +
      '"><div class="console-bar"><span>Console</span><span class="console-actions"></span></div><div class="console-out"></div></div>';
    const out = $(".console-out", host);
    const actions = $(".console-actions", host);
    let busy = false;
    function placeholder() {
      out.innerHTML = '<span class="c-muted">' + esc(opts.placeholder || "Clique em Rodar para ver a saída aqui.") + "</span>";
    }
    placeholder();
    function setActions() {
      actions.innerHTML = busy ? '<button type="button" class="btn tiny danger" data-a="stop">Parar</button>' : '<button type="button" class="btn tiny ghost" data-a="clear">Limpar</button>';
    }
    setActions();
    actions.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]");
      if (!a) return;
      if (a.dataset.a === "stop") PY.stop();
      else placeholder();
    });
    function push(kind, text) {
      const last = out.lastElementChild;
      if (kind === "out" && last && last.classList.contains("c-out")) last.textContent += text;
      else {
        const s = document.createElement("span");
        s.className = "c-" + kind;
        s.textContent = text;
        out.appendChild(s);
      }
      out.scrollTop = out.scrollHeight;
    }
    async function run(code) {
      if (busy) return;
      out.innerHTML = "";
      const ok = await PY.ensure();
      if (!ok) {
        push("err", "Não foi possível carregar o Python. Recarregue a página.");
        return;
      }
      busy = true;
      setActions();
      const res = await PY.run(code, {
        onOut: (t) => push("out", t),
        onInput: (prompt) =>
          new Promise((resolve) => {
            push("out", prompt);
            const form = document.createElement("form");
            form.className = "c-ask";
            form.innerHTML = '<input aria-label="Resposta para o programa" autocomplete="off"><button class="btn tiny" type="submit">Enter</button>';
            out.appendChild(form);
            out.scrollTop = out.scrollHeight;
            const inp = $("input", form);
            inp.focus();
            form.addEventListener("submit", (e) => {
              e.preventDefault();
              const v = inp.value;
              form.remove();
              push("typed", v + "\n");
              resolve(v);
            });
          }),
      });
      $$(".c-ask", out).forEach((f) => f.remove());
      busy = false;
      setActions();
      if (res.err) {
        if (res.err.type === "PARADO") push("muted", "\nprograma interrompido");
        else push("err", "\n" + PY.friendly(res.err, code, opts.fn) + "\n" + res.err.msg);
      } else if (!res.out) push("muted", "O programa rodou, mas não mostrou nada na tela.");
    }
    return { run, clear: placeholder };
  }

  /* ================= Console SQL ================= */
  function sqlMsg(item) {
    const k = item.kind;
    const n = item.changes;
    const pl = (x, a, b) => x + " " + (x === 1 ? a : b);
    if (k === "INSERT" || k === "REPLACE") return pl(n, "linha inserida", "linhas inseridas");
    if (k === "UPDATE") return pl(n, "linha alterada", "linhas alteradas");
    if (k === "DELETE") return pl(n, "linha apagada", "linhas apagadas");
    if (k === "CREATE") return /^\s*create\s+view/i.test(item.sql) ? "View criada." : /^\s*create\s+table/i.test(item.sql) ? "Tabela criada." : "Criado.";
    if (k === "DROP") return "Removido.";
    if (k === "ALTER") return "Estrutura da tabela alterada.";
    if (k === "BEGIN") return "Transação aberta.";
    if (k === "COMMIT" || k === "END") return "Transação confirmada.";
    if (k === "ROLLBACK") return "Transação desfeita.";
    return "Comando executado.";
  }
  /** opts: { seeds, chart, getDb() (banco que continua entre execuções, no laboratório), onRan(result) } */
  function createSqlConsole(host, opts) {
    opts = opts || {};
    host.innerHTML =
      '<div class="console sqlconsole' +
      (opts.compact ? " compact" : "") +
      '"><div class="console-bar"><span>Resultado</span><span class="console-actions"><button type="button" class="btn tiny ghost" data-a="clear">Limpar</button></span></div><div class="console-out sql-out"></div></div>';
    const out = $(".console-out", host);
    function placeholder() {
      out.innerHTML = '<span class="c-muted">' + esc(opts.placeholder || "Clique em Rodar para ver o resultado aqui.") + "</span>";
    }
    placeholder();
    $('[data-a="clear"]', host).onclick = placeholder;
    async function run(code) {
      out.innerHTML = '<span class="c-muted">Carregando o banco...</span>';
      const ok = await SQ.ensure();
      if (!ok) {
        out.innerHTML = '<span class="c-err">Não foi possível carregar o SQL. Recarregue a página.</span>';
        return null;
      }
      const persistent = opts.getDb ? opts.getDb() : null;
      const db = persistent || SQ.open(opts.seeds || ["arena"]);
      const r = SQ.exec(db, code);
      let h = "";
      const multi = r.items.length + (r.err ? 1 : 0) > 1;
      r.items.forEach((it) => {
        h += '<div class="sql-block">';
        if (multi) h += '<div class="sql-stmt">' + highlight(it.sql.trim().replace(/\s+/g, " ").slice(0, 90), "sql") + "</div>";
        if (it.columns.length) {
          h += SQ.tableHtml(it);
          if (opts.chart && SQ.chartable(it)) h += SQ.chartHtml(it);
          else if (opts.chartButton && SQ.chartable(it)) h += '<button class="btn tiny ghost chart-btn">Ver gráfico</button><div class="chart-slot" hidden>' + SQ.chartHtml(it) + "</div>";
        } else h += '<div class="sql-ok">✓ ' + esc(sqlMsg(it)) + "</div>";
        h += "</div>";
      });
      if (r.err) h += '<div class="sql-block"><div class="c-err">' + esc(SQ.friendly(r.err.msg, code, db)) + '</div><div class="c-muted small">' + esc(r.err.msg) + "</div></div>";
      if (!r.items.length && !r.err) h = '<span class="c-muted">Nenhum comando para executar. Escreva um comando SQL terminado em ponto e vírgula.</span>';
      out.innerHTML = h;
      $$(".chart-btn", out).forEach(
        (b) =>
          (b.onclick = () => {
            const slot = b.nextElementSibling;
            slot.hidden = !slot.hidden;
            b.textContent = slot.hidden ? "Ver gráfico" : "Esconder gráfico";
          })
      );
      if (!persistent) db.close();
      if (opts.onRan) opts.onRan(r);
      return r;
    }
    return { run, clear: placeholder };
  }

  /** Painel com as tabelas do banco (nomes e colunas) */
  function schemaHtml(db) {
    return (
      '<div class="schema">' +
      SQ.tables(db)
        .map(
          (t) =>
            '<details class="schema-t"><summary><span class="schema-kind">' +
            (t.type === "view" ? "view" : "tabela") +
            "</span> " +
            esc(t.name) +
            '</summary><ul>' +
            t.columns.map((c) => "<li>" + (c.pk ? '<b title="chave primária">' + esc(c.name) + " 🔑</b>" : esc(c.name)) + ' <span class="muted">' + esc(c.type || "") + "</span></li>").join("") +
            "</ul></details>"
        )
        .join("") +
      "</div>"
    );
  }

  /* ================= Estrutura da página ================= */
  const app = () => $("#app");
  const NAV = [
    ["trilha", "Trilha"],
    ["revisao", "Revisão"],
    ["lab", "Laboratório"],
    ["perfil", "Perfil e entrega"],
  ];
  function shell(active, inner) {
    app().innerHTML =
      '<header class="topbar"><div class="topbar-inner wrap">' +
      '<a href="#/trilha" class="brand"><span class="brand-mark">&gt;_</span><span class="brand-name">' +
      SITE +
      "</span></a>" +
      '<nav class="nav" aria-label="Principal">' +
      NAV.map((n) => '<a href="#/' + n[0] + '" class="' + (n[0] === active ? "on" : "") + '" data-nav="' + n[0] + '">' + n[1] + "</a>").join("") +
      "</nav>" +
      '<div class="hud" id="hud"></div></div></header><main class="main" id="main">' +
      inner +
      "</main>";
    renderHud();
    return $("#main");
  }
  function renderHud() {
    const hud = $("#hud");
    if (!hud || !P) return;
    const lv = levelInfo(P.xp);
    hud.innerHTML =
      (CLOUD.online ? '<span id="cloudDot" class="cloud-dot ' + CLOUD.state + '" role="img" title="' + (CLOUD_TXT[CLOUD.state] || "") + '" aria-label="' + (CLOUD_TXT[CLOUD.state] || "") + '"></span>' : "") +
      (P.turma ? '<span class="hud-turma" title="Sua turma">' + esc(P.turma) + "</span>" : "") +
      '<div class="hud-level" title="' +
      lv.into +
      "/" +
      lv.need +
      ' XP para o próximo nível"><span class="hud-lv">Nv ' +
      lv.level +
      '</span><span class="hud-bar"><i style="width:' +
      lv.pct +
      '%"></i></span><span class="hud-xp">' +
      P.xp +
      " XP</span></div>" +
      '<div class="usermenu"><button class="avatar" id="avatarBtn" aria-label="Menu da conta">' +
      esc(P.name.trim().charAt(0).toUpperCase()) +
      "</button></div>";
    const badge = $('[data-nav="revisao"]');
    if (badge) badge.innerHTML = "Revisão" + (P.review.length ? ' <span class="nav-badge">' + P.review.length + "</span>" : "");
    $("#avatarBtn").onclick = (e) => {
      e.stopPropagation();
      const old = $(".usermenu-pop");
      if (old) return old.remove();
      const pop = document.createElement("div");
      pop.className = "usermenu-pop";
      pop.innerHTML =
        '<div class="usermenu-name">' +
        esc(P.name) +
        "</div>" +
        '<div class="save-state saved">' +
        (P.turma ? "Turma " + esc(P.turma) + " · " : "") +
        (CLOUD.online ? "salvo online" : "salvo neste navegador") + '</div><a href="#/perfil">Perfil e entrega</a><button data-a="report">Baixar relatório</button><button data-a="logout">Sair</button>';
      $(".usermenu").appendChild(pop);
      pop.addEventListener("click", (ev) => {
        const a = ev.target.closest("[data-a]");
        if (a && a.dataset.a === "logout") logout();
        if (a && a.dataset.a === "report") downloadReport();
        pop.remove();
      });
      setTimeout(() => document.addEventListener("click", () => pop.remove(), { once: true }), 0);
    };
  }

  /* ================= Foco da aula (o professor define por link) ================= */
  const FOCUS_KEY = "byteabyte:foco";
  let FOCUS = null;
  function readFocusFromUrl() {
    let q;
    try {
      q = new URLSearchParams(location.search);
    } catch (e) {
      return;
    }
    if (!q.has("foco") && !q.has("turma")) return;
    const mods = (q.get("foco") || "")
      .split(",")
      .map((x) => x.trim())
      .filter((id) => MODULE_BY_ID[id]);
    FOCUS = { mods, turma: (q.get("turma") || "").trim().slice(0, 30), strict: q.get("so") === "1" && mods.length > 0, day: today() };
    try {
      localStorage.setItem(FOCUS_KEY, JSON.stringify(FOCUS));
    } catch (e) {}
    try {
      history.replaceState(null, "", location.pathname + location.hash);
    } catch (e) {}
  }
  function loadFocus() {
    if (FOCUS) return;
    try {
      const f = JSON.parse(localStorage.getItem(FOCUS_KEY) || "null");
      FOCUS = f && f.day === today() ? f : null;
    } catch (e) {
      FOCUS = null;
    }
  }
  const focusMods = () => (FOCUS && FOCUS.mods && FOCUS.mods.length ? FOCUS.mods : null);
  const focusCourse = () => (focusMods() ? MODULE_BY_ID[focusMods()[0]].course : null);

  /* ================= Tela: boas-vindas ================= */
  function knownTurmas() {
    const set = new Set();
    Object.values(DB.profiles).forEach((p) => p.turma && set.add(p.turma));
    if (FOCUS && FOCUS.turma) set.add(FOCUS.turma);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  function viewWelcome() {
    const turmaDefault = FOCUS && FOCUS.turma ? FOCUS.turma : "";
    app().innerHTML =
      '<div class="auth">' +
      '<span class="brand auth-brand"><span class="brand-mark">&gt;_</span><span class="brand-name">' +
      SITE +
      "</span></span>" +
      '<div class="welcome-hero"><h1 class="display">Programar se aprende <span class="glow">programando</span>.</h1>' +
      '<p class="lead">Python e Banco de Dados. Lições curtas, exercícios corrigidos na hora, XP e conquistas.</p></div>' +
      '<div class="panel auth-card">' +
      '<form class="form" id="nameForm"><label class="field"><span>Seu nome</span><input id="nameInput" maxlength="40" autocomplete="off" placeholder="Nome e sobrenome" required></label>' +
      '<label class="field"><span>Sua turma</span><input id="turmaInput" maxlength="30" autocomplete="off" list="turmaList" placeholder="Ex.: 2º A" value="' +
      esc(turmaDefault) +
      '"></label><datalist id="turmaList">' +
      knownTurmas()
        .map((t) => '<option value="' + esc(t) + '"></option>')
        .join("") +
      "</datalist>" +
      '<p class="small muted" id="welcomeNote">' +
      (CLOUD.online ? "Seu progresso fica salvo online. Em qualquer computador, entre com o mesmo nome e a mesma turma." : "Use sempre o mesmo nome. Nome e turma aparecem no relatório que você entrega.") +
      "</p>" +
      '<p class="form-error" id="nameErr" hidden></p>' +
      '<button class="btn primary lg block">Começar</button></form>' +
      '<div class="divider"></div>' +
      '<label class="btn ghost block filebtn">Continuar de um arquivo de progresso<input type="file" id="importFile" accept=".html,.json,text/html,application/json" hidden></label>' +
      '<p class="small muted center-text">Trocou de computador? Carregue o relatório que você baixou antes.</p>' +
      "</div>" +
      (storageOk ? "" : '<p class="form-error">Este navegador está bloqueando o salvamento. Use o botão de baixar relatório no fim da aula.</p>') +
      "</div>";
    $("#nameForm").onsubmit = (e) => {
      e.preventDefault();
      const n = $("#nameInput").value.trim().replace(/\s+/g, " ");
      const t = $("#turmaInput").value.trim().replace(/\s+/g, " ");
      const err = $("#nameErr");
      if (n.length < 3) {
        err.hidden = false;
        err.textContent = "Digite seu nome (pelo menos 3 letras).";
        return;
      }
      if (!t) {
        err.hidden = false;
        err.textContent = "Digite sua turma.";
        return;
      }
      enter(n, t, $("#nameForm button"));
    };
    $("#importFile").onchange = (e) => importFile(e.target.files[0], true);
    setTimeout(() => $("#nameInput") && $("#nameInput").focus(), 50);
  }

  /** Entrar com nome e turma: com o banco online, traz o progresso salvo (de qualquer computador) */
  async function enter(n, t, btn) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Entrando...";
    }
    let remote = null;
    let failed = false;
    if (await cloudCheck())
      try {
        remote = await cloudGet(n, t);
      } catch (e) {
        failed = true;
      }
    if (remote && remote.name) n = remote.name; // mantém a grafia do primeiro acesso
    if (remote && remote.turma) t = remote.turma;
    const localKey = profileKey(n);
    const local = localKey ? DB.profiles[localKey] : null;
    const sameStudent = local && (!local.turma || cloudKey(local.turma) === cloudKey(t));
    if (remote && (!sameStudent || (remote.updated || 0) > (local.updated || 0))) {
      const key = localKey || n;
      DB.profiles[key] = normalize(Object.assign(remote, { name: key }), key);
    } else if (local && !sameStudent && CLOUD.online) {
      // mesmo nome, outra turma, neste computador: é outro aluno
      DB.profiles[localKey] = emptyProgress(localKey);
    }
    login(n, t);
    if (CLOUD.online) {
      if (!remote || (P.updated || 0) > (remote.updated || 0)) cloudSave();
      if (remote) toast("info", "Progresso carregado", "Bem-vindo de volta, " + P.name.split(" ")[0] + ".");
    }
    if (failed) toast("error", "Sem conexão com o servidor", "Seu progresso fica salvo neste computador e vai para o servidor quando a conexão voltar.");
    go("#/trilha");
  }

  /* ================= Tela: trilha ================= */
  let trilhaCourse = null;
  function moduleCard(m, next) {
    const mp = moduleProgress(P, m);
    let h =
      '<article class="module acc-' +
      m.accent +
      '"><header class="module-head"><span class="module-num">' +
      pad2(modulesOf(m.course).indexOf(m) + 1) +
      '</span><div class="module-title"><h2>' +
      esc(m.title) +
      "</h2><p>" +
      esc(m.tagline) +
      '</p></div><div class="module-meta"><span class="mono small">' +
      mp.done +
      "/" +
      mp.total +
      "</span>" +
      stars(mp.stars, mp.maxStars, "sm") +
      '</div></header><ol class="lessons">';
    m.lessons.forEach((l, li) => {
      const res = P.lessons[l.id];
      const going = P.current && P.current.lessonId === l.id && !res;
      const isNext = next && next.lesson.id === l.id;
      const cls = res ? "done" : isNext ? "next" : "open";
      h +=
        '<li class="lesson ' +
        cls +
        '"><a class="lesson-link" href="#/licao/' +
        l.id +
        '"><span class="lesson-node">' +
        (res ? ICON.check : li + 1) +
        '</span><span class="lesson-text"><b>' +
        esc(l.title) +
        "</b><span>" +
        esc(l.summary) +
        '</span></span><span class="lesson-end">' +
        (res ? stars(res.stars, 3, "sm") : going ? '<span class="mono small acc-text">em andamento</span>' : '<span class="mono small muted">' + l.steps.length + " etapas</span>") +
        "</span></a></li>";
    });
    return h + "</ol></article>";
  }
  function viewTrilha() {
    const fm = focusMods();
    const fc = focusCourse();
    let course = trilhaCourse || fc || P.course || "py";
    if (FOCUS && FOCUS.strict && fc) course = fc;
    if (!COURSE_BY_ID[course]) course = "py";
    trilhaCourse = course;
    if (P.course !== course) update((p) => (p.course = course));
    CUR_LANG = COURSE_BY_ID[course].lang;
    const strict = FOCUS && FOCUS.strict && fc === course;
    const focusHere = fm && fc === course ? fm : null;
    const lv = levelInfo(P.xp);
    const next = nextLesson(P, course, focusHere);
    const totalStars = Object.values(P.lessons).reduce((a, l) => a + l.stars, 0);
    const inProgress = P.current && next && P.current.lessonId === next.lesson.id && P.current.step > 0;

    let h = '<div class="wrap page">';
    h += '<div class="course-tabs" role="tablist" aria-label="Disciplina">';
    COURSES.forEach((c) => {
      const locked = FOCUS && FOCUS.strict && fc && c.id !== fc;
      h +=
        '<button role="tab" class="course-tab' +
        (c.id === course ? " on" : "") +
        '" data-course="' +
        c.id +
        '" aria-selected="' +
        (c.id === course) +
        '"' +
        (locked ? " disabled title=\"O professor pediu foco em outra disciplina hoje\"" : "") +
        "><b>" +
        esc(c.name) +
        "</b><span>" +
        courseDone(P, c.id) +
        "/" +
        lessonsOf(c.id).length +
        " lições</span></button>";
    });
    h += "</div>";

    h += '<section class="dash"><div class="panel dash-main">';
    h += '<p class="eyebrow">' + esc(COURSE_BY_ID[course].name) + "</p><h1 class=\"h1\">Olá, " + esc(P.name.split(" ")[0]) + "</h1>";
    h +=
      '<div class="lvrow"><span class="lvchip">Nível ' +
      lv.level +
      " <b>" +
      lv.title +
      '</b></span><div class="bar"><i style="width:' +
      lv.pct +
      '%"></i></div><span class="mono small muted">' +
      lv.into +
      "/" +
      lv.need +
      " XP</span></div>";
    h +=
      '<div class="dash-stats"><div><b>' +
      P.xp +
      "</b><span>XP total</span></div><div><b>" +
      courseDone(P, course) +
      "/" +
      lessonsOf(course).length +
      "</b><span>lições de " +
      esc(COURSE_BY_ID[course].short) +
      "</span></div><div><b>" +
      totalStars +
      "</b><span>estrelas</span></div><div><b>" +
      P.badges.length +
      "</b><span>conquistas</span></div></div>";
    if (next)
      h +=
        '<a href="#/licao/' +
        next.lesson.id +
        '" class="continue"><span class="continue-label">' +
        (inProgress ? "Continuar de onde parou" : focusHere ? "Foco da aula" : courseDone(P, course) ? "Sugestão" : "Começar") +
        '</span><span class="continue-title">' +
        esc(next.module.title + " · " + next.lesson.title) +
        '</span><span class="continue-arrow" aria-hidden="true">→</span></a>';
    else
      h +=
        '<div class="continue done"><span class="continue-label">' +
        (focusHere ? "Foco da aula concluído" : "Trilha completa") +
        '</span><span class="continue-title">' +
        (focusHere ? "Você fez todas as lições do foco de hoje. Revise ou escolha outro módulo." : "Você concluiu todas as lições desta disciplina.") +
        "</span></div>";
    if (!P.turma)
      h +=
        '<form class="turma-ask" id="turmaAsk"><span>Qual é a sua turma?</span><input id="turmaAskIn" maxlength="30" placeholder="ex.: 2º A" required><button class="btn small">Salvar</button></form>';
    h += '<p class="small muted">Todas as lições estão abertas: escolha por onde começar.</p>';
    h += '</div><div class="dash-side">';
    h +=
      '<div class="panel side-card deliver"><p class="eyebrow">Entrega</p><h3 class="h3">Relatório para o professor</h3><p class="small muted">' +
      (CLOUD.online
        ? "Seu progresso vai para o professor automaticamente. Se ele pedir, baixe também o arquivo de relatório."
        : "No fim da aula, baixe o arquivo com seu progresso, respostas e códigos e envie para o professor.") +
      '</p><button class="btn primary" id="reportBtn">Baixar relatório</button></div>';
    h +=
      '<a href="#/revisao" class="panel side-card"><p class="eyebrow">Revisão</p><h3 class="h3">' +
      (P.review.length ? P.review.length + " para refazer" : "Cartões de memória") +
      '</h3><p class="small muted">' +
      (P.review.length ? "Exercícios que você errou ou pulou ficam aqui para treinar de novo." : "Relembre os conceitos de cada módulo em cartões rápidos.") +
      "</p></a>";
    h += "</div></section>";

    const mods = modulesOf(course);
    if (focusHere) {
      h +=
        '<section class="focus-box"><div class="focus-head"><span class="eyebrow">Foco da aula' +
        (FOCUS.turma ? " · " + esc(FOCUS.turma) : "") +
        '</span><span class="small muted">' +
        (strict ? "Hoje o professor liberou só estes módulos." : "O professor pediu atenção a estes módulos hoje.") +
        '</span></div><div class="path">' +
        mods
          .filter((m) => focusHere.includes(m.id))
          .map((m) => moduleCard(m, next))
          .join("") +
        "</div></section>";
      if (!strict) {
        const rest = mods.filter((m) => !focusHere.includes(m.id));
        if (rest.length)
          h +=
            '<details class="others"><summary>Outros módulos de ' +
            esc(COURSE_BY_ID[course].short) +
            " (" +
            rest.length +
            ')</summary><div class="path">' +
            rest.map((m) => moduleCard(m, next)).join("") +
            "</div></details>";
      }
    } else h += '<section class="path">' + mods.map((m) => moduleCard(m, next)).join("") + "</section>";
    h += "</div>";
    const main = shell("trilha", h);
    $("#reportBtn", main).onclick = downloadReport;
    if ($("#turmaAsk", main))
      $("#turmaAsk", main).onsubmit = (e) => {
        e.preventDefault();
        const v = $("#turmaAskIn", main).value.trim().slice(0, 30);
        if (!v) return;
        update((p) => (p.turma = v));
        renderHud();
        viewTrilha();
        cloudSync();
      };
    $$("[data-course]", main).forEach(
      (b) =>
        (b.onclick = () => {
          trilhaCourse = b.dataset.course;
          viewTrilha();
        })
    );
  }

  /* ================= Etapas ================= */
  function feedback(tone, title, text, actions) {
    return (
      '<div class="feedback fb-' +
      tone +
      '" role="' +
      (tone === "bad" ? "alert" : "status") +
      '"><div class="feedback-body"><strong class="feedback-title"><span class="feedback-icon" aria-hidden="true">' +
      (tone === "ok" ? "✓" : tone === "bad" ? "✕" : "i") +
      "</span>" +
      esc(title) +
      "</strong>" +
      (text ? '<div class="feedback-text">' + text + "</div>" : "") +
      "</div>" +
      (actions ? '<div class="feedback-actions">' + actions + "</div>" : "") +
      "</div>"
    );
  }
  function looksCode(c) {
    return /[()"=[\]<>%*+#!]|^-?\d[\d.]*$|^(True|False|None|def|return|if|else|elif|while|for)$|^[a-z_]+\.[a-z_]+/.test(c) && !/[áéíóúãõç]/i.test(c);
  }

  function stepExplain(el, ctx) {
    const s = ctx.step;
    let h = '<div class="step step-explain"><h2 class="step-title">' + esc(s.title) + '</h2><div class="prose">' + s.body.map((p) => "<p>" + rich(p) + "</p>").join("") + "</div>";
    if (s.boxes) h += '<div class="boxes">' + s.boxes.map((b) => '<div class="box"><span class="box-name">' + esc(b.name) + '</span><span class="box-value">' + esc(b.value) + "</span></div>").join("") + "</div>";
    if (s.code && s.run)
      h +=
        '<div class="runblock"><div class="ed"></div><div class="row"><button class="btn run" data-a="run">▶ Rodar</button><button class="btn ghost small" data-a="reset" hidden>Voltar ao original</button><span class="small muted">Pode mexer no código e rodar de novo.</span></div><div class="con"></div></div>';
    else if (s.code) h += codeView(s.code);
    if (s.output && !s.run) h += outView(s.output);
    if (s.table)
      h +=
        '<div class="tablewrap"><table class="table"><thead><tr>' +
        s.table.head.map((x) => "<th>" + esc(x) + "</th>").join("") +
        "</tr></thead><tbody>" +
        s.table.rows.map((r) => "<tr>" + r.map((c) => "<td" + (looksCode(c) ? ' class="mono"' : "") + ">" + rich(c) + "</td>").join("") + "</tr>").join("") +
        "</tbody></table></div>";
    if (s.tip) h += '<div class="callout tip"><b>Dica</b> ' + rich(s.tip) + "</div>";
    if (s.warn) h += '<div class="callout warn"><b>Atenção</b> ' + rich(s.warn) + "</div>";
    h += '<div class="step-foot"><button class="btn primary lg" data-a="next">Entendi, continuar</button></div></div>';
    el.innerHTML = h;
    if (s.code && s.run) {
      const resetBtn = $('[data-a="reset"]', el);
      const ed = createEditor($(".ed", el), s.code, { minLines: Math.min(s.code.split("\n").length, 10), onRun: run, onChange: (v) => (resetBtn.hidden = v === s.code) });
      const con = ctx.lang === "sql" ? createSqlConsole($(".con", el), { compact: true, chart: s.chart }) : createConsole($(".con", el), { compact: true });
      function run() {
        update((p) => p.stats.runs++);
        con.run(ed.get());
      }
      $('[data-a="run"]', el).onclick = run;
      resetBtn.onclick = () => ed.set(s.code);
    }
    $('[data-a="next"]', el).onclick = () => {
      ctx.onSolved({ status: "ok", clean: true });
      ctx.onNext();
    };
  }

  function stepQuiz(el, ctx) {
    const s = ctx.step;
    const opts = seededShuffle(
      s.options.map((o, i) => Object.assign({ i }, o)),
      ctx.key
    );
    const correct = s.options.findIndex((o) => o.correct);
    let state = "ask";
    let picked = null;
    const wrong = [];
    function render() {
      const done = state === "ok" || state === "revealed";
      let h = '<div class="step step-quiz"><h2 class="step-title">' + rich(s.question) + "</h2>" + (s.code ? codeView(s.code) : "");
      h += '<div class="options' + (s.mono ? " mono" : "") + '">';
      opts.forEach((o) => {
        const isRight = done && o.i === correct;
        const isWrong = wrong.includes(o.i);
        h +=
          '<button class="option' +
          (isRight ? " right" : "") +
          (isWrong ? " wrong" : "") +
          (picked === o.i && state === "bad" ? " shake" : "") +
          '" data-i="' +
          o.i +
          '"' +
          (done || isWrong ? " disabled" : "") +
          '><span class="option-text">' +
          esc(o.text) +
          "</span></button>";
      });
      h += "</div>";
      if (state === "bad")
        h += feedback("bad", "Ainda não", rich(s.options[picked].why), '<button class="btn" data-a="retry">Tentar de novo</button><button class="btn ghost" data-a="reveal">Ver resposta</button>');
      if (done)
        h += feedback(
          state === "ok" ? "ok" : "info",
          state === "ok" ? (wrong.length ? "Isso, acertou" : "Certo!") : "A resposta certa está marcada",
          rich(s.options[correct].why),
          '<button class="btn primary lg" data-a="next">Continuar</button>'
        );
      el.innerHTML = h + "</div>";
      $$(".option", el).forEach((b) => (b.onclick = () => choose(Number(b.dataset.i))));
      const r = $('[data-a="retry"]', el);
      if (r) r.onclick = () => ((state = "ask"), (picked = null), render());
      const rv = $('[data-a="reveal"]', el);
      if (rv)
        rv.onclick = () => {
          state = "revealed";
          ctx.onSolved({ status: "revealed", clean: false }, "(viu a resposta)");
          render();
        };
      const n = $('[data-a="next"]', el);
      if (n) (n.onclick = ctx.onNext), n.focus();
    }
    function choose(i) {
      picked = i;
      if (s.options[i].correct) {
        state = "ok";
        ctx.onSolved({ status: "ok", clean: wrong.length === 0 }, s.options[i].text);
      } else {
        state = "bad";
        if (!wrong.includes(i)) wrong.push(i);
        ctx.onMistake(s.options[i].text);
      }
      render();
    }
    render();
  }

  function stepFill(el, ctx) {
    const s = ctx.step;
    const n = s.answers.length;
    const vals = Array(n).fill(null);
    let active = 0;
    let state = "ask";
    let tries = 0;
    const accepts = (a, v) => v !== null && a.split("|").some((x) => x.trim() === v.trim());
    const parts = s.code.split(/(__\d+__)/g);
    function render() {
      const done = state === "ok" || state === "revealed";
      let pre = "";
      parts.forEach((p) => {
        const m = p.match(/^__(\d+)__$/);
        if (!m) return (pre += highlight(p));
        const bi = Number(m[1]) - 1;
        const v = vals[bi];
        const w = state === "bad" && !accepts(s.answers[bi], v);
        const r = (state === "bad" || done) && accepts(s.answers[bi], v);
        pre +=
          '<button class="blank' +
          (v === null ? " empty" : "") +
          (active === bi && !done ? " active" : "") +
          (w ? " wrong" : "") +
          (r ? " right" : "") +
          '" data-b="' +
          bi +
          '">' +
          esc(v === null ? "  " + (bi + 1) + "  " : v) +
          "</button>";
      });
      let h = '<div class="step step-fill"><h2 class="step-title">' + rich(s.prompt) + '</h2><div class="codeview fillcode"><pre>' + pre + "</pre></div>";
      h += '<p class="small muted">Toque numa opção para encaixar na lacuna destacada. Toque numa lacuna preenchida para esvaziar.</p><div class="chips">';
      s.bank.forEach((c, i) => (h += '<button class="chip" data-c="' + i + '"' + (done ? " disabled" : "") + ">" + esc(c) + "</button>"));
      h += "</div>";
      if (state === "ask") h += '<div class="step-foot"><button class="btn primary lg" data-a="check"' + (vals.some((v) => v === null) ? " disabled" : "") + ">Verificar</button></div>";
      if (state === "bad")
        h += feedback(
          "bad",
          "Tem lacuna errada",
          "As lacunas em vermelho não estão certas. As verdes ficam quando você tentar de novo.",
          '<button class="btn" data-a="retry">Tentar de novo</button><button class="btn ghost" data-a="reveal">Ver resposta</button>'
        );
      if (done) h += feedback(state === "ok" ? "ok" : "info", state === "ok" ? "Certo!" : "Esta é a resposta", rich(s.explain), '<button class="btn primary lg" data-a="next">Continuar</button>');
      el.innerHTML = h + "</div>";
      $$(".blank", el).forEach(
        (b) =>
          (b.onclick = () => {
            if (done) return;
            const bi = Number(b.dataset.b);
            if (vals[bi] !== null) vals[bi] = null;
            active = bi;
            if (state === "bad") state = "ask";
            render();
          })
      );
      $$(".chip", el).forEach((b) => (b.onclick = () => put(s.bank[Number(b.dataset.c)])));
      const c = $('[data-a="check"]', el);
      if (c) c.onclick = check;
      const r = $('[data-a="retry"]', el);
      if (r)
        r.onclick = () => {
          for (let i = 0; i < n; i++) if (!accepts(s.answers[i], vals[i])) vals[i] = null;
          active = Math.max(0, vals.findIndex((v) => v === null));
          state = "ask";
          render();
        };
      const rv = $('[data-a="reveal"]', el);
      if (rv)
        rv.onclick = () => {
          s.answers.forEach((a, i) => (vals[i] = a.split("|")[0]));
          state = "revealed";
          ctx.onSolved({ status: "revealed", clean: false }, "(viu a resposta)");
          render();
        };
      const nx = $('[data-a="next"]', el);
      if (nx) (nx.onclick = ctx.onNext), nx.focus();
    }
    function put(chip) {
      if (state === "ok" || state === "revealed") return;
      let at = active;
      if (vals[at] !== null) {
        const empty = vals.findIndex((v) => v === null);
        if (empty !== -1) at = empty;
      }
      vals[at] = chip;
      const ne = vals.findIndex((v) => v === null);
      active = ne === -1 ? at : ne;
      if (state === "bad") state = "ask";
      render();
    }
    function check() {
      const answer = vals.map((v, i) => "[" + (i + 1) + "] " + v).join("  ");
      if (s.answers.every((a, i) => accepts(a, vals[i]))) {
        state = "ok";
        ctx.onSolved({ status: "ok", clean: tries === 0 }, answer);
      } else {
        state = "bad";
        tries++;
        ctx.onMistake(answer);
      }
      render();
    }
    render();
  }

  function stepOrder(el, ctx) {
    const s = ctx.step;
    const all = s.lines.concat(s.extra || []).map((text, id) => ({ id, text }));
    let pool = seededShuffle(all, ctx.key);
    if (pool.every((x, i) => x.id === i) && pool.length > 1) pool = [pool[1], pool[0]].concat(pool.slice(2));
    let prog = [];
    let state = "ask";
    let badAt = -1;
    let tries = 0;
    function render() {
      const done = state === "ok" || state === "revealed";
      let h = '<div class="step step-order"><h2 class="step-title">' + rich(s.prompt) + "</h2>" + (s.output ? outView(s.output, "Saída esperada") : "");
      h += '<div class="order-grid"><div><p class="order-label">Seu programa</p><ol class="order-prog">';
      if (!prog.length) h += '<li class="order-empty">Toque nas linhas ao lado para montar o programa</li>';
      prog.forEach((it, i) => {
        h +=
          '<li><button class="order-line' +
          (state === "bad" && i === badAt ? " wrong" : "") +
          ((state === "bad" && i < badAt) || done ? " right" : "") +
          '" data-r="' +
          it.id +
          '"' +
          (done ? " disabled" : "") +
          '><span class="order-n">' +
          (i + 1) +
          "</span><code>" +
          highlight(it.text) +
          "</code></button></li>";
      });
      h += '</ol></div><div><p class="order-label">Linhas disponíveis</p><div class="order-pool">';
      pool.forEach((it) => (h += '<button class="order-line pool" data-p="' + it.id + '"' + (done ? " disabled" : "") + "><code>" + highlight(it.text) + "</code></button>"));
      if (!pool.length) h += '<span class="small muted">Todas as linhas foram usadas.</span>';
      h += '</div></div></div><p class="small muted">Os espaços no começo das linhas já estão certos. Repare neles: eles dizem o que fica dentro de um if, for ou def.</p>';
      if (state === "ask") h += '<div class="step-foot"><button class="btn primary lg" data-a="check"' + (prog.length ? "" : " disabled") + ">Verificar</button></div>";
      if (state === "bad") {
        const bl = prog[badAt];
        const msg = !bl
          ? "O programa está incompleto: falta pelo menos uma linha."
          : !s.lines.includes(bl.text)
            ? "A linha " + (badAt + 1) + ' não faz parte deste programa. Tem uma linha "pegadinha" nas opções.'
            : "A linha " + (badAt + 1) + " está fora do lugar. As de cima estão certas.";
        h += feedback("bad", "Quase", esc(msg), '<button class="btn" data-a="retry">Tentar de novo</button><button class="btn ghost" data-a="reveal">Ver resposta</button>');
      }
      if (done) h += feedback(state === "ok" ? "ok" : "info", state === "ok" ? "Programa montado!" : "Esta é a ordem certa", rich(s.explain), '<button class="btn primary lg" data-a="next">Continuar</button>');
      el.innerHTML = h + "</div>";
      $$("[data-p]", el).forEach(
        (b) =>
          (b.onclick = () => {
            const it = all[Number(b.dataset.p)];
            pool = pool.filter((x) => x.id !== it.id);
            prog.push(it);
            if (state === "bad") state = "ask";
            render();
          })
      );
      $$("[data-r]", el).forEach(
        (b) =>
          (b.onclick = () => {
            const it = all[Number(b.dataset.r)];
            prog = prog.filter((x) => x.id !== it.id);
            pool.push(it);
            if (state === "bad") state = "ask";
            render();
          })
      );
      const c = $('[data-a="check"]', el);
      if (c) c.onclick = check;
      const r = $('[data-a="retry"]', el);
      if (r)
        r.onclick = () => {
          pool = pool.concat(prog.slice(badAt));
          prog = prog.slice(0, badAt);
          state = "ask";
          render();
        };
      const rv = $('[data-a="reveal"]', el);
      if (rv)
        rv.onclick = () => {
          prog = s.lines.map((t) => all.find((a) => a.text === t));
          pool = all.filter((a) => !s.lines.includes(a.text));
          state = "revealed";
          ctx.onSolved({ status: "revealed", clean: false }, "(viu a resposta)");
          render();
        };
      const nx = $('[data-a="next"]', el);
      if (nx) (nx.onclick = ctx.onNext), nx.focus();
    }
    function check() {
      badAt = -1;
      for (let i = 0; i < Math.max(s.lines.length, prog.length); i++)
        if (!prog[i] || prog[i].text !== s.lines[i]) {
          badAt = i;
          break;
        }
      const answer = prog.map((x) => x.text).join("\n");
      if (badAt === -1) {
        state = "ok";
        ctx.onSolved({ status: "ok", clean: tries === 0 }, answer);
      } else {
        state = "bad";
        tries++;
        ctx.onMistake(answer);
      }
      render();
    }
    render();
  }

  function starterFor(step, ref, index) {
    if (step.carry) {
      const src = carrySource(ref, index);
      if (src) {
        const prev = P.passed[stepKey(src.lessonId, src.index)] || src.step.solution;
        return prev.replace(/\s+$/, "") + "\n" + (step.append || "");
      }
    }
    return step.starter || "";
  }

  /* Linhas da solução que o aluno ainda precisa escrever (as que não estão no código inicial) */
  function revealCandidates(step, starter, lang) {
    const cm = lang === "sql" ? "--" : "#";
    const have = {};
    starter.split("\n").forEach((l) => {
      const t = l.trim();
      if (t && !t.startsWith(cm)) have[t] = (have[t] || 0) + 1;
    });
    const out = [];
    step.solution.split("\n").forEach((l, i) => {
      const t = l.trim();
      if (!t || t.startsWith(cm)) return;
      if (have[t]) {
        have[t]--;
        return;
      }
      out.push({ n: i + 1, text: l });
    });
    return out;
  }
  const HELP_COST = { hint: 2, line: 3 };
  const showIndent = (line) => {
    const m = line.match(/^ */)[0].length;
    return '<span class="indent-dots" title="' + m + ' espaços">' + "·".repeat(m) + "</span>" + highlight(line.slice(m));
  };

  function stepCode(el, ctx) {
    const s = ctx.step;
    const key = ctx.key;
    const starter = starterFor(s, ctx.ref, ctx.index);
    const initial = P.drafts[key] != null ? P.drafts[key] : starter;
    const isSql = ctx.lang === "sql";
    const lines = revealCandidates(s, starter, ctx.lang);
    const lineLimit = Math.floor(lines.length / 2);
    const help = Object.assign({ hints: 0, lines: 0, pastes: 0 }, (P.help || {})[key]);
    let state = "work";
    let fails = 0;
    let showSol = false;
    let h = '<div class="step step-code"><div class="code-layout"><div class="code-brief">';
    h += '<p class="eyebrow">' + (s.bug ? "Conserte o código" : isSql ? "Exercício de SQL" : "Exercício de código") + '</p><h2 class="step-title">' + esc(s.title) + '</h2><div class="prose"><p>' + rich(s.prompt) + "</p></div>";
    if (s.example) {
      h += '<div class="example"><div class="codeview-label">' + (s.example.calls ? "Como a função deve responder" : "Exemplo de execução") + "</div>";
      if (s.example.inputs && s.example.inputs.length) h += '<p class="example-in">Digitando: ' + s.example.inputs.map((v) => '<code class="typed">' + esc(v) + "</code>").join(" ") + "</p>";
      h += "<pre>" + esc(s.example.output) + "</pre>";
      if (s.example.inputs && s.example.inputs.length) h += '<p class="small muted">A correção ignora as perguntas do input. Ela confere o que o print mostra.</p>';
      h += "</div>";
    }
    if (isSql) {
      if (s.check)
        h += '<div class="example"><div class="codeview-label">A correção roda esta consulta depois do seu código</div><pre>' + highlight(s.check, "sql") + '</pre><div class="expected-slot"></div></div>';
      else h += '<div class="example"><div class="codeview-label">Resultado esperado</div><div class="expected-slot"><span class="small muted">Carregando...</span></div></div>';
      if (s.probes) h += '<p class="small muted">A correção também testa se o banco barra dados errados e aceita os certos.</p>';
      h += '<details class="schema-box"><summary>Tabelas do banco</summary><div class="schema-slot"></div></details>';
    }
    if (s.fn) h += '<p class="small muted">A correção chama a sua função <code class="ic">' + esc(s.fn) + "</code> com vários valores.</p>";
    h += '<div class="helpbox"></div><div class="solution"></div></div>';
    h +=
      '<div class="code-work"><div class="ed"></div><p class="nopaste-note" aria-live="polite">Colar está desativado nos exercícios. Digite o código.</p>' +
      '<div class="row toolbar"><button class="btn run" data-a="run">▶ Rodar</button><button class="btn primary" data-a="verify">Verificar</button><span class="grow"></span><span class="reset-area"></span></div>';
    h += '<div class="con"></div><div class="result"></div></div></div></div>';
    el.innerHTML = h;

    function saveHelp() {
      update((p) => {
        if (!p.help) p.help = {};
        p.help[key] = Object.assign({}, help);
      });
    }

    let saveTimer = null;
    let pasteTimer = null;
    const ed = createEditor($(".ed", el), initial, {
      minLines: isSql ? 7 : 10,
      lang: ctx.lang,
      onRun: run,
      noPaste: true,
      onPasteBlocked: () => {
        help.pastes++;
        saveHelp();
        const n = $(".nopaste-note", el);
        n.classList.add("nopaste-on");
        n.textContent = isSql
          ? "Colar está desativado aqui. Digite o comando: é escrevendo que a mão aprende onde vão as vírgulas, as aspas e o ponto e vírgula."
          : "Colar está desativado aqui. Digite o código: é escrevendo que a mão aprende onde vão os dois-pontos, as aspas e os espaços.";
        clearTimeout(pasteTimer);
        pasteTimer = setTimeout(() => {
          n.classList.remove("nopaste-on");
          n.textContent = "Colar está desativado nos exercícios. Digite o código.";
        }, 4500);
      },
      onChange: (v) => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => update((p) => (p.drafts[key] = v)), 1500);
      },
    });
    const conPh = "Rodar mostra o resultado aqui. Verificar confere se o exercício está certo.";
    const con = isSql ? createSqlConsole($(".con", el), { chart: s.chart, placeholder: conPh }) : createConsole($(".con", el), { fn: s.fn, placeholder: conPh });
    if (isSql)
      SQ.ensure().then((ok) => {
        if (!ok || !el.isConnected) return;
        const slot = $(".expected-slot", el);
        if (slot) {
          const e = SQ.expected(s);
          slot.innerHTML = e ? (s.check ? '<div class="codeview-label">Ela deve mostrar</div>' : "") + SQ.tableHtml(e, 15) + (s.chart && SQ.chartable(e) ? SQ.chartHtml(e) : "") : "";
        }
        const db = SQ.open(s.seed ? [s.seed] : ["arena"]);
        $(".schema-slot", el).innerHTML = schemaHtml(db);
        db.close();
      });

    function run() {
      update((p) => {
        p.stats.runs++;
        p.drafts[key] = ed.get();
      });
      con.run(ed.get());
    }
    function xpNow() {
      return Math.max(3, XP.code - help.hints * HELP_COST.hint - help.lines * HELP_COST.line);
    }
    function renderBrief() {
      const working = state === "work";
      let b = '<div class="helpbox-in"><div class="helpbox-head"><span class="eyebrow">Ajuda</span><span class="mono small muted">vale ' + xpNow() + " XP</span></div>";
      if (help.hints)
        b += s.hints
          .slice(0, help.hints)
          .map((x, i) => '<div class="hint"><b>Dica ' + (i + 1) + "</b> " + rich(x) + "</div>")
          .join("");
      if (help.lines) {
        b += '<div class="reveal"><div class="codeview-label">Linhas da solução (leia e digite no editor)</div>';
        lines.slice(0, help.lines).forEach((l) => (b += '<div class="reveal-line"><span class="reveal-n">linha ' + l.n + "</span><code>" + showIndent(l.text) + "</code></div>"));
        b += '<p class="small muted">Os pontos · mostram os espaços do começo da linha.</p></div>';
      }
      b += '<div class="row wrap-row">';
      if (working && help.hints < s.hints.length)
        b += '<button class="btn ghost small" data-a="hint">Dica ' + (help.hints + 1) + "/" + s.hints.length + ' <span class="cost">−' + HELP_COST.hint + " XP</span></button>";
      if (working && lineLimit > 0 && help.lines < lineLimit)
        b += '<button class="btn ghost small" data-a="line">Revelar uma linha ' + (help.lines + 1) + "/" + lineLimit + ' <span class="cost">−' + HELP_COST.line + " XP</span></button>";
      if (!working && !showSol) b += '<button class="btn ghost small" data-a="sol">Comparar com uma solução</button>';
      b += "</div>";
      if (working && help.lines >= lineLimit && help.hints >= s.hints.length)
        b += '<p class="small muted">Você usou todas as ajudas. O resto é com você: releia as dicas, rode o código e compare com o exemplo. Se travar, pule e volte na revisão.</p>';
      else if (working && lineLimit > 0) b += '<p class="small muted">Dá para revelar até metade das linhas. A outra metade é com você.</p>';
      b += "</div>";
      $(".helpbox", el).innerHTML = b;
      $(".solution", el).innerHTML = showSol ? codeView(s.solution, "Uma solução possível") : "";
      const hb = $('[data-a="hint"]', el);
      if (hb)
        hb.onclick = () => {
          help.hints++;
          update((p) => p.stats.hints++);
          saveHelp();
          renderBrief();
        };
      const lb = $('[data-a="line"]', el);
      if (lb)
        lb.onclick = () => {
          help.lines++;
          update((p) => (p.stats.lines = (p.stats.lines || 0) + 1));
          saveHelp();
          renderBrief();
        };
      const sb = $('[data-a="sol"]', el);
      if (sb) sb.onclick = () => ((showSol = true), renderBrief());
    }
    function renderReset(confirm) {
      const area = $(".reset-area", el);
      area.innerHTML = confirm
        ? '<span class="small muted">Apagar seu código?</span> <button class="btn tiny danger" data-a="yes">Sim</button> <button class="btn tiny ghost" data-a="no">Não</button>'
        : '<button class="btn tiny ghost" data-a="reset">Recomeçar</button>';
      if (confirm) {
        $('[data-a="yes"]', area).onclick = () => {
          ed.set(starter);
          update((p) => (p.drafts[key] = starter));
          $(".result", el).innerHTML = "";
          showIdle();
          renderReset(false);
        };
        $('[data-a="no"]', area).onclick = () => renderReset(false);
      } else $('[data-a="reset"]', area).onclick = () => renderReset(true);
    }
    function skip() {
      state = "skipped";
      ctx.onSolved({ status: "skipped", clean: false, help: Object.assign({}, help) }, ed.get());
      ctx.onNext();
    }
    function showDone() {
      const res = $(".result", el);
      res.innerHTML = feedback(
        "ok",
        isSql ? "Resultado correto!" : "Todos os testes passaram!",
        rich(s.after || (isSql ? "Se o seu comando ficou diferente da solução e deu o mesmo resultado, está valendo: existem vários jeitos certos." : "Se o seu código ficou diferente da solução e passou nos testes, está valendo: existem vários jeitos certos.")),
        '<button class="btn primary lg" data-a="next">Continuar</button>'
      );
      $('[data-a="next"]', res).onclick = ctx.onNext;
    }
    function showIdle() {
      $(".result", el).innerHTML = '<div class="row"><button class="btn ghost small" data-a="skip">Pular por agora</button><span class="small muted">Exercícios pulados vão para a revisão.</span></div>';
      $('[data-a="skip"]', el).onclick = skip;
    }
    async function verify() {
      if (state !== "work") return;
      if (!isSql) PY.stop();
      const btn = $('[data-a="verify"]', el);
      btn.disabled = true;
      btn.textContent = "Verificando...";
      const code = ed.get();
      const results = [];
      let sqlFail = null;
      if (isSql) {
        const ok = await SQ.ensure();
        let v;
        try {
          v = ok ? SQ.verify(s, code) : { ok: false, kind: "internal", msg: "Não foi possível carregar o SQL. Recarregue a página." };
        } catch (e) {
          v = { ok: false, kind: "internal", msg: String(e) };
        }
        results.push({ ok: v.ok });
        if (!v.ok) sqlFail = v;
      } else {
      const ok = await PY.ensure();
      if (!ok) results.push({ t: s.tests[0], ok: false, errText: "Não foi possível carregar o Python. Recarregue a página." });
      else
        for (const t of s.tests) {
          const r = await PY.run(PY.buildTestCode(code, t), { inputs: t.inputs || [] });
          if (r.err) {
            results.push({ t, ok: false, errText: PY.friendly(r.err, code, s.fn), errRaw: r.err.msg });
            continue;
          }
          const got = PY.extractOutput(r.out, t);
          if (got === null) {
            results.push({ t, ok: false, got: "", badLine: 0 });
            continue;
          }
          const cmp = PY.compare(got, t.expect, t.last);
          results.push({ t, ok: cmp.ok, got, badLine: cmp.badLine });
        }
      }
      btn.disabled = false;
      btn.textContent = "Verificar";
      const allOk = results.every((x) => x.ok);
      update((p) => {
        p.stats.runs++;
        p.drafts[key] = code;
        if (allOk) p.passed[key] = code;
      });
      if (allOk) {
        state = "ok";
        ctx.onSolved({ status: "ok", clean: fails === 0 && help.hints === 0 && help.lines === 0, xp: xpNow(), help: Object.assign({}, help) }, code);
        showDone();
        renderBrief();
        return;
      }
      fails++;
      ctx.onMistake(code);
      const bad = results.find((x) => !x.ok);
      const passed = results.filter((x) => x.ok).length;
      const res = $(".result", el);
      if (isSql) res.innerHTML = feedback("bad", sqlFailTitle(sqlFail), sqlReport(sqlFail), '<button class="btn ghost" data-a="skip">Pular por agora</button>');
      else res.innerHTML = feedback("bad", passed + " de " + results.length + " testes passaram", testReport(bad, s.fn), '<button class="btn ghost" data-a="skip">Pular por agora</button>');
      $('[data-a="skip"]', res).onclick = skip;
      renderBrief();
    }
    $('[data-a="run"]', el).onclick = run;
    $('[data-a="verify"]', el).onclick = verify;
    renderBrief();
    renderReset(false);
    showIdle();
  }

  function sqlFailTitle(v) {
    if (v.kind === "error" || v.kind === "check-error") return "O comando deu erro";
    if (v.kind === "require") return "Falta uma parte";
    if (v.kind === "probe") return "As regras do banco não estão certas";
    if (v.kind === "internal") return "Não deu para corrigir";
    return "Ainda não é o resultado esperado";
  }
  function sqlDiff(got, exp, label) {
    return (
      '<div class="diff sqldiff"><div><span class="codeview-label">Esperado</span>' +
      (exp ? SQ.tableHtml(exp, 12) : "<pre>(nada)</pre>") +
      '</div><div><span class="codeview-label">' +
      esc(label || "Seu resultado") +
      "</span>" +
      (got ? SQ.tableHtml(got, 12) : "<pre>(nenhuma tabela)</pre>") +
      "</div></div>"
    );
  }
  function sqlWhy(cmp) {
    if (!cmp) return "";
    if (cmp.why === "noresult") return "Seu código não mostrou nenhuma tabela de resultado. Faltou o SELECT?";
    if (cmp.why === "cols") return "O resultado tem " + cmp.got + " coluna(s), mas o esperado tem " + cmp.exp + ". Confira a lista de colunas depois do SELECT.";
    if (cmp.why === "count") return "O resultado tem " + cmp.got + " linha(s), mas o esperado tem " + cmp.exp + ". Confira o WHERE, o LIMIT ou o GROUP BY.";
    if (cmp.why === "order") return "As linhas estão certas, mas a ordem não. Confira o ORDER BY (ASC ou DESC?).";
    return "Os valores não batem. Confira as colunas escolhidas, as contas e os filtros.";
  }
  function sqlReport(v) {
    if (v.kind === "require" || v.kind === "internal") return '<p class="errline">' + esc(v.msg) + "</p>";
    if (v.kind === "error" || v.kind === "check-error")
      return (v.kind === "check-error" ? '<p class="small muted">A consulta de conferência falhou depois do seu código.</p>' : "") + '<p class="errline">' + esc(v.friendly || v.msg) + '</p><p class="mono small muted">' + esc(v.msg) + "</p>";
    if (v.kind === "probe")
      return (
        '<p class="errline">' +
        (v.expectOk ? "O banco recusou um comando que deveria aceitar:" : "O banco aceitou um comando que deveria recusar:") +
        "</p>" +
        codeView(v.probe, "", "sql") +
        (v.expectOk && v.msg ? '<p class="mono small muted">' + esc(v.msg) + "</p>" : "") +
        '<p class="small muted">' +
        (v.expectOk ? "Alguma restrição está mais rígida do que o pedido." : "Falta alguma restrição (NOT NULL, UNIQUE, CHECK ou FOREIGN KEY?).") +
        "</p>"
      );
    if (v.kind === "check") return '<p class="errline">Depois do seu código, o banco não ficou como o esperado. ' + esc(sqlWhy(v.cmp)) + "</p>" + sqlDiff(v.got, v.exp, "Seu banco ficou assim");
    let h = "";
    if (v.variant)
      h += '<p class="errline">Com os dados originais deu certo, mas a correção também testa com mais jogadores, partidas e itens, e aí não bateu. Parece que a resposta foi escrita na mão em vez de usar a condição pedida.</p><p class="small muted">Resultado com os dados extras:</p>';
    else h += '<p class="errline">' + esc(sqlWhy(v.cmp)) + "</p>";
    return h + sqlDiff(v.got, v.exp);
  }

  function testReport(r, fn) {
    const t = r.t;
    const what =
      t.inputs && t.inputs.length
        ? "Teste digitando: " + t.inputs.join(", ")
        : t.call
          ? "Teste chamando: " + t.call.split("\n")[0].replace(/^print\((.*)\)$/, "$1") + (t.call.split("\n").length > 1 ? " (e outros)" : "")
          : t.replace
            ? "Teste com outros valores no lugar dos originais"
            : "Teste do programa";
    if (r.errText)
      return '<p class="small muted">' + esc(what) + '</p><p class="errline">' + esc(r.errText) + "</p>" + (r.errRaw ? '<p class="mono small muted">' + esc(r.errRaw) + "</p>" : "");
    const got = PY.splitLines(r.got || "");
    const exp = PY.splitLines(t.expect);
    const shown = t.last ? got.slice(-exp.length) : got;
    let h = '<p class="small muted">' + esc(what) + "</p>";
    if (fn && got.includes("None")) h += '<p class="errline">Apareceu None: a função não está devolvendo nada. Use return em vez de print dentro dela.</p>';
    if (!got.length) h += '<p class="errline">Nada apareceu na tela neste teste. Faltou um print' + (fn ? " ou um return" : "") + "?</p>";
    h +=
      '<div class="diff"><div><span class="codeview-label">Esperado</span><pre>' +
      esc(exp.join("\n")) +
      '</pre></div><div><span class="codeview-label">Seu programa mostrou' +
      (t.last ? " (final)" : "") +
      "</span><pre>" +
      (shown.length ? shown.map((l, i) => (i === r.badLine ? '<span class="bad">' + esc(l) + "</span>" : esc(l))).join("\n") : "(nada)") +
      "</pre></div></div>";
    return h + '<p class="small muted">A comparação ignora espaços extras e acentos, mas o texto e os números precisam bater.</p>';
  }

  const STEP_RENDER = { explain: stepExplain, quiz: stepQuiz, fill: stepFill, order: stepOrder, code: stepCode };

  /* ================= Tela: lição ================= */
  function viewLesson(id) {
    const review = id === "revisao";
    const lref = review ? null : LESSON_BY_ID[id];
    if (!review && (!lref || !lessonUnlocked(P, id))) {
      shell(
        "trilha",
        '<div class="wrap page narrowpage"><div class="panel"><h1 class="h2">' +
          "Lição não encontrada" +
          '</h1><p class="muted">' +
          "Confira o endereço." +
          '</p><p><a href="#/trilha" class="btn primary">Voltar à trilha</a></p></div></div>'
      );
      return;
    }
    let items;
    if (review)
      items = P.review
        .map((k) => {
          const f = findStep(k);
          return f && f.step.kind !== "explain" ? { key: k, step: f.step, ref: f.ref, index: f.index } : null;
        })
        .filter(Boolean)
        .slice(0, 12);
    else items = lref.lesson.steps.map((step, index) => ({ key: stepKey(id, index), step, ref: lref, index }));

    if (review && !items.length) {
      shell(
        "revisao",
        '<div class="wrap page narrowpage"><div class="panel"><h1 class="h2">Nada para revisar</h1><p class="muted">Quando você errar, pular ou pedir a resposta de um exercício, ele aparece aqui.</p><p><a href="#/revisao" class="btn primary">Voltar</a></p></div></div>'
      );
      return;
    }

    let pos = 0;
    let mistakes = 0;
    if (!review) {
      if (P.current && P.current.lessonId === id && !P.lessons[id]) {
        pos = Math.min(P.current.step, items.length - 1);
        mistakes = P.current.mistakes || 0;
      } else if (!P.lessons[id]) update((p) => (p.current = { lessonId: id, step: 0, mistakes: 0 }));
    }
    let revealed = 0;
    let gained = 0;
    const results = {};
    const mistakeOn = new Set();
    const title = review ? "Treino de revisão" : lref.module.title + " · " + lref.lesson.title;

    const main = shell(
      review ? "revisao" : "trilha",
      '<div class="player"><div class="player-top wrap"><a class="btn ghost tiny" href="' +
        (review ? "#/revisao" : "#/trilha") +
        '">✕ Sair</a><div class="player-title"><span>' +
        esc(title) +
        '</span><span class="mono small muted" id="pcount"></span></div><span class="player-xp mono small" id="pxp">+0 XP</span></div>' +
        '<div class="segments wrap" id="segs"></div><div class="wrap player-body" id="pbody"></div></div>'
    );
    const player = $(".player", main);

    function record(item, fnUpdate) {
      update((p) => {
        const a = p.answers[item.key] || { kind: item.step.kind, tries: 0, wrong: [], status: null, answer: null };
        fnUpdate(a, p);
        p.answers[item.key] = a;
      });
    }

    function renderStep() {
      const item = items[pos];
      $("#pcount").textContent = pos + 1 + "/" + items.length;
      $("#pxp").textContent = "+" + gained + " XP";
      $("#segs").innerHTML = items.map((_, i) => "<i class=\"" + (i < pos ? results[i] || "ok" : i === pos ? "cur" : "") + '"></i>').join("");
      player.classList.toggle("wide", item.step.kind === "code");
      const lang = item.ref.module.course === "bd" ? "sql" : "py";
      CUR_LANG = lang;
      const body = $("#pbody");
      body.innerHTML = (review ? '<p class="eyebrow">Revisão · ' + esc(item.ref.module.title + " · " + item.ref.lesson.title) + "</p>" : "") + '<div class="step-host"></div>';
      const ctx = {
        step: item.step,
        key: item.key,
        ref: item.ref,
        index: item.index,
        lang,
        onMistake: (answer) => {
          record(item, (a) => {
            a.tries++;
            if (answer != null) {
              a.wrong.push(String(answer).slice(0, 4000));
              if (a.wrong.length > 4) a.wrong.shift();
            }
          });
          if (!mistakeOn.has(pos)) {
            mistakeOn.add(pos);
            mistakes++;
            results[pos] = "bad";
            update((p) => {
              if (!p.review.includes(item.key)) p.review.push(item.key);
              if (!review && p.current && p.current.lessonId === id) p.current.mistakes = mistakes;
            });
          }
        },
        onSolved: (o, answer) => {
          const kind = item.step.kind;
          const had = mistakeOn.has(pos);
          if (o.status !== "ok") revealed++;
          results[pos] = o.status === "ok" ? (had ? "bad" : "ok") : o.status === "skipped" ? "skip" : "bad";
          let xp = 0;
          update(
            (p) => {
              const prev = p.steps[item.key];
              if (review) {
                if (o.status === "ok") {
                  xp = 4;
                  p.review = p.review.filter((x) => x !== item.key);
                  p.stats.reviewed++;
                }
              } else if (!prev || prev.status !== "ok") {
                if (o.status === "ok") xp = had ? Math.min(XP.retry, o.xp != null ? o.xp : XP.retry) : o.xp != null ? o.xp : XP[kind];
                if (kind === "code" && o.status === "ok" && o.clean) p.stats.codeClean++;
                p.steps[item.key] = { xp: ((prev && prev.xp) || 0) + xp, status: o.status };
              }
              if (o.status !== "ok" && !p.review.includes(item.key)) p.review.push(item.key);
              p.xp += xp;
              if (kind !== "explain") {
                const a = p.answers[item.key] || { kind, tries: 0, wrong: [], status: null, answer: null };
                if (o.status === "ok") a.tries++;
                a.status = o.status;
                if (answer != null) a.answer = String(answer).slice(0, 6000);
                if (o.help) a.help = o.help;
                a.at = Date.now();
                p.answers[item.key] = a;
              }
            },
            { activity: true }
          );
          gained += xp;
          $("#pxp").textContent = "+" + gained + " XP";
        },
        onNext: next,
      };
      STEP_RENDER[item.step.kind]($(".step-host", body), ctx);
      window.scrollTo(0, 0);
    }

    function next() {
      if (pos + 1 < items.length) {
        pos++;
        if (!review) update((p) => (p.current = { lessonId: id, step: pos, mistakes }));
        renderStep();
      } else finish();
    }

    function finish() {
      let st = 0;
      let bonus = 0;
      let first = false;
      if (!review) {
        st = starsFor(mistakes, revealed);
        update(
          (p) => {
            const prev = p.lessons[id];
            first = !prev;
            if (first) bonus = XP.lesson + st * XP.star;
            else if (st > prev.stars) bonus = (st - prev.stars) * XP.star;
            if (st === 3 && (!prev || prev.stars < 3)) p.stats.perfect++;
            p.lessons[id] = { stars: Math.max(st, (prev && prev.stars) || 0), at: Date.now(), mistakes: prev ? Math.min(prev.mistakes, mistakes) : mistakes };
            p.xp += bonus;
            p.current = null;
          },
          { activity: true }
        );
      }
      if (st === 3 || first) confetti();
      let nextRef = review ? null : LESSONS[lref.order + 1];
      if (nextRef && nextRef.course !== lref.course) nextRef = null;
      const fm = focusMods();
      if (nextRef && fm && fm.length && FOCUS && FOCUS.strict && !fm.includes(nextRef.module.id)) nextRef = null;
      let h = '<div class="wrap page narrowpage"><div class="panel finish">';
      h += '<p class="eyebrow">' + (review ? "Revisão concluída" : "Lição concluída") + '</p><h1 class="h1">' + esc(review ? "Treino feito" : lref.lesson.title) + "</h1>";
      if (!review) h += stars(st, 3, "lg");
      h +=
        '<div class="finish-stats"><div><b>+' +
        (gained + bonus) +
        "</b><span>XP</span></div><div><b>" +
        items.length +
        "</b><span>etapas</span></div><div><b>" +
        mistakes +
        "</b><span>" +
        (mistakes === 1 ? "erro" : "erros") +
        "</span></div></div>";
      h +=
        '<p class="muted">' +
        (review
          ? "Os exercícios que você acertou saíram da lista de revisão."
          : st === 3
            ? "Sem nenhum erro. Mandou bem."
            : "Os exercícios em que você errou foram para a Revisão. Refazer depois ajuda a fixar.") +
        "</p><div class=\"row center\">";
      if (nextRef)
        h +=
          '<a href="#/licao/' +
          nextRef.lesson.id +
          '" class="btn primary lg">' +
          (nextRef.module.id === lref.module.id ? "Próxima lição" : "Próximo módulo: " + esc(nextRef.module.title)) +
          "</a>";
      h += '<a href="#/trilha" class="btn ghost lg">Voltar à trilha</a><button class="btn ghost lg" id="finishReport">Baixar relatório</button></div></div></div>';
      $("#main").innerHTML = h;
      $("#finishReport").onclick = downloadReport;
      window.scrollTo(0, 0);
    }

    renderStep();
  }

  /* ================= Tela: revisão ================= */
  const KIND = { quiz: "Pergunta", fill: "Lacunas", order: "Montar código", code: "Código" };
  /** <option>s dos módulos, separados por disciplina */
  function moduleOptions(selected) {
    return COURSES.map(
      (c) =>
        '<optgroup label="' +
        esc(c.name) +
        '">' +
        modulesOf(c.id)
          .map((m, n) => '<option value="' + m.id + '"' + (m.id === selected ? " selected" : "") + ">" + pad2(n + 1) + " · " + esc(m.title) + "</option>")
          .join("") +
        "</optgroup>"
    ).join("");
  }
  function viewRevisao() {
    const pending = P.review.map(findStep).filter((x) => x && x.step.kind !== "explain");
    const started = MODULES.filter((m) => m.lessons.some((l) => P.lessons[l.id]));
    const fm = focusMods();
    let mod = fm ? fm[0] : (started[started.length - 1] || modulesOf(P.course || "py")[0] || MODULES[0]).id;
    let i = 0;
    let flipped = false;
    let h = '<div class="wrap page"><h1 class="h1">Revisão</h1><p class="lead muted">Relembrar é o que faz o conteúdo ficar. Refaça o que você errou e passe pelos cartões.</p>';
    h +=
      '<section class="panel review-box"><div class="review-head"><div><p class="eyebrow">Treino de erros</p><h2 class="h2">' +
      (pending.length ? pending.length + " exercício" + (pending.length > 1 ? "s" : "") + " para refazer" : "Nada pendente") +
      '</h2><p class="muted small">' +
      (pending.length ? "Tudo que você errou, pulou ou pediu a resposta. Acertou na revisão, sai da lista e vale XP." : "Quando você errar algo numa lição, ele vem para cá.") +
      "</p></div>" +
      (pending.length ? '<a href="#/licao/revisao" class="btn primary lg">Começar treino</a>' : "") +
      "</div>";
    if (pending.length)
      h +=
        '<ul class="review-list">' +
        pending
          .slice(0, 12)
          .map(
            (f) =>
              '<li><span class="kind kind-' +
              f.step.kind +
              '">' +
              KIND[f.step.kind] +
              "</span><span>" +
              esc((f.ref.module.course === "bd" ? "BD · " : "Python · ") + f.ref.module.title + " · " + f.ref.lesson.title) +
              "</span></li>"
          )
          .join("") +
        (pending.length > 12 ? '<li class="muted small">e mais ' + (pending.length - 12) + " (o treino pega 12 por vez)</li>" : "") +
        "</ul>";
    h += "</section>";
    h +=
      '<section class="cards-section"><div class="cards-head"><div><p class="eyebrow">Cartões de memória</p><h2 class="h2">Relembre os conceitos</h2></div><label class="field inline"><span>Módulo</span><select id="modSel">' +
      moduleOptions(mod) +
      '</select></label></div><div id="flashHost"></div><div class="row center"><button class="btn ghost" id="prevCard">← Anterior</button><button class="btn" id="nextCard">Próximo →</button></div></section></div>';
    const main = shell("revisao", h);
    function renderCard() {
      const m = MODULE_BY_ID[mod];
      CUR_LANG = m.course === "bd" ? "sql" : "py";
      const c = m.cards[i % m.cards.length];
      $("#flashHost", main).innerHTML =
        '<button class="flash acc-' +
        m.accent +
        (flipped ? " flipped" : "") +
        '" id="flash"><span class="flash-count mono small">' +
        ((i % m.cards.length) + 1) +
        "/" +
        m.cards.length +
        "</span>" +
        (flipped
          ? '<span class="flash-back"><span>' + esc(c.back) + "</span>" + (c.code ? codeView(c.code) : "") + "</span>"
          : '<span class="flash-front">' + esc(c.front) + "</span>") +
        '<span class="flash-hint small muted">' +
        (flipped ? "toque para voltar" : "pense na resposta e toque para conferir") +
        "</span></button>";
      $("#flash", main).onclick = () => ((flipped = !flipped), renderCard());
    }
    function goCard(d) {
      const m = MODULE_BY_ID[mod];
      flipped = false;
      i = (i + d + m.cards.length) % m.cards.length;
      update((p) => p.stats.cards++);
      renderCard();
    }
    $("#modSel", main).onchange = (e) => ((mod = e.target.value), (i = 0), (flipped = false), renderCard());
    $("#prevCard", main).onclick = () => goCard(-1);
    $("#nextCard", main).onclick = () => goCard(1);
    renderCard();
  }

  /* ================= Tela: laboratório ================= */
  const EXAMPLES = [
    { name: "Boas-vindas", code: 'nick = input("Nick: ")\nprint("Bem-vindo,", nick)\n' },
    {
      name: "Dado de RPG (random)",
      code: 'import random\n\nrolagem = random.randint(1, 20)\nprint("Voce rolou", rolagem)\nif rolagem == 20:\n    print("CRITICO!")\nelif rolagem == 1:\n    print("Falha critica...")\n',
    },
    {
      name: "Adivinhe o número",
      code: 'import random\n\nsecreto = random.randint(1, 50)\ntentativas = 0\nchute = -1\nwhile chute != secreto:\n    chute = int(input("Chute (1 a 50): "))\n    tentativas = tentativas + 1\n    if chute < secreto:\n        print("Mais alto")\n    elif chute > secreto:\n        print("Mais baixo")\nprint("Acertou em", tentativas, "tentativas!")\n',
    },
    {
      name: "Inventário",
      code: 'inventario = ["espada", "escudo"]\nwhile True:\n    item = input("Item para guardar (vazio para sair): ")\n    if item == "":\n        break\n    inventario.append(item)\n\nfor i in range(len(inventario)):\n    print(i + 1, "-", inventario[i])\n',
    },
    {
      name: "Barra de vida",
      code: 'def barra(vida, maximo):\n    cheios = vida * 20 // maximo\n    return "[" + "#" * cheios + "-" * (20 - cheios) + "] " + str(vida) + "/" + str(maximo)\n\nfor vida in [100, 75, 40, 10, 0]:\n    print(barra(vida, 100))\n',
    },
  ];
  const SQL_EXAMPLES = [
    { name: "Todos os jogadores", code: "SELECT * FROM jogadores;\n" },
    { name: "Ranking por pontos", code: "SELECT nick, classe, pontos\nFROM jogadores\nORDER BY pontos DESC\nLIMIT 5;\n" },
    {
      name: "Jogador e guilda (JOIN)",
      code: "SELECT j.nick, g.nome AS guilda\nFROM jogadores j\nLEFT JOIN guildas g ON g.id = j.guilda_id\nORDER BY g.nome;\n",
    },
    { name: "Jogadores por classe (gráfico)", code: "SELECT classe, COUNT(*) AS total\nFROM jogadores\nGROUP BY classe\nORDER BY total DESC;\n" },
    {
      name: "Estatística das partidas",
      code: "SELECT COUNT(*) AS partidas,\n       ROUND(AVG(abates), 2) AS media_abates,\n       MIN(abates) AS minimo,\n       MAX(abates) AS maximo\nFROM partidas;\n",
    },
    {
      name: "Criar uma tabela nova",
      code: "CREATE TABLE missoes (\n  id INTEGER PRIMARY KEY,\n  nome TEXT NOT NULL,\n  recompensa INTEGER CHECK (recompensa > 0)\n);\nINSERT INTO missoes (nome, recompensa) VALUES ('Caverna do Dragao', 500);\nSELECT * FROM missoes;\n",
    },
    { name: "Criar uma view", code: "CREATE VIEW ranking AS\nSELECT nick, pontos FROM jogadores ORDER BY pontos DESC;\n\nSELECT * FROM ranking LIMIT 3;\n" },
  ];
  let labTab = null;
  let LAB_DB = null;
  let labDirty = false;
  function viewLab() {
    if (!labTab) labTab = P.course === "bd" ? "sql" : "py";
    const sql = labTab === "sql";
    CUR_LANG = sql ? "sql" : "py";
    const list = sql ? SQL_EXAMPLES : EXAMPLES;
    let h =
      '<div class="wrap page"><div class="lab-head"><div><h1 class="h1">Laboratório</h1><p class="muted">' +
      (sql
        ? "Sem correção e sem nota. Consulte, crie tabelas, insira, apague. O banco é seu: se estragar, é só resetar."
        : "Sem correção e sem nota. Teste ideias, refaça exemplos e invente programas. O código fica salvo e vai junto no relatório.") +
      '</p></div><div class="course-tabs small-tabs" role="tablist">' +
      COURSES.map((c) => '<button class="course-tab' + ((c.lang === "sql") === sql ? " on" : "") + '" data-tab="' + c.lang + '" role="tab">' + (c.lang === "sql" ? "SQL" : "Python") + "</button>").join("") +
      "</div></div>";
    h +=
      '<div class="row lab-tools"><label class="field inline"><span>Carregar exemplo</span><select id="exSel"><option value="">Escolha...</option>' +
      list.map((x, i) => '<option value="' + i + '">' + esc(x.name) + "</option>").join("") +
      "</select></label>";
    if (sql)
      h +=
        '<span class="grow"></span><button class="btn ghost small" id="bkDown">Baixar backup</button><label class="btn ghost small filebtn">Restaurar backup<input type="file" id="bkUp" accept=".sql,text/plain,application/sql" hidden></label><span id="resetDbArea"></span>';
    h += "</div>";
    h +=
      '<div class="lab-grid' +
      (sql ? " lab-sql" : "") +
      '"><div class="lab-col"><div id="labEd"></div><div class="row toolbar"><button class="btn run" id="labRun">▶ Rodar</button><span class="small muted">Atalho: Ctrl + Enter</span></div>' +
      (sql ? '<details class="schema-box" open><summary>Tabelas do banco</summary><div id="labSchema" class="schema-slot"><span class="small muted">Carregando...</span></div></details>' : "") +
      '</div><div id="labCon"></div></div>';
    if (sql)
      h +=
        '<p class="small muted lab-note">O banco do laboratório fica na memória: ao recarregar a página ele volta ao original. Para guardar o que fez, use <b>Baixar backup</b> e depois <b>Restaurar backup</b>.</p>';
    h += "</div>";
    const main = shell("lab", h);
    $$("[data-tab]", main).forEach((b) => (b.onclick = () => ((labTab = b.dataset.tab), viewLab())));
    const saved = sql ? P.labSql : P.lab;
    let t = null;
    const ed = createEditor($("#labEd", main), saved != null ? saved : list[0].code, {
      minLines: sql ? 12 : 16,
      lang: CUR_LANG,
      onRun: run,
      onChange: (v) => {
        clearTimeout(t);
        t = setTimeout(() => update((p) => (sql ? (p.labSql = v) : (p.lab = v))), 1200);
      },
    });
    let con;
    function refreshSchema() {
      const s = $("#labSchema", main);
      if (s && LAB_DB) s.innerHTML = schemaHtml(LAB_DB);
    }
    if (sql) {
      con = createSqlConsole($("#labCon", main), {
        getDb: () => LAB_DB,
        chartButton: true,
        onRan: (r) => {
          if (r.items.some((it) => it.kind !== "SELECT" && it.kind !== "WITH" && it.kind !== "PRAGMA")) labDirty = true;
          refreshSchema();
        },
      });
      SQ.ensure().then((ok) => {
        if (!ok) return;
        if (!LAB_DB) LAB_DB = SQ.open(["arena"]);
        refreshSchema();
      });
      const renderResetDb = (confirm) => {
        const a = $("#resetDbArea", main);
        a.innerHTML = confirm
          ? '<span class="small muted">Voltar o banco ao original?</span> <button class="btn tiny danger" id="rdYes">Sim</button> <button class="btn tiny ghost" id="rdNo">Não</button>'
          : '<button class="btn ghost small" id="rdAsk">Resetar banco</button>';
        if (confirm) {
          $("#rdYes", a).onclick = () => {
            if (LAB_DB) LAB_DB.close();
            LAB_DB = SQ.open(["arena"]);
            labDirty = false;
            refreshSchema();
            con.clear();
            toast("info", "Banco resetado", "As tabelas voltaram ao original.");
            renderResetDb(false);
          };
          $("#rdNo", a).onclick = () => renderResetDb(false);
        } else $("#rdAsk", a).onclick = () => renderResetDb(true);
      };
      renderResetDb(false);
      $("#bkDown", main).onclick = async () => {
        if (!(await SQ.ensure()) || !LAB_DB) return;
        const d = new Date();
        downloadFile("backup-arena-" + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(d.getHours()) + pad2(d.getMinutes()) + ".sql", SQ.dump(LAB_DB), "application/sql");
        labDirty = false;
        toast("info", "Backup baixado", "É um arquivo .sql com a estrutura e os dados. Abra num editor de texto para ver.");
      };
      $("#bkUp", main).onchange = (e) => {
        const f = e.target.files[0];
        e.target.value = "";
        if (!f) return;
        const r = new FileReader();
        r.onload = async () => {
          if (!(await SQ.ensure())) return;
          try {
            const db = SQ.fromDump(String(r.result));
            if (LAB_DB) LAB_DB.close();
            LAB_DB = db;
            labDirty = false;
            refreshSchema();
            con.clear();
            toast("info", "Backup restaurado", "O banco agora está como no arquivo " + f.name + ".");
          } catch (err) {
            toast("error", "Não deu para restaurar", "O arquivo não é um backup SQL válido: " + (err.message || err));
          }
        };
        r.readAsText(f);
      };
    } else con = createConsole($("#labCon", main));
    function run() {
      update((p) => {
        p.stats.runs++;
        if (sql) p.labSql = ed.get();
        else p.lab = ed.get();
      });
      con.run(ed.get());
    }
    $("#labRun", main).onclick = run;
    $("#exSel", main).onchange = (e) => {
      const ex = list[Number(e.target.value)];
      if (ex) ed.set(ex.code);
      e.target.value = "";
    };
  }

  /* ================= Tela: perfil e entrega ================= */
  function viewPerfil() {
    const lv = levelInfo(P.xp);
    const totalStars = Object.values(P.lessons).reduce((a, l) => a + l.stars, 0);
    let h = '<div class="wrap page">';
    h +=
      '<section class="panel profile-head"><div class="avatar big">' +
      esc(P.name.charAt(0).toUpperCase()) +
      '</div><div class="grow"><h1 class="h1">' +
      esc(P.name) +
      '</h1><p class="muted">Nível ' +
      lv.level +
      " · " +
      lv.title +
      '</p></div><form class="turma-edit" id="turmaForm"><label class="field inline"><span>Turma</span><input id="turmaEdit" maxlength="30" list="turmaList2" value="' +
      esc(P.turma || "") +
      '" placeholder="ex.: 2º A"><datalist id="turmaList2">' +
      knownTurmas()
        .map((t) => '<option value="' + esc(t) + '">')
        .join("") +
      '</datalist></label><button class="btn ghost small">Salvar</button></form></section>';
    h +=
      '<section class="panel deliver-big"><div><p class="eyebrow">Entrega</p><h2 class="h2">Enviar para o professor</h2><p class="muted">O relatório é um arquivo com seu progresso, as respostas de cada exercício e os códigos que você escreveu. Baixe e envie do jeito que o professor pedir.</p></div><button class="btn primary lg" id="reportBig">Baixar relatório</button></section>';
    h += '<section class="statgrid">';
    [
      [P.xp, "XP total"],
      ...COURSES.map((c) => [courseDone(P, c.id) + "/" + lessonsOf(c.id).length, "lições de " + c.short]),
      [totalStars, "estrelas"],
      [P.stats.runs, "programas e consultas rodados"],
      [P.stats.codeClean, "códigos certos de primeira"],
    ].forEach((s) => (h += '<div class="stat"><b>' + s[0] + "</b><span>" + esc(s[1]) + "</span></div>"));
    h += "</section>";
    COURSES.forEach((c) => {
      const mods = modulesOf(c.id);
      const any = mods.some((m) => m.lessons.some((l) => P.lessons[l.id]));
      h += '<h2 class="h2 section">' + esc(c.name) + (any ? "" : ' <span class="muted small">ainda não começou</span>') + '</h2><div class="modbars">';
      mods.forEach((m, i) => {
        const d = m.lessons.filter((l) => P.lessons[l.id]).length;
        h +=
          '<div class="modbar acc-' +
          m.accent +
          '"><span class="mono small">' +
          pad2(i + 1) +
          '</span><span class="modbar-name">' +
          esc(m.title) +
          '</span><span class="bar"><i style="width:' +
          (d / m.lessons.length) * 100 +
          '%"></i></span><span class="mono small muted">' +
          d +
          "/" +
          m.lessons.length +
          "</span></div>";
      });
      h += "</div>";
    });
    h += '<h2 class="h2 section">Conquistas <span class="muted mono small">' + P.badges.length + "/" + BADGES.length + '</span></h2><div class="badges">';
    BADGES.forEach((b) => {
      h +=
        '<div class="badge' +
        (P.badges.includes(b.id) ? " on" : "") +
        '"><span class="badge-gem" aria-hidden="true">◆</span><div><b>' +
        esc(b.name) +
        "</b><span>" +
        esc(b.desc) +
        "</span></div></div>";
    });
    h +=
      '</div><div class="settings"><div class="panel form"><h2 class="h3">Usar em outro computador</h2><p class="small muted">O progresso fica salvo neste navegador. Em outro computador, carregue o relatório que você baixou e continue de onde parou.</p>' +
      '<label class="btn filebtn">Carregar arquivo de progresso<input type="file" id="importFile2" accept=".html,.json,text/html,application/json" hidden></label>' +
      '<button class="btn ghost" id="switchBtn">Sair</button></div>' +
      '<div class="panel form"><h2 class="h3">Recomeçar do zero</h2><p class="small muted">Apaga XP, lições, conquistas e códigos deste aluno neste computador. Não dá para desfazer.</p><div id="resetArea"></div></div></div></div>';
    const main = shell("perfil", h);
    $("#turmaForm", main).onsubmit = (e) => {
      e.preventDefault();
      const v = $("#turmaEdit", main).value.trim().slice(0, 30);
      if (!v) return toast("error", "Informe a turma");
      if (P.turma && cloudKey(P.turma) !== cloudKey(v)) CLOUD.turmaAntes = P.turma;
      update((p) => (p.turma = v));
      renderHud();
      toast("info", "Turma salva", v);
    };
    $("#reportBig", main).onclick = downloadReport;
    $("#importFile2", main).onchange = (e) => importFile(e.target.files[0], false);
    $("#switchBtn", main).onclick = logout;
    function renderReset(confirm) {
      const a = $("#resetArea", main);
      a.innerHTML = confirm
        ? '<div class="row"><button class="btn danger" id="rYes">Sim, apagar tudo</button><button class="btn ghost" id="rNo">Cancelar</button></div>'
        : '<button class="btn danger-ghost" id="rAsk">Apagar meu progresso</button>';
      if (confirm) {
        $("#rYes", a).onclick = () => {
          const name = P.name;
          const turma = P.turma;
          update((p) => Object.assign(p, emptyProgress(name), { turma }));
          toast("info", "Progresso apagado");
          viewPerfil();
        };
        $("#rNo", a).onclick = () => renderReset(false);
      } else $("#rAsk", a).onclick = () => renderReset(true);
    }
    renderReset(false);
  }

  /* ================= Relatório (arquivo para o professor) ================= */
  const STATUS_TXT = { ok: "Acertou", revealed: "Viu a resposta", skipped: "Pulou" };
  function stepLabel(step) {
    if (step.kind === "quiz") return step.question;
    if (step.kind === "fill" || step.kind === "order") return step.prompt;
    if (step.kind === "code") return step.title;
    return step.title || "";
  }
  /** Corpo do relatório, usado no arquivo e na área do professor */
  function reportBody(p) {
    const lv = levelInfo(p.xp || 0);
    const done = Object.keys(p.lessons || {}).length;
    const ans = p.answers || {};
    let codeOk = 0,
      codeTotal = 0,
      firstTry = 0,
      answered = 0;
    Object.keys(ans).forEach((k) => {
      const a = ans[k];
      if (!a.status) return;
      answered++;
      if (a.kind === "code") {
        codeTotal++;
        if (a.status === "ok") codeOk++;
      }
      if (a.status === "ok" && a.tries <= 1) firstTry++;
    });
    let h = '<div class="rep">';
    h += '<div class="rep-head"><div><div class="rep-eyebrow">Relatório de progresso · ' + SITE + "</div><h1>" + esc(p.name) + "</h1>";
    h += '<div class="rep-sub">' + (p.turma ? "Turma " + esc(p.turma) + " · " : "") + "Gerado em " + fmtDate(p.exportedAt || Date.now()) + " · Última atividade " + fmtDate(p.updated) + "</div></div></div>";
    h += '<div class="rep-stats">';
    [
      [p.xp || 0, "XP"],
      ["Nv " + lv.level, lv.title],
      ...COURSES.map((c) => [courseDone(p, c.id) + "/" + lessonsOf(c.id).length, "lições de " + c.short]),
      [answered, "exercícios respondidos"],
      [firstTry, "acertos de primeira"],
      [codeOk + "/" + codeTotal, "códigos aprovados"],
      [helpTotals(p).helps, "ajudas usadas"],
      [helpTotals(p).pastes, "tentativas de colar"],
    ].forEach((s) => (h += "<div><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>"));
    h += "</div>";
    COURSES.forEach((c) => {
    const withAny = modulesOf(c.id).filter((m) => m.lessons.some((l) => (p.lessons || {})[l.id] || l.steps.some((_, i) => ans[stepKey(l.id, i)])));
    if (withAny.length) h += '<div class="rep-course">' + esc(c.name) + "</div>";
    modulesOf(c.id).forEach((m, mi) => {
      const lessonsWith = m.lessons.filter((l) => (p.lessons || {})[l.id] || l.steps.some((_, i) => ans[stepKey(l.id, i)]));
      if (!lessonsWith.length) return;
      h += '<section class="rep-mod"><h2>' + pad2(mi + 1) + " · " + esc(m.title) + "</h2>";
      lessonsWith.forEach((l) => {
        const res = (p.lessons || {})[l.id];
        h +=
          '<div class="rep-lesson"><h3>' +
          esc(l.title) +
          ' <span class="rep-tag ' +
          (res ? "ok" : "pend") +
          '">' +
          (res ? "Concluída · " + "★".repeat(res.stars) + "☆".repeat(3 - res.stars) : "Em andamento") +
          "</span></h3>";
        l.steps.forEach((s, i) => {
          if (s.kind === "explain") return;
          const a = ans[stepKey(l.id, i)];
          if (!a) return;
          const st = a.status ? STATUS_TXT[a.status] + (a.status === "ok" ? (a.tries <= 1 ? " de primeira" : " após " + a.tries + " tentativas") : "") : "Errou, não concluiu";
          const cls = a.status === "ok" ? (a.tries <= 1 ? "ok" : "mid") : "bad";
          h += '<div class="rep-item"><div class="rep-q"><span class="rep-kind">' + (KIND[s.kind] || "") + "</span> " + esc(stepLabel(s).replace(/\*\*|`/g, "")) + ' <span class="rep-tag ' + cls + '">' + esc(st) + "</span></div>";
          if (a.answer != null && a.answer !== "(viu a resposta)")
            h += (s.kind === "code" || s.kind === "order" ? '<pre class="rep-code">' : '<div class="rep-ans">Resposta: ') + esc(a.answer) + (s.kind === "code" || s.kind === "order" ? "</pre>" : "</div>");
          const hp = (p.help || {})[stepKey(l.id, i)];
          if (s.kind === "code" && hp && (hp.hints || hp.lines || hp.pastes))
            h +=
              '<div class="rep-help">Ajudas: ' +
              (hp.hints || 0) +
              " dica(s), " +
              (hp.lines || 0) +
              " linha(s) revelada(s)" +
              (hp.pastes ? ' · <span class="rep-tag bad">tentou colar ' + hp.pastes + "x</span>" : "") +
              "</div>";
          if (a.wrong && a.wrong.length && s.kind !== "code" && s.kind !== "order")
            h += '<div class="rep-wrong">Tentativas erradas: ' + a.wrong.map(esc).join(" · ") + "</div>";
          h += "</div>";
        });
        h += "</div>";
      });
      h += "</section>";
    });
    });
    if (p.lab) h += '<section class="rep-mod"><h2>Laboratório · Python</h2><pre class="rep-code">' + esc(p.lab) + "</pre></section>";
    if (p.labSql) h += '<section class="rep-mod"><h2>Laboratório · SQL</h2><pre class="rep-code">' + esc(p.labSql) + "</pre></section>";
    return h + "</div>";
  }
  const REPORT_CSS =
    ".rep{font-family:system-ui,'Segoe UI',sans-serif;color:#e4ecf8;max-width:960px;margin:0 auto;padding:24px 16px}.rep h1{font-size:30px;margin:4px 0}.rep-eyebrow{font:600 12px monospace;letter-spacing:.1em;text-transform:uppercase;color:#2de2e6}.rep-sub{color:#8394b4;font-size:14px}.rep-stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin:18px 0}.rep-stats div{border:1px solid #27395c;border-radius:10px;padding:10px;background:#0b1120;display:flex;flex-direction:column}.rep-stats b{font-size:22px;color:#2de2e6}.rep-stats span{font-size:13px;color:#8394b4}.rep-course{margin-top:28px;font:700 13px monospace;letter-spacing:.12em;text-transform:uppercase;color:#2de2e6}.rep-mod{margin-top:22px}.rep-mod h2{font-size:20px;border-bottom:1px solid #27395c;padding-bottom:6px}.rep-lesson{margin:12px 0 0 0;padding:12px;border:1px solid #1b2840;border-radius:10px;background:#0b1120}.rep-lesson h3{font-size:16px;margin:0 0 8px}.rep-item{padding:8px 0;border-top:1px dashed #1b2840}.rep-q{font-size:14px}.rep-kind{font:12px monospace;color:#8394b4;border:1px solid #27395c;border-radius:5px;padding:0 6px}.rep-tag{font:600 12px monospace;border-radius:5px;padding:1px 7px;margin-left:4px;white-space:nowrap}.rep-tag.ok{background:rgba(63,240,164,.15);color:#3ff0a4}.rep-tag.mid{background:rgba(255,209,102,.15);color:#ffd166}.rep-tag.bad{background:rgba(255,85,119,.15);color:#ff5577}.rep-tag.pend{background:rgba(131,148,180,.15);color:#8394b4}.rep-ans{font:13px monospace;color:#a8f07a;margin-top:4px}.rep-wrong{font:12px monospace;color:#ff8fa6;margin-top:2px}.rep-help{font:12px monospace;color:#8394b4;margin-top:4px}.rep-code{font:13px/1.5 'JetBrains Mono',Consolas,monospace;background:#060a14;border:1px solid #27395c;border-radius:8px;padding:10px;margin:6px 0 0;overflow-x:auto;white-space:pre;color:#e4ecf8}";

  function buildReportFile(p) {
    const data = JSON.stringify(Object.assign({}, p, { exportedAt: Date.now() })).replace(/</g, "\\u003c");
    return (
      '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Relatório · ' +
      esc(p.name) +
      " · " +
      SITE +
      "</title><style>body{margin:0;background:#05070d}" +
      REPORT_CSS +
      '</style></head><body>' +
      reportBody(Object.assign({}, p, { exportedAt: Date.now() })) +
      '<script type="application/json" id="byteabyte-data">' +
      data +
      "</script></body></html>"
    );
  }
  function downloadReport() {
    if (!P) return;
    update((p) => (p.lastExport = Date.now()));
    const d = new Date();
    downloadFile("relatorio-" + slug(P.name) + "-" + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + pad2(d.getHours()) + pad2(d.getMinutes()) + ".html", buildReportFile(P));
    toast("info", "Relatório baixado", "Envie o arquivo para o professor.");
  }
  function parseReport(text) {
    let json = null;
    const m = text.match(/<script type="application\/json" id="byteabyte-data">([\s\S]*?)<\/script>/);
    if (m) json = m[1];
    else if (/^\s*\{/.test(text)) json = text;
    if (!json) throw new Error("Este arquivo não é um relatório do " + SITE + ".");
    const o = JSON.parse(json);
    if (!o || o.app !== "byte-a-byte" || typeof o.name !== "string") throw new Error("Este arquivo não é um relatório do " + SITE + ".");
    return normalize(o, o.name);
  }
  function importFile(file, fromWelcome) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const p = parseReport(String(reader.result));
        const key = profileKey(p.name) || p.name;
        const existing = DB.profiles[key];
        if (existing && existing.updated > p.updated && !fromWelcome) {
          toast("info", "Seu progresso aqui é mais recente", "O arquivo é mais antigo do que o que já está salvo. Nada foi trocado.");
          return;
        }
        DB.profiles[key] = Object.assign(p, { name: key });
        DB.current = key;
        P = DB.profiles[key];
        saveDB();
        cloudSaveSoon(500);
        toast("info", "Progresso carregado", "Bem-vindo de volta, " + key + ".");
        go("#/trilha");
      } catch (e) {
        toast("error", "Não deu para carregar", e.message || "Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  /* ================= Tela: professor ================= */
  let TEACHER = [];
  let TFILTER = "";
  const FG = { course: "py", mods: [], turma: "", strict: true };
  function focusGenHtml() {
    let h =
      '<section class="panel focus-gen"><div class="focus-gen-head"><div><p class="eyebrow">Foco da aula</p><h2 class="h2">Gerar link para a turma</h2><p class="muted small">Escolha de 1 a 3 módulos e passe o link para os alunos (no quadro ou no grupo da turma). Quem abrir pelo link vê esses módulos em destaque e a turma já vem preenchida. Vale só no dia de hoje.</p></div></div>';
    h +=
      '<div class="row wrap-row"><label class="field inline"><span>Disciplina</span><select id="fgCourse">' +
      COURSES.map((c) => '<option value="' + c.id + '"' + (c.id === FG.course ? " selected" : "") + ">" + esc(c.name) + "</option>").join("") +
      '</select></label><label class="field inline"><span>Turma</span><input id="fgTurma" maxlength="30" placeholder="ex.: 2º A" value="' +
      esc(FG.turma) +
      '"></label></div>';
    h += '<div class="fg-mods">';
    modulesOf(FG.course).forEach((m, i) => {
      const on = FG.mods.includes(m.id);
      h +=
        '<label class="fg-mod acc-' +
        m.accent +
        (on ? " on" : "") +
        '"><input type="checkbox" value="' +
        m.id +
        '"' +
        (on ? " checked" : "") +
        (!on && FG.mods.length >= 3 ? " disabled" : "") +
        '><span class="mono small">' +
        pad2(i + 1) +
        "</span><span>" +
        esc(m.title) +
        '</span><span class="muted small">' +
        m.lessons.length +
        (m.lessons.length === 1 ? " lição" : " lições") +
        "</span></label>";
    });
    h += "</div>";
    h +=
      '<label class="check"><input type="checkbox" id="fgStrict"' +
      (FG.strict ? " checked" : "") +
      '> <span>Mostrar só esses módulos (esconde o resto da trilha hoje)</span></label>';
    h += '<div class="fg-out" id="fgOut"></div>';
    if (focusMods())
      h +=
        '<p class="small muted fg-active">Este navegador está com foco ativo hoje: ' +
        esc(focusMods().map((id) => MODULE_BY_ID[id].title).join(", ")) +
        '. <button class="btn tiny ghost" id="fgClear">Remover foco deste navegador</button></p>';
    return h + "</section>";
  }
  function focusLink() {
    if (!FG.mods.length) return "";
    const q = new URLSearchParams();
    q.set("foco", FG.mods.join(","));
    if (FG.turma.trim()) q.set("turma", FG.turma.trim());
    if (FG.strict) q.set("so", "1");
    return location.origin + location.pathname + "?" + q.toString();
  }
  function bindFocusGen() {
    const out = $("#fgOut");
    function renderOut() {
      const link = focusLink();
      if (!link) {
        out.innerHTML = '<p class="small muted">Marque pelo menos um módulo para gerar o link.</p>';
        return;
      }
      out.innerHTML =
        '<div class="row fg-link"><input readonly id="fgLink" value="' +
        esc(link) +
        '" aria-label="Link do foco da aula"><button class="btn primary" id="fgCopy">Copiar link</button><a class="btn ghost" href="' +
        esc(link) +
        '" target="_blank" rel="noopener">Testar</a></div>' +
        (location.protocol === "file:" ? '<p class="form-error">Você abriu o site direto do arquivo. O link só funciona para os alunos com o site publicado (no Vercel).</p>' : "");
      $("#fgCopy").onclick = async () => {
        const inp = $("#fgLink");
        try {
          await navigator.clipboard.writeText(link);
        } catch (e) {
          inp.select();
          try {
            document.execCommand("copy");
          } catch (e2) {}
        }
        toast("info", "Link copiado", "Cole no quadro ou no grupo da turma.");
      };
      $("#fgLink").onclick = (e) => e.target.select();
    }
    if ($("#fgClear"))
      $("#fgClear").onclick = () => {
        FOCUS = null;
        try {
          localStorage.removeItem(FOCUS_KEY);
        } catch (e) {}
        toast("info", "Foco removido", "Este navegador volta a mostrar a trilha completa.");
        viewProfessor();
      };
    $("#fgCourse").onchange = (e) => {
      FG.course = e.target.value;
      FG.mods = [];
      viewProfessor();
    };
    $("#fgTurma").oninput = (e) => {
      FG.turma = e.target.value;
      renderOut();
    };
    $("#fgStrict").onchange = (e) => {
      FG.strict = e.target.checked;
      renderOut();
    };
    $$(".fg-mod input").forEach(
      (c) =>
        (c.onchange = () => {
          if (c.checked) {
            if (!FG.mods.includes(c.value)) FG.mods.push(c.value);
          } else FG.mods = FG.mods.filter((x) => x !== c.value);
          const order = modulesOf(FG.course).map((m) => m.id);
          FG.mods.sort((a, b) => order.indexOf(a) - order.indexOf(b));
          $$(".fg-mod").forEach((l) => {
            const inp = $("input", l);
            l.classList.toggle("on", inp.checked);
            inp.disabled = !inp.checked && FG.mods.length >= 3;
          });
          renderOut();
        })
    );
    renderOut();
  }
  const PASS_KEY = "byteabyte:prof";
  let TPASS = (() => {
    try {
      return sessionStorage.getItem(PASS_KEY) || "";
    } catch (e) {
      return "";
    }
  })();
  let TTURMAS = null;
  let TSRC = null;
  let TLOADING = false;
  async function profApi(qs, method) {
    const r = await fetch("api/professor" + (qs || ""), { method: method || "GET", headers: { "x-senha": TPASS }, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401) {
      TPASS = "";
      try {
        sessionStorage.removeItem(PASS_KEY);
      } catch (e) {}
      throw new Error("Senha incorreta.");
    }
    if (!r.ok) throw new Error(j.erro || "Erro " + r.status);
    return j;
  }
  async function loadTurmas() {
    TLOADING = true;
    if (!TTURMAS && location.hash.indexOf("#/professor") === 0) app().innerHTML = professorLock();
    try {
      TTURMAS = (await profApi("")).turmas;
    } catch (e) {
      TTURMAS = null;
      toast("error", "Não deu para abrir as turmas", e.message);
    }
    TLOADING = false;
    viewProfessor();
  }
  async function loadTurmaOnline(t) {
    TLOADING = true;
    try {
      const j = await profApi("?turma=" + encodeURIComponent(t.nome));
      TEACHER = j.alunos.map((a) => normalize(a, a.name)).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      TSRC = { nome: t.nome, at: Date.now() };
      TFILTER = "";
    } catch (e) {
      toast("error", "Não deu para abrir a turma", e.message);
    }
    TLOADING = false;
    viewProfessor();
  }
  function onlineHtml() {
    if (!CLOUD.online) return "";
    let h = '<section class="panel online-box"><div class="online-head"><div><p class="eyebrow">Turmas online</p><h2 class="h2">Progresso salvo automaticamente</h2></div>';
    if (!CLOUD.professor)
      return (
        h +
        '</div><p class="muted small">O banco está conectado, mas falta criar a senha do professor: na Vercel, em Settings → Environment Variables, crie <code class="ic">PROFESSOR_SENHA</code> e publique de novo (Redeploy). O passo a passo está no LEIA-ME.</p></section>'
      );
    if (!TPASS)
      return (
        h +
        '</div><form class="row wrap-row" id="passForm"><label class="field inline"><span>Senha do professor</span><input type="password" id="passIn" autocomplete="current-password" required></label><button class="btn primary">Entrar</button></form></section>'
      );
    h += '<div class="row"><button class="btn ghost small" id="tRefresh">Atualizar</button><button class="btn ghost small" id="tLogout">Sair</button></div></div>';
    if (TLOADING && !TTURMAS) return h + '<p class="muted small">Carregando...</p></section>';
    if (!TTURMAS) return h + "</section>";
    if (!TTURMAS.length) return h + '<p class="muted small">Nenhum aluno salvou progresso ainda. Assim que alguém entrar com nome e turma, a turma aparece aqui.</p></section>';
    h +=
      '<div class="turma-list">' +
      TTURMAS.map(
        (t, i) =>
          '<button class="turma-btn' +
          (TSRC && cloudKey(TSRC.nome) === cloudKey(t.nome) ? " on" : "") +
          '" data-turma="' +
          i +
          '"><b>' +
          esc(t.nome) +
          "</b><span>" +
          t.alunos +
          (t.alunos === 1 ? " aluno" : " alunos") +
          "</span></button>"
      ).join("") +
      "</div>";
    if (TSRC) h += '<p class="small muted">Mostrando a turma <b>' + esc(TSRC.nome) + "</b> · atualizado às " + new Date(TSRC.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "</p>";
    return h + "</section>";
  }
  function bindOnline() {
    if (!CLOUD.online) return;
    const pf = $("#passForm");
    if (pf)
      pf.onsubmit = (e) => {
        e.preventDefault();
        TPASS = $("#passIn").value;
        try {
          sessionStorage.setItem(PASS_KEY, TPASS);
        } catch (err) {}
        loadTurmas();
      };
    if ($("#tRefresh"))
      $("#tRefresh").onclick = () => {
        if (TSRC) {
          const nome = TSRC.nome;
          loadTurmas().then(() => loadTurmaOnline({ nome }));
        } else loadTurmas();
      };
    if ($("#tLogout"))
      $("#tLogout").onclick = () => {
        TPASS = "";
        TTURMAS = null;
        if (TSRC) TEACHER = [];
        TSRC = null;
        try {
          sessionStorage.removeItem(PASS_KEY);
        } catch (e) {}
        viewProfessor();
      };
    $$("[data-turma]").forEach((b) => (b.onclick = () => loadTurmaOnline(TTURMAS[Number(b.dataset.turma)])));
    if (TPASS && CLOUD.professor && !TTURMAS && !TLOADING) loadTurmas();
  }
  /** Com o banco ligado, a área do professor inteira fica atrás da senha */
  function professorLock() {
    const head =
      '<div class="auth"><span class="brand auth-brand"><span class="brand-mark">&gt;_</span><span class="brand-name">' + SITE + '</span></span><div class="panel auth-card"><p class="eyebrow">Área do professor</p>';
    const foot = '</div><a href="#/" class="small muted">Voltar ao site</a></div>';
    if (!CLOUD.checked || (TPASS && TLOADING)) return head + '<p class="muted">Carregando...</p>' + foot;
    if (!CLOUD.professor)
      return (
        head +
        '<h1 class="h2">Falta criar a senha</h1><p class="muted small">Na Vercel, em Settings → Environment Variables, crie <code class="ic">PROFESSOR_SENHA</code> e faça o Redeploy. Até lá, esta área fica fechada.</p>' +
        foot
      );
    return (
      head +
      '<h1 class="h2">Entrar</h1><form class="form" id="lockForm"><label class="field"><span>Senha do professor</span><input type="password" id="lockIn" autocomplete="current-password" required></label><button class="btn primary lg block">Entrar</button></form>' +
      foot
    );
  }
  function viewProfessor() {
    if (!CLOUD.checked) cloudCheck().then(() => location.hash.indexOf("#/professor") === 0 && viewProfessor());
    const locked = !CLOUD.checked || (CLOUD.online && (!CLOUD.professor || !TTURMAS));
    if (locked) {
      app().innerHTML = professorLock();
      if (CLOUD.online && CLOUD.professor && TPASS && !TLOADING) loadTurmas();
      const f = $("#lockForm");
      if (f) {
        f.onsubmit = (e) => {
          e.preventDefault();
          TPASS = $("#lockIn").value;
          try {
            sessionStorage.setItem(PASS_KEY, TPASS);
          } catch (err) {}
          loadTurmas();
        };
        setTimeout(() => $("#lockIn") && $("#lockIn").focus(), 50);
      }
      return;
    }
    const turmas = Array.from(new Set(TEACHER.map((p) => (p.turma || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (TFILTER && !turmas.includes(TFILTER) && TFILTER !== "-") TFILTER = "";
    const shown = TEACHER.filter((p) => !TFILTER || (TFILTER === "-" ? !(p.turma || "").trim() : (p.turma || "").trim() === TFILTER));
    app().innerHTML =
      '<div class="wrap page"><div class="lab-head"><a href="#/" class="brand"><span class="brand-mark">&gt;_</span><span class="brand-name">' +
      SITE +
      '</span></a><span class="eyebrow">Área do professor</span></div>' +
      onlineHtml() +
      (TSRC ? '<div id="tTable"></div><div id="tDetail"></div>' : "") +
      focusGenHtml() +
      '<section class="panel dropzone" id="drop"><h2 class="h2">' +
      (CLOUD.online ? "Relatórios em arquivo" : "Relatórios dos alunos") +
'</h2><p class="muted">Selecione ou arraste aqui os arquivos de relatório que os alunos enviaram (pode ser vários de uma vez). Nada é enviado para a internet: tudo é lido aqui no seu navegador.</p>' +
      '<div class="row wrap-row"><label class="btn primary filebtn">Abrir relatórios<input type="file" id="tFiles" multiple accept=".html,.json,text/html,application/json" hidden></label>' +
      '<button class="btn ghost" id="tCsv"' +
      (shown.length ? "" : " disabled") +
      '>Baixar planilha (CSV)</button><button class="btn ghost" id="tClear"' +
      (TEACHER.length ? "" : " disabled") +
      ">Limpar lista</button>" +
      (TEACHER.length
        ? '<span class="grow"></span><label class="field inline"><span>Turma</span><select id="tFilter"><option value="">Todas (' +
          TEACHER.length +
          ")</option>" +
          turmas.map((t) => '<option value="' + esc(t) + '"' + (t === TFILTER ? " selected" : "") + ">" + esc(t) + " (" + TEACHER.filter((p) => (p.turma || "").trim() === t).length + ")</option>").join("") +
          (TEACHER.some((p) => !(p.turma || "").trim()) ? '<option value="-"' + (TFILTER === "-" ? " selected" : "") + ">Sem turma</option>" : "") +
          "</select></label>"
        : "") +
      '</div><p class="form-error" id="tErr" hidden></p></section>' +
      (TSRC ? "" : '<div id="tTable"></div><div id="tDetail"></div>') + "</div>";
    bindFocusGen();
    bindOnline();
    const add = (files) => {
      TSRC = null;
      const errs = [];
      let pending = files.length;
      Array.from(files).forEach((f) => {
        const r = new FileReader();
        r.onload = () => {
          try {
            const p = parseReport(String(r.result));
            const i = TEACHER.findIndex((x) => x.name.toLowerCase() === p.name.toLowerCase() && (x.turma || "") === (p.turma || ""));
            if (i >= 0) {
              if ((p.updated || 0) >= (TEACHER[i].updated || 0)) TEACHER[i] = p;
            } else TEACHER.push(p);
          } catch (e) {
            errs.push(f.name);
          }
          if (--pending === 0) {
            TEACHER.sort((a, b) => (a.turma || "").localeCompare(b.turma || "", "pt-BR") || a.name.localeCompare(b.name, "pt-BR"));
            viewProfessor();
            if (errs.length) {
              $("#tErr").hidden = false;
              $("#tErr").textContent = "Não reconheci: " + errs.join(", ");
            }
          }
        };
        r.readAsText(f);
      });
    };
    $("#tFiles").onchange = (e) => add(e.target.files);
    const drop = $("#drop");
    drop.addEventListener("dragover", (e) => {
      e.preventDefault();
      drop.classList.add("over");
    });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      if (e.dataTransfer.files.length) add(e.dataTransfer.files);
    });
    $("#tClear").onclick = () => ((TEACHER = []), (TFILTER = ""), (TSRC = null), viewProfessor());
    if ($("#tFilter")) $("#tFilter").onchange = (e) => ((TFILTER = e.target.value), viewProfessor());
    $("#tCsv").onclick = () => {
      const rows = [
        ["Aluno", "Turma", "XP", "Nivel", "Licoes Python", "Licoes Banco de Dados", "Estrelas", "Exercicios respondidos", "Acertos de primeira", "Codigos aprovados", "Ajudas", "Tentativas de colar", "Ultima atividade"],
      ];
      shown.forEach((p) => {
        const s = summary(p);
        rows.push([
          p.name,
          p.turma || "",
          p.xp,
          levelInfo(p.xp).level,
          courseDone(p, "py") + "/" + lessonsOf("py").length,
          courseDone(p, "bd") + "/" + lessonsOf("bd").length,
          s.stars,
          s.answered,
          s.firstTry,
          s.codeOk + "/" + s.codeTotal,
          helpTotals(p).helps,
          helpTotals(p).pastes,
          fmtDate(p.updated),
        ]);
      });
      const tag = TFILTER && TFILTER !== "-" ? slug(TFILTER) + "-" : "";
      downloadFile("turma-" + tag + today() + ".csv", "﻿" + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(";")).join("\n"), "text/csv;charset=utf-8");
    };
    if (!TEACHER.length) return;
    let t =
      '<div class="tablewrap"><table class="table admin"><thead><tr><th>Aluno</th><th>Turma</th><th>XP</th><th>Python</th><th>Banco de Dados</th><th>Estrelas</th><th>Acertos de primeira</th><th>Códigos aprovados</th><th>Ajudas</th><th>Tentou colar</th><th>Última atividade</th><th></th></tr></thead><tbody>';
    shown.forEach((p) => {
      const i = TEACHER.indexOf(p);
      const s = summary(p);
      t +=
        "<tr><td>" +
        esc(p.name) +
        "</td><td>" +
        esc(p.turma || "-") +
        '</td><td class="mono">' +
        p.xp +
        '</td><td class="mono">' +
        courseDone(p, "py") +
        "/" +
        lessonsOf("py").length +
        '</td><td class="mono">' +
        courseDone(p, "bd") +
        "/" +
        lessonsOf("bd").length +
        '</td><td class="mono">' +
        s.stars +
        '</td><td class="mono">' +
        s.firstTry +
        "/" +
        s.answered +
        '</td><td class="mono">' +
        s.codeOk +
        "/" +
        s.codeTotal +
        '</td><td class="mono">' +
        helpTotals(p).helps +
        '</td><td class="mono' +
        (helpTotals(p).pastes ? " warn-cell" : "") +
        '">' +
        helpTotals(p).pastes +
        '</td><td class="mono small">' +
        fmtDate(p.updated) +
        '</td><td class="row-actions"><button class="btn tiny" data-d="' +
        i +
        '">Ver respostas</button>' +
        (TSRC ? '<span class="del-area" data-del="' + i + '"><button class="btn tiny ghost">Remover</button></span>' : "") +
        "</td></tr>";
    });
    if (!shown.length) t += '<tr><td colspan="12" class="muted">Nenhum relatório desta turma.</td></tr>';
    $("#tTable").innerHTML = t + "</tbody></table></div>";
    $$("[data-del]").forEach((area) => {
      const i = Number(area.dataset.del);
      const ask = () => {
        area.innerHTML = '<span class="small">Apagar ' + esc(TEACHER[i].name) + '?</span> <button class="btn tiny danger" data-y>Sim</button> <button class="btn tiny ghost" data-n>Não</button>';
        $("[data-n]", area).onclick = () => {
          area.innerHTML = '<button class="btn tiny ghost">Remover</button>';
          $("button", area).onclick = ask;
        };
        $("[data-y]", area).onclick = async () => {
          try {
            await profApi("?turma=" + encodeURIComponent(TSRC.nome) + "&nome=" + encodeURIComponent(TEACHER[i].name), "DELETE");
            toast("info", "Aluno removido", TEACHER[i].name);
            TEACHER.splice(i, 1);
            await loadTurmas();
          } catch (e) {
            toast("error", "Não deu para remover", e.message);
          }
        };
      };
      $("button", area).onclick = ask;
    });
    $$("[data-d]").forEach(
      (b) =>
        (b.onclick = () => {
          const d = $("#tDetail");
          d.innerHTML = '<div class="panel teacher-detail"><style>' + REPORT_CSS + "</style>" + reportBody(TEACHER[Number(b.dataset.d)]) + "</div>";
          d.scrollIntoView({ behavior: "smooth" });
        })
    );
  }
  function helpTotals(p) {
    let helps = 0,
      pastes = 0;
    Object.values(p.help || {}).forEach((x) => {
      helps += (x.hints || 0) + (x.lines || 0);
      pastes += x.pastes || 0;
    });
    return { helps, pastes };
  }
  function summary(p) {
    let answered = 0,
      firstTry = 0,
      codeOk = 0,
      codeTotal = 0;
    Object.values(p.answers || {}).forEach((a) => {
      if (!a.status) return;
      answered++;
      if (a.status === "ok" && a.tries <= 1) firstTry++;
      if (a.kind === "code") {
        codeTotal++;
        if (a.status === "ok") codeOk++;
      }
    });
    const done = Object.keys(p.lessons || {}).length;
    const st = Object.values(p.lessons || {}).reduce((a, l) => a + (l.stars || 0), 0);
    return { answered, firstTry, codeOk, codeTotal, done, stars: st };
  }

  /* ================= Rotas ================= */
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }
  function route() {
    PY.stop();
    loadFocus();
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    const page = parts[0];
    if (page === "professor") return viewProfessor();
    if (!P) return viewWelcome();
    if (page === "licao" && parts[1]) return viewLesson(parts[1]);
    if (page === "revisao") return viewRevisao();
    if (page === "lab") return viewLab();
    if (page === "perfil") return viewPerfil();
    return viewTrilha();
  }

  loadDB();
  readFocusFromUrl();
  loadFocus();
  if (P && FOCUS && FOCUS.turma && !P.turma) update((p) => (p.turma = FOCUS.turma));
  window.addEventListener("hashchange", route);
  route();
  cloudCheck().then((on) => {
    if (!on) return;
    const note = $("#welcomeNote");
    if (note) note.textContent = "Seu progresso fica salvo online. Em qualquer computador, entre com o mesmo nome e a mesma turma.";
    cloudSync();
  });
  // carrega o Python em segundo plano
  setTimeout(() => PY.ensure(), 800);
})();
