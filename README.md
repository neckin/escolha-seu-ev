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

O **Supabase é a fonte da verdade do catálogo** — a tabela `cars` num
projeto Supabase (Postgres). Todo mundo que visita o site vê os mesmos
carros, vindos do mesmo lugar, e carro novo ou correção de ficha técnica é
editado **direto no banco** (SQL Editor do Supabase, ou — quando a Fase 3
estiver pronta — aprovando itens da fila de revisão `car_review_queue`).

`src/carsFallback.json` é só o **fallback offline**: um snapshot gerado a
partir do próprio Supabase (`scripts/generate-fallback-snapshot.mjs`), usado
automaticamente se o Supabase não estiver configurado (falta `.env.local`)
ou a consulta falhar — pra o site nunca quebrar por causa disso. Ele **não
é editado à mão**: uma GitHub Action
(`.github/workflows/refresh-fallback-snapshot.yml`) o atualiza sozinha toda
segunda-feira, ou rodando manualmente **Actions → Atualizar snapshot de
fallback do catálogo → Run workflow**.

Coisas pessoais do visitante (tema claro/escuro, "meu carro atual", tutorial
já visto) continuam no **localStorage do navegador** (`src/storageShim.js`)
— isso é intencional, não precisa ser compartilhado entre dispositivos.

### Configurar o Supabase (uma vez)

1. Crie um projeto grátis em [supabase.com](https://supabase.com)
2. No **SQL Editor** do projeto, rode `supabase/schema.sql` (cria a tabela
   `cars` e a política de leitura pública) e `supabase/schema-review-queue.sql`
   (cria a fila de revisão usada pela Fase 3 — pode rodar mesmo antes dela
   existir, não atrapalha nada)
3. Em **Settings → API Keys**, copie a **Project URL** e as duas chaves:
   - **`anon`** (pública, usada pelo site pra ler os carros)
   - **`service_role`** (secreta — usada só pelas GitHub Actions; nunca deve
     aparecer no front nem ser compartilhada)
4. Crie um arquivo `.env.local` na raiz do projeto (não é versionado), só
   com a chave pública:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```
5. Rode `node scripts/generate-fallback-snapshot.mjs` uma vez pra popular
   `src/carsFallback.json` a partir do que já está no banco
6. Na Vercel, adicione as mesmas duas variáveis do `.env.local` em
   **Settings → Environment Variables** (Production, Preview e Development)
7. No repositório do GitHub, em **Settings → Secrets and variables →
   Actions**, adicione:
   - `SUPABASE_URL` (mesmo valor do `.env.local`)
   - `SUPABASE_SERVICE_ROLE_KEY` (a chave secreta do passo 3 — só aqui,
     nunca em `.env.local` nem em nenhum lugar que vá pro navegador)

## Publicando (deploy)

Depois de testar localmente:

1. Crie um repositório no GitHub e suba este projeto (`git init`, `git add .`,
   `git commit`, depois conecte a um repo remoto).
2. Crie uma conta na [Vercel](https://vercel.com), conecte ao GitHub e
   importe este repositório — ela detecta que é um projeto Vite automaticamente.
3. A Vercel te dá uma URL pública (ex.: `escolha-seu-ev.vercel.app`).

## Triagem semanal automática (robô de lançamentos)

Toda segunda-feira, um único GitHub Action (`weekly-scan.yml`) roda dois
robôs de triagem — nenhum dos dois **atualiza o site sozinho**, só sinalizam
candidatos pra revisão humana:

1. **Varredura de vídeos** (`scan-channels.mjs`) — varre os canais do YouTube
   listados em `scripts/channels.json` atrás de vídeos que pareçam ser sobre
   lançamento de elétrico, híbrido plug-in ou híbrido não-plugável (HEV) no
   Brasil. Abre um **Pull Request** com um relatório em Markdown se achar
   candidato.
2. **Varredura de sites oficiais** (`scan-brand-sites.mjs`) — varre as marcas
   listadas em `scripts/brand-sites-watchlist.json`, com foco em achar
   híbrido não-plugável (HEV) que ainda não está no catálogo. Testado em
   11/09/2026: `fetch()` simples acessa normalmente Toyota, Honda, Chevrolet,
   Fiat, Jeep, BYD e GWM (sem bloqueio de bot) — mas se algum site passar a
   bloquear especificamente o IP do GitHub Actions, o relatório sinaliza a
   falha por marca em vez de quebrar a varredura inteira. Cada sinal
   encontrado vira uma linha **pendente** em `car_review_queue` no Supabase —
   nunca cai direto na tabela `cars`.

### Como ativar

1. Suba este projeto pro GitHub (`git init`, `git add .`, `git commit`, push
   pra um repositório novo).
2. Crie uma chave gratuita da **YouTube Data API v3**:
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um projeto → Ative a "YouTube Data API v3" → Crie uma credencial
     do tipo "Chave de API"
3. No repositório do GitHub, vá em **Settings → Secrets and variables →
   Actions** e adicione:
   - `YOUTUBE_API_KEY` (obrigatória pra varredura de vídeos)
   - `ANTHROPIC_API_KEY` (obrigatória pra varredura de sites oficiais — sem
     IA não dá pra extrair sinal útil do texto solto de uma home page.
     Opcional pra varredura de vídeos, mas recomendada: reduz falso positivo
     dos filtros de palavra-chave)
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (já devem existir, usadas
     também pelo `refresh-fallback-snapshot.yml`) — a varredura de sites
     precisa delas pra escrever na fila de revisão
4. Pronto — a partir da próxima segunda-feira (ou rodando manualmente em
   **Actions → Triagem semanal → Run workflow**), você vai ver um Pull
   Request toda semana com os candidatos, se houver.

Os canais do YouTube monitorados estão em `scripts/channels.json`; os sites
de marca em `scripts/brand-sites-watchlist.json` — edite esses arquivos pra
adicionar ou remover fontes.

### Revisando a fila (`car_review_queue`)

Os itens que a varredura de sites oficiais encontra ficam com
`status = 'pending'` na tabela `car_review_queue` do Supabase. Pra revisar:
abra o **Table Editor** do projeto, olhe `proposed_data` (nome do modelo,
preço se encontrado, marca) e `source_url`. Se for de fato um carro novo pra
cadastrar, pesquise a ficha completa e cadastre manualmente na tabela `cars`
(o padrão já usado pros carros existentes: preço, potência, autonomia etc.
verificados em fonte oficial, com nota registrando a data da checagem) —
depois marque a linha da fila como `status = 'approved'`. Se não for
relevante (falso positivo, carro que já existe, etc.), marque
`status = 'rejected'`. Ainda não existe uma tela no app pra isso — é direto
no dashboard do Supabase por enquanto.

## Estrutura do projeto

```
src/
  App.jsx                       <- toda a lógica e interface do app
  carsFallback.json             <- fallback offline, GERADO — não editar à mão
  main.jsx                      <- ponto de entrada, instala o storageShim e renderiza o App
  storageShim.js                 <- substitui window.storage por localStorage (preferências pessoais)
  supabaseClient.js              <- client do Supabase (client-side, usa a chave anon pública)
supabase/
  schema.sql                     <- cria a tabela `cars` + RLS de leitura pública (roda 1x)
  schema-review-queue.sql        <- cria a fila de revisão car_review_queue (roda 1x)
scripts/
  generate-fallback-snapshot.mjs <- gera src/carsFallback.json a partir do Supabase
  channels.json                  <- lista de canais do YouTube monitorados
  scan-channels.mjs              <- robô de triagem semanal (lançamentos, YouTube)
  brand-sites-watchlist.json     <- lista de sites oficiais de marca monitorados
  scan-brand-sites.mjs           <- robô de triagem semanal (sites oficiais -> car_review_queue)
  pending-reviews/               <- relatórios gerados (um .md por semana, por robô)
.github/workflows/
  refresh-fallback-snapshot.yml  <- atualiza carsFallback.json a partir do Supabase (toda segunda)
  weekly-scan.yml                <- roda os dois robôs de triagem (toda segunda-feira)
index.html
package.json
vite.config.js
```
