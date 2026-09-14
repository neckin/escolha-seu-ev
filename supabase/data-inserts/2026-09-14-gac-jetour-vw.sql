-- Resposta ao pedido do usuário em 14/09/2026: "Já rodou a verificação de
-- carros hoje? Acredito que tem carros faltando, pois na GAC por exemplo tem
-- carros híbridos. Não me recordo tb de ter visto Jetour, na VW o ID.4 agora
-- está disponível para venda tb. Verifique todos, pfv"
--
-- 3 carros novos + 1 achado que NÃO virou linha (explicado abaixo). Todos
-- verificados direto em fonte oficial em 14/09/2026 (site oficial da marca,
-- PDF de ficha técnica/garantia baixado do próprio site, ou pente-fino contra
-- múltiplas fontes de imprensa quando o oficial não publica um número).
--
-- GAC GS4 Hybrid: SUV que a GAC já vende no Brasil (não é elétrico, é HEV —
-- "Tipo: HEV (gasolina)" confirmado na própria tabela de especificações
-- oficial do site GAC). Duas versões: Premium R$191.990 (usada aqui) e Elite
-- R$209.990. Garantia confirmada no PDF oficial "Manual de Garantia e
-- Manutenção GS4 HYBRID": 5 anos/150.000km veículo + 8 anos/150.000km
-- bateria de tração (uso particular).
--
-- Jetour T2 XWD 4x4: a marca Jetour JÁ estava no catálogo (S06, T1 e T2
-- PHEV normal, R$289.900) — o que faltava era essa variante off-road mais
-- cara e mais potente (R$349.900), que o próprio registro do T2 normal já
-- citava como pendente por falta de ficha confiável ("fontes divergem entre
-- 375cv, 597cv e 620cv"). Agora resolvido: ficha técnica oficial (PDF
-- baixado do site Jetour em 14/09/2026) confirma 597cv/900Nm — mas com uma
-- ressalva importante que a PRÓPRIA Jetour publica: "*Simples soma das
-- potências e torques individuais. Não disponível simultaneamente durante o
-- uso." Ou seja, não é uma potência de sistema real, é a soma dos 4 motores
-- (1 combustão + 3 elétricos) que nunca atua ao mesmo tempo por completo.
--
-- Volkswagen ID.4 Pro: PRIMEIRO carro Volkswagen no catálogo — a marca não
-- tinha nenhum carro eletrificado cadastrado até hoje. Confirmado à venda
-- (não é mais só assinatura Sign&Drive como em 2023): site oficial já tem
-- configurador/"Monte o Seu" funcionando, versão única Pro, R$299.990,
-- ano-modelo 2027. ATENÇÃO: não achei o número de airbags escrito na própria
-- página oficial da VW (só em agregadores de terceiros, que dizem 7) —
-- deixei em branco em vez de confiar numa fonte secundária não confirmada.
--
-- NÃO virou linha: ID.Buzz (a Kombi elétrica) também está na Volkswagen
-- Brasil, mas só é vendida por ASSINATURA (Sign&Drive, 24 ou 36 meses) — não
-- tem "preço de compra" convencional pra preencher a coluna `price`, que é o
-- modelo de dado que o catálogo inteiro usa. Preferi reportar isso pro
-- usuário e perguntar como tratar em vez de inventar um preço ou tratar
-- mensalidade de assinatura como se fosse preço à vista.
--
-- Também rechequei GS9/GS3 (GAC, ambos a gasolina puro, sem HEV/PHEV) e a
-- linha completa Jetour no site oficial (só existem S06/T1/T2/T2-4x4, T2 tem
-- Advance R$289.900 e Premium R$299.900, mesma mecânica — não abri linha
-- separada pra Premium, mesmo critério usado pro resto do catálogo).
--
-- Rode isso uma vez no SQL Editor do Supabase. Depois:
-- `node scripts/generate-fallback-snapshot.mjs` + commit do carsFallback.json.

insert into cars (
  id, name, brand, category, price, power_cv, torque_nm, battery_kwh, battery_chem,
  motor_type, range_km, accel, ground_clearance, trunk_l, weight_kg, wallbox, ac_kw, dc_kw,
  airbags, warranty, fuel_type, verified, price_verified_date, maintenance_interval,
  maintenance_first_cost, maintenance_km_base, maintenance_total_cost, consumption_kwh_100,
  tech_notes, image_url, video_url, personas
) values
(
  'gac-gs4-hybrid',
  'GAC GS4 Hybrid Premium',
  'GAC',
  'SUV compacto híbrido',
  191990,
  235,
  300,
  2.1,
  'Lítio ternário',
  'Híbrido HEV — motor 2.0 ATK (Atkinson) + motor elétrico dianteiro, plataforma GPMA, transmissão 2DHT (2 marchas dedicadas híbridas)',
  null,
  null,
  null,
  638,
  1641,
  null,
  null,
  null,
  6,
  '5 anos/150.000km veículo completo + 8 anos/150.000km bateria de tração (uso particular) — confirmado no PDF oficial "Manual de Garantia e Manutenção GS4 HYBRID" baixado do site GAC em 14/09/2026',
  'HEV',
  true,
  '14/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Versão de entrada (Premium, R$191.990) — existe também a Elite, mais equipada, R$209.990 (peso 1.673kg, rodas 19" vs 18" da Premium). Preços de tabela/lançamento — há relatos de imprensa de desconto na Premium (chegou a R$169.990 em promoções pontuais), não usado aqui por não ser o preço permanente. Ficha técnica oficial completa (tabela HTML do próprio configurador GAC, capturada em 14/09/2026): "Tipo: HEV (gasolina)" explícito nos dois trims — não é plug-in. Motor a combustão 2.0 ATK 103kW/140cv + 180Nm, motor elétrico 134kW/182cv + 300Nm (torque combinado de sistema NÃO é publicado — o valor usado aqui é só do motor elétrico, mesmo critério aplicado a outros HEV do catálogo como o Honda Civic). Potência combinada 173kW = 235cv, essa sim publicada explicitamente. Bateria pequena (2,1kWh, típica de HEV, não pluga) de lítio ternário. Consumo INMETRO: 14,1km/l cidade / 11,8km/l estrada. Dimensões: 4.680mm de comprimento, 1.901mm de largura, 1.660mm de altura, 2.750mm de entre-eixos. Porta-malas: 638 litros. Tração dianteira. Tanque: 50 litros. 6 airbags (frontais + laterais + cortina, confirmados individualmente na tabela oficial).',
  'https://br-www-resouce-cdn.gacgroup.com/static/BR/tenant/cms/common/202505/cfbbc55a-fa89-4d55-a80f-dd7b6e23968e.webp',
  null,
  '{"urbano":4,"familia":4,"aventura":2,"performance":3,"custo":4}'::jsonb
),
(
  'jetour-t2-4x4-xwd',
  'Jetour T2 XWD 4x4',
  'Jetour',
  'SUV híbrido',
  349900,
  597,
  900,
  43.2,
  'LFP',
  'PHEV combinado XWD (tração integral) — motor 1.5 Turbo (135cv) + 3 motores elétricos: 2 dianteiros (102cv + 122cv) e 1 traseiro (238cv), transmissão 3-DHT',
  1300,
  5.5,
  205,
  580,
  2362,
  null,
  7,
  40,
  6,
  '7 anos/150.000km veículo completo + 8 anos/160.000km bateria e motor elétrico',
  'PHEV',
  true,
  '14/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Variante off-road mais cara e mais potente do T2 (que já estava no catálogo como "Jetour T2 PHEV", R$289.900/Advance) — essa ficha já apontava a existência do XWD 4x4 mas sem número confiável ("fontes divergem entre 375cv, 597cv e 620cv"). RESOLVIDO: ficha técnica oficial em PDF (baixada do site Jetour em 14/09/2026) confirma 597cv e ~900Nm (91,7kgfm somado) — mas com uma ressalva publicada pela PRÓPRIA Jetour junto do número: "*Simples soma das potências e torques individuais. Não disponível simultaneamente durante o uso." Ou seja, os 4 motores (1 combustão 135cv/20,4kgfm + 3 elétricos: 102cv/17,3kgfm, 122cv/22,4kgfm, 238cv/31,6kgfm) nunca entregam a soma total ao mesmo tempo — é uma cifra de marketing, não uma potência de sistema real medida. Mantive mesmo assim por ser o único número oficial e por ser exatamente o mesmo critério que o resto do catálogo já usa pra "potência combinada" quando a montadora só soma componentes. Bateria 43,2kWh LFP, alcance total até 1.300km, 0-100km/h em 5,5s, velocidade máxima 197km/h. Consumo: 10,0km/l gasolina (ciclo PBEV 55%-45%). Carregamento CCS2, AC 7kW / DC 40kW (30-80% em 37min). Dimensões: 4.785mm de comprimento, 2.006mm de largura, 1.875mm de altura, 2.800mm de entre-eixos. Porta-malas: 580L normal / 1.494L máximo. Vão livre: 205mm. Peso: 2.362kg. Garantia (do próprio PDF oficial): veículo 7 anos/150.000km + bateria/motor elétrico 8 anos/160.000km. Airbags: a ficha oficial só itemiza explicitamente "airbags laterais (dianteiro, motorista e passageiro)" e "airbags de cabeça (dianteiro e traseiro)" — sem citar frontais por nome (provavelmente por serem item de série básico assumido). Usei 6 (mesmo total do T2 PHEV normal, mesma plataforma/marca) por analogia, não por contagem literal desta ficha específica — vale reconfirmar na concessionária antes de qualquer decisão que dependa desse número.',
  'https://jetourbr.com/wp-content/uploads/2026/07/t2-4x4-cover-1.webp',
  null,
  '{"urbano":1,"familia":3,"aventura":5,"performance":5,"custo":1}'::jsonb
),
(
  'volkswagen-id4-pro',
  'Volkswagen ID.4 Pro',
  'Volkswagen',
  'SUV elétrico',
  299990,
  286,
  545,
  84,
  null,
  '100% elétrico — motor elétrico traseiro (tração traseira), plataforma MEB, produzido na Alemanha',
  389,
  6.7,
  null,
  533,
  null,
  null,
  11,
  185,
  null,
  '3 anos veículo + 8 anos/160.000km bateria (garantia mínima de 70% de capacidade) — política padrão global da linha VW ID, não encontrado o texto exato repetido na página oficial brasileira do ID.4',
  'BEV',
  true,
  '14/09/2026',
  null,
  null,
  null,
  null,
  21.6,
  'PRIMEIRO carro Volkswagen no catálogo — a marca não tinha nenhum modelo eletrificado cadastrado até 14/09/2026. Confirmado à venda de forma convencional (não é mais só assinatura Sign&Drive, como era em 2023): site oficial vw.com.br já tem "Monte o Seu" funcionando pro ID.4, ano-modelo 2027, versão única Pro. Ficha oficial (página do modelo, capturada em 14/09/2026): motor elétrico de 210kW entrega 286cv e 545Nm de torque, bateria de 84kWh, autonomia de 389km (INMETRO), recarga DC até 185kW / AC até 11kW, porta-malas de 533 litros, entre-eixos de 2.771mm — todos esses números confirmados direto no texto da página oficial. Comprimento (4.584mm), largura (1.852mm), altura (1.634mm), aceleração 0-100km/h (6,7s) e velocidade máxima (180km/h) vêm de múltiplas fontes de imprensa consistentes entre si (incluindo a cifra de torque em kgfm — 55,6kgfm bate exatamente com os 545Nm — o que dá confiança), mas não foram encontrados literalmente escritos na página oficial. Consumo (21,6 kWh/100km) é CALCULADO por nós (84kWh ÷ 389km × 100), a VW não publica esse número diretamente. ATENÇÃO: não encontrei o número de airbags na própria página oficial da VW — agregadores de terceiros citam 7, mas como isso NÃO está confirmado em fonte primária, deixei o campo em branco em vez de repetir um número não verificado (mesmo cuidado do caso Kicks). Química da bateria e peso não encontrados em nenhuma fonte oficial até 14/09/2026. NOTA: a Volkswagen também vende o ID.Buzz (Kombi elétrica) no Brasil, mas só por assinatura (Sign&Drive, 24-36 meses) — não tem preço de compra convencional, por isso não virou linha no catálogo (reportado ao usuário separadamente).',
  'https://assets.volkswagen.com/is/image/volkswagenag/id4-my27-externa-frente?fit=crop,1&fmt=webp-alpha&qlt=79&wid=1280&hei=1280&align=0.00,0.00&bfc=off',
  null,
  '{"urbano":3,"familia":4,"aventura":2,"performance":3,"custo":2}'::jsonb
)
on conflict (id) do update set
  name = excluded.name, brand = excluded.brand, category = excluded.category, price = excluded.price,
  power_cv = excluded.power_cv, torque_nm = excluded.torque_nm, battery_kwh = excluded.battery_kwh,
  battery_chem = excluded.battery_chem, motor_type = excluded.motor_type, range_km = excluded.range_km,
  accel = excluded.accel, ground_clearance = excluded.ground_clearance, trunk_l = excluded.trunk_l,
  weight_kg = excluded.weight_kg, wallbox = excluded.wallbox, ac_kw = excluded.ac_kw, dc_kw = excluded.dc_kw,
  airbags = excluded.airbags, warranty = excluded.warranty, fuel_type = excluded.fuel_type,
  verified = excluded.verified, price_verified_date = excluded.price_verified_date,
  maintenance_interval = excluded.maintenance_interval, maintenance_first_cost = excluded.maintenance_first_cost,
  maintenance_km_base = excluded.maintenance_km_base, maintenance_total_cost = excluded.maintenance_total_cost,
  consumption_kwh_100 = excluded.consumption_kwh_100, tech_notes = excluded.tech_notes,
  image_url = excluded.image_url, video_url = excluded.video_url, personas = excluded.personas;
