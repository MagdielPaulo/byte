/* Banco de Dados · Módulo 7 */
CONTENT.push({
  id: "b07",
  course: "bd",
  title: "Manipulando dados",
  tagline: "INSERT, UPDATE e DELETE",
  accent: "cyan",
  lessons: [
    {
      id: "b07-l1",
      title: "INSERT: cadastrar",
      summary: "Colocar novas linhas nas tabelas",
      steps: [
        {
          kind: "explain",
          title: "INSERT INTO",
          body: [
            "Diga a tabela, a lista de colunas e, depois de `VALUES`, os valores **na mesma ordem**.",
            "O `id` não precisa ser informado: como é `INTEGER PRIMARY KEY`, o banco gera o próximo número.",
          ],
          code: `INSERT INTO guildas (nome, regiao)
VALUES ('Byte Force', 'Centro-Oeste');

SELECT * FROM guildas;`,
          run: true,
        },
        {
          kind: "explain",
          title: "Vários de uma vez",
          body: ["Separe cada linha nova por vírgula."],
          code: `INSERT INTO itens (nome, tipo, raridade, preco) VALUES
  ('Arco Curto', 'Arma', 'Comum', 90),
  ('Capa Sombria', 'Armadura', 'Raro', 410);

SELECT nome, preco FROM itens;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "O que está errado neste INSERT?",
          code: `INSERT INTO guildas (nome, regiao)
VALUES ('Alpha');`,
          options: [
            { text: "São 2 colunas e só 1 valor: faltou a região", correct: true, why: "A lista de valores precisa ter a mesma quantidade e a mesma ordem da lista de colunas." },
            { text: "Faltou informar o id", why: "O id é gerado sozinho pelo INTEGER PRIMARY KEY." },
            { text: "Texto deveria ficar sem aspas", why: "Texto em SQL fica entre aspas simples, como está." },
          ],
        },
        {
          kind: "code",
          title: "Novo jogador",
          prompt: "Cadastre o jogador **Vex**, classe **Arqueiro**, nível **25**, na guilda **3**. Os pontos ficam com o valor padrão.",
          starter: "-- escreva o INSERT abaixo\n",
          check: `SELECT nick, classe, nivel, pontos, guilda_id FROM jogadores WHERE nick = 'Vex';`,
          hints: ["Colunas: `(nick, classe, nivel, guilda_id)`. Não precisa citar pontos nem id.", "`VALUES ('Vex', 'Arqueiro', 25, 3);`"],
          solution: `INSERT INTO jogadores (nick, classe, nivel, guilda_id)
VALUES ('Vex', 'Arqueiro', 25, 3);`,
        },
        {
          kind: "code",
          title: "Reabastecer a loja",
          prompt: "Cadastre dois itens novos: **Pocao de Escudo** (Consumivel, Comum, 40) e **Martelo de Guerra** (Arma, Raro, 520).",
          starter: "-- escreva o INSERT abaixo\n",
          check: `SELECT nome, tipo, raridade, preco FROM itens ORDER BY nome;`,
          hints: ["Colunas: `(nome, tipo, raridade, preco)`.", "Dá para fazer um INSERT com duas linhas em VALUES, separadas por vírgula, ou dois INSERT."],
          solution: `INSERT INTO itens (nome, tipo, raridade, preco) VALUES
  ('Pocao de Escudo', 'Consumivel', 'Comum', 40),
  ('Martelo de Guerra', 'Arma', 'Raro', 520);`,
        },
      ],
    },
    {
      id: "b07-l2",
      title: "UPDATE e DELETE",
      summary: "Alterar e apagar com segurança",
      steps: [
        {
          kind: "explain",
          title: "UPDATE: alterar",
          body: ["`SET` diz o que muda. `WHERE` diz em quais linhas."],
          code: `UPDATE jogadores
SET nivel = 43, pontos = 1900
WHERE nick = 'Kira';

SELECT nick, nivel, pontos FROM jogadores WHERE nick = 'Kira';`,
          run: true,
        },
        {
          kind: "explain",
          title: "O perigo de esquecer o WHERE",
          body: [
            "Sem `WHERE`, o UPDATE altera **todas** as linhas. Rode e veja: todos os itens ficaram de graça.",
            "Aqui o banco volta ao original a cada execução. Num sistema real, não volta. O mesmo vale para o DELETE.",
          ],
          code: `UPDATE itens
SET preco = 0;

SELECT nome, preco FROM itens;`,
          run: true,
          warn: "Antes de rodar um UPDATE ou DELETE, rode um SELECT com o mesmo WHERE para ver quais linhas serão atingidas.",
        },
        {
          kind: "code",
          title: "Promoção lendária",
          prompt: "A loja vai dar **10% de desconto** nos itens de raridade **Lendario**. Atualize o preço deles (preço vezes 0.9).",
          starter: "-- escreva o UPDATE abaixo\n",
          check: `SELECT nome, preco FROM itens ORDER BY id;`,
          hints: ["`SET preco = preco * 0.9` usa o preço atual para calcular o novo.", "Não esqueça: `WHERE raridade = 'Lendario'`."],
          solution: `UPDATE itens
SET preco = preco * 0.9
WHERE raridade = 'Lendario';`,
        },
        {
          kind: "explain",
          title: "DELETE: apagar linhas",
          body: ["`DELETE FROM` apaga as linhas que passam no `WHERE`. A tabela continua existindo."],
          code: `DELETE FROM partidas
WHERE duracao_min < 15;

SELECT id, duracao_min FROM partidas;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Você roda DELETE FROM jogadores WHERE id = 1; mas a Kira (id 1) tem partidas registradas. O que acontece?",
          options: [
            { text: "Erro de FOREIGN KEY: as partidas ainda apontam para ela", correct: true, why: "A chave estrangeira protege a integridade: não deixa sobrar partida de um jogador que não existe." },
            { text: "A Kira é apagada e as partidas ficam sem dono", why: "Isso quebraria a integridade. Com a chave estrangeira ativa, o banco recusa." },
            { text: "A tabela jogadores inteira é apagada", why: "Só DROP TABLE apaga a tabela. E o WHERE limita ao id 1." },
          ],
        },
        {
          kind: "code",
          title: "Limpeza do histórico",
          prompt: "Apague as partidas do modo **Casual** que terminaram em **derrota** ('D').",
          starter: "-- escreva o DELETE abaixo\n",
          check: `SELECT id FROM partidas ORDER BY id;`,
          hints: ["`DELETE FROM partidas` e um WHERE com duas condições.", "`WHERE modo = 'Casual' AND resultado = 'D'`"],
          solution: `DELETE FROM partidas
WHERE modo = 'Casual' AND resultado = 'D';`,
        },
        {
          kind: "code",
          bug: true,
          title: "O update perigoso",
          prompt: "Era para mover **só o Kai** para a guilda 4, mas este comando moveu todo mundo. Conserte.",
          starter: `UPDATE jogadores
SET guilda_id = 4;
`,
          check: `SELECT nick, guilda_id FROM jogadores ORDER BY id;`,
          hints: ["Falta dizer em qual linha mexer.", "Acrescente `WHERE nick = 'Kai'` antes do ponto e vírgula."],
          solution: `UPDATE jogadores
SET guilda_id = 4
WHERE nick = 'Kai';`,
        },
      ],
    },
  ],
  cards: [
    { front: "INSERT", back: "Cadastra linhas novas.", code: `INSERT INTO guildas (nome, regiao)
VALUES ('Alpha', 'Sul');` },
    { front: "UPDATE", back: "Altera linhas existentes: SET diz o que muda, WHERE diz onde." },
    { front: "DELETE", back: "Apaga as linhas que passam no WHERE. A tabela continua existindo." },
    { front: "UPDATE ou DELETE sem WHERE", back: "Atinge todas as linhas da tabela. Teste antes com um SELECT usando o mesmo WHERE." },
  ],
});
