// Peças do kit no Supabase Storage (bucket público "instagram-kit"). A API do
// Instagram não aceita upload direto: ela baixa a imagem/vídeo de uma URL
// pública. Cada semana fica em <AAAA-MM-DD da segunda>/, com o manifest.json
// (o que publicar em cada dia) e os marcadores published-<dia>.json (o que já
// foi publicado, para nunca repetir um post).
//
// Variáveis: SUPABASE_URL (ou VITE_SUPABASE_URL) e SUPABASE_SERVICE_ROLE_KEY.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.join(__dirname, "..", "..");
export const BUCKET = "instagram-kit";
// Imagens e vídeos saem depois de 3 semanas (já foram publicados); os JSON
// (manifest e marcadores) ficam, são o histórico que o insights.mjs usa.
const KEEP_MEDIA_WEEKS = 3;

export function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
}

// Segunda-feira da semana (horário de Brasília) que o kit cobre.
export function weekMonday(input) {
  const base = input ? new Date(`${input}T12:00:00-03:00`) : new Date(Date.now() - 3 * 3600 * 1000);
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

export const iso = (d) => d.toISOString().slice(0, 10);

function supabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL não configurado.");
  return url.replace(/\/$/, "");
}

let client = null;
function admin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado.");
  if (!client) client = createClient(supabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  return client;
}

export const publicUrl = (key) => `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${key}`;

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4", ".json": "application/json", ".md": "text/markdown" };

async function ensureBucket() {
  const sb = admin();
  const { data } = await sb.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await sb.storage.createBucket(BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
}

export async function putFile(key, body, contentType) {
  const { error } = await admin().storage.from(BUCKET).upload(key, body, { contentType, upsert: true, cacheControl: "60" });
  if (error) throw new Error(`Upload de ${key} falhou: ${error.message}`);
}

// Sobe a pasta da semana inteira e limpa a mídia de semanas antigas.
export async function uploadWeek(week, dir) {
  await ensureBucket();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const file of walk(dir)) {
    const rel = path.relative(dir, file).split(path.sep).join("/");
    await putFile(`${week}/${rel}`, fs.readFileSync(file), MIME[path.extname(file).toLowerCase()] || "application/octet-stream");
  }
  await pruneOldWeeks(week);
}

async function pruneOldWeeks(currentWeek) {
  const sb = admin();
  const { data: folders } = await sb.storage.from(BUCKET).list("", { limit: 1000 });
  const cutoff = new Date(`${currentWeek}T12:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - KEEP_MEDIA_WEEKS * 7);
  for (const f of folders || []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.name) || new Date(`${f.name}T12:00:00Z`) >= cutoff) continue;
    const keys = [];
    const collect = async (prefix) => {
      const { data } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000 });
      for (const item of data || []) {
        if (item.id) { if (!item.name.endsWith(".json")) keys.push(`${prefix}/${item.name}`); }
        else await collect(`${prefix}/${item.name}`);
      }
    };
    await collect(f.name);
    if (keys.length) await sb.storage.from(BUCKET).remove(keys);
  }
}

// Semanas com kit no Storage, da mais antiga para a mais recente.
export async function listWeeks() {
  const { data } = await admin().storage.from(BUCKET).list("", { limit: 1000 });
  return (data || []).map((f) => f.name).filter((n) => /^\d{4}-\d{2}-\d{2}$/.test(n)).sort();
}

export async function getJson(key) {
  const { data, error } = await admin().storage.from(BUCKET).download(key);
  if (error || !data) return null;
  return JSON.parse(await data.text());
}

export const putJson = (key, value) => putFile(key, JSON.stringify(value, null, 2), "application/json");
