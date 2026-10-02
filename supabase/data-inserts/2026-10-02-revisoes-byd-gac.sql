-- Custos de revisão programada BYD e GAC, a partir das tabelas oficiais das
-- marcas enviadas pelo usuário em 02/10/2026 (arquivos em brand-docs/, que não
-- vai para o git):
--   BYD: 20 PDFs "Plano de revisões" por modelo, preços sugeridos BYD (base São
--        Paulo, válidos em todo o território nacional), vigência a partir de
--        01/09/2026.
--   GAC: "Plano de Revisões Periódicas GAC Brasil (Preços Fechados Nacionais)",
--        atualizado em 01/09/2026, válido até 31/12/2026.
--
-- Critério (o mesmo dos 5 carros que já tinham custo): maintenance_total_cost =
-- soma de TODAS as revisões da tabela oficial; maintenance_km_base = km da
-- última revisão da tabela. O app normaliza isso em custo a cada 10.000 km.
--
-- Mapeamentos que pediram decisão:
--   - Song Plus PHEV = linha 2027 (1.5 turbo, 26,6 kWh, conforme tech_notes) ->
--     tabela "SONG Plus DM-i (2026/2027)". Mesmos preços da Premium, que usa o
--     mesmo motor.
--   - GAC GS4 Hybrid -> tabela "GAC GS4": o configurador GAC só oferece o GS4
--     como HEV (tech_notes, capturado em 14/09/2026).
--   - Aion UT Premium/Elite e Aion Y Premium/Elite usam a tabela do modelo
--     (a GAC não separa por versão).
--   - Dolphin SE e Aion UT Elite já tinham valores de tabelas anteriores;
--     são substituídos pelos oficiais vigentes.
--   - FORA deste arquivo: BYD Tan (o PDF cobre só Tan 2024 e 2025; falta
--     confirmar o ano-modelo vendido hoje). Sem carro no catálogo para as
--     tabelas "SONG Pro DM-i" (não Flex), "SONG Plus 51 km", "SONG Plus 105 km
--     (2024)" e "SONG Plus DM-i (2025/2026)", nem para GAC GS3/GS9.

begin;

-- BYD Dolphin <- tabela "DOLPHIN / DOLPHIN Plus": R$ 9.156 em 200.000 km (R$ 458 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 393)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 9156
where id = 'byd-dolphin';

-- BYD Dolphin Plus <- tabela "DOLPHIN / DOLPHIN Plus": R$ 9.156 em 200.000 km (R$ 458 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 393)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 9156
where id = 'byd-dolphin-plus';

-- BYD Dolphin SE <- tabela "DOLPHIN Special Edition": R$ 9.156 em 200.000 km (R$ 458 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 393)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 9156
where id = 'dolphinse';

-- BYD Dolphin Mini GL <- tabela "DOLPHIN Mini": R$ 8.576 em 200.000 km (R$ 429 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 361)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 8576
where id = 'byd-dolphin-mini-gl';

-- BYD Dolphin Mini GS <- tabela "DOLPHIN Mini": R$ 8.576 em 200.000 km (R$ 429 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 361)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 8576
where id = 'byd-dolphin-mini-gs';

-- BYD Han EV <- tabela "HAN EV": R$ 11.645 em 200.000 km (R$ 582 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 396)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 11645
where id = 'byd-han-ev';

-- BYD Seal <- tabela "SEAL": R$ 14.043 em 200.000 km (R$ 702 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 381)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 14043
where id = 'byd-seal';

-- BYD Sealion 7 <- tabela "SEALION 7": R$ 14.008 em 200.000 km (R$ 700 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 388)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 14008
where id = 'byd-sealion-7';

-- BYD Yuan Plus AWD <- tabela "YUAN Plus AWD": R$ 11.629 em 200.000 km (R$ 581 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 388)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 11629
where id = 'byd-yuan-plus';

-- BYD Yuan Pro <- tabela "YUAN Plus / YUAN Pro": R$ 9.085 em 200.000 km (R$ 454 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 393)',
  maintenance_km_base = 200000,
  maintenance_total_cost = 9085
where id = 'byd-yuan-pro';

-- BYD Atto 2 DM-i Flex GL <- tabela "ATTO 2 DM-i Flex": R$ 17.578 em 120.000 km (R$ 1.465 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.033)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 17578
where id = 'byd-atto-2-gl';

-- BYD Atto 2 DM-i Flex GS <- tabela "ATTO 2 DM-i Flex": R$ 17.578 em 120.000 km (R$ 1.465 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.033)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 17578
where id = 'byd-atto-2-gs';

-- BYD Atto 8 <- tabela "ATTO 8 DMP": R$ 18.275 em 120.000 km (R$ 1.523 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.006)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 18275
where id = 'byd-atto-8';

-- BYD King PHEV <- tabela "KING DM-i": R$ 15.735 em 120.000 km (R$ 1.311 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 926)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 15735
where id = 'byd-king-phev';

-- BYD Shark PHEV <- tabela "SHARK DMO": R$ 20.980 em 120.000 km (R$ 1.748 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.127)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 20980
where id = 'byd-shark-phev';

-- BYD Song Plus PHEV <- tabela "SONG Plus DM-i (2026/2027)": R$ 18.294 em 120.000 km (R$ 1.524 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.003)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 18294
where id = 'byd-song-plus-phev';

-- BYD Song Plus Premium DM-i <- tabela "SONG Plus Premium DM-i": R$ 18.294 em 120.000 km (R$ 1.524 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.003)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 18294
where id = 'byd-song-plus-premium-dmi';

-- BYD Song Pro DM-i Flex <- tabela "SONG Pro DM-i Flex": R$ 18.050 em 120.000 km (R$ 1.504 a cada 10.000 km)
update cars set
  maintenance_interval = '12.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.033)',
  maintenance_km_base = 120000,
  maintenance_total_cost = 18050
where id = 'byd-song-pro-dm-i-flex';

-- GAC GS4 Hybrid Premium <- tabela "GAC GS4": R$ 14.565 em 100.000 km (R$ 1.456 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 5.000 km ou 6 meses; depois a cada 10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 100000,
  maintenance_total_cost = 14565
where id = 'gac-gs4-hybrid';

-- GAC Aion UT Elite <- tabela "GAC AION UT": R$ 10.603 em 200.000 km (R$ 530 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 200000,
  maintenance_total_cost = 10603
where id = 'aionut';

-- GAC Aion UT Premium <- tabela "GAC AION UT": R$ 10.603 em 200.000 km (R$ 530 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 200000,
  maintenance_total_cost = 10603
where id = 'gac-aion-ut-premium';

-- GAC Aion ES Plus <- tabela "GAC AION ES": R$ 9.578 em 190.000 km (R$ 504 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 10.000 km; depois a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 190000,
  maintenance_total_cost = 9578
where id = 'gac-aion-es';

-- GAC Aion Y Elite <- tabela "GAC AION Y": R$ 10.701 em 190.000 km (R$ 563 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 10.000 km; depois a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 190000,
  maintenance_total_cost = 10701
where id = 'gac-aion-y-elite';

-- GAC Aion Y Premium <- tabela "GAC AION Y": R$ 10.701 em 190.000 km (R$ 563 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 10.000 km; depois a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 190000,
  maintenance_total_cost = 10701
where id = 'gac-aion-y';

-- GAC Aion V Elite <- tabela "GAC AION V": R$ 12.028 em 190.000 km (R$ 633 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 10.000 km; depois a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 190000,
  maintenance_total_cost = 12028
where id = 'gac-aion-v';

-- GAC Hyptec HT Elite <- tabela "GAC HYPTEC HT": R$ 11.467 em 190.000 km (R$ 604 a cada 10.000 km)
update cars set
  maintenance_interval = '1ª aos 10.000 km; depois a cada 20.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita',
  maintenance_km_base = 190000,
  maintenance_total_cost = 11467
where id = 'gac-hyptec-ht';

commit;

-- Conferência: devem voltar 26 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('byd-dolphin', 'byd-dolphin-plus', 'dolphinse', 'byd-dolphin-mini-gl', 'byd-dolphin-mini-gs', 'byd-han-ev', 'byd-seal', 'byd-sealion-7', 'byd-yuan-plus', 'byd-yuan-pro', 'byd-atto-2-gl', 'byd-atto-2-gs', 'byd-atto-8', 'byd-king-phev', 'byd-shark-phev', 'byd-song-plus-phev', 'byd-song-plus-premium-dmi', 'byd-song-pro-dm-i-flex', 'gac-gs4-hybrid', 'aionut', 'gac-aion-ut-premium', 'gac-aion-es', 'gac-aion-y-elite', 'gac-aion-y', 'gac-aion-v', 'gac-hyptec-ht')
order by brand, name;
