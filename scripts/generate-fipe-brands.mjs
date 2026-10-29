// Gera src/fipeBrands.js: os 3 primeiros dígitos do código FIPE → marca da
// Segfy. Muitas apólices escrevem só o modelo ("AION UT ELITE", "VERSA
// EXCLUSIVE 1.6"), sem a marca; com o FIPE dá para saber qual é.
//
// Consulta a model-list da Segfy de cada marca em alguns anos e anota os
// prefixos. Prefixo que aparece em mais de uma marca fica de fora.
// Rode de novo quando surgirem marcas novas:
//   node --env-file=.env.local scripts/generate-fipe-brands.mjs

import { writeFileSync } from "node:fs";
import { segfyRequest } from "../api/_lib/segfyClient.js";

const token = process.env.SEGFY_BROKER_TOKEN;
if (!token) throw new Error("SEGFY_BROKER_TOKEN não configurado (rode com --env-file=.env.local).");
const year = new Date().getFullYear();
const YEARS = [year + 1, year, year - 3, year - 7, year - 12];

const call = (path, data) => segfyRequest(`/api/vehicle/version/1.0/${path}`, { method: "POST", body: { config: { token }, data } });

const brands = (await call("brand-list", { vehicle_type: "car" })).data?.data || [];
const prefixes = new Map(); // "023" → Set de marcas
const jobs = brands.flatMap((b) => YEARS.map((y) => [b, y]));

async function worker() {
  while (jobs.length) {
    const [brand, y] = jobs.shift();
    try {
      const res = await call("model-list", { vehicle_type: "car", model_year: y, brand_id: brand.id, brand: brand.value });
      for (const m of res.data?.data?.models || res.data?.models || []) {
        const p = /^(\d{3})\d{3}-?\d$/.exec(m.data_fipe?.fipe_code || "")?.[1];
        if (!p) continue;
        if (!prefixes.has(p)) prefixes.set(p, new Set());
        prefixes.get(p).add(brand.value);
      }
    } catch (error) {
      console.error(brand.value, y, error.message);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const map = Object.fromEntries(
  [...prefixes].filter(([, set]) => set.size === 1).map(([p, set]) => [p, [...set][0]]).sort(([a], [b]) => a.localeCompare(b))
);
const ambiguous = [...prefixes].filter(([, set]) => set.size > 1).map(([p, set]) => `${p}: ${[...set].join(", ")}`);

writeFileSync(
  new URL("../src/fipeBrands.js", import.meta.url),
  `// Gerado por scripts/generate-fipe-brands.mjs em ${new Date().toISOString().slice(0, 10)}. Não edite à mão.\n` +
    `// Prefixo do código FIPE (3 dígitos) → marca da Segfy (campo \`value\` da brand-list).\n` +
    `export const FIPE_BRANDS = ${JSON.stringify(map, null, 2)};\n`
);
console.log(`${Object.keys(map).length} prefixos de ${brands.length} marcas.`, ambiguous.length ? `Ambíguos (fora): ${ambiguous.join(" | ")}` : "");
