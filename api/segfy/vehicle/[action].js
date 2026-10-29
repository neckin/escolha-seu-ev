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
import { logQuoteEvent } from "../../_lib/quoteLog.js";

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
    res.status(status).json(withoutBrokerToken(data));
  } catch (error) {
    console.error(`[segfy:${action}]`, error.message);
    res.status(502).json({ error: "Falha ao comunicar com a Segfy." });
  }
}
