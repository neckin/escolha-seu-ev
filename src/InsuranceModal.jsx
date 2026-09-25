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

// TODO (bloqueante — falar com a D&B antes de ativar em produção):
// quais seguradoras cotar e a comissão de cada uma (config.insurers da Segfy).
// Isso é um dado comercial (comissão negociada por seguradora), não dá pra
// adivinhar — a tela fica bloqueada com um aviso enquanto isto estiver vazio.
// Formato: { name: "porto", commission: 0.2 } — nomes conforme o enum de
// seguradoras da própria Segfy (ex.: porto, hdi, allianz, azul, mapfre...).
const QUOTED_INSURERS = [];

// TODO (revisar com a D&B): pacote de cobertura padrão desta cotação "rápida".
// A API exige esses 7 campos em toda chamada; valores abaixo são um chute
// razoável de cobertura compreensiva, não o produto real que a D&B vende.
const DEFAULT_COVERAGE = {
  coverage_type: "comprehensive",
  franchise: "normal",
  fipe_percentage: 100,
  assistance: "assistance_200_km_referenced",
  glass: "glass_basic_referenced",
  body_injuries: 100000,
  material_damage: 100000,
};

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
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "", cep: "", ano: "", uso: "particular" });
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

  const canSubmit =
    form.nome.trim().length > 3 &&
    cpfValid &&
    onlyDigits(form.telefone).length >= 10 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.ano &&
    consent &&
    cooldownLeft === 0 &&
    !isSubmitting &&
    (!useApiMode || (selectedModelId && onlyDigits(form.cep).length === 8 && QUOTED_INSURERS.length > 0));

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

  // Encerra a conexão do socket ao fechar o modal.
  useEffect(() => () => socketRef.current?.disconnect(), []);

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
    setStep("loading");

    const roomId = crypto.randomUUID();
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const socket = io(SEGFY_SOCKET_URL, { transports: ["websocket"], auth: { roomId } });
    socketRef.current = socket;
    socket.on(roomId, (message) => {
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
          },
          main_driver: { relationship: "himself" },
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
          },
          coverage: DEFAULT_COVERAGE,
        },
      })
        .then(() => {
          setStep("results");
          setIsSubmitting(false);
          startCooldown();
        })
        .catch((err) => {
          setApiError(err.message);
          setStep("form");
          setIsSubmitting(false);
          socket.disconnect();
        });
    });
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
                  <option value="app">Apps (89/Uber)</option>
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

        {step === "results" && useApiMode && (
          <div>
            <div style={{ fontSize: 11, color: T.inkDim, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <Loader2 size={12} className="ev-spin" />
              <style>{`.ev-spin { animation: ev-spin-anim 0.9s linear infinite; } @keyframes ev-spin-anim { to { transform: rotate(360deg); } }`}</style>
              Recebendo respostas das seguradoras em tempo real ({quoteResults.length}/{QUOTED_INSURERS.length})…
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {quoteResults.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: 12, borderRadius: 10, background: T.panelAlt, border: `1px solid ${T.line}` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.company?.name || "Seguradora"}</div>
                    <div style={{ fontSize: 11, color: T.inkDim }}>
                      {r.status === "ok" ? r.product || "Tradicional" : (r.messages?.replace(/<[^>]+>/g, "") || r.status)}
                    </div>
                  </div>
                  {r.premium != null && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 15, color: T.accent2 }}>{money(r.premium)}/ano</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: T.inkDim, marginTop: 16, lineHeight: 1.5, textAlign: "center" }}>
              Pra fechar um desses planos, a D&B Corretora entra em contato com você — a contratação e o
              pagamento não acontecem aqui no site.
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
