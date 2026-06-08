create table if not exists public.career_readiness (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  resume_status text not null default 'not_started',
  linkedin_status text not null default 'not_started',
  github_status text not null default 'not_started',
  portfolio_status text not null default 'not_started',
  interview_practice_count integer not null default 0,
  networking_contacts_count integer not null default 0,
  target_role text,
  target_industry text,
  next_review_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_readiness_resume_status_check
    check (resume_status in ('not_started', 'in_progress', 'ready')),
  constraint career_readiness_linkedin_status_check
    check (linkedin_status in ('not_started', 'in_progress', 'ready')),
  constraint career_readiness_github_status_check
    check (github_status in ('not_started', 'in_progress', 'ready')),
  constraint career_readiness_portfolio_status_check
    check (portfolio_status in ('not_started', 'in_progress', 'ready')),
  constraint career_readiness_interview_count_check
    check (interview_practice_count between 0 and 10000),
  constraint career_readiness_networking_count_check
    check (networking_contacts_count between 0 and 10000)
);

create table if not exists public.career_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  stage text not null default 'interested',
  job_url text,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_targets_stage_check
    check (stage in ('interested', 'preparing', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'))
);

create index if not exists career_readiness_user_id_idx
  on public.career_readiness (user_id);
create index if not exists career_targets_user_stage_idx
  on public.career_targets (user_id, stage);
create index if not exists career_targets_user_deadline_idx
  on public.career_targets (user_id, deadline)
  where deadline is not null;

drop trigger if exists set_career_readiness_updated_at on public.career_readiness;
create trigger set_career_readiness_updated_at
before update on public.career_readiness
for each row
execute function public.set_updated_at();

drop trigger if exists set_career_targets_updated_at on public.career_targets;
create trigger set_career_targets_updated_at
before update on public.career_targets
for each row
execute function public.set_updated_at();

alter table public.career_readiness enable row level security;
alter table public.career_targets enable row level security;

drop policy if exists "Users can read own career readiness" on public.career_readiness;
create policy "Users can read own career readiness"
on public.career_readiness
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own career readiness" on public.career_readiness;
create policy "Users can insert own career readiness"
on public.career_readiness
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own career readiness" on public.career_readiness;
create policy "Users can update own career readiness"
on public.career_readiness
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own career readiness" on public.career_readiness;
create policy "Users can delete own career readiness"
on public.career_readiness
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own career targets" on public.career_targets;
create policy "Users can read own career targets"
on public.career_targets
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own career targets" on public.career_targets;
create policy "Users can insert own career targets"
on public.career_targets
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own career targets" on public.career_targets;
create policy "Users can update own career targets"
on public.career_targets
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own career targets" on public.career_targets;
create policy "Users can delete own career targets"
on public.career_targets
for delete
to authenticated
using ((select auth.uid()) = user_id);
