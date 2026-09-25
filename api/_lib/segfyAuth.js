// Troca client_id/client_secret por um Bearer token (Basic Auth -> POST /auths/token)
// e mantém o token em cache em memória entre invocações "quentes" da function,
// evitando reautenticar a cada chamada. As credenciais nunca saem deste módulo.

const TOKEN_PATH = "/auths/token";
const REFRESH_MARGIN_MS = 30_000;
const FALLBACK_TTL_MS = 4 * 60 * 1000;

let cachedToken = null;
let cachedExpiresAt = 0;

function getBaseUrl() {
  return process.env.SEGFY_API_BASE_URL || "https://api.automation.segfy.com";
}

function decodeJwtExpiry(token) {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const { exp } = JSON.parse(json);
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

async function fetchFreshToken() {
  const clientId = process.env.SEGFY_CLIENT_ID;
  const clientSecret = process.env.SEGFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "SEGFY_CLIENT_ID/SEGFY_CLIENT_SECRET não configurados nas variáveis de ambiente."
    );
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${getBaseUrl()}${TOKEN_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao autenticar na Segfy (status ${response.status}).`);
  }

  const data = await response.json();
  if (!data?.token) {
    throw new Error("Resposta de autenticação da Segfy sem campo 'token'.");
  }

  return data.token;
}

export async function getSegfyBearerToken({ forceRefresh = false } = {}) {
  const now = Date.now();

  if (!forceRefresh && cachedToken && now < cachedExpiresAt - REFRESH_MARGIN_MS) {
    return cachedToken;
  }

  const token = await fetchFreshToken();
  cachedToken = token;
  cachedExpiresAt = decodeJwtExpiry(token) ?? now + FALLBACK_TTL_MS;

  return cachedToken;
}

export function invalidateSegfyToken() {
  cachedToken = null;
  cachedExpiresAt = 0;
}
