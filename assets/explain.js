/*
  Explicador da "resposta explicada": transforma uma solução em uma árvore de linhas,
  cada uma com uma frase em português dizendo o que ela faz.
  Python: a árvore segue o recuo (o que está dentro do def, if, for, while).
  SQL: a árvore é comando → cláusulas (→ colunas, no CREATE TABLE).
  Texto entre crases vira código na tela.
*/
(function () {
  const C = (s) => "`" + String(s).trim() + "`";

  /* ---------- utilidades ---------- */
  /** troca o conteúdo de textos por "" para procurar operadores sem achar o que está dentro das aspas */
  function stripStrings(s) {
    return s.replace(/"[^"]*"|'[^']*'/g, '""');
  }
  /** divide por vírgulas de nível 0 (fora de parênteses, colchetes e aspas) */
  function splitTop(s) {
    const out = [];
    let depth = 0,
      q = null,
      cur = "";
    for (const ch of s) {
      if (q) {
        cur += ch;
        if (ch === q) q = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        q = ch;
        cur += ch;
        continue;
      }
      if ("([{".includes(ch)) depth++;
      if (")]}".includes(ch)) depth--;
      if (ch === "," && depth === 0) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  const listPt = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " e " + a[a.length - 1]);
  const BUILTIN = new Set(["print", "input", "int", "float", "str", "len", "range", "round", "max", "min", "sum", "abs", "type", "list", "bool"]);

  /* ---------- Python ---------- */
  const PY_GLOSS = [
    [/%/, "`%` dá o resto da divisão (n % 2 é 0 quando n é par)"],
    [/\/\//, "`//` é a divisão inteira, sem casas decimais"],
    [/\*\*/, "`**` é potência"],
    [/==/, "`==` compara se é igual (um `=` só guarda valor)"],
    [/!=/, "`!=` compara se é diferente"],
    [/>=|<=/, "`>=` e `<=` incluem o próprio valor"],
    [/\band\b/, "`and`: as duas condições precisam ser verdade"],
    [/\bor\b/, "`or`: basta uma das condições ser verdade"],
    [/\bnot\b/, "`not` inverte: verdadeiro vira falso"],
    [/\blen\(/, "`len( )` conta quantos itens a lista tem"],
    [/\bround\(/, "`round(valor, 2)` arredonda para 2 casas"],
    [/\[-1\]/, "`[-1]` pega o último item da lista"],
    [/\[0\]/, "`[0]` pega o primeiro item (a contagem começa em 0)"],
    [/\[i\]/, "`lista[i]` pega o item da posição i"],
    [/""\s*\*|\*\s*\(/, "texto * número repete o texto"],
  ];
  function glossPy(t) {
    const s = stripStrings(t);
    return PY_GLOSS.filter(([re]) => re.test(s)).map((g) => g[1]);
  }
  function describeValue(v) {
    v = v.trim();
    if (/^".*"$|^'.*'$/.test(v)) return "o texto " + C(v);
    if (/^-?\d+(\.\d+)?$/.test(v)) return "o número " + v;
    if (v === "True" || v === "False") return "o valor lógico " + C(v);
    if (/^[A-Za-z_]\w*$/.test(v)) return "o valor de " + C(v);
    const call = v.match(/^(\w+)\((.*)\)$/);
    if (call && !BUILTIN.has(call[1]) && splitTop(v).length === 1 && call[2].split("(").length === call[2].split(")").length)
      return "o valor que a função " + C(call[1]) + " devolver" + (call[2].trim() ? " quando receber " + C(call[2]) : "");
    return "o resultado de " + C(v);
  }
  function rangeText(args) {
    const a = splitTop(args);
    if (a.length === 1) return "de 0 até " + C(a[0]) + " menos 1, ou seja, " + C(a[0]) + " voltas";
    if (a.length === 2) {
      const end = a[1].match(/^(.+?)\s*\+\s*1$/);
      return "começando em " + C(a[0]) + " e indo até " + (end ? C(end[1]) : C(a[1]) + " menos 1") + (end ? " (o + 1 faz o próprio " + C(end[1]) + " entrar)" : " (o último número não entra)");
    }
    const neg = /^-/.test(a[2]);
    return "começando em " + C(a[0]) + (neg ? ", contando para trás de " + a[2].replace("-", "") + " em " + a[2].replace("-", "") : ", de " + a[2] + " em " + a[2]) + ", e parando antes de " + C(a[1]);
  }
  function pyLine(t) {
    let m;
    if (t.startsWith("#")) return "Comentário: o Python ignora esta linha. Ela serve para organizar o código para quem lê.";
    if ((m = t.match(/^def (\w+)\((.*)\):$/))) {
      const ps = m[2].trim() ? splitTop(m[2]).map((p) => C(p)) : [];
      return "Cria a função " + C(m[1]) + (ps.length ? ", que recebe " + listPt(ps) + "." : ", que não recebe nenhum valor.") + " O bloco de dentro só roda quando a função for chamada pelo nome.";
    }
    if ((m = t.match(/^return\s*(.*)$/))) {
      if (!m[1]) return "Encerra a função.";
      const cmp = /==|!=|>=|<=|<|>|\band\b|\bor\b/.test(stripStrings(m[1]));
      return "Devolve " + describeValue(m[1]) + " para quem chamou a função e encerra a função ali." + (cmp ? " Como é uma comparação, o valor devolvido é `True` ou `False`." : "");
    }
    if ((m = t.match(/^if (.+):$/))) return "Testa se " + C(m[1]) + ". Se for verdade, roda o bloco de dentro; se não for, pula o bloco.";
    if ((m = t.match(/^elif (.+):$/))) return "Só é testado se os testes de cima deram falso: testa se " + C(m[1]) + ".";
    if (t === "else:") return "Se nenhum teste de cima deu verdadeiro, roda este bloco.";
    if ((m = t.match(/^for (\w+) in range\((.*)\):$/))) return "Repete o bloco de dentro com " + C(m[1]) + " " + rangeText(m[2]) + ". A cada volta, " + C(m[1]) + " vale o próximo número.";
    if ((m = t.match(/^for (\w+) in (.+):$/))) return "Repete o bloco de dentro uma vez para cada item de " + C(m[2]) + ". A cada volta, o item atual fica guardado em " + C(m[1]) + ".";
    if ((m = t.match(/^while (.+):$/))) return "Repete o bloco de dentro enquanto " + C(m[1]) + " for verdade. A condição é testada antes de cada volta; quando ficar falsa, o programa segue depois do bloco.";
    if (t === "break") return "Sai do laço na hora, sem terminar as voltas.";
    if (t === "continue") return "Pula para a próxima volta do laço.";
    if (t === "pass") return "Não faz nada: só ocupa o lugar de um bloco vazio.";
    if ((m = t.match(/^import (\w+)/))) return "Carrega o módulo " + C(m[1]) + " para usar as funções prontas dele.";
    if ((m = t.match(/^(\w+)\.append\((.*)\)$/))) return "Adiciona " + describeValue(m[2]) + " no fim da lista " + C(m[1]) + ".";
    if ((m = t.match(/^print\((.*)\)$/))) {
      const args = m[1].trim() ? splitTop(m[1]) : [];
      if (!args.length) return "Mostra uma linha em branco.";
      const parts = args.map((a) => (/^".*"$|^'.*'$/.test(a) ? "o texto " + C(a) : describeValue(a)));
      return "Mostra na tela " + listPt(parts) + "." + (args.length > 1 ? " O `print` coloca um espaço entre os itens separados por vírgula." : "");
    }
    if ((m = t.match(/^(\w+)\s*(\+|-|\*|\/)=\s*(.+)$/))) {
      const op = { "+": "soma", "-": "subtrai", "*": "multiplica por", "/": "divide por" }[m[2]];
      return "Atualiza " + C(m[1]) + ": pega o valor atual e " + op + " " + C(m[3]) + ".";
    }
    if ((m = t.match(/^(\w+)\s*=\s*(int|float)?\(?\s*input\((.*)\)\s*\)?$/))) {
      const conv = t.includes("int(input") ? " e converte para número inteiro (`int`)" : t.includes("float(input") ? " e converte para número com casas decimais (`float`)" : "";
      return "Mostra a pergunta " + (m[3] ? C(m[3]) : "") + ", espera a pessoa digitar" + conv + ". O valor fica guardado em " + C(m[1]) + "." + (conv ? "" : " O `input` sempre devolve texto.");
    }
    if ((m = t.match(/^(\w+)\s*=\s*(.+)$/))) {
      const v = m[1];
      const e = m[2].trim();
      const self = e.match(new RegExp("^" + v + "\\s*([+\\-*/])\\s*(.+)$"));
      if (self) {
        if (self[1] === "+" && self[2].trim() === "1") return "Aumenta " + C(v) + " em 1. É um contador: a cada vez que esta linha roda, conta mais um.";
        const op = { "+": "soma", "-": "subtrai", "*": "multiplica por", "/": "divide por" }[self[1]];
        return "Atualiza " + C(v) + ": pega o valor atual, " + op + " " + C(self[2]) + " e guarda o resultado de volta em " + C(v) + ".";
      }
      if (/^\[\s*\]$/.test(e)) return "Cria a lista " + C(v) + " vazia.";
      if (/^\[.*\]$/.test(e)) return "Cria a lista " + C(v) + " com " + splitTop(e.slice(1, -1)).length + " itens.";
      if (/^".*"$|^'.*'$/.test(e) || /^-?\d+(\.\d+)?$/.test(e) || e === "True" || e === "False") return "Cria a variável " + C(v) + " e guarda nela " + describeValue(e) + ".";
      const call = e.match(/^(\w+)\(/);
      if (call && !BUILTIN.has(call[1]) && e.endsWith(")") && splitTop(e).length === 1 && !/[+\-*/%]\s/.test(stripStrings(e).replace(/\(.*\)/, "")))
        return "Chama a função " + C(call[1]) + " e guarda o valor que ela devolver em " + C(v) + ".";
      return "Calcula " + C(e) + " e guarda o resultado em " + C(v) + ".";
    }
    if ((m = t.match(/^(\w+)\((.*)\)$/))) {
      const args = m[2].trim() ? splitTop(m[2]) : [];
      return "Chama a função " + C(m[1]) + (args.length ? ", passando " + listPt(args.map((a) => C(a))) : "") + ". Agora o bloco de dentro dela roda.";
    }
    return null;
  }
  function python(code) {
    const lines = code.replace(/\s+$/, "").split("\n");
    const root = { children: [], indent: -1 };
    const stack = [root];
    let unknown = 0;
    lines.forEach((raw) => {
      if (!raw.trim()) return;
      const indent = raw.match(/^ */)[0].length;
      const t = raw.trim();
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
      let text = pyLine(t);
      if (!text) {
        unknown++;
        text = "Executa " + C(t) + ".";
      }
      const node = { code: raw.replace(/\s+$/, ""), text, gloss: glossPy(t), indent, children: [] };
      stack[stack.length - 1].children.push(node);
      if (/:$/.test(t)) stack.push(node);
    });
    return { nodes: root.children, unknown };
  }

  /* ---------- SQL ---------- */
  const TYPES = { INTEGER: "número inteiro", INT: "número inteiro", TEXT: "texto", VARCHAR: "texto", REAL: "número com casas decimais", NUMERIC: "número", DECIMAL: "número com casas decimais", DATE: "data", BOOLEAN: "verdadeiro ou falso" };
  const SQL_GLOSS = [
    [/\bCOUNT\(\*\)/i, "`COUNT(*)` conta as linhas"],
    [/\bCOUNT\((?!\*)/i, "`COUNT(coluna)` conta os valores preenchidos"],
    [/\bAVG\(/i, "`AVG` calcula a média"],
    [/\bSUM\(/i, "`SUM` soma os valores"],
    [/\bMIN\(/i, "`MIN` pega o menor valor"],
    [/\bMAX\(/i, "`MAX` pega o maior valor"],
    [/\bROUND\(/i, "`ROUND(valor, 2)` arredonda para 2 casas"],
    [/\bAS\b/i, "`AS` dá um apelido para a coluna ou tabela"],
    [/\b\w+\.\w+/, "`j.nick` quer dizer a coluna nick da tabela com apelido j"],
    [/\bAND\b/i, "`AND`: as duas condições precisam ser verdade"],
    [/\bOR\b/i, "`OR`: basta uma das condições ser verdade"],
    [/\bIN\s*\(/i, "`IN (...)` aceita qualquer valor da lista"],
    [/\bLIKE\b/i, "`LIKE` compara por padrão; `%` vale qualquer sequência de letras"],
    [/<>|!=/, "`<>` quer dizer diferente"],
    [/\bIS NULL\b/i, "`IS NULL` acha valores vazios"],
    [/\bDISTINCT\b/i, "`DISTINCT` remove repetidos"],
  ];
  function glossSql(t) {
    const s = stripStrings(t);
    return SQL_GLOSS.filter(([re]) => re.test(s)).map((g) => g[1]);
  }
  function constraints(rest) {
    const out = [];
    const r = " " + rest + " ";
    if (/PRIMARY KEY/i.test(r)) out.push("é a chave primária (identifica cada linha e não se repete)");
    if (/AUTOINCREMENT/i.test(r)) out.push("o número é gerado sozinho");
    if (/NOT NULL/i.test(r)) out.push("é obrigatória (não pode ficar vazia)");
    if (/\bUNIQUE\b/i.test(r)) out.push("não aceita valores repetidos");
    let m;
    if ((m = r.match(/DEFAULT\s+('[^']*'|[\w.]+)/i))) out.push("se ninguém informar, vale " + C(m[1]));
    if ((m = r.match(/CHECK\s*\((.+)\)/i))) out.push("só aceita valores em que " + C(m[1].replace(/\)\s*$/, "")));
    if ((m = r.match(/REFERENCES\s+(\w+)\s*\((\w+)\)/i))) out.push("é chave estrangeira: aponta para " + C(m[1] + "." + m[2]));
    return out;
  }
  function sqlClause(t) {
    let m;
    const u = t.toUpperCase();
    if (t.startsWith("--")) return "Comentário: o banco ignora esta linha.";
    if (/^BEGIN/.test(u)) return "Abre uma transação: os próximos comandos só valem de verdade quando chegar o COMMIT.";
    if (/^COMMIT/.test(u)) return "Confirma a transação: tudo o que foi feito desde o BEGIN passa a valer.";
    if (/^ROLLBACK/.test(u)) return "Desfaz tudo o que foi feito desde o BEGIN.";
    if ((m = t.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+?);?$/i))) return "Altera a tabela " + C(m[1]) + ": define " + C(m[2]) + ", só nas linhas em que " + C(m[3]) + ".";
    if ((m = t.match(/^SELECT\s+(.+?)(;?)$/i))) {
      const cols = m[1].replace(/\s+FROM\s+.*/i, "");
      return (cols.trim() === "*" ? "Escolhe todas as colunas." : "Escolhe o que vai aparecer no resultado: " + listPt(splitTop(cols).map((c) => C(c))) + ".") + (m[2] ? " O `;` termina o comando." : "");
    }
    if ((m = t.match(/^FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s*(;?)$/i)))
      return "Os dados vêm da tabela " + C(m[1]) + (m[2] ? ", que ganha o apelido " + C(m[2]) + " para encurtar o resto do comando" : "") + "." + (m[3] ? " O `;` termina o comando." : "");
    if ((m = t.match(/^(LEFT\s+)?JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+?)(;?)$/i)))
      return (
        "Junta cada linha com a tabela " + C(m[2]) + (m[3] ? " (apelido " + C(m[3]) + ")" : "") + ", ligando as linhas em que " + C(m[4]) + ". É a chave estrangeira conectando as tabelas." + (m[1] ? " O LEFT mantém as linhas da primeira tabela mesmo sem par." : "") + (m[5] ? " O `;` termina o comando." : "")
      );
    if ((m = t.match(/^WHERE\s+(.+?)(;?)$/i))) return "Filtra: só ficam as linhas em que " + C(m[1]) + "." + (m[2] ? " O `;` termina o comando." : "");
    if ((m = t.match(/^(AND|OR)\s+(.+?)(;?)$/i))) return (m[1].toUpperCase() === "AND" ? "E também: " : "Ou então: ") + C(m[2]) + ".";
    if ((m = t.match(/^GROUP BY\s+(.+?)(;?)$/i))) return "Separa as linhas em grupos com o mesmo " + C(m[1]) + ". As funções como COUNT passam a dar um resultado por grupo." + (m[2] ? " O `;` termina o comando." : "");
    if ((m = t.match(/^HAVING\s+(.+?)(;?)$/i))) return "Filtra os grupos (depois do GROUP BY): só ficam os grupos em que " + C(m[1]) + ". O WHERE filtra linhas; o HAVING filtra grupos." + (m[2] ? " O `;` termina o comando." : "");
    if ((m = t.match(/^ORDER BY\s+(.+?)(;?)$/i))) {
      const desc = /\bDESC\b/i.test(m[1]);
      return "Ordena o resultado por " + C(m[1].replace(/\s+(ASC|DESC)\b/gi, "")) + (desc ? ", do maior para o menor (DESC)." : ", do menor para o maior.") + (m[2] ? " O `;` termina o comando." : "");
    }
    if ((m = t.match(/^LIMIT\s+(\d+)\s*(;?)$/i))) return "Mostra só as " + m[1] + " primeiras linhas do resultado." + (m[2] ? " O `;` termina o comando." : "");
    if ((m = t.match(/^INSERT INTO\s+(\w+)\s*\((.+?)\)\s*(VALUES)?\s*;?$/i)))
      return "Insere linha nova na tabela " + C(m[1]) + ", preenchendo as colunas " + listPt(splitTop(m[2]).map((c) => C(c))) + ", nessa ordem." + (m[3] ? " Os valores vêm logo abaixo, um parêntese por linha." : "");
    if ((m = t.match(/^VALUES\s*(\(.+\))\s*;?$/i))) return "Os valores da nova linha, na mesma ordem das colunas. Texto vai entre aspas simples; número vai sem aspas.";
    if (/^\(.+\)\s*[,;]?$/.test(t)) return "Uma linha a inserir, com os valores na ordem das colunas." + (/;$/.test(t) ? " O `;` termina o comando." : " A vírgula no fim separa da próxima linha.");
    if ((m = t.match(/^UPDATE\s+(\w+)\s*$/i))) return "Vai alterar dados que já existem na tabela " + C(m[1]) + ".";
    if ((m = t.match(/^SET\s+(.+?)(;?)$/i))) {
      const sets = splitTop(m[1]);
      const uses = sets.some((x) => {
        const p = x.split("=");
        return p.length > 1 && new RegExp("\\b" + p[0].trim() + "\\b").test(p.slice(1).join("="));
      });
      return "Define o novo valor: " + listPt(sets.map((x) => C(x))) + "." + (uses ? " A conta usa o valor atual da coluna." : "") + (m[2] ? " Sem WHERE, a mudança vale para todas as linhas." : "");
    }
    if ((m = t.match(/^DELETE FROM\s+(\w+)\s*(;?)$/i))) return "Vai apagar linhas da tabela " + C(m[1]) + "." + (m[2] ? " Sem WHERE, apaga todas!" : " O WHERE de baixo escolhe quais.");
    if ((m = t.match(/^CREATE TABLE\s+(\w+)\s*\($/i))) return "Cria a tabela " + C(m[1]) + ". As colunas vêm dentro dos parênteses, uma por linha, separadas por vírgula.";
    if ((m = t.match(/^CREATE VIEW\s+(\w+)\s+AS$/i))) return "Cria a view " + C(m[1]) + ": uma consulta guardada com nome, que depois pode ser usada como se fosse uma tabela. A consulta vem logo abaixo.";
    if ((m = t.match(/^ALTER TABLE\s+(\w+)$/i))) return "Vai mudar a estrutura da tabela " + C(m[1]) + ", sem apagar os dados que já estão nela.";
    if ((m = t.match(/^ADD COLUMN\s+(\w+)\s+(\w+)(.*?);?$/i))) {
      const cs = constraints(m[3]);
      return "Acrescenta a coluna " + C(m[1]) + ", do tipo " + m[2].toUpperCase() + " (" + (TYPES[m[2].toUpperCase()] || "") + ")" + (cs.length ? "; " + cs.join("; ") : "") + ".";
    }
    if ((m = t.match(/^RENAME COLUMN\s+(\w+)\s+TO\s+(\w+)\s*;?$/i))) return "Troca o nome da coluna " + C(m[1]) + " para " + C(m[2]) + ". Os dados continuam iguais.";
    if ((m = t.match(/^RENAME TO\s+(\w+)\s*;?$/i))) return "Troca o nome da tabela para " + C(m[1]) + ".";
    if ((m = t.match(/^DROP COLUMN\s+(\w+)\s*;?$/i))) return "Remove a coluna " + C(m[1]) + " e os dados dela.";
    if ((m = t.match(/^DROP (TABLE|VIEW)\s+(?:IF EXISTS\s+)?(\w+)\s*;?$/i))) return "Apaga a " + (m[1].toUpperCase() === "TABLE" ? "tabela" : "view") + " " + C(m[2]) + ".";
    if ((m = t.match(/^FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)/i))) return "Declara " + C(m[1]) + " como chave estrangeira: cada valor precisa existir em " + C(m[2] + "." + m[3]) + ".";
    if ((m = t.match(/^(\w+)\s+(INTEGER|INT|TEXT|VARCHAR|REAL|NUMERIC|DECIMAL|DATE|BOOLEAN)\b(.*?),?$/i))) {
      const cs = constraints(m[3]);
      return "Coluna " + C(m[1]) + ", do tipo " + m[2].toUpperCase() + " (" + TYPES[m[2].toUpperCase()] + ")" + (cs.length ? "; " + cs.join("; ") : "") + ".";
    }
    if (/^\)\s*;?$/.test(t)) return "Fecha a lista de colunas. O `;` termina o comando.";
    return null;
  }
  const KIND_SQL = [
    [/^SELECT/i, "Consulta (SELECT)"],
    [/^INSERT/i, "Inserção de dados (INSERT)"],
    [/^UPDATE/i, "Alteração de dados (UPDATE)"],
    [/^DELETE/i, "Exclusão de dados (DELETE)"],
    [/^CREATE TABLE/i, "Criação de tabela (CREATE TABLE)"],
    [/^CREATE VIEW/i, "Criação de view (CREATE VIEW)"],
    [/^ALTER/i, "Mudança de estrutura (ALTER TABLE)"],
    [/^DROP/i, "Remoção (DROP)"],
    [/^(BEGIN|COMMIT|ROLLBACK)/i, "Transação"],
  ];
  function sql(code) {
    const lines = code.replace(/\s+$/, "").split("\n");
    const stmts = [];
    let cur = null;
    let unknown = 0;
    lines.forEach((raw) => {
      const t = raw.trim();
      if (!t) return;
      if (!cur) {
        const k = KIND_SQL.find(([re]) => re.test(t));
        cur = { title: k ? k[1] : "Comando", lines: [] };
        stmts.push(cur);
      }
      let text = sqlClause(t);
      if (!text) {
        unknown++;
        text = "Parte do comando: " + C(t) + ".";
      }
      cur.lines.push({ code: raw.replace(/\s+$/, ""), text, gloss: glossSql(t), indent: raw.match(/^ */)[0].length, children: [] });
      if (/;\s*$/.test(t) && !t.startsWith("--")) cur = null;
    });
    // dentro de cada comando, linhas com mais recuo viram filhas da anterior com menos recuo
    const nodes = stmts.map((st) => {
      const root = { children: [], indent: -1 };
      const stack = [root];
      st.lines.forEach((n) => {
        while (stack.length > 1 && stack[stack.length - 1].indent >= n.indent) stack.pop();
        stack[stack.length - 1].children.push(n);
        stack.push(n);
      });
      if (st.lines.length === 1) return Object.assign(st.lines[0], { title: st.title });
      return { title: st.title, code: null, text: null, children: root.children };
    });
    return { nodes, unknown };
  }

  window.EXPLAIN = { python, sql };
})();
