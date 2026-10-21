-- Consumo oficial do INMETRO pra fechar a lacuna do simulador de economia.
-- Fonte: Tabela PBEV 2026 (atualização 14/ago/26), gov.br/inmetro, baixada em 20/10/2026:
-- https://www.gov.br/inmetro/pt-br/assuntos/regulamentacao/avaliacao-da-conformidade/programa-brasileiro-de-etiquetagem/tabelas-de-eficiencia-energetica/veiculos-automotivos-pbe-veicular/mascara-pbev-2026_19_jan-rev01.pdf/@@download/file
--
-- Até aqui o simulador só calculava elétricos puros; híbridos e plug-ins ficavam
-- sem economia porque o banco não tinha como guardar km/l nem autonomia elétrica.
-- Duas colunas novas:
--   fuel_km_l          gasolina, ciclo combinado PBEV (HEV; PHEV no modo híbrido)
--   electric_range_km  "autonomia no modo elétrico" PBEV (só PHEV; range_km segue
--                      sendo a autonomia total já cadastrada)
-- Critérios:
--   BEV  consumption_kwh_100 = bateria do catálogo / autonomia PBEV, o mesmo método
--        dos outros elétricos da base.
--   PHEV consumption_kwh_100 = "Consumo Energético" PBEV (MJ/km) / 3,6 x 100. Bateria /
--        autonomia não serve aqui: a reserva que o plug-in nunca usa infla o resultado
--        (o Tank 300 daria 49 kWh/100km).
-- Ficam de fora, sem fonte primária: BMW iX1 xDrive30, MINI JCW Cooper E e JCW
-- Aceman E (sites oficiais não publicam a bateria), Porsche Taycan GTS (sem bateria
-- oficial e sem linha GTS na tabela), Kia Carnival Hybrid (fora da tabela) e BYD Song
-- Plus PHEV FWD linha 2027 (nenhuma linha da tabela bate com os 99km cadastrados).

alter table cars add column if not exists fuel_km_l numeric;
alter table cars add column if not exists electric_range_km integer;

begin;

update cars set
  consumption_kwh_100 = 13.4,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo de 13,4 kWh/100km calculado a partir de bateria/autonomia oficiais (30,08kWh ÷ 224km do INMETRO, tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GL 5 EV").'
where id = 'byd-dolphin-mini-gl';

update cars set
  consumption_kwh_100 = 13.9,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo de 13,9 kWh/100km calculado a partir de bateria/autonomia oficiais (38,88kWh ÷ 280km do INMETRO, tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GS 5 EV").'
where id = 'byd-dolphin-mini-gs';

update cars set
  consumption_kwh_100 = 18,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo de 18,0 kWh/100km calculado a partir de bateria/autonomia oficiais (45,1kWh ÷ 250km do INMETRO, tabela PBEV 2026 rev. 14/08/2026, versão "BYD | YUAN PRO | GS 290EV").'
where id = 'byd-yuan-pro';

update cars set
  consumption_kwh_100 = 17.4,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo de 17,4 kWh/100km calculado a partir de bateria/autonomia oficiais (44,12kWh ÷ 253km do INMETRO, tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION UT | PREMIUM").'
where id = 'gac-aion-ut-premium';

update cars set
  consumption_kwh_100 = 18.4,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo de 18,4 kWh/100km calculado a partir de bateria/autonomia oficiais (58kWh ÷ 315km do INMETRO, tabela PBEV 2026 rev. 14/08/2026, versão "GWM | ORA 03 | BEV58").'
where id = 'gwm-ora-03-bev58';

update cars set
  consumption_kwh_100 = 25.6,
  fuel_km_l = 9.9,
  electric_range_km = 61,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | 330e | -"): 25,6 kWh/100km no modo elétrico (0,92 MJ/km), 61km de autonomia no modo elétrico e 9,9 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'bmw-330e';

update cars set
  consumption_kwh_100 = 21.1,
  fuel_km_l = 11.5,
  electric_range_km = 70,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | 530e | M SPORT"): 21,1 kWh/100km no modo elétrico (0,76 MJ/km), 70km de autonomia no modo elétrico e 11,5 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'bmw-530e';

update cars set
  consumption_kwh_100 = 24.4,
  fuel_km_l = 9.5,
  electric_range_km = 76,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | X5 | xDrive50e MSP"): 24,4 kWh/100km no modo elétrico (0,88 MJ/km), 76km de autonomia no modo elétrico e 9,5 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'bmw-x5-xdrive50e';

update cars set
  consumption_kwh_100 = 15.8,
  fuel_km_l = 14.7,
  electric_range_km = 33,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GL DM FLEX"): 15,8 kWh/100km no modo elétrico (0,57 MJ/km), 33km de autonomia no modo elétrico e 14,7 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-atto-2-gl';

update cars set
  consumption_kwh_100 = 14.2,
  fuel_km_l = 14.8,
  electric_range_km = 75,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GS DM FLEX"): 14,2 kWh/100km no modo elétrico (0,51 MJ/km), 75km de autonomia no modo elétrico e 14,8 km/l de gasolina no modo híbrido (ciclo combinado). A autonomia elétrica de 110km citada acima não é a do INMETRO: a tabela PBEV registra 75km pra esta versão.'
where id = 'byd-atto-2-gs';

update cars set
  consumption_kwh_100 = 19.7,
  fuel_km_l = 11.1,
  electric_range_km = 111,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 8 | GS DM"): 19,7 kWh/100km no modo elétrico (0,71 MJ/km), 111km de autonomia no modo elétrico e 11,1 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-atto-8';

update cars set
  consumption_kwh_100 = 13.6,
  fuel_km_l = 14.6,
  electric_range_km = 78,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | KING | GS DM"): 13,6 kWh/100km no modo elétrico (0,49 MJ/km), 78km de autonomia no modo elétrico e 14,6 km/l de gasolina no modo híbrido (ciclo combinado). ATENÇÃO: a bateria de 6,6kWh cadastrada não é compatível com os 78km elétricos da GS no INMETRO — capacidade a reconferir na ficha oficial.'
where id = 'byd-king-phev';

update cars set
  consumption_kwh_100 = 18.6,
  fuel_km_l = 11.2,
  electric_range_km = 87,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SONG PLUS | PREM DM"): 18,6 kWh/100km no modo elétrico (0,67 MJ/km), 87km de autonomia no modo elétrico e 11,2 km/l de gasolina no modo híbrido (ciclo combinado). A tabela também traz uma linha "PREM DM (MY27)" com 83km elétricos e 11,3km/l — usada aqui a linha que bate com os 87km já cadastrados.'
where id = 'byd-song-plus-premium-dmi';

update cars set
  consumption_kwh_100 = 14.7,
  fuel_km_l = 15,
  electric_range_km = 57,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SONG PRO | GL DM FLEX"): 14,7 kWh/100km no modo elétrico (0,53 MJ/km), 57km de autonomia no modo elétrico e 15,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-song-pro-dm-i-flex';

update cars set
  consumption_kwh_100 = 25.3,
  fuel_km_l = 8.6,
  electric_range_km = 68,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SHARK | GS DM"): 25,3 kWh/100km no modo elétrico (0,91 MJ/km), 68km de autonomia no modo elétrico e 8,6 km/l de gasolina no modo híbrido (ciclo combinado). A tabela atual registra 68km elétricos (não os 57km citados acima).'
where id = 'byd-shark-phev';

update cars set
  consumption_kwh_100 = 25.8,
  fuel_km_l = 8.2,
  electric_range_km = 74,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "DENZA | B5 | GS DM"): 25,8 kWh/100km no modo elétrico (0,93 MJ/km), 74km de autonomia no modo elétrico e 8,2 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'denza-b5';

update cars set
  consumption_kwh_100 = 15.3,
  fuel_km_l = 14,
  electric_range_km = 65,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 EM-i | MAX / PRO"): 15,3 kWh/100km no modo elétrico (0,55 MJ/km), 65km de autonomia no modo elétrico e 14,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'geely-ex5-em-i';

update cars set
  consumption_kwh_100 = 16.4,
  fuel_km_l = 14,
  electric_range_km = 112,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 EM-i | ULTRA"): 16,4 kWh/100km no modo elétrico (0,59 MJ/km), 112km de autonomia no modo elétrico e 14,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'geely-ex5-em-i-ultra';

update cars set
  consumption_kwh_100 = 16.7,
  fuel_km_l = 13.8,
  electric_range_km = 77,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | HAVAL H6 | PHEV19 FF"): 16,7 kWh/100km no modo elétrico (0,60 MJ/km), 77km de autonomia no modo elétrico e 13,8 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'gwm-haval-h6-phev';

update cars set
  consumption_kwh_100 = 19.4,
  fuel_km_l = 11.6,
  electric_range_km = 126,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | HAVAL H6 | PHEV35 FF"): 19,4 kWh/100km no modo elétrico (0,70 MJ/km), 126km de autonomia no modo elétrico e 11,6 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'gwm-haval-h6-phev35';

update cars set
  consumption_kwh_100 = 30.3,
  fuel_km_l = 7.6,
  electric_range_km = 75,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | TANK 300 | PHEV"): 30,3 kWh/100km no modo elétrico (1,09 MJ/km), 75km de autonomia no modo elétrico e 7,6 km/l de gasolina no modo híbrido (ciclo combinado). A tabela também lista uma versão PHEV FLEX com números quase iguais (74km elétricos, 7,5km/l).'
where id = 'gwm-tank-300';

update cars set
  consumption_kwh_100 = 23.1,
  fuel_km_l = 10,
  electric_range_km = 128,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | WEY | 07"): 23,1 kWh/100km no modo elétrico (0,83 MJ/km), 128km de autonomia no modo elétrico e 10,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'gwm-wey-07';

update cars set
  consumption_kwh_100 = 16.7,
  fuel_km_l = 14.3,
  electric_range_km = 79,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JAECOO | 7 | PRESTIGE"): 16,7 kWh/100km no modo elétrico (0,60 MJ/km), 79km de autonomia no modo elétrico e 14,3 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jaecoo-7-phev';

update cars set
  consumption_kwh_100 = 17.2,
  fuel_km_l = 13.4,
  electric_range_km = 70,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | S06 DM | ADVANCE"): 17,2 kWh/100km no modo elétrico (0,62 MJ/km), 70km de autonomia no modo elétrico e 13,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-s06';

update cars set
  consumption_kwh_100 = 18.3,
  fuel_km_l = 13,
  electric_range_km = 88,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T1 I-DM | ADVANCE"): 18,3 kWh/100km no modo elétrico (0,66 MJ/km), 88km de autonomia no modo elétrico e 13,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-t1';

update cars set
  consumption_kwh_100 = 22.2,
  fuel_km_l = 11,
  electric_range_km = 75,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | ADVANCE"): 22,2 kWh/100km no modo elétrico (0,80 MJ/km), 75km de autonomia no modo elétrico e 11,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-t2-phev';

update cars set
  consumption_kwh_100 = 23.3,
  fuel_km_l = 9.9,
  electric_range_km = 106,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | PRM 4X4"): 23,3 kWh/100km no modo elétrico (0,84 MJ/km), 106km de autonomia no modo elétrico e 9,9 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-t2-4x4-xwd';

update cars set
  consumption_kwh_100 = 31.1,
  fuel_km_l = 7.9,
  electric_range_km = 71,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LAND ROVER | RANGE ROVER | PHEV AB"): 31,1 kWh/100km no modo elétrico (1,12 MJ/km), 71km de autonomia no modo elétrico e 7,9 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'land-rover-range-rover-p550e';

update cars set
  consumption_kwh_100 = 31.1,
  fuel_km_l = 7.9,
  electric_range_km = 71,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LAND ROVER | RANGE ROVER SPORT | PHEV AB"): 31,1 kWh/100km no modo elétrico (1,12 MJ/km), 71km de autonomia no modo elétrico e 7,9 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'land-rover-range-rover-sport-p550e';

update cars set
  consumption_kwh_100 = 25.6,
  fuel_km_l = 8.7,
  electric_range_km = 40,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LAND ROVER | VELAR | PHEV AB"): 25,6 kWh/100km no modo elétrico (0,92 MJ/km), 40km de autonomia no modo elétrico e 8,7 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'land-rover-range-rover-velar-p400e';

update cars set
  consumption_kwh_100 = 18.1,
  fuel_km_l = 12,
  electric_range_km = 111,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | C10 | REEV"): 18,1 kWh/100km no modo elétrico (0,65 MJ/km), 111km de autonomia no modo elétrico e 12,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'leapmotor-c10-reev';

update cars set
  consumption_kwh_100 = 16.9,
  fuel_km_l = 13.8,
  electric_range_km = 56,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | NX 450H PLUG-IN"): 16,9 kWh/100km no modo elétrico (0,61 MJ/km), 56km de autonomia no modo elétrico e 13,8 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'lexus-nx-450h-plus';

update cars set
  consumption_kwh_100 = 17.8,
  fuel_km_l = 13.4,
  electric_range_km = 54,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | RX450H PLUG-IN"): 17,8 kWh/100km no modo elétrico (0,64 MJ/km), 54km de autonomia no modo elétrico e 13,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'lexus-rx-450h-plus';

update cars set
  consumption_kwh_100 = 21.4,
  fuel_km_l = 11.1,
  electric_range_km = 58,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Mitsubishi | Outlander | HPE-S E"): 21,4 kWh/100km no modo elétrico (0,77 MJ/km), 58km de autonomia no modo elétrico e 11,1 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'mitsubishi-outlander-phev';

update cars set
  consumption_kwh_100 = 18.3,
  fuel_km_l = 13,
  electric_range_km = 60,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "OMODA | 7 | PHEV LUXURY"): 18,3 kWh/100km no modo elétrico (0,66 MJ/km), 60km de autonomia no modo elétrico e 13,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'omoda-7-shs-p';

update cars set
  consumption_kwh_100 = 23.9,
  fuel_km_l = 9.4,
  electric_range_km = 48,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | XC60 | T8"): 23,9 kWh/100km no modo elétrico (0,86 MJ/km), 48km de autonomia no modo elétrico e 9,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'volvo-xc60-recharge-t8';

update cars set
  consumption_kwh_100 = 24.4,
  fuel_km_l = 9.4,
  electric_range_km = 47,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | XC90 | T8"): 24,4 kWh/100km no modo elétrico (0,88 MJ/km), 47km de autonomia no modo elétrico e 9,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'volvo-xc90-recharge-t8';

update cars set
  fuel_km_l = 14.5,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "FORD | Maverick | Lariat Hybrid"): 14,5 km/l de gasolina no ciclo combinado.'
where id = 'ford-maverick-hybrid';

update cars set
  fuel_km_l = 13,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | GS4 | PREMIUM"): 13,0 km/l de gasolina no ciclo combinado.'
where id = 'gac-gs4-hybrid';

update cars set
  fuel_km_l = 16.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | ACCORD HYBRID | TOURING"): 16,6 km/l de gasolina no ciclo combinado.'
where id = 'honda-accord-advanced-hybrid';

update cars set
  fuel_km_l = 17.2,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | CIVIC HYBRID | TOURING"): 17,2 km/l de gasolina no ciclo combinado.'
where id = 'honda-civic-advanced-hybrid';

update cars set
  fuel_km_l = 13,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | CR-V | TOURING"): 13,0 km/l de gasolina no ciclo combinado.'
where id = 'honda-cr-v-advanced-hybrid';

update cars set
  fuel_km_l = 16.8,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | PRELUDE | TOP"): 16,8 km/l de gasolina no ciclo combinado.'
where id = 'honda-prelude';

update cars set
  fuel_km_l = 17.2,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HYUNDAI | KONA | Ultimate"): 17,2 km/l de gasolina no ciclo combinado.'
where id = 'hyundai-kona-hibrido';

update cars set
  fuel_km_l = 17.2,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "KIA | NIRO | HEV 1.6 SX"): 17,2 km/l de gasolina no ciclo combinado.'
where id = 'kia-niro-hev';

update cars set
  fuel_km_l = 12.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "RENAULT | KOLEOS | E-TECH"): 12,6 km/l de gasolina no ciclo combinado.'
where id = 'renault-koleos-hybrid-e-tech';

update cars set
  fuel_km_l = 15.3,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | COROLLA CROSS | XRX HYBRID"): 15,3 km/l de gasolina no ciclo combinado.'
where id = 'toyota-corolla-cross-hybrid';

update cars set
  fuel_km_l = 16.4,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | COROLLA | GLI HEV"): 16,4 km/l de gasolina no ciclo combinado.'
where id = 'toyota-corolla-hybrid';

update cars set
  fuel_km_l = 16.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | YARIS CROSS | XRE-HYBRID"): 16,6 km/l de gasolina no ciclo combinado.'
where id = 'toyota-yaris-cross-hybrid';

commit;
