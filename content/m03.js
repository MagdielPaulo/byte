/* Módulo 3. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m03",
  title: "Entrada de dados",
  tagline: "input, int e float: o programa conversa com você",
  accent: "pink",
  lessons: [
    {
      id: "m03-l1",
      title: "input: o programa pergunta",
      summary: "Receber o que a pessoa digita",
      steps: [
        {
          kind: "explain",
          title: "Até agora o programa só falava",
          body: [
            "Com `input`, o programa **pergunta** e espera a pessoa digitar. O que for digitado fica guardado numa variável.",
            "O texto dentro do `input(...)` é a pergunta que aparece na tela.",
            "Rode e responda no console. Aperte **Enter** para enviar.",
          ],
          code: `nick = input("Escolha seu nick: ")
print("Bem-vindo,", nick)`,
          run: true,
        },
        {
          kind: "explain",
          title: "O que acontece, passo a passo",
          body: ["Na linha `nick = input(\"Escolha seu nick: \")`:"],
          table: {
            head: ["Passo", "O que o Python faz"],
            rows: [
              ["1", "Mostra a pergunta \"Escolha seu nick: \""],
              ["2", "Para e espera a pessoa digitar e apertar Enter"],
              ["3", "Guarda o que foi digitado na variável nick"],
              ["4", "Segue para a próxima linha"],
            ],
          },
          tip: "Deixe um espaço depois dos dois-pontos da pergunta (`\"Nick: \"`). Assim a resposta não fica grudada no texto.",
        },
        {
          kind: "quiz",
          question: "O que a função input faz?",
          options: [
            { text: "Mostra uma pergunta, espera a resposta e devolve o que foi digitado", correct: true, why: "Exatamente. E esse valor normalmente é guardado numa variável." },
            { text: "Só mostra um texto na tela", why: "Isso é o que o print faz. O input também espera uma resposta." },
            { text: "Cria uma variável sozinho", why: "Quem cria a variável é o `=`. O input só entrega o valor digitado." },
          ],
        },
        {
          kind: "order",
          prompt: "Monte um programa que pergunta o nick e o jogo favorito e depois mostra uma frase com os dois.",
          lines: [`nick = input("Nick: ")`, `jogo = input("Jogo favorito: ")`, `print(nick, "joga", jogo)`],
          output: "Nick: Kira\nJogo favorito: Minecraft\nKira joga Minecraft",
          explain: "Primeiro o programa precisa receber os valores. Só depois dá para usar as variáveis no print. Se o print viesse antes, as variáveis ainda não existiriam.",
        },
        {
          kind: "code",
          title: "Login do servidor",
          prompt: "Pergunte o nick do jogador e mostre `Conectado como` seguido do nick.",
          starter: "",
          example: { inputs: ["Shadow"], output: "Conectado como Shadow" },
          tests: [
            { inputs: ["Shadow"], expect: "Conectado como Shadow" },
            { inputs: ["Kira"], expect: "Conectado como Kira" },
          ],
          hints: ["`nick = input(\"Nick: \")`", "`print(\"Conectado como\", nick)`"],
          solution: `nick = input("Nick: ")
print("Conectado como", nick)`,
        },
        {
          kind: "code",
          title: "Perfil de jogador",
          prompt: "Pergunte o **nick** e depois a **plataforma** (PC, console, celular...). Mostre uma frase como a do exemplo.",
          example: { inputs: ["Kira", "PC"], output: "Kira joga no PC" },
          tests: [
            { inputs: ["Kira", "PC"], expect: "Kira joga no PC" },
            { inputs: ["Leo", "celular"], expect: "Leo joga no celular" },
          ],
          hints: ["São dois `input`, um para cada pergunta, nessa ordem.", "`print(nick, \"joga no\", plataforma)`"],
          solution: `nick = input("Nick: ")
plataforma = input("Plataforma: ")
print(nick, "joga no", plataforma)`,
        },
      ],
    },
    {
      id: "m03-l2",
      title: "Números do teclado",
      summary: "Converter texto em número com int e float",
      steps: [
        {
          kind: "explain",
          title: "input sempre devolve texto",
          body: [
            "Mesmo que a pessoa digite 16, o `input` entrega o **texto** \"16\". E texto não faz conta.",
            "Rode este programa, digite um número e veja o erro.",
          ],
          code: `idade = input("Idade: ")
print(idade + 1)`,
          run: true,
        },
        {
          kind: "explain",
          title: "int() e float() convertem",
          body: [
            "`int(...)` transforma texto em número inteiro. `float(...)` transforma em número decimal.",
            "O jeito mais comum é colocar o `input` direto dentro da conversão:",
          ],
          code: `idade = int(input("Idade: "))
print("Ano que vem voce tera", idade + 1)`,
          run: true,
          table: {
            head: ["Código", "Resultado"],
            rows: [
              ["int(\"16\")", "16 (inteiro)"],
              ["float(\"8.5\")", "8.5 (decimal)"],
              ["float(\"16\")", "16.0 (decimal)"],
              ["int(\"8.5\")", "ValueError: não é inteiro"],
              ["int(\"dezesseis\")", "ValueError: não é número"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "A pessoa digita 5 e depois 3. O que aparece?",
          code: `a = input("Primeiro: ")
b = input("Segundo: ")
print(a + b)`,
          mono: true,
          options: [
            { text: "53", correct: true, why: "Sem conversão, a e b são textos. Texto + texto junta: \"5\" + \"3\" = \"53\"." },
            { text: "8", why: "Para somar seria preciso converter: `int(input(...))`." },
            { text: "Dá erro", why: "Texto + texto não dá erro. Ele junta os dois." },
          ],
        },
        {
          kind: "quiz",
          question: "Você quer pedir o preço de uma skin, como 24.90. Qual linha usar?",
          mono: true,
          options: [
            { text: "preco = float(input(\"Preco: \"))", correct: true, why: "Preço tem centavos, então é decimal: float." },
            { text: "preco = int(input(\"Preco: \"))", why: "int não aceita \"24.90\": dá ValueError. int é para números sem casa decimal." },
            { text: "preco = input(\"Preco: \")", why: "Sem conversão, o preço fica como texto e não dá para fazer conta com ele." },
          ],
        },
        {
          kind: "fill",
          prompt: "Complete para o programa calcular o próximo nível.",
          code: `nivel = __1__(input("Nivel atual: "))
print("Proximo nivel:", nivel + 1)`,
          answers: ["int"],
          bank: ["int", "str", "print", "input"],
          explain: "Nível é um número inteiro, então `int(...)`. Sem a conversão, `nivel + 1` tentaria somar texto com número e daria TypeError.",
        },
        {
          kind: "code",
          bug: true,
          title: "Calculadora de dano quebrada",
          prompt: "O programa deveria multiplicar o dano base pelo multiplicador, mas dá erro. Rode, leia a mensagem e conserte.",
          starter: `dano = input("Dano base: ")
multiplicador = input("Multiplicador: ")
print("Dano total:", dano * multiplicador)
`,
          example: { inputs: ["40", "1.5"], output: "Dano total: 60.0" },
          tests: [
            { inputs: ["40", "1.5"], expect: "Dano total: 60.0" },
            { inputs: ["10", "3"], expect: "Dano total: 30.0" },
          ],
          hints: ["Os dois valores vieram do input, então são texto. Texto não multiplica texto.", "Converta os dois com `float(...)`: o multiplicador pode ter casa decimal."],
          solution: `dano = float(input("Dano base: "))
multiplicador = float(input("Multiplicador: "))
print("Dano total:", dano * multiplicador)`,
        },
        {
          kind: "code",
          title: "Quanto falta para upar",
          prompt: "Pergunte o **XP atual** e o **XP necessário** para o próximo nível (números inteiros). Mostre quanto falta.",
          example: { inputs: ["750", "1000"], output: "Faltam 250 de XP" },
          tests: [
            { inputs: ["750", "1000"], expect: "Faltam 250 de XP" },
            { inputs: ["90", "100"], expect: "Faltam 10 de XP" },
          ],
          hints: ["Dois `int(input(...))`.", "A conta é `necessario - atual`.", "`print(\"Faltam\", falta, \"de XP\")`"],
          solution: `atual = int(input("XP atual: "))
necessario = int(input("XP necessario: "))
falta = necessario - atual
print("Faltam", falta, "de XP")`,
        },
      ],
    },
  ],
  cards: [
    { front: "O que o input devolve?", back: "Sempre texto (str), mesmo que a pessoa digite um número." },
    { front: "Como receber um número inteiro?", back: "Converta com int.", code: `idade = int(input("Idade: "))` },
    { front: "Quando usar float?", back: "Quando o número pode ter casa decimal: preço, altura, média." },
    { front: "O que dá int(\"8.5\")?", back: "ValueError. int só aceita texto de número inteiro. Para decimal, use float." },
  ],
});
