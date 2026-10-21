-- Varredura de preços em 21/10/2026: sites e configuradores oficiais de cada marca.
-- Critério: preço de tabela ("de", "preço público sugerido", "a partir de"),
-- nunca a oferta temporária ("por", bônus, condição do mês). Cada nota diz a fonte.
-- 41 carros mudaram de preço; 40 foram só reconfirmados.
-- Não conferidos (site sem preço ou inacessível): Audi, Porsche, Land Rover, Zeekr,
-- Denza, Avatr, VW ID.4, Mustang Mach-E, Ioniq 5, GAC (exceto Aion UT), Jaecoo 7,
-- BMW i4 M50, MINI Countryman SE, Chevrolet Equinox EV, Corolla Cross Hybrid.

begin;

-- BYD Atto 2 DM-i Flex GL (R$ 149.990 -> R$ 166.660)
update cars set price = 166660, price_verified_date = '21/10/2026',
  tech_notes = 'Estreia mundial do sistema híbrido plug-in DM-i Flex da BYD — primeiro PHEV do mundo capaz de rodar com gasolina OU etanol. Lançado no Brasil em 9/jun/2026, fabricado em Camaçari (BA). Versão de entrada GL: bateria pequena (7,3kWh), autonomia elétrica de só 33km (INMETRO), carregamento AC de até 3,3kW. Autonomia combinada de 1.000km (gasolina, ciclo NEDC) ou 770km (etanol). Vendida inicialmente por canal de venda direta. A versão GS (mais equipada, com ADAS 2) está cadastrada separadamente (id byd-atto-2-gs). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GL DM FLEX"): 15,8 kWh/100km no modo elétrico (0,57 MJ/km), 33km de autonomia no modo elétrico e 14,7 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 149.990 para R$ 166.660, pelo configurador oficial byd.com/br (order-atto-2), versão GL; a oferta CPF de R$ 149.990 até 31/10/2026 não é o preço de tabela.'
where id = 'byd-atto-2-gl';

-- BYD Atto 2 DM-i Flex GS (sem mudança)
update cars set price = 169990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do Atto 2 DM-i Flex, com bateria maior (18kWh vs 7,3kWh da GL) que mais que dobra a autonomia elétrica pura (75km vs 33km, INMETRO) e carregamento AC mais rápido (6,6kW vs 3,3kW). Inclui pacote ADAS 2, que a GL não tem. Autonomia combinada de 1.045km (gasolina, NEDC) ou 770km (etanol). Fabricada em Camaçari (BA), lançada em 9/jun/2026. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GS DM FLEX"): 14,2 kWh/100km no modo elétrico (0,51 MJ/km), 75km de autonomia no modo elétrico e 14,8 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 169.990, pelo configurador oficial byd.com/br (order-atto-2).'
where id = 'byd-atto-2-gs';

-- BYD Atto 8 (sem mudança)
update cars set price = 399990, price_verified_date = '21/10/2026',
  tech_notes = 'SUV híbrido plug-in de 7 lugares com tração integral (AWD): motor 1.5 turbo (156cv) + motor elétrico dianteiro (272cv) + motor elétrico traseiro (216cv), somando 488cv combinados. Bateria Blade LFP de 35,6 kWh garante autonomia elétrica pura de 111km pelo INMETRO (até 152km em ciclo NEDC); autonomia total combinada de até 900km (ciclo NEDC). Porta-malas de até 1.960L com os bancos rebatidos (capacidade com bancos em uso não divulgada). Recarga DC de 30-80% em ~20min (até 72kW). Lançado no Salão do Automóvel 2025. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 8 | GS DM"): 19,7 kWh/100km no modo elétrico (0,71 MJ/km), 111km de autonomia no modo elétrico e 11,1 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 399.990, pelo configurador oficial byd.com/br.'
where id = 'byd-atto-8';

-- BYD Dolphin (R$ 149.800 -> R$ 149.990)
update cars set price = 149990, price_verified_date = '21/10/2026',
  tech_notes = 'Autonomia WLTP divulgada é de até 340km; a do INMETRO, usada aqui, é 291km. Bateria Blade LFP, mesma tecnologia usada em toda a linha BYD, com estrutura que dispensa módulos intermediários. 5 estrelas no Latin NCAP. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | GS 180EV"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 291km. Autonomia atualizada de 320km para 291km pela tabela do INMETRO. Preço atualizado em 21/10/2026 de R$ 149.800 para R$ 149.990, pelo configurador oficial byd.com/br (order-dolphin), versão GS.'
where id = 'byd-dolphin';

-- BYD Dolphin Mini GL (sem mudança)
update cars set price = 118990, price_verified_date = '21/10/2026',
  tech_notes = 'O elétrico mais vendido do Brasil. Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026). Duas versões, GL (entrada, ficha usada aqui) e GS (cadastrada separadamente) — a diferença de preço é de só R$1.000, mas a GS tem bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais equipamento (carregador de celular por indução, acabamento do volante, luzes de cortesia, vidro do motorista one-touch/antiesmagamento). Airbags: só frontais + cortina na GL (a GS ganha também os laterais dianteiros). Uso comercial reduz a garantia do veículo pra 6 anos/100.000km. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GL 5 EV"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 224km. Preço conferido em 21/10/2026: R$ 118.990, pelo configurador oficial byd.com/br.'
where id = 'byd-dolphin-mini-gl';

-- BYD Dolphin Mini GS (sem mudança)
update cars set price = 119990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão mais completa do Dolphin Mini (o elétrico mais vendido do Brasil), só R$1.000 mais cara que a GL (cadastrada separadamente), mas com bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais 2 airbags (laterais dianteiros — a GL só tem frontais + cortina). Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GS 5 EV"): 11,4 kWh/100km (0,41 MJ/km), autonomia de 280km. Preço conferido em 21/10/2026: R$ 119.990, pelo configurador oficial byd.com/br.'
where id = 'byd-dolphin-mini-gs';

-- BYD Dolphin Plus (R$ 178.800 -> R$ 184.800)
update cars set price = 184800, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de maior autonomia da linha Dolphin, com bateria maior (60,5kWh) que a versão padrão. DC de 60kW carrega de 20% a 80% em ~45min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | PLUS 310EV"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 330km. Autonomia atualizada de 420km para 330km pela tabela do INMETRO. Preço atualizado em 21/10/2026 de R$ 178.800 para R$ 184.800, pelo configurador oficial byd.com/br.'
where id = 'byd-dolphin-plus';

-- BYD Dolphin SE (R$ 159.990 -> R$ 173.990)
update cars set price = 173990, price_verified_date = '21/10/2026',
  tech_notes = 'Plataforma e-Platform 3.0 da BYD, com a bateria Blade — LFP com formato estrutural que dispensa módulos intermediários, referência de segurança térmica no setor. Autonomia oficial PBEV (272 km) é mais conservadora que o padrão NEDC usado por parte da imprensa. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | SE 290EV"): 13,6 kWh/100km (0,49 MJ/km), autonomia de 272km. Preço atualizado em 21/10/2026 de R$ 159.990 para R$ 173.990, pelo configurador oficial byd.com/br (order-dolphin, aba Dolphin SE).'
where id = 'dolphinse';

-- BYD Han EV (sem mudança)
update cars set price = 559800, price_verified_date = '21/10/2026',
  tech_notes = 'Preço real de tabela é R$559.800 — bem acima dos R$429.800 que circulavam antes. Autonomia INMETRO de 349km (450-500km em ciclo combinado/WLTP); recarga rápida de 30% a 80% em ~25min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | HAN | AWD GS 680EV"): 19,2 kWh/100km (0,69 MJ/km), autonomia de 349km. Autonomia atualizada de 480km para 349km pela tabela do INMETRO. Preço conferido em 21/10/2026: R$ 559.800, pelo configurador oficial byd.com/br.'
where id = 'byd-han-ev';

-- BYD King PHEV (sem mudança)
update cars set price = 175990, price_verified_date = '21/10/2026',
  tech_notes = 'Preço real de tabela é R$175.990 (versão GS) — bem abaixo dos R$279.800 que circulavam antes; a versão de entrada GL custa R$147.990 com 209cv e só 35km de autonomia elétrica (INMETRO). Bateria Blade de 18,3kWh na GS (8,3kWh na GL), conforme a ficha técnica oficial BYD King 2026: 78km elétricos pelo INMETRO (115km NEDC) e autonomia combinada de até 1.200km. Consumo INMETRO no modo híbrido: 16,4 km/l na cidade. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | KING | GS DM"): 13,6 kWh/100km no modo elétrico (0,49 MJ/km), 78km de autonomia no modo elétrico e 14,6 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 175.990, pelo configurador oficial byd.com/br, versão GS (GL R$ 172.990).'
where id = 'byd-king-phev';

-- BYD Seal (R$ 269.800 -> R$ 299.990)
update cars set price = 299990, price_verified_date = '21/10/2026',
  tech_notes = 'Existe também a versão Performance AWD, mais potente e cara, com 0-100 em 3,8s. Autonomia real PBEV/Inmetro de 372km é bem mais conservadora que os 570km que circulavam antes (provavelmente CLTC chinês). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SEAL | AWD GS 590EV"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 372km. Preço atualizado em 21/10/2026 de R$ 269.800 para R$ 299.990, pelo configurador oficial byd.com/br.'
where id = 'byd-seal';

-- BYD Sealion 7 (sem mudança)
update cars set price = 339990, price_verified_date = '21/10/2026',
  tech_notes = 'SUV cupê elétrico irmão do Seal, com tração integral AWD (531cv/690Nm) e 0-100km/h em 4,5s — um dos mais potentes e rápidos do comparativo inteiro. Bateria Blade LFP de 82,5kWh garante 360km de autonomia Inmetro. Porta-malas de 500L + frunk dianteiro de 58L. Recarga DC até 150kW (30-80% em ~30min). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SEALION 7 | GS 690EV"): 18,3 kWh/100km (0,66 MJ/km), autonomia de 360km. Preço conferido em 21/10/2026: R$ 339.990, pelo configurador oficial byd.com/br.'
where id = 'byd-sealion-7';

-- BYD Shark PHEV (R$ 379.800 -> R$ 344.990)
update cars set price = 344990, price_verified_date = '21/10/2026',
  tech_notes = 'Autonomia elétrica pura de 68km (PBEV/Inmetro 2026) ou até 100km (NEDC). Caçamba com 1.200 litros de capacidade. Tração integral (AWD), com motor a combustão 1.5 turbo (183cv/260Nm) somado a dois motores elétricos (231cv dianteiro + 204cv traseiro). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SHARK | GS DM"): 25,3 kWh/100km no modo elétrico (0,91 MJ/km), 68km de autonomia no modo elétrico e 8,6 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 379.800 para R$ 344.990, pelo configurador oficial byd.com/br.'
where id = 'byd-shark-phev';

-- BYD Song Plus PHEV (sem mudança)
update cars set price = 249990, price_verified_date = '21/10/2026',
  tech_notes = 'Correção em 19/08/2026: linha 2027 trocou o motor 1.5 aspirado por um 1.5 turbo (130cv) e ampliou bastante a bateria (26,6kWh vs 18,3kWh antes), elevando a autonomia elétrica pura pra 99km Inmetro (era 68km) e reduzindo levemente a potência combinada informada (239cv vs 235cv, dentro da margem de arredondamento). Preço oficial atualizado pra R$249.990. Recarga DC de até 18kW, recurso que a geração anterior não tinha. Continua FWD — a versão Premium (AWD, 324cv, R$299.800, cadastrada separadamente, id byd-song-plus-premium-dmi) segue sendo o degrau acima, sem mudanças identificadas na pesquisa. Preço conferido em 21/10/2026: R$ 249.990, pelo configurador oficial byd.com/br.'
where id = 'byd-song-plus-phev';

-- BYD Song Plus Premium DM-i (sem mudança)
update cars set price = 299800, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do Song Plus (a versão FWD de entrada está cadastrada separadamente, id byd-song-plus-phev), lançada em mar/2026 como o SUV híbrido plug-in mais potente da BYD no Brasil até então. Tração integral com um motor elétrico em cada eixo (204cv dianteiro + 163cv traseiro) somados ao 1.5 turbo, 324cv/550Nm combinados. Autonomia elétrica de 87km PBEV e autonomia total de até 1.100km. Atualização em 19/08/2026: a versão FWD também ganhou motor 1.5 turbo e bateria de 26,6kWh na linha 2027 (antes 1.5 aspirado com 18,3kWh) — as duas versões (FWD e Premium AWD) agora compartilham a mesma capacidade de bateria, diferindo em potência e tração (239cv FWD vs 324cv AWD). Trunk reutilizado do valor da versão FWD (552L) — não confirmado se muda com o pacote AWD. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SONG PLUS | PREM DM"): 18,6 kWh/100km no modo elétrico (0,67 MJ/km), 87km de autonomia no modo elétrico e 11,2 km/l de gasolina no modo híbrido (ciclo combinado). A tabela também traz uma linha "PREM DM (MY27)" com 83km elétricos e 11,3km/l — usada aqui a linha que bate com os 87km já cadastrados. Preço conferido em 21/10/2026: R$ 299.800, pelo configurador oficial byd.com/br.'
where id = 'byd-song-plus-premium-dmi';

-- BYD Song Pro DM-i Flex (R$ 176.990 -> R$ 196.990)
update cars set price = 196990, price_verified_date = '21/10/2026',
  tech_notes = 'Lançado em 04/08/2026 com o sistema DM-i 5.0 (bicombustível de verdade — o mesmo motor 1.5 Atkinson roda com gasolina, etanol ou qualquer mistura dos dois). Ficha usada aqui é a versão de entrada GL: 13,1kWh Blade LFP, 57km elétricos PBEV, 218cv/300Nm, 8,8s 0-100. A GS tem bateria maior (18,3kWh, até 72km elétricos PBEV), 219cv e 8,6s — praticamente a mesma potência mas mais autonomia elétrica. No etanol a autonomia total cai pra até 805km (GS)/775km (GL); a gasolina chega a 1.105km (GS)/1.075km (GL, usado aqui). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SONG PRO | GL DM FLEX"): 14,7 kWh/100km no modo elétrico (0,53 MJ/km), 57km de autonomia no modo elétrico e 15,0 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 176.990 para R$ 196.990, pelo configurador oficial byd.com/br, versão GL (GS R$ 199.990); a oferta CPF de R$ 176.990 até 31/10/2026 não é o preço de tabela.'
where id = 'byd-song-pro-dm-i-flex';

-- BYD Tan (R$ 536.800 -> R$ 426.800)
update cars set price = 426800, price_verified_date = '21/10/2026',
  tech_notes = 'SUV elétrico premium de 7 lugares, tração integral 4x4, 517cv e 700Nm, acelera de 0-100km/h em menos de 5s. Bateria Blade LFP gigante de 108,8kWh rende até 430km Inmetro (530km no ciclo WLTP, mais otimista). Porta-malas varia de 235L (7 lugares) a 940L (5 lugares) e 1.655L com os bancos rebatidos. Recarga DC de 30-80% em ~30min a 110kW. Aceleração, peso, vão livre e airbags ainda sem fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | TAN | AWD GS 700EV"): 20,3 kWh/100km (0,73 MJ/km), autonomia de 430km. Preço atualizado em 21/10/2026 de R$ 536.800 para R$ 426.800, pelo configurador oficial byd.com/br.'
where id = 'byd-tan';

-- BYD Yuan Plus AWD (sem mudança)
update cars set price = 269990, price_verified_date = '21/10/2026',
  tech_notes = 'Correção em 19/08/2026: a BYD renovou o Yuan Plus pra linha 2027, abandonando o motor único dianteiro (204cv/310Nm, R$229.800) em favor de bimotor AWD com 449cv/560Nm — a versão FWD antiga não é mais vendida. Bateria também cresceu (74,88kWh vs 60,5kWh), com carregamento DC de até 205kW e AC de 11kW, ausentes na versão anterior. Autonomia PBEV/Inmetro oficial (site BYD) é 378km — bem mais conservadora que os 530km citados por parte da imprensa (provavelmente ciclo NEDC). Porta-malas cresceu de 312L pra 490L + frunk de 101L. Conhecido internacionalmente como BYD Atto 3. Peso não confirmado pra essa nova versão. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | YUAN PLUS | GS 560EV"): 16,1 kWh/100km (0,58 MJ/km), autonomia de 378km. Preço conferido em 21/10/2026: R$ 269.990, pelo configurador oficial byd.com/br.'
where id = 'byd-yuan-plus';

-- BYD Yuan Pro (sem mudança)
update cars set price = 182990, price_verified_date = '21/10/2026',
  tech_notes = 'CORRIGIDO (18/08/2026): o Yuan Pro vendido oficialmente no Brasil é 100% ELÉTRICO (BEV), não híbrido plug-in como estava cadastrado antes — o ficha anterior descrevia a versão DM-i (PHEV) que existe em outros mercados (China, Argentina) mas ainda não tem lançamento confirmado no Brasil. Versão única (GS), R$182.990. Torque, vão livre, peso e airbags ainda sem fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | YUAN PRO | GS 290EV"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 250km. Preço conferido em 21/10/2026: R$ 182.990, pelo configurador oficial byd.com/br.'
where id = 'byd-yuan-pro';

-- Geely EX2 Pro (R$ 123.800 -> R$ 124.600)
update cars set price = 124600, price_verified_date = '21/10/2026',
  tech_notes = 'Compartilha com o EX2 Max a mesma plataforma, o motor traseiro (RWD) e a bateria LFP de 39,4 kWh — a versão Pro é a entrada de linha, com potência, torque e autonomia idênticos, mas com pacote de ADAS e itens de conforto reduzidos. Tração traseira é incomum nessa faixa de preço. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GEELY | EX2 | PRO"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 289km. Preço atualizado em 21/10/2026 de R$ 123.800 para R$ 124.600, pelo site oficial geelybrasil.com.br (preço à vista da oferta vigente até 31/10/2026).'
where id = 'geely-ex2-pro';

-- Geely EX5 Pro (R$ 205.800 -> R$ 207.800)
update cars set price = 207800, price_verified_date = '21/10/2026',
  tech_notes = 'Ficha técnica oficial Geely conferida (ago/2026). Versão de entrada da linha EX5 — autonomia de 413km, a maior das duas versões elétricas (a Max, cadastrada separadamente, sacrifica autonomia por mais equipamento). Porta-malas 461L (1.877L com banco rebatido). Airbags: 2 frontais + 2 cortina dianteiros + 2 cortina traseiros (sem laterais de tórax). Existe também a versão híbrida plug-in EX5 EM-i, cadastrada separadamente (id geely-ex5-em-i) por ser outro powertrain (fuelType PHEV em vez de BEV). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 | PRO"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 413km. Preço atualizado em 21/10/2026 de R$ 205.800 para R$ 207.800, pelo site oficial geelybrasil.com.br: à vista R$ 197.800 já com R$ 10.000 de bônus temporário, ou seja, R$ 207.800 sem o bônus.'
where id = 'geely-ex5';

-- Geely EX5 Max (R$ 225.800 -> R$ 227.800)
update cars set price = 227800, price_verified_date = '21/10/2026',
  tech_notes = 'Ficha técnica oficial Geely conferida (ago/2026). Mesmo motor/bateria da Pro (cadastrada separadamente), mas autonomia menor (349km vs 413km) por causa do peso extra (1.765kg vs 1.715kg) — mais equipamento: teto solar panorâmico, porta-malas elétrico, rodas 19" (vs 18" da Pro), bancos com massagem/ventilação, pacote ADAS completo (a Pro não tem ACC, LKA, AEB e outros assistentes — só a Max tem). Porta-malas 461L (1.877L com banco rebatido). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 | MAX"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 349km. Preço atualizado em 21/10/2026 de R$ 225.800 para R$ 227.800, pelo site oficial geelybrasil.com.br (preço à vista da oferta vigente até 31/10/2026).'
where id = 'geely-ex5-max';

-- Geely EX5 EM-i Pro (R$ 189.990 -> R$ 191.490)
update cars set price = 191490, price_verified_date = '21/10/2026',
  tech_notes = 'Primeiro veículo da Geely com produção nacional (Complexo Industrial Ayrton Senna, São José dos Pinhais/PR), ainda em 2026. Três versões: Pro (bateria 18,4kWh, ~65km elétricos — ficha usada aqui), Max (mesma bateria) e Ultra (bateria maior de 29,8kWh, ~112km elétricos Inmetro, com carregamento DC de até 60kW — cadastrada separadamente, id geely-ex5-em-i-ultra). Autonomia combinada de até 1.300km. Porta-malas de 428L (até 2.000L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 EM-i | MAX / PRO"): 15,3 kWh/100km no modo elétrico (0,55 MJ/km), 65km de autonomia no modo elétrico e 14,0 km/l de gasolina no modo híbrido (ciclo combinado). Recarga AC de 6,6 kW e DC de 30 kW nas versões Pro e Max (Autoo, matéria de lançamento), de 30 a 80% em cerca de 20 min. Preço atualizado em 21/10/2026 de R$ 189.990 para R$ 191.490, pelo site oficial geelybrasil.com.br (preço à vista da oferta vigente até 31/10/2026), versão Pro.'
where id = 'geely-ex5-em-i';

-- Geely EX5 EM-i Ultra (R$ 234.990 -> R$ 236.490)
update cars set price = 236490, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do EX5 EM-i (a versão Pro de entrada está cadastrada separadamente, id geely-ex5-em-i): mesma potência/torque (262cv/380Nm), mas bateria bem maior (29,8kWh vs 18,4kWh), quase dobrando a autonomia elétrica (112km vs 65km, Inmetro) e com carregamento DC de até 60kW (30-80% em ~16min, contra recarga só AC/lenta nas versões Pro/Max). Wallbox incluso de fábrica só na Ultra. Mesma autonomia combinada de até 1.300km e porta-malas de 428L do restante da linha. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 EM-i | ULTRA"): 16,4 kWh/100km no modo elétrico (0,59 MJ/km), 112km de autonomia no modo elétrico e 14,0 km/l de gasolina no modo híbrido (ciclo combinado). Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica). Preço atualizado em 21/10/2026 de R$ 234.990 para R$ 236.490, pelo site oficial geelybrasil.com.br (preço à vista da oferta vigente até 31/10/2026).'
where id = 'geely-ex5-em-i-ultra';

-- GWM Haval H6 PHEV19 (R$ 248.000 -> R$ 250.000)
update cars set price = 250000, price_verified_date = '21/10/2026',
  tech_notes = 'Existem 4 variantes do Haval H6 em 2026: HEV2 (não é PHEV), PHEV19 (ficha usada aqui, 326cv), PHEV35 (393cv) e GT (393cv, carroceria cupê). Autonomia elétrica pura de 77km INMETRO (até 115km WLTP). Um dos poucos PHEVs com carregamento DC (até 33kW), incomum no segmento. Peso 1.890-1.910kg conforme fonte (usado o meio da faixa). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | HAVAL H6 | PHEV19 FF"): 16,7 kWh/100km no modo elétrico (0,60 MJ/km), 77km de autonomia no modo elétrico e 13,8 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 248.000 para R$ 250.000, pelo site oficial gwmmotors.com.br (modelos/haval-h6-phev-19).'
where id = 'gwm-haval-h6-phev';

-- GWM Haval H6 PHEV35 (sem mudança)
update cars set price = 290000, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de bateria maior do Haval H6 PHEV (a versão PHEV19, com bateria de 19kWh e 326cv, já está cadastrada separadamente, id gwm-haval-h6-phev): aqui a bateria de 35kWh e o sistema Hi4 com tração integral (motor elétrico em cada eixo) elevam a potência para 393cv/642Nm (torque corrigido em 19/08/2026 — página oficial confirma 642Nm/65,5kgf.m, o valor anterior de 762Nm estava errado). Preço atualizado pra R$290.000 (site oficial). Autonomia elétrica pura confirmada em fonte oficial: 126km Inmetro / até 180km WLTP. Existe também a versão GT (mesma mecânica 393cv/642Nm, suspensão mais esportiva, R$326.000 confirmado no site oficial), não cadastrada separadamente por não ter diferença de potência/bateria da PHEV35, só de calibração de suspensão e equipamentos — mesmo critério já usado nesta base pra casos parecidos. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | HAVAL H6 | PHEV35 FF"): 19,4 kWh/100km no modo elétrico (0,70 MJ/km), 126km de autonomia no modo elétrico e 11,6 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 290.000, pelo site oficial gwmmotors.com.br.'
where id = 'gwm-haval-h6-phev35';

-- GWM Ora 03 BEV58 (sem mudança)
update cars set price = 169000, price_verified_date = '21/10/2026',
  tech_notes = 'Correção em 19/08/2026: a GWM descontinuou as versões Skin BEV48 e GT BEV63 e unificou a linha Ora 03 num único trim, o BEV58 (bateria de 58kWh) — algumas unidades das versões antigas ainda podem estar em estoque em concessionárias, mas não são mais o catálogo oficial. O BEV58 herdou detalhes visuais que eram exclusivos da GT (pinças de freio pintadas, cores exclusivas), já representando ~80% das vendas da linha antes da unificação. Ficha técnica do catálogo oficial (ano-modelo 26/27): 171cv/250Nm, 0-100 em 9,0s, 315km de autonomia Inmetro (420km WLTP), entre-eixos de 2,65m, 7 airbags, porta-malas de 228L (858L com banco traseiro rebatido) + frunk dianteiro. Recarga AC em ~5h30 (15-100%) e DC em ~42min (30-80%) — potência exata em kW não confirmada em fonte oficial. Garantia e wallbox incluso não confirmados em fonte disponível. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | ORA 03 | BEV58"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 315km. Preço conferido em 21/10/2026: R$ 169.000, pelo site oficial gwmmotors.com.br.'
where id = 'gwm-ora-03-bev58';

-- GWM Tank 300 Hi4-T (sem mudança)
update cars set price = 342000, price_verified_date = '21/10/2026',
  tech_notes = 'SUV off-road de luxo, híbrido plug-in 4x4 com 394cv/750Nm combinados, bateria 37,1kWh NMC e autonomia elétrica pura de 74-75km (Inmetro) / até 106km (WLTP). Preço oficial no site da GWM Brasil é R$342.000 — agregadores de mercado citam valores de R$333.000 (lançamento, 2025) a R$389.990, possível reflexo de diferentes datas/versões. Autonomia total combinada (~1.290km) é uma estimativa calculada a partir do consumo híbrido divulgado (18,4-18,7 km/l) e do tanque de 70L — não é um valor divulgado diretamente pela GWM. Porta-malas de 863L (1.520L com bancos rebatidos). Vão livre de 222mm e ângulos de entrada/saída de 32°/33° — dos melhores off-road do grupo, com travessia de água até 700mm. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | TANK 300 | PHEV"): 30,3 kWh/100km no modo elétrico (1,09 MJ/km), 75km de autonomia no modo elétrico e 7,6 km/l de gasolina no modo híbrido (ciclo combinado). A tabela também lista uma versão PHEV FLEX com números quase iguais (74km elétricos, 7,5km/l). Preço conferido em 21/10/2026: R$ 342.000, pelo site oficial gwmmotors.com.br.'
where id = 'gwm-tank-300';

-- GWM WEY 07 (sem mudança)
update cars set price = 429000, price_verified_date = '21/10/2026',
  tech_notes = 'SUV híbrido plug-in de luxo com 6 lugares da WEY, submarca premium da GWM. Lançado oficialmente no Brasil em out/2025 (vendas iniciadas em 23/10), preço R$429.000. Potência combinada de 517cv/820Nm, bateria 42,5kWh, autonomia elétrica de 128km (Inmetro) — até 185km citado em fonte WLTP. Autonomia total combinada supera 1.200km. Porta-malas de apenas 239L com a 3ª fileira em uso (1.040L com ela rebatida). Recarga DC de 60kW leva a bateria de 30% a 80% em ~26min; AC leva de 15% a 100% em ~6h30 (kW exato não confirmado). Garantia não confirmada em fonte disponível. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | WEY | 07"): 23,1 kWh/100km no modo elétrico (0,83 MJ/km), 128km de autonomia no modo elétrico e 10,0 km/l de gasolina no modo híbrido (ciclo combinado). Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica). O catálogo oficial da GWM só traz tempos em faixas próprias (AC 15 a 100% em 6,5 h; DC 30 a 80% em 26 min). Preço conferido em 21/10/2026: R$ 429.000, pelo site oficial gwmmotors.com.br.'
where id = 'gwm-wey-07';

-- GAC Aion UT Elite (sem mudança)
update cars set price = 159990, price_verified_date = '21/10/2026',
  tech_notes = 'Plataforma AEP 3.0 da GAC, com o motor de 204 cv mais forte do grupo e 0-100 em 7,3s. Bateria LFP de 60 kWh é a maior capacidade da comparação. Vão livre de 150 mm confirmado na concessionária. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION UT | ELITE"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 310km. Preço conferido em 21/10/2026: R$ 159.990, pelo preço público informado por concessionária GAC (Mundo do Automóvel para PCD, 20/10/2026); o site oficial da GAC não pôde ser acessado.'
where id = 'aionut';

-- GAC Aion UT Premium (sem mudança)
update cars set price = 139990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada do Aion UT no Brasil (a Elite já está cadastrada separadamente, id ''aionut''), com bateria menor (44,12kWh vs 60kWh) e carregamento DC mais lento (64kW vs 87kW), resultando em autonomia de 253km vs 310km e aceleração mais lenta (8,6s vs 7,3s). Potência/torque do motor assumidos iguais aos da Elite (204cv/210Nm) — fontes brasileiras não indicam motor diferente entre as versões, só bateria e equipamentos (a Elite tem ADAS nível 2 e teto panorâmico que a Premium não tem). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION UT | PREMIUM"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 253km. Preço conferido em 21/10/2026: R$ 139.990, pelo preço público informado por concessionária GAC (Mundo do Automóvel para PCD, 20/10/2026); o site oficial da GAC não pôde ser acessado.'
where id = 'gac-aion-ut-premium';

-- BMW 330e M Sport (R$ 465.950 -> R$ 467.950)
update cars set price = 467950, price_verified_date = '21/10/2026',
  tech_notes = 'Marca já tinha o 530e (Série 5) e o X5 xDrive50e cadastrados — o 330e M Sport (Série 3) é uma versão de entrada da linha PHEV da BMW no Brasil que ainda não tinha card próprio. 292cv/420Nm combinados, bateria 19,5kWh, autonomia elétrica de 61km, 0-100 em 5,8s. Recarga AC de até 11kW. Confirmado à venda via press release oficial BMW Group Brasil (press.bmwgroup.com). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | 330e | -"): 25,6 kWh/100km no modo elétrico (0,92 MJ/km), 61km de autonomia no modo elétrico e 9,9 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 465.950 para R$ 467.950, pelo site oficial bmw.com.br (todos os modelos, "a partir de").'
where id = 'bmw-330e';

-- BMW 530e M Sport (R$ 643.950 -> R$ 647.950)
update cars set price = 647950, price_verified_date = '21/10/2026',
  tech_notes = 'Sedã executivo híbrido plug-in (Série 5), conjunto combinado de 299cv/450Nm com bateria de 19,4kWh e 70km de autonomia elétrica pura (INMETRO). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | 530e | M SPORT"): 21,1 kWh/100km no modo elétrico (0,76 MJ/km), 70km de autonomia no modo elétrico e 11,5 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 643.950 para R$ 647.950, pelo site oficial bmw.com.br (todos os modelos, "a partir de").'
where id = 'bmw-530e';

-- BMW i4 eDrive40 M Sport (sem mudança)
update cars set price = 582950, price_verified_date = '21/10/2026',
  tech_notes = 'Gran Coupé elétrico (liftback 4 portas), motor traseiro único de 340cv/430Nm. Preço de tabela oficial de agosto/2026 é R$582.950. Autonomia de 399km pela tabela PBEV 2025 do INMETRO (o i4 não aparece na tabela 2026). Porta-malas de 470L (1.290L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "BMW | i4 | 40"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 399km. Autonomia atualizada de 422km para 399km pela tabela do INMETRO. Preço conferido em 21/10/2026: R$ 582.950, pelo site oficial bmw.com.br.'
where id = 'bmw-i4';

-- BMW i7 xDrive60 M Sport (sem mudança)
update cars set price = 1373950, price_verified_date = '21/10/2026',
  tech_notes = 'Sedã executivo elétrico topo de linha da BMW (versão elétrica do Série 7), R$1.373.950 — preço confirmado em vários concessionários oficiais em ago/2026. Bimotor AWD com 544cv/745Nm combinados, bateria de 101,7kWh. Recarga DC de 10-80% em ~34min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | i7 | xDrive60"): 18,1 kWh/100km (0,65 MJ/km), autonomia de 467km. Autonomia atualizada de 512km para 467km pela tabela do INMETRO. Preço conferido em 21/10/2026: R$ 1.373.950, pelo site oficial bmw.com.br.'
where id = 'bmw-i7';

-- BMW iX1 xDrive30 M Sport (sem mudança)
update cars set price = 485950, price_verified_date = '21/10/2026',
  tech_notes = 'Trim eDrive20 (FWD, R$359.950, 204cv) catalogado anteriormente saiu de linha — só resta este xDrive30 M Sport (AWD) na página oficial da BMW (bmw.com.br/pt/all-models/bmw-i/ix1/bmw-ix1.html, verificado 21/09/2026). Potência (306cv), aceleração (5,6s 0-100km/h) e autonomia (324km, valor da tabela "Dados Técnicos" — a mesma página também menciona "até 303km" num parágrafo de marketing separado, inconsistência da própria BMW) confirmados direto na página oficial. Torque e capacidade de bateria não são publicados nessa página — deixados em branco em vez de reaproveitar uma estimativa antiga (494Nm/66,5kWh) de uma nota técnica anterior, já que até a potência divergiu entre as duas fontes (313cv vs 306cv agora) — vale reconfirmar com ficha técnica mais completa (PDF oficial, se existir) antes de preencher. Vão livre e porta-malas mantidos do registro anterior (mesma plataforma/corpo), não reconfirmados especificamente para este trim AWD. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX1 | xDrive30"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 324km. Preço conferido em 21/10/2026: R$ 485.950, pelo site oficial bmw.com.br.'
where id = 'bmw-ix1';

-- BMW iX2 xDrive30 M Sport (sem mudança)
update cars set price = 495950, price_verified_date = '21/10/2026',
  tech_notes = 'Versão elétrica cupê-SUV do X2, voltou a ser vendida oficialmente no Brasil (o iX2 já havia ficado fora de linha por um tempo). Bimotor AWD com 313cv/494Nm combinados. Preço de tabela oficial de agosto/2026 é R$495.950 — fontes de imprensa mais antigas (de 2024/2025) mencionam valores de R$443.950 a R$464.950, defasados pelos reajustes ao longo do período. Porta-malas de 525L (até 1.400L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX2 | xDrive30 MSP"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 327km. Autonomia atualizada de 337km para 327km pela tabela do INMETRO. Preço conferido em 21/10/2026: R$ 495.950, pelo site oficial bmw.com.br.'
where id = 'bmw-ix2';

-- BMW iX3 50 xDrive (R$ 582.950 -> R$ 587.950)
update cars set price = 587950, price_verified_date = '21/10/2026',
  tech_notes = 'Nova geração do iX3, estreou em pré-venda no Brasil em jul/2026 — ''nova era'' de plataforma elétrica da marca (arquitetura 800V, células cilíndricas integradas à estrutura). Confirmado em concessionária autorizada (Original BMW) como modelo normal em oferta em ago/2026, já saiu da fase só-pré-venda. Maior autonomia declarada entre elétricos vendidos no país (570km PBEV/Inmetro). Carregamento DC de até 400kW (10-80% em ~21min). É o modelo que a BMW citou como sucessor ao anunciar (mai/2026) a saída de linha do i5 e do iX no Brasil — mas ambos continuam sendo vendidos junto com o iX3 em ago/2026 (ver cards bmw-i5 e bmw-ix). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX3 | 50 XDRIVE MSP"): 15,0 kWh/100km (0,54 MJ/km), autonomia de 570km. Preço atualizado em 21/10/2026 de R$ 582.950 para R$ 587.950, pelo site oficial bmw.com.br.'
where id = 'bmw-ix3';

-- BMW X5 xDrive50e M Sport (R$ 864.950 -> R$ 868.950)
update cars set price = 868950, price_verified_date = '21/10/2026',
  tech_notes = 'SUV grande híbrido plug-in, motor a combustão 3.0 I6 turbo (313cv) somado a elétrico, com potência combinada de 489cv/700Nm. Bateria de 25,7kWh com ~76km de autonomia elétrica pura. AC de 22kW. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | X5 | xDrive50e MSP"): 24,4 kWh/100km no modo elétrico (0,88 MJ/km), 76km de autonomia no modo elétrico e 9,5 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 864.950 para R$ 868.950, pelo site oficial bmw.com.br (todos os modelos, "a partir de").'
where id = 'bmw-x5-xdrive50e';

-- Mini Cooper SE (R$ 259.990 -> R$ 314.990)
update cars set price = 314990, price_verified_date = '21/10/2026',
  tech_notes = 'Um dos modelos mais consistentes entre as fontes pesquisadas — poucas divergências. Porta-malas de 210L (800L com bancos rebatidos). O pacote MINI Service Inclusive (4 anos, km ilimitado) inclui um MINI Wallbox Essential 11kW de cortesia. Carga AC completa em ~5h15. Checagem em 19/08/2026: existe também um MINI Cooper E de entrada (184cv/290Nm, sem o ''S'', menos potente que este SE), confirmado pelo BMW Group Brasil como parte da linha, não cadastrado aqui (em out/2026 o site oficial dá R$ 264.990 para ele). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Cooper | SE"): 13,3 kWh/100km (0,48 MJ/km), autonomia de 312km. Autonomia atualizada de 303km para 312km pela tabela do INMETRO. Preço atualizado em 21/10/2026 de R$ 259.990 para R$ 314.990, pelo site oficial mini.com.br (preço sugerido do Cooper SE em out/2026; o Cooper E de entrada sai por R$ 264.990).'
where id = 'mini-cooper-se';

-- Mini Aceman E (R$ 254.990 -> R$ 275.990)
update cars set price = 275990, price_verified_date = '21/10/2026',
  tech_notes = 'Primeiro modelo da MINI projetado desde o início pra ser 100% elétrico, posicionado entre o hatch Cooper e o SUV Countryman. Versão de entrada (E), com bateria de 42,5kWh e 253km de autonomia (Inmetro) — dados confirmados via press release oficial do BMW Group Brasil. Porta-malas de 300L (1.005L com bancos rebatidos). A versão SE (mais potente) está cadastrada separadamente (id mini-aceman-se). Recarga DC 10-80% em ~28min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Aceman | E"): 12,8 kWh/100km (0,46 MJ/km), autonomia de 253km. Preço atualizado em 21/10/2026 de R$ 254.990 para R$ 275.990, pelo site oficial mini.com.br (preço sugerido).'
where id = 'mini-aceman-e';

-- Mini Aceman SE (R$ 304.990 -> R$ 325.990)
update cars set price = 325990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do Aceman, com bateria maior (54,2kWh vs 42,5kWh da E) e mais potência (218cv vs 184cv), resultando em mais autonomia (270km vs 253km, Inmetro) e aceleração mais rápida (7,1s vs 7,6s). Porta-malas de 300L (1.005L com bancos rebatidos). Recarga DC 10-80% em ~31min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Aceman | SE"): 14,4 kWh/100km (0,52 MJ/km), autonomia de 270km. Preço atualizado em 21/10/2026 de R$ 304.990 para R$ 325.990, pelo site oficial mini.com.br (ofertas, "a partir de").'
where id = 'mini-aceman-se';

-- MINI John Cooper Works Cooper E (R$ 330.990 -> R$ 349.990)
update cars set price = 349990, price_verified_date = '21/10/2026',
  tech_notes = 'Primeira vez que a linha JCW (John Cooper Works) é oferecida completa e 100% elétrica no Brasil (chegou junto com o JCW Aceman E, cadastrado separadamente, id mini-jcw-aceman-e). Versão de alta performance do Cooper SE (já cadastrado, id mini-cooper-se), com mais potência (258cv/340Nm vs 218cv/330Nm) e ajustes esportivos de suspensão/freios/visual. Autonomia de 306km (Inmetro/PBEV 2026). Capacidade de bateria não confirmada com segurança — fontes divergem entre reaproveitar o valor do Cooper SE (54,2kWh) e não informar; por isso não incluída. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | JCW-E | 3P"): 13,3 kWh/100km (0,48 MJ/km), autonomia de 306km. Autonomia atualizada de 299km para 306km pela tabela do INMETRO. Preço atualizado em 21/10/2026 de R$ 330.990 para R$ 349.990, pelo site oficial mini.com.br (preço sugerido do JCW E).'
where id = 'mini-jcw-cooper-e';

-- MINI John Cooper Works Aceman E (R$ 345.990 -> R$ 359.990)
update cars set price = 359990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de alta performance do Aceman (a E de entrada, 184cv, e a SE, 218cv, já estão cadastradas separadamente, ids mini-aceman-e e mini-aceman-se), com mais potência ainda (258cv/340Nm) e ajustes esportivos JCW. Autonomia de 312km (Inmetro/PBEV) — a maior entre os elétricos MINI hatch/SUV compacto. Capacidade de bateria não confirmada com segurança (fontes divergem e uma delas parece ter confundido com a ficha da Aceman E comum) — por isso não incluída. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | JCW-E | ACEMAN"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 312km. Preço atualizado em 21/10/2026 de R$ 345.990 para R$ 359.990, pelo site oficial mini.com.br (ofertas, "a partir de").'
where id = 'mini-jcw-aceman-e';

-- Hyundai KONA Híbrido Ultimate (sem mudança)
update cars set price = 219990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada (Ultimate, R$219.990) — existe também a Signature, mais completa e mais cara, R$239.990 (confirmado ao trocar a versão no seletor oficial do site em 11/09/2026). Ficha oficial (site + catálogo PDF Hyundai, baixados em 11/09/2026): motor Kappa 1.6 GDI + motor elétrico PMSM, bateria 1,32kWh, potência combinada 141cv, torque combinado 27kgf.m (264,8Nm, arredondado pra 265). Transmissão automatizada de dupla embreagem de 6 marchas (DCT). Velocidade máxima 165km/h, 0-100km/h em 11,2s. Consumo: 18,4km/l cidade / 16km/l estrada. Dimensões: 4.350mm de comprimento, 1.825mm de largura, 1.680mm de altura (antena excluída), 2.660mm de entre-eixos. Porta-malas: 407 litros. 6 airbags (frontal duplo + laterais de tórax + cortina — contados na lista de equipamentos do catálogo oficial, sem um número "6" publicado explicitamente em texto corrido). Garantia: 5 anos geral sem limite de km + 8 anos/160.000km específico pra bateria/componentes híbridos (texto legal do catálogo oficial). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HYUNDAI | KONA | Ultimate"): 17,2 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 219.990, pelo site oficial hyundai.com.br ("a partir de"; a oferta de R$ 179.990 é campanha temporária).'
where id = 'hyundai-kona-hibrido';

-- Kia Niro HEV (sem mudança)
update cars set price = 194990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada (código N.855.2627, R$194.990) — existe também a N.861.2627, mais equipada, R$219.990; mesma mecânica nas duas (ficha técnica idêntica), só mudam itens de série. Preços de tabela — o site também mostra um bônus promocional temporário de R$20.000 (válido até 30/09/2026 ou fim de estoque), não usado aqui por não ser o preço permanente. Ficha técnica oficial completa (tabela HTML do próprio site Kia, capturada em 11/09/2026): potência combinada 141cv@5.700rpm, torque combinado 27kgf.m@4.000rpm (264,8Nm, arredondado pra 265) — mesmo motor Kappa 1.6 do Hyundai KONA Híbrido (plataforma-irmã Hyundai/Kia). Transmissão DCT de 6 marchas, tração dianteira 4x2. Dimensões: 4.420mm de comprimento, 1.825mm de largura, 1.545mm de altura, 2.720mm de entre-eixos. Porta-malas: 425L normal / 1.419L com banco rebatido (medida VDA). Peso em ordem de marcha: 1.394kg. 7 airbags (frontais duplos + laterais dianteiros + cortina + joelho do motorista, listados individualmente na ficha oficial). Bateria: química Polímero de Lítio-Ion confirmada na ficha oficial, mas capacidade em kWh não publicada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "KIA | NIRO | HEV 1.6 SX"): 17,2 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 194.990, pelo site oficial kia.com.br (preço público sugerido; bônus temporário de R$ 20.000 não incluído).'
where id = 'kia-niro-hev';

-- Kia Carnival Full Hybrid (sem mudança)
update cars set price = 684990, price_verified_date = '21/10/2026',
  tech_notes = 'Minivan híbrida, categoria nova pro catálogo. Versão única (código V.851.2627, R$684.990). Ficha técnica oficial completa (tabela HTML do próprio site Kia, capturada em 11/09/2026): bateria 1,485kWh (Polímero de Lítio-Ion, 270V nominal — o único dos 5 carros desta leva com kWh publicado oficialmente), motor elétrico 54kW/2.600rpm + 30,4kgf.m/1.600rpm, motor a gasolina Gamma II 1.6 Turbo GDI 180cv/5.500rpm + 26,2kgf.m/4.500rpm, potência COMBINADA 245cv@5.500rpm, torque combinado 37,4kgf.m@4.500rpm (366,8Nm, arredondado pra 367). Transmissão automática de 6 marchas, tração dianteira 4x2. Dimensões: 5.155mm de comprimento, 1.995mm de largura, 1.750mm de altura, 3.090mm de entre-eixos — a maior das 5 desta leva. Porta-malas: 627L normal / 2.827L com 2ª e 3ª fileiras rebatidas. 8 lugares. Peso em ordem de marcha: 2.220kg. 8 airbags (frontais duplos + laterais e central dianteiros + cortina nas 3 fileiras + joelho do motorista — "8 Airbags" anunciado explicitamente na página do modelo). Garantia de bateria de 8 anos/160.000km é o padrão que a Kia anuncia pro Niro HEV (mesma marca, mesma tecnologia de bateria) — não foi encontrado um texto específico repetindo essa garantia na página da Carnival, por isso a ressalva. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versões "KIA | CARNIVAL | HEV EX/LX/SX"): 11,1 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 684.990, pelo site oficial kia.com.br (preço público sugerido).'
where id = 'kia-carnival-hybrid';

-- Toyota bZ4X AWD (sem mudança)
update cars set price = 422420, price_verified_date = '21/10/2026',
  tech_notes = 'SUV 100% elétrico da Toyota — não é híbrido, entra no catálogo por completar a lacuna que o usuário apontou (linha Toyota inteira: Yaris Cross Hybrid, Corolla Hybrid, Corolla Cross Hybrid e bZ4X). Ficha oficial (catálogo PDF Toyota "bZ4X MY26", baixado em 11/09/2026): motor dianteiro 227cv/27,4kgf.m + motor traseiro 120cv/17,3kgf.m, potência total 343cv (publicada explicitamente pela Toyota). Torque registrado aqui é só do motor dianteiro (269Nm) — a Toyota não soma os dois torques numa ficha única. Bateria 73,1kWh, autonomia 361km Inmetro. Carregamento AC 22kW / DC 150kW. Vão livre e peso confirmados; airbags e garantia de bateria não encontrados nesta ficha específica. Consumo de 14,7 kWh/100km convertido do consumo equivalente que o INMETRO atribuiu ao bZ4X (42,3 km/l na cidade e 34,3 km/l na estrada, classe A, conforme matéria da Auto+ TV no lançamento em jun/2026). O modelo ainda não aparece nas tabelas PBEV 2025 e 2026; a conversão usa a mesma relação entre km/l equivalente e MJ/km que reproduz, com diferença de até 0,01 MJ/km, 180 dos 186 elétricos da tabela 2026. Preço conferido em 21/10/2026: R$ 422.420, pelo site oficial toyota.com.br.'
where id = 'toyota-bz4x';

-- Toyota Corolla GLi HEV (R$ 194.790 -> R$ 196.990)
update cars set price = 196990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada híbrida do sedã Corolla (GLi HEV) — existe também a Altis Hybrid Premium, mais equipada, R$210.090. Mesmo conjunto motor+bateria do Corolla Cross Hybrid (plataforma compartilhada): motor 1.8L 101cv/5.200rpm + 14,5kgf.m etanol, motor elétrico 72cv/16,6kgf.m — a Toyota também NÃO publica potência combinada pra esta ficha (mesma ressalva do Corolla Cross Hybrid: os 101cv aqui são só do motor a combustão). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | COROLLA | GLI HEV"): 16,4 km/l de gasolina no ciclo combinado. Preço atualizado em 21/10/2026 de R$ 194.790 para R$ 196.990, pelo site oficial toyota.com.br, versão GLi HEV ("a partir de").'
where id = 'toyota-corolla-hybrid';

-- Toyota Yaris Cross Hybrid XRE (sem mudança)
update cars set price = 172390, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada híbrida (XRE Hybrid) — existe também a XRX Hybrid, mais equipada, R$189.990. Ficha oficial (catálogo PDF Toyota, baixado do site em 11/09/2026): motor 1.5L 91cv/5.500rpm + 12,3kgf.m etanol, motor elétrico 80cv/14,4kgf.m. Diferente do Corolla Cross Hybrid e do Corolla Hybrid, aqui a Toyota PUBLICA uma potência combinada explícita: 111cv — é essa a usada aqui (torque combinado não é publicado; o valor registrado é só do motor elétrico). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | YARIS CROSS | XRE-HYBRID"): 16,6 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 172.390, pelo site oficial toyota.com.br, versão XRE Hybrid.'
where id = 'toyota-yaris-cross-hybrid';

-- Ford Maverick Hybrid (R$ 239.900 -> R$ 229.900)
update cars set price = 229900, price_verified_date = '21/10/2026',
  tech_notes = 'Ficha oficial Ford (catálogo técnico PDF, baixado do site em 11/09/2026): potência combinada 194cv@5600rpm, torque 210Nm@4000rpm (esse número vem com um "*" na tabela oficial, sem nota explicativa localizada — mantido por ser o único publicado). Transmissão eCVT (as outras versões da picape, a combustão, usam automática de 8 velocidades). Caçamba com 943 litros de capacidade (não é "porta-malas" — é picape; capacidade de carga total 584kg). Dimensões: 5.096mm de comprimento, 3.077mm de entre-eixos, 1.733mm de altura, 1.979mm de largura sem espelho. Tanque de combustível menor que as versões a combustão: 52,2L (vs 62,4L). 7 airbags (dianteiros, laterais, cortina e joelho do motorista) — item de série em toda a linha Maverick. ATENÇÃO: garantia da bateria é de apenas 12 MESES sem limite de km — muito abaixo do padrão de 8 anos que Toyota, Honda, Hyundai e Kia praticam pros próprios sistemas híbridos no Brasil; vale destacar isso pro usuário antes de qualquer recomendação. Preço confirmado no site oficial em 11/09/2026 (mesmo valor da versão Tremor, a combustão). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "FORD | Maverick | Lariat Hybrid"): 14,5 km/l de gasolina no ciclo combinado. Preço atualizado em 21/10/2026 de R$ 239.900 para R$ 229.900, pelo site oficial ford.com.br (comparativo de versões da Maverick).'
where id = 'ford-maverick-hybrid';

-- Honda Accord Advanced Hybrid (R$ 332.400 -> R$ 333.000)
update cars set price = 333000, price_verified_date = '21/10/2026',
  tech_notes = 'Único trim de Accord vendido no Brasil (Advanced Hybrid), versão única de cor (Preto Cristal Perolizado) na linha 2026. Mesmo motor elétrico (184cv/34,1kgf.m — 334Nm) do CR-V e do Civic híbridos; combustão 146cv/19,2kgf.m gasolina. Ficha técnica de especificações (dimensões, motor, porta-malas 574L) vem de um catálogo PDF datado de agosto/2023 — mais antigo que o dos outros modelos —, mas os números batem exatamente com o que a imprensa reporta pra linha 2026 (checado em 11/09/2026), incluindo os 574L de porta-malas, o que dá confiança de que a ficha técnica em si não mudou, só o ano/preço. Consumo Inmetro: 17,5 km/l cidade. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | ACCORD HYBRID | TOURING"): 16,6 km/l de gasolina no ciclo combinado. Preço atualizado em 21/10/2026 de R$ 332.400 para R$ 333.000, pelo site oficial honda.com.br.'
where id = 'honda-accord-advanced-hybrid';

-- Honda Civic Advanced Hybrid (sem mudança)
update cars set price = 266500, price_verified_date = '21/10/2026',
  tech_notes = 'Único trim de Civic vendido no Brasil (Advanced Hybrid) — sem versão a combustão pura na linha atual. Mesmo motor elétrico (184cv/32,1kgf.m — 315Nm) do CR-V e do Accord híbridos, motor a combustão ligeiramente diferente por modelo (aqui 143cv/19,1kgf.m gasolina). Ficha oficial (catálogo PDF Honda, baixado em 11/09/2026) e imprensa especializada concordam: 184cv é tratado como a potência combinada/de sistema pra esta configuração FWD (sem motor traseiro adicional como no CR-V AWD, cujo combinado de 207cv inclui o eixo traseiro). Preço R$266.500 (checado em 11/09/2026) — vendas baixas reportadas no mercado brasileiro (imprensa cita ~34 unidades em 2026), mas o modelo segue oficialmente à venda. Consumo Inmetro: 18,4 km/l cidade / 15,9 km/l estrada gasolina. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | CIVIC HYBRID | TOURING"): 17,2 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 266.500, pelo site oficial honda.com.br.'
where id = 'honda-civic-advanced-hybrid';

-- Honda CR-V Advanced Hybrid (sem mudança)
update cars set price = 353500, price_verified_date = '21/10/2026',
  tech_notes = 'Único trim de CR-V híbrido vendido no Brasil (Advanced Hybrid) — não existe versão CR-V a combustão pura na linha atual. Sistema e:HEV: na maior parte do tempo o motor elétrico traciona sozinho as rodas (184cv/34,2kgf.m — 335Nm), enquanto o motor 2.0L a combustão (147cv/19,4kgf.m gasolina) funciona majoritariamente como gerador, só tracionando diretamente em velocidade constante de estrada. Ficha oficial (catálogo PDF Honda, baixado do site em 11/09/2026) lista as duas potências separadamente, sem somar; a potência combinada de 207cv usada aqui é a comumente reportada pela imprensa especializada pra este powertrain — vale reconfirmar na concessionária. Tração integral AWD. Preço de tabela oficial R$353.500 (checado no site oficial), mas há descontos de concessionária amplamente reportados levando o preço efetivo a R$309.990-315.900 em alguns casos — preço de tabela é o usado aqui, consistente com o critério do resto do catálogo. Bateria Li-ion pequena (1,06kWh, típica de HEV — não é uma bateria de tração tipo BEV/PHEV, não pluga). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | CR-V | TOURING"): 13,0 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 353.500, pelo site oficial honda.com.br.'
where id = 'honda-cr-v-advanced-hybrid';

-- Honda Prelude (sem mudança)
update cars set price = 380000, price_verified_date = '21/10/2026',
  tech_notes = 'EM PRÉ-VENDA até o final de setembro/2026 (anunciado no Festival Interlagos, 27/08/2026) — ainda não é venda geral pela rede de concessionárias, incluído a pedido do usuário mesmo assim por já ter preço oficial firme (R$380.000) e ser híbrido confirmado. Retorno do cupê esportivo da Honda ao Brasil, agora eletrificado, compartilhando chassi/suspensão/freios Brembo com o Civic Type R. Catálogo digital oficial da Honda (baixado em 11/09/2026) lista os componentes separados — motor 2.0L Atkinson 143cv/19,1kgf.m gasolina + motor elétrico 184cv/32,1kgf.m — exatamente os MESMOS números do Civic Advanced Hybrid, sem publicar uma "potência combinada" nessa ficha específica. Os 203cv usados aqui como potência combinada vêm de multiplas fontes de imprensa (incluindo a AutoData, publicação do setor automotivo) reportando esse valor de forma consistente — provavelmente de um press release da Honda que essa ficha de consumidor não repete. Vale reconfirmar quando a Honda publicar uma ficha técnica mais completa. Versão única, 3 cores (Crystal Black Pearl, Rallye Red, Moonlit White Pearl). Dimensões/porta-malas/peso não encontrados em nenhuma fonte oficial até 11/09/2026. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | PRELUDE | TOP"): 16,8 km/l de gasolina no ciclo combinado. Preço conferido em 21/10/2026: R$ 380.000, pelo site oficial honda.com.br.'
where id = 'honda-prelude';

-- Chevrolet Spark EUV (R$ 144.990 -> R$ 152.790)
update cars set price = 152790, price_verified_date = '21/10/2026',
  tech_notes = 'Mini SUV elétrico de entrada da Chevrolet no Brasil, com motor único dianteiro de 102cv/180Nm e bateria de 41,9kWh. Porta-malas de 355L (916L com bancos rebatidos). Carregador de parede (wall charger) de 7kW leva de 20% a 100% em ~7h; carregamento DC não confirmado em fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | SPARK EUV | ACTIV"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 258km. Preço atualizado em 21/10/2026 de R$ 144.990 para R$ 152.790, pelo site oficial chevrolet.com.br (preço público sugerido).'
where id = 'chevrolet-spark-euv';

-- Chevrolet Captiva EV Premier (R$ 199.990 -> R$ 219.990)
update cars set price = 219990, price_verified_date = '21/10/2026',
  tech_notes = 'SUV elétrico familiar de produção nacional (Polo Automotivo do Ceará, junto com o Spark EUV), vendido só na versão Premier. Bateria LFP de 60kWh, motor único dianteiro de 201cv/310Nm. Preço de lançamento era R$199.990. DC de até 120kW (30-80% em ~30min). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | CAPTIVA EV | PR"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 304km. Recarga AC de 6,6 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica). Preço atualizado em 21/10/2026 de R$ 199.990 para R$ 219.990, pelo site oficial chevrolet.com.br (preço público sugerido).'
where id = 'chevrolet-captiva-ev';

-- Chevrolet Blazer EV RS (sem mudança)
update cars set price = 503190, price_verified_date = '21/10/2026',
  tech_notes = 'SUV elétrico esportivo da plataforma Ultium (mesma base do Equinox EV), vendido no Brasil só na versão RS (motor único traseiro, 347cv/450Nm). Preço subiu de R$479.000 no lançamento (2024) para R$503.190 atualmente. Autonomia INMETRO de 481km (tabela PBEV 2026); os 526km de outra fonte são de outro ciclo de medição. Pente-fino 19/08/2026: a versão AWD (bimotor, 305cv/~480Nm, bateria menor de 85kWh, menos autonomia) é uma opção ADICIONAL para 2026, não substitui a RWD atual — segue sem preço oficial publicado, então não foi cadastrada como card separado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | BLAZER EV | RS"): 17,5 kWh/100km (0,63 MJ/km), autonomia de 481km. Autonomia atualizada de 526km para 481km pela tabela do INMETRO. Preço conferido em 21/10/2026: R$ 503.190, pelo site oficial chevrolet.com.br (preço público sugerido).'
where id = 'chevrolet-blazer-ev';

-- Mitsubishi Outlander PHEV HPE-S (R$ 374.990 -> R$ 379.990)
update cars set price = 379990, price_verified_date = '21/10/2026',
  tech_notes = 'Nova geração (4ª geração) do Outlander no Brasil vendida só como PHEV (não há mais versão a combustão pura). 7 lugares, tração integral elétrica Twin Motor 4WD (um motor elétrico em cada eixo + motor 2.4 ciclo Atkinson). Autonomia 100% elétrica de 58km (Inmetro) e autonomia combinada de até 680km. Porta-malas de apenas 284L com os 7 lugares em uso (637L com a 3ª fileira rebatida, 1.448L só com os dianteiros). Recarga só em AC 3,5kW via carregador portátil (~6h30 para carga completa) — não há confirmação de recarga DC rápida. Existe também a versão Signature (mesma mecânica, mais equipamentos) não cadastrada separadamente por não ter diferença de potência/bateria. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Mitsubishi | Outlander | HPE-S E"): 21,4 kWh/100km no modo elétrico (0,77 MJ/km), 58km de autonomia no modo elétrico e 11,1 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 374.990 para R$ 379.990, pelo site oficial mitsubishimotors.com.br, versão HPE-S linha 2027 ("de R$ 379.990"; o "por R$ 329.990" é condição de outubro; a Signature sai de R$ 399.990).'
where id = 'mitsubishi-outlander-phev';

-- Renault Megane E-Tech (sem mudança)
update cars set price = 279990, price_verified_date = '21/10/2026',
  tech_notes = 'Hatch elétrico premium da Renault, com vendas bem baixas no Brasil (32 unidades emplacadas de jan-set/2025). Preço de tabela oficial é R$279.990, mas há descontos agressivos em concessionárias (achado por R$225.990 a R$199.900 em promoções pontuais) por conta do baixo giro de estoque. Recarga DC de 130kW (15-80% em ~36min) e AC de 22kW (carga completa em ~1h50). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "RENAULT | MÉGANE | E-TECH"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 337km. Preço conferido em 21/10/2026: R$ 279.990, pelo configurador oficial renault.com.br.'
where id = 'renault-megane-e-tech';

-- Renault Koleos esprit Alpine full hybrid E-Tech (R$ 293.490 -> R$ 289.990)
update cars set price = 289990, price_verified_date = '21/10/2026',
  tech_notes = 'Única versão do Koleos híbrido vendida no Brasil (esprit Alpine, "1 versões disponíveis" confirmado na página oficial de versões e preços) — não existe trim de entrada mais barato. Ficha oficial (site + catálogo PDF Renault, baixados em 11/09/2026): potência combinada 245cv@5500rpm. A Renault publica só o torque do conjunto elétrico — "245cv com um motor a gasolina e dois motores elétricos totalizando 320Nm de torque elétrico" —, sem uma cifra de torque combinado de sistema em nenhuma fonte oficial encontrada; o valor registrado aqui (320Nm) é esse torque elétrico, não necessariamente o torque total combinado do sistema. Até 75% de condução elétrica na cidade (dado interno Renault), autocarregável (não pluga). Consumo: 13,1km/l cidade. Dimensões: 4.780mm de comprimento, 1.880mm de largura, 1.680mm de altura, 2.820mm de entre-eixos. Porta-malas: 545 litros. 7 airbags (2 frontais + 2 laterais + 2 de cortina + 1 entre os bancos dianteiros — número "7 airbags" publicado explicitamente no catálogo oficial). Garantia: 5 anos sem limite de km geral + 8 anos sem limite de km pra bateria (texto legal do catálogo oficial, ano/modelo 2026/2027). Bateria: capacidade em kWh não publicada em nenhuma fonte oficial encontrada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "RENAULT | KOLEOS | E-TECH"): 12,6 km/l de gasolina no ciclo combinado. Preço atualizado em 21/10/2026 de R$ 293.490 para R$ 289.990, pelo configurador oficial renault.com.br.'
where id = 'renault-koleos-hybrid-e-tech';

-- Jetour T2 XWD 4x4 (sem mudança)
update cars set price = 349900, price_verified_date = '21/10/2026',
  tech_notes = 'Variante off-road mais cara e mais potente do T2 (que já estava no catálogo como "Jetour T2 PHEV", R$289.900/Advance) — essa ficha já apontava a existência do XWD 4x4 mas sem número confiável ("fontes divergem entre 375cv, 597cv e 620cv"). RESOLVIDO: ficha técnica oficial em PDF (baixada do site Jetour em 14/09/2026) confirma 597cv e ~900Nm (91,7kgfm somado) — mas com uma ressalva publicada pela PRÓPRIA Jetour junto do número: "*Simples soma das potências e torques individuais. Não disponível simultaneamente durante o uso." Ou seja, os 4 motores (1 combustão 135cv/20,4kgfm + 3 elétricos: 102cv/17,3kgfm, 122cv/22,4kgfm, 238cv/31,6kgfm) nunca entregam a soma total ao mesmo tempo — é uma cifra de marketing, não uma potência de sistema real medida. Mantive mesmo assim por ser o único número oficial e por ser exatamente o mesmo critério que o resto do catálogo já usa pra "potência combinada" quando a montadora só soma componentes. Bateria 43,2kWh LFP, alcance total até 1.300km, 0-100km/h em 5,5s, velocidade máxima 197km/h. Consumo: 9,9km/l gasolina (ciclo PBEV 55%-45%). Carregamento CCS2, AC 7kW / DC 40kW (30-80% em 37min). Dimensões: 4.785mm de comprimento, 2.006mm de largura, 1.875mm de altura, 2.800mm de entre-eixos. Porta-malas: 580L normal / 1.494L máximo. Vão livre: 205mm. Peso: 2.362kg. Garantia (do próprio PDF oficial): veículo 7 anos/150.000km + bateria/motor elétrico 8 anos/160.000km. Airbags: a ficha oficial só itemiza explicitamente "airbags laterais (dianteiro, motorista e passageiro)" e "airbags de cabeça (dianteiro e traseiro)" — sem citar frontais por nome (provavelmente por serem item de série básico assumido). Usei 6 (mesmo total do T2 PHEV normal, mesma plataforma/marca) por analogia, não por contagem literal desta ficha específica — vale reconfirmar na concessionária antes de qualquer decisão que dependa desse número. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | PRM 4X4"): 23,3 kWh/100km no modo elétrico (0,84 MJ/km), 106km de autonomia no modo elétrico e 9,9 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 349.900, pelo site oficial jetourbr.com.'
where id = 'jetour-t2-4x4-xwd';

-- Jetour T2 PHEV (sem mudança)
update cars set price = 289900, price_verified_date = '21/10/2026',
  tech_notes = 'Preço real de tabela é R$289.900 (Advance) a R$299.900 (Premium) — bem acima do valor anterior de R$189.990. Potência combinada real é de até 339cv/510Nm (motor 1.5 turbo 128cv/20,4kgfm + elétrico dianteiro 225cv/39,8kgfm), não 197cv — confirmado em pente-fino 19/08/2026 contra ficha técnica detalhada (bate exatamente: 52kgfm = 510Nm). Autonomia elétrica pura de 75km (INMETRO). Consumo híbrido de 11,4 km/L no ciclo urbano (gasolina). Porta-malas tem conflito entre fontes (450L vs 580L). Carregamento AC 7kW / DC 40kW (20-80% em ~30-36min). ATENÇÃO: existe uma versão XWD 4x4 do T2 (R$349.990, tração integral) com potência bem maior, mas as fontes divergem muito sobre o número exato (375cv, 597cv e 620cv aparecem em fontes diferentes) — não cadastrada como card separado por falta de ficha confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | ADVANCE"): 22,2 kWh/100km no modo elétrico (0,80 MJ/km), 75km de autonomia no modo elétrico e 11,0 km/l de gasolina no modo híbrido (ciclo combinado). Preço conferido em 21/10/2026: R$ 289.900, pelo site oficial jetourbr.com, versão Advance.'
where id = 'jetour-t2-phev';

-- Jetour T1 (R$ 254.900 -> R$ 249.900)
update cars set price = 249900, price_verified_date = '21/10/2026',
  tech_notes = 'SUV intermediário da Jetour, entre o S06 (mais barato) e o T2 (mais caro/potente). Mesmo conjunto mecânico do S06 (315cv/510Nm), mas bateria maior (26,7kWh vs 19,43kWh) e mais autonomia elétrica (88km vs 70km) e porta-malas maior (574L vs 416L, até 1.455L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T1 I-DM | ADVANCE"): 18,3 kWh/100km no modo elétrico (0,66 MJ/km), 88km de autonomia no modo elétrico e 13,0 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 254.900 para R$ 249.900, pelo site oficial jetourbr.com, versão Advance (Premium R$ 264.900).'
where id = 'jetour-t1';

-- Jetour S06 (R$ 204.900 -> R$ 199.900)
update cars set price = 199900, price_verified_date = '21/10/2026',
  tech_notes = 'SUV de entrada da Jetour no Brasil, marca que estreou no país em 2026 com 3 modelos PHEV (S06, T1 e T2, este já cadastrado separadamente). Mesmo conjunto mecânico do T1 (1.5 turbo 135cv + elétrico 204cv, 315cv/510Nm combinados), mas com bateria menor (19,43kWh vs 26,7kWh), resultando em menos autonomia elétrica (70km vs 88km). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | S06 DM | ADVANCE"): 17,2 kWh/100km no modo elétrico (0,62 MJ/km), 70km de autonomia no modo elétrico e 13,4 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 204.900 para R$ 199.900, pelo site oficial jetourbr.com, versão Advance (Premium R$ 229.900).'
where id = 'jetour-s06';

-- MG4 Comfort (R$ 169.990 -> R$ 184.600)
update cars set price = 184600, price_verified_date = '21/10/2026',
  tech_notes = 'Versão de entrada da linha MG4 (distinta da ''MG4 Urban Luxury 54 kWh'' já cadastrada separadamente, um modelo menor e mais barato). Existem também Luxury RWD 64kWh (mesma potência/bateria, mais equipamento) e XPower AWD 64kWh (320kW/435cv, 0-100 em 3,8s). Autonomia 364km é a homologada Inmetro/PBEV (a WLTP divulgada pela MG é 467km, mas superestima o uso real no Brasil). Ficha conferida na ficha técnica oficial MG (ago/2026). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | MG4 | 64 KWH COM"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 364km. Preço atualizado em 21/10/2026 de R$ 169.990 para R$ 184.600, pelo site oficial mgmotoroficial.com.br, versão Comfort ("de R$ 184.600"; o "por R$ 169.600" é oferta temporária).'
where id = 'mg-mg4';

-- MG4 Urban Luxury 54 kWh (R$ 149.990 -> R$ 154.990)
update cars set price = 154990, price_verified_date = '21/10/2026',
  tech_notes = 'Construído sobre a plataforma MSP (Modular Scalable Platform), a mesma usada na Europa — o que dá respaldo real ao resultado de 5 estrelas do MG4 Electric no Euro NCAP. Química LFP confirmada diretamente na concessionária, após divergência entre fontes públicas. Specs conferidas na ficha técnica oficial MG (ago/2026): porta-malas 568L e altura livre do solo 117mm (valor único de fábrica, igual em todas as versões do MG4 Urban). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | MG4 | URB EV54KWH LUX"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 358km. Preço atualizado em 21/10/2026 de R$ 149.990 para R$ 154.990, pelo site oficial mgmotoroficial.com.br, versão Luxury 54 kWh.'
where id = 'mg4urban';

-- MG S5 (sem mudança)
update cars set price = 218800, price_verified_date = '21/10/2026',
  tech_notes = 'Duas versões: Comfort (R$195.800, reajustada pra R$218.800 a partir de 5/jan/2026 — ficha usada aqui, com 6 airbags) e Luxury (R$219.800, R$238.800 após 5/jan/2026, ganha 7º airbag central, teto solar e mais equipamento). Construído sobre a Plataforma Modular Escalável (MSP) da MG, 5 estrelas no Euro NCAP 2025. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | S5 | EV 62KWH LUX"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 351km. Preço conferido em 21/10/2026: R$ 218.800, pelo site oficial mgmotoroficial.com.br, versão Comfort ("de R$ 218.800"; o "por" é oferta temporária).'
where id = 'mg-s5';

-- MG Cyberster (R$ 499.800 -> R$ 529.800)
update cars set price = 529800, price_verified_date = '21/10/2026',
  tech_notes = 'Roadster esportivo com portas de abertura tipo tesoura. Recarga DC de 150kW leva de 10% a 80% em ~38min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | CYBERSTER | 77 KWH AWD"): 15,6 kWh/100km (0,56 MJ/km), autonomia de 342km. Preço atualizado em 21/10/2026 de R$ 499.800 para R$ 529.800, pelo site oficial mgmotoroficial.com.br.'
where id = 'mg-cyberster';

-- Leapmotor B10 (sem mudança)
update cars set price = 182990, price_verified_date = '21/10/2026',
  tech_notes = 'Autonomia WLTP divulgada é 361km, mas a homologação Inmetro/PBEV real é 288km. Preço de tabela varia por público: R$182.990 padrão, com descontos pra troca de usado (R$175.990), taxista (R$141.190), PCD (R$161.390) e CNPJ (R$168.290). Será fabricado no Brasil em fábrica da Stellantis. Recarga rápida recupera 50% em ~15min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | B10 | LIFE"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 288km. Preço conferido em 21/10/2026: R$ 182.990, pelo site oficial leapmotor.com.br, versão elétrica.'
where id = 'leapmotor-b10';

-- Leapmotor C10 (R$ 204.990 -> R$ 214.990)
update cars set price = 214990, price_verified_date = '21/10/2026',
  tech_notes = 'Existe também a versão REEV (com extensor de autonomia a combustão), cadastrada separadamente (id leapmotor-c10-reev) por ser um powertrain diferente (fuelType PHEV em vez de BEV). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | C10 | Design"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 338km. Recarga AC de 11 kW e DC de 84 kW pela ficha técnica de lançamento distribuída à imprensa (out/2025): de 30 a 80% em 3,9 h (AC) ou 30 min (DC). O Canal VE cita 6,6 kW em AC. Preço atualizado em 21/10/2026 de R$ 204.990 para R$ 214.990, pelo site oficial leapmotor.com.br ("a partir de").'
where id = 'leapmotor-c10';

-- Leapmotor C10 REEV (sem mudança)
update cars set price = 219990, price_verified_date = '21/10/2026',
  tech_notes = 'Versão REEV (range extender EV) do C10: motor a combustão 1.5 de 4 cilindros funciona só como gerador pra recarregar a bateria, sem tracionar as rodas diretamente — tração é sempre elétrica traseira. Bateria LFP de 28,4kWh dá ~145km de autonomia elétrica pura (WLTP); com o tanque de 50L cheio, a autonomia combinada chega a 950-1.150km. Recarga DC de 30-80% em 18-30min. Porta-malas assumido igual ao da versão BEV (mesma carroceria, 465L) — não há fonte específica confirmando pra versão REEV. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | C10 | REEV"): 18,1 kWh/100km no modo elétrico (0,65 MJ/km), 111km de autonomia no modo elétrico e 12,0 km/l de gasolina no modo híbrido (ciclo combinado). Recarga AC de 6,6 kW e DC de 65 kW pela ficha técnica de lançamento distribuída à imprensa (out/2025): de 30 a 80% em 3 h (AC) ou 18 min (DC). Preço conferido em 21/10/2026: R$ 219.990, pelo site oficial leapmotor.com.br.'
where id = 'leapmotor-c10-reev';

-- Omoda 7 SHS-P (sem mudança)
update cars set price = 254990, price_verified_date = '21/10/2026',
  tech_notes = 'SUV híbrido plug-in irmão do JAECOO 7 PHEV (mesma plataforma Chery Super Hybrid System, specs quase idênticas: 279cv/365Nm, bateria 18,4kWh, ~60km elétricos Inmetro, 1.200km combinados). O ''SHS-P'' (Plug-in) distingue do Omoda 5 SHS-H, que é HEV comum sem tomada — por isso não entrou na base. Duas versões: Luxury (R$254.990 — ficha usada aqui) e Prestige (R$279.990). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "OMODA | 7 | PHEV LUXURY"): 18,3 kWh/100km no modo elétrico (0,66 MJ/km), 60km de autonomia no modo elétrico e 13,0 km/l de gasolina no modo híbrido (ciclo combinado). Recarga AC de 6,6 kW e DC de 40 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica) (mesmos números do Jetour S06, da mesma plataforma, na ficha oficial). Preço conferido em 21/10/2026: R$ 254.990, pelo site oficial omodajaecoo.com.br.'
where id = 'omoda-7-shs-p';

-- Omoda E5 (sem mudança)
update cars set price = 209990, price_verified_date = '21/10/2026',
  tech_notes = 'Derivado do modelo híbrido Omoda 5. Recarga DC de 80kW leva de 30% a 80% em ~30min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "OMODA | E5 | --"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 345km. Recarga AC de 9,9 kW pela ficha técnica do Canal VE (canalve.com.br/ficha-tecnica) (valor incomum; a ficha oficial em PDF não pôde ser lida). Preço conferido em 21/10/2026: R$ 209.990, pelo site oficial omodajaecoo.com.br (página do modelo).'
where id = 'omoda-e5';

-- Lexus NX 450h+ (R$ 457.900 -> R$ 499.990)
update cars set price = 499990, price_verified_date = '21/10/2026',
  tech_notes = 'Primeiro híbrido plug-in da Lexus no Brasil. Sistema com 3 motores (1 a combustão + 2 elétricos, um por eixo) somando 308cv. Autonomia 100% elétrica de 56km (Inmetro). Recarga completa em ~2h45 com wallbox WEG incluso sem custo. Garantia de 10 anos/200.000km é do programa LexusCare (sujeita a revisões periódicas na rede autorizada, não é incondicional). Irmã maior é o RX 450h+ (cadastrado separadamente, id lexus-rx-450h-plus), com a mesma mecânica. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | NX 450H PLUG-IN"): 16,9 kWh/100km no modo elétrico (0,61 MJ/km), 56km de autonomia no modo elétrico e 13,8 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 457.900 para R$ 499.990, pelo site oficial lexus.com.br.'
where id = 'lexus-nx-450h-plus';

-- Lexus RX 450h+ (R$ 609.990 -> R$ 614.990)
update cars set price = 614990, price_verified_date = '21/10/2026',
  tech_notes = 'Primeiro híbrido plug-in da linha RX no Brasil, mesma mecânica do NX 450h+ (cadastrado separadamente, id lexus-nx-450h-plus): 308cv combinados (2.5 aspirado + 2 motores elétricos), bateria 18,1kWh, autonomia elétrica de 54km (Inmetro). Recarga AC de 6,6kW (completa em ~2h45). Peso elevado (2.780kg) reflete o porte maior da carroceria SUV médio. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | RX450H PLUG-IN"): 17,8 kWh/100km no modo elétrico (0,64 MJ/km), 54km de autonomia no modo elétrico e 13,4 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 de R$ 609.990 para R$ 614.990, pelo site oficial lexus.com.br.'
where id = 'lexus-rx-450h-plus';

-- Lexus RZ 500e (sem mudança)
update cars set price = 499990, price_verified_date = '21/10/2026',
  tech_notes = 'Primeiro elétrico 100% da Lexus no Brasil, lançado oficialmente em 15/05/2026 (o modelo global se chama RZ 450e, mas a versão vendida no Brasil é nomeada RZ 500e). Bateria de 77kWh com resfriamento líquido. Autonomia Inmetro de 357km corrigida em pente-fino 19/08/2026 (valor anterior de 375km estava errado — 357km é o número consistente em múltiplas fontes do lançamento oficial de mai/2026; uma fonte antiga citava até 600km em ciclo urbano WLTP europeu, bem mais otimista e não usado aqui). Tração integral DIRECT4 com motor em cada eixo (264Nm cada, torque total do sistema não divulgado). Recarga DC até 150kW (0-80% em ~30min). Financiamento com taxa a partir de 0% e recompra garantida de 80% da tabela FIPE fazem parte do programa de lançamento. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | RZ | 500e"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 357km. Preço conferido em 21/10/2026: R$ 499.990, pelo site oficial lexus.com.br.'
where id = 'lexus-rz-500e';

-- Fiat 500e (R$ 219.990 -> R$ 214.990)
update cars set price = 214990, price_verified_date = '21/10/2026',
  tech_notes = 'Autonomia WLTP divulgada é 320 km; a do INMETRO, usada aqui, é 227 km. DC de 85 kW carrega de 0-80% em ~35 min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "FIAT | 500E | ICON"): 12,8 kWh/100km (0,46 MJ/km), autonomia de 227km. Preço atualizado em 21/10/2026 de R$ 219.990 para R$ 214.990, pelo configurador oficial 500e.fiat.com.br (hoje só oferece a versão Icon, por R$ 214.990).'
where id = 'fiat-500e';

-- JAC E-JS1 (sem mudança)
update cars set price = 132900, price_verified_date = '21/10/2026',
  tech_notes = 'Um dos elétricos mais baratos do Brasil, com bateria LFP de 31,4 kWh e a menor autonomia INMETRO do grupo (181 km) — reflexo do foco em uso urbano de curta distância. Apenas 2 airbags (motorista e passageiro), abaixo do padrão de 6 já comum em concorrentes chineses mais recentes. Atenção (checado em 19/08/2026): a JAC descontinuou os outros dois elétricos de passeio da linha (E-JS4 e E-J7, removidos deste app) e está reposicionando a marca no Brasil quase inteiramente para picapes — reduziu de 46+ concessionárias físicas pra só 3 (São Paulo, Curitiba, Porto Alegre). O E-JS1 segue sendo vendido (ano-modelo 2027 confirmado), mas o comunicado oficial da marca sobre a nova estratégia não mencionou ele, deixando o futuro do modelo incerto — vale considerar isso antes de comprar. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JAC | e-JS1 | e-JS1"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 181km. Custo de manutenção: sem tabela oficial de revisões publicada pela JAC. Usado o gasto real informado pela própria JAC à Webmotors (set/2023): R$ 4.620 em 120.000 km no primeiro dono, cerca de R$ 385 a cada 10.000 km. É valor de 2023 e tende a estar abaixo do preço atual. Preço conferido em 21/10/2026: R$ 132.900, pelo site oficial jacmotors.com.br (o "por R$ 119.900" é oferta temporária).'
where id = 'jac-e-js1';

-- Geely EX2 Max (R$ 136.800 -> R$ 137.800)
update cars set price = 137800, price_verified_date = '21/10/2026',
  tech_notes = 'Um dos poucos elétricos do segmento com motor traseiro e tração RWD — arquitetura incomum nessa faixa de preço. Bateria LFP de 39 kWh prioriza durabilidade e custo sobre densidade energética, resultando na menor autonomia do grupo. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GEELY | EX2 | MAX"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 289km. Preço atualizado em 21/10/2026 de R$ 136.800 para R$ 137.800, pelo site oficial geelybrasil.com.br (preço à vista da oferta vigente até 31/10/2026).'
where id = 'ex2max';

-- GWM Ora 5 (R$ 159.900 -> R$ 163.990)
update cars set price = 163990, price_verified_date = '21/10/2026',
  tech_notes = 'Plataforma Lemon da GWM. Maior vão livre (175 mm) e únicos ângulos de entrada/saída divulgados oficialmente (17°/25°) do grupo — vantagem real para quem enfrenta rampas ou terreno irregular. Único com estepe temporário de fábrica ao lado do Aion UT. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | ORA | 5"): 13,6 kWh/100km (0,49 MJ/km), autonomia de 349km. Preço atualizado em 21/10/2026 de R$ 159.900 para R$ 163.990, pelo site oficial gwmmotors.com.br.'
where id = 'ora5';

commit;
