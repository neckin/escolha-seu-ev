-- Remoção da Neta (decisão do usuário em 21/10/2026).
--
-- O último sinal oficial da marca no Brasil é um aviso de jun/2025, linkado no
-- site netaauto.com.br, dizendo que as operações "seguem normalmente" e que a
-- produção seria "retomada em breve". Desde então não há confirmação de venda
-- ativa. Pelo critério do catálogo (só carro com venda oficial confirmada), os
-- três modelos saem.

begin;

delete from cars where id in ('neta-aya', 'neta-x-400', 'neta-x-500');

commit;

-- Conferência: deve voltar 0
select count(*) from cars where brand = 'Neta';
