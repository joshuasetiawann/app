-- ============================================================================
-- KisahKita — Supabase schema (Phase 2+)
--
-- This is the target Postgres schema for when the app moves off mock data.
-- It is written now, alongside the mock-data version of the app, so the
-- frontend's TypeScript models (src/types/index.ts) and the future database
-- never have to be reconciled from scratch — see README.md → "Supabase
-- migration plan" for the phased rollout and src/services/dataService.ts
-- for the seam the UI already goes through.
--
-- Design principles:
--   - Every table with couple-private data carries a `couple_id`, and Row
--     Level Security restricts reads/writes to the two members of that
--     couple. Nobody outside the relationship — including other
--     authenticated users — can see it.
--   - `auth.users` (Supabase Auth) is the source of truth for identity;
--     `profiles` extends it with the app-specific fields.
--   - Media (photos, files) store a `storage_path` pointing into a private
--     Supabase Storage bucket, never the file itself.
--   - Timestamps are `timestamptz` throughout; the frontend renders them in
--     each partner's local timezone (see src/lib/appClock.ts).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Couples & profiles
-- ----------------------------------------------------------------------------

create table couples (
  id uuid primary key default gen_random_uuid(),
  space_name text not null default 'Our Space'
    check (char_length(btrim(space_name)) between 1 and 80),
  -- 128 bits of server-generated entropy. The UI may add visual separators,
  -- but stores/submits the canonical 32-character lowercase hex value.
  couple_code text not null default replace(gen_random_uuid()::text, '-', '') unique
    check (couple_code ~ '^[0-9a-f]{32}$'),
  invite_expires_at timestamptz not null default (now() + interval '7 days'),
  paired_at timestamptz,
  started_at date not null,
  drive_folder_id text check (drive_folder_id is null or drive_folder_id ~ '^[A-Za-z0-9_-]{10,255}$'),
  drive_connected_at timestamptz,
  created_at timestamptz not null default now(),
  check (paired_at is null or paired_at >= created_at)
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid references couples (id) on delete set null,
  email text check (email is null or char_length(email) between 3 and 320),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  nickname text,
  avatar_emoji text,
  avatar_url text,
  country text,
  country_flag text,
  city text,
  timezone text not null default 'UTC',
  birthday date,
  favorite_food text,
  favorite_color text,
  device_label text,
  mood text,
  activity text,
  online_visible boolean not null default true,
  last_seen_visible boolean not null default true,
  activity_visible boolean not null default true,
  gallery_add_allowed boolean not null default true,
  me_time boolean not null default false,
  location_sharing boolean not null default false,
  theme_key text not null default 'sakura'
    check (theme_key in ('sakura', 'midnight', 'matcha', 'taipei')),
  dark_mode boolean not null default false,
  animation_level text not null default 'full'
    check (animation_level in ('full', 'calm', 'off')),
  quiet_start time not null default '22:00',
  quiet_end time not null default '07:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A user belongs to at most one couple; membership is derived from profiles.couple_id.
create index profiles_couple_id_idx on profiles (couple_id);

-- Auth owns identity; this trigger creates the matching app profile without
-- granting clients INSERT access to profiles. Keep it small: a failing auth
-- trigger blocks signup, so optional profile fields are filled later by users.
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_profile_updated_at();

-- ----------------------------------------------------------------------------
-- Memories & media (also backs the Gallery, Recent Photo, and Story screens)
-- ----------------------------------------------------------------------------

create table memories (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  occurred_on date not null,
  title text not null,
  story text,
  mood_emoji text,
  location text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table media_assets (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  uploaded_by uuid not null references profiles (id) on delete cascade,
  memory_id uuid references memories (id) on delete set null,
  album text,
  kind text not null check (kind in ('photo', 'video')),
  storage_path text not null,
  caption text,
  taken_at timestamptz,
  location text,
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index media_assets_couple_id_idx on media_assets (couple_id, created_at desc);
create index memories_couple_id_idx on memories (couple_id, occurred_on desc);

create table albums (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  created_by uuid not null references profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 48),
  icon text not null default '🖼️',
  created_at timestamptz not null default now()
);

create unique index albums_couple_name_idx on albums (couple_id, lower(name));

-- Free-standing "Our Story" timeline chapters (distinct from day-to-day memories).
create table story_chapters (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  year text not null,
  title text not null,
  place text,
  note text,
  icon text,
  cover_media_id uuid references media_assets (id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Chat
-- ----------------------------------------------------------------------------

create table conversations (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade unique,
  pinned_message_id uuid,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender_id uuid not null references profiles (id) on delete cascade,
  body text,
  media_id uuid references media_assets (id) on delete set null,
  reaction text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table conversations
  add constraint conversations_pinned_message_fk
  foreign key (pinned_message_id) references messages (id) on delete set null;

create index messages_conversation_id_idx on messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- Food journal
-- ----------------------------------------------------------------------------

create table food_entries (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  logged_by uuid not null references profiles (id) on delete cascade,
  name text not null,
  category text not null,
  location text,
  price_label text,
  rating smallint check (rating between 1 and 5),
  note text,
  eaten_at timestamptz not null default now(),
  media_id uuid references media_assets (id) on delete set null,
  created_at timestamptz not null default now()
);

create index food_entries_couple_id_idx on food_entries (couple_id, eaten_at desc);

-- Daily "have you eaten?" check-in shown on Home/Food.
create table food_status_log (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  status text not null check (status in ('ate', 'now', 'not')),
  logged_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Calendar, countdowns & milestones
-- ----------------------------------------------------------------------------

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  created_by uuid not null references profiles (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  scope text not null check (scope in ('Berdua', 'Pribadi')),
  icon text,
  recurrence text,
  reminder_minutes_before int,
  created_at timestamptz not null default now()
);

create index calendar_events_couple_id_idx on calendar_events (couple_id, starts_at);

-- Countdown targets (anniversaries, flights, birthdays...) — the frontend
-- computes days/hours/minutes/seconds live from `target_at`; nothing here
-- is a precomputed "days left" number (see src/lib/appClock.ts).
create table milestones (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  title text not null,
  icon text,
  target_at timestamptz not null,
  color_tag text,
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index milestones_couple_id_idx on milestones (couple_id, target_at);

-- ----------------------------------------------------------------------------
-- Love notes (time/condition-locked letters)
-- ----------------------------------------------------------------------------

create table love_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  recipient_id uuid not null references profiles (id) on delete cascade,
  preview text not null,
  body text not null,
  unlock_at timestamptz,
  unlock_condition text,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

create index love_notes_couple_id_idx on love_notes (couple_id);

-- ----------------------------------------------------------------------------
-- Places & trips
-- ----------------------------------------------------------------------------

create table places (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  added_by uuid not null references profiles (id) on delete cascade,
  title text not null,
  category text,
  rating smallint check (rating between 1 and 5),
  note text,
  lat double precision,
  lng double precision,
  cover_media_id uuid references media_assets (id) on delete set null,
  visited_on date,
  created_at timestamptz not null default now()
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  title text not null,
  starts_on date,
  ends_on date,
  flight_code text,
  depart_label text,
  arrive_label text,
  cover_media_id uuid references media_assets (id) on delete set null,
  created_at timestamptz not null default now()
);

create table trip_itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips (id) on delete cascade,
  day_label text not null,
  title text not null,
  note text,
  sort_order int not null default 0
);

-- ----------------------------------------------------------------------------
-- Files ("Laci Kita")
-- ----------------------------------------------------------------------------

create table file_folders (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  label text not null,
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples (id) on delete cascade,
  folder_id uuid references file_folders (id) on delete set null,
  uploaded_by uuid not null references profiles (id) on delete cascade,
  name text not null,
  ext text not null,
  storage_path text,
  size_bytes bigint,
  status text not null default 'synced' check (status in ('synced', 'uploading', 'error')),
  upload_progress smallint,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Live location & location history
-- ----------------------------------------------------------------------------

create table location_pings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  couple_id uuid not null references couples (id) on delete cascade,
  label text,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  speed_kmh numeric check (speed_kmh is null or speed_kmh >= 0),
  accuracy_m numeric check (accuracy_m is null or accuracy_m >= 0),
  recorded_at timestamptz not null default now()
);

create index location_pings_profile_recent_idx on location_pings (profile_id, recorded_at desc);

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  couple_id uuid not null references couples (id) on delete cascade,
  icon text,
  body text not null,
  route text,
  color_tag text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_id_idx on notifications (profile_id, created_at desc);

-- ============================================================================
-- Row Level Security
--
-- Every couple-scoped table follows the same shape of policy: a row is
-- visible/writable only to a profile whose `couple_id` matches the row's
-- `couple_id`. `profiles` itself is visible to the user and their partner.
-- No table is ever readable via the anon key without a signed-in session.
-- ============================================================================

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.couple_id
  from public.profiles as p
  where p.id = (select auth.uid());
$$;

-- Creates the caller's space exactly once. Replays return the caller's existing
-- couple instead of creating duplicates. Profile and couple locks serialize
-- concurrent requests for the same account.
create or replace function public.create_couple_space(
  p_space_name text default 'Our Space',
  p_started_at date default current_date
)
returns public.couples
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_profile public.profiles%rowtype;
  result_couple public.couples%rowtype;
  member_count integer;
  normalized_space_name text;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select p.*
  into caller_profile
  from public.profiles as p
  where p.id = caller_id
  for update;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  -- Idempotent replay: membership already exists, so return that same space.
  if caller_profile.couple_id is not null then
    select c.*
    into result_couple
    from public.couples as c
    where c.id = caller_profile.couple_id
    for update;

    if not found then
      raise exception 'profile membership is invalid' using errcode = '23514';
    end if;

    select pg_catalog.count(*)::integer
    into member_count
    from public.profiles as p
    where p.couple_id = result_couple.id;

    if member_count < 1 or member_count > 2 then
      raise exception 'couple membership is invalid' using errcode = '23514';
    end if;

    if member_count = 2 and result_couple.paired_at is null then
      update public.couples as c
      set paired_at = pg_catalog.now(),
          invite_expires_at = pg_catalog.now()
      where c.id = result_couple.id
      returning c.* into result_couple;
    elsif member_count = 1 and result_couple.paired_at is not null then
      raise exception 'couple pairing state is invalid' using errcode = '23514';
    end if;

    return result_couple;
  end if;

  normalized_space_name := pg_catalog.btrim(p_space_name);
  if normalized_space_name is null
     or pg_catalog.char_length(normalized_space_name) not between 1 and 80 then
    raise exception 'space name must contain 1 to 80 characters' using errcode = '22023';
  end if;

  if p_started_at is null or p_started_at > current_date then
    raise exception 'relationship start date is invalid' using errcode = '22023';
  end if;

  insert into public.couples (space_name, started_at)
  values (normalized_space_name, p_started_at)
  returning * into result_couple;

  update public.profiles as p
  set couple_id = result_couple.id
  where p.id = caller_id;

  -- A couple has one conversation; creating it here leaves the relational
  -- model ready when the mock chat service is replaced.
  insert into public.conversations (couple_id)
  values (result_couple.id)
  on conflict (couple_id) do nothing;

  return result_couple;
end;
$$;

-- Claims a live invite atomically. The couple row lock makes the one remaining
-- slot exclusive, so concurrent second/third join attempts cannot overfill it.
create or replace function public.join_couple_by_code(p_code text)
returns public.couples
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_profile public.profiles%rowtype;
  result_couple public.couples%rowtype;
  member_count integer;
  normalized_code text;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  normalized_code := pg_catalog.lower(
    pg_catalog.regexp_replace(
      pg_catalog.btrim(coalesce(p_code, '')),
      '[-[:space:]]',
      '',
      'g'
    )
  );

  if normalized_code !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid or expired couple code' using errcode = '22023';
  end if;

  select p.*
  into caller_profile
  from public.profiles as p
  where p.id = caller_id
  for update;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  -- A lost response can safely be retried with the same code.
  if caller_profile.couple_id is not null then
    select c.*
    into result_couple
    from public.couples as c
    where c.id = caller_profile.couple_id
    for update;

    if not found then
      raise exception 'profile membership is invalid' using errcode = '23514';
    end if;

    if result_couple.couple_code <> normalized_code then
      raise exception 'profile already belongs to a different couple' using errcode = '23514';
    end if;

    select pg_catalog.count(*)::integer
    into member_count
    from public.profiles as p
    where p.couple_id = result_couple.id;

    if member_count < 1 or member_count > 2 then
      raise exception 'couple membership is invalid' using errcode = '23514';
    end if;

    if member_count = 2 and result_couple.paired_at is null then
      update public.couples as c
      set paired_at = pg_catalog.now(),
          invite_expires_at = pg_catalog.now()
      where c.id = result_couple.id
      returning c.* into result_couple;
    elsif member_count = 1 and result_couple.paired_at is not null then
      raise exception 'couple pairing state is invalid' using errcode = '23514';
    end if;

    return result_couple;
  end if;

  select c.*
  into result_couple
  from public.couples as c
  where c.couple_code = normalized_code
  for update;

  if not found
     or result_couple.invite_expires_at <= pg_catalog.now()
     or result_couple.paired_at is not null then
    raise exception 'invalid or expired couple code' using errcode = '22023';
  end if;

  select pg_catalog.count(*)::integer
  into member_count
  from public.profiles as p
  where p.couple_id = result_couple.id;

  if member_count <> 1 then
    raise exception 'invalid or unavailable couple code' using errcode = '22023';
  end if;

  update public.profiles as p
  set couple_id = result_couple.id
  where p.id = caller_id;

  update public.couples as c
  set paired_at = pg_catalog.now(),
      invite_expires_at = pg_catalog.now()
  where c.id = result_couple.id
  returning c.* into result_couple;

  return result_couple;
end;
$$;

-- The caller supplies the code it last saw. If a network retry arrives after
-- the first rotation, the stored code differs and is simply returned, making
-- refresh idempotent for that request.
create or replace function public.refresh_couple_invite(p_current_code text)
returns public.couples
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  caller_profile public.profiles%rowtype;
  result_couple public.couples%rowtype;
  member_count integer;
  normalized_current_code text;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  normalized_current_code := pg_catalog.lower(
    pg_catalog.regexp_replace(
      pg_catalog.btrim(coalesce(p_current_code, '')),
      '[-[:space:]]',
      '',
      'g'
    )
  );

  if normalized_current_code !~ '^[0-9a-f]{32}$' then
    raise exception 'invalid couple code' using errcode = '22023';
  end if;

  select p.*
  into caller_profile
  from public.profiles as p
  where p.id = caller_id
  for update;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  if caller_profile.couple_id is null then
    raise exception 'profile does not belong to a couple' using errcode = '23514';
  end if;

  select c.*
  into result_couple
  from public.couples as c
  where c.id = caller_profile.couple_id
  for update;

  if not found then
    raise exception 'profile membership is invalid' using errcode = '23514';
  end if;

  select pg_catalog.count(*)::integer
  into member_count
  from public.profiles as p
  where p.couple_id = result_couple.id;

  if member_count <> 1 or result_couple.paired_at is not null then
    raise exception 'couple is already paired' using errcode = '23514';
  end if;

  if result_couple.couple_code <> normalized_current_code then
    return result_couple;
  end if;

  update public.couples as c
  set couple_code = pg_catalog.replace(pg_catalog.gen_random_uuid()::text, '-', ''),
      invite_expires_at = pg_catalog.now() + interval '7 days'
  where c.id = result_couple.id
  returning c.* into result_couple;

  return result_couple;
end;
$$;

-- Function execution is PUBLIC by default in Postgres. Trigger helpers are not
-- RPCs; pairing/current-membership functions are callable only by signed-in users.
revoke execute on function public.handle_new_user() from PUBLIC, anon, authenticated;
revoke execute on function public.set_profile_updated_at() from PUBLIC, anon, authenticated;
revoke execute on function public.current_couple_id() from PUBLIC, anon, authenticated;
revoke execute on function public.create_couple_space(text, date) from PUBLIC, anon, authenticated;
revoke execute on function public.join_couple_by_code(text) from PUBLIC, anon, authenticated;
revoke execute on function public.refresh_couple_invite(text) from PUBLIC, anon, authenticated;

grant execute on function public.current_couple_id() to authenticated;
grant execute on function public.create_couple_space(text, date) to authenticated;
grant execute on function public.join_couple_by_code(text) to authenticated;
grant execute on function public.refresh_couple_invite(text) to authenticated;

-- Membership is never directly client-writable. Authentication creates the
-- row; the pairing RPCs alone may change couple_id. Users retain updates only
-- for ordinary profile/preferences fields.
revoke all privileges on table public.couples from PUBLIC, anon, authenticated;
revoke all privileges on table public.profiles from PUBLIC, anon, authenticated;

grant select on table public.couples, public.profiles to authenticated;
grant update (drive_folder_id, drive_connected_at) on table public.couples to authenticated;
grant update (
  name, nickname, avatar_emoji, avatar_url, country, country_flag, city,
  timezone, birthday, favorite_food, favorite_color, device_label, mood,
  activity, online_visible, last_seen_visible, activity_visible,
  gallery_add_allowed, me_time, location_sharing, theme_key, dark_mode,
  animation_level, quiet_start, quiet_end
) on table public.profiles to authenticated;

alter table couples enable row level security;
alter table profiles enable row level security;
alter table memories enable row level security;
alter table media_assets enable row level security;
alter table albums enable row level security;
alter table story_chapters enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table food_entries enable row level security;
alter table food_status_log enable row level security;
alter table calendar_events enable row level security;
alter table milestones enable row level security;
alter table love_notes enable row level security;
alter table places enable row level security;
alter table trips enable row level security;
alter table trip_itinerary_items enable row level security;
alter table file_folders enable row level security;
alter table files enable row level security;
alter table location_pings enable row level security;
alter table notifications enable row level security;

create policy "couple members can read their couple" on public.couples
  for select to authenticated
  using (id = (select public.current_couple_id()));
create policy "couple members manage drive folder" on public.couples
  for update to authenticated
  using (id = (select public.current_couple_id()))
  with check (id = (select public.current_couple_id()));

create policy "profiles are visible within the couple" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or couple_id = (select public.current_couple_id()));
create policy "users manage their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Generic pattern applied to every couple-scoped table below.
create policy "couple read: memories" on public.memories
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: memories" on public.memories
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and author_id = (select auth.uid())
  );
create policy "couple update: memories" on public.memories
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: memories" on public.memories
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: media_assets" on public.media_assets
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: media_assets" on public.media_assets
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and uploaded_by = (select auth.uid())
  );
create policy "couple delete: media_assets" on public.media_assets
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple update: media_assets" on public.media_assets
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

create policy "couple read: albums" on public.albums
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: albums" on public.albums
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and created_by = (select auth.uid())
  );
create policy "couple update: albums" on public.albums
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: albums" on public.albums
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: story_chapters" on public.story_chapters
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple write: story_chapters" on public.story_chapters
  for all to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

create policy "couple read: conversations" on public.conversations
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: messages" on public.messages
  for select to authenticated
  using (
    conversation_id in (
      select c.id from public.conversations as c
      where c.couple_id = (select public.current_couple_id())
    )
  );
create policy "couple insert: messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and conversation_id in (
      select c.id from public.conversations as c
      where c.couple_id = (select public.current_couple_id())
    )
  );

revoke update on table public.messages from authenticated;
grant update (read_at) on table public.messages to authenticated;
create policy "couple update: message read receipts" on public.messages
  for update to authenticated
  using (
    conversation_id in (
      select c.id from public.conversations as c
      where c.couple_id = (select public.current_couple_id())
    )
  )
  with check (
    conversation_id in (
      select c.id from public.conversations as c
      where c.couple_id = (select public.current_couple_id())
    )
  );

create policy "couple read: food_entries" on public.food_entries
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: food_entries" on public.food_entries
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and logged_by = (select auth.uid())
  );
create policy "couple update: food_entries" on public.food_entries
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: food_entries" on public.food_entries
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: food_status_log" on public.food_status_log
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: food_status_log" on public.food_status_log
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and profile_id = (select auth.uid())
  );

create policy "couple read: calendar_events" on public.calendar_events
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: calendar_events" on public.calendar_events
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and created_by = (select auth.uid())
  );
create policy "couple update: calendar_events" on public.calendar_events
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: calendar_events" on public.calendar_events
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: milestones" on public.milestones
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple write: milestones" on public.milestones
  for all to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

create policy "couple read: love_notes" on public.love_notes
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: love_notes" on public.love_notes
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and author_id = (select auth.uid())
  );
create policy "couple update: love_notes" on public.love_notes
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: love_notes" on public.love_notes
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: places" on public.places
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: places" on public.places
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and added_by = (select auth.uid())
  );
create policy "couple update: places" on public.places
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: places" on public.places
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: trips" on public.trips
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple write: trips" on public.trips
  for all to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

create policy "couple read: trip_itinerary_items" on public.trip_itinerary_items
  for select to authenticated
  using (
    trip_id in (
      select t.id from public.trips as t
      where t.couple_id = (select public.current_couple_id())
    )
  );

create policy "couple read: file_folders" on public.file_folders
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple write: file_folders" on public.file_folders
  for all to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

create policy "couple read: files" on public.files
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: files" on public.files
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and uploaded_by = (select auth.uid())
  );
create policy "couple update: files" on public.files
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: files" on public.files
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

create policy "couple read: location_pings" on public.location_pings
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "self insert: location_pings" on public.location_pings
  for insert to authenticated
  with check (
    profile_id = (select auth.uid())
    and couple_id = (select public.current_couple_id())
  );
create policy "self update: location_pings" on public.location_pings
  for update to authenticated
  using (
    profile_id = (select auth.uid())
    and couple_id = (select public.current_couple_id())
  )
  with check (
    profile_id = (select auth.uid())
    and couple_id = (select public.current_couple_id())
  );

create policy "self read: notifications" on public.notifications
  for select to authenticated
  using (profile_id = (select auth.uid()));
create policy "self update: notifications" on public.notifications
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- ============================================================================
-- Storage
--
-- Private media bucket. Every object path starts with the couple id and the
-- policies below verify that the signed-in user belongs to that couple.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "couple read: media storage" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select public.current_couple_id())::text);
create policy "couple insert: media storage" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select public.current_couple_id())::text);
create policy "couple update: media storage" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select public.current_couple_id())::text)
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select public.current_couple_id())::text);
create policy "couple delete: media storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select public.current_couple_id())::text);
