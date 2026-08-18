#!/usr/bin/env node
/**
 * Gera o SQL de sincronização da tabela `cars` no Supabase, a partir dos
 * dados que já estão em src/App.jsx (SEED_CARS_DETAILED + BULK_CARS).
 *
 * Isso normalmente NÃO precisa ser rodado à mão — a GitHub Action
 * .github/workflows/sync-supabase.yml já sincroniza automaticamente a cada
 * push na main que mexe em src/App.jsx. Esse script aqui serve pra gerar o
 * SQL manualmente (debug, revisão antes de aplicar, ou rodar fora da CI).
 *
 * Uso: node scripts/generate-supabase-seed.mjs > supabase/seed-cars.sql
 */
import { extractSeedCars, carToRow } from "./lib/extract-seed-cars.mjs";

const cars = extractSeedCars();

const TEXT = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const NUM = (v) => (v == null ? "NULL" : Number(v));
const BOOL = (v) => (v == null ? "NULL" : v ? "true" : "false");
const JSONB = (v) => (v == null ? "NULL" : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`);

// [nome da coluna, formatador] — explícito, pra não depender de adivinhar
// "isso parece número" (foi assim que um bug de tipo passou despercebido
// numa refatoração anterior: range_km virou string sem essa lista clara).
const COLUMNS = [
  ["id", TEXT], ["name", TEXT], ["brand", TEXT], ["category", TEXT], ["price", NUM],
  ["power_cv", NUM], ["torque_nm", NUM], ["battery_kwh", NUM], ["battery_chem", TEXT],
  ["motor_type", TEXT], ["range_km", NUM], ["accel", NUM], ["ground_clearance", NUM],
  ["trunk_l", NUM], ["weight_kg", NUM], ["wallbox", TEXT], ["ac_kw", NUM], ["dc_kw", NUM],
  ["airbags", NUM], ["warranty", TEXT], ["fuel_type", TEXT], ["verified", BOOL],
  ["price_verified_date", TEXT], ["maintenance_interval", TEXT], ["maintenance_first_cost", TEXT],
  ["maintenance_km_base", NUM], ["maintenance_total_cost", NUM], ["consumption_kwh_100", NUM],
  ["tech_notes", TEXT], ["image_url", TEXT], ["video_url", TEXT], ["personas", JSONB],
];

const lines = [];
lines.push("-- Gerado manualmente por scripts/generate-supabase-seed.mjs.");
lines.push(`-- ${cars.length} carros extraídos de src/App.jsx em ${new Date().toISOString().slice(0, 10)}.`);
lines.push("-- A sincronização normal é automática (GitHub Action) — isso aqui é só pra debug/revisão manual.");
lines.push("");
lines.push(`insert into cars (${COLUMNS.map(([col]) => col).join(", ")})`);
lines.push("values");

const rows = cars.map((c) => {
  const r = carToRow(c);
  const vals = COLUMNS.map(([col, fmt]) => fmt(r[col]));
  return `  (${vals.join(", ")})`;
});
lines.push(rows.join(",\n"));
lines.push("on conflict (id) do update set");
lines.push(
  COLUMNS.filter(([col]) => col !== "id")
    .map(([col]) => `  ${col} = excluded.${col}`)
    .join(",\n")
);
lines.push(";");

console.log(lines.join("\n"));
