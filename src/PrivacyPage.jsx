// ---------------------------------------------------------------------------
// Página de Privacidade / LGPD
// ---------------------------------------------------------------------------
// Acessível em #/privacidade (rota client-side simples, via hash — sem
// dependência de router nem de configuração de servidor).
//
// Controladora e contato do encarregado informados pela D&B em 01/10/2026
// (exigências da LGPD, arts. 41 e 48). Ao mudar o fluxo de dados do site
// (novo serviço, novo destino de e-mail, armazenamento), revisar esta página.
// ---------------------------------------------------------------------------

import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

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

        <Section title="1. Introdução" T={T}>
          Esta página explica como o <strong style={{ color: T.ink }}>Escolha seu EV</strong> coleta, usa e
          protege dados ao longo do site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018, LGPD). Ela se aplica a todo o site, incluindo o comparador de carros e o fluxo de
          cotação de seguro.
        </Section>

        <Section title="2. Quem é o responsável pelo tratamento" T={T}>
          <strong style={{ color: T.ink }}>D'Agostino e Barreto Corretora de Seguros Ltda</strong> (D&B
          Corretora), CNPJ 29.079.868/0001-00, doravante "nós", é a controladora dos dados: quem decide como e
          por que os dados descritos aqui são tratados.
          <br /><br />
          Contato do encarregado de dados (DPO): <strong style={{ color: T.ink }}>adm@dbcorr.com.br</strong>.
        </Section>

        <Section title="3. Quais dados coletamos" T={T}>
          <strong style={{ color: T.ink }}>Uso normal do comparador</strong>: tema (claro/escuro), o carro que
          você cadastrar como "meu carro atual" e se você já viu o tutorial. Esses dados ficam salvos apenas no{" "}
          <em>localStorage</em> do seu navegador, nunca são enviados a nós nem a terceiros, e não identificam
          você pessoalmente.
          <br /><br />
          <strong style={{ color: T.ink }}>Catálogo de carros</strong>: carregado de um banco de dados
          (Supabase) igual para todos os visitantes; não envolve dado pessoal seu.
          <br /><br />
          <strong style={{ color: T.ink }}>Cotação de seguro</strong>: se você pedir uma cotação, pelo botão
          "Contratar seguro" de um carro ou pela página de cotação (inclusive quando ela aparece dentro do site
          da D&B Corretora), coletamos os dados que você digitar no formulário:
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>Nome completo</li>
            <li>CPF</li>
            <li>Telefone</li>
            <li>E-mail</li>
            <li>CEP</li>
            <li>Data de nascimento, sexo, estado civil e profissão</li>
            <li>Ano, marca e modelo do veículo e tipo de uso (particular ou app)</li>
            <li>
              Respostas do questionário de risco exigido pelas seguradoras: tipo de moradia, garagem em casa,
              no trabalho e no estudo, uso do carro, km rodados por mês, distância até o trabalho, outros
              condutores e faixa de idade, se o carro é 0 km, financiado, blindado, com kit gás, rastreador ou
              chassi remarcado, isenção de impostos, e dados do seguro atual (seguradora, fim da vigência,
              classe de bônus e sinistros), quando houver
            </li>
          </ul>
          <br />
          Esses dados são enviados à plataforma da Segfy no momento em que você clica em "Calcular cotação",
          passando pelo servidor do site apenas para serem encaminhados;{" "}
          <strong style={{ color: T.ink }}>eles nunca são armazenados no banco de dados deste site</strong>. A coleta só ocorre se você iniciar essa ação voluntariamente e concordar
          com o termo de consentimento exibido no formulário.
          <br /><br />
          Se, depois da cotação, você clicar em "Quero este plano", nós recebemos por e-mail seu nome, telefone,
          e-mail, o veículo, o plano e a forma de pagamento escolhidos, para entrar em contato com você, e você
          recebe no seu e-mail um resumo da cotação.
        </Section>

        <Section title="4. Para que usamos seus dados" T={T}>
          Os dados de navegação (tema, meu carro, tutorial) servem só para personalizar sua experiência no seu
          próprio navegador. Os dados do formulário de seguro são usados exclusivamente para calcular e, caso
          você opte por prosseguir, viabilizar a contratação da apólice de seguro do veículo escolhido.
          Não utilizamos esses dados para fins de marketing, criação de perfis ou qualquer outra finalidade
          além da cotação/contratação solicitada.
        </Section>

        <Section title="5. Com quem compartilhamos" T={T}>
          Não vendemos dados pessoais. Para calcular a cotação e, se você optar, viabilizar a contratação,
          compartilhamos os dados do formulário apenas com:
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>
              <strong style={{ color: T.ink }}>Segfy</strong>, plataforma de multicálculo que usamos para calcular
              a cotação;
            </li>
            <li>
              <strong style={{ color: T.ink }}>as seguradoras consultadas</strong> por meio da Segfy (Porto Seguro,
              Azul, Itaú, Allianz, Liberty, Bradesco, Suhai e Mitsui Sumitomo), que precisam dos dados para
              calcular o preço e, na contratação, emitir a apólice;
            </li>
            <li>
              <strong style={{ color: T.ink }}>prestadores de infraestrutura</strong>: a Vercel, que hospeda o site
              e o servidor que encaminha a cotação, e a HostGator, que hospeda a caixa de e-mail da qual enviamos
              os e-mails de confirmação.
            </li>
          </ul>
          <br />
          Nenhum dado de navegação do site é compartilhado com essas empresas. As seguradoras e a Segfy também
          seguem suas próprias políticas de privacidade.
        </Section>

        <Section title="6. Base legal" T={T}>
          O tratamento dos dados do formulário de seguro se baseia no seu{" "}
          <strong style={{ color: T.ink }}>consentimento</strong> (art. 7º, I, LGPD), dado explicitamente ao
          marcar a caixa de autorização antes de calcular a cotação, e na{" "}
          <strong style={{ color: T.ink }}>execução de procedimentos preliminares relacionados a contrato</strong>{" "}
          (art. 7º, V) quando você opta por contratar. Os dados de navegação salvos no seu próprio navegador não
          envolvem tratamento de dados pessoais por nós.
        </Section>

        <Section title="7. Por quanto tempo guardamos" T={T}>
          Dados de navegação ficam no seu navegador até você limpá-los ou até o site os sobrescrever.{" "}
          <strong style={{ color: T.ink }}>Os dados do formulário de seguro não são armazenados neste site</strong>:
          eles ficam registrados na plataforma da Segfy e, se você escolher um plano, no e-mail que recebemos.
          Guardamos esses dados pelo tempo necessário para a cotação e a contratação e pelos prazos exigidos pela
          regulação do setor de seguros.
        </Section>

        <Section title="8. Seus direitos" T={T}>
          Conforme o art. 18 da LGPD, você pode solicitar a qualquer momento: confirmação da existência de
          tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização/bloqueio/
          eliminação de dados desnecessários, portabilidade, eliminação dos dados tratados com base em
          consentimento, informação sobre com quem compartilhamos seus dados, e revogação do consentimento.
          <br /><br />
          Como controladora, a D&B Corretora atende esses pedidos, inclusive em relação aos dados registrados
          na Segfy para a sua cotação.
        </Section>

        <Section title="9. Como exercer seus direitos" T={T}>
          Envie sua solicitação para <strong style={{ color: T.ink }}>adm@dbcorr.com.br</strong>.
          Responderemos dentro do prazo previsto em lei.
        </Section>

        <Section title="10. Cookies e armazenamento local" T={T}>
          O site usa apenas <em>localStorage</em> do navegador (não usa cookies de rastreamento) para lembrar
          preferências pessoais como tema e o carro que você cadastrou. Você pode limpar esses dados a qualquer
          momento nas configurações do seu navegador.
        </Section>

        <Section title="11. Segurança" T={T}>
          O site é servido exclusivamente via HTTPS (conexão criptografada). Os headers de segurança HTTP
          estão configurados para proteger contra ataques comuns (clickjacking, MIME sniffing, injeção de
          scripts). Os dados do formulário de cotação passam por um servidor do próprio site apenas para serem
          encaminhados à Segfy, sem serem gravados. As credenciais de acesso à Segfy e ao e-mail ficam só nesse
          servidor e nunca chegam ao navegador.
          <br /><br />
          A Vercel pode processar esses dados em servidores fora do Brasil. Essa transferência ocorre apenas para
          prestar o serviço que você solicitou, com as garantias de segurança descritas acima.
        </Section>

        <Section title="12. Alterações desta política" T={T}>
          Podemos atualizar esta página conforme o site evoluir. A data da última atualização está sempre
          indicada abaixo.
        </Section>

        <div style={{ fontSize: 11, color: T.inkDim, marginTop: 32, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
          Última atualização: outubro de 2026
        </div>
      </main>
    </div>
  );
}
