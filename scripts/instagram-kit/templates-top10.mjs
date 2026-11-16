// Ação "10 carros elétricos e híbridos até R$ 200 mil" (parte 2 da ação dos
// elétricos até R$ 150 mil). Critério verificável, sem "os melhores": os 5
// elétricos e os 5 híbridos mais em conta do catálogo até o teto, uma versão
// por modelo. Cada item traz { car, kind: "BEV"|"PHEV"|"HEV", per1000, label }:
// elétrico = energia a cada 1.000 km; híbrido = gasolina a cada 1.000 km pelo
// consumo oficial (no plug-in, sem contar a recarga: estimativa conservadora).
//
// Reels 1080x1920 (abertura + 10 cenas curtas + chamada), carrossel com
// 2 carros por slide (a API aceita no máximo 10 imagens) e 2 Stories.

import { C, INSURERS, esc, brl, num, price, page, arcs } from "./templates.mjs";
import { timeline, pop, punch, slide, count, grow } from "./templates-acao.mjs";

export const TOP10_SECONDS = 25;
export const TOP10_COVER_SECONDS = 1.9;
export const TOP10_CAP = 200000;

const model = (car) => car.name.replace(new RegExp(`^${car.brand}\\s+`, "i"), "");
const KIND = { BEV: "Elétrico", PHEV: "Híbrido plug-in", HEV: "Híbrido" };
const capLabel = () => `R$&nbsp;${Math.round(TOP10_CAP / 1000)}&nbsp;mil`;

function tag(kind, size = 26) {
  const ev = kind === "BEV";
  return `<span style="display:inline-block;font-family:Manrope;font-weight:800;font-size:${size}px;letter-spacing:.1em;text-transform:uppercase;padding:${Math.round(size * 0.35)}px ${Math.round(size * 0.8)}px;border-radius:999px;${ev ? `background:${C.goldSoft};color:${C.navy}` : `border:2px solid ${C.goldSoft};color:${C.goldSoft}`}">${KIND[kind]}</span>`;
}

export function top10ReelsPage(items, kit) {
  // items[0] = mais em conta; a sequência vai do mais caro ao mais em conta.
  const order = [...items].reverse();
  const HOOK = 2.6;
  const STEP = 1.9;
  const end = HOOK + STEP * order.length; // 21.6
  const scenes = [[0, HOOK], ...order.map((_, i) => [HOOK + STEP * i, HOOK + STEP * (i + 1)]), [end, TOP10_SECONDS]];
  const css = `${timeline(scenes, TOP10_SECONDS)}
    ${punch("h1", 0)}${punch("h2", 0.4)}${punch("h3", 0.8)}${punch("h4", 1.2)}${pop("h5", 1.6)}
    ${order.map((it, i) => {
      const t = HOOK + STEP * i;
      return `${punch(`r${i}`, t + 0.05)}${slide(`m${i}`, t + 0.15)}${count(`p${i}`, t + 0.25, Math.floor(it.car.price / 1000))}
        ${pop(`b${i}`, t + 0.6)}${grow(`gb${i}`, t + 0.65, 100)}${grow(`eb${i}`, t + 0.85, Math.max(5, (it.per1000 / kit.gasPer1000) * 100).toFixed(1))}`;
    }).join("\n")}
    ${punch("c1", end + 0.2)}${pop("c2", end + 0.8)}${pop("c3", end + 1.4)}
    .bar { position:absolute; left:0; top:0; height:12px; background:${C.gold}; animation: grow ${TOP10_SECONDS}s linear both; z-index: 2; }
    @keyframes grow { from { width: 0 } to { width: 100% } }
    .track { height: 28px; background: rgba(255,255,255,.08); border-radius: 8px; margin-top: 12px; overflow: hidden; }
    .fill { height: 28px; border-radius: 8px; }`;

  const scene = (it, i) => {
    const { car, kind, per1000 } = it;
    const pos = i + 1;
    const m = model(car);
    const rest = String(car.price % 1000).padStart(3, "0");
    const row = (label, value, color, fill, valueColor) => `
      <div style="margin-top:30px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <span style="font-size:36px;font-weight:600;color:#C9D1DA">${label}</span>
          <span class="num" style="font-size:54px;color:${valueColor}">${brl(value)}</span></div>
        <div class="track"><div class="fill ${fill}" style="background:${color}"></div></div>
      </div>`;
    const info = kind === "BEV" ? `${num(car.rangeKm)} km de autonomia` : `${num(car.fuelKmL, 1)} km/l${kind === "PHEV" && car.electricRangeKm ? ` · ${num(car.electricRangeKm)} km só na bateria` : ""}`;
    const second = kind === "BEV" ? `Energia no ${esc(m)}` : `Gasolina no ${esc(m)}`;
    return `<div class="scene s${i + 1}" style="top:300px">
      <div style="display:flex;align-items:center;gap:30px">
        <div class="r${i} num" style="font-size:200px;line-height:.85;color:${C.goldSoft}">${pos}</div>
        <div>
          <div class="label" style="font-size:26px;color:${C.grey};margin-bottom:16px">de 10${pos === 10 ? ` · <span style="color:${C.goldSoft}">o mais em conta</span>` : ""}</div>
          ${tag(kind)}
        </div>
      </div>
      <div class="m${i}" style="margin-top:50px">
        <div style="font-family:Manrope;font-weight:700;font-size:50px;color:${C.goldSoft}">${esc(car.brand)}</div>
        <div class="num" style="font-size:${m.length > 16 ? 88 : m.length > 12 ? 104 : 120}px;line-height:1.02;color:${C.white};margin-top:4px">${esc(m)}</div>
      </div>
      <div class="num p${i}" style="font-size:104px;color:${C.goldSoft};margin-top:16px">.${rest}</div>
      <div class="b${i}" style="margin-top:30px">
        <div style="font-size:32px;font-weight:600;color:${C.white}">${info} · a cada 1.000 km:</div>
        ${row("Carro a gasolina comum", kit.gasPer1000, C.grey, `gb${i}`, C.white)}
        ${row(second, per1000, C.gold, `eb${i}`, C.goldSoft)}
      </div>
    </div>`;
  };

  return page({
    width: 1080, height: 1920, bg: C.navy, extraCss: css,
    body: `${arcs(C.gold, { right: -620, top: -560, size: 1300 })}<div class="bar"></div>
      <div class="scene s0" style="left:0;right:0;top:0;bottom:0;background:${C.goldSoft}">
        <div style="position:absolute;left:90px;right:90px;top:400px">
          <div class="h1 num" style="font-size:180px;line-height:.95;color:${C.navy}">10 carros</div>
          <div class="h2 num" style="font-size:132px;line-height:1;color:${C.navy}">elétricos</div>
          <div class="h3 num" style="font-size:132px;line-height:1;color:${C.navy}">e híbridos</div>
          <div class="h4 num" style="white-space:nowrap;font-size:118px;line-height:1;color:${C.white};background:${C.navy};display:inline-block;padding:14px 32px 22px;border-radius:18px;margin-top:26px">até ${capLabel()}</div>
          <div class="h5 serif" style="font-size:74px;line-height:1.1;color:${C.navy};font-style:italic;margin-top:50px">e quanto custa rodar<br>com cada um</div>
        </div>
      </div>
      ${order.map(scene).join("")}
      <div class="scene s${order.length + 1}" style="top:380px">
        <div class="c1 serif" style="font-size:150px;line-height:1;color:${C.white};font-style:italic">E o seguro?</div>
        <div class="c2" style="margin-top:56px">
          <div class="num" style="font-size:76px;line-height:1.08;color:${C.goldSoft}">8 seguradoras calculam ao mesmo tempo.</div>
          <div style="font-size:42px;color:#C9D1DA;margin-top:30px;line-height:1.35">Elétrico ou híbrido: cote pelo celular, a qualquer hora.</div>
        </div>
        <div class="c3" style="margin-top:70px">
          <div style="display:flex;align-items:center;gap:36px">
            <div style="background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:38px;letter-spacing:.08em;padding:30px 48px;border-radius:14px">COTE NO LINK DA BIO</div>
            <img src="${kit.logoGold}" style="width:130px">
          </div>
          <div style="font-size:36px;font-weight:600;color:${C.goldSoft};margin-top:50px">Siga para ver mais carros</div>
          <div style="font-size:24px;color:${C.grey};margin-top:24px;line-height:1.4">Os 5 elétricos e os 5 híbridos mais em conta do nosso catálogo até ${capLabel()}. Preços de tabela verificados em ${esc(kit.verifiedLabel)}. Energia a R$ ${price(kit.energyPrice)}/kWh; gasolina a R$ ${price(kit.fuelPrice)}/l (consumo INMETRO; plug-in sem contar a recarga).</div>
        </div>
      </div>`,
  });
}

const CAROUSEL = { width: 1080, height: 1350 };
const foot = (text, n, total, dark = true) => `<div class="foot" style="color:${dark ? C.grey : C.graphite}"><span>${esc(text)}</span><span class="num" style="font-size:24px;color:${dark ? C.goldSoft : C.gold}">${n}/${total}</span></div>`;

export function top10Carousel(items, kit) {
  const order = [...items].reverse();
  const pairs = [];
  for (let i = 0; i < order.length; i += 2) pairs.push(order.slice(i, i + 2));
  const total = pairs.length + 2;

  const cover = page({
    ...CAROUSEL, bg: C.goldSoft,
    body: `<img class="logo" src="${kit.logoNavy}" style="left:80px;top:80px">
      <div style="position:absolute;left:80px;right:80px;top:260px">
        <div class="num" style="font-size:140px;line-height:.95;color:${C.navy}">10 carros</div>
        <div class="num" style="font-size:104px;line-height:1.02;color:${C.navy}">elétricos<br>e híbridos</div>
        <div class="num" style="white-space:nowrap;font-size:100px;line-height:1;color:${C.white};background:${C.navy};display:inline-block;padding:12px 30px 20px;border-radius:16px;margin-top:26px">até ${capLabel()}</div>
        <div class="serif" style="font-size:58px;line-height:1.12;color:${C.navy};font-style:italic;margin-top:44px">Preço e quanto custa rodar com cada um.</div>
      </div>
      ${foot("Arraste para o lado →", 1, total, false)}`,
  });

  const card = (it, pos, dark) => {
    const { car, kind, per1000 } = it;
    const m = model(car);
    const ink = dark ? C.white : C.navy;
    const sub = dark ? "#C9D1DA" : C.graphite;
    const accent = dark ? C.goldSoft : C.gold;
    const info = kind === "BEV" ? `${num(car.rangeKm)} km de autonomia` : `${num(car.fuelKmL, 1)} km/l${kind === "PHEV" && car.electricRangeKm ? ` · ${num(car.electricRangeKm)} km na bateria` : ""}`;
    const pct = Math.max(5, (per1000 / kit.gasPer1000) * 100).toFixed(1);
    const tagHtml = kind === "BEV"
      ? `<span style="font-family:Manrope;font-weight:800;font-size:20px;letter-spacing:.1em;text-transform:uppercase;padding:7px 16px;border-radius:999px;background:${C.goldSoft};color:${C.navy}">${KIND[kind]}</span>`
      : `<span style="font-family:Manrope;font-weight:800;font-size:20px;letter-spacing:.1em;text-transform:uppercase;padding:5px 14px;border-radius:999px;border:2px solid ${accent};color:${accent}">${KIND[kind]}</span>`;
    return `<div style="padding:52px 0;border-top:2px solid ${dark ? "rgba(228,195,119,.35)" : "#E2E2DC"}">
      <div style="display:flex;align-items:center;gap:22px">
        <span class="num" style="font-size:120px;line-height:.9;color:${accent}">${pos}</span>
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:14px">${tagHtml}${pos === 10 ? `<span class="label" style="font-size:20px;color:${accent}">o mais em conta</span>` : ""}</div>
          <div class="num" style="font-size:${m.length > 18 ? 52 : 60}px;line-height:1.05;color:${ink};margin-top:12px">${esc(car.brand)} ${esc(m)}</div>
        </div>
        <span class="num" style="font-size:52px;color:${accent}">${brl(car.price)}</span>
      </div>
      <div style="font-size:31px;font-weight:600;color:${sub};margin-top:26px">${info} · a cada 1.000 km: <strong class="num" style="color:${ink}">${brl(per1000)}</strong> ${kind === "BEV" ? "de energia" : "de gasolina"}</div>
      <div style="height:26px;background:${dark ? "rgba(255,255,255,.08)" : "#E6E4DD"};border-radius:7px;margin-top:18px">
        <div style="height:26px;width:${pct}%;background:${C.gold};border-radius:6px"></div></div>
    </div>`;
  };

  const slides = pairs.map((pair, s) => {
    const dark = s === pairs.length - 1;
    return page({
      ...CAROUSEL, bg: dark ? C.navy : C.ivory,
      body: `${dark ? arcs(C.gold, { right: -760, top: -700 }) : ""}
        <div style="position:absolute;left:80px;right:80px;top:90px">
          <div class="label" style="color:${dark ? C.goldSoft : C.gold}">Até ${capLabel()} · ${s * 2 + 1} e ${s * 2 + 2} de 10</div>
          <div style="font-size:26px;color:${dark ? C.grey : C.graphite};margin-top:18px">Barra = custo a cada 1.000 km perto do carro a gasolina comum (${brl(kit.gasPer1000)}).</div>
          <div style="margin-top:36px">${pair.map((it, k) => card(it, s * 2 + k + 1, dark)).join("")}</div>
        </div>
        ${foot("Preço de tabela · consumo INMETRO", s + 2, total, dark)}`,
    });
  });

  const cta = page({
    ...CAROUSEL, bg: C.navy2,
    body: `${arcs(C.gold, { right: -560, top: 880 })}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div class="label">E o seguro?</div>
        <div class="serif" style="font-size:96px;line-height:1.04;color:${C.white};font-style:italic;margin-top:30px">Elétrico ou híbrido, quanto custa segurar?</div>
        <div class="rule" style="width:120px;margin:44px 0 40px"></div>
        <div style="font-size:38px;line-height:1.4;color:${C.white}">Cote em 8 seguradoras de uma vez, pelo celular, a qualquer hora. A D&amp;B fala com você só para fechar.</div>
        <div style="margin-top:44px;display:flex;flex-wrap:wrap;gap:14px 16px">
          ${INSURERS.map((name) => `<span style="font-size:26px;font-weight:500;color:${C.goldSoft};border:1.5px solid rgba(228,195,119,.45);border-radius:999px;padding:10px 22px">${name}</span>`).join("")}
        </div>
        <div style="margin-top:44px;font-size:30px;font-weight:600;color:#C9D1DA">Elétrico ou híbrido: qual você escolheria? Comenta.</div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:170px;display:flex;align-items:center;gap:40px">
        <div style="background:${C.goldSoft};color:${C.navy};font-family:Manrope;font-weight:800;font-size:30px;letter-spacing:.08em;padding:30px 44px;border-radius:12px">COTAR SEGURO · LINK NA BIO</div>
        <img src="${kit.logoGold}" style="width:104px;margin-left:auto">
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:110px;font-size:21px;color:${C.grey}">Os 5 elétricos e os 5 híbridos mais em conta do nosso catálogo. Preços verificados em ${esc(kit.verifiedLabel)}, podem mudar.</div>
      ${foot(kit.signature, total, total)}`,
  });

  return [cover, ...slides, cta];
}

export function top10Stories(items, kit) {
  const STORY = { width: 1080, height: 1920 };
  const pill = (text, dark) => `<div style="display:inline-block;background:${dark ? C.navy : C.goldSoft};color:${dark ? C.white : C.navy};font-family:Manrope;font-weight:800;font-size:38px;letter-spacing:.08em;padding:32px 52px;border-radius:14px">${text}</div>`;
  const reels = page({
    ...STORY, bg: C.goldSoft,
    body: `<img src="${kit.logoNavy}" style="position:absolute;left:90px;top:300px;width:150px">
      <div style="position:absolute;left:90px;right:90px;top:580px">
        <div style="display:inline-flex;align-items:center;gap:18px;border:3px solid ${C.navy};border-radius:999px;padding:14px 30px">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="${C.navy}"><path d="M8 5v14l11-7z"/></svg>
          <span class="label" style="font-size:28px;color:${C.navy}">Reels novo · parte 2</span></div>
        <div class="num" style="font-size:118px;line-height:1.02;color:${C.navy};margin-top:56px">Elétrico ou híbrido até ${capLabel()}?</div>
        <div class="serif" style="font-size:80px;line-height:1.08;color:${C.navy};font-style:italic;margin-top:46px">10 opções e quanto custa rodar com cada uma.</div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1420px">${pill("ASSISTA NO PERFIL", true)}</div>`,
  });
  const order = [...items].reverse();
  const list = page({
    ...STORY, bg: C.navy2,
    body: `${arcs(C.gold, { right: -760, top: 1100, size: 1300 })}<img src="${kit.logoGold}" style="position:absolute;left:90px;top:260px;width:130px">
      <div style="position:absolute;left:90px;right:90px;top:450px">
        <div class="label" style="font-size:28px">10 até ${capLabel()}</div>
        <div style="margin-top:28px">
          ${order.map((it, i) => {
            const pos = i + 1;
            const hidden = pos === order.length;
            return `<div style="display:flex;align-items:baseline;gap:22px;padding:13px 0;border-top:2px solid rgba(228,195,119,.25)">
              <span class="num" style="font-size:44px;color:${C.goldSoft};width:56px">${pos}</span>
              <span style="font-size:34px;font-weight:600;color:${C.white};flex:1">${hidden ? "???" : esc(it.car.name)}</span>
              ${hidden
                ? `<span class="serif" style="font-size:44px;font-style:italic;color:${C.goldSoft}">o mais em conta está no post</span>`
                : `<span style="font-size:24px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${it.kind === "BEV" ? C.goldSoft : "#C9D1DA"}">${KIND[it.kind]}</span>`}</div>`;
          }).join("")}
        </div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1420px">${pill("VEJA NO FEED")}</div>`,
  });
  return [reels, list];
}
