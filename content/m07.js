/* Módulo 7. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m07",
  title: "Repetição com while",
  tagline: "Repetir enquanto uma condição for verdadeira",
  accent: "cyan",
  lessons: [
    {
      id: "m07-l1",
      title: "while",
      summary: "Laços sem número fixo de voltas",
      steps: [
        {
          kind: "explain",
          title: "Quando você não sabe quantas vezes",
          body: [
            "O `for` serve quando você sabe quantas voltas vai dar. Mas quantas tentativas alguém vai precisar para acertar uma senha? Não dá para saber.",
            "O `while` repete **enquanto** a condição for verdadeira. Antes de cada volta ele testa de novo. Quando a condição fica falsa, o laço acaba.",
          ],
          code: `senha = ""
while senha != "pixel":
    senha = input("Senha: ")
print("Acesso liberado")`,
          run: true,
        },
        {
          kind: "explain",
          title: "Todo while precisa de saída",
          body: [
            "Repare nas três partes do exemplo anterior:",
          ],
          table: {
            head: ["Parte", "No exemplo", "Por quê"],
            rows: [
              ["Antes do laço", "senha = \"\"", "A variável precisa existir para o primeiro teste"],
              ["A condição", "senha != \"pixel\"", "Decide se dá mais uma volta"],
              ["Dentro do laço", "senha = input(...)", "Muda a variável. É isso que um dia faz a condição ficar falsa"],
            ],
          },
          warn: "Se nada dentro do laço muda a condição, ele nunca termina: é o **laço infinito**. Neste site, use o botão Parar.",
        },
        {
          kind: "quiz",
          question: "Este laço termina?",
          code: `x = 1
while x < 5:
    print(x)`,
          options: [
            { text: "Não, ele nunca para", correct: true, why: "Nada dentro do laço muda o x. Ele continua valendo 1, e 1 < 5 é sempre verdade." },
            { text: "Sim, depois de 4 voltas", why: "Pararia se tivesse `x = x + 1` dentro do laço. Sem isso, x nunca muda." },
            { text: "Ele nem começa", why: "1 < 5 é verdade, então ele começa. O problema é que nunca termina." },
          ],
        },
        {
          kind: "order",
          prompt: "Monte uma contagem regressiva com while que vai de 3 até 1 e depois mostra Lançar.",
          lines: [`n = 3`, `while n > 0:`, `    print(n)`, `    n = n - 1`, `print("Lancar")`],
          extra: [`    n = n + 1`],
          output: "3\n2\n1\nLancar",
          explain: "O `n = n - 1` dentro do laço faz o n chegar a 0, e aí a condição fica falsa. Com `n = n + 1` o número cresceria para sempre.",
        },
        {
          kind: "code",
          title: "Tentativas de login",
          prompt: "A senha é `pixel`. Peça a senha até a pessoa acertar e **conte as tentativas**. No fim, mostre as duas linhas do exemplo.",
          starter: `senha = ""
tentativas = 0
`,
          example: { inputs: ["1234", "Pixel", "pixel"], output: "Acesso liberado\nTentativas: 3" },
          tests: [
            { inputs: ["1234", "Pixel", "pixel"], expect: "Acesso liberado\nTentativas: 3" },
            { inputs: ["pixel"], expect: "Acesso liberado\nTentativas: 1" },
          ],
          hints: ["`while senha != \"pixel\":`", "Dentro do laço: leia a senha e faça `tentativas = tentativas + 1`.", "Os dois print ficam depois do laço, sem recuo."],
          solution: `senha = ""
tentativas = 0
while senha != "pixel":
    senha = input("Senha: ")
    tentativas = tentativas + 1
print("Acesso liberado")
print("Tentativas:", tentativas)`,
        },
        {
          kind: "code",
          title: "Validação de volume",
          prompt: "Peça o volume (inteiro). Enquanto ele estiver **fora** do intervalo de 0 a 100, mostre `Valor invalido` e peça de novo. Quando for válido, mostre `Volume:` e o valor.",
          example: { inputs: ["150", "-5", "70"], output: "Valor invalido\nValor invalido\nVolume: 70" },
          tests: [
            { inputs: ["150", "-5", "70"], expect: "Valor invalido\nValor invalido\nVolume: 70" },
            { inputs: ["100"], expect: "Volume: 100" },
            { inputs: ["101", "0"], expect: "Valor invalido\nVolume: 0" },
          ],
          hints: ["Peça o volume uma vez **antes** do while.", "Fora do intervalo: `volume < 0 or volume > 100`.", "Dentro do laço: mostre o aviso e peça o volume de novo."],
          solution: `volume = int(input("Volume: "))
while volume < 0 or volume > 100:
    print("Valor invalido")
    volume = int(input("Volume: "))
print("Volume:", volume)`,
          after: "Esse padrão (pedir, e repetir enquanto estiver errado) é usado em todo formulário de verdade.",
        },
        {
          kind: "code",
          title: "Farm de XP",
          prompt: "Cada batalha dá `ganho` de XP. Usando while, calcule **quantas batalhas** são necessárias para chegar na `meta`. Mostre as batalhas e o XP final. O teste troca os valores de ganho e meta, então use as variáveis.",
          starter: `ganho = 35
meta = 200
xp = 0
batalhas = 0
`,
          example: { output: "Batalhas: 6\nXP final: 210" },
          tests: [
            { expect: "Batalhas: 6\nXP final: 210" },
            { expect: "Batalhas: 4\nXP final: 200", replace: ["ganho = 35", "ganho = 50"] },
            { expect: "Batalhas: 2\nXP final: 70", replace: ["meta = 200", "meta = 60"] },
          ],
          hints: ["`while xp < meta:`", "Dentro: `xp = xp + ganho` e `batalhas = batalhas + 1`."],
          solution: `ganho = 35
meta = 200
xp = 0
batalhas = 0
while xp < meta:
    xp = xp + ganho
    batalhas = batalhas + 1
print("Batalhas:", batalhas)
print("XP final:", xp)`,
        },
        {
          kind: "quiz",
          question: "Um programa precisa mostrar os 10 primeiros colocados de um ranking. for ou while?",
          options: [
            { text: "for, porque o número de voltas é conhecido (10)", correct: true, why: "Sabendo quantas vezes, o for é mais simples e não tem risco de laço infinito." },
            { text: "while, porque é repetição", why: "Funcionaria, mas daria mais trabalho. O while brilha quando você não sabe quantas voltas vão ser." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "Quando usar while em vez de for?", back: "Quando não dá para saber quantas voltas o laço vai dar (senha, validação, jogo até alguém vencer)." },
    { front: "O que causa um laço infinito?", back: "Nada dentro do while muda a condição, então ela continua verdadeira para sempre." },
    { front: "Padrão de validação", back: "Pede uma vez antes do laço e repete enquanto o valor for inválido.", code: `n = int(input("N: "))
while n < 0:
    n = int(input("N: "))` },
  ],
});
