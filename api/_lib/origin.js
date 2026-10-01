// Restringe quem pode chamar /api/segfy/* pelo navegador. ALLOWED_ORIGIN =
// origens separadas por vírgula (ex.: https://escolha-seu-ev.vercel.app).
// Sem a variável, libera tudo (dev local).
//
// Compara a origem exata (protocolo + host + porta), nunca o começo da string:
// com startsWith, "https://site.app.atacante.com" passaria por "https://site.app".
// Não barra scripts fora do navegador (o header pode ser forjado), só impede
// outros sites de usarem este backend a partir do navegador de um visitante.

function originOf(value) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedOrigin(req) {
  const allowed = process.env.ALLOWED_ORIGIN;
  if (!allowed) return true;

  const origin = originOf(req.headers.origin || req.headers.referer || "");
  if (!origin) return false;

  return allowed
    .split(",")
    .map((entry) => originOf(entry.trim()))
    .some((entry) => entry === origin);
}
