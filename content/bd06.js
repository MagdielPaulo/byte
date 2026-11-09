/* Banco de Dados · Módulo 6 */
CONTENT.push({
  id: "b06",
  course: "bd",
  title: "Restrições de integridade",
  tagline: "NOT NULL, UNIQUE, DEFAULT, CHECK e FOREIGN KEY",
  accent: "blue",
  lessons: [
    {
      id: "b06-l1",
      title: "Regras que protegem os dados",
      summary: "O SGBD barrando dado errado",
      steps: [
        {
          kind: "explain",
          title: "Integridade",
          body: [
            "**Integridade** é ter dados corretos e coerentes. As **restrições** são regras que o próprio SGBD faz cumprir: se um comando quebra a regra, ele é recusado.",
          ],
          table: {
            head: ["Restrição", "Garante que", "Exemplo"],
            rows: [
              ["PRIMARY KEY", "cada linha tem um identificador único", "id INTEGER PRIMARY KEY"],
              ["NOT NULL", "o valor não fica vazio", "nick TEXT NOT NULL"],
              ["UNIQUE", "o valor não se repete", "nick TEXT UNIQUE"],
              ["DEFAULT", "existe um valor padrão", "pontos INTEGER DEFAULT 0"],
              ["CHECK", "o valor segue uma regra", "CHECK (nivel BETWEEN 1 AND 100)"],
              ["FOREIGN KEY", "a referência existe na outra tabela", "REFERENCES guildas(id)"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Veja o banco recusando",
          body: [
            "A tabela `jogadores` tem várias restrições. Rode: o nick Kira já existe, e o UNIQUE barra.",
            "Depois apague o `--` de uma das linhas de baixo (e coloque `--` na primeira) para ver as outras regras em ação.",
          ],
          code: `INSERT INTO jogadores (nick, classe, nivel) VALUES ('Kira', 'Mago', 10);
-- INSERT INTO jogadores (nick, classe, nivel) VALUES ('Nova', 'Mago', 150);
-- INSERT INTO jogadores (nick, classe, nivel) VALUES (NULL, 'Mago', 10);
-- INSERT INTO jogadores (nick, classe, nivel, guilda_id) VALUES ('Nova', 'Mago', 5, 99);`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Qual restrição impede um jogador de ser cadastrado com nível 150?",
          options: [
            { text: "CHECK (nivel BETWEEN 1 AND 100)", correct: true, why: "O CHECK confere se o valor segue a regra. 150 está fora do intervalo." },
            { text: "NOT NULL", why: "NOT NULL só impede o valor vazio." },
            { text: "UNIQUE", why: "UNIQUE impede repetição. Dois jogadores poderiam ter o mesmo nível." },
          ],
        },
        {
          kind: "quiz",
          question: "Você tenta cadastrar uma partida com jogador_id = 99, mas não existe jogador 99. O que acontece?",
          options: [
            { text: "Erro de FOREIGN KEY: o jogador 99 não existe", correct: true, why: "A chave estrangeira só aceita valores que existem na tabela apontada." },
            { text: "O banco cria o jogador 99 sozinho", why: "O SGBD nunca inventa dados. Ele só recusa." },
            { text: "A partida é salva normalmente", why: "Isso deixaria uma partida de ninguém. A restrição de chave estrangeira impede." },
          ],
        },
        {
          kind: "fill",
          prompt: "Complete a tabela de contas: e-mail sem repetir, saldo começando em 0 e idade mínima de 13 anos.",
          code: `CREATE TABLE contas (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL __1__,
  saldo REAL __2__ 0,
  idade INTEGER __3__ (idade >= 13)
);`,
          answers: ["UNIQUE", "DEFAULT", "CHECK"],
          bank: ["UNIQUE", "DEFAULT", "CHECK", "NULL", "KEY"],
          explain: "UNIQUE barra e-mail repetido, DEFAULT dá o valor inicial e CHECK confere a regra da idade.",
        },
        {
          kind: "code",
          title: "Tabela de torneios",
          prompt:
            "Crie a tabela `torneios` com: `id` chave primária; `nome` texto **obrigatório e sem repetir**; `vagas` inteiro com valor padrão **16** e que precisa ser **maior que 1**.",
          starter: "-- escreva o CREATE TABLE abaixo\n",
          check: `INSERT INTO torneios (nome) VALUES ('Liga');
SELECT nome, vagas FROM torneios;`,
          probes: [
            "INSERT INTO torneios (nome) VALUES (NULL);",
            "INSERT INTO torneios (nome) VALUES ('Copa'); INSERT INTO torneios (nome) VALUES ('Copa');",
            "INSERT INTO torneios (nome, vagas) VALUES ('Solo', 1);",
            "INSERT INTO torneios (nome, vagas) VALUES ('Duo', 2);",
          ],
          hints: [
            "O nome leva duas restrições juntas: `nome TEXT NOT NULL UNIQUE,`",
            "As vagas também: `vagas INTEGER DEFAULT 16 CHECK (vagas > 1)`",
          ],
          solution: `CREATE TABLE torneios (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  vagas INTEGER DEFAULT 16 CHECK (vagas > 1)
);`,
          after: "A correção tentou cadastrar torneios sem nome, com nome repetido e com 1 vaga. As suas regras barraram todos.",
        },
      ],
    },
  ],
  cards: [
    { front: "NOT NULL", back: "A coluna não pode ficar vazia." },
    { front: "UNIQUE", back: "O valor não pode se repetir na coluna." },
    { front: "DEFAULT", back: "Valor usado quando o INSERT não informa a coluna." },
    { front: "CHECK", back: "Regra que o valor precisa cumprir.", code: `CHECK (nivel BETWEEN 1 AND 100)` },
    { front: "FOREIGN KEY", back: "Só aceita valores que existem na tabela apontada e impede apagar o que ainda é usado." },
  ],
});
