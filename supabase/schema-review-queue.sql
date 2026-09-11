-- Fila de revisão para o robô de verificação (Fase 3 do plano de expansão
-- HEV) — candidatos e atualizações de preço/ficha técnica encontrados nos
-- sites oficiais das marcas caem aqui, nunca direto na tabela `cars`. Um
-- humano aprova (ou rejeita) manualmente antes de qualquer coisa virar
-- carro de verdade no catálogo público.
-- Rode isso uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).

create extension if not exists pgcrypto; -- pra gen_random_uuid()

create table if not exists car_review_queue (
  id uuid primary key default gen_random_uuid(),
  -- id do carro em `cars`, se isto for uma atualização de um carro que já
  -- existe; NULL se for candidato a carro novo.
  car_id text references cars(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  -- mudanças propostas, no mesmo formato de colunas da tabela `cars`
  -- (snake_case) — parcial está OK pra atualização (só os campos que
  -- mudaram), completo pra carro novo.
  proposed_data jsonb not null,
  source_url text,
  detected_at timestamptz not null default now(),
  notes text,
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists car_review_queue_status_idx on car_review_queue (status);

-- RLS: nada de leitura/escrita pública — isso é fila interna de revisão,
-- não catálogo. Só a service_role (usada pela GitHub Action da triagem e,
-- por enquanto, o SQL Editor do dashboard) acessa.
alter table car_review_queue enable row level security;
