// Proxy autenticado para as APIs de cotação de veículo da Segfy.
// Só repassa para os endpoints explicitamente listados abaixo (nunca um proxy
// genérico) — assim o front nunca precisa conhecer client_id/secret nem o
// token da corretora (config.token), injetado aqui em toda chamada.
//
// Todos os endpoints do ramo Veículo são POST com corpo JSON contendo
// { config: {...}, data: {...} }. O campo config.token identifica a
// corretora perante a Segfy e é obrigatório em toda chamada — por segurança
// o valor enviado pelo cliente nesse campo é sempre ignorado/sobrescrito.

import { segfyRequest } from "../../_lib/segfyClient.js";
import { isAllowedOrigin } from "../../_lib/origin.js";
import { logQuoteEvent, logQuoteFailure } from "../../_lib/quoteLog.js";

const SOURCES = ["comparador", "cotacao"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UTM_RE = /^[\w.-]{1,80}$/;

// Só os três campos de origem, com texto simples (vêm da URL do visitante).
function utmFields(utm) {
  if (!utm || typeof utm !== "object") return {};
  const out = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    if (typeof utm[key] === "string" && UTM_RE.test(utm[key])) out[key] = utm[key].toLowerCase();
  }
  return out;
}

// Só o que o front usa. show-results/show-quotation devolvem os dados pessoais
// do cliente (nome, CPF, telefone) a partir do guid, então não ficam expostos;
// o choose.js consulta o show-results direto no servidor.
const ACTIONS = {
  "brand-list": "/api/vehicle/version/1.0/brand-list",
  "model-list": "/api/vehicle/version/1.0/model-list",
  "profession-list": "/api/vehicle/version/1.0/profession-list",
  calculate: "/api/vehicle/version/1.0/calculate",
};

function withBrokerToken(body) {
  const base = body && typeof body === "object" ? body : {};
  const brokerToken = process.env.SEGFY_BROKER_TOKEN;

  if (!brokerToken) {
    throw new Error("SEGFY_BROKER_TOKEN não configurado nas variáveis de ambiente.");
  }

  return {
    ...base,
    config: {
      ...(base.config && typeof base.config === "object" ? base.config : {}),
      token: brokerToken,
    },
  };
}

// A Segfy ecoa o token da corretora em várias respostas (config.token no
// calculate; token no topo e em data.config no show-results). Remove qualquer
// campo com esse valor, em qualquer nível, antes de repassar ao navegador.
function withoutBrokerToken(value) {
  const brokerToken = process.env.SEGFY_BROKER_TOKEN;
  if (Array.isArray(value)) return value.map(withoutBrokerToken);
  if (!value || typeof value !== "object") return value;

  const clean = {};
  for (const [key, entry] of Object.entries(value)) {
    if (brokerToken && entry === brokerToken) continue;
    clean[key] = withoutBrokerToken(entry);
  }
  return clean;
}

// Resumo do motivo de uma recusa da Segfy, para o registro e para a tela.
// Pega o texto e o caminho do campo (ex.: "data.renewal.prior_policy_end:
// must be ...") e descarta os valores enviados (input/value), que podem ter
// CPF, nome ou e-mail. Por garantia, mascara qualquer sequência longa de
// dígitos ou e-mail que sobre no texto.
function redact(text) {
  return String(text)
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[e-mail]")
    .replace(/\d[\d.\-/ ]{6,}\d/g, (m) => (/^\d{4}-\d{2}-\d{2}$/.test(m) ? m : "[número]"));
}

function describeIssue(item) {
  if (item == null) return "";
  if (typeof item === "string") return item;
  if (typeof item !== "object") return String(item);
  const where = Array.isArray(item.loc) ? item.loc.join(".") : item.field || item.path || item.property || item.param || "";
  const what = item.msg || item.message || item.error || item.detail || item.type || "";
  if (where || what) return [where, typeof what === "string" ? what : JSON.stringify(what)].filter(Boolean).join(": ");
  // Objeto aninhado (ex.: { renewal: { bonus_last: "inválido" } }): achata
  // em "renewal.bonus_last: inválido", sem os campos de valor enviado.
  return Object.entries(item)
    .filter(([k]) => !["input", "value", "ctx", "url"].includes(k))
    .map(([k, v]) => {
      const inner = Array.isArray(v) ? v.map(describeIssue).join("; ") : describeIssue(v);
      return inner.includes(": ") && v && typeof v === "object" && !Array.isArray(v) ? inner.split(" | ").map((x) => `${k}.${x}`).join(" | ") : `${k}: ${inner}`;
    })
    .join(" | ");
}

export function segfyFailureReason(data) {
  if (data == null) return "resposta vazia";
  if (typeof data !== "object") return redact(String(data)).slice(0, 500);
  const parts = [];
  // Campos conhecidos primeiro; depois qualquer outro (a Segfy usa
  // "validations" no 422), menos o "status" e o que pode trazer dado pessoal.
  const known = ["message", "error", "detail", "errors", "validations", "error_message", "msg", "raw"];
  const skip = new Set(["status", "config", "data", "customer", "token", "guid"]);
  const keys = [...known, ...Object.keys(data).filter((k) => !known.includes(k) && !skip.has(k))];
  for (const key of keys) {
    const value = data[key];
    if (value == null || value === "") continue;
    if (Array.isArray(value)) parts.push(...value.map((v) => (known.includes(key) ? describeIssue(v) : `${key}: ${describeIssue(v)}`)));
    else if (typeof value === "object") parts.push(...Object.entries(value).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.map(describeIssue).join("; ") : describeIssue(v)}`));
    else parts.push(String(value));
  }
  if (!parts.length) parts.push(`campos na resposta: ${Object.keys(data).join(", ") || "nenhum"}`);
  return redact(parts.filter(Boolean).join(" | ")).slice(0, 1000);
}

// Contexto não pessoal da cotação que falhou (ajuda a achar padrões).
function failureContext(payload) {
  const d = payload?.data || {};
  const r = d.renewal || {};
  const days = /^\d{4}-\d{2}-\d{2}$/.test(r.prior_policy_end || "") && /^\d{4}-\d{2}-\d{2}$/.test(d.quotation_date || "")
    ? Math.round((Date.parse(r.prior_policy_end) - Date.parse(d.quotation_date)) / 86400000)
    : null;
  const short = (v) => (typeof v === "string" || typeof v === "number" ? String(v).slice(0, 40) : null);
  return {
    renewal_insurer: short(r.insurer),
    renewal_bonus: short(r.bonus_last),
    renewal_days_to_end: days,
    vehicle_year: Number.isInteger(d.vehicle?.model_year) ? d.vehicle.model_year : null,
    fuel_type: short(d.vehicle?.fuel_type),
  };
}

async function recordFailure(httpStatus, reason, meta, payload) {
  const row = {
    http_status: httpStatus,
    reason,
    source: SOURCES.includes(meta?.source) ? meta.source : null,
    car_id: typeof meta?.carId === "string" ? meta.carId.slice(0, 80) : null,
    from_policy: meta?.fromPolicy === true,
    ...failureContext(payload),
    ...utmFields(meta?.utm),
  };
  console.error("[segfy:calculate] recusada", JSON.stringify(row));
  await logQuoteFailure(row);
}

export default async function handler(req, res) {
  const { action } = req.query;
  const path = ACTIONS[action];

  if (!path) {
    res.status(404).json({ error: "Ação inválida." });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST para esta ação." });
    return;
  }

  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: "Origem não autorizada." });
    return;
  }

  try {
    // `meta` (página de origem e carro) é só para o registro interno; não vai à Segfy.
    const { meta, ...payload } = req.body && typeof req.body === "object" ? req.body : {};
    const body = withBrokerToken(payload);
    const { status, data } = await segfyRequest(path, { method: "POST", body });
    if (action === "calculate" && data?.status === "OK" && UUID_RE.test(data.guid || "")) {
      await logQuoteEvent({
        event: "quote",
        quote_guid: data.guid,
        source: SOURCES.includes(meta?.source) ? meta.source : null,
        car_id: typeof meta?.carId === "string" ? meta.carId.slice(0, 80) : null,
        from_policy: meta?.fromPolicy === true,
        ...utmFields(meta?.utm),
      });
    }
    if (action === "calculate" && (status >= 400 || data?.status !== "OK")) {
      const reason = segfyFailureReason(data);
      await recordFailure(status, reason, meta, payload);
      // O front mostra uma mensagem amigável; `reason` vai junto (sem dado
      // pessoal) para quem estiver depurando no navegador.
      res.status(status >= 400 ? status : 422).json({ status: "ERROR", http_status: status, reason });
      return;
    }
    res.status(status).json(withoutBrokerToken(data));
  } catch (error) {
    console.error(`[segfy:${action}]`, error.message);
    if (action === "calculate") {
      const { meta, ...payload } = req.body && typeof req.body === "object" ? req.body : {};
      await recordFailure(502, `sem resposta da Segfy: ${redact(error.message).slice(0, 300)}`, meta, payload);
    }
    res.status(502).json({ error: "Falha ao comunicar com a Segfy." });
  }
}
