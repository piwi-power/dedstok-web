-- ============================================================
-- MIGRATION 002: Phone verification + Draw provability
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add phone fields to users
alter table public.users
  add column if not exists phone text unique,
  add column if not exists phone_verified boolean not null default false;

-- 2. Phone OTP table for verification codes
create table if not exists public.phone_otps (
  id uuid primary key default uuid_generate_v4(),
  phone text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for fast lookup
create index if not exists phone_otps_phone_idx on public.phone_otps(phone);

-- RLS: no direct client access — all operations go through service role
alter table public.phone_otps enable row level security;

-- 3. Add draw provability columns to winners
alter table public.winners
  add column if not exists total_tickets integer,
  add column if not exists winning_ticket integer,
  add column if not exists verification_hash text,
  add column if not exists draw_inputs jsonb;

-- 4. Cleanup: expire OTPs older than 10 minutes (run via cron or on-demand)
create or replace function public.cleanup_expired_otps()
returns void
language sql
security definer
as $$
  delete from public.phone_otps where expires_at < now();
$$;
