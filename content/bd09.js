/* Banco de Dados · Módulo 9 · integração com Matemática (estatística) */
CONTENT.push({
  id: "b09",
  course: "bd",
  title: "Agrupamentos e estatística",
  tagline: "COUNT, AVG, GROUP BY, frequências, histograma e amostragem",
  accent: "pink",
  lessons: [
    {
      id: "b09-l1",
      title: "Contar, somar e médias",
      summary: "Funções de agregação e medidas estatísticas",
      steps: [
        {
          kind: "explain",
          title: "Funções de agregação",
          body: ["Elas resumem várias linhas num número só."],
          table: {
            head: ["Função", "Calcula"],
            rows: [
              ["COUNT(*)", "quantidade de linhas"],
              ["SUM(coluna)", "soma"],
              ["AVG(coluna)", "média"],
              ["MIN(coluna)", "menor valor"],
              ["MAX(coluna)", "maior valor"],
            ],
          },
          code: `SELECT COUNT(*) AS jogadores,
       AVG(nivel) AS media_nivel,
       MIN(nivel) AS menor,
       MAX(nivel) AS maior
FROM jogadores;`,
          run: true,
        },
        {
          kind: "explain",
          title: "Tendência central e dispersão",
          body: [
            "**Média** (`AVG`) é uma medida de tendência central: o valor típico.",
            "**Amplitude** (`MAX - MIN`) é uma medida de dispersão: mostra o quanto os valores se espalham.",
            "A média sofre com valores extremos. A **mediana**, o valor do meio da lista ordenada, sofre menos.",
          ],
          code: `SELECT MAX(pontos) - MIN(pontos) AS amplitude
FROM jogadores;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Os abates de 4 partidas foram 2, 4, 6 e 20. Qual é a média?",
          options: [
            { text: "8", correct: true, why: "2 + 4 + 6 + 20 = 32, dividido por 4 dá 8. Repare que o 20 puxou a média para cima: a mediana é 5." },
            { text: "5", why: "5 é a mediana (o meio entre 4 e 6). A média soma tudo e divide pela quantidade." },
            { text: "18", why: "18 é a amplitude: 20 - 2." },
          ],
        },
        {
          kind: "code",
          title: "Raio-x da loja",
          prompt: "Numa linha só, mostre: a **quantidade** de itens, o **preço médio**, o **menor** preço e o **maior** preço.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Quatro funções no SELECT, separadas por vírgula.", "`SELECT COUNT(*), AVG(preco), MIN(preco), MAX(preco) FROM itens;`"],
          solution: `SELECT COUNT(*), AVG(preco), MIN(preco), MAX(preco)
FROM itens;`,
        },
        {
          kind: "code",
          title: "Amplitude dos níveis",
          prompt: "Mostre a **amplitude** dos níveis dos jogadores (maior nível menos menor nível).",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["`MAX(nivel) - MIN(nivel)`"],
          solution: `SELECT MAX(nivel) - MIN(nivel)
FROM jogadores;`,
        },
        {
          kind: "code",
          title: "Ranqueadas em números",
          prompt: "Quantas partidas do modo **Ranqueada** existem e qual a **média de abates** nelas?",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["O WHERE filtra antes de calcular: `WHERE modo = 'Ranqueada'`.", "`SELECT COUNT(*), AVG(abates) FROM partidas WHERE ...`"],
          solution: `SELECT COUNT(*), AVG(abates)
FROM partidas
WHERE modo = 'Ranqueada';`,
        },
      ],
    },
    {
      id: "b09-l2",
      title: "Frequências e gráficos",
      summary: "GROUP BY, HAVING, histograma e amostragem",
      steps: [
        {
          kind: "explain",
          title: "GROUP BY: uma conta por grupo",
          body: [
            "`GROUP BY` separa as linhas em grupos e calcula para cada um. O resultado abaixo é uma **tabela de frequência**: quantos jogadores há em cada classe.",
            "O gráfico de barras mostra a mesma informação.",
          ],
          code: `SELECT classe, COUNT(*) AS quantidade
FROM jogadores
GROUP BY classe;`,
          run: true,
          chart: true,
        },
        {
          kind: "explain",
          title: "Histograma por faixas",
          body: [
            "Para números, agrupamos em **faixas**. `nivel / 20` é divisão inteira: níveis de 0 a 19 dão 0, de 20 a 39 dão 1, e assim por diante. Multiplicando por 20, temos o início de cada faixa.",
            "O gráfico de frequência por faixa é um **histograma**. Ligando os pontos do meio de cada barra, você desenha o **polígono de frequências**, que mostra a forma da distribuição.",
          ],
          code: `SELECT (nivel / 20) * 20 AS faixa, COUNT(*) AS jogadores
FROM jogadores
GROUP BY faixa
ORDER BY faixa;`,
          run: true,
          chart: true,
        },
        {
          kind: "code",
          title: "Vitórias por jogador",
          prompt: "Mostre o `jogador_id` e a **quantidade de vitórias** (resultado 'V') de cada jogador.",
          starter: "-- escreva sua consulta abaixo\n",
          chart: true,
          hints: ["Primeiro o WHERE (só vitórias), depois o GROUP BY.", "`WHERE resultado = 'V' GROUP BY jogador_id`"],
          solution: `SELECT jogador_id, COUNT(*)
FROM partidas
WHERE resultado = 'V'
GROUP BY jogador_id;`,
        },
        {
          kind: "explain",
          title: "HAVING: filtro de grupos",
          body: ["`WHERE` filtra linhas **antes** de agrupar. `HAVING` filtra os grupos **depois** de calcular."],
          code: `SELECT modo, AVG(duracao_min) AS media_minutos
FROM partidas
GROUP BY modo
HAVING AVG(duracao_min) > 25;`,
          run: true,
        },
        {
          kind: "code",
          title: "Classes populares",
          prompt: "Mostre as classes que têm **3 ou mais** jogadores, com a quantidade de cada uma.",
          starter: "-- escreva sua consulta abaixo\n",
          hints: ["Agrupe por classe e conte.", "Filtro de grupo: `HAVING COUNT(*) >= 3`"],
          solution: `SELECT classe, COUNT(*)
FROM jogadores
GROUP BY classe
HAVING COUNT(*) >= 3;`,
        },
        {
          kind: "explain",
          title: "Amostragem",
          body: [
            "**Amostra** é uma parte que representa o todo. Pesquisas eleitorais, controle de qualidade e testes de jogo usam amostras.",
            "`ORDER BY RANDOM()` embaralha e o `LIMIT` pega uma **amostra aleatória**. Rode algumas vezes: cada execução sorteia outra amostra. Sortear evita escolher a dedo.",
          ],
          code: `SELECT nick, nivel
FROM jogadores
ORDER BY RANDOM()
LIMIT 4;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Para mostrar só as guildas com média de pontos acima de 1500, qual filtro usar?",
          options: [
            { text: "HAVING AVG(pontos) > 1500", correct: true, why: "A média só existe depois de agrupar. Filtro de grupo é com HAVING." },
            { text: "WHERE AVG(pontos) > 1500", why: "O WHERE roda antes do agrupamento, linha por linha. Lá a média ainda não existe e dá erro." },
            { text: "ORDER BY AVG(pontos) > 1500", why: "ORDER BY ordena, não filtra." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "COUNT, SUM, AVG, MIN, MAX", back: "Quantidade, soma, média, menor e maior valor." },
    { front: "Amplitude", back: "Maior valor menos o menor. Medida de dispersão.", code: `SELECT MAX(nivel) - MIN(nivel) FROM jogadores;` },
    { front: "Média × mediana", back: "A média sofre com valores extremos. A mediana é o valor do meio da lista ordenada." },
    { front: "GROUP BY", back: "Separa em grupos e calcula para cada um: gera a tabela de frequência." },
    { front: "WHERE × HAVING", back: "WHERE filtra linhas antes de agrupar. HAVING filtra grupos depois." },
    { front: "Amostra aleatória", back: "Parte sorteada que representa o todo.", code: `ORDER BY RANDOM() LIMIT 5` },
  ],
});
