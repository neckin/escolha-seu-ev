-- Cotações que a Segfy recusou no calculate (ex.: HTTP 422, dado inválido).
-- Gravado por api/segfy/vehicle/[action].js e listado no relatório semanal
-- (api/cron/quote-report.js). Sem dado pessoal: só o motivo técnico que a
-- Segfy devolveu (sem os valores digitados) e o contexto do formulário.
-- Rode isso uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).

create extension if not exists pgcrypto;

create table if not exists quote_failures (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- status HTTP devolvido pela Segfy (422, 400, 500...) ou 502 se nem respondeu
  http_status int,
  -- motivo da Segfy, já sem valores digitados (ex.: "data.renewal.prior_policy_end: ...")
  reason text,
  source text check (source in ('comparador', 'cotacao')),
  car_id text,
  from_policy boolean,
  -- contexto não pessoal que ajuda a achar o padrão do erro
  renewal_insurer text,         -- 'new' = sem seguro
  renewal_bonus text,
  renewal_days_to_end int,      -- fim da vigência atual menos a data da cotação
  vehicle_year int,
  fuel_type text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists quote_failures_created_at_idx on quote_failures (created_at);

-- Só o servidor (service role) lê e grava.
alter table quote_failures enable row level security;
