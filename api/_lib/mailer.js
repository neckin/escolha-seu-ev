// Envio de e-mail pelo SMTP da caixa de automações da D&B. Variáveis (só no
// servidor): SMTP_HOST, SMTP_PORT (587 = STARTTLS, recomendada pelo suporte da
// HostGator; a 465 descartava as mensagens), SMTP_USER, SMTP_PASS, EMAIL_FROM.

import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("SMTP_HOST/SMTP_USER/SMTP_PASS não configurados.");
  if (!transporter) {
    const port = Number(SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      // Na 587 a conexão começa aberta e sobe para TLS (STARTTLS); exige o
      // TLS para a senha nunca trafegar sem criptografia.
      requireTLS: port !== 465,
      // Nome no EHLO. Sem isso o nodemailer usa o hostname da máquina (ou
      // [127.0.0.1]) e o filtro de saída da HostGator descarta a mensagem
      // em silêncio: aceita com 250 OK e não entrega fora do servidor.
      name: SMTP_USER.split("@")[1],
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function verifySmtp() {
  return getTransporter().verify();
}

export async function sendEmail({ to, subject, html, replyTo, attachments }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({ from, to, subject, html, ...(replyTo ? { replyTo } : {}), ...(attachments ? { attachments } : {}) });
}
