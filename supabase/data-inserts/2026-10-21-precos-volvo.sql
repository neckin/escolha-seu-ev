-- Preços da Volvo conferidos no configurador oficial em 21/10/2026
-- (volvocars.com/br/build/<modelo>). Cada card do catálogo é a versão de entrada
-- da sua motorização: Plus = motor simples, Ultra = bimotor (o configurador
-- confirma Plus/Ultra com os mesmos preços "a partir de" da página de
-- especificações por motorização). Notas com preços antigos foram corrigidas.
-- EX60: página existe, mas o configurador responde "modelNotFound": ainda não
-- está à venda, não entra no catálogo.

begin;

-- Volvo EX30
update cars set price = 249950, price_verified_date = '21/10/2026',
  tech_notes = 'Existem duas configurações de bateria: Single (51 kWh LFP, RWD, ~250 km INMETRO — ficha usada aqui) e Twin/Extended Range (69 kWh NMC, ~316-338 km — cadastrada separadamente, id volvo-ex30-ultra). Houve recall no Brasil (~5.600 unidades) por risco de incêndio na bateria — vale checar se o carro já passou pelo reparo antes de comprar usado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX30 | E40 PLUS"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 250km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build): Plus R$ 249.950, Ultra R$ 319.950, Cross Country R$ 324.950.'
where id = 'volvo-ex30';

-- Volvo EX30 Ultra Twin Motor
update cars set price = 319950, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do EX30, bimotor AWD (428cv/543Nm) com bateria NMC de 69kWh — quase o dobro da potência da versão Single (272cv). Existe também a versão Cross Country (R$324.950, mesma bateria de 69kWh, suspensão elevada), provavelmente com potência semelhante à Ultra, mas sem ficha técnica própria confirmada em fonte confiável. Confirmado em 19/08/2026: a versão de entrada do EX30 foi renomeada de ''Core'' pra ''Plus'' (mesma bateria/preço), então o nome ''Core'' não aparece mais no site oficial — não afeta esse card, que já usa o nome genérico ''Volvo EX30'' sem especificar o trim de entrada. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX30 | TWIN ULTRA"): 17,2 kWh/100km (0,62 MJ/km), autonomia de 316km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build).'
where id = 'volvo-ex30-ultra';

-- Volvo EC40 Plus
update cars set price = 350950, price_verified_date = '21/10/2026',
  tech_notes = 'Antigo Volvo C40 Recharge, renomeado EC40 em 2025 — versão cupê-SUV do EX40, com carroceria de teto mais baixo e inclinado, mas mesma base mecânica. Versão Plus (RWD, 238cv/420Nm, bateria 69kWh, ~385km Inmetro) é a entrada de linha. A versão Ultra (bimotor, mais potente) está cadastrada separadamente (id volvo-ec40-ultra). Porta-malas provavelmente menor que o EX40 (carroceria cupê), mas sem fonte confiável específica. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EC40 | 6 PLUS"): 14,2 kWh/100km (0,51 MJ/km), autonomia de 385km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build): Plus R$ 350.950, Ultra R$ 405.950, Black Edition R$ 410.950.'
where id = 'volvo-ec40-plus';

-- Volvo EC40 Ultra
update cars set price = 405950, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do EC40 (bimotor AWD, 408cv/670Nm, bateria 82kWh), com a maior autonomia da linha 2026 (404km Inmetro, +51km sobre a geração anterior). Mesmo conjunto mecânico do EX40 Ultra, em carroceria cupê-SUV. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EC40 | 8 ULTRA"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 404km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build).'
where id = 'volvo-ec40-ultra';

-- Volvo EX40
update cars set price = 345950, price_verified_date = '21/10/2026',
  tech_notes = 'Antigo Volvo XC40 Recharge, renomeado EX40 em 2025. Duas versões: P6 (238cv/420Nm, RWD, bateria 69kWh, 364km INMETRO — ficha usada aqui, versão Plus) e P8 (408cv/670Nm, AWD, bateria 82kWh, 393km INMETRO, 0-100 em 4,9s, mais cara — cadastrada separadamente, id volvo-ex40-ultra). Peso ~2.050kg é aproximado (fonte não especifica por versão). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX40 | 6 PLUS"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 364km. Autonomia atualizada de 385km para 364km pela tabela do INMETRO. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build): Plus R$ 345.950, Ultra R$ 400.950, Black Edition R$ 405.950.'
where id = 'volvo-ex40';

-- Volvo EX40 Ultra P8
update cars set price = 400950, price_verified_date = '21/10/2026',
  tech_notes = 'Versão topo de linha do EX40 (P8 Ultra AWD), com bateria maior (82kWh vs 69kWh do P6) e bimotor (408cv/670Nm vs 238cv/420Nm), quase dobrando a potência. Preço tem bastante divergência entre fontes/datas — de R$329.703 (FIPE) a R$375.700 (maio/2026); usamos o valor mais recente encontrado. Porta-malas e airbags assumidos iguais ao P6 (mesma carroceria). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX40 | 8 ULTRA"): 16,4 kWh/100km (0,59 MJ/km), autonomia de 393km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build).'
where id = 'volvo-ex40-ultra';

-- Volvo XC60 Recharge T8
update cars set price = 469950, price_verified_date = '21/10/2026',
  tech_notes = 'SUV médio híbrido plug-in, líder de vendas entre híbridos da Volvo no Brasil (3.287 unidades em 2024). Duas versões no configurador — Plus (R$469.950, ficha usada aqui) e Ultra (R$519.950) — compartilham a mesma mecânica T8 (462cv/696Nm combinados), só equipamento muda. Bateria de 18,8kWh dá 48km de autonomia elétrica (Inmetro) ou 80km (WLTP). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | XC60 | T8"): 23,9 kWh/100km no modo elétrico (0,86 MJ/km), 48km de autonomia no modo elétrico e 9,4 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build).'
where id = 'volvo-xc60-recharge-t8';

-- Volvo XC90 Recharge T8
update cars set price = 699950, price_verified_date = '21/10/2026',
  tech_notes = 'SUV grande híbrido plug-in de 7 lugares, ainda em linha no Brasil mesmo após o lançamento do EX90 (100% elétrico) — não foi substituído, coexistem no catálogo. Versão Plus, mesma mecânica T8 (462cv/709Nm) do XC60. Bateria de 18,8kWh dá 47km de autonomia elétrica. Porta-malas de 316L com as 3 fileiras em uso (500L com a 3ª rebatida). Vão livre de 223mm. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | XC90 | T8"): 24,4 kWh/100km no modo elétrico (0,88 MJ/km), 47km de autonomia no modo elétrico e 9,4 km/l de gasolina no modo híbrido (ciclo combinado). Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build): Plus R$ 699.950, Ultra R$ 749.950.'
where id = 'volvo-xc90-recharge-t8';

-- Volvo EX90
update cars set price = 849950, price_verified_date = '21/10/2026',
  tech_notes = 'SUV elétrico grande e mais caro da Volvo, com 7 lugares — o primeiro totalmente elétrico da marca nessa configuração. Lançado no Brasil em abr/2025 por R$849.950; linha 2026 ganhou arquitetura 800V, permitindo recarga DC de até 350kW (10-80% em ~30min, adicionando até 250km em 10min). Bimotor AWD com 517cv/860Nm. Tem Lidar de série e 9 airbags. Porta-malas varia de 310L (7 lugares) a 654L (5 lugares). Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | EX90 | PLUS TWIN"): 18,9 kWh/100km (0,68 MJ/km), autonomia de 459km. Preço atualizado em 21/10/2026 pelo configurador oficial (volvocars.com/br/build): versão única Ultra.'
where id = 'volvo-ex90';

-- Volvo ES90 Ultra Twin Motor Performance
update cars set price = 659950, price_verified_date = '21/10/2026',
  tech_notes = 'Sedã grande 100% elétrico, primeiro da Volvo com arquitetura 800V — estreou no Brasil no Festival Interlagos (ago/2026), já disponível nas 52 concessionárias da marca no país por R$659.950, versão única Ultra Twin Motor Performance. Bimotor AWD de 680cv/870Nm, 0-100km/h em 4,0s, velocidade máxima limitada a 180km/h. Bateria de 106kWh dá 524km de autonomia (ciclo Inmetro/PBEV; WLTP passa de 700km). Recarga DC de até 350kW (10-80% em ~22min, repondo até 300km em 10min). Porta-malas de 446L + porta-malas dianteiro (frunk) de 27L. Coeficiente de arrasto de 0,25 — o menor já registrado pela Volvo. Airbags (9) e config. de porta-malas assumidos iguais ao padrão europeu da linha, por falta de ficha técnica brasileira detalhada publicada até a data de verificação; peso não divulgado. Consumo INMETRO (tabela PBEV 2026 rev. 14/08/2026, versão "VOLVO | ES90 | TWIN PE ULT"): 15,3 kWh/100km (0,55 MJ/km), autonomia de 524km. Preço conferido em 21/10/2026 no configurador oficial (sem mudança).'
where id = 'volvo-es90';

commit;
