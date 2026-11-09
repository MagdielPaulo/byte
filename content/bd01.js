/* Banco de Dados · Módulo 1 */
CONTENT.push({
  id: "b01",
  course: "bd",
  title: "Sistemas de banco de dados",
  tagline: "Dados, SGBD, componentes e o primeiro SELECT",
  accent: "cyan",
  lessons: [
    {
      id: "b01-l1",
      title: "Dados, banco e SGBD",
      summary: "O que é um banco de dados e quem cuida dele",
      steps: [
        {
          kind: "explain",
          title: "Onde ficam os dados",
          body: [
            "Seu nick, seu nível, o histórico de partidas, os itens da loja: tudo isso fica guardado num **banco de dados**, uma coleção organizada de dados.",
            "Quem cuida do banco é o **SGBD** (Sistema Gerenciador de Banco de Dados). É o programa que guarda, busca, protege e organiza os dados. Exemplos: MySQL, PostgreSQL e SQLite.",
            "**Dado** é o valor solto: `42`. **Informação** é o dado com sentido: a Kira está no nível 42.",
          ],
        },
        {
          kind: "explain",
          title: "Componentes de um sistema de banco de dados",
          body: ["Um sistema de banco de dados não é só o arquivo com os dados. Ele tem cinco partes:"],
          table: {
            head: ["Componente", "O que é", "Exemplo no jogo"],
            rows: [
              ["Dados", "O que está guardado", "Jogadores, partidas, itens"],
              ["SGBD", "Programa que gerencia os dados", "MySQL, PostgreSQL, SQLite"],
              ["Hardware", "Onde tudo roda", "Servidor, nuvem, celular"],
              ["Usuários", "Quem usa ou administra", "DBA, desenvolvedor, jogador"],
              ["Aplicações", "Programas que conversam com o banco", "O jogo, o site da loja"],
            ],
          },
          tip: "A aplicação não mexe direto no arquivo do banco. Ela pede ao SGBD, usando a linguagem **SQL**.",
        },
        {
          kind: "quiz",
          question: "No jogo online, qual destes é o SGBD?",
          options: [
            { text: "O PostgreSQL, que guarda e busca os dados", correct: true, why: "O SGBD é o software que gerencia o banco: guarda, busca, protege e organiza." },
            { text: "O servidor na nuvem", why: "O servidor é o hardware, onde o SGBD roda." },
            { text: "A tabela de jogadores", why: "A tabela faz parte dos dados. Quem gerencia os dados é o SGBD." },
            { text: "O jogador", why: "O jogador é um usuário final do sistema." },
          ],
        },
        {
          kind: "quiz",
          question: "O que faz o DBA (administrador de banco de dados)?",
          options: [
            { text: "Cuida do banco: desempenho, backups, segurança e permissões", correct: true, why: "DBA vem de Database Administrator. É a pessoa responsável pela saúde do banco." },
            { text: "Joga e gera os dados das partidas", why: "Esse é o usuário final." },
            { text: "É o programa que executa os comandos SQL", why: "Quem executa os comandos é o SGBD. O DBA é uma pessoa." },
          ],
        },
        {
          kind: "explain",
          title: "SQL: a língua do banco",
          body: [
            "**SQL** (Structured Query Language) é a linguagem para conversar com o SGBD. Quase todo banco relacional entende SQL.",
            "Leia o comando abaixo assim: SELECIONE tudo (`*`) DA tabela `jogadores`. Clique em **Rodar**.",
          ],
          code: `SELECT * FROM jogadores;`,
          run: true,
          tip: "O ponto e vírgula marca o fim de cada comando. Maiúsculas são só um costume para destacar as palavras do SQL: `select` também funciona.",
        },
        {
          kind: "quiz",
          question: "O que o * significa em SELECT * FROM jogadores?",
          options: [
            { text: "Todas as colunas", correct: true, why: "O asterisco pede todas as colunas da tabela." },
            { text: "Multiplicação", why: "Em contas o * multiplica, mas logo depois do SELECT ele quer dizer todas as colunas." },
            { text: "Só a primeira linha", why: "Ele não limita linhas. Para isso existe o LIMIT, que você vai ver depois." },
            { text: "Todas as tabelas do banco", why: "O FROM diz de qual tabela. O * fala das colunas dessa tabela." },
          ],
        },
      ],
    },
    {
      id: "b01-l2",
      title: "Tabelas, linhas e colunas",
      summary: "Como os dados ficam organizados e como escolher colunas",
      steps: [
        {
          kind: "explain",
          title: "Tudo em tabelas",
          body: [
            "Num banco relacional, os dados ficam em **tabelas**. Cada **coluna** é um tipo de informação. Cada **linha** (também chamada de registro) é um item.",
            "Na tabela `jogadores`, cada linha é um jogador e cada coluna é um dado sobre ele.",
          ],
          table: {
            head: ["id", "nick", "classe", "nivel", "pontos"],
            rows: [
              ["1", "Kira", "Mago", "42", "1850"],
              ["2", "Shadow", "Assassino", "55", "2310"],
              ["3", "Leo", "Guerreiro", "18", "640"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Na tabela jogadores, o que é uma linha?",
          options: [
            { text: "Um jogador, com todos os dados dele", correct: true, why: "Cada linha (registro) representa um item da tabela: aqui, um jogador." },
            { text: "Uma informação de todos os jogadores, como o nível", why: "Isso é uma coluna." },
            { text: "O banco de dados inteiro", why: "O banco tem várias tabelas, e cada tabela tem várias linhas." },
          ],
        },
        {
          kind: "explain",
          title: "Escolhendo as colunas",
          body: ["Em vez do `*`, você pode listar só as colunas que quer ver, separadas por vírgula. A ordem da lista é a ordem do resultado."],
          code: `SELECT nick, nivel
FROM jogadores;`,
          run: true,
        },
        {
          kind: "fill",
          prompt: "Complete para mostrar o nome e o preço de cada item da loja.",
          code: `SELECT __1__, preco
__2__ itens;`,
          answers: ["nome", "FROM"],
          bank: ["nome", "FROM", "WHERE", "itens", "*"],
          explain: "Primeiro vêm as colunas (`nome, preco`), depois `FROM` com o nome da tabela.",
        },
        {
          kind: "code",
          title: "Catálogo da loja",
          prompt: "Mostre o **nome**, o **tipo** e a **raridade** de todos os itens da tabela `itens`.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["A estrutura é `SELECT colunas FROM tabela;`", "`SELECT nome, tipo, raridade` e, na linha de baixo, `FROM itens;`"],
          solution: `SELECT nome, tipo, raridade
FROM itens;`,
        },
        {
          kind: "code",
          title: "Placar",
          prompt: "Mostre o **nick** e os **pontos** de todos os jogadores.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["As colunas são `nick` e `pontos`, da tabela `jogadores`."],
          solution: `SELECT nick, pontos
FROM jogadores;`,
        },
      ],
    },
  ],
  cards: [
    { front: "O que é um SGBD?", back: "O programa que gerencia o banco de dados: guarda, busca, protege e organiza. Ex.: MySQL, PostgreSQL, SQLite." },
    { front: "Componentes de um sistema de banco de dados", back: "Dados, SGBD, hardware, usuários e aplicações." },
    { front: "Dado × informação", back: "Dado é o valor solto (42). Informação é o dado com sentido (Kira está no nível 42)." },
    { front: "Linha × coluna", back: "Linha (registro) é um item, como um jogador. Coluna é um tipo de informação, como o nível." },
    { front: "SELECT * FROM jogadores;", back: "Mostra todas as colunas de todas as linhas da tabela jogadores." },
  ],
});
