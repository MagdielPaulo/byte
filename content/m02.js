/* Módulo 2. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m02",
  title: "Variáveis",
  tagline: "Guardar, mudar e usar informações",
  accent: "violet",
  lessons: [
    {
      id: "m02-l1",
      title: "Guardando informações",
      summary: "O sinal = e o valor que muda",
      steps: [
        {
          kind: "explain",
          title: "Variável é um espaço com nome",
          body: [
            "Pense no save de um jogo: ele guarda seu nick, seu nível, quanta vida você tem. Todo programa precisa guardar informações assim.",
            "Uma **variável** é um espaço na memória com um nome. Você guarda um valor nele e depois usa esse valor chamando pelo nome.",
          ],
          code: `jogador = "Shadow"
nivel = 12`,
          boxes: [
            { name: "jogador", value: "\"Shadow\"" },
            { name: "nivel", value: "12" },
          ],
        },
        {
          kind: "explain",
          title: "O sinal = guarda",
          body: [
            "Em Python, `=` **não** é o igual da matemática. Ele quer dizer: pegue o valor da direita e guarde no nome da esquerda.",
            "Leia `nivel = 12` como \"nivel recebe 12\".",
            "Depois disso, sempre que você escrever `nivel` sem aspas, o Python troca pelo valor guardado.",
          ],
          code: `jogador = "Shadow"
nivel = 12
print(jogador)
print(nivel)`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que aparece na tela?",
          code: `vida = 100
print("vida")`,
          mono: true,
          options: [
            { text: "vida", correct: true, why: "Com aspas é texto. O Python mostra a palavra vida, não o valor guardado." },
            { text: "100", why: "Para mostrar o valor seria `print(vida)`, sem aspas. Com aspas, é só um texto." },
            { text: "Dá erro", why: "Não tem erro: o print está mostrando o texto \"vida\"." },
          ],
        },
        {
          kind: "explain",
          title: "Juntando texto e variável",
          body: [
            "Dentro do `print` você pode colocar várias coisas separadas por **vírgula**. O Python mostra tudo na mesma linha, com um espaço entre elas.",
          ],
          code: `jogador = "Shadow"
nivel = 12
print("Jogador:", jogador)
print("Nivel:", nivel)`,
          run: true,
          output: "Jogador: Shadow\nNivel: 12",
        },
        {
          kind: "explain",
          title: "O valor pode mudar",
          body: [
            "Uma variável guarda **um valor por vez**. Quando você guarda outro, o antigo some.",
            "Dá para usar o valor antigo para calcular o novo. `vida = vida - 30` quer dizer: pegue a vida atual, tire 30 e guarde de volta em vida.",
          ],
          code: `vida = 100
vida = vida - 30
vida = vida - 30
print(vida)`,
          run: true,
          table: {
            head: ["Linha", "vida depois da linha"],
            rows: [
              ["vida = 100", "100"],
              ["vida = vida - 30", "70"],
              ["vida = vida - 30", "40"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Quanto vale moedas no final?",
          code: `moedas = 50
moedas = moedas + 20
moedas = moedas * 2
print(moedas)`,
          mono: true,
          options: [
            { text: "140", correct: true, why: "50, depois 50 + 20 = 70, depois 70 * 2 = 140." },
            { text: "70", why: "Faltou a última linha: ela multiplica o valor atual por 2." },
            { text: "120", why: "A conta acontece em ordem: primeiro soma 20 (70), depois multiplica por 2." },
            { text: "50", why: "As linhas do meio mudam o valor guardado. O print mostra o valor final." },
          ],
        },
        {
          kind: "fill",
          prompt: "Complete para o jogador ganhar 25 de XP em cima do que já tinha.",
          code: `xp = 100
xp = __1__ + 25
print(xp)`,
          answers: ["xp"],
          bank: ["xp", "100", "25", "XP"],
          explain: "`xp = xp + 25` usa o valor atual de xp (100) e guarda o resultado (125). Escrever `100 + 25` funcionaria só desta vez, porque o valor estaria fixo no código. E `XP` maiúsculo seria outro nome.",
        },
        {
          kind: "code",
          title: "Ficha do personagem",
          prompt: "Crie três variáveis: `nome` com \"Kira\", `classe` com \"Maga\" e `nivel` com 7. Depois mostre as três com rótulos, como no exemplo.",
          starter: "# 1) crie as variaveis\n\n# 2) mostre com print\n",
          example: { output: "Nome: Kira\nClasse: Maga\nNivel: 7" },
          tests: [{ expect: "Nome: Kira\nClasse: Maga\nNivel: 7" }],
          hints: ["Texto vai entre aspas: `nome = \"Kira\"`. Número vai sem aspas: `nivel = 7`.", "Use vírgula no print: `print(\"Nome:\", nome)`"],
          solution: `nome = "Kira"
classe = "Maga"
nivel = 7
print("Nome:", nome)
print("Classe:", classe)
print("Nivel:", nivel)`,
        },
      ],
    },
    {
      id: "m02-l2",
      title: "Nomes e tipos",
      summary: "Regras de nome, str, int, float e bool",
      steps: [
        {
          kind: "explain",
          title: "Regras para dar nome",
          body: [
            "Nome de variável pode ter letras, números e `_`. Não pode começar com número nem ter espaço.",
            "Maiúscula e minúscula contam: `Nome` e `nome` são variáveis diferentes.",
          ],
          table: {
            head: ["Nome", "Pode?", "Por quê"],
            rows: [
              ["vida_maxima", "Sim", "Letras e _"],
              ["jogador2", "Sim", "Número no meio ou no fim pode"],
              ["2jogador", "Não", "Começa com número"],
              ["vida maxima", "Não", "Tem espaço"],
              ["vida-maxima", "Não", "O - é lido como subtração"],
            ],
          },
          tip: "Use nomes que dizem o que guardam. `vida_maxima` explica sozinho. `x` não explica nada.",
        },
        {
          kind: "quiz",
          question: "Qual destes nomes de variável é válido?",
          mono: true,
          options: [
            { text: "pontos_total", correct: true, why: "Só letras e _. Está certo." },
            { text: "pontos total", why: "Espaço não pode. O Python acharia que são duas coisas separadas." },
            { text: "2pontos", why: "Nome não pode começar com número." },
            { text: "pontos-total", why: "O hífen é lido como sinal de menos: pontos menos total." },
          ],
        },
        {
          kind: "explain",
          title: "Tipos de dado",
          body: [
            "Todo valor tem um **tipo**. O tipo decide o que dá para fazer com ele: número faz conta, texto não.",
            "A função `type()` mostra o tipo de um valor.",
          ],
          table: {
            head: ["Tipo", "Guarda", "Exemplos"],
            rows: [
              ["str", "texto", "\"Shadow\", \"123\""],
              ["int", "número inteiro", "12, -5, 0"],
              ["float", "número com casa decimal", "1.75, 99.9"],
              ["bool", "verdadeiro ou falso", "True, False"],
            ],
          },
          code: `print(type("Shadow"))
print(type(12))
print(type(1.75))
print(type(True))`,
          run: true,
          warn: "Casa decimal se escreve com **ponto**: `1.75`. Com vírgula (`1,75`) o Python entende outra coisa.",
        },
        {
          kind: "quiz",
          question: "Qual é o tipo do valor \"42\"?",
          code: `codigo = "42"`,
          options: [
            { text: "str (texto)", correct: true, why: "Está entre aspas, então é texto. Parece número, mas não faz conta." },
            { text: "int (inteiro)", why: "Seria int se fosse `42` sem aspas." },
            { text: "float (decimal)", why: "Não tem ponto decimal e, além disso, está entre aspas." },
          ],
        },
        {
          kind: "quiz",
          question: "O que acontece aqui?",
          code: `online = true
print(online)`,
          options: [
            { text: "Dá NameError", correct: true, why: "Os valores lógicos são `True` e `False`, com a primeira letra maiúscula. `true` minúsculo é um nome que não existe." },
            { text: "Mostra true", why: "Em Python o valor se escreve `True`. Minúsculo não é reconhecido." },
            { text: "Mostra True", why: "Mostraria se estivesse escrito `True` no código." },
          ],
        },
        {
          kind: "quiz",
          question: "O que aparece na tela?",
          code: `print("10" + "5")`,
          mono: true,
          options: [
            { text: "105", correct: true, why: "Os dois são texto. Com texto, o + **junta** (concatena): \"10\" + \"5\" vira \"105\"." },
            { text: "15", why: "Daria 15 se fossem números sem aspas: `10 + 5`." },
            { text: "Dá erro", why: "Texto + texto funciona: ele junta os dois." },
            { text: "10 5", why: "O + junta sem colocar espaço. Quem coloca espaço é a vírgula do print." },
          ],
        },
        {
          kind: "code",
          bug: true,
          title: "Save corrompido",
          prompt: "Este save tem **3 problemas**: um nome de variável inválido, um decimal escrito do jeito errado e um valor lógico mal escrito. Deixe a saída igual ao exemplo.",
          starter: `nome do jogador = "Kira"
vida = 87,5
online = true
print("Jogador:", nome do jogador)
print("Vida:", vida)
print("Online:", online)
`,
          example: { output: "Jogador: Kira\nVida: 87.5\nOnline: True" },
          tests: [{ expect: "Jogador: Kira\nVida: 87.5\nOnline: True" }],
          hints: ["Troque o espaço do nome por _: `nome_do_jogador` (nas duas linhas).", "Decimal usa ponto: `87.5`.", "Valor lógico: `True`, com T maiúsculo."],
          solution: `nome_do_jogador = "Kira"
vida = 87.5
online = True
print("Jogador:", nome_do_jogador)
print("Vida:", vida)
print("Online:", online)`,
        },
      ],
    },
  ],
  cards: [
    { front: "O que o = faz em Python?", back: "Guarda o valor da direita na variável da esquerda. Não é o igual da matemática.", code: `nivel = 12` },
    { front: "O que faz x = x + 1?", back: "Pega o valor atual de x, soma 1 e guarda de volta em x." },
    { front: "Quais são os 4 tipos básicos?", back: "str (texto), int (inteiro), float (decimal) e bool (True ou False)." },
    { front: "\"10\" + \"5\" dá quanto?", back: "\"105\". Com texto, o + junta. Para somar, os valores precisam ser números." },
    { front: "Como se escreve decimal?", back: "Com ponto: 1.75. A vírgula tem outro significado em Python." },
    { front: "Nome e nome são a mesma variável?", back: "Não. Maiúscula e minúscula fazem diferença." },
  ],
});
