// Origem da visita (utm_source/medium/campaign do link divulgado, ex.: o link
// dos Stories do Instagram). Guardada na sessionStorage na chegada, porque a
// pessoa pode navegar pelo comparador antes de abrir a cotação. Vai junto da
// cotação só para o registro interno (quote_events), nunca para a Segfy.

const KEY = "ev-comparador:utm:v1";
const FIELDS = ["utm_source", "utm_medium", "utm_campaign"];

export function captureCampaign() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(FIELDS.filter((f) => params.get(f)).map((f) => [f, params.get(f).slice(0, 80)]));
    if (Object.keys(utm).length) sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch { /* sem sessionStorage: a cotação só não leva a origem */ }
}

export function readCampaign() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
