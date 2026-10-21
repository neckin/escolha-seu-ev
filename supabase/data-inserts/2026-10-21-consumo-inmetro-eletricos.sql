-- Elétricos passam a usar o consumo oficial do INMETRO, e as fichas seguem a
-- tabela nova onde havia conflito.
--
-- Fontes (gov.br/inmetro, baixadas em 20/10/2026):
--   Tabela PBEV 2026, atualização 14/08/2026 (fonte principal)
--   Tabela PBEV 2025, rev. 24/11/2025: só BMW i4 40 e M50, Neta Aya/X 400/X 500,
--     VW ID.4, Ford Mustang Mach-E GT e Porsche Taycan GTS, que não aparecem na 2026
--   Ficha técnica oficial BYD King 2026: bateria da GS
--   Toyota bZ4X: fora das duas tabelas. Consumo convertido do km/l equivalente do
--     INMETRO publicado na imprensa no lançamento (42,3 cidade / 34,3 estrada)
--
-- O que muda:
--   consumption_kwh_100 de todos os elétricos = "Consumo Energético" PBEV (MJ/km)
--     / 3,6 x 100, o mesmo critério já usado nos plug-ins. Antes era bateria /
--     autonomia, que dava valores ~20-30% mais altos e não comparáveis com os plug-ins.
--   range_km dos elétricos onde o catálogo divergia da tabela (Dolphin, Dolphin Plus,
--     Han, i7, iX2, Blazer EV, Cooper SE, JCW Cooper E, EX40, Zeekr X, Q6 Sportback,
--     i4, Taycan GTS).
--   BYD King: bateria 6,6 -> 18,3 kWh e autonomia combinada 1.175 -> 1.200 km (GS).
--   Kia Carnival: km/l INMETRO (estava fora da primeira leitura da tabela).
--   tech_notes reescritas por inteiro nos carros tocados: sai a frase antiga de
--     consumo "calculado", entra a do INMETRO, e números de notas antigas que
--     contradiziam a tabela foram corrigidos.

begin;

update cars set
  consumption_kwh_100 = 16.9,
  tech_notes = 'Lançado oficialmente pela Audi do Brasil em 2026 (linha 2026), vendido em mais de 40 concessionárias da marca no país. Arquitetura 800V permite recarga DC de até 270kW (10-80% em ~20min). Autonomia de 424km é o valor INMETRO oficial. Porta-malas de 526L + frunk dianteiro de 64L (1.529L com bancos rebatidos). Substituiu a configuração anterior ''Performance Black'' pela S Line. Também existe a versão Sportback (cadastrada separadamente, id audi-q6-sportback-e-tron) e a SQ6 Sportback de alta performance (id audi-sq6-sportback-e-tron). Peso e química da bateria não confirmados em fonte oficial brasileira. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "AUDI | Q6 e-tron Quattro | S line"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 424km.'
where id = 'audi-q6-e-tron';

update cars set
  range_km = 432,
  consumption_kwh_100 = 16.7,
  tech_notes = 'Versão de teto em coupé (Sportback) do Q6 e-tron (cadastrado separadamente, id audi-q6-e-tron), mesma mecânica (428cv/640Nm, bateria 100kWh) — a diferença é a carroceria mais baixa e o porta-malas ligeiramente menor (511L vs 526L, mas autonomia um pouco maior: 431km vs 424km, por aerodinâmica). Lançado junto com o Q6 e-tron na linha 2026 da Audi do Brasil, disponível em mais de 40 concessionárias. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "AUDI | Q6 Sportback e-tron Quattro | S line"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 432km. Autonomia atualizada de 431km para 432km pela tabela do INMETRO.'
where id = 'audi-q6-sportback-e-tron';

update cars set
  consumption_kwh_100 = 16.7,
  tech_notes = 'Versão esportiva de alta performance do Q6 Sportback e-tron, com dois motores (194cv/28kgfm dianteiro + 320cv/59,1kgfm traseiro, 517cv/795Nm combinados em modo Launch Control). 0-100 em 4,3s, velocidade máxima 230km/h eletronicamente limitada. Mesma bateria de 100kWh e arquitetura 800V do Q6 e-tron (recarga DC 10-80% em ~20min). Lançada pela Audi do Brasil em 2026. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "AUDI | SQ6 Sportback e-tron Quattro | -"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 428km. A tabela traz duas linhas do SQ6 Sportback (428km/0,60 MJ/km e 431km/0,61 MJ/km); usada a que bate com os 428km já cadastrados.'
where id = 'audi-sq6-sportback-e-tron';

update cars set
  consumption_kwh_100 = 16.7,
  tech_notes = 'Avatr é a marca de luxo elétrico da Changan, joint venture com a Huawei e a CATL — vendida no Brasil pela CAOA Changan (rede própria, estreou no Salão de SP em nov/2025, já com mais de 20 unidades vendidas). Preço varia pela configuração de bancos: R$599.990 (5 lugares) ou R$619.900 (4 lugares, banco traseiro individual reclinável). Autonomia oficial Inmetro de 497km (710km WLTP). Sistema de condução assistida QianKun (Huawei ADS) com 3 radares a laser. Potência/torque corrigidos em 19/08/2026: fontes de imprensa brasileira (ago/2026) confirmam 585cv/680Nm de forma consistente, valor de marketing um pouco diferente da soma bruta dos dois motores (265cv dianteiro + 313cv traseiro = 578cv/650Nm em bases de dados internacionais) — mantido o valor usado nas fontes brasileiras. Porta-malas (470L) ainda não confirmado diretamente no site oficial da marca no Brasil. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CAOA CHANGAN | AVATR 11 | EV"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 497km.'
where id = 'avatr-11';

update cars set
  range_km = 399,
  consumption_kwh_100 = 16.9,
  tech_notes = 'Gran Coupé elétrico (liftback 4 portas), motor traseiro único de 340cv/430Nm. Preço de tabela oficial de agosto/2026 é R$582.950. Autonomia de 399km pela tabela PBEV 2025 do INMETRO (o i4 não aparece na tabela 2026). Porta-malas de 470L (1.290L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "BMW | i4 | 40"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 399km. Autonomia atualizada de 422km para 399km pela tabela do INMETRO.'
where id = 'bmw-i4';

update cars set
  consumption_kwh_100 = 16.7,
  tech_notes = 'Versão topo de linha e xDrive AWD do i4 (a versão eDrive40 de entrada já está cadastrada separadamente, id bmw-i4), com bimotor entregando 544cv/795Nm (vs 340cv da eDrive40 RWD) e 0-100 em 3,9s, mesmo tempo do BMW M3. Bateria de 81,3kWh, recarga DC ultrarrápida de até 200kW (0-80% em ~30min). Todos os BMW i4 chegam ao Brasil com o programa BMW Service Inclusive gratuito por 4 anos sem limite de km. Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "BMW | i4 | M50"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 405km.'
where id = 'bmw-i4-m50';

update cars set
  range_km = 467,
  consumption_kwh_100 = 18.1,
  tech_notes = 'Sedã executivo elétrico topo de linha da BMW (versão elétrica do Série 7), R$1.373.950 — preço confirmado em vários concessionários oficiais em ago/2026. Bimotor AWD com 544cv/745Nm combinados, bateria de 101,7kWh. Recarga DC de 10-80% em ~34min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | i7 | xDrive60"): 18,1 kWh/100km (0,65 MJ/km), autonomia de 467km. Autonomia atualizada de 512km para 467km pela tabela do INMETRO.'
where id = 'bmw-i7';

update cars set
  consumption_kwh_100 = 16.7,
  tech_notes = 'Trim eDrive20 (FWD, R$359.950, 204cv) catalogado anteriormente saiu de linha — só resta este xDrive30 M Sport (AWD) na página oficial da BMW (bmw.com.br/pt/all-models/bmw-i/ix1/bmw-ix1.html, verificado 21/09/2026). Potência (306cv), aceleração (5,6s 0-100km/h) e autonomia (324km, valor da tabela "Dados Técnicos" — a mesma página também menciona "até 303km" num parágrafo de marketing separado, inconsistência da própria BMW) confirmados direto na página oficial. Torque e capacidade de bateria não são publicados nessa página — deixados em branco em vez de reaproveitar uma estimativa antiga (494Nm/66,5kWh) de uma nota técnica anterior, já que até a potência divergiu entre as duas fontes (313cv vs 306cv agora) — vale reconfirmar com ficha técnica mais completa (PDF oficial, se existir) antes de preencher. Vão livre e porta-malas mantidos do registro anterior (mesma plataforma/corpo), não reconfirmados especificamente para este trim AWD. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX1 | xDrive30"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 324km.'
where id = 'bmw-ix1';

update cars set
  range_km = 327,
  consumption_kwh_100 = 16.4,
  tech_notes = 'Versão elétrica cupê-SUV do X2, voltou a ser vendida oficialmente no Brasil (o iX2 já havia ficado fora de linha por um tempo). Bimotor AWD com 313cv/494Nm combinados. Preço de tabela oficial de agosto/2026 é R$495.950 — fontes de imprensa mais antigas (de 2024/2025) mencionam valores de R$443.950 a R$464.950, defasados pelos reajustes ao longo do período. Porta-malas de 525L (até 1.400L com bancos rebatidos). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX2 | xDrive30 MSP"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 327km. Autonomia atualizada de 337km para 327km pela tabela do INMETRO.'
where id = 'bmw-ix2';

update cars set
  consumption_kwh_100 = 15,
  tech_notes = 'Nova geração do iX3, estreou em pré-venda no Brasil em jul/2026 por R$582.950 — ''nova era'' de plataforma elétrica da marca (arquitetura 800V, células cilíndricas integradas à estrutura). Confirmado em concessionária autorizada (Original BMW) como modelo normal em oferta em ago/2026, já saiu da fase só-pré-venda. Maior autonomia declarada entre elétricos vendidos no país (570km PBEV/Inmetro). Carregamento DC de até 400kW (10-80% em ~21min). É o modelo que a BMW citou como sucessor ao anunciar (mai/2026) a saída de linha do i5 e do iX no Brasil — mas ambos continuam sendo vendidos junto com o iX3 em ago/2026 (ver cards bmw-i5 e bmw-ix). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | iX3 | 50 XDRIVE MSP"): 15,0 kWh/100km (0,54 MJ/km), autonomia de 570km.'
where id = 'bmw-ix3';

update cars set
  range_km = 291,
  consumption_kwh_100 = 11.7,
  tech_notes = 'Autonomia WLTP divulgada é de até 340km; a do INMETRO, usada aqui, é 291km. Bateria Blade LFP, mesma tecnologia usada em toda a linha BYD, com estrutura que dispensa módulos intermediários. 5 estrelas no Latin NCAP. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | GS 180EV"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 291km. Autonomia atualizada de 320km para 291km pela tabela do INMETRO.'
where id = 'byd-dolphin';

update cars set
  consumption_kwh_100 = 10.8,
  tech_notes = 'O elétrico mais vendido do Brasil. Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026). Duas versões, GL (entrada, ficha usada aqui) e GS (cadastrada separadamente) — a diferença de preço é de só R$1.000, mas a GS tem bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais equipamento (carregador de celular por indução, acabamento do volante, luzes de cortesia, vidro do motorista one-touch/antiesmagamento). Airbags: só frontais + cortina na GL (a GS ganha também os laterais dianteiros). Uso comercial reduz a garantia do veículo pra 6 anos/100.000km. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GL 5 EV"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 224km.'
where id = 'byd-dolphin-mini-gl';

update cars set
  consumption_kwh_100 = 11.4,
  tech_notes = 'Versão mais completa do Dolphin Mini (o elétrico mais vendido do Brasil), só R$1.000 mais cara que a GL (cadastrada separadamente), mas com bateria maior (38,9kWh vs 30,1kWh), mais autonomia (280 vs 224km) e mais 2 airbags (laterais dianteiros — a GL só tem frontais + cortina). Ficha conferida na ficha técnica oficial BYD (rev. 09/07/2026). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN MINI | GS 5 EV"): 11,4 kWh/100km (0,41 MJ/km), autonomia de 280km.'
where id = 'byd-dolphin-mini-gs';

update cars set
  range_km = 330,
  consumption_kwh_100 = 14.2,
  tech_notes = 'Versão de maior autonomia da linha Dolphin, com bateria maior (60,5kWh) que a versão padrão. Fontes de preço variam entre R$168.800 e R$178.800 conforme configuração. DC de 60kW carrega de 20% a 80% em ~45min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | PLUS 310EV"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 330km. Autonomia atualizada de 420km para 330km pela tabela do INMETRO.'
where id = 'byd-dolphin-plus';

update cars set
  consumption_kwh_100 = 13.6,
  tech_notes = 'Plataforma e-Platform 3.0 da BYD, com a bateria Blade — LFP com formato estrutural que dispensa módulos intermediários, referência de segurança térmica no setor. Autonomia oficial PBEV (272 km) é mais conservadora que o padrão NEDC usado por parte da imprensa. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | DOLPHIN | SE 290EV"): 13,6 kWh/100km (0,49 MJ/km), autonomia de 272km.'
where id = 'dolphinse';

update cars set
  range_km = 349,
  consumption_kwh_100 = 19.2,
  tech_notes = 'Preço real de tabela é R$559.800 — bem acima dos R$429.800 que circulavam antes. Autonomia INMETRO de 349km (450-500km em ciclo combinado/WLTP); recarga rápida de 30% a 80% em ~25min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | HAN | AWD GS 680EV"): 19,2 kWh/100km (0,69 MJ/km), autonomia de 349km. Autonomia atualizada de 480km para 349km pela tabela do INMETRO.'
where id = 'byd-han-ev';

update cars set
  consumption_kwh_100 = 17.2,
  tech_notes = 'Preço varia entre fontes de R$269.800 a R$296.800 conforme a versão/momento. Existe também a versão Performance AWD, mais potente e cara, com 0-100 em 3,8s. Autonomia real PBEV/Inmetro de 372km é bem mais conservadora que os 570km que circulavam antes (provavelmente CLTC chinês). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SEAL | AWD GS 590EV"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 372km.'
where id = 'byd-seal';

update cars set
  consumption_kwh_100 = 18.3,
  tech_notes = 'SUV cupê elétrico irmão do Seal, com tração integral AWD (531cv/690Nm) e 0-100km/h em 4,5s — um dos mais potentes e rápidos do comparativo inteiro. Bateria Blade LFP de 82,5kWh garante 360km de autonomia Inmetro. Porta-malas de 500L + frunk dianteiro de 58L. Recarga DC até 150kW (30-80% em ~30min). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SEALION 7 | GS 690EV"): 18,3 kWh/100km (0,66 MJ/km), autonomia de 360km.'
where id = 'byd-sealion-7';

update cars set
  consumption_kwh_100 = 20.3,
  tech_notes = 'SUV elétrico premium de 7 lugares, tração integral 4x4, 517cv e 700Nm, acelera de 0-100km/h em menos de 5s. Bateria Blade LFP gigante de 108,8kWh rende até 430km Inmetro (530km no ciclo WLTP, mais otimista). Porta-malas varia de 235L (7 lugares) a 940L (5 lugares) e 1.655L com os bancos rebatidos. Recarga DC de 30-80% em ~30min a 110kW. Preço confirmado em R$536.800 (fonte que antes divergia entre R$529.890 e R$536.800 já se consolidou nesse valor). Aceleração, peso, vão livre e airbags ainda sem fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | TAN | AWD GS 700EV"): 20,3 kWh/100km (0,73 MJ/km), autonomia de 430km.'
where id = 'byd-tan';

update cars set
  consumption_kwh_100 = 16.1,
  tech_notes = 'Correção em 19/08/2026: a BYD renovou o Yuan Plus pra linha 2027, abandonando o motor único dianteiro (204cv/310Nm, R$229.800) em favor de bimotor AWD com 449cv/560Nm — a versão FWD antiga não é mais vendida. Bateria também cresceu (74,88kWh vs 60,5kWh), com carregamento DC de até 205kW e AC de 11kW, ausentes na versão anterior. Autonomia PBEV/Inmetro oficial (site BYD) é 378km — bem mais conservadora que os 530km citados por parte da imprensa (provavelmente ciclo NEDC). Porta-malas cresceu de 312L pra 490L + frunk de 101L. Conhecido internacionalmente como BYD Atto 3. Peso não confirmado pra essa nova versão. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | YUAN PLUS | GS 560EV"): 16,1 kWh/100km (0,58 MJ/km), autonomia de 378km.'
where id = 'byd-yuan-plus';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'CORRIGIDO (18/08/2026): o Yuan Pro vendido oficialmente no Brasil é 100% ELÉTRICO (BEV), não híbrido plug-in como estava cadastrado antes — o ficha anterior descrevia a versão DM-i (PHEV) que existe em outros mercados (China, Argentina) mas ainda não tem lançamento confirmado no Brasil. Versão única (GS), R$182.990. Torque, vão livre, peso e airbags ainda sem fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | YUAN PRO | GS 290EV"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 250km.'
where id = 'byd-yuan-pro';

update cars set
  range_km = 481,
  consumption_kwh_100 = 17.5,
  tech_notes = 'SUV elétrico esportivo da plataforma Ultium (mesma base do Equinox EV), vendido no Brasil só na versão RS (motor único traseiro, 347cv/450Nm). Preço subiu de R$479.000 no lançamento (2024) para R$503.190 atualmente. Autonomia INMETRO de 481km (tabela PBEV 2026); os 526km de outra fonte são de outro ciclo de medição. Pente-fino 19/08/2026: a versão AWD (bimotor, 305cv/~480Nm, bateria menor de 85kWh, menos autonomia) é uma opção ADICIONAL para 2026, não substitui a RWD atual — segue sem preço oficial publicado, então não foi cadastrada como card separado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | BLAZER EV | RS"): 17,5 kWh/100km (0,63 MJ/km), autonomia de 481km. Autonomia atualizada de 526km para 481km pela tabela do INMETRO.'
where id = 'chevrolet-blazer-ev';

update cars set
  consumption_kwh_100 = 17.2,
  tech_notes = 'SUV elétrico familiar de produção nacional (Polo Automotivo do Ceará, junto com o Spark EUV), vendido só na versão Premier. Bateria LFP de 60kWh, motor único dianteiro de 201cv/310Nm. Preço oficial de lançamento é R$199.990 — algumas fontes mais recentes citam R$219.990, possivelmente um reajuste ainda não confirmado em múltiplas fontes. DC de até 120kW (30-80% em ~30min). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | CAPTIVA EV | PR"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 304km.'
where id = 'chevrolet-captiva-ev';

update cars set
  consumption_kwh_100 = 15.6,
  tech_notes = 'Preço real de tabela é ~R$419.000 — bem acima do valor de R$299.990 que circulava antes. Bateria NCMA (evolução da química NMC, com menos cobalto) de 85 kWh, a maior do grupo, com motor biMotor AWD de 2x146cv somando 292cv e 451Nm. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | EQUINOX EV | -"): 15,6 kWh/100km (0,56 MJ/km), autonomia de 443km.'
where id = 'chevrolet-equinox-ev';

update cars set
  consumption_kwh_100 = 13.9,
  tech_notes = 'Mini SUV elétrico de entrada da Chevrolet no Brasil, com motor único dianteiro de 102cv/180Nm e bateria de 41,9kWh. Porta-malas de 355L (916L com bancos rebatidos). Carregador de parede (wall charger) de 7kW leva de 20% a 100% em ~7h; carregamento DC não confirmado em fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "CHEVROLET | SPARK EUV | ACTIV"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 258km.'
where id = 'chevrolet-spark-euv';

update cars set
  consumption_kwh_100 = 12.8,
  tech_notes = 'Versão de entrada é a Action (R$219.990) — a Icon custa mais. Autonomia WLTP divulgada é 320 km; a do INMETRO, usada aqui, é 227 km. DC de 85 kW carrega de 0-80% em ~35 min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "FIAT | 500E | ICON"): 12,8 kWh/100km (0,46 MJ/km), autonomia de 227km.'
where id = 'fiat-500e';

update cars set
  consumption_kwh_100 = 19.2,
  tech_notes = 'Única marca tradicional grande (não chinesa) além da BMW/Volvo/Chevrolet a vender elétrico oficialmente no Brasil hoje, via CAOA Ford (rede própria de concessionárias). Vendido em versão única, GT Performance (487cv/860Nm, bimotor e-AWD), a R$449.000 — preço reduzido em R$37 mil no início de 2026 (era ~R$486.000) por causa do baixo giro. Ficha técnica oficial do site Ford Brasil mostra dois valores de autonomia na mesma página: 379km (citado no texto, condizente com o padrão INMETRO/PBEV usado nos demais carros desta base) e 541km na tabela de specs (provavelmente WLTP) — usamos o menor por consistência com o resto da base. Porta-malas de 402L traseiro + frunk dianteiro de 139L (~541L total). Ford Territory PHEV (chinês, rebatizado, ~218cv) e Ranger PHEV ainda não têm venda oficial confirmada no Brasil — previstas para fim de 2026/2027, por isso não entraram na base. Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "FORD | Mustang Mach-E | GT"): 19,2 kWh/100km (0,69 MJ/km), autonomia de 379km.'
where id = 'ford-mustang-mach-e';

update cars set
  consumption_kwh_100 = 12.5,
  tech_notes = 'Versão única (Plus) no Brasil, confirmada em múltiplas fontes — nome atualizado (antes só ''GAC Aion ES'', na verdade é a versão Plus). Recarga DC de 75kW leva a bateria de 30% a 80% em ~37min. Uma fonte lista airbags só frontais (sem laterais/cortina) — se confirmar, é o único Aion vendido no Brasil sem airbag lateral/cortina; vale checar na concessionária antes de decidir. Química da bateria, peso, vão livre e garantia ainda sem fonte confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION ES | PLUS"): 12,5 kWh/100km (0,45 MJ/km), autonomia de 314km.'
where id = 'gac-aion-es';

update cars set
  consumption_kwh_100 = 15.8,
  tech_notes = 'Plataforma AEP 3.0 da GAC, com o motor de 204 cv mais forte do grupo e 0-100 em 7,3s. Bateria LFP de 60 kWh é a maior capacidade da comparação. Vão livre de 150 mm confirmado na concessionária. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION UT | ELITE"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 310km.'
where id = 'aionut';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Versão de entrada do Aion UT no Brasil (a Elite já está cadastrada separadamente, id ''aionut''), com bateria menor (44,12kWh vs 60kWh) e carregamento DC mais lento (64kW vs 87kW), resultando em autonomia de 253km vs 310km e aceleração mais lenta (8,6s vs 7,3s). Potência/torque do motor assumidos iguais aos da Elite (204cv/210Nm) — fontes brasileiras não indicam motor diferente entre as versões, só bateria e equipamentos (a Elite tem ADAS nível 2 e teto panorâmico que a Premium não tem). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION UT | PREMIUM"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 253km.'
where id = 'gac-aion-ut-premium';

update cars set
  consumption_kwh_100 = 15,
  tech_notes = 'Versão única (Elite) no Brasil — confirmado em múltiplas fontes, diferente do Aion Y (que tem Premium e Elite). Bateria LFP confirmada. Recarga ultrarrápida: 30-80% em ~16min a 180kW DC, das mais rápidas do segmento. Peso, vão livre, airbags e garantia ainda sem fonte confiável — não adivinhados aqui. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION V | ELITE"): 15,0 kWh/100km (0,54 MJ/km), autonomia de 389km.'
where id = 'gac-aion-v';

update cars set
  consumption_kwh_100 = 15.8,
  tech_notes = 'Mesma motorização e bateria da Premium (cadastrada separadamente), mas custa R$ 12.000 a mais — contraintuitivo pro nome ''Elite''. Diferença real: rodas de 18" (vs. 17" da Premium) e ADAS bem mais simples (só alerta de colisão frontal, sem os assistentes de condução da Premium). Vale comparar as duas com calma antes de escolher. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION Y | ELITE"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 318km.'
where id = 'gac-aion-y-elite';

update cars set
  consumption_kwh_100 = 15.8,
  tech_notes = 'Também comercializado como minivan/SUV familiar. Apesar do nome, é a versão com MAIS equipamento de segurança: pacote completo de ADAS (assistente de congestionamento, permanência em faixa, mudança de faixa, frenagem autônoma de emergência, piloto adaptativo), rodas de 17". A versão Elite (cadastrada separadamente) custa mais caro mas tem ADAS básico (só alerta de colisão frontal) e rodas de 18" — confira as duas antes de decidir, o nome não indica qual é ''melhor''. Bateria LFP confirmada no site oficial GAC Brasil. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | AION Y | PREMIUM"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 318km.'
where id = 'gac-aion-y';

update cars set
  consumption_kwh_100 = 14.7,
  tech_notes = 'SUV cupê elétrico da Hyptec, submarca premium da GAC. Linha 2027 lançada em 2026 com bateria ampliada (83kWh, arquitetura 800V) e mais potência (340cv/430Nm) que a geração anterior (245cv/72,7kWh). Duas versões: Elite (R$314.990 — ficha usada aqui) e Ultra (R$369.990, com portas traseiras de abertura vertical). Recarga DC de 30-80% em ~15min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GAC | HYPTEC HT | ELITE"): 14,7 kWh/100km (0,53 MJ/km), autonomia de 431km.'
where id = 'gac-hyptec-ht';

update cars set
  consumption_kwh_100 = 10.8,
  tech_notes = 'Um dos poucos elétricos do segmento com motor traseiro e tração RWD — arquitetura incomum nessa faixa de preço. Bateria LFP de 39 kWh prioriza durabilidade e custo sobre densidade energética, resultando na menor autonomia do grupo. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GEELY | EX2 | MAX"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 289km.'
where id = 'ex2max';

update cars set
  consumption_kwh_100 = 10.8,
  tech_notes = 'Compartilha com o EX2 Max a mesma plataforma, o motor traseiro (RWD) e a bateria LFP de 39,4 kWh — a versão Pro é a entrada de linha, com potência, torque e autonomia idênticos, mas com pacote de ADAS e itens de conforto reduzidos. Tração traseira é incomum nessa faixa de preço. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GEELY | EX2 | PRO"): 10,8 kWh/100km (0,39 MJ/km), autonomia de 289km.'
where id = 'geely-ex2-pro';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Ficha técnica oficial Geely conferida (ago/2026). Mesmo motor/bateria da Pro (cadastrada separadamente), mas autonomia menor (349km vs 413km) por causa do peso extra (1.765kg vs 1.715kg) — mais equipamento: teto solar panorâmico, porta-malas elétrico, rodas 19" (vs 18" da Pro), bancos com massagem/ventilação, pacote ADAS completo (a Pro não tem ACC, LKA, AEB e outros assistentes — só a Max tem). Porta-malas 461L (1.877L com banco rebatido). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 | MAX"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 349km.'
where id = 'geely-ex5-max';

update cars set
  consumption_kwh_100 = 11.7,
  tech_notes = 'Ficha técnica oficial Geely conferida (ago/2026). Versão de entrada da linha EX5 — autonomia de 413km, a maior das duas versões elétricas (a Max, cadastrada separadamente, sacrifica autonomia por mais equipamento). Porta-malas 461L (1.877L com banco rebatido). Airbags: 2 frontais + 2 cortina dianteiros + 2 cortina traseiros (sem laterais de tórax). Existe também a versão híbrida plug-in EX5 EM-i, cadastrada separadamente (id geely-ex5-em-i) por ser outro powertrain (fuelType PHEV em vez de BEV). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Geely | EX5 | PRO"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 413km.'
where id = 'geely-ex5';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Correção em 19/08/2026: a GWM descontinuou as versões Skin BEV48 e GT BEV63 e unificou a linha Ora 03 num único trim, o BEV58 (bateria de 58kWh) — algumas unidades das versões antigas ainda podem estar em estoque em concessionárias, mas não são mais o catálogo oficial. O BEV58 herdou detalhes visuais que eram exclusivos da GT (pinças de freio pintadas, cores exclusivas), já representando ~80% das vendas da linha antes da unificação. Ficha técnica do catálogo oficial (ano-modelo 26/27): 171cv/250Nm, 0-100 em 9,0s, 315km de autonomia Inmetro (420km WLTP), entre-eixos de 2,65m, 7 airbags, porta-malas de 228L (858L com banco traseiro rebatido) + frunk dianteiro. Recarga AC em ~5h30 (15-100%) e DC em ~42min (30-80%) — potência exata em kW não confirmada em fonte oficial. Garantia e wallbox incluso não confirmados em fonte disponível. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | ORA 03 | BEV58"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 315km.'
where id = 'gwm-ora-03-bev58';

update cars set
  consumption_kwh_100 = 13.6,
  tech_notes = 'Plataforma Lemon da GWM. Maior vão livre (175 mm) e únicos ângulos de entrada/saída divulgados oficialmente (17°/25°) do grupo — vantagem real para quem enfrenta rampas ou terreno irregular. Único com estepe temporário de fábrica ao lado do Aion UT. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "GWM | ORA | 5"): 13,6 kWh/100km (0,49 MJ/km), autonomia de 349km.'
where id = 'ora5';

update cars set
  consumption_kwh_100 = 18.3,
  tech_notes = 'Preço de lançamento (Signature) é R$394.990 — acima do valor de R$339.990 que circulava antes (havia descontos pontuais de estoque parado até R$294.990, mas não é preço de tabela). Autonomia oficial PBEV/INMETRO é 374 km, bem abaixo do WLTP de 480 km. DC de até 350 kW carrega de 10-80% em ~18 min. Wallbox residencial WEG 7,68kW incluso, com 1 ano de cobertura. Checado em 19/08/2026: vendas muito baixas no Brasil (87 unidades emplacadas desde set/2024) levaram a promoções pontuais de até R$100 mil de desconto em estoque parado (encerradas em fev/2026, não são o preço de tabela atual). A parceria de fabricação entre a CAOA e a Hyundai também terminou em 2025 (após 26 anos), mas a Hyundai passou a poder importar modelos diretamente — o Ioniq 5 segue ativo no site oficial e em concessionárias em ago/2026, não há indício de descontinuação real apesar de rumores nesse sentido. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "Hyundai | IONIQ 5 | Platinum"): 18,3 kWh/100km (0,66 MJ/km), autonomia de 374km.'
where id = 'hyundai-ioniq-5';

update cars set
  consumption_kwh_100 = 13.9,
  tech_notes = 'Um dos elétricos mais baratos do Brasil, com bateria LFP de 31,4 kWh e a menor autonomia INMETRO do grupo (181 km) — reflexo do foco em uso urbano de curta distância. Apenas 2 airbags (motorista e passageiro), abaixo do padrão de 6 já comum em concorrentes chineses mais recentes. Atenção (checado em 19/08/2026): a JAC descontinuou os outros dois elétricos de passeio da linha (E-JS4 e E-J7, removidos deste app) e está reposicionando a marca no Brasil quase inteiramente para picapes — reduziu de 46+ concessionárias físicas pra só 3 (São Paulo, Curitiba, Porto Alegre). O E-JS1 segue sendo vendido (ano-modelo 2027 confirmado), mas o comunicado oficial da marca sobre a nova estratégia não mencionou ele, deixando o futuro do modelo incerto — vale considerar isso antes de comprar. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JAC | e-JS1 | e-JS1"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 181km.'
where id = 'jac-e-js1';

update cars set
  consumption_kwh_100 = 15.3,
  tech_notes = 'Autonomia WLTP divulgada é 361km, mas a homologação Inmetro/PBEV real é 288km. Preço de tabela varia por público: R$182.990 padrão, com descontos pra troca de usado (R$175.990), taxista (R$141.190), PCD (R$161.390) e CNPJ (R$168.290). Será fabricado no Brasil em fábrica da Stellantis. Recarga rápida recupera 50% em ~15min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | B10 | LIFE"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 288km.'
where id = 'leapmotor-b10';

update cars set
  consumption_kwh_100 = 16.9,
  tech_notes = 'Existe também a versão REEV (com extensor de autonomia a combustão), cadastrada separadamente (id leapmotor-c10-reev) por ser um powertrain diferente (fuelType PHEV em vez de BEV). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEAPMOTOR | C10 | Design"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 338km.'
where id = 'leapmotor-c10';

update cars set
  consumption_kwh_100 = 15.8,
  tech_notes = 'Primeiro elétrico 100% da Lexus no Brasil, lançado oficialmente em 15/05/2026 (o modelo global se chama RZ 450e, mas a versão vendida no Brasil é nomeada RZ 500e). Bateria de 77kWh com resfriamento líquido. Autonomia Inmetro de 357km corrigida em pente-fino 19/08/2026 (valor anterior de 375km estava errado — 357km é o número consistente em múltiplas fontes do lançamento oficial de mai/2026; uma fonte antiga citava até 600km em ciclo urbano WLTP europeu, bem mais otimista e não usado aqui). Tração integral DIRECT4 com motor em cada eixo (264Nm cada, torque total do sistema não divulgado). Recarga DC até 150kW (0-80% em ~30min). Financiamento com taxa a partir de 0% e recompra garantida de 80% da tabela FIPE fazem parte do programa de lançamento. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | RZ | 500e"): 15,8 kWh/100km (0,57 MJ/km), autonomia de 357km.'
where id = 'lexus-rz-500e';

update cars set
  consumption_kwh_100 = 15.6,
  tech_notes = 'Roadster esportivo com portas de abertura tipo tesoura. Recarga DC de 150kW leva de 10% a 80% em ~38min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | CYBERSTER | 77 KWH AWD"): 15,6 kWh/100km (0,56 MJ/km), autonomia de 342km.'
where id = 'mg-cyberster';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Duas versões: Comfort (R$195.800, reajustada pra R$218.800 a partir de 5/jan/2026 — ficha usada aqui, com 6 airbags) e Luxury (R$219.800, R$238.800 após 5/jan/2026, ganha 7º airbag central, teto solar e mais equipamento). Construído sobre a Plataforma Modular Escalável (MSP) da MG, 5 estrelas no Euro NCAP 2025. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | S5 | EV 62KWH LUX"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 351km.'
where id = 'mg-s5';

update cars set
  consumption_kwh_100 = 13.9,
  tech_notes = 'Versão de entrada da linha MG4 (distinta da ''MG4 Urban Luxury 54 kWh'' já cadastrada separadamente, um modelo menor e mais barato). Existem também Luxury RWD 64kWh (mesma potência/bateria, mais equipamento) e XPower AWD 64kWh (320kW/435cv, 0-100 em 3,8s, R$249.000). Autonomia 364km é a homologada Inmetro/PBEV (a WLTP divulgada pela MG é 467km, mas superestima o uso real no Brasil). Ficha conferida na ficha técnica oficial MG (ago/2026). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | MG4 | 64 KWH COM"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 364km.'
where id = 'mg-mg4';

update cars set
  consumption_kwh_100 = 11.7,
  tech_notes = 'Construído sobre a plataforma MSP (Modular Scalable Platform), a mesma usada na Europa — o que dá respaldo real ao resultado de 5 estrelas do MG4 Electric no Euro NCAP. Química LFP confirmada diretamente na concessionária, após divergência entre fontes públicas. Specs conferidas na ficha técnica oficial MG (ago/2026): porta-malas 568L e altura livre do solo 117mm (valor único de fábrica, igual em todas as versões do MG4 Urban). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MG | MG4 | URB EV54KWH LUX"): 11,7 kWh/100km (0,42 MJ/km), autonomia de 358km.'
where id = 'mg4urban';

update cars set
  consumption_kwh_100 = 12.8,
  tech_notes = 'Primeiro modelo da MINI projetado desde o início pra ser 100% elétrico, posicionado entre o hatch Cooper e o SUV Countryman. Versão de entrada (E), com bateria de 42,5kWh e 253km de autonomia (Inmetro) — dados confirmados via press release oficial do BMW Group Brasil. Porta-malas de 300L (1.005L com bancos rebatidos). A versão SE (mais potente) está cadastrada separadamente (id mini-aceman-se). Recarga DC 10-80% em ~28min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Aceman | E"): 12,8 kWh/100km (0,46 MJ/km), autonomia de 253km.'
where id = 'mini-aceman-e';

update cars set
  consumption_kwh_100 = 14.4,
  tech_notes = 'Versão topo de linha do Aceman, com bateria maior (54,2kWh vs 42,5kWh da E) e mais potência (218cv vs 184cv), resultando em mais autonomia (270km vs 253km, Inmetro) e aceleração mais rápida (7,1s vs 7,6s). Porta-malas de 300L (1.005L com bancos rebatidos). Recarga DC 10-80% em ~31min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Aceman | SE"): 14,4 kWh/100km (0,52 MJ/km), autonomia de 270km.'
where id = 'mini-aceman-se';

update cars set
  range_km = 312,
  consumption_kwh_100 = 13.3,
  tech_notes = 'Um dos modelos mais consistentes entre as fontes pesquisadas — poucas divergências. Porta-malas de 210L (800L com bancos rebatidos). O pacote MINI Service Inclusive (4 anos, km ilimitado) inclui um MINI Wallbox Essential 11kW de cortesia. Carga AC completa em ~5h15. Checagem em 19/08/2026: existe também um MINI Cooper E de entrada (184cv/290Nm, sem o ''S'', menos potente que este SE), confirmado pelo BMW Group Brasil como parte da linha, mas não cadastrado aqui por falta de preço confiável e consistente entre fontes (achamos valores de R$264.990 a R$314.990 pra ele, sem confirmação clara de qual é o atual). O preço deste card (Cooper SE, R$259.990) tem fontes recentes conflitantes também (algumas citam R$264.990 ou até R$310.990+), mas nenhuma o suficientemente clara/recorrente pra justificar mudar o valor já verificado — vale reconferir na concessionária antes de decidir. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Cooper | SE"): 13,3 kWh/100km (0,48 MJ/km), autonomia de 312km. Autonomia atualizada de 303km para 312km pela tabela do INMETRO.'
where id = 'mini-cooper-se';

update cars set
  consumption_kwh_100 = 16.9,
  tech_notes = 'SUV elétrico da MINI, compartilha plataforma com o BMW iX1/iX2. Versões Exclusive (R$294.990) e Top (R$339.990) têm a mesma mecânica (306cv/494Nm/66,45kWh) — só rodas e equipamentos mudam, por isso um card único. Preço oficial atual (site MINI Brasil, ago/2026) é R$409.990, bem acima dos valores de lançamento. Porta-malas de 450L (1.390L com bancos rebatidos). Recarga DC de até 130kW (10-80% em ~30min). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | Countryman | SE TOP"): 16,9 kWh/100km (0,61 MJ/km), autonomia de 320km.'
where id = 'mini-countryman-se-all4';

update cars set
  consumption_kwh_100 = 13.9,
  tech_notes = 'Versão de alta performance do Aceman (a E de entrada, 184cv, e a SE, 218cv, já estão cadastradas separadamente, ids mini-aceman-e e mini-aceman-se), com mais potência ainda (258cv/340Nm) e ajustes esportivos JCW. Autonomia de 312km (Inmetro/PBEV) — a maior entre os elétricos MINI hatch/SUV compacto. Capacidade de bateria não confirmada com segurança (fontes divergem e uma delas parece ter confundido com a ficha da Aceman E comum) — por isso não incluída. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | JCW-E | ACEMAN"): 13,9 kWh/100km (0,50 MJ/km), autonomia de 312km.'
where id = 'mini-jcw-aceman-e';

update cars set
  range_km = 306,
  consumption_kwh_100 = 13.3,
  tech_notes = 'Primeira vez que a linha JCW (John Cooper Works) é oferecida completa e 100% elétrica no Brasil (chegou junto com o JCW Aceman E, cadastrado separadamente, id mini-jcw-aceman-e). Versão de alta performance do Cooper SE (já cadastrado, id mini-cooper-se), com mais potência (258cv/340Nm vs 218cv/330Nm) e ajustes esportivos de suspensão/freios/visual. Autonomia de 306km (Inmetro/PBEV 2026). Capacidade de bateria não confirmada com segurança — fontes divergem entre reaproveitar o valor do Cooper SE (54,2kWh) e não informar; por isso não incluída. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "MINI | JCW-E | 3P"): 13,3 kWh/100km (0,48 MJ/km), autonomia de 306km. Autonomia atualizada de 299km para 306km pela tabela do INMETRO.'
where id = 'mini-jcw-cooper-e';

update cars set
  consumption_kwh_100 = 11.9,
  tech_notes = 'Preço de tabela varia por versão: Comfort ~R$128.900, Luxury foi reajustada pra R$149.900 em jan/2026 (era R$134.900 no lançamento). Autonomia oficial PBEV/INMETRO de 263 km (a WLTP é 338 km). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "NETA | AYA | LUXURY 4S"): 11,9 kWh/100km (0,43 MJ/km), autonomia de 263km.'
where id = 'neta-aya';

update cars set
  consumption_kwh_100 = 14.7,
  tech_notes = 'Baterias fabricadas pela CATL (química LFP). Carregamento AC completo em ~9h; DC de 30% a 80% em ~30min. Versão de entrada da linha Neta X, que segue com 3 versões ativas no Brasil (400/500/500 Luxury) — confirmado em pente-fino 19/08/2026. Torque de 210Nm e tração dianteira (FWD) preenchidos nessa revisão (mesmo motor em todas as versões da linha X). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "NETA | X | 400 COMFORT"): 14,7 kWh/100km (0,53 MJ/km), autonomia de 258km.'
where id = 'neta-x-400';

update cars set
  consumption_kwh_100 = 15.3,
  tech_notes = 'Baterias fabricadas pela CATL (química LFP). Carregamento AC completo em ~11h; DC de 30% a 80% em ~30min. Existe também a versão 500 Luxury, com peso e bateria equivalentes. Torque de 210Nm e tração dianteira (FWD) preenchidos em pente-fino 19/08/2026 (mesmo motor em todas as versões da linha X, confirmado em múltiplas fontes). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "NETA | X | 500 LUXURY"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 317km.'
where id = 'neta-x-500';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Derivado do modelo híbrido Omoda 5. Recarga DC de 80kW leva de 30% a 80% em ~30min. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "OMODA | E5 | --"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 345km.'
where id = 'omoda-e5';

update cars set
  consumption_kwh_100 = 16.7,
  tech_notes = 'Comercializado no Brasil desde novembro/2024, versão de entrada RWD (base ''Macan Electric'') da linha 100% elétrica. Bateria de 100kWh (95kWh úteis), arquitetura 800V com DC de até 270kW (10-80% em ~21min). Também existem as versões 4 Electric (R$580mil, 408cv overboost), 4S Electric (R$630mil, 516cv, 0-100 em 4,1s) e Turbo Electric (R$770mil, 639cv, 0-100 em 3,3s) — mesma bateria/porta-malas/garantia, mudando motor e tração (AWD nas versões 4/4S/Turbo); não cadastradas individualmente por já estarem bem representadas pela entrada e por não termos certeza sobre qual delas seguiu efetivamente à venda vs. só pré-venda da GTS (lançada em 2026, R$800mil, ainda não confirmada como entregue). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "PORSCHE | MACAN | E4"): 16,7 kWh/100km (0,60 MJ/km), autonomia de 443km. A versão de entrada RWD não aparece separada na tabela PBEV 2026; usada a linha do Macan 4 Electric ("E4"), a de menor consumo e a mesma dos 443km já cadastrados.'
where id = 'porsche-macan-electric';

update cars set
  range_km = 428,
  consumption_kwh_100 = 18.6,
  tech_notes = 'Trim base RWD (R$893.115, 408cv) catalogado anteriormente não existe mais no configurador oficial (models.porsche.com/pt-BR/model-start/taycan, verificado 21/09/2026) — grade sedã atual é só GTS (R$1.110.000), Turbo S (R$1.580.000) e Turbo GT Pacote Weissach (R$1.690.000). Recadastrado como GTS por ser o mais barato disponível agora. Potência (700cv/515kW), torque máximo (790Nm), aceleração (3,3s 0-100km/h com Launch Control) e tração integral (motor elétrico nos eixos dianteiro e traseiro) confirmados direto na página oficial do modelo. Recarga DC de até 320kW (10-80% em 18min) e garantia de bateria de alta tensão (8 anos/160.000km) também confirmadas na mesma página. Capacidade de bateria em kWh e autonomia em km não aparecem em nenhuma página oficial consultada (a página só descreve a bateria como "Performance Plus, 33 módulos, tecnologia 800V", sem número de kWh) — deixadas em branco em vez de reaproveitar os 89kWh/453km do trim base (motor e bateria são diferentes: dual-motor GTS vs. RWD single-motor base). Vão livre e porta-malas mantidos do registro anterior (mesmo corpo sedã Taycan), não reconfirmados especificamente para o GTS. Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "PORSCHE | TAYCAN | 4GTS"): 18,6 kWh/100km (0,67 MJ/km), autonomia de 428km. Autonomia atualizada de —km para 428km pela tabela do INMETRO.'
where id = 'porsche-taycan';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Hatch elétrico premium da Renault, com vendas bem baixas no Brasil (32 unidades emplacadas de jan-set/2025). Preço de tabela oficial é R$279.990, mas há descontos agressivos em concessionárias (achado por R$225.990 a R$199.900 em promoções pontuais) por conta do baixo giro de estoque. Recarga DC de 130kW (15-80% em ~36min) e AC de 22kW (carga completa em ~1h50). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "RENAULT | MÉGANE | E-TECH"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 337km.'
where id = 'renault-megane-e-tech';

update cars set
  consumption_kwh_100 = 14.7,
  tech_notes = 'SUV 100% elétrico da Toyota — não é híbrido, entra no catálogo por completar a lacuna que o usuário apontou (linha Toyota inteira: Yaris Cross Hybrid, Corolla Hybrid, Corolla Cross Hybrid e bZ4X). Ficha oficial (catálogo PDF Toyota "bZ4X MY26", baixado em 11/09/2026): motor dianteiro 227cv/27,4kgf.m + motor traseiro 120cv/17,3kgf.m, potência total 343cv (publicada explicitamente pela Toyota). Torque registrado aqui é só do motor dianteiro (269Nm) — a Toyota não soma os dois torques numa ficha única. Bateria 73,1kWh, autonomia 361km Inmetro. Carregamento AC 22kW / DC 150kW. Vão livre e peso confirmados; airbags e garantia de bateria não encontrados nesta ficha específica. Consumo de 14,7 kWh/100km convertido do consumo equivalente que o INMETRO atribuiu ao bZ4X (42,3 km/l na cidade e 34,3 km/l na estrada, classe A, conforme matéria da Auto+ TV no lançamento em jun/2026). O modelo ainda não aparece nas tabelas PBEV 2025 e 2026; a conversão usa a mesma relação entre km/l equivalente e MJ/km que reproduz, com diferença de até 0,01 MJ/km, 180 dos 186 elétricos da tabela 2026.'
where id = 'toyota-bz4x';

update cars set
  consumption_kwh_100 = 17.5,
  tech_notes = 'PRIMEIRO carro Volkswagen no catálogo — a marca não tinha nenhum modelo eletrificado cadastrado até 14/09/2026. Confirmado à venda de forma convencional (não é mais só assinatura Sign&Drive, como era em 2023): site oficial vw.com.br já tem "Monte o Seu" funcionando pro ID.4, ano-modelo 2027, versão única Pro. Ficha oficial (página do modelo, capturada em 14/09/2026): motor elétrico de 210kW entrega 286cv e 545Nm de torque, bateria de 84kWh, autonomia de 389km (INMETRO), recarga DC até 185kW / AC até 11kW, porta-malas de 533 litros, entre-eixos de 2.771mm — todos esses números confirmados direto no texto da página oficial. Comprimento (4.584mm), largura (1.852mm), altura (1.634mm), aceleração 0-100km/h (6,7s) e velocidade máxima (180km/h) vêm de múltiplas fontes de imprensa consistentes entre si (incluindo a cifra de torque em kgfm — 55,6kgfm bate exatamente com os 545Nm — o que dá confiança), mas não foram encontrados literalmente escritos na página oficial. ATENÇÃO: não encontrei o número de airbags na própria página oficial da VW — agregadores de terceiros citam 7, mas como isso NÃO está confirmado em fonte primária, deixei o campo em branco em vez de repetir um número não verificado (mesmo cuidado do caso Kicks). Química da bateria e peso não encontrados em nenhuma fonte oficial até 14/09/2026. NOTA: a Volkswagen também vende o ID.Buzz (Kombi elétrica) no Brasil, mas só por assinatura (Sign&Drive, 24-36 meses) — não tem preço de compra convencional, por isso não virou linha no catálogo (reportado ao usuário separadamente). Consumo INMETRO (tabela PBEV 2025 rev. 24/11/2025; o modelo não aparece na tabela 2026, versão "Volkswagen | ID.4 | PRO PERFORMANCE"): 17,5 kWh/100km (0,63 MJ/km). O ID.4 não aparece na tabela PBEV 2026; na 2025 a versão Pro Performance registra 370km. Mantidos os 389km INMETRO da ficha oficial atual da VW, mais recente que a tabela.'
where id = 'volkswagen-id4-pro';

update cars set
  consumption_kwh_100 = 14.2,
  tech_notes = 'Antigo Volvo C40 Recharge, renomeado EC40 em 2025 — versão cupê-SUV do EX40, com carroceria de teto mais baixo e inclinado, mas mesma base mecânica. Versão Plus (RWD, 238cv/420Nm, bateria 69kWh, ~385km Inmetro) é a entrada de linha. A versão Ultra (bimotor, mais potente) está cadastrada separadamente (id volvo-ec40-ultra). Porta-malas provavelmente menor que o EX40 (carroceria cupê), mas sem fonte confiável específica. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EC40 | 6 PLUS"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 385km.'
where id = 'volvo-ec40-plus';

update cars set
  consumption_kwh_100 = 16.4,
  tech_notes = 'Versão topo de linha do EC40 (bimotor AWD, 408cv/670Nm, bateria 82kWh), com a maior autonomia da linha 2026 (404km Inmetro, +51km sobre a geração anterior). Mesmo conjunto mecânico do EX40 Ultra, em carroceria cupê-SUV. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EC40 | 8 ULTRA"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 404km.'
where id = 'volvo-ec40-ultra';

update cars set
  consumption_kwh_100 = 15.3,
  tech_notes = 'Sedã grande 100% elétrico, primeiro da Volvo com arquitetura 800V — estreou no Brasil no Festival Interlagos (ago/2026), já disponível nas 52 concessionárias da marca no país por R$659.950, versão única Ultra Twin Motor Performance. Bimotor AWD de 680cv/870Nm, 0-100km/h em 4,0s, velocidade máxima limitada a 180km/h. Bateria de 106kWh dá 524km de autonomia (ciclo Inmetro/PBEV; WLTP passa de 700km). Recarga DC de até 350kW (10-80% em ~22min, repondo até 300km em 10min). Porta-malas de 446L + porta-malas dianteiro (frunk) de 27L. Coeficiente de arrasto de 0,25 — o menor já registrado pela Volvo. Airbags (9) e config. de porta-malas assumidos iguais ao padrão europeu da linha, por falta de ficha técnica brasileira detalhada publicada até a data de verificação; peso não divulgado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | ES90 | TWIN PE ULT"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 524km.'
where id = 'volvo-es90';

update cars set
  consumption_kwh_100 = 15.3,
  tech_notes = 'Existem duas configurações de bateria: Single (51 kWh LFP, RWD, ~250 km INMETRO — ficha usada aqui) e Twin/Extended Range (69 kWh NMC, ~316-338 km — cadastrada separadamente, id volvo-ex30-ultra). Faixa de preço por versão vai de R$212.554 a R$275.485. Houve recall no Brasil (~5.600 unidades) por risco de incêndio na bateria — vale checar se o carro já passou pelo reparo antes de comprar usado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX30 | E40 PLUS"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 250km.'
where id = 'volvo-ex30';

update cars set
  consumption_kwh_100 = 17.2,
  tech_notes = 'Versão topo de linha do EX30, bimotor AWD (428cv/543Nm) com bateria NMC de 69kWh — quase o dobro da potência da versão Single (272cv). Existe também a versão Cross Country (R$314.950, mesma bateria de 69kWh, suspensão elevada), provavelmente com potência semelhante à Ultra, mas sem ficha técnica própria confirmada em fonte confiável. Confirmado em 19/08/2026: a versão de entrada do EX30 foi renomeada de ''Core'' pra ''Plus'' (mesma bateria/preço), então o nome ''Core'' não aparece mais no site oficial — não afeta esse card, que já usa o nome genérico ''Volvo EX30'' sem especificar o trim de entrada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX30 | TWIN ULTRA"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 316km.'
where id = 'volvo-ex30-ultra';

update cars set
  range_km = 364,
  consumption_kwh_100 = 15.3,
  tech_notes = 'Antigo Volvo XC40 Recharge, renomeado EX40 em 2025. Duas versões: P6 (238cv/420Nm, RWD, bateria 69kWh, 364km INMETRO — ficha usada aqui, compatível com o preço de tabela Plus de R$329.950) e P8 (408cv/670Nm, AWD, bateria 82kWh, 393km INMETRO, 0-100 em 4,9s, mais cara — cadastrada separadamente, id volvo-ex40-ultra). Peso ~2.050kg é aproximado (fonte não especifica por versão). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX40 | 6 PLUS"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 364km. Autonomia atualizada de 385km para 364km pela tabela do INMETRO.'
where id = 'volvo-ex40';

update cars set
  consumption_kwh_100 = 16.4,
  tech_notes = 'Versão topo de linha do EX40 (P8 Ultra AWD), com bateria maior (82kWh vs 69kWh do P6) e bimotor (408cv/670Nm vs 238cv/420Nm), quase dobrando a potência. Preço tem bastante divergência entre fontes/datas — de R$329.703 (FIPE) a R$375.700 (maio/2026); usamos o valor mais recente encontrado. Porta-malas e airbags assumidos iguais ao P6 (mesma carroceria). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX40 | 8 ULTRA"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 393km.'
where id = 'volvo-ex40-ultra';

update cars set
  consumption_kwh_100 = 18.9,
  tech_notes = 'SUV elétrico grande e mais caro da Volvo, com 7 lugares — o primeiro totalmente elétrico da marca nessa configuração. Lançado no Brasil em abr/2025 por R$849.950; linha 2026 ganhou arquitetura 800V, permitindo recarga DC de até 350kW (10-80% em ~30min, adicionando até 250km em 10min). Bimotor AWD com 517cv/860Nm. Tem Lidar de série e 9 airbags. Porta-malas varia de 310L (7 lugares) a 654L (5 lugares). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX90 | PLUS TWIN"): 18,9 kWh/100km (0,68 MJ/km), autonomia de 459km.'
where id = 'volvo-ex90';

update cars set
  consumption_kwh_100 = 17.5,
  tech_notes = '''Shooting brake premium'' (sedã grande com traseira estilo perua), primeiro modelo da Zeekr no Brasil. Duas versões, Premium (R$495 mil — ficha usada aqui) e Flagship (R$542 mil), com mecânica idêntica (544cv/686Nm, bateria 100kWh NMC) — só vão livre (174mm vs 162mm) e equipamentos mudam. Preço subiu bastante desde o lançamento (R$428 mil). Porta-malas de 2.144L é o volume máximo com bancos rebatidos e frunk incluso. Recarga DC de até 200kW (arquitetura 800V). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "ZEEKR | 001 | Premium"): 17,5 kWh/100km (0,63 MJ/km), autonomia de 426km.'
where id = 'zeekr-001';

update cars set
  consumption_kwh_100 = 17.8,
  tech_notes = 'SUV elétrico mais potente da linha Zeekr no Brasil (646cv/710Nm combinados, bimotor AWD) — ficha usada aqui é a versão Flagship (R$448 mil), confirmada exatamente em pente-fino 19/08/2026. Bateria de 100kWh dá 423km Inmetro. Recarga DC de até 200kW (80% em ~30min). Porta-malas de 539L. Existe também uma versão de entrada Premium (R$378 mil, monomotor RWD 421cv, foco em autonomia em vez de performance), lançada depois da Flagship e ainda não detalhada nesta base. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "ZEEKR | 7X | Flagship AWD"): 17,8 kWh/100km (0,64 MJ/km), autonomia de 423km.'
where id = 'zeekr-7x';

update cars set
  range_km = 304,
  consumption_kwh_100 = 16.4,
  tech_notes = 'O preço de R$189.990 que circulava antes está bem abaixo de qualquer versão real vendida no Brasil. Ficha usada aqui é a Flagship, biMotor AWD (R$338 mil), confirmada exatamente em pente-fino 19/08/2026. CORRIGIDO nessa revisão: a linha brasileira tem só 2 versões — Premium RWD (R$298 mil, monomotor 272cv/~343Nm, bateria 51kWh, 332km Inmetro) e Flagship AWD (esta ficha) — não ''Privilege + Premium'' como constava antes (Privilege é nome usado em outros mercados, não no Brasil). Recarga DC de 150kW leva de 10% a 80% em ~20min; carga AC completa em ~3h. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "ZEEKR | X | Flagship"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 304km. Autonomia atualizada de 332km para 304km pela tabela do INMETRO.'
where id = 'zeekr-x';

update cars set
  battery_kwh = 18.3,
  range_km = 1200,
  tech_notes = 'Preço real de tabela é R$175.990 (versão GS) — bem abaixo dos R$279.800 que circulavam antes; a versão de entrada GL custa R$147.990 com 209cv e só 35km de autonomia elétrica (INMETRO). Bateria Blade de 18,3kWh na GS (8,3kWh na GL), conforme a ficha técnica oficial BYD King 2026: 78km elétricos pelo INMETRO (115km NEDC) e autonomia combinada de até 1.200km. Consumo INMETRO no modo híbrido: 16,4 km/l na cidade. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | KING | GS DM"): 13,6 kWh/100km no modo elétrico (0,49 MJ/km), 78km de autonomia no modo elétrico e 14,6 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-king-phev';

update cars set
  fuel_km_l = 11.1,
  tech_notes = 'Minivan híbrida, categoria nova pro catálogo. Versão única (código V.851.2627, R$684.990). Ficha técnica oficial completa (tabela HTML do próprio site Kia, capturada em 11/09/2026): bateria 1,485kWh (Polímero de Lítio-Ion, 270V nominal — o único dos 5 carros desta leva com kWh publicado oficialmente), motor elétrico 54kW/2.600rpm + 30,4kgf.m/1.600rpm, motor a gasolina Gamma II 1.6 Turbo GDI 180cv/5.500rpm + 26,2kgf.m/4.500rpm, potência COMBINADA 245cv@5.500rpm, torque combinado 37,4kgf.m@4.500rpm (366,8Nm, arredondado pra 367). Transmissão automática de 6 marchas, tração dianteira 4x2. Dimensões: 5.155mm de comprimento, 1.995mm de largura, 1.750mm de altura, 3.090mm de entre-eixos — a maior das 5 desta leva. Porta-malas: 627L normal / 2.827L com 2ª e 3ª fileiras rebatidas. 8 lugares. Peso em ordem de marcha: 2.220kg. 8 airbags (frontais duplos + laterais e central dianteiros + cortina nas 3 fileiras + joelho do motorista — "8 Airbags" anunciado explicitamente na página do modelo). Garantia de bateria de 8 anos/160.000km é o padrão que a Kia anuncia pro Niro HEV (mesma marca, mesma tecnologia de bateria) — não foi encontrado um texto específico repetindo essa garantia na página da Carnival, por isso a ressalva. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versões "KIA | CARNIVAL | HEV EX/LX/SX"): 11,1 km/l de gasolina no ciclo combinado.'
where id = 'kia-carnival-hybrid';

update cars set
  tech_notes = 'Sedã executivo híbrido plug-in (Série 5), conjunto combinado de 299cv/450Nm com bateria de 19,4kWh e 70km de autonomia elétrica pura (INMETRO). Preço confirmado em 19/08/2026 direto no site oficial BMW Brasil: R$643.950 (preço público sugerido, ano-modelo 2025/2026, válido para ago/2026) — esse era o valor mais alto entre as fontes que antes divergiam (de R$456.706 a R$643.950); o valor mais baixo provavelmente era de um ano-modelo anterior. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BMW | 530e | M SPORT"): 21,1 kWh/100km no modo elétrico (0,76 MJ/km), 70km de autonomia no modo elétrico e 11,5 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'bmw-530e';

update cars set
  tech_notes = 'Estreia mundial do sistema híbrido plug-in DM-i Flex da BYD — primeiro PHEV do mundo capaz de rodar com gasolina OU etanol. Lançado no Brasil em 9/jun/2026, fabricado em Camaçari (BA). Versão de entrada GL: bateria pequena (7,3kWh), autonomia elétrica de só 33km (INMETRO), carregamento AC de até 3,3kW. Autonomia combinada de 1.000km (gasolina, ciclo NEDC) ou 770km (etanol). Vendida inicialmente por canal de venda direta. A versão GS (mais equipada, com ADAS 2) está cadastrada separadamente (id byd-atto-2-gs). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GL DM FLEX"): 15,8 kWh/100km no modo elétrico (0,57 MJ/km), 33km de autonomia no modo elétrico e 14,7 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-atto-2-gl';

update cars set
  tech_notes = 'Versão topo de linha do Atto 2 DM-i Flex, com bateria maior (18kWh vs 7,3kWh da GL) que mais que dobra a autonomia elétrica pura (75km vs 33km, INMETRO) e carregamento AC mais rápido (6,6kW vs 3,3kW). Inclui pacote ADAS 2, que a GL não tem. Autonomia combinada de 1.045km (gasolina, NEDC) ou 770km (etanol). Fabricada em Camaçari (BA), lançada em 9/jun/2026. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 2 | GS DM FLEX"): 14,2 kWh/100km no modo elétrico (0,51 MJ/km), 75km de autonomia no modo elétrico e 14,8 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-atto-2-gs';

update cars set
  tech_notes = 'SUV híbrido plug-in de 7 lugares com tração integral (AWD): motor 1.5 turbo (156cv) + motor elétrico dianteiro (272cv) + motor elétrico traseiro (216cv), somando 488cv combinados. Bateria Blade LFP de 35,6 kWh garante autonomia elétrica pura de 111km pelo INMETRO (até 152km em ciclo NEDC); autonomia total combinada de até 900km (ciclo NEDC). Porta-malas de até 1.960L com os bancos rebatidos (capacidade com bancos em uso não divulgada). Recarga DC de 30-80% em ~20min (até 72kW). Lançado no Salão do Automóvel 2025. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | ATTO 8 | GS DM"): 19,7 kWh/100km no modo elétrico (0,71 MJ/km), 111km de autonomia no modo elétrico e 11,1 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-atto-8';

update cars set
  tech_notes = 'Autonomia elétrica pura de 68km (PBEV/Inmetro 2026) ou até 100km (NEDC). Caçamba com 1.200 litros de capacidade. Tração integral (AWD), com motor a combustão 1.5 turbo (183cv/260Nm) somado a dois motores elétricos (231cv dianteiro + 204cv traseiro). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "BYD | SHARK | GS DM"): 25,3 kWh/100km no modo elétrico (0,91 MJ/km), 68km de autonomia no modo elétrico e 8,6 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'byd-shark-phev';

update cars set
  tech_notes = 'Denza é a marca premium da BYD — chegou ao Brasil oficialmente em 10/12/2025 com concessionária própria em São Paulo (Grand Brasil Alphaville). B5 é um SUV off-road híbrido plug-in com bateria Blade LFP de 31,8kWh, autonomia elétrica de 74km (INMETRO) e autonomia total combinada de até 1.200km. Estrutura reforçada (resiste a 12 toneladas estáticas sobre o teto), suspensão hidráulica ativa DiSus-P com 16 modos de condução, 3 bloqueios de diferencial eletrônicos. Peso citado como ''mais de 3.000kg'' em fonte agregadora, sem valor exato confirmado. Outros modelos da marca (Z9GT, Z, D9) ainda estão ''em breve'' no site oficial — não incluídos por não terem venda confirmada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "DENZA | B5 | GS DM"): 25,8 kWh/100km no modo elétrico (0,93 MJ/km), 74km de autonomia no modo elétrico e 8,2 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'denza-b5';

update cars set
  tech_notes = 'Preço real de tabela é R$289.900 (Advance) a R$299.900 (Premium) — bem acima do valor anterior de R$189.990. Potência combinada real é de até 339cv/510Nm (motor 1.5 turbo 128cv/20,4kgfm + elétrico dianteiro 225cv/39,8kgfm), não 197cv — confirmado em pente-fino 19/08/2026 contra ficha técnica detalhada (bate exatamente: 52kgfm = 510Nm). Autonomia elétrica pura de 75km (INMETRO). Consumo híbrido de 11,4 km/L no ciclo urbano (gasolina). Porta-malas tem conflito entre fontes (450L vs 580L). Carregamento AC 7kW / DC 40kW (20-80% em ~30-36min). ATENÇÃO: existe uma versão XWD 4x4 do T2 (R$349.990, tração integral) com potência bem maior, mas as fontes divergem muito sobre o número exato (375cv, 597cv e 620cv aparecem em fontes diferentes) — não cadastrada como card separado por falta de ficha confiável. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | ADVANCE"): 22,2 kWh/100km no modo elétrico (0,80 MJ/km), 75km de autonomia no modo elétrico e 11,0 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-t2-phev';

update cars set
  tech_notes = 'Variante off-road mais cara e mais potente do T2 (que já estava no catálogo como "Jetour T2 PHEV", R$289.900/Advance) — essa ficha já apontava a existência do XWD 4x4 mas sem número confiável ("fontes divergem entre 375cv, 597cv e 620cv"). RESOLVIDO: ficha técnica oficial em PDF (baixada do site Jetour em 14/09/2026) confirma 597cv e ~900Nm (91,7kgfm somado) — mas com uma ressalva publicada pela PRÓPRIA Jetour junto do número: "*Simples soma das potências e torques individuais. Não disponível simultaneamente durante o uso." Ou seja, os 4 motores (1 combustão 135cv/20,4kgfm + 3 elétricos: 102cv/17,3kgfm, 122cv/22,4kgfm, 238cv/31,6kgfm) nunca entregam a soma total ao mesmo tempo — é uma cifra de marketing, não uma potência de sistema real medida. Mantive mesmo assim por ser o único número oficial e por ser exatamente o mesmo critério que o resto do catálogo já usa pra "potência combinada" quando a montadora só soma componentes. Bateria 43,2kWh LFP, alcance total até 1.300km, 0-100km/h em 5,5s, velocidade máxima 197km/h. Consumo: 9,9km/l gasolina (ciclo PBEV 55%-45%). Carregamento CCS2, AC 7kW / DC 40kW (30-80% em 37min). Dimensões: 4.785mm de comprimento, 2.006mm de largura, 1.875mm de altura, 2.800mm de entre-eixos. Porta-malas: 580L normal / 1.494L máximo. Vão livre: 205mm. Peso: 2.362kg. Garantia (do próprio PDF oficial): veículo 7 anos/150.000km + bateria/motor elétrico 8 anos/160.000km. Airbags: a ficha oficial só itemiza explicitamente "airbags laterais (dianteiro, motorista e passageiro)" e "airbags de cabeça (dianteiro e traseiro)" — sem citar frontais por nome (provavelmente por serem item de série básico assumido). Usei 6 (mesmo total do T2 PHEV normal, mesma plataforma/marca) por analogia, não por contagem literal desta ficha específica — vale reconfirmar na concessionária antes de qualquer decisão que dependa desse número. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "JETOUR | T2 I-DM | PRM 4X4"): 23,3 kWh/100km no modo elétrico (0,84 MJ/km), 106km de autonomia no modo elétrico e 9,9 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'jetour-t2-4x4-xwd';

update cars set
  tech_notes = 'Preço e disponibilidade confirmados em estoque real de concessionárias oficiais Land Rover (rede JLR Brasil) em ago/2026, trims Autobiography (R$774.469-777.969) e Dynamic HSE (R$733.786-741.286, usado aqui por ser o mais barato). Autonomia elétrica de 40km pelo INMETRO (outras fontes citam 38km a 51km). Mesmo motor híbrido P400e do Defender, que não aparece no estoque oficial atual (zero unidades) por conta da disrupção de produção da JLR após o ciberataque de 2025 — por isso o Defender P400e não foi incluído nesta base apesar de ter ficha técnica divulgada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LAND ROVER | VELAR | PHEV AB"): 25,6 kWh/100km no modo elétrico (0,92 MJ/km), 40km de autonomia no modo elétrico e 8,7 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'land-rover-range-rover-velar-p400e';

update cars set
  tech_notes = 'Primeiro híbrido plug-in da Lexus no Brasil. Sistema com 3 motores (1 a combustão + 2 elétricos, um por eixo) somando 308cv. Autonomia 100% elétrica de 56km (Inmetro). Recarga completa em ~2h45 com wallbox WEG incluso sem custo. Garantia de 10 anos/200.000km é do programa LexusCare (sujeita a revisões periódicas na rede autorizada, não é incondicional). Irmã maior é o RX 450h+ (cadastrado separadamente, id lexus-rx-450h-plus), com a mesma mecânica. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | NX 450H PLUG-IN"): 16,9 kWh/100km no modo elétrico (0,61 MJ/km), 56km de autonomia no modo elétrico e 13,8 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'lexus-nx-450h-plus';

update cars set
  tech_notes = 'Primeiro híbrido plug-in da linha RX no Brasil, mesma mecânica do NX 450h+ (cadastrado separadamente, id lexus-nx-450h-plus): 308cv combinados (2.5 aspirado + 2 motores elétricos), bateria 18,1kWh, autonomia elétrica de 54km (Inmetro). Recarga AC de 6,6kW (completa em ~2h45). Peso elevado (2.780kg) reflete o porte maior da carroceria SUV médio. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "LEXUS | RX450H PLUG-IN"): 17,8 kWh/100km no modo elétrico (0,64 MJ/km), 54km de autonomia no modo elétrico e 13,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'lexus-rx-450h-plus';

update cars set
  tech_notes = 'SUV médio híbrido plug-in, líder de vendas entre híbridos da Volvo no Brasil (3.287 unidades em 2024). Quatro versões — Plus (R$459.950, ficha usada aqui), Ultra (~R$509.950), Ultra Dark (R$519.950) e Polestar Engineered (R$539.950) — compartilham a mesma mecânica T8 (462cv/696Nm combinados), só equipamento muda. Bateria de 18,8kWh dá 48km de autonomia elétrica (Inmetro) ou 80km (WLTP). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | XC60 | T8"): 23,9 kWh/100km no modo elétrico (0,86 MJ/km), 48km de autonomia no modo elétrico e 9,4 km/l de gasolina no modo híbrido (ciclo combinado).'
where id = 'volvo-xc60-recharge-t8';

update cars set
  tech_notes = 'Único trim de Accord vendido no Brasil (Advanced Hybrid), versão única de cor (Preto Cristal Perolizado) na linha 2026. Mesmo motor elétrico (184cv/34,1kgf.m — 334Nm) do CR-V e do Civic híbridos; combustão 146cv/19,2kgf.m gasolina. Ficha técnica de especificações (dimensões, motor, porta-malas 574L) vem de um catálogo PDF datado de agosto/2023 — mais antigo que o dos outros modelos —, mas os números batem exatamente com o que a imprensa reporta pra linha 2026 (checado em 11/09/2026), incluindo os 574L de porta-malas, o que dá confiança de que a ficha técnica em si não mudou, só o ano/preço. Preço R$332.400 (linha 2026, checado via imprensa em 11/09/2026 — o site oficial não expõe o valor no HTML estático). Consumo Inmetro: 17,5 km/l cidade. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "HONDA | ACCORD HYBRID | TOURING"): 16,6 km/l de gasolina no ciclo combinado.'
where id = 'honda-accord-advanced-hybrid';

update cars set
  tech_notes = 'Única versão híbrida do Corolla Cross no Brasil (XRX Hybrid) — as versões XRE/XR/XRX são a combustão (2.0L Dynamic Force, 175cv, não-híbrida). Ficha oficial (catálogo PDF Toyota, baixado do site em 11/09/2026): motor a combustão 1.8L 101cv/5.200rpm + 14,5kgf.m (142Nm)/3.600rpm, dois motores elétricos somando 72cv/16,6kgf.m. A Toyota NÃO publica uma potência combinada única pra este sistema HSD (o power-split não soma linearmente) — os 101cv registrados aqui são só do motor a combustão; o carro entrega mais que isso na prática graças ao motor elétrico. Preço R$223.790 é a versão de entrada de cor (varia até R$226.120 conforme a cor). Consumo INMETRO: 16,6 km/l urbano / 14,0 km/l estrada. Garantia: 5 anos veículo + 3 anos adicionais pro sistema híbrido (bateria/inversor), totalizando 8 anos pro híbrido. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | COROLLA CROSS | XRX HYBRID"): 15,3 km/l de gasolina no ciclo combinado.'
where id = 'toyota-corolla-cross-hybrid';

update cars set
  tech_notes = 'Versão de entrada híbrida (XRE Hybrid) — existe também a XRX Hybrid, mais equipada, R$189.990. Ficha oficial (catálogo PDF Toyota, baixado do site em 11/09/2026): motor 1.5L 91cv/5.500rpm + 12,3kgf.m etanol, motor elétrico 80cv/14,4kgf.m. Diferente do Corolla Cross Hybrid e do Corolla Hybrid, aqui a Toyota PUBLICA uma potência combinada explícita: 111cv — é essa a usada aqui (torque combinado não é publicado; o valor registrado é só do motor elétrico). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "TOYOTA | YARIS CROSS | XRE-HYBRID"): 16,6 km/l de gasolina no ciclo combinado.'
where id = 'toyota-yaris-cross-hybrid';

commit;
