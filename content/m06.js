/* Módulo 6. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m06",
  title: "Repetição com for",
  tagline: "range, acumulador e contador",
  accent: "blue",
  lessons: [
    {
      id: "m06-l1",
      title: "for e range",
      summary: "Repetir um número certo de vezes",
      steps: [
        {
          kind: "explain",
          title: "Repetir sem copiar",
          body: [
            "Imagine escrever `print(\"Ataque!\")` cem vezes. O `for` resolve isso: ele repete o bloco recuado quantas vezes você mandar.",
            "Igual ao if: a linha termina com `:` e o que repete fica com 4 espaços.",
          ],
          code: `for i in range(3):
    print("Ataque!")
print("Combo finalizado")`,
          run: true,
        },
        {
          kind: "explain",
          title: "A variável do for",
          body: [
            "A cada volta, a variável do for (aqui, `onda`) recebe o próximo número do `range`. Ela muda sozinha.",
          ],
          code: `for onda in range(1, 4):
    print("Onda", onda, "chegando...")`,
          run: true,
          table: {
            head: ["Volta", "onda", "Saída"],
            rows: [
              ["1ª", "1", "Onda 1 chegando..."],
              ["2ª", "2", "Onda 2 chegando..."],
              ["3ª", "3", "Onda 3 chegando..."],
            ],
          },
        },
        {
          kind: "explain",
          title: "Formas do range",
          body: ["O número final **nunca entra**. Por isso para contar até 10 você escreve 11."],
          table: {
            head: ["Código", "Números gerados"],
            rows: [
              ["range(5)", "0, 1, 2, 3, 4"],
              ["range(1, 6)", "1, 2, 3, 4, 5"],
              ["range(1, 11)", "1 até 10"],
              ["range(0, 11, 2)", "0, 2, 4, 6, 8, 10 (de 2 em 2)"],
              ["range(10, 0, -1)", "10, 9, ... 1 (contando para trás)"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `for i in range(3):
    print(i)`,
          mono: true,
          options: [
            { text: "0\n1\n2", correct: true, why: "range(3) começa no 0 e para antes do 3." },
            { text: "1\n2\n3", why: "range com um número só começa no 0, não no 1." },
            { text: "0\n1\n2\n3", why: "O número final nunca entra." },
          ],
        },
        {
          kind: "fill",
          prompt: "Complete para mostrar os números de 1 até 10.",
          code: `for n in range(1, __1__):
    print(n)`,
          answers: ["11"],
          bank: ["10", "11", "9", "0"],
          explain: "O range para **antes** do segundo número. Para o 10 aparecer, o limite precisa ser 11.",
        },
        {
          kind: "code",
          title: "Contagem regressiva",
          prompt: "Pergunte de qual número começar. Mostre do número até 1, um por linha, e depois `GO!`",
          example: { inputs: ["3"], output: "3\n2\n1\nGO!" },
          tests: [
            { inputs: ["3"], expect: "3\n2\n1\nGO!" },
            { inputs: ["5"], expect: "5\n4\n3\n2\n1\nGO!" },
            { inputs: ["1"], expect: "1\nGO!" },
          ],
          hints: ["Para contar para trás: `range(n, 0, -1)`.", "O `print(\"GO!\")` fica fora do for, sem recuo."],
          solution: `n = int(input("Comecar de: "))
for i in range(n, 0, -1):
    print(i)
print("GO!")`,
        },
        {
          kind: "code",
          title: "Tabela de dano por nível",
          prompt: "Pergunte o dano base (inteiro). Mostre o dano do nível 1 ao 5, sabendo que o dano é **base vezes o nível**.",
          example: { inputs: ["12"], output: "Nivel 1 - 12\nNivel 2 - 24\nNivel 3 - 36\nNivel 4 - 48\nNivel 5 - 60" },
          tests: [
            { inputs: ["12"], expect: "Nivel 1 - 12\nNivel 2 - 24\nNivel 3 - 36\nNivel 4 - 48\nNivel 5 - 60" },
            { inputs: ["7"], expect: "Nivel 1 - 7\nNivel 2 - 14\nNivel 3 - 21\nNivel 4 - 28\nNivel 5 - 35" },
          ],
          hints: ["`for nivel in range(1, 6):`", "Dentro do for: `print(\"Nivel\", nivel, \"-\", base * nivel)`"],
          solution: `base = int(input("Dano base: "))
for nivel in range(1, 6):
    print("Nivel", nivel, "-", base * nivel)`,
        },
      ],
    },
    {
      id: "m06-l2",
      title: "Acumulador e contador",
      summary: "Somar e contar dentro do laço",
      steps: [
        {
          kind: "explain",
          title: "Acumulador: somar volta a volta",
          body: [
            "Para somar vários valores, crie uma variável que começa em **zero antes do laço**. A cada volta, some o valor novo nela.",
          ],
          code: `total = 0
for rodada in range(3):
    pontos = int(input("Pontos da rodada: "))
    total = total + pontos
print("Total:", total)`,
          run: true,
          table: {
            head: ["Momento", "pontos", "total"],
            rows: [
              ["antes do for", "-", "0"],
              ["volta 1 (digitou 10)", "10", "10"],
              ["volta 2 (digitou 25)", "25", "35"],
              ["volta 3 (digitou 5)", "5", "40"],
            ],
          },
        },
        {
          kind: "explain",
          title: "Contador: contar quantas vezes",
          body: [
            "Contador é parecido, mas soma **1** em vez do valor. Normalmente fica dentro de um `if`: conta só o que interessa.",
          ],
          code: `vitorias = 0
for partida in range(4):
    resultado = input("Resultado (V ou D): ")
    if resultado == "V":
        vitorias = vitorias + 1
print("Vitorias:", vitorias)`,
          run: true,
        },
        {
          kind: "code",
          bug: true,
          title: "O total que zera",
          prompt: "Este programa deveria somar os pontos de 3 rodadas, mas mostra só o último valor. O problema é de **lugar**, não de escrita.",
          starter: `for rodada in range(3):
    total = 0
    pontos = int(input("Pontos da rodada: "))
    total = total + pontos
print("Total:", total)
`,
          example: { inputs: ["10", "25", "5"], output: "Total: 40" },
          tests: [
            { inputs: ["10", "25", "5"], expect: "Total: 40" },
            { inputs: ["1", "2", "3"], expect: "Total: 6" },
          ],
          hints: ["Faça o teste de mesa: em cada volta, o que acontece com total na primeira linha de dentro do for?", "`total = 0` precisa ficar **antes** do for, sem recuo."],
          solution: `total = 0
for rodada in range(3):
    pontos = int(input("Pontos da rodada: "))
    total = total + pontos
print("Total:", total)`,
        },
        {
          kind: "order",
          prompt: "Monte o programa que calcula a média de 4 partidas.",
          lines: [
            `soma = 0`,
            `for i in range(4):`,
            `    pontos = float(input("Pontos: "))`,
            `    soma = soma + pontos`,
            `print("Media:", soma / 4)`,
          ],
          extra: [`    print("Media:", soma / 4)`],
          explain: "O acumulador começa antes do for. Ler e somar ficam dentro (recuados). A média é calculada uma vez só, depois do laço, por isso o print fica sem recuo.",
        },
        {
          kind: "code",
          title: "Média de abates",
          prompt: "Pergunte **quantas partidas** foram jogadas. Depois leia os abates de cada partida (inteiros) e mostre a média.",
          example: { inputs: ["4", "10", "5", "8", "13"], output: "Media: 9.0" },
          tests: [
            { inputs: ["4", "10", "5", "8", "13"], expect: "Media: 9.0" },
            { inputs: ["2", "3", "4"], expect: "Media: 3.5" },
          ],
          hints: ["O range usa o número digitado: `for i in range(partidas):`", "Acumulador antes do for. No fim: `soma / partidas`."],
          solution: `partidas = int(input("Partidas: "))
soma = 0
for i in range(partidas):
    abates = int(input("Abates: "))
    soma = soma + abates
print("Media:", soma / partidas)`,
        },
        {
          kind: "code",
          title: "Taxa de vitória",
          prompt: "Leia o resultado de **5 partidas** (`V` ou `D`, maiúsculo). Mostre quantas foram vitórias e a porcentagem.",
          example: { inputs: ["V", "D", "V", "V", "D"], output: "Vitorias: 3\nTaxa: 60.0 %" },
          tests: [
            { inputs: ["V", "D", "V", "V", "D"], expect: "Vitorias: 3\nTaxa: 60.0 %" },
            { inputs: ["D", "D", "D", "D", "V"], expect: "Vitorias: 1\nTaxa: 20.0 %" },
          ],
          hints: ["Contador: `vitorias = 0` antes do laço e `vitorias = vitorias + 1` dentro de um `if resultado == \"V\":`", "Porcentagem: `vitorias / 5 * 100`."],
          solution: `vitorias = 0
for i in range(5):
    resultado = input("Resultado: ")
    if resultado == "V":
        vitorias = vitorias + 1
print("Vitorias:", vitorias)
print("Taxa:", vitorias / 5 * 100, "%")`,
        },
        {
          kind: "code",
          title: "Soma dos pares",
          prompt: "Pergunte um número n e mostre a soma de todos os números **pares** de 1 até n.",
          example: { inputs: ["10"], output: "Soma: 30" },
          tests: [
            { inputs: ["10"], expect: "Soma: 30" },
            { inputs: ["7"], expect: "Soma: 12" },
            { inputs: ["1"], expect: "Soma: 0" },
          ],
          hints: ["Percorra de 1 até n: `range(1, n + 1)`.", "Só some quando `i % 2 == 0`."],
          solution: `n = int(input("n: "))
soma = 0
for i in range(1, n + 1):
    if i % 2 == 0:
        soma = soma + i
print("Soma:", soma)`,
        },
      ],
    },
  ],
  cards: [
    { front: "range(1, 6) gera quais números?", back: "1, 2, 3, 4, 5. O número final nunca entra." },
    { front: "Como contar de 10 até 1?", back: "range(10, 0, -1)" },
    { front: "Onde fica o total = 0 do acumulador?", back: "Antes do for. Dentro do laço ele seria zerado a cada volta." },
    { front: "Acumulador × contador", back: "Acumulador soma o valor (total = total + x). Contador soma 1 (n = n + 1)." },
  ],
});
