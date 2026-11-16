// Ação pontual "5 carros elétricos até R$ 150 mil": Reels + carrossel +
// 2 Stories, fora do kit semanal, feitos para turbinar. Gera em
// instagram-kit-out/acao-<data>/ e, com --upload, sobe para o Storage, de onde
// o publish.mjs publica com: --kit acao-<data> --day rank (Reels) e
// --day rank2 (carrossel).
//
// A lista sai do catálogo verificado (src/carsFallback.json): só elétricos
// (BEV) até R$ 150 mil com preço, autonomia e consumo oficiais, uma versão
// por modelo (a mais em conta).
//
// Abertura: por padrão, 4 s de cenas reais da Pixabay (carro carregando,
// celular na mão); com --intro <vídeo>, um vídeo próprio (ex.: alguém da D&B
// falando, com a trilha baixinha por baixo da fala). Sempre com legenda por
// cima (muita gente assiste sem som), cortada para 1080x1920.
//
// Uso: node scripts/instagram-kit/acao.mjs [--date AAAA-MM-DD] [--out pasta] [--upload]
//        [--intro arquivo | --no-intro] [--intro-text "legenda"]

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";
import { renderSlides, renderReels, downloadMusic, REELS_MUSIC } from "./build.mjs";
import { rankingReelsPage, rankingCarousel, rankingStories, introOverlay, ACAO_SECONDS, ACAO_COVER_SECONDS, PRICE_CAP } from "./templates-acao.mjs";
import { ROOT, loadEnvLocal, uploadWeek } from "./storage.mjs";

const ENERGY_PRICE = 0.9; // R$/kWh, igual ao build.mjs e ao simulador do site
const FUEL_PRICE = 6.0;
const GAS_KM_L = 12;
const SIGN = "D&B Corretora de Seguros · Águas Claras, Brasília";
const TAGS = "#carroeletrico #carroseletricos #veiculoeletrico #seguroauto #brasilia #aguasclaras #DBCorretora";
const INTRO_TEXT = "Dá pra ter carro elétrico por menos de R$&nbsp;150&nbsp;mil?";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const cost = (car) => ({ evPer1000: Math.round(10 * car.consumptionKwh100 * ENERGY_PRICE) });

// Versões do mesmo modelo (GL/GS, Pro/Max...) contam uma vez só.
const VARIANT = /\s+(GL|GS|GLS|Pro|Max|Plus|Premium|Elite|Luxury|Comfort|Standard|Advanced)\b.*$/i;
const modelKey = (car) => `${car.brand}|${car.name.replace(VARIANT, "").toLowerCase()}`;

export function affordableEvs(cars, n = 5, cap = PRICE_CAP) {
  const seen = new Set();
  const out = [];
  for (const car of cars
    .filter((c) => c.fuelType === "BEV" && c.price && c.price <= cap && c.rangeKm && c.consumptionKwh100)
    .sort((a, b) => a.price - b.price)) {
    const key = modelKey(car);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(car);
    if (out.length === n) break;
  }
  return out;
}

function captions(top, verifiedLabel) {
  const susep = process.env.SUSEP_REGISTRO ? `\n${process.env.SUSEP_REGISTRO}` : "";
  const gas = Math.round((1000 / GAS_KM_L) * FUEL_PRICE);
  const list = [...top].reverse().map((c, i) => `${i + 1}. ${c.name}: R$ ${c.price.toLocaleString("pt-BR")} · ${c.rangeKm} km de autonomia · R$ ${cost(c).evPer1000} de energia a cada 1.000 km`).join("\n");
  const tail = `\n\nE o seguro? Cote em 8 seguradoras de uma vez, pelo celular, a qualquer hora 👉 link na bio.\nSiga {{perfil}}: toda semana tem carro elétrico analisado e dica para pagar menos no seguro.\n\nPreços de tabela verificados em ${verifiedLabel} (podem mudar); autonomia e consumo INMETRO. Energia a R$ 0,90/kWh; gasolina a R$ 6,00/l, 12 km/l.\n${SIGN}${susep}\n\n${TAGS}`;
  return {
    reels: `5 carros elétricos até R$ 150 mil ⚡ e quanto custa rodar com cada um.

${list}

Com gasolina, 1.000 km saem por uns R$ ${gas}.

💬 Qual desses você levaria? Comenta o número.
📲 Manda pra quem está pensando em trocar de carro.${tail}`,
    carousel: `5 carros elétricos até R$ 150 mil 🔋 Arrasta para ver preço, autonomia e quanto custa rodar com cada um.

💬 Faltou algum? Conta aqui que a gente analisa.
📌 Salve para consultar quando for trocar de carro.${tail}`,
  };
}

// Abertura padrão (sem --intro): cenas reais da Pixabay (licença livre para
// uso comercial; nenhuma marcada como gerada por IA), baixadas na hora, como
// a trilha: a licença não permite redistribuir o arquivo solto no repositório.
const STOCK_CLIPS = [
  { page: "https://pixabay.com/videos/charging-plug-e-auto-electric-car-200682/", url: "https://cdn.pixabay.com/video/2024/02/15/200682-913478723_large.mp4", start: 3, dur: 2 },
  { page: "https://pixabay.com/videos/woman-phone-smartphone-technology-38084/", url: "https://cdn.pixabay.com/video/2020/05/04/38084-416330724_large.mp4", start: 1, dur: 2 },
];

const ffmpeg = () => process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = () => process.env.FFPROBE_PATH || (process.env.FFMPEG_PATH ? process.env.FFMPEG_PATH.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1") : "ffprobe");

function duration(file) {
  return Number(execFileSync(ffprobe(), ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]).toString().trim());
}

function hasAudio(file) {
  return execFileSync(ffprobe(), ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file]).toString().trim() !== "";
}

// Abertura (rosto + legenda) + animação, numa peça só. A fala fica na frente
// e a trilha entra baixinha por baixo dela, subindo quando começa a animação.
// Baixa as cenas e junta numa abertura vertical muda, com zoom lento.
async function stockIntro(dir) {
  const parts = [];
  try {
    for (const [i, clip] of STOCK_CLIPS.entries()) {
      const raw = path.join(dir, `cena-${i}.mp4`);
      // A CDN às vezes corta a conexão no meio de arquivos grandes: tenta 3x.
      for (let attempt = 1; ; attempt++) {
        try {
          const res = await fetch(clip.url, { headers: { "User-Agent": "Mozilla/5.0", Referer: clip.page } });
          if (!res.ok) throw new Error(`HTTP ${res.status} em ${clip.page}`);
          fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
          break;
        } catch (error) {
          if (attempt >= 3) throw error;
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
      parts.push({ raw, ...clip });
    }
  } catch (error) {
    console.error(`Cenas da abertura indisponíveis (${error.message}); o Reels começa direto na animação.`);
    for (const i of STOCK_CLIPS.keys()) fs.rmSync(path.join(dir, `cena-${i}.mp4`), { force: true });
    return null;
  }
  const out = path.join(dir, "abertura.mp4");
  const inputs = parts.flatMap((p) => ["-ss", String(p.start), "-t", String(p.dur), "-i", p.raw]);
  const chains = parts.map((p, i) => `[${i}:v]fps=30,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,`
    + `zoompan=z='1+0.06*on/${Math.round(p.dur * 30)}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1,format=yuv420p[c${i}]`);
  const filter = `${chains.join(";")};${parts.map((_, i) => `[c${i}]`).join("")}concat=n=${parts.length}:v=1:a=0[v]`;
  execFileSync(ffmpeg(), ["-y", "-loglevel", "error", ...inputs, "-filter_complex", filter, "-map", "[v]", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", out]);
  for (const p of parts) fs.rmSync(p.raw, { force: true });
  return out;
}

function composeWithIntro({ intro, overlay, anim, music, out }) {
  const d = Math.min(duration(intro), 10);
  const total = d + ACAO_SECONDS;
  const speech = hasAudio(intro);
  const inputs = ["-t", String(d), "-i", intro, "-loop", "1", "-t", String(d), "-i", overlay, "-i", anim];
  if (music) inputs.push("-t", String(total), "-i", music);
  const v = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p[iv];`
    + `[iv][1:v]overlay=0:0:shortest=1,format=yuv420p[ivo];[2:v]fps=30,setsar=1,format=yuv420p[av];[ivo][av]concat=n=2:v=1:a=0[v]`;
  const a = [];
  if (speech) a.push(`[0:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5,apad=whole_dur=${total}[sp]`);
  if (music) a.push(`[3:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5,${speech ? `volume='if(lt(t,${d}),0.12,1)':eval=frame,` : ""}afade=t=out:st=${total - 1.5}:d=1.5[mu]`);
  if (speech && music) a.push(`[sp][mu]amix=inputs=2:duration=longest:normalize=0[a]`);
  else if (speech) a.push(`[sp]anull[a]`);
  else if (music) a.push(`[mu]anull[a]`);
  const filter = [v, ...a].join(";");
  execFileSync(ffmpeg(), [
    "-y", "-loglevel", "error", ...inputs, "-filter_complex", filter, "-map", "[v]", ...(a.length ? ["-map", "[a]", "-c:a", "aac", "-b:a", "160k", "-ar", "44100"] : []),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-t", String(total), "-movflags", "+faststart", out,
  ]);
  return d;
}

async function main() {
  loadEnvLocal();
  const date = arg("date", new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10));
  const kitId = `acao-${date}`;
  const outDir = path.resolve(arg("out", path.join(ROOT, "instagram-kit-out")), kitId);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const reelsDir = path.join(outDir, "1-reels");
  fs.mkdirSync(reelsDir, { recursive: true });
  const intro = arg("intro") && fs.existsSync(arg("intro")) ? path.resolve(arg("intro")) : arg("no-intro") ? null : await stockIntro(reelsDir);

  const cars = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "carsFallback.json"), "utf8"));
  const top = affordableEvs(cars);
  if (top.length < 5) throw new Error(`Só ${top.length} elétricos até R$ ${PRICE_CAP} no catálogo.`);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const toSortable = (d) => (d ? d.split("/").reverse().join("-") : "");
  const verified = top.map((c) => c.priceVerifiedDate).filter(Boolean).sort((a, b) => toSortable(a).localeCompare(toSortable(b))).pop() || "";
  const [, mm, yyyy] = verified.split("/");
  const verifiedLabel = mm ? `${months[Number(mm) - 1]}/${yyyy}` : "data recente";
  const logo = (file) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "public", "brand", file)).toString("base64")}`;
  const kit = {
    logoGold: logo("db-corretora-logo.png"), logoNavy: logo("db-corretora-logo-navy.png"), signature: SIGN,
    energyPrice: ENERGY_PRICE, fuelPrice: FUEL_PRICE, gasPer1000: Math.round((1000 / GAS_KM_L) * FUEL_PRICE), verifiedLabel,
  };
  console.log(`Ação ${date} · ${top.map((c) => `${c.name} (${c.price})`).join(", ")} · abertura: ${intro ? path.basename(intro) : "sem rosto"}`);

  const caps = captions(top, verifiedLabel);
  const music = await downloadMusic(REELS_MUSIC[2], outDir);
  const browser = await chromium.launch({ channel: "chrome" });
  let video, cover, carousel, stories, overlay;
  try {
    // Sem abertura, a trilha entra direto; com abertura, a animação sai muda
    // e a montagem final junta tudo.
    [video, cover] = await renderReels(browser, rankingReelsPage(top, cost, kit), reelsDir, intro ? null : music, { seconds: ACAO_SECONDS, coverSeconds: ACAO_COVER_SECONDS });
    if (intro) {
      const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
      await p.setContent(introOverlay(kit, arg("intro-text", INTRO_TEXT)), { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready);
      overlay = path.join(reelsDir, "legenda.png");
      await p.screenshot({ path: overlay, omitBackground: true });
      await p.close();
    }
    carousel = await renderSlides(browser, rankingCarousel(top, cost, kit), path.join(outDir, "2-carrossel"));
    stories = await renderSlides(browser, rankingStories(top, kit), path.join(outDir, "stories"), { height: 1920, names: ["rank.jpg", "rank2.jpg"] });
  } finally {
    await browser.close();
  }

  if (intro) {
    const anim = path.join(reelsDir, "animacao.mp4");
    fs.renameSync(video, anim);
    const d = composeWithIntro({ intro, overlay, anim, music, out: video });
    fs.rmSync(overlay, { force: true });
    fs.rmSync(anim, { force: true });
    if (intro.startsWith(reelsDir)) fs.rmSync(intro, { force: true });
    if (music) fs.rmSync(music, { force: true });
    console.log(`Abertura de ${d.toFixed(1)} s + animação de ${ACAO_SECONDS} s`);
  }

  const rel = (f) => path.relative(outDir, f).split(path.sep).join("/");
  const manifest = {
    week: kitId, special: true, theme: "eletricos-ate-150-mil", generatedAt: new Date().toISOString(), cars: top.map((c) => c.id), intro: Boolean(intro),
    posts: {
      rank: { type: "reels", video: rel(video), cover: rel(cover), caption: caps.reels, story: rel(stories[0]) },
      rank2: { type: "carousel", media: carousel.map(rel), caption: caps.carousel, story: rel(stories[1]) },
    },
  };
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(outDir, "legendas.md"), `# Ação ${date}\n\n## Reels\n\n${caps.reels}\n\n---\n\n## Carrossel\n\n${caps.carousel}\n`);
  console.log(`Ação salva em ${outDir}`);

  if (arg("upload")) {
    await uploadWeek(kitId, outDir);
    console.log(`Enviado ao Supabase Storage (${kitId}/)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
