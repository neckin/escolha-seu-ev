-- Custos de revisão programada: Chevrolet, Jetour, Denza B5 e BYD Tan.
-- Fontes oficiais, consultadas em 02/10/2026:
--   Chevrolet: dados do simulador "Revisão Preço Fixo" do site oficial
--     (https://www.chevrolet.com.br/servicos/revisao, que carrega
--     https://novoservico.gm.com/json/data_pt-br.json). O site mostra cada
--     revisão como "4 x R$ N"; usamos 4 x N como preço. A GM arredonda a
--     parcela para reais inteiros, então o total pode variar alguns reais.
--     Equinox EV e Blazer EV só existem como ano-modelo 2024 no simulador
--     (é a única tabela oficial publicada para eles); Spark EV e Captiva EV,
--     ano-modelo 2026.
--   Jetour: tabela "Preço total da revisão" do site oficial Jetour Brasil
--     (imagem enviada pelo usuário, brand-docs/revisões Jetour.png). "T2" =
--     Jetour T2 PHEV e "T2 4x4" = Jetour T2 XWD 4x4 do catálogo.
--   Denza B5: PDF oficial "B5 DMO plano v26.09", vigência 01/09/2026.
--   BYD Tan: PDF oficial "TAN EV (2024 e 2025)", vigência 01/09/2026. É a
--     única tabela da BYD para o Tan; incluído pelo mesmo critério usado para
--     Equinox e Blazer.
-- Critério: soma de todas as revisões da tabela; km base = última revisão.
-- Sem carro no catálogo: Denza D9 e Z9 (PDFs também enviados).

begin;

-- Chevrolet Spark EUV <- "Spark EV 2026": R$ 6.900 (aprox., 4 x parcela) em 100.000 km (R$ 690 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (~R$ 316)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 6900
where id = 'chevrolet-spark-euv';

-- Chevrolet Captiva EV Premier <- "Captiva EV 2026": R$ 6.088 (aprox., 4 x parcela) em 100.000 km (R$ 609 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (~R$ 252)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 6088
where id = 'chevrolet-captiva-ev';

-- Chevrolet Equinox EV <- "Equinox EV 2024": R$ 8.196 (aprox., 4 x parcela) em 100.000 km (R$ 820 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 100000,
  maintenance_total_cost = 8196
where id = 'chevrolet-equinox-ev';

-- Chevrolet Blazer EV RS <- "Blazer EV 2024": R$ 8.020 (aprox., 4 x parcela) em 100.000 km (R$ 802 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 100000,
  maintenance_total_cost = 8020
where id = 'chevrolet-blazer-ev';

-- Jetour S06 <- "Jetour S06": R$ 14.858 em 100.000 km (R$ 1.486 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 898)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 14858
where id = 'jetour-s06';

-- Jetour T1 <- "Jetour T1": R$ 14.858 em 100.000 km (R$ 1.486 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 898)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 14858
where id = 'jetour-t1';

-- Jetour T2 PHEV <- "Jetour T2": R$ 15.061 em 100.000 km (R$ 1.506 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 898)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 15061
where id = 'jetour-t2-phev';

-- Jetour T2 XWD 4x4 <- "Jetour T2 4x4": R$ 15.061 em 100.000 km (R$ 1.506 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 898)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 15061
where id = 'jetour-t2-4x4-xwd';

-- Denza B5 <- "Denza B5 DMO": R$ 32.873 em 120.000 km (R$ 2.739 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.464)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 32873
where id = 'denza-b5';

-- BYD Tan <- "BYD TAN EV (2024 e 2025)": R$ 11.953 em 200.000 km (R$ 598 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 385)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 11953
where id = 'byd-tan';

commit;

-- Conferência: devem voltar 10 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('chevrolet-spark-euv', 'chevrolet-captiva-ev', 'chevrolet-equinox-ev', 'chevrolet-blazer-ev', 'jetour-s06', 'jetour-t1', 'jetour-t2-phev', 'jetour-t2-4x4-xwd', 'denza-b5', 'byd-tan')
order by brand, name;
