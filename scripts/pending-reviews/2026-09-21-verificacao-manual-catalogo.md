# Verificação manual do catálogo — 21/09/2026

Motivo: a triagem automática semanal (GitHub Actions, `scan-channels.mjs` +
`scan-brand-sites.mjs`) está falhando desde 14/09/2026 por falta do secret
`ANTHROPIC_API_KEY` no repositório. Enquanto isso não é resolvido, esta é uma
varredura manual dos 126 carros do catálogo (`src/carsFallback.json`),
dividida em 4 lotes por marca, cada um verificado por fetch direto nas
páginas/configuradores oficiais das marcas (nunca por resumo de busca — ver
memória `catalog-verification-rigor`).

Nada aqui foi aplicado ao Supabase/`carsFallback.json` ainda — é material para
revisão humana antes de qualquer UPDATE/INSERT.

---

## 1. Mudanças de preço confirmadas (fonte oficial direta)

| Carro | Preço atual (catálogo) | Preço oficial agora | Fonte |
|---|---|---|---|
| BMW X5 xDrive50e M Sport | R$864.950 | R$859.950 | bmw.com.br |
| MINI Aceman E | R$254.990 | R$275.990 | mini.com.br (PDF tabela set/2026) |
| Land Rover Range Rover P550e Autobiography | R$1.709.650 | R$1.773.950 | rangerover.com/pt-br |
| Land Rover Range Rover Sport P550e Autobiography | R$1.274.450 | R$1.282.850 | rangerover.com/pt-br |
| Land Rover Range Rover Velar P400e | R$733.786 | R$769.769 | rangerover.com/pt-br |
| Jetour S06 | R$204.900 | R$199.900 | jetourbr.com |
| Jetour T1 | R$254.900 | R$249.900 | jetourbr.com |
| Renault Koleos esprit Alpine full hybrid E-Tech | R$293.490 | R$289.990 | renault.com.br |
| GWM Haval H6 PHEV19 | R$248.000 | R$250.000 | gwmmotors.com.br |
| GWM Ora 5 | R$159.900 | R$163.990 | gwmmotors.com.br |
| Hyundai Ioniq 5 | R$394.990 | R$409.990 | hyundai.com.br |
| Neta Aya | R$128.900 | R$143.900 | netaauto.com.br |
| Porsche Macan Electric | R$560.000 | R$690.000 (trim agora "Macan 4") | models.porsche.com |
| Volvo EC40 Plus | R$334.950 | R$350.950 | volvocars.com/br/build |
| Volvo EC40 Ultra | R$384.950 | R$405.950 | volvocars.com/br/build |
| Volvo EX30 | R$239.950 | R$249.950 | volvocars.com/br/build |
| Volvo EX30 Ultra Twin Motor | R$309.950 | R$319.950 | volvocars.com/br/build |
| Volvo EX40 | R$329.950 | R$345.950 | volvocars.com/br/build |
| Volvo EX40 Ultra P8 | R$375.700 | R$400.950 | volvocars.com/br/build |
| Volvo EX90 | R$849.990 | R$849.950 | volvocars.com/br/build |
| Volvo XC60 Recharge T8 | R$459.950 | R$469.950 | volvocars.com/br/build |
| Volvo XC90 Recharge T8 | R$679.950 | R$699.950 | volvocars.com/br/build |
| Chevrolet Captiva EV Premier | R$199.990 | R$219.990 | chevrolet.com.br (PDF de preços) |
| Chevrolet Spark EUV | R$144.990 | R$154.990 | chevrolet.com.br (PDF de preços) |
| GAC Aion ES Plus | R$169.990 | R$170.990 (nome oficial só "Aion ES") | gacgroup.com |
| Mitsubishi Outlander PHEV HPE-S | R$374.990 | R$379.990 (promo atual R$324.990) | mitsubishimotors.com.br |
| BYD Dolphin SE | R$159.990 | R$169.990 | byd.com/br/ofertas |
| BYD King PHEV (GS) | R$175.990 | R$166.990 (promocional; lista ainda R$175.990) | byd.com/br/ofertas |
| BYD Seal | R$269.800 | R$299.990 | byd.com/br/ofertas |
| BYD Shark PHEV | R$379.800 | R$344.990 (PJ: R$299.990) | byd.com/br/ofertas |
| BYD Tan | R$536.800 | R$426.800 (trim "2025" saiu de linha, novo "Tan" sem sufixo) | byd.com/br/ofertas |
| Lexus NX 450h+ | R$457.900 | R$499.990 | lexus.com.br |
| Lexus RX 450h+ | R$609.990 | R$614.990 | lexus.com.br |
| Toyota Corolla Cross Hybrid XRX | R$223.790 | R$226.120 (MY2027) | toyota.com.br |

## 2. Possíveis descontinuações (sumiram da grade oficial)

- **BMW i5** e **BMW iX** — não aparecem mais na grade BEV oficial (bmw.com.br). Imprensa (secundário) aponta remoção ~mai/2026.
- **BMW iX1 eDrive20** (trim base, R$359.950 no catálogo) — só resta "iX1 xDrive30 M Sport" (R$485.950) no site.
- **Renault Kwid E-Tech** — sumiu da página oficial de elétricos; imprensa (secundário) aponta fim de vendas ~abr/2026.
- **Jeep Grand Cherokee 4xe** — Grand Cherokee inteiro saiu da navegação oficial da Jeep Brasil (jeep.com.br). Compass 4xe também não existe mais (configurador só mostra flex).
- **Chevrolet Equinox EV** — sumiu das páginas de marketing (`/eletrico`), embora ainda apareça (a R$349.990, não R$419.000) na tabela PDF interna — provavelmente estoque residual, não à venda ativamente.
- **Porsche Taycan** (trim base/4S sedan) — grade atual só tem GTS, Turbo S, Turbo GT (sedan) + 4S/Turbo Cross Turismo (wagon); mais barato agora é o GTS a R$1.110.000, bem acima do R$893.115 catalogado.
- **Peugeot e-2008** — página 404, linha 2008 agora é só MHEV. Substituto e-3008 ainda não lançado (página também 404).

## 3. Não confirmável em fonte oficial (não mude sem checar de novo)

- **Denza B5** — site oficial confirma o modelo ativo, mas não publica preço em lugar nenhum.
- **JAECOO 7 PHEV** — site sem tabela de preço; R$234.990 só aparece em fonte de revenda/imprensa.
- **Volkswagen ID.4 Pro** — a página oficial da VW diz explicitamente que o preço ainda não foi divulgado ("Vem aí"). O R$299.990 do catálogo (verificado 14/09) não bate com isso — vale checar de onde veio esse número.
- **MINI** (Countryman SE ALL4, JCW Aceman E, JCW Cooper E, Aceman SE, Cooper SE) — site começou a bloquear/rate-limitar após 1 checagem; existe PDF oficial de preços de setembro mas não foi possível baixar.
- **Honda** (Accord, CR-V, Civic Advanced Hybrid, Prelude) — confirmado que continuam à venda, mas a Honda BR não publica preço em nenhuma página (modelo é cotação com concessionária).
- **Fiat 500e** — fiat.com.br totalmente inacessível nesta rodada (timeout/DNS em todas as variações de URL testadas). Não confie em rumores de descontinuação/substituição pelo 600e vistos em busca — não confirmado na fonte oficial.
- **Leapmotor** (B10, C10, C10 REEV) — site 100% client-side, não deu pra extrair nada.
- **MG** (Cyberster, S5, MG4, MG4 Urban) — site não publica preço (só "solicite cotação"); lineup confirmado sem mudanças.
- **Zeekr** (001, 7X, X) — mesma situação do MG: sem preço público, lineup confirmado sem mudanças.
- **GAC Aion UT Premium** — comunicado oficial de 22/07 cita R$132.990 (vs nosso R$139.990), mas pode ter subido de novo depois; sem fonte mais recente.
- **GAC Aion V**, **GAC Hyptec HT** — confirmados ativos, sem preço oficial encontrado.
- **BYD Dolphin Plus** — confirmado ativo, sem entrada de preço no feed oficial da BYD no momento da checagem.

## 4. Candidatos novos (fora do catálogo hoje) — nenhum adicionado ainda

Separado em "modelo genuinamente novo" vs. "trim que provavelmente NÃO vira linha própria" pela convenção de multi-trim (só entra linha separada se o powertrain for mecanicamente diferente).

**Provável linha nova (mecanicamente distinta ou modelo inteiro ausente):**
- **Toyota RAV4** (linha inteira ausente do catálogo!) — S Híbrido (HEV, R$319.620), SX Híbrido (HEV, R$351.720), XSE Plug-in Hybrid (PHEV, R$402.420) — toyota.com.br
- **Lexus UX 300h** (HEV, R$314.990) — lexus.com.br
- **Kia EV9** (BEV, R$749.990) e **Kia EV5** (BEV, R$389.990) — kia.com.br
- **Audi A6 Sportback e-tron "S line e-tron"** (BEV, R$679.990) — audi.com.br
- **Omoda 5 SHS-H** (HEV, R$164.990) — omodajaecoo.com.br
- **Avatr 11 4 lugares** (R$619.900 — layout de assentos mecanicamente diferente da versão 5 lugares já catalogada)
- **GWM Haval H6 GT** (PHEV, motor dual Hi4, 393cv — R$326.000) e **Haval H6 HEV ONE/HEV2** (R$199.900 / R$225.000) — powertrain HEV que a linha H6 catalogada (só PHEV) não tem
- **Porsche Macan 4S/GTS/Turbo 2027** (motores de potência diferente do Macan 4 já catalogado) — R$810k/R$880k/R$970k
- **Denza Z9GT** e **Denza D9** (BEV) — denza.com/br
- **Geely EX5 EM-i MAX** (novo trim intermediário entre Pro e Ultra, R$209.990)
- **Mitsubishi Outlander PHEV Signature** (novo trim acima do HPE-S, R$399.990)

**Provavelmente NÃO vira linha própria (mesmo powertrain, cosmético/equipamento):**
- Range Rover Sport "Dynamic SE" P550e / Range Rover "SV" P550e — mesmo motor do Autobiography catalogado
- Volvo EX40/EC40 "Black Edition" — mesmo powertrain, pacote visual
- Volvo XC60/XC90 "Ultra" (acima do "Plus" catalogado) — mesmo T8
- GWM WEY 07 "Dark Edition" e Tank 300 "TerraForce" — a checar se a potência realmente difere (Dark Edition foi citado com 517cv vs. base — pode ser mecanicamente diferente, vale checagem extra)
- JAC E-JS1 EXT (suspensão elevada) — preço ainda não publicado pelo site (placeholder)

**Ainda não é uma venda real (não adicionar):**
- BMW iX5 60 xDrive — "Novo" na grade, sem preço, pré-lançamento
- Neta GT — no site oficial, mas sem preço/CTA de compra (parece teaser)
- GAC Hyptec HT Ultra (portas gull-wing) — só imprensa/revenda, não confirmado oficialmente
- Renault Kangoo E-Tech — é furgão comercial, fora do escopo provável do catálogo (carros de passeio)

## 5. Marcas com acesso bloqueado/limitado nesta rodada

Fiat (site inacessível), Leapmotor (SPA client-side), MINI (rate-limit após 1ª página), Denza/JAECOO/MG/Zeekr/GAC/Honda/VW ID.4 (sites reachable mas sem preço público em texto).
