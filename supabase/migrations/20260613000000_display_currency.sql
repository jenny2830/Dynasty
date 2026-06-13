alter table landlords
  add column if not exists display_currency text default 'CAD';

alter table properties
  add column if not exists currency text default 'CAD';
