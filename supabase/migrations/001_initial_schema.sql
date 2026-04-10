-- ============================================================
-- DEDSTOK — Initial Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  instagram_handle text,
  points_balance integer not null default 0,
  total_entries integer not null default 0,
  total_wins integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- DROPS
-- ============================================================
create table if not exists public.drops (
  id uuid primary key default uuid_generate_v4(),
  sanity_id text unique,                          -- links to Sanity document
  item_name text not null,
  slug text not null unique,
  description text,
  market_value numeric(10,2),
  entry_price numeric(10,2) not null,
  total_spots integer not null,
  spots_sold integer not null default 0,
  draw_date timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'active', 'closed', 'drawn')),
  sourcing_tier text check (sourcing_tier in ('A', 'B', 'C')),
  winner_user_id uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.drops enable row level security;

create policy "Anyone can view active/closed/drawn drops"
  on public.drops for select
  using (status in ('active', 'closed', 'drawn'));

-- ============================================================
-- ENTRIES
-- ============================================================
create table if not exists public.entries (
  id uuid primary key default uuid_generate_v4(),
  drop_id uuid not null references public.drops(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  spots_count integer not null check (spots_count between 1 and 2),
  total_paid numeric(10,2) not null,
  stripe_payment_id text unique,
  influencer_code text,
  created_at timestamptz not null default now()
);

alter table public.entries enable row level security;

create policy "Users can view own entries"
  on public.entries for select
  using (auth.uid() = user_id);

-- Enforce 2-spot cap at DB level
create unique index if not exists entries_user_drop_unique
  on public.entries (drop_id, user_id);

-- ============================================================
-- WINNERS
-- ============================================================
create table if not exists public.winners (
  id uuid primary key default uuid_generate_v4(),
  drop_id uuid not null references public.drops(id) unique,
  user_id uuid not null references public.users(id),
  drawn_at timestamptz not null default now(),
  announced boolean not null default false
);

alter table public.winners enable row level security;

create policy "Anyone can view announced winners"
  on public.winners for select
  using (announced = true);

-- ============================================================
-- INFLUENCER CODES
-- ============================================================
create table if not exists public.influencer_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  influencer_name text not null,
  instagram_handle text,
  commission_per_ticket numeric(10,2) not null default 1.00,
  total_tickets_credited integer not null default 0,
  total_commission_earned numeric(10,2) not null default 0.00,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.influencer_codes enable row level security;

create policy "Anyone can read active influencer codes"
  on public.influencer_codes for select
  using (is_active = true);

-- ============================================================
-- POINTS TRANSACTIONS
-- ============================================================
create table if not exists public.points_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('earned', 'redeemed', 'bonus')),
  description text,
  drop_id uuid references public.drops(id),
  created_at timestamptz not null default now()
);

alter table public.points_transactions enable row level security;

create policy "Users can view own points transactions"
  on public.points_transactions for select
  using (auth.uid() = user_id);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Increment spots sold on a drop
create or replace function public.increment_spots_sold(drop_id uuid, amount integer)
returns void as $$
begin
  update public.drops
  set spots_sold = spots_sold + amount,
      updated_at = now()
  where id = drop_id;
end;
$$ language plpgsql security definer;

-- Add points to a user
create or replace function public.add_points(user_id uuid, amount integer, drop_id uuid default null)
returns void as $$
begin
  update public.users
  set points_balance = points_balance + amount,
      updated_at = now()
  where id = user_id;

  insert into public.points_transactions (user_id, amount, type, description, drop_id)
  values (user_id, amount, 'earned', 'Entry purchase', drop_id);
end;
$$ language plpgsql security definer;

-- Credit influencer commission
create or replace function public.credit_influencer(code text, tickets integer)
returns void as $$
begin
  update public.influencer_codes
  set total_tickets_credited = total_tickets_credited + tickets,
      total_commission_earned = total_commission_earned + (commission_per_ticket * tickets)
  where influencer_codes.code = credit_influencer.code;
end;
$$ language plpgsql security definer;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger drops_updated_at before update on public.drops
  for each row execute procedure public.set_updated_at();
