import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import {
  Zap, Battery, Users, Mountain, TrendingUp, DollarSign, Plus, X,
  ChevronDown, ChevronUp, Car, Gauge, Check,
  Sun, Moon, Fuel, ArrowRight, Play, Plug, HelpCircle, ArrowLeft, Sparkles,
  Accessibility, Briefcase
} from "lucide-react";

// ---------------------------------------------------------------------------
// THEME TOKENS
// ---------------------------------------------------------------------------
const DARK_T = {
  mode: "dark",
  bg: "#0B0F14",
  panel: "#12181F",
  panelAlt: "#171F28",
  line: "#25303B",
  ink: "#EAF1F6",
  inkDim: "#8FA3B0",
  accent: "#3DD6C7",
  accent2: "#F2B441",
  good: "#5FD37B",
  warn: "#E8794A",
  radar: "#3DD6C7",
};

const LIGHT_T = {
  mode: "light",
  bg: "#F6F7F5",
  panel: "#FFFFFF",
  panelAlt: "#F0F2EF",
  line: "#DEE2DD",
  ink: "#15201C",
  inkDim: "#5D6B64",
  accent: "#0E8C7D",
  accent2: "#B8720B",
  good: "#1E7B34",
  warn: "#B23A14",
  radar: "#0E8C7D",
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

// Ajustes que só dá pra fazer com media query de verdade (inline style não
// tem). Em telas médias (ex.: tablet em retrato), esconder a descrição do
// cabeçalho evita que ele quebre em duas linhas sem necessidade.
const RESPONSIVE_CSS = `
@media (max-width: 860px) {
  .ev-header-subtitle { display: none; }
}
`;

// Corporate group / partnership per brand — helps compare who's really behind
// each nameplate (shared platforms, ownership, joint ventures).
const BRAND_GROUPS = {
  "Geely": "Geely Holding Group — controla Volvo, Polestar, Zeekr, Lotus e a Smart (joint venture com a Mercedes-Benz)",
  "Volvo": "Geely Holding Group (controladora desde 2010)",
  "Zeekr": "Geely Holding Group (marca premium do grupo)",
  "Smart": "Joint venture entre Geely Holding e Mercedes-Benz",
  "MG": "SAIC Motor (estatal chinesa)",
  "GAC": "GAC Group (Guangzhou Automobile) — também tem joint ventures com Toyota e Honda na China",
  "GWM": "Great Wall Motors — grupo independente, dono das marcas Haval, Tank e Wey",
  "BYD": "BYD Company — grupo independente, dono também da Denza (joint venture com Mercedes-Benz) e Yangwang",
  "Leapmotor": "Stellantis detém ~21% e é sócia via joint venture 'Leapmotor International' para distribuição fora da China",
  "JAC": "JAC Motors — estatal de Anhui (China), com joint venture com a Volkswagen no mercado chinês",
  "Renault": "Renault Group — parte da Aliança Renault-Nissan-Mitsubishi",
  "Nissan": "Aliança Renault-Nissan-Mitsubishi",
  "Caoa Chery": "Joint venture entre o Grupo CAOA (Brasil) e a Chery Group (China)",
  "Neta": "Hozon New Energy Automobile — startup chinesa independente",
  "Honda": "Honda Motor Co. — independente",
  "Omoda": "Chery Group (submarca global Omoda/Jaecoo)",
  "Jetour": "Chery Group (submarca)",
  "JAECOO": "Chery Group (submarca, junto com Omoda)",
  "Fiat": "Stellantis",
  "Peugeot": "Stellantis",
  "Mini": "BMW Group",
  "BMW": "BMW Group — independente",
  "Chevrolet": "General Motors",
  "Hyundai": "Hyundai Motor Group (inclui Kia e Genesis)",
  "Kia": "Hyundai Motor Group",
};

const PERSONAS = [
  { key: "urbano", label: "Urbano", icon: Zap, hint: "Cidade, trajetos curtos, agilidade" },
  { key: "familia", label: "Família", icon: Users, hint: "Espaço, porta-malas, segurança" },
  { key: "aventura", label: "Aventura", icon: Mountain, hint: "Vão livre, terreno irregular" },
  { key: "performance", label: "Performance", icon: TrendingUp, hint: "Potência, aceleração" },
  { key: "custo", label: "Custo-Benefício", icon: DollarSign, hint: "Preço, manutenção, garantia" },
];

const FUEL_TYPES = [
  { key: "BEV", label: "100% Elétrico" },
  { key: "PHEV", label: "Híbrido Plug-in" },
];

// price -> custo score (cheaper = higher score)
function custoScore(price) {
  if (price == null) return 3;
  if (price < 130000) return 5;
  if (price < 165000) return 4;
  if (price < 210000) return 3;
  if (price < 280000) return 2;
  return 1;
}
// power -> performance score
function perfScore(cv) {
  if (cv == null) return 3;
  if (cv >= 300) return 5;
  if (cv >= 220) return 4;
  if (cv >= 170) return 3;
  if (cv >= 120) return 2;
  return 1;
}
function defaultPersonasFor(category, price, cv, fuelType) {
  const cat = (category || "").toLowerCase();
  const isSUV = cat.includes("suv") || cat.includes("crossover");
  const isPickup = cat.includes("picape");
  const isSedan = cat.includes("sedã") || cat.includes("sed");
  const isRoadster = cat.includes("roadster") || cat.includes("conversível");
  const isMicro = cat.includes("hatch compacto") || cat.includes("micro");
  return {
    urbano: isMicro ? 5 : isRoadster || isPickup ? 2 : isSUV ? 3 : 4,
    familia: isSUV ? 4 : isSedan ? 4 : isPickup ? 3 : isRoadster ? 1 : isMicro ? 2 : 3,
    aventura: isPickup ? 5 : isSUV ? 3 : isRoadster ? 1 : 2,
    performance: perfScore(cv),
    custo: fuelType === "PHEV" ? Math.max(1, custoScore(price) - 1) : custoScore(price),
  };
}

// -- Bulk-imported models (price/range/power from aggregate market source, ago/2026) --
// Format: [brand, model, category, price, powerCv, rangeKm, consumptionKwh100, fuelType]
const BULK_RAW = [
  ["BYD", "Dolphin Mini", "Hatch compacto", 119990, 95, 340, 11.5, "BEV"],
  ["MG", "MG4 (versão importada)", "Hatch médio", 189990, 203, 435, 14.5, "BEV"],
];

// -- Carros removidos da base em 17/08/2026 após pesquisa (não são mais vendidos
// oficialmente 0km no Brasil, ou não há confirmação de venda oficial):
// - Nissan Leaf: descontinuado no Brasil (saiu de linha ~2024/2025); a nova
//   geração global ainda não tem chegada oficial confirmada.
// - Kia EV6: não consta no catálogo oficial atual da Kia Brasil (kia.com.br).
// - Caoa Chery iCar: retirado do configurador oficial em março/2026.
// - Smart #1: sem evidência de venda oficial confirmada no Brasil (retorno da
//   marca ainda tratado como especulativo por fontes de abr/2026).
// - Toyota "Corolla Cross XEV" PHEV: não existe — a Toyota só vende o Corolla
//   Cross Hybrid (autorrecarregável, sem tomada) no Brasil; um PHEV real só
//   chega em 2027.
// - Honda e:NP1 (também vendido como e:Ny1/e:N1): sem confirmação oficial de
//   chegada ao Brasil — Honda ainda "analisa a viabilidade" (fontes ago/2026).

const PRICE_CHECKED_IDS = new Set(["geely-ex2-pro", "jac-e-js1", "byd-dolphin-mini"]);
const PRICE_CHECK_DATE = "15/08/2026";

const BULK_CARS = BULK_RAW.map(([brand, model, category, price, powerCv, rangeKm, consumption, fuelType]) => {
  const id = `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    id,
    name: `${brand} ${model}`,
    brand,
    category,
    price,
    powerCv,
    torqueNm: null,
    batteryKwh: null,
    batteryChem: null,
    motorType: null,
    rangeKm,
    consumptionKwh100: consumption,
    accel: null,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType,
    verified: false,
    priceVerifiedDate: PRICE_CHECKED_IDS.has(id) ? PRICE_CHECK_DATE : null,
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    techNotes: "",
    personas: defaultPersonasFor(category, price, powerCv, fuelType),
  };
});

// ---------------------------------------------------------------------------
// SEED DATA — derived from the research done for this comparison
// ---------------------------------------------------------------------------
const SEED_CARS_DETAILED = [
  {
    id: "ex2max",
    name: "Geely EX2 Max",
    brand: "Geely",
    category: "Hatch compacto",
    price: 136800,
    powerCv: 116,
    torqueNm: 150,
    batteryKwh: 39,
    batteryChem: "LFP",
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 289,
    accel: 10.2,
    groundClearance: 160,
    trunkL: 375,
    weightKg: 1480,
    wallbox: "Não incluso",
    acKw: 7,
    dcKw: 70,
    airbags: 6,
    warranty: "Não informado",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "15/08/2026",
    maintenanceInterval: "20.000 km ou 12 meses",
    maintenanceFirstCost: "Pago (~R$ 315, fonte alternativa)",
    maintenanceKmBase: 100000,
    maintenanceTotalCost: 3264,
    consumptionKwh100: 13.5,
    videoUrl: "https://www.youtube.com/watch?v=Roq_07qi6zo",
    techNotes:
      "Um dos poucos elétricos do segmento com motor traseiro e tração RWD — arquitetura incomum nessa faixa de preço. Bateria LFP de 39 kWh prioriza durabilidade e custo sobre densidade energética, resultando na menor autonomia do grupo.",
    personas: { urbano: 5, familia: 2, aventura: 3, performance: 2, custo: 5 },
  },
  {
    id: "mg4urban",
    name: "MG4 Urban Luxury 54 kWh",
    brand: "MG",
    category: "Hatch médio",
    price: 149990,
    powerCv: 160,
    torqueNm: 250,
    batteryKwh: 54,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 358,
    accel: 9.5,
    groundClearance: 140,
    trunkL: 577,
    weightKg: 1504,
    wallbox: "Não confirmado",
    acKw: 11,
    dcKw: 87,
    airbags: 7,
    warranty: "7 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "15/08/2026",
    maintenanceInterval: "24.000 km ou 12 meses",
    maintenanceFirstCost: "Pago (R$ 400)",
    maintenanceKmBase: 120000,
    maintenanceTotalCost: 3941,
    consumptionKwh100: 15.1,
    videoUrl: "https://www.youtube.com/watch?v=iOdnLV552FU",
    techNotes:
      "Construído sobre a plataforma MSP (Modular Scalable Platform), a mesma usada na Europa — o que dá respaldo real ao resultado de 5 estrelas do MG4 Electric no Euro NCAP. Química LFP confirmada diretamente na concessionária, após divergência entre fontes públicas.",
    personas: { urbano: 4, familia: 5, aventura: 3, performance: 3, custo: 5 },
  },
  {
    id: "aionut",
    name: "GAC Aion UT Elite",
    brand: "GAC",
    category: "Hatch compacto",
    price: 159990,
    powerCv: 204,
    torqueNm: 210,
    batteryKwh: 60,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 310,
    accel: 7.3,
    groundClearance: 150,
    trunkL: 340,
    weightKg: 1520,
    wallbox: "Incluso, sem custo",
    acKw: 6.6,
    dcKw: 87,
    airbags: 6,
    warranty: "Não informado",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "15/08/2026",
    maintenanceInterval: "10.000 km ou 12 meses",
    maintenanceFirstCost: "Gratuita",
    maintenanceKmBase: 100000,
    maintenanceTotalCost: 6060,
    consumptionKwh100: 19.4,
    videoUrl: "https://www.youtube.com/watch?v=Ro3XSfv8pSw",
    techNotes:
      "Plataforma AEP 3.0 da GAC, com o motor de 204 cv mais forte do grupo e 0-100 em 7,3s. Bateria LFP de 60 kWh é a maior capacidade da comparação. Vão livre de 150 mm confirmado na concessionária.",
    personas: { urbano: 4, familia: 3, aventura: 4, performance: 5, custo: 4 },
  },
  {
    id: "gac-aion-ut-premium",
    name: "GAC Aion UT Premium",
    brand: "GAC",
    category: "Hatch compacto",
    price: 139990,
    powerCv: 204,
    torqueNm: 210,
    batteryKwh: 44.12,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 253,
    accel: 8.6,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 64,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão de entrada do Aion UT no Brasil (a Elite já está cadastrada separadamente, id 'aionut'), com bateria menor (44,12kWh vs 60kWh) e carregamento DC mais lento (64kW vs 87kW), resultando em autonomia de 253km vs 310km e aceleração mais lenta (8,6s vs 7,3s). Potência/torque do motor assumidos iguais aos da Elite (204cv/210Nm) — fontes brasileiras não indicam motor diferente entre as versões, só bateria e equipamentos (a Elite tem ADAS nível 2 e teto panorâmico que a Premium não tem).",
    personas: { urbano: 4, familia: 3, aventura: 4, performance: 5, custo: 5 },
  },
  {
    id: "ora5",
    name: "GWM Ora 5",
    brand: "GWM",
    category: "SUV compacto",
    price: 159900,
    powerCv: 204,
    torqueNm: 260,
    batteryKwh: 58.3,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 349,
    accel: 7.7,
    groundClearance: 175,
    trunkL: 362,
    weightKg: 1685,
    wallbox: "Depende de campanha",
    acKw: 11,
    dcKw: 120,
    airbags: 6,
    warranty: "Não informado",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "15/08/2026",
    maintenanceInterval: "24.000 km ou 24 meses",
    maintenanceFirstCost: "Pago (R$ 839)",
    maintenanceKmBase: 60000,
    maintenanceTotalCost: 2838,
    consumptionKwh100: 16.7,
    videoUrl: "https://www.youtube.com/watch?v=TcEpTAIuw_g",
    techNotes:
      "Plataforma Lemon da GWM. Maior vão livre (175 mm) e únicos ângulos de entrada/saída divulgados oficialmente (17°/25°) do grupo — vantagem real para quem enfrenta rampas ou terreno irregular. Único com estepe temporário de fábrica ao lado do Aion UT.",
    personas: { urbano: 3, familia: 4, aventura: 5, performance: 5, custo: 3 },
  },
  {
    id: "dolphinse",
    name: "BYD Dolphin SE",
    brand: "BYD",
    category: "Hatch compacto",
    price: 159990,
    powerCv: 177,
    torqueNm: 290,
    batteryKwh: 45.12,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 272,
    accel: 8.0,
    groundClearance: 120,
    trunkL: 250,
    weightKg: 1485,
    wallbox: "Depende de campanha",
    acKw: 7,
    dcKw: 80,
    airbags: 6,
    warranty: "6 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "15/08/2026",
    maintenanceInterval: "20.000 km ou 12 meses",
    maintenanceFirstCost: "Pago (R$ 400)",
    maintenanceKmBase: 100000,
    maintenanceTotalCost: 3280,
    consumptionKwh100: 16.6,
    videoUrl: "https://www.youtube.com/watch?v=KLLBh0NYN1A",
    techNotes:
      "Plataforma e-Platform 3.0 da BYD, com a bateria Blade — LFP com formato estrutural que dispensa módulos intermediários, referência de segurança térmica no setor. Autonomia oficial PBEV (272 km) é mais conservadora que o padrão NEDC usado por parte da imprensa.",
    personas: { urbano: 4, familia: 2, aventura: 1, performance: 3, custo: 4 },
  },
  {
    id: "geely-ex2-pro",
    name: "Geely EX2 Pro",
    brand: "Geely",
    category: "Hatch compacto",
    price: 123800,
    powerCv: 116,
    torqueNm: 150,
    batteryKwh: 39.4,
    batteryChem: "LFP",
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 289,
    accel: 10.2,
    groundClearance: 160,
    trunkL: 375,
    weightKg: 1300,
    wallbox: null,
    acKw: 6.6,
    dcKw: 70,
    airbags: 6,
    warranty: "6 anos veículo / 8 anos bateria (150.000 km)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 13.6,
    techNotes:
      "Compartilha com o EX2 Max a mesma plataforma, o motor traseiro (RWD) e a bateria LFP de 39,4 kWh — a versão Pro é a entrada de linha, com potência, torque e autonomia idênticos, mas com pacote de ADAS e itens de conforto reduzidos. Tração traseira é incomum nessa faixa de preço.",
    personas: { urbano: 5, familia: 2, aventura: 3, performance: 2, custo: 5 },
  },
  {
    id: "jac-e-js1",
    name: "JAC E-JS1",
    brand: "JAC",
    category: "Hatch compacto",
    price: 132900,
    powerCv: 62,
    torqueNm: 150,
    batteryKwh: 31.4,
    batteryChem: "LFP",
    motorType: null,
    rangeKm: 181,
    accel: 10.7,
    groundClearance: null,
    trunkL: 121,
    weightKg: 1180,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 2,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.3,
    techNotes:
      "Um dos elétricos mais baratos do Brasil, com bateria LFP de 31,4 kWh e a menor autonomia INMETRO do grupo (181 km) — reflexo do foco em uso urbano de curta distância. Apenas 2 airbags (motorista e passageiro), abaixo do padrão de 6 já comum em concorrentes chineses mais recentes.",
    personas: { urbano: 5, familia: 2, aventura: 2, performance: 1, custo: 4 },
  },
  {
    id: "renault-kwid-e-tech",
    name: "Renault Kwid E-Tech",
    brand: "Renault",
    category: "Hatch compacto",
    price: 99990,
    powerCv: 65,
    torqueNm: 113,
    batteryKwh: 26.8,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 180,
    accel: 14.6,
    groundClearance: 172,
    trunkL: 290,
    weightKg: 969,
    wallbox: null,
    acKw: null,
    dcKw: 30,
    airbags: 6,
    warranty: "3 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: "10.000 km",
    maintenanceFirstCost: "Pago (R$ 320 na 1ª revisão)",
    maintenanceKmBase: 20000,
    maintenanceTotalCost: 686,
    consumptionKwh100: 14.9,
    techNotes:
      "O elétrico mais barato do Brasil. Autonomia real INMETRO é 180 km (não os 265 km WLTP que circulavam antes) e o consumo real fica em ~14,9 kWh/100km — bem mais alto que o valor otimista anterior. Carregamento DC de 30 kW leva a bateria de 20% a 80% em ~45 min. Vão livre de 172mm é alto pro segmento.",
    personas: { urbano: 5, familia: 2, aventura: 3, performance: 1, custo: 5 },
  },
  {
    id: "neta-aya",
    name: "Neta Aya",
    brand: "Neta",
    category: "Hatch compacto",
    price: 128900,
    powerCv: 95,
    torqueNm: 150,
    batteryKwh: 40.7,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 263,
    accel: null,
    groundClearance: null,
    trunkL: 335,
    weightKg: 1180,
    wallbox: "Incluso, sem custo",
    acKw: 6.6,
    dcKw: 60,
    airbags: null,
    warranty: "5 anos/150.000 km veículo, 8 anos/180.000 km bateria e motor",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: "20.000 km",
    maintenanceFirstCost: "Gratuita (5 primeiras revisões, fonte única)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 15.5,
    techNotes:
      "Preço de tabela varia por versão: Comfort ~R$128.900, Luxury foi reajustada pra R$149.900 em jan/2026 (era R$134.900 no lançamento). Autonomia oficial PBEV/INMETRO de 263 km é bem confirmada; o consumo foi recalculado pra 15,5 kWh/100km pra bater com essa autonomia real (o valor de 12 kWh/100km batia só com a autonomia WLTP de 338 km, não com a brasileira).",
    personas: { urbano: 5, familia: 2, aventura: 2, performance: 2, custo: 5 },
  },
  {
    id: "gwm-ora-03",
    name: "GWM Ora 03",
    brand: "GWM",
    category: "Hatch compacto",
    price: 150000,
    powerCv: 171,
    torqueNm: 250,
    batteryKwh: 48,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 319,
    accel: 8.2,
    groundClearance: 135,
    trunkL: 228,
    weightKg: 1540,
    wallbox: "Depende de campanha",
    acKw: 7.4,
    dcKw: null,
    airbags: null,
    warranty: "5 anos sem limite de km veículo / 8 anos/200.000 km bateria",
    fuelType: "BEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: "Programa promocional: 5 anos ou 48.000 km de revisões grátis",
    maintenanceFirstCost: "Gratuita (dentro do programa promocional)",
    maintenanceKmBase: 48000,
    maintenanceTotalCost: 0,
    consumptionKwh100: 15,
    techNotes:
      "Modelo com maior conflito de dados entre fontes: existem duas versões (Skin BEV48 e GT BEV63) com preço, potência e bateria cruzados de forma inconsistente entre sites. Ficha usada aqui é a versão Skin BEV48 (171cv/48kWh), a mais compatível com o preço de tabela. Tem frunk de 57L além dos 228L do porta-malas traseiro. Recomendado checar diretamente no site oficial GWM Brasil antes de decidir.",
    personas: { urbano: 4, familia: 2, aventura: 2, performance: 3, custo: 4 },
  },
  {
    id: "volvo-ex30",
    name: "Volvo EX30",
    brand: "Volvo",
    category: "SUV compacto premium",
    price: 239950,
    powerCv: 272,
    torqueNm: 343,
    batteryKwh: 51,
    batteryChem: "LFP",
    motorType: "PMSM traseiro (RWD) — versão Single",
    rangeKm: 250,
    accel: null,
    groundClearance: null,
    trunkL: 318,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: "36 meses/100.000 km veículo, 8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.4,
    techNotes:
      "Existem duas configurações de bateria: Single (51 kWh LFP, RWD, ~250 km INMETRO — ficha usada aqui) e Twin/Extended Range (69 kWh NMC, ~316-338 km). Faixa de preço por versão vai de R$212.554 a R$275.485. Houve recall no Brasil (~5.600 unidades) por risco de incêndio na bateria — vale checar se o carro já passou pelo reparo antes de comprar usado.",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 4, custo: 2 },
  },
  {
    id: "fiat-500e",
    name: "Fiat 500e",
    brand: "Fiat",
    category: "Hatch compacto premium",
    price: 219990,
    powerCv: 118,
    torqueNm: 220,
    batteryKwh: 42,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 227,
    accel: 9.0,
    groundClearance: null,
    trunkL: 185,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 85,
    airbags: null,
    warranty: "8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 18.5,
    techNotes:
      "Versão de entrada é a Action (R$219.990) — a Icon custa mais. Autonomia WLTP divulgada é 320 km, mas um veículo real registrado rodando no Brasil mediu 227 km com consumo de 18,5 kWh/100km, valores bem mais conservadores usados aqui. DC de 85 kW carrega de 0-80% em ~35 min.",
    personas: { urbano: 5, familia: 1, aventura: 1, performance: 2, custo: 2 },
  },
  {
    id: "peugeot-e-2008",
    name: "Peugeot e-2008",
    brand: "Peugeot",
    category: "SUV compacto premium",
    price: 259990,
    powerCv: 158,
    torqueNm: 260,
    batteryKwh: 54,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 261,
    accel: null,
    groundClearance: null,
    trunkL: 434,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 100,
    airbags: 6,
    warranty: "2 anos veículo + 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.7,
    techNotes:
      "Nova geração eleva a potência pra 158cv (a versão anterior tinha 136cv) e a bateria pra 54 kWh (era 50 kWh). Autonomia oficial PBEV/INMETRO é 261 km — bem abaixo do WLTP europeu de 345 km. AC trifásico de 11 kW e DC de até 100 kW (0-80% em ~30 min). Preço de tabela vai de R$259.990 a R$269.990 conforme versão.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 3, custo: 2 },
  },
  {
    id: "mini-cooper-se",
    name: "Mini Cooper SE",
    brand: "Mini",
    category: "Hatch compacto premium",
    price: 259990,
    powerCv: 218,
    torqueNm: 330,
    batteryKwh: 54.2,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 303,
    accel: 6.7,
    groundClearance: null,
    trunkL: 210,
    weightKg: 1540,
    wallbox: "Incluso, sem custo",
    acKw: 11,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: "Incluso no pacote MINI Service Inclusive (4 anos, km ilimitado)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.9,
    techNotes:
      "Um dos modelos mais consistentes entre as fontes pesquisadas — poucas divergências. Porta-malas de 210L (800L com bancos rebatidos). O pacote MINI Service Inclusive (4 anos, km ilimitado) inclui um MINI Wallbox Essential 11kW de cortesia. Carga AC completa em ~5h15.",
    personas: { urbano: 5, familia: 1, aventura: 1, performance: 4, custo: 2 },
  },
  {
    id: "chevrolet-equinox-ev",
    name: "Chevrolet Equinox EV",
    brand: "Chevrolet",
    category: "SUV médio",
    price: 419000,
    powerCv: 292,
    torqueNm: 451,
    batteryKwh: 85,
    batteryChem: "NCMA",
    motorType: "Bimotor AWD (2x146cv)",
    rangeKm: 443,
    accel: 5.8,
    groundClearance: null,
    trunkL: 441,
    weightKg: 2336,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 8,
    warranty: "8 anos/160.000 km bateria (confirmar termo exato Brasil)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: "Gratuita (1ª revisão aos 10.000 km)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.2,
    techNotes:
      "Preço real de tabela é ~R$419.000 — bem acima do valor de R$299.990 que circulava antes. Bateria NCMA (evolução da química NMC, com menos cobalto) de 85 kWh, a maior do grupo, com motor biMotor AWD de 2x146cv somando 292cv e 451Nm.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 4, custo: 1 },
  },
  {
    id: "chevrolet-blazer-ev",
    name: "Chevrolet Blazer EV RS",
    brand: "Chevrolet",
    category: "SUV médio",
    price: 503190,
    powerCv: 347,
    torqueNm: 450,
    batteryKwh: 102,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 526,
    accel: 5.8,
    groundClearance: null,
    trunkL: 764,
    weightKg: 2495,
    wallbox: null,
    acKw: 22,
    dcKw: 190,
    airbags: 8,
    warranty: "8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.4,
    techNotes:
      "SUV elétrico esportivo da plataforma Ultium (mesma base do Equinox EV), vendido no Brasil só na versão RS (motor único traseiro, 347cv/450Nm). Preço subiu de R$479.000 no lançamento (2024) para R$503.190 atualmente. Autonomia declarada varia entre 481km (Inmetro, fonte de lançamento) e 526km (fonte mais recente) — usamos a mais recorrente. Uma versão AWD (305cv, bateria menor de 85kWh) foi anunciada para 2026 mas ainda sem ficha e preço confiáveis publicados.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "chevrolet-captiva-ev",
    name: "Chevrolet Captiva EV Premier",
    brand: "Chevrolet",
    category: "SUV médio",
    price: 199990,
    powerCv: 201,
    torqueNm: 310,
    batteryKwh: 60,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 304,
    accel: 9.9,
    groundClearance: null,
    trunkL: 400,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 120,
    airbags: 6,
    warranty: "8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.6,
    techNotes:
      "SUV elétrico familiar de produção nacional (Polo Automotivo do Ceará, junto com o Spark EUV), vendido só na versão Premier. Bateria LFP de 60kWh, motor único dianteiro de 201cv/310Nm. Preço oficial de lançamento é R$199.990 — algumas fontes mais recentes citam R$219.990, possivelmente um reajuste ainda não confirmado em múltiplas fontes. DC de até 120kW (30-80% em ~30min).",
    personas: { urbano: 3, familia: 5, aventura: 3, performance: 3, custo: 3 },
  },
  {
    id: "chevrolet-spark-euv",
    name: "Chevrolet Spark EUV",
    brand: "Chevrolet",
    category: "SUV compacto",
    price: 144990,
    powerCv: 102,
    torqueNm: 180,
    batteryKwh: 41.9,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 258,
    accel: 11.0,
    groundClearance: null,
    trunkL: 355,
    weightKg: null,
    wallbox: null,
    acKw: 7,
    dcKw: null,
    airbags: null,
    warranty: "3 anos veículo (garantia de bateria não confirmada)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 16.1,
    techNotes:
      "Mini SUV elétrico de entrada da Chevrolet no Brasil, com motor único dianteiro de 102cv/180Nm e bateria de 41,9kWh. Porta-malas de 355L (916L com bancos rebatidos). Carregador de parede (wall charger) de 7kW leva de 20% a 100% em ~7h; carregamento DC não confirmado em fonte confiável.",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 1, custo: 4 },
  },
  {
    id: "volvo-ex40",
    name: "Volvo EX40",
    brand: "Volvo",
    category: "SUV médio premium",
    price: 329950,
    powerCv: 238,
    torqueNm: 420,
    batteryKwh: 69,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD) — versão P6",
    rangeKm: 385,
    accel: null,
    groundClearance: null,
    trunkL: 414,
    weightKg: 2050,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 7,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.9,
    techNotes:
      "Antigo Volvo XC40 Recharge, renomeado EX40 em 2025. Duas versões: P6 (238cv/420Nm, RWD, bateria 69kWh, ~385km — ficha usada aqui, compatível com o preço de tabela Plus de R$329.950) e P8 (408cv/670Nm, AWD, bateria 82kWh, ~393km, 0-100 em 4,9s, mais cara). Peso ~2.050kg é aproximado (fonte não especifica por versão).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 1 },
  },
  {
    id: "bmw-ix1",
    name: "BMW iX1 eDrive20",
    brand: "BMW",
    category: "SUV compacto premium",
    price: 359950,
    powerCv: 204,
    torqueNm: 250,
    batteryKwh: 64.7,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 332,
    accel: null,
    groundClearance: null,
    trunkL: 490,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.5,
    techNotes:
      "Existem duas versões: eDrive20 (FWD, R$359.950, 204cv/250Nm, bateria 64,7kWh, ~332km INMETRO — ficha usada aqui) e xDrive30 M Sport (AWD, R$485.950, 313cv/494Nm, bateria 66,5kWh, ~303km INMETRO). O preço que circulava antes (R$339.990 com 313cv) não corresponde a nenhuma das duas versões reais.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 2, custo: 1 },
  },
  {
    id: "bmw-ix2",
    name: "BMW iX2 xDrive30 M Sport",
    brand: "BMW",
    category: "SUV compacto premium",
    price: 495950,
    powerCv: 313,
    torqueNm: 494,
    batteryKwh: 64.8,
    batteryChem: null,
    motorType: "Bimotor AWD (um motor em cada eixo)",
    rangeKm: 337,
    accel: 5.6,
    groundClearance: null,
    trunkL: 525,
    weightKg: null,
    wallbox: "Depende de campanha",
    acKw: 22,
    dcKw: 130,
    airbags: null,
    warranty: "8 anos bateria (garantia do veículo BMW não confirmada com fonte clara)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20,
    techNotes:
      "Versão elétrica cupê-SUV do X2, voltou a ser vendida oficialmente no Brasil (o iX2 já havia ficado fora de linha por um tempo). Bimotor AWD com 313cv/494Nm combinados. Preço de tabela oficial de agosto/2026 é R$495.950 — fontes de imprensa mais antigas (de 2024/2025) mencionam valores de R$443.950 a R$464.950, defasados pelos reajustes ao longo do período. Porta-malas de 525L (até 1.400L com bancos rebatidos).",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "bmw-ix3",
    name: "BMW iX3 50 xDrive",
    brand: "BMW",
    category: "SUV médio premium",
    price: 582950,
    powerCv: 469,
    torqueNm: 645,
    batteryKwh: 108.7,
    batteryChem: null,
    motorType: "Bimotor AWD (um motor em cada eixo)",
    rangeKm: 570,
    accel: 4.9,
    groundClearance: null,
    trunkL: 520,
    weightKg: null,
    wallbox: null,
    acKw: 22,
    dcKw: 400,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.1,
    techNotes:
      "Nova geração do iX3, estreou em pré-venda no Brasil em jul/2026 por R$582.950 — 'nova era' de plataforma elétrica da marca (arquitetura 800V, células cilíndricas integradas à estrutura). Maior autonomia declarada entre elétricos vendidos no país (570km PBEV/Inmetro). Carregamento DC de até 400kW (10-80% em ~21min). Consumo de 19,1 kWh/100km calculado a partir de bateria/autonomia oficiais (não divulgado diretamente pela BMW). Por estar em fase de pré-venda, unidades ainda podem não estar disponíveis para entrega imediata.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "bmw-ix",
    name: "BMW iX xDrive50 Sport",
    brand: "BMW",
    category: "SUV grande premium",
    price: 923950,
    powerCv: 523,
    torqueNm: 765,
    batteryKwh: 111.5,
    batteryChem: null,
    motorType: "Bimotor AWD sob demanda",
    rangeKm: 528,
    accel: 4.6,
    groundClearance: null,
    trunkL: 500,
    weightKg: 2585,
    wallbox: null,
    acKw: null,
    dcKw: 195,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 21.1,
    techNotes:
      "SUV grande elétrico topo da linha i da BMW, R$923.950 (preço de tabela válido até 31/08/2026). Bimotor AWD sob demanda com 523cv/765Nm. Também existe a versão de entrada iX xDrive40 (a partir de R$726.950, motor único, bateria menor), não detalhada aqui por falta de ficha técnica completa confiável. Consumo de 21,1 kWh/100km calculado a partir de bateria/autonomia oficiais.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "bmw-i4",
    name: "BMW i4 eDrive40 M Sport",
    brand: "BMW",
    category: "Sedã médio premium",
    price: 582950,
    powerCv: 340,
    torqueNm: 430,
    batteryKwh: 81.3,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 422,
    accel: 5.7,
    groundClearance: null,
    trunkL: 470,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.3,
    techNotes:
      "Gran Coupé elétrico (liftback 4 portas), motor traseiro único de 340cv/430Nm. Preço de tabela oficial de agosto/2026 é R$582.950. Autonomia tem alguma divergência entre fontes (399 a 422km PBEV/Inmetro conforme a fonte) — usamos aqui a mais recorrente. Porta-malas de 470L (1.290L com bancos rebatidos).",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "bmw-i5",
    name: "BMW i5 M60 xDrive",
    brand: "BMW",
    category: "Sedã grande premium",
    price: 795950,
    powerCv: 601,
    torqueNm: 820,
    batteryKwh: 81.2,
    batteryChem: null,
    motorType: "Bimotor AWD sob demanda",
    rangeKm: 391,
    accel: null,
    groundClearance: null,
    trunkL: 490,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 205,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.8,
    techNotes:
      "Sedã executivo elétrico, versão M60 xDrive (única versão vendida no Brasil), bimotor AWD com 601cv/820Nm combinados. Chegou ao Brasil em mar/2024 por R$759.950; fontes mais recentes (2025/2026) mencionam R$795.950, mas não achamos confirmação oficial datada de ago/2026 — trate o preço como aproximado até checar na concessionária. DC de até 205kW (10-80% em ~30min).",
    personas: { urbano: 2, familia: 4, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "bmw-i7",
    name: "BMW i7 xDrive60 M Sport",
    brand: "BMW",
    category: "Sedã grande premium",
    price: 1373950,
    powerCv: 544,
    torqueNm: 745,
    batteryKwh: 101.7,
    batteryChem: null,
    motorType: "Bimotor AWD",
    rangeKm: 512,
    accel: 4.7,
    groundClearance: null,
    trunkL: 515,
    weightKg: 2715,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.9,
    techNotes:
      "Sedã executivo elétrico topo de linha da BMW (versão elétrica do Série 7), R$1.373.950 — preço confirmado em vários concessionários oficiais em ago/2026. Bimotor AWD com 544cv/745Nm combinados, bateria de 101,7kWh. Recarga DC de 10-80% em ~34min.",
    personas: { urbano: 1, familia: 4, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "bmw-530e",
    name: "BMW 530e M Sport",
    brand: "BMW",
    category: "Sedã grande híbrido",
    price: null,
    powerCv: 299,
    torqueNm: 450,
    batteryKwh: 19.4,
    batteryChem: null,
    motorType: "PHEV combinado (2.0 turbo 190cv + elétrico 184cv) — RWD",
    rangeKm: null,
    accel: null,
    groundClearance: null,
    trunkL: 520,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Sedã executivo híbrido plug-in (Série 5), conjunto combinado de 299cv/450Nm com bateria de 19,4kWh e ~61km de autonomia elétrica pura. Preço não confirmado com segurança — fontes de 2026 divergem muito entre si (de R$456.706 a R$643.950), possivelmente por diferença de ano-modelo/pacotes; deixado como null até confirmar diretamente na concessionária.",
    personas: { urbano: 2, familia: 4, aventura: 1, performance: 4, custo: 2 },
  },
  {
    id: "bmw-x5-xdrive50e",
    name: "BMW X5 xDrive50e M Sport",
    brand: "BMW",
    category: "SUV híbrido premium",
    price: 864950,
    powerCv: 489,
    torqueNm: 700,
    batteryKwh: 25.7,
    batteryChem: null,
    motorType: "PHEV combinado (3.0 I6 turbo 313cv + elétrico) — AWD",
    rangeKm: null,
    accel: 4.8,
    groundClearance: null,
    trunkL: 500,
    weightKg: null,
    wallbox: null,
    acKw: 22,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV grande híbrido plug-in, motor a combustão 3.0 I6 turbo (313cv) somado a elétrico, com potência combinada de 489cv/700Nm. Preço de tabela R$864.950 (ago/2026). Bateria de 25,7kWh com ~76km de autonomia elétrica pura. AC de 22kW.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "hyundai-ioniq-5",
    name: "Hyundai Ioniq 5",
    brand: "Hyundai",
    category: "SUV médio premium",
    price: 394990,
    powerCv: 325,
    torqueNm: 604,
    batteryKwh: 84,
    batteryChem: "NMC",
    motorType: "Bimotor AWD (plataforma E-GMP)",
    rangeKm: 374,
    accel: 5.3,
    groundClearance: 178,
    trunkL: 527,
    weightKg: null,
    wallbox: "Incluso, sem custo",
    acKw: 11,
    dcKw: 350,
    airbags: 8,
    warranty: "5 anos sem limite de km veículo (inclui carregador residencial) + 8 anos/160.000 km bateria e motores",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: "~R$1.200/revisão (confiança moderada, sem tabela oficial detalhada)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 22.5,
    techNotes:
      "Preço de lançamento (Signature) é R$394.990 — acima do valor de R$339.990 que circulava antes (havia descontos pontuais de estoque parado até R$294.990, mas não é preço de tabela). Autonomia oficial PBEV/INMETRO é 374 km, bem abaixo do WLTP de 480 km. DC de até 350 kW carrega de 10-80% em ~18 min. Wallbox residencial WEG 7,68kW incluso, com 1 ano de cobertura.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "jetour-t2-phev",
    name: "Jetour T2 PHEV",
    brand: "Jetour",
    category: "SUV híbrido",
    price: 289900,
    powerCv: 339,
    torqueNm: 510,
    batteryKwh: 26.7,
    batteryChem: null,
    motorType: "PHEV combinado (1.5 turbo ~128-135cv + elétrico 225cv)",
    rangeKm: 1100,
    accel: 7.5,
    groundClearance: 205,
    trunkL: null,
    weightKg: 2110,
    wallbox: null,
    acKw: 7,
    dcKw: 40,
    airbags: 6,
    warranty: "7 anos completa + 8 anos/160.000 km bateria e motor elétrico",
    fuelType: "PHEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço real de tabela é R$289.900 (Advance) a R$299.900 (Premium) — bem acima do valor anterior de R$189.990. Potência combinada real é de até 339cv (motor 1.5 turbo + elétrico), não 197cv. Autonomia elétrica pura ~75km (fontes variam entre 70-77km). Consumo híbrido de 11,4 km/L no ciclo urbano (gasolina). Porta-malas tem conflito entre fontes (450L vs 580L). Carregamento AC 7kW / DC 40kW (20-80% em ~30-36min).",
    personas: { urbano: 2, familia: 4, aventura: 4, performance: 4, custo: 1 },
  },
  {
    id: "jetour-s06",
    name: "Jetour S06",
    brand: "Jetour",
    category: "SUV híbrido",
    price: 204900,
    powerCv: 315,
    torqueNm: 510,
    batteryKwh: 19.43,
    batteryChem: "LFP",
    motorType: "PHEV combinado (1.5 turbo 135cv + elétrico 204cv) — FWD",
    rangeKm: 1200,
    accel: 7.9,
    groundClearance: null,
    trunkL: 416,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: "7 anos/150.000 km veículo + 8 anos/160.000 km bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV de entrada da Jetour no Brasil, marca que estreou no país em 2026 com 3 modelos PHEV (S06, T1 e T2, este já cadastrado separadamente). Mesmo conjunto mecânico do T1 (1.5 turbo 135cv + elétrico 204cv, 315cv/510Nm combinados), mas com bateria menor (19,43kWh vs 26,7kWh), resultando em menos autonomia elétrica (70km vs 88km). Preço subiu de R$199.900 (pré-venda) pra R$204.900 (Advance, a partir de mai/2026); versão Premium custa R$239.900.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 2 },
  },
  {
    id: "jetour-t1",
    name: "Jetour T1",
    brand: "Jetour",
    category: "SUV híbrido",
    price: 254900,
    powerCv: 315,
    torqueNm: 510,
    batteryKwh: 26.7,
    batteryChem: "LFP",
    motorType: "PHEV combinado (1.5 turbo 135cv + elétrico 204cv) — FWD",
    rangeKm: 1200,
    accel: 8.7,
    groundClearance: null,
    trunkL: 574,
    weightKg: 2000,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: "7 anos/150.000 km veículo + 8 anos/160.000 km bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV intermediário da Jetour, entre o S06 (mais barato) e o T2 (mais caro/potente). Mesmo conjunto mecânico do S06 (315cv/510Nm), mas bateria maior (26,7kWh vs 19,43kWh) e mais autonomia elétrica (88km vs 70km) e porta-malas maior (574L vs 416L, até 1.455L com bancos rebatidos). Preço Advance subiu de R$249.900 (pré-venda) pra R$254.900 (a partir de mai/2026); versão Premium custa R$274.900.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "jaecoo-7-phev",
    name: "JAECOO 7 PHEV",
    brand: "JAECOO",
    category: "SUV híbrido",
    price: 234990,
    powerCv: 279,
    torqueNm: null,
    batteryKwh: 18.3,
    batteryChem: "LFP",
    motorType: "PHEV combinado (1.5 turbo 135cv + elétrico 204cv)",
    rangeKm: 1100,
    accel: 8.5,
    groundClearance: null,
    trunkL: 500,
    weightKg: 1795,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 7,
    warranty: "7 anos ou 150.000 km",
    fuelType: "PHEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: "12 meses/10.000 km, grátis nos 3 primeiros anos",
    maintenanceFirstCost: "Gratuita (3 primeiros anos)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço varia por versão: Elite R$179.990, Luxury R$234.990 (ficha usada aqui), Prestige R$256.990 — nenhuma bate exatamente com o valor anterior de R$199.990. A marca mudou a metodologia de medição de potência (UN R21): hoje anuncia 279cv pro mesmo conjunto mecânico (1.5 turbo 135cv + elétrico 204cv) que antes era anunciado com 339cv. Autonomia elétrica pura de 79km (INMETRO, bem confirmada). Consumo híbrido de 15,1 km/L urbano.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "gwm-haval-h6-phev",
    name: "GWM Haval H6 PHEV19",
    brand: "GWM",
    category: "SUV híbrido",
    price: 248000,
    powerCv: 326,
    torqueNm: 540,
    batteryKwh: 19,
    batteryChem: "LFP (SVOLT)",
    motorType: "PHEV combinado",
    rangeKm: 1200,
    accel: 7.4,
    groundClearance: null,
    trunkL: 560,
    weightKg: null,
    wallbox: null,
    acKw: 6.6,
    dcKw: 33,
    airbags: 6,
    warranty: "5 anos sem limite de km veículo + 8 anos/200.000 km sistema híbrido e bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: "12.000 km/12 meses",
    maintenanceFirstCost: "Conflito entre fontes: grátis ou ~R$890",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Existem 4 variantes do Haval H6 em 2026: HEV2 (não é PHEV, R$223 mil), PHEV19 (ficha usada aqui, 326cv, R$248 mil — preço atualizado, o valor anterior de R$219.800 estava desatualizado), PHEV35 (393cv, R$288 mil) e GT (393cv, carroceria cupê, R$325 mil). Autonomia elétrica pura de 77km INMETRO (até 115km WLTP). Um dos poucos PHEVs com carregamento DC (até 33kW), incomum no segmento.",
    personas: { urbano: 2, familia: 4, aventura: 4, performance: 5, custo: 2 },
  },
  {
    id: "gwm-tank-300",
    name: "GWM Tank 300 Hi4-T",
    brand: "GWM",
    category: "SUV híbrido",
    price: 342000,
    powerCv: 394,
    torqueNm: 750,
    batteryKwh: 37.1,
    batteryChem: "NMC",
    motorType: "PHEV combinado 4x4 (2.0 turbo 245cv + elétrico dianteiro 163cv)",
    rangeKm: 1290,
    accel: 6.8,
    groundClearance: null,
    trunkL: 863,
    weightKg: 2630,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: "5 anos sem limite de km veículo + 8 anos/200.000 km sistema híbrido e bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV off-road de luxo, híbrido plug-in 4x4 com 394cv/750Nm combinados, bateria 37,1kWh NMC e autonomia elétrica pura de 74-75km (Inmetro) / até 106km (WLTP). Preço oficial no site da GWM Brasil é R$342.000 — agregadores de mercado citam valores de R$333.000 (lançamento, 2025) a R$389.990, possível reflexo de diferentes datas/versões. Autonomia total combinada (~1.290km) é uma estimativa calculada a partir do consumo híbrido divulgado (18,4-18,7 km/l) e do tanque de 70L — não é um valor divulgado diretamente pela GWM. Porta-malas de 863L (1.520L com bancos rebatidos).",
    personas: { urbano: 1, familia: 3, aventura: 5, performance: 5, custo: 1 },
  },
  {
    id: "gwm-wey-07",
    name: "GWM WEY 07",
    brand: "GWM",
    category: "SUV híbrido",
    price: 429000,
    powerCv: 517,
    torqueNm: 820,
    batteryKwh: 42.5,
    batteryChem: null,
    motorType: "PHEV combinado AWD (1.5 turbo + dois motores elétricos, um em cada eixo)",
    rangeKm: 1200,
    accel: 4.9,
    groundClearance: null,
    trunkL: 239,
    weightKg: 2545,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV híbrido plug-in de luxo com 6 lugares da WEY, submarca premium da GWM. Lançado oficialmente no Brasil em out/2025 (vendas iniciadas em 23/10), preço R$429.000. Potência combinada de 517cv/820Nm, bateria 42,5kWh, autonomia elétrica de 128km (Inmetro) — até 185km citado em fonte WLTP. Autonomia total combinada supera 1.200km. Porta-malas de apenas 239L com a 3ª fileira em uso (1.040L com ela rebatida). Garantia não confirmada em fonte disponível.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "byd-dolphin",
    name: "BYD Dolphin",
    brand: "BYD",
    category: "Hatch compacto",
    price: 149800,
    powerCv: 95,
    torqueNm: 180,
    batteryKwh: 44.9,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 320,
    accel: 7.0,
    groundClearance: null,
    trunkL: 345,
    weightKg: 1410,
    wallbox: null,
    acKw: 7,
    dcKw: 40,
    airbags: 6,
    warranty: "8 anos/150.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 14.0,
    techNotes:
      "Autonomia WLTP divulgada é de até 340km; usamos aqui uma estimativa mais realista de uso urbano (290-320km). Bateria Blade LFP, mesma tecnologia usada em toda a linha BYD, com estrutura que dispensa módulos intermediários. 5 estrelas no Latin NCAP.",
    personas: { urbano: 5, familia: 2, aventura: 1, performance: 2, custo: 4 },
  },
  {
    id: "byd-dolphin-plus",
    name: "BYD Dolphin Plus",
    brand: "BYD",
    category: "Hatch compacto",
    price: 178800,
    powerCv: 204,
    torqueNm: null,
    batteryKwh: 60.5,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 420,
    accel: 5.9,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: 7,
    dcKw: 60,
    airbags: null,
    warranty: "8 anos/150.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 14.4,
    techNotes:
      "Versão de maior autonomia da linha Dolphin, com bateria maior (60,5kWh) que a versão padrão. Fontes de preço variam entre R$168.800 e R$178.800 conforme configuração. DC de 60kW carrega de 20% a 80% em ~45min.",
    personas: { urbano: 4, familia: 2, aventura: 1, performance: 4, custo: 3 },
  },
  {
    id: "byd-yuan-plus",
    name: "BYD Yuan Plus",
    brand: "BYD",
    category: "SUV compacto",
    price: 229800,
    powerCv: 204,
    torqueNm: 310,
    batteryKwh: 60.5,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 294,
    accel: 7.3,
    groundClearance: null,
    trunkL: 440,
    weightKg: 1690,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.6,
    techNotes:
      "Conhecido internacionalmente como BYD Atto 3. Preço real de tabela é R$229.800 — acima dos R$189.800 que circulavam antes. Autonomia PBEV/Inmetro de 294km é a oficial no Brasil (a autonomia CLTC chinesa de 510km, bem mais otimista, não se aplica aqui).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "byd-atto-2-gl",
    name: "BYD Atto 2 DM-i Flex GL",
    brand: "BYD",
    category: "SUV compacto",
    price: 149990,
    powerCv: 177,
    torqueNm: 300,
    batteryKwh: 7.3,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado flex (1.5 gasolina/etanol + elétrico) — DM-i Flex",
    rangeKm: 1000,
    accel: 8.5,
    groundClearance: null,
    trunkL: 455,
    weightKg: null,
    wallbox: null,
    acKw: 3.3,
    dcKw: null,
    airbags: 6,
    warranty: "6 anos/200.000 km veículo + 8 anos/200.000 km bateria Blade",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Estreia mundial do sistema híbrido plug-in DM-i Flex da BYD — primeiro PHEV do mundo capaz de rodar com gasolina OU etanol. Lançado no Brasil em 9/jun/2026, fabricado em Camaçari (BA). Versão de entrada GL: bateria pequena (7,3kWh), autonomia elétrica de só 45km, carregamento AC de até 3,3kW. Autonomia combinada de 1.000km (gasolina, ciclo NEDC) ou 770km (etanol). Vendida inicialmente por canal de venda direta. A versão GS (mais equipada, com ADAS 2) está cadastrada separadamente (id byd-atto-2-gs).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 3 },
  },
  {
    id: "byd-atto-2-gs",
    name: "BYD Atto 2 DM-i Flex GS",
    brand: "BYD",
    category: "SUV compacto",
    price: 169990,
    powerCv: 197,
    torqueNm: 300,
    batteryKwh: 18,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado flex (1.5 gasolina/etanol + elétrico) — DM-i Flex",
    rangeKm: 1045,
    accel: 8.4,
    groundClearance: null,
    trunkL: 455,
    weightKg: null,
    wallbox: null,
    acKw: 6.6,
    dcKw: null,
    airbags: 6,
    warranty: "6 anos/200.000 km veículo + 8 anos/200.000 km bateria Blade",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão topo de linha do Atto 2 DM-i Flex, com bateria maior (18kWh vs 7,3kWh da GL) que mais que dobra a autonomia elétrica pura (110km vs 45km) e carregamento AC mais rápido (6,6kW vs 3,3kW). Inclui pacote ADAS 2, que a GL não tem. Autonomia combinada de 1.045km (gasolina, NEDC) ou 770km (etanol). Fabricada em Camaçari (BA), lançada em 9/jun/2026.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 2 },
  },
  {
    id: "byd-seal",
    name: "BYD Seal",
    brand: "BYD",
    category: "Sedã médio",
    price: 269800,
    powerCv: 313,
    torqueNm: 360,
    batteryKwh: 82.5,
    batteryChem: "LFP (Blade), arquitetura CTB",
    motorType: "PMSM traseiro (RWD) — versão Design",
    rangeKm: 372,
    accel: null,
    groundClearance: null,
    trunkL: 400,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 150,
    airbags: null,
    warranty: "6 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 22.2,
    techNotes:
      "Preço varia entre fontes de R$269.800 a R$296.800 conforme a versão/momento. Existe também a versão Performance AWD, mais potente e cara, com 0-100 em 3,8s. Autonomia real PBEV/Inmetro de 372km é bem mais conservadora que os 570km que circulavam antes (provavelmente CLTC chinês).",
    personas: { urbano: 2, familia: 3, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "byd-han-ev",
    name: "BYD Han EV",
    brand: "BYD",
    category: "Sedã grande premium",
    price: 559800,
    powerCv: 517,
    torqueNm: 700,
    batteryKwh: 76.9,
    batteryChem: "LFP (Blade)",
    motorType: "Bimotor AWD (um motor em cada eixo)",
    rangeKm: 480,
    accel: 3.9,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 16.0,
    techNotes:
      "Preço real de tabela é R$559.800 — bem acima dos R$429.800 que circulavam antes. Autonomia fica entre 450-500km em ciclo combinado/WLTP (usamos a média, 480km); recarga rápida de 30% a 80% em ~25min.",
    personas: { urbano: 1, familia: 4, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "byd-song-plus-phev",
    name: "BYD Song Plus PHEV",
    brand: "BYD",
    category: "SUV híbrido",
    price: 250000,
    powerCv: 235,
    torqueNm: null,
    batteryKwh: 18.3,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado (1.5 aspirado + elétrico) — versão FWD",
    rangeKm: 1200,
    accel: 7.9,
    groundClearance: null,
    trunkL: 552,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Autonomia elétrica pura homologada de 68km (Inmetro). Existe também a versão Premium AWD (1.5 turbo + dois motores elétricos, 324cv, R$299.800, autonomia elétrica de 87km). Preço da versão FWD subiu de ~R$240 mil para ~R$250 mil entre gerações — bem acima dos R$219.800 que circulavam antes.",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "byd-king-phev",
    name: "BYD King PHEV",
    brand: "BYD",
    category: "Sedã compacto híbrido",
    price: 175990,
    powerCv: 235,
    torqueNm: null,
    batteryKwh: 6.6,
    batteryChem: "LFP",
    motorType: "PHEV combinado (1.5 + elétrico) — versão GS",
    rangeKm: 1175,
    accel: null,
    groundClearance: null,
    trunkL: 450,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço real de tabela é R$175.990 (versão GS) — bem abaixo dos R$279.800 que circulavam antes; a versão de entrada GL custa R$147.990 com 209cv e só 32km de autonomia elétrica. Bateria pequena (6,6kWh) é perfil híbrido leve, não plugável de longa autonomia elétrica: até 78km NEDC na GS. Consumo no modo combustão: até 16,8 km/l na cidade.",
    personas: { urbano: 4, familia: 3, aventura: 1, performance: 3, custo: 3 },
  },
  {
    id: "byd-shark-phev",
    name: "BYD Shark PHEV",
    brand: "BYD",
    category: "Picape híbrida",
    price: 379800,
    powerCv: 437,
    torqueNm: null,
    batteryKwh: 29.8,
    batteryChem: null,
    motorType: "PHEV combinado AWD (1.5 turbo 183cv + elétrico dianteiro 231cv + elétrico traseiro 204cv)",
    rangeKm: 840,
    accel: 5.7,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "8 anos bateria + 5 anos cobertura total do veículo",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Autonomia elétrica pura de 57km (PBEV/Inmetro) ou até 100km (NEDC). Caçamba com 1.200 litros de capacidade. Tração integral (AWD), com motor a combustão 1.5 turbo (183cv/260Nm) somado a dois motores elétricos (231cv dianteiro + 204cv traseiro).",
    personas: { urbano: 1, familia: 3, aventura: 5, performance: 5, custo: 1 },
  },
  {
    id: "mg-mg4",
    name: "MG4 Comfort",
    brand: "MG",
    category: "Hatch médio",
    price: 169990,
    powerCv: 204,
    torqueNm: 350,
    batteryKwh: 51,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 300,
    accel: null,
    groundClearance: null,
    trunkL: 363,
    weightKg: null,
    wallbox: "Incluso, sem custo",
    acKw: null,
    dcKw: 135,
    airbags: 6,
    warranty: "7 anos veículo, motor e bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.0,
    techNotes:
      "Versão de entrada da linha MG4 (distinta da 'MG4 Urban Luxury 54 kWh' já cadastrada separadamente). Existem também Luxury (R$189.800-199.000, bateria 64kWh, ~364km WLTP) e XPower (R$249.000, biMotor, até 435cv combinados). Autonomia CLTC chinesa (350km) é otimista; usamos aqui uma estimativa mais conservadora pro uso real.",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 4, custo: 3 },
  },
  {
    id: "mg-s5",
    name: "MG S5",
    brand: "MG",
    category: "SUV médio",
    price: 218800,
    powerCv: 205,
    torqueNm: 350,
    batteryKwh: 62,
    batteryChem: "LFP",
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 351,
    accel: 6.3,
    groundClearance: null,
    trunkL: 453,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "7 anos/150.000 km veículo, 8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.7,
    techNotes:
      "Duas versões: Comfort (R$195.800, reajustada pra R$218.800 a partir de 5/jan/2026 — ficha usada aqui) e Luxury (R$219.800, R$238.800 após 5/jan/2026).",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 4, custo: 3 },
  },
  {
    id: "mg-cyberster",
    name: "MG Cyberster",
    brand: "MG",
    category: "Roadster conversível premium",
    price: 499800,
    powerCv: 510,
    torqueNm: 725,
    batteryKwh: 77,
    batteryChem: null,
    motorType: "Bimotor AWD sob demanda",
    rangeKm: 342,
    accel: 3.2,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 150,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 22.5,
    techNotes:
      "Roadster esportivo com portas de abertura tipo tesoura. Recarga DC de 150kW leva de 10% a 80% em ~38min.",
    personas: { urbano: 2, familia: 1, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "gac-aion-es",
    name: "GAC Aion ES",
    brand: "GAC",
    category: "Sedã compacto",
    price: 169990,
    powerCv: 136,
    torqueNm: 225,
    batteryKwh: 55.2,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 314,
    accel: null,
    groundClearance: null,
    trunkL: 453,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 75,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.6,
    techNotes: "Recarga DC de 75kW leva a bateria de 30% a 80% em ~37min.",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 2, custo: 4 },
  },
  {
    id: "gac-aion-y",
    name: "GAC Aion Y Premium",
    brand: "GAC",
    category: "SUV compacto",
    price: 175990,
    powerCv: 204,
    torqueNm: 225,
    batteryKwh: 63.2,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 316,
    accel: 8.5,
    groundClearance: null,
    trunkL: 361,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.0,
    techNotes: "Também comercializado como minivan/SUV familiar; existe versão Elite mais em conta.",
    personas: { urbano: 3, familia: 5, aventura: 2, performance: 3, custo: 3 },
  },
  {
    id: "gac-aion-v",
    name: "GAC Aion V Elite",
    brand: "GAC",
    category: "SUV médio",
    price: 219990,
    powerCv: 204,
    torqueNm: 240,
    batteryKwh: 75.4,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 389,
    accel: 8.0,
    groundClearance: null,
    trunkL: 427,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.4,
    techNotes: "Versão única (Elite) no Brasil.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 2 },
  },
  {
    id: "gac-hyptec-ht",
    name: "GAC Hyptec HT Elite",
    brand: "GAC",
    category: "SUV médio premium",
    price: 314990,
    powerCv: 340,
    torqueNm: 430,
    batteryKwh: 83,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD) — motorização da linha 2027 não totalmente detalhada em fonte confiável",
    rangeKm: 431,
    accel: 5.8,
    groundClearance: null,
    trunkL: 670,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "8 anos bateria (termo herdado da geração anterior, não confirmado se se mantém igual na versão 2027)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.3,
    techNotes:
      "SUV cupê elétrico da Hyptec, submarca premium da GAC. Linha 2027 lançada em 2026 com bateria ampliada (83kWh, arquitetura 800V) e mais potência (340cv/430Nm) que a geração anterior (245cv/72,7kWh). Duas versões: Elite (R$314.990 — ficha usada aqui) e Ultra (R$369.990, com portas traseiras de abertura vertical). Recarga DC de 30-80% em ~15min. Consumo de 19,3 kWh/100km calculado a partir de bateria/autonomia oficiais.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "leapmotor-b10",
    name: "Leapmotor B10",
    brand: "Leapmotor",
    category: "SUV compacto",
    price: 182990,
    powerCv: 218,
    torqueNm: 240,
    batteryKwh: 56.2,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 288,
    accel: 8.0,
    groundClearance: null,
    trunkL: 430,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.5,
    techNotes:
      "Autonomia WLTP divulgada é 361km, mas a homologação Inmetro/PBEV real é 288km. Preço de tabela varia por público: R$182.990 padrão, com descontos pra troca de usado (R$175.990), taxista (R$141.190), PCD (R$161.390) e CNPJ (R$168.290). Será fabricado no Brasil em fábrica da Stellantis. Recarga rápida recupera 50% em ~15min.",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 4, custo: 3 },
  },
  {
    id: "leapmotor-c10",
    name: "Leapmotor C10",
    brand: "Leapmotor",
    category: "SUV médio",
    price: 204990,
    powerCv: 218,
    torqueNm: 320,
    batteryKwh: 69.9,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 338,
    accel: 8.3,
    groundClearance: null,
    trunkL: 465,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.7,
    techNotes:
      "Existe também a versão REEV (com extensor de autonomia a combustão, R$219.990, ~145km WLTP no elétrico + tanque de 50L, autonomia combinada até 950-1.150km).",
    personas: { urbano: 3, familia: 5, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "geely-ex5",
    name: "Geely EX5 Pro",
    brand: "Geely",
    category: "SUV médio",
    price: 205800,
    powerCv: 218,
    torqueNm: 320,
    batteryKwh: 60.2,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 413,
    accel: 6.9,
    groundClearance: null,
    trunkL: 461,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 14.6,
    techNotes:
      "Versão Pro (R$205.800) tem autonomia de 413km; a Max (R$225.800) cai pra 349km com mais equipamentos. Existe também a versão híbrida plug-in EX5 EM-i, cadastrada separadamente (id geely-ex5-em-i) por ser outro powertrain (fuelType PHEV em vez de BEV).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 3 },
  },
  {
    id: "geely-ex5-em-i",
    name: "Geely EX5 EM-i Pro",
    brand: "Geely",
    category: "SUV híbrido",
    price: 189990,
    powerCv: 262,
    torqueNm: 380,
    batteryKwh: 18.4,
    batteryChem: null,
    motorType: "PHEV combinado 'Super Híbrido' (1.5 aspirado + elétrico)",
    rangeKm: 1300,
    accel: 7.8,
    groundClearance: null,
    trunkL: 428,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Primeiro veículo da Geely com produção nacional (Complexo Industrial Ayrton Senna, São José dos Pinhais/PR), ainda em 2026. Três versões: Pro (R$189.990, bateria 18,4kWh, ~65km elétricos — ficha usada aqui), Max (R$209.990, mesma bateria) e Ultra (R$234.990, bateria maior de 29,8kWh, ~112km elétricos Inmetro, com carregamento DC de até 60kW — as versões Pro/Max não têm DC confirmado). Autonomia combinada de até 1.300km. Porta-malas de 428L (até 2.000L com bancos rebatidos).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "omoda-e5",
    name: "Omoda E5",
    brand: "Omoda",
    category: "SUV compacto",
    price: 209990,
    powerCv: 204,
    torqueNm: 340,
    batteryKwh: 61.1,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 345,
    accel: 7.6,
    groundClearance: null,
    trunkL: 360,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 80,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.7,
    techNotes: "Derivado do modelo híbrido Omoda 5. Recarga DC de 80kW leva de 30% a 80% em ~30min.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 3, custo: 3 },
  },
  {
    id: "zeekr-x",
    name: "Zeekr X Flagship",
    brand: "Zeekr",
    category: "SUV compacto",
    price: 338000,
    powerCv: 428,
    torqueNm: 532,
    batteryKwh: 66,
    batteryChem: null,
    motorType: "Bimotor AWD (um em cada eixo) — versão Flagship",
    rangeKm: 332,
    accel: 3.8,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 150,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.9,
    techNotes:
      "O preço de R$189.990 que circulava antes está bem abaixo de qualquer versão real vendida no Brasil. Ficha usada aqui é a Flagship, biMotor AWD (R$338 mil). Existem versões de entrada mais baratas — Privilege (~R$309 mil) e Premium (~R$298 mil) — com potência e bateria menores, ainda não detalhadas em fonte confiável. Recarga DC de 150kW leva de 10% a 80% em ~20min; carga AC completa em ~3h.",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "neta-x-400",
    name: "Neta X 400",
    brand: "Neta",
    category: "SUV compacto",
    price: 194900,
    powerCv: 163,
    torqueNm: null,
    batteryKwh: 52.5,
    batteryChem: null,
    motorType: null,
    rangeKm: 258,
    accel: null,
    groundClearance: null,
    trunkL: null,
    weightKg: 1670,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.3,
    techNotes:
      "Baterias fabricadas pela CATL. Carregamento AC completo em ~9h; DC de 30% a 80% em ~30min. Versão de entrada da linha Neta X.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 2, custo: 3 },
  },
  {
    id: "neta-x-500",
    name: "Neta X 500",
    brand: "Neta",
    category: "SUV compacto",
    price: 204900,
    powerCv: 163,
    torqueNm: null,
    batteryKwh: 64.1,
    batteryChem: null,
    motorType: null,
    rangeKm: 317,
    accel: null,
    groundClearance: null,
    trunkL: null,
    weightKg: 1740,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.2,
    techNotes:
      "Baterias fabricadas pela CATL. Carregamento AC completo em ~11h; DC de 30% a 80% em ~30min. Existe também a versão 500 Luxury, com peso e bateria equivalentes.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 2, custo: 3 },
  },
];

const SEED_CARS = [...SEED_CARS_DETAILED, ...BULK_CARS];

const money = (v) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const maintCostPer10k = (car) =>
  car.maintenanceTotalCost && car.maintenanceKmBase
    ? Math.round((car.maintenanceTotalCost / car.maintenanceKmBase) * 10000)
    : null;

const videoLinkFor = (car) =>
  car.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(car.name + " review teste elétrico 2026")}`;

// Referência (NÃO é confirmação de elegibilidade): teto de preço pra isenção de
// ICMS de PCD varia por estado, mas historicamente fica entre ~R$120 mil e
// ~R$200 mil. Usamos essa faixa só pra dar um sinal aproximado no card — o
// usuário precisa confirmar as regras do próprio estado antes de decidir.
const PCD_ICMS_LIKELY_MAX = 120000;
const PCD_ICMS_MAYBE_MAX = 200000;
function pcdPriceHint(price) {
  if (price == null) return null;
  if (price <= PCD_ICMS_LIKELY_MAX) return "provavel";
  if (price <= PCD_ICMS_MAYBE_MAX) return "possivel";
  return null; // acima da faixa usual — não exibimos selo pra não sugerir isenção improvável
}

const wallboxStatus = (wallbox) => {
  if (!wallbox) return null;
  const w = wallbox.toLowerCase();
  if (w.includes("incluso") || w.includes("sem custo") || w.includes("oficial")) return "yes";
  if (w.includes("depende") || w.includes("campanha")) return "maybe";
  return "no";
};

// ---------------------------------------------------------------------------
// STORAGE HELPERS
// ---------------------------------------------------------------------------
const CARS_KEY = "ev-comparador:cars:v8";
const THEME_KEY = "ev-comparador:theme:v1";
const MYCAR_KEY = "ev-comparador:mycar:v1";
const TUTORIAL_KEY = "ev-comparador:tutorial-seen:v2";

const TUTORIAL_STEPS = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao Escolha seu EV",
    text: "Um jeito rápido de comparar carros elétricos e híbridos plug-in vendidos oficialmente no Brasil. Vamos te mostrar, destacando cada parte da tela, como usar.",
    refKey: null,
  },
  {
    icon: Zap,
    title: "Filtro por público",
    text: "Toque em Urbano, Família, Aventura, Performance ou Custo-Benefício — os carros reordenam mostrando primeiro os que mais combinam com esse perfil.",
    refKey: "personaRow",
  },
  {
    icon: Mountain,
    title: "Categoria e faixa de preço",
    text: "Use o filtro de categoria (hatch, SUV etc.) e o controle de preço pra restringir a busca. Comparar carros da mesma categoria deixa a análise mais justa.",
    refKey: "filterRow",
  },
  {
    icon: Plug,
    title: "Selos rápidos",
    text: "Cada card mostra selos de wallbox incluso, melhor público, PHEV e se o preço já foi checado — sem precisar abrir os detalhes.",
    refKey: "badgeRow",
  },
  {
    icon: Check,
    title: "Comparar lado a lado",
    text: "Marque até 4 carros que você está em dúvida tocando aqui. Uma barra aparece embaixo da tela — toque nela pra ver tudo lado a lado.",
    refKey: "compareBtn",
  },
  {
    icon: Fuel,
    title: "Seu carro atual",
    text: "Cadastre o carro que você tem hoje aqui. Cada elétrico passa a mostrar vantagens e desvantagens reais em relação a ele, incluindo economia mensal estimada.",
    refKey: "myCarBtn",
  },
];

export default function App() {
  const [cars, setCars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [theme, setTheme] = useState("light");
  const T = theme === "dark" ? DARK_T : LIGHT_T;

  const [myCar, setMyCar] = useState(null);
  const [showMyCarForm, setShowMyCarForm] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const tourRefs = {
    personaRow: useRef(null),
    filterRow: useRef(null),
    badgeRow: useRef(null),
    compareBtn: useRef(null),
    myCarBtn: useRef(null),
  };

  const [activePersona, setActivePersona] = useState(null);
  const [fuelFilter, setFuelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [maxPrice, setMaxPrice] = useState(550000);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  // ---- load ----
  useEffect(() => {
    (async () => {
      try {
        let loadedCars = SEED_CARS;
        try {
          const res = await window.storage.get(CARS_KEY, true);
          if (res && res.value) loadedCars = JSON.parse(res.value);
        } catch {
          await window.storage.set(CARS_KEY, JSON.stringify(SEED_CARS), true);
        }
        // personal preferences — not shared with other visitors
        try {
          const tRes = await window.storage.get(THEME_KEY, false);
          if (tRes && tRes.value) setTheme(tRes.value);
        } catch { /* no theme saved yet, keep default */ }
        try {
          const mRes = await window.storage.get(MYCAR_KEY, false);
          if (mRes && mRes.value) setMyCar(JSON.parse(mRes.value));
        } catch { /* no personal car saved yet */ }

        try {
          const tutRes = await window.storage.get(TUTORIAL_KEY, false);
          if (!tutRes || !tutRes.value) setShowTutorial(true); // first visit
        } catch {
          setShowTutorial(true); // couldn't check, assume first visit
        }

        setCars(loadedCars);
      } catch (e) {
        setError("Não foi possível carregar os dados. Tente recarregar.");
        setCars(SEED_CARS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleTheme = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { await window.storage.set(THEME_KEY, next, false); } catch { /* non-blocking */ }
  };

  const saveMyCar = async (data) => {
    setMyCar(data);
    setShowMyCarForm(false);
    try { await window.storage.set(MYCAR_KEY, JSON.stringify(data), false); } catch { /* non-blocking */ }
  };

  const closeTutorial = async () => {
    setShowTutorial(false);
    setTutorialStep(0);
    try { await window.storage.set(TUTORIAL_KEY, "true", false); } catch { /* non-blocking */ }
  };

  // ---- persona sort / filter / search ----
  const categories = useMemo(() => {
    if (!cars) return [];
    return [...new Set(cars.map((c) => c.category))].sort();
  }, [cars]);

  const sortedCars = useMemo(() => {
    if (!cars) return [];
    let list = cars.filter((c) => {
      if (fuelFilter !== "all" && c.fuelType !== fuelFilter) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (c.price != null && c.price > maxPrice) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !(c.brand || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
    if (activePersona) list = [...list].sort((a, b) => (b.personas?.[activePersona] || 0) - (a.personas?.[activePersona] || 0));
    return list;
  }, [cars, activePersona, fuelFilter, categoryFilter, maxPrice, search]);

  // ---- comparison vs the user's current combustion car ----
  const vsMyCar = (car) => {
    if (!myCar) return null;
    const out = {};
    if (myCar.groundClearance != null && car.groundClearance != null) {
      out.groundClearance = car.groundClearance - myCar.groundClearance;
    }
    if (myCar.trunkL != null && car.trunkL != null) {
      out.trunkL = car.trunkL - myCar.trunkL;
    }
    if (myCar.powerCv != null && car.powerCv != null) {
      out.powerCv = car.powerCv - myCar.powerCv;
    }
    let totalSavings = 0;
    let hasSavings = false;
    if (myCar.kmPerLiter && myCar.fuelPrice && myCar.kmPerMonth && car.consumptionKwh100) {
      const fuelMonthly = (myCar.kmPerMonth / myCar.kmPerLiter) * myCar.fuelPrice;
      const energyMonthly = (myCar.kmPerMonth / 100) * car.consumptionKwh100 * (myCar.energyPrice || 0.9);
      out.fuelMonthly = fuelMonthly;
      out.energyMonthly = energyMonthly;
      out.fuelSavings = fuelMonthly - energyMonthly;
      totalSavings += out.fuelSavings;
      hasSavings = true;
    }
    // maintenance: só dá pra comparar quando o EV tem custo de manutenção conhecido
    const evMaintPer10k = maintCostPer10k(car);
    if (myCar.maintenanceAnnual && myCar.kmPerMonth && evMaintPer10k != null) {
      out.myMaintMonthly = myCar.maintenanceAnnual / 12;
      out.evMaintMonthly = (myCar.kmPerMonth / 10000) * evMaintPer10k;
      out.maintSavings = out.myMaintMonthly - out.evMaintMonthly;
      totalSavings += out.maintSavings;
      hasSavings = true;
    } else if (myCar.maintenanceAnnual && myCar.kmPerMonth) {
      out.maintUnavailable = true; // pediu a conta, mas este EV não tem dado de manutenção pra comparar
    }
    if (hasSavings) out.monthlySavings = totalSavings;
    return out;
  };

  const bestPersonaFor = (car) => {
    if (!car.personas) return null;
    let best = null;
    Object.entries(car.personas).forEach(([k, v]) => {
      if (!best || v > best.v) best = { k, v };
    });
    return PERSONAS.find((p) => p.key === best?.k);
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div style={{ background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ color: T.accent, fontFamily: "'IBM Plex Mono', monospace" }}>carregando…</div>
      </div>
    );
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink, fontFamily: "'Inter', sans-serif" }}>
      <style>{FONT_IMPORT}{RESPONSIVE_CSS}</style>

      {/* ---------- HEADER ---------- */}
      <header style={{ borderBottom: `1px solid ${T.line}`, padding: "20px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", rowGap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: T.panel, border: `1px solid ${T.line}`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Zap size={18} color={T.accent} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>
                Escolha seu EV
              </div>
              <div className="ev-header-subtitle" style={{ fontSize: 11, color: T.inkDim }}>
                Compare elétricos e híbridos plug-in oficiais no Brasil — pra você decidir com confiança
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
              title="Como usar"
              style={{
                width: 38, height: 38, borderRadius: 8, background: T.panel, border: `1px solid ${T.line}`,
                color: T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                flexShrink: 0
              }}
            >
              <HelpCircle size={15} />
            </button>

            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              style={{
                width: 38, height: 38, borderRadius: 8, background: T.panel, border: `1px solid ${T.line}`,
                color: T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                flexShrink: 0
              }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              ref={tourRefs.myCarBtn}
              onClick={() => setShowMyCarForm(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0,
                background: myCar ? T.panelAlt : T.accent2,
                color: myCar ? T.inkDim : T.bg,
                border: `1px solid ${myCar ? T.line : T.accent2}`,
                borderRadius: 8, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer"
              }}
            >
              <Fuel size={14} /> {myCar ? myCar.name || "Meu carro" : "Cadastrar meu carro"}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 100px" }}>
        {error && (
          <div style={{ background: "rgba(232,121,74,0.12)", border: `1px solid ${T.warn}`, color: T.warn, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* ---------- SEARCH / FUEL / PRICE FILTERS ---------- */}
        <div ref={tourRefs.filterRow} style={{ marginBottom: 20 }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por modelo ou marca…"
            style={{
              width: "100%", background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8,
              padding: "10px 12px", color: T.ink, fontSize: 14, boxSizing: "border-box", marginBottom: 10
            }}
          />

          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
            {[{ key: "all", label: "Todos" }, ...FUEL_TYPES].map((f) => {
              const active = fuelFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFuelFilter(f.key)}
                  style={{
                    padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    background: active ? T.accent2 : T.panel, color: active ? T.bg : T.inkDim,
                    border: `1px solid ${active ? T.accent2 : T.line}`
                  }}
                >
                  {f.label}
                </button>
              );
            })}

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "7px 10px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                background: categoryFilter !== "all" ? T.accent2 : T.panel,
                color: categoryFilter !== "all" ? T.bg : T.inkDim,
                border: `1px solid ${categoryFilter !== "all" ? T.accent2 : T.line}`
              }}
            >
              <option value="all">Todas categorias</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ fontSize: 11, color: T.inkDim, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
            Dica: comparar carros da <strong style={{ color: T.ink }}>mesma categoria</strong> (ex.: só hatches, ou só SUVs) deixa a comparação mais justa. Use o filtro de categoria acima.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: T.inkDim, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
              até {money(maxPrice)}
            </span>
            <input
              type="range" min={100000} max={550000} step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* ---------- PERSONA FILTER ---------- */}
        <div ref={tourRefs.personaRow} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: T.inkDim, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" }}>
            Qual carro para qual público?
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              const active = activePersona === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setActivePersona(active ? null : p.key)}
                  title={p.hint}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999,
                    background: active ? T.accent : T.panel, color: active ? T.bg : T.ink,
                    border: `1px solid ${active ? T.accent : T.line}`, fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  <Icon size={14} /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- MY CAR CTA (só aparece antes de cadastrar) ---------- */}
        {!myCar && (
          <div style={{
            marginBottom: 20, padding: 14, borderRadius: 12, background: "rgba(242,180,65,0.08)",
            border: `1px dashed ${T.accent2}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "rgba(242,180,65,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Fuel size={17} color={T.accent2} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.ink, marginBottom: 2 }}>
                Quanto você economizaria trocando pra um elétrico?
              </div>
              <div style={{ fontSize: 12, color: T.inkDim, lineHeight: 1.4 }}>
                Cadastre seu carro atual — leva menos de 1 minuto e não precisa saber todos os dados — pra ver a economia mensal estimada em cada card abaixo.
              </div>
            </div>
            <button
              onClick={() => setShowMyCarForm(true)}
              style={{
                flexShrink: 0, background: T.accent2, color: T.bg, border: "none", borderRadius: 8,
                padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}
            >
              Cadastrar meu carro
            </button>
          </div>
        )}

        {/* ---------- CAR GRID ---------- */}
        <div style={{ fontSize: 11, color: T.inkDim, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 }}>
          {cars.length} modelos no total · {sortedCars.length} exibidos com os filtros atuais
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {sortedCars.map((car, carIdx) => {
            const isOpen = expanded === car.id;
            const best = bestPersonaFor(car);
            const inCompare = compareIds.includes(car.id);
            const radarData = PERSONAS.map((p) => ({ label: p.label, value: car.personas?.[p.key] || 0 }));

            return (
              <div key={car.id} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{car.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: T.inkDim }}>{car.category}</span>
                        {car.fuelType === "PHEV" && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.accent2, border: `1px solid ${T.accent2}`, borderRadius: 5, padding: "1px 5px" }}>PHEV</span>
                        )}
                        {car.verified === false && !car.priceVerifiedDate && (
                          <span style={{ fontSize: 10, fontWeight: 600, color: T.inkDim, border: `1px solid ${T.line}`, borderRadius: 5, padding: "1px 5px" }}>não verificado</span>
                        )}
                        {car.verified === false && car.priceVerifiedDate && (
                          <span title={`Preço checado em ${car.priceVerifiedDate}`} style={{ fontSize: 10, fontWeight: 600, color: T.accent, border: `1px solid ${T.accent}`, borderRadius: 5, padding: "1px 5px" }}>
                            preço checado {car.priceVerifiedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: T.accent2, marginTop: 10 }}>
                    {money(car.price)}
                  </div>

                  <div ref={carIdx === 0 ? tourRefs.badgeRow : null} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {best && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px",
                        borderRadius: 999, background: "rgba(61,214,199,0.12)", border: `1px solid ${T.accent}`,
                        fontSize: 11, fontWeight: 600, color: T.accent
                      }}>
                        <best.icon size={12} /> Melhor para: {best.label}
                      </div>
                    )}
                    {(() => {
                      const ws = wallboxStatus(car.wallbox);
                      if (!ws) return null;
                      const cfg = {
                        yes: { color: T.good, bg: "rgba(95,211,123,0.12)", label: "Wallbox incluso" },
                        maybe: { color: T.accent2, bg: "rgba(242,180,65,0.12)", label: "Wallbox: depende" },
                        no: { color: T.inkDim, bg: "transparent", label: "Sem wallbox" },
                      }[ws];
                      return (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px",
                          borderRadius: 999, background: cfg.bg, border: `1px solid ${cfg.color}`,
                          fontSize: 11, fontWeight: 600, color: cfg.color
                        }}>
                          <Plug size={12} /> {cfg.label}
                        </div>
                      );
                    })()}
                    {(() => {
                      const hint = pcdPriceHint(car.price);
                      if (!hint) return null;
                      const label = hint === "provavel" ? "Preço dentro do teto usual de isenção PCD" : "Preço pode entrar no teto de isenção PCD";
                      return (
                        <div
                          title="Referência aproximada — o teto de isenção de ICMS pra PCD varia por estado. Confirme na Sefaz do seu estado e na concessionária."
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px",
                            borderRadius: 999, background: "rgba(61,214,199,0.08)", border: `1px dashed ${T.accent}`,
                            fontSize: 11, fontWeight: 600, color: T.accent
                          }}
                        >
                          <Accessibility size={12} /> {label}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 14 }}>
                    <MiniStat label="Potência" value={car.powerCv ? `${car.powerCv} cv` : "—"} T={T} />
                    <MiniStat label="Autonomia" value={car.rangeKm ? `${car.rangeKm} km` : "—"} T={T} />
                    <MiniStat label="Vão livre" value={car.groundClearance ? `${car.groundClearance} mm` : "—"} T={T} />
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button
                      onClick={() => setExpanded(isOpen ? null : car.id)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        background: "transparent", border: `1px solid ${T.line}`, color: T.ink, borderRadius: 8,
                        padding: "9px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Detalhes
                    </button>
                    <button
                      ref={carIdx === 0 ? tourRefs.compareBtn : null}
                      onClick={() => toggleCompare(car.id)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        background: inCompare ? T.accent : "transparent", color: inCompare ? T.bg : T.ink,
                        border: `1px solid ${inCompare ? T.accent : T.line}`, borderRadius: 8,
                        padding: "9px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      {inCompare ? <Check size={14} /> : <Plus size={14} />} Comparar
                    </button>
                    <a
                      href={videoLinkFor(car)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={car.videoUrl ? "Assistir review em vídeo" : "Buscar vídeos no YouTube"}
                      style={{
                        width: 40, display: "flex", alignItems: "center", justifyContent: "center",
                        background: "transparent", border: `1px solid ${T.line}`, borderRadius: 8,
                        color: T.warn, cursor: "pointer", textDecoration: "none", flexShrink: 0
                      }}
                    >
                      <Play size={15} fill={T.warn} />
                    </a>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${T.line}`, padding: 16, background: T.panelAlt }}>
                    <div style={{ height: 190, marginBottom: 12 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="70%">
                          <PolarGrid stroke={T.line} />
                          <PolarAngleAxis dataKey="label" tick={{ fill: T.inkDim, fontSize: 10 }} />
                          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                          <Radar dataKey="value" stroke={T.radar} fill={T.radar} fillOpacity={0.35} />
                          <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {car.techNotes ? (
                      <div style={{ fontSize: 12.5, color: T.inkDim, lineHeight: 1.5, marginBottom: 14 }}>
                        <span style={{ color: T.accent, fontWeight: 600 }}>Motor & bateria — </span>
                        {car.techNotes}
                        {car.priceVerifiedDate && (
                          <div style={{ fontSize: 10.5, color: T.inkDim, marginTop: 6 }}>Ficha completa verificada em {car.priceVerifiedDate}.</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: T.accent2, lineHeight: 1.5, marginBottom: 14, background: "rgba(242,180,65,0.1)", border: `1px solid ${T.accent2}`, borderRadius: 8, padding: 10 }}>
                        {car.priceVerifiedDate ? (
                          <>Preço checado em {car.priceVerifiedDate} contra fonte oficial/imprensa recente. As demais specs técnicas (vão livre, porta-malas, garantia etc.) ainda vêm de fonte agregada e não foram verificadas individualmente.</>
                        ) : (
                          <>Dados desse modelo vêm de fonte agregada de mercado (preço, autonomia, potência) e ainda não foram verificados individualmente — specs técnicas detalhadas faltando. Confirme na concessionária antes de decidir, ou complete no modo edição.</>
                        )}
                      </div>
                    )}

                    {BRAND_GROUPS[car.brand] && (
                      <div style={{ fontSize: 11.5, color: T.inkDim, marginBottom: 10, padding: "8px 10px", background: T.panelAlt, borderRadius: 8, border: `1px solid ${T.line}` }}>
                        <strong style={{ color: T.ink }}>{car.brand}</strong> — {BRAND_GROUPS[car.brand]}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                      <Spec label="Motor" value={car.motorType} T={T} />
                      <Spec label="Bateria" value={car.batteryKwh ? `${car.batteryKwh} kWh · ${car.batteryChem || ""}` : null} T={T} />
                      <Spec label="Torque" value={car.torqueNm ? `${car.torqueNm} Nm` : null} T={T} />
                      <Spec label="0–100 km/h" value={car.accel ? `${car.accel}s` : null} T={T} />
                      <Spec label="Consumo" value={car.consumptionKwh100 ? `${car.consumptionKwh100} kWh/100km` : null} T={T} />
                      <Spec label="Porta-malas" value={car.trunkL ? `${car.trunkL} L` : null} T={T} />
                      <Spec label="Peso" value={car.weightKg ? `${car.weightKg} kg` : null} T={T} />
                      <Spec label="AC / DC" value={car.acKw || car.dcKw ? `${car.acKw ?? "—"} kW / ${car.dcKw ?? "—"} kW` : null} T={T} />
                      <Spec label="Airbags" value={car.airbags} T={T} />
                      <Spec label="Wallbox" value={car.wallbox} T={T} />
                      <Spec label="Garantia" value={car.warranty} T={T} />
                      <Spec label="Intervalo revisão" value={car.maintenanceInterval} T={T} />
                      <Spec label="1ª revisão" value={car.maintenanceFirstCost} T={T} />
                      <Spec
                        label="Manutenção /10k km"
                        value={maintCostPer10k(car) ? money(maintCostPer10k(car)) : null}
                        T={T}
                      />
                    </div>

                    {/* ---- video ---- */}
                    <a
                      href={videoLinkFor(car)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: 10, borderRadius: 8,
                        background: T.panelAlt, border: `1px solid ${T.line}`, textDecoration: "none", color: T.ink
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 999, background: T.warn, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Play size={12} color="#fff" fill="#fff" />
                      </div>
                      <div style={{ fontSize: 12.5 }}>
                        {car.videoUrl
                          ? "Assistir review em vídeo deste modelo"
                          : `Buscar vídeos sobre o ${car.name} no YouTube`}
                      </div>
                    </a>

                    {/* ---- vs. meu carro atual ---- */}
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line}` }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: T.inkDim, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                        <Fuel size={12} /> Vs. seu carro atual
                      </div>
                      {!myCar ? (
                        <button
                          onClick={() => setShowMyCarForm(true)}
                          style={{ fontSize: 12.5, color: T.accent, background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", width: "100%", textAlign: "left" }}
                        >
                          Defina seu carro atual pra ver vantagens e desvantagens deste modelo →
                        </button>
                      ) : (
                        (() => {
                          const d = vsMyCar(car);
                          if (!d) return <div style={{ fontSize: 12, color: T.inkDim }}>Sem dados suficientes do seu carro pra comparar.</div>;
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {d.groundClearance != null && (
                                <DeltaRow label="Vão livre" delta={d.groundClearance} unit="mm" T={T} />
                              )}
                              {d.trunkL != null && (
                                <DeltaRow label="Porta-malas" delta={d.trunkL} unit="L" T={T} />
                              )}
                              {d.powerCv != null && (
                                <DeltaRow label="Potência" delta={d.powerCv} unit="cv" T={T} />
                              )}
                              {d.monthlySavings != null && (
                                <div style={{
                                  marginTop: 6, padding: 10, borderRadius: 8,
                                  background: d.monthlySavings >= 0 ? "rgba(95,211,123,0.1)" : "rgba(232,121,74,0.1)",
                                  border: `1px solid ${d.monthlySavings >= 0 ? T.good : T.warn}`
                                }}>
                                  {d.fuelMonthly != null && (
                                    <div style={{ fontSize: 11, color: T.inkDim }}>
                                      Combustível ({myCar.name || "seu carro"}): {money(d.fuelMonthly)}/mês · Energia (este EV): {money(d.energyMonthly)}/mês
                                    </div>
                                  )}
                                  {d.myMaintMonthly != null && (
                                    <div style={{ fontSize: 11, color: T.inkDim, marginTop: d.fuelMonthly != null ? 2 : 0 }}>
                                      Manutenção ({myCar.name || "seu carro"}): {money(d.myMaintMonthly)}/mês · Manutenção (este EV): {money(d.evMaintMonthly)}/mês
                                    </div>
                                  )}
                                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: d.monthlySavings >= 0 ? T.good : T.warn, marginTop: 3 }}>
                                    {d.monthlySavings >= 0 ? "Economiza " : "Gasta mais "}
                                    {money(Math.abs(d.monthlySavings))}/mês
                                    {d.myMaintMonthly == null && <span style={{ fontWeight: 400, fontSize: 10.5, color: T.inkDim }}> (só combustível/energia)</span>}
                                  </div>
                                  {d.maintUnavailable && (
                                    <div style={{ fontSize: 10.5, color: T.inkDim, marginTop: 4 }}>
                                      Este modelo ainda não tem dado de custo de manutenção cadastrado, então a economia acima considera só combustível/energia.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ---------- MY CAR NOTE (só quando já cadastrado — antes disso o CTA acima já cobre) ---------- */}
        {myCar && (
          <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: T.panel, border: `1px solid ${T.line}`, fontSize: 12.5, color: T.inkDim }}>
            <Car size={13} style={{ verticalAlign: -2, marginRight: 6 }} color={T.accent2} />
            Seu carro atual: <strong style={{ color: T.ink }}>{myCar.name || "sem nome"}</strong>
            {myCar.groundClearance != null && ` — vão livre ${myCar.groundClearance}mm`}
            {myCar.trunkL != null && `, porta-malas ${myCar.trunkL}L`}.{" "}
            <button onClick={() => setShowMyCarForm(true)} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 12.5, textDecoration: "underline", padding: 0 }}>
              editar
            </button>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 11, color: T.inkDim, lineHeight: 1.5 }}>
          Critério de inclusão: só carros eletrificados (100% elétricos ou híbridos plug-in) com venda oficial confirmada por montadora/distribuidor no Brasil (rede de concessionárias própria). Marcas só disponíveis por importação independente (ex.: Tesla) não entram na lista.
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: T.panel, border: `1px solid ${T.line}`, fontSize: 12, color: T.inkDim, lineHeight: 1.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: T.ink, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>
            <Accessibility size={14} color={T.accent} /> Incentivos PCD e compra via CNPJ
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: T.ink }}>Isso não é orientação tributária</strong> — são regras gerais do governo, não um benefício oferecido pela marca do carro. Confirme sempre com a concessionária, a Receita Federal e a Sefaz do seu estado antes de decidir.
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
            <Accessibility size={13} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: T.ink }}>PCD (pessoa com deficiência):</strong> por lei federal costuma haver isenção de IPI, e muitos estados também isentam ou reduzem o ICMS — mas cada estado define seu próprio teto de preço e regras (geralmente entre R$ 120 mil e R$ 200 mil, variando e mudando com frequência). Exige laudo médico e processo prévio na Receita Federal (IPI) e na Sefaz do seu estado (ICMS). O selo "teto de isenção PCD" nos cards acima é só uma referência aproximada com base nessa faixa — não confirma elegibilidade.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Briefcase size={13} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <strong style={{ color: T.ink }}>CNPJ / frota:</strong> não existe desconto automático só por comprar em nome de empresa. Os benefícios reais são pontuais: locadoras e táxis têm regime especial de redução de IPI; empresas no Lucro Real podem aproveitar crédito de PIS/COFINS/ICMS sobre o veículo como ativo; e vários estados dão desconto ou isenção de IPVA pra elétricos e híbridos plug-in — isso vale tanto pra pessoa física quanto jurídica, não é exclusivo de CNPJ.
            </div>
          </div>
        </div>
      </main>

      {/* ---------- COMPARE BAR ---------- */}
      {compareIds.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: T.panel, borderTop: `1px solid ${T.line}`,
          padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 40
        }}>
          <div style={{ fontSize: 13, color: T.inkDim }}>{compareIds.length} selecionado(s)</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setCompareIds([])} style={{ background: "transparent", border: `1px solid ${T.line}`, color: T.inkDim, borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer" }}>
              Limpar
            </button>
            <button onClick={() => setShowCompare(true)} style={{ background: T.accent, border: "none", color: T.bg, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Comparar
            </button>
          </div>
        </div>
      )}

      {/* ---------- COMPARE MODAL ---------- */}
      {showCompare && (
        <CompareModal
          cars={cars.filter((c) => compareIds.includes(c.id))}
          onClose={() => setShowCompare(false)}
          T={T}
        />
      )}

      {/* ---------- MY CAR FORM MODAL ---------- */}
      {showMyCarForm && (
        <MyCarFormModal
          myCar={myCar}
          onSave={saveMyCar}
          onClose={() => setShowMyCarForm(false)}
          T={T}
        />
      )}

      {/* ---------- TUTORIAL ---------- */}
      {showTutorial && (
        <TutorialModal
          step={tutorialStep}
          setStep={setTutorialStep}
          onClose={closeTutorial}
          tourRefs={tourRefs}
          T={T}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUBCOMPONENTS
// ---------------------------------------------------------------------------
function iconBtnStyle(T, color) {
  return {
    width: 36, height: 36, borderRadius: 8, background: T.panelAlt, border: `1px solid ${T.line}`,
    color: color || T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    flexShrink: 0
  };
}

function MiniStat({ label, value, T }) {
  return (
    <div style={{ background: T.bg, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: T.inkDim, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

function Spec({ label, value, T }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, padding: "5px 0" }}>
      <span style={{ color: T.inkDim }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{value ?? "—"}</span>
    </div>
  );
}

function DeltaRow({ label, delta, unit, T }) {
  const positive = delta >= 0;
  const color = positive ? T.good : T.warn;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
      <span style={{ color: T.inkDim }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color }}>
        {positive ? "+" : ""}{delta} {unit}
        <ArrowRight size={11} style={{ transform: positive ? "rotate(-45deg)" : "rotate(45deg)" }} />
      </span>
    </div>
  );
}

function CompareModal({ cars, onClose, T }) {
  const rows = [
    ["Preço", (c) => money(c.price)],
    ["Categoria", (c) => c.category],
    ["Grupo/Parceria", (c) => BRAND_GROUPS[c.brand] || "Independente / não mapeado"],
    ["Potência", (c) => `${c.powerCv} cv`],
    ["Torque", (c) => `${c.torqueNm} Nm`],
    ["0–100 km/h", (c) => `${c.accel}s`],
    ["Bateria", (c) => `${c.batteryKwh} kWh (${c.batteryChem})`],
    ["Motor", (c) => c.motorType],
    ["Autonomia", (c) => `${c.rangeKm} km`],
    ["AC / DC", (c) => `${c.acKw} kW / ${c.dcKw} kW`],
    ["Vão livre", (c) => `${c.groundClearance} mm`],
    ["Porta-malas", (c) => `${c.trunkL} L`],
    ["Peso", (c) => `${c.weightKg} kg`],
    ["Airbags", (c) => c.airbags],
    ["Wallbox", (c) => c.wallbox],
    ["Garantia", (c) => c.warranty],
    ["Intervalo revisão", (c) => c.maintenanceInterval],
    ["1ª revisão", (c) => c.maintenanceFirstCost],
    ["Manutenção /10k km", (c) => (maintCostPer10k(c) ? money(maintCostPer10k(c)) : null)],
  ];
  const distinctCategories = [...new Set(cars.map((c) => c.category))];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.panel, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "85vh", overflow: "auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Comparação</div>
          <button onClick={onClose} style={iconBtnStyle(T)}><X size={15} /></button>
        </div>
        {distinctCategories.length > 1 && (
          <div style={{
            fontSize: 12, color: T.accent2, background: "rgba(242,180,65,0.1)", border: `1px solid ${T.accent2}`,
            borderRadius: 8, padding: 10, marginBottom: 12
          }}>
            Você está comparando categorias diferentes ({distinctCategories.join(" vs ")}) — pra uma comparação mais justa, prefira carros da mesma categoria.
          </div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: cars.length * 150 }}>
            <thead>
              <tr>
                <th style={thStyle(T)}></th>
                {cars.map((c) => (
                  <th key={c.id} style={{ ...thStyle(T), fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get]) => (
                <tr key={label}>
                  <td style={{ ...tdStyle(T), color: T.inkDim, fontWeight: 600 }}>{label}</td>
                  {cars.map((c) => (
                    <td key={c.id} style={{ ...tdStyle(T), fontFamily: "'IBM Plex Mono', monospace" }}>{get(c) ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function thStyle(T) {
  return { textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${T.line}`, fontSize: 12, color: T.ink, whiteSpace: "nowrap" };
}
function tdStyle(T) {
  return { padding: "8px 10px", borderBottom: `1px solid ${T.line}`, fontSize: 12.5, whiteSpace: "nowrap" };
}

// Chutes de consumo pra quem não sabe o km/L exato do próprio carro —
// só um ponto de partida editável, não uma verdade absoluta.
const FUEL_KMPL_PRESETS = [
  { label: "Flex no álcool", value: 7.5 },
  { label: "Flex na gasolina", value: 11 },
  { label: "1.0/1.6 só gasolina", value: 13 },
  { label: "SUV/picape a diesel", value: 10 },
];

// Specs aproximadas dos carros a combustão mais vendidos no Brasil — não cobre
// tudo (não existe fonte pública gratuita com ficha técnica completa pra
// qualquer marca/modelo/versão), mas cobre a maioria da frota real. Valores
// são médias da faixa de versões de cada modelo, não de uma versão específica
// — por isso ficam marcados como aproximados e sempre editáveis depois.
const COMMON_CARS = [
  { label: "Fiat Mobi", groundClearance: 141, trunkL: 235, powerCv: 75, kmPerLiter: 13 },
  { label: "Fiat Argo", groundClearance: 152, trunkL: 300, powerCv: 85, kmPerLiter: 12.5 },
  { label: "Fiat Cronos", groundClearance: 152, trunkL: 525, powerCv: 85, kmPerLiter: 12.5 },
  { label: "Fiat Strada", groundClearance: 168, trunkL: null, powerCv: 100, kmPerLiter: 12 },
  { label: "Fiat Pulse", groundClearance: 169, trunkL: 370, powerCv: 130, kmPerLiter: 12 },
  { label: "Fiat Toro", groundClearance: 205, trunkL: null, powerCv: 173, kmPerLiter: 10.5 },
  { label: "Chevrolet Onix", groundClearance: 153, trunkL: 267, powerCv: 82, kmPerLiter: 13.5 },
  { label: "Chevrolet Onix Plus", groundClearance: 153, trunkL: 469, powerCv: 116, kmPerLiter: 13 },
  { label: "Chevrolet Tracker", groundClearance: 173, trunkL: 410, powerCv: 116, kmPerLiter: 12 },
  { label: "Volkswagen Polo", groundClearance: 149, trunkL: 300, powerCv: 110, kmPerLiter: 12.5 },
  { label: "Volkswagen Virtus", groundClearance: 149, trunkL: 521, powerCv: 116, kmPerLiter: 12.5 },
  { label: "Volkswagen T-Cross", groundClearance: 163, trunkL: 373, powerCv: 116, kmPerLiter: 12 },
  { label: "Volkswagen Nivus", groundClearance: 171, trunkL: 415, powerCv: 116, kmPerLiter: 12.5 },
  { label: "Volkswagen Gol", groundClearance: 141, trunkL: 285, powerCv: 84, kmPerLiter: 13 },
  { label: "Hyundai HB20", groundClearance: 157, trunkL: 300, powerCv: 80, kmPerLiter: 13 },
  { label: "Hyundai HB20S", groundClearance: 157, trunkL: 415, powerCv: 120, kmPerLiter: 12.5 },
  { label: "Hyundai Creta", groundClearance: 190, trunkL: 402, powerCv: 130, kmPerLiter: 11.5 },
  { label: "Toyota Corolla", groundClearance: 140, trunkL: 470, powerCv: 177, kmPerLiter: 11 },
  { label: "Toyota Corolla Cross", groundClearance: 162, trunkL: 440, powerCv: 177, kmPerLiter: 11 },
  { label: "Toyota Yaris", groundClearance: 147, trunkL: 286, powerCv: 108, kmPerLiter: 13 },
  { label: "Toyota Hilux", groundClearance: 216, trunkL: null, powerCv: 204, kmPerLiter: 9.5 },
  { label: "Honda Civic", groundClearance: 132, trunkL: 519, powerCv: 173, kmPerLiter: 11 },
  { label: "Honda HR-V", groundClearance: 195, trunkL: 437, powerCv: 177, kmPerLiter: 11.5 },
  { label: "Honda City", groundClearance: 143, trunkL: 519, powerCv: 126, kmPerLiter: 12.5 },
  { label: "Renault Kwid", groundClearance: 181, trunkL: 290, powerCv: 70, kmPerLiter: 13.5 },
  { label: "Jeep Compass", groundClearance: 205, trunkL: 438, powerCv: 173, kmPerLiter: 10.5 },
  { label: "Jeep Renegade", groundClearance: 205, trunkL: 351, powerCv: 116, kmPerLiter: 11.5 },
  { label: "Nissan Kicks", groundClearance: 185, trunkL: 400, powerCv: 114, kmPerLiter: 12.5 },
  { label: "Nissan Versa", groundClearance: 145, trunkL: 400, powerCv: 106, kmPerLiter: 13 },
];

// Acha o preset cujo nome está contido no que a pessoa digitou (ex.: "Nissan
// Versa 1.6 Exclusive 2021" bate com "Nissan Versa"). Sem match = null.
function matchCommonCar(typedName) {
  if (!typedName) return null;
  const q = typedName.toLowerCase();
  return COMMON_CARS.find((c) => q.includes(c.label.toLowerCase())) || null;
}

function MyCarFormModal({ myCar, onSave, onClose, T }) {
  const [form, setForm] = useState(
    myCar || {
      name: "", groundClearance: "", trunkL: "", powerCv: "",
      kmPerLiter: "", fuelPrice: 6.0, energyPrice: 0.9, kmPerMonth: 1000,
      maintenanceAnnual: "",
    }
  );
  // specs técnicas ficam recolhidas por padrão — a maioria não sabe de cabeça
  // e não são necessárias pra ver a economia mensal, só pra comparar espaço/potência
  const [showSpecs, setShowSpecs] = useState(
    !!(myCar && (myCar.groundClearance || myCar.trunkL || myCar.powerCv))
  );
  const [autoFillNote, setAutoFillNote] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const tryAutoFill = () => {
    const match = matchCommonCar(form.name);
    if (!match) return;
    // só preenche o que ainda está vazio — nunca sobrescreve o que a pessoa já digitou
    setForm((f) => ({
      ...f,
      groundClearance: f.groundClearance || match.groundClearance || "",
      trunkL: f.trunkL || match.trunkL || "",
      powerCv: f.powerCv || match.powerCv || "",
      kmPerLiter: f.kmPerLiter || match.kmPerLiter || "",
    }));
    setShowSpecs(true);
    setAutoFillNote(match.label);
  };

  const fieldStyle = {
    background: T.bg, border: `1px solid ${T.line}`, borderRadius: 7, padding: "9px",
    color: T.ink, fontSize: 13, boxSizing: "border-box", width: "100%"
  };
  const labelStyle = { fontSize: 12.5, color: T.ink, fontWeight: 600, display: "flex", flexDirection: "column", gap: 5 };
  const hintStyle = { fontSize: 10.5, color: T.inkDim, fontWeight: 400, lineHeight: 1.4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.panel, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "88vh", overflow: "auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Seu carro atual</div>
          <button onClick={onClose} style={iconBtnStyle(T)}><X size={15} /></button>
        </div>
        <div style={{ fontSize: 12, color: T.inkDim, marginBottom: 16, lineHeight: 1.5 }}>
          Preenchendo só o nome, a quilometragem mensal, o consumo e o preço do combustível, cada elétrico já mostra a economia mensal estimada. O resto é opcional — dá pra deixar em branco e completar depois. Fica salvo só no seu navegador; outras pessoas que abrirem este app não veem.
        </div>

        <label style={{ ...labelStyle, marginBottom: 6 }}>
          Nome do seu carro
          <input
            type="text"
            list="commonCarsList"
            value={form.name ?? ""}
            onChange={(e) => { set("name", e.target.value); if (autoFillNote) setAutoFillNote(null); }}
            onBlur={tryAutoFill}
            placeholder="Ex.: Nissan Versa 1.6 Exclusive 2021"
            style={fieldStyle}
          />
          <datalist id="commonCarsList">
            {COMMON_CARS.map((c) => <option key={c.label} value={c.label} />)}
          </datalist>
        </label>
        <div style={{ ...hintStyle, marginBottom: autoFillNote ? 8 : 16 }}>
          Se reconhecermos a marca/modelo (ex.: os {COMMON_CARS.length} carros mais vendidos no Brasil), preenchemos vão livre, porta-malas, potência e consumo aproximados — dá pra ajustar qualquer valor depois.
        </div>
        {autoFillNote && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 10px",
            borderRadius: 7, background: "rgba(61,214,199,0.1)", border: `1px solid ${T.accent}`,
            fontSize: 11.5, color: T.accent, fontWeight: 600
          }}>
            <Check size={13} /> Preenchemos specs aproximadas do {autoFillNote} — confira abaixo e ajuste se souber o valor exato do seu carro.
          </div>
        )}

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: T.accent, marginBottom: 10, fontWeight: 700 }}>
          Pra calcular sua economia mensal
        </div>

        <label style={{ ...labelStyle, marginBottom: 14 }}>
          Km rodados por mês
          <input
            type="number"
            value={form.kmPerMonth ?? ""}
            onChange={(e) => set("kmPerMonth", e.target.value)}
            placeholder="Ex.: 1000"
            style={fieldStyle}
          />
          <span style={hintStyle}>Não sabe o número exato? Uma estimativa de cabeça já ajuda — dá pra ajustar depois.</span>
        </label>

        <label style={{ ...labelStyle, marginBottom: 6 }}>
          Consumo do seu carro (km/L)
          <input
            type="number"
            step="0.1"
            value={form.kmPerLiter ?? ""}
            onChange={(e) => set("kmPerLiter", e.target.value)}
            placeholder="Ex.: 11"
            style={fieldStyle}
          />
        </label>
        <div style={{ marginBottom: 14 }}>
          <span style={{ ...hintStyle, display: "block", marginBottom: 5 }}>
            Não sabe de cabeça? Escolha o mais parecido (dá pra ajustar o número depois):
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FUEL_KMPL_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => set("kmPerLiter", p.value)}
                style={{
                  fontSize: 10.5, padding: "5px 9px", borderRadius: 999, cursor: "pointer",
                  background: Number(form.kmPerLiter) === p.value ? T.accent : T.panelAlt,
                  color: Number(form.kmPerLiter) === p.value ? T.bg : T.inkDim,
                  border: `1px solid ${Number(form.kmPerLiter) === p.value ? T.accent : T.line}`, fontWeight: 600
                }}
              >
                {p.label} (~{p.value} km/L)
              </button>
            ))}
          </div>
        </div>

        <label style={{ ...labelStyle, marginBottom: 14 }}>
          Preço do combustível (R$/L)
          <input
            type="number"
            step="0.01"
            value={form.fuelPrice ?? ""}
            onChange={(e) => set("fuelPrice", e.target.value)}
            style={fieldStyle}
          />
          <span style={hintStyle}>Preço médio no posto onde você costuma abastecer.</span>
        </label>

        <label style={{ ...labelStyle, marginBottom: 14 }}>
          Preço da energia (R$/kWh)
          <input
            type="number"
            step="0.01"
            value={form.energyPrice ?? ""}
            onChange={(e) => set("energyPrice", e.target.value)}
            style={fieldStyle}
          />
          <span style={hintStyle}>Já vem preenchido com a tarifa média residencial do Brasil. Se souber a sua (olhe a conta de luz), ajuste aqui pra ficar mais preciso.</span>
        </label>

        <label style={{ ...labelStyle, marginBottom: 18 }}>
          Manutenção do seu carro (R$/ano) <span style={{ fontWeight: 400, color: T.inkDim }}>— opcional</span>
          <input
            type="number"
            step="0.01"
            value={form.maintenanceAnnual ?? ""}
            onChange={(e) => set("maintenanceAnnual", e.target.value)}
            placeholder="Ex.: 1200"
            style={fieldStyle}
          />
          <span style={hintStyle}>Some, por alto, o que você gastou em revisões, troca de óleo etc. no último ano. Não sabe? Deixe em branco — a economia de combustível/energia continua aparecendo normalmente, só sem a parte de manutenção.</span>
        </label>

        <button
          type="button"
          onClick={() => setShowSpecs((s) => !s)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 8, padding: "10px 12px",
            color: T.inkDim, fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}
        >
          <span>Specs do carro (opcional — pra comparar espaço e potência)</span>
          {showSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showSpecs && (
          <div style={{ marginTop: 12 }}>
            <div style={{ ...hintStyle, marginBottom: 10 }}>
              Você encontra esses números na ficha técnica do manual do carro, ou pesquisando "[marca e modelo] ficha técnica". Pode deixar em branco o que não souber — não afeta a economia mensal.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <label style={labelStyle}>
                Vão livre (mm)
                <input type="number" value={form.groundClearance ?? ""} onChange={(e) => set("groundClearance", e.target.value)} placeholder="Ex.: 160" style={fieldStyle} />
              </label>
              <label style={labelStyle}>
                Porta-malas (L)
                <input type="number" value={form.trunkL ?? ""} onChange={(e) => set("trunkL", e.target.value)} placeholder="Ex.: 350" style={fieldStyle} />
              </label>
              <label style={labelStyle}>
                Potência (cv)
                <input type="number" value={form.powerCv ?? ""} onChange={(e) => set("powerCv", e.target.value)} placeholder="Ex.: 105" style={fieldStyle} />
              </label>
            </div>
          </div>
        )}

        <button
          onClick={() =>
            onSave({
              ...form,
              groundClearance: form.groundClearance ? Number(form.groundClearance) : null,
              trunkL: form.trunkL ? Number(form.trunkL) : null,
              powerCv: form.powerCv ? Number(form.powerCv) : null,
              kmPerLiter: form.kmPerLiter ? Number(form.kmPerLiter) : null,
              fuelPrice: form.fuelPrice ? Number(form.fuelPrice) : null,
              energyPrice: form.energyPrice ? Number(form.energyPrice) : 0.9,
              kmPerMonth: form.kmPerMonth ? Number(form.kmPerMonth) : null,
              maintenanceAnnual: form.maintenanceAnnual ? Number(form.maintenanceAnnual) : null,
            })
          }
          style={{
            width: "100%", marginTop: 18, background: T.accent, color: T.bg,
            border: "none", borderRadius: 9, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer"
          }}
        >
          Salvar meu carro
        </button>
      </div>
    </div>
  );
}

function TutorialModal({ step, setStep, onClose, tourRefs, T }) {
  const total = TUTORIAL_STEPS.length;
  const current = TUTORIAL_STEPS[step];
  const Icon = current.icon;
  const isLast = step === total - 1;
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!current.refKey) {
      setRect(null);
      return;
    }
    const el = tourRefs[current.refKey]?.current;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    const t = setTimeout(update, 350);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const pad = 6;
  const hasSpotlight = !!rect;

  return (
    <>
      {/* dark backdrop — transparent where the spotlight cutout draws its own huge shadow */}
      <div style={{ position: "fixed", inset: 0, zIndex: 70, background: hasSpotlight ? "transparent" : "rgba(0,0,0,0.75)" }} />

      {hasSpotlight && (
        <div style={{
          position: "fixed",
          top: rect.top - pad, left: rect.left - pad,
          width: rect.width + pad * 2, height: rect.height + pad * 2,
          borderRadius: 12, border: `2px solid ${T.accent}`,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
          zIndex: 71, pointerEvents: "none",
          transition: "top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease",
        }} />
      )}

      <div style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 72, margin: "0 auto",
        maxWidth: 380, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 16, padding: 20
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, ...iconBtnStyle(T) }}>
          <X size={14} />
        </button>

        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "rgba(61,214,199,0.12)",
          border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12
        }}>
          <Icon size={20} color={T.accent} />
        </div>

        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6, paddingRight: 20 }}>
          {current.title}
        </div>
        <div style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.55, marginBottom: 16 }}>
          {current.text}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 16 }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 18 : 6, height: 6, borderRadius: 999,
                background: i === step ? T.accent : T.line, transition: "width 0.2s"
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                width: 40, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: `1px solid ${T.line}`, borderRadius: 9, color: T.ink, cursor: "pointer"
              }}
            >
              <ArrowLeft size={15} />
            </button>
          )}
          {step === 0 && (
            <button
              onClick={onClose}
              style={{
                flex: "0 0 auto", padding: "0 14px", background: "transparent", border: `1px solid ${T.line}`,
                borderRadius: 9, color: T.inkDim, fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}
            >
              Pular
            </button>
          )}
          <button
            onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: T.accent, color: T.bg, border: "none", borderRadius: 9,
              padding: "10px", fontWeight: 700, fontSize: 13.5, cursor: "pointer"
            }}
          >
            {isLast ? "Começar a usar" : "Próximo"} {!isLast && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}
