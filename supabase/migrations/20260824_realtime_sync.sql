-- Makes all couple activity cloud-backed and realtime while preserving the two
-- authenticated users and their couple membership.

-- Older projects may have couples created before the conversation bootstrap.
insert into public.conversations (couple_id)
select c.id from public.couples as c
on conflict (couple_id) do nothing;

alter table public.profiles alter column location_sharing set default false;

create table if not exists public.couple_favorites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 140),
  created_at timestamptz not null default now()
);
create index if not exists couple_favorites_couple_id_idx
  on public.couple_favorites (couple_id, created_at);
alter table public.couple_favorites enable row level security;
revoke all privileges on table public.couple_favorites from PUBLIC, anon;
grant select, insert, delete on table public.couple_favorites to authenticated;
drop policy if exists "couple read: couple_favorites" on public.couple_favorites;
drop policy if exists "couple insert: couple_favorites" on public.couple_favorites;
drop policy if exists "couple delete: couple_favorites" on public.couple_favorites;
create policy "couple read: couple_favorites" on public.couple_favorites
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: couple_favorites" on public.couple_favorites
  for insert to authenticated
  with check (
    couple_id = (select public.current_couple_id())
    and author_id = (select auth.uid())
  );
create policy "couple delete: couple_favorites" on public.couple_favorites
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

-- A partner may acknowledge messages in their own room, but the column-level
-- grant prevents clients from editing message bodies or sender identity.
revoke update on table public.messages from authenticated;
grant update (read_at) on table public.messages to authenticated;
drop policy if exists "couple update: message read receipts" on public.messages;
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

-- A "Pribadi" event stays visible and editable only to its creator.
drop policy if exists "couple read: calendar_events" on public.calendar_events;
drop policy if exists "couple update: calendar_events" on public.calendar_events;
drop policy if exists "couple delete: calendar_events" on public.calendar_events;
create policy "couple read: calendar_events" on public.calendar_events
  for select to authenticated
  using (
    couple_id = (select public.current_couple_id())
    and (scope = 'Berdua' or created_by = (select auth.uid()))
  );
create policy "couple update: calendar_events" on public.calendar_events
  for update to authenticated
  using (
    couple_id = (select public.current_couple_id())
    and (scope = 'Berdua' or created_by = (select auth.uid()))
  )
  with check (
    couple_id = (select public.current_couple_id())
    and (scope = 'Berdua' or created_by = (select auth.uid()))
  );
create policy "couple delete: calendar_events" on public.calendar_events
  for delete to authenticated
  using (
    couple_id = (select public.current_couple_id())
    and (scope = 'Berdua' or created_by = (select auth.uid()))
  );

-- PAP media uses a private Supabase Storage bucket. The first folder segment is
-- always the couple UUID, so Storage RLS follows the same boundary as Postgres.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

drop policy if exists "couple read media objects" on storage.objects;
drop policy if exists "couple upload media objects" on storage.objects;
drop policy if exists "couple delete media objects" on storage.objects;
create policy "couple read media objects" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select public.current_couple_id())::text
  );
create policy "couple upload media objects" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select public.current_couple_id())::text
  );
create policy "couple delete media objects" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select public.current_couple_id())::text
  );

-- Activity inserts create an in-app notification for the other member.
create or replace function public.notify_partner_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_couple_id uuid;
  actor_id uuid;
  notification_icon text;
  notification_body text;
  notification_route text;
  notification_color text := 'pk';
begin
  case tg_table_name
    when 'messages' then
      select c.couple_id into target_couple_id
      from public.conversations as c
      where c.id = new.conversation_id;
      actor_id := new.sender_id;
      notification_icon := case when new.media_id is null then '💬' else '📸' end;
      notification_body := case
        when new.media_id is not null then 'Pasangan mengirim PAP baru.'
        else 'Pesan baru: ' || pg_catalog.left(coalesce(new.body, ''), 90)
      end;
      notification_route := '/chat';
    when 'food_entries' then
      target_couple_id := new.couple_id;
      actor_id := new.logged_by;
      notification_icon := '🍜';
      notification_body := 'Pasangan mencatat ' || pg_catalog.left(new.name, 80) || '.';
      notification_route := '/food';
      notification_color := 'mint';
    when 'food_status_log' then
      target_couple_id := new.couple_id;
      actor_id := new.profile_id;
      notification_icon := '🍽️';
      notification_body := case new.status
        when 'ate' then 'Pasangan sudah makan.'
        when 'now' then 'Pasangan sedang makan.'
        else 'Pasangan belum makan.'
      end;
      notification_route := '/food';
      notification_color := 'mint';
    when 'calendar_events' then
      if new.scope <> 'Berdua' then return new; end if;
      target_couple_id := new.couple_id;
      actor_id := new.created_by;
      notification_icon := coalesce(new.icon, '🗓️');
      notification_body := 'Acara baru: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/schedule';
      notification_color := 'lav';
    when 'memories' then
      target_couple_id := new.couple_id;
      actor_id := new.author_id;
      notification_icon := coalesce(new.mood_emoji, '📖');
      notification_body := 'Kenangan baru: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/memories';
    when 'story_chapters' then
      target_couple_id := new.couple_id;
      actor_id := auth.uid();
      notification_icon := coalesce(new.icon, '🌱');
      notification_body := 'Bab baru ditambahkan: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/story';
    when 'milestones' then
      target_couple_id := new.couple_id;
      actor_id := auth.uid();
      notification_icon := coalesce(new.icon, '⏳');
      notification_body := 'Hitung mundur baru: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/countdown';
      notification_color := 'lav';
    when 'love_notes' then
      target_couple_id := new.couple_id;
      actor_id := new.author_id;
      notification_icon := '💌';
      notification_body := 'Ada surat baru untukmu.';
      notification_route := '/notes';
    when 'places' then
      target_couple_id := new.couple_id;
      actor_id := new.added_by;
      notification_icon := '📍';
      notification_body := 'Tempat baru: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/places';
    when 'trips' then
      target_couple_id := new.couple_id;
      actor_id := auth.uid();
      notification_icon := '✈️';
      notification_body := 'Perjalanan baru: ' || pg_catalog.left(new.title, 90) || '.';
      notification_route := '/trips';
      notification_color := 'mint';
    when 'profiles' then
      target_couple_id := new.couple_id;
      actor_id := new.id;
      notification_icon := '😊';
      notification_body := 'Mood pasangan diperbarui: ' || coalesce(new.mood, 'belum diatur') || '.';
      notification_route := '/';
    else
      return new;
  end case;

  if target_couple_id is null or actor_id is null then return new; end if;
  insert into public.notifications (profile_id, couple_id, icon, body, route, color_tag)
  select p.id, target_couple_id, notification_icon, notification_body, notification_route, notification_color
  from public.profiles as p
  where p.couple_id = target_couple_id and p.id <> actor_id;
  return new;
end;
$$;

drop trigger if exists messages_notify_partner on public.messages;
drop trigger if exists food_entries_notify_partner on public.food_entries;
drop trigger if exists food_status_notify_partner on public.food_status_log;
drop trigger if exists calendar_events_notify_partner on public.calendar_events;
drop trigger if exists memories_notify_partner on public.memories;
drop trigger if exists story_chapters_notify_partner on public.story_chapters;
drop trigger if exists milestones_notify_partner on public.milestones;
drop trigger if exists love_notes_notify_partner on public.love_notes;
drop trigger if exists places_notify_partner on public.places;
drop trigger if exists trips_notify_partner on public.trips;
drop trigger if exists profile_mood_notify_partner on public.profiles;
create trigger messages_notify_partner after insert on public.messages
  for each row execute function public.notify_partner_activity();
create trigger food_entries_notify_partner after insert on public.food_entries
  for each row execute function public.notify_partner_activity();
create trigger food_status_notify_partner after insert on public.food_status_log
  for each row execute function public.notify_partner_activity();
create trigger calendar_events_notify_partner after insert on public.calendar_events
  for each row execute function public.notify_partner_activity();
create trigger memories_notify_partner after insert on public.memories
  for each row execute function public.notify_partner_activity();
create trigger story_chapters_notify_partner after insert on public.story_chapters
  for each row execute function public.notify_partner_activity();
create trigger milestones_notify_partner after insert on public.milestones
  for each row execute function public.notify_partner_activity();
create trigger love_notes_notify_partner after insert on public.love_notes
  for each row execute function public.notify_partner_activity();
create trigger places_notify_partner after insert on public.places
  for each row execute function public.notify_partner_activity();
create trigger trips_notify_partner after insert on public.trips
  for each row execute function public.notify_partner_activity();
create trigger profile_mood_notify_partner after update of mood on public.profiles
  for each row when (old.mood is distinct from new.mood)
  execute function public.notify_partner_activity();

revoke execute on function public.notify_partner_activity() from PUBLIC, anon, authenticated;

-- Reset only the current couple's test/activity data. Identity, profiles,
-- pairing, relationship date, avatars, and Google Drive folder are preserved.
create or replace function public.reset_current_couple_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_couple_id uuid := public.current_couple_id();
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if target_couple_id is null then
    raise exception 'profile does not belong to a couple' using errcode = '23514';
  end if;

  delete from public.trip_itinerary_items as i
  using public.trips as t
  where i.trip_id = t.id and t.couple_id = target_couple_id;
  delete from public.messages
  where conversation_id in (
    select c.id from public.conversations as c where c.couple_id = target_couple_id
  );
  delete from public.files where couple_id = target_couple_id;
  delete from public.file_folders where couple_id = target_couple_id;
  delete from public.trips where couple_id = target_couple_id;
  delete from public.places where couple_id = target_couple_id;
  delete from public.love_notes where couple_id = target_couple_id;
  delete from public.milestones where couple_id = target_couple_id;
  delete from public.calendar_events where couple_id = target_couple_id;
  delete from public.food_status_log where couple_id = target_couple_id;
  delete from public.food_entries where couple_id = target_couple_id;
  delete from public.story_chapters where couple_id = target_couple_id;
  delete from public.media_assets where couple_id = target_couple_id;
  if pg_catalog.to_regclass('public.albums') is not null then
    execute 'delete from public.albums where couple_id = $1' using target_couple_id;
  end if;
  delete from public.memories where couple_id = target_couple_id;
  delete from public.location_pings where couple_id = target_couple_id;
  delete from public.couple_favorites where couple_id = target_couple_id;
  update public.profiles
  set mood = null, activity = null, location_sharing = false
  where couple_id = target_couple_id;
  delete from public.notifications where couple_id = target_couple_id;
end;
$$;

revoke execute on function public.reset_current_couple_data() from PUBLIC, anon, authenticated;
grant execute on function public.reset_current_couple_data() to authenticated;

-- Add all shared tables to Supabase Realtime exactly once.
do $$
declare
  table_name text;
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    foreach table_name in array array[
      'couples', 'profiles', 'memories', 'media_assets', 'albums', 'story_chapters',
      'messages', 'food_entries', 'food_status_log', 'calendar_events',
      'milestones', 'love_notes', 'places', 'trips', 'trip_itinerary_items', 'file_folders', 'files',
      'location_pings', 'notifications', 'couple_favorites'
    ] loop
      if not exists (
        select 1 from pg_catalog.pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      ) and pg_catalog.to_regclass('public.' || pg_catalog.quote_ident(table_name)) is not null then
        execute pg_catalog.format('alter publication supabase_realtime add table public.%I', table_name);
      end if;
    end loop;
  end if;
end;
$$;
