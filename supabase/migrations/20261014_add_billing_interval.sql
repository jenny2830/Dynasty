-- ─────────────────────────────────────────────────────────────────────────────
--  Migration: unify pricing — add billing_interval to landlords
--
--  Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--  Safe to re-run (uses IF NOT EXISTS / idempotent UPDATE).
-- ─────────────────────────────────────────────────────────────────────────────

-- Step 1: Add billing_interval column (null = legacy / unknown)
ALTER TABLE public.landlords
  ADD COLUMN IF NOT EXISTS billing_interval TEXT
  CHECK (billing_interval IN ('month', 'year'))
  DEFAULT NULL;

-- Step 2: Backfill — existing subscribers on legacy tiers get 'month'
--   (they were all monthly; you can correct individual rows if any were yearly)
UPDATE public.landlords
SET billing_interval = 'month'
WHERE stripe_subscription_id IS NOT NULL
  AND billing_interval IS NULL;

-- Step 3 (optional): If you want to track 'member' as a plan value explicitly,
--   uncomment the lines below to update the CHECK constraint.
--   The app already works without this — `hasActiveMembership()` uses
--   stripe_subscription_id as the primary signal.
--
-- ALTER TABLE public.landlords DROP CONSTRAINT IF EXISTS landlords_plan_check;
-- ALTER TABLE public.landlords
--   ADD CONSTRAINT landlords_plan_check
--   CHECK (plan IN ('free', 'starter', 'landlord', 'portfolio', 'member'));
--
-- UPDATE public.landlords
-- SET plan = 'landlord'
-- WHERE stripe_subscription_id IS NOT NULL AND plan = 'free';
