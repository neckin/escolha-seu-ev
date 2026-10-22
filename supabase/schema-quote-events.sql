-- Registro das cotações de seguro feitas pelo site (comparador e página
-- /cotacao embutida no site da D&B). Alimenta o relatório semanal
-- (api/cron/quote-report.js). Sem dado pessoal: nome, CPF e contato ficam
-- só na Segfy, que o relatório consulta pelo quote_guid.
-- Rode isso uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).

create extension if not exists pgcrypto; -- pra gen_random_uuid()

create table if not exists quote_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- 'quote' = cálculo enviado à Segfy; 'choice' = cliente clicou em "Quero este plano"
  event text not null check (event in ('quote', 'choice')),
  -- guid da cotação na Segfy (o mesmo do show-results)
  quote_guid uuid not null,
  -- de onde veio: 'comparador' (escolha-seu-ev.vercel.app) ou 'cotacao' (/cotacao, iframe no dbcorr.com.br)
  source text check (source in ('comparador', 'cotacao')),
  -- carro do catálogo em que o botão foi clicado (só no comparador)
  car_id text,
  -- só em 'choice': plano escolhido
  insurer text,
  premium numeric,
  coverage_type text,
  payment text
);

create index if not exists quote_events_created_at_idx on quote_events (created_at);
create index if not exists quote_events_guid_idx on quote_events (quote_guid);

-- RLS: nada de leitura/escrita pública. Só a service_role (functions da
-- Vercel e o SQL Editor do dashboard) acessa.
alter table quote_events enable row level security;
