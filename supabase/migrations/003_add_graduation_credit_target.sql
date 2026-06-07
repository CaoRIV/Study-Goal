alter table public.profiles
add column if not exists graduation_credit_target integer not null default 128;

alter table public.profiles
drop constraint if exists profiles_graduation_credit_target_check;

alter table public.profiles
add constraint profiles_graduation_credit_target_check
check (graduation_credit_target between 1 and 300);
