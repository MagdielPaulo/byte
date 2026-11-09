/* SQL no navegador (SQLite via sql.js) + correção de exercícios + mensagens de erro em português */
(function () {
  const SQ = {};
  let SQL = null;
  let loading = null;

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

  SQ.ensure = function () {
    if (SQL) return Promise.resolve(true);
    if (!loading)
      loading = (window.initSqlJs ? Promise.resolve() : loadScript("vendor/sql-asm.js"))
        .then(() => window.initSqlJs())
        .then((s) => {
          SQL = s;
          return true;
        })
        .catch(() => {
          loading = null;
          return false;
        });
    return loading;
  };
  /** Para o script de verificação em Node */
  SQ._setEngine = (s) => (SQL = s);

  /** Abre um banco novo com os dados de exemplo */
  SQ.open = function (seeds) {
    const db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON;");
    (seeds || ["arena"]).forEach((name) => {
      const s = (window.SQL_SEEDS || {})[name];
      if (s) db.exec(s);
    });
    return db;
  };

  function firstWord(sql) {
    const clean = sql.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
    return (clean.match(/^[A-Za-z]+/) || [""])[0].toUpperCase();
  }

  /**
   * Executa os comandos um por um.
   * Devolve { items: [{ sql, kind, columns, rows, changes }], err: { msg, index } | null }
   */
  SQ.exec = function (db, code) {
    const items = [];
    try {
      for (const st of db.iterateStatements(code)) {
        const sql = st.getSQL();
        const kind = firstWord(sql);
        try {
          const columns = st.getColumnNames();
          const rows = [];
          while (st.step()) rows.push(st.get());
          const item = { sql, kind, columns, rows };
          if (["INSERT", "UPDATE", "DELETE", "REPLACE"].includes(kind)) item.changes = db.getRowsModified();
          items.push(item);
        } finally {
          st.free();
        }
      }
      return { items, err: null };
    } catch (e) {
      return { items, err: { msg: String((e && e.message) || e), index: items.length } };
    }
  };

  SQ.lastResult = function (items) {
    for (let i = items.length - 1; i >= 0; i--) if (items[i].columns && items[i].columns.length) return items[i];
    return null;
  };

  /** Testa um comando sem deixar efeito: devolve "ok" ou "erro" */
  SQ.probe = function (db, sql) {
    db.run("SAVEPOINT sonda;");
    const r = SQ.exec(db, sql);
    db.run("ROLLBACK TO sonda; RELEASE sonda;");
    return r.err ? { ok: false, msg: r.err.msg } : { ok: true };
  };

  SQ.tables = function (db) {
    try {
      const r = db.exec("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY type, name");
      if (!r.length) return [];
      return r[0].values.map(([name, type]) => {
        const cols = db.exec("SELECT name, type, pk FROM pragma_table_info('" + name.replace(/'/g, "''") + "')");
        return { name, type, columns: cols.length ? cols[0].values.map(([n, t, pk]) => ({ name: n, type: t, pk: !!pk })) : [] };
      });
    } catch (e) {
      return [];
    }
  };

  /* ---------- comparação ---------- */
  function norm(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return Math.round(v * 100) / 100;
    if (v instanceof Uint8Array) return "[blob]";
    const s = String(v).trim();
    if (/^-?\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s) * 100) / 100;
    return s;
  }
  SQ.compare = function (got, exp, ordered) {
    if (!got) return { ok: false, why: "noresult" };
    if (got.columns.length !== exp.columns.length) return { ok: false, why: "cols", got: got.columns.length, exp: exp.columns.length };
    if (got.rows.length !== exp.rows.length) return { ok: false, why: "count", got: got.rows.length, exp: exp.rows.length };
    let g = got.rows.map((r) => JSON.stringify(r.map(norm)));
    let e = exp.rows.map((r) => JSON.stringify(r.map(norm)));
    if (!ordered) {
      g = g.slice().sort();
      e = e.slice().sort();
    }
    for (let i = 0; i < e.length; i++) if (g[i] !== e[i]) return { ok: false, why: ordered && g.slice().sort().join() === e.slice().sort().join() ? "order" : "values" };
    return { ok: true };
  };

  const stripComments = (s) => s.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");

  /**
   * Corrige um exercício de SQL comparando com a solução.
   * Consultas: compara o último resultado. Com "check": roda a consulta de conferência depois dos dois códigos.
   * Com "probes": testa comandos (ex.: INSERT que deveria ser barrado) e compara se dão erro ou não.
   */
  SQ.verify = function (step, code) {
    if (step.require)
      for (const r of step.require) if (!new RegExp(r.re, "i").test(stripComments(code))) return { ok: false, kind: "require", msg: r.msg };
    const base = step.seed ? [step.seed] : ["arena"];
    const variants = step.check || step.probes ? [base] : [base, base.concat(["arena_extra"])];
    for (let vi = 0; vi < variants.length; vi++) {
      const dbS = SQ.open(variants[vi]);
      const dbE = SQ.open(variants[vi]);
      try {
        const rS = SQ.exec(dbS, code);
        if (rS.err) return { ok: false, kind: "error", msg: rS.err.msg, friendly: SQ.friendly(rS.err.msg, code, dbS) };
        const rE = SQ.exec(dbE, step.solution);
        if (rE.err) return { ok: false, kind: "internal", msg: "Erro na solução: " + rE.err.msg };
        if (step.check) {
          const cS = SQ.exec(dbS, step.check);
          if (cS.err) return { ok: false, kind: "check-error", msg: cS.err.msg, friendly: SQ.friendly(cS.err.msg, step.check, dbS) };
          const cE = SQ.exec(dbE, step.check);
          const got = SQ.lastResult(cS.items);
          const exp = SQ.lastResult(cE.items);
          const cmp = SQ.compare(got, exp, true);
          if (!cmp.ok) return { ok: false, kind: "check", cmp, got, exp };
        }
        if (step.probes)
          for (const p of step.probes) {
            const a = SQ.probe(dbS, p);
            const b = SQ.probe(dbE, p);
            if (a.ok !== b.ok) return { ok: false, kind: "probe", probe: p, expectOk: b.ok, msg: a.msg || "" };
          }
        if (!step.check) {
          const got = SQ.lastResult(rS.items);
          const exp = SQ.lastResult(rE.items);
          const ordered = step.ordered != null ? step.ordered : /order\s+by/i.test(step.solution);
          const cmp = SQ.compare(got, exp, ordered);
          if (!cmp.ok) return { ok: false, kind: "result", cmp, got, exp, variant: vi > 0 };
        }
      } finally {
        dbS.close();
        dbE.close();
      }
    }
    return { ok: true };
  };

  /** Resultado que o exercício espera (para mostrar como exemplo) */
  SQ.expected = function (step) {
    const db = SQ.open(step.seed ? [step.seed] : ["arena"]);
    try {
      const r = SQ.exec(db, step.solution);
      if (r.err) return null;
      if (step.check) {
        const c = SQ.exec(db, step.check);
        return c.err ? null : SQ.lastResult(c.items);
      }
      return SQ.lastResult(r.items);
    } finally {
      db.close();
    }
  };

  /* ---------- mensagens em português ---------- */
  SQ.lint = function (code) {
    const clean = code.replace(/--[^\n]*/g, "");
    const quotes = (clean.replace(/''/g, "").match(/'/g) || []).length;
    if (quotes % 2) return "Tem aspas simples que abriram e não fecharam. Texto em SQL fica entre aspas simples: 'Kira'.";
    const open = (clean.match(/\(/g) || []).length;
    const close = (clean.match(/\)/g) || []).length;
    if (open !== close) return "Os parênteses não fecham (abriu " + open + ", fechou " + close + ").";
    if (/,\s*(FROM|WHERE|ORDER|GROUP|\))/i.test(clean)) return "Tem uma vírgula sobrando antes de " + clean.match(/,\s*(FROM|WHERE|ORDER|GROUP|\))/i)[1].toUpperCase() + ". A última coluna da lista não leva vírgula.";
    return null;
  };

  SQ.friendly = function (msg, code, db) {
    let m;
    if ((m = msg.match(/no such table: (\S+)/))) {
      const names = db ? SQ.tables(db).map((t) => t.name) : [];
      return "A tabela " + m[1] + " não existe." + (names.length ? " As tabelas deste banco são: " + names.join(", ") + "." : "");
    }
    if ((m = msg.match(/no such column: (\S+)/)))
      return "A coluna " + m[1] + " não existe nessa tabela. Confira o nome. Se era um texto, ele precisa de aspas simples: '" + m[1].replace(/^.*\./, "") + "'.";
    if ((m = msg.match(/ambiguous column name: (\S+)/))) return "A coluna " + m[1] + " existe nas duas tabelas. Diga de qual é, por exemplo: jogadores." + m[1] + ".";
    if ((m = msg.match(/NOT NULL constraint failed: (\S+)/))) return "A coluna " + m[1] + " é NOT NULL: ela não pode ficar vazia.";
    if ((m = msg.match(/UNIQUE constraint failed: (\S+)/))) return "Já existe uma linha com esse valor em " + m[1] + ", e a coluna não aceita repetidos (UNIQUE ou chave primária).";
    if (/CHECK constraint failed/.test(msg)) return "O valor não passou na regra CHECK da tabela (" + msg.replace(/^.*CHECK constraint failed:\s*/, "") + ").";
    if (/FOREIGN KEY constraint failed/.test(msg))
      return "Erro de chave estrangeira: o valor aponta para um registro que não existe, ou você tentou apagar um registro que outra tabela ainda usa.";
    if ((m = msg.match(/table (\S+) already exists/))) return "A tabela " + m[1] + " já existe. Use outro nome ou apague antes com DROP TABLE.";
    if ((m = msg.match(/view (\S+) already exists/))) return "A view " + m[1] + " já existe. Apague antes com DROP VIEW.";
    if ((m = msg.match(/duplicate column name: (\S+)/))) return "A coluna " + m[1] + " já existe nessa tabela.";
    if ((m = msg.match(/(\d+) values for (\d+) columns/))) return "A quantidade de valores (" + m[1] + ") é diferente da quantidade de colunas (" + m[2] + ") no INSERT.";
    if (/misuse of aggregate/.test(msg)) return "Função de agregação (COUNT, SUM, AVG...) no lugar errado. Para filtrar grupos, use HAVING em vez de WHERE.";
    if ((m = msg.match(/no such function: (\S+)/))) return "A função " + m[1] + " não existe no SQLite.";
    if (/incomplete input/.test(msg)) return "O comando terminou no meio. Faltou fechar parêntese ou aspas?";
    if (/cannot (commit|rollback) - no transaction is active/.test(msg)) return "Não há transação aberta. Comece com BEGIN antes do COMMIT ou ROLLBACK.";
    if (/cannot start a transaction within a transaction/.test(msg)) return "Já existe uma transação aberta. Feche com COMMIT ou ROLLBACK antes de outro BEGIN.";
    if ((m = msg.match(/near "([^"]*)": syntax error/))) {
      const l = SQ.lint(code || "");
      if (l) return l;
      const w = m[1];
      if (/^(CREATE|USER|GRANT|REVOKE|DATABASE|USE)$/i.test(w)) return 'Erro de escrita perto de "' + w + '". Lembre: o SQLite deste site não tem CREATE DATABASE, usuários nem permissões.';
      return 'Erro de escrita perto de "' + w + '". Confira vírgulas, parênteses, aspas simples e a ordem: SELECT, FROM, WHERE, GROUP BY, ORDER BY, LIMIT.';
    }
    return msg;
  };

  /* ---------- exibição ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function cell(v) {
    if (v === null || v === undefined) return '<td class="null">NULL</td>';
    if (typeof v === "number") return '<td class="num">' + (Number.isInteger(v) ? v : Math.round(v * 100) / 100) + "</td>";
    return "<td>" + esc(v) + "</td>";
  }
  SQ.tableHtml = function (res, max) {
    max = max || 50;
    let h = '<div class="sqltable"><table><thead><tr>' + res.columns.map((c) => "<th>" + esc(c) + "</th>").join("") + "</tr></thead><tbody>";
    res.rows.slice(0, max).forEach((r) => (h += "<tr>" + r.map(cell).join("") + "</tr>"));
    if (!res.rows.length) h += '<tr><td class="null" colspan="' + res.columns.length + '">nenhuma linha</td></tr>';
    h += "</tbody></table></div>";
    h += '<div class="sqlcount">' + res.rows.length + (res.rows.length === 1 ? " linha" : " linhas") + (res.rows.length > max ? " (mostrando " + max + ")" : "") + "</div>";
    return h;
  };
  SQ.chartable = (res) => res && res.columns.length === 2 && res.rows.length > 0 && res.rows.length <= 25 && res.rows.every((r) => typeof r[1] === "number");
  SQ.chartHtml = function (res) {
    const max = Math.max(...res.rows.map((r) => r[1]), 0) || 1;
    let h = '<div class="sqlchart" role="img" aria-label="Gráfico de barras de ' + esc(res.columns[1]) + " por " + esc(res.columns[0]) + '">';
    res.rows.forEach((r) => {
      const v = Math.round(r[1] * 100) / 100;
      h +=
        '<div class="bar-row"><span class="bar-label">' +
        esc(r[0] === null ? "NULL" : r[0]) +
        '</span><span class="bar-track"><i style="width:' +
        Math.max(1.5, (r[1] / max) * 100) +
        '%"></i></span><span class="bar-val">' +
        v +
        "</span></div>";
    });
    return h + '<div class="bar-axis">' + esc(res.columns[1]) + " por " + esc(res.columns[0]) + "</div></div>";
  };

  /** Gera um backup .sql do banco (estrutura + dados) */
  SQ.dump = function (db) {
    let out = "-- Backup gerado em " + new Date().toLocaleString("pt-BR") + "\nPRAGMA foreign_keys = OFF;\nBEGIN;\n";
    const objs = db.exec("SELECT type, name, sql FROM sqlite_master WHERE sql NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, rowid");
    const list = objs.length ? objs[0].values : [];
    list.forEach(([type, name, sql]) => {
      out += sql + ";\n";
      if (type === "table") {
        const r = db.exec('SELECT * FROM "' + name.replace(/"/g, '""') + '"');
        if (r.length)
          r[0].values.forEach((row) => {
            out +=
              'INSERT INTO "' +
              name +
              '" VALUES (' +
              row.map((v) => (v === null ? "NULL" : typeof v === "number" ? v : "'" + String(v).replace(/'/g, "''") + "'")).join(", ") +
              ");\n";
          });
      }
    });
    return out + "COMMIT;\nPRAGMA foreign_keys = ON;\n";
  };
  SQ.fromDump = function (text) {
    const db = new SQL.Database();
    db.exec(text);
    db.run("PRAGMA foreign_keys = ON;");
    return db;
  };
  SQ.empty = () => {
    const db = new SQL.Database();
    db.run("PRAGMA foreign_keys = ON;");
    return db;
  };

  window.SQ = SQ;
})();
