# Instagram e Facebook automáticos (D&B Corretora)

Publica sozinho, às **18h de segunda, quarta e sexta**, no Instagram e na Página do Facebook:

| Dia | Feed | Story |
|---|---|---|
| Segunda | Carrossel "Seguro em minutos" (tema escolhido pelo desempenho no Windsor.ai) | Arte do tema + "cote no link da bio" |
| Quarta | Reels de 15 s com música, alternando "Ainda vai ligar e esperar?" e "Quanto custa rodar 1.000 km?" | Arte "Reels novo" |
| Sexta | Carrossel "Carro da semana" (elétrico até R$ 230 mil, com dados oficiais) | Arte com preço, autonomia e custo de energia |

Como funciona: toda segunda às 07h o GitHub gera as peças da semana e as sobe para o Supabase Storage. Às 18h de cada dia de post, publica pela API oficial da Meta. Um post nunca sai duas vezes: rodar de novo só tenta o que falhou.

## Passo a passo da configuração (uma vez)

### 1. Instagram profissional ligado à Página
1. No app do Instagram: **Configurações → Tipo de conta e ferramentas → Mudar para conta profissional → Empresa**.
2. Em [business.facebook.com](https://business.facebook.com) → **Configurações → Contas → Contas do Instagram**: confirme que o Instagram da D&B está ligado à Página do Facebook e ao portfólio empresarial.

### 2. App da Meta
1. Em [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Criar app**.
2. Caso de uso: **Outro** → tipo **Empresa** (Business). Nome sugerido: "D&B Publicação automática". Escolha o portfólio da D&B.
3. No painel do app, adicione os produtos **Instagram** (configuração da API com login do Facebook) e **Login do Facebook para Empresas**.
4. Não precisa publicar o app nem passar por revisão: ele só mexe nas contas da própria D&B.

### 3. Usuário do sistema e token (não expira)
1. [business.facebook.com/settings](https://business.facebook.com/settings) → **Usuários → Usuários do sistema → Adicionar**. Nome "Publicador", função **Admin**.
2. **Atribuir ativos** → dê **controle total** para a **Página**, a **conta do Instagram** e o **app** criado no passo 2.
3. **Gerar novo token** → escolha o app → validade **Nunca** → marque as permissões:
   `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `business_management`.
4. Copie o token (aparece uma vez só). **Não mande por WhatsApp nem e-mail**: ele vai direto para o GitHub (passo 6).

### 4. ID da Página
Na Página do Facebook → **Sobre → Transparência da Página**, ou em **Configurações do negócio → Contas → Páginas** (o número abaixo do nome). O ID do Instagram não precisa: o sistema descobre pela Página.

### 5. Windsor.ai (desempenho dos posts)
1. Crie a conta em [windsor.ai](https://windsor.ai) e conecte o **Instagram** (entrar com o Facebook e escolher a conta da D&B). Confira no site se o plano escolhido inclui o conector do Instagram e acesso à API.
2. Em **Settings / API Key**, copie a chave da API.
3. Com isso, toda segunda o sistema lê o alcance, os salvamentos, os compartilhamentos e os seguidores ganhos de cada post e escolhe o tema de segunda que mais engaja. O relatório aparece em **GitHub → Actions → Kit semanal → (execução) → Summary**.

### 6. Secrets no GitHub
Repositório → **Settings → Secrets and variables → Actions → New repository secret**:

| Nome | Valor | Obrigatório |
|---|---|---|
| `META_ACCESS_TOKEN` | token do passo 3 | sim |
| `FB_PAGE_ID` | ID da Página (passo 4) | sim |
| `WINDSOR_API_KEY` | chave do passo 5 | recomendado |
| `IG_LOCATION_ID` | se a Página da D&B tem endereço cadastrado, o mesmo número do `FB_PAGE_ID` (marca o local nos posts e ajuda a alcançar gente de Brasília) | opcional |
| `SUSEP_REGISTRO` | linha do registro SUSEP para o rodapé das legendas, se a D&B exigir | opcional |
| `IG_USER_ID` | só se a descoberta automática falhar | opcional |

`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já estão cadastrados.

### 7. Link da bio
Coloque na bio do Instagram (e no botão da Página) o link com marcação, para o relatório de cotações mostrar o que veio do Instagram:
`https://ev.dbcorr.com.br/cotacao?utm_source=instagram&utm_medium=bio`

## Operação

- **Publicar agora / testar:** GitHub → **Actions → Publicar Instagram e Facebook → Run workflow** (escolha o dia).
- **Pausar:** **Settings → Secrets and variables → Actions → Variables → New variable** `INSTAGRAM_AUTOPUBLISH` = `off`. Para voltar, apague a variável ou mude para `on`.
- **Ver as peças antes:** na execução de segunda do "Kit semanal", baixe o artefato `instagram-kit`.
- **Gerar de novo o kit da semana:** "Kit semanal" → Run workflow (antes das 18h de segunda).

## Limites da API da Meta

- Stories publicados pela API não aceitam figurinhas (enquete, link, pergunta). Quem quiser pode postar Stories interativos pelo app, além dos automáticos.
- Música do Reels: vai embutida no vídeo (trilhas da Pixabay, livres para uso comercial). A biblioteca de músicas do Instagram só está disponível no app.
- Limite de 50 publicações por dia por conta (usamos 2 por dia de post).
