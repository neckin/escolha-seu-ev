// Desempenho dos posts do kit, lido pelo Windsor.ai (conector Instagram).
// Junta as métricas de cada post (alcance, salvamentos, compartilhamentos,
// seguidores ganhos...) com o que o kit publicou (published-<dia>.json no
// Storage), para:
//   - escolher o tema da segunda pelo que mais engaja (chooseTheme);
//   - escrever um resumo da semana no GitHub (aba Summary da execução) e em
//     insights/<semana>.json no Storage.
// Sem WINDSOR_API_KEY, ou se o Windsor falhar, o kit volta ao rodízio fixo.
//
// Uso: node scripts/instagram-kit/insights.mjs  (imprime o relatório)

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { loadEnvLocal, weekMonday, iso, getJson, putJson, listWeeks } from "./storage.mjs";

const FIELDS = [
  "media_id", "timestamp", "media_type", "media_permalink", "media_reach", "media_views", "media_saved",
  "media_shares", "media_comments_count", "media_like_count", "media_follows", "media_profile_visits",
];
const METRICS = ["reach", "views", "saved", "shares", "comments", "likes", "follows", "profile_visits"];

// Peso de cada ação: o que mais traz seguidor e cliente (seguir, salvar,
// compartilhar, visitar o perfil, onde está o link) vale mais que curtida.
const WEIGHTS = { follows: 6, shares: 4, saved: 3, profile_visits: 2, comments: 2, likes: 1 };

export async function fetchWindsor(days = 120) {
  const key = process.env.WINDSOR_API_KEY;
  if (!key) return null;
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 3600 * 1000);
  const url = new URL("https://connectors.windsor.ai/instagram");
  url.searchParams.set("api_key", key);
  url.searchParams.set("date_from", iso(from));
  url.searchParams.set("date_to", iso(to));
  url.searchParams.set("fields", FIELDS.join(","));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Windsor.ai respondeu ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json) ? json : json.data || [];
  // As métricas de post são acumuladas (lifetime): se vierem em várias linhas
  // (uma por dia), fica o maior valor de cada uma, sem somar em dobro.
  const byId = new Map();
  for (const r of rows) {
    if (!r.media_id) continue;
    const m = byId.get(String(r.media_id)) || { id: String(r.media_id), type: r.media_type, permalink: r.media_permalink, timestamp: r.timestamp };
    for (const k of METRICS) {
      const v = Number(r[`media_${k === "comments" ? "comments_count" : k === "likes" ? "like_count" : k}`]) || 0;
      m[k] = Math.max(m[k] || 0, v);
    }
    byId.set(m.id, m);
  }
  return byId;
}

export const score = (m) => {
  const actions = Object.entries(WEIGHTS).reduce((s, [k, w]) => s + w * (m[k] || 0), 0);
  return m.reach ? Math.round((actions / m.reach) * 1000) / 10 : 0; // pontos por 100 contas alcançadas
};

// O que o kit publicou nas últimas semanas: semana, dia, tema/carro, formato
// e o id do post no Instagram.
export async function publishedHistory(weeks = 16) {
  const out = [];
  for (const week of (await listWeeks()).slice(-weeks)) {
    const manifest = await getJson(`${week}/manifest.json`);
    if (!manifest) continue;
    for (const day of ["mon", "wed", "fri"]) {
      const marker = await getJson(`${week}/published-${day}.json`);
      const post = manifest.posts[day];
      if (!marker?.["instagram-feed"] || !post) continue;
      out.push({ week, day, format: post.type, theme: day === "mon" ? manifest.theme : null, reelsVariant: day === "wed" ? manifest.reelsVariant : null, car: manifest.car, mediaId: String(marker["instagram-feed"].id) });
    }
  }
  return out;
}

export async function performance() {
  const metrics = await fetchWindsor();
  if (!metrics) return null;
  const history = await publishedHistory();
  return history.map((h) => {
    const m = metrics.get(h.mediaId);
    return m ? { ...h, ...m, score: score(m) } : { ...h, missing: true };
  });
}

// Tema da segunda: nunca repete as 2 últimas semanas; tema ainda não
// testado vem primeiro (na ordem do rodízio); depois, o de melhor nota média.
export function chooseTheme(themes, weekIndex, perf) {
  const fallback = themes[weekIndex % themes.length];
  if (!perf?.length) return { theme: fallback, reason: "rodízio (sem dados do Windsor.ai)" };
  const mondays = perf.filter((p) => p.day === "mon" && p.theme).sort((a, b) => a.week.localeCompare(b.week));
  const recent = new Set(mondays.slice(-2).map((p) => p.theme));
  const stats = new Map();
  for (const p of mondays.filter((p) => !p.missing && p.reach)) {
    const s = stats.get(p.theme) || { sum: 0, n: 0 };
    stats.set(p.theme, { sum: s.sum + p.score, n: s.n + 1 });
  }
  const ordered = [...themes.slice(weekIndex % themes.length), ...themes.slice(0, weekIndex % themes.length)];
  const candidates = ordered.filter((t) => !recent.has(t.id));
  const untested = candidates.find((t) => !mondays.some((p) => p.theme === t.id));
  if (untested) return { theme: untested, reason: "tema ainda não testado" };
  const best = candidates
    .map((t) => ({ t, avg: stats.has(t.id) ? stats.get(t.id).sum / stats.get(t.id).n : -1 }))
    .sort((a, b) => b.avg - a.avg)[0];
  return best && best.avg >= 0
    ? { theme: best.t, reason: `melhor desempenho (${best.avg.toFixed(1)} pts/100 alcançados)` }
    : { theme: candidates[0] || fallback, reason: "rodízio" };
}

const LABEL = { mon: "Seg", wed: "Qua", fri: "Sex" };

export function reportMarkdown(perf, week) {
  if (!perf) return "### Instagram\n\nWindsor.ai não configurado (WINDSOR_API_KEY): sem relatório de desempenho.\n";
  const rows = perf.filter((p) => !p.missing).sort((a, b) => b.week.localeCompare(a.week) || a.day.localeCompare(b.day));
  const n = (v) => Number(v || 0).toLocaleString("pt-BR");
  const lines = [
    `### Desempenho no Instagram (Windsor.ai) · semana de ${week}`, "",
    "Nota = (seguiu×6 + compartilhou×4 + salvou×3 + visitou perfil×2 + comentou×2 + curtiu) por 100 contas alcançadas.", "",
    "| Semana | Dia | Formato | Tema/variante | Alcance | Salvos | Compart. | Seguiu | Visitas ao perfil | Nota |",
    "|---|---|---|---|---:|---:|---:|---:|---:|---:|",
    ...rows.slice(0, 24).map((p) => `| ${p.week} | ${LABEL[p.day]} | ${p.format} | ${p.theme || p.reelsVariant || p.car} | ${n(p.reach)} | ${n(p.saved)} | ${n(p.shares)} | ${n(p.follows)} | ${n(p.profile_visits)} | ${p.score} |`),
  ];
  const missing = perf.filter((p) => p.missing).length;
  if (missing) lines.push("", `${missing} post(s) ainda sem métricas no Windsor.ai (publicação recente ou conta não conectada).`);
  return `${lines.join("\n")}\n`;
}

export async function writeReport(perf, week) {
  const md = reportMarkdown(perf, week);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  if (perf) await putJson(`insights/${week}.json`, perf).catch(() => {});
  return md;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  loadEnvLocal();
  const week = iso(weekMonday());
  performance()
    .then((perf) => writeReport(perf, week))
    .then((md) => console.log(md))
    .catch((e) => { console.error(e.message || e); process.exit(1); });
}
