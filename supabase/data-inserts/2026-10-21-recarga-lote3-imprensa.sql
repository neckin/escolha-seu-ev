-- Recarga, lote 3 (21/10/2026): imprensa, onde não há fonte oficial
-- (autorizado pelo usuário em 21/10/2026). Só preenche campos vazios; quando o
-- catálogo já tinha o valor e a imprensa diverge um pouco, fica o do catálogo
-- (Aion ES DC 75 vs 68 kW no Canal VE; Zeekr X DC 150 vs 153 kW).
-- Cada carro ganha uma nota em tech_notes dizendo a fonte.

begin;

update cars set ac_kw = 6.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica).'
where id = 'gac-aion-es';

update cars set ac_kw = 6.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica).'
where id = 'chevrolet-captiva-ev';

update cars set ac_kw = 6.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica). O catálogo oficial da GWM só traz tempos em faixas próprias (AC 15 a 100% em 6,5 h; DC 30 a 80% em 26 min).'
where id = 'gwm-wey-07';

update cars set ac_kw = 6.6, dc_kw = 30,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW e DC de 30 kW nas versões Pro e Max (Autoo, matéria de lançamento), de 30 a 80% em cerca de 20 min.'
where id = 'geely-ex5-em-i';

update cars set ac_kw = 6.6,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica).'
where id = 'geely-ex5-em-i-ultra';

update cars set ac_kw = 6.6, dc_kw = 40,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW e DC de 40 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica) (mesmos números do Jetour S06, da mesma plataforma, na ficha oficial).'
where id = 'omoda-7-shs-p';

update cars set ac_kw = 6.6, dc_kw = 40,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW e DC de 40 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica). A Motorshow cita 3,3 kW em AC, divergente.'
where id = 'jaecoo-7-phev';

update cars set ac_kw = 9.9,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 9,9 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica) (valor incomum; a ficha oficial em PDF não pôde ser lida).'
where id = 'omoda-e5';

update cars set ac_kw = 22,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 22 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica).'
where id = 'zeekr-x';

update cars set ac_kw = 6, dc_kw = 100,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6 kW e DC de 100 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica).'
where id = 'denza-b5';

update cars set dc_kw = 150,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga DC em carregadores de 150 kW (Olhar Digital, lançamento em out/2024).'
where id = 'chevrolet-equinox-ev';

update cars set ac_kw = 11, dc_kw = 84,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 11 kW e DC de 84 kW pela ficha técnica de lançamento distribuída à imprensa (out/2025): de 30 a 80% em 3,9 h (AC) ou 30 min (DC). O Canal VE cita 6,6 kW em AC.'
where id = 'leapmotor-c10';

update cars set ac_kw = 6.6, dc_kw = 65,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Recarga AC de 6,6 kW e DC de 65 kW pela ficha técnica de lançamento distribuída à imprensa (out/2025): de 30 a 80% em 3 h (AC) ou 18 min (DC).'
where id = 'leapmotor-c10-reev';

commit;
