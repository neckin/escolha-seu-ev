# Escolha seu EV

Comparador de carros elétricos e híbridos plug-in vendidos oficialmente no Brasil.
Este projeto começou como um artifact React dentro do Claude e foi convertido para
um projeto Vite/React comum, pronto para rodar localmente e ser publicado.

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org) instalado (versão 18+).

```bash
npm install
npm run dev
```

Isso abre o site em `http://localhost:5173`.

## Estado atual dos dados

Os dados (carros, tema, "meu carro atual") ficam salvos no **localStorage do
navegador** (veja `src/storageShim.js`) — ou seja, só funcionam no seu próprio
navegador/dispositivo. Duas pessoas abrindo o site em computadores diferentes
NÃO veem os mesmos dados.

## Próximo passo: banco de dados de verdade

Para publicar isso como site "vivo" (todo mundo vendo os mesmos carros, dados
persistentes, login real em vez do PIN), a próxima etapa é trocar
`src/storageShim.js` por um banco de dados real. Sugestão: **Supabase**
(gratuito, Postgres, com autenticação pronta).

Peça para o Claude Code fazer essa migração com um prompt como:

> "Configure um projeto Supabase para este app. Crie uma tabela `cars` com os
> mesmos campos usados no objeto `car` em src/App.jsx, e substitua as chamadas
> de `window.storage` por chamadas ao cliente `@supabase/supabase-js`. Troque
> também o sistema de PIN por autenticação de e-mail/senha do Supabase Auth."

## Publicando (deploy)

Depois de testar localmente:

1. Crie um repositório no GitHub e suba este projeto (`git init`, `git add .`,
   `git commit`, depois conecte a um repo remoto).
2. Crie uma conta na [Vercel](https://vercel.com), conecte ao GitHub e
   importe este repositório — ela detecta que é um projeto Vite automaticamente.
3. A Vercel te dá uma URL pública (ex.: `escolha-seu-ev.vercel.app`).

## Triagem semanal automática (robô de lançamentos)

Toda segunda-feira, um GitHub Action varre 6 canais do YouTube atrás de vídeos
que pareçam ser sobre lançamento de carro elétrico ou híbrido plug-in no
Brasil, e abre um **Pull Request** com um relatório — ele **não atualiza o
site sozinho**, só sinaliza candidatos pra você revisar e, se for o caso,
atualizar os dados manualmente (ou pedir pro Claude Code atualizar).

### Como ativar

1. Suba este projeto pro GitHub (`git init`, `git add .`, `git commit`, push
   pra um repositório novo).
2. Crie uma chave gratuita da **YouTube Data API v3**:
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um projeto → Ative a "YouTube Data API v3" → Crie uma credencial
     do tipo "Chave de API"
3. No repositório do GitHub, vá em **Settings → Secrets and variables →
   Actions** e adicione:
   - `YOUTUBE_API_KEY` (obrigatória)
   - `ANTHROPIC_API_KEY` (opcional, mas recomendado — usa a IA da Claude pra
     filtrar com mais precisão quais vídeos são de fato lançamentos, reduzindo
     falso positivo dos filtros de palavra-chave)
4. Pronto — a partir da próxima segunda-feira (ou rodando manualmente em
   **Actions → Triagem semanal → Run workflow**), você vai ver um Pull
   Request toda semana com os vídeos candidatos, se houver.

Os canais monitorados estão em `scripts/channels.json` — edite esse arquivo
pra adicionar ou remover canais.

## Estrutura do projeto

```
src/
  App.jsx                    <- toda a lógica e interface do app
  main.jsx                   <- ponto de entrada, instala o storageShim e renderiza o App
  storageShim.js              <- substitui window.storage por localStorage (temporário)
scripts/
  channels.json               <- lista de canais do YouTube monitorados
  scan-channels.mjs           <- robô de triagem semanal
  pending-reviews/            <- relatórios gerados (um .md por semana)
.github/workflows/
  weekly-scan.yml              <- agendamento do robô (toda segunda-feira)
index.html
package.json
vite.config.js
```
