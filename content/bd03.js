/* Banco de Dados · Módulo 3 */
CONTENT.push({
  id: "b03",
  course: "bd",
  title: "Consultas com SELECT",
  tagline: "WHERE, AND, OR, ORDER BY, LIMIT e LIKE",
  accent: "pink",
  lessons: [
    {
      id: "b03-l1",
      title: "Filtrando com WHERE",
      summary: "Mostrar só as linhas que interessam",
      steps: [
        {
          kind: "explain",
          title: "WHERE: só o que interessa",
          body: ["O `WHERE` filtra as linhas: só aparecem as que passam na condição."],
          code: `SELECT nick, nivel
FROM jogadores
WHERE nivel >= 40;`,
          run: true,
          table: {
            head: ["Sinal", "Significa"],
            rows: [
              ["=", "igual"],
              ["<> ou !=", "diferente"],
              ["> e <", "maior e menor"],
              [">= e <=", "maior ou igual, menor ou igual"],
            ],
          },
          warn: "Texto vai entre **aspas simples**: `WHERE classe = 'Mago'`. Número vai sem aspas.",
        },
        {
          kind: "quiz",
          question: "Quantas linhas esta consulta devolve? (O jogo tem 2 jogadores da classe Suporte.)",
          code: `SELECT nick
FROM jogadores
WHERE classe = 'Suporte';`,
          mono: true,
          options: [
            { text: "2", correct: true, why: "Só passam as linhas em que a classe é Suporte: Rui e Luna." },
            { text: "12", why: "12 é o total de jogadores. O WHERE deixa passar só os de Suporte." },
            { text: "1", why: "O WHERE devolve todas as linhas que combinam, não só a primeira." },
          ],
        },
        {
          kind: "code",
          title: "Itens baratos",
          prompt: "Mostre o **nome** e o **preço** dos itens que custam **menos de 100**.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Depois do FROM, acrescente uma linha com `WHERE preco < 100`."],
          solution: `SELECT nome, preco
FROM itens
WHERE preco < 100;`,
        },
        {
          kind: "explain",
          title: "AND, OR, BETWEEN e IN",
          body: [
            "`AND`: as duas condições precisam ser verdadeiras. `OR`: basta uma.",
            "Atalhos úteis: `nivel BETWEEN 20 AND 40` (de 20 a 40, incluindo os dois) e `classe IN ('Mago', 'Suporte')` (qualquer um da lista).",
          ],
          code: `SELECT nick, classe, nivel
FROM jogadores
WHERE classe = 'Guerreiro' AND nivel > 20;`,
          run: true,
        },
        {
          kind: "code",
          title: "Time de apoio",
          prompt: "Mostre o **nick** e a **classe** dos jogadores que são **Mago** ou **Suporte**.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Use `OR`: `WHERE classe = 'Mago' OR classe = 'Suporte'`.", "Também vale `WHERE classe IN ('Mago', 'Suporte')`."],
          solution: `SELECT nick, classe
FROM jogadores
WHERE classe = 'Mago' OR classe = 'Suporte';`,
        },
        {
          kind: "code",
          bug: true,
          title: "Consulta quebrada",
          prompt: "A consulta deveria mostrar nick e nível dos jogadores da classe Arqueiro, mas tem **2 erros**. Rode, leia a mensagem e conserte.",
          starter: `SELECT nick, nivel,
FROM jogadores
WHERE classe = 'Arqueiro;
`,
          hints: ["A última coluna antes do FROM não leva vírgula.", "O texto 'Arqueiro' precisa fechar a aspa simples antes do ponto e vírgula."],
          solution: `SELECT nick, nivel
FROM jogadores
WHERE classe = 'Arqueiro';`,
        },
      ],
    },
    {
      id: "b03-l2",
      title: "Ordenar, limitar e buscar",
      summary: "ORDER BY, LIMIT e LIKE",
      steps: [
        {
          kind: "explain",
          title: "ORDER BY: em ordem",
          body: ["`ORDER BY coluna` ordena o resultado. `ASC` é crescente (o padrão) e `DESC` é decrescente."],
          code: `SELECT nick, pontos
FROM jogadores
ORDER BY pontos DESC;`,
          run: true,
        },
        {
          kind: "explain",
          title: "LIMIT: só os primeiros",
          body: ["`LIMIT n` corta o resultado nas primeiras n linhas. Junto com o ORDER BY, vira um ranking."],
          code: `SELECT nick, pontos
FROM jogadores
ORDER BY pontos DESC
LIMIT 3;`,
          run: true,
        },
        {
          kind: "code",
          title: "Top 5",
          prompt: "Mostre o **nick** e os **pontos** dos **5 jogadores com mais pontos**, do maior para o menor.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["`ORDER BY pontos DESC` deixa o maior em cima.", "Termine com `LIMIT 5`."],
          solution: `SELECT nick, pontos
FROM jogadores
ORDER BY pontos DESC
LIMIT 5;`,
        },
        {
          kind: "explain",
          title: "LIKE: busca por parte do texto",
          body: [
            "`LIKE` compara texto com um molde. `%` vale qualquer sequência de letras e `_` vale exatamente uma letra.",
            "`'Pocao%'` começa com Pocao. `'%Arcano'` termina com Arcano. `'%de%'` tem \"de\" em qualquer lugar.",
          ],
          code: `SELECT nome, preco
FROM itens
WHERE nome LIKE 'Pocao%';`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Qual filtro encontra os itens cujo nome termina com Sombria?",
          mono: true,
          options: [
            { text: "nome LIKE '%Sombria'", correct: true, why: "O % no começo aceita qualquer coisa antes, e o nome precisa acabar em Sombria." },
            { text: "nome LIKE 'Sombria%'", why: "Assim encontra nomes que começam com Sombria." },
            { text: "nome = '%Sombria'", why: "O = compara exatamente e não entende o %. Para moldes, use LIKE." },
          ],
        },
        {
          kind: "code",
          title: "Vitrine de armas",
          prompt: "Mostre **nome** e **preço** dos itens do tipo **Arma**, da mais cara para a mais barata.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Filtro: `WHERE tipo = 'Arma'`.", "Ordem: `ORDER BY preco DESC`, sempre depois do WHERE."],
          solution: `SELECT nome, preco
FROM itens
WHERE tipo = 'Arma'
ORDER BY preco DESC;`,
        },
        {
          kind: "order",
          prompt: "Monte a consulta: jogadores da guilda 1, do maior nível para o menor.",
          lines: ["SELECT nick, nivel", "FROM jogadores", "WHERE guilda_id = 1", "ORDER BY nivel DESC;"],
          extra: ["ORDER nivel BY DESC;"],
          explain: "A ordem das partes é sempre: SELECT, FROM, WHERE, ORDER BY e, se tiver, LIMIT.",
        },
      ],
    },
  ],
  cards: [
    { front: "Para que serve o WHERE?", back: "Filtra as linhas: só aparecem as que passam na condição." },
    { front: "Texto no WHERE", back: "Entre aspas simples.", code: `WHERE classe = 'Mago'` },
    { front: "ORDER BY pontos DESC", back: "Ordena do maior para o menor. ASC (o padrão) é do menor para o maior." },
    { front: "LIKE '%Arcano'", back: "Encontra textos que terminam com Arcano. O % vale qualquer sequência." },
    { front: "Ordem das partes do SELECT", back: "SELECT, FROM, WHERE, ORDER BY, LIMIT." },
  ],
});
