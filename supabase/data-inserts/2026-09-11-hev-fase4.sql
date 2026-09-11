-- Fase 4 — primeiros carros HEV (híbrido não-plugável) do catálogo.
-- Pesquisado e verificado em 11/09/2026, direto em fonte oficial (PDF de
-- ficha técnica/catálogo de cada marca, baixado do próprio site oficial
-- via fetch() simples — sem bloqueio de bot, mesma checagem já feita pra
-- validar o robô da Fase 3). Rode isso uma vez no SQL Editor do Supabase.
--
-- Um terceiro carro (Nissan Kicks e-Power) foi pesquisado e DESCARTADO desta
-- lista: o usuário desconfiou e, checando de novo direto na página oficial
-- (nissan.com.br/veiculos/modelos/novo-kicks.html), nem "e-power" nem
-- "híbrido" aparecem no texto — é um Kicks 2026 novo, mas 100% a combustão.
-- A confusão veio de uma busca que misturou geração antiga/descontinuada do
-- Kicks e-Power. O primeiro híbrido Nissan de verdade a caminho do Brasil é
-- o X-Trail e-Power, mas ainda sem preço oficial confirmado (só estimativa
-- de imprensa) — não entra ainda por não passar no mesmo critério de rigor
-- do resto do catálogo.
--
-- Depois de rodar: `node scripts/generate-fallback-snapshot.mjs` localmente
-- pra atualizar src/carsFallback.json, e commitar esse arquivo.

insert into cars (
  id, name, brand, category, price, power_cv, torque_nm, battery_kwh, battery_chem,
  motor_type, range_km, accel, ground_clearance, trunk_l, weight_kg, wallbox, ac_kw, dc_kw,
  airbags, warranty, fuel_type, verified, price_verified_date, maintenance_interval,
  maintenance_first_cost, maintenance_km_base, maintenance_total_cost, consumption_kwh_100,
  tech_notes, image_url, video_url, personas
) values
(
  'toyota-corolla-cross-hybrid',
  'Toyota Corolla Cross Hybrid XRX',
  'Toyota',
  'SUV compacto híbrido',
  223790,
  101,
  142,
  null,
  null,
  'Híbrido HSD (Hybrid Synergy Drive) — motor 1.8L VVT-i Flex + dois motores elétricos (MG1/MG2)',
  null,
  null,
  161,
  440,
  1440,
  null,
  null,
  null,
  null,
  '5 anos veículo / 8 anos sistema híbrido',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Única versão híbrida do Corolla Cross no Brasil (XRX Hybrid) — as versões XRE/XR/XRX são a combustão (2.0L Dynamic Force, 175cv, não-híbrida). Ficha oficial (catálogo PDF Toyota, baixado do site em 11/09/2026): motor a combustão 1.8L 101cv/5.200rpm + 14,5kgf.m (142Nm)/3.600rpm, dois motores elétricos somando 72cv/16,6kgf.m. A Toyota NÃO publica uma potência combinada única pra este sistema HSD (o power-split não soma linearmente) — os 101cv registrados aqui são só do motor a combustão; o carro entrega mais que isso na prática graças ao motor elétrico. Preço R$223.790 é a versão de entrada de cor (varia até R$226.120 conforme a cor). Consumo INMETRO: 17,0 km/l urbano / 13,9 km/l estrada (não convertido pra kWh/100km porque não pluga). Garantia: 5 anos veículo + 3 anos adicionais pro sistema híbrido (bateria/inversor), totalizando 8 anos pro híbrido.',
  'https://media.toyota.com.br/c78bcfd0-45ba-4b1d-8bab-8a8daede895b.png',
  null,
  '{"urbano":4,"familia":4,"aventura":2,"performance":2,"custo":4}'::jsonb
),
(
  'honda-cr-v-advanced-hybrid',
  'Honda CR-V Advanced Hybrid',
  'Honda',
  'SUV médio híbrido',
  353500,
  207,
  335,
  1.06,
  'Íons de lítio',
  'Híbrido e:HEV — motor 2.0L DI DOHC (gerador) + motor elétrico de tração, AWD',
  null,
  null,
  null,
  581,
  1819,
  null,
  null,
  null,
  10,
  null,
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Único trim de CR-V híbrido vendido no Brasil (Advanced Hybrid) — não existe versão CR-V a combustão pura na linha atual. Sistema e:HEV: na maior parte do tempo o motor elétrico traciona sozinho as rodas (184cv/34,2kgf.m — 335Nm), enquanto o motor 2.0L a combustão (147cv/19,4kgf.m gasolina) funciona majoritariamente como gerador, só tracionando diretamente em velocidade constante de estrada. Ficha oficial (catálogo PDF Honda, baixado do site em 11/09/2026) lista as duas potências separadamente, sem somar; a potência combinada de 207cv usada aqui é a comumente reportada pela imprensa especializada pra este powertrain — vale reconfirmar na concessionária. Tração integral AWD. Preço de tabela oficial R$353.500 (checado no site oficial), mas há descontos de concessionária amplamente reportados levando o preço efetivo a R$309.990-315.900 em alguns casos — preço de tabela é o usado aqui, consistente com o critério do resto do catálogo. Bateria Li-ion pequena (1,06kWh, típica de HEV — não é uma bateria de tração tipo BEV/PHEV, não pluga).',
  'https://www.honda.com.br/automoveis/sites/hab/files/2026-05/crv.webp',
  'https://www.youtube.com/watch?v=Rn8bHisCy6U',
  '{"urbano":3,"familia":5,"aventura":3,"performance":4,"custo":2}'::jsonb
)
on conflict (id) do update set
  name = excluded.name, brand = excluded.brand, category = excluded.category, price = excluded.price,
  power_cv = excluded.power_cv, torque_nm = excluded.torque_nm, battery_kwh = excluded.battery_kwh,
  battery_chem = excluded.battery_chem, motor_type = excluded.motor_type, range_km = excluded.range_km,
  accel = excluded.accel, ground_clearance = excluded.ground_clearance, trunk_l = excluded.trunk_l,
  weight_kg = excluded.weight_kg, wallbox = excluded.wallbox, ac_kw = excluded.ac_kw, dc_kw = excluded.dc_kw,
  airbags = excluded.airbags, warranty = excluded.warranty, fuel_type = excluded.fuel_type,
  verified = excluded.verified, price_verified_date = excluded.price_verified_date,
  maintenance_interval = excluded.maintenance_interval, maintenance_first_cost = excluded.maintenance_first_cost,
  maintenance_km_base = excluded.maintenance_km_base, maintenance_total_cost = excluded.maintenance_total_cost,
  consumption_kwh_100 = excluded.consumption_kwh_100, tech_notes = excluded.tech_notes,
  image_url = excluded.image_url, video_url = excluded.video_url, personas = excluded.personas;
