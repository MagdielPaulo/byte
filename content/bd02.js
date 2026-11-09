/* Banco de Dados · Módulo 2 */
CONTENT.push({
  id: "b02",
  course: "bd",
  title: "Escolhendo um SGBD",
  tagline: "MySQL, PostgreSQL, SQLite e quando usar cada um",
  accent: "violet",
  lessons: [
    {
      id: "b02-l1",
      title: "Qual SGBD usar?",
      summary: "Comparar SGBDs e escolher pelo cenário",
      steps: [
        {
          kind: "explain",
          title: "Os SGBDs mais usados",
          body: ["Não existe um SGBD melhor para tudo. Cada um tem um ponto forte."],
          table: {
            head: ["SGBD", "Tipo", "Licença", "Onde aparece"],
            rows: [
              ["MySQL", "Relacional", "Livre (Community)", "Sites, lojas virtuais, WordPress"],
              ["PostgreSQL", "Relacional", "Livre", "Sistemas grandes, dados geográficos"],
              ["SQLite", "Relacional, num arquivo só", "Domínio público", "Celulares, apps, navegadores, este site"],
              ["SQL Server", "Relacional", "Pago (tem versão grátis limitada)", "Empresas que usam Microsoft"],
              ["Oracle", "Relacional", "Pago", "Bancos e grandes empresas"],
              ["MongoDB", "NoSQL (documentos)", "Livre e pago", "Apps com dados de formato variado"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Como escolher",
          body: ["Antes de escolher, responda algumas perguntas sobre o projeto:"],
          table: {
            head: ["Pergunta", "Por que importa"],
            rows: [
              ["Quantas pessoas vão usar ao mesmo tempo?", "Muitos acessos pedem um servidor de banco (MySQL, PostgreSQL)"],
              ["Onde vai rodar?", "No celular ou num app local, SQLite resolve sem servidor"],
              ["Quanto dá para gastar?", "Licenças como Oracle e SQL Server custam caro"],
              ["Os dados têm estrutura fixa?", "Tabelas bem definidas pedem um banco relacional"],
              ["O que a equipe já conhece?", "Aprender outra ferramenta leva tempo"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Um app de anotações precisa funcionar sem internet e guardar os dados no próprio celular. Qual SGBD combina mais?",
          options: [
            { text: "SQLite", correct: true, why: "O SQLite guarda tudo num arquivo dentro do app, sem precisar de servidor. Por isso está em quase todo celular." },
            { text: "Oracle", why: "É pago e feito para servidores de grandes empresas. Pesado demais para um app de celular." },
            { text: "PostgreSQL", why: "Precisa de um servidor rodando. Sem internet, o app não chegaria até ele." },
          ],
        },
        {
          kind: "quiz",
          question: "Uma loja virtual com milhares de pedidos por dia e sem verba para licenças. Qual escolha faz mais sentido?",
          options: [
            { text: "MySQL ou PostgreSQL", correct: true, why: "São livres, rodam em servidor e aguentam muitos acessos ao mesmo tempo." },
            { text: "SQLite", why: "Ótimo para apps locais, mas não é o mais indicado para muitas gravações simultâneas num site grande." },
            { text: "Uma planilha compartilhada", why: "Planilha não é SGBD: não tem restrições, controle de acesso concorrente nem consultas SQL." },
            { text: "Oracle", why: "Aguenta, mas a licença é cara. A loja não tem verba para isso." },
          ],
        },
        {
          kind: "quiz",
          question: "O que caracteriza um banco relacional?",
          options: [
            { text: "Dados em tabelas que se relacionam por chaves", correct: true, why: "Relacional = tabelas com colunas definidas, ligadas por chaves primárias e estrangeiras." },
            { text: "Dados guardados como documentos sem estrutura fixa", why: "Isso descreve bancos NoSQL de documentos, como o MongoDB." },
            { text: "Não usa nenhuma linguagem de consulta", why: "Bancos relacionais usam SQL." },
          ],
        },
        {
          kind: "explain",
          title: "E neste site?",
          body: [
            "Aqui usamos o **SQLite**, que roda dentro do navegador. Cada vez que você roda um exercício, o banco do jogo Arena Online volta ao estado original.",
            "Os comandos que você vai aprender (SELECT, INSERT, CREATE TABLE...) são do SQL padrão e funcionam quase iguais no MySQL e no PostgreSQL. Quando algo mudar de um SGBD para outro, a lição avisa.",
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "SQLite serve para quê?", back: "Apps e celulares: o banco fica num arquivo, sem servidor." },
    { front: "MySQL e PostgreSQL", back: "SGBDs relacionais livres, rodam em servidor e aguentam muitos acessos." },
    { front: "Relacional × NoSQL", back: "Relacional: tabelas ligadas por chaves, com SQL. NoSQL: outros formatos, como documentos (MongoDB)." },
    { front: "Critérios para escolher um SGBD", back: "Número de acessos, onde vai rodar, custo de licença, estrutura dos dados e o que a equipe conhece." },
  ],
});
