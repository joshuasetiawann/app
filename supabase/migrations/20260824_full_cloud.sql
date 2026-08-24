-- Move account-level UI preferences to Supabase and install the service-role-only
-- reset used by scripts/reset-supabase.mjs. Safe to run more than once.

begin;

alter table public.profiles
  add column if not exists theme_key text not null default 'sakura',
  add column if not exists dark_mode boolean not null default false,
  add column if not exists animation_level text not null default 'full',
  add column if not exists quiet_start time not null default '22:00',
  add column if not exists quiet_end time not null default '07:00';

alter table public.profiles drop constraint if exists profiles_theme_key_check;
alter table public.profiles add constraint profiles_theme_key_check
  check (theme_key in ('sakura', 'midnight', 'matcha', 'taipei'));

alter table public.profiles drop constraint if exists profiles_animation_level_check;
alter table public.profiles add constraint profiles_animation_level_check
  check (animation_level in ('full', 'calm', 'off'));

grant update (
  theme_key, dark_mode, animation_level, quiet_start, quiet_end
) on table public.profiles to authenticated;

create or replace function public.admin_reset_kisahkita()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;

  -- couples is the root of every public KisahKita row. CASCADE clears profiles
  -- and all relationship/activity tables while preserving schema, RLS and RPCs.
  truncate table public.couples restart identity cascade;
end;
$$;

revoke execute on function public.admin_reset_kisahkita() from PUBLIC, anon, authenticated;
grant execute on function public.admin_reset_kisahkita() to service_role;

commit;
