#!/usr/bin/env node
/**
 * Varre os sites oficiais das marcas listadas em brand-sites-watchlist.json
 * atrás de sinal de carro novo ou mudança de preço/ficha — foco em híbridos
 * não-plugáveis (HEV), que ainda não têm nenhum representante no catálogo.
 *
 * Testado em 11/09/2026: fetch() simples (com header de User-Agent de
 * navegador comum) acessa normalmente as home pages de Toyota, Honda,
 * Chevrolet, Fiat, Jeep, BYD e GWM — sem bloqueio de bot. Achados anteriores
 * de 403 vieram de uma ferramenta de fetch diferente (com fingerprint
 * próprio) e de caminhos de URL errados, não de bloqueio real ao fetch()
 * puro. Ainda assim, GitHub Actions roda de faixas de IP conhecidas como
 * "datacenter", que alguns WAFs tratam diferente de um IP residencial —
 * se algum site passar a bloquear especificamente a Action, este script
 * já registra a falha no relatório em vez de quebrar a varredura inteira,
 * e essa marca deve ser conferida manualmente até resolver.
 *
 * NÃO escreve direto na tabela `cars`. Cada sinal encontrado vira uma linha
 * em `car_review_queue` (status "pending") — fica lá até alguém revisar e
 * decidir se vira carro de verdade no catálogo.
 *
 * Requer SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (mesmos secrets já usados
 * por outras Actions deste repo) e ANTHROPIC_API_KEY (aqui não é opcional —
 * sem IA não dá pra extrair sinal útil do texto solto de uma home page).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const STATE_PATH = path.join(__dirname, "pending-reviews", ".brand-site-state.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashOf(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

async function fetchPageText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return htmlToText(html).slice(0, 8000);
}

async function askClaude(brand, url, text) {
  const prompt =
    `Você está olhando o texto extraído da home page oficial da marca de carros "${brand}" no Brasil ` +
    `(${url}), procurando sinal de veículo HÍBRIDO NÃO-PLUGÁVEL (HEV — motor elétrico que move o carro ` +
    "sozinho por trechos, mas nunca pluga na tomada; ex.: sistema Toyota HSD, Honda e:HEV, Nissan e-Power) " +
    "que ainda não conhecemos, ou preço de modelo híbrido que pareça diferente do que já sabemos.\n\n" +
    "Responda só em JSON: " +
    '{"hasSignal": true|false, "models": [{"name": "...", "price": "... ou null", "note": "frase curta"}], "summary": "1-2 frases"}. ' +
    "Seja cético — se o texto não tiver nada de híbrido claro, hasSignal: false e models: [].\n\n" +
    `Texto da página:\n${text}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${JSON.stringify(data.error || data)}`);
  const raw = (data.content || []).map((b) => b.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function writeToReviewQueue(brand, url, model) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/car_review_queue`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      car_id: null,
      status: "pending",
      proposed_data: { brand, name: model.name, price_text: model.price, note: model.note, fuel_type_guess: "HEV" },
      source_url: url,
      notes: `Encontrado pela varredura automática de sites oficiais. ${model.note || ""}`.trim(),
    }),
  });
  if (!res.ok) throw new Error(`Falha ao gravar na car_review_queue: ${res.status} ${await res.text()}`);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Faltou SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }
  if (!ANTHROPIC_API_KEY) {
    console.error("Faltou ANTHROPIC_API_KEY — sem IA este script não consegue extrair sinal útil das páginas.");
    process.exit(1);
  }

  const watchlist = JSON.parse(fs.readFileSync(path.join(__dirname, "brand-sites-watchlist.json"), "utf8"));
  const state = loadState();
  const reportLines = [];
  const failedBrands = [];
  let queuedCount = 0;

  for (const { brand, url } of watchlist) {
    try {
      const text = await fetchPageText(url);
      const hash = hashOf(text);
      const unchanged = state[url]?.hash === hash;
      state[url] = { hash, lastChecked: new Date().toISOString() };

      if (unchanged) {
        console.log(`${brand}: sem mudança desde a última checagem, pulando IA.`);
        continue;
      }

      const result = await askClaude(brand, url, text);
      console.log(`${brand}: hasSignal=${result.hasSignal}`);
      if (result.hasSignal && Array.isArray(result.models) && result.models.length > 0) {
        for (const model of result.models) {
          await writeToReviewQueue(brand, url, model);
          queuedCount++;
        }
        reportLines.push(`## ${brand}`);
        reportLines.push(`- Site: ${url}`);
        reportLines.push(`- Resumo: ${result.summary || ""}`);
        for (const m of result.models) {
          reportLines.push(`  - **${m.name}** — ${m.price || "preço não identificado"} (${m.note || ""})`);
        }
        reportLines.push("");
      }
    } catch (err) {
      console.error(`Falha em ${brand} (${url}): ${err.message}`);
      failedBrands.push({ brand, url, error: err.message });
      reportLines.push(`## ${brand}`);
      reportLines.push(`- ⚠️ Falha ao acessar: ${err.message}`);
      reportLines.push("");
    }
  }

  saveState(state);

  if (failedBrands.length > 0) {
    reportLines.push("## Marcas que falharam nesta rodada");
    reportLines.push(
      "Sem sinal automático desta vez — confira manualmente, ou pelo indireto da triagem de vídeos do " +
        "YouTube. Se a falha persistir toda semana pra uma marca, o site provavelmente passou a bloquear " +
        "a faixa de IP do GitHub Actions especificamente; vale investigar ou remover do watchlist:"
    );
    for (const f of failedBrands) reportLines.push(`- ${f.brand} (${f.url}): ${f.error}`);
    reportLines.push("");
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "pending-reviews");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${dateStr}-sites-oficiais.md`);
  fs.writeFileSync(
    outPath,
    `# Varredura de sites oficiais — ${dateStr}\n\n` +
      (queuedCount > 0
        ? `${queuedCount} sinal(is) de modelo híbrido encontrado(s) e registrado(s) na fila de revisão do Supabase.\n\n`
        : "Nenhum sinal novo de modelo híbrido nesta semana.\n\n") +
      reportLines.join("\n")
  );
  console.log(`Relatório salvo em ${outPath}. ${queuedCount} item(ns) na fila de revisão.`);

  fs.writeFileSync(
    path.join(outDir, ".last-run-had-brand-candidates"),
    queuedCount > 0 ? "true" : "false"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
