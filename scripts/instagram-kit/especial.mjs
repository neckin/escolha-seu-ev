// Especial de domingo: Reels + carrossel + 2 Stories, fora do kit semanal,
// com tema em rodízio semanal (THEMES em templates-especial.mjs). Gera em instagram-kit-out/especial-<data>/
// e, com --upload, sobe para o Storage na pasta especial-<data>/, de onde o
// publish.mjs publica com: --kit especial-<data> --day sun (Reels) e
// --day sun2 (carrossel).
//
// O Reels sai em duas versões:
//   - reels.mp4: com trilha da Pixabay (livre para uso comercial), é a que a
//     API publica;
//   - reels-sem-musica.mp4: para postar pelo app e escolher um áudio em alta
//     na biblioteca do Instagram (a API não dá acesso a ela).
//
// Uso: node scripts/instagram-kit/especial.mjs [--date AAAA-MM-DD] [--theme id] [--out pasta] [--upload]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";
import { renderSlides, renderReels, downloadMusic, REELS_MUSIC } from "./build.mjs";
import { specialReelsPage, specialCarousel, specialStories, pickTheme, THEMES, SPECIAL_SECONDS, SPECIAL_COVER_SECONDS } from "./templates-especial.mjs";
import { ROOT, loadEnvLocal, uploadWeek } from "./storage.mjs";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

// Trilha em rodízio semanal, da lista já verificada (Pixabay, sem Content ID).
const trackFor = (n) => REELS_MUSIC[((n % REELS_MUSIC.length) + REELS_MUSIC.length) % REELS_MUSIC.length];

const SIGN = "D&B Corretora de Seguros · Águas Claras, Brasília";
const TAGS = "#seguroauto #cotacaodeseguro #domingo #brasilia #aguasclaras #DBCorretora #segurodecarro";

// Legendas por tema. 1ª linha = gancho; pede comentário, envio e salvamento
// (envio por DM é o sinal que mais leva o post a quem ainda não segue).
const CAPTIONS = {
  sofa: {
    reels: `POV: domingo, 21h, no sofá… e o seguro do carro vence essa semana 😱🛋️

Antes: esperar segunda, ligar, ouvir musiquinha de espera e esperar retorno.
Agora: abre o celular, preenche uma vez e 8 seguradoras calculam ao mesmo tempo. As ofertas aparecem na tela em poucos minutos.

✅ Fácil: preenche uma vez, pelo celular
🛋️ Cômodo: a qualquer hora, até domingo à noite
🔒 Seguro: seus dados não ficam guardados no site (LGPD)

💬 Comenta "🛋️" se você também deixa tudo pro domingo.
📲 Manda pra aquele amigo que ainda cota seguro por telefone.`,
    carousel: `Cotar seguro online é seguro? 🤔 Arrasta e descobre os 4 mitos que mais fazem gente perder tempo.

❌ "Online é menos seguro que por telefone"
❌ "Vou ter que mandar minha apólice para alguém"
❌ "Vou passar horas no telefone"
❌ "Dá trabalho e demora"

Na cotação da D&B, os dados que você digita vão direto para o cálculo das seguradoras e não ficam guardados no site. O PDF da apólice, se você quiser usar, é lido no seu próprio celular. E você compara 8 seguradoras de uma vez, a qualquer hora.

💬 Qual desses mitos você já ouviu? Conta aqui 👇
📌 Salve para lembrar na renovação.`,
  },
  madrugada: {
    reels: `POV: 23h, sem sono, rolando o feed… e do nada lembra do seguro do carro 🌙

Antes: anotar pra ligar amanhã, esquecer e só lembrar no vencimento.
Agora: resolve ali mesmo, do celular. Preenche uma vez e 8 seguradoras calculam ao mesmo tempo.

✅ Fácil: preenche uma vez, pelo celular
🛋️ Cômodo: a qualquer hora, até de madrugada
🔒 Seguro: seus dados não ficam guardados no site (LGPD)

💬 Comenta "🌙" se você também resolve as coisas de madrugada.
📲 Manda pra quem sempre diz "amanhã eu vejo".`,
    carousel: `O que ter em mãos para cotar o seguro do carro em minutos ✅ Salve este checklist.

1️⃣ Seus dados: nome, CPF, nascimento, telefone e e-mail
2️⃣ O carro: ano, marca e modelo
3️⃣ Onde ele dorme: CEP e se tem garagem
4️⃣ Atalho: o PDF da apólice atual preenche quase tudo, e é lido no seu próprio celular

Com isso, 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem na tela. A qualquer hora.

💬 Qual desses você teria que procurar agora? 😅
📌 Salve para quando for cotar.`,
  },
  renovacao: {
    reels: `POV: chegou o aviso da renovação do seguro… e o valor subiu 😬

Renovar no automático é aceitar sem comparar.
Na D&B, você cota em 8 seguradoras de uma vez antes de renovar. Com o PDF da apólice atual, o formulário já vem quase todo preenchido.

✅ Fácil: preenche uma vez, pelo celular
🛋️ Cômodo: a qualquer hora, até domingo à noite
🔒 Seguro: nenhum pagamento acontece no site

💬 Comenta "📅" e conta: em que mês vence o seu?
📲 Manda pra quem renova sem olhar.`,
    carousel: `Vai renovar o seguro do carro? Leia antes 📅 Arrasta para ver os 4 mitos da renovação.

❌ "Para trocar de seguradora, começo do zero"
❌ "Comparar dá muito trabalho"
❌ "Se eu cotar, já fico comprometido"
❌ "Renovar com a mesma é sempre o melhor preço"

Sua classe de bônus entra na cotação, o PDF da apólice preenche quase tudo e nenhum pagamento acontece no site: você só fecha se escolher um plano.

💬 Você compara antes de renovar ou renova direto?
📌 Salve para o mês do vencimento.`,
  },
  confianca: {
    reels: `POV: você desconfia de site que pede seus dados… e tá certo 🔒

Na D&B:
🏢 Corretora identificada, com CNPJ, em Águas Claras
💳 Nenhum pagamento acontece no site
🗂️ Seus dados vão direto para o cálculo e não ficam guardados no site (LGPD)

E você ainda compara 8 seguradoras de uma vez, em poucos minutos.

💬 Comenta "🔒" se você também pensa duas vezes antes de digitar seus dados.
📲 Manda pra quem tem medo de golpe.`,
    carousel: `4 sinais de que uma cotação online é confiável 🔒 Confira antes de digitar seus dados em qualquer site.

1️⃣ Empresa identificada, com nome e CNPJ
2️⃣ Nada de pagar no site
3️⃣ Privacidade explicada (LGPD)
4️⃣ Dados que não ficam guardados

Na D&B, os quatro valem: a corretora é a D'Agostino e Barreto, nenhum pagamento acontece no site e os seus dados vão direto para o cálculo das 8 seguradoras.

💬 Você já caiu (ou quase caiu) em golpe na internet?
📌 Salve e mande para quem precisa ver isso.`,
  },
};

function captions(theme) {
  const susep = process.env.SUSEP_REGISTRO ? `\n${process.env.SUSEP_REGISTRO}` : "";
  const tail = `\n\n👉 Cotação no link da bio.\nSiga {{perfil}}: todo domingo tem especial e dica de seguro sem complicação.\n\n${SIGN}${susep}\n\n${TAGS}`;
  const c = CAPTIONS[theme.id];
  return { reels: c.reels + tail, carousel: c.carousel + tail };
}

// Junta o vídeo mudo com a trilha (fade e volume padrão das redes).
function addMusic(silent, music, out) {
  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error", "-i", silent, "-t", String(SPECIAL_SECONDS), "-i", music,
    "-af", `afade=t=in:d=0.2,afade=t=out:st=${SPECIAL_SECONDS - 1.5}:d=1.5,loudnorm=I=-14:TP=-1.5`,
    "-ar", "44100", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out,
  ]);
}

async function main() {
  loadEnvLocal();
  const date = arg("date", new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10));
  const kitId = `especial-${date}`;
  const outDir = path.resolve(arg("out", path.join(ROOT, "instagram-kit-out")), kitId);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const logo = (file) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "public", "brand", file)).toString("base64")}`;
  const kit = { logoGold: logo("db-corretora-logo.png"), logoNavy: logo("db-corretora-logo-navy.png"), signature: SIGN };
  const theme = pickTheme(date, arg("theme"));
  const caps = captions(theme);
  const track = trackFor(THEMES.indexOf(theme) + Math.floor(Date.parse(`${date}T12:00:00Z`) / (28 * 24 * 3600 * 1000)));
  const music = await downloadMusic(track, outDir);
  console.log(`Especial ${date} · tema: ${theme.id} · trilha: ${track.title}`);

  const browser = await chromium.launch({ channel: "chrome" });
  let carousel, stories, video, cover;
  try {
    const reelsDir = path.join(outDir, "1-reels");
    [video, cover] = await renderReels(browser, specialReelsPage(kit, theme), reelsDir, null, { seconds: SPECIAL_SECONDS, coverSeconds: SPECIAL_COVER_SECONDS });
    const silent = path.join(reelsDir, "reels-sem-musica.mp4");
    fs.renameSync(video, silent);
    if (music) {
      addMusic(silent, music, video);
      fs.rmSync(music, { force: true });
    } else {
      fs.copyFileSync(silent, video);
    }
    carousel = await renderSlides(browser, specialCarousel(kit, theme), path.join(outDir, "2-carrossel"));
    stories = await renderSlides(browser, specialStories(kit, theme), path.join(outDir, "stories"), { height: 1920, names: ["sun.jpg", "sun2.jpg"] });
  } finally {
    await browser.close();
  }

  const rel = (f) => path.relative(outDir, f).split(path.sep).join("/");
  const manifest = {
    week: kitId, special: true, theme: theme.id, generatedAt: new Date().toISOString(), music: music ? `${track.title} (${track.artist}, Pixabay)` : null,
    posts: {
      sun: { type: "reels", video: rel(video), cover: rel(cover), caption: caps.reels, story: rel(stories[0]) },
      sun2: { type: "carousel", media: carousel.map(rel), caption: caps.carousel, story: rel(stories[1]) },
    },
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outDir, "legendas.md"), `# Especial ${date} · tema ${theme.id}\n\n## Reels\n\n${caps.reels}\n\n---\n\n## Carrossel\n\n${caps.carousel}\n`);
  console.log(`Especial salvo em ${outDir} · trilha: ${manifest.music || "nenhuma"}`);

  if (arg("upload")) {
    await uploadWeek(kitId, outDir);
    console.log(`Enviado ao Supabase Storage (${kitId}/)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
