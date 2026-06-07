alter table public.profiles
add column if not exists academic_year_target integer not null default 4;

alter table public.profiles
drop constraint if exists profiles_academic_year_target_check;

alter table public.profiles
add constraint profiles_academic_year_target_check
check (academic_year_target between 1 and 8);
