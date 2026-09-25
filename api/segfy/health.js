// Verifica se SEGFY_CLIENT_ID / SEGFY_CLIENT_SECRET estão corretos, sem expor
// nada sensível na resposta. Use para validar a configuração após o deploy:
// GET /api/segfy/health

import { getSegfyBearerToken } from "../_lib/segfyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Use GET." });
    return;
  }

  try {
    await getSegfyBearerToken();
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[segfy:health]", error.message);
    res.status(502).json({ ok: false, error: "Não foi possível autenticar na Segfy." });
  }
}
