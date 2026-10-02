-- Custos de revisão da MG, do site oficial MG Care
-- (https://mgmotoroficial.com.br/mg-care/manutencao), consultado em 02/10/2026.
-- 8 revisões programadas, a cada 24.000 km ou 12 meses, de 24.000 a 192.000 km.
-- "Preços sugeridos (base SP) e válidos nacionalmente até 31/07/2026": é a
-- tabela publicada hoje, mas a validade declarada já passou.
-- MG4 Comfort usa a tabela "MG4"; o MG4 Urban já tinha custo de uma tabela
-- anterior e passa para a atual.
-- Critério geral: soma de todas as revisões da tabela; km base = última revisão.

begin;

-- MG4 Urban Luxury 54 kWh <- MG Care "MG4 Urban": R$ 7.162 em 192.000 km (R$ 373 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 360)',
  maintenance_km_base = 192000,
  maintenance_total_cost = 7162
where id = 'mg4urban';

-- MG4 Comfort <- MG Care "MG4": R$ 7.082 em 192.000 km (R$ 369 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 400)',
  maintenance_km_base = 192000,
  maintenance_total_cost = 7082
where id = 'mg-mg4';

-- MG S5 <- MG Care "MG S5": R$ 7.242 em 192.000 km (R$ 377 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 440)',
  maintenance_km_base = 192000,
  maintenance_total_cost = 7242
where id = 'mg-s5';

-- MG Cyberster <- MG Care "Cyberster": R$ 14.164 em 192.000 km (R$ 738 a cada 10.000 km)
update cars set
  maintenance_interval = '24.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 900)',
  maintenance_km_base = 192000,
  maintenance_total_cost = 14164
where id = 'mg-cyberster';

commit;

-- Conferência: devem voltar 4 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('mg4urban', 'mg-mg4', 'mg-s5', 'mg-cyberster') order by name;
