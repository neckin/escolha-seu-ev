-- Resposta ao pedido do usuário em 21/09/2026: rodar verificação de
-- atualizações (preço/versão/lançamento) no catálogo. A triagem automática
-- (GitHub Actions) está quebrada desde 14/09/2026 por falta do secret
-- ANTHROPIC_API_KEY — isso foi feito manualmente, com 4 varreduras paralelas
-- por marca, cada uma verificando direto em site oficial/configurador da
-- marca (nunca por resumo de busca — ver memória catalog-verification-rigor).
-- Relatório completo: scripts/pending-reviews/2026-09-21-verificacao-manual-catalogo.md
--
-- Este arquivo cobre só a parte já decidida com o usuário: remoção dos
-- modelos confirmadamente fora de linha, e troca de trim de 2 carros cujo
-- trim catalogado deixou de ser vendido (o oficial só vende um trim mais
-- caro/diferente agora). Preços/versões atualizadas e candidatos a modelo
-- novo (RAV4, UX 300h, etc.) ficam para um arquivo separado — ainda não
-- decidido com o usuário.

-- ============================================================
-- 1) Remoções — modelo sumiu da grade oficial da marca
-- ============================================================
--
-- Renault Kwid E-Tech: ausente da página oficial de elétricos da Renault
-- (renault.com.br) — só Megane e Kangoo aparecem. Imprensa (secundário)
-- aponta fim de vendas ~abr/2026.
--
-- Jeep Grand Cherokee 4xe: Grand Cherokee sumiu inteiro da navegação oficial
-- da Jeep Brasil (jeep.com.br) — só Avenger, Renegade, Compass, Commander,
-- Wrangler, Gladiator continuam listados.
--
-- Peugeot e-2008: página oficial 404 (peugeot.com.br/gama/peugeot-e2008.html).
-- A linha 2008 atual é só MHEV (GT MHEV, Allure T200 AT, Active T200 AT) —
-- sem versão plug-in. Substituto e-3008 ainda não lançado (página também 404).
--
-- BMW i5 e BMW iX: ausentes da grade BEV oficial atual da BMW
-- (bmw.com.br/pt/all-models.html, só 7 cards BEV, nenhum é i5 ou iX).
-- Confiança média — sem comunicado explícito de descontinuação, só ausência
-- da grade + imprensa secundária apontando remoção ~mai/2026. Reversível
-- se reaparecerem numa checagem futura.

delete from cars where id in (
  'renault-kwid-e-tech',
  'jeep-grand-cherokee-4xe',
  'peugeot-e-2008',
  'bmw-i5',
  'bmw-ix'
);

-- ============================================================
-- 2) Troca de trim — o trim catalogado não é mais vendido, só um
--    trim diferente (mecanicamente) do mesmo modelo continua na grade
-- ============================================================
--
-- BMW iX1: o trim catalogado (eDrive20, FWD, R$359.950) sumiu do site
-- oficial (bmw.com.br/pt/all-models/bmw-i/ix1/bmw-ix1.html) — só resta
-- "BMW iX1 xDrive30 M Sport" (AWD, R$485.950). Confirmado hoje na própria
-- tabela "Dados Técnicos" da página: 306cv, 0-100km/h em 5,6s, autonomia de
-- 324km (a mesma página também cita "até 303 km" num parágrafo de marketing
-- separado — inconsistência da própria BMW, não nossa; ficamos com o valor
-- da tabela de dados técnicos por ser o dado estruturado). Torque e
-- capacidade de bateria NÃO aparecem em nenhum lugar dessa página oficial —
-- deixados em branco (null) em vez de reaproveitar os 494Nm/66,5kWh que uma
-- verificação anterior (nota técnica do registro antigo) tinha atribuído a
-- essa versão, já que a própria potência divergiu entre as duas checagens
-- (313cv na nota antiga vs. 306cv confirmado hoje) — precisa reconfirmação.
-- Vão livre (170mm) e porta-malas (490L) mantidos da versão eDrive20 por
-- serem do mesmo corpo/plataforma (não confirmados especificamente para o
-- trim AWD hoje). Consumo (kWh/100km) zerado por depender da bateria, que
-- ficou sem confirmação.
--
-- Porsche Taycan: o trim catalogado (base RWD, R$893.115) não existe mais
-- no configurador oficial (models.porsche.com/pt-BR/model-start/taycan) —
-- grade atual (sedã) é só GTS (R$1.110.000), Turbo S (R$1.580.000) e Turbo
-- GT Pacote Weissach (R$1.690.000); Cross Turismo à parte (4S/Turbo).
-- Recadastrado como GTS, o mais barato agora disponível. Confirmado hoje
-- direto na página do modelo (porsche.com/brazil/pt/models/taycan/taycan-
-- models/taycan-gts/): 700cv/515kW, 790Nm de torque máximo, 0-100km/h em
-- 3,3s, tração integral (motor elétrico nos eixos dianteiro E traseiro),
-- recarga DC de até 320kW (10-80% em 18min), garantia de bateria de alta
-- tensão 8 anos/160.000km. Capacidade de bateria em kWh e autonomia em km
-- NÃO são publicadas em nenhuma página oficial consultada — deixadas em
-- branco em vez de reaproveitar os 89kWh/453km da versão base (motor/
-- bateria são diferentes: dual-motor GTS vs. RWD single-motor base). Vão
-- livre e porta-malas mantidos do registro anterior (mesmo corpo sedã),
-- não reconfirmados especificamente para o GTS.
--
-- Depois de rodar isto: node scripts/generate-fallback-snapshot.mjs
-- + commit do carsFallback.json.

insert into cars (
  id, name, brand, category, price, power_cv, torque_nm, battery_kwh, battery_chem,
  motor_type, range_km, accel, ground_clearance, trunk_l, weight_kg, wallbox, ac_kw, dc_kw,
  airbags, warranty, fuel_type, verified, price_verified_date, maintenance_interval,
  maintenance_first_cost, maintenance_km_base, maintenance_total_cost, consumption_kwh_100,
  tech_notes, image_url, video_url, personas
) values
(
  'bmw-ix1',
  'BMW iX1 xDrive30 M Sport',
  'BMW',
  'SUV compacto premium',
  485950,
  306,
  null,
  null,
  null,
  'Elétrico dual-motor, tração integral (xDrive) — eixo dianteiro e traseiro, mesma plataforma U11 do eDrive20 (agora descontinuado no Brasil)',
  324,
  5.6,
  170,
  490,
  null,
  null,
  null,
  null,
  null,
  '8 anos/160.000 km bateria',
  'BEV',
  true,
  '21/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Trim eDrive20 (FWD, R$359.950, 204cv) catalogado anteriormente saiu de linha — só resta este xDrive30 M Sport (AWD) na página oficial da BMW (bmw.com.br/pt/all-models/bmw-i/ix1/bmw-ix1.html, verificado 21/09/2026). Potência (306cv), aceleração (5,6s 0-100km/h) e autonomia (324km, valor da tabela "Dados Técnicos" — a mesma página também menciona "até 303km" num parágrafo de marketing separado, inconsistência da própria BMW) confirmados direto na página oficial. Torque e capacidade de bateria não são publicados nessa página — deixados em branco em vez de reaproveitar uma estimativa antiga (494Nm/66,5kWh) de uma nota técnica anterior, já que até a potência divergiu entre as duas fontes (313cv vs 306cv agora) — vale reconfirmar com ficha técnica mais completa (PDF oficial, se existir) antes de preencher. Vão livre e porta-malas mantidos do registro anterior (mesma plataforma/corpo), não reconfirmados especificamente para este trim AWD. Consumo (kWh/100km) zerado por depender de uma capacidade de bateria não confirmada.',
  'https://bmw.scene7.com/is/image/BMW/u11-bev_stage:16to7?fmt=webp&wid=2560&fit=wrap%2C+1',
  'https://www.youtube.com/watch?v=80HhsqwRMwE',
  '{"custo":1,"urbano":3,"familia":4,"aventura":2,"performance":2}'::jsonb
),
(
  'porsche-taycan',
  'Porsche Taycan GTS',
  'Porsche',
  'Sedã grande premium',
  1110000,
  700,
  790,
  null,
  null,
  'PMSM dianteiro + traseiro, tração integral (Bateria Performance Plus, 800V)',
  null,
  3.3,
  127,
  491,
  null,
  null,
  null,
  320,
  null,
  '8 anos/160.000km bateria de alta tensão (garantia mundial Porsche)',
  'BEV',
  true,
  '21/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Trim base RWD (R$893.115, 408cv) catalogado anteriormente não existe mais no configurador oficial (models.porsche.com/pt-BR/model-start/taycan, verificado 21/09/2026) — grade sedã atual é só GTS (R$1.110.000), Turbo S (R$1.580.000) e Turbo GT Pacote Weissach (R$1.690.000). Recadastrado como GTS por ser o mais barato disponível agora. Potência (700cv/515kW), torque máximo (790Nm), aceleração (3,3s 0-100km/h com Launch Control) e tração integral (motor elétrico nos eixos dianteiro e traseiro) confirmados direto na página oficial do modelo. Recarga DC de até 320kW (10-80% em 18min) e garantia de bateria de alta tensão (8 anos/160.000km) também confirmadas na mesma página. Capacidade de bateria em kWh e autonomia em km não aparecem em nenhuma página oficial consultada (a página só descreve a bateria como "Performance Plus, 33 módulos, tecnologia 800V", sem número de kWh) — deixadas em branco em vez de reaproveitar os 89kWh/453km do trim base (motor e bateria são diferentes: dual-motor GTS vs. RWD single-motor base). Vão livre e porta-malas mantidos do registro anterior (mesmo corpo sedã Taycan), não reconfirmados especificamente para o GTS.',
  'https://images.porsche.com/f/285489813253582/3435x976/760c082f65/series-taycan-models-model-variant-image.png/m/3435x976/smart/filters:format(avif)',
  'https://www.youtube.com/watch?v=JEpdP0UPYzY',
  '{"custo":1,"urbano":2,"familia":2,"aventura":1,"performance":5}'::jsonb
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
