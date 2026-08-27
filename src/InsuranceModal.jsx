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
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { X, ShieldCheck, Loader2, FlaskConical, Info } from "lucide-react";

const SEGFY_TOKEN = import.meta.env.VITE_SEGFY_TOKEN || "";
const SEGFY_ENV = import.meta.env.VITE_SEGFY_ENV || "production";
const SEGFY_SCRIPT_URL = "https://bundles.segfy.com/auto-bundle.js";
const SEGFY_CONTAINER_ID = "segfy-app-propostas";

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

const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + 1 - i);

export default function InsuranceModal({ car, onClose, T, onOpenPrivacy }) {
  const useRealWidget = Boolean(SEGFY_TOKEN);

  const [step, setStep] = useState("form"); // form -> loading -> results
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "", cep: "", ano: "", uso: "particular" });
  const [consent, setConsent] = useState(false);
  const [mockResults, setMockResults] = useState(null);
  const [mockHired, setMockHired] = useState(null); // nome da seguradora "contratada" na demo

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canSubmit =
    form.nome.trim().length > 3 &&
    onlyDigits(form.cpf).length === 11 &&
    onlyDigits(form.telefone).length >= 10 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.ano &&
    consent;

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

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("loading");
    setTimeout(() => {
      if (!useRealWidget) {
        setMockResults(MOCK_INSURERS.map((ins) => ({ name: ins.name, ...mockQuote(car, ins.factor) })));
      }
      setStep("results");
    }, 1500);
  };

  const fieldStyle = {
    background: T.bg, border: `1px solid ${T.line}`, borderRadius: 7, padding: "9px",
    color: T.ink, fontSize: 13, boxSizing: "border-box", width: "100%",
  };
  const labelStyle = { fontSize: 12.5, color: T.ink, fontWeight: 600, display: "flex", flexDirection: "column", gap: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 70, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: T.panel, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "92vh", overflow: "auto", padding: 16, margin: "0 auto", maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 7 }}>
              <ShieldCheck size={17} color={T.accent} /> Cotar seguro — {car.name}
            </div>
            <div style={{ fontSize: 11, color: T.inkDim, marginTop: 2 }}>Cotação via Segfy, processada pela corretora parceira</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: T.panelAlt, border: `1px solid ${T.line}`, color: T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={15} />
          </button>
        </div>

        {!useRealWidget && (
          <div style={{
            display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 16, padding: "9px 10px",
            borderRadius: 8, background: "rgba(242,180,65,0.1)", border: `1px dashed ${T.accent2}`,
          }}>
            <FlaskConical size={14} color={T.accent2} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.5 }}>
              <strong>Protótipo de demonstração.</strong> As seguradoras e valores abaixo são fictícios — servem
              para validar o fluxo com o parceiro antes de conectarmos a API real da Segfy (falta o token de
              integração da corretora).
            </div>
          </div>
        )}

        {step === "form" && (
          <>
            <div style={{ fontSize: 12, color: T.inkDim, marginBottom: 16, lineHeight: 1.5 }}>
              Preencha seus dados para cotar o seguro deste veículo. Suas informações são compartilhadas com a
              Segfy e a corretora parceira apenas para gerar e processar a cotação — veja como tratamos seus
              dados na{" "}
              <button
                type="button"
                onClick={onOpenPrivacy}
                style={{ background: "none", border: "none", color: T.accent, cursor: "pointer", padding: 0, font: "inherit", textDecoration: "underline" }}
              >
                Política de Privacidade
              </button>.
            </div>

            <label style={{ ...labelStyle, marginBottom: 12 }}>
              Nome completo
              <input type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Como no documento" style={fieldStyle} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <label style={labelStyle}>
                CPF
                <input type="text" inputMode="numeric" value={form.cpf} onChange={(e) => set("cpf", maskCpf(e.target.value))} placeholder="000.000.000-00" style={fieldStyle} />
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
                CEP <span style={{ fontWeight: 400, color: T.inkDim }}>opc.</span>
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

            <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 18, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 11.5, color: T.inkDim, lineHeight: 1.5 }}>
                Autorizo o compartilhamento dos dados acima com a Segfy e a corretora parceira, exclusivamente
                para calcular e, se eu escolher, contratar o seguro deste veículo.
              </span>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width: "100%", background: canSubmit ? T.accent : T.panelAlt, color: canSubmit ? T.bg : T.inkDim,
                border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 13.5,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              Calcular cotação
            </button>
          </>
        )}

        {step === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 10px", gap: 12 }}>
            <Loader2 size={28} color={T.accent} className="ev-spin" />
            <style>{`.ev-spin { animation: ev-spin-anim 0.9s linear infinite; } @keyframes ev-spin-anim { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize: 13, color: T.inkDim, textAlign: "center" }}>
              Calculando cotações{!useRealWidget && " (demonstração)"}…<br />
              <span style={{ fontSize: 11 }}>Porto Seguro · HDI · Allianz</span>
            </div>
          </div>
        )}

        {step === "results" && useRealWidget && (
          <div id={SEGFY_CONTAINER_ID} />
        )}

        {step === "results" && !useRealWidget && mockResults && (
          <div>
            {mockHired ? (
              <div style={{ padding: 16, borderRadius: 10, background: "rgba(95,211,123,0.1)", border: `1px solid ${T.good}`, textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: T.good, marginBottom: 4 }}>Contratação simulada com {mockHired} ✓</div>
                <div style={{ fontSize: 11.5, color: T.inkDim, lineHeight: 1.5 }}>
                  Em produção, este passo abriria o checkout real da Segfy/corretora e a apólice cairia
                  diretamente no painel dela — nenhum dinheiro foi movimentado aqui, isto é só o protótipo.
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
                        style={{ flexShrink: 0, background: T.accent, color: T.bg, border: "none", borderRadius: 8, padding: "9px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
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
      </div>
    </div>
  );
}
