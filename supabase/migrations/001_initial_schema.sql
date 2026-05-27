-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── LANDLORDS ──
create table landlords (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text not null,
  email text not null,
  phone text,
  country text default 'CA',
  currency text default 'CAD',
  plan text default 'starter' check (plan in ('starter', 'landlord', 'portfolio')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- ── PROPERTIES ──
create table properties (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  name text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  country text default 'CA',
  type text not null check (type in ('rental', 'condo', 'strata')),
  property_subtype text not null check (property_subtype in ('residential', 'commercial')),
  num_units integer default 1,
  purchase_price numeric(12,2),
  current_value numeric(12,2),
  mortgage_balance numeric(12,2),
  monthly_mortgage numeric(10,2),
  condo_fee numeric(10,2),
  strata_fee numeric(10,2),
  status text default 'active' check (status in ('active', 'vacant', 'inactive')),
  notes text,
  created_at timestamptz default now()
);

-- ── UNITS ──
create table units (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id) on delete cascade not null,
  unit_number text not null,
  bedrooms integer,
  bathrooms numeric(3,1),
  sqft integer,
  rent_amount numeric(10,2),
  status text default 'occupied' check (status in ('occupied', 'vacant', 'maintenance')),
  created_at timestamptz default now()
);

-- ── TENANTS ──
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz default now()
);

-- ── LEASES ──
create table leases (
  id uuid primary key default uuid_generate_v4(),
  unit_id uuid references units(id) on delete cascade not null,
  tenant_id uuid references tenants(id) on delete set null,
  monthly_rent numeric(10,2) not null,
  start_date date not null,
  end_date date,
  deposit_amount numeric(10,2),
  status text default 'active' check (status in ('active', 'expired', 'terminated')),
  notes text,
  created_at timestamptz default now()
);

-- ── EXPENSE CATEGORIES ──
create table expense_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  type text not null check (type in ('income', 'expense')),
  is_recurring boolean default false,
  is_system boolean default true
);

-- Seed default categories
insert into expense_categories (name, type, is_recurring, is_system) values
  ('Rental income',    'income',  true,  true),
  ('Other income',     'income',  false, true),
  ('Maintenance',      'expense', false, true),
  ('Taxes',            'expense', true,  true),
  ('Water',            'expense', true,  true),
  ('Garbage pickup',   'expense', true,  true),
  ('Cleaning',         'expense', true,  true),
  ('Management fee',   'expense', true,  true),
  ('Accounting',       'expense', true,  true),
  ('Insurance',        'expense', true,  true),
  ('Condo fee',        'expense', true,  true),
  ('Strata fee',       'expense', true,  true),
  ('Mortgage payment', 'expense', true,  true),
  ('Repairs',          'expense', false, true),
  ('Utilities',        'expense', true,  true),
  ('Landscaping',      'expense', false, true),
  ('Legal fees',       'expense', false, true),
  ('Advertising',      'expense', false, true),
  ('Other expense',    'expense', false, true);

-- ── TRANSACTIONS ──
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12,2) not null,
  transaction_date date not null,
  description text,
  source text default 'manual' check (source in ('manual', 'receipt_scan', 'recurring')),
  receipt_id uuid,
  is_tax_deductible boolean default false,
  created_at timestamptz default now()
);

-- ── RECEIPTS ──
create table receipts (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  vendor_name text,
  amount numeric(12,2),
  receipt_date date,
  category text,
  description text,
  ai_raw_json jsonb,
  ai_confidence numeric(3,2),
  status text default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz default now()
);

-- Add FK now that receipts table exists
alter table transactions add constraint fk_receipt
  foreign key (receipt_id) references receipts(id) on delete set null;

-- ── RECURRING PAYMENTS ──
create table recurring_payments (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  name text not null,
  category text not null,
  amount numeric(10,2) not null,
  frequency text default 'monthly' check (frequency in ('weekly', 'monthly', 'quarterly', 'annually')),
  next_due_date date not null,
  reminder_days_before integer default 5,
  auto_log_transaction boolean default false,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- ── REMINDERS ──
create table reminders (
  id uuid primary key default uuid_generate_v4(),
  recurring_payment_id uuid references recurring_payments(id) on delete cascade not null,
  landlord_id uuid references landlords(id) on delete cascade not null,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'sent', 'dismissed', 'paid')),
  sent_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz default now()
);

-- ── REPORTS ──
create table reports (
  id uuid primary key default uuid_generate_v4(),
  landlord_id uuid references landlords(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  report_type text not null check (report_type in ('pl', 'cash_flow', 'tax_summary', 'expense_breakdown', 'roi')),
  period_start date not null,
  period_end date not null,
  data_snapshot jsonb not null,
  format text default 'json' check (format in ('json', 'pdf', 'csv')),
  generated_at timestamptz default now()
);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════

alter table landlords enable row level security;
alter table properties enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table transactions enable row level security;
alter table receipts enable row level security;
alter table recurring_payments enable row level security;
alter table reminders enable row level security;
alter table reports enable row level security;
alter table expense_categories enable row level security;

-- Landlords: own row only
create policy "landlords_own" on landlords
  for all using (auth.uid() = auth_user_id);

-- Properties: own properties only
create policy "properties_own" on properties
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Units: via property ownership
create policy "units_own" on units
  for all using (
    property_id in (
      select id from properties where landlord_id = (
        select id from landlords where auth_user_id = auth.uid()
      )
    )
  );

-- Tenants: own tenants only
create policy "tenants_own" on tenants
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Leases: via unit → property → landlord
create policy "leases_own" on leases
  for all using (
    unit_id in (
      select u.id from units u
      join properties p on p.id = u.property_id
      where p.landlord_id = (select id from landlords where auth_user_id = auth.uid())
    )
  );

-- Transactions: own only
create policy "transactions_own" on transactions
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Receipts: own only
create policy "receipts_own" on receipts
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Recurring payments: own only
create policy "recurring_payments_own" on recurring_payments
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Reminders: own only
create policy "reminders_own" on reminders
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Reports: own only
create policy "reports_own" on reports
  for all using (
    landlord_id = (select id from landlords where auth_user_id = auth.uid())
  );

-- Expense categories: readable by all authenticated users
create policy "categories_read" on expense_categories
  for select using (auth.role() = 'authenticated');

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════

create index idx_properties_landlord on properties(landlord_id);
create index idx_units_property on units(property_id);
create index idx_transactions_landlord on transactions(landlord_id);
create index idx_transactions_property on transactions(property_id);
create index idx_transactions_date on transactions(transaction_date);
create index idx_transactions_type on transactions(type);
create index idx_recurring_landlord on recurring_payments(landlord_id);
create index idx_recurring_due on recurring_payments(next_due_date);
create index idx_reminders_landlord on reminders(landlord_id);
create index idx_reminders_status on reminders(status);
create index idx_receipts_landlord on receipts(landlord_id);
create index idx_reports_landlord on reports(landlord_id);
