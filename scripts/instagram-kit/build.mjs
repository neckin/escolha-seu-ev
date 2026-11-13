// Kit semanal de Instagram e Facebook (seguro auto) da D&B. Objetivo: ganhar
// seguidores e vender seguro, mostrando que cotar online é mais prático e
// rápido que ligar e esperar. O catálogo do Escolha seu EV entra como gancho.
//   - segunda: carrossel "Seguro em minutos" (tema escolhido pelo desempenho
//              no Windsor.ai, ou rodízio) + Story
//   - quarta:  Reels, alternando "Ainda vai ligar e esperar?" e "Quanto custa
//              rodar 1.000 km?" + Story
//   - sexta:   carrossel "Carro da semana" + Story
//
// Gera JPEG (1080x1350 e 1080x1920) e MP4 (1080x1920). Com --upload, sobe as
// peças e o manifest.json para o Supabase Storage, e o publish.mjs publica
// sozinho (segunda, quarta e sexta, às 18h).
//
// Uso: node scripts/instagram-kit/build.mjs [--out pasta] [--week AAAA-MM-DD] [--upload] [--no-video]
// Requer Google Chrome instalado (playwright-core, channel "chrome") e ffmpeg
// (ou FFMPEG_PATH) para o Reels. No GitHub Actions os dois já vêm no runner.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";
import {
  weekCarSlides, quoteSlides, reelsPage, reelsCostPage, storySlide, QUOTE_THEMES, REELS_SECONDS, REELS_COVER_SECONDS, INSURERS, brl, num, price,
} from "./templates.mjs";
import { ROOT, loadEnvLocal, weekMonday, iso, uploadWeek } from "./storage.mjs";
import { performance, chooseTheme, writeReport } from "./insights.mjs";

const ENERGY_PRICE = 0.9; // R$/kWh, o mesmo padrão do simulador do site
const FUEL_PRICE = 6.0; // R$/l
const GAS_KM_L = 12; // carro a gasolina de referência
const MAX_CAR_PRICE = 230000; // carro da semana: só até R$ 230 mil (populares e médios)

// Trilhas do Reels, em rodízio semanal. Todas da Pixabay (licença livre para
// uso comercial, sem crédito obrigatório) e sem "Content ID Registered", para
// o Instagram não silenciar o vídeo. O repositório é público e a licença não
// permite redistribuir o áudio solto, por isso o arquivo é baixado na hora.
const REELS_MUSIC = [
  { title: "Upbeat Corporate", artist: "The_Mountain", page: "https://pixabay.com/music/corporate-upbeat-corporate-576594/", url: "https://cdn.pixabay.com/download/audio/2026/08/05/audio_70e1bbcd7e.mp3?filename=the_mountain-upbeat-corporate-576594.mp3" },
  { title: "Advertising Marketing", artist: "AtlasAudio", page: "https://pixabay.com/music/corporate-advertising-marketing-617541/", url: "https://cdn.pixabay.com/download/audio/2026/10/08/audio_e0b3fc85ac.mp3?filename=atlasaudio-advertising-marketing-617541.mp3" },
  { title: "Creative Technology Showreel", artist: "Pumpupthemind", page: "https://pixabay.com/music/beats-creative-technology-showreel-241274/", url: "https://cdn.pixabay.com/download/audio/2024/09/16/audio_a10608d6cd.mp3?filename=pumpupthemind-creative-technology-showreel-241274.mp3" },
  { title: "Corporate Upbeat", artist: "The_Mountain", page: "https://pixabay.com/music/corporate-corporate-upbeat-610127/", url: "https://cdn.pixabay.com/download/audio/2026/09/25/audio_c0491f626a.mp3?filename=the_mountain-corporate-upbeat-610127.mp3" },
  { title: "Video Marketing", artist: "AtlasAudio", page: "https://pixabay.com/music/corporate-video-marketing-617621/", url: "https://cdn.pixabay.com/download/audio/2026/10/09/audio_1ed3b90b15.mp3?filename=atlasaudio-video-marketing-617621.mp3" },
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const brDay = (d) => d.toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" });
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex");
const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };

// Rodízio estável: embaralha por hash do id (marcas e faixas de preço se
// alternam) e anda uma posição por semana. Carro novo no catálogo entra na
// fila sem bagunçar a ordem dos demais.
function rotate(list, week, key) {
  const sorted = [...list].sort((a, b) => hash(key(a)).localeCompare(hash(key(b))));
  return sorted[week % sorted.length];
}

function costOf(car) {
  const maintOk = car.maintenanceTotalCost && car.maintenanceKmBase;
  return {
    evPer1000: Math.round(10 * car.consumptionKwh100 * ENERGY_PRICE),
    gasPer1000: Math.round((1000 / GAS_KM_L) * FUEL_PRICE),
    maintTotal: maintOk ? car.maintenanceTotalCost : null,
    maintKm: maintOk ? car.maintenanceKmBase : null,
  };
}

// Só elétricos com preço, autonomia e consumo oficiais: são os números que
// as peças mostram, e a conta de energia não vale para híbrido. E só os mais
// acessíveis: carro que o público consegue comprar chama mais atenção.
function pickWeekCar(cars, weekIndex) {
  const eligible = cars.filter((c) => c.fuelType === "BEV" && c.price && c.price <= MAX_CAR_PRICE && c.rangeKm && c.consumptionKwh100);
  return rotate(eligible, weekIndex, (c) => c.id);
}

const tag = (s) => `#${s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "")}`;

// Legendas: a 1ª linha é o gancho (é o que aparece antes do "mais"),
// parágrafos curtos, uma pergunta para puxar comentário e as chamadas que
// mais trazem seguidor e cliente: salvar, compartilhar, seguir, link na bio.
// {{perfil}} vira o @ da conta na hora de publicar (publish.mjs).
// Poucas hashtags, bem escolhidas: assunto + região (Brasília/DF).
const QUOTE_CAPTIONS = {
  "jeito-antigo": `Ainda liga para pedir cotação de seguro e fica esperando o retorno? 📞⏳

Na D&B você cota online, a qualquer hora: preenche uma vez, 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem na tela em poucos minutos.

Você compara preço, franquia e cobertura, escolhe o plano e a forma de pagamento. A gente fala com você só para fechar.

💬 E você: da última vez, cotou ligando ou online?`,
  apolice: `Seu seguro pode estar mais caro do que precisa. Dá para descobrir em minutos. 📄

Na cotação online da D&B, envie o PDF da sua apólice atual (o que a seguradora mandou por e-mail ou está no app dela). O formulário é preenchido com o carro, os dados do condutor, a seguradora, o vencimento e a classe de bônus. Você só confere.

Aí 8 seguradoras calculam ao mesmo tempo e você vê, antes de renovar, se dá para pagar menos ou ter uma cobertura melhor.

🔒 O arquivo é lido no seu próprio aparelho e não é enviado para ninguém.

💬 Você compara antes de renovar ou renova direto?`,
  "tres-passos": `Seguro auto em 3 passos. Sem ligação, sem esperar retorno. ⚡

1️⃣ Preencha os dados do carro e do condutor
2️⃣ Compare as ofertas de 8 seguradoras na tela
3️⃣ Escolha o plano e a forma de pagamento. A D&B fala com você em até 1 dia útil só para concluir.

💬 Qual parte do seguro mais te dá dor de cabeça? Conta aqui.`,
  "oito-seguradoras": `8 seguradoras. Uma cotação. Poucos minutos. 🛡️

${INSURERS.join(", ")}: todas calculam o seu seguro ao mesmo tempo, e você vê preço, franquia e cobertura lado a lado.

Sem ligar para cada uma, sem esperar ninguém.

💬 Qual seguradora você usa hoje?`,
  renovacao: `Seu seguro vence nos próximos 60 dias? Não renove no automático. 📅

Antes de aceitar a renovação, cote em 8 seguradoras de uma vez e compare. Se tiver o PDF da apólice atual, envie na cotação: ele já preenche quase tudo.

É online, a qualquer hora, e leva poucos minutos.

💬 Em que mês vence o seu?`,
  "carro-novo": `Vai buscar o carro novo? Não saia da loja sem seguro. 🚗🔑

Cote antes da entrega: com o modelo e o ano, 8 seguradoras calculam na hora e você escolhe o plano. A D&B conclui a contratação com você.

💬 Qual carro você está esperando chegar?`,
};

const REELS_CAPTIONS = {
  ligar: (car) => `Seguro do ${car.name}? Não precisa ligar e esperar. ⚡

Na D&B você cota online: 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem na tela em poucos minutos. Você escolhe, e a gente fala com você só para fechar.

Vale para qualquer carro, elétrico ou não.

💬 Marca aqui alguém que ainda cota seguro por telefone.`,
  custo: (car, cost) => `Rodar 1.000 km de ${car.name} custa ${brl(cost.evPer1000)} de energia. De carro a gasolina, ${brl(cost.gasPer1000)}. ⚡

São ${brl(cost.gasPer1000 - cost.evPer1000)} de diferença a cada 1.000 km (consumo INMETRO, energia a R$ ${price(ENERGY_PRICE)}/kWh e gasolina a R$ ${price(FUEL_PRICE)}/l).

E o seguro do elétrico? Cote em 8 seguradoras de uma vez, em poucos minutos, sem ligar para ninguém.

💬 Você trocaria o seu carro por um elétrico? Sim ou não?`,
};

function captions({ weekCar, theme, cost, monday, signature, reelsVariant }) {
  const wed = addDays(monday, 2);
  const fri = addDays(monday, 4);
  const base = ["#seguroauto", "#cotacaodeseguro", "#brasilia", "#aguasclaras", "#DBCorretora"];
  const susep = process.env.SUSEP_REGISTRO ? `\n${process.env.SUSEP_REGISTRO}` : "";
  const sign = `\n\n${signature}${susep}`;
  const follow = "Siga {{perfil}}: toda semana tem carro elétrico analisado e dica para pagar menos no seguro.";

  return [
    {
      day: `Segunda ${brDay(monday)}`, kind: `Carrossel · Seguro em minutos (${theme.id})`, folder: "1-seguro-em-minutos",
      caption: `${QUOTE_CAPTIONS[theme.id]}

👉 Cote pelo link na bio.
📌 Salve para lembrar na renovação e mande para quem está procurando seguro.
${follow}${sign}

${base.join(" ")}`,
    },
    {
      day: `Quarta ${brDay(wed)}`, kind: `Reels · ${reelsVariant === "custo" ? "Quanto custa rodar" : "Ainda vai ligar e esperar?"}`, folder: "2-reels",
      caption: `${REELS_CAPTIONS[reelsVariant](weekCar, cost)}

👉 Cotação no link da bio.
${follow}${sign}

${[...base, "#carroeletrico", tag(weekCar.brand)].join(" ")}`,
    },
    {
      day: `Sexta ${brDay(fri)}`, kind: "Carrossel · Carro da semana", folder: "3-carro-da-semana",
      caption: `Carro da semana: ${weekCar.name}. ${num(weekCar.rangeKm)} km de autonomia por ${brl(weekCar.price)}. Vale a pena? 🔋

A cada 1.000 km, a energia sai por cerca de ${brl(cost.evPer1000)}, contra ${brl(cost.gasPer1000)} de um carro a gasolina de ${GAS_KM_L} km/l.${cost.maintTotal ? ` As revisões somam ${brl(cost.maintTotal)} até ${num(cost.maintKm / 1000)} mil km.` : ""}

E o seguro? Cote em 8 seguradoras de uma vez, em poucos minutos, e fale com a D&B só para fechar.

💬 Compraria o ${weekCar.name}? Responde com 👍 ou 👎.

👉 Cotação no link da bio.
📌 Salve para comparar depois e mande para quem está pensando em ter um elétrico.
${follow}

Estimativa com consumo INMETRO, energia a R$ ${price(ENERGY_PRICE)}/kWh e gasolina a R$ ${price(FUEL_PRICE)}/l.${sign}

${[...base, "#carroeletrico", tag(weekCar.brand), "#carrodasemana"].join(" ")}`,
    },
  ];
}

// JPEG: a API de publicação do Instagram só aceita JPEG.
async function renderSlides(browser, htmls, dir, { height = 1350, names } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height } });
  const files = [];
  for (const [i, html] of htmls.entries()) {
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(dir, names ? names[i] : `${String(i + 1).padStart(2, "0")}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 95 });
    files.push(file);
  }
  await page.close();
  return files;
}

// Baixa a trilha da semana. Se a Pixabay falhar, o Reels sai sem áudio.
async function downloadMusic(track, dir) {
  try {
    const res = await fetch(track.url, { headers: { "User-Agent": "Mozilla/5.0", Referer: track.page } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "trilha.mp3");
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    return file;
  } catch (error) {
    console.error(`Trilha "${track.title}" indisponível (${error.message}); o Reels vai sem áudio.`);
    return null;
  }
}

async function renderReels(browser, html, dir, musicFile) {
  const framesDir = path.join(dir, "frames");
  fs.mkdirSync(framesDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const fps = 30;
  for (let f = 0; f < REELS_SECONDS * fps; f++) {
    // Pausa todas as animações e posiciona no tempo exato do quadro.
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), (f * 1000) / fps);
    await page.screenshot({ path: path.join(framesDir, `${String(f).padStart(4, "0")}.jpg`), type: "jpeg", quality: 92 });
  }
  await page.close();

  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  const out = path.join(dir, "reels.mp4");
  const silent = musicFile ? path.join(dir, "mudo.mp4") : out;
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(framesDir, "%04d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", silent,
  ]);
  if (musicFile) {
    // Em outra passada, copiando o vídeo: codificar imagem e som juntos
    // estourava a memória. Entram os primeiros segundos da música, com fade
    // na entrada e na saída, no volume padrão das redes (-14 LUFS).
    execFileSync(ffmpeg, [
      "-y", "-loglevel", "error", "-i", silent, "-t", String(REELS_SECONDS), "-i", musicFile,
      "-af", `afade=t=in:d=0.3,afade=t=out:st=${REELS_SECONDS - 1.5}:d=1.5,loudnorm=I=-14:TP=-1.5`,
      "-ar", "44100", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out,
    ]);
    fs.rmSync(silent, { force: true });
    fs.rmSync(musicFile, { force: true });
  }
  const cover = path.join(dir, "capa.jpg");
  fs.copyFileSync(path.join(framesDir, `${String(Math.round(REELS_COVER_SECONDS * fps)).padStart(4, "0")}.jpg`), cover);
  fs.rmSync(framesDir, { recursive: true, force: true });
  return [out, cover];
}

async function main() {
  loadEnvLocal();
  const monday = weekMonday(arg("week"));
  const week = iso(monday);
  const weekIndex = Math.floor(monday.getTime() / (7 * 24 * 3600 * 1000));
  const outDir = path.resolve(arg("out", path.join(ROOT, "instagram-kit-out")), week);
  const cars = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "carsFallback.json"), "utf8"));
  const weekCar = pickWeekCar(cars, weekIndex);
  const cost = costOf(weekCar);
  // Reels alterna: semana par "ligar e esperar" (seguro), ímpar "quanto custa
  // rodar" (curiosidade sobre elétrico, alcança mais gente nova).
  const reelsVariant = weekIndex % 2 ? "custo" : "ligar";

  // Tema da segunda pelo desempenho medido no Windsor.ai (ou rodízio).
  let perf = null;
  try {
    perf = await performance();
  } catch (error) {
    console.error(`Windsor.ai indisponível (${error.message}); tema pelo rodízio.`);
  }
  const { theme, reason } = chooseTheme(QUOTE_THEMES, weekIndex, perf);
  if (arg("upload")) await writeReport(perf, week).catch((e) => console.error(`Relatório: ${e.message}`));

  const logo = (file) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "public", "brand", file)).toString("base64")}`;
  const signature = "D&B Corretora de Seguros · Águas Claras, Brasília";
  const kit = { logoGold: logo("db-corretora-logo.png"), logoNavy: logo("db-corretora-logo-navy.png"), energyPrice: ENERGY_PRICE, fuelPrice: FUEL_PRICE, signature };
  fs.rmSync(outDir, { recursive: true, force: true });
  const track = REELS_MUSIC[weekIndex % REELS_MUSIC.length];
  const musicFile = arg("no-video") ? null : await downloadMusic(track, outDir);
  const posts = captions({ weekCar, theme, cost, monday, signature, reelsVariant });

  console.log(`Semana ${week} · tema: ${theme.id} (${reason}) · carro: ${weekCar.name} · Reels: ${reelsVariant} · trilha: ${musicFile ? track.title : "nenhuma"}`);
  const browser = await chromium.launch({ channel: "chrome" });
  const rel = (f) => path.relative(outDir, f).split(path.sep).join("/");
  let carousel1, reels, carousel3, stories;
  try {
    carousel1 = await renderSlides(browser, quoteSlides(theme, kit), path.join(outDir, posts[0].folder));
    const reelsHtml = reelsVariant === "custo" ? reelsCostPage(weekCar, cost, kit) : reelsPage(weekCar, kit);
    reels = arg("no-video") ? [] : await renderReels(browser, reelsHtml, path.join(outDir, posts[1].folder), musicFile);
    carousel3 = await renderSlides(browser, weekCarSlides(weekCar, cost, kit), path.join(outDir, posts[2].folder));
    stories = await renderSlides(browser, [
      storySlide("mon", { theme }, kit), storySlide("wed", { car: weekCar, cost, variant: reelsVariant }, kit), storySlide("fri", { car: weekCar, cost }, kit),
    ], path.join(outDir, "stories"), { height: 1920, names: ["mon.jpg", "wed.jpg", "fri.jpg"] });
  } finally {
    await browser.close();
  }

  // O que o publish.mjs publica em cada dia.
  const manifest = {
    week, theme: theme.id, themeReason: reason, reelsVariant, car: weekCar.id, generatedAt: new Date().toISOString(),
    posts: {
      mon: { type: "carousel", media: carousel1.map(rel), caption: posts[0].caption, story: rel(stories[0]) },
      wed: reels.length
        ? { type: "reels", video: rel(reels[0]), cover: rel(reels[1]), caption: posts[1].caption, story: rel(stories[1]) }
        : null,
      fri: { type: "carousel", media: carousel3.map(rel), caption: posts[2].caption, story: rel(stories[2]) },
    },
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outDir, "legendas.md"), posts.map((p) => `## ${p.day} · ${p.kind}\n\n${p.caption}`).join("\n\n---\n\n"));
  console.log(`Kit salvo em ${outDir}`);

  if (arg("upload")) {
    await uploadWeek(week, outDir);
    console.log(`Kit enviado ao Supabase Storage (${week}/)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
