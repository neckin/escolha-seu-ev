-- Custos de revisão de mais 2 carros, dos 32 que estavam sem (21/10/2026).
--
--   Honda Prelude: API usada pela página oficial de revisões da Honda
--     (/pos-venda/automoveis/api/revisions/get-revisions, model 1696811,
--     ano 2026, UF DF), mesmo critério dos outros Honda. Em outubro/2026 o
--     Prelude ainda não estava na consulta; agora está. Preço idêntico em 2 das
--     3 concessionárias de Brasília (AUTOHAUS e DF MOTORS); a JORLAN cobra
--     ~R$ 42 a menos de mão de obra no total. Mão de obra grátis na 1ª e 2ª.
--   JAC E-JS1: sem tabela oficial publicada. Usado o custo real informado pela
--     própria JAC à Webmotors (matéria de 12/09/2023): R$ 4.620 em 120.000 km
--     no primeiro dono. Valor de 2023, provavelmente abaixo do preço atual.
--
-- Pesquisados sem resultado (seguem sem custo): BMW e MINI (não publicam
-- preço de revisão no Brasil), Porsche, Land Rover, Audi SQ6, Volvo ES90,
-- Hyundai Ioniq 5 ("consulte as concessionárias"), VW ID.4 (fora da tabela
-- Volks Vale+ de outubro/2026), Renault Megane E-Tech e Koleos (consulta de
-- revisão preço fechado não carrega fora do navegador comum), Avatr 11 (idem,
-- CAOA Changan), Neta.
--
-- Critério geral: soma de todas as revisões da tabela; km base = última revisão.

begin;

-- Honda Prelude <- Honda Prelude 2026 (DF): R$ 7.233 em 80.000 km (R$ 904 a cada 10.000 km)
update cars set
  maintenance_interval = '10.000 km ou 12 meses',
  maintenance_first_cost = 'Pago (R$ 504, mão de obra grátis)',
  maintenance_km_base = 80000,
  maintenance_total_cost = 7233
where id = 'honda-prelude';

-- JAC E-JS1 <- custo real informado pela JAC (Webmotors, 2023): R$ 4.620 em 120.000 km (R$ 385 a cada 10.000 km)
update cars set
  maintenance_km_base = 120000,
  maintenance_total_cost = 4620,
  tech_notes = coalesce(tech_notes || ' ', '') || 'Custo de manutenção: sem tabela oficial de revisões publicada pela JAC. Usado o gasto real informado pela própria JAC à Webmotors (set/2023): R$ 4.620 em 120.000 km no primeiro dono, cerca de R$ 385 a cada 10.000 km. É valor de 2023 e tende a estar abaixo do preço atual.'
where id = 'jac-e-js1';

commit;
