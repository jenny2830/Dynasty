-- Add text_thickness preference column to landlords
alter table landlords
  add column if not exists text_thickness text default 'light'
  check (text_thickness in ('light', 'regular', 'bold'));

-- Update default to 'light' if column already exists
alter table landlords alter column text_thickness set default 'light';
