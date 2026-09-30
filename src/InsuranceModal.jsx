// ---------------------------------------------------------------------------
// Cotação de seguro auto — integração Segfy (White Label JS)
// ---------------------------------------------------------------------------
// Fonte da integração: doc interna "Integrações Segfy > White Label -
// Javascript > Veículo > V2 Ramo auto" (ClickUp). Resumo do funcionamento
// real, para quando tivermos as credenciais da corretora parceira:
//
//   <script type="module" src="https://bundles.segfy.com/auto-bundle.js"
//     data-container="app-propostas" data-environment="production"
//     data-token="<TOKEN_DA_CORRETORA>"></script>
//
// O bundle da Segfy renderiza sozinho, dentro da div indicada por
// data-container, um formulário completo de multicálculo (várias
// seguradoras) e devolve eventos via window.__SEGFY_CALLBACKS__.
//
// ESTADO ATUAL: ainda não temos token de integração (depende da corretora
// parceira). Este componente já está pronto para os dois mundos:
//
//   - Sem VITE_SEGFY_TOKEN configurado → mostra o fluxo de DEMONSTRAÇÃO
//     abaixo (dados fictícios), só para validar a experiência com o parceiro.
//   - Com VITE_SEGFY_TOKEN configurado (.env.local) → injeta o bundle real
//     da Segfy automaticamente, sem precisar mexer em código.
//
// TODO (confirmar com a corretora parceira ANTES do go-live, ou seja, antes
// de configurar VITE_SEGFY_TOKEN em produção): o callback `impressao` sugere
// que o widget cobre cotação + EMISSÃO da apólice de ponta a ponta — mas não
// sabemos se isso é 100% self-service (pessoa paga e já recebe a apólice) ou
// se, para algumas seguradoras do painel, cai em análise manual e alguém da
// corretora precisa entrar em contato antes de emitir. É regra de negócio de
// cada seguradora dentro do painel da Segfy, não algo visível no código.
// Confirmar na doc "V2 Ramo auto" (ClickUp) ou direto com o contato da
// corretora antes de divulgar isso como contratação instantânea pro usuário.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { paymentOptions, headlineInstallment, formatPlan } from "./installments.js";
import { X, ShieldCheck, Loader2, FlaskConical, Info, AlertTriangle } from "lucide-react";

// Mistura um hex do tema com alpha — mantém tints translúcidos acompanhando
// o tema ativo (claro/escuro) em vez de fixar uma cor hardcoded.
function hexA(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const SEGFY_TOKEN = import.meta.env.VITE_SEGFY_TOKEN || "";
const SEGFY_ENV = import.meta.env.VITE_SEGFY_ENV || "production";
const SEGFY_SCRIPT_URL = "https://bundles.segfy.com/auto-bundle.js";
const SEGFY_CONTAINER_ID = "segfy-app-propostas";

// ---------------------------------------------------------------------------
// Modo API própria (client_id/secret + config.token no backend, ver /api/segfy)
// ---------------------------------------------------------------------------
// Flag pública (não é segredo, só liga/desliga esta tela) — ativar com
// VITE_SEGFY_API_MODE=true depois que /api/segfy/health responder {"ok":true}.
const SEGFY_API_MODE = String(import.meta.env.VITE_SEGFY_API_MODE || "").toLowerCase() === "true";
const SEGFY_SOCKET_URL = "https://socket-io.segfy.com";
const SEGFY_VEHICLE_TYPE = "car"; // catálogo é só de carros elétricos/híbridos

// Seguradoras cotadas e comissão de cada uma, definidas com a D&B (10% em
// todas). Nomes conforme o enum de seguradoras da própria Segfy.
// TODO (confirmar com a Segfy): a doc só diz "number" e chama de "percentual";
// com 0.1 a Bradesco respondeu "comissão não encontrada", então testamos 10.
const QUOTED_INSURERS = [
  { name: "porto", commission: 10 },
  { name: "azul", commission: 10 },
  { name: "itau", commission: 10 },
  { name: "allianz", commission: 10 },
  { name: "liberty", commission: 10 },
  { name: "bradesco", commission: 10 },
  { name: "suhai", commission: 10 },
  { name: "mitsui", commission: 10 },
];

// Pacote de cobertura padrão desta cotação "rápida", revisado e aprovado pela
// D&B. A API exige esses 7 campos em toda chamada.
const DEFAULT_COVERAGE = {
  coverage_type: "comprehensive",
  franchise: "normal",
  fipe_percentage: 100,
  assistance: "assistance_200_km_referenced",
  glass: "glass_basic_referenced",
  body_injuries: 100000,
  material_damage: 100000,
};

// Questionário de risco exigido pela Segfy no calculate (perguntas validadas
// com a D&B). Valores = enums do public-swagger.json da Segfy; rótulos = o que
// a pessoa vê. Obs.: o swagger descreve yes_male como "sexo feminino" e
// yes_female como "sexo masculino" — seguimos o nome da chave, que é o padrão
// do resto da API (sex: male/female).
const SEX_OPTS = [["male", "Masculino"], ["female", "Feminino"]];
const MARITAL_OPTS = [
  ["single", "Solteiro(a)"], ["married", "Casado(a) ou união estável"],
  ["divorced", "Divorciado(a)"], ["widower", "Viúvo(a)"],
];
const RESIDENCE_TYPE_OPTS = [
  ["apartment", "Apartamento"], ["house", "Casa"], ["condominium", "Casa em condomínio"],
  ["farm", "Chácara"], ["other", "Outro"],
];
const RESIDENCE_GARAGE_OPTS = [
  ["yes_with_electronic_gate", "Sim, com portão eletrônico"],
  ["yes_without_electronic_gate", "Sim, sem portão eletrônico"],
  ["not_kept_in_garage", "Tenho, mas não deixo o carro nela"],
  ["no_garage", "Não tenho garagem"],
];
const UTILIZATION_OPTS = [["personal", "Pessoal (dia a dia, lazer)"], ["job", "Trabalho"], ["both", "Pessoal e trabalho"]];
const JOB_GARAGE_OPTS = [
  ["yes", "Sim, tem garagem ou estacionamento"], ["no", "Não tem"],
  ["not_kept_in_garage", "Tem, mas não deixo o carro nela"],
  ["does_not_use", "Não vou de carro ao trabalho"], ["does_not_work", "Não trabalho"],
];
const STUDY_GARAGE_OPTS = [
  ["yes", "Sim, tem garagem ou estacionamento"], ["no", "Não tem"],
  ["not_kept_in_garage", "Tem, mas não deixo o carro nela"],
  ["does_not_use", "Não vou de carro ao estudo"], ["does_not_study", "Não estudo"],
];
const OTHER_DRIVER_OPTS = [
  ["does_not_exist", "Não, só eu"], ["yes_does_not_use", "Mora, mas não dirige este carro"],
  ["yes_male", "Sim, homem"], ["yes_female", "Sim, mulher"], ["yes_both", "Sim, homem e mulher"],
];
const SECONDARY_AGE_OPTS = [["age_18_to_24", "18 a 24 anos"], ["age_25", "25 anos ou mais"]];
const TAX_EXEMPTION_OPTS = [
  ["not_isent", "Sem isenção"], ["pcd_isent", "PCD com isenção"], ["pcd_not_isent", "PCD sem isenção"],
  ["ipi", "Isenção de IPI"], ["icms", "Isenção de ICMS"], ["ipi_icms", "Isenção de IPI e ICMS"],
];
const RENEWAL_INSURER_OPTS = [
  ["porto", "Porto Seguro"], ["azul", "Azul Seguros"], ["itau", "Itaú Seguros"], ["allianz", "Allianz"],
  ["liberty", "Liberty"], ["bradesco", "Bradesco Seguros"], ["suhai", "Suhai"], ["hdi", "HDI"],
  ["tokio", "Tokio Marine"], ["mapfre", "Mapfre"], ["sompo", "Sompo"], ["zurich", "Zurich"],
  ["mitsui", "Mitsui Sumitomo"], ["youse", "Youse"], ["sura", "Sura"], ["alfa", "Alfa"],
  ["generali", "Generali"], ["santander", "Santander"], ["caixa", "Caixa Seguradora"],
  ["sul_america_cia_nacional_auto", "SulAmérica"],
];
const BONUS_CLASSES = Array.from({ length: 11 }, (_, i) => String(i));

const EMPTY_QUESTIONS = {
  moradia: "", garagemCasa: "", utilizacao: "", garagemTrabalho: "", garagemEstudo: "",
  outroCondutor: "", idadeOutro: "", kmMes: "", distTrabalho: "",
  zeroKm: "", financiado: "", rastreador: "",
  blindado: false, kitGas: false, chassiRemarcado: false, isencao: "not_isent",
  temSeguro: "", seguradoraAtual: "", fimVigencia: "", classeBonus: "", sinistros: "",
};

function ageFrom(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || "")) return null;
  const birth = new Date(`${isoDate}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// Depois disso, quem não respondeu é dado como "não respondeu a tempo" e a
// conexão com a Segfy é encerrada (o spinner não pode girar para sempre).
const RESULTS_TIMEOUT_MS = 3 * 60 * 1000;

// Rótulos em português para o status de cada resultado (enum do swagger).
const RESULT_STATUS_LABELS = {
  failure: "Não conseguiu cotar",
  restriction: "Não aceitou este perfil",
  pre_validation: "Recusou algum dado da cotação",
  pre_insurer_validation: "Recusou algum dado da cotação",
  exception: "Erro técnico na seguradora",
  timeout: "Não respondeu a tempo",
  unavailable: "Indisponível no momento",
  site_unavailable: "Indisponível no momento",
  login_invalid: "Acesso da corretora inválido nesta seguradora",
  manual: "Exige análise manual da corretora",
};
const INSURER_LABELS = Object.fromEntries(RENEWAL_INSURER_OPTS);

function coverageTypeOf(result) {
  return result?.company_coverages?.coverage_type || "";
}
function isComprehensive(result) {
  return /compreens/i.test(coverageTypeOf(result));
}
function stripHtml(text) {
  return String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function segfyApi(action, body) {
  const res = await fetch(`/api/segfy/vehicle/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.status !== "OK") {
    const message = data?.message || data?.error || `Falha em ${action} (HTTP ${res.status}).`;
    throw new Error(message);
  }
  return data;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

// Tempo de cooldown (ms) entre submissões — impede que o mesmo usuário
// dispare múltiplas cotações seguidas sem nenhum intervalo.
const SUBMIT_COOLDOWN_MS = 30_000;

const money = (v) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Seguradoras e fórmula de prêmio 100% fictícias — só para o protótipo
// parecer plausível na demonstração. Somem assim que o bundle real da Segfy
// entrar (ele já traz as seguradoras e os valores de verdade).
const MOCK_INSURERS = [
  { name: "Porto Seguro", factor: 0.031 },
  { name: "HDI Seguros", factor: 0.027 },
  { name: "Allianz", factor: 0.034 },
];

function mockQuote(car, factor) {
  const base = (car.price || 150000) * factor;
  return { annual: Math.round(base / 10) * 10, monthly: Math.round(base / 12) };
}

function onlyDigits(s) {
  return (s || "").replace(/\D/g, "");
}
function maskCpf(v) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim().replace(/-$/, "");
}
function maskCep(v) {
  return onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

// ---------------------------------------------------------------------------
// Validação de CPF (dígito verificador)
// ---------------------------------------------------------------------------
// Verifica os dois dígitos verificadores conforme o algoritmo da Receita
// Federal. Rejeita CPFs com todos os dígitos iguais (ex.: 111.111.111-11),
// que passam na checagem de comprimento mas são obviamente inválidos.
function isValidCpf(raw) {
  const d = onlyDigits(raw);
  if (d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false; // todos os dígitos iguais

  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += parseInt(d[i]) * (len + 1 - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(9) === parseInt(d[9]) && calc(10) === parseInt(d[10]);
}

const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 1 - i);

export default function InsuranceModal({ car, onClose, T, onOpenPrivacy }) {
  const useRealWidget = Boolean(SEGFY_TOKEN) && !SEGFY_API_MODE;
  const useApiMode = SEGFY_API_MODE;

  const [step, setStep] = useState("form"); // form -> loading -> results
  const [form, setForm] = useState({
    nome: "", cpf: "", telefone: "", email: "", cep: "", ano: "", uso: "particular",
    nascimento: "", sexo: "", estadoCivil: "",
  });
  const [formStep, setFormStep] = useState(1); // modo API: 1 = seus dados, 2 = uso do carro
  const [q, setQ] = useState(EMPTY_QUESTIONS);
  const [professionQuery, setProfessionQuery] = useState("");
  const [professionOptions, setProfessionOptions] = useState([]);
  const [profession, setProfession] = useState(null); // { id, name } escolhido na lista da Segfy
  const [consent, setConsent] = useState(false);
  const [mockResults, setMockResults] = useState(null);
  const [mockHired, setMockHired] = useState(null); // nome da seguradora "contratada" na demo

  // ---- modo API própria: marca/modelo reais da Segfy + resultados via socket ----
  const [brands, setBrands] = useState([]);
  const [brandsError, setBrandsError] = useState(null);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [models, setModels] = useState([]);
  const [modelsError, setModelsError] = useState(null);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [apiError, setApiError] = useState(null);
  const [quoteResults, setQuoteResults] = useState([]);
  const [resultsDone, setResultsDone] = useState(false);
  const [quoteGuid, setQuoteGuid] = useState(null);
  const [choosingId, setChoosingId] = useState(null);
  const [chooseError, setChooseError] = useState(null);
  const [chosen, setChosen] = useState(null); // { result, customerEmailSent, payment }
  // Plano clicado aguardando a forma de pagamento preferida.
  const [pendingChoice, setPendingChoice] = useState(null);
  const [payMethod, setPayMethod] = useState(""); // "" = decidir com a D&B
  const [payCount, setPayCount] = useState(0);
  const resultsTimerRef = useRef(null);
  const socketRef = useRef(null);
  const brandAutoPickedRef = useRef(false);

  // Honeypot: campo oculto para detectar bots. Humanos não o veem nem o
  // preenchem — se tiver conteúdo, o envio é silenciosamente bloqueado.
  const [honeypot, setHoneypot] = useState("");

  // Cooldown pós-submit: evita múltiplas cotações em sequência rápida.
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownRef = useRef(null);

  // Debounce de submissão: bloqueia o botão durante o processamento para
  // evitar duplo clique ou submissões acidentais.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const cpfValid = isValidCpf(form.cpf);

  const setQuestion = (k, v) => setQ((prev) => ({ ...prev, [k]: v }));

  const age = ageFrom(form.nascimento);
  const ageValid = age != null && age >= 18 && age <= 100;

  const baseDataValid =
    form.nome.trim().length > 3 &&
    cpfValid &&
    onlyDigits(form.telefone).length >= 10 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.ano;

  // Etapa 1 do modo API: dados pessoais do segurado/condutor + veículo.
  const step1Valid =
    baseDataValid &&
    selectedModelId &&
    onlyDigits(form.cep).length === 8 &&
    ageValid &&
    form.sexo &&
    form.estadoCivil &&
    profession;

  const hasOtherDriver = q.outroCondutor.startsWith("yes_") && q.outroCondutor !== "yes_does_not_use";
  const usesCarForWork = q.utilizacao === "job" || q.utilizacao === "both";

  // Etapa 2 do modo API: questionário de risco + renovação.
  const step2Valid =
    q.moradia && q.garagemCasa && q.utilizacao && q.garagemTrabalho && q.garagemEstudo &&
    q.outroCondutor && (!hasOtherDriver || q.idadeOutro) &&
    Number(q.kmMes) > 0 && (!usesCarForWork || Number(q.distTrabalho) > 0) &&
    q.zeroKm && q.financiado && q.rastreador && q.isencao &&
    (q.temSeguro === "nao" ||
      (q.temSeguro === "sim" && q.seguradoraAtual && q.fimVigencia && q.classeBonus !== "" && q.sinistros !== ""));

  const canSubmit =
    baseDataValid &&
    consent &&
    cooldownLeft === 0 &&
    !isSubmitting &&
    (!useApiMode || (step1Valid && step2Valid && QUOTED_INSURERS.length > 0));

  // Inicia contagem regressiva do cooldown.
  const startCooldown = useCallback(() => {
    setCooldownLeft(SUBMIT_COOLDOWN_MS / 1000);
    cooldownRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // ---- modo API própria: carrega marcas reais da Segfy ao abrir o modal ----
  useEffect(() => {
    if (!useApiMode) return;
    let cancelled = false;

    segfyApi("brand-list", { data: { vehicle_type: SEGFY_VEHICLE_TYPE } })
      .then((res) => {
        if (cancelled) return;
        setBrands(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setBrandsError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [useApiMode]);

  // Pré-seleciona a marca da Segfy que combina com a marca do catálogo (só
  // uma vez — depois disso o usuário tem total liberdade pra trocar).
  useEffect(() => {
    if (!useApiMode || brandAutoPickedRef.current || brands.length === 0) return;
    const match = brands.find((b) => b.value.toLowerCase() === (car.brand || "").toLowerCase());
    if (match) setSelectedBrandId(match.id);
    brandAutoPickedRef.current = true;
  }, [useApiMode, brands, car.brand]);

  // ---- modo API própria: carrega modelos reais quando marca + ano estão definidos ----
  useEffect(() => {
    if (!useApiMode || !selectedBrandId || !form.ano) {
      setModels([]);
      setSelectedModelId("");
      return;
    }
    const brand = brands.find((b) => b.id === selectedBrandId);
    if (!brand) return;

    let cancelled = false;
    setModelsLoading(true);
    setModelsError(null);
    setSelectedModelId("");

    segfyApi("model-list", {
      data: { vehicle_type: SEGFY_VEHICLE_TYPE, model_year: Number(form.ano), brand_id: brand.id, brand: brand.value },
    })
      .then((res) => {
        if (cancelled) return;
        setModels(res.data?.models || []);
      })
      .catch((err) => {
        if (!cancelled) setModelsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setModelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useApiMode, selectedBrandId, form.ano, brands]);

  // ---- modo API própria: busca de profissão na lista da Segfy (com debounce) ----
  useEffect(() => {
    if (!useApiMode || profession || professionQuery.trim().length < 3) {
      setProfessionOptions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      segfyApi("profession-list", { data: { profession: professionQuery.trim() } })
        .then((res) => {
          if (!cancelled) setProfessionOptions((res.data || []).slice(0, 8));
        })
        .catch(() => {
          if (!cancelled) setProfessionOptions([]);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [useApiMode, professionQuery, profession]);

  // Encerra a conexão do socket (e o timer de resultados) ao fechar o modal.
  useEffect(() => () => {
    socketRef.current?.disconnect();
    clearTimeout(resultsTimerRef.current);
  }, []);

  // Todas as seguradoras pedidas responderam: encerra antes do tempo limite.
  // (A Segfy às vezes inclui outras do mesmo grupo, ex.: via portal da Porto;
  // elas aparecem na lista, mas não contam para o total.)
  const quotedNames = new Set(QUOTED_INSURERS.map((ins) => ins.name));
  const respondedInsurers = new Set(quoteResults.map((r) => r.company?.name).filter((n) => quotedNames.has(n)));
  useEffect(() => {
    if (resultsDone || respondedInsurers.size < QUOTED_INSURERS.length) return;
    clearTimeout(resultsTimerRef.current);
    socketRef.current?.disconnect();
    setResultsDone(true);
  }, [resultsDone, respondedInsurers.size]);

  // Agrupa por seguradora. Cada uma pode devolver vários produtos (o "ok" e
  // os additional_product), e nem todos são cobertura completa: a Suhai, por
  // exemplo, devolve como principal um seguro só de roubo/furto. Por isso o
  // destaque de cada seguradora é o produto compreensivo mais barato; o resto
  // vai para "outras opções". Seguradoras com preço vêm antes, da mais barata.
  const insurerGroups = Object.values(
    quoteResults.reduce((acc, r) => {
      const name = r.company?.name || "seguradora";
      (acc[name] ||= { name, priced: [], failures: [] })[r.premium != null ? "priced" : "failures"].push(r);
      return acc;
    }, {})
  )
    .map((g) => {
      const byPrice = [...g.priced].sort((a, b) => a.premium - b.premium);
      const main = byPrice.find(isComprehensive) || byPrice[0] || null;
      return { ...g, main, others: byPrice.filter((r) => r !== main) };
    })
    .sort((a, b) => {
      if (!a.main !== !b.main) return a.main ? -1 : 1;
      if (a.main && b.main && isComprehensive(a.main) !== isComprehensive(b.main)) return isComprehensive(a.main) ? -1 : 1;
      return (a.main?.premium ?? 0) - (b.main?.premium ?? 0);
    });
  const pricedCount = insurerGroups.filter((g) => g.main).length;

  // ---- caminho real: injeta o bundle White Label da Segfy quando houver token ----
  useEffect(() => {
    if (!useRealWidget || step !== "results") return;

    window.__SEGFY_CALLBACKS__ = {
      calculo: (result) => console.log("[Segfy] cálculo:", result),
      impressao: (result) => console.log("[Segfy] impressão:", result),
    };

    const script = document.createElement("script");
    script.id = "segfy-auto-bundle";
    script.type = "module";
    script.src = SEGFY_SCRIPT_URL;
    script.dataset.container = SEGFY_CONTAINER_ID;
    script.dataset.environment = SEGFY_ENV;
    script.dataset.token = SEGFY_TOKEN;
    script.dataset.id = "";
    document.body.appendChild(script);

    return () => {
      document.getElementById("segfy-auto-bundle")?.remove();
      delete window.__SEGFY_CALLBACKS__;
    };
  }, [useRealWidget, step]);

  const handleSubmitApi = () => {
    const model = models.find((m) => m.model_id === selectedModelId);
    const brand = brands.find((b) => b.id === selectedBrandId);
    if (!model || !brand) return;

    setIsSubmitting(true);
    setApiError(null);
    setQuoteResults([]);
    setResultsDone(false);
    setQuoteGuid(null);
    setChosen(null);
    setChooseError(null);
    clearTimeout(resultsTimerRef.current);
    setStep("loading");

    const roomId = crypto.randomUUID();
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const socket = io(SEGFY_SOCKET_URL, { transports: ["websocket"], auth: { roomId } });
    socketRef.current = socket;
    socket.on(roomId, (message) => {
      // Só ação e status no console (nunca os dados), para diagnóstico.
      console.info("[Segfy socket]", message?.action, message?.data?.company?.name ?? "", message?.data?.status ?? "");
      if (message?.action === "RESULT" && message.data) {
        setQuoteResults((prev) => [...prev.filter((r) => r.id !== message.data.id), message.data]);
      }
    });

    socket.on("connect", () => {
      segfyApi("calculate", {
        config: {
          insurers: QUOTED_INSURERS,
          callback: roomId,
          reference: "escolha-seu-ev",
        },
        data: {
          quotation_date: toIsoDate(today),
          validity_start: toIsoDate(today),
          validity_end: toIsoDate(nextYear),
          zip_code: onlyDigits(form.cep),
          customer: {
            document: onlyDigits(form.cpf),
            name: form.nome,
            email: form.email,
            cellphone: onlyDigits(form.telefone),
            birth_date: form.nascimento,
            sex: form.sexo,
          },
          // A cotação considera o próprio segurado como condutor principal
          // (avisado na tela), por isso os dados dele se repetem aqui.
          main_driver: {
            relationship: "himself",
            document: onlyDigits(form.cpf),
            name: form.nome,
            birth_date: form.nascimento,
            sex: form.sexo,
            marital_status: form.estadoCivil,
            profession: profession.id,
          },
          renewal:
            q.temSeguro === "sim"
              ? {
                  insurer: q.seguradoraAtual,
                  prior_policy_end: q.fimVigencia,
                  bonus_last: q.classeBonus,
                  claim_amount: q.sinistros,
                }
              : { insurer: "new" },
          questionnaire: {
            residence_garage: q.garagemCasa,
            job_garage: q.garagemTrabalho,
            study_garage: q.garagemEstudo,
            utilization_type: q.utilizacao,
            other_driver: q.outroCondutor,
            ...(hasOtherDriver ? { secondary_driver_age: q.idadeOutro } : {}),
            monthly_km: Number(q.kmMes),
            work_distance: usesCarForWork ? Number(q.distTrabalho) : 0,
            residence_type: q.moradia,
            tax_exemption: q.isencao,
          },
          vehicle: {
            vehicle_type: SEGFY_VEHICLE_TYPE,
            manufacture_year: Number(form.ano),
            model_year: Number(form.ano),
            brand: brand.value,
            model: model.value,
            fipe_code: model.data_fipe?.fipe_code,
            fipe_value: String(model.data_fipe?.fipe_value ?? ""),
            category_type: form.uso === "app" ? "app_transport" : "particular",
            fuel_type: model.fuel_type,
            zero_km: q.zeroKm === "sim",
            alienated: q.financiado === "sim",
            anti_theft: q.rastreador === "sim",
            armored: q.blindado,
            gas_kit: q.kitGas,
            chassis_relabeled: q.chassiRemarcado,
          },
          coverage: DEFAULT_COVERAGE,
        },
      })
        .then((res) => {
          setQuoteGuid(res.guid || null);
          setStep("results");
          setIsSubmitting(false);
          startCooldown();
          resultsTimerRef.current = setTimeout(() => {
            setResultsDone(true);
            socket.disconnect();
          }, RESULTS_TIMEOUT_MS);
        })
        .catch((err) => {
          setApiError(err.message);
          setStep("form");
          setIsSubmitting(false);
          socket.disconnect();
        });
    });
  };

  // Cliente escolheu um plano: o backend confere na Segfy, marca o favorito e
  // dispara os e-mails (D&B + resumo para o cliente).
  const startChoice = (result) => {
    const headline = headlineInstallment(result) || paymentOptions(result)[0];
    setPendingChoice(result);
    setPayMethod(headline?.method || "");
    setPayCount(headline?.best.count || 0);
    setChooseError(null);
  };

  const handleChoose = async (result) => {
    if (!quoteGuid || choosingId) return;
    setChoosingId(result.id);
    setChooseError(null);
    try {
      const res = await fetch("/api/segfy/choose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guid: quoteGuid,
          resultId: result.id,
          ...(payMethod ? { paymentMethod: payMethod, installments: payCount } : {}),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Não conseguimos registrar sua escolha agora.");
      setChosen({ result, customerEmailSent: data.customerEmailSent, payment: data.payment || null });
      setPendingChoice(null);
    } catch (err) {
      setChooseError(err.message);
    } finally {
      setChoosingId(null);
    }
  };

  const handleSubmit = () => {
    // Defesa dupla: checar honeypot e canSubmit antes de qualquer coisa.
    if (!canSubmit) return;
    if (honeypot) return; // bot detectado — falha silenciosa

    if (useApiMode) {
      handleSubmitApi();
      return;
    }

    setIsSubmitting(true);
    setStep("loading");

    setTimeout(() => {
      if (!useRealWidget) {
        setMockResults(MOCK_INSURERS.map((ins) => ({ name: ins.name, ...mockQuote(car, ins.factor) })));
      }
      setStep("results");
      setIsSubmitting(false);
      startCooldown();
    }, 1500);
  };

  const fieldStyle = {
    background: T.bg, border: `1px solid ${T.line}`, borderRadius: 7, padding: "9px",
    color: T.ink, fontSize: 13, boxSizing: "border-box", width: "100%",
  };
  const labelStyle = { fontSize: 12.5, color: T.ink, fontWeight: 600, display: "flex", flexDirection: "column", gap: 5 };

  // Indicador de validade do CPF — só aparece depois que o usuário começa a
  // digitar (para não mostrar erro antes de qualquer interação).
  const cpfTouched = onlyDigits(form.cpf).length > 0;
  const cpfBorderColor = !cpfTouched ? T.line : cpfValid ? T.good : T.warn;

  const showStep1 = !useApiMode || formStep === 1;
  const showStep2 = useApiMode && formStep === 2;
  const sectionTitleStyle = {
    fontFamily: "'Manrope', sans-serif", fontSize: 13, fontWeight: 700, color: T.ink,
    margin: "4px 0 10px", paddingTop: 12, borderTop: `1px solid ${T.line}`,
  };
  const hintStyle = { fontSize: 10.5, color: T.inkDim, marginTop: 2, fontWeight: 400 };

  // Select genérico das perguntas do questionário (etapa 2).
  const questionSelect = (label, key, opts, extra) => (
    <label style={labelStyle}>
      {label}
      <select value={q[key]} onChange={(e) => setQuestion(key, e.target.value)} style={fieldStyle}>
        <option value="">Selecione</option>
        {opts.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
      {extra}
    </label>
  );
  const YES_NO = [["sim", "Sim"], ["nao", "Não"]];
  const twoCols = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 12 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 70, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.panel, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "92vh", overflow: "auto", padding: 16, margin: "0 auto", maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <img
              src={T.mode === "dark" ? "/brand/db-corretora-logo.png" : "/brand/db-corretora-logo-navy.png"}
              alt="D&B Corretora"
              style={{ height: 34, width: "auto", flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 7 }}>
                <ShieldCheck size={17} color={T.accent} /> Cotar seguro: {car.name}
              </div>
              <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>Cotação via Segfy, processada pela D&B Corretora</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: T.panelAlt, border: `1px solid ${T.line}`, color: T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {!useRealWidget && !useApiMode && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, padding: "9px 10px",
            borderRadius: 8, background: hexA(T.accent2, 0.1), border: `1px dashed ${T.accent2}`,
          }}>
            <FlaskConical size={14} color={T.accent2} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
              <strong>Protótipo de demonstração.</strong> As seguradoras e valores abaixo são fictícios, servem
              para validar o fluxo com o parceiro antes de conectarmos a API real da Segfy (falta o token de
              integração da corretora).
            </div>
          </div>
        )}

        {step === "form" && (
          <>
            {useApiMode && (
              <div style={{ fontSize: 11, fontWeight: 700, color: T.accentText || T.accent, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 8 }}>
                Etapa {formStep} de 2 · {formStep === 1 ? "Seus dados e o carro" : "Como o carro é usado"}
              </div>
            )}
            {showStep1 && (
            <>
            <div style={{ fontSize: 12, color: T.inkDim, marginBottom: 16, lineHeight: 1.5 }}>
              Preencha seus dados para cotar o seguro deste veículo. Suas informações são compartilhadas com a
              Segfy e a D&B Corretora apenas para gerar e processar a cotação; veja como tratamos seus
              dados na{" "}
              <button
                type="button"
                onClick={onOpenPrivacy}
                style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: 0, font: "inherit", textDecoration: "underline" }}
              >
                Política de Privacidade
              </button>.
            </div>

            {/* Honeypot: visualmente oculto, inacessível para humanos.
                Bots que preenchem todos os campos serão silenciosamente
                bloqueados no handleSubmit. Não usar display:none (alguns
                bots detectam) — usar posição absoluta fora da tela. */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label>
                Não preencha este campo
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <label style={{ ...labelStyle, marginBottom: 12 }}>
              Nome completo
              <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como no documento" style={fieldStyle} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <label style={labelStyle}>
                CPF
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.cpf}
                  onChange={(e) => set("cpf", maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  style={{ ...fieldStyle, borderColor: cpfBorderColor }}
                />
                {cpfTouched && !cpfValid && (
                  <span style={{ fontSize: 10.5, color: T.warn, marginTop: 2 }}>CPF inválido</span>
                )}
              </label>
              <label style={labelStyle}>
                Telefone
                <input type="text" inputMode="numeric" value={form.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} placeholder="(00) 00000-0000" style={fieldStyle} />
              </label>
            </div>

            <label style={{ ...labelStyle, marginBottom: 12 }}>
              E-mail
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@email.com" style={fieldStyle} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              <label style={labelStyle}>
                CEP {!useApiMode && <span style={{ fontWeight: 400, color: T.inkDim }}>opc.</span>}
                <input type="text" inputMode="numeric" value={form.cep} onChange={(e) => set("cep", maskCep(e.target.value))} placeholder="00000-000" style={fieldStyle} />
              </label>
              <label style={labelStyle}>
                Ano do veículo
                <select value={form.ano} onChange={(e) => set("ano", e.target.value)} style={fieldStyle}>
                  <option value="">—</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Uso
                <select value={form.uso} onChange={(e) => set("uso", e.target.value)} style={fieldStyle}>
                  <option value="particular">Particular</option>
                  <option value="app">Apps (99/Uber)</option>
                </select>
              </label>
            </div>

            {useApiMode && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <label style={labelStyle}>
                  Marca (catálogo Segfy)
                  <select value={selectedBrandId} onChange={(e) => setSelectedBrandId(e.target.value)} style={fieldStyle}>
                    <option value="">—</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.text}</option>)}
                  </select>
                  {brandsError && <span style={{ fontSize: 10.5, color: T.warn, marginTop: 2 }}>{brandsError}</span>}
                </label>
                <label style={labelStyle}>
                  Modelo
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    disabled={!selectedBrandId || !form.ano || modelsLoading}
                    style={fieldStyle}
                  >
                    <option value="">{modelsLoading ? "Carregando…" : "—"}</option>
                    {models.map((m) => <option key={m.model_id} value={m.model_id}>{m.text}</option>)}
                  </select>
                  {!selectedBrandId || !form.ano ? (
                    <span style={{ fontSize: 10.5, color: T.inkDim, marginTop: 2 }}>Escolha marca e ano primeiro</span>
                  ) : modelsError ? (
                    <span style={{ fontSize: 10.5, color: T.warn, marginTop: 2 }}>{modelsError}</span>
                  ) : null}
                </label>
              </div>
            )}

            {useApiMode && (
              <>
                <div style={sectionTitleStyle}>Sobre o condutor principal</div>
                <div style={{ fontSize: 11.5, color: T.inkDim, marginBottom: 12, lineHeight: 1.5 }}>
                  A cotação considera você como a pessoa que mais dirige o carro. Se for outra pessoa, fale com a
                  D&B Corretora para cotar no nome certo.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
                  <label style={labelStyle}>
                    Data de nascimento
                    <input type="date" value={form.nascimento} onChange={(e) => set("nascimento", e.target.value)} style={fieldStyle} />
                    {form.nascimento && !ageValid && <span style={{ ...hintStyle, color: T.warn }}>É preciso ter 18 anos ou mais</span>}
                  </label>
                  <label style={labelStyle}>
                    Sexo
                    <select value={form.sexo} onChange={(e) => set("sexo", e.target.value)} style={fieldStyle}>
                      <option value="">Selecione</option>
                      {SEX_OPTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  </label>
                  <label style={labelStyle}>
                    Estado civil
                    <select value={form.estadoCivil} onChange={(e) => set("estadoCivil", e.target.value)} style={fieldStyle}>
                      <option value="">Selecione</option>
                      {MARITAL_OPTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                  </label>
                </div>
                <label style={{ ...labelStyle, marginBottom: 16, position: "relative" }}>
                  Profissão
                  <input
                    type="text"
                    value={profession ? profession.name : professionQuery}
                    onChange={(e) => {
                      setProfession(null);
                      setProfessionQuery(e.target.value);
                    }}
                    placeholder="Digite e escolha na lista"
                    autoComplete="off"
                    style={{ ...fieldStyle, borderColor: profession ? T.good : T.line }}
                  />
                  {!profession && professionOptions.length > 0 && (
                    <div role="listbox" style={{ display: "flex", flexDirection: "column", border: `1px solid ${T.line}`, borderRadius: 7, background: T.bg, overflow: "hidden" }}>
                      {professionOptions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          role="option"
                          onClick={() => setProfession(p)}
                          style={{ textAlign: "left", background: "none", border: "none", borderBottom: `1px solid ${T.line}`, padding: "9px", color: T.ink, fontSize: 13, cursor: "pointer" }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {!profession && professionQuery.trim().length >= 3 && professionOptions.length === 0 && (
                    <span style={hintStyle}>Nenhuma profissão encontrada ainda. Tente outra palavra.</span>
                  )}
                </label>
              </>
            )}
            </>
            )}

            {showStep2 && (
              <>
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  style={{ background: "none", border: "none", color: T.accentText || T.accent, cursor: "pointer", padding: 0, fontSize: 12, fontWeight: 600, marginBottom: 12 }}
                >
                  ← Voltar para seus dados
                </button>

                <div style={{ ...sectionTitleStyle, borderTop: "none", paddingTop: 0 }}>Onde você mora e guarda o carro</div>
                <div style={twoCols}>
                  {questionSelect("Tipo de moradia", "moradia", RESIDENCE_TYPE_OPTS)}
                  {questionSelect("Tem garagem em casa?", "garagemCasa", RESIDENCE_GARAGE_OPTS)}
                </div>

                <div style={sectionTitleStyle}>Como você usa o carro</div>
                <div style={twoCols}>
                  {questionSelect("Uso principal", "utilizacao", UTILIZATION_OPTS)}
                  <label style={labelStyle}>
                    Quantos km roda por mês?
                    <input type="text" inputMode="numeric" value={q.kmMes} onChange={(e) => setQuestion("kmMes", onlyDigits(e.target.value).slice(0, 5))} placeholder="Ex.: 1000" style={fieldStyle} />
                    <span style={hintStyle}>Um valor aproximado já serve</span>
                  </label>
                </div>
                <div style={twoCols}>
                  {questionSelect("Garagem no trabalho?", "garagemTrabalho", JOB_GARAGE_OPTS)}
                  {questionSelect("Garagem no local de estudo?", "garagemEstudo", STUDY_GARAGE_OPTS)}
                </div>
                {usesCarForWork && (
                  <div style={twoCols}>
                    <label style={labelStyle}>
                      Distância de casa até o trabalho (km)
                      <input type="text" inputMode="numeric" value={q.distTrabalho} onChange={(e) => setQuestion("distTrabalho", onlyDigits(e.target.value).slice(0, 4))} placeholder="Ex.: 15" style={fieldStyle} />
                    </label>
                  </div>
                )}
                <div style={twoCols}>
                  {questionSelect("Mais alguém que mora com você dirige este carro?", "outroCondutor", OTHER_DRIVER_OPTS)}
                  {hasOtherDriver && questionSelect("Idade de quem mais dirige", "idadeOutro", SECONDARY_AGE_OPTS)}
                </div>

                <div style={sectionTitleStyle}>Sobre o carro</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
                  {questionSelect("É 0 km?", "zeroKm", YES_NO)}
                  {questionSelect("É financiado?", "financiado", YES_NO, <span style={hintStyle}>Alienado ao banco</span>)}
                  {questionSelect("Tem rastreador?", "rastreador", YES_NO, <span style={hintStyle}>Ou bloqueador</span>)}
                </div>
                <details style={{ marginBottom: 12, fontSize: 12.5, color: T.ink }}>
                  <summary style={{ cursor: "pointer", fontWeight: 600, color: T.inkDim, fontSize: 12 }}>
                    Meu carro tem algo diferente (blindagem, kit gás, isenção…)
                  </summary>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                    {[["blindado", "É blindado"], ["kitGas", "Tem kit gás (GNV)"], ["chassiRemarcado", "Tem chassi remarcado"]].map(([k, text]) => (
                      <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={q[k]} onChange={(e) => setQuestion(k, e.target.checked)} />
                        {text}
                      </label>
                    ))}
                    <label style={{ ...labelStyle, marginTop: 4 }}>
                      Isenção de impostos na compra
                      <select value={q.isencao} onChange={(e) => setQuestion("isencao", e.target.value)} style={fieldStyle}>
                        {TAX_EXEMPTION_OPTS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                      </select>
                    </label>
                  </div>
                </details>

                <div style={sectionTitleStyle}>Seguro atual</div>
                <div style={twoCols}>
                  {questionSelect("Este carro já tem seguro?", "temSeguro", [["nao", "Não, é um seguro novo"], ["sim", "Sim, quero renovar ou trocar"]])}
                  {q.temSeguro === "sim" && questionSelect("Seguradora atual", "seguradoraAtual", RENEWAL_INSURER_OPTS)}
                </div>
                {q.temSeguro === "sim" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
                    <label style={labelStyle}>
                      Fim da vigência
                      <input type="date" value={q.fimVigencia} onChange={(e) => setQuestion("fimVigencia", e.target.value)} style={fieldStyle} />
                    </label>
                    {questionSelect("Classe de bônus", "classeBonus", BONUS_CLASSES.map((c) => [c, c]), <span style={hintStyle}>Consta na apólice</span>)}
                    {questionSelect("Sinistros nesta vigência", "sinistros", [["0", "Nenhum"], ["1", "1"], ["2", "2"], ["3", "3 ou mais"]])}
                  </div>
                )}
              </>
            )}

            {useApiMode && QUOTED_INSURERS.length === 0 && (
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, padding: "9px 10px",
                borderRadius: 8, background: hexA(T.warn, 0.1), border: `1px dashed ${T.warn}`,
              }}>
                <AlertTriangle size={14} color={T.warn} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
                  <strong>Cotação ainda não liberada.</strong> Falta configurar quais seguradoras cotar e a
                  comissão de cada uma (constante <code>QUOTED_INSURERS</code> em <code>InsuranceModal.jsx</code>) —
                  isso depende de dados comerciais que só a D&B tem.
                </div>
              </div>
            )}

            {apiError && (
              <div style={{
                display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, padding: "9px 10px",
                borderRadius: 8, background: hexA(T.warn, 0.1), border: `1px solid ${T.warn}`,
              }}>
                <AlertTriangle size={14} color={T.warn} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>{apiError}</div>
              </div>
            )}

            {useApiMode && formStep === 1 && (
              <button
                onClick={() => setFormStep(2)}
                disabled={!step1Valid}
                style={{
                  width: "100%", background: step1Valid ? T.accent2 : T.panelAlt, color: step1Valid ? T.bg : T.inkDim,
                  border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 13.5,
                  cursor: step1Valid ? "pointer" : "not-allowed", transition: "background 0.2s",
                }}
              >
                Continuar
              </button>
            )}

            {(!useApiMode || formStep === 2) && (
            <>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 11.5, color: T.inkDim, lineHeight: 1.5 }}>
                Autorizo o compartilhamento dos dados acima com a Segfy e a D&B Corretora, exclusivamente
                para calcular e, se eu escolher, contratar o seguro deste veículo.
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%", background: canSubmit ? T.accent2 : T.panelAlt, color: canSubmit ? T.bg : T.inkDim,
                border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 13.5,
                cursor: canSubmit ? "pointer" : "not-allowed", transition: "background 0.2s",
              }}
            >
              {cooldownLeft > 0
                ? `Aguarde ${cooldownLeft}s para nova cotação`
                : "Calcular cotação"}
            </button>
            </>
            )}
          </>
        )}

        {step === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 10px", gap: 12 }}>
            <Loader2 size={28} color={T.accent} className="ev-spin" />
            <style>{`.ev-spin { animation: ev-spin-anim 0.9s linear infinite; } @keyframes ev-spin-anim { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: T.inkDim, textAlign: "center" }}>
              {useApiMode ? "Enviando cotação…" : `Calculando cotações${!useRealWidget ? " (demonstração)" : ""}…`}<br />
              {!useApiMode && <span style={{ fontSize: 11 }}>Porto Seguro · HDI · Allianz</span>}
            </div>
          </div>
        )}

        {step === "results" && useRealWidget && (
          <div id={SEGFY_CONTAINER_ID} />
        )}

        {step === "results" && useApiMode && chosen && (
          <div style={{ padding: 16, borderRadius: 10, background: hexA(T.good, 0.1), border: `1px solid ${T.good}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.ink, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <ShieldCheck size={16} color={T.good} /> Recebemos sua escolha
            </div>
            <div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.6 }}>
              {INSURER_LABELS[chosen.result.company?.name] || chosen.result.company?.name} · {chosen.result.product || "Tradicional"} por{" "}
              <strong>{money(chosen.result.premium)}/ano</strong>
              {chosen.payment ? `, ${chosen.payment}` : ""}.
              <br />
              A D&B Corretora vai entrar em contato com você em até 1 dia útil para finalizar o pagamento e emitir
              a sua apólice. Nenhum pagamento foi feito.
              <br />
              <span style={{ color: T.inkDim, fontSize: 11.5 }}>
                {chosen.customerEmailSent
                  ? "Enviamos um resumo da cotação para o seu e-mail."
                  : "Não conseguimos enviar o resumo por e-mail, mas a D&B já recebeu sua escolha."}
              </span>
            </div>
          </div>
        )}

        {step === "results" && useApiMode && !chosen && (
          <div>
            {chooseError && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 12, padding: "9px 10px", borderRadius: 8, background: hexA(T.warn, 0.1), border: `1px solid ${T.warn}` }}>
                <AlertTriangle size={14} color={T.warn} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>{chooseError}</div>
              </div>
            )}
            <style>{`.ev-spin { animation: ev-spin-anim 0.9s linear infinite; } @keyframes ev-spin-anim { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 11.5, color: T.inkDim, marginBottom: 10, display: "flex", alignItems: "center", gap: 5, lineHeight: 1.5 }}>
              {resultsDone ? (
                <span>
                  {respondedInsurers.size} de {QUOTED_INSURERS.length} seguradoras responderam
                  {pricedCount > 0 ? `, ${pricedCount} com preço.` : ". Nenhuma retornou preço desta vez."}
                </span>
              ) : (
                <>
                  <Loader2 size={12} className="ev-spin" />
                  Recebendo respostas das seguradoras ({respondedInsurers.size}/{QUOTED_INSURERS.length}). Pode levar
                  alguns minutos.
                </>
              )}
            </div>
            {pendingChoice && (() => {
              const options = paymentOptions(pendingChoice);
              const current = options.find((o) => o.method === payMethod);
              const planText = (o, plan) => formatPlan(o, plan, money).replace(` no ${o.label}`, "");
              return (
                <div style={{ padding: 14, borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Como você prefere pagar?</div>
                  <div style={{ fontSize: 12, color: T.inkDim, marginBottom: 12, lineHeight: 1.5 }}>
                    {INSURER_LABELS[pendingChoice.company?.name] || pendingChoice.company?.name} · {pendingChoice.product || "Tradicional"} ·{" "}
                    <strong style={{ color: T.ink }}>{money(pendingChoice.premium)}/ano</strong>. A D&B usa essa preferência para
                    agilizar o fechamento; o pagamento em si é feito depois, com ela.
                  </div>
                  <div role="radiogroup" style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    {options.map((o) => (
                      <label key={o.method} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="pay-method"
                          checked={payMethod === o.method}
                          onChange={() => {
                            setPayMethod(o.method);
                            setPayCount(o.best.count);
                          }}
                        />
                        <span style={{ textTransform: "capitalize" }}>{o.label}</span>
                        <span style={{ color: T.inkDim }}>· até {planText(o, o.best)}</span>
                      </label>
                    ))}
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="pay-method"
                        checked={payMethod === ""}
                        onChange={() => {
                          setPayMethod("");
                          setPayCount(0);
                        }}
                      />
                      Prefiro decidir com a D&B
                    </label>
                  </div>
                  {current && (
                    <label style={{ ...labelStyle, marginBottom: 12 }}>
                      Parcelas
                      <select value={payCount} onChange={(e) => setPayCount(Number(e.target.value))} style={fieldStyle}>
                        {current.plans.map((p) => (
                          <option key={p.count} value={p.count}>{planText(current, p)}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setPendingChoice(null)}
                      disabled={Boolean(choosingId)}
                      style={{ flex: "0 0 auto", background: "none", border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 14px", color: T.ink, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChoose(pendingChoice)}
                      disabled={!quoteGuid || Boolean(choosingId)}
                      style={{ flex: 1, background: T.accent2, color: T.bg, border: "none", borderRadius: 8, padding: "10px", fontWeight: 700, fontSize: 12.5, cursor: choosingId ? "wait" : "pointer" }}
                    >
                      {choosingId ? "Enviando sua escolha…" : "Confirmar escolha"}
                    </button>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: pendingChoice ? "none" : "flex", flexDirection: "column", gap: 8 }}>
              {insurerGroups.map((g) => {
                const insurerName = INSURER_LABELS[g.name] || g.name;
                const r = g.main;
                if (!r) {
                  const f = g.failures[0];
                  return (
                    <div key={g.name} style={{ padding: 12, borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{insurerName}</div>
                      <div style={{ fontSize: 11.5, color: T.warn }}>{RESULT_STATUS_LABELS[f?.status] || "Não cotou"}</div>
                      {stripHtml(f?.messages) && (
                        <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2, lineHeight: 1.4 }}>{stripHtml(f.messages)}</div>
                      )}
                    </div>
                  );
                }
                const fipePct = r.company_coverages?.fipe_percentage;
                const complete = isComprehensive(r);
                return (
                  <div key={g.name} style={{ padding: 12, borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{insurerName}</div>
                        <div style={{ fontSize: 11.5, color: T.inkDim }}>{r.product || "Tradicional"}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: T.accentText || T.accent2 }}>{money(r.premium)}/ano</div>
                        {r.franchise > 0 && (
                          <div style={{ fontSize: 11, color: T.inkDim }}>Franquia {money(r.franchise)}</div>
                        )}
                        {(() => {
                          const h = headlineInstallment(r);
                          return h ? (
                            <div style={{ fontSize: 11, color: T.ink, marginTop: 2 }}>ou {formatPlan(h, h.best, money)}</div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, marginTop: 6, color: complete ? T.good : T.warn, fontWeight: 600 }}>
                      {complete ? "Cobertura completa" : `Cobertura parcial: ${coverageTypeOf(r) || "confira com a D&B"}`}
                      {fipePct && fipePct < 100 ? ` · indeniza ${fipePct}% da FIPE` : ""}
                    </div>
                    {stripHtml(r.adjustments) && (
                      <div style={{ fontSize: 11, color: T.inkDim, marginTop: 4, lineHeight: 1.4 }}>{stripHtml(r.adjustments)}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => startChoice(r)}
                      disabled={!quoteGuid || Boolean(choosingId)}
                      style={{
                        marginTop: 10, width: "100%", background: T.accent2, color: T.bg, border: "none", borderRadius: 8,
                        padding: "10px", fontWeight: 700, fontSize: 12.5, cursor: choosingId ? "wait" : "pointer",
                        opacity: choosingId && choosingId !== r.id ? 0.5 : 1,
                      }}
                    >
                      Quero este plano
                    </button>
                    {g.others.length > 0 && (
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: "pointer", fontSize: 11.5, color: T.inkDim, fontWeight: 600 }}>
                          Outras opções desta seguradora ({g.others.length})
                        </summary>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                          {g.others.map((o) => (
                            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11.5, paddingTop: 6, borderTop: `1px solid ${T.line}` }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: T.ink }}>{o.product}</div>
                                <div style={{ color: isComprehensive(o) ? T.good : T.warn }}>
                                  {isComprehensive(o) ? "Cobertura completa" : "Cobertura parcial"}
                                  {o.company_coverages?.fipe_percentage < 100 ? ` · ${o.company_coverages.fipe_percentage}% da FIPE` : ""}
                                </div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: T.ink }}>{money(o.premium)}/ano</div>
                                <button
                                  type="button"
                                  onClick={() => startChoice(o)}
                                  disabled={!quoteGuid || Boolean(choosingId)}
                                  style={{ marginTop: 4, background: "none", border: `1px solid ${T.line}`, borderRadius: 6, padding: "4px 8px", color: T.ink, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                                >
                                  Quero este
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
              {resultsDone && QUOTED_INSURERS.filter((ins) => !respondedInsurers.has(ins.name)).map((ins) => (
                <div key={ins.name} style={{ padding: 12, borderRadius: 10, border: `1px dashed ${T.line}` }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{INSURER_LABELS[ins.name] || ins.name}</div>
                  <div style={{ fontSize: 11.5, color: T.inkDim }}>Não respondeu a tempo</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.inkDim, marginTop: 16, lineHeight: 1.5, textAlign: "center" }}>
              {pricedCount > 0
                ? "Escolha um plano e a D&B Corretora entra em contato com você em até 1 dia útil só para finalizar o pagamento. Nenhum pagamento acontece aqui no site."
                : resultsDone
                  ? "A D&B Corretora pode cotar com você diretamente, sem depender da resposta automática das seguradoras."
                  : null}
            </div>
          </div>
        )}

        {step === "results" && !useRealWidget && mockResults && (
          <div>
            {mockHired ? (
              <div style={{ padding: 16, borderRadius: 10, background: hexA(T.good, 0.1), border: `1px solid ${T.good}`, textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: T.good, marginBottom: 4 }}>Contratação simulada com {mockHired} ✓</div>
                <div style={{ fontSize: 11.5, color: T.inkDim, lineHeight: 1.5 }}>
                  Em produção, este passo abriria o checkout real da Segfy/corretora e a apólice cairia
                  diretamente no painel dela. Nenhum dinheiro foi movimentado aqui, isto é só o protótipo.
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: T.inkDim, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
                  <Info size={12} /> Valores fictícios, só para ilustrar o layout do resultado.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mockResults.map((r) => (
                    <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 12, borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: T.inkDim }}>Cobertura compreensiva · {form.uso === "app" ? "uso por app" : "uso particular"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: T.accent2 }}>{money(r.monthly)}/mês</div>
                        <div style={{ fontSize: 10.5, color: T.inkDim }}>ou {money(r.annual)}/ano</div>
                      </div>
                      <button
                        onClick={() => setMockHired(r.name)}
                        style={{ flexShrink: 0, background: T.accent2, color: T.bg, border: "none", borderRadius: 8, padding: "9px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                      >
                        Contratar
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20,
          paddingTop: 14, borderTop: `1px solid ${T.line}`,
        }}>
          <span style={{ fontSize: 10.5, color: T.inkDim }}>Cotação operada por</span>
          <a
            href="https://dbcorr.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none", color: T.ink }}
          >
            <img src={T.mode === "dark" ? "/brand/db-corretora-logo.png" : "/brand/db-corretora-logo-navy.png"} alt="D&B Corretora" style={{ height: 15, width: "auto" }} />
            <span style={{ fontSize: 11, fontWeight: 700 }}>D&B Corretora</span>
          </a>
        </div>
      </div>
    </div>
  );
}
