-- Vídeos de review fixados por carro (video_url), curadoria de 08/10/2026.
-- Critério: review completo do modelo vendido hoje no Brasil, em português, de canal
-- brasileiro, com 10+ min (exceções curtas só quando não havia opção melhor).
-- Cobre os 34 carros sem vídeo, 11 vídeos fracos (notícia de preço, comparativo,
-- prévia de lançamento) e o do Honda CR-V, que saiu do ar.
-- Todos conferidos via oEmbed do YouTube em 08/10/2026.

begin;

-- Honda CR-V Advanced Hybrid (troca: vídeo antigo fora do ar)
update cars set video_url = 'https://www.youtube.com/watch?v=DBkF8xQZGZY' where id = 'honda-cr-v-advanced-hybrid';

-- Renault Megane E-Tech (troca: era notícia de preço)
update cars set video_url = 'https://www.youtube.com/watch?v=rr0ka5ihyMs' where id = 'renault-megane-e-tech';

-- Volvo EC40 Plus (troca: era notícia de preço)
update cars set video_url = 'https://www.youtube.com/watch?v=e0sk3gwhmlM' where id = 'volvo-ec40-plus';

-- BMW iX1 xDrive30 M Sport (troca: era notícia de versão)
update cars set video_url = 'https://www.youtube.com/watch?v=l-kmkpotea0' where id = 'bmw-ix1';

-- MG S5 (troca: era comparativo)
update cars set video_url = 'https://www.youtube.com/watch?v=neSFaXhQ1xM' where id = 'mg-s5';

-- MINI Countryman SE ALL4 (troca: era vídeo de 2 carros)
update cars set video_url = 'https://www.youtube.com/watch?v=geJO90flCrc' where id = 'mini-countryman-se-all4';

-- BYD Song Plus Premium DM-i (troca: era comparativo de consumo)
update cars set video_url = 'https://www.youtube.com/watch?v=JOBs-n7-0uE' where id = 'byd-song-plus-premium-dmi';

-- Volvo EX40 Ultra P8 (troca: era comparativo)
update cars set video_url = 'https://www.youtube.com/watch?v=KI3jHtvlQLs' where id = 'volvo-ex40-ultra';

-- Neta X 400 (troca: era prévia de lançamento)
update cars set video_url = 'https://www.youtube.com/watch?v=RO632kTCcDk' where id = 'neta-x-400';

-- BYD Sealion 7 (troca: era prévia de lançamento)
update cars set video_url = 'https://www.youtube.com/watch?v=jZvyDngmkhU' where id = 'byd-sealion-7';

-- BYD Dolphin (troca: era prévia de lançamento)
update cars set video_url = 'https://www.youtube.com/watch?v=sYZfZyNPPxc' where id = 'byd-dolphin';

-- BYD King PHEV (troca: era só teste de 0 a 100)
update cars set video_url = 'https://www.youtube.com/watch?v=tG7X9i1yi0g' where id = 'byd-king-phev';

-- Audi Q6 Sportback e-tron S Line (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=HCU4k2S2FFk' where id = 'audi-q6-sportback-e-tron';

-- Audi SQ6 Sportback e-tron (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=HB2U_6jmhKk' where id = 'audi-sq6-sportback-e-tron';

-- BMW 330e M Sport (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=g5jxERlpBro' where id = 'bmw-330e';

-- BMW i4 eDrive40 M Sport (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=KvN1GSiXwr4' where id = 'bmw-i4';

-- BYD Atto 2 DM-i Flex GS (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=A0zCrcVpyxE' where id = 'byd-atto-2-gs';

-- BYD Dolphin Mini GS (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=NUD28fMIqto' where id = 'byd-dolphin-mini-gs';

-- Ford Maverick Hybrid (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=lZq70kZMeWI' where id = 'ford-maverick-hybrid';

-- GAC Aion ES Plus (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=kYXvAtRurkc' where id = 'gac-aion-es';

-- GAC Aion Y Elite (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=3cmBNHeIg6c' where id = 'gac-aion-y-elite';

-- GAC GS4 Hybrid Premium (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=1UqnZhrGypY' where id = 'gac-gs4-hybrid';

-- Geely EX5 EM-i Pro (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=slYBEzAlYAs' where id = 'geely-ex5-em-i';

-- Honda Accord Advanced Hybrid (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=mCXlTm456LA' where id = 'honda-accord-advanced-hybrid';

-- Honda Civic Advanced Hybrid (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=fhCIuXcY2ek' where id = 'honda-civic-advanced-hybrid';

-- Honda Prelude (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=xrJ7sIv3WqA' where id = 'honda-prelude';

-- Hyundai KONA Híbrido Ultimate (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=TUcgy7rVW4U' where id = 'hyundai-kona-hibrido';

-- Jetour T2 XWD 4x4 (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=y5rfXgWhTWU' where id = 'jetour-t2-4x4-xwd';

-- Kia Carnival Full Hybrid (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=WZiwUUlc4a8' where id = 'kia-carnival-hybrid';

-- Kia Niro HEV (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=ywlMCcfTnLI' where id = 'kia-niro-hev';

-- Land Rover Range Rover P550e Autobiography (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=YwJn6tsjA7I' where id = 'land-rover-range-rover-p550e';

-- Land Rover Range Rover Sport P550e Autobiography (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=FkZgGq04obc' where id = 'land-rover-range-rover-sport-p550e';

-- MG4 Comfort (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=q4hPxZQDjHg' where id = 'mg-mg4';

-- Mini Aceman E (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=4jQWPRN1QMc' where id = 'mini-aceman-e';

-- Mini Aceman SE (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=4jQWPRN1QMc' where id = 'mini-aceman-se';

-- Mini Cooper SE (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=SMVCHxk63KU' where id = 'mini-cooper-se';

-- MINI John Cooper Works Aceman E (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=_FcaW9_1XIQ' where id = 'mini-jcw-aceman-e';

-- MINI John Cooper Works Cooper E (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=xYgqgNuGlrY' where id = 'mini-jcw-cooper-e';

-- Neta X 500 (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=RO632kTCcDk' where id = 'neta-x-500';

-- Renault Koleos esprit Alpine full hybrid E-Tech (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=YonvdCfWIsI' where id = 'renault-koleos-hybrid-e-tech';

-- Toyota bZ4X AWD (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=U9nkh8K5xZk' where id = 'toyota-bz4x';

-- Toyota Corolla Cross Hybrid XRX (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=-GSv1n5jFaQ' where id = 'toyota-corolla-cross-hybrid';

-- Toyota Corolla GLi HEV (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=d2pLiWGmCpE' where id = 'toyota-corolla-hybrid';

-- Toyota Yaris Cross Hybrid XRE (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=dr2IRzF9xWU' where id = 'toyota-yaris-cross-hybrid';

-- Volkswagen ID.4 Pro (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=oNy9q0WNBJo' where id = 'volkswagen-id4-pro';

-- Volvo ES90 Ultra Twin Motor Performance (novo)
update cars set video_url = 'https://www.youtube.com/watch?v=yaTv4OQJnMA' where id = 'volvo-es90';

commit;
