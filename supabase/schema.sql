-- Escolha seu EV — schema da tabela de carros.
-- Rode isso uma vez no SQL Editor do Supabase (Project > SQL Editor > New query).

create table if not exists cars (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null,
  price integer,
  power_cv integer,
  torque_nm integer,
  battery_kwh numeric,
  battery_chem text,
  motor_type text,
  range_km integer,
  accel numeric,
  ground_clearance integer,
  trunk_l integer,
  weight_kg integer,
  wallbox text,
  ac_kw numeric,
  dc_kw numeric,
  airbags integer,
  warranty text,
  fuel_type text not null,
  verified boolean default false,
  price_verified_date text,
  maintenance_interval text,
  maintenance_first_cost text,
  maintenance_km_base integer,
  maintenance_total_cost integer,
  consumption_kwh_100 numeric,
  tech_notes text,
  image_url text,
  video_url text,
  personas jsonb,
  updated_at timestamptz not null default now()
);

-- Mantém updated_at em dia sozinho a cada upsert.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists cars_set_updated_at on cars;
create trigger cars_set_updated_at
  before update on cars
  for each row
  execute function set_updated_at();

-- RLS: leitura pública liberada (é um catálogo público), escrita bloqueada
-- pra qualquer chamada vinda do navegador (anon key). Só dá pra escrever
-- pelo SQL Editor do dashboard ou com a service_role key (nunca exposta
-- no front) — mantém o mesmo modelo "só edita quem tem acesso ao projeto"
-- que já tínhamos com o modo de edição removido do app.
alter table cars enable row level security;

drop policy if exists "Public read access" on cars;
create policy "Public read access"
  on cars for select
  using (true);
