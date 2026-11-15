// Especial de domingo: série semanal com temas em rodízio, sempre sobre
// cotar online ser fácil, cômodo e seguro. Foge do visual do kit semanal
// (azul-marinho + serifa): fundo marfim, legendas em caixa no estilo dos
// criadores ("tiny text"), um celular simulando a cotação e cortes rápidos.
//
// Só afirma o que o site cumpre (PrivacyPage.jsx e InsuranceModal.jsx):
// dados do formulário não ficam guardados no site, PDF da apólice lido no
// próprio aparelho, nenhum pagamento acontece no site, LGPD, 8 seguradoras.
// Ícones em SVG (não emoji): o Chrome do runner do GitHub não tem fonte de
// emoji colorido.

import { C, INSURERS, esc } from "./templates.mjs";

const FONTS = "https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap";
const INK = "#0B1F33";
const CREAM = "#F4EFE6";
const RED = "#D2463C";

export const SPECIAL_SECONDS = 16;
export const SPECIAL_COVER_SECONDS = 1.9;

// ---------- Temas (rodízio semanal, ver pickTheme) ----------
// reels: hook (4 linhas, a 1ª é "POV:"), old (título + 3 itens riscados),
//        nope (resposta), phone (legenda do celular), cta, share.
// carousel: kind "myth" (mito riscado + verdade) ou "tip" (dica numerada).
// stories: [Story do Reels, Story do carrossel].

export const THEMES = [
  {
    id: "sofa",
    reels: {
      hook: ["POV:", "domingo, 21h, no sofá", "o seguro do carro", "vence essa semana"],
      oldTitle: "O jeito antigo:", old: ["Esperar a segunda-feira", "Ligar e ouvir musiquinha", "Esperar o retorno"], oldIcons: ["clock", "phone", "clock"],
      nope: "Nem pensar.", phone: "Eu, de pijama, no celular:",
      cta: "Domingo é dia de cotar do sofá.", share: "Manda pra quem deixa tudo pro domingo",
    },
    carousel: {
      kind: "myth", kicker: "Especial de domingo", title: "Cotar seguro online é", highlight: "seguro?",
      sub: "4 mitos que fazem você perder tempo, desmontados.",
      items: [
        { a: "Cotar online é menos seguro que por telefone.", b: "Os dados que você digita vão direto para o cálculo das seguradoras e não ficam guardados no site. Tudo seguindo a LGPD.", icon: "lock" },
        { a: "Vou ter que mandar minha apólice para alguém.", b: "Se quiser usar o PDF da apólice atual, ele é lido no seu próprio celular e não é enviado a ninguém. Só preenche o formulário para você conferir.", icon: "file" },
        { a: "Vou passar horas no telefone.", b: "Você vê as ofertas na tela, compara e escolhe. A D&B fala com você só para fechar.", icon: "phone" },
        { a: "Dá trabalho e demora.", b: "Preenche uma vez, 8 seguradoras calculam ao mesmo tempo e as ofertas aparecem em poucos minutos. A qualquer hora, até domingo à noite.", icon: "zap" },
      ],
      ctaTitle: "Domingo é dia de cotar do sofá.",
    },
    stories: [
      { tag: "Pergunta de domingo", l1: "Já cotou seguro", l2: "de pijama?", pill: "REELS NOVO NO PERFIL", icon: "sofa" },
      { title: "Cotar online<br>é <em>seguro</em>?", sub: "4 mitos desmontados no feed.", tags: true, pill: "VEJA NO FEED" },
    ],
  },
  {
    id: "madrugada",
    reels: {
      hook: ["POV:", "23h, sem sono", "rolando o feed", "e lembra do seguro"],
      oldTitle: "Antes:", old: ["Anotar pra ligar amanhã", "Esquecer de ligar", "Lembrar só no vencimento"], oldIcons: ["file", "phone", "clock"],
      nope: "Resolvido hoje.", phone: "Eu, antes de dormir:",
      cta: "Cotou, dormiu tranquilo.", share: "Manda pra quem sempre diz “amanhã eu vejo”",
    },
    carousel: {
      kind: "tip", kicker: "Especial de domingo", title: "O que ter em mãos para cotar", highlight: "em minutos",
      sub: "Salve e cote quando der, até de madrugada.",
      items: [
        { a: "Seus dados", b: "Nome, CPF, data de nascimento, telefone e e-mail. Nada de documento escaneado.", icon: "user" },
        { a: "O carro", b: "Ano, marca e modelo. Se for 0 km, financiado ou tiver rastreador, é só marcar no formulário.", icon: "car" },
        { a: "Onde ele dorme", b: "O CEP e se tem garagem em casa, no trabalho ou no estudo.", icon: "home" },
        { a: "Atalho: a apólice atual", b: "Tem o PDF do seguro atual? Envie e o formulário se preenche quase sozinho. Ele é lido no seu celular e não é enviado a ninguém.", icon: "file" },
      ],
      ctaTitle: "Pronto. Agora é só cotar.",
    },
    stories: [
      { tag: "Confessa", l1: "Você também", l2: "deixa pra amanhã?", pill: "REELS NOVO NO PERFIL", icon: "moon" },
      { title: "O que ter em mãos<br>para cotar <em>em minutos</em>", sub: "Checklist no feed. Salve para depois.", pill: "VEJA NO FEED" },
    ],
  },
  {
    id: "renovacao",
    reels: {
      hook: ["POV:", "chegou a renovação", "do seguro do carro", "e o valor subiu"],
      oldTitle: "Renovar no automático:", old: ["Aceitar sem comparar", "Ligar pra várias seguradoras", "Esperar cada uma responder"], oldIcons: ["file", "phone", "clock"],
      nope: "Compara antes.", phone: "Eu, comparando antes de renovar:",
      cta: "Compare antes de renovar.", share: "Manda pra quem renova sem olhar",
    },
    carousel: {
      kind: "myth", kicker: "Especial de domingo", title: "Vai renovar o seguro?", highlight: "Leia antes.",
      sub: "4 mitos da renovação que custam tempo e podem custar dinheiro.",
      items: [
        { a: "Para trocar de seguradora, começo do zero.", b: "Sua classe de bônus entra na cotação e as 8 seguradoras calculam com ela.", icon: "shield" },
        { a: "Comparar dá muito trabalho.", b: "Envie o PDF da apólice atual: carro, condutor, seguradora, vencimento e bônus já vêm preenchidos. Você só confere.", icon: "file" },
        { a: "Se eu cotar, já fico comprometido.", b: "Cotar não compromete nada. Nenhum pagamento acontece no site: você só fecha se escolher um plano.", icon: "lock" },
        { a: "Renovar com a mesma é sempre o melhor preço.", b: "Só comparando para saber. São 8 seguradoras calculando ao mesmo tempo, em poucos minutos.", icon: "zap" },
      ],
      ctaTitle: "Compare antes de renovar.",
    },
    stories: [
      { tag: "Pergunta rápida", l1: "Seu seguro", l2: "vence quando?", pill: "REELS NOVO NO PERFIL", icon: "calendar" },
      { title: "Renovação:<br><em>4 mitos</em>", sub: "Leia antes de renovar no automático.", tags: true, pill: "VEJA NO FEED" },
    ],
  },
  {
    id: "confianca",
    reels: {
      hook: ["POV:", "você desconfia de", "site que pede dados", "(e tá certo)"],
      oldTitle: "O que assusta:", old: ["Site sem empresa por trás", "Pedir cartão logo de cara", "Guardar seus dados"], oldIcons: ["x", "lock", "file"],
      nope: "Aqui não.", phone: "Na cotação da D&B:",
      cta: "Cote com quem você sabe quem é.", share: "Manda pra quem tem medo de golpe",
    },
    carousel: {
      kind: "tip", kicker: "Especial de domingo", title: "4 sinais de que a cotação online é", highlight: "confiável",
      sub: "Antes de digitar seus dados em qualquer site, confira.",
      items: [
        { a: "Empresa identificada", b: "Corretora com nome e CNPJ à vista. A D&B é a D’Agostino e Barreto Corretora de Seguros, em Águas Claras, Brasília.", icon: "shield" },
        { a: "Nada de pagar no site", b: "Na D&B, nenhum pagamento acontece no site. Você escolhe o plano e a corretora fala com você para finalizar.", icon: "lock" },
        { a: "Privacidade explicada", b: "Uma página clara sobre o que é coletado e por quê, seguindo a LGPD.", icon: "file" },
        { a: "Dados que não ficam guardados", b: "Na D&B, eles vão direto para o cálculo das seguradoras. E o PDF da apólice é lido no seu celular.", icon: "check" },
      ],
      ctaTitle: "Cote com quem você sabe quem é.",
    },
    stories: [
      { tag: "Sinceridade", l1: "Você tem medo", l2: "de cotar online?", pill: "REELS NOVO NO PERFIL", icon: "lock" },
      { title: "4 sinais de<br><em>confiança</em>", sub: "Confira antes de digitar seus dados.", pill: "VEJA NO FEED" },
    ],
  },
];

// O especial de 15/11/2026 (o primeiro) foi o "sofa"; daí anda um tema por
// semana. Depois do último, recomeça.
const ANCHOR = Date.UTC(2026, 10, 15);
export function pickTheme(date, id) {
  if (id) {
    const t = THEMES.find((x) => x.id === id);
    if (!t) throw new Error(`Tema "${id}" não existe (${THEMES.map((x) => x.id).join(", ")}).`);
    return t;
  }
  const [y, m, d] = date.split("-").map(Number);
  const n = Math.round((Date.UTC(y, m - 1, d) - ANCHOR) / (7 * 24 * 3600 * 1000));
  return THEMES[((n % THEMES.length) + THEMES.length) % THEMES.length];
}

// ---------- Base visual ----------

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
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
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
  em { font-style: normal; }
  ${css}
</style></head><body>${body}</body></html>`;
}

// Texto do tema pode trazer <br> e <em> (títulos); o resto é escapado.
const rich = (s) => esc(s).replace(/&lt;br&gt;/g, "<br>").replace(/&lt;em&gt;/g, "<em>").replace(/&lt;\/em&gt;/g, "</em>");

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

const PILLARS = [
  ["zap", "FÁCIL", "Preenche uma vez, pelo celular"],
  ["sofa", "CÔMODO", "A qualquer hora, até domingo à noite"],
  ["lock", "SEGURO", "Seus dados não ficam guardados no site (LGPD)"],
];

export function specialReelsPage(kit, theme) {
  const R = theme.reels;
  const T = SPECIAL_SECONDS;
  const { scene, pop, strike, fill, wiggle, vars } = timeline(T);
  const cuts = [[0, 2.7], [2.7, 5.4], [5.4, 10.6], [10.6, 13.2], [13.2, T + 1]];
  const offers = [0, 1, 2];
  const heroIcon = theme.stories[0].icon || "sofa";
  const hookSize = (s) => (s.length > 19 ? 70 : 78);
  const oldSize = (s) => (s.length > 24 ? 52 : 60);
  const [nope1, ...nopeRest] = R.nope.split(" ");

  const css = `${vars}
    ${cuts.map(([s, e], i) => scene(i, s, e)).join("\n")}
    ${pop("h1", 0.05)} ${pop("h2", 0.45)} ${pop("h3", 0.9)} ${pop("h4", 1.35)} ${wiggle("herow", 0.3)}
    ${R.old.map((_, i) => pop(`o${i}`, 2.9 + i * 0.35)).join("\n")}
    ${R.old.map((_, i) => strike(`k${i}`, 4.0 + i * 0.22)).join("\n")}
    ${pop("nope", 4.75)}
    ${pop("me", 5.5)} ${pop("phone", 5.6, 0.4)}
    ${pop("st1", 6.0)} ${pop("st2", 6.7)} ${fill("bar", 6.9, 1.9)}
    ${INSURERS.map((_, i) => pop(`ins${i}`, 7.0 + i * 0.22, 0.25)).join("\n")}
    ${pop("st3", 8.9)} ${offers.map((i) => pop(`of${i}`, 9.15 + i * 0.22, 0.28)).join("\n")}
    ${PILLARS.map((_, i) => pop(`pl${i}`, 10.75 + i * 0.6)).join("\n")}
    ${pop("c1", 13.3)} ${pop("c2", 13.75)} ${pop("c3", 14.3)} ${pop("c4", 14.8)}
  `;

  const insurerChip = (name, i) => `<span class="ins${i}" style="display:inline-flex;align-items:center;gap:8px;font-size:22px;font-weight:700;color:${INK};background:#EEF2F6;border-radius:999px;padding:8px 16px">
    ${icon("check", 22, "#1F8A4C", 3)}${name}</span>`;
  const offerRow = (i) => `<div class="of${i}" style="display:flex;align-items:center;justify-content:space-between;background:#fff;border:2px solid ${i === 0 ? C.gold : "#E3E8EE"};border-radius:18px;padding:20px 24px;margin-top:14px">
    <div><div style="font-size:22px;font-weight:700;color:${C.graphite}">Oferta ${i + 1}</div>
    <div style="font-size:18px;color:${C.grey};margin-top:4px">franquia · coberturas</div></div>
    <div class="m" style="font-size:34px;color:${INK}">R$ <span style="letter-spacing:.1em">••••</span></div></div>`;
  const [h0, h1, h2, h3] = R.hook;

  return doc({
    width: 1080, height: 1920, bg: CREAM, css,
    body: `<div class="dots"></div>

    <!-- 0: gancho POV -->
    <div class="scene s0">
      <div style="position:absolute;left:90px;right:90px;top:330px">
        <div class="cap dark h1" style="font-size:64px">${esc(h0)}</div><br>
        <div class="cap h2" style="font-size:${hookSize(h1)}px;margin-top:22px">${esc(h1)}</div><br>
        <div class="cap h3" style="font-size:${hookSize(h2)}px;margin-top:22px">${esc(h2)}</div><br>
        <div class="cap gold h4" style="font-size:${hookSize(h3)}px;margin-top:22px">${esc(h3)}</div>
      </div>
      <div class="herow" style="position:absolute;left:0;right:0;top:1040px;text-align:center">${icon(heroIcon, 380, INK, 1.6)}</div>
    </div>

    <!-- 1: o jeito antigo, riscado -->
    <div class="scene s1">
      <div style="position:absolute;left:90px;right:90px;top:360px">
        <div class="cap dark" style="font-size:56px">${esc(R.oldTitle)}</div>
        ${R.old.map((t, i) => `<div class="o${i}" style="position:relative;display:flex;align-items:center;gap:26px;margin-top:64px;font-size:${oldSize(t)}px;font-weight:700;color:${C.graphite}">
          ${icon(R.oldIcons[i], 64, C.grey)}
          <span style="position:relative;white-space:nowrap">${esc(t)}<span class="k${i}" style="position:absolute;left:-2%;top:50%;height:9px;margin-top:-4px;background:${RED};border-radius:5px"></span></span></div>`).join("")}
        <div class="nope m" style="margin-top:120px;font-size:150px;line-height:1;color:${INK}">${esc(nope1)}<br>${esc(nopeRest.join(" "))}</div>
      </div>
    </div>

    <!-- 2: celular simulando a cotação -->
    <div class="scene s2">
      <div style="position:absolute;left:0;right:0;top:290px;text-align:center">
        <div class="cap dark me" style="font-size:${R.phone.length > 26 ? 46 : 56}px">${esc(R.phone)}</div>
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

    <!-- 3: fácil, cômodo, seguro (assinatura da série) -->
    <div class="scene s3">
      <div style="position:absolute;left:90px;right:90px;top:380px">
        ${PILLARS.map(([ic, title, line], i) => `<div class="pl${i}" style="display:flex;gap:36px;align-items:center;background:${i === 2 ? INK : "#fff"};border-radius:32px;padding:44px 44px;margin-bottom:40px;box-shadow:0 8px 0 rgba(11,31,51,.10)">
          <span style="flex:none;width:140px;height:140px;border-radius:36px;background:${i === 2 ? C.gold : C.goldSoft};display:flex;align-items:center;justify-content:center">${icon(ic, 84, INK, 2)}</span>
          <div><div class="m" style="font-size:84px;line-height:1;color:${i === 2 ? "#fff" : INK}">${title}</div>
          <div style="font-size:38px;line-height:1.25;font-weight:600;color:${i === 2 ? "#C9D1DA" : C.graphite};margin-top:14px">${esc(line)}</div></div></div>`).join("")}
      </div>
    </div>

    <!-- 4: chamada -->
    <div class="scene s4">
      <div style="position:absolute;left:90px;right:90px;top:360px;text-align:center">
        <img class="c1" src="${kit.logoNavy}" style="width:200px">
        <div class="c2 m" style="font-size:${R.cta.length > 26 ? 96 : 112}px;line-height:1.02;margin-top:56px">${esc(R.cta)}</div>
        <div class="c3" style="margin-top:64px"><span class="cap gold" style="font-size:54px;padding:26px 48px">COTAÇÃO NO LINK DA BIO</span></div>
        <div class="c4" style="margin-top:64px;font-size:38px;line-height:1.3;font-weight:700;color:${INK}">
          <div>${icon("send", 52, INK)}</div><div style="margin-top:12px">${esc(R.share)}</div></div>
        <div style="font-size:28px;color:${C.graphite};margin-top:36px">${esc(kit.signature)}</div>
      </div>
    </div>`,
  });
}

// ---------- Carrossel (1080x1350): "myth" ou "tip" ----------

const SLIDE = { width: 1080, height: 1350 };

const counter = (n, total, color = C.graphite) => `<div class="m" style="position:absolute;right:80px;top:80px;font-size:28px;color:${color}">${n}/${total}</div>`;
const brandFoot = (kit) => `<div style="position:absolute;left:80px;right:80px;bottom:64px;display:flex;align-items:center;justify-content:space-between">
  <span style="font-size:24px;font-weight:600;color:${C.graphite}">${esc(kit.signature)}</span><img src="${kit.logoNavy}" style="width:84px"></div>`;
const badge = (bg, ic, fg) => `<span style="flex:none;width:64px;height:64px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">${ic === "num" ? "" : icon(ic, 40, fg, 3.2)}</span>`;

export function specialCarousel(kit, theme) {
  const K = theme.carousel;
  const total = K.items.length + 2;
  const titleSize = K.title.length > 26 ? 100 : 128;
  const cover = doc({
    ...SLIDE, bg: CREAM,
    body: `<div class="dots"></div>${counter(1, total)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div class="cap dark" style="font-size:40px">${esc(K.kicker)}</div>
        <div class="m" style="font-size:${titleSize}px;line-height:1.05;margin-top:56px">${esc(K.title)}<br><span style="display:inline-block;background:${C.goldSoft};padding:4px 18px 10px;border-radius:16px;margin-top:14px">${esc(K.highlight)}</span></div>
        <div style="font-size:44px;line-height:1.3;font-weight:600;color:${C.graphite};margin-top:52px">${esc(K.sub)}</div>
        ${K.kind === "myth" ? `<div style="margin-top:60px;display:flex;gap:20px">
          <span class="cap" style="font-size:38px;color:${RED}">MITO</span><span class="cap gold" style="font-size:38px">VERDADE</span></div>` : ""}
      </div>
      <div style="position:absolute;right:80px;bottom:190px;font-size:34px;font-weight:700;color:${INK}">Arrasta →</div>
      ${brandFoot(kit)}`,
  });

  const mythCard = (m, i) => doc({
    ...SLIDE, bg: CREAM,
    body: `<div class="dots"></div>${counter(i + 2, total)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div style="display:flex;align-items:center;gap:20px">${badge(RED, "x", "#fff")}
          <span class="m" style="font-size:40px;color:${RED};letter-spacing:.06em">MITO</span></div>
        <div class="m" style="font-size:${m.a.length > 44 ? 66 : 76}px;line-height:1.06;margin-top:30px;color:${C.graphite};text-decoration:line-through;text-decoration-color:${RED};text-decoration-thickness:6px">${esc(m.a)}</div>
        <div style="margin-top:64px;background:${INK};border-radius:36px;padding:52px 52px 56px">
          <div style="display:flex;align-items:center;gap:20px">${badge(C.goldSoft, "check", INK)}
            <span class="m" style="font-size:40px;color:${C.goldSoft};letter-spacing:.06em">VERDADE</span>
            <span style="margin-left:auto">${icon(m.icon, 64, C.goldSoft, 1.8)}</span></div>
          <div style="font-size:46px;line-height:1.32;font-weight:600;color:#fff;margin-top:30px">${esc(m.b)}</div>
        </div>
      </div>
      ${brandFoot(kit)}`,
  });

  const tipCard = (m, i) => doc({
    ...SLIDE, bg: CREAM,
    body: `<div class="dots"></div>${counter(i + 2, total)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div style="display:flex;align-items:center;gap:28px">
          <span class="m" style="flex:none;width:120px;height:120px;border-radius:32px;background:${INK};color:${C.goldSoft};font-size:72px;display:flex;align-items:center;justify-content:center">${i + 1}</span>
          <span style="flex:none;width:120px;height:120px;border-radius:32px;background:${C.goldSoft};display:flex;align-items:center;justify-content:center">${icon(m.icon, 68, INK, 2)}</span>
        </div>
        <div class="m" style="font-size:${m.a.length > 22 ? 84 : 100}px;line-height:1.04;margin-top:60px">${esc(m.a)}</div>
        <div style="margin-top:56px;background:#fff;border-radius:36px;padding:48px 52px;box-shadow:0 8px 0 rgba(11,31,51,.08)">
          <div style="font-size:46px;line-height:1.34;font-weight:600;color:${INK}">${esc(m.b)}</div>
        </div>
      </div>
      ${brandFoot(kit)}`,
  });

  const cta = doc({
    ...SLIDE, bg: INK,
    body: `${counter(total, total, C.grey)}
      <div style="position:absolute;left:80px;right:80px;top:150px">
        <div style="width:150px;height:150px;border-radius:40px;background:${C.goldSoft};display:flex;align-items:center;justify-content:center">${icon(theme.stories[0].icon || "sofa", 92, INK, 1.8)}</div>
        <div class="m" style="font-size:${K.ctaTitle.length > 28 ? 96 : 112}px;line-height:1.02;color:#fff;margin-top:60px">${esc(K.ctaTitle)}</div>
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

  return [cover, ...K.items.map(K.kind === "myth" ? mythCard : tipCard), cta];
}

// ---------- Stories (1080x1920) ----------
// Sem figurinhas (a API não aceita): chamadas para o perfil e o feed.

export function specialStories(kit, theme) {
  const [a, b] = theme.stories;
  const STORY = { width: 1080, height: 1920 };
  const reels = doc({
    ...STORY, bg: CREAM,
    body: `<div class="dots"></div>
      <img src="${kit.logoNavy}" style="position:absolute;left:90px;top:290px;width:130px">
      <div style="position:absolute;left:90px;right:90px;top:560px">
        <div class="cap dark" style="font-size:44px">${esc(a.tag)}</div><br>
        <div class="cap" style="font-size:${a.l1.length > 16 ? 80 : 92}px;margin-top:30px">${esc(a.l1)}</div><br>
        <div class="cap gold" style="font-size:${a.l2.length > 16 ? 80 : 92}px;margin-top:22px">${esc(a.l2)}</div>
        <div style="margin-top:80px;text-align:center">${icon(a.icon, 300, INK, 1.6)}</div>
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1400px;text-align:center"><span class="cap dark" style="font-size:44px;padding:28px 48px">${esc(a.pill)}</span></div>`,
  });
  const feed = doc({
    ...STORY, bg: INK,
    css: `em { color: ${C.goldSoft}; }`,
    body: `<img src="${kit.logoGold}" style="position:absolute;left:90px;top:290px;width:130px">
      <div style="position:absolute;left:90px;right:90px;top:600px">
        <div class="m" style="font-size:${b.title.replace(/<[^>]+>/g, "").length > 26 ? 92 : 112}px;line-height:1.04;color:#fff">${rich(b.title)}</div>
        <div style="font-size:50px;line-height:1.3;font-weight:600;color:#C9D1DA;margin-top:60px">${esc(b.sub)}</div>
        ${b.tags ? `<div style="margin-top:70px;display:flex;gap:20px"><span class="cap" style="font-size:40px;color:${RED}">MITO</span><span class="cap gold" style="font-size:40px">VERDADE</span></div>` : ""}
      </div>
      <div style="position:absolute;left:90px;right:90px;top:1400px"><span class="cap gold" style="font-size:44px;padding:28px 48px">${esc(b.pill)}</span></div>`,
  });
  return [reels, feed];
}
