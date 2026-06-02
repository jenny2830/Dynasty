-- Add text_thickness preference column to landlords
alter table landlords
  add column if not exists text_thickness text default 'regular'
  check (text_thickness in ('light', 'regular', 'bold'));
