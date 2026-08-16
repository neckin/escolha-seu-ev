#!/usr/bin/env node
/**
 * Varre os canais listados em channels.json atrás de vídeos recentes (últimos
 * 7 dias) que pareçam ser sobre lançamento de carro elétrico/híbrido plug-in.
 *
 * NÃO escreve direto no site. Gera um relatório em Markdown
 * (scripts/pending-reviews/AAAA-MM-DD.md) para revisão humana — pense nisso
 * como uma "triagem", não uma atualização automática dos dados.
 *
 * Requer a env var YOUTUBE_API_KEY (gratuita, veja README).
 * Opcional: ANTHROPIC_API_KEY — se presente, usa a API da Anthropic pra
 * classificar os vídeos com mais precisão (reduz falsos positivos dos
 * filtros de palavra-chave).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error("Faltou a env var YOUTUBE_API_KEY. Veja o README para criar uma gratuita.");
  process.exit(1);
}

const KEYWORDS = [
  "lançamento", "lançou", "chega ao brasil", "chegou ao brasil", "estreia",
  "novo elétrico", "novo híbrido", "review completo", "primeiras impressões",
  "test drive", "avaliação completa", "vale a pena", "ficha técnica",
  "elétrico", "eletrico", "híbrido", "hibrido", "phev", "bev", "ev ",
];

function looksRelevant(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  return KEYWORDS.some((kw) => text.includes(kw));
}

async function resolveChannelId(handle) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(
    handle.replace(/^@/, "")
  )}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items || data.items.length === 0) {
    throw new Error(`Não consegui resolver o canal ${handle}`);
  }
  return data.items[0].id;
}

async function fetchRecentVideos(channelId, sinceISO) {
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}` +
    `&order=date&type=video&maxResults=15&publishedAfter=${sinceISO}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    throw new Error(`Erro na API do YouTube: ${JSON.stringify(data.error)}`);
  }
  return (data.items || []).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
  }));
}

async function classifyWithClaude(candidates) {
  if (!ANTHROPIC_API_KEY || candidates.length === 0) return candidates.map((c) => ({ ...c, aiNote: null }));

  const prompt =
    "Você está triando títulos de vídeos do YouTube sobre carros, procurando especificamente " +
    "por LANÇAMENTOS de carros elétricos (BEV) ou híbridos plug-in (PHEV) vendidos oficialmente no Brasil. " +
    "Para cada vídeo abaixo, responda em JSON (array), um objeto por vídeo, com: " +
    '{"videoId": "...", "isLikelyLaunch": true|false, "carGuess": "nome do carro ou null", "reason": "frase curta"}. ' +
    "Seja cético: reviews de carros já conhecidos, comparativos, ou vídeos sem carro específico devem ser isLikelyLaunch:false.\n\n" +
    "Vídeos:\n" +
    candidates.map((c) => `- videoId: ${c.videoId}\n  título: ${c.title}\n  descrição: ${c.description.slice(0, 300)}`).join("\n\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.warn(`Chamada à API da Anthropic falhou (${res.status}): ${JSON.stringify(data.error || data)} — seguindo sem classificação extra.`);
    return candidates.map((c) => ({ ...c, aiNote: null }));
  }
  const text = (data.content || []).map((b) => b.text || "").join("");
  let parsed = [];
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    console.warn("Não consegui interpretar a resposta da Claude API — seguindo sem classificação extra.");
  }
  const byId = Object.fromEntries(parsed.map((p) => [p.videoId, p]));
  return candidates.map((c) => ({ ...c, aiNote: byId[c.videoId] || null }));
}

async function main() {
  const channels = JSON.parse(fs.readFileSync(path.join(__dirname, "channels.json"), "utf8"));
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let allCandidates = [];

  for (const channel of channels) {
    try {
      const channelId = await resolveChannelId(channel.handle);
      const videos = await fetchRecentVideos(channelId, since);
      const relevant = videos
        .filter((v) => looksRelevant(v.title, v.description))
        .map((v) => ({ ...v, channelHandle: channel.handle, channelName: channel.name }));
      allCandidates = allCandidates.concat(relevant);
      console.log(`${channel.name}: ${videos.length} vídeos na semana, ${relevant.length} relevantes.`);
    } catch (err) {
      console.error(`Falha no canal ${channel.handle}: ${err.message}`);
    }
  }

  const classified = await classifyWithClaude(allCandidates);
  const strongCandidates = ANTHROPIC_API_KEY
    ? classified.filter((c) => c.aiNote?.isLikelyLaunch)
    : classified;

  const dateStr = new Date().toISOString().slice(0, 10);
  const outDir = path.join(__dirname, "pending-reviews");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${dateStr}.md`);

  const lines = [];
  lines.push(`# Triagem semanal — ${dateStr}`);
  lines.push("");
  lines.push(
    strongCandidates.length === 0
      ? "Nenhum vídeo com sinais de lançamento de EV/PHEV encontrado nesta semana."
      : `${strongCandidates.length} vídeo(s) candidato(s) a lançamento — revise antes de atualizar o site.`
  );
  lines.push("");

  for (const c of strongCandidates) {
    lines.push(`## ${c.title}`);
    lines.push(`- Canal: ${c.channelName} (${c.channelHandle})`);
    lines.push(`- Publicado: ${c.publishedAt}`);
    lines.push(`- Link: https://www.youtube.com/watch?v=${c.videoId}`);
    if (c.aiNote) {
      lines.push(`- Carro sugerido: ${c.aiNote.carGuess || "não identificado"}`);
      lines.push(`- Motivo: ${c.aiNote.reason || ""}`);
    }
    lines.push("");
  }

  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`Relatório salvo em ${outPath}`);

  // Also expose a flag for the GitHub Action to know whether to open a PR
  fs.writeFileSync(
    path.join(outDir, ".last-run-had-candidates"),
    strongCandidates.length > 0 ? "true" : "false"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
