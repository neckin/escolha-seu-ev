-- Custos de revisão programada: GWM, Geely, Fiat 500e e Ford (Maverick
-- Hybrid e Mustang Mach-E). Fontes consultadas em 02/10/2026:
--
--   GWM: simulador "Revisões com preço fixo" do site oficial
--     (https://www.gwmmotors.com.br/pt/servicos/revisoes), lido revisão a
--     revisão no próprio formulário. Oferta válida para revisões até
--     31/10/2026. A página de modelos da GWM lista hoje todo Haval H6 e o
--     Tank 300 como "Híbrido Flex", então usamos as tabelas FLEX:
--     "HAVAL H6 PHEV19 FLEX", "HAVAL H6 PHEV35 FLEX" e "GWM TANK 300 PHEV FLEX"
--     (não as tabelas "HAVAL H6 PHEV19", "NOVO HAVAL H6 ..." nem "TANK 300 Hi4T").
--     Ora 5 já tinha custo (até 60.000 km); passa ao mesmo critério dos demais.
--
--   Geely: PDF "Planos de revisão" do site da concessionária Geely Jorlan-ev
--     (Brasília), enviado pelo usuário. O texto diz "Preço Fechado válido em
--     todo o território nacional ... realizadas até 30/09/2026", ou seja, a
--     validade já passou e a fonte não é a Geely Brasil. É a tabela mais
--     recente disponível; a mesma já usada antes no EX2 Max. CONFIRMAR se a
--     Geely publicou tabela nova.
--
--   Fiat 500e: print do site oficial Fiat. Valores "a partir de" (mínimo).
--
--   Ford: prints do site oficial Ford (Revisão Preço Fixo). A Ford cobra uma
--     revisão base a cada 16.000 km ou 12 meses e itens adicionais com
--     intervalo próprio. Para somar, montamos o calendário até 96.000 km
--     (6 revisões), assumindo 1 revisão por ano para os itens por tempo:
--       Maverick Hybrid: base R$ 1.290 + filtro de pólen a cada 32 mil km
--         (R$ 346) + filtro de ar a cada 48 mil km (R$ 438) + velas a cada
--         64 mil km (R$ 963) + fluido de freio a cada 36 meses (R$ 520).
--         Por revisão: 16.000 km R$ 1.290, 32.000 km R$ 1.636, 48.000 km R$ 2.248, 64.000 km R$ 2.599, 80.000 km R$ 1.290, 96.000 km R$ 2.594.
--       Mustang Mach-E: grátis por 3 anos sem limite de km (as 3 primeiras
--         revisões, com 1 por ano); depois base R$ 770 + filtro de pólen a
--         cada 32 mil km (R$ 324) + fluido de freio a cada 36 meses (R$ 762).
--         Por revisão: 16.000 km R$ 0, 32.000 km R$ 0, 48.000 km R$ 0, 64.000 km R$ 1.094, 80.000 km R$ 770, 96.000 km R$ 1.856.
--
-- Critério geral: soma de todas as revisões da tabela; km base = última revisão.

begin;

-- Fiat 500e <- Fiat: tabela 500E (valores 'a partir de'): R$ 2.096 em 75.000 km (R$ 279 a cada 10.000 km)
update cars set
  maintenance_interval = '15.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (a partir de R$ 274)',
  maintenance_km_base = 75000,
  maintenance_total_cost = 2096
where id = 'fiat-500e';

-- Ford Maverick Hybrid <- Ford: Revisão Maverick FHEV (base + itens adicionais): R$ 11.657 em 96.000 km (R$ 1.214 a cada 10.000 km)
update cars set
  maintenance_interval = '16.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.290)',
  maintenance_km_base = 96000,
  maintenance_total_cost = 11657
where id = 'ford-maverick-hybrid';

-- Ford Mustang Mach-E GT Performance <- Ford: Revisão Preço Fixo Mustang Mach-E: R$ 3.720 em 96.000 km (R$ 388 a cada 10.000 km)
update cars set
  maintenance_interval = '16.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita (3 anos, sem limite de km)',
  maintenance_km_base = 96000,
  maintenance_total_cost = 3720
where id = 'ford-mustang-mach-e';

-- GWM Ora 03 BEV58 <- GWM: ORA 03 BEV58: R$ 6.305 em 120.000 km (R$ 525 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 24 meses',
  maintenance_first_cost = 'Pago (R$ 849)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 6305
where id = 'gwm-ora-03-bev58';

-- GWM Ora 5 <- GWM: ORA 5: R$ 6.515 em 120.000 km (R$ 543 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 24 meses',
  maintenance_first_cost = 'Pago (R$ 839)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 6515
where id = 'ora5';

-- GWM Tank 300 Hi4-T <- GWM: GWM TANK 300 PHEV FLEX: R$ 27.930 em 120.000 km (R$ 2.328 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.449)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 27930
where id = 'gwm-tank-300';

-- GWM WEY 07 <- GWM: WEY 07: R$ 26.730 em 120.000 km (R$ 2.228 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.699)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 26730
where id = 'gwm-wey-07';

-- GWM Haval H6 PHEV19 <- GWM: HAVAL H6 PHEV19 FLEX: R$ 20.100 em 120.000 km (R$ 1.675 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.149)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 20100
where id = 'gwm-haval-h6-phev';

-- GWM Haval H6 PHEV35 <- GWM: HAVAL H6 PHEV35 FLEX: R$ 21.930 em 120.000 km (R$ 1.828 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.269)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 21930
where id = 'gwm-haval-h6-phev35';

-- Geely EX2 Max <- Geely: EX2: R$ 4.259 em 140.000 km (R$ 304 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 315)',
  maintenance_km_base = 140000,
  maintenance_total_cost = 4259
where id = 'ex2max';

-- Geely EX2 Pro <- Geely: EX2: R$ 4.259 em 140.000 km (R$ 304 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 315)',
  maintenance_km_base = 140000,
  maintenance_total_cost = 4259
where id = 'geely-ex2-pro';

-- Geely EX5 Pro <- Geely: EX5: R$ 5.506 em 140.000 km (R$ 393 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 445)',
  maintenance_km_base = 140000,
  maintenance_total_cost = 5506
where id = 'geely-ex5';

-- Geely EX5 Max <- Geely: EX5: R$ 5.506 em 140.000 km (R$ 393 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 445)',
  maintenance_km_base = 140000,
  maintenance_total_cost = 5506
where id = 'geely-ex5-max';

-- Geely EX5 EM-i Pro <- Geely: EX5 EM-i: R$ 16.893 em 150.000 km (R$ 1.126 a cada 10.000 km)
update cars set
  maintenance_interval = '15.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 683)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 16893
where id = 'geely-ex5-em-i';

-- Geely EX5 EM-i Ultra <- Geely: EX5 EM-i: R$ 16.893 em 150.000 km (R$ 1.126 a cada 10.000 km)
update cars set
  maintenance_interval = '15.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 683)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 16893
where id = 'geely-ex5-em-i-ultra';

commit;

-- Conferência: devem voltar 15 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('fiat-500e', 'ford-maverick-hybrid', 'ford-mustang-mach-e', 'gwm-ora-03-bev58', 'ora5', 'gwm-tank-300', 'gwm-wey-07', 'gwm-haval-h6-phev', 'gwm-haval-h6-phev35', 'ex2max', 'geely-ex2-pro', 'geely-ex5', 'geely-ex5-max', 'geely-ex5-em-i', 'geely-ex5-em-i-ultra')
order by brand, name;
