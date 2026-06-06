create table if not exists public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  year_index integer not null,
  term text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semesters_year_index_check check (year_index between 1 and 8),
  constraint semesters_term_check check (term in ('fall', 'spring', 'summer', 'winter', 'other'))
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null references public.semesters(id) on delete cascade,
  code text,
  name text not null,
  credits numeric(4, 1) not null default 3,
  target_grade numeric(3, 2),
  final_grade numeric(3, 2),
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_credits_check check (credits > 0 and credits <= 30),
  constraint courses_target_grade_check check (target_grade is null or target_grade between 0 and 4.30),
  constraint courses_final_grade_check check (final_grade is null or final_grade between 0 and 4.30),
  constraint courses_status_check check (status in ('planned', 'in_progress', 'completed', 'dropped'))
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'academic',
  target_date date,
  progress integer not null default 0,
  status text not null default 'planned',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_progress_check check (progress between 0 and 100),
  constraint goals_category_check check (category in ('academic', 'career', 'research', 'skill', 'club', 'portfolio', 'personal')),
  constraint goals_status_check check (status in ('planned', 'in_progress', 'completed', 'paused')),
  constraint goals_priority_check check (priority in ('low', 'medium', 'high'))
);

create index if not exists semesters_user_id_idx on public.semesters (user_id);
create index if not exists semesters_user_year_idx on public.semesters (user_id, year_index);
create index if not exists courses_user_id_idx on public.courses (user_id);
create index if not exists courses_semester_id_idx on public.courses (semester_id);
create index if not exists courses_user_status_idx on public.courses (user_id, status);
create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_user_status_idx on public.goals (user_id, status);
create index if not exists goals_user_category_idx on public.goals (user_id, category);

drop trigger if exists set_semesters_updated_at on public.semesters;
create trigger set_semesters_updated_at
before update on public.semesters
for each row
execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

alter table public.semesters enable row level security;
alter table public.courses enable row level security;
alter table public.goals enable row level security;

drop policy if exists "Users can read own semesters" on public.semesters;
create policy "Users can read own semesters"
on public.semesters
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own semesters" on public.semesters;
create policy "Users can insert own semesters"
on public.semesters
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own semesters" on public.semesters;
create policy "Users can update own semesters"
on public.semesters
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own semesters" on public.semesters;
create policy "Users can delete own semesters"
on public.semesters
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own courses" on public.courses;
create policy "Users can read own courses"
on public.courses
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own courses" on public.courses;
create policy "Users can insert own courses"
on public.courses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own courses" on public.courses;
create policy "Users can update own courses"
on public.courses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own courses" on public.courses;
create policy "Users can delete own courses"
on public.courses
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own goals" on public.goals;
create policy "Users can read own goals"
on public.goals
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own goals" on public.goals;
create policy "Users can insert own goals"
on public.goals
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own goals" on public.goals;
create policy "Users can update own goals"
on public.goals
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own goals" on public.goals;
create policy "Users can delete own goals"
on public.goals
for delete
to authenticated
using ((select auth.uid()) = user_id);
