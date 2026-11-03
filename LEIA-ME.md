# Byte a Byte

Site para treinar Python no navegador: lições em etapas, exercícios corrigidos na hora, XP, níveis, conquistas, revisão de erros e laboratório livre.

É só HTML, CSS e JavaScript. Não precisa instalar nada nem compilar.

## Testar agora no seu computador

Abra o arquivo `index.html` com dois cliques (Chrome ou Edge). Pronto.

## Publicar na Vercel

### Jeito 1: pelo GitHub (sem instalar nada)

1. No GitHub, crie um repositório novo (pode ser público).
2. Na página do repositório, clique em **uploading an existing file** e arraste **tudo que está dentro desta pasta** (index.html, assets, content, vendor, LEIA-ME.md). Clique em **Commit changes**.
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

- O aluno abre o site e digita o nome. O progresso fica salvo **no navegador daquele computador**.
- Em computador compartilhado, cada aluno usa o próprio nome e aparece a lista para escolher.
- No fim da aula, o aluno clica em **Baixar relatório** (na Trilha ou em Perfil e entrega) e te envia o arquivo `.html` (WhatsApp, Classroom, e-mail, pen drive).
- O relatório abre em qualquer navegador e mostra XP, lições, cada resposta (inclusive as erradas) e os códigos escritos.
- O mesmo arquivo serve para o aluno continuar em outro computador: na tela inicial, **Continuar de um arquivo de progresso**.

## Exercícios de código: sem colar

- No editor dos exercícios, **colar está desativado** (Ctrl+V, botão direito e arrastar). Copiar continua funcionando. O laboratório e os exemplos das explicações aceitam colar normalmente.
- Quando o aluno trava, ele tem duas ajudas, e cada uma tira XP do exercício:
  - **Dica** (−2 XP): as dicas aparecem uma de cada vez.
  - **Revelar uma linha** (−3 XP): mostra uma linha da solução para ele ler e digitar. O limite é metade das linhas que faltam, então ele nunca recebe o exercício inteiro.
- A solução completa só aparece depois que o aluno passa nos testes, para comparar.
- As ajudas usadas e as tentativas de colar ficam guardadas mesmo se ele recarregar a página, e aparecem no relatório e na tabela do professor.

## Área do professor

Entre em `seusite/#/professor` (tem link na tela inicial). Selecione ou arraste vários relatórios de uma vez: aparece uma tabela da turma (com ajudas usadas e tentativas de colar), o botão **Ver respostas** de cada aluno e **Baixar planilha (CSV)** para abrir no Excel ou Google Planilhas. Os arquivos são lidos só no seu navegador.

## Mudar o conteúdo

- Lições: `content/m01.js` até `content/m10.js`. Cada lição é uma lista de etapas:
  - `explain`: explicação, com código opcional que o aluno pode rodar (`run: true`)
  - `quiz`: pergunta com opções; cada opção tem o `why` que aparece quando o aluno escolhe
  - `fill`: completar lacunas `__1__`, `__2__` com opções do `bank`
  - `order`: montar o código na ordem (`extra` são linhas pegadinha)
  - `code`: exercício com `tests` (entradas do input e saída esperada) e `solution`
- Nome do site: no começo de `assets/app.js` (`SITE`) e no `<title>` do `index.html`.
- Cores: `assets/style.css`.

O Python do navegador é o Skulpt (licença MIT, em `vendor/SKULPT-LICENSE.txt`).
