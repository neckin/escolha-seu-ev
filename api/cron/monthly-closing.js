// Fechamento mensal das cotações feitas pelo site, por e-mail, com planilha
// (CSV) anexa. Roda pelo Cron da Vercel (vercel.json, dia 1º às 8h de
// Brasília) e cobre o mês anterior inteiro. Serve para conferir, com as
// apólices emitidas pela D&B, quais vieram da plataforma: a prova é o
// registro do próprio site (quote_events), feito só quando a cotação passa
// pelo servidor do site, nunca pelo painel da Segfy.
//
// Para gerar um mês específico à mão: /api/cron/monthly-closing?mes=2026-10
// (com o mesmo "Authorization: Bearer <CRON_SECRET>").
//
// Variáveis: as mesmas do relatório semanal (api/cron/quote-report.js).

import { listQuoteEvents } from "../_lib/quoteLog.js";
import { sendEmail } from "../_lib/mailer.js";
import { escapeHtml, money, insurerName } from "../_lib/quoteFormat.js";
import { brDateTime, fetchQuote, groupEvents } from "./quote-report.js";

const SOURCE_LABELS = { comparador: "Comparador", cotacao: "Página de cotação (D&B)" };
const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// Mês no fuso de Brasília (UTC-3, sem horário de verão desde 2019).
// Sem `mes`, é o mês anterior ao atual.
export function monthRange(mes, now = new Date()) {
  let year, month; // month: 1-12
  const m = /^(\d{4})-(\d{2})$/.exec(mes || "");
  if (m) {
    [year, month] = [Number(m[1]), Number(m[2])];
  } else {
    const [y, mo] = now.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }).split("-").map(Number);
    [year, month] = mo === 1 ? [y - 1, 12] : [y, mo - 1];
  }
  const iso = (y, mo) => `${y}-${String(mo).padStart(2, "0")}-01T00:00:00-03:00`;
  const next = month === 12 ? [year + 1, 1] : [year, month + 1];
  return {
    since: new Date(iso(year, month)).toISOString(),
    until: new Date(iso(...next)).toISOString(),
    label: `${MONTHS[month - 1]} de ${year}`,
  };
}

function rowFor(entry, details) {
  const q = details.quotation;
  const vehicle = q?.vehicle || {};
  const c = entry.choice;
  return {
    data: entry.quotedAt ? brDateTime(entry.quotedAt) : "mês anterior",
    cliente: q?.customer?.name || "Não encontrado na Segfy",
    veiculo: [vehicle.brand, vehicle.model, vehicle.model_year].filter(Boolean).join(" "),
    idSegfy: String(details.quotationId),
    origem: SOURCE_LABELS[entry.source] || "",
    apolice: entry.fromPolicy ? "sim" : "",
    plano: c ? `${insurerName({ company: { name: c.insurer } })} · ${money(c.premium)}/ano` : "",
    pagamento: c?.payment || "",
  };
}

// Ponto e vírgula e BOM: o Excel em português abre direto, com acentos.
function toCsv(rows) {
  const cols = [
    ["data", "Data da cotação"], ["cliente", "Cliente"], ["veiculo", "Veículo"], ["idSegfy", "ID na Segfy"],
    ["origem", "Origem"], ["apolice", "Enviou apólice"], ["plano", "Plano escolhido"], ["pagamento", "Pagamento"],
  ];
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [cols.map(([, h]) => cell(h)).join(";"), ...rows.map((r) => cols.map(([k]) => cell(r[k])).join(";"))];
  return "﻿" + lines.join("\r\n");
}

export async function buildClosing(events, label) {
  const entries = groupEvents(events);
  const details = [];
  for (let i = 0; i < entries.length; i += 10) {
    details.push(...(await Promise.all(entries.slice(i, i + 10).map((e) => fetchQuote(e.guid)))));
  }
  const rows = entries.map((entry, i) => rowFor(entry, details[i]));
  const quotes = entries.filter((e) => e.quotedAt).length;
  const chosen = entries.filter((e) => e.choice).length;

  const td = "padding:4px 10px 4px 0;border-bottom:1px solid #EEE;vertical-align:top";
  const table = rows.length
    ? `<table style="border-collapse:collapse;font-size:12.5px">
        <tr>${["Data", "Cliente", "Veículo", "ID na Segfy", "Plano escolhido"].map((h) => `<th style="${td};text-align:left">${h}</th>`).join("")}</tr>
        ${rows.map((r) => `<tr><td style="${td};white-space:nowrap">${escapeHtml(r.data)}</td><td style="${td}">${escapeHtml(r.cliente)}</td>
          <td style="${td}">${escapeHtml(r.veiculo || "—")}</td><td style="${td}"><code>${escapeHtml(r.idSegfy)}</code></td>
          <td style="${td}">${escapeHtml(r.plano || "—")}</td></tr>`).join("")}
      </table>`
    : `<p style="color:#555">Nenhuma cotação pelo site neste mês.</p>`;

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F33;max-width:760px">
      <h2 style="margin:0 0 4px">Fechamento do mês · Escolha seu EV</h2>
      <p style="margin:0 0 16px;color:#555">Cotações feitas pelo site em ${escapeHtml(label)}</p>
      <p style="margin:0 0 16px"><strong>${quotes}</strong> ${quotes === 1 ? "cotação feita" : "cotações feitas"} ·
        <strong>${chosen}</strong> ${chosen === 1 ? "plano escolhido" : "planos escolhidos"}</p>
      ${table}
      <p style="color:#555;font-size:12px;margin-top:20px">Lista completa das cotações registradas pelo site
        (comparador e página de cotação da D&B) no mês, com a planilha anexa. Para conferir a produção da
        plataforma, compare o ID na Segfy de cada linha com as apólices emitidas. Cotações feitas pelo painel da
        Segfy não entram aqui.</p>
    </div>`;

  return {
    html,
    csv: toCsv(rows),
    subject: `Escolha seu EV · fechamento de ${label}: ${quotes} ${quotes === 1 ? "cotação" : "cotações"}, ${chosen} ${chosen === 1 ? "plano escolhido" : "planos escolhidos"}`,
  };
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
    const { since, until, label } = monthRange(req.query?.mes);
    const events = await listQuoteEvents(since, until);
    const { html, csv, subject } = await buildClosing(events, label);
    const file = `fechamento-escolha-seu-ev-${since.slice(0, 7)}.csv`;
    await sendEmail({ to: to.join(", "), subject, html, attachments: [{ filename: file, content: csv, contentType: "text/csv; charset=utf-8" }] });
    res.status(200).json({ ok: true, events: events.length });
  } catch (error) {
    console.error("[monthly-closing]", error.message);
    res.status(500).json({ error: "Falha ao gerar o fechamento." });
  }
}
