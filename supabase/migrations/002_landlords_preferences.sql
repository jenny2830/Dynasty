-- Add user preference and state columns to landlords table
-- These replace any localStorage/sessionStorage usage — all state lives in Supabase.

alter table landlords
  add column if not exists theme_preference text default 'dark'
    check (theme_preference in ('dark', 'light')),
  add column if not exists last_selected_property_id uuid references properties(id) on delete set null,
  add column if not exists default_date_range text default 'month'
    check (default_date_range in ('week', 'month', 'quarter', 'year')),
  add column if not exists notification_prefs jsonb default '{"email_reminders": true, "reminder_days_before": 5}'::jsonb,
  add column if not exists onboarding_completed boolean default false;

comment on column landlords.theme_preference is 'User UI theme: dark (default) or light';
comment on column landlords.last_selected_property_id is 'Last property the user was viewing, for UX persistence';
comment on column landlords.default_date_range is 'Dashboard date range preference';
comment on column landlords.notification_prefs is 'Notification settings as JSONB';
comment on column landlords.onboarding_completed is 'Whether user has completed the onboarding flow';
