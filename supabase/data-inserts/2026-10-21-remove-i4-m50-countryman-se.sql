-- Remoção do BMW i4 M50 e do MINI Countryman SE ALL4 (decisão do usuário em
-- 21/10/2026).
--
-- Nenhum dos dois aparece mais no site oficial da marca:
--   BMW i4 M50: bmw.com.br lista só o i4 eDrive40 M Sport (página do i4 e
--     página "todos os modelos"). Sem anúncio oficial de fim de vendas no Brasil.
--   MINI Countryman SE ALL4: a página all-electric-mini-countryman.html
--     redireciona para a home, e o modelo não está na lista de modelos nem nas
--     ofertas (só o JCW Countryman a gasolina). O último preço oficial achado
--     era uma condição de jun/2026 limitada a 10 unidades em estoque.
-- Pelo critério do catálogo (só carro com venda oficial confirmada), saem.

begin;

delete from cars where id in ('bmw-i4-m50', 'mini-countryman-se-all4');

commit;

-- Conferência: deve voltar 0
select count(*) from cars where id in ('bmw-i4-m50', 'mini-countryman-se-all4');
