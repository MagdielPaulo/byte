/* Módulo 5. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m05",
  title: "Decisões",
  tagline: "if, elif, else, and e or",
  accent: "green",
  lessons: [
    {
      id: "m05-l1",
      title: "Comparações",
      summary: "Perguntas que respondem True ou False",
      steps: [
        {
          kind: "explain",
          title: "Toda comparação é uma pergunta",
          body: [
            "Um programa toma decisões fazendo perguntas: a vida acabou? a senha está certa? o jogador tem nível suficiente?",
            "Cada comparação responde `True` (verdadeiro) ou `False` (falso).",
          ],
          table: {
            head: ["Sinal", "Pergunta", "Exemplo", "Resultado"],
            rows: [
              ["==", "é igual?", "5 == 5", "True"],
              ["!=", "é diferente?", "5 != 3", "True"],
              [">", "é maior?", "2 > 7", "False"],
              ["<", "é menor?", "2 < 7", "True"],
              [">=", "é maior ou igual?", "7 >= 7", "True"],
              ["<=", "é menor ou igual?", "8 <= 7", "False"],
            ],
          },
          code: `vida = 0
print(vida <= 0)
print(vida > 50)`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Qual é a diferença entre = e ==?",
          options: [
            { text: "= guarda um valor; == pergunta se dois valores são iguais", correct: true, why: "Um sinal guarda. Dois sinais comparam. Dentro de um if, quase sempre você quer ==." },
            { text: "São a mesma coisa", why: "Não são. `x = 5` guarda 5 em x. `x == 5` pergunta se x vale 5." },
            { text: "== guarda e = compara", why: "É o contrário." },
          ],
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `print("Python" == "python")`,
          mono: true,
          options: [
            { text: "False", correct: true, why: "Na comparação de textos, maiúscula e minúscula contam. P e p são letras diferentes." },
            { text: "True", why: "Para o Python, \"Python\" e \"python\" são textos diferentes." },
          ],
        },
      ],
    },
    {
      id: "m05-l2",
      title: "if e else",
      summary: "Executar um bloco só se a condição for verdadeira",
      steps: [
        {
          kind: "explain",
          title: "if: só se for verdade",
          body: [
            "O `if` executa um bloco de código **só se** a condição for verdadeira.",
            "Repare em dois detalhes que o Python exige: os **dois-pontos** no fim da linha do if e os **4 espaços** antes das linhas de dentro. Esse recuo se chama **indentação**.",
          ],
          code: `vida = int(input("Vida: "))
if vida <= 0:
    print("GAME OVER")
    print("Continuar? (10 moedas)")
print("Fim do turno")`,
          run: true,
          tip: "Rode duas vezes: uma com 0 e outra com 50. A última linha não tem recuo, então ela roda sempre.",
        },
        {
          kind: "explain",
          title: "else: o outro caminho",
          body: [
            "O `else` é o caminho de quando a condição dá falso. Ele não tem condição própria.",
            "Sempre um dos dois blocos executa. Nunca os dois.",
          ],
          code: `senha = input("Senha: ")
if senha == "dragon42":
    print("Acesso liberado")
else:
    print("Senha incorreta")`,
          run: true,
          table: {
            head: ["Digitou", "Saída"],
            rows: [
              ["dragon42", "Acesso liberado"],
              ["Dragon42", "Senha incorreta"],
              ["1234", "Senha incorreta"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "O que aparece na tela?",
          code: `nivel = 3
if nivel >= 10:
    print("Ranked liberado")
print("Fim")`,
          mono: true,
          options: [
            { text: "Fim", correct: true, why: "3 >= 10 é falso, então o bloco do if é pulado. O print(\"Fim\") está fora do if (sem recuo) e roda sempre." },
            { text: "Ranked liberado\nFim", why: "A condição é falsa (3 não é maior ou igual a 10), então o print de dentro não roda." },
            { text: "Nada", why: "O último print não está dentro do if, então ele roda de qualquer jeito." },
          ],
        },
        {
          kind: "order",
          prompt: "Monte o programa: quem tem 16 anos ou mais pode criar conta sozinho. Atenção ao recuo das linhas.",
          lines: [
            `idade = int(input("Idade: "))`,
            `if idade >= 16:`,
            `    print("Conta criada")`,
            `else:`,
            `    print("Precisa de autorizacao")`,
          ],
          explain: "Primeiro recebe a idade. O if testa a condição e o print recuado logo abaixo é o bloco dele. Depois vem o else com o seu próprio bloco recuado.",
        },
        {
          kind: "fill",
          prompt: "Complete a condição de game over.",
          code: `if vida __1__ 0__2__
    print("GAME OVER")`,
          answers: ["<=", ":"],
          bank: ["<=", "=", ":", ";", "=>"],
          explain: "`<=` pergunta se é menor ou igual. Um `=` sozinho guardaria um valor e daria erro. E a linha do if sempre termina com `:`.",
        },
        {
          kind: "code",
          title: "Quem começa?",
          prompt: "No sorteio da partida, quem tira número par começa. Pergunte um número inteiro e mostre `PAR` ou `IMPAR`.",
          example: { inputs: ["14"], output: "PAR" },
          tests: [
            { inputs: ["14"], expect: "PAR" },
            { inputs: ["7"], expect: "IMPAR" },
            { inputs: ["0"], expect: "PAR" },
          ],
          hints: ["Um número é par quando o resto da divisão por 2 é zero: `numero % 2 == 0`.", "`if numero % 2 == 0:` com o print de PAR, e `else:` com o de IMPAR."],
          solution: `numero = int(input("Numero: "))
if numero % 2 == 0:
    print("PAR")
else:
    print("IMPAR")`,
        },
        {
          kind: "code",
          bug: true,
          title: "Verificador de senha",
          prompt: "Dois erros de escrita impedem esse programa de rodar. Conserte.",
          starter: `senha = input("Senha: ")
if senha == "dragon42"
    print("Acesso liberado")
else:
print("Acesso negado")
`,
          example: { inputs: ["dragon42"], output: "Acesso liberado" },
          tests: [
            { inputs: ["dragon42"], expect: "Acesso liberado" },
            { inputs: ["abc"], expect: "Acesso negado" },
          ],
          hints: ["A linha do if precisa terminar com `:`.", "O print de dentro do else precisa de 4 espaços antes."],
          solution: `senha = input("Senha: ")
if senha == "dragon42":
    print("Acesso liberado")
else:
    print("Acesso negado")`,
        },
      ],
    },
    {
      id: "m05-l3",
      title: "elif: vários caminhos",
      summary: "Faixas de valores e a ordem dos testes",
      steps: [
        {
          kind: "explain",
          title: "Mais de dois caminhos",
          body: [
            "Quando há várias faixas, use `elif` (abreviação de \"else if\"). O Python testa de cima para baixo e entra no **primeiro** caminho verdadeiro. Os outros são pulados.",
          ],
          code: `pontos = int(input("Pontos: "))
if pontos >= 2000:
    print("Elo: DIAMANTE")
elif pontos >= 1500:
    print("Elo: OURO")
elif pontos >= 1000:
    print("Elo: PRATA")
else:
    print("Elo: BRONZE")`,
          run: true,
          table: {
            head: ["Pontos", "Primeiro teste verdadeiro", "Saída"],
            rows: [
              ["2300", "pontos >= 2000", "DIAMANTE"],
              ["1700", "pontos >= 1500", "OURO"],
              ["1000", "pontos >= 1000", "PRATA"],
              ["400", "nenhum, cai no else", "BRONZE"],
            ],
          },
        },
        {
          kind: "explain",
          title: "A ordem importa",
          body: [
            "Se o teste mais fácil vier primeiro, ele \"rouba\" todos os casos.",
            "Neste código errado, 2300 pontos dá PRATA: `2300 >= 1000` já é verdade, então o Python entra ali e nem olha os testes de baixo.",
            "Regra prática: comece pelo teste **mais exigente**.",
          ],
          code: `pontos = 2300
if pontos >= 1000:
    print("Elo: PRATA")
elif pontos >= 2000:
    print("Elo: DIAMANTE")`,
          run: true,
          warn: "Ordem errada não dá erro: o programa roda, só que responde errado. Esse tipo de bug é o mais traiçoeiro.",
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `ping = 60
if ping < 300:
    print("Conexao boa")
elif ping < 100:
    print("Conexao otima")
else:
    print("Lag")`,
          mono: true,
          options: [
            { text: "Conexao boa", correct: true, why: "60 < 300 já é verdade no primeiro teste. O elif nem é avaliado, mesmo que 60 < 100 também fosse verdade." },
            { text: "Conexao otima", why: "Seria o correto na lógica, mas o primeiro teste já deu verdadeiro. Para funcionar, o `< 100` teria que vir antes." },
            { text: "Conexao boa\nConexao otima", why: "Num if/elif, no máximo um bloco executa." },
          ],
        },
        {
          kind: "code",
          title: "Medidor de internet",
          prompt: "Pergunte a velocidade em Mbps (inteiro) e classifique: **menos de 10** é `Lenta`, **menos de 100** é `Boa`, e **100 ou mais** é `Ultra`.",
          example: { inputs: ["50"], output: "Boa" },
          tests: [
            { inputs: ["5"], expect: "Lenta" },
            { inputs: ["50"], expect: "Boa" },
            { inputs: ["100"], expect: "Ultra" },
            { inputs: ["10"], expect: "Boa" },
            { inputs: ["500"], expect: "Ultra" },
          ],
          hints: ["Aqui os testes são de \"menor que\", então comece pelo menor: `if mbps < 10:`", "Depois `elif mbps < 100:` e por fim `else:`."],
          solution: `mbps = int(input("Velocidade (Mbps): "))
if mbps < 10:
    print("Lenta")
elif mbps < 100:
    print("Boa")
else:
    print("Ultra")`,
        },
        {
          kind: "code",
          title: "Conceito da prova",
          prompt: "Pergunte a nota (decimal) e mostre o conceito: **9 ou mais** `A`, **7 ou mais** `B`, **5 ou mais** `C`, abaixo de 5 `D`.",
          example: { inputs: ["7.5"], output: "B" },
          tests: [
            { inputs: ["9.5"], expect: "A" },
            { inputs: ["9"], expect: "A" },
            { inputs: ["7"], expect: "B" },
            { inputs: ["5.5"], expect: "C" },
            { inputs: ["2"], expect: "D" },
          ],
          hints: ["Teste de \"maior ou igual\": comece pelo mais alto, `if nota >= 9:`", "`elif nota >= 7:`, `elif nota >= 5:` e `else:`"],
          solution: `nota = float(input("Nota: "))
if nota >= 9:
    print("A")
elif nota >= 7:
    print("B")
elif nota >= 5:
    print("C")
else:
    print("D")`,
        },
      ],
    },
    {
      id: "m05-l4",
      title: "and, or e not",
      summary: "Juntar condições",
      steps: [
        {
          kind: "explain",
          title: "Juntando condições",
          body: [
            "`and`: as **duas** condições precisam ser verdadeiras.",
            "`or`: basta **uma** ser verdadeira.",
            "`not`: inverte. `not True` vira `False`.",
          ],
          table: {
            head: ["Exemplo", "Resultado"],
            rows: [
              ["True and True", "True"],
              ["True and False", "False"],
              ["True or False", "True"],
              ["False or False", "False"],
              ["not False", "True"],
            ],
          },
          code: `nivel = 35
partidas = 8
if nivel >= 30 and partidas >= 10:
    print("Ranked liberado")
else:
    print("Ainda nao")`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Com idade = 15 e autorizado = \"s\", o que aparece?",
          code: `if idade >= 16 or autorizado == "s":
    print("Pode entrar")
else:
    print("Nao pode")`,
          mono: true,
          options: [
            { text: "Pode entrar", correct: true, why: "Com `or`, basta uma condição ser verdadeira. A idade não passa, mas autorizado é \"s\"." },
            { text: "Nao pode", why: "Isso aconteceria com `and`. Com `or`, uma condição verdadeira já basta." },
          ],
        },
        {
          kind: "code",
          title: "Inscrição no torneio",
          prompt: "Pergunte o **nível** (inteiro) e se a conta é **verificada** (`s` ou `n`). A inscrição é aceita só se o nível for **20 ou mais** E a conta for verificada.",
          example: { inputs: ["25", "s"], output: "Inscricao aceita" },
          tests: [
            { inputs: ["25", "s"], expect: "Inscricao aceita" },
            { inputs: ["25", "n"], expect: "Inscricao recusada" },
            { inputs: ["12", "s"], expect: "Inscricao recusada" },
            { inputs: ["20", "s"], expect: "Inscricao aceita" },
          ],
          hints: ["Nível com `int(input(...))`. A resposta s/n fica como texto mesmo.", "`if nivel >= 20 and verificada == \"s\":`"],
          solution: `nivel = int(input("Nivel: "))
verificada = input("Conta verificada? (s/n): ")
if nivel >= 20 and verificada == "s":
    print("Inscricao aceita")
else:
    print("Inscricao recusada")`,
        },
        {
          kind: "code",
          title: "Dia de maratona",
          prompt: "Pergunte o dia da semana (escrito em minúsculas, sem acento). Se for `sabado` **ou** `domingo`, mostre `Maratona liberada`. Senão, mostre `Dia de aula`.",
          example: { inputs: ["sabado"], output: "Maratona liberada" },
          tests: [
            { inputs: ["sabado"], expect: "Maratona liberada" },
            { inputs: ["domingo"], expect: "Maratona liberada" },
            { inputs: ["terca"], expect: "Dia de aula" },
          ],
          hints: ["Cada lado do `or` precisa ser uma comparação completa: `dia == \"sabado\" or dia == \"domingo\"`.", "Escrever `dia == \"sabado\" or \"domingo\"` parece certo, mas sempre dá verdadeiro."],
          solution: `dia = input("Dia: ")
if dia == "sabado" or dia == "domingo":
    print("Maratona liberada")
else:
    print("Dia de aula")`,
        },
      ],
    },
  ],
  cards: [
    { front: "Como termina a linha de um if?", back: "Com dois-pontos :", code: `if vida <= 0:` },
    { front: "O que a indentação faz?", back: "Os 4 espaços dizem quais linhas estão dentro do if (ou do else, for, while, def)." },
    { front: "Num if/elif/else, quantos blocos executam?", back: "No máximo um: o primeiro cuja condição for verdadeira." },
    { front: "Qual teste vem primeiro no elif?", back: "O mais exigente. Senão, o teste mais fácil pega todos os casos." },
    { front: "and ou or?", back: "and: as duas condições precisam ser verdadeiras. or: basta uma." },
  ],
});
