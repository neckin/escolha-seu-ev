// Cliente HTTP autenticado para a API da Segfy. Nada aqui é exposto ao navegador:
// este arquivo só roda dentro das Serverless Functions (pasta /api).

import { getSegfyBearerToken, invalidateSegfyToken } from "./segfyAuth.js";

const DEFAULT_TIMEOUT_MS = 15_000;

function getBaseUrl() {
  return process.env.SEGFY_API_BASE_URL || "https://api.automation.segfy.com";
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function segfyRequest(path, { method = "GET", query, body } = {}) {
  const url = new URL(`${getBaseUrl()}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }

  const doFetch = (token) =>
    fetchWithTimeout(
      url.toString(),
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      },
      DEFAULT_TIMEOUT_MS
    );

  let token = await getSegfyBearerToken();
  let response = await doFetch(token);

  if (response.status === 401) {
    invalidateSegfyToken();
    token = await getSegfyBearerToken({ forceRefresh: true });
    response = await doFetch(token);
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  return { status: response.status, ok: response.ok, data };
}
