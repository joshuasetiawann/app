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
  space_name text not null default 'Our Space',
  couple_code text not null unique,
  started_at date not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid references couples (id) on delete set null,
  name text not null,
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
  location_sharing boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A user belongs to at most one couple; membership is derived from profiles.couple_id.
create index profiles_couple_id_idx on profiles (couple_id);

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
  profile_id uuid not null references profiles (id) on delete cascade,
  couple_id uuid not null references couples (id) on delete cascade,
  label text,
  lat double precision not null,
  lng double precision not null,
  speed_kmh numeric,
  accuracy_m numeric,
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

create or replace function current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from profiles where id = auth.uid();
$$;

alter table couples enable row level security;
alter table profiles enable row level security;
alter table memories enable row level security;
alter table media_assets enable row level security;
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

create policy "couple members can read their couple" on couples
  for select using (id = current_couple_id());

create policy "profiles are visible within the couple" on profiles
  for select using (id = auth.uid() or couple_id = current_couple_id());
create policy "users manage their own profile" on profiles
  for update using (id = auth.uid());

-- Generic pattern applied to every couple-scoped table below.
create policy "couple read: memories" on memories for select using (couple_id = current_couple_id());
create policy "couple write: memories" on memories for insert with check (couple_id = current_couple_id());
create policy "couple update: memories" on memories for update using (couple_id = current_couple_id());
create policy "couple delete: memories" on memories for delete using (couple_id = current_couple_id());

create policy "couple read: media_assets" on media_assets for select using (couple_id = current_couple_id());
create policy "couple write: media_assets" on media_assets for insert with check (couple_id = current_couple_id());
create policy "couple delete: media_assets" on media_assets for delete using (couple_id = current_couple_id());

create policy "couple read: story_chapters" on story_chapters for select using (couple_id = current_couple_id());
create policy "couple write: story_chapters" on story_chapters for all using (couple_id = current_couple_id());

create policy "couple read: conversations" on conversations for select using (couple_id = current_couple_id());

create policy "couple read: messages" on messages for select using (
  conversation_id in (select id from conversations where couple_id = current_couple_id())
);
create policy "couple write: messages" on messages for insert with check (
  conversation_id in (select id from conversations where couple_id = current_couple_id())
);

create policy "couple read: food_entries" on food_entries for select using (couple_id = current_couple_id());
create policy "couple write: food_entries" on food_entries for all using (couple_id = current_couple_id());

create policy "couple read: food_status_log" on food_status_log for select using (couple_id = current_couple_id());
create policy "couple write: food_status_log" on food_status_log for insert with check (couple_id = current_couple_id());

create policy "couple read: calendar_events" on calendar_events for select using (couple_id = current_couple_id());
create policy "couple write: calendar_events" on calendar_events for all using (couple_id = current_couple_id());

create policy "couple read: milestones" on milestones for select using (couple_id = current_couple_id());
create policy "couple write: milestones" on milestones for all using (couple_id = current_couple_id());

create policy "couple read: love_notes" on love_notes for select using (couple_id = current_couple_id());
create policy "couple write: love_notes" on love_notes for all using (couple_id = current_couple_id());

create policy "couple read: places" on places for select using (couple_id = current_couple_id());
create policy "couple write: places" on places for all using (couple_id = current_couple_id());

create policy "couple read: trips" on trips for select using (couple_id = current_couple_id());
create policy "couple write: trips" on trips for all using (couple_id = current_couple_id());

create policy "couple read: trip_itinerary_items" on trip_itinerary_items for select using (
  trip_id in (select id from trips where couple_id = current_couple_id())
);

create policy "couple read: file_folders" on file_folders for select using (couple_id = current_couple_id());
create policy "couple write: file_folders" on file_folders for all using (couple_id = current_couple_id());

create policy "couple read: files" on files for select using (couple_id = current_couple_id());
create policy "couple write: files" on files for all using (couple_id = current_couple_id());

create policy "couple read: location_pings" on location_pings for select using (couple_id = current_couple_id());
create policy "self write: location_pings" on location_pings for insert with check (profile_id = auth.uid());

create policy "self read: notifications" on notifications for select using (profile_id = auth.uid());
create policy "self update: notifications" on notifications for update using (profile_id = auth.uid());

-- ============================================================================
-- Storage
--
-- Two private buckets; access is mediated entirely by RLS-checked signed
-- URLs issued to authenticated couple members, never public URLs.
--   media    — photos/videos referenced by media_assets.storage_path
--   files    — documents referenced by files.storage_path
-- Create via the Supabase dashboard or CLI, e.g.:
--   supabase storage buckets create media --private
--   supabase storage buckets create files --private
-- then attach storage.objects policies scoped by the couple_id encoded in
-- the object path (e.g. `${coupleId}/${assetId}.jpg`).
-- ============================================================================
