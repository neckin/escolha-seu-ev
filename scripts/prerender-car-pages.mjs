#!/usr/bin/env node
/**
 * Gera uma página HTML por carro em dist/carro/<id>/index.html, depois do
 * `vite build`, mais dist/sitemap.xml e dist/robots.txt.
 *
 * O app é uma SPA: sem isso, todo endereço /carro/<id> devolveria o mesmo
 * index.html com o título "Escolha seu EV", e o Google e as prévias de link
 * (WhatsApp, redes) não teriam como saber de que carro se trata. Cada página
 * gerada é o próprio index.html do build com <title>, descrição, Open Graph,
 * dados estruturados (schema.org/Car) e um resumo em texto dentro do #root.
 * Quando o JavaScript carrega, o React substitui esse resumo pela página
 * interativa (createRoot, sem hidratação, então não há conflito).
 *
 * Fonte dos dados: src/carsFallback.json, o snapshot do Supabase que já vai
 * junto com o código. Carro cadastrado no banco depois do último snapshot
 * continua funcionando (o vercel.json manda /carro/* pro index.html), só sem
 * título próprio até o próximo build.
 *
 * Uso: node scripts/prerender-car-pages.mjs  (roda sozinho no `npm run build`)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const SITE_URL = "https://escolha-seu-ev.vercel.app";

const cars = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "carsFallback.json"), "utf8"));
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (v) => (v == null ? null : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }));
const br = (n) => String(n).replace(".", ",");
const FUEL = { BEV: "100% elétrico", PHEV: "híbrido plug-in", HEV: "híbrido" };
const SCHEMA_FUEL = { BEV: "Electric", PHEV: "Plug-in hybrid electric", HEV: "Hybrid electric" };

function facts(c) {
  const out = [];
  if (c.fuelType === "BEV" && c.rangeKm) out.push(`autonomia de ${c.rangeKm} km (INMETRO)`);
  if (c.fuelType === "PHEV" && c.electricRangeKm) out.push(`${c.electricRangeKm} km no modo elétrico (INMETRO)`);
  if (c.fuelType !== "HEV" && c.consumptionKwh100) out.push(`consumo de ${br(c.consumptionKwh100)} kWh/100km`);
  if (c.fuelKmL) out.push(`${br(c.fuelKmL)} km/l${c.fuelType === "PHEV" ? " no modo híbrido" : ""}`);
  if (c.powerCv) out.push(`${c.powerCv} cv`);
  return out;
}

function description(c) {
  const price = money(c.price);
  const head = `${c.name}: ${FUEL[c.fuelType]}, ${c.category.toLowerCase()}${price ? `, por ${price}` : ""}.`;
  const f = facts(c);
  return `${head}${f.length ? ` ${f.slice(0, 3).join(", ").replace(/^./, (m) => m.toUpperCase())}.` : ""} Veja quanto custa por mês pra você e compare.`;
}

function jsonLd(c, url) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: c.name,
    brand: { "@type": "Brand", name: c.brand },
    url,
    ...(c.imageUrl ? { image: c.imageUrl } : {}),
    fuelType: SCHEMA_FUEL[c.fuelType],
    ...(c.price ? { offers: { "@type": "Offer", price: c.price, priceCurrency: "BRL", availability: "https://schema.org/InStock" } } : {}),
  };
  // "</" dentro de um <script> fecharia a tag antes da hora
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function staticBody(c, d) {
  const rows = [
    ["Preço", money(c.price)],
    ["Tipo", FUEL[c.fuelType]],
    ["Categoria", c.category],
    ["Potência", c.powerCv && `${c.powerCv} cv`],
    ["Autonomia", c.fuelType === "BEV" && c.rangeKm && `${c.rangeKm} km (INMETRO)`],
    ["Autonomia elétrica", c.electricRangeKm && `${c.electricRangeKm} km (INMETRO)`],
    ["Consumo", c.fuelType !== "HEV" && c.consumptionKwh100 && `${br(c.consumptionKwh100)} kWh/100km`],
    ["Consumo de gasolina", c.fuelKmL && `${br(c.fuelKmL)} km/l`],
    ["Bateria", c.batteryKwh && `${br(c.batteryKwh)} kWh`],
    ["0–100 km/h", c.accel && `${br(c.accel)} s`],
    ["Porta-malas", c.trunkL && `${c.trunkL} L`],
    ["Garantia", c.warranty],
  ].filter(([, v]) => v);
  return `<main style="max-width:1100px;margin:0 auto;padding:24px 16px;font-family:Inter,system-ui,sans-serif;color:#0B1F33">
<p><a href="/">Todos os carros</a></p>
<h1>${esc(c.name)}</h1>
<p>${esc(d)}</p>
<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
${c.techNotes ? `<p>${esc(c.techNotes)}</p>` : ""}
</main>`;
}

function render(c) {
  const url = `${SITE_URL}/carro/${c.id}`;
  const title = `${c.name}: preço, autonomia e custo mensal | Escolha seu EV`;
  const d = description(c);
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(d)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Escolha seu EV" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(`${c.name} | Escolha seu EV`)}" />`,
    `<meta property="og:description" content="${esc(d)}" />`,
    `<meta property="og:url" content="${url}" />`,
    c.imageUrl ? `<meta property="og:image" content="${esc(c.imageUrl)}" />` : "",
    `<meta name="twitter:card" content="${c.imageUrl ? "summary_large_image" : "summary"}" />`,
    `<script type="application/ld+json">${jsonLd(c, url)}</script>`,
  ].filter(Boolean).join("\n    ");

  // tira o título e as tags genéricas da home antes de pôr as do carro
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/\s*<meta name="description"[^>]*>/, "")
    .replace(/\s*<link rel="canonical"[^>]*>/, "")
    .replace(/\s*<meta property="og:[^>]*>/g, "")
    .replace(/\s*<meta name="twitter:[^>]*>/g, "");
  html = html.replace("</head>", `    ${head}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${staticBody(c, d)}</div>`);
  return html;
}

let n = 0;
for (const c of cars) {
  if (!/^[a-z0-9-]+$/i.test(c.id)) { console.warn(`id fora do padrão, pulado: ${c.id}`); continue; }
  const dir = path.join(DIST, "carro", c.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), render(c));
  n++;
}

const today = new Date().toISOString().slice(0, 10);
const urls = [`${SITE_URL}/`, ...cars.map((c) => `${SITE_URL}/carro/${c.id}`)];
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`
);
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /cotacao\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Páginas de carro geradas: ${n} (+ sitemap.xml com ${urls.length} endereços, robots.txt)`);
