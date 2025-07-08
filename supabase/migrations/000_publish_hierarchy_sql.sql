-- Migration: publish_hierarchy_sql
-- Bu fonksiyon, gelen SQL dizisini tek transaction içinde çalıştırır.
-- Kullanım: select publish_hierarchy_sql(ARRAY['SQL1', 'SQL2', ...]);

create or replace function publish_hierarchy_sql(
  stmts text[]
) returns void
language plpgsql
security definer
as $$
declare
  _sql text;
begin
  -- Fonksiyon bir transaction içinde çalışır; hata halinde otomatik rollback olur.
  foreach _sql in array stmts loop
    execute _sql;
  end loop;
end;
$$; 