// Kit semanal de Instagram (seguro auto) da D&B. O objetivo é contratação de
// seguro: mostrar que cotar online é mais prático e rápido que ligar e
// esperar. O catálogo do Escolha seu EV entra como gancho (carro da semana).
//   - segunda: carrossel "Seguro em minutos" (tema em rodízio, QUOTE_THEMES)
//   - quarta:  Reels "Seguro do <carro>? Ainda vai ligar e esperar?"
//   - sexta:   carrossel "Carro da semana", com a chamada para cotar
// Cada post leva um link marcado (UTM) para os Stories, e o relatório semanal
// de cotações mostra qual post trouxe cada cotação.
//
// Gera PNG (1080x1350) e MP4 (1080x1920) e, com --email, manda tudo para
// KIT_EMAILS pelo SMTP da D&B (api/_lib/mailer.js). Ninguém publica sozinho:
// a equipe revisa e agenda no Meta Business Suite.
//
// Uso: node scripts/instagram-kit/build.mjs [--out pasta] [--week AAAA-MM-DD] [--email] [--no-video]
// Requer Google Chrome instalado (playwright-core, channel "chrome") e ffmpeg
// (ou FFMPEG_PATH) para o Reels. No GitHub Actions os dois já vêm no runner.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import {
  weekCarSlides, quoteSlides, reelsPage, QUOTE_THEMES, REELS_SECONDS, REELS_COVER_SECONDS, INSURERS, brl, num, price,
} from "./templates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");

const ENERGY_PRICE = 0.9; // R$/kWh, o mesmo padrão do simulador do site
const FUEL_PRICE = 6.0; // R$/l
const GAS_KM_L = 12; // carro a gasolina de referência
const MAX_CAR_PRICE = 230000; // carro da semana: só até R$ 230 mil (populares e médios)
const COTACAO_URL = "https://ev.dbcorr.com.br/cotacao";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

// Segunda-feira da semana (horário de Brasília) que o kit cobre.
function weekMonday(input) {
  const base = input ? new Date(`${input}T12:00:00-03:00`) : new Date(Date.now() - 3 * 3600 * 1000);
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

const iso = (d) => d.toISOString().slice(0, 10);
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

const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const tag = (s) => `#${s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "")}`;
// A campanha leva a data da segunda, para o relatório separar as semanas.
const utm = (medium, campaign) => `${COTACAO_URL}?utm_source=instagram&utm_medium=${medium}&utm_campaign=${campaign}`;

const QUOTE_CAPTIONS = {
  "jeito-antigo": `Ainda liga para pedir cotação de seguro e fica esperando o retorno? 📞⏳

Na D&B você cota online, a qualquer hora: preenche uma vez, 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem na tela em poucos minutos.

Você compara preço, franquia e cobertura, escolhe o plano e a forma de pagamento. A gente fala com você só para fechar.`,
  apolice: `Já tem seguro auto? Então você já tem quase tudo para comparar. 📄

Na cotação online da D&B, envie o PDF da sua apólice atual (o que a seguradora mandou por e-mail ou está no app dela). O formulário é preenchido com o carro, os dados do condutor, a seguradora, o vencimento e a classe de bônus. Você só confere e completa o que faltar.

Aí 8 seguradoras calculam ao mesmo tempo e você vê, antes de renovar, se dá para pagar menos ou ter uma cobertura melhor.

🔒 O arquivo é lido no seu próprio aparelho e não é enviado para ninguém. Se preferir, é só preencher à mão.`,
  "tres-passos": `Seguro auto em 3 passos, sem ligação e sem esperar retorno:

1️⃣ Preencha os dados do carro e do condutor
2️⃣ Compare as ofertas de 8 seguradoras na tela
3️⃣ Escolha o plano e a forma de pagamento. A D&B fala com você em até 1 dia útil só para concluir.`,
  "oito-seguradoras": `8 seguradoras. Uma cotação. 🛡️

${INSURERS.join(", ")}: todas calculam o seu seguro ao mesmo tempo, e você vê preço, franquia e cobertura lado a lado.

Sem ligar para cada uma, sem esperar ninguém.`,
  renovacao: `Seu seguro vence nos próximos 60 dias? 📅

Antes de aceitar a renovação, cote em 8 seguradoras de uma vez e compare. Se tiver o PDF da apólice atual, envie na cotação: ele já preenche quase tudo.

É online, a qualquer hora, e leva poucos minutos.`,
  "carro-novo": `Vai buscar o carro novo? 🚗🔑

Cote o seguro antes da entrega: com o modelo e o ano, 8 seguradoras calculam na hora e você escolhe o plano. A D&B conclui a contratação com você.`,
};

function captions({ weekCar, theme, cost, monday, signature }) {
  const wed = addDays(monday, 2);
  const fri = addDays(monday, 4);
  const week = iso(monday);
  const base = ["#seguroauto", "#seguro", "#cotacaodeseguro", "#brasilia", "#aguasclaras", "#df", "#corretoradeseguros", "#DBCorretora"];
  const susep = process.env.SUSEP_REGISTRO ? `\n${process.env.SUSEP_REGISTRO}` : "";
  const sign = `\n\n${signature}${susep}`;
  const model = weekCar.name;

  return [
    {
      day: `Segunda ${brDay(monday)}`, kind: `Carrossel · Seguro em minutos (${theme.id})`, folder: "1-seguro-em-minutos",
      caption: `${QUOTE_CAPTIONS[theme.id]}

👉 Link na bio para cotar.${sign}

${base.join(" ")}`,
      stories: [
        theme.id === "apolice"
          ? `Enquete: "Você compara antes de renovar o seguro?" (Sempre / Renovo direto)`
          : `Enquete: "Como você cotou seu último seguro?" (Ligando / Online)`,
        `Figurinha de link "Cotar seguro" → ${utm("stories", `${theme.id}-${week}`)}`,
      ],
    },
    {
      day: `Quarta ${brDay(wed)}`, kind: "Reels · Ainda vai ligar e esperar?", folder: "2-reels",
      caption: `Seguro do ${model}? Não precisa ligar e esperar. ⚡

Na D&B você cota online: 8 seguradoras calculam ao mesmo tempo (${INSURERS.join(", ")}) e as ofertas aparecem na tela em poucos minutos. Você escolhe, e a gente fala com você só para fechar.

Vale para qualquer carro. Link na bio.${sign}

${[...base, "#reels", tag(weekCar.brand)].join(" ")}`,
      stories: [
        `Repostar o Reels com a figurinha de link → ${utm("stories", `reels-${week}`)}`,
        `Caixa de perguntas: "Qual a sua dúvida sobre seguro auto?"`,
      ],
      note: "Ao publicar, escolha uma música do próprio Instagram (o vídeo sai sem áudio) e use capa.jpg como capa.",
    },
    {
      day: `Sexta ${brDay(fri)}`, kind: "Carrossel · Carro da semana", folder: "3-carro-da-semana",
      caption: `Carro da semana: ${model} 🔋

${num(weekCar.rangeKm)} km de autonomia (INMETRO) por ${brl(weekCar.price)}. A cada 1.000 km, a energia sai por cerca de ${brl(cost.evPer1000)}, contra ${brl(cost.gasPer1000)} de um carro a gasolina de ${GAS_KM_L} km/l.${cost.maintTotal ? ` As revisões somam ${brl(cost.maintTotal)} até ${num(cost.maintKm / 1000)} mil km.` : ""}

E o seguro? Cote em 8 seguradoras de uma vez, em poucos minutos, e fale com a D&B só para fechar. Link na bio.

Estimativa com energia a R$ ${price(ENERGY_PRICE)}/kWh e gasolina a R$ ${price(FUEL_PRICE)}/l.${sign}

${[...base, "#carroeletrico", tag(weekCar.brand), "#carrodasemana"].join(" ")}`,
      stories: [
        `Enquete: "${model}: compraria?" (Sim / Talvez / Não)`,
        `Figurinha de link "Cotar seguro" → ${utm("stories", `carro-da-semana-${slug(weekCar.id)}-${week}`)}`,
      ],
    },
  ];
}

async function renderSlides(browser, htmls, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const files = [];
  for (const [i, html] of htmls.entries()) {
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const file = path.join(dir, `${String(i + 1).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    files.push(file);
  }
  await page.close();
  return files;
}

async function renderReels(browser, html, dir) {
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

  const out = path.join(dir, "reels.mp4");
  execFileSync(process.env.FFMPEG_PATH || "ffmpeg", [
    "-y", "-loglevel", "error", "-framerate", String(fps), "-i", path.join(framesDir, "%04d.jpg"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out,
  ]);
  const cover = path.join(dir, "capa.jpg");
  fs.copyFileSync(path.join(framesDir, `${String(Math.round(REELS_COVER_SECONDS * fps)).padStart(4, "0")}.jpg`), cover);
  fs.rmSync(framesDir, { recursive: true, force: true });
  return [out, cover];
}

function emailHtml(posts, { weekCar, theme, monday }) {
  const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F33;max-width:640px">
    <h2 style="margin:0 0 4px">Kit de Instagram da semana: seguro auto</h2>
    <p style="margin:0 0 16px;color:#555">Semana de ${brDay(monday)} · Tema: <strong>${e(theme.title)}</strong> · Carro da semana: <strong>${e(weekCar.name)}</strong></p>
    <p>As peças estão em anexo, com o número do post no nome do arquivo. Revise os textos, agende no Meta Business Suite
      (Instagram e Facebook) e use nos Stories os links abaixo: eles já vêm marcados, e o relatório de cotações mostra
      qual post trouxe cada uma.</p>
    ${posts.map((p) => `
      <div style="border:1px solid #DDE3EA;border-radius:8px;padding:12px 14px;margin:0 0 14px">
        <div style="font-weight:bold;margin:0 0 8px">${e(p.day)} · ${e(p.kind)}</div>
        <div style="color:#555;margin:0 0 6px">Legenda:</div>
        <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;background:#F7F7F5;border-radius:6px;padding:10px;margin:0 0 10px">${e(p.caption)}</pre>
        <div style="color:#555;margin:0 0 4px">Stories do dia:</div>
        <ul style="margin:0;padding-left:18px">${p.stories.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
        ${p.note ? `<p style="color:#9A5B00;margin:8px 0 0">${e(p.note)}</p>` : ""}
      </div>`).join("")}
    <p style="color:#555;font-size:12px">Gerado automaticamente toda segunda. Os números do carro da semana vêm do catálogo do
      Escolha seu EV (INMETRO e planos de revisão das marcas); confira antes de publicar se algo parecer estranho.</p>
  </div>`;
}

async function main() {
  loadEnvLocal();
  const monday = weekMonday(arg("week"));
  const weekIndex = Math.floor(monday.getTime() / (7 * 24 * 3600 * 1000));
  const outDir = path.resolve(arg("out", path.join(ROOT, "instagram-kit-out")), iso(monday));
  const cars = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "carsFallback.json"), "utf8"));
  const weekCar = pickWeekCar(cars, weekIndex);
  const theme = QUOTE_THEMES[weekIndex % QUOTE_THEMES.length];
  const cost = costOf(weekCar);

  const logo = (file) => `data:image/png;base64,${fs.readFileSync(path.join(ROOT, "public", "brand", file)).toString("base64")}`;
  const signature = "D&B Corretora de Seguros · Águas Claras, Brasília";
  const kit = { logoGold: logo("db-corretora-logo.png"), logoNavy: logo("db-corretora-logo-navy.png"), energyPrice: ENERGY_PRICE, fuelPrice: FUEL_PRICE, signature };
  const posts = captions({ weekCar, theme, cost, monday, signature });

  console.log(`Semana ${iso(monday)} · tema: ${theme.id} · carro da semana: ${weekCar.name}`);
  fs.rmSync(outDir, { recursive: true, force: true });
  const browser = await chromium.launch({ channel: "chrome" });
  const files = [];
  try {
    files.push(...(await renderSlides(browser, quoteSlides(theme, kit), path.join(outDir, posts[0].folder))));
    if (!arg("no-video")) files.push(...(await renderReels(browser, reelsPage(weekCar, kit), path.join(outDir, posts[1].folder))));
    files.push(...(await renderSlides(browser, weekCarSlides(weekCar, cost, kit), path.join(outDir, posts[2].folder))));
  } finally {
    await browser.close();
  }

  const text = posts.map((p) => `## ${p.day} · ${p.kind}\n\n${p.caption}\n\nStories:\n${p.stories.map((s) => `- ${s}`).join("\n")}${p.note ? `\n\n${p.note}` : ""}`).join("\n\n---\n\n");
  const captionsFile = path.join(outDir, "legendas.md");
  fs.writeFileSync(captionsFile, text);
  console.log(`Kit salvo em ${outDir}`);

  if (arg("email")) {
    const to = (process.env.KIT_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!to.length) throw new Error("KIT_EMAILS não configurado.");
    const { sendEmail } = await import("../../api/_lib/mailer.js");
    await sendEmail({
      to: to.join(", "),
      subject: `Instagram da semana (${brDay(monday)}): ${theme.title}`,
      html: emailHtml(posts, { weekCar, theme, monday }),
      attachments: [...files, captionsFile].map((file) => ({
        filename: path.relative(outDir, file).replace(/[\\/]/g, "_"),
        path: file,
      })),
    });
    console.log(`E-mail enviado para ${to.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
