create table if not exists public.goal_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  status text not null default 'todo',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_milestones_status_check check (status in ('todo', 'in_progress', 'completed'))
);

create index if not exists goal_milestones_user_id_idx on public.goal_milestones (user_id);
create index if not exists goal_milestones_goal_id_idx on public.goal_milestones (goal_id);
create index if not exists goal_milestones_user_status_idx on public.goal_milestones (user_id, status);

drop trigger if exists set_goal_milestones_updated_at on public.goal_milestones;
create trigger set_goal_milestones_updated_at
before update on public.goal_milestones
for each row
execute function public.set_updated_at();

alter table public.goal_milestones enable row level security;

drop policy if exists "Users can read own goal milestones" on public.goal_milestones;
create policy "Users can read own goal milestones"
on public.goal_milestones
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own goal milestones" on public.goal_milestones;
create policy "Users can insert own goal milestones"
on public.goal_milestones
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own goal milestones" on public.goal_milestones;
create policy "Users can update own goal milestones"
on public.goal_milestones
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own goal milestones" on public.goal_milestones;
create policy "Users can delete own goal milestones"
on public.goal_milestones
for delete
to authenticated
using ((select auth.uid()) = user_id);
