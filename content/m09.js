/* Módulo 9. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m09",
  title: "Funções",
  tagline: "Criar seus próprios comandos: def, parâmetro e return",
  accent: "pink",
  lessons: [
    {
      id: "m09-l1",
      title: "Por que funções existem",
      summary: "def, chamada e a diferença entre definir e executar",
      steps: [
        {
          kind: "explain",
          title: "Você já usa funções",
          body: [
            "`print`, `input`, `len`, `int`: tudo isso são **funções**. Alguém escreveu o código delas, deu um nome, e você só chama pelo nome. Você não precisa saber como o `print` coloca letras na tela para usá-lo.",
            "Agora você vai criar as suas. Uma função é um **bloco de código com nome**: você escreve uma vez e usa quantas vezes quiser.",
            "Em projetos reais, é assim que o código fica organizado. Um jogo tem funções como `atacar`, `calcular_dano`, `salvar_jogo`. Cada uma resolve um pedaço do problema.",
          ],
        },
        {
          kind: "explain",
          title: "def: criando uma função",
          body: [
            "`def` (de \"define\") cria a função. Depois vem o nome, os parênteses e os dois-pontos. O código da função fica recuado, como no if e no for.",
            "Para executar, você **chama** a função: escreve o nome com parênteses.",
          ],
          code: `def mostrar_menu():
    print("1 - Jogar")
    print("2 - Opcoes")
    print("3 - Sair")

mostrar_menu()`,
          run: true,
          table: {
            head: ["Parte", "No exemplo"],
            rows: [
              ["palavra que cria", "def"],
              ["nome da função", "mostrar_menu"],
              ["parênteses e dois-pontos", "():"],
              ["corpo (recuado)", "os três print"],
              ["chamada", "mostrar_menu()"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Definir não é executar",
          body: [
            "O `def` só **ensina** o Python o que a função faz. Nada roda nessa hora.",
            "O código de dentro só executa quando alguém chama a função. E pode ser chamada várias vezes.",
            "Rode e conte quantas vezes o menu aparece.",
          ],
          code: `def mostrar_menu():
    print("1 - Jogar")
    print("2 - Sair")

print("Bem-vindo")
mostrar_menu()
print("Opcao invalida, tente de novo")
mostrar_menu()`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que aparece quando este programa roda?",
          code: `def vitoria():
    print("GG")
    print("Voce venceu")`,
          options: [
            { text: "Nada", correct: true, why: "A função foi definida, mas ninguém chamou `vitoria()`. Definir não executa." },
            { text: "GG\nVoce venceu", why: "Isso apareceria se tivesse a linha `vitoria()` depois do def." },
            { text: "Dá erro", why: "Definir uma função sem chamar não é erro. Só não acontece nada." },
          ],
        },
        {
          kind: "order",
          prompt: "Monte o programa: defina a função e depois chame ela uma vez.",
          lines: [`def game_over():`, `    print("GAME OVER")`, `    print("Pressione start")`, `game_over()`],
          extra: [`game_over`],
          output: "GAME OVER\nPressione start",
          explain: "O def com o corpo recuado vem primeiro. A chamada fica fora, sem recuo, e precisa dos parênteses: só `game_over` sem () não executa nada.",
        },
        {
          kind: "code",
          title: "Separador",
          prompt: "Crie uma função `separador()` que mostra uma linha com 10 sinais de igual: `==========`. O verificador vai chamar sua função duas vezes.",
          fn: "separador",
          starter: `def separador():


separador()
`,
          example: { output: "separador()  ->  ==========", calls: true },
          tests: [{ call: "separador()\nseparador()", expect: "==========\n==========" }],
          hints: ["O corpo da função tem uma linha, com 4 espaços: `print(\"==========\")`."],
          solution: `def separador():
    print("==========")

separador()`,
        },
      ],
    },
    {
      id: "m09-l2",
      title: "Parâmetros: a entrada",
      summary: "Passar valores para a função",
      steps: [
        {
          kind: "explain",
          title: "A função recebe valores",
          body: [
            "Uma função fica muito mais útil quando recebe informações. Esses valores chegam pelos **parâmetros**, que ficam dentro dos parênteses do def.",
            "Parâmetro é uma variável da função. Ela recebe o valor que foi passado na chamada.",
          ],
          code: `def boas_vindas(nick):
    print("Bem-vindo ao servidor,", nick)

boas_vindas("Kira")
boas_vindas("Leo")`,
          run: true,
          table: {
            head: ["Chamada", "nick vale", "Saída"],
            rows: [
              ["boas_vindas(\"Kira\")", "\"Kira\"", "Bem-vindo ao servidor, Kira"],
              ["boas_vindas(\"Leo\")", "\"Leo\"", "Bem-vindo ao servidor, Leo"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Vários parâmetros",
          body: [
            "Separe por vírgula. Na chamada, os valores entram **na mesma ordem**: o primeiro valor vai para o primeiro parâmetro, e assim por diante.",
          ],
          code: `def mostrar_status(nome, vida, mana):
    print(nome, "| HP", vida, "| MP", mana)

mostrar_status("Kira", 100, 40)
mostrar_status("Golem", 250, 0)`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `def atacar(atacante, alvo):
    print(atacante, "atacou", alvo)

atacar("Leo", "Kira")`,
          mono: true,
          options: [
            { text: "Leo atacou Kira", correct: true, why: "O primeiro valor (\"Leo\") vai para o primeiro parâmetro (atacante). O segundo vai para alvo." },
            { text: "Kira atacou Leo", why: "A ordem da chamada manda: Leo é o primeiro valor, então é o atacante." },
            { text: "atacante atacou alvo", why: "Sem aspas, atacante e alvo são variáveis. O print mostra os valores delas." },
          ],
        },
        {
          kind: "fill",
          prompt: "Complete a função para ela receber o nome e usá-lo no print.",
          code: `def anunciar(__1__):
    print("Novo desafiante:", nome)

anunciar("Mia")`,
          answers: ["nome"],
          bank: ["nome", "Mia", "\"nome\"", "print"],
          explain: "O parâmetro precisa ter o mesmo nome usado dentro da função. Quando a chamada passa \"Mia\", o parâmetro nome recebe esse valor.",
        },
        {
          kind: "code",
          title: "Anúncio de partida",
          prompt: "Crie `anunciar_partida(jogador, mapa)` que mostra uma frase como a do exemplo.",
          fn: "anunciar_partida",
          starter: `def anunciar_partida(jogador, mapa):


anunciar_partida("Kira", "Deserto")
`,
          example: { output: "anunciar_partida(\"Kira\", \"Deserto\")\n  ->  Kira entrou no mapa Deserto", calls: true },
          tests: [{ call: `anunciar_partida("Kira", "Deserto")\nanunciar_partida("Leo", "Floresta")`, expect: "Kira entrou no mapa Deserto\nLeo entrou no mapa Floresta" }],
          hints: ["`print(jogador, \"entrou no mapa\", mapa)`"],
          solution: `def anunciar_partida(jogador, mapa):
    print(jogador, "entrou no mapa", mapa)

anunciar_partida("Kira", "Deserto")`,
        },
      ],
    },
    {
      id: "m09-l3",
      title: "return: a saída",
      summary: "Funções que calculam e devolvem resultado",
      steps: [
        {
          kind: "explain",
          title: "Devolver em vez de mostrar",
          body: [
            "Até aqui as funções só mostravam coisas. Mas muitas vezes você quer que a função **calcule** algo e **entregue o resultado** para o resto do programa usar.",
            "É isso que o `return` faz: ele devolve um valor para quem chamou. A chamada \"vira\" esse valor.",
            "Pense no `len`: ele não mostra nada na tela. Ele devolve um número, e você decide o que fazer com ele.",
          ],
          code: `def calcular_dano(base, multiplicador):
    return base * multiplicador

dano = calcular_dano(40, 2)
print("Dano:", dano)
print("Dano com bonus:", calcular_dano(40, 2) + 15)`,
          run: true,
          boxes: [
            { name: "calcular_dano(40, 2)", value: "80" },
            { name: "dano", value: "80" },
          ],
        },
        {
          kind: "explain",
          title: "print × return",
          body: ["Essa é a confusão mais comum com funções. Vale ler com calma."],
          table: {
            head: ["", "print", "return"],
            rows: [
              ["O que faz", "Mostra na tela", "Devolve o valor para o programa"],
              ["Para quem", "Para a pessoa ler", "Para o código usar"],
              ["Dá para guardar numa variável?", "Não", "Sim"],
              ["Dá para fazer conta com o resultado?", "Não", "Sim"],
            ],
          },
          tip: "Regra prática: dentro de uma função que calcula algo, use `return`. Quem chamou decide se vai mostrar com print.",
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `def dobro(n):
    print(n * 2)

x = dobro(5)
print("x vale", x)`,
          mono: true,
          options: [
            { text: "10\nx vale None", correct: true, why: "A função mostrou 10 na tela, mas não tem return. Função sem return devolve `None` (que significa \"nada\"). Por isso x ficou None." },
            { text: "10\nx vale 10", why: "Para x valer 10, a função precisaria de `return n * 2`. O print só mostra, não devolve." },
            { text: "x vale 10", why: "O print de dentro da função roda e mostra 10. E x fica None porque não houve return." },
          ],
        },
        {
          kind: "quiz",
          question: "O que acontece com uma linha escrita depois do return, dentro da função?",
          code: `def nivel_minimo():
    return 10
    print("Isso aparece?")`,
          options: [
            { text: "Nunca executa", correct: true, why: "O return encerra a função na hora. Tudo que vem depois dele dentro da função é ignorado." },
            { text: "Executa depois do return", why: "O return é a saída da função. Depois dele, o Python volta para quem chamou." },
            { text: "Dá erro", why: "Não dá erro. A linha só nunca é alcançada." },
          ],
        },
        {
          kind: "code",
          title: "Bônus em dobro",
          prompt: "Crie `dobro(n)` que **devolve** o dobro de n. Use return, não print: o verificador vai usar o valor devolvido.",
          fn: "dobro",
          starter: `def dobro(n):


print(dobro(21))
`,
          example: { output: "dobro(21)   ->  42\ndobro(2.5)  ->  5.0", calls: true },
          tests: [{ call: "print(dobro(21))\nprint(dobro(0))\nprint(dobro(-4))\nprint(dobro(2.5))", expect: "42\n0\n-8\n5.0" }],
          hints: ["Uma linha só no corpo: `return n * 2`"],
          solution: `def dobro(n):
    return n * 2

print(dobro(21))`,
        },
        {
          kind: "code",
          bug: true,
          title: "O bônus que sumiu",
          prompt: "A função deveria aplicar um bônus de 50% no XP, mas o programa quebra com um `TypeError` que fala de `NoneType`. Uma palavra resolve.",
          fn: "aplicar_bonus",
          starter: `def aplicar_bonus(xp):
    print(xp * 1.5)

total = aplicar_bonus(200) + 50
print("XP total:", total)
`,
          example: { output: "XP total: 350.0" },
          tests: [
            { expect: "XP total: 350.0", last: true },
            { call: "print(aplicar_bonus(100))", expect: "150.0" },
          ],
          hints: ["A função mostra o valor, mas devolve None. E None + 50 não é conta.", "Troque o `print` de dentro da função por `return`."],
          solution: `def aplicar_bonus(xp):
    return xp * 1.5

total = aplicar_bonus(200) + 50
print("XP total:", total)`,
        },
        {
          kind: "code",
          title: "Média de duas partidas",
          prompt: "Crie `media(a, b)` que devolve a média dos dois valores.",
          fn: "media",
          starter: `def media(a, b):


print(media(8, 6))
`,
          example: { output: "media(8, 6)   ->  7.0\nmedia(10, 5)  ->  7.5", calls: true },
          tests: [{ call: "print(media(8, 6))\nprint(media(10, 5))\nprint(media(0, 0))\nprint(media(9.5, 7.0))", expect: "7.0\n7.5\n0.0\n8.25" }],
          hints: ["Cuidado com a ordem das contas: `a + b / 2` divide só o b.", "`return (a + b) / 2`"],
          solution: `def media(a, b):
    return (a + b) / 2

print(media(8, 6))`,
        },
        {
          kind: "code",
          title: "Detector de par",
          prompt: "Crie `eh_par(n)` que devolve `True` se n for par e `False` se não for.",
          fn: "eh_par",
          starter: `def eh_par(n):


print(eh_par(10))
`,
          example: { output: "eh_par(10)  ->  True\neh_par(7)   ->  False", calls: true },
          tests: [{ call: "print(eh_par(10))\nprint(eh_par(7))\nprint(eh_par(0))\nprint(eh_par(31))", expect: "True\nFalse\nTrue\nFalse" }],
          hints: ["Dá para usar if/else, com `return True` num caminho e `return False` no outro.", "Versão curta: `return n % 2 == 0`. A comparação já é True ou False."],
          solution: `def eh_par(n):
    return n % 2 == 0

print(eh_par(10))`,
        },
      ],
    },
    {
      id: "m09-l4",
      title: "Funções na prática",
      summary: "Funções com if, com listas e funções que usam funções",
      steps: [
        {
          kind: "explain",
          title: "Um return em cada caminho",
          body: [
            "Dentro de uma função pode ter if, for, while: qualquer coisa. Com if, é comum cada caminho ter seu próprio `return`.",
            "Como o return encerra a função, só um deles acontece por chamada.",
          ],
          code: `def qualidade_conexao(ping):
    if ping < 50:
        return "Excelente"
    elif ping < 120:
        return "Boa"
    else:
        return "Ruim"

print(qualidade_conexao(30))
print(qualidade_conexao(90))
print(qualidade_conexao(400))`,
          run: true,
        },
        {
          kind: "fill",
          prompt: "Complete a função que classifica a raridade de um item pelo poder.",
          code: `def raridade(poder):
    if poder >= 90:
        return __1__
    elif poder >= __2__:
        return "Raro"
    __3__:
        return "Comum"`,
          answers: ["\"Lendario\"", "50", "else"],
          bank: ["\"Lendario\"", "Lendario", "50", "90", "else", "elif", "print"],
          explain: "Texto devolvido vai entre aspas. O limite do meio precisa ser menor que 90 para fazer sentido. E o último caminho, sem condição, é o else.",
        },
        {
          kind: "code",
          title: "Status da vida",
          prompt: "Crie `status_vida(vida, vida_max)`. Calcule a porcentagem de vida e devolva: abaixo de 25% `Critico`, abaixo de 60% `Ferido`, senão `Saudavel`.",
          fn: "status_vida",
          starter: `def status_vida(vida, vida_max):
    porcentagem = vida / vida_max * 100


print(status_vida(20, 100))
`,
          example: { output: "status_vida(20, 100)  ->  Critico\nstatus_vida(90, 200)  ->  Ferido\nstatus_vida(80, 100)  ->  Saudavel", calls: true },
          tests: [{ call: "print(status_vida(20, 100))\nprint(status_vida(90, 200))\nprint(status_vida(80, 100))\nprint(status_vida(25, 100))\nprint(status_vida(60, 100))", expect: "Critico\nFerido\nSaudavel\nFerido\nSaudavel" }],
          hints: ["A porcentagem já está calculada. Agora é um if/elif/else com return.", "`if porcentagem < 25:` com `return \"Critico\"`, depois `elif porcentagem < 60:`."],
          solution: `def status_vida(vida, vida_max):
    porcentagem = vida / vida_max * 100
    if porcentagem < 25:
        return "Critico"
    elif porcentagem < 60:
        return "Ferido"
    else:
        return "Saudavel"

print(status_vida(20, 100))`,
        },
        {
          kind: "code",
          title: "Total do carrinho",
          prompt: "Crie `total_carrinho(precos)` que recebe uma **lista** de preços e devolve a soma.",
          fn: "total_carrinho",
          starter: `def total_carrinho(precos):


print(total_carrinho([59.9, 19.9, 120.0]))
`,
          example: { output: "total_carrinho([59.9, 19.9, 120.0])  ->  199.8", calls: true },
          tests: [{ call: "print(total_carrinho([59.9, 19.9, 120.0]))\nprint(total_carrinho([10, 20]))\nprint(total_carrinho([]))", expect: "199.8\n30\n0" }],
          hints: ["É o acumulador, só que dentro da função: `total = 0`, um for somando, e `return total`.", "O `return total` fica **fora** do for (alinhado com ele). Se ficar dentro, a função devolve na primeira volta."],
          solution: `def total_carrinho(precos):
    total = 0
    for p in precos:
        total = total + p
    return total

print(total_carrinho([59.9, 19.9, 120.0]))`,
        },
        {
          kind: "code",
          title: "Contar acima do limite",
          prompt: "Crie `contar_acima(lista, limite)` que devolve **quantos** números da lista são maiores que o limite.",
          fn: "contar_acima",
          starter: `def contar_acima(lista, limite):


print(contar_acima([8, 4, 7, 10], 6))
`,
          example: { output: "contar_acima([8, 4, 7, 10], 6)  ->  3", calls: true },
          tests: [{ call: "print(contar_acima([8, 4, 7, 10], 6))\nprint(contar_acima([1, 2], 5))\nprint(contar_acima([5, 5, 6], 5))\nprint(contar_acima([], 0))", expect: "3\n0\n1\n0" }],
          hints: ["Contador começando em 0.", "`if item > limite:` soma 1.", "`return` com o contador, fora do for."],
          solution: `def contar_acima(lista, limite):
    contador = 0
    for item in lista:
        if item > limite:
            contador = contador + 1
    return contador

print(contar_acima([8, 4, 7, 10], 6))`,
        },
        {
          kind: "explain",
          title: "Funções que usam funções",
          body: [
            "Uma função pode chamar outra. É assim que programas grandes são montados: peças pequenas formando peças maiores.",
          ],
          code: `def calcular_dano(base, multiplicador):
    return base * multiplicador

def dano_critico(base):
    return calcular_dano(base, 2) + 10

print(dano_critico(30))`,
          run: true,
        },
        {
          kind: "code",
          title: "Preço final",
          prompt: "As funções `aplicar_desconto` e `aplicar_taxa` já existem. Crie `preco_final(preco)` que aplica o desconto **e depois** a taxa, usando as duas, e devolve o resultado.",
          fn: "preco_final",
          starter: `def aplicar_desconto(preco):
    return preco * 0.8

def aplicar_taxa(preco):
    return preco + 5

def preco_final(preco):


print(preco_final(100))
`,
          example: { output: "preco_final(100)  ->  85.0", calls: true },
          tests: [{ call: "print(preco_final(100))\nprint(preco_final(50))\nprint(preco_final(0))", expect: "85.0\n45.0\n5.0" }],
          hints: ["Primeiro: `com_desconto = aplicar_desconto(preco)`.", "Depois: `return aplicar_taxa(com_desconto)`."],
          solution: `def aplicar_desconto(preco):
    return preco * 0.8

def aplicar_taxa(preco):
    return preco + 5

def preco_final(preco):
    com_desconto = aplicar_desconto(preco)
    return aplicar_taxa(com_desconto)

print(preco_final(100))`,
        },
      ],
    },
  ],
  cards: [
    { front: "O que o def faz?", back: "Cria (define) uma função. O código de dentro só roda quando a função é chamada." },
    { front: "Como chamar uma função?", back: "Nome dela com parênteses, passando os valores.", code: `boas_vindas("Kira")` },
    { front: "O que é parâmetro?", back: "Uma variável da função que recebe o valor passado na chamada." },
    { front: "print × return", back: "print mostra na tela. return devolve o valor para o programa poder guardar e fazer contas." },
    { front: "Função sem return devolve o quê?", back: "None, que significa \"nada\"." },
    { front: "O que acontece depois do return?", back: "A função termina na hora. Linhas depois dele, dentro da função, não rodam." },
  ],
});
