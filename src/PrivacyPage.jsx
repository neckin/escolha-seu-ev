// ---------------------------------------------------------------------------
// Página de Privacidade / LGPD
// ---------------------------------------------------------------------------
// Acessível em #/privacidade (rota client-side simples, via hash — sem
// dependência de router nem de configuração de servidor).
//
// IMPORTANTE: os trechos marcados com [PREENCHER: ...] precisam da
// identificação real do responsável pelo tratamento de dados (empresa/CNPJ
// ou pessoa física, conforme como o site for operado) e de um contato válido
// do encarregado (DPO) antes de publicar isto em produção — são exigências
// legais da LGPD (arts. 41 e 48), não algo que dá para inventar.
// ---------------------------------------------------------------------------

import React from "react";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";

function Section({ title, children, T }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontFamily: "'Manrope', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8, color: T.ink }}>
        {title}
      </h2>
      <div style={{ fontSize: 13, color: T.inkDim, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage({ T, onBack }) {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.ink, fontFamily: "'Inter', sans-serif" }}>
      <header style={{ borderBottom: `1px solid ${T.line}`, padding: "20px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 8, background: T.panel, border: `1px solid ${T.line}`,
              color: T.inkDim, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
            title="Voltar"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17, display: "flex", alignItems: "center", gap: 7 }}>
              <ShieldCheck size={17} color={T.accent} /> Privacidade e proteção de dados (LGPD)
            </div>
            <div style={{ fontSize: 11.5, color: T.inkDim, marginTop: 2 }}>Escolha seu EV</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
        <div style={{
          display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 28, padding: "10px 12px",
          borderRadius: 8, background: hexA(T.accent2, 0.1), border: `1px dashed ${T.accent2}`,
        }}>
          <AlertTriangle size={15} color={T.accent2} style={{ marginTop: 1, flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: T.ink, lineHeight: 1.6 }}>
            Rascunho inicial gerado para revisão. Os campos marcados como <strong>[PREENCHER]</strong> exigem a
            identificação real do responsável pelo site e um contato válido para o encarregado de dados (DPO)
            antes de publicar — isso é exigência legal da LGPD, não pode ficar genérico.
          </div>
        </div>

        <Section title="1. Introdução" T={T}>
          Esta página explica como o <strong style={{ color: T.ink }}>Escolha seu EV</strong> coleta, usa e
          protege dados ao longo do site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018 — LGPD). Ela se aplica a todo o site, incluindo o comparador de carros e o fluxo de
          cotação de seguro.
        </Section>

        <Section title="2. Quem é o responsável pelo tratamento" T={T}>
          <strong style={{ color: T.ink }}>[PREENCHER: razão social/nome e CNPJ ou CPF do responsável pelo site]</strong>,
          doravante "nós", é quem decide como e por que os dados descritos aqui são tratados.
          <br /><br />
          Contato do encarregado de dados (DPO): <strong style={{ color: T.ink }}>[PREENCHER: e-mail de contato]</strong>.
        </Section>

        <Section title="3. Quais dados coletamos" T={T}>
          <strong style={{ color: T.ink }}>Uso normal do comparador</strong> — tema (claro/escuro), o carro que
          você cadastrar como "meu carro atual" e se você já viu o tutorial. Esses dados ficam salvos apenas no{" "}
          <em>localStorage</em> do seu navegador, nunca são enviados a nós nem a terceiros, e não identificam
          você pessoalmente.
          <br /><br />
          <strong style={{ color: T.ink }}>Catálogo de carros</strong> — carregado de um banco de dados
          (Supabase) igual para todos os visitantes; não envolve dado pessoal seu.
          <br /><br />
          <strong style={{ color: T.ink }}>Cotação de seguro</strong> — se você usar o recurso "Contratar
          seguro" em algum carro, coletamos os dados que você digitar no formulário: nome completo, CPF,
          telefone, e-mail, CEP (opcional), ano do veículo e tipo de uso. Esses dados só são coletados se você
          iniciar essa ação voluntariamente.
        </Section>

        <Section title="4. Para que usamos seus dados" T={T}>
          Os dados de navegação (tema, meu carro, tutorial) servem só para personalizar sua experiência no seu
          próprio navegador. Os dados do formulário de seguro são usados exclusivamente para calcular e, caso
          você opte por prosseguir, viabilizar a contratação da apólice de seguro do veículo escolhido.
        </Section>

        <Section title="5. Com quem compartilhamos" T={T}>
          Não vendemos dados pessoais. Ao solicitar uma cotação de seguro, os dados informados no formulário são
          compartilhados com a <strong style={{ color: T.ink }}>Segfy</strong> (plataforma de cotação) e com a{" "}
          <strong style={{ color: T.ink }}>corretora parceira responsável pela apólice</strong>, unicamente para
          processar a cotação/contratação solicitada por você. Nenhum outro dado de navegação do site é
          compartilhado com essas empresas.
        </Section>

        <Section title="6. Base legal" T={T}>
          O tratamento dos dados do formulário de seguro se baseia no seu{" "}
          <strong style={{ color: T.ink }}>consentimento</strong> (art. 7º, I, LGPD), dado explicitamente ao
          marcar a caixa de autorização antes de calcular a cotação, e na{" "}
          <strong style={{ color: T.ink }}>execução de procedimentos preliminares/contrato</strong> (art. 7º, V)
          quando você opta por contratar. Os dados de navegação salvos no seu próprio navegador não envolvem
          tratamento de dados pessoais por nós.
        </Section>

        <Section title="7. Por quanto tempo guardamos" T={T}>
          Dados de navegação ficam no seu navegador até você limpá-los ou até o site os sobrescrever. Dados do
          formulário de seguro são retidos pelo tempo necessário para a cotação/contratação e conforme as
          obrigações legais da corretora e da Segfy (ex.: prazos regulatórios do setor de seguros).
        </Section>

        <Section title="8. Seus direitos" T={T}>
          Conforme o art. 18 da LGPD, você pode solicitar a qualquer momento: confirmação da existência de
          tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização/bloqueio/
          eliminação de dados desnecessários, portabilidade, eliminação dos dados tratados com base em
          consentimento, informação sobre com quem compartilhamos seus dados, e revogação do consentimento.
        </Section>

        <Section title="9. Como exercer seus direitos" T={T}>
          Envie sua solicitação para <strong style={{ color: T.ink }}>[PREENCHER: e-mail de contato]</strong>.
          Responderemos dentro do prazo previsto em lei.
        </Section>

        <Section title="10. Cookies e armazenamento local" T={T}>
          O site usa apenas <em>localStorage</em> do navegador (não usa cookies de rastreamento) para lembrar
          preferências pessoais como tema e o carro que você cadastrou. Você pode limpar esses dados a qualquer
          momento nas configurações do seu navegador.
        </Section>

        <Section title="11. Alterações desta política" T={T}>
          Podemos atualizar esta página conforme o site evoluir. A data da última atualização está sempre
          indicada abaixo.
        </Section>

        <div style={{ fontSize: 11, color: T.inkDim, marginTop: 32, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
          Última atualização: [PREENCHER na publicação]
        </div>
      </main>
    </div>
  );
}
