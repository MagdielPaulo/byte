/* Módulo 8. Edite à vontade: textos, exemplos e exercícios. */

CONTENT.push({
  id: "m08",
  title: "Listas",
  tagline: "Vários valores numa variável só",
  accent: "violet",
  lessons: [
    {
      id: "m08-l1",
      title: "Criando e acessando",
      summary: "Índice, len, append",
      steps: [
        {
          kind: "explain",
          title: "Uma variável, vários valores",
          body: [
            "Um inventário tem vários itens. Criar `item1`, `item2`, `item3`... não escala. Para isso existe a **lista**.",
            "A lista fica entre **colchetes**, com os valores separados por vírgula. Cada valor ocupa uma posição numerada, o **índice**.",
          ],
          code: `inventario = ["espada", "escudo", "pocao"]
print(inventario)
print(inventario[0])`,
          run: true,
          boxes: [
            { name: "[0]", value: "\"espada\"" },
            { name: "[1]", value: "\"escudo\"" },
            { name: "[2]", value: "\"pocao\"" },
          ],
        },
        {
          kind: "explain",
          title: "O índice começa no zero",
          body: [
            "A primeira posição é a **0**. Numa lista de 3 itens, os índices são 0, 1 e 2. Pedir `inventario[3]` dá **IndexError**: essa posição não existe.",
            "Atalho útil: índice `-1` é o último item.",
          ],
          table: {
            head: ["Código", "Resultado"],
            rows: [
              ["inventario[0]", "\"espada\""],
              ["inventario[2]", "\"pocao\""],
              ["inventario[-1]", "\"pocao\" (o último)"],
              ["inventario[3]", "IndexError"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "O que aparece?",
          code: `squad = ["Ana", "Leo", "Kai", "Mia"]
print(squad[2])`,
          mono: true,
          options: [
            { text: "Kai", correct: true, why: "Índice 0 é Ana, 1 é Leo, 2 é Kai." },
            { text: "Leo", why: "Leo é o segundo item, mas o índice dele é 1. A contagem começa no 0." },
            { text: "IndexError", why: "A lista tem 4 itens (índices 0 a 3), então o 2 existe." },
          ],
        },
        {
          kind: "quiz",
          question: "Uma lista tem 5 itens. Qual é o índice do último?",
          options: [
            { text: "4", correct: true, why: "Começando do 0: 0, 1, 2, 3, 4. O último é sempre o tamanho menos 1." },
            { text: "5", why: "Com 5 itens, o índice 5 já não existe e dá IndexError." },
            { text: "-5", why: "-1 é o último. -5 seria o primeiro." },
          ],
        },
        {
          kind: "explain",
          title: "len, append e troca",
          body: [
            "`len(lista)` diz quantos itens a lista tem.",
            "`lista.append(valor)` acrescenta um valor no **fim**.",
            "`lista[1] = \"arco\"` troca o item da posição 1.",
          ],
          code: `inventario = ["espada", "escudo"]
print(len(inventario))
inventario.append("pocao")
inventario[1] = "arco"
print(inventario)
print(len(inventario))`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Quanto vale len(fila) no final?",
          code: `fila = ["Kira", "Leo"]
fila.append("Mia")
fila.append("Rui")`,
          mono: true,
          options: [
            { text: "4", correct: true, why: "Começou com 2 e recebeu mais 2 com append." },
            { text: "2", why: "Cada append acrescenta um item na lista." },
            { text: "3", why: "Foram dois append, e não um." },
          ],
        },
        {
          kind: "code",
          title: "Loot",
          prompt: "O inventário já tem dois itens. Pergunte o nome de **2 itens** que o jogador pegou e acrescente com `append`. Depois mostre o último item e o total.",
          starter: `inventario = ["espada", "escudo"]
`,
          example: { inputs: ["arco", "pocao"], output: "Ultimo item: pocao\nTotal: 4 itens" },
          tests: [
            { inputs: ["arco", "pocao"], expect: "Ultimo item: pocao\nTotal: 4 itens" },
            { inputs: ["mapa", "chave"], expect: "Ultimo item: chave\nTotal: 4 itens" },
          ],
          hints: ["`item = input(\"Item: \")` e `inventario.append(item)`, duas vezes.", "Último item: `inventario[-1]`. Total: `len(inventario)`."],
          solution: `inventario = ["espada", "escudo"]
item = input("Item: ")
inventario.append(item)
item = input("Item: ")
inventario.append(item)
print("Ultimo item:", inventario[-1])
print("Total:", len(inventario), "itens")`,
        },
      ],
    },
    {
      id: "m08-l2",
      title: "Percorrendo listas",
      summary: "for com listas: somar, contar, achar o maior",
      steps: [
        {
          kind: "explain",
          title: "Passar por todos os itens",
          body: [
            "O `for` também anda direto pelos itens de uma lista. A cada volta, a variável recebe o próximo item.",
          ],
          code: `playlist = ["Lo-fi beats", "Synthwave", "Trilha de RPG"]
for musica in playlist:
    print("Tocando:", musica)`,
          run: true,
        },
        {
          kind: "explain",
          title: "Quando você precisa da posição",
          body: [
            "Se além do item você precisa do número da posição, use `range(len(lista))`. Aí `i` é a posição e `lista[i]` é o item.",
          ],
          code: `ranking = ["Kira", "Leo", "Mia"]
for i in range(len(ranking)):
    print(i + 1, "-", ranking[i])`,
          run: true,
          table: {
            head: ["i", "ranking[i]", "Saída"],
            rows: [
              ["0", "Kira", "1 - Kira"],
              ["1", "Leo", "2 - Leo"],
              ["2", "Mia", "3 - Mia"],
            ],
          },
        },
        {
          kind: "order",
          prompt: "Monte o programa que soma as horas jogadas na semana.",
          lines: [`horas = [2, 1, 3, 4]`, `total = 0`, `for h in horas:`, `    total = total + h`, `print("Total:", total)`],
          explain: "É o mesmo acumulador do for com range: começa em 0 antes, soma dentro e mostra depois. A diferença é que agora os valores vêm da lista.",
        },
        {
          kind: "code",
          title: "Ranking numerado",
          prompt: "Mostre o ranking com a posição começando em 1, como no exemplo. O teste troca a lista por outra, então use um laço.",
          starter: `ranking = ["Kira", "Leo", "Mia", "Rui"]
`,
          example: { output: "1 - Kira\n2 - Leo\n3 - Mia\n4 - Rui" },
          tests: [
            { expect: "1 - Kira\n2 - Leo\n3 - Mia\n4 - Rui" },
            { expect: "1 - Ana\n2 - Bia", replace: [`["Kira", "Leo", "Mia", "Rui"]`, `["Ana", "Bia"]`] },
          ],
          hints: ["`for i in range(len(ranking)):`", "Mostre `i + 1` para começar do 1: `print(i + 1, \"-\", ranking[i])`."],
          solution: `ranking = ["Kira", "Leo", "Mia", "Rui"]
for i in range(len(ranking)):
    print(i + 1, "-", ranking[i])`,
        },
        {
          kind: "code",
          title: "Horas da semana",
          prompt: "A lista tem as horas de tela de cada dia da semana. Mostre o total e a média por dia.",
          starter: `horas = [2.5, 1.0, 3.0, 4.5, 0.5, 6.0, 2.0]
`,
          example: { output: "Total: 19.5\nMedia por dia: 2.79" },
          tests: [
            { expect: "Total: 19.5\nMedia por dia: 2.79" },
            { expect: "Total: 6.0\nMedia por dia: 2.0", replace: ["[2.5, 1.0, 3.0, 4.5, 0.5, 6.0, 2.0]", "[1.0, 2.0, 3.0]"] },
          ],
          hints: ["Acumulador: `total = 0` e `for h in horas:` somando.", "Média: `total / len(horas)`. Use `round(..., 2)` para 2 casas."],
          solution: `horas = [2.5, 1.0, 3.0, 4.5, 0.5, 6.0, 2.0]
total = 0
for h in horas:
    total = total + h
print("Total:", total)
print("Media por dia:", round(total / len(horas), 2))`,
        },
        {
          kind: "code",
          title: "Recorde",
          prompt: "Encontre a maior pontuação da lista **sem usar max()**. Comece achando que o primeiro é o maior e vá comparando.",
          starter: `pontuacoes = [870, 1240, 990, 1510, 760]
`,
          example: { output: "Recorde: 1510" },
          tests: [
            { expect: "Recorde: 1510" },
            { expect: "Recorde: 99", replace: ["[870, 1240, 990, 1510, 760]", "[99, 12, 5]"] },
            { expect: "Recorde: 7", replace: ["[870, 1240, 990, 1510, 760]", "[1, 3, 7]"] },
          ],
          hints: ["`maior = pontuacoes[0]`", "Percorra a lista: `if p > maior:` então `maior = p`."],
          solution: `pontuacoes = [870, 1240, 990, 1510, 760]
maior = pontuacoes[0]
for p in pontuacoes:
    if p > maior:
        maior = p
print("Recorde:", maior)`,
        },
        {
          kind: "explain",
          title: "Perguntando se está na lista",
          body: ["`valor in lista` responde True ou False. Funciona direto no if."],
          code: `inventario = ["espada", "chave", "pocao"]
if "chave" in inventario:
    print("A porta abriu")
else:
    print("Voce precisa de uma chave")`,
          run: true,
        },
        {
          kind: "code",
          title: "Skins caras",
          prompt: "A lista tem preços de skins. Conte quantas custam **mais de 50** e mostre o resultado.",
          starter: `precos = [19.9, 79.9, 49.9, 120.0, 55.0, 9.9]
`,
          example: { output: "Skins acima de 50: 3" },
          tests: [
            { expect: "Skins acima de 50: 3" },
            { expect: "Skins acima de 50: 0", replace: ["[19.9, 79.9, 49.9, 120.0, 55.0, 9.9]", "[10.0, 50.0]"] },
          ],
          hints: ["Contador: `caras = 0` antes do laço.", "`if preco > 50:` então `caras = caras + 1`."],
          solution: `precos = [19.9, 79.9, 49.9, 120.0, 55.0, 9.9]
caras = 0
for preco in precos:
    if preco > 50:
        caras = caras + 1
print("Skins acima de 50:", caras)`,
        },
      ],
    },
  ],
  cards: [
    { front: "Qual é o índice do primeiro item?", back: "0. O último é len(lista) - 1, ou simplesmente -1." },
    { front: "Como acrescentar um item no fim?", back: "lista.append(valor)", code: `itens.append("pocao")` },
    { front: "Duas formas de percorrer", back: "for item in lista (só o item) ou for i in range(len(lista)) (posição e item)." },
    { front: "Como saber se um valor está na lista?", back: "valor in lista, que dá True ou False." },
    { front: "IndexError significa...", back: "Você pediu uma posição que não existe na lista." },
  ],
});
