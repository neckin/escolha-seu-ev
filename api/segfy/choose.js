// Registra o plano escolhido pelo cliente depois da cotação:
//   1. marca o resultado como "favorito do cliente" no painel da Segfy da D&B;
//   2. avisa a D&B por e-mail (DB_NOTIFY_EMAIL) com os dados para o retorno;
//   3. manda ao cliente um e-mail com o resumo da cotação.
//
// O navegador só envia { guid, resultId }. Nome, e-mail, telefone, veículo e
// preços vêm da própria Segfy (show-results), nunca do corpo da requisição —
// assim ninguém consegue usar este endpoint para mandar e-mail a um endereço
// qualquer nem forjar um preço.
//
// E-mail via SMTP da caixa de automações da D&B (ver api/_lib/mailer.js).
//   DB_NOTIFY_EMAIL — quem recebe o aviso na D&B

import { segfyRequest } from "../_lib/segfyClient.js";
import { isAllowedOrigin } from "../_lib/origin.js";
import { sendEmail } from "../_lib/mailer.js";
import {
  escapeHtml, money, brDate, formatPhone, coverageLabel, insurerName, bestOfferPerInsurer,
} from "../_lib/quoteFormat.js";
import { logQuoteEvent } from "../_lib/quoteLog.js";
import { paymentOptions, formatPlan } from "../../src/installments.js";

const RETURN_DEADLINE = "até 1 dia útil";

// Evita reenvio em sequência para a mesma cotação enquanto a function estiver
// "quente". Não é garantia absoluta (cada instância tem a sua memória), mas
// barra duplo clique e repetição imediata.
const recentlyChosen = new Map();
const DEDUPE_MS = 10 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Forma de pagamento preferida, conferida contra o parcelamento que a própria
// Segfy devolveu para este plano. Valor inválido ou ausente = "decidir com a D&B".
function preferredPayment(chosen, method, count) {
  const option = paymentOptions(chosen).find((o) => o.method === method);
  const plan = option?.plans.find((p) => p.count === Number(count));
  return option && plan ? formatPlan(option, plan, money) : null;
}

function brokerEmailHtml({ customer, vehicle, chosen, quotationId, validity, favoriteOk, payment }) {
  const row = (label, value) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#555">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`;
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F33">
      <h2 style="margin:0 0 12px">Venda pronta para pagamento: cliente do Escolha seu EV</h2>
      <div style="background:#FBF5E8;border:1px solid #E6D3A8;border-radius:8px;padding:12px 14px;margin:0 0 16px">
        <strong>O que fazer:</strong> entrar em contato com o cliente <strong>${RETURN_DEADLINE}</strong>
        apenas para <strong>gerar o link de pagamento e emitir a apólice</strong> do plano abaixo.
        A cotação, a comparação entre seguradoras e a escolha do plano já foram feitas pelo próprio
        cliente no site.
        <ul style="margin:8px 0 0;padding-left:18px">
          <li>Não é preciso recotar nem apresentar outras opções. Só faça isso se o cliente pedir.</li>
          <li>Abra a cotação na Segfy pelo ID abaixo, transmita a proposta desta seguradora/produto e gere o link de
            pagamento na forma preferida pelo cliente (quando a seguradora não transmitir pela Segfy, use o portal dela).</li>
          <li>Colete só o que falta para emitir (ex.: placa/chassi).</li>
          <li>Nunca peça dados de cartão por telefone, e-mail ou WhatsApp: o pagamento é feito só pelo link oficial.</li>
        </ul>
      </div>
      ${/compreens/i.test(chosen?.company_coverages?.coverage_type || "") ? "" : `
      <div style="background:#FDECEC;border:1px solid #E7A6A6;border-radius:8px;padding:12px 14px;margin:0 0 16px">
        <strong>Atenção: o cliente escolheu uma cobertura parcial</strong>
        (${escapeHtml(chosen?.company_coverages?.coverage_type || chosen?.product || "não é compreensiva")}).
        Antes do pagamento, confirme que ele entendeu o que <strong>não</strong> está coberto
        (ex.: colisão e danos ao próprio carro) e que é isso mesmo que ele quer.
      </div>`}
      <table style="border-collapse:collapse">
        ${row("Cliente", customer.name)}
        ${row("Telefone", formatPhone(customer.cellphone))}
        ${row("E-mail", customer.email)}
        ${row("Veículo", `${vehicle.brand} ${vehicle.model} ${vehicle.model_year}`)}
        ${row("Seguradora", insurerName(chosen))}
        ${row("Produto", chosen.product || "Tradicional")}
        ${row("Cobertura", coverageLabel(chosen))}
        ${row("Prêmio anual", money(chosen.premium))}
        ${row("Franquia", chosen.franchise > 0 ? money(chosen.franchise) : "—")}
        ${row("Pagamento preferido", payment || "Cliente prefere decidir com a D&B")}
        ${row("Validade da cotação", brDate(validity) || "—")}
        ${row("ID da cotação na Segfy", quotationId)}
      </table>
      <p style="color:#555">${favoriteOk
        ? "O resultado foi marcado como favorito do cliente no painel da Segfy."
        : "Não foi possível marcar o resultado como favorito no painel da Segfy; localize a cotação pelo ID acima."}
        CPF e demais dados estão na cotação.</p>
    </div>`;
}

function customerEmailHtml({ customer, vehicle, chosen, offers, validity, payment }) {
  const firstName = String(customer.name || "").trim().split(/\s+/)[0] || "";
  const offerRows = offers
    .map(
      (r) => `<tr>
        <td style="padding:6px 12px 6px 0">${escapeHtml(insurerName(r))}${r === chosen ? " <strong>(sua escolha)</strong>" : ""}</td>
        <td style="padding:6px 12px 6px 0;color:#555">${escapeHtml(r.product || "Tradicional")}<br>${escapeHtml(coverageLabel(r))}</td>
        <td style="padding:6px 0;text-align:right;white-space:nowrap"><strong>${money(r.premium)}</strong>/ano</td>
      </tr>`
    )
    .join("");
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#0B1F33;max-width:600px">
      <h2 style="margin:0 0 12px">Recebemos sua escolha${firstName ? `, ${escapeHtml(firstName)}` : ""}</h2>
      <p>Você escolheu o seguro <strong>${escapeHtml(insurerName(chosen))} · ${escapeHtml(chosen.product || "Tradicional")}</strong>
        para o seu <strong>${escapeHtml(`${vehicle.brand} ${vehicle.model} ${vehicle.model_year}`)}</strong>,
        por <strong>${money(chosen.premium)}/ano</strong>${chosen.franchise > 0 ? ` (franquia de ${money(chosen.franchise)})` : ""}.
        ${payment ? `Forma de pagamento que você prefere: <strong>${escapeHtml(payment)}</strong>.` : ""}</p>
      <p>A D&amp;B Corretora vai entrar em contato com você <strong>${RETURN_DEADLINE}</strong> para finalizar o
        pagamento e emitir a sua apólice. Nenhum pagamento foi feito até agora.</p>
      <h3 style="margin:20px 0 8px">Resumo da sua cotação</h3>
      <table style="border-collapse:collapse;width:100%">${offerRows}</table>
      <p style="color:#555;font-size:12px;margin-top:20px">
        Valores calculados pelas seguradoras via Segfy${validity ? `, válidos até ${brDate(validity)}` : ""}, e sujeitos à
        análise e aceitação da seguradora. Você recebeu este e-mail porque pediu uma cotação no Escolha seu EV.
      </p>
    </div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST." });
    return;
  }

  if (!isAllowedOrigin(req)) {
    res.status(403).json({ error: "Origem não autorizada." });
    return;
  }

  const { guid, resultId, paymentMethod, installments } = req.body || {};
  if (!UUID_RE.test(guid || "") || !UUID_RE.test(resultId || "")) {
    res.status(400).json({ error: "Cotação inválida." });
    return;
  }

  const dedupeKey = `${guid}`;
  const last = recentlyChosen.get(dedupeKey);
  if (last && Date.now() - last < DEDUPE_MS) {
    res.status(429).json({ error: "Sua escolha já foi enviada para a D&B." });
    return;
  }

  try {
    const brokerToken = process.env.SEGFY_BROKER_TOKEN;
    const { data } = await segfyRequest("/api/vehicle/version/1.0/show-results", {
      method: "POST",
      body: { config: { token: brokerToken }, data: { guid, id: "", multicalculo_id: "" } },
    });

    const quotation = data?.data?.data;
    const results = (data?.results || []).flatMap((q) => q.results || []);
    const chosen = results.find((r) => r.id === resultId || r.result_id === resultId);

    if (!quotation?.customer || !chosen || chosen.premium == null) {
      res.status(404).json({ error: "Não encontramos esse plano na cotação." });
      return;
    }

    recentlyChosen.set(dedupeKey, Date.now());

    const customer = quotation.customer;
    const vehicle = quotation.vehicle || {};
    const quotationId = data?.quotation_id || data?.id || guid;
    const validity = quotation.validity_budget;
    const payment = preferredPayment(chosen, paymentMethod, installments);

    // 1. Favorito no painel da Segfy — não bloqueia o resto se falhar.
    const favorite = await segfyRequest("/api/premium/version/1.0/favorite", {
      method: "POST",
      body: { config: { token: brokerToken, business: "vehicle" }, data: { premium_id: chosen.id, favorite: true } },
    }).catch((error) => ({ ok: false, status: error.message }));
    if (!favorite.ok) console.error("[segfy:choose] favorito não marcado:", favorite.status);

    // 2. Aviso para a D&B (obrigatório: sem ele ninguém retorna ao cliente).
    await sendEmail({
      to: process.env.DB_NOTIFY_EMAIL,
      subject: `Finalizar pagamento: ${customer.name} · ${insurerName(chosen)} ${money(chosen.premium)}/ano`,
      html: brokerEmailHtml({ customer, vehicle, chosen, quotationId, validity, favoriteOk: favorite.ok, payment }),
      replyTo: customer.email,
    });

    await logQuoteEvent({
      event: "choice",
      quote_guid: guid,
      insurer: chosen.company?.name || null,
      premium: chosen.premium,
      coverage_type: chosen.company_coverages?.coverage_type || null,
      payment,
    });

    // 3. Resumo para o cliente — se falhar, a D&B já foi avisada.
    let customerEmailSent = true;
    if (customer.email) {
      await sendEmail({
        to: customer.email,
        subject: "Sua cotação de seguro · D&B Corretora",
        html: customerEmailHtml({ customer, vehicle, chosen, offers: bestOfferPerInsurer(results), validity, payment }),
        replyTo: process.env.DB_NOTIFY_EMAIL,
      }).catch((error) => {
        customerEmailSent = false;
        console.error("[segfy:choose] e-mail do cliente:", error.message);
      });
    }

    res.status(200).json({ ok: true, customerEmailSent, payment });
  } catch (error) {
    recentlyChosen.delete(dedupeKey);
    console.error("[segfy:choose]", error.message);
    res.status(502).json({ error: "Não conseguimos registrar sua escolha agora. Tente de novo em instantes." });
  }
}
