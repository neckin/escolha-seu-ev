-- Custos de revisão programada pesquisados direto nos sites oficiais das
-- marcas em 02/10/2026 (sem arquivos enviados pelo usuário):
--
--   Toyota/Lexus: https://www.toyota.com.br/meu-toyota/precos-com-transparencia
--     (tabelas em imagem por modelo; salvas em brand-docs/toyota/). Preços de
--     01/10 a 31/10/2026, nacionais exceto ES. Yaris Cross (todas as versões),
--     Corolla Cross 2027 e Corolla Sedan 2026 têm as 3 primeiras revisões
--     grátis e "preços reduzidos" da 4ª à 6ª (sem valor publicado): contamos
--     as 3 primeiras como R$ 0 e a 4ª-6ª pelo preço regular da tabela (teto).
--   Honda: API usada pela página oficial de revisões
--     (/pos-venda/automoveis/api/revisions/get-revisions), UF = DF. Preço
--     idêntico nas duas concessionárias de Brasília consultadas. O Prelude não
--     está na consulta da Honda.
--   Hyundai: PDF oficial "Plano de Manutenção" do Kona (julho/2026, válido até
--     31/12/2026), tabela "KONA - HEV de 2025 a atual". O PDF do Ioniq 5 só
--     tem Ioniq 5 N e um "Ioniq 5 HEV 2022-2023": não aplicado ao Ioniq 5.
--   Kia: https://www.kia.com.br/revisoes ("Niro HEV - Todos" e "Carnival HEV
--     a partir do ano-modelo 2026"). O texto da Kia diz "válidos para revisões
--     até 30/07/2026": é a tabela publicada hoje, mas a validade já passou.
--   Mitsubishi: "MIT Revisão Programada" (mitsubishimotors.com.br), versão
--     OUTLANDER HPE-S, 10 revisões. O site não informa o intervalo; usamos
--     10.000 km (citado por outras páginas Mitsubishi), prazo em meses a
--     confirmar.
--   Omoda & Jaecoo: https://omodajaecoo.com.br/manutencao-e-garantia
--     (válido até 31/12/2026). Omoda E5 a cada 20.000 km ou 24 meses; Omoda 7
--     e Jaecoo 7 a cada 10.000 km ou 12 meses. O catálogo dizia "Jaecoo 7:
--     grátis nos 3 primeiros anos"; a tabela oficial atual cobra desde a 1ª.
--   Audi: PDF "Preço sugerido Out 2026" (válido até 31/10/2026), linha
--     "Q6 e-tron", 4 revisões (10 a 40 mil km). O SQ6 não aparece no PDF (as
--     versões "S" têm preço próprio): fica sem custo.
--
-- Critério geral: soma de todas as revisões da tabela; km base = última revisão.

begin;

-- Toyota bZ4X AWD <- Toyota BZ 2026 BEV: R$ 11.546 em 100.000 km (R$ 1.155 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 935)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 11546
where id = 'toyota-bz4x';

-- Toyota Yaris Cross Hybrid XRE <- Toyota YARIS CROSS 2027-2026 HEV (3 primeiras grátis): R$ 7.743 em 100.000 km (R$ 774 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita (3 primeiras revisões)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 7743
where id = 'toyota-yaris-cross-hybrid';

-- Toyota Corolla Cross Hybrid XRX <- Toyota COROLLA CROSS 2027 HEV (3 primeiras grátis): R$ 9.053 em 100.000 km (R$ 905 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita (3 primeiras revisões)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 9053
where id = 'toyota-corolla-cross-hybrid';

-- Toyota Corolla GLi HEV <- Toyota COROLLA 2026 HEV (3 primeiras grátis): R$ 8.453 em 100.000 km (R$ 845 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Gratuita (3 primeiras revisões)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 8453
where id = 'toyota-corolla-hybrid';

-- Lexus NX 450h+ <- Lexus NX 2027-2026 PHEV: R$ 18.070 em 100.000 km (R$ 1.807 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.233)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 18070
where id = 'lexus-nx-450h-plus';

-- Lexus RX 450h+ <- Lexus RX 2027-2026 PHEV: R$ 17.560 em 100.000 km (R$ 1.756 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.243)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 17560
where id = 'lexus-rx-450h-plus';

-- Lexus RZ 500e <- Lexus RZ 2027 BEV: R$ 14.311 em 100.000 km (R$ 1.431 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.180)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 14311
where id = 'lexus-rz-500e';

-- Honda Accord Advanced Hybrid <- Honda Accord Híbrido 2024 (DF): R$ 7.725 em 80.000 km (R$ 966 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 505, mão de obra grátis)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 7725
where id = 'honda-accord-advanced-hybrid';

-- Honda Civic Advanced Hybrid <- Honda Civic Híbrido 2026 (DF): R$ 7.894 em 80.000 km (R$ 987 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 505, mão de obra grátis)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 7894
where id = 'honda-civic-advanced-hybrid';

-- Honda CR-V Advanced Hybrid <- Honda CR-V Híbrido 2024 (DF): R$ 7.841 em 80.000 km (R$ 980 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 505, mão de obra grátis)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 7841
where id = 'honda-cr-v-advanced-hybrid';

-- Hyundai KONA Híbrido Ultimate <- Hyundai KONA HEV 2025-atual: R$ 17.404 em 100.000 km (R$ 1.740 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 950)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 17404
where id = 'hyundai-kona-hibrido';

-- Kia Niro HEV <- Kia Niro HEV - Todos: R$ 6.901 em 50.000 km (R$ 1.380 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 1.084)',
  maintenance_km_base = 50000,
  maintenance_total_cost = 6901
where id = 'kia-niro-hev';

-- Kia Carnival Full Hybrid <- Kia Carnival HEV a partir de 2026: R$ 15.524 em 50.000 km (R$ 3.105 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 2.593)',
  maintenance_km_base = 50000,
  maintenance_total_cost = 15524
where id = 'kia-carnival-hybrid';

-- Mitsubishi Outlander PHEV HPE-S <- Mitsubishi OUTLANDER HPE-S: R$ 18.604 em 100.000 km (R$ 1.860 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km',
  maintenance_first_cost = 'Pago (R$ 988)',
  maintenance_km_base = 100000,
  maintenance_total_cost = 18604
where id = 'mitsubishi-outlander-phev';

-- Omoda 7 SHS-P <- Omoda OMODA 7: R$ 14.141 em 80.000 km (R$ 1.768 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 699)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 14141
where id = 'omoda-7-shs-p';

-- Omoda E5 <- Omoda OMODA E5: R$ 3.704 em 80.000 km (R$ 463 a cada 10.000 km)
update cars set
  maintenance_interval = '20.000 km ou 24 meses',
  maintenance_first_cost = 'Pago (R$ 459)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 3704
where id = 'omoda-e5';

-- JAECOO 7 PHEV <- Jaecoo JAECOO 7: R$ 14.143 em 80.000 km (R$ 1.768 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 699)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 14143
where id = 'jaecoo-7-phev';

-- Audi Q6 e-tron S Line <- Audi Q6 e-tron: R$ 9.200 em 40.000 km (R$ 2.300 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 2.104)',
  maintenance_km_base = 40000,
  maintenance_total_cost = 9200
where id = 'audi-q6-e-tron';

-- Audi Q6 Sportback e-tron S Line <- Audi Q6 e-tron: R$ 9.200 em 40.000 km (R$ 2.300 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 2.104)',
  maintenance_km_base = 40000,
  maintenance_total_cost = 9200
where id = 'audi-q6-sportback-e-tron';

commit;

-- Conferência: devem voltar 19 linhas, todas com custo preenchido.
select id, name, maintenance_interval, maintenance_first_cost, maintenance_km_base, maintenance_total_cost
from cars where id in ('toyota-bz4x', 'toyota-yaris-cross-hybrid', 'toyota-corolla-cross-hybrid', 'toyota-corolla-hybrid', 'lexus-nx-450h-plus', 'lexus-rx-450h-plus', 'lexus-rz-500e', 'honda-accord-advanced-hybrid', 'honda-civic-advanced-hybrid', 'honda-cr-v-advanced-hybrid', 'hyundai-kona-hibrido', 'kia-niro-hev', 'kia-carnival-hybrid', 'mitsubishi-outlander-phev', 'omoda-7-shs-p', 'omoda-e5', 'jaecoo-7-phev', 'audi-q6-e-tron', 'audi-q6-sportback-e-tron')
order by brand, name;
