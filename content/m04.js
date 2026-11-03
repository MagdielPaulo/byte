/* Módulo 4. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m04",
  title: "Contas",
  tagline: "Operadores e problemas do mundo real",
  accent: "amber",
  lessons: [
    {
      id: "m04-l1",
      title: "Operadores",
      summary: "Soma, divisão, divisão inteira e resto",
      steps: [
        {
          kind: "explain",
          title: "O Python como calculadora",
          body: ["Estes são os operadores de conta. Os dois mais diferentes são `//` e `%`."],
          table: {
            head: ["Operador", "Faz", "Exemplo", "Resultado"],
            rows: [
              ["+", "soma", "17 + 5", "22"],
              ["-", "subtração", "17 - 5", "12"],
              ["*", "multiplicação", "17 * 5", "85"],
              ["/", "divisão", "17 / 5", "3.4"],
              ["//", "divisão inteira", "17 // 5", "3"],
              ["%", "resto da divisão", "17 % 5", "2"],
              ["**", "potência", "2 ** 10", "1024"],
            ],
          },
        },
        {
          kind: "explain",
          title: "// e % na prática",
          body: [
            "Você tem 17 itens e cada slot do inventário guarda 5. Quantos slots ficam cheios e quantos itens sobram?",
            "`17 // 5` dá **3**: três slots cheios. `17 % 5` dá **2**: sobram dois itens.",
            "O `%` também diz se um número é par: se `numero % 2` dá 0, o número é par.",
          ],
          code: `itens = 17
por_slot = 5
print("Slots cheios:", itens // por_slot)
print("Sobram:", itens % por_slot)`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `print(7 / 2)`,
          mono: true,
          options: [
            { text: "3.5", correct: true, why: "A barra simples / faz a divisão completa e sempre devolve decimal." },
            { text: "3", why: "Esse seria o resultado de `7 // 2`, a divisão inteira." },
            { text: "1", why: "Esse seria o resto: `7 % 2`." },
          ],
        },
        {
          kind: "quiz",
          question: "Quanto dá 20 % 6?",
          code: `print(20 % 6)`,
          mono: true,
          options: [
            { text: "2", correct: true, why: "6 cabe 3 vezes em 20 (18). Sobram 2." },
            { text: "3", why: "3 é quantas vezes o 6 cabe em 20, ou seja, `20 // 6`. O % mostra o que sobra." },
            { text: "3.33", why: "Esse seria `20 / 6`. O % mostra só o resto." },
          ],
        },
        {
          kind: "quiz",
          question: "Quanto dá 2 + 3 * 4?",
          code: `print(2 + 3 * 4)`,
          mono: true,
          options: [
            { text: "14", correct: true, why: "Igual na matemática: multiplicação antes da soma. 3 * 4 = 12, mais 2 = 14." },
            { text: "20", why: "Daria 20 se fosse `(2 + 3) * 4`. Sem parênteses, a multiplicação vem primeiro." },
          ],
        },
        {
          kind: "code",
          title: "Timer de speedrun",
          prompt: "Um speedrun durou um certo número de segundos. Pergunte o total de segundos (inteiro) e mostre em minutos e segundos.",
          example: { inputs: ["125"], output: "2 min e 5 s" },
          tests: [
            { inputs: ["125"], expect: "2 min e 5 s" },
            { inputs: ["59"], expect: "0 min e 59 s" },
            { inputs: ["3600"], expect: "60 min e 0 s" },
          ],
          hints: ["Minutos: `total // 60` (quantas vezes 60 cabe).", "Segundos que sobram: `total % 60`.", "`print(minutos, \"min e\", segundos, \"s\")`"],
          solution: `total = int(input("Segundos: "))
minutos = total // 60
segundos = total % 60
print(minutos, "min e", segundos, "s")`,
        },
      ],
    },
    {
      id: "m04-l2",
      title: "Problemas reais",
      summary: "Receber, calcular e mostrar",
      steps: [
        {
          kind: "explain",
          title: "O molde da maioria dos programas",
          body: [
            "Quase todo programa simples tem três partes: **receber** os dados, **calcular** e **mostrar** o resultado.",
            "Exemplo: quanto tempo um jogo leva para baixar? Tamanho em GB e velocidade em MB por segundo.",
            "`round(valor, 1)` arredonda para 1 casa decimal.",
          ],
          code: `tamanho_gb = float(input("Tamanho do jogo (GB): "))
velocidade = float(input("Velocidade (MB/s): "))

segundos = tamanho_gb * 1024 / velocidade
minutos = segundos / 60

print("Tempo estimado:", round(minutos, 1), "minutos")`,
          run: true,
        },
        {
          kind: "order",
          prompt: "Coloque o programa na ordem: ele calcula quantas horas de bateria ainda restam.",
          lines: [
            `bateria = float(input("Bateria (%): "))`,
            `gasto = float(input("Gasto por hora (%): "))`,
            `horas = bateria / gasto`,
            `print("Restam", horas, "horas")`,
          ],
          extra: [`print("Restam", bateria, "horas")`],
          explain: "Receber (os dois input), calcular (a divisão) e só então mostrar. A linha que mostrava a bateria no lugar das horas estava errada.",
        },
        {
          kind: "code",
          title: "Rachar a assinatura",
          prompt: "Um plano família de streaming vai ser dividido entre amigos. Pergunte o **preço** (decimal) e **quantas pessoas** (inteiro). Mostre quanto cada um paga.",
          example: { inputs: ["44.90", "2"], output: "Cada um paga R$ 22.45" },
          tests: [
            { inputs: ["44.90", "2"], expect: "Cada um paga R$ 22.45" },
            { inputs: ["60", "4"], expect: "Cada um paga R$ 15.0" },
            { inputs: ["39.90", "3"], expect: "Cada um paga R$ 13.3" },
          ],
          hints: ["Preço é `float`, pessoas é `int`.", "`cada_um = preco / pessoas`", "Se quiser, use `round(cada_um, 2)` para 2 casas."],
          solution: `preco = float(input("Preco: "))
pessoas = int(input("Pessoas: "))
cada_um = preco / pessoas
print("Cada um paga R$", round(cada_um, 2))`,
        },
        {
          kind: "code",
          title: "KDA",
          prompt: "Em jogos de tiro, o KD é o número de abates dividido pelo número de mortes. Pergunte os **abates** e as **mortes** (inteiros) e mostre o KD.",
          example: { inputs: ["20", "8"], output: "KD: 2.5" },
          tests: [
            { inputs: ["20", "8"], expect: "KD: 2.5" },
            { inputs: ["5", "10"], expect: "KD: 0.5" },
            { inputs: ["7", "7"], expect: "KD: 1.0" },
          ],
          hints: ["`kd = abates / mortes`", "`print(\"KD:\", kd)`"],
          solution: `abates = int(input("Abates: "))
mortes = int(input("Mortes: "))
kd = abates / mortes
print("KD:", kd)`,
        },
        {
          kind: "code",
          title: "Armazenamento do celular",
          prompt: "Pergunte quanto espaço livre o celular tem (GB, decimal) e o tamanho de cada foto (MB, decimal). Mostre quantas fotos **inteiras** ainda cabem. Lembre: 1 GB = 1024 MB.",
          example: { inputs: ["2", "3.5"], output: "Cabem 585 fotos" },
          tests: [
            { inputs: ["2", "3.5"], expect: "Cabem 585 fotos" },
            { inputs: ["1", "4"], expect: "Cabem 256 fotos" },
            { inputs: ["0.5", "10"], expect: "Cabem 51 fotos" },
          ],
          hints: ["Converta o espaço para MB: `livre_mb = livre_gb * 1024`.", "Fotos inteiras pedem divisão inteira: `livre_mb // foto_mb`.", "O resultado de `//` com decimais vem com .0. Use `int(...)` para mostrar sem o .0."],
          solution: `livre_gb = float(input("Espaco livre (GB): "))
foto_mb = float(input("Tamanho da foto (MB): "))
livre_mb = livre_gb * 1024
fotos = int(livre_mb // foto_mb)
print("Cabem", fotos, "fotos")`,
        },
      ],
    },
  ],
  cards: [
    { front: "Diferença entre / e //", back: "/ divide e devolve decimal (7 / 2 = 3.5). // devolve só a parte inteira (7 // 2 = 3)." },
    { front: "Para que serve o %?", back: "Dá o resto da divisão. numero % 2 == 0 quer dizer que o número é par." },
    { front: "Qual conta vem primeiro: + ou *?", back: "Multiplicação e divisão vêm antes de soma e subtração. Na dúvida, use parênteses." },
    { front: "O que faz round(x, 2)?", back: "Arredonda x para 2 casas decimais." },
  ],
});
