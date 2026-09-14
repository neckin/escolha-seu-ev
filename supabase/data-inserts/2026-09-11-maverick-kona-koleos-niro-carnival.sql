-- Resposta à pergunta do usuário em 11/09/2026: "Na ford, temos a maverick,
-- tem mais alguma marca com modelos?" — confirmação do Ford Maverick Hybrid
-- + varredura de outras marcas (Hyundai, Kia, Renault, além de reconfirmar
-- VW, Subaru, Mitsubishi, Chevrolet, Fiat e Jeep, que não têm HEV real —
-- Fiat só tem MHEV 48V, que não entra na nossa definição de HEV; Mitsubishi
-- só tem Outlander PHEV, mesmo aparecendo "Híbrido" genérico no CMS deles).
--
-- Todos os 5 carros abaixo verificados direto em fonte oficial em 11/09/2026:
-- catálogo PDF baixado do site oficial (Ford, Hyundai, Renault) ou ficha
-- técnica completa extraída do próprio site (Kia, que publica a ficha
-- técnica em tabela HTML muito completa, com bateria/dimensões/porta-malas
-- inclusive).
--
-- Ford Maverick Hybrid: motor 2.5L Atkinson FHEV, 194cv combinado. Torque
-- (210Nm) vem com um "*" na ficha oficial Ford sem nota explicativa visível
-- — mantido mesmo assim por ser o único número publicado. ATENÇÃO: garantia
-- de bateria de só 12 meses (vs. 8 anos padrão Toyota/Honda/Hyundai/Kia) —
-- destoa MUITO do resto do mercado, vale destacar pro usuário.
--
-- Hyundai KONA Híbrido: 2 versões (Ultimate R$219.990 e Signature R$239.990,
-- essa mais cara/completa) — usei a Ultimate (entrada) como versão principal,
-- Signature anotada em tech_notes. Motor Kappa 1.6 GDI HEV + PMSM elétrico,
-- 141cv combinado, 27kgf.m (264,8Nm) combinado — igual ao Kia Niro (mesma
-- família de motor Kappa 1.6, plataforma-irmã do grupo Hyundai/Kia).
--
-- Renault Koleos full hybrid E-Tech: só 1 versão no Brasil (esprit Alpine,
-- R$293.490). Motor a gasolina + dois motores elétricos, 245cv combinado.
-- Renault só publica o torque do conjunto elétrico (320Nm) — não publica um
-- torque combinado de sistema em nenhuma página/PDF oficial encontrada.
--
-- Kia Niro HEV: 2 versões (N.855 R$194.990 e N.861 R$219.990, mesma
-- mecânica, diferem só em equipamento) — usei a N.855 (entrada) como
-- principal. Motor Kappa III 1.6L GDI HEV, 141cv combinado.
--
-- Kia Carnival Full Hybrid: minivan híbrida nova pro catálogo (categoria
-- inédita) — só 1 versão (V.851, R$684.990). Motor Gamma II 1.6 Turbo GDI +
-- HEV, 245cv combinado, bateria 1,485kWh Li-Po — é o único dos 5 carros
-- desta leva cuja ficha oficial publica a capacidade exata da bateria em
-- kWh. 8 lugares, 8 airbags.
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
  'ford-maverick-hybrid',
  'Ford Maverick Hybrid',
  'Ford',
  'Picape híbrida',
  239900,
  194,
  210,
  null,
  null,
  'Híbrido FHEV — motor 2.5L Atkinson + motor elétrico, tração AWD Inteligente',
  null,
  null,
  null,
  null,
  1829,
  null,
  null,
  null,
  7,
  '3 anos veículo sem limite de km / bateria: 12 meses sem limite de km',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Ficha oficial Ford (catálogo técnico PDF, baixado do site em 11/09/2026): potência combinada 194cv@5600rpm, torque 210Nm@4000rpm (esse número vem com um "*" na tabela oficial, sem nota explicativa localizada — mantido por ser o único publicado). Transmissão eCVT (as outras versões da picape, a combustão, usam automática de 8 velocidades). Caçamba com 943 litros de capacidade (não é "porta-malas" — é picape; capacidade de carga total 584kg). Dimensões: 5.096mm de comprimento, 3.077mm de entre-eixos, 1.733mm de altura, 1.979mm de largura sem espelho. Tanque de combustível menor que as versões a combustão: 52,2L (vs 62,4L). 7 airbags (dianteiros, laterais, cortina e joelho do motorista) — item de série em toda a linha Maverick. ATENÇÃO: garantia da bateria é de apenas 12 MESES sem limite de km — muito abaixo do padrão de 8 anos que Toyota, Honda, Hyundai e Kia praticam pros próprios sistemas híbridos no Brasil; vale destacar isso pro usuário antes de qualquer recomendação. Preço confirmado no site oficial em 11/09/2026 (mesmo valor da versão Tremor, a combustão).',
  'https://www.ford.com.br/content/dam/Ford/website-assets/latam/br/nameplate/2025/maverick/overview/billboards/fbr-billboard-maverick-black.jpg',
  null,
  '{"urbano":3,"familia":3,"aventura":4,"performance":2,"custo":2}'::jsonb
),
(
  'hyundai-kona-hibrido',
  'Hyundai KONA Híbrido Ultimate',
  'Hyundai',
  'SUV compacto híbrido',
  219990,
  141,
  265,
  null,
  null,
  'Híbrido HEV — motor Kappa 1.6 GDI + motor elétrico PMSM, bateria 1,32kWh',
  null,
  11.2,
  null,
  407,
  null,
  null,
  null,
  null,
  6,
  '5 anos veículo sem limite de km / 8 anos ou 160.000km para componentes híbridos',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Versão de entrada (Ultimate, R$219.990) — existe também a Signature, mais completa e mais cara, R$239.990 (confirmado ao trocar a versão no seletor oficial do site em 11/09/2026). Ficha oficial (site + catálogo PDF Hyundai, baixados em 11/09/2026): motor Kappa 1.6 GDI + motor elétrico PMSM, bateria 1,32kWh, potência combinada 141cv, torque combinado 27kgf.m (264,8Nm, arredondado pra 265). Transmissão automatizada de dupla embreagem de 6 marchas (DCT). Velocidade máxima 165km/h, 0-100km/h em 11,2s. Consumo: 18,4km/l cidade / 16km/l estrada. Dimensões: 4.350mm de comprimento, 1.825mm de largura, 1.680mm de altura (antena excluída), 2.660mm de entre-eixos. Porta-malas: 407 litros. 6 airbags (frontal duplo + laterais de tórax + cortina — contados na lista de equipamentos do catálogo oficial, sem um número "6" publicado explicitamente em texto corrido). Garantia: 5 anos geral sem limite de km + 8 anos/160.000km específico pra bateria/componentes híbridos (texto legal do catálogo oficial).',
  'https://www.hyundai.com.br/content/dam/hmb/cars/kona/2025-2026/new_assets/360_v2/KONA_HEV-Atlas_White_01.webp',
  null,
  '{"urbano":4,"familia":3,"aventura":2,"performance":3,"custo":3}'::jsonb
),
(
  'renault-koleos-hybrid-e-tech',
  'Renault Koleos esprit Alpine full hybrid E-Tech',
  'Renault',
  'SUV médio híbrido',
  293490,
  245,
  320,
  null,
  null,
  'Híbrido full hybrid E-Tech autocarregável — motor a gasolina + dois motores elétricos, câmbio Dual Hybrid Transmission (DHT)',
  null,
  null,
  null,
  545,
  null,
  null,
  null,
  null,
  7,
  '5 anos veículo sem limite de km / 8 anos sem limite de km para a bateria',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Única versão do Koleos híbrido vendida no Brasil (esprit Alpine, "1 versões disponíveis" confirmado na página oficial de versões e preços) — não existe trim de entrada mais barato. Ficha oficial (site + catálogo PDF Renault, baixados em 11/09/2026): potência combinada 245cv@5500rpm. A Renault publica só o torque do conjunto elétrico — "245cv com um motor a gasolina e dois motores elétricos totalizando 320Nm de torque elétrico" —, sem uma cifra de torque combinado de sistema em nenhuma fonte oficial encontrada; o valor registrado aqui (320Nm) é esse torque elétrico, não necessariamente o torque total combinado do sistema. Até 75% de condução elétrica na cidade (dado interno Renault), autocarregável (não pluga). Consumo: 13,1km/l cidade. Dimensões: 4.780mm de comprimento, 1.880mm de largura, 1.680mm de altura, 2.820mm de entre-eixos. Porta-malas: 545 litros. 7 airbags (2 frontais + 2 laterais + 2 de cortina + 1 entre os bancos dianteiros — número "7 airbags" publicado explicitamente no catálogo oficial). Garantia: 5 anos sem limite de km geral + 8 anos sem limite de km pra bateria (texto legal do catálogo oficial, ano/modelo 2026/2027). Bateria: capacidade em kWh não publicada em nenhuma fonte oficial encontrada.',
  'https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/aurora/overview/renault-koleos-header-desktop-001.jpg.ximg.large.jpg/f4054159ad.jpg',
  null,
  '{"urbano":3,"familia":5,"aventura":2,"performance":3,"custo":1}'::jsonb
),
(
  'kia-niro-hev',
  'Kia Niro HEV',
  'Kia',
  'SUV compacto híbrido',
  194990,
  141,
  265,
  null,
  'Polímero de Lítio-Ion',
  'Híbrido HEV de alta tensão — motor Kappa III 1.6L GDI + motor elétrico síncrono de ímã permanente, carregamento interno via motor a combustão',
  null,
  null,
  null,
  425,
  1394,
  null,
  null,
  null,
  7,
  '8 anos ou 160.000km para bateria de alta voltagem',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Versão de entrada (código N.855.2627, R$194.990) — existe também a N.861.2627, mais equipada, R$219.990; mesma mecânica nas duas (ficha técnica idêntica), só mudam itens de série. Preços de tabela — o site também mostra um bônus promocional temporário de R$20.000 (válido até 30/09/2026 ou fim de estoque), não usado aqui por não ser o preço permanente. Ficha técnica oficial completa (tabela HTML do próprio site Kia, capturada em 11/09/2026): potência combinada 141cv@5.700rpm, torque combinado 27kgf.m@4.000rpm (264,8Nm, arredondado pra 265) — mesmo motor Kappa 1.6 do Hyundai KONA Híbrido (plataforma-irmã Hyundai/Kia). Transmissão DCT de 6 marchas, tração dianteira 4x2. Dimensões: 4.420mm de comprimento, 1.825mm de largura, 1.545mm de altura, 2.720mm de entre-eixos. Porta-malas: 425L normal / 1.419L com banco rebatido (medida VDA). Peso em ordem de marcha: 1.394kg. 7 airbags (frontais duplos + laterais dianteiros + cortina + joelho do motorista, listados individualmente na ficha oficial). Bateria: química Polímero de Lítio-Ion confirmada na ficha oficial, mas capacidade em kWh não publicada.',
  'https://dynamics365kiasiteblob.kia.com.br/cdn-cgi/image/fit=scale-down,format=auto,width=1280/images/kia-niro-fotos-lancamento-externo-pista-frente-perto_1x.jpg',
  null,
  '{"urbano":5,"familia":3,"aventura":2,"performance":2,"custo":4}'::jsonb
),
(
  'kia-carnival-hybrid',
  'Kia Carnival Full Hybrid',
  'Kia',
  'Minivan híbrida',
  684990,
  245,
  367,
  1.485,
  'Polímero de Lítio-Ion',
  'Híbrido HEV — motor Gamma II 1.6 Turbo GDI + motor elétrico síncrono de ímã permanente',
  null,
  null,
  null,
  627,
  2220,
  null,
  null,
  null,
  8,
  '8 anos ou 160.000km para bateria de alta voltagem (padrão Kia — não reconfirmado especificamente na página deste modelo)',
  'HEV',
  true,
  '11/09/2026',
  null,
  null,
  null,
  null,
  null,
  'Minivan híbrida, categoria nova pro catálogo. Versão única (código V.851.2627, R$684.990). Ficha técnica oficial completa (tabela HTML do próprio site Kia, capturada em 11/09/2026): bateria 1,485kWh (Polímero de Lítio-Ion, 270V nominal — o único dos 5 carros desta leva com kWh publicado oficialmente), motor elétrico 54kW/2.600rpm + 30,4kgf.m/1.600rpm, motor a gasolina Gamma II 1.6 Turbo GDI 180cv/5.500rpm + 26,2kgf.m/4.500rpm, potência COMBINADA 245cv@5.500rpm, torque combinado 37,4kgf.m@4.500rpm (366,8Nm, arredondado pra 367). Transmissão automática de 6 marchas, tração dianteira 4x2. Dimensões: 5.155mm de comprimento, 1.995mm de largura, 1.750mm de altura, 3.090mm de entre-eixos — a maior das 5 desta leva. Porta-malas: 627L normal / 2.827L com 2ª e 3ª fileiras rebatidas. 8 lugares. Peso em ordem de marcha: 2.220kg. 8 airbags (frontais duplos + laterais e central dianteiros + cortina nas 3 fileiras + joelho do motorista — "8 Airbags" anunciado explicitamente na página do modelo). Garantia de bateria de 8 anos/160.000km é o padrão que a Kia anuncia pro Niro HEV (mesma marca, mesma tecnologia de bateria) — não foi encontrado um texto específico repetindo essa garantia na página da Carnival, por isso a ressalva.',
  'https://dynamics365kiasiteblob.kia.com.br/cdn-cgi/image/fit=scale-down,format=auto,width=1280/images/kia-carnival-hibrida-banner-frontal-1_1x.jpg',
  null,
  '{"urbano":2,"familia":5,"aventura":1,"performance":3,"custo":1}'::jsonb
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
