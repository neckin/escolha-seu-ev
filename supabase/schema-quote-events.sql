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

-- Origem da visita (link divulgado com utm_*, ex.: Stories do Instagram).
-- Em banco já criado, rode só estas três linhas.
alter table quote_events add column if not exists utm_source text;
alter table quote_events add column if not exists utm_medium text;
alter table quote_events add column if not exists utm_campaign text;

-- A pessoa enviou a apólice atual para preencher o formulário (já tem seguro,
-- com a D&B ou com outra corretora, e está comparando preços).
-- Em banco já criado, rode só esta linha.
alter table quote_events add column if not exists from_policy boolean;

create index if not exists quote_events_created_at_idx on quote_events (created_at);
create index if not exists quote_events_guid_idx on quote_events (quote_guid);

-- RLS: nada de leitura/escrita pública. Só a service_role (functions da
-- Vercel e o SQL Editor do dashboard) acessa.
alter table quote_events enable row level security;
