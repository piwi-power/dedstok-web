-- ============================================================
-- MIGRATION 003: Referrals, leaderboard, points redemption
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add referral fields to users
alter table public.users
  add column if not exists referral_code text unique,
  add column if not exists referrer_id uuid references public.users(id),
  add column if not exists first_referral_credited boolean not null default false,
  add column if not exists total_referrals integer not null default 0,
  add column if not exists points_earned_all_time integer not null default 0;

-- 2. Generate referral codes for all existing users
update public.users
set referral_code = lower(substring(replace(id::text, '-', ''), 1, 8))
where referral_code is null;

-- 3. Add 'referral' and 'redemption' to points_transactions type check
-- Drop existing constraint and recreate with new values
alter table public.points_transactions
  drop constraint if exists points_transactions_type_check;

alter table public.points_transactions
  add constraint points_transactions_type_check
  check (type = any(array['earned', 'redeemed', 'bonus', 'referral']));

-- 4. Add points_spots to entries (how many spots were paid with points)
alter table public.entries
  add column if not exists points_spots integer not null default 0,
  add column if not exists cash_spots integer not null default 0;

-- Backfill existing entries
update public.entries
set cash_spots = spots_count, points_spots = 0
where cash_spots = 0;

-- 5. RPC: credit referrer points
create or replace function public.credit_referrer(
  referrer_id uuid,
  amount integer,
  source_user_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.points_transactions (user_id, amount, description, type)
  values (
    referrer_id,
    amount,
    'Referral bonus',
    'referral'
  );

  update public.users
  set points_balance = points_balance + amount,
      points_earned_all_time = points_earned_all_time + amount
  where id = referrer_id;
end;
$$;

-- 6. Update add_points to also track all-time points
create or replace function public.add_points(
  user_id uuid,
  amount integer,
  drop_id uuid default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.points_transactions (user_id, amount, drop_id, description, type)
  values (user_id, amount, drop_id, 'Entry reward', 'earned');

  update public.users
  set points_balance = points_balance + amount,
      points_earned_all_time = points_earned_all_time + amount
  where id = user_id;
end;
$$;

-- 7. RPC: redeem points for spots
create or replace function public.redeem_points(
  p_user_id uuid,
  p_amount integer,
  p_drop_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  if (select points_balance from public.users where id = p_user_id) < p_amount then
    raise exception 'Insufficient points balance';
  end if;

  insert into public.points_transactions (user_id, amount, drop_id, description, type)
  values (p_user_id, -p_amount, p_drop_id, 'Spot redemption', 'redeemed');

  update public.users
  set points_balance = points_balance - p_amount
  where id = p_user_id;
end;
$$;

-- 8. RPC: increment total referrals counter on referrer
create or replace function public.increment_total_referrals(p_user_id uuid)
returns void
language sql
security definer
as $$
  update public.users
  set total_referrals = total_referrals + 1
  where id = p_user_id;
$$;

-- 9. View: leaderboard (all-time)
create or replace view public.leaderboard_alltime as
select
  u.id,
  u.email,
  u.referral_code,
  u.points_earned_all_time as total_points,
  u.total_referrals,
  u.points_balance,
  rank() over (order by u.points_earned_all_time desc) as rank,
  exists(select 1 from public.entries e where e.user_id = u.id) as has_entered
from public.users u
where u.points_earned_all_time > 0
  and exists(select 1 from public.entries e where e.user_id = u.id);

-- 9. Function: leaderboard for a specific month
create or replace function public.leaderboard_for_month(
  p_year integer,
  p_month integer
)
returns table(
  id uuid,
  email text,
  referral_code text,
  total_points bigint,
  rank bigint
)
language sql
security definer
as $$
  select
    u.id,
    u.email,
    u.referral_code,
    coalesce(sum(pt.amount), 0) as total_points,
    rank() over (order by coalesce(sum(pt.amount), 0) desc) as rank
  from public.users u
  left join public.points_transactions pt
    on pt.user_id = u.id
    and pt.amount > 0
    and extract(year from pt.created_at) = p_year
    and extract(month from pt.created_at) = p_month
  where exists(select 1 from public.entries e where e.user_id = u.id)
  group by u.id, u.email, u.referral_code
  having coalesce(sum(pt.amount), 0) > 0
  order by total_points desc;
$$;
