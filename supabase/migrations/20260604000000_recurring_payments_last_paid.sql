-- Add last_paid_date and last_paid_amount to recurring_payments
-- This enables the Scheduled / Pending / Paid status logic in the UI.
-- Run this in the Supabase SQL Editor before deploying the corresponding UI changes.

alter table recurring_payments
  add column if not exists last_paid_date date,
  add column if not exists last_paid_amount numeric(10, 2);
