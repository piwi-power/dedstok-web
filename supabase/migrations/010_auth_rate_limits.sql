-- ============================================================
-- MIGRATION 010: Rate limits for SMS codes and sign-in
-- Run in Supabase SQL Editor BEFORE deploying the matching code
-- ============================================================

-- 1. Track wrong guesses per code and the requester's IP
alter table public.phone_otps
  add column if not exists attempts integer not null default 0,
  add column if not exists ip text;

create index if not exists phone_otps_phone_created_idx on public.phone_otps(phone, created_at);
create index if not exists phone_otps_ip_created_idx on public.phone_otps(ip, created_at);

-- 2. Atomically count a verification attempt. Burns the code once p_max is reached,
--    so parallel guesses can't race past the limit.
create or replace function public.register_otp_attempt(p_otp_id uuid, p_max integer)
returns integer
language sql
security definer
as $$
  update public.phone_otps
  set attempts = attempts + 1,
      used = used or (attempts + 1 >= p_max)
  where id = p_otp_id
  returning attempts;
$$;

revoke execute on function public.register_otp_attempt(uuid, integer) from public, anon, authenticated;
grant execute on function public.register_otp_attempt(uuid, integer) to service_role;

-- 3. Failed sign-in log for throttling (keyed by IP and by identifier)
create table if not exists public.auth_attempts (
  id uuid primary key default uuid_generate_v4(),
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_attempts_key_created_idx on public.auth_attempts(key, created_at);

-- RLS on, no policies: service role only
alter table public.auth_attempts enable row level security;
