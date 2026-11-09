/* Banco de Dados · Módulo 4 */
CONTENT.push({
  id: "b04",
  course: "bd",
  title: "Chaves e relacionamentos",
  tagline: "Chave primária, chave estrangeira e JOIN",
  accent: "green",
  lessons: [
    {
      id: "b04-l1",
      title: "Chaves primárias e estrangeiras",
      summary: "Como cada linha é identificada e como as tabelas se ligam",
      steps: [
        {
          kind: "explain",
          title: "Chave primária (PK)",
          body: [
            "A **chave primária** identifica cada linha. Ela **nunca repete** e **nunca fica vazia**. Na tabela `jogadores`, a chave primária é o `id`.",
            "Por que não usar o nick? Porque o jogador pode trocar de nick. O `id` nunca muda.",
            "Na vida real é igual: a matrícula identifica o aluno, porque dois alunos podem ter o mesmo nome.",
          ],
        },
        {
          kind: "quiz",
          question: "Qual coluna é a melhor chave primária para uma tabela de alunos?",
          options: [
            { text: "matricula", correct: true, why: "Cada aluno tem uma matrícula única, que não muda." },
            { text: "nome", why: "Dois alunos podem se chamar João Silva." },
            { text: "turma", why: "Muitos alunos estão na mesma turma." },
            { text: "idade", why: "Muitos alunos têm a mesma idade, e ela muda todo ano." },
          ],
        },
        {
          kind: "explain",
          title: "Chave estrangeira (FK)",
          body: [
            "A **chave estrangeira** é uma coluna que aponta para a chave primária de outra tabela. É ela que liga as tabelas.",
            "`jogadores.guilda_id` aponta para `guildas.id`. Assim, uma guilda tem vários jogadores, e cada jogador está em no máximo uma guilda. Isso é um relacionamento **1 para N**.",
            "Rode e compare as duas tabelas. O Kai e a Ana estão sem guilda: o `guilda_id` deles é `NULL` (vazio).",
          ],
          code: `SELECT nick, guilda_id FROM jogadores;
SELECT * FROM guildas;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Na tabela partidas, o que é a coluna jogador_id?",
          options: [
            { text: "Uma chave estrangeira que aponta para jogadores.id", correct: true, why: "Ela diz de qual jogador é cada partida, apontando para a chave primária de jogadores." },
            { text: "A chave primária de partidas", why: "A chave primária de partidas é partidas.id. O jogador_id pode repetir: um jogador tem várias partidas." },
            { text: "O nick do jogador", why: "Ela guarda o número (id) do jogador, não o nick." },
          ],
        },
        {
          kind: "code",
          title: "Membros da guilda",
          prompt: "A guilda **Pixel Rebels** tem id **2**. Usando a chave estrangeira, mostre o **nick** dos jogadores dessa guilda.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["A coluna que liga o jogador à guilda é `guilda_id`.", "`WHERE guilda_id = 2`"],
          solution: `SELECT nick
FROM jogadores
WHERE guilda_id = 2;`,
        },
      ],
    },
    {
      id: "b04-l2",
      title: "Juntando tabelas com JOIN",
      summary: "Mostrar dados de duas tabelas numa consulta",
      steps: [
        {
          kind: "explain",
          title: "JOIN",
          body: [
            "O `JOIN` junta as linhas de duas tabelas que combinam pela chave. O `ON` diz qual é a ligação.",
            "Repare que Kai e Ana não aparecem: o JOIN só mostra quem tem par na outra tabela.",
          ],
          code: `SELECT jogadores.nick, guildas.nome
FROM jogadores
JOIN guildas ON jogadores.guilda_id = guildas.id;`,
          run: true,
        },
        {
          kind: "explain",
          title: "Apelidos com AS",
          body: [
            "Nomes de tabela longos cansam. Dê um apelido logo depois do nome da tabela (`jogadores j`) e use `j.nick`.",
            "`AS` também renomeia a coluna no resultado: `g.nome AS guilda`.",
          ],
          code: `SELECT j.nick, g.nome AS guilda
FROM jogadores j
JOIN guildas g ON j.guilda_id = g.id;`,
          run: true,
        },
        {
          kind: "fill",
          prompt: "Complete para mostrar o modo de cada partida e o nick de quem jogou.",
          code: `SELECT p.modo, j.nick
FROM partidas p
JOIN jogadores j __1__ p.jogador_id = __2__;`,
          answers: ["ON", "j.id"],
          bank: ["ON", "WHERE", "j.id", "p.id", "j.nick"],
          explain: "A chave estrangeira `p.jogador_id` aponta para a chave primária `j.id`. A ligação vai depois do `ON`.",
        },
        {
          kind: "code",
          title: "Histórico com nomes",
          prompt: "Mostre o **nick** do jogador, o **modo** e o **resultado** de cada partida.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Junte `partidas` com `jogadores` pela ligação `partidas.jogador_id = jogadores.id`.", "`SELECT j.nick, p.modo, p.resultado FROM partidas p JOIN jogadores j ON ...`"],
          solution: `SELECT j.nick, p.modo, p.resultado
FROM partidas p
JOIN jogadores j ON p.jogador_id = j.id;`,
        },
        {
          kind: "code",
          title: "Campeões de torneio",
          prompt: "Mostre o **nick** de quem **venceu** (resultado 'V') uma partida no modo **Torneio**.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["É o JOIN do exercício anterior com um WHERE.", "`WHERE p.modo = 'Torneio' AND p.resultado = 'V'`"],
          solution: `SELECT j.nick
FROM partidas p
JOIN jogadores j ON p.jogador_id = j.id
WHERE p.modo = 'Torneio' AND p.resultado = 'V';`,
        },
        {
          kind: "quiz",
          question: "Por que Kai e Ana não aparecem no JOIN entre jogadores e guildas?",
          options: [
            { text: "O guilda_id deles é NULL e não combina com nenhuma guilda", correct: true, why: "O JOIN só mostra as linhas que têm par nas duas tabelas." },
            { text: "Eles foram apagados do banco", why: "Eles continuam na tabela jogadores. Só não têm guilda." },
            { text: "O JOIN mostra no máximo 10 linhas", why: "O JOIN não tem limite de linhas." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "Chave primária (PK)", back: "Identifica cada linha. Não repete e não fica vazia." },
    { front: "Chave estrangeira (FK)", back: "Coluna que aponta para a chave primária de outra tabela. É ela que liga as tabelas." },
    { front: "Relacionamento 1 para N", back: "Uma guilda tem vários jogadores. Cada jogador está em no máximo uma guilda." },
    { front: "Para que serve o ON no JOIN?", back: "Diz como as tabelas se ligam.", code: `JOIN guildas g ON j.guilda_id = g.id` },
  ],
});
