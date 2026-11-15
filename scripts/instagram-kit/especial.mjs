// Especial de domingo "Domingo de sofá": Reels + carrossel "Mito ou verdade"
// + 2 Stories, fora do kit semanal. Gera em instagram-kit-out/especial-<data>/
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
// Uso: node scripts/instagram-kit/especial.mjs [--date AAAA-MM-DD] [--out pasta] [--upload]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";
import { renderSlides, renderReels, downloadMusic, REELS_MUSIC } from "./build.mjs";
import { specialReelsPage, specialCarousel, specialStories, SPECIAL_SECONDS, SPECIAL_COVER_SECONDS } from "./templates-especial.mjs";
import { ROOT, loadEnvLocal, uploadWeek } from "./storage.mjs";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

// A trilha mais "batida" da lista já verificada (sem Content ID).
const TRACK = REELS_MUSIC.find((t) => /Showreel/.test(t.title)) || REELS_MUSIC[0];

const SIGN = "D&B Corretora de Seguros · Águas Claras, Brasília";
const TAGS = "#seguroauto #cotacaodeseguro #domingo #brasilia #aguasclaras #DBCorretora #segurodecarro";

function captions() {
  const susep = process.env.SUSEP_REGISTRO ? `\n${process.env.SUSEP_REGISTRO}` : "";
  const follow = "Siga {{perfil}} para mais dicas de seguro sem complicação.";
  return {
    reels: `POV: domingo, 21h, no sofá… e o seguro do carro vence essa semana 😱🛋️

Antes: esperar segunda, ligar, ouvir musiquinha de espera e esperar retorno.
Agora: abre o celular, preenche uma vez e 8 seguradoras calculam ao mesmo tempo. As ofertas aparecem na tela em poucos minutos.

✅ Fácil: preenche uma vez, pelo celular
🛋️ Cômodo: a qualquer hora, até domingo à noite
🔒 Seguro: seus dados não ficam guardados no site (LGPD)

💬 Comenta "🛋️" se você também deixa tudo pro domingo.
📲 Manda pra aquele amigo que ainda cota seguro por telefone.

👉 Cotação no link da bio.
${follow}

${SIGN}${susep}

${TAGS}`,
    carousel: `Cotar seguro online é seguro? 🤔 Arrasta e descobre os 4 mitos que mais fazem gente perder tempo.

❌ "Online é menos seguro que por telefone"
❌ "Vou ter que mandar minha apólice para alguém"
❌ "Vou passar horas no telefone"
❌ "Dá trabalho e demora"

Na cotação da D&B, os dados que você digita vão direto para o cálculo das seguradoras e não ficam guardados no site. O PDF da apólice, se você quiser usar, é lido no seu próprio celular. E você compara 8 seguradoras de uma vez, a qualquer hora.

💬 Qual desses mitos você já ouviu? Conta aqui 👇
📌 Salve para lembrar na renovação.

👉 Cotação no link da bio.
${follow}

${SIGN}${susep}

${TAGS}`,
  };
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
  const caps = captions();
  const music = await downloadMusic(TRACK, outDir);

  const browser = await chromium.launch({ channel: "chrome" });
  let carousel, stories, video, cover;
  try {
    const reelsDir = path.join(outDir, "1-reels");
    [video, cover] = await renderReels(browser, specialReelsPage(kit), reelsDir, null, { seconds: SPECIAL_SECONDS, coverSeconds: SPECIAL_COVER_SECONDS });
    const silent = path.join(reelsDir, "reels-sem-musica.mp4");
    fs.renameSync(video, silent);
    if (music) {
      addMusic(silent, music, video);
      fs.rmSync(music, { force: true });
    } else {
      fs.copyFileSync(silent, video);
    }
    carousel = await renderSlides(browser, specialCarousel(kit), path.join(outDir, "2-mito-ou-verdade"));
    stories = await renderSlides(browser, specialStories(kit), path.join(outDir, "stories"), { height: 1920, names: ["sun.jpg", "sun2.jpg"] });
  } finally {
    await browser.close();
  }

  const rel = (f) => path.relative(outDir, f).split(path.sep).join("/");
  const manifest = {
    week: kitId, special: true, generatedAt: new Date().toISOString(), music: music ? `${TRACK.title} (${TRACK.artist}, Pixabay)` : null,
    posts: {
      sun: { type: "reels", video: rel(video), cover: rel(cover), caption: caps.reels, story: rel(stories[0]) },
      sun2: { type: "carousel", media: carousel.map(rel), caption: caps.carousel, story: rel(stories[1]) },
    },
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outDir, "legendas.md"), `## Reels\n\n${caps.reels}\n\n---\n\n## Carrossel "Mito ou verdade"\n\n${caps.carousel}\n`);
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
