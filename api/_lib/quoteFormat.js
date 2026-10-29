// Formatação compartilhada pelos e-mails da cotação (api/segfy/choose.js e
// relatório semanal em api/cron/quote-report.js).

export const INSURER_NAMES = {
  porto: "Porto Seguro", azul: "Azul Seguros", itau: "Itaú Seguros", allianz: "Allianz",
  liberty: "Liberty", bradesco: "Bradesco Seguros", suhai: "Suhai", mitsui: "Mitsui Sumitomo",
  // Só aparecem como seguradora atual do cliente (renewal.insurer), não são cotadas.
  hdi: "HDI", tokio: "Tokio Marine", mapfre: "Mapfre", sompo: "Sompo", zurich: "Zurich", youse: "Youse",
  sura: "Sura", alfa: "Alfa", generali: "Generali", santander: "Santander", caixa: "Caixa Seguradora",
  sul_america_cia_nacional_auto: "SulAmérica",
};

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function money(value) {
  return value == null
    ? "—"
    : Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
}

export function brDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

export function formatPhone(digits) {
  const d = String(digits || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

export function coverageLabel(result) {
  const type = result?.company_coverages?.coverage_type || "";
  return /compreens/i.test(type) ? "Cobertura completa" : `Cobertura parcial (${type || "ver detalhes"})`;
}

export function insurerName(result) {
  const key = result?.company?.name;
  return INSURER_NAMES[key] || key || "Seguradora";
}

// Melhor oferta (compreensiva mais barata, senão a mais barata) de cada seguradora.
export function bestOfferPerInsurer(results) {
  const groups = {};
  for (const r of results) {
    if (r.premium == null) continue;
    (groups[r.company?.name] ||= []).push(r);
  }
  return Object.values(groups)
    .map((list) => {
      const sorted = list.sort((a, b) => a.premium - b.premium);
      return sorted.find((r) => /compreens/i.test(r.company_coverages?.coverage_type || "")) || sorted[0];
    })
    .sort((a, b) => a.premium - b.premium);
}
