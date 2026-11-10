# Novas marcas de eletrificados para o catálogo — pesquisa de 10/11/2026

> **Atualização (10/11/2026, segunda rodada).** As decisões do usuário viraram o SQL `supabase/data-inserts/2026-11-10-novas-marcas.sql`, com 16 carros. A verificação em fonte oficial mudou três pontos desta pesquisa:
> - **Mercedes-Benz não vende nenhum elétrico hoje.** A página de elétricos do site oficial diz "No momento, não existe nenhum modelo adequado para esta seleção". A tabela de preços de 2025 abaixo está desatualizada. A marca entra só com os 6 plug-ins AMG da página oficial, com estes preços: C 63 por R$ 928.900, GLC 63 Coupé por R$ 968.900, S 63 por R$ 1.731.900, GT 63 4 portas por R$ 1.617.900, GT 63 2 portas por R$ 1.735.900 e SL 63 por R$ 1.755.900.
> - **O Tiggo 9 PHEV já está à venda**, por R$ 299.990 no site oficial. Tem 428cv, AWD, bateria de 34,46kWh e 108km no modo elétrico. Ele entrou no SQL.
> - **A autonomia elétrica dos Tiggo foi resolvida pela tabela PBEV rev. 25/08/2026 e pela ficha oficial:** 68km no Tiggo 7 e 70km no Tiggo 8.

Objetivo: achar marcas com venda **oficial** de elétricos (BEV), híbridos plug-in (PHEV) ou híbridos plenos (HEV) no Brasil que ainda **não** estão no catálogo.

Marcas que já estão no catálogo (`src/carsFallback.json`, 21/10/2026): Audi, Avatr, BMW, BYD, Chevrolet, Denza, Fiat, Ford, GAC, Geely, GWM, Honda, Hyundai, JAC, JAECOO, Jetour, Kia, Land Rover, Leapmotor, Lexus, MG, Mini, Mitsubishi, Omoda, Porsche, Renault, Toyota, Volkswagen, Volvo, Zeekr.

> **Grau de confiança das fontes.** Só a tabela da Mercedes-Benz é fonte primária: o PDF de preços da assessoria de imprensa, extraído com `pdftotext`. Os sites oficiais da Mercedes e da Peugeot bloquearam o acesso automático (HTTP 403). O da Riddara está com o certificado HTTPS vencido. O resto vem da imprensa automotiva com nome (Autoentusiastas, Canal VE, Autodata, Vrum, Webmotors, Autoo). Pela regra [[catalog-verification-rigor]], cada preço e cada ficha técnica precisa ser conferido no site oficial ou no PBEV antes de entrar como `verified = true`.

---

## A. Prontas para entrar no catálogo (venda oficial confirmada)

### 1. Caoa Chery: PHEV
Importadora/fabricante: CAOA (Anápolis-GO). Site: caoachery.com.br

| Modelo | Preço | Potência / torque | Bateria | Autonomia elétrica (PBEV) | Observações |
|---|---|---|---|---|---|
| Tiggo 7 Pro PHEV (linha 2027) | R$ 199.990 (lançado a R$ 189.990 em jun/2026 e reajustado em R$ 10 mil dias depois) | 279 cv / 365 Nm | 18,4 kWh | 68 km (Vrum e Webmotors); o Encontra Carros dá 70 km | Sistema CCSH: 1.5 turbo GDI, 2 motores elétricos, DHT. DC 30–80% em cerca de 20 min. V2L. Garantia de 7 anos (veículo) e 8 anos (bateria) |
| Tiggo 8 Pro PHEV (linha 2027) | R$ 239.990 (lançado a R$ 229.990) | 279 cv / 365 Nm | 18,4 kWh | 70 km (Vrum); o Encontra Carros dá 68 km | 7 lugares. O resto é igual ao Tiggo 7 |

- **Pendente:** a autonomia elétrica de 68 ou 70 km está trocada entre as fontes; conferir na tabela PBEV. Faltam também a potência AC/DC em kW, o consumo em km/l e o porta-malas.
- **Fora do escopo:** Tiggo 5X Pro Hybrid e Tiggo 7 Pro Hybrid são híbridos leves de 48 V. O Tiggo 5X híbrido pleno ficou para 2027. Sobre o Tiggo 9 PHEV não há preço confiável.

### 2. Caoa Changan: PHEV flex
O Avatr 11 já está no catálogo com a marca "Avatr", mas a Changan como marca ainda não está. **Decidir:** o CS55 entra como "Changan" ou "CAOA Changan"? O PBEV escreve "CAOA CHANGAN".

| Modelo | Preço | Potência / torque | Bateria | Autonomia elétrica (PBEV) | Observações |
|---|---|---|---|---|---|
| CS55 PHEV | R$ 189.990 ("Celebration Price", promocional e sem data para acabar) | 286 cv / 47 kgfm (≈461 Nm) | 18,4 kWh | 76 km | 1.5 turbo TGDI **flex** com DHT. Autonomia combinada de 1.200 km. 0–100 em 7,2 s segundo uma fonte e 8,1 s segundo outra. Gasolina: 10,4 km/l na cidade e 12,1 km/l na estrada. Garantia de 7 anos/150 mil km e 8 anos/150 mil km na bateria. Lançado em set/2026 |

- O Uni-T (R$ 169.990, depois +R$ 7 mil) é só 1.5 turbo flex. A versão híbrida ainda está "em estudo", então fica fora.

### 3. BAIC (Arcfox): BEV, marca nova (lançada em 29/10/2026)

| Modelo | Preço | Ficha técnica |
|---|---|---|
| Arcfox T1 Pro | R$ 129.900 (promocional até 31/12/2026 ou até acabarem as 600 unidades iniciais; o preço normal não foi divulgado) | 95 cv, 17,9 kgfm (≈175 Nm), tração dianteira, 0–100 em 12,4 s, máx. 140 km/h. Bateria LFP de 42,3 kWh. **283 km no Inmetro** (310 WLTC). DC até 89 kW (30–80% em cerca de 25 min). AC 6,6 kW (cerca de 8 h). V2L/V2V. 4.337 × 1.860 × 1.572 mm, entre-eixos de 2.770 mm. 1.435 kg. Porta-malas de 459/1.352 L. 6 airbags |
| Arcfox T1 Max | R$ 139.900 | Mesma mecânica do Pro. **Pela convenção de versões, vai só no `tech_notes` da linha do Pro.** Acrescenta rodas de 18", teto panorâmico, ACC stop&go, centralização em faixa, frenagem autônoma e estacionamento automático |

- Entregas a partir de 11/11/2026. São 50 concessionárias na primeira fase, com meta de 150 até o fim de 2027. Centro de peças em Itajaí-SC (logística com a Foton).
- **Falta:** garantia e altura livre do solo.
- O T5 (800 V) foi anunciado, mas ainda não tem preço, então fica fora por enquanto.
- Fonte: Autoentusiastas, 11/2026.

### 4. DFM (Dongfeng): BEV, marca nova (vendas a partir de 31/10/2026)
Canal de venda: loja oficial no Mercado Livre, mais 60 concessionárias em 21 estados e no DF (meta de 145 em 2027). Mais de 200 unidades chegaram pelo Porto de Vitória.

| Modelo | Preço | Ficha técnica |
|---|---|---|
| DFM Box | R$ 135.900 (promocional até 31/12 ou fim do estoque) | 95 cv, 16,32 kgfm (≈160 Nm), máx. 140 km/h. Bateria LFP de 43,89 kWh. **cerca de 275 km no Inmetro**. DC até 88 kW (30–80% em cerca de 30 min). V2L. 4,02 m de comprimento, entre-eixos de 2,66 m. Porta-malas de 309 L. Garantia de até 7 anos (uma fonte). É o Nammi 01 chinês |
| DFM Vigo E2 | R$ 163.900; a versão mais equipada sai por R$ 169.900 | 163 cv, 23,45 kgfm (≈230 Nm), máx. 150 km/h. Bateria de 51,87 kWh. **302 km no Inmetro**. DC até 167 kW (30–80% em 18 min; **a potência no Brasil não está confirmada**). 4,306 m, entre-eixos de 2,715 m. Porta-malas de 500 L. Ponto cego, estacionamento automático, ADAS nível 2 |

- **Pendente:** confirmar se as duas versões do Vigo têm a mesma mecânica (se tiverem, vão numa linha só). Faltam airbags, peso e 0–100.

### 5. Lotus: BEV de luxo (vendas a partir de ago/2026)
Importadora: LTS Brasil (Grupo Bamaq). Duas lojas próprias em São Paulo, com planos para Curitiba, Brasília e Porto Alegre. Cerca de 70% das vendas devem ser sob encomenda.

| Modelo | Preço | Ficha técnica |
|---|---|---|
| Eletre 600 Sport SE | R$ 795.000 | 612 cv, 72,4 kgfm, bateria de 112 kWh (800 V), até 600 km WLTP, 0–100 em 4,5 s, 2.584 kg, suspensão a ar e eixo traseiro esterçante |
| Eletre 900 | R$ 995.000 | 918 cv, 100,5 kgfm, 112 kWh, 490 km (ciclo europeu), 0–100 em 2,95 s. **Linha separada**, porque a potência é diferente |
| Emeya 900 | R$ 975.000 | 918 cv, 0–100 em 2,7 s, Cx de 0,20. Cerca de 12 unidades no primeiro ano |

- A autonomia vem do WLTP, não do Inmetro; procurar no PBEV. A recarga não foi informada.
- O Emira é a combustão, então fica fora. O Eletre X (PHEV/REEV, 965 cv) está previsto para 2027.

### 6. Mercedes-Benz: BEV e PHEV
Fonte primária: tabela de preços da assessoria de imprensa (PDF criado em 18/09/2025, ano/modelo 2024–2026): `imprensa.mercedes-benz.com.br/storage/files/pg20UMDWiu7fFLQtVqrBubiB0bMUcg1RbBSCasUV.pdf`. **A tabela tem cerca de 14 meses: confirmar se cada modelo ainda está à venda e se o preço continua o mesmo.**

Elétricos:

| Modelo | Ano/modelo | Preço |
|---|---|---|
| EQA 250 | 2025 | R$ 379.900 |
| EQA 250 AMG Line | 2025 | R$ 399.900 (mesma mecânica do anterior, vai para o `tech_notes`) |
| EQB 250+ | 2025 | R$ 399.900 |
| EQB 350 4MATIC AMG Line | 2025 | R$ 449.900 (mecânica diferente, linha própria) |
| EQE 350+ AMG Line | 2025 | R$ 649.900 |
| EQE 350+ SUV AMG Line | 2025 | R$ 699.900 |
| EQS 450 4MATIC SUV | 2025 | R$ 939.900 |
| Mercedes-AMG EQE 53 4MATIC+ SUV | 2024 | R$ 894.900 |
| Mercedes-AMG EQS 53 4MATIC+ | 2024 | R$ 1.453.900 |

Híbridos plug-in (todos AMG):

| Modelo | Ano/modelo | Preço |
|---|---|---|
| AMG C 63 S E Performance | 2025 | R$ 914.900 |
| AMG GLC 63 S E Performance Coupé | 2025 | R$ 934.900 |
| AMG S 63 S E Performance | 2025 | R$ 1.639.900 |
| AMG GT 63 S E Performance 4 portas | 2025 | R$ 1.617.900 |
| AMG GT 63 S E Performance 2 portas | 2025 | R$ 1.697.900 |
| AMG SL 63 S E Performance | 2025 | R$ 1.714.900 |

- O resto da linha (CLA, GLA, GLB, Classe C, GLC 300, E 300, GLE, GLS) é **híbrido leve**. O novo CLA, em pré-venda desde 27/10/2026 a R$ 364.900, é o 200 híbrido leve. O CLA e o GLC elétricos (EQ) não têm lançamento no Brasil confirmado.
- **A ficha técnica ainda não foi levantada.** Buscar no site oficial (com navegador, por causa do 403) e no PBEV.

---

## B. Vendidas oficialmente, mas com dados antigos (checar antes)

### 7. Riddara (grupo Geely), picape BEV
- Distribuição pelo Grupo Timber. Primeira concessionária em Curitiba-PR (Bacacheri).
- RD6 Standard: R$ 249.990, bateria LFP de 63 kWh, 385 km no CLTC.
- RD6 Luxury: R$ 315.990, bateria de 86 kWh, 515 km no CLTC.
- Tração traseira. A versão 4x4 aparece em algumas fontes e é negada em outras.
- **Sinais de alerta:** os preços hoje são "sob consulta", os dados são de 2024–25 e o certificado HTTPS de riddara.com.br estava vencido em 10/11/2026. Confirmar se a operação ainda está ativa antes de cadastrar.

### 8. Peugeot, e-2008 (BEV)
- R$ 259.990, bateria de 54 kWh, 261 km no PBEV, AC trifásico de 11 kW, DC de 100 kW (80% em cerca de 30 min). Fonte: comunicado da Stellantis Media e Webmotors.
- **Não confirmei que ele continua à venda em 2026.** A linha 2027 do 208/2008 só foi divulgada com motores a combustão e híbridos. O e-208 de nova geração não tem previsão para o Brasil. O site oficial respondeu 403.

---

## C. Superesportivos PHEV (importação oficial; prioridade baixa para o público do site)
Preços aproximados, da Seu Dinheiro (2026):
- Ferrari 296 GTB: cerca de R$ 3,5 mi.
- Lamborghini Urus SE: R$ 3,8 mi.
- Lamborghini Revuelto: R$ 7,2 mi.
- Lamborghini Temerario: R$ 5,83 mi (car.blog.br, dez/2025).
- McLaren Artura: R$ 2,4 mi.
- Bentley (Bentayga/Continental): cerca de R$ 3 mi, sem confirmar qual versão é PHEV.
- Maserati: nenhum PHEV/BEV foi citado com preço no Brasil.

**Recomendação:** não cadastrar agora, porque o tíquete foge do público e a cotação de seguro online.

## D. Só híbrido leve (fora do escopo atual)
- Subaru (Forester/XV e-Boxer, via CAOA).
- Stellantis Bio-Hybrid 12/48 V (Jeep Renegade/Compass/Commander/Avenger, Fiat, Citroën Basalt/Aircross).
- Mercedes CLA/GLA/GLB/C/GLC/E.
- Caoa Chery Tiggo 5X/7 Pro Hybrid.
- Nissan: o Kicks nacional não tem eletrificação e o e-Power não está confirmado no Brasil.

## E. Anunciadas, sem venda ainda (NÃO cadastrar)
| Marca | Situação |
|---|---|
| Xpeng | CNPJ em SP desde jul/2025; operação comercial esperada para 2027 (G6 e P7+ cotados) |
| Lepas (Chery) | 2º semestre de 2027; L4, L6 e L8, com foco em PHEV flex |
| iCaur (Chery) | 1º trimestre de 2027, começando pelo V27; V23 e V25 depois |
| Deepal (Changan) | Sem data; fala-se em 2027 (G318 REEV) |
| Polestar | Informações conflitantes; nenhum comunicado oficial nem site .com/br (404) |
| Smart (#1/#3/#5) | Retorno "previsto para 2026", sem confirmação oficial |
| Lynk & Co | Sem confirmação |
| Kaiyi, Livan, Hongqi | Sem data |
| Nissan Leaf (3ª geração) | Não confirmado para o Brasil |

---

## Fontes
- Autoentusiastas, BAIC Arcfox T1: https://autoentusiastas.com.br/2026/11/baic-arcfox-t1-eletrico-lancamento-brasil/
- Mixvale, entregas do T1: https://www.mixvale.com.br/2026/11/04/baic-arcfox-t1-comeca-a-ser-entregue-em-11-de-novembro-por-r-129-900/
- Canal VE, DFM: https://canalve.com.br/dfm-chega-ao-brasil-dois-carros-eletricos-60-concessionarias/
- TV Sim, preços DFM / Mercado Livre: https://tvsimbrasil.com.br/brasil/automotivo/noticia/2026/10/31/eletrico-chines-dfm-box-chega-brasil-mercado-livre
- Vrum, DFM Vigo E2: https://www.vrum.com.br/mercado/2026/10/7528688-dfm-vigo-e2-custa-rs-163-900-e-estreia-no-mercado-livre.html
- Autodata, Tiggo 7/8 PHEV CCSH: https://www.autodata.com.br/noticias/2026/06/01/caoa-chery-renova-tiggo-7-e-8-phev-com-novo-sistema-hibrido-ccsh/105003/
- Vrum, reajuste dos Tiggo PHEV: https://www.vrum.com.br/noticias/2026/06/7438144-caoa-chery-tiggo-7-e-tiggo-8-phev-ficam-ate-10-mil-reais-mais-caros.html
- Vrum, autonomia dos Tiggo PHEV: https://www.vrum.com.br/aceleradas/2026/06/7432159-caoa-chery-renova-tiggo-7-e-8-phev-e-reduz-precos-em-ate-rs-40-mil.html
- Autopapo, CS55: https://autopapo.com.br/noticia/caoa-changan-cs55/
- Vrum, CS55 PHEV x rivais: https://www.vrum.com.br/aceleradas/2026/09/7506968-caoa-changan-cs55-phev-vs-rivais-quem-tem-a-maior-autonomia-eletrica.html
- Webmotors, Uni-T híbrido: https://www.webmotors.com.br/wm1/noticias/caoa-changan-uni-t-versao-hibrida
- Vrum, preços da Lotus: https://www.vrum.com.br/mercado/2026/08/7476997-lotus-chega-ao-brasil-veja-os-precos-de-eletre-emeya-e-emira.html
- Mercedes-Benz, tabela de preços: https://imprensa.mercedes-benz.com.br/storage/files/pg20UMDWiu7fFLQtVqrBubiB0bMUcg1RbBSCasUV.pdf
- Novo CLA: https://surgiu.com.br/2026/10/27/novo-mercedes-benz-cla-entra-em-pre-venda-no-brasil-por-r-3649-mil/
- Autoo, Riddara RD6: https://www.autoo.com.br/riddara-rd6-a-picape-eletrica-com-jeito-de-toro-e-preco-de-ranger/
- Stellantis Media, e-2008: https://www.media.stellantis.com/br-pt/peugeot/press/peugeot-inicia-vendas-do-novo-peugeot-e-2008-no-brasil
- Seu Dinheiro, superesportivos: https://www.seudinheiro.com/2026/lifestyle/de-sonho-de-consumo-a-preco-de-tabela-como-r-1-milhao-virou-o-novo-normal-do-luxo-lefp/
- Webmotors, Xpeng: https://www.webmotors.com.br/wm1/segredos/xpeng-deve-atuar-brasil-2027
- Vrum, Lepas: https://www.vrum.com.br/mercado/2026/10/7524354-nova-marca-lepas-chega-ao-brasil-com-suvs-ineditos-e-motor-hibrido-flex.html
- Webmotors, iCaur: https://www.webmotors.com.br/wm1/noticias/icaur-estreia-brasil-2027
