/* Banco de Dados · Módulo 12 */
CONTENT.push({
  id: "b12",
  course: "bd",
  title: "Segurança, transações e backup",
  tagline: "BEGIN, COMMIT, ROLLBACK, cópias de segurança e um plano de proteção",
  accent: "blue",
  lessons: [
    {
      id: "b12-l1",
      title: "Transações",
      summary: "Tudo ou nada: BEGIN, COMMIT e ROLLBACK",
      steps: [
        {
          kind: "explain",
          title: "Tudo ou nada",
          body: [
            "Comprar um item na loja do jogo são dois passos: descontar as moedas e entregar o item. Se o servidor cair no meio, nada pode ficar pela metade.",
            "Uma **transação** junta comandos num pacote que acontece inteiro ou não acontece. `BEGIN` abre, `COMMIT` confirma e `ROLLBACK` desfaz tudo desde o BEGIN.",
          ],
          code: `BEGIN;
DELETE FROM partidas;
SELECT COUNT(*) AS durante FROM partidas;
ROLLBACK;
SELECT COUNT(*) AS depois FROM partidas;`,
          run: true,
        },
        {
          kind: "quiz",
          question: "Depois de um ROLLBACK, o que acontece com os comandos feitos desde o BEGIN?",
          options: [
            { text: "São desfeitos", correct: true, why: "ROLLBACK volta o banco ao estado de antes do BEGIN." },
            { text: "São confirmados", why: "Quem confirma é o COMMIT." },
            { text: "Ficam pela metade", why: "Uma transação nunca fica pela metade: ou tudo ou nada." },
          ],
        },
        {
          kind: "code",
          title: "Transferência de pontos",
          prompt: "A Kira vai transferir **200 pontos** para o Leo. Faça os dois UPDATE dentro de uma transação e confirme no fim.",
          starter: "-- escreva a transação abaixo\n",
          check: `SELECT nick, pontos FROM jogadores WHERE nick IN ('Kira', 'Leo') ORDER BY nick;`,
          require: [
            { re: "\\bBEGIN\\b", msg: "Abra a transação com BEGIN antes dos UPDATE." },
            { re: "\\bCOMMIT\\b", msg: "Confirme a transação com COMMIT no fim." },
          ],
          hints: [
            "Estrutura: `BEGIN;`, os dois UPDATE, e `COMMIT;`.",
            "Kira: `SET pontos = pontos - 200`. Leo: `SET pontos = pontos + 200`. Cada um com seu WHERE.",
          ],
          solution: `BEGIN;
UPDATE jogadores SET pontos = pontos - 200 WHERE nick = 'Kira';
UPDATE jogadores SET pontos = pontos + 200 WHERE nick = 'Leo';
COMMIT;`,
        },
        {
          kind: "explain",
          title: "ACID",
          body: ["As quatro garantias de uma transação têm um apelido: ACID."],
          table: {
            head: ["Letra", "Propriedade", "Significa"],
            rows: [
              ["A", "Atomicidade", "Tudo ou nada"],
              ["C", "Consistência", "As regras do banco continuam valendo"],
              ["I", "Isolamento", "Uma transação não atrapalha a outra"],
              ["D", "Durabilidade", "O que foi confirmado não se perde, nem se a energia cair"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "A energia caiu no meio de uma compra e o item não foi entregue sem descontar as moedas. Qual propriedade garantiu isso?",
          options: [
            { text: "Atomicidade", correct: true, why: "Atomicidade: os passos da transação acontecem todos juntos ou nenhum." },
            { text: "Isolamento", why: "Isolamento trata de transações rodando ao mesmo tempo." },
            { text: "Durabilidade", why: "Durabilidade garante que o que foi confirmado com COMMIT não se perde." },
          ],
        },
      ],
    },
    {
      id: "b12-l2",
      title: "Backup e plano de segurança",
      summary: "Cópias de segurança, restauração e boas práticas",
      steps: [
        {
          kind: "explain",
          title: "Backup",
          body: [
            "**Backup** é uma cópia de segurança do banco. **Restaurar** é usar essa cópia para recuperar os dados.",
            "Dados se perdem por defeito no disco, erro humano (um DELETE sem WHERE), vírus que sequestra arquivos ou desastre no local.",
            "Regra **3-2-1**: 3 cópias dos dados, em 2 tipos de mídia diferentes, com 1 delas fora do local, como na nuvem. E teste a restauração de vez em quando: backup que não restaura não serve.",
          ],
        },
        {
          kind: "explain",
          title: "Fazendo e restaurando",
          body: [
            "Cada SGBD tem sua ferramenta. Os comandos abaixo rodam no terminal do servidor, não dentro do SQL.",
            "No **Laboratório SQL** deste site tem os botões **Baixar backup** e **Restaurar backup**. Faça um teste: mude algo, baixe, resete o banco e restaure.",
          ],
          code: `-- MySQL: fazer backup e restaurar
mysqldump -u root -p arena > backup_arena.sql
mysql -u root -p arena < backup_arena.sql

-- PostgreSQL
pg_dump arena > backup_arena.sql
psql arena < backup_arena.sql`,
        },
        {
          kind: "quiz",
          question: "Qual comando faz o backup de um banco MySQL?",
          mono: true,
          options: [
            { text: "mysqldump -u root -p arena > backup.sql", correct: true, why: "O mysqldump gera um arquivo .sql com a estrutura e os dados." },
            { text: "mysql -u root -p arena < backup.sql", why: "Esse comando faz o contrário: restaura um backup." },
            { text: "DROP DATABASE arena;", why: "Esse apaga o banco inteiro." },
          ],
        },
        {
          kind: "quiz",
          question: "O que diz a regra 3-2-1 de backup?",
          options: [
            { text: "3 cópias, em 2 tipos de mídia, com 1 fora do local", correct: true, why: "Assim um único problema (um disco que queima, um incêndio) não leva todas as cópias." },
            { text: "Fazer backup a cada 3 dias, guardar por 2 semanas, testar 1 vez", why: "A frequência importa, mas a regra 3-2-1 fala de cópias e lugares." },
            { text: "3 usuários com acesso, 2 senhas e 1 administrador", why: "Isso é sobre permissões, não backup." },
          ],
        },
        {
          kind: "explain",
          title: "Um plano de segurança e integridade",
          body: ["Juntando tudo o que você viu, um banco bem cuidado tem:"],
          table: {
            head: ["Medida", "Protege contra"],
            rows: [
              ["Restrições (PK, FK, NOT NULL, CHECK)", "Dados errados ou incoerentes"],
              ["Usuários separados e permissões mínimas", "Acesso indevido e estragos por engano"],
              ["Senhas fortes, nada de todo mundo usar o root", "Invasão"],
              ["Views para mostrar só o necessário", "Exposição de dados"],
              ["Transações nas operações importantes", "Operações pela metade"],
              ["Backup automático 3-2-1, com teste de restauração", "Perda de dados"],
              ["Registro (log) de quem fez o quê", "Problemas sem explicação"],
            ],
          },
        },
        {
          kind: "quiz",
          question: "Um estagiário rodou DELETE FROM jogadores; sem WHERE, direto no banco do jogo. O que teria evitado ou resolvido o problema?",
          options: [
            { text: "Permissões mínimas para o estagiário e um backup recente e testado", correct: true, why: "Sem permissão de DELETE, o comando nem rodaria. E com backup testado, dá para restaurar." },
            { text: "Usar letras maiúsculas no SQL", why: "Maiúsculas são só costume de escrita. Não protegem nada." },
            { text: "Criar mais tabelas", why: "Mais tabelas não impedem um DELETE sem WHERE." },
          ],
        },
      ],
    },
  ],
  cards: [
    { front: "BEGIN, COMMIT, ROLLBACK", back: "BEGIN abre a transação, COMMIT confirma, ROLLBACK desfaz tudo desde o BEGIN." },
    { front: "ACID", back: "Atomicidade, Consistência, Isolamento e Durabilidade." },
    { front: "Regra 3-2-1", back: "3 cópias, em 2 tipos de mídia, com 1 fora do local." },
    { front: "mysqldump", back: "Ferramenta do MySQL que gera o backup em .sql.", code: `mysqldump -u root -p arena > backup.sql` },
    { front: "Backup sem teste", back: "Não é confiável. Teste a restauração de tempos em tempos." },
  ],
});
