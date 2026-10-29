// Peças do kit semanal de Instagram, em HTML, na identidade da D&B (manual
// 1.1): planos sólidos azul-marinho/marfim, arco de proteção, linha dourada
// fina; Manrope para números e chamadas, Inter para texto, Cormorant Garamond
// para o destaque editorial. Carrossel 1080x1350 (4:5) e Reels 1080x1920.

export const C = {
  navy: "#0B1F33", navy2: "#16324F", gold: "#C89B3C", goldSoft: "#E4C377",
  white: "#FFFFFF", ivory: "#F7F7F5", graphite: "#4C5A68", grey: "#8793A0",
};

const FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,600;1,600&display=swap";

export const INSURERS = ["Porto Seguro", "Azul", "Itaú", "Allianz", "Liberty", "Bradesco", "Suhai", "Mitsui Sumitomo"];

// Hífen inquebrável: "e-tron" nunca quebra em "e-" / "tron".
export function esc(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/-/g, "‑");
}

export const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const num = (n, d = 0) => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: d });
export const price = (n) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function page({ width, height, bg, body, extraCss = "" }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body { background: ${bg}; font-family: Inter, sans-serif; -webkit-font-smoothing: antialiased; position: relative; }
  .label { font-family: Manrope; font-weight: 800; font-size: 26px; letter-spacing: .18em; text-transform: uppercase; color: ${C.gold}; }
  .serif { font-family: "Cormorant Garamond", serif; font-weight: 600; }
  .num { font-family: Manrope; font-weight: 800; letter-spacing: -.02em; }
  .rule { height: 2px; background: ${C.gold}; }
  .logo { position: absolute; width: 104px; }
  .foot { position: absolute; left: 80px; right: 80px; bottom: 64px; display: flex; justify-content: space-between; align-items: center;
          font-size: 24px; font-weight: 500; }
  .arc { position: absolute; border-radius: 50%; border: 2px solid; pointer-events: none; }
  ${extraCss}
</style></head><body>${body}</body></html>`;
}

// Arco de proteção: círculos abertos, cortados pela borda da peça.
function arcs(color, { right = -520, top = -260, size = 1100 } = {}) {
  return [0, 70, 140]
    .map((d, i) => `<div class="arc" style="width:${size - d * 2}px;height:${size - d * 2}px;right:${right + d}px;top:${top + d}px;border-color:${color};opacity:${0.45 - i * 0.12}"></div>`)
    .join("");
}

function footer({ dark, text, page: n, total }) {
  const color = dark ? C.grey : C.graphite;
  return `<div class="foot" style="color:${color}"><span>${esc(text)}</span>${n ? `<span class="num" style="font-size:24px;color:${dark ? C.goldSoft : C.gold}">${n}/${total}</span>` : ""}</div>`;
}

const CAROUSEL = { width: 1080, height: 1350 };

// ---------- Carrossel "Carro da semana" ----------

export function weekCarSlides(car, cost, kit) {
  const total = 4;
  const brand = car.brand;
  const model = car.name.replace(new RegExp(`^${brand}\\s+`, "i"), "");

  const cover = page({
    ...CAROUSEL, bg: C.navy,
    body: `${arcs(C.gold, { right: -640, top: -620 })}
      <img class="logo" src="${kit.logoGold}" style="left:80px;top:80px">
      <div style="position:absolute;left:80px;right:80px;top:330px">
        <div class="label">Carro da semana</div>
        <div class="rule" style="width:120px;margin:36px 0 44px"></div>
        <div style="font-family:Manrope;font-weight:700;font-size:44px;color:${C.goldSoft}">${esc(brand)}</div>
        <div class="num" style="font-size:${model.length > 16 ? 104 : 132}px;line-height:1.02;color:${C.white};margin-top:8px">${esc(model)}</div>
        <div class="num" style="font-size:60px;color:${C.goldSoft};margin-top:36px">${brl(car.price)}</div>
      </div>
      <div class="serif" style="position:absolute;left:80px;right:80px;bottom:170px;font-size:58px;line-height:1.15;color:${C.white};font-style:italic">
        ${num(car.rangeKm)} km de autonomia.<br>Quanto custa rodar e segurar?</div>
      ${footer({ dark: true, text: "Arraste para o lado →", page: 1, total })}`,
  });

  const facts = [
    ["Autonomia", `${num(car.rangeKm)} km`, "ciclo INMETRO"],
    ["Potência", car.powerCv ? `${num(car.powerCv)} cv` : "—", car.torqueNm ? `${num(car.torqueNm)} Nm de torque` : ""],
    ["Porta-malas", car.trunkL ? `${num(car.trunkL)} L` : "—", ""],
    ["Bateria", car.batteryKwh ? `${num(car.batteryKwh, 1)} kWh` : "—", car.dcKw ? `recarga rápida até ${num(car.dcKw)} kW` : ""],
  ];
  const spec = page({
    ...CAROUSEL, bg: C.ivory,
    body: `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Ficha resumida</div>
        <div class="num" style="font-size:64px;color:${C.navy};margin-top:24px;line-height:1.05">${esc(car.name)}</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:330px;display:grid;grid-template-columns:1fr 1fr;gap:0">
        ${facts.map(([k, v, note], i) => `
          <div style="padding:44px 0 0 ${i % 2 ? 48 : 0}px;border-top:2px solid ${i < 2 ? C.gold : "#E2E2DC"};${i % 2 ? `border-left:2px solid #E2E2DC;` : ""}min-height:330px">
            <div style="font-size:30px;font-weight:600;color:${C.graphite}">${k}</div>
            <div class="num" style="font-size:96px;color:${C.navy};margin-top:14px">${v}</div>
            <div style="font-size:26px;color:${C.graphite};margin-top:10px">${esc(note)}</div>
          </div>`).join("")}
      </div>
      ${footer({ dark: false, text: "Dados conferidos nas fontes oficiais · Escolha seu EV", page: 2, total })}`,
  });

  const max = Math.max(cost.gasPer1000, cost.evPer1000);
  const bar = (label, value, color, textColor) => `
    <div style="margin-top:48px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;color:${C.white}">
        <span style="font-size:32px;font-weight:600">${label}</span>
        <span class="num" style="font-size:64px;color:${textColor}">${brl(value)}</span></div>
      <div style="height:28px;background:rgba(255,255,255,.08);border-radius:6px;margin-top:18px">
        <div style="height:28px;width:${Math.max(4, (value / max) * 100)}%;background:${color};border-radius:6px"></div></div>
    </div>`;
  const running = page({
    ...CAROUSEL, bg: C.navy,
    body: `${arcs(C.gold, { right: -820, top: 860 })}
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Quanto custa rodar</div>
        <div class="serif" style="font-size:76px;line-height:1.1;color:${C.white};margin-top:28px">A cada <span style="color:${C.goldSoft}">1.000 km</span>, só de energia ou combustível</div>
        ${bar("Carro a gasolina (12 km/l)", cost.gasPer1000, C.grey, C.white)}
        ${bar(esc(car.name), cost.evPer1000, C.gold, C.goldSoft)}
        <div class="rule" style="margin:64px 0 40px;opacity:.5"></div>
        <div style="font-size:36px;color:${C.white};line-height:1.35">Economia de <strong class="num" style="color:${C.goldSoft};font-size:44px">${brl(cost.gasPer1000 - cost.evPer1000)}</strong> a cada 1.000 km.
          ${cost.maintTotal ? `<br>Revisões: <strong class="num" style="color:${C.goldSoft};font-size:44px">${brl(cost.maintTotal)}</strong> até ${num(cost.maintKm / 1000)} mil km.` : ""}</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:150px;font-size:22px;line-height:1.45;color:${C.grey}">
        Estimativa: consumo INMETRO de ${num(car.consumptionKwh100, 1)} kWh/100 km, energia a R$ ${price(kit.energyPrice)}/kWh
        e gasolina a R$ ${price(kit.fuelPrice)}/l. ${cost.maintTotal ? "Revisões pelo plano oficial da marca." : ""}</div>
      ${footer({ dark: true, text: "Simule com os seus números no Escolha seu EV", page: 3, total })}`,
  });

  return [cover, spec, running, ctaSlide(kit, { title: "E o seguro?", line: `Quanto custa segurar um ${esc(model)}? Cote em 8 seguradoras de uma vez, sem esperar corretor, e fale com a D&B só para fechar.`, page: 4, total })];
}

// ---------- Carrossel "Seguro em minutos" ----------
// O post que vende o canal: cotar online é mais prático e rápido que ligar e
// esperar. Um tema por semana, em rodízio. Só afirmações verificáveis: 8
// seguradoras, ofertas na tela, D&B retorna em até 1 dia útil para fechar.

const OLD_WAY = ["Ligar em horário comercial", "Passar seus dados por telefone", "Esperar o corretor cotar uma seguradora por vez", "Receber o preço horas ou dias depois"];
const NEW_WAY = ["Cotar a qualquer hora, até de madrugada", "Preencher uma vez, pelo celular", "8 seguradoras calculando ao mesmo tempo", "Ofertas na tela em poucos minutos"];
const STEPS = [
  ["Preencha os dados", "Carro, CEP e condutor principal. Leva poucos minutos."],
  ["Compare as ofertas", "As 8 seguradoras respondem na tela, com preço, franquia e cobertura."],
  ["Escolha e feche", "Escolha o plano e a forma de pagamento. A D&B fala com você em até 1 dia útil só para concluir."],
];

export const QUOTE_THEMES = [
  {
    id: "jeito-antigo", kicker: "Seguro auto", title: "Ainda liga para pedir cotação?", sub: "Tem um jeito mais rápido.",
    slides: ["versus", "steps"], cta: "Cote agora",
  },
  {
    // Na segunda posição para cair na semana de 02/11/2026, a primeira com o tema.
    id: "apolice", kicker: "Já tem seguro?", title: "Mande a apólice. A gente preenche.", sub: "E compare o seu seguro com 8 seguradoras.",
    slides: ["policy", "insurers"], cta: "Compare o seu seguro",
  },
  {
    id: "tres-passos", kicker: "Seguro auto", title: "Seguro auto em 3 passos", sub: "Sem ligação e sem esperar retorno.",
    slides: ["steps", "insurers"], cta: "Faça o teste",
  },
  {
    id: "oito-seguradoras", kicker: "Seguro auto", title: "8 seguradoras. Uma cotação.", sub: "Compare preço, franquia e cobertura lado a lado.",
    slides: ["insurers", "versus"], cta: "Compare agora",
  },
  {
    id: "renovacao", kicker: "Renovação", title: "Seu seguro vence nos próximos 60 dias?", sub: "Cote antes e compare com a proposta de renovação.",
    slides: [{ list: "O que ter em mãos", items: ["O PDF da apólice atual, que já preenche quase tudo", "CEP onde o carro dorme", "Dados do condutor principal", "Marca, modelo e ano do carro"] }, "steps"], cta: "Cote antes de vencer",
  },
  {
    id: "carro-novo", kicker: "Carro novo", title: "Vai buscar o carro novo?", sub: "Deixe o seguro encaminhado antes da entrega.",
    slides: [{ list: "Antes de sair da loja", items: ["Cote com o modelo e o ano do carro", "Compare as ofertas de 8 seguradoras", "Escolha o plano e a forma de pagamento", "A D&B conclui a contratação com você"] }, "steps"], cta: "Cote o seu",
  },
];

function quoteCover(theme, kit, n, total) {
  return page({
    ...CAROUSEL, bg: C.navy,
    body: `${arcs(C.gold, { right: -640, top: -620 })}
      <img class="logo" src="${kit.logoGold}" style="left:80px;top:80px">
      <div style="position:absolute;left:80px;right:80px;top:380px">
        <div class="label">${esc(theme.kicker)}</div>
        <div class="rule" style="width:120px;margin:36px 0 48px"></div>
        <div class="num" style="font-size:${theme.title.length > 30 ? 104 : 124}px;line-height:1.03;color:${C.white}">${esc(theme.title)}</div>
        <div class="serif" style="font-size:64px;line-height:1.15;color:${C.goldSoft};font-style:italic;margin-top:48px">${esc(theme.sub)}</div>
      </div>
      ${footer({ dark: true, text: "Arraste para o lado →", page: n, total })}`,
  });
}

function versusSlide(kit, n, total) {
  const col = (title, items, mine) => `
    <div style="flex:1;${mine ? `background:${C.navy};color:${C.white};` : `color:${C.graphite};`}border-radius:12px;padding:44px 36px">
      <div style="font-family:Manrope;font-weight:800;font-size:34px;color:${mine ? C.goldSoft : C.graphite}">${title}</div>
      ${items.map((t) => `<div style="display:flex;gap:16px;margin-top:34px;font-size:31px;line-height:1.3">
        <span style="flex:none;width:30px;font-weight:700;color:${mine ? C.gold : C.grey}">${mine ? "✓" : "✕"}</span><span>${esc(t)}</span></div>`).join("")}
    </div>`;
  return page({
    ...CAROUSEL, bg: C.ivory,
    body: `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Compare</div>
        <div class="num" style="font-size:64px;color:${C.navy};margin-top:24px;line-height:1.05">Ligar e esperar<br>ou cotar online?</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:400px;display:flex;gap:24px">
        ${col("Do jeito antigo", OLD_WAY, false)}${col("Na D&amp;B", NEW_WAY, true)}
      </div>
      ${footer({ dark: false, text: kit.signature, page: n, total })}`,
  });
}

function stepsSlide(kit, n, total) {
  return page({
    ...CAROUSEL, bg: C.navy,
    body: `${arcs(C.gold, { right: -820, top: 860 })}
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Como funciona</div>
        <div class="serif" style="font-size:80px;line-height:1.08;color:${C.white};margin-top:28px">Do formulário à apólice, <span style="font-style:italic;color:${C.goldSoft}">sem fila</span></div>
        ${STEPS.map(([title, text], i) => `
          <div style="display:flex;gap:40px;margin-top:${i ? 52 : 72}px;align-items:flex-start">
            <div class="num" style="flex:none;width:96px;height:96px;border:2px solid ${C.gold};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:48px;color:${C.goldSoft}">${i + 1}</div>
            <div><div style="font-family:Manrope;font-weight:800;font-size:44px;color:${C.white}">${title}</div>
              <div style="font-size:31px;line-height:1.4;color:#C9D1DA;margin-top:10px">${esc(text)}</div></div>
          </div>`).join("")}
      </div>
      ${footer({ dark: true, text: "Cotação online · D&B Corretora", page: n, total })}`,
  });
}

function insurersSlide(kit, n, total) {
  return page({
    ...CAROUSEL, bg: C.ivory,
    body: `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Numa tela só</div>
        <div class="num" style="font-size:64px;color:${C.navy};margin-top:24px;line-height:1.05">As 8 seguradoras que<br>calculam o seu seguro</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:420px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
        ${INSURERS.map((name) => `<div style="border:2px solid #E2E2DC;border-left:4px solid ${C.gold};border-radius:12px;padding:30px 28px;font-family:Manrope;font-weight:700;font-size:38px;color:${C.navy}">${name}</div>`).join("")}
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:150px;font-size:30px;line-height:1.4;color:${C.graphite}">Cada uma devolve preço, franquia e cobertura. Você compara e escolhe; a D&amp;B cuida do resto.</div>
      ${footer({ dark: false, text: kit.signature, page: n, total })}`,
  });
}

function listSlide(kit, { list, items }, n, total) {
  return page({
    ...CAROUSEL, bg: C.ivory,
    body: `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Checklist</div>
        <div class="num" style="font-size:72px;color:${C.navy};margin-top:24px;line-height:1.05">${esc(list)}</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:420px">
        ${items.map((t, i) => `<div style="display:flex;gap:32px;align-items:center;padding:36px 0;border-top:2px solid ${i ? "#E2E2DC" : C.gold}">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${C.gold}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span style="font-size:40px;font-weight:500;color:${C.navy}">${esc(t)}</span></div>`).join("")}
      </div>
      ${footer({ dark: false, text: kit.signature, page: n, total })}`,
  });
}

// O que a cotação lê da apólice em PDF (src/policyReader.js). Só PDF com
// texto: foto ou digitalização não funciona, por isso o slide fala em PDF.
const POLICY_FIELDS = ["Carro, ano e código FIPE", "Dados do condutor principal", "CEP onde o carro dorme", "Seguradora, vencimento e bônus"];

function policySlide(kit, n, total) {
  return page({
    ...CAROUSEL, bg: C.ivory,
    body: `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">
      <div style="position:absolute;left:80px;right:80px;top:110px">
        <div class="label">Como funciona</div>
        <div class="num" style="font-size:64px;color:${C.navy};margin-top:24px;line-height:1.05">Envie o PDF da apólice<br>e confira o que foi preenchido</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:420px;display:flex;gap:36px;align-items:center">
        <div style="flex:none;width:250px;height:320px;background:${C.white};border:2px solid #E2E2DC;border-radius:14px;position:relative;padding:38px 30px">
          <div style="position:absolute;right:-2px;top:-2px;width:64px;height:64px;background:${C.ivory};border-left:2px solid #E2E2DC;border-bottom:2px solid #E2E2DC;border-bottom-left-radius:14px"></div>
          <div style="font-family:Manrope;font-weight:800;font-size:28px;color:${C.navy};margin-top:70px">apólice.pdf</div>
          ${[100, 78, 90].map((w) => `<div style="height:12px;width:${w}%;background:#E8E6DF;border-radius:6px;margin-top:20px"></div>`).join("")}
          <div style="position:absolute;left:30px;bottom:30px;background:${C.navy};color:${C.goldSoft};font-family:Manrope;font-weight:800;font-size:20px;letter-spacing:.12em;padding:8px 14px;border-radius:6px">PDF</div>
        </div>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="${C.gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <div style="flex:1">
          ${POLICY_FIELDS.map((t, i) => `<div style="display:flex;gap:20px;align-items:center;padding:24px 0;border-top:2px solid ${i ? "#E2E2DC" : C.gold}">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="${C.gold}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M20 6 9 17l-5-5"/></svg>
            <span style="font-size:32px;font-weight:500;line-height:1.25;color:${C.navy}">${esc(t)}</span></div>`).join("")}
        </div>
      </div>
      <div style="position:absolute;left:80px;right:80px;top:880px;font-size:34px;line-height:1.4;color:${C.graphite}">
        Você só completa o que faltar. Depois, 8 seguradoras calculam ao mesmo tempo.</div>
      <div style="position:absolute;left:80px;right:80px;bottom:150px;display:flex;gap:18px;align-items:flex-start;font-size:26px;line-height:1.4;color:${C.graphite}">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${C.gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none;margin-top:2px"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        <span>O arquivo é lido no seu próprio aparelho e não é enviado para ninguém. Se preferir, preencha à mão.</span></div>
      ${footer({ dark: false, text: kit.signature, page: n, total })}`,
  });
}

export function quoteSlides(theme, kit) {
  const total = theme.slides.length + 2;
  const body = theme.slides.map((s, i) => {
    const n = i + 2;
    if (s === "versus") return versusSlide(kit, n, total);
    if (s === "steps") return stepsSlide(kit, n, total);
    if (s === "insurers") return insurersSlide(kit, n, total);
    if (s === "policy") return policySlide(kit, n, total);
    return listSlide(kit, s, n, total);
  });
  return [
    quoteCover(theme, kit, 1, total),
    ...body,
    ctaSlide(kit, { title: `${esc(theme.cta)}.`, line: "Cote em 8 seguradoras de uma vez, a qualquer hora, e fale com a D&amp;B só para fechar.", page: total, total }),
  ];
}

function ctaSlide(kit, { title, line, page: n, total }) {
  return page({
    ...CAROUSEL, bg: C.navy2,
    body: `${arcs(C.gold, { right: -560, top: 880 })}
      <div style="position:absolute;left:80px;right:80px;top:200px">
        <div class="serif" style="font-size:112px;line-height:1.02;color:${C.white};font-style:italic">${title}</div>
        <div class="rule" style="width:120px;margin:52px 0 44px"></div>
        <div style="font-size:40px;line-height:1.4;color:${C.white}">${line}</div>
        <div style="margin-top:56px;display:flex;flex-wrap:wrap;gap:14px 16px">
          ${INSURERS.map((name) => `<span style="font-size:26px;font-weight:500;color:${C.goldSoft};border:1.5px solid rgba(228,195,119,.45);border-radius:999px;padding:10px 22px">${name}</span>`).join("")}
        </div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:190px;display:flex;align-items:center;gap:40px">
        <div style="background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:30px;letter-spacing:.08em;padding:30px 44px;border-radius:12px">COTAR SEGURO · LINK NA BIO</div>
        <img src="${kit.logoGold}" style="width:104px;margin-left:auto">
      </div>
      ${footer({ dark: true, text: kit.signature, page: n, total })}`,
  });
}


// ---------- Reels (1080x1920, animação em CSS, capturada quadro a quadro) ----------
// "Seguro do <carro da semana>? Ainda vai ligar e esperar?" → o jeito antigo
// riscado → 8 seguradoras respondendo → chamada. Tudo é animação CSS, para o
// gerador conseguir posicionar o tempo de cada quadro com exatidão. O texto
// fica entre 300 e 1500 px de altura, fora das áreas cobertas pela interface
// do Instagram.

export const REELS_SECONDS = 15;
export const REELS_COVER_SECONDS = 11.8;

export function reelsPage(car, kit) {
  const scenes = [[0, 3.4], [3.4, 8.4], [8.4, 12.4], [12.4, REELS_SECONDS + 1]];
  const p = (t) => `${((Math.max(0, Math.min(REELS_SECONDS, t)) / REELS_SECONDS) * 100).toFixed(3)}%`;
  // Anima variáveis (--o, --y) e não opacity/transform direto: o Chrome roda
  // opacity no compositor e, com a animação pausada e reposicionada a cada
  // quadro, a captura saía com um valor velho (cena quase apagada).
  const sceneCss = scenes.map(([s, e], i) => {
    const first = s === 0;
    const last = e > REELS_SECONDS;
    return `@keyframes s${i} { 0% { --o: ${first ? 1 : 0} } ${p(s)} { --o: ${first ? 1 : 0}; --y: ${first ? 0 : 30}px }
      ${p(s + 0.4)} { --o: 1; --y: 0px } ${p(e - 0.3)} { --o: 1 } ${p(e)} { --o: ${last ? 1 : 0} } 100% { --o: ${last ? 1 : 0} } }
      .s${i} { animation: s${i} ${REELS_SECONDS}s linear both; }`;
  }).join("\n");
  const pop = (name, start) => `
    @keyframes p-${name} { from { --o: 0; --y: 24px } to { --o: 1; --y: 0px } }
    .${name} { animation: p-${name} .45s ${start}s ease-out both; }`;
  const strike = (name, start) => `
    @keyframes k-${name} { from { width: 0 } to { width: 100% } }
    .${name} { animation: k-${name} .35s ${start}s ease-in both; }`;

  const old = ["Ligar em horário comercial", "Passar dados por telefone", "Esperar o retorno"];
  const css = `${sceneCss}
    ${pop("hook2", 1.1)}
    ${old.map((_, i) => pop(`old${i}`, 3.8 + i * 0.45)).join("\n")}
    ${old.map((_, i) => strike(`cut${i}`, 5.6 + i * 0.3)).join("\n")}
    ${pop("now", 6.9)}
    ${INSURERS.map((_, i) => pop(`ins${i}`, 9.3 + i * 0.32)).join("\n")}
    @property --o { syntax: "<number>"; inherits: false; initial-value: 1; }
    @property --y { syntax: "<length>"; inherits: false; initial-value: 0px; }
    .scene, .hook2, .now, ${old.map((_, i) => `.old${i}`).join(", ")}, ${INSURERS.map((_, i) => `.ins${i}`).join(", ")} { opacity: var(--o); transform: translateY(var(--y)); }
    .scene { position: absolute; left: 90px; right: 90px; }
  `;
  const model = car.name.replace(new RegExp(`^${car.brand}\\s+`, "i"), "");

  return page({
    width: 1080, height: 1920, bg: C.navy, extraCss: css,
    body: `${arcs(C.gold, { right: -620, top: -560, size: 1300 })}
      <div class="scene s0" style="top:500px">
        <div class="label" style="font-size:30px">Seguro auto</div>
        <div class="num" style="font-size:${model.length > 16 ? 104 : 124}px;line-height:1.03;color:${C.white};margin-top:24px">Seguro do ${esc(model)}?</div>
        <div class="rule" style="width:140px;margin:60px 0"></div>
        <div class="serif hook2" style="font-size:100px;line-height:1.05;color:${C.goldSoft};font-style:italic">Ainda vai ligar e esperar?</div>
      </div>
      <div class="scene s1" style="top:480px">
        <div class="label" style="font-size:30px;color:${C.grey}">Do jeito antigo</div>
        ${old.map((t, i) => `<div class="old${i}" style="position:relative;display:inline-block;margin-top:56px;font-size:60px;font-weight:600;color:#C9D1DA">${esc(t)}
          <span class="cut${i}" style="position:absolute;left:-6px;top:52%;height:6px;background:${C.gold};border-radius:3px"></span></div><br>`).join("")}
        <div class="now serif" style="margin-top:110px;font-size:110px;line-height:1.02;color:${C.white}">Na D&amp;B, é <span style="font-style:italic;color:${C.goldSoft}">online.</span></div>
      </div>
      <div class="scene s2" style="top:380px">
        <div class="num" style="font-size:112px;line-height:1.02;color:${C.white}">8 seguradoras.<br><span style="color:${C.goldSoft}">Uma cotação.</span></div>
        <div style="margin-top:60px">
          ${INSURERS.map((name, i) => `<div class="ins${i}" style="display:flex;align-items:center;gap:26px;padding:15px 0;border-bottom:1.5px solid rgba(228,195,119,.25)">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="${C.gold}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span style="font-size:46px;font-weight:600;color:${C.goldSoft}">${name}</span></div>`).join("")}
        </div>
      </div>
      <div class="scene s3" style="top:440px;text-align:center">
        <img src="${kit.logoGold}" style="width:230px">
        <div class="serif" style="font-size:96px;line-height:1.06;color:${C.white};margin-top:70px">Cote em minutos,<br><span style="font-style:italic;color:${C.goldSoft}">a qualquer hora</span></div>
        <div style="font-size:40px;color:#C9D1DA;margin-top:44px;line-height:1.35">A D&amp;B fala com você só para fechar.</div>
        <div style="display:inline-block;margin-top:70px;background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:40px;letter-spacing:.08em;padding:34px 56px;border-radius:14px">LINK NA BIO</div>
        <div style="font-size:30px;color:${C.grey};margin-top:48px">${esc(kit.signature)}</div>
      </div>`,
  });
}
