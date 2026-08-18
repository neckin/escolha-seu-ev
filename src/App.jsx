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
import { supabase } from "./supabaseClient";

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
  "Ford": "Ford Motor Company — independente (Mustang Mach-E vendido no Brasil via CAOA Ford)",
  "Audi": "Volkswagen Group",
  "Land Rover": "Jaguar Land Rover (JLR) — controlada pela Tata Motors (Índia)",
  "Porsche": "Volkswagen Group",
  "Lexus": "Toyota Motor Corporation (marca de luxo)",
  "Mitsubishi": "Aliança Renault-Nissan-Mitsubishi",
  "Denza": "BYD Company (marca premium, joint venture original com a Mercedes-Benz, hoje majoritariamente BYD)",
  "Avatr": "Changan — joint venture com Huawei e CATL",
  "Jeep": "Stellantis",
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
// Vazio por enquanto: o único item que restava aqui ("MG4 versão importada")
// foi removido em 19/08/2026 — o usuário conferiu contra o PDF oficial com
// todos os modelos da MG e esse carro não existe na linha da marca.
const BULK_RAW = [];

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

const PRICE_CHECKED_IDS = new Set(["geely-ex2-pro", "jac-e-js1"]);
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
    imageUrl: "https://static.autodromo.com.br/uploads/8aab83a5-c041-4fa6-9440-b6c458ee1f1b_laGEE002725_ImagensSite_desktop_1920x756px_Design_01.webp",
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
    imageUrl: "https://mgmotoroficial.com.br/imagens/new-mg4-urban/banner.jpg",
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
    groundClearance: 117,
    trunkL: 568,
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
      "Construído sobre a plataforma MSP (Modular Scalable Platform), a mesma usada na Europa — o que dá respaldo real ao resultado de 5 estrelas do MG4 Electric no Euro NCAP. Química LFP confirmada diretamente na concessionária, após divergência entre fontes públicas. Specs conferidas na ficha técnica oficial MG (ago/2026): porta-malas 568L e altura livre do solo 117mm (valor único de fábrica, igual em todas as versões do MG4 Urban).",
    personas: { urbano: 4, familia: 5, aventura: 3, performance: 3, custo: 5 },
  },
  {
    id: "aionut",
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202606/1780368380304-pc.webp",
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
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202606/1780368380304-pc.webp",
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
    groundClearance: 150,
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
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/ora-5/lancamento/externas-cinza/ora-5-lateral-rigida-2-gwm-galeria.webp",
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
    warranty: "5 anos sem limite de km veículo / 8 anos/200.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
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
    imageUrl: "https://www.byd.com/material/byd-site/br/product/dolphin-se/menu-dolphin-se-4.png",
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
    imageUrl: "https://static.autodromo.com.br/uploads/8aab83a5-c041-4fa6-9440-b6c458ee1f1b_laGEE002725_ImagensSite_desktop_1920x756px_Design_01.webp",
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
    imageUrl: "https://www.jacmotors.com.br/wp-content/uploads/2025/12/01-jac-e-js1.webp",
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
    imageUrl: "https://storage.googleapis.com/ire-74774-ope/files%2F%2Fimage_9e693e33-8699-4d2f-b9af-0d89354507ec.jpg",
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
    id: "renault-megane-e-tech",
    imageUrl: "https://cdn.group.renault.com/ren/br/renault-new-cars/product-plans/2025/megane-/megane_design2.jpg.ximg.xsmall.jpg/696b5a6e02.jpg",
    name: "Renault Megane E-Tech",
    brand: "Renault",
    category: "Hatch médio",
    price: 279990,
    powerCv: 220,
    torqueNm: 300,
    batteryKwh: 60,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 337,
    accel: 7.4,
    groundClearance: null,
    trunkL: 440,
    weightKg: 1680,
    wallbox: null,
    acKw: 22,
    dcKw: 130,
    airbags: 7,
    warranty: "8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.8,
    techNotes:
      "Hatch elétrico premium da Renault, com vendas bem baixas no Brasil (32 unidades emplacadas de jan-set/2025). Preço de tabela oficial é R$279.990, mas há descontos agressivos em concessionárias (achado por R$225.990 a R$199.900 em promoções pontuais) por conta do baixo giro de estoque. Recarga DC de 130kW (15-80% em ~36min) e AC de 22kW (carga completa em ~1h50).",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 4, custo: 2 },
  },
  {
    id: "neta-aya",
    imageUrl: "https://netaauto.com.br/wp-content/webp-express/webp-images/uploads/2025/06/NETA-AYA-4.png.webp",
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
    groundClearance: 120,
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
    id: "gwm-ora-03-skin",
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/ora-03-bev58/placas-ajustadas/ora-bev-58-blue.webp",
    name: "GWM Ora 03 Skin BEV48",
    brand: "GWM",
    category: "Hatch compacto",
    price: 169000,
    powerCv: 171,
    torqueNm: 250,
    batteryKwh: 48,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 232,
    accel: 8.2,
    groundClearance: 135,
    trunkL: 228,
    weightKg: 1586,
    wallbox: "Incluso",
    acKw: 11,
    dcKw: 64,
    airbags: 7,
    warranty: "5 anos sem limite de km veículo / 8 anos/200.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: "Programa promocional: 5 anos ou 48.000 km de revisões grátis",
    maintenanceFirstCost: "Gratuita (dentro do programa promocional)",
    maintenanceKmBase: 48000,
    maintenanceTotalCost: 0,
    consumptionKwh100: 17.6,
    techNotes:
      "Resolvido conflito de fontes que havia antes: Skin e GT (cadastrada separadamente) usam o MESMO motor (171cv/250Nm) — a diferença real é só a bateria (48kWh aqui vs 63kWh na GT, refletindo na autonomia) e equipamentos (GT tem freios maiores, teto solar panorâmico e banco elétrico; Skin já vem com teto solar simples). 0-100 e velocidade máxima idênticos nas duas. Tem frunk de 57L além dos 228L do porta-malas traseiro (858L com banco rebatido). 5 estrelas no Euro NCAP.",
    personas: { urbano: 4, familia: 2, aventura: 2, performance: 3, custo: 4 },
  },
  {
    id: "gwm-haval-h6-phev35",
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/phev-35/phev-35-3-4-dianteria-ambientada.webp",
    name: "GWM Haval H6 PHEV35",
    brand: "GWM",
    category: "SUV médio híbrido",
    price: 288000,
    powerCv: 393,
    torqueNm: 762,
    batteryKwh: 35,
    batteryChem: null,
    motorType: "PHEV combinado AWD (1.5 turbo + motor elétrico dianteiro + motor elétrico traseiro, sistema Hi4)",
    rangeKm: null,
    accel: null,
    groundClearance: 200,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão de bateria maior do Haval H6 PHEV (a versão PHEV19, com bateria de 19kWh e 326cv, já está cadastrada separadamente, id gwm-haval-h6-phev): aqui a bateria de 35kWh e o sistema Hi4 com tração integral (motor elétrico em cada eixo) elevam a potência para 393cv/762Nm. Autonomia elétrica pura varia MUITO entre fontes consultadas (100km, 119km e até 170km, conforme o veículo e o ciclo de medição usado) — não incluída por falta de um valor confiável único. Existe também a versão GT (mesma mecânica 393cv, suspensão mais esportiva, 0-100 em 4,9s, ~R$315-325 mil), não cadastrada separadamente por não ter diferença de potência/bateria da PHEV35, só de calibração de suspensão e equipamentos.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 2 },
  },
  {
    id: "gwm-ora-03-gt",
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/ora-03-bev58/placas-ajustadas/ora-bev-58-blue.webp",
    name: "GWM Ora 03 GT BEV63",
    brand: "GWM",
    category: "Hatch compacto",
    price: 199000,
    powerCv: 171,
    torqueNm: 250,
    batteryKwh: 63,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 319,
    accel: 8.2,
    groundClearance: 135,
    trunkL: 228,
    weightKg: null,
    wallbox: "Incluso",
    acKw: 11,
    dcKw: 67,
    airbags: 7,
    warranty: "5 anos sem limite de km veículo / 8 anos/200.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: "Programa promocional: 5 anos ou 48.000 km de revisões grátis",
    maintenanceFirstCost: "Gratuita (dentro do programa promocional)",
    maintenanceKmBase: 48000,
    maintenanceTotalCost: 0,
    consumptionKwh100: 15,
    techNotes:
      "Mesmo motor da Skin (cadastrada separadamente), 171cv/250Nm — a diferença é a bateria maior (63kWh vs 48kWh, mais autonomia) e mais equipamento: freios maiores, teto solar panorâmico, banco do motorista elétrico. Peso não encontrado em fonte específica pra essa versão (deve ser um pouco maior que a Skin por causa da bateria). Tem frunk de 57L além dos 228L do porta-malas traseiro (858L com banco rebatido). 5 estrelas no Euro NCAP.",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 3, custo: 3 },
  },
  {
    id: "volvo-ex30",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/bltd6c4bc738c705b81/67bba19c633cc722a1804cfa/Overview-exterior-gallery-2-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1200",
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
    groundClearance: 165,
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
      "Existem duas configurações de bateria: Single (51 kWh LFP, RWD, ~250 km INMETRO — ficha usada aqui) e Twin/Extended Range (69 kWh NMC, ~316-338 km — cadastrada separadamente, id volvo-ex30-ultra). Faixa de preço por versão vai de R$212.554 a R$275.485. Houve recall no Brasil (~5.600 unidades) por risco de incêndio na bateria — vale checar se o carro já passou pelo reparo antes de comprar usado.",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 4, custo: 2 },
  },
  {
    id: "volvo-ex30-ultra",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/blt925a50f0601b1430/67bba201335a44fc7f411489/Overview-exterior-gallery-7-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1200",
    name: "Volvo EX30 Ultra Twin Motor",
    brand: "Volvo",
    category: "SUV compacto premium",
    price: 310000,
    powerCv: 428,
    torqueNm: 543,
    batteryKwh: 69,
    batteryChem: "NMC",
    motorType: "Bimotor AWD (um em cada eixo)",
    rangeKm: 316,
    accel: 3.6,
    groundClearance: 165,
    trunkL: 318,
    weightKg: 1960,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "36 meses/100.000 km veículo, 8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 21.8,
    techNotes:
      "Versão topo de linha do EX30, bimotor AWD (428cv/543Nm) com bateria NMC de 69kWh — quase o dobro da potência da versão Single (272cv). Existe também a versão Cross Country (R$315.000, mesma bateria de 69kWh, suspensão elevada), provavelmente com potência semelhante à Ultra, mas sem ficha técnica própria confirmada em fonte confiável.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "fiat-500e",
    imageUrl: "https://500e.fiat.com.br/images/HeroDesktop/backgrounds/fiat-500e-novo-500-eletrico.webp",
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
    groundClearance: 147,
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
    imageUrl: "https://www.peugeot.pt/content/dam/peugeot/portugal/b2c/our-range/e-2008-suv/canvas-aug25/E-2008_1920x1080-1.jpg",
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
    groundClearance: 174,
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
    imageUrl: "https://www.mini.com.br/content/dam/MINI/common/Range/new-generation/cooper/all-electric/bodytype-hub/mini-J01-BEV-gallery-front-wide.webp",
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
    groundClearance: 128,
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
    id: "mini-aceman-e",
    imageUrl: "https://www.mini.com.br/content/dam/MINI/common/Range/new-generation/aceman/bodytype-hub/mini-J05-gallery-exterior.webp",
    name: "Mini Aceman E",
    brand: "Mini",
    category: "Hatch compacto premium",
    price: 254990,
    powerCv: 184,
    torqueNm: 290,
    batteryKwh: 42.5,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 253,
    accel: 7.6,
    groundClearance: 143,
    trunkL: 300,
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
    consumptionKwh100: 16.8,
    techNotes:
      "Primeiro modelo da MINI projetado desde o início pra ser 100% elétrico, posicionado entre o hatch Cooper e o SUV Countryman. Versão de entrada (E), com bateria de 42,5kWh e 253km de autonomia (Inmetro) — dados confirmados via press release oficial do BMW Group Brasil. Porta-malas de 300L (1.005L com bancos rebatidos). A versão SE (mais potente) está cadastrada separadamente (id mini-aceman-se). Recarga DC 10-80% em ~28min.",
    personas: { urbano: 5, familia: 2, aventura: 2, performance: 3, custo: 2 },
  },
  {
    id: "mini-aceman-se",
    imageUrl: "https://www.mini.com.br/content/dam/MINI/common/Range/new-generation/aceman/bodytype-hub/mini-J05-gallery-exterior.webp",
    name: "Mini Aceman SE",
    brand: "Mini",
    category: "Hatch compacto premium",
    price: 304990,
    powerCv: 218,
    torqueNm: 330,
    batteryKwh: 54.2,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 270,
    accel: 7.1,
    groundClearance: 143,
    trunkL: 300,
    weightKg: 1785,
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
    consumptionKwh100: 20.1,
    techNotes:
      "Versão topo de linha do Aceman, com bateria maior (54,2kWh vs 42,5kWh da E) e mais potência (218cv vs 184cv), resultando em mais autonomia (270km vs 253km, Inmetro) e aceleração mais rápida (7,1s vs 7,6s). Porta-malas de 300L (1.005L com bancos rebatidos). Recarga DC 10-80% em ~31min.",
    personas: { urbano: 5, familia: 2, aventura: 2, performance: 4, custo: 1 },
  },
  {
    id: "mini-countryman-se-all4",
    imageUrl: "https://www.mini.com/content/dam/MINI/common/Range/new-generation/countryman/bev/bodytype-hub/mini-U25-BEV-campaign-wide.webp",
    name: "MINI Countryman SE ALL4",
    brand: "Mini",
    category: "SUV compacto premium",
    price: 409990,
    powerCv: 306,
    torqueNm: 494,
    batteryKwh: 66.45,
    batteryChem: null,
    motorType: "Bimotor AWD (ALL4)",
    rangeKm: 320,
    accel: 5.8,
    groundClearance: 170,
    trunkL: 450,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 130,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.8,
    techNotes:
      "SUV elétrico da MINI, compartilha plataforma com o BMW iX1/iX2. Versões Exclusive (R$294.990) e Top (R$339.990) têm a mesma mecânica (306cv/494Nm/66,45kWh) — só rodas e equipamentos mudam, por isso um card único. Preço oficial atual (site MINI Brasil, ago/2026) é R$409.990, bem acima dos valores de lançamento. Porta-malas de 450L (1.390L com bancos rebatidos). Recarga DC de até 130kW (10-80% em ~30min).",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "mini-jcw-cooper-e",
    imageUrl: "https://www.mini.com.br/content/dam/MINI/common/Range/new-generation/cooper/all-electric/bodytype-hub/mini-J01-BEV-gallery-front-wide.webp",
    name: "MINI John Cooper Works Cooper E",
    brand: "Mini",
    category: "Hatch compacto premium",
    price: 330990,
    powerCv: 258,
    torqueNm: 340,
    batteryKwh: null,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD) — preparação John Cooper Works",
    rangeKm: 299,
    accel: null,
    groundClearance: 128,
    trunkL: 210,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Primeira vez que a linha JCW (John Cooper Works) é oferecida completa e 100% elétrica no Brasil (chegou junto com o JCW Aceman E, cadastrado separadamente, id mini-jcw-aceman-e). Versão de alta performance do Cooper SE (já cadastrado, id mini-cooper-se), com mais potência (258cv/340Nm vs 218cv/330Nm) e ajustes esportivos de suspensão/freios/visual. Autonomia de 299km (Inmetro/PBEV). Capacidade de bateria não confirmada com segurança — fontes divergem entre reaproveitar o valor do Cooper SE (54,2kWh) e não informar; por isso não incluída.",
    personas: { urbano: 4, familia: 1, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "mini-jcw-aceman-e",
    imageUrl: "https://www.mini.com.br/content/dam/MINI/common/Range/new-generation/aceman/bodytype-hub/mini-J05-gallery-exterior.webp",
    name: "MINI John Cooper Works Aceman E",
    brand: "Mini",
    category: "Hatch compacto premium",
    price: 345990,
    powerCv: 258,
    torqueNm: 340,
    batteryKwh: null,
    batteryChem: null,
    motorType: "PMSM dianteiro (FWD) — preparação John Cooper Works",
    rangeKm: 312,
    accel: null,
    groundClearance: 143,
    trunkL: 300,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão de alta performance do Aceman (a E de entrada, 184cv, e a SE, 218cv, já estão cadastradas separadamente, ids mini-aceman-e e mini-aceman-se), com mais potência ainda (258cv/340Nm) e ajustes esportivos JCW. Autonomia de 312km (Inmetro/PBEV) — a maior entre os elétricos MINI hatch/SUV compacto. Capacidade de bateria não confirmada com segurança (fontes divergem e uma delas parece ter confundido com a ficha da Aceman E comum) — por isso não incluída.",
    personas: { urbano: 4, familia: 2, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "chevrolet-equinox-ev",
    imageUrl: "https://www.chevrolet.com.br/content/dam/chevrolet/south-america/brazil/portuguese/index/electric/guide/guias-equinox-ev/mh-equinox-desk.jpg?imwidth=1200",
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
    groundClearance: 163,
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
    imageUrl: "https://www.chevrolet.com.br/content/dam/chevrolet/south-america/brazil/portuguese/index/visid/electric/2025-blazer-ev/01-images/mov/01-images/imagem-balzer-ev.jpg?imwidth=1200",
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
    groundClearance: 200,
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
    imageUrl: "https://www.chevrolet.com.br/content/dam/chevrolet/south-america/brazil/portuguese/index/visid/electric/captiva-ev/mov/banner-01/chevrolet-captiva-ev-suv-urbano.jpg?imwidth=1200",
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
    groundClearance: 160,
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
    imageUrl: "https://www.chevrolet.com.br/content/dam/chevrolet/south-america/brazil/portuguese/index/visid/electric/spark-euv/refresh/gallery/fechada/chevrolet-spark-euv.jpeg?imwidth=1200",
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
    groundClearance: 140,
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
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/blt5fe2e0ad60256848/685251c2c6e1436bffd9bde6/overview-exterior-gallery-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1800",
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
    groundClearance: 175,
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
      "Antigo Volvo XC40 Recharge, renomeado EX40 em 2025. Duas versões: P6 (238cv/420Nm, RWD, bateria 69kWh, ~385km — ficha usada aqui, compatível com o preço de tabela Plus de R$329.950) e P8 (408cv/670Nm, AWD, bateria 82kWh, ~393km, 0-100 em 4,9s, mais cara — cadastrada separadamente, id volvo-ex40-ultra). Peso ~2.050kg é aproximado (fonte não especifica por versão).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 1 },
  },
  {
    id: "volvo-ex40-ultra",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/blt36d2dc5cfa41f957/6852527a8319c416c2d91a22/overview-exterior-gallery-02-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1200",
    name: "Volvo EX40 Ultra P8",
    brand: "Volvo",
    category: "SUV médio premium",
    price: 375700,
    powerCv: 408,
    torqueNm: 670,
    batteryKwh: 82,
    batteryChem: null,
    motorType: "Bimotor AWD",
    rangeKm: 393,
    accel: 4.9,
    groundClearance: 175,
    trunkL: 414,
    weightKg: null,
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
    consumptionKwh100: 20.9,
    techNotes:
      "Versão topo de linha do EX40 (P8 Ultra AWD), com bateria maior (82kWh vs 69kWh do P6) e bimotor (408cv/670Nm vs 238cv/420Nm), quase dobrando a potência. Preço tem bastante divergência entre fontes/datas — de R$329.703 (FIPE) a R$375.700 (maio/2026); usamos o valor mais recente encontrado. Porta-malas e airbags assumidos iguais ao P6 (mesma carroceria).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "volvo-ec40-plus",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/blt5e9113fe09dfe427/685bf946947f79a03951f0cf/overview-exterior-gallery-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1800",
    name: "Volvo EC40 Plus",
    brand: "Volvo",
    category: "SUV médio premium",
    price: 334950,
    powerCv: 238,
    torqueNm: 420,
    batteryKwh: 69,
    batteryChem: null,
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 385,
    accel: 7.4,
    groundClearance: 177,
    trunkL: null,
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
    consumptionKwh100: 17.9,
    techNotes:
      "Antigo Volvo C40 Recharge, renomeado EC40 em 2025 — versão cupê-SUV do EX40, com carroceria de teto mais baixo e inclinado, mas mesma base mecânica. Versão Plus (RWD, 238cv/420Nm, bateria 69kWh, ~385km Inmetro) é a entrada de linha. A versão Ultra (bimotor, mais potente) está cadastrada separadamente (id volvo-ec40-ultra). Porta-malas provavelmente menor que o EX40 (carroceria cupê), mas sem fonte confiável específica.",
    personas: { urbano: 3, familia: 3, aventura: 2, performance: 3, custo: 1 },
  },
  {
    id: "volvo-ec40-ultra",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/bltdd9a3cddf17c1565/685bfa259f3389c127e2015d/overview-exterior-gallery-02-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1200",
    name: "Volvo EC40 Ultra",
    brand: "Volvo",
    category: "SUV médio premium",
    price: 384950,
    powerCv: 408,
    torqueNm: 670,
    batteryKwh: 82,
    batteryChem: null,
    motorType: "Bimotor AWD",
    rangeKm: 404,
    accel: 4.8,
    groundClearance: 177,
    trunkL: null,
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
    consumptionKwh100: 20.3,
    techNotes:
      "Versão topo de linha do EC40 (bimotor AWD, 408cv/670Nm, bateria 82kWh), com a maior autonomia da linha 2026 (404km Inmetro, +51km sobre a geração anterior). Mesmo conjunto mecânico do EX40 Ultra, em carroceria cupê-SUV.",
    personas: { urbano: 3, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "bmw-ix1",
    imageUrl: "https://bmw.scene7.com/is/image/BMW/u11-bev_stage:16to7?fmt=webp&wid=2560&fit=wrap%2C+1",
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
    groundClearance: 170,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/u10_bev_design-positioning:16to7?fmt=webp&wid=2560&fit=wrap%2C+1",
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
    groundClearance: 170,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/na5_exterior_front_view_1920_1024_fb?qlt=80&wid=2000&fmt=webp",
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
    groundClearance: 180,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/i20_bev_stage_dsk_fb?qlt=80&wid=2000&fmt=webp",
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
    groundClearance: 202,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g26_bev_stage_dsk_fb?qlt=80&wid=2000&fmt=webp",
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
    groundClearance: 125,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g60-mp-bev-stage-ext-dsk-sl?qlt=80&wid=2000&fmt=webp",
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
    groundClearance: 137,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g70-bev_stage:16to7?fmt=webp&wid=2560&fit=wrap%2C+1",
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
    groundClearance: 136,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g60_phev_ext-design-highlights_2_dynamic-light-carpet_dsk_shfv_de?qlt=80&wid=2000&fmt=webp",
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
    groundClearance: 146,
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
    imageUrl: "https://bmw.scene7.com/is/image/BMW/1-x5-header:16to7?fmt=webp&wid=2560&fit=wrap%2C+1",
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
    groundClearance: 214,
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
    imageUrl: "https://www.hyundai.com.br/content/dam/hmb/product/ioniq-5/_new-assets/mkv/ioniq5_mkv_desk_1920x800.webp",
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
    imageUrl: "https://jetourbr.com/wp-content/uploads/2026/03/jetour-t2-hero.webp",
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
    imageUrl: "https://jetourbr.com/wp-content/uploads/2026/03/jetour-s06-hero.webp",
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
    imageUrl: "https://jetourbr.com/wp-content/uploads/2026/03/jetour-t1-hero.webp",
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
    groundClearance: 190,
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
    imageUrl: "https://cms.omodajaecoo.com.br/images/vehicles-content/1665511444-j7_box-top_desk-v4.jpg",
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
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/haval-h6-phev19-my25/lancamento-/phev-19-3-4-dianteira-ambientada.webp",
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
    groundClearance: 182,
    trunkL: 560,
    weightKg: 1900,
    wallbox: null,
    acKw: 6.6,
    dcKw: 33,
    airbags: 6,
    warranty: "5 anos sem limite de km veículo + 8 anos/200.000 km sistema híbrido e bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: "12.000 km/12 meses",
    maintenanceFirstCost: "Conflito entre fontes: grátis ou ~R$890",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Existem 4 variantes do Haval H6 em 2026: HEV2 (não é PHEV, R$223 mil), PHEV19 (ficha usada aqui, 326cv, R$248 mil — preço atualizado, o valor anterior de R$219.800 estava desatualizado), PHEV35 (393cv, R$288 mil) e GT (393cv, carroceria cupê, R$325 mil). Autonomia elétrica pura de 77km INMETRO (até 115km WLTP). Um dos poucos PHEVs com carregamento DC (até 33kW), incomum no segmento. Peso 1.890-1.910kg conforme fonte (usado o meio da faixa).",
    personas: { urbano: 2, familia: 4, aventura: 4, performance: 5, custo: 2 },
  },
  {
    id: "gwm-tank-300",
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/tank-300/gerais/banner-hero-tank-300.webp",
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
    groundClearance: 222,
    trunkL: 863,
    weightKg: 2630,
    wallbox: "Incluso (oferta de lançamento — pode não valer pra todo comprador, checar vigência)",
    acKw: 6.6,
    dcKw: 50,
    airbags: 6,
    warranty: "5 anos sem limite de km veículo + 8 anos/200.000 km sistema híbrido e bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV off-road de luxo, híbrido plug-in 4x4 com 394cv/750Nm combinados, bateria 37,1kWh NMC e autonomia elétrica pura de 74-75km (Inmetro) / até 106km (WLTP). Preço oficial no site da GWM Brasil é R$342.000 — agregadores de mercado citam valores de R$333.000 (lançamento, 2025) a R$389.990, possível reflexo de diferentes datas/versões. Autonomia total combinada (~1.290km) é uma estimativa calculada a partir do consumo híbrido divulgado (18,4-18,7 km/l) e do tanque de 70L — não é um valor divulgado diretamente pela GWM. Porta-malas de 863L (1.520L com bancos rebatidos). Vão livre de 222mm e ângulos de entrada/saída de 32°/33° — dos melhores off-road do grupo, com travessia de água até 700mm.",
    personas: { urbano: 1, familia: 3, aventura: 5, performance: 5, custo: 1 },
  },
  {
    id: "gwm-wey-07",
    imageUrl: "https://www.gwmmotors.com.br/content/dam/gwm/pages/br/pt/models/wey/wey-lateral.png",
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
    dcKw: 60,
    airbags: 6,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV híbrido plug-in de luxo com 6 lugares da WEY, submarca premium da GWM. Lançado oficialmente no Brasil em out/2025 (vendas iniciadas em 23/10), preço R$429.000. Potência combinada de 517cv/820Nm, bateria 42,5kWh, autonomia elétrica de 128km (Inmetro) — até 185km citado em fonte WLTP. Autonomia total combinada supera 1.200km. Porta-malas de apenas 239L com a 3ª fileira em uso (1.040L com ela rebatida). Recarga DC de 60kW leva a bateria de 30% a 80% em ~26min; AC leva de 15% a 100% em ~6h30 (kW exato não confirmado). Garantia não confirmada em fonte disponível.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "byd-dolphin-mini-gl",
    imageUrl: "https://www.byd.com/material/__CN/byd-site/br/product/dolphin-mini/menu-dolphin-mini.png",
    name: "BYD Dolphin Mini GL",
    brand: "BYD",
    category: "Hatch compacto",
    price: 118990,
    powerCv: 75,
    torqueNm: 135,
    batteryKwh: 30.08,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 224,
    accel: 14.9,
    groundClearance: 155,
    trunkL: 230,
    weightKg: 1165,
    wallbox: null,
    acKw: 6.6,
    dcKw: 30,
    airbags: 4,
    warranty: "6 anos/200.000 km veículo (uso particular) / 8 anos/200.000 km bateria Blade",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "O elétrico mais vendido do Brasil. Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026). Duas versões, GL (entrada, ficha usada aqui) e GS (cadastrada separadamente) — a diferença de preço é de só R$1.000, mas a GS tem bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais equipamento (carregador de celular por indução, acabamento do volante, luzes de cortesia, vidro do motorista one-touch/antiesmagamento). Airbags: só frontais + cortina na GL (a GS ganha também os laterais dianteiros). Uso comercial reduz a garantia do veículo pra 6 anos/100.000km.",
    personas: { urbano: 5, familia: 1, aventura: 1, performance: 1, custo: 5 },
  },
  {
    id: "byd-dolphin-mini-gs",
    imageUrl: "https://www.byd.com/material/__CN/byd-site/br/product/dolphin-mini/menu-dolphin-mini.png",
    name: "BYD Dolphin Mini GS",
    brand: "BYD",
    category: "Hatch compacto",
    price: 119990,
    powerCv: 75,
    torqueNm: 135,
    batteryKwh: 38.88,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 280,
    accel: 14.9,
    groundClearance: 155,
    trunkL: 230,
    weightKg: 1239,
    wallbox: null,
    acKw: 6.6,
    dcKw: 40,
    airbags: 6,
    warranty: "6 anos/200.000 km veículo (uso particular) / 8 anos/200.000 km bateria Blade",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão mais completa do Dolphin Mini (o elétrico mais vendido do Brasil), só R$1.000 mais cara que a GL (cadastrada separadamente), mas com bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais 2 airbags (laterais dianteiros — a GL só tem frontais + cortina). Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026).",
    personas: { urbano: 5, familia: 1, aventura: 1, performance: 1, custo: 4 },
  },
  {
    id: "byd-dolphin",
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/dolphin-header-update.png",
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
    groundClearance: 150,
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
    imageUrl: "https://www.byd.com/material/byd-site/br/product/dolphin-plus/section02.jpg",
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
    groundClearance: 150,
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
    imageUrl: "https://www.byd.com/material/byd-site/br/product/yuan-plus-ev-br/yuanplus-2026/yuan-2026/menu_yuan-plus-2026-2.png",
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
    groundClearance: 175,
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
    imageUrl: "https://www.byd.com/material/byd-site/br/product/atto-2-dmi/atto2-header.webp",
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
    groundClearance: 160,
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
    imageUrl: "https://www.byd.com/material/byd-site/br/product/atto-2-dmi/atto2-header.webp",
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
    groundClearance: 160,
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
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/seal/seal_glacier_blue.png",
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
    groundClearance: 120,
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
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/han/han-black.png",
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
    groundClearance: 125,
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
    imageUrl: "https://www.byd.com/material/byd-site/br/song-plus---update-2025/page-finais/banner-key-vision-pc.webp",
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
    groundClearance: 180,
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
      "Autonomia elétrica pura homologada de 68km (Inmetro). Existe também a versão Premium AWD (1.5 turbo + dois motores elétricos, 324cv, R$299.800, autonomia elétrica de 87km, cadastrada separadamente, id byd-song-plus-premium-dmi). Preço da versão FWD subiu de ~R$240 mil para ~R$250 mil entre gerações — bem acima dos R$219.800 que circulavam antes.",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "byd-song-plus-premium-dmi",
    imageUrl: "https://www.byd.com/material/byd-site/br/home/home-2025/2025-seo/thumbs/byd-song-plus-premium.jpg",
    name: "BYD Song Plus Premium DM-i",
    brand: "BYD",
    category: "SUV híbrido",
    price: 299800,
    powerCv: 324,
    torqueNm: null,
    batteryKwh: 26.6,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado AWD (1.5 turbo + elétrico dianteiro 204cv + elétrico traseiro 163cv)",
    rangeKm: 1100,
    accel: null,
    groundClearance: 180,
    trunkL: 552,
    weightKg: null,
    wallbox: "Incluso, sem custo (wallbox residencial 7,4kW, com instalação)",
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "6 anos veículo sem limite de km / 8 anos bateria sem limite de km",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão topo de linha do Song Plus (a versão FWD de entrada está cadastrada separadamente, id byd-song-plus-phev), lançada em mar/2026 como o SUV híbrido plug-in mais potente da BYD no Brasil até então. Tração integral com um motor elétrico em cada eixo (204cv dianteiro + 163cv traseiro) somados ao 1.5 turbo, 324cv combinados. Bateria maior (26,6kWh vs 18,3kWh da FWD) dá mais autonomia elétrica (87km PBEV vs 68km) e autonomia total de até 1.100km. Trunk reutilizado do valor da versão FWD (552L) — não confirmado se muda com o pacote AWD.",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "byd-king-phev",
    imageUrl: "https://www.byd.com/material/byd-site/br/product/king/king-Header1.png",
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
    groundClearance: 120,
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
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/Header-BYD-SHARK.png",
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
    groundClearance: 230,
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
  // -- 5 modelos BYD que faltavam na base (site oficial byd.com/br lista 16
  // nomes de modelo; só 11 estavam cadastrados) — adicionados em 17/08/2026
  // após o usuário notar que a linha BYD estava incompleta. Sumiram por
  // acidente num merge/cherry-pick durante a auditoria de outras marcas e
  // foram recuperados com o mesmo conteúdo que já estava na main.
  {
    id: "byd-atto-8",
    imageUrl: "https://www.byd.com/material/byd-site/br/atto-8/New_Atto_8_header_2.png",
    name: "BYD Atto 8",
    brand: "BYD",
    category: "SUV híbrido premium",
    price: 399990,
    powerCv: 488,
    torqueNm: 550,
    batteryKwh: 35.6,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado AWD (1.5 turbo 156cv + elétrico dianteiro 272cv + elétrico traseiro 216cv)",
    rangeKm: 900,
    accel: null,
    groundClearance: 165,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 72,
    airbags: 9,
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
      "SUV híbrido plug-in de 7 lugares com tração integral (AWD): motor 1.5 turbo (156cv) + motor elétrico dianteiro (272cv) + motor elétrico traseiro (216cv), somando 488cv combinados. Bateria Blade LFP de 35,6 kWh garante autonomia elétrica pura de até 152km; autonomia total combinada de até 900km (ciclo NEDC). Porta-malas de até 1.960L com os bancos rebatidos (capacidade com bancos em uso não divulgada). Recarga DC de 30-80% em ~20min (até 72kW). Lançado no Salão do Automóvel 2025.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 4, custo: 1 },
  },
  {
    id: "byd-sealion-7",
    imageUrl: "https://www.byd.com/material/byd-site/br/product/sealion/imagens/header/Sealion7-header.webp",
    name: "BYD Sealion 7",
    brand: "BYD",
    category: "SUV médio premium",
    price: 339990,
    powerCv: 531,
    torqueNm: 690,
    batteryKwh: 82.5,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM AWD biMotor (elétrico dianteiro + traseiro)",
    rangeKm: 360,
    accel: 4.5,
    groundClearance: 140,
    trunkL: 500,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 150,
    airbags: null,
    warranty: "6 anos ou 200.000 km veículo / 8 anos ou 200.000 km bateria Blade",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 22.9,
    techNotes:
      "SUV cupê elétrico irmão do Seal, com tração integral AWD (531cv/690Nm) e 0-100km/h em 4,5s — um dos mais potentes e rápidos do comparativo inteiro. Bateria Blade LFP de 82,5kWh garante 360km de autonomia Inmetro. Porta-malas de 500L + frunk dianteiro de 58L. Recarga DC até 150kW (30-80% em ~30min).",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "byd-song-pro-dm-i-flex",
    imageUrl: "https://www.byd.com/material/__CN/byd-site/br/product/songpro-flex/byd-song-pro-flex-HEADER-3.png",
    name: "BYD Song Pro DM-i Flex",
    brand: "BYD",
    category: "SUV híbrido",
    price: 176990,
    powerCv: 218,
    torqueNm: 300,
    batteryKwh: 13.1,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado (1.5 Flex etanol/gasolina + elétrico) — FWD",
    rangeKm: 1075,
    accel: 8.8,
    groundClearance: 182,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Lançado em 04/08/2026 com o sistema DM-i 5.0 (bicombustível de verdade — o mesmo motor 1.5 Atkinson roda com gasolina, etanol ou qualquer mistura dos dois). Ficha usada aqui é a versão de entrada GL: 13,1kWh Blade LFP, 57km elétricos PBEV, 218cv/300Nm, 8,8s 0-100, R$176.990. A GS (R$199.990) tem bateria maior (18,3kWh, até 72km elétricos PBEV), 219cv e 8,6s — praticamente a mesma potência mas mais autonomia elétrica. No etanol a autonomia total cai pra até 805km (GS)/775km (GL); a gasolina chega a 1.105km (GS)/1.075km (GL, usado aqui).",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 3, custo: 4 },
  },
  {
    id: "byd-tan",
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/new-tan-grey-header.png",
    name: "BYD Tan",
    brand: "BYD",
    category: "SUV grande premium",
    price: 536800,
    powerCv: 517,
    torqueNm: 700,
    batteryKwh: 108.8,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM elétrico, tração integral 4x4",
    rangeKm: 430,
    accel: null,
    groundClearance: 150,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 110,
    airbags: null,
    warranty: "8 anos bateria Blade",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 25.3,
    techNotes:
      "SUV elétrico premium de 7 lugares, tração integral 4x4, 517cv e 700Nm, acelera de 0-100km/h em menos de 5s. Bateria Blade LFP gigante de 108,8kWh rende até 430km Inmetro (530km no ciclo WLTP, mais otimista). Porta-malas varia de 235L (7 lugares) a 940L (5 lugares) e 1.655L com os bancos rebatidos. Recarga DC de 30-80% em ~30min a 110kW. Preço confirmado em R$536.800 (fonte que antes divergia entre R$529.890 e R$536.800 já se consolidou nesse valor). Aceleração, peso, vão livre e airbags ainda sem fonte confiável.",
    personas: { urbano: 1, familia: 5, aventura: 2, performance: 4, custo: 1 },
  },
  {
    id: "byd-yuan-pro",
    imageUrl: "https://www.byd.com/material/byd-site/america-public/header-product-image/header-yuanpro.png",
    name: "BYD Yuan Pro",
    brand: "BYD",
    category: "SUV compacto",
    price: 182990,
    powerCv: 177,
    torqueNm: null,
    batteryKwh: 45.1,
    batteryChem: "LFP (Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 250,
    accel: 7.9,
    groundClearance: 170,
    trunkL: 265,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: "8 anos bateria / 5 anos veículo",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "CORRIGIDO (18/08/2026): o Yuan Pro vendido oficialmente no Brasil é 100% ELÉTRICO (BEV), não híbrido plug-in como estava cadastrado antes — o ficha anterior descrevia a versão DM-i (PHEV) que existe em outros mercados (China, Argentina) mas ainda não tem lançamento confirmado no Brasil. Versão única (GS), R$182.990. Torque, vão livre, peso e airbags ainda sem fonte confiável.",
    personas: { urbano: 4, familia: 3, aventura: 2, performance: 3, custo: 4 },
  },
  {
    id: "mg-mg4",
    imageUrl: "https://mgmotoroficial.com.br/imagens/mg4/img-kv-mg4-cortada-3.webp",
    name: "MG4 Comfort",
    brand: "MG",
    category: "Hatch médio",
    price: 169990,
    powerCv: 190,
    torqueNm: 350,
    batteryKwh: 64,
    batteryChem: "LFP",
    motorType: "PMSM traseiro (RWD)",
    rangeKm: 364,
    accel: 7.2,
    groundClearance: 132,
    trunkL: 350,
    weightKg: 1755,
    wallbox: "Incluso, sem custo",
    acKw: 11,
    dcKw: 140,
    airbags: 6,
    warranty: "7 anos/150.000 km veículo / 8 anos/160.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.0,
    techNotes:
      "Versão de entrada da linha MG4 (distinta da 'MG4 Urban Luxury 54 kWh' já cadastrada separadamente, um modelo menor e mais barato). Existem também Luxury RWD 64kWh (mesma potência/bateria, mais equipamento) e XPower AWD 64kWh (320kW/435cv, 0-100 em 3,8s, R$249.000). Autonomia 364km é a homologada Inmetro/PBEV (a WLTP divulgada pela MG é 467km, mas superestima o uso real no Brasil). Ficha conferida na ficha técnica oficial MG (ago/2026).",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 4, custo: 3 },
  },
  {
    id: "mg-s5",
    imageUrl: "https://mgmotoroficial.com.br/imagens/mgs5/mgs5-comfort.webp",
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
    groundClearance: 136,
    trunkL: 453,
    weightKg: 1705,
    wallbox: null,
    acKw: 7,
    dcKw: 150,
    airbags: 6,
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
      "Duas versões: Comfort (R$195.800, reajustada pra R$218.800 a partir de 5/jan/2026 — ficha usada aqui, com 6 airbags) e Luxury (R$219.800, R$238.800 após 5/jan/2026, ganha 7º airbag central, teto solar e mais equipamento). Construído sobre a Plataforma Modular Escalável (MSP) da MG, 5 estrelas no Euro NCAP 2025.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 4, custo: 3 },
  },
  {
    id: "mg-cyberster",
    imageUrl: "https://mgmotoroficial.com.br/imagens/cyberster/cyberster-color-sombra/cyberster-color-red.webp",
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
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202505/63deb344-57d5-449f-bcf7-1333ea1150f9.webp",
    name: "GAC Aion ES Plus",
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
    airbags: 2,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.6,
    techNotes:
      "Versão única (Plus) no Brasil, confirmada em múltiplas fontes — nome atualizado (antes só 'GAC Aion ES', na verdade é a versão Plus). Recarga DC de 75kW leva a bateria de 30% a 80% em ~37min. Uma fonte lista airbags só frontais (sem laterais/cortina) — se confirmar, é o único Aion vendido no Brasil sem airbag lateral/cortina; vale checar na concessionária antes de decidir. Química da bateria, peso, vão livre e garantia ainda sem fonte confiável.",
    personas: { urbano: 4, familia: 4, aventura: 2, performance: 2, custo: 4 },
  },
  {
    id: "gac-aion-y",
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202503/c9cae70c-c9ca-4488-b909-541e01608a37.jpg",
    name: "GAC Aion Y Premium",
    brand: "GAC",
    category: "SUV compacto",
    price: 175990,
    powerCv: 204,
    torqueNm: 225,
    batteryKwh: 63.2,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 318,
    accel: 8.5,
    groundClearance: 150,
    trunkL: 361,
    weightKg: 1727,
    wallbox: null,
    acKw: 7,
    dcKw: 90,
    airbags: 6,
    warranty: "8 anos/160.000 km veículo, 8 anos/200.000 km bateria (fonte única — recomendo confirmar na concessionária)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.0,
    techNotes:
      "Também comercializado como minivan/SUV familiar. Apesar do nome, é a versão com MAIS equipamento de segurança: pacote completo de ADAS (assistente de congestionamento, permanência em faixa, mudança de faixa, frenagem autônoma de emergência, piloto adaptativo), rodas de 17\". A versão Elite (cadastrada separadamente) custa mais caro mas tem ADAS básico (só alerta de colisão frontal) e rodas de 18\" — confira as duas antes de decidir, o nome não indica qual é 'melhor'. Bateria LFP confirmada no site oficial GAC Brasil.",
    personas: { urbano: 3, familia: 5, aventura: 2, performance: 3, custo: 3 },
  },
  {
    id: "gac-aion-y-elite",
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202503/c9cae70c-c9ca-4488-b909-541e01608a37.jpg",
    name: "GAC Aion Y Elite",
    brand: "GAC",
    category: "SUV compacto",
    price: 187990,
    powerCv: 204,
    torqueNm: 225,
    batteryKwh: 63.2,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 318,
    accel: 8.5,
    groundClearance: 150,
    trunkL: 361,
    weightKg: 1738,
    wallbox: null,
    acKw: 7,
    dcKw: 90,
    airbags: 6,
    warranty: "8 anos/160.000 km veículo, 8 anos/200.000 km bateria (fonte única — recomendo confirmar na concessionária)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.0,
    techNotes:
      "Mesma motorização e bateria da Premium (cadastrada separadamente), mas custa R$ 12.000 a mais — contraintuitivo pro nome 'Elite'. Diferença real: rodas de 18\" (vs. 17\" da Premium) e ADAS bem mais simples (só alerta de colisão frontal, sem os assistentes de condução da Premium). Vale comparar as duas com calma antes de escolher.",
    personas: { urbano: 3, familia: 5, aventura: 2, performance: 3, custo: 2 },
  },
  {
    id: "gac-aion-v",
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202509/1757388789199-%E5%B7%B4%E8%A5%BFv%E5%A4%96%E8%A7%82%E9%A2%9C%E8%89%B2-1.jpg",
    name: "GAC Aion V Elite",
    brand: "GAC",
    category: "SUV médio",
    price: 219990,
    powerCv: 204,
    torqueNm: 240,
    batteryKwh: 75.4,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 389,
    accel: 8.0,
    groundClearance: 150,
    trunkL: 427,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 180,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.4,
    techNotes:
      "Versão única (Elite) no Brasil — confirmado em múltiplas fontes, diferente do Aion Y (que tem Premium e Elite). Bateria LFP confirmada. Recarga ultrarrápida: 30-80% em ~16min a 180kW DC, das mais rápidas do segmento. Peso, vão livre, airbags e garantia ainda sem fonte confiável — não adivinhados aqui.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 3, custo: 2 },
  },
  {
    id: "gac-hyptec-ht",
    imageUrl: "https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202604/1776324386180-1-pc.webp",
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
    imageUrl: "https://www.leapmotor.com.br/content/dam/leapmotor/products/487/tac/2/2027/page/hero-webp/hero-0UB.webp",
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
    groundClearance: 170,
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
    imageUrl: "https://www.leapmotor.com.br/content/dam/leapmotor/products/488/cab/2/2027/page/hero-webp/hero-0YF.webp",
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
    groundClearance: 180,
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
      "Existe também a versão REEV (com extensor de autonomia a combustão), cadastrada separadamente (id leapmotor-c10-reev) por ser um powertrain diferente (fuelType PHEV em vez de BEV).",
    personas: { urbano: 3, familia: 5, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "leapmotor-c10-reev",
    imageUrl: "https://www.leapmotor.com.br/content/dam/leapmotor/products/488/cag/2/2027/page/hero-webp/hero-0GD.webp",
    name: "Leapmotor C10 REEV",
    brand: "Leapmotor",
    category: "SUV médio",
    price: 219990,
    powerCv: 215,
    torqueNm: 320,
    batteryKwh: 28.4,
    batteryChem: "LFP",
    motorType: "REEV — motor elétrico traseiro (RWD) + gerador a combustão 1.5 4cc (não traciona as rodas)",
    rangeKm: 1050,
    accel: null,
    groundClearance: 180,
    trunkL: 465,
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
      "Versão REEV (range extender EV) do C10: motor a combustão 1.5 de 4 cilindros funciona só como gerador pra recarregar a bateria, sem tracionar as rodas diretamente — tração é sempre elétrica traseira. Bateria LFP de 28,4kWh dá ~145km de autonomia elétrica pura (WLTP); com o tanque de 50L cheio, a autonomia combinada chega a 950-1.150km. Recarga DC de 30-80% em 18-30min. Porta-malas assumido igual ao da versão BEV (mesma carroceria, 465L) — não há fonte específica confirmando pra versão REEV.",
    personas: { urbano: 3, familia: 5, aventura: 3, performance: 3, custo: 2 },
  },
  {
    id: "geely-ex5",
    imageUrl: "https://static.autodromo.com.br/uploads/51bca4b0-a28b-455b-9ed2-7647ccc8deec_4.webp",
    name: "Geely EX5 Pro",
    brand: "Geely",
    category: "SUV médio",
    price: 205800,
    powerCv: 218,
    torqueNm: 320,
    batteryKwh: 60.22,
    batteryChem: "LFP (Short Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 413,
    accel: 6.9,
    groundClearance: 173,
    trunkL: 461,
    weightKg: 1715,
    wallbox: null,
    acKw: 11,
    dcKw: 100,
    airbags: 6,
    warranty: "6 anos/150.000 km veículo, 8 anos/150.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 14.6,
    techNotes:
      "Ficha técnica oficial Geely conferida (ago/2026). Versão de entrada da linha EX5 — autonomia de 413km, a maior das duas versões elétricas (a Max, cadastrada separadamente, sacrifica autonomia por mais equipamento). Porta-malas 461L (1.877L com banco rebatido). Airbags: 2 frontais + 2 cortina dianteiros + 2 cortina traseiros (sem laterais de tórax). Existe também a versão híbrida plug-in EX5 EM-i, cadastrada separadamente (id geely-ex5-em-i) por ser outro powertrain (fuelType PHEV em vez de BEV).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 3 },
  },
  {
    id: "geely-ex5-max",
    imageUrl: "https://static.autodromo.com.br/uploads/51bca4b0-a28b-455b-9ed2-7647ccc8deec_4.webp",
    name: "Geely EX5 Max",
    brand: "Geely",
    category: "SUV médio",
    price: 225800,
    powerCv: 218,
    torqueNm: 320,
    batteryKwh: 60.22,
    batteryChem: "LFP (Short Blade)",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 349,
    accel: 7.1,
    groundClearance: 173,
    trunkL: 461,
    weightKg: 1765,
    wallbox: null,
    acKw: 11,
    dcKw: 100,
    airbags: 6,
    warranty: "6 anos/150.000 km veículo, 8 anos/150.000 km bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 17.2,
    techNotes:
      "Ficha técnica oficial Geely conferida (ago/2026). Mesmo motor/bateria da Pro (cadastrada separadamente), mas autonomia menor (349km vs 413km) por causa do peso extra (1.765kg vs 1.715kg) — mais equipamento: teto solar panorâmico, porta-malas elétrico, rodas 19\" (vs 18\" da Pro), bancos com massagem/ventilação, pacote ADAS completo (a Pro não tem ACC, LKA, AEB e outros assistentes — só a Max tem). Porta-malas 461L (1.877L com banco rebatido).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "geely-ex5-em-i",
    imageUrl: "https://static.autodromo.com.br/uploads/51bca4b0-a28b-455b-9ed2-7647ccc8deec_4.webp",
    name: "Geely EX5 EM-i Pro",
    brand: "Geely",
    category: "SUV híbrido",
    price: 189990,
    powerCv: 262,
    torqueNm: 380,
    batteryKwh: 18.4,
    batteryChem: "LFP",
    motorType: "PHEV combinado 'Super Híbrido' (1.5 aspirado + elétrico)",
    rangeKm: 1300,
    accel: 7.8,
    groundClearance: 172,
    trunkL: 428,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: "6 anos/150.000 km veículo, 8 anos/150.000 km bateria (mesmo termo do EX5 elétrico — não confirmado se o PHEV segue exatamente igual)",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "18/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Primeiro veículo da Geely com produção nacional (Complexo Industrial Ayrton Senna, São José dos Pinhais/PR), ainda em 2026. Três versões: Pro (R$189.990, bateria 18,4kWh, ~65km elétricos — ficha usada aqui), Max (R$209.990, mesma bateria) e Ultra (R$234.990, bateria maior de 29,8kWh, ~112km elétricos Inmetro, com carregamento DC de até 60kW — cadastrada separadamente, id geely-ex5-em-i-ultra). Autonomia combinada de até 1.300km. Porta-malas de 428L (até 2.000L com bancos rebatidos).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "geely-ex5-em-i-ultra",
    imageUrl: "https://static.autodromo.com.br/uploads/51bca4b0-a28b-455b-9ed2-7647ccc8deec_4.webp",
    name: "Geely EX5 EM-i Ultra",
    brand: "Geely",
    category: "SUV híbrido",
    price: 234990,
    powerCv: 262,
    torqueNm: 380,
    batteryKwh: 29.8,
    batteryChem: "LFP",
    motorType: "PHEV combinado 'Super Híbrido' (1.5 aspirado + elétrico)",
    rangeKm: 1300,
    accel: 7.8,
    groundClearance: 172,
    trunkL: 428,
    weightKg: null,
    wallbox: "Incluso (versão Ultra)",
    acKw: null,
    dcKw: 60,
    airbags: 6,
    warranty: "6 anos/150.000 km veículo, 8 anos/150.000 km bateria (mesmo termo do EX5 elétrico — não confirmado se o PHEV segue exatamente igual)",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Versão topo de linha do EX5 EM-i (a versão Pro de entrada está cadastrada separadamente, id geely-ex5-em-i): mesma potência/torque (262cv/380Nm), mas bateria bem maior (29,8kWh vs 18,4kWh), quase dobrando a autonomia elétrica (112km vs 65km, Inmetro) e com carregamento DC de até 60kW (30-80% em ~16min, contra recarga só AC/lenta nas versões Pro/Max). Wallbox incluso de fábrica só na Ultra. Mesma autonomia combinada de até 1.300km e porta-malas de 428L do restante da linha.",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "omoda-e5",
    imageUrl: "https://cms.omodajaecoo.com.br/images/vehicles-content/1357281428-168782880-img-desk.jpg",
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
    groundClearance: 180,
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
    id: "omoda-7-shs-p",
    imageUrl: "https://cms.omodajaecoo.com.br/images/omoda7/O7_DESIGN_E_CONFORTO/O7_DeC_1920x1080_EXTERNA.jpg",
    name: "Omoda 7 SHS-P",
    brand: "Omoda",
    category: "SUV híbrido",
    price: 254990,
    powerCv: 279,
    torqueNm: 365,
    batteryKwh: 18.4,
    batteryChem: null,
    motorType: "PHEV combinado (1.5 turbo 99kW + elétrico 150kW/310Nm)",
    rangeKm: 1200,
    accel: 8.4,
    groundClearance: 190,
    trunkL: 590,
    weightKg: 1795,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 8,
    warranty: "8 anos/150.000 km bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV híbrido plug-in irmão do JAECOO 7 PHEV (mesma plataforma Chery Super Hybrid System, specs quase idênticas: 279cv/365Nm, bateria 18,4kWh, ~60km elétricos Inmetro, 1.200km combinados). O 'SHS-P' (Plug-in) distingue do Omoda 5 SHS-H, que é HEV comum sem tomada — por isso não entrou na base. Duas versões: Luxury (R$254.990 — ficha usada aqui) e Prestige (R$279.990).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 4, custo: 1 },
  },
  {
    id: "zeekr-x",
    imageUrl: "https://www.datocms-assets.com/146515/1752768085-mobile-x.png",
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
    groundClearance: 190,
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
    id: "zeekr-001",
    imageUrl: "https://www.datocms-assets.com/146515/1752768085-mobile-001.png",
    name: "Zeekr 001 Premium",
    brand: "Zeekr",
    category: "Sedã grande premium",
    price: 495000,
    powerCv: 544,
    torqueNm: 686,
    batteryKwh: 100,
    batteryChem: "NMC",
    motorType: "Bimotor AWD",
    rangeKm: 426,
    accel: 3.8,
    groundClearance: 174,
    trunkL: 2144,
    weightKg: 2225,
    wallbox: null,
    acKw: 22,
    dcKw: 200,
    airbags: 7,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.5,
    techNotes:
      "'Shooting brake premium' (sedã grande com traseira estilo perua), primeiro modelo da Zeekr no Brasil. Duas versões, Premium (R$495 mil — ficha usada aqui) e Flagship (R$542 mil), com mecânica idêntica (544cv/686Nm, bateria 100kWh NMC) — só vão livre (174mm vs 162mm) e equipamentos mudam. Preço subiu bastante desde o lançamento (R$428 mil). Porta-malas de 2.144L é o volume máximo com bancos rebatidos e frunk incluso. Recarga DC de até 200kW (arquitetura 800V).",
    personas: { urbano: 1, familia: 4, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "zeekr-7x",
    imageUrl: "https://www.datocms-assets.com/146515/1753086881-cx1e_eu_f3q_20_longrange_rwd_black-2.png",
    name: "Zeekr 7X",
    brand: "Zeekr",
    category: "SUV médio premium",
    price: 448000,
    powerCv: 646,
    torqueNm: 710,
    batteryKwh: 100,
    batteryChem: null,
    motorType: "Bimotor AWD (224cv dianteiro + 422cv traseiro)",
    rangeKm: 423,
    accel: null,
    groundClearance: 172,
    trunkL: 539,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 200,
    airbags: 7,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.6,
    techNotes:
      "SUV elétrico mais potente da linha Zeekr no Brasil (646cv/710Nm combinados, bimotor AWD). Bateria de 100kWh dá 423km Inmetro. Recarga DC de até 200kW (80% em ~30min). Porta-malas de 539L.",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "neta-x-400",
    imageUrl: "https://netaauto.com.br/wp-content/webp-express/webp-images/uploads/2025/06/NETA-X-8.jpg.webp",
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
    groundClearance: 135,
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
    imageUrl: "https://netaauto.com.br/wp-content/webp-express/webp-images/uploads/2025/06/NETA-X-8.jpg.webp",
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
    groundClearance: 135,
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
  {
    id: "neta-gt",
    imageUrl: "https://netaauto.com.br/wp-content/webp-express/webp-images/uploads/2024/08/06_NetaGT_Azul_Estrada_Frente.png.webp",
    name: "Neta GT",
    brand: "Neta",
    category: "Cupê esportivo elétrico",
    price: null,
    powerCv: 394,
    torqueNm: 620,
    batteryKwh: 74.48,
    batteryChem: null,
    motorType: "Bimotor AWD (um em cada eixo, 145kW cada)",
    rangeKm: 410,
    accel: 3.7,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: false,
    priceVerifiedDate: null,
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 18.2,
    techNotes:
      "Cupê esportivo 2+2 elétrico da Neta, revelado no Festival Interlagos (ago/2024) e comercializado desde set/2024 por concessionárias oficiais (netaauto.com.br, netaautopotenza.com.br), mas sem preço oficial divulgado publicamente até hoje (mesmo passados quase 2 anos do lançamento) — deixado como null. Bimotor AWD com 394cv/620Nm combinados, bateria de 74,48kWh, acelera 0-100km/h em 3,7s. Baterias CATL, como o resto da linha Neta.",
    personas: { urbano: 2, familia: 2, aventura: 1, performance: 5, custo: 3 },
  },
  {
    id: "volvo-ex90",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/blt0feaa88e629251fc/blt88ae6c8936a0e087/68089476b435297d2888d1ae/overview-exterior-gallery-16x9.jpg?branch=prod_alias&quality=85&format=auto&h=1200&w=1800",
    name: "Volvo EX90",
    brand: "Volvo",
    category: "SUV grande premium",
    price: 849990,
    powerCv: 517,
    torqueNm: 860,
    batteryKwh: 111,
    batteryChem: null,
    motorType: "Bimotor AWD",
    rangeKm: 459,
    accel: 4.9,
    groundClearance: 216,
    trunkL: 310,
    weightKg: 2757,
    wallbox: null,
    acKw: null,
    dcKw: 350,
    airbags: 9,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 24.2,
    techNotes:
      "SUV elétrico grande e mais caro da Volvo, com 7 lugares — o primeiro totalmente elétrico da marca nessa configuração. Lançado no Brasil em abr/2025 por R$849.950; linha 2026 ganhou arquitetura 800V, permitindo recarga DC de até 350kW (10-80% em ~30min, adicionando até 250km em 10min). Bimotor AWD com 517cv/860Nm. Tem Lidar de série e 9 airbags. Porta-malas varia de 310L (7 lugares) a 654L (5 lugares).",
    personas: { urbano: 1, familia: 5, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "volvo-xc60-recharge-t8",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/bltab26d231d43e6180/blted43c61a243553ba/67d020e6fabac283d0083243/xc60-phev-my25.png?branch=prod_alias&quality=85&format=auto&h=1080&w=1920",
    name: "Volvo XC60 Recharge T8",
    brand: "Volvo",
    category: "SUV híbrido premium",
    price: 459950,
    powerCv: 462,
    torqueNm: 696,
    batteryKwh: 18.8,
    batteryChem: null,
    motorType: "PHEV combinado AWD (2.0 turbo 320cv + elétrico 87cv)",
    rangeKm: null,
    accel: 4.8,
    groundClearance: 216,
    trunkL: 468,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 8,
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
      "SUV médio híbrido plug-in, líder de vendas entre híbridos da Volvo no Brasil (3.287 unidades em 2024). Quatro versões — Plus (R$459.950, ficha usada aqui), Ultra (~R$509.950), Ultra Dark (R$519.950) e Polestar Engineered (R$539.950) — compartilham a mesma mecânica T8 (462cv/696Nm combinados), só equipamento muda. Bateria de 18,8kWh dá até 44km de autonomia elétrica (Inmetro) ou 80km (WLTP).",
    personas: { urbano: 3, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "volvo-xc90-recharge-t8",
    imageUrl: "https://www.volvocars.com/images/cs/v3/assets/bltab26d231d43e6180/blt13250d579061ab3e/67d154a186708c44edcaedf4/xc90-phev-my24.png?branch=prod_alias&quality=85&format=auto&h=1080&w=1920",
    name: "Volvo XC90 Recharge T8",
    brand: "Volvo",
    category: "SUV grande híbrido premium",
    price: 679950,
    powerCv: 462,
    torqueNm: 709,
    batteryKwh: 18.8,
    batteryChem: null,
    motorType: "PHEV combinado AWD (2.0 turbo 317cv + elétrico traseiro 145cv)",
    rangeKm: null,
    accel: null,
    groundClearance: 223,
    trunkL: 316,
    weightKg: null,
    wallbox: null,
    acKw: 7,
    dcKw: null,
    airbags: null,
    warranty: "2 anos (termo de garantia da bateria não confirmado — costuma ser 8 anos/160.000km em outros modelos Volvo com T8)",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "17/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV grande híbrido plug-in de 7 lugares, ainda em linha no Brasil mesmo após o lançamento do EX90 (100% elétrico) — não foi substituído, coexistem no catálogo. Versão Plus, mesma mecânica T8 (462cv/709Nm) do XC60. Bateria de 18,8kWh dá 47km de autonomia elétrica. Porta-malas de 316L com as 3 fileiras em uso (500L com a 3ª rebatida). Vão livre de 223mm.",
    personas: { urbano: 2, familia: 5, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "ford-mustang-mach-e",
    imageUrl: "https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/2026/mustang-mach-e/gt-performance/billboard/fbr-mustang-mach-gt-billboard.jpg",
    name: "Ford Mustang Mach-E GT Performance",
    brand: "Ford",
    category: "SUV médio premium",
    price: 449000,
    powerCv: 487,
    torqueNm: 860,
    batteryKwh: 91,
    batteryChem: "NMC",
    motorType: "Bimotor e-AWD (tração integral)",
    rangeKm: 379,
    accel: 3.7,
    groundClearance: null,
    trunkL: 402,
    weightKg: 2307,
    wallbox: "Incluso (Ford Mobile Wall Box portátil, 32A)",
    acKw: 11,
    dcKw: 150,
    airbags: 9,
    warranty: "8 anos ou 100.000 km bateria de alta voltagem (ficha técnica oficial); imprensa cita garantia de veículo de 3 anos + propulsão 8 anos/160.000 km, termo exato não confirmado em fonte única",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: "Gratuita (3 anos, sem limite de km — fonte: imprensa, não confirmado no site oficial)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 24.0,
    techNotes:
      "Única marca tradicional grande (não chinesa) além da BMW/Volvo/Chevrolet a vender elétrico oficialmente no Brasil hoje, via CAOA Ford (rede própria de concessionárias). Vendido em versão única, GT Performance (487cv/860Nm, bimotor e-AWD), a R$449.000 — preço reduzido em R$37 mil no início de 2026 (era ~R$486.000) por causa do baixo giro. Ficha técnica oficial do site Ford Brasil mostra dois valores de autonomia na mesma página: 379km (citado no texto, condizente com o padrão INMETRO/PBEV usado nos demais carros desta base) e 541km na tabela de specs (provavelmente WLTP) — usamos o menor por consistência com o resto da base. Consumo de 24,0 kWh/100km calculado a partir de bateria (91kWh) e autonomia oficiais (379km), não é valor direto de fonte. Porta-malas de 402L traseiro + frunk dianteiro de 139L (~541L total). Ford Territory PHEV (chinês, rebatizado, ~218cv) e Ranger PHEV ainda não têm venda oficial confirmada no Brasil — previstas para fim de 2026/2027, por isso não entraram na base.",
    personas: { urbano: 3, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "audi-q6-e-tron",
    imageUrl: "https://audi-media-center-strapi.s3.us-east-1.amazonaws.com/Q6_e_tron_2026_973c282b90.jpg",
    name: "Audi Q6 e-tron S Line",
    brand: "Audi",
    category: "SUV médio premium",
    price: 695990,
    powerCv: 428,
    torqueNm: 640,
    batteryKwh: 100,
    batteryChem: null,
    motorType: "Bimotor quattro AWD (800V)",
    rangeKm: 424,
    accel: 5.1,
    groundClearance: 184,
    trunkL: 526,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 270,
    airbags: 9,
    warranty: "4 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.6,
    techNotes:
      "Lançado oficialmente pela Audi do Brasil em 2026 (linha 2026), vendido em mais de 40 concessionárias da marca no país. Arquitetura 800V permite recarga DC de até 270kW (10-80% em ~20min). Autonomia de 424km é o valor INMETRO oficial. Porta-malas de 526L + frunk dianteiro de 64L (1.529L com bancos rebatidos). Substituiu a configuração anterior 'Performance Black' pela S Line. Também existe a versão Sportback (cadastrada separadamente, id audi-q6-sportback-e-tron) e a SQ6 Sportback de alta performance (id audi-sq6-sportback-e-tron). Peso e química da bateria não confirmados em fonte oficial brasileira.",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "audi-q6-sportback-e-tron",
    imageUrl: "https://audi-media-center-strapi.s3.us-east-1.amazonaws.com/medium_Q6_Sportback_e_tron_1_3_66f4790eda.jpg",
    name: "Audi Q6 Sportback e-tron S Line",
    brand: "Audi",
    category: "SUV médio premium",
    price: 710990,
    powerCv: 428,
    torqueNm: 640,
    batteryKwh: 100,
    batteryChem: null,
    motorType: "Bimotor quattro AWD (800V)",
    rangeKm: 431,
    accel: 5.1,
    groundClearance: 184,
    trunkL: 511,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 270,
    airbags: 9,
    warranty: "4 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.2,
    techNotes:
      "Versão de teto em coupé (Sportback) do Q6 e-tron (cadastrado separadamente, id audi-q6-e-tron), mesma mecânica (428cv/640Nm, bateria 100kWh) — a diferença é a carroceria mais baixa e o porta-malas ligeiramente menor (511L vs 526L, mas autonomia um pouco maior: 431km vs 424km, por aerodinâmica). Lançado junto com o Q6 e-tron na linha 2026 da Audi do Brasil, disponível em mais de 40 concessionárias.",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "audi-sq6-sportback-e-tron",
    imageUrl: "https://audi-media-center-strapi.s3.us-east-1.amazonaws.com/SQ_6_Sportback_e_tron_1_f4f4995d01.jpg",
    name: "Audi SQ6 Sportback e-tron",
    brand: "Audi",
    category: "SUV médio premium",
    price: 790990,
    powerCv: 517,
    torqueNm: 795,
    batteryKwh: 100,
    batteryChem: null,
    motorType: "Bimotor quattro AWD (800V) — 194cv dianteiro + 320cv traseiro",
    rangeKm: 428,
    accel: 4.3,
    groundClearance: 184,
    trunkL: 499,
    weightKg: null,
    wallbox: null,
    acKw: 11,
    dcKw: 270,
    airbags: 9,
    warranty: "4 anos veículo / 8 anos bateria (assumido igual ao Q6 e-tron — não confirmado especificamente para a SQ6)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.4,
    techNotes:
      "Versão esportiva de alta performance do Q6 Sportback e-tron, com dois motores (194cv/28kgfm dianteiro + 320cv/59,1kgfm traseiro, 517cv/795Nm combinados em modo Launch Control). 0-100 em 4,3s, velocidade máxima 230km/h eletronicamente limitada. Mesma bateria de 100kWh e arquitetura 800V do Q6 e-tron (recarga DC 10-80% em ~20min). Lançada pela Audi do Brasil em 2026.",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "land-rover-range-rover-p550e",
    imageUrl: "https://ci2.cdn-jaguarlandrover.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6Njg5MjQwMiwicHVyIjoiYmxvYl9pZCJ9fQ==--b4c34409aa5e8131bf18b9689514a90c0a62805f/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwicmVzaXplX2FuZF9wYWQiOls0MjAsMjM2LHsiYmFja2dyb3VuZCI6WzIzOCwyMzgsMjM4LDIzOF0sImFscGhhIjp0cnVlfV0sInNhdmVyIjp7InF1YWxpdHkiOjg1fX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--b5b0ad9cbad032e81179066a84b86cdd6b2f0240/redirect_eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBOU9vQmc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--15f0bd2672d32648dfa17936c92a5bfd1f9f5d13_exterior-0.jpeg",
    name: "Land Rover Range Rover P550e Autobiography",
    brand: "Land Rover",
    category: "SUV grande híbrido premium",
    price: 1709650,
    powerCv: 550,
    torqueNm: 800,
    batteryKwh: 38.2,
    batteryChem: null,
    motorType: "PHEV combinado AWD (I6 3.0 turbo Ingenium 400cv + motor elétrico 218cv)",
    rangeKm: null,
    accel: null,
    groundClearance: 219,
    trunkL: 1050,
    weightKg: 2810,
    wallbox: null,
    acKw: 7,
    dcKw: 50,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço e disponibilidade confirmados em estoque real de concessionárias oficiais Land Rover (rede JLR Brasil) em ago/2026 — preço varia por concessionária, R$1.709.650 a R$1.716.150 encontrados. Autonomia 100% elétrica declarada de até 71km (mesmo conjunto P550e do Range Rover Sport, cadastrado separadamente, id land-rover-range-rover-sport-p550e). Recarga AC de 7kW (~5h) ou DC de até 50kW (0-80% em ~40min). Vale notar que a Land Rover Brasil passou por forte disrupção de produção após um ciberataque à JLR em 2025 — o Defender P400e (mesmo motor do Velar) não aparece no estoque oficial atual, por isso não foi incluído nesta base.",
    personas: { urbano: 2, familia: 5, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "land-rover-range-rover-sport-p550e",
    imageUrl: "https://ci2.cdn-jaguarlandrover.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6Njg5MjIyNywicHVyIjoiYmxvYl9pZCJ9fQ==--842ba91851ccd4dd50d7225996921578f23569a0/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwicmVzaXplX2FuZF9wYWQiOls0MjAsMjM2LHsiYmFja2dyb3VuZCI6WzIzOCwyMzgsMjM4LDIzOF0sImFscGhhIjp0cnVlfV0sInNhdmVyIjp7InF1YWxpdHkiOjg1fX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--b5b0ad9cbad032e81179066a84b86cdd6b2f0240/redirect_eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBeitvQmc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--01a39354163587f3b7f347cb251022520434b174_exterior-0.jpeg",
    name: "Land Rover Range Rover Sport P550e Autobiography",
    brand: "Land Rover",
    category: "SUV híbrido premium",
    price: 1274450,
    powerCv: 550,
    torqueNm: 800,
    batteryKwh: 38.2,
    batteryChem: null,
    motorType: "PHEV combinado AWD (I6 3.0 turbo Ingenium 400cv + motor elétrico 218cv)",
    rangeKm: null,
    accel: 4.9,
    groundClearance: 216,
    trunkL: 522,
    weightKg: null,
    wallbox: null,
    acKw: 7,
    dcKw: 50,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço confirmado em estoque real de concessionária oficial Land Rover (JLR Brazil, Itatiaia/RJ) em ago/2026, ano-modelo 2025. Autonomia elétrica declarada de até 71km, recarga AC 7kW (~5h) ou DC até 50kW (0-80% em ~40min). Existe também uma versão 'Dynamic' mais recente (pré-venda aberta em ago/2026, R$1.063.950, ainda sem confirmação de entrega) que não foi incluída por não ter venda efetiva confirmada ainda. Porta-malas de 522L é o valor do ano-modelo 2025 (algumas fontes citam 835L para o ano-modelo 2026, não confirmado).",
    personas: { urbano: 2, familia: 4, aventura: 3, performance: 5, custo: 1 },
  },
  {
    id: "land-rover-range-rover-velar-p400e",
    imageUrl: "https://ci2.cdn-jaguarlandrover.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6Njg5MjkxOCwicHVyIjoiYmxvYl9pZCJ9fQ==--54e48386cea50d2979eba8b2cc821b8792b8f45b/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwicmVzaXplX2FuZF9wYWQiOls0MjAsMjM2LHsiYmFja2dyb3VuZCI6WzIzOCwyMzgsMjM4LDIzOF0sImFscGhhIjp0cnVlfV0sInNhdmVyIjp7InF1YWxpdHkiOjg1fX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--b5b0ad9cbad032e81179066a84b86cdd6b2f0240/redirect_eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNk9xQmc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--12dc830b198b4ccef3c752d4277f4fdd27fd6fd7_exterior-0.jpeg",
    name: "Land Rover Range Rover Velar P400e",
    brand: "Land Rover",
    category: "SUV médio híbrido premium",
    price: 733786,
    powerCv: 404,
    torqueNm: 640,
    batteryKwh: 19.2,
    batteryChem: null,
    motorType: "PHEV combinado AWD (I4 2.0 turbo Ingenium 300cv + motor elétrico 104cv)",
    rangeKm: null,
    accel: 5.4,
    groundClearance: 213,
    trunkL: 625,
    weightKg: 2260,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: null,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Preço e disponibilidade confirmados em estoque real de concessionárias oficiais Land Rover (rede JLR Brasil) em ago/2026, trims Autobiography (R$774.469-777.969) e Dynamic HSE (R$733.786-741.286, usado aqui por ser o mais barato). Autonomia elétrica declarada varia entre 38km e 51km conforme a fonte (não há valor único confiável). Mesmo motor híbrido P400e do Defender, que não aparece no estoque oficial atual (zero unidades) por conta da disrupção de produção da JLR após o ciberataque de 2025 — por isso o Defender P400e não foi incluído nesta base apesar de ter ficha técnica divulgada.",
    personas: { urbano: 3, familia: 3, aventura: 3, performance: 4, custo: 2 },
  },
  {
    id: "bmw-330e",
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g20_phev_stage-50-years:16to7?fmt=webp&wid=2560&fit=wrap%2C+1",
    name: "BMW 330e M Sport",
    brand: "BMW",
    category: "Sedã médio híbrido",
    price: 465950,
    powerCv: 292,
    torqueNm: 420,
    batteryKwh: 19.5,
    batteryChem: null,
    motorType: "PHEV combinado (motor a combustão + elétrico)",
    rangeKm: null,
    accel: 5.8,
    groundClearance: 141,
    trunkL: 375,
    weightKg: 1740,
    wallbox: null,
    acKw: 11,
    dcKw: null,
    airbags: null,
    warranty: "6 anos",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Marca já tinha o 530e (Série 5) e o X5 xDrive50e cadastrados — o 330e M Sport (Série 3) é uma versão de entrada da linha PHEV da BMW no Brasil que ainda não tinha card próprio. 292cv/420Nm combinados, bateria 19,5kWh, autonomia elétrica de 61km, 0-100 em 5,8s. Recarga AC de até 11kW. Confirmado à venda via press release oficial BMW Group Brasil (press.bmwgroup.com).",
    personas: { urbano: 3, familia: 3, aventura: 1, performance: 4, custo: 2 },
  },
  {
    id: "bmw-i4-m50",
    imageUrl: "https://bmw.scene7.com/is/image/BMW/g26_bev_mp_stage_dsk_fb-1?qlt=80&wid=1024&fmt=webp",
    name: "BMW i4 M50 xDrive",
    brand: "BMW",
    category: "Sedã médio premium",
    price: 675950,
    powerCv: 544,
    torqueNm: 795,
    batteryKwh: 81.3,
    batteryChem: null,
    motorType: "Bimotor xDrive AWD",
    rangeKm: 405,
    accel: 3.9,
    groundClearance: 125,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 200,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: "Gratuita (programa BMW Service Inclusive, 4 anos, km ilimitado)",
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.1,
    techNotes:
      "Versão topo de linha e xDrive AWD do i4 (a versão eDrive40 de entrada já está cadastrada separadamente, id bmw-i4), com bimotor entregando 544cv/795Nm (vs 340cv da eDrive40 RWD) e 0-100 em 3,9s, mesmo tempo do BMW M3. Bateria de 81,3kWh, recarga DC ultrarrápida de até 200kW (0-80% em ~30min). Consumo de 20,1 kWh/100km calculado a partir de bateria/autonomia oficiais. Todos os BMW i4 chegam ao Brasil com o programa BMW Service Inclusive gratuito por 4 anos sem limite de km.",
    personas: { urbano: 2, familia: 2, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "porsche-taycan",
    imageUrl: "https://images.porsche.com/f/285489813253582/3435x976/760c082f65/series-taycan-models-model-variant-image.png/m/3435x976/smart/filters:format(avif)",
    name: "Porsche Taycan",
    brand: "Porsche",
    category: "Sedã grande premium",
    price: 893115,
    powerCv: 408,
    torqueNm: 410,
    batteryKwh: 89,
    batteryChem: null,
    motorType: "PMSM traseiro RWD (arquitetura 800V)",
    rangeKm: 453,
    accel: null,
    groundClearance: 127,
    trunkL: 491,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 320,
    airbags: null,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 19.6,
    techNotes:
      "Nova geração do Taycan desembarcou no Brasil (MY25/2026) com autonomia já no padrão INMETRO. Vendida em 10 versões (base, 4, 4S, GTS, Turbo, Turbo S, Turbo GT Weissach e a Cross Turismo Turbo), de R$893.115 a R$1.488.978 — cadastramos só a versão de entrada (RWD, 408cv/410Nm, bateria 89kWh, 453km) por ser a única com ficha técnica completa e confiável encontrada; as demais têm preço confirmado mas specs incompletas nas fontes consultadas. Recarga DC de até 320kW em arquitetura 800V. Consumo de 19,6 kWh/100km calculado a partir de bateria/autonomia oficiais. Peso, aceleração 0-100 e garantia da versão base não confirmados em fonte específica para o Brasil.",
    personas: { urbano: 2, familia: 2, aventura: 1, performance: 5, custo: 1 },
  },
  {
    id: "porsche-macan-electric",
    imageUrl: "https://images.porsche.com/f/285489813253582/3493x1123/73bd651635/series-macan-electric-models-model-variant-image.png/m/3493x1123/smart/filters:format(avif)",
    name: "Porsche Macan Electric",
    brand: "Porsche",
    category: "SUV médio premium",
    price: 560000,
    powerCv: 360,
    torqueNm: 574,
    batteryKwh: 100,
    batteryChem: null,
    motorType: "PMSM traseiro RWD (arquitetura 800V) — 340cv contínuo, 360cv em overboost",
    rangeKm: 443,
    accel: 5.7,
    groundClearance: 180,
    trunkL: 540,
    weightKg: null,
    wallbox: null,
    acKw: 22,
    dcKw: 270,
    airbags: null,
    warranty: "4 anos veículo / 8 anos bateria",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 22.6,
    techNotes:
      "Comercializado no Brasil desde novembro/2024, versão de entrada RWD (base 'Macan Electric') da linha 100% elétrica. Bateria de 100kWh (95kWh úteis), arquitetura 800V com DC de até 270kW (10-80% em ~21min). Também existem as versões 4 Electric (R$580mil, 408cv overboost), 4S Electric (R$630mil, 516cv, 0-100 em 4,1s) e Turbo Electric (R$770mil, 639cv, 0-100 em 3,3s) — mesma bateria/porta-malas/garantia, mudando motor e tração (AWD nas versões 4/4S/Turbo); não cadastradas individualmente por já estarem bem representadas pela entrada e por não termos certeza sobre qual delas seguiu efetivamente à venda vs. só pré-venda da GTS (lançada em 2026, R$800mil, ainda não confirmada como entregue).",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "lexus-nx-450h-plus",
    imageUrl: "https://www.lexus.com.br/content/dam/lexus-v3-blueprint/models/suv/nx/nx-350h/my22/og-image/lexus-nx-350h-og.jpg",
    name: "Lexus NX 450h+",
    brand: "Lexus",
    category: "SUV compacto premium",
    price: 457900,
    powerCv: 308,
    torqueNm: null,
    batteryKwh: 18.1,
    batteryChem: null,
    motorType: "PHEV combinado AWD (2.5 aspirado 187cv + elétrico dianteiro 182cv + elétrico traseiro 54cv)",
    rangeKm: null,
    accel: 6.3,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: "Incluso, sem custo (carregador portátil + wallbox WEG)",
    acKw: null,
    dcKw: null,
    airbags: 7,
    warranty: "10 anos ou 200.000 km (programa LexusCare, sujeito a revisões na rede)",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Primeiro híbrido plug-in da Lexus no Brasil. Sistema com 3 motores (1 a combustão + 2 elétricos, um por eixo) somando 308cv. Autonomia 100% elétrica de até 55km (Inmetro). Recarga completa em ~2h45 com wallbox WEG incluso sem custo. Garantia de 10 anos/200.000km é do programa LexusCare (sujeita a revisões periódicas na rede autorizada, não é incondicional). Irmã maior é o RX 450h+ (cadastrado separadamente, id lexus-rx-450h-plus), com a mesma mecânica.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 4, custo: 2 },
  },
  {
    id: "lexus-rx-450h-plus",
    imageUrl: "https://www.lexus.com.br/content/dam/lexus-v3-blueprint/models/suv/rx/rx-450h-plus/my23/og/OG-new.jpg",
    name: "Lexus RX 450h+",
    brand: "Lexus",
    category: "SUV médio premium",
    price: 609990,
    powerCv: 308,
    torqueNm: null,
    batteryKwh: 18.1,
    batteryChem: null,
    motorType: "PHEV combinado AWD (2.5 aspirado 187cv + elétrico dianteiro 182cv + elétrico traseiro 54cv)",
    rangeKm: null,
    accel: 6.5,
    groundClearance: null,
    trunkL: 461,
    weightKg: 2780,
    wallbox: "Incluso, sem custo (carregador portátil + wallbox WEG, mesmo programa do NX 450h+)",
    acKw: 6.6,
    dcKw: null,
    airbags: null,
    warranty: "10 anos ou 200.000 km (programa LexusCare, sujeito a revisões na rede — não confirmado especificamente para este modelo, extrapolado do NX 450h+)",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Primeiro híbrido plug-in da linha RX no Brasil, mesma mecânica do NX 450h+ (cadastrado separadamente, id lexus-nx-450h-plus): 308cv combinados (2.5 aspirado + 2 motores elétricos), bateria 18,1kWh, autonomia elétrica de 56km (Inmetro). Recarga AC de 6,6kW (completa em ~2h45). Peso elevado (2.780kg) reflete o porte maior da carroceria SUV médio.",
    personas: { urbano: 2, familia: 5, aventura: 2, performance: 4, custo: 1 },
  },
  {
    id: "lexus-rz-500e",
    imageUrl: "https://www.lexus.com.br/content/dam/lexus-v3-blueprint/models/suv/rz/rz-450e-luxury/my23/overview/rz-450e-luxury-og.jpg",
    name: "Lexus RZ 500e",
    brand: "Lexus",
    category: "SUV médio premium",
    price: 499990,
    powerCv: 381,
    torqueNm: null,
    batteryKwh: 77,
    batteryChem: null,
    motorType: "Bimotor AWD DIRECT4 (eAxle dianteiro + traseiro, 264Nm por eixo)",
    rangeKm: 375,
    accel: 4.6,
    groundClearance: null,
    trunkL: null,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: 150,
    airbags: 8,
    warranty: "Até 10 anos ou 200.000 km (programa LexusCare, sujeito a revisões na rede)",
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 20.5,
    techNotes:
      "Primeiro elétrico 100% da Lexus no Brasil, entregas iniciadas em maio/2026 (o modelo global se chama RZ 450e, mas a versão vendida no Brasil é nomeada RZ 500e). Bateria de 77kWh com resfriamento líquido. Autonomia de 375km é o valor citado como 'Inmetro' pela imprensa (uma fonte cita até 600km em ciclo urbano WLTP europeu, bem mais otimista — não usado aqui). Tração integral DIRECT4 com motor em cada eixo (264Nm cada, torque total do sistema não divulgado). Recarga DC até 150kW (0-80% em ~30min). Financiamento com taxa a partir de 0% e recompra garantida de 80% da tabela FIPE fazem parte do programa de lançamento.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 4, custo: 2 },
  },
  {
    id: "mitsubishi-outlander-phev",
    imageUrl: "https://cdn.autopapo.com.br/box/uploads/2025/05/13185752/mitsubishi-outlander-phev-signature-branco-diamond-frente-em-movimento.jpg",
    name: "Mitsubishi Outlander PHEV HPE-S",
    brand: "Mitsubishi",
    category: "SUV médio híbrido",
    price: 374990,
    powerCv: 252,
    torqueNm: 450,
    batteryKwh: 20,
    batteryChem: null,
    motorType: "PHEV combinado Twin Motor 4WD (2.4 Atkinson dianteiro + motor elétrico em cada eixo)",
    rangeKm: null,
    accel: 7.9,
    groundClearance: null,
    trunkL: 284,
    weightKg: null,
    wallbox: "Não incluso (carregador portátil 3,5kW de série)",
    acKw: 3.5,
    dcKw: null,
    airbags: 11,
    warranty: "5 anos veículo / 8 anos bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Nova geração (4ª geração) do Outlander no Brasil vendida só como PHEV (não há mais versão a combustão pura). 7 lugares, tração integral elétrica Twin Motor 4WD (um motor elétrico em cada eixo + motor 2.4 ciclo Atkinson). Autonomia 100% elétrica de 58km (Inmetro) e autonomia combinada de até 680km. Porta-malas de apenas 284L com os 7 lugares em uso (637L com a 3ª fileira rebatida, 1.448L só com os dianteiros). Recarga só em AC 3,5kW via carregador portátil (~6h30 para carga completa) — não há confirmação de recarga DC rápida. Existe também a versão Signature (R$389.990, mesma mecânica, mais equipamentos) não cadastrada separadamente por não ter diferença de potência/bateria.",
    personas: { urbano: 2, familia: 5, aventura: 3, performance: 3, custo: 3 },
  },
  {
    id: "denza-b5",
    imageUrl: "https://grandbrasil.com.br/wp-content/uploads/2026/01/10.webp",
    name: "Denza B5",
    brand: "Denza",
    category: "SUV off-road híbrido premium",
    price: 436000,
    powerCv: 677,
    torqueNm: 775,
    batteryKwh: 31.8,
    batteryChem: "LFP (Blade)",
    motorType: "PHEV combinado tração integral (motor a combustão + elétrico, plataforma DMO Dual Mode Off-road)",
    rangeKm: null,
    accel: 4.8,
    groundClearance: null,
    trunkL: 470,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 11,
    warranty: null,
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Denza é a marca premium da BYD — chegou ao Brasil oficialmente em 10/12/2025 com concessionária própria em São Paulo (Grand Brasil Alphaville). B5 é um SUV off-road híbrido plug-in com bateria Blade LFP de 31,8kWh, autonomia elétrica de até 57km e autonomia total combinada de até 1.200km. Estrutura reforçada (resiste a 12 toneladas estáticas sobre o teto), suspensão hidráulica ativa DiSus-P com 16 modos de condução, 3 bloqueios de diferencial eletrônicos. Peso citado como 'mais de 3.000kg' em fonte agregadora, sem valor exato confirmado. Outros modelos da marca (Z9GT, Z, D9) ainda estão 'em breve' no site oficial — não incluídos por não terem venda confirmada.",
    personas: { urbano: 1, familia: 4, aventura: 5, performance: 5, custo: 2 },
  },
  {
    id: "avatr-11",
    imageUrl: "https://cloudfront.alpes.one/public/691/ca8/b5e/691ca8b5e530a310850666.webp",
    name: "Avatr 11",
    brand: "Avatr",
    category: "SUV médio premium",
    price: 599990,
    powerCv: 578,
    torqueNm: 663,
    batteryKwh: 116,
    batteryChem: null,
    motorType: "Bimotor AWD (265cv dianteiro + 313cv traseiro)",
    rangeKm: 497,
    accel: 3.9,
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
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: 23.3,
    techNotes:
      "Avatr é a marca de luxo elétrico da Changan, joint venture com a Huawei e a CATL — vendida no Brasil pela CAOA Changan (rede própria, estreou no Salão de SP em nov/2025, já com mais de 20 unidades vendidas). Preço varia pela configuração de bancos: R$599.990 (5 lugares) ou R$619.900 (4 lugares, banco traseiro individual reclinável). Autonomia oficial Inmetro de 497km (710km WLTP). Sistema de condução assistida QianKun (Huawei ADS) com 3 radares a laser. Consumo de 23,3 kWh/100km calculado a partir de bateria/autonomia oficiais. Torque combinado (663Nm) e porta-malas (470L) vêm de fonte agregadora, não confirmados diretamente no site oficial da marca no Brasil, que não divulga esses dois valores.",
    personas: { urbano: 2, familia: 3, aventura: 2, performance: 5, custo: 1 },
  },
  {
    id: "jeep-grand-cherokee-4xe",
    imageUrl: "https://cdn.autopapo.com.br/box/uploads/2023/10/08220058/jeep-grand-cherokee-4xe-2023-branco-frente-lateral-traseira-7.jpg",
    name: "Jeep Grand Cherokee 4xe",
    brand: "Jeep",
    category: "SUV grande híbrido premium",
    price: 569990,
    powerCv: 380,
    torqueNm: 637,
    batteryKwh: 17.4,
    batteryChem: null,
    motorType: "PHEV combinado 4x4 (2.0 turbo 272cv + motor elétrico PF1 33kW + motor elétrico P2 100kW)",
    rangeKm: null,
    accel: null,
    groundClearance: null,
    trunkL: 580,
    weightKg: 2466,
    wallbox: null,
    acKw: 7.2,
    dcKw: null,
    airbags: 8,
    warranty: "3 anos veículo sem limite de km / 5 anos ou 100.000 km bateria",
    fuelType: "PHEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "Marca inteiramente ausente da base anterior. Grand Cherokee 4xe retornou ao Brasil em 2026 (primeiras 150 unidades importadas dos EUA já entregues às concessionárias), potência/torque combinados oficiais (documento técnico Stellantis): 380cv/637Nm. Autonomia elétrica de 29km (Inmetro) — bem abaixo dos 50km divulgados em outros mercados. Só recarrega em AC (até 7,2kW via wallbox tipo 2, ~2h30 para carga completa); não tem porta de recarga DC. Consumo combinado de 19,3 km/l (Inmetro). ATENÇÃO: o Jeep Compass 4xe (outro PHEV da marca) foi pesquisado mas NÃO foi incluído — saiu do site oficial da Jeep Brasil em fev/2026 e é considerado descontinuado (vendeu só ~100 unidades em 2025); a nova geração do Compass (com PHEV) só chega em 2027.",
    personas: { urbano: 1, familia: 5, aventura: 3, performance: 4, custo: 1 },
  },
  {
    id: "jac-e-js4",
    imageUrl: "https://www.jacmotors.com.br/wp-content/uploads/2025/11/Photo-6-min-1024x597.png",
    name: "JAC E-JS4",
    brand: "JAC",
    category: "SUV médio",
    price: 254900,
    powerCv: 200,
    torqueNm: 340,
    batteryKwh: 55,
    batteryChem: "LFP",
    motorType: "PMSM dianteiro (FWD)",
    rangeKm: 307,
    accel: 7.5,
    groundClearance: null,
    trunkL: 650,
    weightKg: null,
    wallbox: null,
    acKw: null,
    dcKw: null,
    airbags: 6,
    warranty: null,
    fuelType: "BEV",
    verified: true,
    priceVerifiedDate: "19/08/2026",
    maintenanceInterval: null,
    maintenanceFirstCost: null,
    maintenanceKmBase: null,
    maintenanceTotalCost: null,
    consumptionKwh100: null,
    techNotes:
      "SUV elétrico médio-grande da JAC, posicionado acima do E-JS1 (cadastrado separadamente, id jac-e-js1) na linha da marca no Brasil. Dados oficiais do site JAC Motors: 200cv/340Nm, bateria 55kWh, autonomia 307km (Inmetro), 0-100 em 7,5s. Porta-malas de 650L (1.210L com bancos rebatidos). Recarga AC portátil (20-100% em 7h20) e DC rápida (20-100% em 1h10) — potências em kW não divulgadas. Existe uma referência antiga a um modelo 'JAC iEV40/EV40' em fontes agregadoras, mas ele não consta no site oficial atual da JAC Brasil (só E-JS1 e E-JS4 entre os elétricos de passeio) — parece ser um modelo antigo (2020/2021) já descontinuado, por isso não foi incluído.",
    personas: { urbano: 3, familia: 4, aventura: 2, performance: 3, custo: 3 },
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
        // Catálogo vem do Supabase (visto por todo mundo, atualizado sem rebuild do
        // site). O código (SEED_CARS) continua sendo onde os dados são corrigidos —
        // supabase/seed-cars.sql é gerado a partir daqui e sincroniza o banco — mas
        // também serve de fallback: se o Supabase não estiver configurado (dev local
        // sem .env) ou a consulta falhar, o app usa o catálogo embutido e não quebra.
        let loadedCars = SEED_CARS;
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from("cars")
            .select(
              `id, name, brand, category, price,
               powerCv:power_cv, torqueNm:torque_nm, batteryKwh:battery_kwh, batteryChem:battery_chem,
               motorType:motor_type, rangeKm:range_km, accel, groundClearance:ground_clearance,
               trunkL:trunk_l, weightKg:weight_kg, wallbox, acKw:ac_kw, dcKw:dc_kw, airbags, warranty,
               fuelType:fuel_type, verified, priceVerifiedDate:price_verified_date,
               maintenanceInterval:maintenance_interval, maintenanceFirstCost:maintenance_first_cost,
               maintenanceKmBase:maintenance_km_base, maintenanceTotalCost:maintenance_total_cost,
               consumptionKwh100:consumption_kwh_100, techNotes:tech_notes,
               imageUrl:image_url, videoUrl:video_url, personas`
            )
            .order("name");
          if (!dbError && data && data.length > 0) loadedCars = data;
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

  // Teto do slider de preço: acompanha o carro mais caro do catálogo (arredondado
  // pra cima), nunca menos que o teto original de R$550 mil. Sem isso, qualquer
  // carro mais caro que o teto fixo antigo ficava impossível de alcançar no
  // filtro, mesmo arrastando o slider até o fim.
  const priceCeiling = useMemo(() => {
    if (!cars) return 550000;
    const max = Math.max(550000, ...cars.map((c) => c.price || 0));
    return Math.ceil(max / 50000) * 50000;
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
              {maxPrice >= priceCeiling ? "sem limite de preço" : `até ${money(maxPrice)}`}
            </span>
            <input
              type="range" min={100000} max={priceCeiling} step={10000}
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
                <CarImage src={car.imageUrl} alt={car.name} T={T} />
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
                        label="Manutenção (média/10k km)"
                        value={maintCostPer10k(car) ? money(maintCostPer10k(car)) : null}
                        hint={
                          car.maintenanceKmBase
                            ? `Não é o preço de uma revisão isolada — é a soma de todas as revisões programadas conhecidas até ${car.maintenanceKmBase.toLocaleString("pt-BR")} km, normalizada numa taxa comparável a cada 10.000 km rodados.`
                            : "Não é o preço de uma revisão isolada — é a soma de todas as revisões programadas conhecidas, normalizada numa taxa comparável a cada 10.000 km rodados, pra dar pra comparar carros com intervalos e prazos diferentes."
                        }
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

// Foto do carro no topo do card — link direto pro site oficial da marca (não
// hospedamos a imagem). Se não tiver imageUrl, ou se o link quebrar (site da
// marca saiu do ar, trocou a URL, bloqueou hotlink etc.), some sem deixar
// buraco no lugar — o card volta a ficar igual aos que nunca tiveram foto.
function CarImage({ src, alt, T }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setBroken(true)}
      style={{ width: "100%", height: 140, objectFit: "cover", display: "block", background: T.panelAlt }}
    />
  );
}

function MiniStat({ label, value, T }) {
  return (
    <div style={{ background: T.bg, borderRadius: 8, padding: "8px 6px", textAlign: "center" }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 9.5, color: T.inkDim, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

function Spec({ label, value, T, hint }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${T.line}`, padding: "5px 0" }}>
      <span
        title={hint}
        style={{ color: T.inkDim, ...(hint ? { borderBottom: `1px dotted ${T.inkDim}`, cursor: "help" } : {}) }}
      >
        {label}
      </span>
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
  // Cada getter retorna null (não uma string tipo "null kg") quando falta o dado —
  // só assim o "—" de fallback na renderização da célula funciona de verdade.
  const rows = [
    ["Preço", (c) => money(c.price)],
    ["Categoria", (c) => c.category],
    ["Grupo/Parceria", (c) => BRAND_GROUPS[c.brand] || "Independente / não mapeado"],
    ["Potência", (c) => (c.powerCv != null ? `${c.powerCv} cv` : null)],
    ["Torque", (c) => (c.torqueNm != null ? `${c.torqueNm} Nm` : null)],
    ["0–100 km/h", (c) => (c.accel != null ? `${c.accel}s` : null)],
    ["Bateria", (c) => (c.batteryKwh != null ? `${c.batteryKwh} kWh${c.batteryChem ? ` (${c.batteryChem})` : ""}` : null)],
    ["Motor", (c) => c.motorType],
    ["Autonomia", (c) => (c.rangeKm != null ? `${c.rangeKm} km` : null)],
    ["AC / DC", (c) => (c.acKw != null || c.dcKw != null ? `${c.acKw ?? "—"} kW / ${c.dcKw ?? "—"} kW` : null)],
    ["Vão livre", (c) => (c.groundClearance != null ? `${c.groundClearance} mm` : null)],
    ["Porta-malas", (c) => (c.trunkL != null ? `${c.trunkL} L` : null)],
    ["Peso", (c) => (c.weightKg != null ? `${c.weightKg} kg` : null)],
    ["Airbags", (c) => c.airbags],
    ["Wallbox", (c) => c.wallbox],
    ["Garantia", (c) => c.warranty],
    ["Intervalo revisão", (c) => c.maintenanceInterval],
    ["1ª revisão", (c) => c.maintenanceFirstCost],
    [
      "Manutenção (média/10k km)",
      (c) => (maintCostPer10k(c) ? money(maintCostPer10k(c)) : null),
      "Não é o preço de uma revisão isolada — é a soma de todas as revisões programadas conhecidas, normalizada numa taxa comparável a cada 10.000 km rodados, pra dar pra comparar carros com intervalos e prazos diferentes.",
    ],
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
        <div style={{ fontSize: 10.5, color: T.inkDim, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <ArrowRight size={11} /> Arraste pros lados pra ver mais carros — o nome do carro e o nome do atributo ficam fixos na tela.
        </div>
        <div style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 8 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: cars.length * 150 }}>
            <thead>
              <tr>
                <th style={stickyCornerStyle(T)}></th>
                {cars.map((c) => (
                  <th key={c.id} style={{ ...stickyTopStyle(T), fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, get, hint]) => (
                <tr key={label}>
                  <td style={stickyLeftStyle(T)}>
                    {hint ? (
                      <span title={hint} style={{ borderBottom: `1px dotted ${T.inkDim}`, cursor: "help" }}>{label}</span>
                    ) : (
                      label
                    )}
                  </td>
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
// Cabeçalho (nome dos carros) fixo ao rolar a tabela pra baixo.
function stickyTopStyle(T) {
  return { ...thStyle(T), position: "sticky", top: 0, background: T.panel, zIndex: 2 };
}
// Primeira coluna (nome do atributo) fixa ao rolar a tabela pros lados.
function stickyLeftStyle(T) {
  return {
    ...tdStyle(T), color: T.inkDim, fontWeight: 600,
    position: "sticky", left: 0, background: T.panel, zIndex: 1,
    boxShadow: `2px 0 4px -2px rgba(0,0,0,0.25)`,
  };
}
// Canto superior esquerdo: fixo nos dois eixos ao mesmo tempo, por cima de tudo.
function stickyCornerStyle(T) {
  return { ...thStyle(T), position: "sticky", top: 0, left: 0, background: T.panel, zIndex: 3 };
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
