import { createClient } from "@supabase/supabase-js";

// A anon key é pública por design (o próprio Supabase manda embutir ela no
// bundle do front) — a proteção real é a Row Level Security da tabela
// `cars`, que só libera leitura (veja supabase/schema.sql). Sem as duas
// variáveis configuradas (.env.local aqui, Environment Variables lá na
// Vercel), o client fica desativado e o app cai no catálogo embutido no
// código como fallback — nunca quebra por falta de configuração.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
