-- Recarga: potência AC/DC e tempos oficiais de recarga, BYD e Volvo (21/10/2026).
--
-- Duas colunas novas, com o tempo que a própria marca publica (quando publica):
--   charge_ac_hours    recarga completa em casa, 0 a 100% (wallbox)
--   charge_dc_minutes  recarga rápida, 10 a 80%
-- dc_kw = 0 passa a significar "não aceita recarga rápida" (null continua
-- sendo "não sabemos").
--
-- Fontes:
--   BYD: fichas técnicas oficiais 2026 linkadas em cada página de modelo de
--     byd.com/br (pasta fichas-tecnicas-2026/update-13-07-2026, e
--     BYD_SongProFlex_Rev3_05_08_2026.pdf). Onde a ficha só traz "Potência de
--     carregamento AC", o carro não aceita recarga DC (King, Song Pro, Atto 2).
--   Volvo: volvocars.com/br/cars/<modelo>/specifications/. Tempos: "Duração do
--     carregamento da bateria 0-100% (trifásico 16A)" e "10-80% (DC xx kW)".
--     XC60 e XC90 T8 só trazem a recarga AC (2-fásico 16A, 3 h).
--
-- Correções pela fonte oficial: BYD Han bateria 76,9 -> 85,4 kWh; BYD Tan DC
-- 110 -> 170 kW; Volvo EX90 DC 350 -> 250 kW.

alter table cars add column if not exists charge_ac_hours numeric;
alter table cars add column if not exists charge_dc_minutes integer;

begin;

-- BYD
update cars set ac_kw = 6.6, dc_kw = 120, battery_kwh = 85.4 where id = 'byd-han-ev';
update cars set ac_kw = 11, dc_kw = 170 where id = 'byd-tan';
update cars set ac_kw = 6.6, dc_kw = 65 where id = 'byd-yuan-pro';
update cars set ac_kw = 6.6 where id = 'byd-atto-8';
update cars set ac_kw = 6.6, dc_kw = 0 where id = 'byd-king-phev';
update cars set ac_kw = 6.6, dc_kw = 55 where id = 'byd-shark-phev';
update cars set ac_kw = 6.6 where id = 'byd-song-plus-phev';
update cars set ac_kw = 6.6, dc_kw = 18 where id = 'byd-song-plus-premium-dmi';
update cars set ac_kw = 6.6, dc_kw = 0 where id = 'byd-song-pro-dm-i-flex';
update cars set dc_kw = 0 where id in ('byd-atto-2-gl', 'byd-atto-2-gs');

-- Volvo
update cars set dc_kw = 150, charge_ac_hours = 6, charge_dc_minutes = 26 where id = 'volvo-ex30';
update cars set dc_kw = 175, charge_ac_hours = 8, charge_dc_minutes = 28 where id = 'volvo-ex30-ultra';
update cars set dc_kw = 175, charge_ac_hours = 7, charge_dc_minutes = 27 where id = 'volvo-ec40-plus';
update cars set dc_kw = 175, charge_ac_hours = 8, charge_dc_minutes = 28 where id = 'volvo-ec40-ultra';
update cars set dc_kw = 175, charge_ac_hours = 7, charge_dc_minutes = 27 where id = 'volvo-ex40';
update cars set dc_kw = 175, charge_ac_hours = 8, charge_dc_minutes = 28 where id = 'volvo-ex40-ultra';
update cars set dc_kw = 350, charge_ac_hours = 10, charge_dc_minutes = 22 where id = 'volvo-es90';
update cars set dc_kw = 250, charge_ac_hours = 10, charge_dc_minutes = 30 where id = 'volvo-ex90';
update cars set dc_kw = 0, charge_ac_hours = 3 where id in ('volvo-xc60-recharge-t8', 'volvo-xc90-recharge-t8');

commit;
