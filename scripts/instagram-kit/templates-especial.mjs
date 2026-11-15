// Especial de domingo: "Domingo de sofá". Foge do visual do kit semanal
// (azul-marinho + serifa): fundo marfim, legendas em caixa no estilo dos
// criadores ("tiny text"), um celular simulando a cotação e cortes rápidos.
// Tema: cotar online é fácil, cômodo e seguro. Só afirma o que o site cumpre
// (PrivacyPage.jsx e InsuranceModal.jsx): dados do formulário não ficam
// guardados no site, PDF da apólice lido no próprio aparelho, LGPD.
// Ícones em SVG (não emoji): o Chrome do runner do GitHub não tem fonte de
// emoji colorido.

import { C, INSURERS, esc } from "./templates.mjs";

const FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap";
const INK = "#0B1F33";
const CREAM = "#F4EFE6";

export const SPECIAL_SECONDS = 16;
export const SPECIAL_COVER_SECONDS = 1.9;

const ICON = {
  sofa: '<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  send: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.02.93l7.93 3.18a2 2 0 0 1 1.11 1.11z"/><path d="m21.85 2.15-10.94 10.94"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};
const icon = (name, size, color, sw = 2.2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;

function doc({ width, height, bg, body, css = "" }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS}">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  body { background: ${bg}; font-family: Inter, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased; position: relative; }
  .m { font-family: Manrope; font-weight: 800; letter-spacing: -.02em; }
  /* Legenda estilo criador: caixa branca, texto preto, cantos arredondados */
  .cap { display: inline-block; background: #fff; color: ${INK}; font-family: Manrope; font-weight: 800; border-radius: 18px;
         padding: 14px 28px; box-shadow: 0 6px 0 rgba(11,31,51,.12); line-height: 1.12; }
  .cap.dark { background: ${INK}; color: #fff; }
  .cap.gold { background: ${C.goldSoft}; color: ${INK}; }
  .dots { position: absolute; inset: 0; background-image: radial-gradient(rgba(11,31,51,.07) 2px, transparent 2px); background-size: 34px 34px; }
  ${css}
</style></head><body>${body}</body></html>`;
}

// ---------- Reels (1080x1920, 16 s) ----------
// Mesma técnica do kit semanal: animação CSS por variáveis (--o, --y, --s),
// pausada e posicionada quadro a quadro pelo build. Texto entre 280 e 1560 px.

function timeline(total) {
  const p = (t) => `${((Math.max(0, Math.min(total, t)) / total) * 100).toFixed(3)}%`;
  const scene = (i, s, e) => {
    const first = s === 0;
    const last = e > total;
    return `@keyframes s${i} { 0% { --o: ${first ? 1 : 0}; --s: ${first ? 1 : 0.94} } ${p(s)} { --o: ${first ? 1 : 0}; --s: ${first ? 1 : 0.94} }
      ${p(s + 0.25)} { --o: 1; --s: 1 } ${p(e - 0.2)} { --o: 1; --s: 1 } ${p(e)} { --o: ${last ? 1 : 0}; --s: ${last ? 1 : 1.04} } 100% { --o: ${last ? 1 : 0} } }
      .s${i} { animation: s${i} ${total}s linear both; opacity: var(--o); transform: scale(var(--s)); }`;
  };
  // "Pop" com leve exagero na escala, o corte seco típico dos Reels.
  const pop = (name, start, d = 0.32) => `
    @keyframes p-${name} { 0% { --o: 0; --s: .6; --y: 30px } 70% { --o: 1; --s: 1.06; --y: 0px } 100% { --o: 1; --s: 1; --y: 0px } }
    .${name} { animation: p-${name} ${d}s ${start}s ease-out both; opacity: var(--o); transform: translateY(var(--y)) scale(var(--s)); }`;
  const strike = (name, start) => `
    @keyframes k-${name} { from { width: 0 } to { width: 104% } }
    .${name} { animation: k-${name} .28s ${start}s ease-in both; }`;
  const fill = (name, start, d) => `
    @keyframes f-${name} { from { width: 0% } to { width: 100% } }
    .${name} { animation: f-${name} ${d}s ${start}s cubic-bezier(.4,.1,.3,1) both; }`;
  const wiggle = (name, start) => `
    @keyframes w-${name} { 0%,100% { --r: 0deg } 20% { --r: -9deg } 40% { --r: 8deg } 60% { --r: -5deg } 80% { --r: 3deg } }
    .${name} { animation: w-${name} .7s ${start}s ease-in-out 2 both; transform: rotate(var(--r)); }`;
  const vars = `@property --o { syntax: "<number>"; inherits: false; initial-value: 1; }
    @property --s { syntax: "<number>"; inherits: false; initial-value: 1; }
    @property --y { syntax: "<length>"; inherits: false; initial-value: 0px; }
    @property --r { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
    .scene { position: absolute; left: 0; right: 0; top: 0; bottom: 0; transform-origin: 50% 45%; }`;
  return { scene, pop, strike, fill, wiggle, vars };
}

export function specialReelsPage(kit) {
  const T = SPECIAL_SECONDS;
  const { scene, pop, strike, fill, wiggle, vars } = timeline(T);
  const cuts = [[0, 2.7], [2.7, 5.4], [5.4, 10.6], [10.6, 13.2], [13.2, T + 1]];
  const old = ["Esperar a segunda-feira", "Ligar e ouvir musiquinha", "Esperar o retorno"];
  const pillars = [
    ["zap", "FÁCIL", "Preenche uma vez, pelo celular"],
    ["sofa", "CÔMODO", "A qualquer hora, até domingo à noite"],
    ["lock", "SEGURO", "Seus dados não ficam guardados no site (LGPD)"],
  ];
  const offers = [0, 1, 2];

  const css = `${vars}
    ${cuts.map(([s, e], i) => scene(i, s, e)).join("\n")}
    ${pop("h1", 0.05)} ${pop("h2", 0.45)} ${pop("h3", 0.9)} ${pop("h4", 1.35)} ${wiggle("sofaw", 0.3)}
    ${old.map((_, i) => pop(`o${i}`, 2.9 + i * 0.35)).join("\n")}
    ${old.map((_, i) => strike(`k${i}`, 4.0 + i * 0.22)).join("\n")}
    ${pop("nope", 4.75)}
    ${pop("me", 5.5)} ${pop("phone", 5.6, 0.4)}
    ${pop("st1", 6.0)} ${pop("st2", 6.7)} ${fill("bar", 6.9, 1.9)}
    ${INSURERS.map((_, i) => pop(`ins${i}`, 7.0 + i * 0.22, 0.25)).join("\n")}
    ${pop("st3", 8.9)} ${offers.map((i) => pop(`of${i}`, 9.15 + i * 0.22, 0.28)).join("\n")}
    ${pillars.map((_, i) => pop(`pl${i}`, 10.75 + i * 0.6)).join("\n")}
    ${pop("c1", 13.3)} ${pop("c2", 13.75)} ${pop("c3", 14.3)} ${pop("c4", 14.8)}
  `;

  const insurerChip = (name, i) => `<span class="ins${i}" style="display:inline-flex;align-items:center;gap:8px;font-size:22px;font-weight:700;color:${INK};background:#EEF2F6;border-radius:999px;padding:8px 16px">
    ${icon("check", 22, "#1F8A4C", 3)}${name}</span>`;
  const offerRow = (i) => `<div class="of${i}" style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:2px solid ${i === 0 ? C.gold : "#E3E8EE"};border-radius:18px;padding:20px 24px;margin-top:14px">
    <div><div style="font-size:22px;font-weight:700;color:${C.graphite}">Oferta ${i + 1}</div>
    <div style="font-size:18px;color:${C.grey};margin-top:4px">franquia · coberturas</div></div>
    <div class="m" style="font-size:34px;color:${INK}">R$ <span style="letter-spacing:.1em">••••</span></div></div>`;

  return doc({
    width: 1080, height: 1920, bg: CREAM, css,
    body: `<div class="dots"></div>

    <!-- 0: gancho POV -->
    <div class="scene s0">
      <div style="position:absolute;left:90px;right:90px;top:330px">
        <div class="cap dark h1" style="font-size:64px">POV:</div><br>
        <div class="cap h2" style="font-size:78px;margin-top:22px">domingo, 21h, no sofá</div><br>
        <div class="cap h3" style="font-size:78px;margin-top:22px">o seguro do carro</div><br>
        <div class="cap gold h4" style="font-size:78px;margin-top:22px">vence essa semana</div>
      </div>
      <div class="sofaw" style="position:absolute;left:0;right:0;top:1040px;text-align:center">${icon("sofa", 380, INK, 1.6)}</div>
    </div>

    <!-- 1: o jeito antigo, riscado -->
    <div class="scene s1">
      <div style="position:absolute;left:90px;right:90px;top:360px">
        <div class="cap dark" style="font-size:56px">O jeito antigo:</div>
        ${old.map((t, i) => `<div class="o${i}" style="position:relative;display:flex;align-items:center;gap:26px;margin-top:64px;font-size:60px;font-weight:700;color:${C.graphite}">
          ${icon(i === 1 ? "phone" : "clock", 64, C.grey)}
          <span style="position:relative">${esc(t)}<span class="k${i}" style="position:absolute;left:-2%;top:50%;height:9px;margin-top:-4px;background:#D2463C;border-radius:5px"></span></span></div>`).join("")}
        <div class="nope m" style="margin-top:120px;font-size:150px;line-height:1;color:${INK}">Nem<br>pensar.</div>
      </div>
    </div>

    <!-- 2: celular simulando a cotação -->
    <div class="scene s2">
      <div style="position:absolute;left:0;right:0;top:290px;text-align:center">
        <div class="cap dark me" style="font-size:56px">Eu, de pijama, no celular:</div>
      </div>
      <div class="phone" style="position:absolute;left:190px;width:700px;top:440px;height:1130px;background:${INK};border-radius:80px;padding:22px">
        <div style="width:100%;height:100%;background:#F7F8FA;border-radius:60px;overflow:hidden;position:relative">
          <div style="width:200px;height:40px;background:${INK};border-radius:0 0 22px 22px;margin:0 auto"></div>
          <div style="padding:30px 40px 0">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <img src="${kit.logoNavy}" style="width:78px">
              <span style="font-size:22px;font-weight:700;color:${C.graphite}">Cotação de seguro</span>
            </div>
            <div class="st1" style="margin-top:34px;display:flex;align-items:center;gap:18px;background:#fff;border-radius:18px;padding:22px 24px;border:2px solid #E3E8EE">
              <span style="width:46px;height:46px;border-radius:50%;background:#1F8A4C;display:flex;align-items:center;justify-content:center">${icon("check", 28, "#fff", 3.2)}</span>
              <span style="font-size:28px;font-weight:700">Carro e condutor</span>
            </div>
            <div class="st2" style="margin-top:22px;background:#fff;border-radius:18px;padding:22px 24px;border:2px solid #E3E8EE">
              <div style="font-size:26px;font-weight:700">Calculando em 8 seguradoras</div>
              <div style="height:14px;background:#E3E8EE;border-radius:7px;margin-top:16px;overflow:hidden"><div class="bar" style="height:100%;background:${C.gold};border-radius:7px"></div></div>
              <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:18px">${INSURERS.map(insurerChip).join("")}</div>
            </div>
            <div class="st3" style="margin-top:26px;font-size:26px;font-weight:800;color:${INK}">Ofertas na tela</div>
            ${offers.map(offerRow).join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- 3: fácil, cômodo, seguro -->
    <div class="scene s3">
      <div style="position:absolute;left:90px;right:90px;top:380px">
        ${pillars.map(([ic, title, line], i) => `<div class="pl${i}" style="display:flex;gap:36px;align-items:center;background:${i === 2 ? INK : "#fff"};border-radius:32px;padding:44px 44px;margin-bottom:40px;box-shadow:0 8px 0 rgba(11,31,51,.10)">
          <span style="flex:none;width:140px;height:140px;border-radius:36px;background:${i === 2 ? C.gold : C.goldSoft};display:flex;align-items:center;justify-content:center">${icon(ic, 84, INK, 2)}</span>
          <div><div class="m" style="font-size:84px;line-height:1;color:${i === 2 ? "#fff" : INK}">${title}</div>
          <div style="font-size:38px;line-height:1.25;font-weight:600;color:${i === 2 ? "#C9D1DA" : C.graphite};margin-top:14px">${esc(line)}</div></div></div>`).join("")}
      </div>
    </div>

    <!-- 4: chamada -->
    <div class="scene s4">
      <div style="position:absolute;left:90px;right:90px;top:360px;text-align:center">
        <img class="c1" src="${kit.logoNavy}" style="width:200px">
        <div class="c2 m" style="font-size:112px;line-height:1.02;margin-top:56px">Domingo é dia<br>de cotar do sofá.</div>
        <div class="c3" style="margin-top:64px"><span class="cap gold" style="font-size:54px;padding:26px 48px">COTAÇÃO NO LINK DA BIO</span></div>
        <div class="c4" style="margin-top:70px;display:flex;justify-content:center;align-items:center;gap:20px;font-size:38px;font-weight:700;color:${INK};white-space:nowrap">
          ${icon("send", 52, INK)}Manda pra quem deixa tudo pro domingo</div>
        <div style="font-size:28px;color:${C.graphite};margin-top:36px">${esc(kit.signature)}</div>
      </div>
    </div>`,
  });
}

// ---------- Carrossel "Mito ou verdade" (1080x1350) ----------

const SLIDE = { width: 1080, height: 1350 };

const MYTHS = [
  {
    myth: "Cotar online é menos seguro que por telefone.",
    truth: "Os dados que você digita vão direto para o cálculo das seguradoras e não ficam guardados no site. Tudo seguindo a LGPD.",
    icon: "lock",
  },
  {
    myth: "Vou ter que mandar minha apólice para alguém.",
    truth: "Se quiser usar o PDF da apólice atual, ele é lido no seu próprio celular e não é enviado a ninguém. Só preenche o formulário para você conferir.",
    icon: "file",
  },
  {
    myth: "Vou passar horas no telefone.",
    truth: "Você vê as ofertas na tela, compara e escolhe. A D&B fala com você só para fechar.",
    icon: "phone",
  },
  {
    myth: "Dá trabalho e demora.",
    truth: "Preenche uma vez, 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem em poucos minutos. A qualquer hora, até domingo à noite.",
    icon: "zap",
  },
];

const counter = (n, total) => `<div class="m" style="position:absolute;right:80px;top:80px;font-size:28px;color:${C.graphite}">${n}/${total}</div>`;
const brandFoot = (kit) => `<div style="position:absolute;left:80px;right:80px;bottom:64px;display:flex;align-items:center;justify-content:space-between">
  <span style="font-size:24px;font-weight:600;color:${C.graphite}">${esc(kit.signature)}</span><img src="${kit.logoNavy}" style="width:84px"></div>`;

export function specialCarousel(kit) {
  const total = MYTHS.length + 2;
  const cover = doc({
    ...SLIDE, bg: CREAM,
    body: `<div class="dots"></div>${counter(1, total)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div class="cap dark" style="font-size:40px">Especial de domingo</div>
        <div class="m" style="font-size:128px;line-height:1.05;margin-top:56px">Cotar seguro online é<br><span style="display:inline-block;background:${C.goldSoft};padding:4px 18px 10px;border-radius:16px;margin-top:14px">seguro?</span></div>
        <div style="font-size:46px;line-height:1.3;font-weight:600;color:${C.graphite};margin-top:56px">4 mitos que fazem você perder tempo, desmontados.</div>
        <div style="margin-top:70px;display:flex;gap:20px">
          <span class="cap" style="font-size:38px;color:#D2463C">MITO</span><span class="cap gold" style="font-size:38px">VERDADE</span>
        </div>
      </div>
      <div style="position:absolute;right:80px;bottom:190px;font-size:34px;font-weight:700;color:${INK}">Arrasta →</div>
      ${brandFoot(kit)}`,
  });

  const myths = MYTHS.map((m, i) => doc({
    ...SLIDE, bg: CREAM,
    body: `<div class="dots"></div>${counter(i + 2, total)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div style="display:flex;align-items:center;gap:20px">
          <span style="width:64px;height:64px;border-radius:50%;background:#D2463C;display:flex;align-items:center;justify-content:center">${icon("x", 40, "#fff", 3.2)}</span>
          <span class="m" style="font-size:40px;color:#D2463C;letter-spacing:.06em">MITO</span>
        </div>
        <div class="m" style="font-size:76px;line-height:1.06;margin-top:30px;color:${C.graphite};text-decoration:line-through;text-decoration-color:#D2463C;text-decoration-thickness:6px">${esc(m.myth)}</div>
        <div style="margin-top:70px;background:${INK};border-radius:36px;padding:52px 52px 56px">
          <div style="display:flex;align-items:center;gap:20px">
            <span style="width:64px;height:64px;border-radius:50%;background:${C.goldSoft};display:flex;align-items:center;justify-content:center">${icon("check", 40, INK, 3.2)}</span>
            <span class="m" style="font-size:40px;color:${C.goldSoft};letter-spacing:.06em">VERDADE</span>
            <span style="margin-left:auto">${icon(m.icon, 64, C.goldSoft, 1.8)}</span>
          </div>
          <div style="font-size:46px;line-height:1.32;font-weight:600;color:#fff;margin-top:30px">${esc(m.truth)}</div>
        </div>
      </div>
      ${brandFoot(kit)}`,
  }));

  const cta = doc({
    ...SLIDE, bg: INK,
    body: `${counter(total, total).replace(C.graphite, C.grey)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div style="width:150px;height:150px;border-radius:40px;background:${C.goldSoft};display:flex;align-items:center;justify-content:center">${icon("sofa", 92, INK, 1.8)}</div>
        <div class="m" style="font-size:112px;line-height:1.02;color:#fff;margin-top:60px">Domingo é dia de cotar do sofá.</div>
        <div style="font-size:42px;line-height:1.35;color:#C9D1DA;margin-top:44px">Fácil, cômodo e seguro. 8 seguradoras de uma vez.</div>
        <div style="margin-top:64px"><span class="cap gold" style="font-size:44px;padding:24px 42px">COTAÇÃO NO LINK DA BIO</span></div>
        <div style="margin-top:64px;display:flex;flex-direction:column;gap:24px;font-size:36px;font-weight:600;color:${C.goldSoft}">
          <span style="display:flex;align-items:center;gap:18px">${icon("bookmark", 44, C.goldSoft)}Salve para lembrar na renovação</span>
          <span style="display:flex;align-items:center;gap:18px">${icon("send", 44, C.goldSoft)}Mande para quem ainda cota por telefone</span>
        </div>
      </div>
      <div style="position:absolute;left:80px;right:80px;bottom:64px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:24px;font-weight:600;color:${C.grey}">${esc(kit.signature)}</span><img src="${kit.logoGold}" style="width:84px"></div>`,
  });

  return [cover, ...myths, cta];
}

// ---------- Stories (1080x1920) ----------
// Sem figurinhas (a API não aceita): chamadas para o perfil e a bio.

export function specialStories(kit) {
  const STORY = { width: 1080, height: 1920, bg: CREAM };
  const reels = doc({
    ...STORY,
    body: `<div class="dots"></div>
      <img src="${kit.logoNavy}" style="position:absolute;left:90px;top:290px;width:130px">
      <div style="position:absolute;left:90px;right:90px;top:560px">
        <div class="cap dark" style="font-size:44px">Pergunta de domingo</div><br>
        <div class="cap" style="font-size:92px;margin-top:30px">Já cotou seguro</div><br>
        <div class="cap gold" style="font-size:92px;margin-top:22px">de pijama?</div>
        <div style="margin-top:80px;text-align:center">${icon("sofa", 300, INK, 1.6)}</div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1400px;text-align:center"><span class="cap dark" style="font-size:44px;padding:28px 48px">REELS NOVO NO PERFIL</span></div>`,
  });
  const myths = doc({
    ...STORY, bg: INK,
    body: `<img src="${kit.logoGold}" style="position:absolute;left:90px;top:290px;width:130px">
      <div style="position:absolute;left:90px;right:90px;top:600px">
        <div class="m" style="font-size:120px;line-height:1;color:#fff">Cotar online<br>é <span style="color:${C.goldSoft}">seguro</span>?</div>
        <div style="font-size:52px;line-height:1.3;font-weight:600;color:#C9D1DA;margin-top:60px">4 mitos desmontados no feed.</div>
        <div style="margin-top:70px;display:flex;gap:20px"><span class="cap" style="font-size:40px;color:#D2463C">MITO</span><span class="cap gold" style="font-size:40px">VERDADE</span></div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1400px"><span class="cap gold" style="font-size:44px;padding:28px 48px">VEJA NO FEED</span></div>`,
  });
  return [reels, myths];
}
