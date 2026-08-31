-- Preserve the display name supplied by Google OAuth for newly created users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'full_name'), '')
  );
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

revoke execute on function public.handle_new_user() from public, anon, authenticated;
