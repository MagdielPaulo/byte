/* Banco de Dados · Módulo 11 */
CONTENT.push({
  id: "b11",
  course: "bd",
  title: "Usuários e permissões",
  tagline: "CREATE USER, GRANT, REVOKE e menor privilégio",
  accent: "amber",
  lessons: [
    {
      id: "b11-l1",
      title: "Quem pode o quê",
      summary: "Usuários, permissões e o princípio do menor privilégio",
      steps: [
        {
          kind: "explain",
          title: "Nem todo mundo pode tudo",
          body: [
            "Um SGBD como MySQL ou PostgreSQL tem **usuários**, cada um com suas **permissões**.",
            "Regra de ouro: o **princípio do menor privilégio**. Cada usuário recebe só o que precisa para fazer o trabalho dele.",
          ],
          table: {
            head: ["Usuário", "Precisa", "Permissões"],
            rows: [
              ["app_jogo", "ler itens e registrar partidas", "SELECT em itens, INSERT em partidas"],
              ["analista", "gerar relatórios", "SELECT"],
              ["dba", "administrar o banco", "ALL PRIVILEGES"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Os comandos (MySQL)",
          body: [
            "`CREATE USER` cria o usuário, `GRANT` dá permissão, `REVOKE` tira e `DROP USER` apaga.",
            "`arena.*` quer dizer todas as tabelas do banco arena. `arena.jogadores` é só uma tabela.",
          ],
          code: `CREATE USER 'analista'@'localhost' IDENTIFIED BY 'S3nha!forte';
GRANT SELECT ON arena.* TO 'analista'@'localhost';
REVOKE SELECT ON arena.* FROM 'analista'@'localhost';
DROP USER 'analista'@'localhost';`,
          warn: "O SQLite deste site não tem usuários: quem abre o arquivo do banco acessa tudo. Por isso estes comandos não rodam aqui, mas rodam no MySQL e, com pequenas diferenças, no PostgreSQL.",
        },
        {
          kind: "quiz",
          question: "O app do jogo só precisa ler a tabela itens. Qual permissão dar a ele?",
          options: [
            { text: "SELECT na tabela itens", correct: true, why: "Menor privilégio: ele só lê, então só recebe SELECT, e só nessa tabela." },
            { text: "ALL PRIVILEGES no banco inteiro", why: "Se o app for invadido, o atacante poderia apagar tudo." },
            { text: "DELETE na tabela itens", why: "DELETE apaga linhas. O app só precisa ler." },
          ],
        },
        {
          kind: "order",
          prompt: "Monte os comandos: criar o usuário bot_ranking e deixar que ele só leia a tabela jogadores.",
          lines: ["CREATE USER 'bot_ranking'@'localhost' IDENTIFIED BY 'R4nk!ng';", "GRANT SELECT ON arena.jogadores TO 'bot_ranking'@'localhost';"],
          extra: ["GRANT ALL PRIVILEGES ON *.* TO 'bot_ranking'@'localhost';"],
          explain: "Primeiro o usuário precisa existir. Depois ele recebe só o SELECT na tabela jogadores. ALL PRIVILEGES daria acesso total: era a pegadinha.",
        },
        {
          kind: "fill",
          prompt: "O estagiário não deve mais cadastrar partidas. Complete para tirar a permissão.",
          code: `__1__ INSERT ON arena.partidas __2__ 'estagiario'@'localhost';`,
          answers: ["REVOKE", "FROM"],
          bank: ["REVOKE", "GRANT", "FROM", "TO", "DELETE"],
          explain: "Para dar: `GRANT ... TO`. Para tirar: `REVOKE ... FROM`.",
        },
        {
          kind: "quiz",
          question: "O analista deve ver nick e pontos dos jogadores, mas não as outras colunas. Qual a melhor solução?",
          options: [
            { text: "Criar uma view com nick e pontos e dar SELECT só nessa view", correct: true, why: "A view mostra só o necessário, e a permissão vale só para ela. Views também são ferramenta de segurança." },
            { text: "Dar SELECT na tabela jogadores e pedir para ele não olhar o resto", why: "Segurança não pode depender de boa vontade." },
            { text: "Copiar os dados para uma planilha e mandar por e-mail", why: "A cópia fica desatualizada e foge do controle do banco." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "Princípio do menor privilégio", back: "Cada usuário recebe só as permissões de que precisa." },
    { front: "GRANT", back: "Dá permissão.", code: `GRANT SELECT ON arena.* TO 'analista'@'localhost';` },
    { front: "REVOKE", back: "Tira permissão.", code: `REVOKE INSERT ON arena.partidas FROM 'estagiario'@'localhost';` },
    { front: "View como segurança", back: "Crie uma view só com as colunas permitidas e dê permissão apenas na view." },
  ],
});
