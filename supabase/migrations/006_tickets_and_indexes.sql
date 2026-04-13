-- ============================================================
-- TICKETS TABLE
-- One row per ticket, sequential number per drop
-- ============================================================

create table if not exists public.tickets (
  id            uuid primary key default uuid_generate_v4(),
  drop_id       uuid not null references public.drops(id) on delete cascade,
  entry_id      uuid not null references public.entries(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  ticket_number int  not null,
  created_at    timestamptz not null default now(),
  unique(drop_id, ticket_number)
);

alter table public.tickets enable row level security;

create policy "Users can view their own tickets"
  on public.tickets for select
  using (auth.uid() = user_id);

-- ============================================================
-- ATOMIC TICKET CREATION
-- Advisory lock on drop prevents duplicate ticket numbers
-- under concurrent purchases
-- ============================================================

create or replace function public.create_tickets(
  p_drop_id  uuid,
  p_entry_id uuid,
  p_user_id  uuid,
  p_count    int
) returns int[] language plpgsql security definer as $$
declare
  v_next    int;
  v_numbers int[];
  i         int;
begin
  -- Serialize ticket assignment per drop
  perform pg_advisory_xact_lock(hashtext(p_drop_id::text));

  select coalesce(max(ticket_number), 0) + 1 into v_next
  from public.tickets
  where drop_id = p_drop_id;

  v_numbers := array[]::int[];
  for i in 0..(p_count - 1) loop
    insert into public.tickets (drop_id, entry_id, user_id, ticket_number)
    values (p_drop_id, p_entry_id, p_user_id, v_next + i);
    v_numbers := array_append(v_numbers, v_next + i);
  end loop;

  return v_numbers;
end;
$$;

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================

-- entries: most common lookup patterns
create index if not exists idx_entries_drop_user    on public.entries(drop_id, user_id);
create index if not exists idx_entries_user         on public.entries(user_id);
create index if not exists idx_entries_payment      on public.entries(stripe_payment_id) where stripe_payment_id is not null;

-- tickets: draw + lookup
create index if not exists idx_tickets_drop         on public.tickets(drop_id, ticket_number);
create index if not exists idx_tickets_user         on public.tickets(user_id);
create index if not exists idx_tickets_entry        on public.tickets(entry_id);

-- points_transactions: leaderboard queries
create index if not exists idx_points_user          on public.points_transactions(user_id);
create index if not exists idx_points_user_created  on public.points_transactions(user_id, created_at);

-- drops: status filter (used on every page load)
create index if not exists idx_drops_status         on public.drops(status);

-- winners
create index if not exists idx_winners_drop         on public.winners(drop_id);
