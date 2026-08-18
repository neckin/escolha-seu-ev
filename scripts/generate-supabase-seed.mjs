#!/usr/bin/env node
/**
 * Gera o SQL de sincronização da tabela `cars` no Supabase, a partir dos
 * dados que já estão em src/App.jsx (SEED_CARS_DETAILED + BULK_CARS).
 *
 * O código (src/App.jsx) continua sendo a fonte "oficial" dos dados —
 * cada correção/adição de carro é feita ali, com fonte citada no commit,
 * do jeito que já vínhamos fazendo. Este script só extrai o resultado
 * final e gera um SQL de "upsert" pra rodar no SQL Editor do Supabase,
 * mantendo o banco sincronizado com o que está no git.
 *
 * Uso: node scripts/generate-supabase-seed.mjs > supabase/seed-cars.sql
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(__dirname, "..", "src", "App.jsx");
const src = fs.readFileSync(appPath, "utf8");

// Extrai só o trecho puro de dados/funções auxiliares (sem JSX/React),
// de "function custoScore" até a linha que monta SEED_CARS.
const startMarker = "function custoScore(price) {";
const endMarker = "const SEED_CARS = [...SEED_CARS_DETAILED, ...BULK_CARS];";
const startIdx = src.indexOf(startMarker);
const endIdx = src.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1) {
  console.error("Não achei os marcadores esperados em App.jsx — o arquivo mudou de estrutura?");
  process.exit(1);
}
// `const`/`let` de nível superior não viram propriedade do sandbox no vm do
// Node — só existem dentro do próprio script. Por isso anexamos essa linha
// extra pra conseguir ler o resultado depois de rodar.
const dataBlock = src.slice(startIdx, endIdx + endMarker.length) + "\nglobalThis.__EXTRACTED_CARS__ = SEED_CARS;";

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(dataBlock, sandbox);
const cars = sandbox.__EXTRACTED_CARS__;

if (!Array.isArray(cars) || cars.length === 0) {
  console.error("SEED_CARS veio vazio — algo deu errado na extração.");
  process.exit(1);
}

const esc = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v) => (v == null ? "NULL" : Number(v));
const bool = (v) => (v == null ? "NULL" : v ? "true" : "false");
const jsonb = (v) => (v == null ? "NULL" : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`);

const cols = [
  "id", "name", "brand", "category", "price", "power_cv", "torque_nm",
  "battery_kwh", "battery_chem", "motor_type", "range_km", "accel",
  "ground_clearance", "trunk_l", "weight_kg", "wallbox", "ac_kw", "dc_kw",
  "airbags", "warranty", "fuel_type", "verified", "price_verified_date",
  "maintenance_interval", "maintenance_first_cost", "maintenance_km_base",
  "maintenance_total_cost", "consumption_kwh_100", "tech_notes",
  "image_url", "video_url", "personas",
];

const lines = [];
lines.push("-- Gerado automaticamente por scripts/generate-supabase-seed.mjs — não editar à mão.");
lines.push(`-- ${cars.length} carros extraídos de src/App.jsx em ${new Date().toISOString().slice(0, 10)}.`);
lines.push("-- Roda no SQL Editor do Supabase. É um upsert: atualiza quem já existe (por id) e insere quem é novo.");
lines.push("-- Não apaga carros removidos do código — se um carro sumir de App.jsx, remova a linha manualmente no Supabase.");
lines.push("");
lines.push(`insert into cars (${cols.join(", ")})`);
lines.push("values");

const rows = cars.map((c) => {
  const vals = [
    esc(c.id), esc(c.name), esc(c.brand), esc(c.category), num(c.price),
    num(c.powerCv), num(c.torqueNm), num(c.batteryKwh), esc(c.batteryChem),
    esc(c.motorType), num(c.rangeKm), num(c.accel), num(c.groundClearance),
    num(c.trunkL), num(c.weightKg), esc(c.wallbox), num(c.acKw), num(c.dcKw),
    num(c.airbags), esc(c.warranty), esc(c.fuelType), bool(c.verified),
    esc(c.priceVerifiedDate), esc(c.maintenanceInterval), esc(c.maintenanceFirstCost),
    num(c.maintenanceKmBase), num(c.maintenanceTotalCost), num(c.consumptionKwh100),
    esc(c.techNotes), esc(c.imageUrl), esc(c.videoUrl), jsonb(c.personas),
  ];
  return `  (${vals.join(", ")})`;
});
lines.push(rows.join(",\n"));
lines.push("on conflict (id) do update set");
lines.push(
  cols
    .filter((c) => c !== "id")
    .map((c) => `  ${c} = excluded.${c}`)
    .join(",\n")
);
lines.push(";");

console.log(lines.join("\n"));
