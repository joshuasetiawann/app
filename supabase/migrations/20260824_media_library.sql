-- Shared photo library, editable albums, place photos, and private Storage.
-- Safe to run repeatedly in the Supabase SQL Editor.

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 48),
  icon text not null default '🖼️',
  created_at timestamptz not null default now()
);

create unique index if not exists albums_couple_name_idx
  on public.albums (couple_id, lower(name));

insert into public.albums (couple_id, created_by, name, icon)
select distinct on (asset.couple_id, lower(asset.album))
  asset.couple_id,
  asset.uploaded_by,
  trim(asset.album),
  '🖼️'
from public.media_assets as asset
where nullif(trim(asset.album), '') is not null
order by asset.couple_id, lower(asset.album), asset.created_at
on conflict do nothing;

alter table public.places
  add column if not exists cover_media_id uuid references public.media_assets (id) on delete set null;

alter table public.albums enable row level security;

drop policy if exists "couple read: albums" on public.albums;
drop policy if exists "couple insert: albums" on public.albums;
drop policy if exists "couple update: albums" on public.albums;
drop policy if exists "couple delete: albums" on public.albums;
create policy "couple read: albums" on public.albums
  for select to authenticated
  using (couple_id = (select public.current_couple_id()));
create policy "couple insert: albums" on public.albums
  for insert to authenticated
  with check (couple_id = (select public.current_couple_id()) and created_by = (select auth.uid()));
create policy "couple update: albums" on public.albums
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));
create policy "couple delete: albums" on public.albums
  for delete to authenticated
  using (couple_id = (select public.current_couple_id()));

drop policy if exists "couple update: media_assets" on public.media_assets;
create policy "couple update: media_assets" on public.media_assets
  for update to authenticated
  using (couple_id = (select public.current_couple_id()))
  with check (couple_id = (select public.current_couple_id()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "couple read: media storage" on storage.objects;
drop policy if exists "couple insert: media storage" on storage.objects;
drop policy if exists "couple update: media storage" on storage.objects;
drop policy if exists "couple delete: media storage" on storage.objects;
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

do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'albums'
    ) then
    alter publication supabase_realtime add table public.albums;
  end if;
end;
$$;
