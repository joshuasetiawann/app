-- Run this only when the base schema was already installed before Google Drive support.
-- The profile email is copied from Supabase Auth so a paired account can receive
-- the Google Drive editor invitation. Existing profile RLS keeps it visible only
-- to the owner and their paired account.
alter table public.profiles
  add column if not exists email text;

update public.profiles as profile
set email = pg_catalog.lower(auth_user.email)
from auth.users as auth_user
where auth_user.id = profile.id
  and profile.email is distinct from pg_catalog.lower(auth_user.email);

alter table public.profiles
  drop constraint if exists profiles_email_check;
alter table public.profiles
  add constraint profiles_email_check
  check (email is null or char_length(email) between 3 and 320);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'name'), '');
  profile_name := coalesce(
    profile_name,
    nullif(pg_catalog.split_part(coalesce(new.email, ''), '@', 1), ''),
    'KisahKita User'
  );

  insert into public.profiles (id, email, name)
  values (new.id, pg_catalog.lower(new.email), pg_catalog.left(profile_name, 80))
  on conflict (id) do nothing;

  return new;
end;
$$;

alter table public.couples
  add column if not exists drive_folder_id text,
  add column if not exists drive_connected_at timestamptz;

alter table public.couples
  drop constraint if exists couples_drive_folder_id_check;
alter table public.couples
  add constraint couples_drive_folder_id_check
  check (drive_folder_id is null or drive_folder_id ~ '^[A-Za-z0-9_-]{10,255}$');

grant update (drive_folder_id, drive_connected_at) on table public.couples to authenticated;

drop policy if exists "couple members manage drive folder" on public.couples;
create policy "couple members manage drive folder" on public.couples
  for update to authenticated
  using (id = (select public.current_couple_id()))
  with check (id = (select public.current_couple_id()));
