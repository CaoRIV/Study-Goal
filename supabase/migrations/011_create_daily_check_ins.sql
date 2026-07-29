create table if not exists public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  state text not null,
  check_in_date date not null default current_date,
  rescheduled_for date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_check_ins_entity_type_check
    check (entity_type in ('goal', 'milestone')),
  constraint daily_check_ins_state_check
    check (state in ('completed', 'rescheduled', 'blocked')),
  constraint daily_check_ins_rescheduled_date_check
    check (
      (state = 'rescheduled' and rescheduled_for is not null)
      or (state <> 'rescheduled' and rescheduled_for is null)
    ),
  constraint daily_check_ins_entity_day_key
    unique (user_id, entity_type, entity_id, check_in_date)
);

create index if not exists daily_check_ins_user_date_idx
  on public.daily_check_ins (user_id, check_in_date desc, updated_at desc);

create index if not exists daily_check_ins_user_entity_idx
  on public.daily_check_ins (user_id, entity_type, entity_id, updated_at desc);

drop trigger if exists set_daily_check_ins_updated_at on public.daily_check_ins;
create trigger set_daily_check_ins_updated_at
before update on public.daily_check_ins
for each row
execute function public.set_updated_at();

alter table public.daily_check_ins enable row level security;

drop policy if exists "Users can read own daily check ins" on public.daily_check_ins;
create policy "Users can read own daily check ins"
on public.daily_check_ins
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own daily check ins" on public.daily_check_ins;
create policy "Users can insert own daily check ins"
on public.daily_check_ins
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own daily check ins" on public.daily_check_ins;
create policy "Users can update own daily check ins"
on public.daily_check_ins
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own daily check ins" on public.daily_check_ins;
create policy "Users can delete own daily check ins"
on public.daily_check_ins
for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.record_daily_check_in(
  p_entity_type text,
  p_entity_id uuid,
  p_state text,
  p_rescheduled_for date default null,
  p_check_in_date date default current_date
)
returns public.daily_check_ins
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_check_in public.daily_check_ins;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_entity_type not in ('goal', 'milestone') then
    raise exception 'Unsupported check-in entity' using errcode = '22023';
  end if;

  if p_state not in ('completed', 'rescheduled', 'blocked') then
    raise exception 'Unsupported check-in state' using errcode = '22023';
  end if;

  if p_state = 'rescheduled' and p_rescheduled_for is null then
    raise exception 'A rescheduled date is required' using errcode = '22023';
  end if;

  if p_entity_type = 'goal' then
    if not exists (
      select 1
      from public.goals
      where id = p_entity_id
        and user_id = v_user_id
    ) then
      raise exception 'Goal not found' using errcode = '42501';
    end if;

    if p_state = 'completed' then
      update public.goals
      set status = 'completed',
          progress = 100
      where id = p_entity_id
        and user_id = v_user_id;
    elsif p_state = 'rescheduled' then
      update public.goals
      set target_date = p_rescheduled_for
      where id = p_entity_id
        and user_id = v_user_id;
    end if;
  else
    if not exists (
      select 1
      from public.goal_milestones
      where id = p_entity_id
        and user_id = v_user_id
    ) then
      raise exception 'Milestone not found' using errcode = '42501';
    end if;

    if p_state = 'completed' then
      update public.goal_milestones
      set status = 'completed'
      where id = p_entity_id
        and user_id = v_user_id;
    elsif p_state = 'rescheduled' then
      update public.goal_milestones
      set due_date = p_rescheduled_for
      where id = p_entity_id
        and user_id = v_user_id;
    end if;
  end if;

  insert into public.daily_check_ins (
    user_id,
    entity_type,
    entity_id,
    state,
    check_in_date,
    rescheduled_for
  )
  values (
    v_user_id,
    p_entity_type,
    p_entity_id,
    p_state,
    p_check_in_date,
    case when p_state = 'rescheduled' then p_rescheduled_for else null end
  )
  on conflict on constraint daily_check_ins_entity_day_key
  do update set
    state = excluded.state,
    rescheduled_for = excluded.rescheduled_for,
    updated_at = now()
  returning * into v_check_in;

  return v_check_in;
end;
$$;

revoke all on function public.record_daily_check_in(text, uuid, text, date, date)
from public, anon;

grant execute on function public.record_daily_check_in(text, uuid, text, date, date)
to authenticated;
