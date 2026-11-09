/* Banco de Dados · Módulo 8 */
CONTENT.push({
  id: "b08",
  course: "bd",
  title: "Alterando a estrutura",
  tagline: "ALTER TABLE: adicionar, renomear e remover colunas",
  accent: "violet",
  lessons: [
    {
      id: "b08-l1",
      title: "ALTER TABLE",
      summary: "Mudar uma tabela sem perder os dados",
      steps: [
        {
          kind: "explain",
          title: "A estrutura muda com o tempo",
          body: [
            "O jogo ganhou uma novidade e a tabela precisa de outra coluna? Não precisa apagar e criar de novo. O `ALTER TABLE` muda a estrutura e mantém os dados.",
          ],
          table: {
            head: ["Comando", "Faz"],
            rows: [
              ["ALTER TABLE t ADD COLUMN c TIPO", "Acrescenta uma coluna"],
              ["ALTER TABLE t RENAME COLUMN a TO b", "Renomeia uma coluna"],
              ["ALTER TABLE t RENAME TO novo", "Renomeia a tabela"],
              ["ALTER TABLE t DROP COLUMN c", "Remove uma coluna e os dados dela"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Adicionando uma coluna",
          body: ["Quem já estava na tabela recebe o valor padrão (DEFAULT). Sem DEFAULT, a coluna nova fica NULL."],
          code: `ALTER TABLE jogadores
ADD COLUMN pais TEXT DEFAULT 'BR';

SELECT nick, pais FROM jogadores;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Qual comando muda a ESTRUTURA da tabela, e não os dados?",
          options: [
            { text: "ALTER TABLE", correct: true, why: "ALTER TABLE muda colunas e nome da tabela. Os dados de dentro ficam." },
            { text: "UPDATE", why: "UPDATE muda valores dentro das linhas. A estrutura continua igual." },
            { text: "INSERT", why: "INSERT acrescenta linhas, não colunas." },
          ],
        },
        {
          kind: "code",
          title: "Troféus da guilda",
          prompt: "Adicione à tabela `guildas` a coluna `trofeus`, inteiro, com valor padrão **0**.",
          starter: "-- escreva o ALTER TABLE abaixo\n",
          check: `SELECT nome, trofeus FROM guildas ORDER BY id;`,
          hints: ["`ALTER TABLE guildas ADD COLUMN ...`", "A coluna: `trofeus INTEGER DEFAULT 0`"],
          solution: `ALTER TABLE guildas
ADD COLUMN trofeus INTEGER DEFAULT 0;`,
        },
        {
          kind: "code",
          title: "Nome mais curto",
          prompt: "A coluna `duracao_min` da tabela `partidas` vai passar a se chamar `minutos`. Renomeie.",
          starter: "-- escreva o ALTER TABLE abaixo\n",
          check: `SELECT name FROM pragma_table_info('partidas') ORDER BY cid;`,
          hints: ["`ALTER TABLE partidas RENAME COLUMN antigo TO novo;`"],
          solution: `ALTER TABLE partidas
RENAME COLUMN duracao_min TO minutos;`,
        },
        {
          kind: "fill",
          prompt: "Complete para remover a coluna raridade da tabela itens.",
          code: `ALTER TABLE itens __1__ COLUMN raridade;`,
          answers: ["DROP"],
          bank: ["DROP", "DELETE", "REMOVE", "ALTER"],
          explain: "DROP COLUMN apaga a coluna e os dados dela. DELETE apaga linhas, não colunas.",
        },
      ],
    },
  ],
  cards: [
    { front: "ALTER TABLE ... ADD COLUMN", back: "Acrescenta uma coluna. As linhas antigas recebem o DEFAULT, ou NULL." },
    { front: "RENAME COLUMN", back: "Renomeia uma coluna sem perder os dados.", code: `ALTER TABLE partidas
RENAME COLUMN duracao_min TO minutos;` },
    { front: "ALTER × UPDATE", back: "ALTER muda a estrutura (colunas). UPDATE muda os valores das linhas." },
  ],
});
