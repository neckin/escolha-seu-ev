import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";
import {
  Zap, Battery, Users, Mountain, TrendingUp, DollarSign, Plus, X,
  ChevronDown, ChevronUp, Car, Gauge, Check,
  Sun, Moon, Fuel, ArrowRight, Play, Plug, HelpCircle, ArrowLeft, Sparkles,
  Accessibility, Briefcase, ShieldCheck
} from "lucide-react";
import { supabase } from "./supabaseClient";
import InsuranceModal from "./InsuranceModal.jsx";
import PrivacyPage from "./PrivacyPage.jsx";
// Fallback offline: gerado a partir do Supabase (fonte da verdade do
// catálogo) por scripts/generate-fallback-snapshot.mjs — não editar à mão.
// Usado só se o Supabase não estiver configurado ou a consulta falhar.
import SEED_CARS from "./carsFallback.json";

// ---------------------------------------------------------------------------
// THEME TOKENS
// ---------------------------------------------------------------------------
// Paleta e tipografia conforme o Manual de Identidade Visual 1.1 da D&B
// Corretora (set/2026): Azul Profundo + Dourado, Manrope/Inter/Cormorant
// Garamond. Hex exatos tirados do manual (seção "Sistema visual").
const NAVY = "#0B1F33";   // Azul Profundo — cor de texto/ação sobre dourado
const DARK_T = {
  mode: "dark",
  // Variação mais clara do Azul Profundo/Secundário (mesma família, luz
  // misturada) — o navy oficial ficava pesado demais como fundo de tela cheia.
  bg: "#374F68",
  panel: "#4E6379",
  panelAlt: "#40576F",
  line: "#6A7C8E",
  ink: "#FFFFFF",
  inkDim: "#D3D9DE",
  accent: "#C89B3C",    // Dourado Assinatura — ênfase (texto, ícone, borda)
  accentSoft: "#E4C377",// Dourado Suave — preenchimentos leves/estado ativo
  onGold: NAVY,         // texto sobre fundos dourados (fixo nos 2 temas)
  accent2: "#E4C377",   // ação primária em fundo escuro (dourado sobre azul)
  good: "#5FD37B",
  warn: "#E8794A",
  radar: "#C89B3C",
};

const LIGHT_T = {
  mode: "light",
  bg: "#F7F7F5",       // Marfim
  panel: "#FFFFFF",    // Branco
  panelAlt: "#EEF0EF",
  line: "#E1E4E3",
  ink: "#0B1F33",       // Azul Profundo
  inkDim: "#4C5A68",    // Grafite
  accent: "#C89B3C",    // Dourado Assinatura — ênfase (texto, ícone, borda)
  accentSoft: "#E4C377",// Dourado Suave — preenchimentos leves/estado ativo
  onGold: NAVY,         // texto sobre fundos dourados (fixo nos 2 temas)
  accent2: "#0B1F33",   // ação primária em fundo claro (azul profundo)
  good: "#1E7B34",
  warn: "#B23A14",
  radar: "#C89B3C",
};

// Mistura um hex do tema com alpha, pra tints translúcidos (badges, fundos
// sutis) sempre acompanharem a cor do tema ativo em vez de ficar hardcoded.
function hexA(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,600;1,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
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
    title: "Sua mobilidade",
    text: "Já tem carro? Cadastre aqui. Ainda não tem? Também dá — é só dizer quanto você gasta hoje com Uber/99/transporte público. Nos dois casos, cada elétrico passa a mostrar a economia mensal estimada.",
    refKey: "myCarBtn",
  },
  {
    icon: ShieldCheck,
    title: "Cotação de seguro",
    text: "Decidiu o carro? Toque em Contratar seguro no card pra pedir uma cotação na hora, em parceria com a D&B Corretora — sem sair do comparador.",
    refKey: "insuranceBtn",
  },
];

export default function App() {
  // rota simples via hash (#/privacidade) — sem dependência de router nem
  // de configuração de servidor para fallback de SPA
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#\/?/, ""));
  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.replace(/^#\/?/, ""));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const [cars, setCars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [theme, setTheme] = useState("light");
  const T = theme === "dark" ? DARK_T : LIGHT_T;

  const [insuranceCar, setInsuranceCar] = useState(null);

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
    insuranceBtn: useRef(null),
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
    // página estática, não precisa do catálogo; e se o usuário só passou por
    // aqui e já tinha carregado antes, não recarrega ao voltar
    if (route === "privacidade" || cars !== null) { setLoading(false); return; }
    (async () => {
      try {
        // O Supabase é a fonte da verdade do catálogo (visto por todo mundo,
        // atualizado sem rebuild do site). SEED_CARS aqui é só o fallback
        // offline — um snapshot gerado a partir do próprio Supabase (veja
        // scripts/generate-fallback-snapshot.mjs) — usado se o Supabase não
        // estiver configurado (dev local sem .env) ou a consulta falhar, pra
        // o app nunca quebrar por falta de configuração.
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
  }, [route]);

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
    // "ainda não tenho carro": não tem km/L nem preço de combustível pra comparar —
    // compara com o que a pessoa já gasta hoje se locomovendo (Uber/99/ônibus/metrô).
    if (myCar.hasCar === false) {
      // custo de posse: independe de a pessoa ter preenchido o gasto atual — dá pra
      // mostrar "quanto custaria rodar" mesmo sem nenhuma base de comparação.
      if (myCar.kmPerMonth && car.consumptionKwh100) {
        out.energyMonthly = (myCar.kmPerMonth / 100) * car.consumptionKwh100 * (myCar.energyPrice || 0.9);
        const evMaintPer10k = maintCostPer10k(car);
        if (evMaintPer10k != null) out.evMaintMonthly = (myCar.kmPerMonth / 10000) * evMaintPer10k;
        out.ownershipMonthly = out.energyMonthly + (out.evMaintMonthly || 0);
      }
      // comparação com o que a pessoa já gasta hoje se locomovendo (Uber/99/ônibus/metrô) — opcional.
      if (myCar.monthlyMobilitySpend && out.energyMonthly != null) {
        out.fuelMonthly = Number(myCar.monthlyMobilitySpend);
        out.fuelSavings = out.fuelMonthly - out.energyMonthly;
        totalSavings += out.fuelSavings;
        hasSavings = true;
      }
    } else {
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

  if (route === "privacidade") {
    return <PrivacyPage T={T} onBack={() => { window.location.hash = ""; }} />;
  }

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
      {/* Logo D&B no canto superior esquerdo (Manual de Identidade Visual 1.1,
          p.20: monograma + nome + selo, 60-72px no desktop). Fio dourado de
          2px no rodapé do header = "linha dourada" da linguagem gráfica (p.17) —
          usado aqui só como fio de separação, não como decoração. */}
      <header style={{ borderBottom: `2px solid ${T.accent}`, padding: "16px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", rowGap: 14 }}>
          <a
            href="https://dbcorr.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            title="D&B Corretora — parceira de seguros deste comparador"
            style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, textDecoration: "none", color: "inherit" }}
          >
            <img
              src={theme === "dark" ? "/brand/db-corretora-logo.png" : "/brand/db-corretora-logo-navy.png"}
              alt="D&B Corretora"
              style={{ height: 52, width: "auto", flexShrink: 0 }}
            />
            <div style={{ borderLeft: `1px solid ${T.line}`, paddingLeft: 12 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: -0.3, color: T.ink }}>
                Escolha seu EV
              </div>
              <div className="ev-header-subtitle" style={{ fontSize: 11, color: T.inkDim, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif" }}>
                Um comparador em parceria com a D&B Corretora
              </div>
            </div>
          </a>

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
              <Fuel size={14} /> {myCar ? (myCar.hasCar === false ? "Minha mobilidade" : myCar.name || "Meu carro") : "Simular meu gasto mensal"}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 100px" }}>
        {error && (
          <div style={{ background: hexA(T.warn, 0.12), border: `1px solid ${T.warn}`, color: T.warn, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 16 }}>
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
                    background: active ? T.accentSoft : T.panel, color: active ? T.onGold : T.ink,
                    border: `1px solid ${active ? T.accentSoft : T.line}`, fontSize: 13, fontWeight: 600, cursor: "pointer"
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
            marginBottom: 20, padding: 14, borderRadius: 12, background: hexA(T.accent2, 0.08),
            border: `1px dashed ${T.accent2}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: hexA(T.accent2, 0.15),
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Fuel size={17} color={T.accent2} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: T.ink, marginBottom: 2 }}>
                Quanto custaria um elétrico pra você — com ou sem carro hoje?
              </div>
              <div style={{ fontSize: 12, color: T.inkDim, lineHeight: 1.4 }}>
                Leva menos de 1 minuto e não precisa saber todos os dados. Já tem carro? Comparamos com o combustível. Ainda não tem? Comparamos com o que você já gasta em Uber/99/transporte público.
              </div>
            </div>
            <button
              onClick={() => setShowMyCarForm(true)}
              style={{
                flexShrink: 0, background: T.accent2, color: T.bg, border: "none", borderRadius: 8,
                padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}
            >
              Simular meu gasto mensal
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
                      <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{car.name}</div>
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
                        borderRadius: 999, background: hexA(T.accent, 0.12), border: `1px solid ${T.accent}`,
                        fontSize: 11, fontWeight: 600, color: T.accent
                      }}>
                        <best.icon size={12} /> Melhor para: {best.label}
                      </div>
                    )}
                    {(() => {
                      const ws = wallboxStatus(car.wallbox);
                      if (!ws) return null;
                      const cfg = {
                        yes: { color: T.good, bg: hexA(T.good, 0.12), label: "Wallbox incluso" },
                        maybe: { color: T.accent2, bg: hexA(T.accent2, 0.12), label: "Wallbox: depende" },
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
                            borderRadius: 999, background: hexA(T.accent, 0.08), border: `1px dashed ${T.accent}`,
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
                        background: inCompare ? T.accentSoft : "transparent", color: inCompare ? T.onGold : T.ink,
                        border: `1px solid ${inCompare ? T.accentSoft : T.line}`, borderRadius: 8,
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

                  <button
                    ref={carIdx === 0 ? tourRefs.insuranceBtn : null}
                    onClick={() => setInsuranceCar(car)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%",
                      marginTop: 8, background: "transparent", border: `1px solid ${T.accent2}`, color: T.accent2,
                      borderRadius: 8, padding: "9px", fontSize: 12, fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    <ShieldCheck size={14} /> Contratar seguro
                  </button>
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
                      <div style={{ fontSize: 12, color: T.accent2, lineHeight: 1.5, marginBottom: 14, background: hexA(T.accent2, 0.1), border: `1px solid ${T.accent2}`, borderRadius: 8, padding: 10 }}>
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
                        <Fuel size={12} /> {myCar && myCar.hasCar === false ? "Vs. sua mobilidade hoje" : "Vs. seu carro atual"}
                      </div>
                      {!myCar ? (
                        <button
                          onClick={() => setShowMyCarForm(true)}
                          style={{ fontSize: 12.5, color: T.accent, background: "transparent", border: `1px dashed ${T.line}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", width: "100%", textAlign: "left" }}
                        >
                          Diga como você se locomove hoje (com ou sem carro) pra ver a economia deste modelo →
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
                                  background: d.monthlySavings >= 0 ? hexA(T.good, 0.1) : hexA(T.warn, 0.1),
                                  border: `1px solid ${d.monthlySavings >= 0 ? T.good : T.warn}`
                                }}>
                                  {d.fuelMonthly != null && (
                                    <div style={{ fontSize: 11, color: T.inkDim }}>
                                      {myCar.hasCar === false
                                        ? `Sua mobilidade hoje: ${money(d.fuelMonthly)}/mês`
                                        : `Combustível (${myCar.name || "seu carro"}): ${money(d.fuelMonthly)}/mês`}
                                      {" · Energia (este EV): "}{money(d.energyMonthly)}/mês
                                    </div>
                                  )}
                                  {myCar.hasCar === false
                                    ? d.evMaintMonthly != null && (
                                        <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>
                                          Manutenção estimada (este EV): {money(d.evMaintMonthly)}/mês
                                        </div>
                                      )
                                    : d.myMaintMonthly != null && (
                                        <div style={{ fontSize: 11, color: T.inkDim, marginTop: d.fuelMonthly != null ? 2 : 0 }}>
                                          Manutenção ({myCar.name || "seu carro"}): {money(d.myMaintMonthly)}/mês · Manutenção (este EV): {money(d.evMaintMonthly)}/mês
                                        </div>
                                      )}
                                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: d.monthlySavings >= 0 ? T.good : T.warn, marginTop: 3 }}>
                                    {d.monthlySavings >= 0 ? "Economiza " : "Gasta mais "}
                                    {money(Math.abs(d.monthlySavings))}/mês
                                    {d.myMaintMonthly == null && myCar.hasCar !== false && <span style={{ fontWeight: 400, fontSize: 10.5, color: T.inkDim }}> (só combustível/energia)</span>}
                                  </div>
                                  {d.maintUnavailable && (
                                    <div style={{ fontSize: 10.5, color: T.inkDim, marginTop: 4 }}>
                                      Este modelo ainda não tem dado de custo de manutenção cadastrado, então a economia acima considera só combustível/energia.
                                    </div>
                                  )}
                                </div>
                              )}
                              {/* custo de posse absoluto: aparece pra quem ainda não tem carro mesmo sem
                                  ter preenchido o gasto atual — não depende de nenhuma comparação. */}
                              {myCar.hasCar === false && d.monthlySavings == null && d.ownershipMonthly != null && (
                                <div style={{ marginTop: 6, padding: 10, borderRadius: 8, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                                  <div style={{ fontSize: 11, color: T.inkDim }}>
                                    Energia: {money(d.energyMonthly)}/mês
                                    {d.evMaintMonthly != null && <> · Manutenção estimada: {money(d.evMaintMonthly)}/mês</>}
                                  </div>
                                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: T.ink, marginTop: 3 }}>
                                    ~{money(d.ownershipMonthly)}/mês pra rodar este elétrico
                                  </div>
                                  <div style={{ fontSize: 10.5, color: T.inkDim, marginTop: 4 }}>
                                    Não inclui parcela de financiamento nem seguro — só o custo de uso (energia + manutenção). Preencha "quanto você gasta hoje com transporte" pra comparar com sua mobilidade atual.
                                  </div>
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
            {myCar.hasCar === false ? (
              <>
                Sua mobilidade hoje: <strong style={{ color: T.ink }}>{myCar.monthlyMobilitySpend ? `${money(Number(myCar.monthlyMobilitySpend))}/mês com Uber/99/transporte` : "ainda sem gasto informado"}</strong>.{" "}
              </>
            ) : (
              <>
                Seu carro atual: <strong style={{ color: T.ink }}>{myCar.name || "sem nome"}</strong>
                {myCar.groundClearance != null && ` — vão livre ${myCar.groundClearance}mm`}
                {myCar.trunkL != null && `, porta-malas ${myCar.trunkL}L`}.{" "}
              </>
            )}
            <button onClick={() => setShowMyCarForm(true)} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", fontSize: 12.5, textDecoration: "underline", padding: 0 }}>
              editar
            </button>
          </div>
        )}

        <div style={{ marginTop: 10, fontSize: 11, color: T.inkDim, lineHeight: 1.5 }}>
          Critério de inclusão: só carros eletrificados (100% elétricos ou híbridos plug-in) com venda oficial confirmada por montadora/distribuidor no Brasil (rede de concessionárias própria). Marcas só disponíveis por importação independente (ex.: Tesla) não entram na lista.
        </div>

        <div style={{ marginTop: 14, padding: 14, borderRadius: 10, background: T.panel, border: `1px solid ${T.line}`, fontSize: 12, color: T.inkDim, lineHeight: 1.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: T.ink, fontWeight: 700, fontFamily: "'Manrope', sans-serif", fontSize: 13 }}>
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

      {/* ---------- FOOTER ---------- */}
      <footer style={{ borderTop: `1px solid ${T.line}`, padding: "22px 16px 90px", textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: T.inkDim }}>Cotação de seguro em parceria com</span>
          <a
            href="https://dbcorr.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", color: T.ink }}
          >
            <img src={theme === "dark" ? "/brand/db-corretora-logo.png" : "/brand/db-corretora-logo-navy.png"} alt="D&B Corretora" style={{ height: 26, width: "auto" }} />
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 14 }}>D&B Corretora</span>
          </a>
        </div>
        <a
          href="#/privacidade"
          style={{ fontSize: 11.5, color: T.inkDim, textDecoration: "underline" }}
        >
          Privacidade e proteção de dados (LGPD)
        </a>
      </footer>

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
            <button onClick={() => setShowCompare(true)} style={{ background: T.accent2, border: "none", color: T.bg, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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

      {/* ---------- INSURANCE (Segfy) ---------- */}
      {insuranceCar && (
        <InsuranceModal
          car={insuranceCar}
          onClose={() => setInsuranceCar(null)}
          T={T}
          onOpenPrivacy={() => { setInsuranceCar(null); window.location.hash = "#/privacidade"; }}
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
      style={{ width: "100%", height: 150, objectFit: "contain", display: "block", background: T.panelAlt }}
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

  // ---- carrossel (telas estreitas): 1 carro por vez, specs empilhadas ----
  // Tabela de scroll horizontal é ótima em desktop, mas num celular sobra
  // largura só pra uma fração de coluna por vez — a pessoa fica arrastando
  // pro lado a cada uma das ~19 linhas. O carrossel troca isso por um gesto
  // que todo mundo já conhece (swipe entre telas cheias), com uma faixa-
  // resumo fixa no topo pra não perder a comparação lado a lado dos 2 dados
  // mais decisivos (preço e autonomia).
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(null);
  const goTo = (idx) => setActiveIdx(Math.max(0, Math.min(cars.length - 1, idx)));
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return; // gesto curto demais, ignora (evita trocar de carro sem querer)
    goTo(activeIdx + (dx < 0 ? 1 : -1));
  };
  const active = cars[activeIdx];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.panel, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "85vh", overflow: "auto", padding: 16 }}>
        {/* breakpoint só de exibição — as duas versões ficam no DOM, o CSS decide qual mostrar */}
        <style>{`
          .ev-compare-table { display: block; }
          .ev-compare-carousel { display: none; }
          @media (max-width: 680px) {
            .ev-compare-table { display: none; }
            .ev-compare-carousel { display: block; }
          }
        `}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16 }}>Comparação</div>
          <button onClick={onClose} style={iconBtnStyle(T)}><X size={15} /></button>
        </div>
        {distinctCategories.length > 1 && (
          <div style={{
            fontSize: 12, color: T.accent2, background: hexA(T.accent2, 0.1), border: `1px solid ${T.accent2}`,
            borderRadius: 8, padding: 10, marginBottom: 12
          }}>
            Você está comparando categorias diferentes ({distinctCategories.join(" vs ")}) — pra uma comparação mais justa, prefira carros da mesma categoria.
          </div>
        )}

        {/* ---------- TABELA (telas largas) ---------- */}
        <div className="ev-compare-table">
          <div style={{ fontSize: 10.5, color: T.inkDim, marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowRight size={11} /> Arraste pros lados pra ver mais carros — o nome do carro e o nome do atributo ficam fixos na tela.
          </div>
          <div style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto", border: `1px solid ${T.line}`, borderRadius: 8 }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: cars.length * 150 }}>
              <thead>
                <tr>
                  <th style={stickyCornerStyle(T)}></th>
                  {cars.map((c) => (
                    <th key={c.id} style={{ ...stickyTopStyle(T), fontFamily: "'Manrope', sans-serif" }}>{c.name}</th>
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

        {/* ---------- CARROSSEL (celular) ---------- */}
        <div className="ev-compare-carousel">
          {/* faixa-resumo: preço + autonomia de todos os carros, sempre visível */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {cars.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i)}
                style={{
                  flex: "1 1 auto", minWidth: 96, textAlign: "left", cursor: "pointer",
                  background: i === activeIdx ? hexA(T.accent, 0.1) : T.panelAlt,
                  border: `1px solid ${i === activeIdx ? T.accent : T.line}`,
                  borderRadius: 8, padding: "7px 9px",
                }}
              >
                <div style={{ fontSize: 10.5, fontWeight: 700, color: T.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: T.accent2, marginTop: 2 }}>{money(c.price)}</div>
                <div style={{ fontSize: 10, color: T.inkDim }}>{c.rangeKm != null ? `${c.rangeKm} km` : "—"}</div>
              </button>
            ))}
          </div>

          {/* navegação entre carros */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
            <button
              onClick={() => goTo(activeIdx - 1)}
              disabled={activeIdx === 0}
              style={{ ...iconBtnStyle(T), opacity: activeIdx === 0 ? 0.35 : 1, cursor: activeIdx === 0 ? "default" : "pointer" }}
            >
              <ArrowLeft size={15} />
            </button>
            <div style={{ fontSize: 12.5, fontWeight: 700, textAlign: "center", flex: 1, fontFamily: "'Manrope', sans-serif" }}>
              {active.name}
              <div style={{ fontSize: 10.5, color: T.inkDim, fontWeight: 400, marginTop: 1 }}>{activeIdx + 1} de {cars.length}</div>
            </div>
            <button
              onClick={() => goTo(activeIdx + 1)}
              disabled={activeIdx === cars.length - 1}
              style={{ ...iconBtnStyle(T), opacity: activeIdx === cars.length - 1 ? 0.35 : 1, cursor: activeIdx === cars.length - 1 ? "default" : "pointer" }}
            >
              <ArrowRight size={15} />
            </button>
          </div>

          {/* specs do carro ativo, empilhadas — arrasta (swipe) troca de carro */}
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ border: `1px solid ${T.line}`, borderRadius: 8, padding: "2px 12px", touchAction: "pan-y" }}
          >
            {rows.map(([label, get, hint]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.line}` }}>
                <span style={{ fontSize: 12, color: T.inkDim, fontWeight: 600, flexShrink: 0 }} title={hint || undefined}>{label}</span>
                <span style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", textAlign: "right" }}>{get(active) ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
            {cars.map((c, i) => (
              <button
                key={c.id}
                onClick={() => goTo(i)}
                aria-label={`Ver ${c.name}`}
                style={{
                  width: i === activeIdx ? 18 : 6, height: 6, borderRadius: 3, border: "none", padding: 0,
                  background: i === activeIdx ? T.accent : T.line, cursor: "pointer", transition: "width 0.15s",
                }}
              />
            ))}
          </div>
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
      hasCar: true, name: "", groundClearance: "", trunkL: "", powerCv: "",
      kmPerLiter: "", fuelPrice: 6.0, energyPrice: 0.9, kmPerMonth: 1000,
      maintenanceAnnual: "", monthlyMobilitySpend: "",
    }
  );
  // dado salvo antes dessa opção existir não tem o campo — trata como "tenho carro"
  // (era o único fluxo que existia), sem quebrar quem já tinha cadastrado.
  const hasCar = form.hasCar !== false;
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
          <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16 }}>Sua mobilidade</div>
          <button onClick={onClose} style={iconBtnStyle(T)}><X size={15} /></button>
        </div>
        <div style={{ fontSize: 12, color: T.inkDim, marginBottom: 14, lineHeight: 1.5 }}>
          {hasCar
            ? "Preenchendo só o nome, a quilometragem mensal, o consumo e o preço do combustível, cada elétrico já mostra a economia mensal estimada. O resto é opcional — dá pra deixar em branco e completar depois."
            : "Preenchendo quanto você gasta hoje se locomovendo e quanto rodaria por mês, cada elétrico já mostra se compensaria trocar isso por um carro."}{" "}
          Fica salvo só no seu navegador; outras pessoas que abrirem este app não veem.
        </div>

        <div style={{ ...labelStyle, marginBottom: 16 }}>
          Você já tem carro?
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => set("hasCar", true)}
              style={{
                flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                background: hasCar ? T.accentSoft : T.panelAlt, color: hasCar ? T.onGold : T.inkDim,
                border: `1px solid ${hasCar ? T.accentSoft : T.line}`,
              }}
            >
              Já tenho carro
            </button>
            <button
              type="button"
              onClick={() => set("hasCar", false)}
              style={{
                flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                background: !hasCar ? T.accentSoft : T.panelAlt, color: !hasCar ? T.onGold : T.inkDim,
                border: `1px solid ${!hasCar ? T.accentSoft : T.line}`,
              }}
            >
              Ainda não tenho carro
            </button>
          </div>
        </div>

        {hasCar ? (
          <>
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
                borderRadius: 7, background: hexA(T.accent, 0.1), border: `1px solid ${T.accent}`,
                fontSize: 11.5, color: T.accent, fontWeight: 600
              }}>
                <Check size={13} /> Preenchemos specs aproximadas do {autoFillNote} — confira abaixo e ajuste se souber o valor exato do seu carro.
              </div>
            )}
          </>
        ) : (
          <label style={{ ...labelStyle, marginBottom: 14 }}>
            Quanto você gasta hoje com transporte? (R$/mês)
            <input
              type="number"
              step="0.01"
              value={form.monthlyMobilitySpend ?? ""}
              onChange={(e) => set("monthlyMobilitySpend", e.target.value)}
              placeholder="Ex.: 450"
              style={fieldStyle}
            />
            <span style={hintStyle}>Some Uber/99, ônibus, metrô, aluguel de carro por app — o que você já gasta hoje pra se locomover.</span>
          </label>
        )}

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, color: T.accent, marginBottom: 10, fontWeight: 700 }}>
          Pra calcular sua economia mensal
        </div>

        <label style={{ ...labelStyle, marginBottom: 14 }}>
          {hasCar ? "Km rodados por mês" : "Quantos km por mês você rodaria com o carro"}
          <input
            type="number"
            value={form.kmPerMonth ?? ""}
            onChange={(e) => set("kmPerMonth", e.target.value)}
            placeholder="Ex.: 1000"
            style={fieldStyle}
          />
          <span style={hintStyle}>Não sabe o número exato? Uma estimativa de cabeça já ajuda — dá pra ajustar depois.</span>
        </label>

        {hasCar && (
          <>
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
                      background: Number(form.kmPerLiter) === p.value ? T.accentSoft : T.panelAlt,
                      color: Number(form.kmPerLiter) === p.value ? T.onGold : T.inkDim,
                      border: `1px solid ${Number(form.kmPerLiter) === p.value ? T.accentSoft : T.line}`, fontWeight: 600
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
          </>
        )}

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

        {hasCar && (
          <>
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
          </>
        )}

        <button
          onClick={() =>
            onSave({
              ...form,
              hasCar,
              groundClearance: hasCar && form.groundClearance ? Number(form.groundClearance) : null,
              trunkL: hasCar && form.trunkL ? Number(form.trunkL) : null,
              powerCv: hasCar && form.powerCv ? Number(form.powerCv) : null,
              kmPerLiter: hasCar && form.kmPerLiter ? Number(form.kmPerLiter) : null,
              fuelPrice: hasCar && form.fuelPrice ? Number(form.fuelPrice) : null,
              energyPrice: form.energyPrice ? Number(form.energyPrice) : 0.9,
              kmPerMonth: form.kmPerMonth ? Number(form.kmPerMonth) : null,
              maintenanceAnnual: hasCar && form.maintenanceAnnual ? Number(form.maintenanceAnnual) : null,
              monthlyMobilitySpend: !hasCar && form.monthlyMobilitySpend ? Number(form.monthlyMobilitySpend) : null,
            })
          }
          style={{
            width: "100%", marginTop: 18, background: T.accent2, color: T.bg,
            border: "none", borderRadius: 9, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer"
          }}
        >
          {hasCar ? "Salvar meu carro" : "Salvar minha mobilidade"}
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
          width: 44, height: 44, borderRadius: 12, background: hexA(T.accent, 0.12),
          border: `1px solid ${T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12
        }}>
          <Icon size={20} color={T.accent} />
        </div>

        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6, paddingRight: 20 }}>
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
              background: T.accent2, color: T.bg, border: "none", borderRadius: 9,
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
