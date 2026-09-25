// Proxy autenticado para as APIs de cotação de veículo da Segfy.
// Só repassa para os endpoints explicitamente listados abaixo (nunca um proxy
// genérico) — assim o front nunca precisa conhecer nem manipular client_id/secret.

import { segfyRequest } from "../../_lib/segfyClient.js";

const ACTIONS = {
  "brand-list": { method: "GET", path: "/api/vehicle/version/1.0/brand-list" },
  "model-list": { method: "GET", path: "/api/vehicle/version/1.0/model-list" },
  "profession-list": { method: "GET", path: "/api/vehicle/version/1.0/profession-list" },
  "renewal-list": { method: "GET", path: "/api/vehicle/version/1.0/renewal-list" },
  calculate: { method: "POST", path: "/api/vehicle/version/1.0/calculate" },
  "save-customer": { method: "POST", path: "/api/vehicle/version/1.0/save-customer" },
  "show-quotation": { method: "GET", path: "/api/vehicle/version/1.0/show-quotation" },
  "show-results": { method: "GET", path: "/api/vehicle/version/1.0/show-results" },
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

export default async function handler(req, res) {
  const { action, ...query } = req.query;
  const route = ACTIONS[action];

  if (!route) {
    res.status(404).json({ error: "Ação inválida." });
    return;
  }

  if (req.method !== route.method) {
    res.status(405).json({ error: `Use ${route.method} para esta ação.` });
    return;
  }

  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: "Origem não autorizada." });
    return;
  }

  try {
    const { status, data } = await segfyRequest(route.path, {
      method: route.method,
      query: route.method === "GET" ? query : undefined,
      body: route.method === "POST" ? req.body : undefined,
    });

    res.status(status).json(data);
  } catch (error) {
    console.error(`[segfy:${action}]`, error.message);
    res.status(502).json({ error: "Falha ao comunicar com a Segfy." });
  }
}
