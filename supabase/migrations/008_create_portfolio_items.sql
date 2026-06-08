create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text not null default 'project',
  description text,
  url text,
  status text not null default 'draft',
  evidence_date date,
  related_course_id uuid references public.courses(id) on delete set null,
  related_goal_id uuid references public.goals(id) on delete set null,
  related_skill_id uuid references public.skills(id) on delete set null,
  related_club_id uuid references public.clubs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_items_type_check check (
    type in (
      'project',
      'research',
      'certificate',
      'competition',
      'leadership',
      'internship',
      'publication',
      'club',
      'skill',
      'course'
    )
  ),
  constraint portfolio_items_status_check check (status in ('draft', 'ready', 'featured', 'archived'))
);

create index if not exists portfolio_items_user_id_idx on public.portfolio_items (user_id);
create index if not exists portfolio_items_user_type_idx on public.portfolio_items (user_id, type);
create index if not exists portfolio_items_user_status_idx on public.portfolio_items (user_id, status);
create index if not exists portfolio_items_related_course_idx on public.portfolio_items (related_course_id);
create index if not exists portfolio_items_related_goal_idx on public.portfolio_items (related_goal_id);
create index if not exists portfolio_items_related_skill_idx on public.portfolio_items (related_skill_id);
create index if not exists portfolio_items_related_club_idx on public.portfolio_items (related_club_id);

drop trigger if exists set_portfolio_items_updated_at on public.portfolio_items;
create trigger set_portfolio_items_updated_at
before update on public.portfolio_items
for each row
execute function public.set_updated_at();

alter table public.portfolio_items enable row level security;

drop policy if exists "Users can read own portfolio items" on public.portfolio_items;
create policy "Users can read own portfolio items"
on public.portfolio_items
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own portfolio items" on public.portfolio_items;
create policy "Users can insert own portfolio items"
on public.portfolio_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own portfolio items" on public.portfolio_items;
create policy "Users can update own portfolio items"
on public.portfolio_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own portfolio items" on public.portfolio_items;
create policy "Users can delete own portfolio items"
on public.portfolio_items
for delete
to authenticated
using ((select auth.uid()) = user_id);
