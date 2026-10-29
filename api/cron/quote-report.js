// Relatório semanal das cotações feitas pelo site, por e-mail. Roda pelo Cron
// da Vercel (vercel.json, segunda às 8h de Brasília) e lê os últimos 7 dias da
// tabela quote_events. Nome, contato, veículo e preços vêm da Segfy
// (show-results), porque o registro próprio não guarda dado pessoal.
//
// Variáveis (só no servidor):
//   CRON_SECRET   — a Vercel manda "Authorization: Bearer <CRON_SECRET>" na
//                   chamada do cron; sem a variável o endpoint não roda.
//   REPORT_EMAILS — destinatários, separados por vírgula.
//   + as do Supabase (api/_lib/quoteLog.js) e do SMTP (api/_lib/mailer.js).

import { segfyRequest } from "../_lib/segfyClient.js";
import { listQuoteEvents } from "../_lib/quoteLog.js";
import { sendEmail } from "../_lib/mailer.js";
import { escapeHtml, money, brDate, formatPhone, insurerName, INSURER_NAMES } from "../_lib/quoteFormat.js";

const DAYS = 7;
const SOURCE_LABELS = { comparador: "Comparador", cotacao: "Página de cotação (site da D&B)" };

export function brDateTime(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function brDay(date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
}

function formatCep(digits) {
  const d = String(digits || "").replace(/\D/g, "");
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

// Seguro que a pessoa tem hoje (questionário de renovação enviado à Segfy).
// "new" = não tem seguro; aí a data, se vier, é resto de preenchimento.
// Vencimento a até 30 dias (antes ou depois) fica em destaque: é quem precisa
// decidir já. Data mais antiga costuma ser erro de digitação.
function currentInsurance(renewal, now) {
  const insurer = renewal?.insurer;
  if (!insurer || insurer === "new") return `<span style="color:#555">Não tem seguro</span>`;
  const parts = [escapeHtml(INSURER_NAMES[insurer] || insurer)];
  const end = /^\d{4}-\d{2}-\d{2}$/.test(renewal.prior_policy_end || "") ? renewal.prior_policy_end : null;
  let urgent = false;
  if (end) {
    const today = now.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
    const days = Math.round((Date.parse(end) - Date.parse(today)) / 86400000);
    urgent = days >= -30 && days <= 30;
    const when = days < -30 ? "venceu"
      : days < 0 ? `venceu há ${-days} ${days === -1 ? "dia" : "dias"}`
      : days === 0 ? "vence hoje"
      : `vence em ${days} ${days === 1 ? "dia" : "dias"}`;
    parts.push(`${when} (${brDate(end)})`);
  }
  if (renewal.bonus_last !== "" && renewal.bonus_last != null) parts.push(`bônus ${escapeHtml(renewal.bonus_last)}`);
  const text = parts.join(" · ");
  return urgent ? `<strong style="color:#9A5B00">${text}</strong>` : text;
}

export async function fetchQuote(guid) {
  try {
    const { data } = await segfyRequest("/api/vehicle/version/1.0/show-results", {
      method: "POST",
      body: { config: { token: process.env.SEGFY_BROKER_TOKEN }, data: { guid, id: "", multicalculo_id: "" } },
    });
    const results = (data?.results || []).flatMap((q) => q.results || []).filter((r) => r.premium != null);
    const comprehensive = results
      .filter((r) => /compreens/i.test(r.company_coverages?.coverage_type || ""))
      .sort((a, b) => a.premium - b.premium);
    return {
      quotation: data?.data?.data || null,
      quotationId: data?.quotation_id || data?.id || guid,
      insurers: new Set(results.map((r) => r.company?.name)).size,
      cheapest: comprehensive[0] || null,
    };
  } catch (error) {
    console.error("[quote-report] show-results", guid, error.message);
    return { quotation: null, quotationId: guid, insurers: 0, cheapest: null };
  }
}

// "instagram / stories / renovacao-2026-10-19", ou null sem link marcado.
function utmLabel(e) {
  const parts = [e.utm_source, e.utm_medium, e.utm_campaign].filter(Boolean);
  return parts.length ? parts.join(" / ") : null;
}

// Agrupa os eventos por cotação: o 'quote' diz quando e de onde veio, o
// 'choice' (pode chegar numa semana posterior à cotação) diz o plano escolhido.
export function groupEvents(events) {
  const byGuid = new Map();
  for (const e of events) {
    const entry = byGuid.get(e.quote_guid) || { guid: e.quote_guid, quotedAt: null, source: null, carId: null, utm: null, fromPolicy: false, choice: null };
    if (e.event === "quote") {
      Object.assign(entry, { quotedAt: e.created_at, source: e.source, carId: e.car_id, utm: utmLabel(e), fromPolicy: e.from_policy === true });
    }
    if (e.event === "choice") entry.choice = e;
    byGuid.set(e.quote_guid, entry);
  }
  return [...byGuid.values()];
}

function quoteCard(entry, details, now) {
  const q = details.quotation;
  const customer = q?.customer || {};
  const vehicle = q?.vehicle || {};
  const row = (label, value) =>
    `<tr><td style="padding:3px 12px 3px 0;color:#555;vertical-align:top">${label}</td><td style="padding:3px 0">${value}</td></tr>`;
  const choice = entry.choice
    ? `<strong>${escapeHtml(insurerName({ company: { name: entry.choice.insurer } }))} · ${money(entry.choice.premium)}/ano</strong>
       (${escapeHtml(entry.choice.coverage_type || "—")})${entry.choice.payment ? `<br>Pagamento: ${escapeHtml(entry.choice.payment)}` : ""}
       <br><span style="color:#555">em ${brDateTime(entry.choice.created_at)}</span>`
    : `<span style="color:#9A5B00">Não escolheu plano</span>`;
  const when = entry.quotedAt ? brDateTime(entry.quotedAt) : "semana anterior";
  return `
    <div style="border:1px solid #DDE3EA;border-radius:8px;padding:12px 14px;margin:0 0 12px">
      <div style="font-size:15px;margin:0 0 8px"><strong>${escapeHtml(customer.name || "Cliente não encontrado na Segfy")}</strong>
        <span style="color:#555"> · ${escapeHtml(when)}</span></div>
      ${entry.fromPolicy ? `<div style="margin:0 0 8px;color:#9A5B00;font-size:13px"><strong>Enviou a apólice atual</strong>: já tem seguro e está comparando preços</div>` : ""}
      <table style="border-collapse:collapse">
        ${row("Celular", escapeHtml(formatPhone(customer.cellphone) || "—"))}
        ${row("E-mail", escapeHtml(customer.email || "—"))}
        ${row("Veículo", escapeHtml([vehicle.brand, vehicle.model, vehicle.model_year].filter(Boolean).join(" ") || "—")
          + (vehicle.zero_km ? " (0 km)" : ""))}
        ${row("CEP", escapeHtml(formatCep(q?.zip_code) || "—"))}
        ${q ? row("Seguro atual", currentInsurance(q.renewal, now)) : ""}
        ${row("Origem", escapeHtml(SOURCE_LABELS[entry.source] || "—") + (entry.carId ? ` · carro <code>${escapeHtml(entry.carId)}</code>` : ""))}
        ${row("Link", entry.utm ? `<code>${escapeHtml(entry.utm)}</code>` : `<span style="color:#555">sem marcação (acesso direto, bio sem UTM ou site da D&amp;B)</span>`)}
        ${row("Completa mais barata", details.cheapest
          ? `${escapeHtml(insurerName(details.cheapest))} · ${money(details.cheapest.premium)}/ano (${details.insurers} seguradoras responderam)`
          : "Nenhuma seguradora devolveu cobertura completa")}
        ${row("Plano escolhido", choice)}
        ${row("ID na Segfy", `<code>${escapeHtml(details.quotationId)}</code>`)}
      </table>
    </div>`;
}

// O que mais converte: cotações e planos escolhidos por link de origem.
function originTable(entries) {
  const rows = new Map();
  for (const e of entries) {
    const key = e.utm || "sem marcação";
    const r = rows.get(key) || { quotes: 0, choices: 0 };
    if (e.quotedAt) r.quotes++;
    if (e.choice) r.choices++;
    rows.set(key, r);
  }
  const sorted = [...rows.entries()].sort((a, b) => b[1].choices - a[1].choices || b[1].quotes - a[1].quotes);
  const td = "padding:4px 12px 4px 0;border-bottom:1px solid #EEE";
  return `<h3 style="margin:20px 0 8px">Por origem</h3>
    <table style="border-collapse:collapse;font-size:13px">
      <tr><th style="${td};text-align:left">Link</th><th style="${td};text-align:right">Cotações</th><th style="${td};text-align:right">Planos escolhidos</th></tr>
      ${sorted.map(([k, r]) => `<tr><td style="${td}"><code>${escapeHtml(k)}</code></td><td style="${td};text-align:right">${r.quotes}</td><td style="${td};text-align:right">${r.choices}</td></tr>`).join("")}
    </table>`;
}

export async function buildReport(events, now = new Date()) {
  const entries = groupEvents(events);
  const details = [];
  for (let i = 0; i < entries.length; i += 5) {
    details.push(...(await Promise.all(entries.slice(i, i + 5).map((e) => fetchQuote(e.guid)))));
  }
  const items = entries.map((entry, i) => ({ entry, details: details[i] }));
  const chosen = items.filter((it) => it.entry.choice);
  const onlyQuoted = items.filter((it) => !it.entry.choice);
  const quotes = entries.filter((e) => e.quotedAt).length;
  const renewals = entries.filter((e) => e.fromPolicy).length;
  const start = new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000);
  const period = `${brDay(start)} a ${brDay(now)}`;

  const section = (title, list) =>
    list.length ? `<h3 style="margin:20px 0 8px">${title} (${list.length})</h3>${list.map((it) => quoteCard(it.entry, it.details, now)).join("")}` : "";

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F33;max-width:640px">
      <h2 style="margin:0 0 4px">Cotações do Escolha seu EV</h2>
      <p style="margin:0 0 16px;color:#555">Semana de ${period}</p>
      <p style="margin:0 0 4px"><strong>${quotes}</strong> ${quotes === 1 ? "cotação feita" : "cotações feitas"} ·
        <strong>${chosen.length}</strong> ${chosen.length === 1 ? "plano escolhido" : "planos escolhidos"}${renewals
          ? ` · <strong>${renewals}</strong> com apólice atual enviada` : ""}</p>
      ${items.length ? originTable(entries) : `<p style="color:#555">Nenhuma cotação pelo site nesta semana.</p>`}
      ${section("Escolheram plano: falta pagamento e emissão", chosen)}
      ${section("Só cotaram: vale um contato", onlyQuoted)}
      <p style="color:#555;font-size:12px;margin-top:20px">Relatório automático (toda segunda-feira) das cotações
        feitas no comparador e na página de cotação do site da D&B. Os dados do cliente vêm da Segfy; CPF e
        questionário completo estão na cotação, pelo ID.</p>
    </div>`;

  return { html, subject: `Escolha seu EV · ${quotes} ${quotes === 1 ? "cotação" : "cotações"}, ${chosen.length} ${chosen.length === 1 ? "plano escolhido" : "planos escolhidos"} (${period})` };
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    res.status(401).json({ error: "Não autorizado." });
    return;
  }

  const to = (process.env.REPORT_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!to.length) {
    res.status(500).json({ error: "REPORT_EMAILS não configurado." });
    return;
  }

  try {
    const now = new Date();
    const events = await listQuoteEvents(new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000).toISOString());
    const { html, subject } = await buildReport(events, now);
    await sendEmail({ to: to.join(", "), subject, html });
    res.status(200).json({ ok: true, events: events.length });
  } catch (error) {
    console.error("[quote-report]", error.message);
    res.status(500).json({ error: "Falha ao gerar o relatório." });
  }
}
