-- Remoção do Chevrolet Equinox EV (21/10/2026).
--
-- A GM confirmou ao Autos Segredos (13/07/2026) que "as unidades do Equinox EV
-- se esgotaram no Brasil" e que "no momento, não há previsão de importação de
-- um novo lote desta versão". O modelo também saiu do site oficial
-- (chevrolet.com.br/eletrico/equinox-ev redireciona para a home).

begin;

delete from cars where id = 'chevrolet-equinox-ev';

commit;

-- Conferência: deve voltar 0
select count(*) from cars where id = 'chevrolet-equinox-ev';
