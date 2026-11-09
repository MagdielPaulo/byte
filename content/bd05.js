/* Banco de Dados · Módulo 5 */
CONTENT.push({
  id: "b05",
  course: "bd",
  title: "Criando bancos e tabelas",
  tagline: "CREATE DATABASE, CREATE TABLE, tipos e DROP",
  accent: "amber",
  lessons: [
    {
      id: "b05-l1",
      title: "CREATE TABLE",
      summary: "Tipos de dados e criação de tabelas",
      steps: [
        {
          kind: "explain",
          title: "Criando o banco",
          body: [
            "No MySQL e no PostgreSQL, o primeiro passo é criar o banco e entrar nele:",
            "No **SQLite** o banco é um arquivo, então não existe `CREATE DATABASE`. Aqui no site o banco já está aberto: é só criar as tabelas.",
          ],
          code: `-- MySQL
CREATE DATABASE escola;
USE escola;`,
        },
        {
          kind: "explain",
          title: "Tipos de dados",
          body: ["Cada coluna tem um tipo. O tipo diz que valor ela guarda."],
          table: {
            head: ["Tipo", "Guarda", "Exemplo"],
            rows: [
              ["INTEGER (ou INT)", "Número inteiro", "nivel, idade"],
              ["REAL ou DECIMAL(10,2)", "Número com casas decimais", "preço, altura"],
              ["TEXT ou VARCHAR(50)", "Texto", "nick, nome"],
              ["DATE", "Data no formato AAAA-MM-DD", "'2026-11-09'"],
              ["BOOLEAN", "Verdadeiro ou falso", "ativo"],
            ],
          },
          tip: "Para dinheiro, sistemas reais usam `DECIMAL(10,2)`, que guarda os centavos sem arredondar.",
        },
        {
          kind: "explain",
          title: "CREATE TABLE",
          body: [
            "Entre parênteses, cada coluna vem com nome e tipo, separadas por vírgula. A última coluna não leva vírgula.",
            "`INTEGER PRIMARY KEY` faz o id ser gerado sozinho a cada cadastro. O `INSERT`, que cadastra, você vai ver com calma no módulo de manipulação.",
          ],
          code: `CREATE TABLE missoes (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  recompensa INTEGER
);

INSERT INTO missoes (titulo, recompensa) VALUES ('Derrotar o Golem', 300);
SELECT * FROM missoes;`,
          run: true,
        },
        {
          kind: "order",
          prompt: "Monte o comando que cria a tabela conquistas.",
          lines: ["CREATE TABLE conquistas (", "  id INTEGER PRIMARY KEY,", "  nome TEXT NOT NULL,", "  pontos INTEGER", ");"],
          extra: ["  pontos INTEGER,"],
          explain: "Todas as colunas são separadas por vírgula, menos a última. Uma vírgula antes do `)` dá erro de escrita.",
        },
        {
          kind: "code",
          title: "Tabela de skins",
          prompt: "Crie a tabela `skins` com três colunas: `id` inteiro e chave primária, `nome` texto **obrigatório** (NOT NULL) e `preco` decimal (REAL).",
          starter: "-- escreva o CREATE TABLE abaixo\n",
          check: `SELECT name, pk FROM pragma_table_info('skins') ORDER BY cid;`,
          probes: ["INSERT INTO skins (nome, preco) VALUES (NULL, 10);", "INSERT INTO skins (nome, preco) VALUES ('Neon', 15.5);"],
          hints: ["Comece com `CREATE TABLE skins (` e feche com `);`.", "As colunas: `id INTEGER PRIMARY KEY,` depois `nome TEXT NOT NULL,` e por fim `preco REAL`."],
          solution: `CREATE TABLE skins (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  preco REAL
);`,
        },
        {
          kind: "explain",
          title: "DROP TABLE",
          body: [
            "`DROP TABLE` apaga a tabela inteira: a estrutura e todos os dados dela. Não tem desfazer.",
            "`DROP TABLE IF EXISTS missoes;` só apaga se ela existir, sem dar erro.",
          ],
          code: `CREATE TABLE teste (id INTEGER PRIMARY KEY);
DROP TABLE teste;
SELECT name FROM sqlite_master WHERE type = 'table';`,
          run: true,
          warn: "Num sistema real, rode DROP TABLE só com backup feito e certeza do nome da tabela.",
        },
        {
          kind: "quiz",
          question: "O que está errado neste comando?",
          code: `CREATE TABLE eventos (
  id INTEGER PRIMARY KEY,
  nome TEXT,
);`,
          options: [
            { text: "Tem uma vírgula sobrando depois da última coluna", correct: true, why: "A vírgula separa colunas. Depois de nome TEXT não vem mais nenhuma, então a vírgula sobra." },
            { text: "Falta ponto e vírgula entre as colunas", why: "Entre colunas vai vírgula. O ponto e vírgula só fecha o comando inteiro." },
            { text: "TEXT não é um tipo válido", why: "TEXT é válido. O problema é a vírgula antes do )." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "Como criar um banco no MySQL?", back: "CREATE DATABASE nome; e depois USE nome; (no SQLite o banco é um arquivo)." },
    { front: "Tipos de dados comuns", back: "INTEGER, REAL ou DECIMAL, TEXT ou VARCHAR, DATE, BOOLEAN." },
    { front: "CREATE TABLE", back: "Nome da tabela e, entre parênteses, as colunas com seus tipos, separadas por vírgula.", code: `CREATE TABLE skins (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);` },
    { front: "DROP TABLE", back: "Apaga a tabela inteira, estrutura e dados. Não tem desfazer." },
  ],
});
