# Byte a Byte

Site para treinar **Python** e **Banco de Dados (SQL)** no navegador: lições curtas em etapas, exercícios corrigidos na hora, XP, níveis, conquistas, revisão de erros e laboratório livre.

É só HTML, CSS e JavaScript. Não precisa instalar nada nem compilar.

## Testar agora no seu computador

Abra o arquivo `index.html` com dois cliques (Chrome ou Edge). Pronto.

## Publicar na Vercel

### Jeito 1: pelo GitHub (sem instalar nada)

1. No GitHub, crie um repositório novo (pode ser público).
2. Na página do repositório, clique em **uploading an existing file** e arraste **tudo que está dentro desta pasta** (index.html, assets, content, vendor, ferramentas, LEIA-ME.md). Clique em **Commit changes**.
3. Em vercel.com, clique em **Add New > Project** e importe esse repositório.
4. Em **Framework Preset**, deixe **Other**. Não mude mais nada e clique em **Deploy**.
5. Em um minuto a Vercel mostra o link do site (algo como `byte-a-byte.vercel.app`).

Para atualizar depois, é só enviar os arquivos alterados para o mesmo repositório. A Vercel publica sozinha.

### Jeito 2: pelo terminal

Com o Node.js instalado, dentro desta pasta:

```
npx vercel
npx vercel --prod
```

Na primeira vez ele pede para fazer login (abre o navegador).

## Como funciona com os alunos

- O aluno abre o site e digita o **nome e a turma**. O progresso fica salvo **no navegador daquele computador**.
- No topo da Trilha ele escolhe a disciplina: **Python** ou **Banco de Dados**. Todas as lições ficam abertas, ele pode começar por qualquer uma.
- Em computador compartilhado, cada aluno usa o próprio nome e aparece a lista para escolher.
- No fim da aula, o aluno clica em **Baixar relatório** (na Trilha ou em Perfil e entrega) e te envia o arquivo `.html` (WhatsApp, Classroom, e-mail, pen drive).
- O relatório abre em qualquer navegador e mostra XP, lições, cada resposta (inclusive as erradas) e os códigos escritos.
- O mesmo arquivo serve para o aluno continuar em outro computador: na tela inicial, **Continuar de um arquivo de progresso**.

## Foco da aula (1 a 3 módulos)

Na Área do professor, em **Foco da aula**:

1. Escolha a disciplina e marque de 1 a 3 módulos.
2. Digite a turma (opcional, já vem preenchida para o aluno).
3. Deixe marcado **Mostrar só esses módulos** se quiser esconder o resto da trilha. Desmarcado, o resto fica num item recolhido "Outros módulos".
4. Clique em **Copiar link** e passe para a turma (quadro, grupo, Classroom).

O link fica assim: `https://seusite.vercel.app/?foco=b03,b04&turma=2A&so=1`. Vale **só no dia**: no dia seguinte a trilha volta ao normal sozinha. O link só funciona com o site publicado (abrindo o `index.html` direto do computador ele não serve para os alunos).

## Banco de Dados

- 12 módulos seguindo a ementa: SBD e SGBD, escolha de SGBD, SELECT, chaves primária e estrangeira, criação de tabelas, restrições de integridade, INSERT/UPDATE/DELETE, ALTER TABLE, agrupamentos e estatística (média, mediana, amplitude, histograma com gráfico, amostragem), visões, usuários e permissões, transações e backup.
- O SQL roda de verdade no navegador (SQLite, pelo sql.js). Todos os exemplos usam o banco **Arena Online**: guildas, jogadores, partidas e itens.
- A correção compara o resultado do aluno com o da solução. Ela também roda as consultas com dados extras, então resposta "escrita na mão" (ex.: `WHERE id = 3`) não passa.
- Usuários/GRANT e mysqldump não existem no SQLite: esses temas usam a sintaxe do MySQL em perguntas, lacunas e montagens.
- No **Laboratório**, aba **SQL**: o aluno consulta e altera o banco à vontade, vê as tabelas, gera gráfico de barras, **baixa um backup** `.sql`, **reseta** e **restaura** o backup.

## Exercícios de código: sem colar

- No editor dos exercícios, **colar está desativado** (Ctrl+V, botão direito e arrastar). Copiar continua funcionando. O laboratório e os exemplos das explicações aceitam colar normalmente.
- Quando o aluno trava, ele tem duas ajudas, e cada uma tira XP do exercício:
  - **Dica** (−2 XP): as dicas aparecem uma de cada vez.
  - **Revelar uma linha** (−3 XP): mostra uma linha da solução para ele ler e digitar. O limite é metade das linhas que faltam, então ele nunca recebe o exercício inteiro.
- A solução completa só aparece depois que o aluno passa nos testes, para comparar.
- As ajudas usadas e as tentativas de colar ficam guardadas mesmo se ele recarregar a página, e aparecem no relatório e na tabela do professor.

## Área do professor

Entre em `seusite/#/professor` (tem link na tela inicial). Selecione ou arraste vários relatórios de uma vez: aparece uma tabela com turma, lições de Python e de Banco de Dados, ajudas usadas e tentativas de colar, com filtro por turma, o botão **Ver respostas** de cada aluno e **Baixar planilha (CSV)** para abrir no Excel ou Google Planilhas. Os arquivos são lidos só no seu navegador.

## Mudar o conteúdo

- Lições de Python: `content/m01.js` até `content/m10.js`. Banco de Dados: `content/bd01.js` até `content/bd12.js` (os dados do banco Arena ficam em `content/bd00-dados.js`). Cada lição é uma lista de etapas:
  - `explain`: explicação, com código opcional que o aluno pode rodar (`run: true`)
  - `quiz`: pergunta com opções; cada opção tem o `why` que aparece quando o aluno escolhe
  - `fill`: completar lacunas `__1__`, `__2__` com opções do `bank`
  - `order`: montar o código na ordem (`extra` são linhas pegadinha)
  - `code`: em Python, exercício com `tests` (entradas do input e saída esperada) e `solution`. Em SQL, só a `solution`: a correção compara os resultados (use `check` para conferir o banco depois de INSERT/UPDATE/CREATE, e `probes` para testar restrições)
- Depois de mexer no conteúdo, rode `node ferramentas/verificar-conteudo.js`: ele confere todas as respostas e roda todas as soluções.
- Nome do site: no começo de `assets/app.js` (`SITE`) e no `<title>` do `index.html`.
- Cores: `assets/style.css`.

O Python do navegador é o Skulpt (licença MIT, em `vendor/SKULPT-LICENSE.txt`). O SQL é o sql.js (licença MIT).
