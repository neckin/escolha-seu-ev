-- Recarga, lote 2 (21/10/2026): fichas técnicas oficiais em PDF e páginas
-- oficiais de modelo. Só entra o que a fonte diz com todas as letras.
--
--   GWM Haval H6 PHEV35: ficha-tecnica-haval-h6-phev-35-flex.pdf (gwmmotors.com.br)
--     "Carregamento AC – 0 a 100% (6,6 kW) 5h (aprox.)"; "Carregamento DC 20 a
--     80% (48 kW) 30min" (faixa 20-80%, por isso o tempo DC não entra).
--   Jetour S06: jetourbr.com/ficha-tecnica/s06.pdf
--     "Potência de recarga CA (kW) 6,6"; "Potência de recarga CC (kW) 40".
--   MG Cyberster: mgmotoroficial.com.br/pdfs/cyberster-ficha.pdf
--     AC 11 kW; "Tempo de carregamento DC 10~80% SOC (150kW DC - CCS)" 38 min.
--   JAC E-JS1: E-JS1-FICHA-1.pdf (jacmotors.com.br, jul/2026)
--     "Carregamento em AC Lento (OBC)" 6 kW máx.; "Carregamento em DC Rápido" 20 kW máx.
--   Mitsubishi Outlander PHEV: FT_Outlander_Signature (mitsubishimotors.com.br)
--     portas de carregamento: só "AC (carga lenta) - Tipo 2 (3.5 kW)", sem DC.
--   Zeekr 7X: zeekrlife.com/pt-br/models/7x
--     "Carregamento rápido 800V (DC) 16 min (10%-80%)".

begin;

update cars set ac_kw = 6.6, dc_kw = 48, charge_ac_hours = 5 where id = 'gwm-haval-h6-phev35';
update cars set ac_kw = 6.6, dc_kw = 40 where id = 'jetour-s06';
update cars set ac_kw = 11, charge_dc_minutes = 38 where id = 'mg-cyberster';
update cars set ac_kw = 6, dc_kw = 20 where id = 'jac-e-js1';
update cars set dc_kw = 0 where id = 'mitsubishi-outlander-phev';
update cars set charge_dc_minutes = 16 where id = 'zeekr-7x';

commit;
