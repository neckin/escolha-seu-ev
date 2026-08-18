#!/usr/bin/env node
/**
 * Sincroniza a tabela `cars` do Supabase com o SEED_CARS de src/App.jsx.
 * Roda automaticamente via GitHub Action (.github/workflows/sync-supabase.yml)
 * a cada push na main que mexa em src/App.jsx — não precisa rodar à mão.
 *
 * Faz upsert de todos os carros do código e REMOVE do banco quem não existe
 * mais em SEED_CARS (ex.: um carro descontinuado que foi tirado do código).
 * O código é sempre a fonte da verdade; o banco só espelha.
 *
 * Requer as env vars SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (a
 * service_role, não a anon — essa aqui só é usada aqui na CI, nunca no
 * navegador, porque precisa ignorar a RLS de "só leitura" pra conseguir
 * escrever).
 */
import { createClient } from "@supabase/supabase-js";
import { extractSeedCars, carToRow } from "./lib/extract-seed-cars.mjs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltou SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY. Veja o README.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const cars = extractSeedCars();
  const rows = cars.map(carToRow);
  const codeIds = new Set(rows.map((r) => r.id));

  console.log(`Sincronizando ${rows.length} carros de src/App.jsx pro Supabase...`);

  // Upsert em lotes (evita payload gigante numa request só).
  const BATCH = 25;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("cars").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Erro no upsert do lote ${i / BATCH + 1}:`, error.message);
      process.exit(1);
    }
    console.log(`  Lote ${i / BATCH + 1}: ${batch.length} carros ok.`);
  }

  // Remove do banco quem não existe mais no código.
  const { data: existing, error: listError } = await supabase.from("cars").select("id");
  if (listError) {
    console.error("Erro ao listar carros existentes:", listError.message);
    process.exit(1);
  }
  const orphanIds = existing.map((r) => r.id).filter((id) => !codeIds.has(id));
  if (orphanIds.length > 0) {
    console.log(`Removendo ${orphanIds.length} carro(s) que saíram do código: ${orphanIds.join(", ")}`);
    const { error: deleteError } = await supabase.from("cars").delete().in("id", orphanIds);
    if (deleteError) {
      console.error("Erro ao remover carros órfãos:", deleteError.message);
      process.exit(1);
    }
  }

  console.log("Sincronização concluída.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
