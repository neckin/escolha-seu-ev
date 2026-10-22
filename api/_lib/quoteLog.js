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
  try {
    const res = await fetch(`${config.url}/rest/v1/quote_events`, {
      method: "POST",
      headers: { ...headers(config.key), Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!res.ok) console.error("[quote-log]", res.status, await res.text());
  } catch (error) {
    console.error("[quote-log]", error.message);
  }
}

export async function listQuoteEvents(sinceIso) {
  const config = supabaseConfig();
  if (!config) throw new Error("VITE_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados.");
  const query = new URLSearchParams({ select: "*", created_at: `gte.${sinceIso}`, order: "created_at.asc" });
  const res = await fetch(`${config.url}/rest/v1/quote_events?${query}`, { headers: headers(config.key) });
  if (!res.ok) throw new Error(`Falha ao ler quote_events: ${res.status} ${await res.text()}`);
  return res.json();
}
