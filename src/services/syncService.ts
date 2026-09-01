import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ThemeKey } from '../lib/theme';
import type {
  Album,
  CalendarEvent,
  Countdown,
  FoodEntry,
  LoveNote,
  Memory,
  Message,
  NotificationItem,
  Photo,
  Place,
  StoryChapter,
  Trip,
} from '../types';
import { supabaseClient } from './authService';

export type FoodStatus = '' | 'ate' | 'now' | 'not';
export type AnimationPreference = 'full' | 'calm' | 'off';

export interface AccountPreferences {
  theme: ThemeKey;
  dark: boolean;
  animation: AnimationPreference;
  quietHours: { from: string; to: string };
}

export interface PrivacySettings {
  onlineOn: boolean;
  lastSeenOn: boolean;
  actOn: boolean;
  galOn: boolean;
  meTime: boolean;
}

export interface SyncContext {
  userId: string;
  coupleId: string;
  timeZone: string;
}

export interface ChatPresence {
  setTyping: (active: boolean) => void;
  unsubscribe: () => void;
}

export interface SharedSnapshot {
  photos: Photo[];
  albums: Album[];
  favorites: string[];
  messages: Message[];
  memories: Memory[];
  storyChapters: StoryChapter[];
  countdowns: Countdown[];
  loveNotes: LoveNote[];
  places: Place[];
  trips: Trip[];
  foodEntries: FoodEntry[];
  events: CalendarEvent[];
  notifications: NotificationItem[];
  foodStatus: FoodStatus;
  partnerFoodStatus: FoodStatus;
  mood: string;
  activity: string;
  partnerMood: string;
  partnerActivity: string;
  locationOn: boolean;
  privacy: PrivacySettings;
  preferences: AccountPreferences;
}

interface MessageRow {
  id: string;
  sender_id: string;
  body: string | null;
  media_id: string | null;
  reaction: string | null;
  read_at: string | null;
  created_at: string;
}

interface MediaRow {
  id: string;
  uploaded_by: string;
  memory_id: string | null;
  album: string | null;
  kind: 'photo' | 'video';
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  location: string | null;
  created_at: string;
}

interface AlbumRow {
  id: string;
  name: string;
  icon: string | null;
}

interface MemoryRow {
  id: string;
  author_id: string;
  occurred_on: string;
  title: string;
  story: string | null;
  mood_emoji: string | null;
  location: string | null;
}

interface StoryRow {
  id: string;
  year: string;
  title: string;
  place: string | null;
  note: string | null;
  icon: string | null;
  sort_order: number;
}

interface MilestoneRow {
  id: string;
  title: string;
  icon: string | null;
  target_at: string;
  color_tag: string | null;
}

interface LoveNoteRow {
  id: string;
  author_id: string;
  preview: string;
  body: string;
  unlock_at: string | null;
  opened_at: string | null;
  created_at: string;
}

interface PlaceRow {
  id: string;
  title: string;
  category: string | null;
  rating: number | null;
  note: string | null;
  lat: number | null;
  lng: number | null;
  cover_media_id?: string | null;
  visited_on: string | null;
}

interface TripRow {
  id: string;
  title: string;
  starts_on: string | null;
  ends_on: string | null;
  flight_code: string | null;
  depart_label: string | null;
  arrive_label: string | null;
}

interface TripItineraryRow {
  trip_id: string;
  day_label: string;
  title: string;
  note: string | null;
  sort_order: number;
}

interface FoodRow {
  id: string;
  logged_by: string;
  media_id: string | null;
  name: string;
  category: string;
  location: string | null;
  price_label: string | null;
  rating: number | null;
  note: string | null;
  eaten_at: string;
}

interface EventRow {
  id: string;
  title: string;
  starts_at: string;
  scope: 'Berdua' | 'Pribadi';
  icon: string | null;
}

interface NotificationRow {
  id: string;
  icon: string | null;
  body: string;
  route: string | null;
  color_tag: string | null;
  read_at: string | null;
  created_at: string;
}

interface ProfileSettingsRow {
  id: string;
  mood: string | null;
  activity: string | null;
  online_visible: boolean;
  last_seen_visible: boolean;
  activity_visible: boolean;
  gallery_add_allowed: boolean;
  me_time: boolean;
  location_sharing: boolean;
  theme_key?: ThemeKey | null;
  dark_mode?: boolean | null;
  animation_level?: AnimationPreference | null;
  quiet_start?: string | null;
  quiet_end?: string | null;
}

const CATEGORY_ICON: Record<string, string> = {
  Breakfast: '🍳',
  Lunch: '🍛',
  Dinner: '🍽️',
  Snacks: '🍪',
  Drinks: '🧋',
  Sarapan: '🍳',
  'Makan Siang': '🍛',
  'Makan Malam': '🍽️',
  Nyemil: '🍪',
  Dessert: '🍰',
  Minuman: '🧋',
};

function client() {
  if (!supabaseClient) throw new Error('Supabase has not been configured.');
  return supabaseClient;
}

function assertRemote(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date(value));
}

function formatEvent(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(new Date(value));
}

async function conversationId(coupleId: string) {
  const { data, error } = await client()
    .from('conversations')
    .select('id')
    .eq('couple_id', coupleId)
    .maybeSingle<{ id: string }>();
  assertRemote(error);
  if (!data) throw new Error('The shared conversation is unavailable. Run the Supabase sync migration.');
  return data.id;
}

async function signedMediaUrls(data: Array<{ id: string; storage_path: string }>) {
  const paths = data.map((item) => item.storage_path);
  if (!paths.length) return new Map<string, string>();
  const signed = await client().storage.from('media').createSignedUrls(paths, 24 * 60 * 60);
  assertRemote(signed.error);
  const byPath = new Map((signed.data ?? []).map((item) => [item.path, item.signedUrl]));
  return new Map(data.map((item) => [item.id, byPath.get(item.storage_path) ?? '']));
}

function mapMessage(row: MessageRow, context: SyncContext, urls: Map<string, string>): Message {
  const photoUrl = row.media_id ? urls.get(row.media_id) : '';
  return {
    id: row.id,
    from: row.sender_id === context.userId ? 'me' : 'partner',
    text: row.body ?? undefined,
    photoId: row.media_id ?? undefined,
    photoDataUrl: photoUrl || undefined,
    time: formatTime(row.created_at, context.timeZone),
    read: !!row.read_at,
    reaction: row.reaction ?? undefined,
    status: 'sent',
  };
}

function mapFood(row: FoodRow, context: SyncContext, urls: Map<string, string>): FoodEntry {
  return {
    id: row.id,
    icon: CATEGORY_ICON[row.category] ?? '🍜',
    imageUrl: row.media_id ? urls.get(row.media_id) || undefined : undefined,
    mediaId: row.media_id || undefined,
    name: row.name,
    time: formatTime(row.eaten_at, context.timeZone),
    by: row.logged_by === context.userId ? 'me' : 'partner',
    location: row.location ?? 'Location not set',
    category: row.category,
    price: row.price_label ?? 'Gratis',
    rating: row.rating ?? 0,
    note: row.note ?? 'No notes yet',
    date: row.eaten_at.slice(0, 10),
  };
}

function mapEvent(row: EventRow, context: SyncContext): CalendarEvent {
  return {
    id: row.id,
    icon: row.icon ?? '🗓️',
    title: row.title,
    when: formatEvent(row.starts_at, context.timeZone),
    startsAt: row.starts_at,
    tzNote: context.timeZone,
    scope: row.scope,
    colorTag: row.scope === 'Berdua' ? 'pk' : 'mint',
    dayOfMonth: Number(row.starts_at.slice(8, 10)),
  };
}

function mapNotification(row: NotificationRow, context: SyncContext): NotificationItem {
  const colorTag = row.color_tag === 'mint' || row.color_tag === 'lav' ? row.color_tag : 'pk';
  return {
    id: row.id,
    icon: row.icon ?? '💗',
    text: row.body,
    time: formatEvent(row.created_at, context.timeZone),
    colorTag,
    unread: !row.read_at,
    route: row.route ?? '/',
  };
}

function mapPhoto(row: MediaRow, context: SyncContext, urls: Map<string, string>): Photo {
  return {
    id: row.id,
    imageUrl: urls.get(row.id) || undefined,
    slotLabel: row.kind === 'video' ? 'VIDEO' : 'PHOTO',
    caption: row.caption ?? 'A new moment 💗',
    meta: `${formatEvent(row.created_at, context.timeZone)}${row.location ? ` · ${row.location}` : ''}`,
    takenAt: row.taken_at ?? row.created_at,
    location: row.location ?? undefined,
    by: row.uploaded_by === context.userId ? 'me' : 'partner',
    tags: [row.kind === 'video' ? 'Video' : 'Photos', row.album].filter(Boolean) as string[],
    album: row.album ?? undefined,
  };
}

function mapAlbum(row: AlbumRow): Album {
  return { id: row.id, title: row.name, icon: row.icon || '🖼️' };
}

function formatDay(value: string, timeZone: string) {
  const date = value.includes('T') ? new Date(value) : new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone,
  }).format(date);
}

function mapMemory(row: MemoryRow, context: SyncContext, media: MediaRow[]): Memory {
  return {
    id: row.id,
    date: formatDay(row.occurred_on, context.timeZone).toUpperCase(),
    title: row.title,
    meta: row.location || (row.author_id === context.userId ? 'Written by you' : 'Written by your partner'),
    mood: row.mood_emoji || '💗',
    story: row.story || 'No additional story yet.',
    photoIds: media.filter((asset) => asset.memory_id === row.id).map((asset) => asset.id),
  };
}

function mapStory(row: StoryRow): StoryChapter {
  return {
    id: row.id,
    year: row.year,
    title: row.title,
    place: row.place || 'Place not set',
    note: row.note || 'No notes yet.',
    icon: row.icon || '🌱',
  };
}

function mapMilestone(row: MilestoneRow, context: SyncContext): Countdown {
  const colorTag = row.color_tag === 'lav' || row.color_tag === 'mint' ? row.color_tag : 'pk';
  return {
    id: row.id,
    icon: row.icon || '⏳',
    title: row.title,
    when: formatEvent(row.target_at, context.timeZone),
    targetDate: row.target_at,
    colorTag,
    progressPercent: 45,
  };
}

function mapLoveNote(row: LoveNoteRow, context: SyncContext): LoveNote {
  const now = Date.now();
  const unlocksAt = row.unlock_at ? new Date(row.unlock_at).getTime() : 0;
  const locked = unlocksAt > now;
  return {
    id: row.id,
    tag: locked ? `OPENS ${formatDay(row.unlock_at!, context.timeZone).toUpperCase()}` : 'A NOTE FOR YOU',
    preview: row.preview,
    meta: `${row.author_id === context.userId ? 'From you' : 'From your partner'} · ${formatDay(row.created_at, context.timeZone)}`,
    state: locked ? 'lock' : row.opened_at ? 'done' : 'open',
    from: row.author_id === context.userId ? 'me' : 'partner',
    body: row.body,
    writtenAt: row.created_at,
  };
}

function mapPlace(row: PlaceRow, context: SyncContext, urls: Map<string, string>): Place {
  const category = row.category || '📍 Memories';
  return {
    id: row.id,
    icon: category.match(/\p{Extended_Pictographic}/u)?.[0] || '📍',
    title: row.title,
    meta: row.visited_on ? `Visited ${formatDay(row.visited_on, context.timeZone)}` : 'Shared wishlist',
    category,
    rating: row.rating || 0,
    note: row.note || 'No notes yet.',
    latitude: row.lat ?? undefined,
    longitude: row.lng ?? undefined,
    imageUrl: row.cover_media_id ? urls.get(row.cover_media_id) || undefined : undefined,
    coverMediaId: row.cover_media_id || undefined,
  };
}

function mapTrip(row: TripRow, context: SyncContext, itinerary: TripItineraryRow[]): Trip {
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = !row.ends_on || row.ends_on >= now;
  const dateLabel = [row.starts_on, row.ends_on]
    .filter(Boolean)
    .map((value) => formatDay(value!, context.timeZone))
    .join(' – ');
  return {
    id: row.id,
    title: row.title,
    meta: dateLabel || 'Date not set',
    coverGradient: upcoming
      ? 'linear-gradient(145deg,#DDE8F4,#F0D9E4)'
      : 'linear-gradient(145deg,#F2DED8,#DDE8E2)',
    upcoming,
    flightCode: row.flight_code || '—',
    departLabel: row.depart_label || '—',
    arriveLabel: row.arrive_label || '—',
    itinerary: itinerary
      .filter((item) => item.trip_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({ day: item.day_label, title: item.title, meta: item.note || '' })),
  };
}

async function loadPlaces(context: SyncContext) {
  const db = client();
  const full = await db.from('places')
    .select('id,title,category,rating,note,lat,lng,cover_media_id,visited_on')
    .eq('couple_id', context.coupleId)
    .order('created_at', { ascending: false })
    .limit(250)
    .returns<PlaceRow[]>();
  if (!full.error || !full.error.message.includes('cover_media_id')) return full;
  return db.from('places')
    .select('id,title,category,rating,note,lat,lng,visited_on')
    .eq('couple_id', context.coupleId)
    .order('created_at', { ascending: false })
    .limit(250)
    .returns<PlaceRow[]>();
}

async function loadProfileSettings(context: SyncContext) {
  const db = client();
  const full = await db.from('profiles')
    .select('id,mood,activity,online_visible,last_seen_visible,activity_visible,gallery_add_allowed,me_time,location_sharing,theme_key,dark_mode,animation_level,quiet_start,quiet_end')
    .eq('couple_id', context.coupleId)
    .returns<ProfileSettingsRow[]>();
  if (!full.error || !/theme_key|dark_mode|animation_level|quiet_start|quiet_end/.test(full.error.message)) return full;
  return db.from('profiles')
    .select('id,mood,activity,online_visible,last_seen_visible,activity_visible,gallery_add_allowed,me_time,location_sharing')
    .eq('couple_id', context.coupleId)
    .returns<ProfileSettingsRow[]>();
}

export async function loadSharedData(context: SyncContext): Promise<SharedSnapshot> {
  const db = client();
  const conversation = await conversationId(context.coupleId);
  const [
    messagesResult,
    mediaResult,
    albumsResult,
    favoritesResult,
    memoriesResult,
    storyResult,
    milestonesResult,
    loveNotesResult,
    placesResult,
    tripsResult,
    itineraryResult,
    foodResult,
    eventsResult,
    notificationsResult,
    statusResult,
    profileResult,
  ] = await Promise.all([
    db.from('messages').select('id,sender_id,body,media_id,reaction,read_at,created_at').eq('conversation_id', conversation).order('created_at').limit(500).returns<MessageRow[]>(),
    db.from('media_assets').select('id,uploaded_by,memory_id,album,kind,storage_path,caption,taken_at,location,created_at').eq('couple_id', context.coupleId).order('created_at', { ascending: false }).limit(500).returns<MediaRow[]>(),
    db.from('albums').select('id,name,icon').eq('couple_id', context.coupleId).order('created_at').returns<AlbumRow[]>(),
    db.from('couple_favorites').select('body').eq('couple_id', context.coupleId).order('created_at').limit(250).returns<Array<{ body: string }>>(),
    db.from('memories').select('id,author_id,occurred_on,title,story,mood_emoji,location').eq('couple_id', context.coupleId).order('occurred_on', { ascending: false }).limit(250).returns<MemoryRow[]>(),
    db.from('story_chapters').select('id,year,title,place,note,icon,sort_order').eq('couple_id', context.coupleId).order('sort_order').limit(250).returns<StoryRow[]>(),
    db.from('milestones').select('id,title,icon,target_at,color_tag').eq('couple_id', context.coupleId).order('target_at').limit(250).returns<MilestoneRow[]>(),
    db.from('love_notes').select('id,author_id,preview,body,unlock_at,opened_at,created_at').eq('couple_id', context.coupleId).order('created_at', { ascending: false }).limit(250).returns<LoveNoteRow[]>(),
    loadPlaces(context),
    db.from('trips').select('id,title,starts_on,ends_on,flight_code,depart_label,arrive_label').eq('couple_id', context.coupleId).order('starts_on').limit(250).returns<TripRow[]>(),
    db.from('trip_itinerary_items').select('trip_id,day_label,title,note,sort_order').order('sort_order').limit(500).returns<TripItineraryRow[]>(),
    db.from('food_entries').select('id,logged_by,media_id,name,category,location,price_label,rating,note,eaten_at').eq('couple_id', context.coupleId).order('eaten_at', { ascending: false }).limit(250).returns<FoodRow[]>(),
    db.from('calendar_events').select('id,title,starts_at,scope,icon').eq('couple_id', context.coupleId).order('starts_at').limit(250).returns<EventRow[]>(),
    db.from('notifications').select('id,icon,body,route,color_tag,read_at,created_at').eq('profile_id', context.userId).order('created_at', { ascending: false }).limit(100).returns<NotificationRow[]>(),
    db.from('food_status_log').select('profile_id,status').eq('couple_id', context.coupleId).order('logged_at', { ascending: false }).limit(100).returns<Array<{ profile_id: string; status: FoodStatus }>>(),
    loadProfileSettings(context),
  ]);
  for (const result of [messagesResult, mediaResult, favoritesResult, memoriesResult, storyResult, milestonesResult, loveNotesResult, placesResult, tripsResult, itineraryResult, foodResult, eventsResult, notificationsResult, statusResult, profileResult]) {
    assertRemote(result.error);
  }
  const messageRows = messagesResult.data ?? [];
  const allMediaRows = mediaResult.data ?? [];
  const urls = await signedMediaUrls(allMediaRows);
  const fallbackAlbums = [...new Set(allMediaRows.map((row) => row.album).filter((name): name is string => !!name))]
    .map<Album>((title) => ({ id: `legacy-${title}`, title, icon: '🖼️' }));
  const profile = profileResult.data?.find((item) => item.id === context.userId);
  const partnerProfile = profileResult.data?.find((item) => item.id !== context.userId);
  if (!profile) throw new Error('Profile preferences could not be loaded.');
  const statusRows = statusResult.data ?? [];
  return {
    photos: allMediaRows.map((row) => mapPhoto(row, context, urls)),
    albums: albumsResult.error ? fallbackAlbums : (albumsResult.data ?? []).map(mapAlbum),
    favorites: (favoritesResult.data ?? []).map((row) => row.body),
    messages: messageRows.map((row) => mapMessage(row, context, urls)),
    memories: (memoriesResult.data ?? []).map((row) => mapMemory(row, context, allMediaRows)),
    storyChapters: (storyResult.data ?? []).map(mapStory),
    countdowns: (milestonesResult.data ?? []).map((row) => mapMilestone(row, context)),
    loveNotes: (loveNotesResult.data ?? []).map((row) => mapLoveNote(row, context)),
    places: (placesResult.data ?? []).map((row) => mapPlace(row, context, urls)),
    trips: (tripsResult.data ?? []).map((row) => mapTrip(row, context, itineraryResult.data ?? [])),
    foodEntries: (foodResult.data ?? []).map((row) => mapFood(row, context, urls)),
    events: (eventsResult.data ?? []).map((row) => mapEvent(row, context)),
    notifications: (notificationsResult.data ?? []).map((row) => mapNotification(row, context)),
    foodStatus: statusRows.find((item) => item.profile_id === context.userId)?.status ?? '',
    partnerFoodStatus: statusRows.find((item) => item.profile_id !== context.userId)?.status ?? '',
    mood: profile.mood ?? 'Not set',
    activity: profile.activity ?? 'Not set',
    partnerMood: partnerProfile?.mood ?? 'No update yet',
    partnerActivity: partnerProfile?.activity_visible ? partnerProfile.activity ?? 'Not set' : 'Hidden',
    locationOn: profile.location_sharing,
    privacy: {
      onlineOn: profile.online_visible,
      lastSeenOn: profile.last_seen_visible,
      actOn: profile.activity_visible,
      galOn: profile.gallery_add_allowed,
      meTime: profile.me_time,
    },
    preferences: {
      theme: profile.theme_key ?? 'sakura',
      dark: profile.dark_mode ?? false,
      animation: profile.animation_level ?? 'full',
      quietHours: {
        from: profile.quiet_start?.slice(0, 5) ?? '22:00',
        to: profile.quiet_end?.slice(0, 5) ?? '07:00',
      },
    },
  };
}

export function subscribeToSharedData(context: SyncContext, listener: () => void) {
  const db = client();
  let timer: number | undefined;
  const notify = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(listener, 100);
  };
  let channel: RealtimeChannel = db.channel(`space:${context.coupleId}:${context.userId}:${crypto.randomUUID()}`);
  for (const table of [
    'food_entries',
    'food_status_log',
    'calendar_events',
    'location_pings',
    'couple_favorites',
    'memories',
    'story_chapters',
    'milestones',
    'love_notes',
    'places',
    'trips',
  ]) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table, filter: `couple_id=eq.${context.coupleId}` },
      notify,
    );
  }
  channel = channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, notify)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_itinerary_items' }, notify)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'media_assets', filter: `couple_id=eq.${context.coupleId}` }, notify)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `profile_id=eq.${context.userId}` }, notify)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `couple_id=eq.${context.coupleId}` }, notify);
  channel.subscribe();
  const albumChannel = db
    .channel(`albums:${context.coupleId}:${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'albums', filter: `couple_id=eq.${context.coupleId}` }, notify);
  albumChannel.subscribe();
  return () => {
    window.clearTimeout(timer);
    void db.removeChannel(channel);
    void db.removeChannel(albumChannel);
  };
}

export function createChatPresence(context: SyncContext, listener: (active: boolean) => void): ChatPresence {
  const db = client();
  let connected = false;
  const channel = db
    .channel(`chat-presence:${context.coupleId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      if (payload?.userId !== context.userId) listener(payload?.active === true);
    });

  channel.subscribe((status) => {
    connected = status === 'SUBSCRIBED';
  });

  return {
    setTyping(active) {
      if (!connected) return;
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: context.userId, active },
      });
    },
    unsubscribe() {
      connected = false;
      void db.removeChannel(channel);
    },
  };
}

export async function sendSharedMessage(context: SyncContext, text: string) {
  const db = client();
  const conversation = await conversationId(context.coupleId);
  const { data, error } = await db.from('messages').insert({
    conversation_id: conversation,
    sender_id: context.userId,
    body: text.trim(),
  }).select('id,sender_id,body,media_id,reaction,read_at,created_at').single<MessageRow>();
  assertRemote(error);
  if (!data) throw new Error('The message could not be sent.');
  return mapMessage(data, context, new Map());
}

export async function markSharedMessagesRead(context: SyncContext) {
  const conversation = await conversationId(context.coupleId);
  const { error } = await client()
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversation)
    .neq('sender_id', context.userId)
    .is('read_at', null);
  assertRemote(error);
}

function dataUrlBlob(dataUrl: string) {
  const [header, encoded] = dataUrl.split(',', 2);
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? 'image/jpeg';
  const bytes = Uint8Array.from(window.atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

interface SharedPhotoInput {
  caption: string;
  dataUrl: string;
  album?: string;
  location?: string;
}

async function createSharedPhotoAsset(context: SyncContext, photo: SharedPhotoInput) {
  const db = client();
  const blob = dataUrlBlob(photo.dataUrl);
  const assetId = crypto.randomUUID();
  const path = `${context.coupleId}/${assetId}.jpg`;
  const upload = await db.storage.from('media').upload(path, blob, { contentType: blob.type, upsert: false });
  assertRemote(upload.error);
  const { error } = await db.from('media_assets').insert({
    id: assetId,
    couple_id: context.coupleId,
    uploaded_by: context.userId,
    album: photo.album?.trim() || null,
    kind: 'photo',
    storage_path: path,
    caption: photo.caption.trim() || 'A new moment 💗',
    location: photo.location?.trim() || null,
    taken_at: new Date().toISOString(),
  });
  if (error) {
    await db.storage.from('media').remove([path]);
    assertRemote(error);
  }
  return { assetId, path };
}

async function removeSharedPhotoAsset(context: SyncContext, assetId: string, path: string) {
  const db = client();
  const { error } = await db.from('media_assets').delete().eq('id', assetId).eq('couple_id', context.coupleId);
  assertRemote(error);
  const storage = await db.storage.from('media').remove([path]);
  assertRemote(storage.error);
}

export async function uploadSharedPhoto(context: SyncContext, photo: SharedPhotoInput) {
  return createSharedPhotoAsset(context, photo);
}

export async function sendSharedPhoto(
  context: SyncContext,
  photo: SharedPhotoInput,
) {
  const db = client();
  const { assetId, path } = await createSharedPhotoAsset(context, photo);
  const conversation = await conversationId(context.coupleId);
  const { data, error } = await db.from('messages').insert({
    conversation_id: conversation,
    sender_id: context.userId,
    body: photo.caption,
    media_id: assetId,
  }).select('id,sender_id,body,media_id,reaction,read_at,created_at').single<MessageRow>();
  if (error) {
    await db.from('media_assets').delete().eq('id', assetId);
    await db.storage.from('media').remove([path]);
    assertRemote(error);
  }
  if (!data) throw new Error('The picture could not be sent.');
  return mapMessage(data, context, new Map([[assetId, photo.dataUrl]]));
}

export async function updateSharedPhoto(context: SyncContext, id: string, patch: { caption?: string; album?: string }) {
  const payload: Record<string, string | null> = {};
  if (patch.caption !== undefined) payload.caption = patch.caption.trim() || 'A new moment 💗';
  if (patch.album !== undefined) payload.album = patch.album.trim() || null;
  const { error } = await client().from('media_assets').update(payload).eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(error);
}

export async function deleteSharedPhoto(context: SyncContext, id: string) {
  const db = client();
  const { data, error } = await db.from('media_assets').select('storage_path').eq('id', id).eq('couple_id', context.coupleId).single<{ storage_path: string }>();
  assertRemote(error);
  if (!data) throw new Error('Picture not found.');
  await removeSharedPhotoAsset(context, id, data.storage_path);
}

export async function addSharedAlbum(context: SyncContext, input: { title: string; icon: string }) {
  const { error } = await client().from('albums').insert({
    couple_id: context.coupleId,
    created_by: context.userId,
    name: input.title.trim(),
    icon: input.icon.trim() || '🖼️',
  });
  assertRemote(error);
}

export async function updateSharedAlbum(context: SyncContext, id: string, oldTitle: string, input: { title: string; icon: string }) {
  const db = client();
  const title = input.title.trim();
  const album = await db.from('albums').update({ name: title, icon: input.icon.trim() || '🖼️' }).eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(album.error);
  const media = await db.from('media_assets').update({ album: title }).eq('couple_id', context.coupleId).eq('album', oldTitle);
  assertRemote(media.error);
}

export async function deleteSharedAlbum(context: SyncContext, id: string, title: string) {
  const db = client();
  const media = await db.from('media_assets').update({ album: null }).eq('couple_id', context.coupleId).eq('album', title);
  assertRemote(media.error);
  const album = await db.from('albums').delete().eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(album.error);
}

export async function addSharedFood(context: SyncContext, entry: Omit<FoodEntry, 'id'>) {
  const db = client();
  const media = entry.imageUrl
    ? await createSharedPhotoAsset(context, {
        caption: entry.name,
        dataUrl: entry.imageUrl,
        album: `Food · ${entry.category}`,
        location: entry.location,
      })
    : null;
  const { error } = await db.from('food_entries').insert({
    couple_id: context.coupleId,
    logged_by: context.userId,
    media_id: media?.assetId ?? null,
    name: entry.name,
    category: entry.category,
    location: entry.location,
    price_label: entry.price,
    rating: entry.rating,
    note: entry.note,
    eaten_at: new Date().toISOString(),
  });
  if (error && media) await removeSharedPhotoAsset(context, media.assetId, media.path);
  assertRemote(error);
}

export async function addSharedFavorite(context: SyncContext, body: string) {
  const { error } = await client().from('couple_favorites').insert({
    couple_id: context.coupleId,
    author_id: context.userId,
    body: body.trim(),
  });
  assertRemote(error);
}

export async function addSharedMemory(
  context: SyncContext,
  input: { title: string; occurredOn: string; story: string; mood: string; location: string },
) {
  const { error } = await client().from('memories').insert({
    couple_id: context.coupleId,
    author_id: context.userId,
    title: input.title.trim(),
    occurred_on: input.occurredOn,
    story: input.story.trim() || null,
    mood_emoji: input.mood.trim() || '💗',
    location: input.location.trim() || null,
  });
  assertRemote(error);
}

export async function addSharedStoryChapter(
  context: SyncContext,
  input: { year: string; title: string; place: string; note: string; icon: string },
) {
  const { error } = await client().from('story_chapters').insert({
    couple_id: context.coupleId,
    year: input.year.trim(),
    title: input.title.trim(),
    place: input.place.trim() || null,
    note: input.note.trim() || null,
    icon: input.icon.trim() || '🌱',
    sort_order: Math.floor(Date.now() / 1000),
  });
  assertRemote(error);
}

export async function addSharedCountdown(
  context: SyncContext,
  input: { title: string; targetAt: string; icon: string },
) {
  const { error } = await client().from('milestones').insert({
    couple_id: context.coupleId,
    title: input.title.trim(),
    target_at: input.targetAt,
    icon: input.icon.trim() || '⏳',
    color_tag: 'pk',
  });
  assertRemote(error);
}

export async function addSharedLoveNote(
  context: SyncContext,
  recipientId: string,
  input: { preview: string; body: string; unlockAt: string },
) {
  const { error } = await client().from('love_notes').insert({
    couple_id: context.coupleId,
    author_id: context.userId,
    recipient_id: recipientId,
    preview: input.preview.trim(),
    body: input.body.trim(),
    unlock_at: input.unlockAt || null,
  });
  assertRemote(error);
}

export async function markSharedLoveNoteOpened(context: SyncContext, id: string) {
  const { error } = await client().from('love_notes')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', id)
    .eq('couple_id', context.coupleId);
  assertRemote(error);
}

export async function addSharedPlace(
  context: SyncContext,
  input: { title: string; category: string; rating: number; note: string; visitedOn: string; latitude?: number; longitude?: number; photoDataUrl?: string },
) {
  const db = client();
  const media = input.photoDataUrl
    ? await createSharedPhotoAsset(context, { caption: input.title, dataUrl: input.photoDataUrl, location: input.title })
    : null;
  const { error } = await db.from('places').insert({
    couple_id: context.coupleId,
    added_by: context.userId,
    title: input.title.trim(),
    category: input.category || '📍 Memories',
    rating: input.rating || null,
    note: input.note.trim() || null,
    lat: input.latitude ?? null,
    lng: input.longitude ?? null,
    cover_media_id: media?.assetId ?? null,
    visited_on: input.visitedOn || null,
  });
  if (error && media) await removeSharedPhotoAsset(context, media.assetId, media.path);
  assertRemote(error);
}

export async function removeSharedPlace(context: SyncContext, id: string) {
  const db = client();
  const place = await db.from('places').select('cover_media_id').eq('id', id).eq('couple_id', context.coupleId).maybeSingle<{ cover_media_id: string | null }>();
  assertRemote(place.error);
  let mediaPath = '';
  if (place.data?.cover_media_id) {
    const media = await db.from('media_assets').select('storage_path').eq('id', place.data.cover_media_id).eq('couple_id', context.coupleId).maybeSingle<{ storage_path: string }>();
    assertRemote(media.error);
    mediaPath = media.data?.storage_path ?? '';
  }
  const removed = await db.from('places').delete().eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(removed.error);
  if (place.data?.cover_media_id && mediaPath) {
    await removeSharedPhotoAsset(context, place.data.cover_media_id, mediaPath);
  }
}

export async function addSharedTrip(
  context: SyncContext,
  input: { title: string; startsOn: string; endsOn: string; flightCode: string; departLabel: string; arriveLabel: string },
) {
  const { error } = await client().from('trips').insert({
    couple_id: context.coupleId,
    title: input.title.trim(),
    starts_on: input.startsOn || null,
    ends_on: input.endsOn || null,
    flight_code: input.flightCode.trim() || null,
    depart_label: input.departLabel.trim() || null,
    arrive_label: input.arriveLabel.trim() || null,
  });
  assertRemote(error);
}

export async function updateSharedFood(context: SyncContext, id: string, patch: Partial<FoodEntry>) {
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.location !== undefined) payload.location = patch.location;
  if (patch.price !== undefined) payload.price_label = patch.price;
  if (patch.rating !== undefined) payload.rating = patch.rating;
  if (patch.note !== undefined) payload.note = patch.note;
  const { error } = await client().from('food_entries').update(payload).eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(error);
}

export async function removeSharedFood(context: SyncContext, id: string) {
  const db = client();
  const food = await db.from('food_entries').select('media_id').eq('id', id).eq('couple_id', context.coupleId).maybeSingle<{ media_id: string | null }>();
  assertRemote(food.error);
  let mediaPath = '';
  if (food.data?.media_id) {
    const media = await db.from('media_assets').select('storage_path').eq('id', food.data.media_id).eq('couple_id', context.coupleId).maybeSingle<{ storage_path: string }>();
    assertRemote(media.error);
    mediaPath = media.data?.storage_path ?? '';
  }
  const removed = await db.from('food_entries').delete().eq('id', id).eq('couple_id', context.coupleId);
  assertRemote(removed.error);
  if (food.data?.media_id && mediaPath) {
    await removeSharedPhotoAsset(context, food.data.media_id, mediaPath);
  }
}

export async function addSharedEvent(context: SyncContext, event: Omit<CalendarEvent, 'id'>) {
  const { error } = await client().from('calendar_events').insert({
    couple_id: context.coupleId,
    created_by: context.userId,
    title: event.title,
    starts_at: event.startsAt ?? new Date().toISOString(),
    scope: event.scope,
    icon: event.icon,
  });
  assertRemote(error);
}

export async function setSharedFoodStatus(context: SyncContext, status: Exclude<FoodStatus, ''>) {
  const { error } = await client().from('food_status_log').insert({
    couple_id: context.coupleId,
    profile_id: context.userId,
    status,
  });
  assertRemote(error);
}

export async function updateSharedProfile(
  context: SyncContext,
  patch: Partial<{
    mood: string;
    activity: string;
    locationOn: boolean;
    privacy: PrivacySettings;
    preferences: Partial<AccountPreferences>;
  }>,
) {
  const payload: Record<string, unknown> = {};
  if (patch.mood !== undefined) payload.mood = patch.mood;
  if (patch.activity !== undefined) payload.activity = patch.activity;
  if (patch.locationOn !== undefined) payload.location_sharing = patch.locationOn;
  if (patch.privacy) Object.assign(payload, {
    online_visible: patch.privacy.onlineOn,
    last_seen_visible: patch.privacy.lastSeenOn,
    activity_visible: patch.privacy.actOn,
    gallery_add_allowed: patch.privacy.galOn,
    me_time: patch.privacy.meTime,
  });
  if (patch.preferences?.theme !== undefined) payload.theme_key = patch.preferences.theme;
  if (patch.preferences?.dark !== undefined) payload.dark_mode = patch.preferences.dark;
  if (patch.preferences?.animation !== undefined) payload.animation_level = patch.preferences.animation;
  if (patch.preferences?.quietHours !== undefined) Object.assign(payload, {
    quiet_start: patch.preferences.quietHours.from,
    quiet_end: patch.preferences.quietHours.to,
  });
  const { error } = await client().from('profiles').update(payload).eq('id', context.userId);
  assertRemote(error);
}

export async function markSharedNotification(context: SyncContext, id: string) {
  const { error } = await client().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('profile_id', context.userId);
  assertRemote(error);
}

export async function markAllSharedNotifications(context: SyncContext) {
  const { error } = await client().from('notifications').update({ read_at: new Date().toISOString() }).eq('profile_id', context.userId).is('read_at', null);
  assertRemote(error);
}

export async function resetSharedSpace(context: SyncContext) {
  const db = client();
  const { data: assets, error: assetsError } = await db.from('media_assets').select('storage_path').eq('couple_id', context.coupleId).returns<Array<{ storage_path: string }>>();
  assertRemote(assetsError);
  const paths = (assets ?? []).map((item) => item.storage_path);
  if (paths.length) {
    const storageResult = await db.storage.from('media').remove(paths);
    assertRemote(storageResult.error);
  }
  const { error } = await db.rpc('reset_current_couple_data');
  assertRemote(error);
}
