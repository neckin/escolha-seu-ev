// Ação "5 carros elétricos até R$ 150 mil": Reels com movimento (abertura em
// cortes rápidos, preço contando, barra contra a gasolina), carrossel com um
// carro por slide e 2 Stories. Feito para turbinar: assunto amplo (carro
// elétrico) que traz gente nova, e no fim "E o seguro?".
//
// Sem superlativos ("o mais barato do Brasil"): é uma lista de opções do
// catálogo verificado do site, com preço de tabela e data. A ordem vai do
// mais caro ao mais em conta da lista, para segurar até o fim.

import { C, INSURERS, esc, brl, num, price, page, arcs } from "./templates.mjs";

export const ACAO_SECONDS = 18;
export const ACAO_COVER_SECONDS = 1.9;
export const PRICE_CAP = 150000;

const model = (car) => car.name.replace(new RegExp(`^${car.brand}\\s+`, "i"), "");

// Cena i aparece de start a end (fade + subida curta). Anima variáveis (--o,
// --y) e não opacity direto: com a animação pausada a cada quadro, o Chrome
// capturava valores velhos de opacity (ver reelsKit em templates.mjs).
function timeline(scenes, seconds) {
  const p = (t) => `${((Math.max(0, Math.min(seconds, t)) / seconds) * 100).toFixed(3)}%`;
  const css = scenes.map(([s, e], i) => {
    const first = s === 0;
    const last = e >= seconds;
    return `@keyframes s${i} { 0% { --o: ${first ? 1 : 0}; --y: ${first ? 0 : 40}px } ${p(s)} { --o: ${first ? 1 : 0}; --y: ${first ? 0 : 40}px }
      ${p(s + 0.25)} { --o: 1; --y: 0px } ${p(e - 0.15)} { --o: 1; --y: 0px } ${p(e)} { --o: ${last ? 1 : 0}; --y: 0px } 100% { --o: ${last ? 1 : 0} } }
      .s${i} { animation: s${i} ${seconds}s linear both; }`;
  }).join("\n");
  return `@property --o { syntax: "<number>"; inherits: false; initial-value: 1; }
    @property --y { syntax: "<length>"; inherits: false; initial-value: 0px; }
    @property --x { syntax: "<length>"; inherits: false; initial-value: 0px; }
    @property --sc { syntax: "<number>"; inherits: false; initial-value: 1; }
    @property --k { syntax: "<integer>"; inherits: true; initial-value: 0; }
    .scene { position: absolute; left: 90px; right: 90px; opacity: var(--o); transform: translateY(var(--y)); }
    ${css}`;
}

const pop = (name, start, dur = 0.35) => `
  @keyframes p-${name} { from { --o: 0; --y: 30px } to { --o: 1; --y: 0px } }
  .${name} { animation: p-${name} ${dur}s ${start}s ease-out both; opacity: var(--o); transform: translateY(var(--y)); }`;

// Palavra que "bate" na tela: entra grande e assenta.
const punch = (name, start) => `
  @keyframes z-${name} { 0% { --o: 0; --sc: 1.7 } 55% { --o: 1; --sc: .94 } 100% { --o: 1; --sc: 1 } }
  .${name} { animation: z-${name} .4s ${start}s cubic-bezier(.2,.8,.2,1) both; opacity: var(--o); transform: scale(var(--sc)); transform-origin: left center; }`;

// Entra deslizando da direita.
const slide = (name, start) => `
  @keyframes x-${name} { from { --o: 0; --x: 160px } to { --o: 1; --x: 0px } }
  .${name} { animation: x-${name} .4s ${start}s cubic-bezier(.2,.8,.2,1) both; opacity: var(--o); transform: translateX(var(--x)); }`;

// Preço contando: os milhares sobem de 0 até o valor; o resto (",990") é fixo.
const count = (name, start, to) => `
  @keyframes c-${name} { from { --k: ${Math.floor(to * 0.7)} } to { --k: ${to} } }
  .${name} { animation: c-${name} .8s ${start}s cubic-bezier(.1,.6,.2,1) both; counter-reset: k var(--k); }
  .${name}::before { content: "R$ " counter(k); }`;

const grow = (name, start, pct) => `
  @keyframes g-${name} { from { width: 0% } to { width: ${pct}% } }
  .${name} { animation: g-${name} .9s ${start}s cubic-bezier(.2,.7,.2,1) both; }`;

export function rankingReelsPage(cars, cost, kit) {
  // cars[0] = mais em conta. A sequência mostra do mais caro ao mais em conta.
  const order = [...cars].reverse();
  const HOOK = 2.4;
  const STEP = 2.4;
  const end = HOOK + STEP * order.length; // 14.4
  const scenes = [[0, HOOK], ...order.map((_, i) => [HOOK + STEP * i, HOOK + STEP * (i + 1)]), [end, ACAO_SECONDS]];
  const capK = Math.round(PRICE_CAP / 1000);
  const css = `${timeline(scenes, ACAO_SECONDS)}
    ${punch("h1", 0)}${punch("h2", 0.45)}${punch("h3", 0.9)}${pop("h4", 1.4)}
    ${order.map((car, i) => {
      const t = HOOK + STEP * i;
      return `${punch(`r${i}`, t + 0.05)}${slide(`m${i}`, t + 0.2)}${count(`p${i}`, t + 0.35, Math.floor(car.price / 1000))}
        ${pop(`b${i}`, t + 0.9)}${grow(`gb${i}`, t + 1.0, 100)}${grow(`eb${i}`, t + 1.25, Math.max(5, (cost(car).evPer1000 / kit.gasPer1000) * 100).toFixed(1))}`;
    }).join("\n")}
    ${punch("c1", end + 0.2)}${pop("c2", end + 0.9)}${pop("c3", end + 1.6)}
    .bar { position:absolute; left:0; top:0; height:12px; background:${C.gold}; animation: grow ${ACAO_SECONDS}s linear both; z-index: 2; }
    @keyframes grow { from { width: 0 } to { width: 100% } }
    .track { height: 30px; background: rgba(255,255,255,.08); border-radius: 8px; margin-top: 14px; overflow: hidden; }
    .fill { height: 30px; border-radius: 8px; }`;

  const carScene = (car, i) => {
    const pos = i + 1;
    const m = model(car);
    const c = cost(car);
    const rest = String(car.price % 1000).padStart(3, "0");
    const barRow = (label, value, color, fillClass, valueColor) => `
      <div style="margin-top:34px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <span style="font-size:38px;font-weight:600;color:#C9D1DA">${label}</span>
          <span class="num" style="font-size:56px;color:${valueColor}">${brl(value)}</span></div>
        <div class="track"><div class="fill ${fillClass}" style="background:${color}"></div></div>
      </div>`;
    return `<div class="scene s${i + 1}" style="top:300px">
      <div style="display:flex;align-items:center;gap:30px">
        <div class="r${i} num" style="font-size:200px;line-height:.85;color:${C.goldSoft}">${pos}</div>
        <div class="label" style="font-size:28px;color:${C.grey};line-height:1.4">de 5<br>${pos === 5 ? `<span style="color:${C.goldSoft}">o mais em conta<br>da lista</span>` : "até R$ 150 mil"}</div>
      </div>
      <div class="m${i}" style="margin-top:56px">
        <div style="font-family:Manrope;font-weight:700;font-size:52px;color:${C.goldSoft}">${esc(car.brand)}</div>
        <div class="num" style="font-size:${m.length > 13 ? 104 : 124}px;line-height:1.02;color:${C.white};margin-top:4px">${esc(m)}</div>
      </div>
      <div class="num p${i}" style="font-size:110px;color:${C.goldSoft};margin-top:20px;letter-spacing:-.02em">.${rest}</div>
      <div class="b${i}" style="margin-top:36px">
        <div style="font-size:34px;font-weight:600;color:${C.white}">${num(car.rangeKm)} km de autonomia · a cada 1.000 km:</div>
        ${barRow("Gasolina", kit.gasPer1000, C.grey, `gb${i}`, C.white)}
        ${barRow(`Energia no ${esc(m)}`, c.evPer1000, C.gold, `eb${i}`, C.goldSoft)}
      </div>
    </div>`;
  };

  return page({
    width: 1080, height: 1920, bg: C.navy, extraCss: css,
    body: `${arcs(C.gold, { right: -620, top: -560, size: 1300 })}<div class="bar"></div>
      <div class="scene s0" style="left:0;right:0;top:0;bottom:0;background:${C.goldSoft}">
        <div style="position:absolute;left:90px;right:90px;top:430px">
          <div class="h1 num" style="font-size:190px;line-height:.95;color:${C.navy}">5 carros</div>
          <div class="h2 num" style="font-size:190px;line-height:.95;color:${C.navy}">elétricos</div>
          <div class="h3 num" style="white-space:nowrap;font-size:124px;line-height:1;color:${C.white};background:${C.navy};display:inline-block;padding:14px 34px 22px;border-radius:18px;margin-top:30px">até R$&nbsp;${capK}&nbsp;mil</div>
          <div class="h4 serif" style="font-size:78px;line-height:1.1;color:${C.navy};font-style:italic;margin-top:56px">e quanto custa rodar<br>com cada um</div>
        </div>
      </div>
      ${order.map(carScene).join("")}
      <div class="scene s${order.length + 1}" style="top:380px">
        <div class="c1 serif" style="font-size:150px;line-height:1;color:${C.white};font-style:italic">E o seguro?</div>
        <div class="c2" style="margin-top:56px">
          <div class="num" style="font-size:76px;line-height:1.08;color:${C.goldSoft}">8 seguradoras calculam ao mesmo tempo.</div>
          <div style="font-size:42px;color:#C9D1DA;margin-top:30px;line-height:1.35">Pelo celular, a qualquer hora, sem esperar retorno.</div>
        </div>
        <div class="c3" style="margin-top:70px">
          <div style="display:flex;align-items:center;gap:36px">
            <div style="background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:38px;letter-spacing:.08em;padding:30px 48px;border-radius:14px">COTE NO LINK DA BIO</div>
            <img src="${kit.logoGold}" style="width:130px">
          </div>
          <div style="font-size:36px;font-weight:600;color:${C.goldSoft};margin-top:50px">Siga para ver mais carros elétricos</div>
          <div style="font-size:24px;color:${C.grey};margin-top:24px;line-height:1.4">Preços de tabela verificados em ${esc(kit.verifiedLabel)}. Energia a R$ ${price(kit.energyPrice)}/kWh (consumo INMETRO); gasolina a R$ ${price(kit.fuelPrice)}/l, 12 km/l.</div>
        </div>
      </div>`,
  });
}

// Legenda por cima do vídeo de rosto (muita gente assiste sem som). PNG
// transparente 1080x1920, sobreposto pelo ffmpeg durante a abertura.
export function introOverlay(kit, text) {
  return page({
    width: 1080, height: 1920, bg: "transparent",
    body: `<div style="position:absolute;left:70px;right:70px;top:1180px;text-align:center">
        <span style="display:inline;background:${C.navy};color:${C.white};font-family:Manrope;font-weight:800;font-size:64px;line-height:1.45;padding:8px 22px;border-radius:14px;-webkit-box-decoration-break:clone;box-decoration-break:clone">${text}</span>
      </div>
      <img src="${kit.logoGold}" style="position:absolute;right:70px;top:250px;width:120px;filter:drop-shadow(0 2px 8px rgba(0,0,0,.5))">`,
  });
}

const CAROUSEL = { width: 1080, height: 1350 };
const foot = (text, n, total, dark = true) => `<div class="foot" style="color:${dark ? C.grey : C.graphite}"><span>${esc(text)}</span><span class="num" style="font-size:24px;color:${dark ? C.goldSoft : C.gold}">${n}/${total}</span></div>`;

export function rankingCarousel(cars, cost, kit) {
  const total = cars.length + 2;
  const capK = Math.round(PRICE_CAP / 1000);
  const cover = page({
    ...CAROUSEL, bg: C.goldSoft,
    body: `<img class="logo" src="${kit.logoNavy}" style="left:80px;top:80px">
      <div style="position:absolute;left:80px;right:80px;top:290px">
        <div class="num" style="font-size:150px;line-height:.95;color:${C.navy}">5 carros<br>elétricos</div>
        <div class="num" style="white-space:nowrap;font-size:104px;line-height:1;color:${C.white};background:${C.navy};display:inline-block;padding:12px 30px 20px;border-radius:16px;margin-top:28px">até R$&nbsp;${capK}&nbsp;mil</div>
        <div class="serif" style="font-size:62px;line-height:1.12;color:${C.navy};font-style:italic;margin-top:50px">Preço, autonomia e quanto custa rodar com cada um.</div>
      </div>
      ${foot("Arraste para o lado →", 1, total, false)}`,
  });

  const order = [...cars].reverse();
  const slides = order.map((car, i) => {
    const pos = i + 1;
    const last = pos === order.length;
    const c = cost(car);
    const m = model(car);
    const dark = last;
    const ink = dark ? C.white : C.navy;
    const sub = dark ? "#C9D1DA" : C.graphite;
    const accent = dark ? C.goldSoft : C.gold;
    const bar = (label, value, pct, color) => `
      <div style="margin-top:26px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <span style="font-size:30px;font-weight:600;color:${sub}">${label}</span>
          <span class="num" style="font-size:46px;color:${ink}">${brl(value)}</span></div>
        <div style="height:24px;background:${dark ? "rgba(255,255,255,.08)" : "#E6E4DD"};border-radius:6px;margin-top:10px">
          <div style="height:24px;width:${pct}%;background:${color};border-radius:6px"></div></div>
      </div>`;
    return page({
      ...CAROUSEL, bg: dark ? C.navy : C.ivory,
      body: `${dark ? arcs(C.gold, { right: -700, top: -640 }) : `<img class="logo" src="${kit.logoNavy}" style="right:80px;top:80px;width:88px">`}
        <div style="position:absolute;left:80px;right:80px;top:90px">
          <div style="display:flex;align-items:center;gap:26px">
            <div class="num" style="font-size:170px;line-height:.85;color:${accent}">${pos}</div>
            <div class="label" style="font-size:24px;line-height:1.4;color:${dark ? C.goldSoft : C.graphite}">de 5${last ? "<br>o mais em conta da lista" : ""}</div>
          </div>
          <div style="font-family:Manrope;font-weight:700;font-size:42px;color:${sub};margin-top:40px">${esc(car.brand)}</div>
          <div class="num" style="font-size:${m.length > 13 ? 88 : 104}px;line-height:1.02;color:${ink}">${esc(m)}</div>
          <div class="num" style="font-size:80px;color:${accent};margin-top:14px">${brl(car.price)}</div>
          <div style="font-size:32px;font-weight:600;color:${ink};margin-top:34px">${num(car.rangeKm)} km de autonomia${car.powerCv ? ` · ${num(car.powerCv)} cv` : ""}</div>
          <div style="font-size:28px;color:${sub};margin-top:26px">A cada 1.000 km:</div>
          ${bar("Gasolina (12 km/l)", kit.gasPer1000, 100, dark ? C.grey : "#B9BEC4")}
          ${bar(`Energia no ${esc(m)}`, c.evPer1000, Math.max(5, (c.evPer1000 / kit.gasPer1000) * 100).toFixed(1), C.gold)}
        </div>
        ${foot("Preço de tabela · autonomia e consumo INMETRO", i + 2, total, dark)}`,
    });
  });

  const cta = page({
    ...CAROUSEL, bg: C.navy2,
    body: `${arcs(C.gold, { right: -560, top: 880 })}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div class="label">E o seguro?</div>
        <div class="serif" style="font-size:96px;line-height:1.04;color:${C.white};font-style:italic;margin-top:30px">Quanto custa segurar o seu elétrico?</div>
        <div class="rule" style="width:120px;margin:44px 0 40px"></div>
        <div style="font-size:38px;line-height:1.4;color:${C.white}">Cote em 8 seguradoras de uma vez, pelo celular, a qualquer hora. A D&amp;B fala com você só para fechar.</div>
        <div style="margin-top:44px;display:flex;flex-wrap:wrap;gap:14px 16px">
          ${INSURERS.map((name) => `<span style="font-size:26px;font-weight:500;color:${C.goldSoft};border:1.5px solid rgba(228,195,119,.45);border-radius:999px;padding:10px 22px">${name}</span>`).join("")}
        </div>
        <div style="margin-top:44px;font-size:30px;font-weight:600;color:#C9D1DA">Qual dos 5 você levaria? Comenta o número.</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:170px;display:flex;align-items:center;gap:40px">
        <div style="background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:30px;letter-spacing:.08em;padding:30px 44px;border-radius:12px">COTAR SEGURO · LINK NA BIO</div>
        <img src="${kit.logoGold}" style="width:104px;margin-left:auto">
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:110px;font-size:21px;color:${C.grey}">Preços de tabela verificados em ${esc(kit.verifiedLabel)}, podem mudar. Energia a R$ ${price(kit.energyPrice)}/kWh.</div>
      ${foot(kit.signature, total, total)}`,
  });

  return [cover, ...slides, cta];
}

export function rankingStories(cars, kit) {
  const STORY = { width: 1080, height: 1920 };
  const capK = Math.round(PRICE_CAP / 1000);
  const pill = (text, dark) => `<div style="display:inline-block;background:${dark ? C.navy : C.goldSoft};color:${dark ? C.white : C.navy};font-family:Manrope;font-weight:800;font-size:38px;letter-spacing:.08em;padding:32px 52px;border-radius:14px">${text}</div>`;
  const reels = page({
    ...STORY, bg: C.goldSoft,
    body: `<img src="${kit.logoNavy}" style="position:absolute;left:90px;top:300px;width:150px">
      <div style="position:absolute;left:90px;right:90px;top:600px">
        <div style="display:inline-flex;align-items:center;gap:18px;border:3px solid ${C.navy};border-radius:999px;padding:14px 30px">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="${C.navy}"><path d="M8 5v14l11-7z"/></svg>
          <span class="label" style="font-size:28px;color:${C.navy}">Reels novo</span></div>
        <div class="num" style="font-size:120px;line-height:1.02;color:${C.navy};margin-top:60px">Dá pra ter carro elétrico por menos de R$&nbsp;${capK}&nbsp;mil?</div>
        <div class="serif" style="font-size:80px;line-height:1.08;color:${C.navy};font-style:italic;margin-top:46px">Separamos 5 opções.</div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1420px">${pill("ASSISTA NO PERFIL", true)}</div>`,
  });
  const top = [...cars].reverse();
  const list = page({
    ...STORY, bg: C.navy2,
    body: `${arcs(C.gold, { right: -760, top: 1100, size: 1300 })}<img src="${kit.logoGold}" style="position:absolute;left:90px;top:300px;width:150px">
      <div style="position:absolute;left:90px;right:90px;top:520px">
        <div class="label" style="font-size:30px">5 elétricos até R$&nbsp;${capK}&nbsp;mil</div>
        <div style="margin-top:44px">
          ${top.map((car, i) => {
            const pos = i + 1;
            const hidden = pos === top.length;
            return `<div style="display:flex;align-items:baseline;gap:30px;padding:26px 0;border-top:2px solid rgba(228,195,119,.3)">
              <span class="num" style="font-size:64px;color:${C.goldSoft};width:60px">${pos}</span>
              <span style="font-size:46px;font-weight:600;color:${C.white};flex:1">${hidden ? "???" : esc(car.name)}</span>
              <span class="${hidden ? "serif" : "num"}" style="font-size:${hidden ? 52 : 46}px;color:${hidden ? C.goldSoft : "#C9D1DA"};${hidden ? "font-style:italic" : ""}">${hidden ? "o mais em conta" : brl(car.price)}</span></div>`;
          }).join("")}
        </div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1400px">${pill("VEJA NO FEED")}</div>`,
  });
  return [reels, list];
}
