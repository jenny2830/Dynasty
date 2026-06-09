alter table properties
  add column if not exists currency text default 'CAD';

alter table properties drop constraint if exists properties_currency_check;

alter table properties
  add constraint properties_currency_check
  check (currency in ('CAD', 'USD', 'COP', 'GBP', 'AUD'));
