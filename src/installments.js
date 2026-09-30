// Parcelamento de um resultado da Segfy, normalizado por forma de pagamento.
// Usado na tela (resumo "ou 12x de R$ 146 no cartão" e escolha da forma de
// pagamento) e no backend (api/segfy/choose.js), que recalcula tudo a partir
// dos dados da Segfy em vez de confiar no que o navegador mandar.
//
// Formato de entrada (resultado da Segfy):
//   installments:        { "<rótulo da cia>": { "<nº de parcelas>": valor | "-" } }
//                        (a chave do nº pode vir como "12" ou "12 Vez(es)")
//   installments_budget: [{ id, name, number_with_interests: [n, ...] }]
//                        id normalizado: credit_card, account_debit, bank_ticket,
//                        bank_booklet, pix, recurrent, other e variantes.

const METHOD_LABELS = {
  credit_card: "cartão",
  account_debit: "débito em conta",
  bank_ticket: "boleto",
  bank_booklet: "carnê",
  pix: "Pix",
};

// Ordem de preferência na exibição quando dois meios empatam.
const METHOD_ORDER = ["credit_card", "pix", "account_debit", "bank_ticket", "bank_booklet"];

function baseMethod(id) {
  const key = String(id || "");
  return Object.keys(METHOD_LABELS).find((m) => key === m || key.startsWith(`${m}_`)) || null;
}

// Lista as formas de pagamento de um resultado, uma por meio normalizado.
// Variantes de cartão da própria seguradora (ex.: "Cartão Porto Bank") e
// meios sem id conhecido ficam de fora: exigem condição específica do cliente.
export function paymentOptions(result) {
  const budget = Array.isArray(result?.installments_budget) ? result.installments_budget : [];
  const table = result?.installments && typeof result.installments === "object" ? result.installments : {};
  const options = [];

  for (const entry of budget) {
    const method = baseMethod(entry.id);
    if (!method || entry.id !== method) continue;
    if (options.some((o) => o.method === method)) continue;

    const values = table[entry.name];
    if (!values || typeof values !== "object") continue;

    const withInterest = new Set(entry.number_with_interests || []);
    const plans = Object.entries(values)
      .map(([key, value]) => ({ count: parseInt(key, 10), value: Number(value) }))
      .filter((p) => Number.isInteger(p.count) && p.count > 0 && Number.isFinite(p.value) && p.value > 0)
      .map((p) => ({ ...p, interestFree: !withInterest.has(p.count) }))
      .sort((a, b) => a.count - b.count);
    if (plans.length === 0) continue;

    const interestFree = plans.filter((p) => p.interestFree);
    options.push({
      method,
      label: METHOD_LABELS[method],
      plans,
      // Melhor oferta para destacar: o maior parcelamento sem juros; se não
      // houver, o maior parcelamento disponível (com juros).
      best: interestFree.length ? interestFree[interestFree.length - 1] : plans[plans.length - 1],
    });
  }

  return options.sort((a, b) => METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method));
}

// A oferta de parcelamento mais atraente do resultado, para o resumo no card.
export function headlineInstallment(result) {
  const options = paymentOptions(result).filter((o) => o.best.count > 1);
  if (options.length === 0) return null;
  const score = (o) => (o.best.interestFree ? 100 : 0) + o.best.count;
  return options.reduce((best, o) => (score(o) > score(best) ? o : best));
}

export function formatPlan(option, plan, money) {
  const count = plan.count === 1 ? "à vista" : `${plan.count}x de ${money(plan.value)}`;
  const interest = plan.count === 1 ? "" : plan.interestFree ? " sem juros" : " com juros";
  return `${count}${interest} no ${option.label}`;
}
