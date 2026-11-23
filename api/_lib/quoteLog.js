// Registro das cotações que entram pelo site (tabela quote_events no Supabase,
// ver supabase/schema-quote-events.sql). Guarda só o identificador da cotação
// na Segfy, a página de origem e o plano escolhido — nunca nome, CPF ou
// contato: o relatório semanal busca esses dados na própria Segfy.
//
// Variáveis (só no servidor): VITE_SUPABASE_URL (a mesma do catálogo) e
// SUPABASE_SERVICE_ROLE_KEY. Sem elas, ou se o Supabase falhar, o registro é
// pulado em silêncio: nunca pode atrapalhar a cotação do cliente.

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

function headers(key) {
  return { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export async function logQuoteEvent(row) {
  const config = supabaseConfig();
  if (!config) return;
  const insert = (body) =>
    fetch(`${config.url}/rest/v1/quote_events`, {
      method: "POST",
      headers: { ...headers(config.key), Prefer: "return=minimal" },
      body: JSON.stringify(body),
    });
  try {
    let res = await insert(row);
    // Colunas utm_*/from_policy ainda não criadas no banco: grava o resto mesmo assim.
    const optionalKeys = Object.keys(row).filter((k) => k.startsWith("utm_") || k === "from_policy");
    if (!res.ok && optionalKeys.length) {
      res = await insert(Object.fromEntries(Object.entries(row).filter(([k]) => !optionalKeys.includes(k))));
    }
    if (!res.ok) console.error("[quote-log]", res.status, await res.text());
  } catch (error) {
    console.error("[quote-log]", error.message);
  }
}

export async function listQuoteEvents(sinceIso, untilIso) {
  const config = supabaseConfig();
  if (!config) throw new Error("VITE_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados.");
  const query = new URLSearchParams({ select: "*", order: "created_at.asc" });
  query.append("created_at", `gte.${sinceIso}`);
  if (untilIso) query.append("created_at", `lt.${untilIso}`);
  const res = await fetch(`${config.url}/rest/v1/quote_events?${query}`, { headers: headers(config.key) });
  if (!res.ok) throw new Error(`Falha ao ler quote_events: ${res.status} ${await res.text()}`);
  return res.json();
}

// Cotações que a Segfy recusou (tabela quote_failures, ver
// supabase/schema-quote-failures.sql). Mesmo cuidado: só o motivo técnico,
// sem nome, CPF, contato ou os valores digitados. Falha aqui também é silenciosa.
export async function logQuoteFailure(row) {
  const config = supabaseConfig();
  if (!config) return;
  try {
    const res = await fetch(`${config.url}/rest/v1/quote_failures`, {
      method: "POST",
      headers: { ...headers(config.key), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) console.error("[quote-log] failure", res.status, await res.text());
  } catch (error) {
    console.error("[quote-log] failure", error.message);
  }
}

export async function listQuoteFailures(sinceIso) {
  const config = supabaseConfig();
  if (!config) throw new Error("VITE_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados.");
  const query = new URLSearchParams({ select: "*", order: "created_at.asc", created_at: `gte.${sinceIso}` });
  const res = await fetch(`${config.url}/rest/v1/quote_failures?${query}`, { headers: headers(config.key) });
  // Tabela ainda não criada: o relatório sai sem a seção de falhas.
  if (res.status === 404 || res.status === 400) return [];
  if (!res.ok) throw new Error(`Falha ao ler quote_failures: ${res.status} ${await res.text()}`);
  return res.json();
}
