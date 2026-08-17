# Pesquisa de dados dos carros — 17/08/2026

Pesquisa parcial feita por agentes em background pra completar/corrigir a base de
carros do app (`src/App.jsx` — `BULK_RAW`/`SEED_CARS_DETAILED`). Interrompida por
limite de sessão da API antes de cobrir os 45 carros — cobriu 17. Ainda **NÃO
aplicada** ao código; isso é só o resultado bruto da pesquisa, guardado aqui pra
não se perder. Quando continuar o trabalho, usar isso como ponto de partida em
vez de repesquisar esses 17 carros.

Carros ainda sem pesquisa (24): BYD Dolphin, BYD Dolphin Plus, BYD Yuan Plus, BYD
Seal, BYD Han EV, BYD Song Plus PHEV, BYD King PHEV, BYD Shark PHEV (bloco BYD —
agente falhou por limite de sessão antes de reportar), MG MG4, MG MG4 (importada),
MG S5, MG Cyberster, GAC Aion ES, GAC Aion Y, GAC Aion V (bloco MG/GAC — agente
falhou), Leapmotor B10, Leapmotor C10, Geely EX5, Omoda E5, Zeekr X, Neta X 400,
Neta X 500, Honda e:NP1 (bloco SUVs chineses compactos — agente falhou).

Bloco PHEV (4 carros) concluído — ver Bloco 3 abaixo, com achado crítico: o
"Corolla Cross XEV PHEV" do banco não existe à venda no Brasil (é um HEV comum,
sem tomada; o PHEV real só chega em 2027).

---

## Bloco 1 — hatches "de entrada" chineses (6 carros, bem pesquisado)

### Geely EX2 Pro
- Preço R$ 123.800 confirmado. Potência 116cv confirmada.
- Torque 150 Nm. Bateria 39,4 kWh LFP. Motor PMSM traseiro (RWD).
- Autonomia real: **289 km** (banco tinha 235 km — DIVERGE).
- Consumo: sem valor oficial; ~10,2 kWh/100km real-world citado (banco tem 9,5, plausível).
- Aceleração 0-100: 10,2s. Porta-malas 375L + frunk 70L. Peso 1.300kg.
- Wallbox: campanha (não confirmado pra versão Pro). AC 6,6kW / DC 70kW. Airbags 6.
- Garantia 6 anos veículo / 8 anos ou 150.000km bateria. Revisão 20.000km/12 meses.
- **ALERTA**: várias fontes 2026 sugerem que EX2 Pro e EX2 Max têm a MESMA motorização/bateria
  no Brasil (116cv/39,4kWh/289km) — o banco assume que são baterias diferentes (Pro 235km).
  Checar direto no site oficial Geely Brasil antes de aceitar isso.
- Fontes: webmotors.com.br, jkcarros.com.br, canalve.com.br, geelybrasil.com.br, cnnbrasil.com.br

### JAC E-JS1
- Dados MUITO inconsistentes entre fontes (parecem misturar anos-modelo/versões diferentes).
- Preço: conflito forte — R$129.990 / R$132.900 / R$134.566 / R$149.900 (nenhuma fonte bate
  com o R$159.900 do banco; cluster real parece R$130-150 mil).
- Potência: maioria diz 62cv, uma fonte descreve versão de 82cv/280km (outra variante?).
- Torque 150 Nm. Bateria 30,2 kWh LFP. Motor dianteiro FWD.
- Autonomia: conflito grave 181 / 280 / 302 km. Consumo bate melhor com autonomia ~280-302km
  (não com o 181km que também aparece).
- Vão livre ~130mm (confiança moderada). Porta-malas 121L. Peso ~1.180kg (confiança moderada).
- Wallbox: não incluso (kit à parte). AC 7,4kW.
- Garantia 3 anos/100.000km veículo, 8 anos/200.000km bateria. Revisão 10.000km/12 meses.
- **Recomendação**: verificar direto no site oficial JAC Brasil, dado muito nada confiável.

### Renault Kwid E-Tech
- Preço R$ 99.990 confirmado. Potência 65cv confirmada.
- Torque 113 Nm. Bateria 26,8 kWh (química não confirmada). Motor PMSM dianteiro.
- **Autonomia real: 180 km INMETRO (banco tem 265km — DIVERGE FORTE)**.
- **Consumo real: ~14,9 kWh/100km (banco tem 10,5 — DIVERGE FORTE)**.
- Aceleração 0-100: 14,6s. Vão livre 172mm. Porta-malas 290L. Peso 969kg.
- DC 30kW (20-80% ~45min). Airbags 6. Garantia 3 anos veículo / 8 anos bateria.
- Revisão: 1ª (10.000km) R$320, 2ª (20.000km) R$366 → soma R$686 até 20.000km.
- Fontes: webmotors.com.br, renault.com.br, canalve.com.br, cnnbrasil.com.br, autoentusiastas.com.br

### Caoa Chery iCar
- **STATUS CRÍTICO: modelo retirado do configurador oficial em março/2026 (baixíssima venda) —
  não é mais vendido oficialmente hoje.** Considerar remover da lista ou marcar como descontinuado.
- Se mantido: potência 61cv confirmada. Torque 150 Nm. Bateria 30,8 kWh (química não confirmada).
  Motor traseiro (incomum). Autonomia real ~282km (banco tem 210 — diverge, consumo bate melhor
  com 282km). Porta-malas ~100L (baixa confiança). Peso 995kg. DC ~36min pra completar.
- Fontes: terra.com.br, vrum.com.br, mobiauto.com.br, garagem360.com.br

### Neta Aya
- Preço: conflito por versão — Comfort ~R$128.900 (perto do banco R$124.900), Luxury reajustada
  pra R$149.900 em jan/2026 (era R$134.900 no lançamento).
- Potência 95cv confirmada. Torque 150 Nm. Bateria 40,7 kWh LFP. Motor dianteiro FWD.
- **Autonomia 263km (PBEV/Inmetro) confirmada, bate exatamente com o banco.**
- Consumo: 12 kWh/100km do banco bate com cálculo usando autonomia WLTP (338km), não com a
  Inmetro (263km) — ressalva metodológica, mas o valor de consumo em si é plausível.
- Vão livre não encontrado. Porta-malas 335L. Peso 1.180kg.
- Wallbox 7kW incluso sem custo (fonte única). AC 6,6kW / DC 60kW.
- Garantia 5 anos/150.000km veículo, 8 anos/180.000km bateria+motor (fonte única).
- Revisão a cada 20.000km, 5 primeiras revisões grátis (fonte única, moderada confiança).

### GWM Ora 03
- **Maior confusão da lista**: duas versões (Skin BEV48 e GT BEV63) com specs cruzadas entre fontes.
- Preço: conflito forte, Skin entre R$145.985-169.000, GT entre R$163.086-199.000. Nenhuma fonte
  bate com o R$150.000 do banco.
- Potência: conflito 171cv vs 204cv pra mesma versão GT BEV63 entre fontes diferentes.
- Torque 250 Nm (versão 171cv). Bateria: GT=63kWh NMC / Skin=48kWh LFP. Motor dianteiro FWD.
- Autonomia 319km Inmetro / até 400km WLTP (banco usa o WLTP). Vão livre 135mm. Porta-malas 228L
  + frunk 57L. Peso 1.540-1.580kg. Aceleração 0-100: 8,2-8,3s.
- Wallbox: "depende" (fontes conflitam). AC 7,4kW.
- Garantia 5 anos sem limite km veículo / 8 anos/200.000km bateria (bem corroborado).
- **Programa promocional: 5 anos ou 48.000km de revisões grátis** (4 fontes concordam) — usar
  R$0 nas 2 primeiras revisões dentro desse programa.
- **Recomendação**: checar direto no site oficial GWM Brasil antes de publicar, dado o conflito.

---

## Bloco 2 — premium europeus/coreanos (11 carros, bem pesquisado)

**Nota metodológica geral**: os valores de autonomia do banco original batem muito mais com o
ciclo WLTP europeu do que com PBEV/INMETRO brasileiro (que costuma ser 15-35% menor). Usar
sempre o valor INMETRO quando encontrado.

### Smart #1
- **STATUS CRÍTICO: sem evidência de venda oficial confirmada no Brasil hoje** — artigos de
  abril/2026 ainda tratam o retorno da marca como futuro/especulativo. Preços encontrados são
  conversão do mercado chinês, não tabela brasileira. Recomendo marcar `verified: false` e
  considerar remover até achar lançamento oficial confirmado.

### Volvo EX30
- Preço real ~R$239.950 (Plus), faixa R$212.554-275.485 por versão — banco (R$229.990) próximo mas
  não exato.
- Potência 272cv / torque ~343Nm confirmados (motor traseiro, versão base).
- Duas baterias: 51kWh LFP (Single) e 69kWh NMC (Twin/Extended). Autonomia real Inmetro ~250km
  (51kWh) a 316-338km (69kWh) — banco (344km) é otimista/WLTP.
- Porta-malas 318L. Airbags 6. Garantia 36 meses/100.000km veículo, 8 anos/160.000km bateria.
- Nota: recall no Brasil (~5.600 unidades) por risco de incêndio na bateria — vale nota jornalística.

### Fiat 500e
- Preço real R$219.990 (Action) — banco tem R$239.990 (pode ser versão Icon, não confirmado).
- Potência 118cv / torque 220Nm confirmados. Bateria 42kWh. Motor dianteiro FWD.
- Autonomia real provavelmente bem menor que 320km WLTP — um anúncio de veículo real registrou
  227km e consumo de ~18,5 kWh/100km (banco tem 14,5 — otimista). Recomendo usar faixa 227-280km.
- Aceleração 0-100: 9,0s. Porta-malas 185L. AC 11kW / DC 85kW (0-80% ~35min).
- Garantia bateria 8 anos/160.000km.

### Nissan Leaf
- **STATUS CRÍTICO: DESCONTINUADO no Brasil (saiu de linha ~fev/2024-2025), não é mais vendido
  0km.** Nova geração global (52kWh/218cv/75kWh, NMC, 14,2kWh/100km) ainda sem chegada confirmada
  ao Brasil (estimativa não oficial 2º semestre 2026).
- Última versão vendida oficialmente: R$301.490, 149cv/32,6kgfm, bateria 40kWh, autonomia 192km,
  porta-malas 435L — nada disso bate com o banco (218cv/385km/R$239.990, que não corresponde a
  nenhuma versão já vendida oficialmente).
- **Recomendação forte: remover da lista de "vendidos oficialmente" ou marcar como descontinuado.**

### Peugeot e-2008
- Preço real R$259.990-269.990 — banco (R$249.990) abaixo de todas as fontes.
- **Potência real 158cv (nova geração, banco tem 136cv desatualizado)**. Torque 260Nm.
- Bateria 54kWh (subiu de 50kWh). Motor dianteiro FWD.
- **Autonomia real 261km PBEV/Inmetro oficial (banco tem 345km — otimista/WLTP)**.
- Consumo real calculado ~20,7 kWh/100km (banco tem 15,2 — bem otimista).
- AC 11kW trifásico / DC até 100kW (0-80% ~30min). Porta-malas ~434-435L. Airbags 6.
- Garantia 2 anos veículo + 8 anos bateria.

### Mini Cooper SE
- **Modelo mais consistente da pesquisa** — poucos ajustes necessários.
- Preço R$259.990 confirmado. Potência 218cv / torque 330Nm confirmados. Bateria 54,2kWh.
- Autonomia real 303km PBEV/Inmetro (banco tem 305km — praticamente idêntico).
- Consumo real ~17,9 kWh/100km (banco tem 15,8 — próximo, levemente otimista).
- Aceleração 0-100: 6,7s. Porta-malas 210L (800L bancos rebatidos). Peso 1.540kg.
- AC 11kW (recarga completa 5h15). Wallbox incluso sem custo — pacote "MINI Service Inclusive"
  (4 anos, km ilimitado) inclui MINI Wallbox Essential 11kW cortesia.

### Chevrolet Equinox EV
- **Preço real ~R$419.000 (banco tem R$299.990 — MUITO abaixo, fonte mais confiável é a mais alta)**.
- Potência 292cv / torque 451Nm — próximo do banco (290cv), correto.
- Bateria 85kWh química NCMA (evolução NMC, reduz cobalto). Motor AWD biMotor (2x146cv).
- Autonomia real até 443km Inmetro (banco tem 513km — acima do confirmado).
- Consumo calculado ~19,2 kWh/100km (banco tem 17,5 — próximo).
- Aceleração 0-100: 5,8s. Porta-malas 441L. Peso 2.336kg. Airbags 8.
- Garantia bateria 8 anos/160.000km (verificar termo exato Brasil). 1ª revisão (10.000km) grátis.

### Volvo EX40 (= antigo XC40 Recharge, renomeado 2025 — confirmado)
- Duas versões: P6 (238cv/420Nm, RWD, bateria 69kWh) e P8 (408cv/670Nm, AWD, bateria 82kWh).
- Preço Plus R$329.950 (bate com banco) — mas atenção: Plus normalmente é a versão P6 mais barata,
  enquanto 408cv é a versão P8 — pode haver incompatibilidade entre preço e potência no banco atual.
  **Confirmar no configurador oficial Volvo qual combinação é essa.**
- Autonomia real: P6 até 385km / P8 até 393km Inmetro (banco tem 438km — acima do confirmado).
- Consumo calculado (P8) ~20,9 kWh/100km (banco tem 17 — otimista).
- Peso ~2.050kg. Porta-malas 414L. Airbags 7. Aceleração 0-100 (P8): 4,9s.

### BMW iX1
- **Duas versões distintas — banco (313cv) corresponde à xDrive30, não à eDrive20**:
  - eDrive20 (FWD): R$359.950, 204cv/250Nm, bateria 64,7kWh, autonomia até 332km Inmetro.
  - xDrive30 (AWD): R$485.950 (M Sport), 313cv/494Nm (bate com banco), bateria 66,5kWh,
    autonomia até 303km Inmetro.
- **O preço do banco (R$339.990) não corresponde a nenhuma das duas versões** (fica abaixo até
  da eDrive20). Autonomia do banco (440km) muito acima do Inmetro real (303-332km).
- Consumo calculado (xDrive30) ~21,9 kWh/100km (banco tem 17 — otimista).
- Porta-malas 490L. Garantia bateria 8 anos/160.000km.

### Hyundai Ioniq 5
- Preço real R$394.990 (Signature, lançamento) — banco tem R$339.990, bem abaixo (houve descontos
  pontuais até R$294.990 em estoque parado, mas não é preço de tabela).
- Potência 325cv / torque 604Nm confirmados. Motor AWD biMotor. Bateria 84kWh NMC (plataforma E-GMP).
- **Autonomia real 374km Inmetro/PBEV oficial (banco tem 480km — bem acima, é WLTP)**.
- Consumo calculado ~22,5 kWh/100km (banco tem 16,8 — bem otimista).
- Aceleração 0-100: 5,3s. Vão livre 178mm. Porta-malas 527L. Airbags 8.
- AC 11kW / DC até 350kW (10-80% em 18min). Wallbox incluso sem custo (carregador portátil AC
  2,6kW + wallbox parede WEG 7,68kW, cobertura 1 ano).
- Garantia 5 anos sem limite km veículo (inclui carregador residencial) + 8 anos/160.000km bateria+motores.
- Revisão: custo médio citado ~R$1.200/revisão (confiança moderada, sem tabela oficial detalhada).

### Kia EV6
- **STATUS INCERTO/CRÍTICO: não aparece no catálogo oficial atual da Kia Brasil (kia.com.br lista
  Sorento, EV9, EV5, Stonic, Niro, Sportage, Carnival, Bongo, Tasman — sem EV6).** Foi lançado no
  Brasil em dez/2022 mas parece ter sido substituído pelo EV5/EV9 na linha atual. Uma fonte
  (autoo.com.br) afirma explicitamente "ainda não tem previsão de chegada ao Brasil" (2025).
- Preço/potência do banco (R$349.990/325cv) não confirmados por fonte confiável atual.
- **Recomendação forte: confirmar com concessionária Kia ou remover/marcar como descontinuado
  até obter confirmação oficial.**

---

## Bloco 3 — PHEV SUVs (4 carros, bem pesquisado)

### Jetour T2 PHEV
- Preço real R$ 289.900 (Advance) a R$ 299.900 (Premium) — banco tem R$189.990, muito abaixo.
- Potência real até 339cv combinados (1.5 turbo ~128-135cv + elétrico 225cv) — banco tem 197cv, muito abaixo.
- Torque ~510 Nm combinado. Bateria 26,7 kWh (química não confirmada).
- Autonomia elétrica pura: ~75km (fontes variam 70-77km). Consumo híbrido: 11,4 km/L urbano.
- Autonomia total combinada: ~1.100km (banco tem 1.050, próximo).
- Aceleração 0-100: 7,5s. Vão livre 205mm (fonte única). Porta-malas: conflito 450L vs 580L.
- Peso 2.110kg. AC 7kW / DC 40kW (20-80% ~30-36min). Airbags 6.
- Garantia 7 anos completa + 8 anos/160.000km bateria e motor elétrico.
- **verified=false** — preço e potência do banco não batem com o praticado hoje.

### JAECOO 7 PHEV
- Preço real: Elite R$179.990, Luxury R$234.990, Prestige R$256.990 — banco (R$199.990) fica entre
  Elite e Luxury, não corresponde a nenhuma versão exata.
- Potência: marca mudou metodologia (UN R21) — antes anunciava 339cv, agora 279cv pro MESMO conjunto
  mecânico (1.5 turbo 135cv + elétrico 204cv). Banco tem 197cv — não bate com nenhuma das duas.
- Bateria 18,3 kWh LFP (bem confirmado). Autonomia elétrica pura: 79km (Inmetro, bem confirmado).
- Consumo híbrido: 15,1 km/L urbano (confiança moderada). Autonomia total: "mais de 1.000km" a 1.200km.
- Aceleração 0-100: 8,5s oficial / 7,8s medido em teste. Porta-malas 500L (confirmado). Peso 1.795kg.
- Airbags 7. Garantia 7 anos ou 150.000km. Revisão 12 meses/10.000km, grátis nos 3 primeiros anos.
- **verified=false** — potência mudou de metodologia, preço não corresponde a versão exata.

### GWM Haval H6 PHEV
- **Atenção: existem 4 variantes em 2026** — HEV2 (não é PHEV, R$223mil), PHEV19 (326cv, R$248mil),
  PHEV35 (393cv, R$288mil), GT (393cv cupê, R$325mil). O banco (326cv) corresponde à PHEV19, mas o
  preço do banco (R$219.800) está desatualizado frente ao atual R$248.000.
- Potência 326cv **confirmada**. Torque 540 Nm (uma fonte cita 535). Bateria 19kWh LFP (SVOLT) — bem confirmado.
- Autonomia elétrica pura: 77km Inmetro / até 115km WLTP (bem confirmado).
- Consumo oficial combinado: 37,7 km/L equiv. cidade / 30,6 km/L estrada (ciclo misto, não é só motor térmico).
- Aceleração 0-100: 7,4s. Porta-malas 560L. Peso não encontrado especificamente pro PHEV19.
- AC 6,6kW / **DC até 33kW** (incomum em PHEV, a maioria não tem DC). Airbags 6.
- Garantia 5 anos sem limite km veículo + 8 anos/200.000km sistema híbrido e bateria.
- Revisão 12.000km/12 meses; conflito se 1ª é grátis ou ~R$890, 2ª ~R$1.290.
- **verified**: potência confirmada, mas preço desatualizado → tratar como false no conjunto.

### Toyota Corolla Cross "XEV" — ⚠️ NÃO É UM PHEV, NÃO EXISTE ESSA VERSÃO À VENDA
- **Descoberta mais importante da pesquisa toda**: a Toyota não vende nenhuma versão plug-in do
  Corolla Cross no Brasil hoje. "XEV" é um termo genérico da indústria pra "veículo eletrificado"
  (qualquer tipo), não é um nome comercial da Toyota. O que existe é o **Corolla Cross Hybrid**
  (XRX Hybrid / XRX Hybrid Premium) — um híbrido AUTORRECARREGÁVEL convencional, sem tomada, sem
  carregamento externo, sem "autonomia elétrica" no sentido usado pelo app.
- Preço real da versão híbrida existente: R$215.990-219.890 (banco tem R$249.990 pro "PHEV" fictício).
- Potência real: 122cv combinados (1.8 flex 101cv + elétrico 72cv) — banco tem 170cv.
- Consumo (único modo, híbrido): 18,9 km/L cidade / 16,5 km/L estrada (gasolina); 13,5/12,8 km/L com etanol.
- Autonomia total com tanque cheio: ~598km. Porta-malas 440L.
- Um Corolla Cross PHEV real (com bateria plugável, ~70km autonomia elétrica) só chega em 2027
  (renovação da linha, fabricado em Sorocaba-SP) — ainda não é produto disponível pra compra.
- **AÇÃO NECESSÁRIA**: remover esse item do app (ele não deveria estar na lista de "vendidos
  oficialmente" como PHEV hoje) ou substituir por um PHEV real do segmento SUV médio/híbrido, já
  que atualmente ele representa um carro que não existe no mercado como descrito.

---

## Resumo de flags críticos (aplicar com prioridade quando retomar)

| Carro | Problema |
|---|---|
| Nissan Leaf | Descontinuado no Brasil — não é mais vendido 0km |
| Kia EV6 | Não aparece no catálogo oficial atual — status incerto |
| Caoa Chery iCar | Retirado do configurador oficial em março/2026 |
| Smart #1 | Sem confirmação de venda oficial no Brasil |
| Renault Kwid E-Tech | Autonomia real 180km (não 265km), consumo real ~14,9 (não 10,5) |
| Peugeot e-2008 | Potência real 158cv (não 136cv), autonomia real 261km (não 345km) |
| Chevrolet Equinox EV | Preço real ~R$419.000 (não R$299.990) |
| Hyundai Ioniq 5 | Preço real R$394.990 (não R$339.990), autonomia real 374km (não 480km) |
| BMW iX1 | Preço do banco não corresponde a nenhuma versão real; confundir eDrive20/xDrive30 |
| GWM Ora 03 | Preço e potência conflitantes entre fontes — checar direto no site oficial |
| JAC E-JS1 | Dados muito inconsistentes entre fontes — checar direto no site oficial |
| **Toyota Corolla Cross "XEV" PHEV** | **Não existe à venda — é um HEV comum, sem tomada; PHEV real só em 2027. Remover ou substituir.** |
| Jetour T2 PHEV | Preço real R$289.900-299.900 (não R$189.990), potência real até 339cv (não 197cv) |
| JAECOO 7 PHEV | Potência mudou de metodologia (279cv atual vs 339cv antiga), nenhuma bate com 197cv do banco |
| GWM Haval H6 PHEV | Preço real R$248.000 (não R$219.800); potência 326cv confirmada |

Padrão geral observado: a maioria dos carros no banco usa autonomia estilo WLTP (mais otimista)
em vez do PBEV/Inmetro oficial brasileiro (tipicamente 15-35% menor) — vale revisar isso em todos
os 50 carros, não só nos 17 já pesquisados.
