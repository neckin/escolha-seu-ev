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

O **catálogo de carros** vem de uma tabela `cars` num projeto Supabase
(Postgres) — todo mundo que visita o site vê os mesmos carros, vindos do
mesmo lugar. O código (`src/App.jsx`, constante `SEED_CARS`) continua sendo
a fonte "oficial": é ali que cada carro é corrigido/adicionado, com a fonte
da informação registrada no commit — igual sempre fizemos. Depois de mexer
nos dados, roda `node scripts/generate-supabase-seed.mjs > supabase/seed-cars.sql`
e executa o SQL gerado no **SQL Editor** do Supabase pra sincronizar o banco.

Se o Supabase não estiver configurado (falta `.env.local`) ou a consulta
falhar por qualquer motivo, o app cai de volta pro catálogo embutido no
código (`SEED_CARS`) — nunca quebra por causa disso.

Coisas pessoais do visitante (tema claro/escuro, "meu carro atual", tutorial
já visto) continuam no **localStorage do navegador** (`src/storageShim.js`)
— isso é intencional, não precisa ser compartilhado entre dispositivos.

### Configurar o Supabase (uma vez)

1. Crie um projeto grátis em [supabase.com](https://supabase.com)
2. No **SQL Editor** do projeto, rode `supabase/schema.sql` (cria a tabela e
   a política de leitura pública) e depois `supabase/seed-cars.sql` (popula
   com os carros que já estão no código)
3. Em **Settings → API Keys**, copie a **Project URL** e a chave **`anon`**
   (não a `service_role` — essa é secreta e nunca deve aparecer no front)
4. Crie um arquivo `.env.local` na raiz do projeto (não é versionado):
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```
5. Na Vercel, adicione as mesmas duas variáveis em **Settings → Environment
   Variables** (Production, Preview e Development)

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
  storageShim.js              <- substitui window.storage por localStorage (preferências pessoais)
  supabaseClient.js           <- client do Supabase (client-side, usa a chave anon pública)
supabase/
  schema.sql                  <- cria a tabela `cars` + RLS de leitura pública (roda 1x)
  seed-cars.sql                <- gerado a partir do código, sincroniza o banco (roda a cada mudança)
scripts/
  generate-supabase-seed.mjs  <- gera o seed-cars.sql a partir de SEED_CARS em App.jsx
  channels.json               <- lista de canais do YouTube monitorados
  scan-channels.mjs           <- robô de triagem semanal
  pending-reviews/            <- relatórios gerados (um .md por semana)
.github/workflows/
  weekly-scan.yml              <- agendamento do robô (toda segunda-feira)
index.html
package.json
vite.config.js
```
