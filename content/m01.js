/* Módulo 1. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m01",
  title: "Primeiros comandos",
  tagline: "O que é um programa, print e como ler erros",
  accent: "cyan",
  lessons: [
    {
      id: "m01-l1",
      title: "Seu primeiro programa",
      summary: "Instruções em ordem e o comando print",
      steps: [
        {
          kind: "explain",
          title: "O que é um programa",
          body: [
            "Um programa é uma lista de instruções que o computador executa **na ordem**, de cima para baixo, uma linha por vez.",
            "Jogos, apps de música, o sistema do banco: tudo é feito de instruções escritas numa linguagem de programação. Aqui você vai usar **Python**, uma das linguagens mais usadas no mundo, presente em inteligência artificial, análise de dados, sites e automação.",
            "O computador não adivinha nada. Ele faz exatamente o que está escrito. Por isso cada detalhe conta: uma aspa a menos já muda tudo.",
          ],
        },
        {
          kind: "explain",
          title: "print: mostrar na tela",
          body: [
            "`print` é o comando que mostra algo na tela. O que vai dentro dos parênteses é o que aparece.",
            "O texto fica entre aspas. As aspas avisam ao Python: isso aqui é texto, é só mostrar.",
            "Clique em **Rodar** para executar.",
          ],
          code: `print("Ola, mundo!")`,
          run: true,
          tip: "Mostrar \"Ola, mundo!\" é a tradição do primeiro programa em quase toda linguagem, desde os anos 1970.",
        },
        {
          kind: "quiz",
          question: "O que aparece na tela quando este programa roda?",
          code: `print("GG")`,
          mono: true,
          options: [
            { text: "GG", correct: true, why: "As aspas só marcam onde o texto começa e termina. Elas não aparecem na tela." },
            { text: "\"GG\"", why: "As aspas não aparecem. Elas só servem para o Python saber que aquilo é texto." },
            { text: "print(\"GG\")", why: "O comando não aparece na tela. Ele é executado, e o que aparece é o resultado." },
            { text: "Nada", why: "O print sempre mostra o que está dentro dos parênteses." },
          ],
        },
        {
          kind: "explain",
          title: "Uma linha por print",
          body: [
            "Cada `print` mostra uma linha. Três prints, três linhas, sempre na ordem em que foram escritos.",
          ],
          code: `print("Carregando...")
print("Conectando ao servidor...")
print("Partida encontrada!")`,
          run: true,
        },
        {
          kind: "order",
          prompt: "Monte o programa para a tela de inicialização aparecer nesta ordem. Toque nas linhas para colocá-las no programa.",
          lines: [`print("Iniciando sistema")`, `print("Carregando mapa")`, `print("Pronto para jogar")`],
          output: "Iniciando sistema\nCarregando mapa\nPronto para jogar",
          explain: "O Python executa de cima para baixo. A ordem das linhas no código é a ordem em que elas aparecem na tela.",
        },
        {
          kind: "explain",
          title: "Texto ou conta?",
          body: [
            "Com aspas, é texto: o Python mostra exatamente o que está escrito.",
            "Sem aspas, números viram conta: o Python calcula e mostra o resultado.",
          ],
          code: `print("2 + 3")
print(2 + 3)`,
          run: true,
          output: "2 + 3\n5",
        },
        {
          kind: "quiz",
          question: "O que este programa mostra?",
          code: `print(10 * 3)`,
          mono: true,
          options: [
            { text: "30", correct: true, why: "Sem aspas, o Python faz a conta. O asterisco * é a multiplicação." },
            { text: "10 * 3", why: "Isso só aconteceria se a conta estivesse entre aspas, como texto." },
            { text: "103", why: "O * multiplica. Não junta os números." },
            { text: "Dá erro", why: "Conta com números funciona direto dentro do print." },
          ],
        },
        {
          kind: "code",
          title: "Tela de vitória",
          prompt: "Escreva um programa que mostre exatamente estas duas linhas.",
          starter: "# escreva seu programa abaixo\n",
          example: { output: "VITORIA!\nVoce ganhou 150 de XP" },
          tests: [{ expect: "VITORIA!\nVoce ganhou 150 de XP" }],
          hints: ["Use dois `print`, um para cada linha.", "Cada texto vai entre aspas: `print(\"VITORIA!\")`"],
          solution: `print("VITORIA!")
print("Voce ganhou 150 de XP")`,
        },
      ],
    },
    {
      id: "m01-l2",
      title: "Erros e comentários",
      summary: "Ler mensagens de erro sem pânico",
      steps: [
        {
          kind: "explain",
          title: "Erro faz parte",
          body: [
            "Todo programador erra o tempo todo, inclusive quem trabalha nisso há anos. A diferença é que ele **lê a mensagem de erro**.",
            "Quando algo está errado, o Python para o programa e avisa o **tipo** do erro e a **linha** onde ele aconteceu. Neste site, as mensagens também aparecem explicadas em português.",
          ],
        },
        {
          kind: "explain",
          title: "Os erros mais comuns no começo",
          body: ["Guarde esses três nomes. Eles vão aparecer bastante."],
          table: {
            head: ["Erro", "O que significa", "Exemplo"],
            rows: [
              ["SyntaxError", "Escrita errada: faltou aspas, parêntese, dois-pontos...", "print(\"oi)"],
              ["NameError", "O Python não conhece esse nome", "prnt(\"oi\")"],
              ["TypeError", "Misturou tipos que não combinam", "\"5\" + 3"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "O que acontece quando este código roda?",
          code: `Print("Game over")`,
          mono: false,
          options: [
            { text: "Dá NameError", correct: true, why: "Python diferencia maiúscula de minúscula. O comando é `print`, com p minúsculo. `Print` é um nome que ele não conhece." },
            { text: "Mostra Game over", why: "Seria assim com `print` minúsculo. Com P maiúsculo, o Python não reconhece o comando." },
            { text: "Dá SyntaxError", why: "A escrita está bem formada (aspas e parênteses fecham). O problema é o nome do comando." },
            { text: "Mostra \"Game over\" com aspas", why: "Aspas nunca aparecem na tela, e esse código nem chega a mostrar nada." },
          ],
        },
        {
          kind: "quiz",
          question: "E este aqui?",
          code: `print("Game over)`,
          options: [
            { text: "Dá SyntaxError", correct: true, why: "A aspa abriu e não fechou. O Python não sabe onde o texto termina, então a escrita está quebrada." },
            { text: "Dá NameError", why: "O nome `print` está certo. O problema é a aspa que não fecha." },
            { text: "Mostra Game over", why: "Faltou fechar a aspa. Com um erro de escrita, o programa nem começa." },
          ],
        },
        {
          kind: "code",
          bug: true,
          title: "Log com defeito",
          prompt: "Este programa deveria mostrar o status de um servidor, mas tem **3 erros**. Rode, leia as mensagens e conserte uma por uma.",
          starter: `print("Servidor online)
prnt("Jogadores conectados: 128")
Print("Ping: 32ms")
`,
          example: { output: "Servidor online\nJogadores conectados: 128\nPing: 32ms" },
          tests: [{ expect: "Servidor online\nJogadores conectados: 128\nPing: 32ms" }],
          hints: ["Linha 1: a aspa do texto abriu e não fechou.", "Linhas 2 e 3: o comando se escreve exatamente `print`, tudo minúsculo."],
          solution: `print("Servidor online")
print("Jogadores conectados: 128")
print("Ping: 32ms")`,
        },
        {
          kind: "explain",
          title: "Comentários",
          body: [
            "Tudo que vem depois de um `#` é **comentário**: o Python ignora.",
            "Comentário serve para explicar o código para você mesmo e para quem for ler depois. Também é útil para desligar uma linha sem apagá-la.",
          ],
          code: `# Este programa mostra o placar
print("Time Azul: 3")
# print("Esta linha nao roda")
print("Time Vermelho: 1")`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que aparece na tela?",
          code: `# print("A")
print("B")
# print("C")`,
          mono: true,
          options: [
            { text: "B", correct: true, why: "As linhas que começam com # são comentários. Só o print do meio roda." },
            { text: "A\nB\nC", why: "As linhas com # são ignoradas pelo Python." },
            { text: "A\nC", why: "É o contrário: só a linha sem # executa." },
            { text: "Nada", why: "A linha do meio não tem #, então ela roda normalmente." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "O que o print faz?", back: "Mostra na tela o que estiver dentro dos parênteses.", code: `print("Ola")` },
    { front: "Para que servem as aspas?", back: "Marcam o começo e o fim de um texto. Elas não aparecem na tela." },
    { front: "print(\"2 + 3\") ou print(2 + 3)?", back: "Com aspas mostra o texto 2 + 3. Sem aspas o Python calcula e mostra 5." },
    { front: "O que é um comentário?", back: "Texto depois de # que o Python ignora. Serve para explicar o código." },
    { front: "SyntaxError significa...", back: "Escrita errada: faltou aspas, parêntese, dois-pontos ou algo parecido." },
  ],
});
