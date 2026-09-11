#!/usr/bin/env node
/**
 * Gera src/carsFallback.json a partir da tabela `cars` no Supabase.
 *
 * A partir da virada de arquitetura (set/2026), o Supabase é a fonte da
 * verdade do catálogo — não o código. Este arquivo é o fallback offline:
 * se o Supabase não estiver configurado (dev local sem .env) ou a consulta
 * falhar em produção, o app usa este JSON e não quebra. Ele é gerado, não
 * editado à mão — rode este script (ou deixe o workflow semanal rodar por
 * você) sempre que quiser atualizar o fallback com o que está aprovado no
 * banco.
 *
 * Precisa de leitura pública na tabela `cars` (a policy já existe em
 * supabase/schema.sql) — funciona com a mesma anon key que o app usa no
 * navegador, não precisa da service_role.
 *
 * Uso: node scripts/generate-fallback-snapshot.mjs
 * Env vars aceitas (a primeira disponível de cada par é usada):
 *   VITE_SUPABASE_URL / SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "src", "carsFallback.json");

// Carrega .env.local à mão (sem dependência extra) pra rodar local igual
// ao Vite carrega pro app.
function loadDotEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim();
  }
}
loadDotEnvLocal();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Faltou configurar o Supabase (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY, em .env.local ou nas env vars)."
  );
  process.exit(1);
}

// snake_case (banco) -> camelCase (formato que o app usa em runtime) —
// mesmo mapeamento da query que o App.jsx faz direto no navegador.
const COLUMNS =
  "id,name,brand,category,price," +
  "powerCv:power_cv,torqueNm:torque_nm,batteryKwh:battery_kwh,batteryChem:battery_chem," +
  "motorType:motor_type,rangeKm:range_km,accel,groundClearance:ground_clearance," +
  "trunkL:trunk_l,weightKg:weight_kg,wallbox,acKw:ac_kw,dcKw:dc_kw,airbags,warranty," +
  "fuelType:fuel_type,verified,priceVerifiedDate:price_verified_date," +
  "maintenanceInterval:maintenance_interval,maintenanceFirstCost:maintenance_first_cost," +
  "maintenanceKmBase:maintenance_km_base,maintenanceTotalCost:maintenance_total_cost," +
  "consumptionKwh100:consumption_kwh_100,techNotes:tech_notes," +
  "imageUrl:image_url,videoUrl:video_url,personas";

async function main() {
  const url = `${SUPABASE_URL}/rest/v1/cars?select=${encodeURIComponent(COLUMNS)}&order=name`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.error(`Erro ao consultar o Supabase: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const cars = await res.json();
  if (!Array.isArray(cars) || cars.length === 0) {
    console.error("A tabela `cars` voltou vazia — abortando pra não sobrescrever o fallback com nada.");
    process.exit(1);
  }

  const json = JSON.stringify(cars, null, 2) + "\n";
  fs.writeFileSync(OUT_PATH, json, "utf8");
  console.log(`Fallback gerado: ${cars.length} carros em src/carsFallback.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
