create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'programming',
  level integer not null default 0,
  target_level integer not null default 5,
  evidence_url text,
  notes text,
  status text not null default 'learning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skills_level_check check (level between 0 and 10),
  constraint skills_target_level_check check (target_level between 1 and 10),
  constraint skills_level_target_check check (level <= target_level),
  constraint skills_category_check check (
    category in (
      'programming',
      'machine_learning',
      'deep_learning',
      'nlp',
      'computer_vision',
      'research',
      'github_portfolio',
      'kaggle_projects',
      'career',
      'communication'
    )
  ),
  constraint skills_status_check check (status in ('planned', 'learning', 'practicing', 'mastered'))
);

create index if not exists skills_user_id_idx on public.skills (user_id);
create index if not exists skills_user_category_idx on public.skills (user_id, category);
create index if not exists skills_user_status_idx on public.skills (user_id, status);

drop trigger if exists set_skills_updated_at on public.skills;
create trigger set_skills_updated_at
before update on public.skills
for each row
execute function public.set_updated_at();

alter table public.skills enable row level security;

drop policy if exists "Users can read own skills" on public.skills;
create policy "Users can read own skills"
on public.skills
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own skills" on public.skills;
create policy "Users can insert own skills"
on public.skills
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own skills" on public.skills;
create policy "Users can update own skills"
on public.skills
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own skills" on public.skills;
create policy "Users can delete own skills"
on public.skills
for delete
to authenticated
using ((select auth.uid()) = user_id);
