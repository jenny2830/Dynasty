-- Add 'free' to the landlords.plan check constraint and update the default

alter table landlords
  drop constraint if exists landlords_plan_check;

alter table landlords
  add constraint landlords_plan_check
    check (plan in ('free', 'starter', 'landlord', 'portfolio'));

alter table landlords
  alter column plan set default 'free';
