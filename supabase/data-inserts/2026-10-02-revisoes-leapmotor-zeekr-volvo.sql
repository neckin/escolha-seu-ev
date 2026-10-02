-- Custos de revisão programada: Leapmotor, Zeekr e Volvo. Fontes oficiais,
-- consultadas em 02/10/2026:
--
--   Leapmotor: simulador "Revisão Programada" do site oficial
--     (https://www.leapmotor.com.br/servicos-e-manuais/revisao-programada.html),
--     que consulta a API da Stellantis (maintenance-service, preço por modelo e
--     concessionária). O site avisa que o valor é "da concessionária
--     selecionada", mas os preços foram idênticos nas 11 concessionárias
--     consultadas em DF, GO, SP, RJ e MG. Ano-modelo 2026. A cada 20.000 km
--     ou 12 meses, 5 revisões até 100.000 km.
--
--   Zeekr: tabela do site oficial (print enviado pelo usuário,
--     brand-docs/revisoe_zeekr.png): 8 revisões anuais, a cada 20.000 km,
--     uma linha de preços para X/001 e outra para o 7X.
--
--   Volvo: PDFs oficiais "Revisão Preço Fixo" (válidos até 31/12/2026),
--     https://www.volvocars.com/br/l/servico-manutencao/plano-revisao/ ,
--     salvos em brand-docs/volvo/.
--     Elétricos (EX30, EC40/EX40, EX90): a cada 30.000 km ou 24 meses; a
--     tabela marca 30, 60 e 90 mil km como "Incluído no Plano de Manutenção do
--     Veículo" (3 anos após a compra ou 100.000 km, o que ocorrer primeiro) e
--     só 120 e 150 mil km como pagos. Seguimos a tabela: as incluídas contam
--     como R$ 0 (vale se feitas dentro dos 3 anos / 100.000 km).
--     Linhas 60 e 90 (XC60 e XC90 T8, mesma tabela da versão a gasolina):
--     troca de óleo a cada 10.000 km e revisão completa a cada 20.000 km ou
--     12 meses, 15 revisões até 150.000 km; a de 120.000 km inclui correia
--     dentada. Essas tabelas não citam o Plano de Manutenção.
--     Sem tabela oficial: Volvo ES90 (fica sem custo).
--
-- Critério geral: soma de todas as revisões da tabela; km base = última revisão.

begin;

-- Leapmotor B10 <- Leapmotor B10 ELETRICO (BEV) 2026: R$ 4.066 em 100.000 km (R$ 407 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 270)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 4066
where id = 'leapmotor-b10';

-- Leapmotor C10 <- Leapmotor C10 Eletrico (BEV) 2026: R$ 4.347 em 100.000 km (R$ 435 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 270)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 4347
where id = 'leapmotor-c10';

-- Leapmotor C10 REEV <- Leapmotor C10 Ultra Hibrido (REEV) 2026: R$ 10.120 em 100.000 km (R$ 1.012 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.362)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 10120
where id = 'leapmotor-c10-reev';

-- Zeekr X Flagship <- Zeekr: valores Zeekr X e Zeekr 001: R$ 9.502 em 160.000 km (R$ 594 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 856)',
  maintenance_km_base = 160000,
  maintenance_total_cost = 9502
where id = 'zeekr-x';

-- Zeekr 001 Premium <- Zeekr: valores Zeekr X e Zeekr 001: R$ 9.502 em 160.000 km (R$ 594 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 856)',
  maintenance_km_base = 160000,
  maintenance_total_cost = 9502
where id = 'zeekr-001';

-- Zeekr 7X <- Zeekr: valores Zeekr 7X: R$ 11.554 em 160.000 km (R$ 722 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 933)',
  maintenance_km_base = 160000,
  maintenance_total_cost = 11554
where id = 'zeekr-7x';

-- Volvo EX30 <- Volvo: Tabela_Revisao_EX30_2026: R$ 1.438 em 150.000 km (R$ 96 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1438
where id = 'volvo-ex30';

-- Volvo EX30 Ultra Twin Motor <- Volvo: Tabela_Revisao_EX30_2026: R$ 1.438 em 150.000 km (R$ 96 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1438
where id = 'volvo-ex30-ultra';

-- Volvo EX40 <- Volvo: Tabela_Revisao_bev_2026 (EC40 e EX40): R$ 1.914 em 150.000 km (R$ 128 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1914
where id = 'volvo-ex40';

-- Volvo EX40 Ultra P8 <- Volvo: Tabela_Revisao_bev_2026 (EC40 e EX40): R$ 1.914 em 150.000 km (R$ 128 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1914
where id = 'volvo-ex40-ultra';

-- Volvo EC40 Plus <- Volvo: Tabela_Revisao_bev_2026 (EC40 e EX40): R$ 1.914 em 150.000 km (R$ 128 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1914
where id = 'volvo-ec40-plus';

-- Volvo EC40 Ultra <- Volvo: Tabela_Revisao_bev_2026 (EC40 e EX40): R$ 1.914 em 150.000 km (R$ 128 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 1914
where id = 'volvo-ec40-ultra';

-- Volvo EX90 <- Volvo: Tabela_Revisao_EX90_2025: R$ 2.358 em 150.000 km (R$ 157 a cada 10.000 km)
update cars set
  maintenance_interval = '30.000 km ou 24 meses',
  maintenance_first_cost = 'Incluída no Plano de Manutenção Volvo (3 anos ou 100.000 km)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 2358
where id = 'volvo-ex90';

-- Volvo XC60 Recharge T8 <- Volvo: Tabela_Revisao_Linha_60_2026: R$ 38.502 em 150.000 km (R$ 2.567 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km (troca de óleo intermediária) e revisão completa a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.239)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 38502
where id = 'volvo-xc60-recharge-t8';

-- Volvo XC90 Recharge T8 <- Volvo: Tabela_Revisao_Linha_90_2026: R$ 39.395 em 150.000 km (R$ 2.626 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km (troca de óleo intermediária) e revisão completa a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.289)',
  maintenance_km_base = 150000,
  maintenance_total_cost = 39395
where id = 'volvo-xc90-recharge-t8';

commit;

-- Conferência: devem voltar 15 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('leapmotor-b10', 'leapmotor-c10', 'leapmotor-c10-reev', 'zeekr-x', 'zeekr-001', 'zeekr-7x', 'volvo-ex30', 'volvo-ex30-ultra', 'volvo-ex40', 'volvo-ex40-ultra', 'volvo-ec40-plus', 'volvo-ec40-ultra', 'volvo-ex90', 'volvo-xc60-recharge-t8', 'volvo-xc90-recharge-t8')
order by brand, name;
