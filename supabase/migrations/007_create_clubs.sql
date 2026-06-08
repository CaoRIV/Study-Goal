create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null,
  start_date date,
  end_date date,
  status text not null default 'active',
  is_leadership boolean not null default false,
  impact_notes text,
  achievements text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clubs_status_check check (status in ('planned', 'active', 'completed', 'paused')),
  constraint clubs_date_order_check check (end_date is null or start_date is null or end_date >= start_date)
);

create index if not exists clubs_user_id_idx on public.clubs (user_id);
create index if not exists clubs_user_status_idx on public.clubs (user_id, status);
create index if not exists clubs_user_leadership_idx on public.clubs (user_id, is_leadership);

drop trigger if exists set_clubs_updated_at on public.clubs;
create trigger set_clubs_updated_at
before update on public.clubs
for each row
execute function public.set_updated_at();

alter table public.clubs enable row level security;

drop policy if exists "Users can read own clubs" on public.clubs;
create policy "Users can read own clubs"
on public.clubs
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own clubs" on public.clubs;
create policy "Users can insert own clubs"
on public.clubs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own clubs" on public.clubs;
create policy "Users can update own clubs"
on public.clubs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own clubs" on public.clubs;
create policy "Users can delete own clubs"
on public.clubs
for delete
to authenticated
using ((select auth.uid()) = user_id);
