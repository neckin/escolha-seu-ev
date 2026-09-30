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

const ACTIONS = {
  "brand-list": "/api/vehicle/version/1.0/brand-list",
  "model-list": "/api/vehicle/version/1.0/model-list",
  "profession-list": "/api/vehicle/version/1.0/profession-list",
  "renewal-list": "/api/vehicle/version/1.0/renewal-list",
  calculate: "/api/vehicle/version/1.0/calculate",
  "save-customer": "/api/vehicle/version/1.0/save-customer",
  "show-quotation": "/api/vehicle/version/1.0/show-quotation",
  "show-results": "/api/vehicle/version/1.0/show-results",
};

function isAllowedOrigin(req) {
  const allowed = process.env.ALLOWED_ORIGIN;
  if (!allowed) return true;

  const origin = req.headers.origin || req.headers.referer || "";
  return allowed
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .some((entry) => origin.startsWith(entry));
}

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
    const body = withBrokerToken(req.body);
    const { status, data } = await segfyRequest(path, { method: "POST", body });
    res.status(status).json(withoutBrokerToken(data));
  } catch (error) {
    console.error(`[segfy:${action}]`, error.message);
    res.status(502).json({ error: "Falha ao comunicar com a Segfy." });
  }
}
