/* Banco de Dados · Módulo 10 */
CONTENT.push({
  id: "b10",
  course: "bd",
  title: "Visões (VIEW)",
  tagline: "Consultas salvas com nome",
  accent: "green",
  lessons: [
    {
      id: "b10-l1",
      title: "Criando visões",
      summary: "CREATE VIEW, uso e segurança",
      steps: [
        {
          kind: "explain",
          title: "O que é uma view",
          body: [
            "Uma **view** (visão) é uma consulta salva com nome. Depois você usa a view como se fosse uma tabela.",
            "Ela não guarda cópia dos dados: toda vez que é usada, roda a consulta de novo.",
            "Serve para simplificar consultas longas e para mostrar só parte dos dados a quem não deve ver tudo.",
          ],
          code: `CREATE VIEW ranking AS
SELECT nick, pontos
FROM jogadores
ORDER BY pontos DESC;

SELECT * FROM ranking LIMIT 3;`,
          run: true,
        },
        {
          kind: "explain",
          title: "Sempre atualizada",
          body: ["A Ana ganhou 5000 pontos. Repare que a view já mostra a mudança."],
          code: `CREATE VIEW ranking AS
SELECT nick, pontos FROM jogadores ORDER BY pontos DESC;

UPDATE jogadores SET pontos = 5000 WHERE nick = 'Ana';

SELECT * FROM ranking LIMIT 3;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Se a tabela jogadores for atualizada, o que acontece com a view ranking?",
          options: [
            { text: "Mostra os dados novos, porque roda a consulta toda vez", correct: true, why: "A view guarda a consulta, não os resultados." },
            { text: "Continua com os dados antigos até ser criada de novo", why: "Isso seria uma cópia da tabela. A view sempre lê os dados atuais." },
            { text: "Dá erro", why: "Atualizar a tabela não afeta a definição da view." },
          ],
        },
        {
          kind: "code",
          title: "Vitrine da loja",
          prompt: "Crie a view `vitrine` com **nome** e **preço** dos itens de raridade **Raro**, **Epico** ou **Lendario**.",
          starter: "-- escreva o CREATE VIEW abaixo\n",
          check: `SELECT nome, preco FROM vitrine ORDER BY nome;`,
          hints: ["`CREATE VIEW vitrine AS` e, embaixo, um SELECT normal.", "Filtro: `WHERE raridade IN ('Raro', 'Epico', 'Lendario')`"],
          solution: `CREATE VIEW vitrine AS
SELECT nome, preco
FROM itens
WHERE raridade IN ('Raro', 'Epico', 'Lendario');`,
        },
        {
          kind: "code",
          title: "Elenco das guildas",
          prompt: "Crie a view `elenco` com o **nick** de cada jogador e o **nome da guilda** dele (só quem tem guilda).",
          starter: "-- escreva o CREATE VIEW abaixo\n",
          check: `SELECT * FROM elenco ORDER BY 1;`,
          hints: ["A consulta dentro da view é um JOIN entre jogadores e guildas.", "`JOIN guildas g ON j.guilda_id = g.id`"],
          solution: `CREATE VIEW elenco AS
SELECT j.nick, g.nome
FROM jogadores j
JOIN guildas g ON j.guilda_id = g.id;`,
        },
        {
          kind: "fill",
          prompt: "Complete para apagar a view ranking.",
          code: `__1__ VIEW ranking;`,
          answers: ["DROP"],
          bank: ["DROP", "DELETE", "ALTER", "REMOVE"],
          explain: "`DROP VIEW` apaga só a visão. A tabela e os dados continuam lá.",
        },
      ],
    },
  ],
  cards: [
    { front: "O que é uma view?", back: "Uma consulta salva com nome, usada como se fosse uma tabela." },
    { front: "A view guarda os dados?", back: "Não. Ela roda a consulta toda vez, então sempre mostra os dados atuais." },
    { front: "Para que usar views?", back: "Simplificar consultas longas e mostrar só parte dos dados a certos usuários." },
  ],
});
