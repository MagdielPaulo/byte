/* Módulo 10. Edite à vontade: textos, exemplos e exercícios. */

const PERSONAGENS = `heroi = "Kira"
vida_heroi = 100
monstro = "Golem"
vida_monstro = 80
`;

const S1 = `${PERSONAGENS}
def mostrar_status(nome, vida):
    print(nome, "| HP", vida)

mostrar_status(heroi, vida_heroi)
mostrar_status(monstro, vida_monstro)`;

const S2 = `${S1}

def calcular_dano(ataque, defesa):
    dano = ataque - defesa
    if dano < 0:
        return 0
    return dano

print(calcular_dano(30, 10))`;

const S3 = `${S2}

def aplicar_critico(dano, critico):
    if critico == "s":
        return dano * 2
    else:
        return dano

print(aplicar_critico(20, "s"))`;

const S4 = `${S3}

def barra_vida(vida):
    if vida < 0:
        vida = 0
    return "#" * (vida // 10)

print(barra_vida(vida_heroi))`;

const S5 = `${S4}

# ===== BATALHA =====
defesa_monstro = 5
ataque_monstro = 12
turno = 1

while vida_heroi > 0 and vida_monstro > 0:
    print("--- Turno", turno, "---")
    ataque = int(input("Forca do ataque: "))
    critico = input("Critico? (s/n): ")
    dano = calcular_dano(ataque, defesa_monstro)
    dano = aplicar_critico(dano, critico)
    vida_monstro = vida_monstro - dano
    print(monstro, "perdeu", dano, "de HP")
    if vida_monstro > 0:
        vida_heroi = vida_heroi - ataque_monstro
    turno = turno + 1

if vida_monstro <= 0:
    print("VITORIA!")
else:
    print("DERROTA...")`;

CONTENT.push({
  id: "m10",
  title: "Projeto: Arena",
  tagline: "Um sistema de combate por turnos, peça por peça",
  accent: "amber",
  lessons: [
    {
      id: "m10-l1",
      title: "Arena: as peças",
      summary: "Status, dano, crítico e barra de vida",
      steps: [
        {
          kind: "explain",
          title: "O que você vai construir",
          body: [
            "Um sistema de combate por turnos, do tipo que existe em quase todo RPG: um herói, um monstro, ataques, dano crítico e barra de vida.",
            "Cada exercício desta lição adiciona uma peça. **O seu código passa de uma etapa para a outra**: o que você escreveu continua lá e você só acrescenta a parte nova.",
            "Na próxima lição, as peças se juntam numa batalha jogável.",
          ],
          code: `Kira | HP 100
Golem | HP 80
--- Turno 1 ---
Forca do ataque: 25
Critico? (s/n): s
Golem perdeu 40 de HP
...
VITORIA!`,
        },
        {
          kind: "code",
          title: "Etapa 1: status dos personagens",
          prompt: "Complete `mostrar_status(nome, vida)`: ela mostra o nome e a vida no formato do exemplo. Use os **parâmetros**, porque o teste chama com outros personagens.",
          fn: "mostrar_status",
          starter: `${PERSONAGENS}
def mostrar_status(nome, vida):
    # mostre: Kira | HP 100


mostrar_status(heroi, vida_heroi)
mostrar_status(monstro, vida_monstro)
`,
          example: { output: "Kira | HP 100\nGolem | HP 80" },
          tests: [{ call: `mostrar_status("Leo", 55)\nmostrar_status("Slime", 7)`, expect: "Leo | HP 55\nSlime | HP 7" }],
          hints: ["`print(nome, \"| HP\", vida)`"],
          solution: S1,
        },
        {
          kind: "code",
          carry: true,
          title: "Etapa 2: cálculo de dano",
          prompt: "Seu código da etapa 1 já está aqui. Complete `calcular_dano(ataque, defesa)`: o dano é ataque menos defesa, **mas nunca negativo**. Se der menos que zero, devolva 0.",
          fn: "calcular_dano",
          append: `
def calcular_dano(ataque, defesa):
    dano = ataque - defesa
    # se o dano for negativo, devolva 0
    # senao, devolva o dano


print(calcular_dano(30, 10))
`,
          example: { output: "calcular_dano(30, 10)  ->  20\ncalcular_dano(5, 10)   ->  0", calls: true },
          tests: [{ call: "print(calcular_dano(30, 10))\nprint(calcular_dano(5, 10))\nprint(calcular_dano(10, 10))\nprint(calcular_dano(12, 0))", expect: "20\n0\n0\n12" }],
          hints: ["`if dano < 0:` com `return 0` dentro.", "Depois do if, sem o recuo dele: `return dano`."],
          solution: S2,
        },
        {
          kind: "code",
          carry: true,
          title: "Etapa 3: golpe crítico",
          prompt: "Crie `aplicar_critico(dano, critico)`. Se `critico` for `\"s\"`, devolva o dano em dobro. Senão, devolva o dano normal.",
          fn: "aplicar_critico",
          append: `
def aplicar_critico(dano, critico):


print(aplicar_critico(20, "s"))
`,
          example: { output: "aplicar_critico(20, \"s\")  ->  40\naplicar_critico(20, \"n\")  ->  20", calls: true },
          tests: [{ call: `print(aplicar_critico(20, "s"))\nprint(aplicar_critico(20, "n"))\nprint(aplicar_critico(0, "s"))`, expect: "40\n20\n0" }],
          hints: ["`if critico == \"s\":` com `return dano * 2`.", "`else:` com `return dano`."],
          solution: S3,
        },
        {
          kind: "code",
          carry: true,
          title: "Etapa 4: barra de vida",
          prompt: "Em Python, texto vezes número repete o texto: `\"#\" * 3` dá `###`. Crie `barra_vida(vida)` que devolve um `#` para cada 10 de vida (use divisão inteira). Vida negativa conta como 0.",
          fn: "barra_vida",
          append: `
def barra_vida(vida):


print(barra_vida(vida_heroi))
`,
          example: { output: "barra_vida(100)  ->  ##########\nbarra_vida(35)   ->  ###", calls: true },
          tests: [{ call: `print(barra_vida(100))\nprint(barra_vida(35))\nprint("[" + barra_vida(0) + "]")\nprint("[" + barra_vida(-20) + "]")\nprint(barra_vida(9) == "")`, expect: "##########\n###\n[]\n[]\nTrue" }],
          hints: ["Quantos #: `vida // 10`.", "Para vida negativa: `if vida < 0:` então `vida = 0`, antes do return.", "`return \"#\" * (vida // 10)`"],
          solution: S4,
        },
      ],
    },
    {
      id: "m10-l2",
      title: "Arena: a batalha",
      summary: "Juntar tudo num laço de turnos",
      steps: [
        {
          kind: "explain",
          title: "O laço da batalha",
          body: [
            "Agora as funções viram um jogo. A batalha é um `while`: continua **enquanto os dois estiverem vivos**.",
            "Em cada turno o herói ataca. Se o monstro sobreviver, ele contra-ataca. Quando o laço termina, um if decide se foi vitória ou derrota.",
          ],
          table: {
            head: ["Peça", "Onde entra"],
            rows: [
              ["while vida_heroi > 0 and vida_monstro > 0", "mantém a batalha rodando"],
              ["calcular_dano e aplicar_critico", "calculam o golpe do herói"],
              ["vida_monstro = vida_monstro - dano", "aplica o golpe"],
              ["if vida_monstro > 0", "o monstro só contra-ataca se estiver vivo"],
            ],
          },
        },
        {
          kind: "code",
          carry: true,
          title: "Etapa final: a batalha",
          prompt: "Complete o turno dentro do `while`, seguindo os comentários. No fim do turno, mostre `Golem perdeu X de HP` (use a variável `monstro`). O teste joga batalhas inteiras e confere o final.",
          append: `
# ===== BATALHA =====
defesa_monstro = 5
ataque_monstro = 12
turno = 1

while vida_heroi > 0 and vida_monstro > 0:
    print("--- Turno", turno, "---")
    ataque = int(input("Forca do ataque: "))
    critico = input("Critico? (s/n): ")
    # 1) dano = calcular_dano(ataque, defesa_monstro)
    # 2) dano = aplicar_critico(dano, critico)
    # 3) tire o dano da vida_monstro e mostre: Golem perdeu X de HP
    # 4) se o monstro ainda tiver vida, ele ataca o heroi (ataque_monstro)

    turno = turno + 1

if vida_monstro <= 0:
    print("VITORIA!")
else:
    print("DERROTA...")
`,
          example: { inputs: ["25", "n", "30", "s", "20", "n"], output: "...\nGolem perdeu 15 de HP\nVITORIA!" },
          tests: [
            { inputs: ["25", "n", "30", "s", "20", "n"], expect: "Golem perdeu 15 de HP\nVITORIA!", last: true },
            { inputs: ["6", "n", "6", "n", "6", "n", "6", "n", "6", "n", "6", "n", "6", "n", "6", "n", "6", "n"], expect: "Golem perdeu 1 de HP\nDERROTA...", last: true },
            { inputs: ["50", "s"], expect: "Golem perdeu 90 de HP\nVITORIA!", last: true },
          ],
          hints: [
            "Passos 1 e 2 são duas linhas que chamam suas funções e guardam em `dano`.",
            "Passo 3: `vida_monstro = vida_monstro - dano` e `print(monstro, \"perdeu\", dano, \"de HP\")`.",
            "Passo 4: `if vida_monstro > 0:` e dentro `vida_heroi = vida_heroi - ataque_monstro`.",
          ],
          solution: S5,
          after: "Você tem um jogo funcionando. Ideias para ir além no Laboratório: mostrar a barra_vida a cada turno, adicionar poção de cura ou sortear o crítico com `import random` e `random.randint(1, 10)`.",
        },
        {
          kind: "explain",
          title: "Você construiu um sistema de verdade",
          body: [
            "Repare em tudo que você usou: variáveis, input com int, if/else, while com and, funções com parâmetros e return, e até texto multiplicado.",
            "Programas grandes são isso: peças pequenas, cada uma fazendo uma coisa bem feita, combinadas.",
            "Quer continuar? Abra o **Laboratório**, cole o seu código da Arena e melhore: mais monstros numa lista, poções, níveis.",
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "Texto vezes número", back: "Repete o texto. \"#\" * 3 dá \"###\"." },
    { front: "Laço de jogo", back: "Um while que roda enquanto a partida não acabou, com uma decisão depois que ele termina.", code: `while vida_a > 0 and vida_b > 0:
    # turno
    ...` },
  ],
});
