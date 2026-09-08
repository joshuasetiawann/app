import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ThemeKey, Viewport } from '../lib/theme';
import { buildTokens, tokensToCssVars, viewportFromWidth } from '../lib/theme';
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
import {
  ALBUMS,
  COUNTDOWNS,
  EVENTS,
  FAVORITE_THINGS,
  FOOD_ENTRIES,
  INITIAL_MESSAGES,
  LOVE_NOTES,
  MEMORIES,
  NOTIFICATIONS,
  PHOTOS,
  PLACES,
  STORY,
  TRIPS,
} from '../data/mockData';
import { useAuthState } from './AuthState';
import { showDeviceNotification } from '../lib/native';
import {
  addSharedAlbum,
  addSharedEvent,
  addSharedFavorite,
  addSharedFood,
  addSharedCountdown,
  addSharedLoveNote,
  addSharedMemory,
  addSharedPlace,
  addSharedStoryChapter,
  addSharedTrip,
  createChatPresence,
  deleteSharedAlbum,
  deleteSharedPhoto,
  loadSharedData,
  markAllSharedNotifications,
  markSharedMessagesRead,
  markSharedLoveNoteOpened,
  markSharedNotification,
  removeSharedFood,
  removeSharedPlace,
  resetSharedSpace,
  sendSharedMessage,
  sendSharedPhoto,
  setSharedFoodStatus,
  subscribeToSharedData,
  updateSharedAlbum,
  updateSharedFood,
  updateSharedPhoto,
  updateSharedProfile,
  uploadSharedPhoto,
  type AnimationPreference,
  type ChatPresence,
  type PrivacySettings,
  type SyncContext,
} from '../services/syncService';

export type SheetKind = '' | 'more' | 'pap' | 'mood' | 'event' | 'delete' | 'capsule' | 'food';
export type GalleryView = 'grid' | 'polaroid' | 'timeline';
export type FoodStatus = '' | 'ate' | 'now' | 'not';
export type AnimLevel = AnimationPreference;

type PrivacyToggles = PrivacySettings;
type SyncStatus = 'local' | 'loading' | 'synced' | 'error';

interface PendingTextMessage {
  id: string;
  text: string;
  time: string;
  status: 'queued' | 'failed';
}

interface AppStateShape {
  // shell / theme
  dark: boolean;
  theme: ThemeKey;
  vpForce: Viewport | '';
  width: number;
  reduced: boolean;
  offline: boolean;
  // sheets & overlays
  sheet: SheetKind;
  viewerIndex: number;
  toastMsg: string;
  // home / status
  foodStatus: FoodStatus;
  partnerFoodStatus: FoodStatus;
  mood: string;
  activity: string;
  partnerMood: string;
  partnerActivity: string;
  // pap flow
  papStep: 0 | 1 | 2 | 3;
  papCaption: string;
  papPercent: number;
  // chat
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
  draft: string;
  typing: boolean;
  // food journal
  foodEntries: FoodEntry[];
  // shared planning / notifications
  events: CalendarEvent[];
  notifications: NotificationItem[];
  unreadCount: number;
  // filters
  galleryFilter: string;
  galleryView: GalleryView;
  foodCategory: string;
  agendaView: 'Day' | 'Week' | 'Month' | 'Agenda';
  placeCategory: string;
  // privacy / location
  locationOn: boolean;
  privacy: PrivacyToggles;
  animLevel: AnimLevel;
  quietHours: { from: string; to: string };
  syncStatus: SyncStatus;
  syncError: string;
}

interface AppStateApi extends AppStateShape {
  viewport: Viewport;
  cssVars: ReturnType<typeof tokensToCssVars>;
  toggleDark: () => void;
  setTheme: (t: ThemeKey) => void;
  setVpForce: (v: Viewport | '') => void;
  toast: (msg: string) => void;
  openSheet: (s: SheetKind) => void;
  closeSheet: () => void;
  openViewer: (index: number) => void;
  closeViewer: () => void;
  setFoodStatus: (s: FoodStatus) => void;
  setMood: (m: string) => void;
  startPap: () => void;
  resetPap: () => void;
  papCaptionStep: () => void;
  setPapCaption: (c: string) => void;
  sendMessage: (text: string) => boolean;
  retryMessage: (id: string) => void;
  markMessagesRead: () => void;
  setDraft: (d: string) => void;
  addPhotoMessage: (photo: Pick<Photo, 'slotLabel' | 'caption'> & { dataUrl?: string; album?: string }) => void;
  addGalleryPhoto: (photo: { caption: string; dataUrl: string; album?: string }) => void;
  updatePhoto: (id: string, patch: { caption?: string; album?: string }) => void;
  removePhoto: (id: string) => void;
  addAlbum: (input: { title: string; icon: string }) => void;
  updateAlbum: (id: string, input: { title: string; icon: string }) => void;
  removeAlbum: (id: string) => void;
  addFavorite: (body: string) => void;
  addMemory: (input: { title: string; occurredOn: string; story: string; mood: string; location: string; photoDataUrl?: string }) => void;
  addStoryChapter: (input: { year: string; title: string; place: string; note: string; icon: string }) => void;
  addCountdown: (input: { title: string; targetAt: string; icon: string }) => void;
  addLoveNote: (input: { preview: string; body: string; unlockAt: string }) => boolean;
  markLoveNoteOpened: (id: string) => void;
  addPlace: (input: { title: string; category: string; rating: number; note: string; visitedOn: string; latitude?: number; longitude?: number; photoDataUrl?: string }) => void;
  removePlace: (id: string) => void;
  addTrip: (input: { title: string; startsOn: string; endsOn: string; flightCode: string; departLabel: string; arriveLabel: string }) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  updateFoodEntry: (id: string, patch: Partial<FoodEntry>) => void;
  removeFoodEntry: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setGalleryFilter: (f: string) => void;
  setGalleryView: (v: GalleryView) => void;
  setFoodCategory: (c: string) => void;
  setAgendaView: (v: AppStateShape['agendaView']) => void;
  setPlaceCategory: (c: string) => void;
  toggleLocation: () => void;
  setLocation: (on: boolean) => void;
  togglePrivacy: (key: keyof PrivacyToggles) => void;
  /** Calm keeps interaction feedback; power saver and the OS preference reduce all motion. */
  setAnimLevel: (l: AnimLevel) => void;
  setQuietHours: (hours: { from: string; to: string }) => void;
  toggleOffline: () => void;
  refreshSharedData: () => Promise<void>;
  resetSharedData: () => Promise<void>;
}

const AppStateContext = createContext<AppStateApi | null>(null);

function readStoredTheme(): ThemeKey {
  const stored = window.localStorage.getItem('kk-theme');
  return (stored as ThemeKey) || 'sakura';
}

function readStoredDark(): boolean {
  const stored = window.localStorage.getItem('kk-dark');
  if (stored) return stored === '1';
  return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function readStoredReduced(): boolean {
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the current session usable if the browser's local quota is full.
  }
}

function clearLegacyCloudStorage() {
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith('kk-space-') && !key.endsWith(':pending-messages')) window.localStorage.removeItem(key);
  }
  for (const key of ['kk-auth-db-v1', 'kk-auth-session-v1', 'kk-theme', 'kk-dark', 'kk-quiet-hours']) {
    window.localStorage.removeItem(key);
  }
}

function isQuietTime(hours: { from: string; to: string }) {
  const minutes = (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  };
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = minutes(hours.from);
  const end = minutes(hours.to);
  if (start === end) return false;
  return start < end ? current >= start && current < end : current >= start || current < end;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  const storageBase = `kk-space-${auth.couple?.id ?? auth.profile?.id ?? 'guest'}`;
  const isDemoSpace = auth.profile?.email.endsWith('@demo.kisahkita') ?? false;
  const syncContext = useMemo<SyncContext | null>(() => (
    auth.mode === 'supabase' && auth.profile && auth.couple
      ? { userId: auth.profile.id, coupleId: auth.couple.id, timeZone: auth.profile.timezone || 'UTC' }
      : null
  ), [auth.couple, auth.mode, auth.profile]);
  const [dark, setDark] = useState(() => auth.mode === 'local' ? readStoredDark() : false);
  const [theme, setThemeState] = useState<ThemeKey>(() => auth.mode === 'local' ? readStoredTheme() : 'sakura');
  const [vpForce, setVpForce] = useState<Viewport | ''>('');
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const [systemReduced, setSystemReduced] = useState(readStoredReduced);
  const [offline, setOffline] = useState(false);

  const [sheet, setSheet] = useState<SheetKind>('');
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [toastMsg, setToastMsg] = useState('');

  const [foodStatus, setFoodStatusState] = useState<FoodStatus>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:food-status`, '') : '');
  const [partnerFoodStatus, setPartnerFoodStatus] = useState<FoodStatus>('');
  const [mood, setMoodState] = useState(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:mood`, isDemoSpace ? 'Missing you 🥺' : 'Not set') : 'Not set');
  const [activity, setActivity] = useState(isDemoSpace ? 'Coding 💻' : 'Not set');
  const [partnerMood, setPartnerMood] = useState(isDemoSpace ? 'Motivated 🌸' : 'No update yet');
  const [partnerActivity, setPartnerActivity] = useState(isDemoSpace ? 'Studying 📚' : 'Not set');

  const [papStep, setPapStep] = useState<0 | 1 | 2 | 3>(0);
  const [papCaption, setPapCaption] = useState('');
  const [papPercent, setPapPercent] = useState(0);

  const [messages, setMessages] = useState<Message[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:messages`, isDemoSpace ? INITIAL_MESSAGES : []) : []);
  const [photos, setPhotos] = useState<Photo[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:photos`, isDemoSpace ? PHOTOS : []) : []);
  const [albums, setAlbums] = useState<Album[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:albums`, isDemoSpace ? ALBUMS : []) : []);
  const [favorites, setFavorites] = useState<string[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:favorites`, isDemoSpace ? FAVORITE_THINGS : []) : []);
  const [memories, setMemories] = useState<Memory[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:memories`, isDemoSpace ? MEMORIES : []) : []);
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:story`, isDemoSpace ? STORY : []) : []);
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:countdowns`, isDemoSpace ? COUNTDOWNS : []) : []);
  const [loveNotes, setLoveNotes] = useState<LoveNote[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:love-notes`, isDemoSpace ? LOVE_NOTES : []) : []);
  const [places, setPlaces] = useState<Place[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:places`, isDemoSpace ? PLACES : []) : []);
  const [trips, setTrips] = useState<Trip[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:trips`, isDemoSpace ? TRIPS : []) : []);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:food`, isDemoSpace ? FOOD_ENTRIES : []) : []);
  const [events, setEvents] = useState<CalendarEvent[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:events`, isDemoSpace ? EVENTS : []) : []);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:notifications`, isDemoSpace ? NOTIFICATIONS : []) : []);
  const [draft, setDraftState] = useState('');
  const [typing, setTyping] = useState(false);

  const [galleryFilter, setGalleryFilter] = useState('All');
  const [galleryView, setGalleryView] = useState<GalleryView>('grid');
  const [foodCategory, setFoodCategory] = useState('All');
  const [agendaView, setAgendaView] = useState<AppStateShape['agendaView']>('Agenda');
  const [placeCategory, setPlaceCategory] = useState('All');

  const [locationOn, setLocationOn] = useState(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:location`, false) : false);
  const [privacy, setPrivacy] = useState<PrivacyToggles>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:privacy`, { onlineOn: true, lastSeenOn: true, actOn: true, galOn: true, meTime: false }) : { onlineOn: true, lastSeenOn: true, actOn: true, galOn: true, meTime: false });
  const [animLevel, setAnimLevelState] = useState<AnimLevel>(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:animation`, 'full') : 'full');
  const reduced = systemReduced || animLevel === 'off';
  const [quietHours, setQuietHoursState] = useState(() => auth.mode === 'local' ? readStoredValue(`${storageBase}:quiet-hours`, { from: '22:00', to: '07:00' }) : { from: '22:00', to: '07:00' });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(auth.mode === 'supabase' ? 'loading' : 'local');
  const [syncError, setSyncError] = useState('');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const papTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const incomingTypingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingMessagesRef = useRef<PendingTextMessage[]>(readStoredValue(`${storageBase}:pending-messages`, []));
  const queueFlushingRef = useRef(false);
  const markingReadRef = useRef(false);
  const chatPresenceRef = useRef<ChatPresence | null>(null);
  const notificationIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setSystemReduced(preference.matches);
    preference.addEventListener('change', onPreference);
    onPreference();
    return () => preference.removeEventListener('change', onPreference);
  }, []);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('resize', onResize);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => () => {
    clearTimeout(typingTimer.current);
    clearTimeout(incomingTypingTimer.current);
  }, []);

  useEffect(() => {
    if (auth.mode !== 'local') return;
    // oxlint-disable-next-line react/set-state-in-effect -- the auth-owned storage namespace changed.
    setMessages(readStoredValue(`${storageBase}:messages`, isDemoSpace ? INITIAL_MESSAGES : []));
    setPhotos(readStoredValue(`${storageBase}:photos`, isDemoSpace ? PHOTOS : []));
    setAlbums(readStoredValue(`${storageBase}:albums`, isDemoSpace ? ALBUMS : []));
    setFavorites(readStoredValue(`${storageBase}:favorites`, isDemoSpace ? FAVORITE_THINGS : []));
    setMemories(readStoredValue(`${storageBase}:memories`, isDemoSpace ? MEMORIES : []));
    setStoryChapters(readStoredValue(`${storageBase}:story`, isDemoSpace ? STORY : []));
    setCountdowns(readStoredValue(`${storageBase}:countdowns`, isDemoSpace ? COUNTDOWNS : []));
    setLoveNotes(readStoredValue(`${storageBase}:love-notes`, isDemoSpace ? LOVE_NOTES : []));
    setPlaces(readStoredValue(`${storageBase}:places`, isDemoSpace ? PLACES : []));
    setTrips(readStoredValue(`${storageBase}:trips`, isDemoSpace ? TRIPS : []));
    setFoodEntries(readStoredValue(`${storageBase}:food`, isDemoSpace ? FOOD_ENTRIES : []));
    setEvents(readStoredValue(`${storageBase}:events`, isDemoSpace ? EVENTS : []));
    setNotifications(readStoredValue(`${storageBase}:notifications`, isDemoSpace ? NOTIFICATIONS : []));
    setFoodStatusState(readStoredValue(`${storageBase}:food-status`, ''));
    setPartnerFoodStatus('');
    setMoodState(readStoredValue(`${storageBase}:mood`, isDemoSpace ? 'Missing you 🥺' : 'Not set'));
    setActivity(isDemoSpace ? 'Coding 💻' : 'Not set');
    setPartnerMood(isDemoSpace ? 'Motivated 🌸' : 'No update yet');
    setPartnerActivity(isDemoSpace ? 'Studying 📚' : 'Not set');
    setPrivacy(readStoredValue(`${storageBase}:privacy`, { onlineOn: true, lastSeenOn: true, actOn: true, galOn: true, meTime: false }));
    setLocationOn(readStoredValue(`${storageBase}:location`, false));
    setSyncStatus('local');
    setSyncError('');
  }, [auth.mode, isDemoSpace, storageBase]);

  useEffect(() => {
    pendingMessagesRef.current = syncContext
      ? readStoredValue(`${storageBase}:pending-messages`, [])
      : [];
    notificationIdsRef.current = null;
  }, [storageBase, syncContext]);

  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:messages`, messages); }, [auth.mode, messages, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:photos`, photos); }, [auth.mode, photos, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:albums`, albums); }, [albums, auth.mode, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:favorites`, favorites); }, [auth.mode, favorites, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:memories`, memories); }, [auth.mode, memories, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:story`, storyChapters); }, [auth.mode, storageBase, storyChapters]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:countdowns`, countdowns); }, [auth.mode, countdowns, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:love-notes`, loveNotes); }, [auth.mode, loveNotes, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:places`, places); }, [auth.mode, places, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:trips`, trips); }, [auth.mode, storageBase, trips]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:food`, foodEntries); }, [auth.mode, foodEntries, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:events`, events); }, [auth.mode, events, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:notifications`, notifications); }, [auth.mode, notifications, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:food-status`, foodStatus); }, [auth.mode, foodStatus, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:mood`, mood); }, [auth.mode, mood, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:privacy`, privacy); }, [auth.mode, privacy, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:location`, locationOn); }, [auth.mode, locationOn, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:animation`, animLevel); }, [animLevel, auth.mode, storageBase]);
  useEffect(() => { if (auth.mode === 'local') writeStoredValue(`${storageBase}:quiet-hours`, quietHours); }, [auth.mode, quietHours, storageBase]);

  const applySharedData = useCallback((snapshot: Awaited<ReturnType<typeof loadSharedData>>) => {
    const knownNotificationIds = notificationIdsRef.current;
    if (knownNotificationIds) {
      const incoming = snapshot.notifications.find((item) => item.unread && !knownNotificationIds.has(item.id));
      if (incoming && !snapshot.privacy.meTime && !isQuietTime(snapshot.preferences.quietHours)) {
        void showDeviceNotification('KisahKita', `${incoming.icon} ${incoming.text}`, incoming.route);
      }
    }
    notificationIdsRef.current = new Set(snapshot.notifications.map((item) => item.id));
    setPhotos(snapshot.photos);
    setAlbums(snapshot.albums);
    setFavorites(snapshot.favorites);
    const pending = pendingMessagesRef.current.map<Message>((item) => ({
      id: item.id,
      from: 'me',
      text: item.text,
      time: item.time,
      read: false,
      status: item.status,
    }));
    setMessages([...snapshot.messages, ...pending]);
    setMemories(snapshot.memories);
    setStoryChapters(snapshot.storyChapters);
    setCountdowns(snapshot.countdowns);
    setLoveNotes(snapshot.loveNotes);
    setPlaces(snapshot.places);
    setTrips(snapshot.trips);
    setFoodEntries(snapshot.foodEntries);
    setEvents(snapshot.events);
    setNotifications(snapshot.notifications);
    setFoodStatusState(snapshot.foodStatus);
    setPartnerFoodStatus(snapshot.partnerFoodStatus);
    setMoodState(snapshot.mood);
    setActivity(snapshot.activity);
    setPartnerMood(snapshot.partnerMood);
    setPartnerActivity(snapshot.partnerActivity);
    setPrivacy(snapshot.privacy);
    setLocationOn(snapshot.locationOn);
    setThemeState(snapshot.preferences.theme);
    setDark(snapshot.preferences.dark);
    setAnimLevelState(snapshot.preferences.animation);
    setQuietHoursState(snapshot.preferences.quietHours);
  }, []);

  const refreshSharedData = useCallback(async () => {
    if (!syncContext) return;
    try {
      setSyncStatus('loading');
      const snapshot = await loadSharedData(syncContext);
      applySharedData(snapshot);
      clearLegacyCloudStorage();
      setSyncStatus('synced');
      setSyncError('');
    } catch (error) {
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Sinkronisasi Supabase terganggu.');
      throw error;
    }
  }, [applySharedData, syncContext]);

  useEffect(() => {
    if (!syncContext) return;
    // oxlint-disable-next-line react/set-state-in-effect -- initial cloud hydration belongs to this subscription effect.
    void refreshSharedData().catch(() => undefined);
    const unsubscribe = subscribeToSharedData(syncContext, () => void refreshSharedData().catch(() => undefined));
    const onFocus = () => void refreshSharedData().catch(() => undefined);
    window.addEventListener('focus', onFocus);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
  }, [auth.mode, refreshSharedData, syncContext]);

  useEffect(() => {
    if (!syncContext) {
      chatPresenceRef.current = null;
      return;
    }
    const presence = createChatPresence(syncContext, (active) => {
      clearTimeout(incomingTypingTimer.current);
      setTyping(active);
      if (active) incomingTypingTimer.current = setTimeout(() => setTyping(false), 2600);
    });
    chatPresenceRef.current = presence;
    return () => {
      presence.unsubscribe();
      if (chatPresenceRef.current === presence) chatPresenceRef.current = null;
      clearTimeout(incomingTypingTimer.current);
      setTyping(false);
    };
  }, [syncContext]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const runRemote = useCallback((operation: Promise<unknown>) => {
    void operation
      .then(() => refreshSharedData())
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'The change could not be synced.';
        setSyncStatus('error');
        setSyncError(message);
        toast(`Sync failed: ${message}`);
        void refreshSharedData().catch(() => undefined);
      });
  }, [refreshSharedData, toast]);

  const persistPendingMessages = useCallback((messagesToPersist: PendingTextMessage[]) => {
    pendingMessagesRef.current = messagesToPersist;
    writeStoredValue(`${storageBase}:pending-messages`, messagesToPersist);
  }, [storageBase]);

  const flushPendingMessages = useCallback(async () => {
    if (!syncContext || offline || queueFlushingRef.current || !pendingMessagesRef.current.length) return;
    queueFlushingRef.current = true;
    try {
      while (pendingMessagesRef.current.length) {
        const next = pendingMessagesRef.current[0];
        setMessages((current) => current.map((item) => (
          item.id === next.id ? { ...item, status: 'queued' } : item
        )));
        try {
          await sendSharedMessage(syncContext, next.text);
          persistPendingMessages(pendingMessagesRef.current.filter((item) => item.id !== next.id));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'The message could not be sent.';
          persistPendingMessages(pendingMessagesRef.current.map((item) => (
            item.id === next.id ? { ...item, status: 'failed' } : item
          )));
          setMessages((current) => current.map((item) => (
            item.id === next.id ? { ...item, status: 'failed' } : item
          )));
          setSyncStatus('error');
          setSyncError(message);
          toast(`Message not sent: ${message}`);
          return;
        }
      }
      await refreshSharedData();
    } finally {
      queueFlushingRef.current = false;
    }
  }, [offline, persistPendingMessages, refreshSharedData, syncContext, toast]);

  useEffect(() => {
    if (!offline && syncContext && pendingMessagesRef.current.length) void flushPendingMessages();
  }, [flushPendingMessages, offline, syncContext]);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
    const active = value.trim().length > 0;
    chatPresenceRef.current?.setTyping(active);
    clearTimeout(typingTimer.current);
    if (active) {
      typingTimer.current = setTimeout(() => chatPresenceRef.current?.setTyping(false), 1600);
    }
  }, []);

  const toggleDark = useCallback(() => {
    const next = !dark;
    setDark(next);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { preferences: { dark: next } }));
    else window.localStorage.setItem('kk-dark', next ? '1' : '0');
  }, [dark, runRemote, syncContext]);

  const setTheme = useCallback((t: ThemeKey) => {
    setThemeState(t);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { preferences: { theme: t } }));
    else window.localStorage.setItem('kk-theme', t);
  }, [runRemote, syncContext]);

  const startPap = useCallback(() => {
    setPapStep(2);
    setPapPercent(0);
    clearInterval(papTimer.current);
    papTimer.current = setInterval(() => {
      setPapPercent((p) => {
        const next = p + 9;
        if (next >= 100) {
          clearInterval(papTimer.current);
          setPapStep(3);
          return 100;
        }
        return next;
      });
    }, 130);
  }, []);

  const resetPap = useCallback(() => {
    clearInterval(papTimer.current);
    setPapStep(0);
    setPapPercent(0);
    setPapCaption('');
  }, []);

  const papCaptionStep = useCallback(() => setPapStep(1), []);

  const sendMessage = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return false;
    const optimistic: Message = { id: `local-${crypto.randomUUID()}`, from: 'me', text: t, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), status: syncContext ? 'queued' : 'sent', read: false };
    setMessages((prev) => [...prev, optimistic]);
    if (syncContext) {
      persistPendingMessages([...pendingMessagesRef.current, {
        id: optimistic.id,
        text: t,
        time: optimistic.time,
        status: 'queued',
      }]);
      if (!offline) void flushPendingMessages();
    }
    setDraftState('');
    clearTimeout(typingTimer.current);
    chatPresenceRef.current?.setTyping(false);
    return true;
  }, [flushPendingMessages, offline, persistPendingMessages, syncContext]);

  const retryMessage = useCallback((id: string) => {
    const pending = pendingMessagesRef.current.find((item) => item.id === id);
    if (!pending) return;
    persistPendingMessages(pendingMessagesRef.current.map((item) => (
      item.id === id ? { ...item, status: 'queued' } : item
    )));
    setMessages((current) => current.map((item) => (
      item.id === id ? { ...item, status: 'queued' } : item
    )));
    if (offline) toast('Your message will stay queued until you are online.');
    else void flushPendingMessages();
  }, [flushPendingMessages, offline, persistPendingMessages, toast]);

  const markMessagesRead = useCallback(() => {
    if (!syncContext || markingReadRef.current) return;
    markingReadRef.current = true;
    void markSharedMessagesRead(syncContext)
      .then(() => refreshSharedData())
      .catch(() => undefined)
      .finally(() => { markingReadRef.current = false; });
  }, [refreshSharedData, syncContext]);

  const addPhotoMessage = useCallback((photo: Pick<Photo, 'slotLabel' | 'caption'> & { dataUrl?: string; album?: string }) => {
    const optimisticId = `local-${Date.now()}`;
    setPhotos((current) => [{
      id: optimisticId,
      imageUrl: photo.dataUrl,
      slotLabel: photo.slotLabel,
      caption: photo.caption,
      meta: 'Just now',
      takenAt: new Date().toISOString(),
      by: 'me',
      tags: ['Photos', photo.album].filter(Boolean) as string[],
      album: photo.album,
    }, ...current]);
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        from: 'me',
        photoId: optimisticId,
        photoDataUrl: photo.dataUrl,
        text: photo.caption,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: offline ? 'queued' : 'sent',
        read: false,
      },
    ]);
    if (syncContext && photo.dataUrl) {
      if (offline) {
        setMessages((current) => current.map((item) => item.id === optimisticId ? { ...item, status: 'failed' } : item));
        toast('Pictures need an internet connection to reach your partner.');
      } else {
        runRemote(sendSharedPhoto(syncContext, { caption: photo.caption, dataUrl: photo.dataUrl, album: photo.album }));
      }
    }
  }, [offline, runRemote, syncContext, toast]);

  const addGalleryPhoto = useCallback((photo: { caption: string; dataUrl: string; album?: string }) => {
    const entry: Photo = {
      id: `local-photo-${crypto.randomUUID()}`,
      imageUrl: photo.dataUrl,
      slotLabel: 'NEW PHOTO',
      caption: photo.caption.trim() || 'A new moment 💗',
      meta: 'Just now · by you',
      takenAt: new Date().toISOString(),
      by: 'me',
      tags: ['Photos', photo.album].filter(Boolean) as string[],
      album: photo.album,
    };
    setPhotos((current) => [entry, ...current]);
    if (syncContext) runRemote(uploadSharedPhoto(syncContext, photo));
  }, [runRemote, syncContext]);

  const updatePhoto = useCallback((id: string, patch: { caption?: string; album?: string }) => {
    setPhotos((current) => current.map((photo) => {
      if (photo.id !== id) return photo;
      const album = patch.album !== undefined ? patch.album || undefined : photo.album;
      return {
        ...photo,
        ...(patch.caption !== undefined ? { caption: patch.caption.trim() || 'A new moment 💗' } : {}),
        album,
        tags: [photo.slotLabel.startsWith('VIDEO') ? 'Video' : 'Photos', album].filter(Boolean) as string[],
      };
    }));
    if (syncContext && !id.startsWith('local-')) runRemote(updateSharedPhoto(syncContext, id, patch));
  }, [runRemote, syncContext]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
    setViewerIndex(-1);
    if (syncContext && !id.startsWith('local-')) runRemote(deleteSharedPhoto(syncContext, id));
  }, [runRemote, syncContext]);

  const addAlbum = useCallback((input: { title: string; icon: string }) => {
    const title = input.title.trim();
    if (!title || albums.some((album) => album.title.toLocaleLowerCase() === title.toLocaleLowerCase())) {
      toast(title ? 'That album name is already in use.' : 'Enter an album name.');
      return;
    }
    setAlbums((current) => [...current, { id: `local-album-${crypto.randomUUID()}`, title, icon: input.icon.trim() || '🖼️' }]);
    if (syncContext) runRemote(addSharedAlbum(syncContext, { title, icon: input.icon }));
  }, [albums, runRemote, syncContext, toast]);

  const updateAlbum = useCallback((id: string, input: { title: string; icon: string }) => {
    const currentAlbum = albums.find((album) => album.id === id);
    const title = input.title.trim();
    if (!currentAlbum || !title) return;
    if (albums.some((album) => album.id !== id && album.title.toLocaleLowerCase() === title.toLocaleLowerCase())) {
      toast('That album name is already in use.');
      return;
    }
    setAlbums((current) => current.map((album) => album.id === id ? { ...album, title, icon: input.icon.trim() || '🖼️' } : album));
    setPhotos((current) => current.map((photo) => photo.album === currentAlbum.title || photo.tags.includes(currentAlbum.title) ? { ...photo, album: title, tags: photo.tags.map((tag) => tag === currentAlbum.title ? title : tag) } : photo));
    if (syncContext && !id.startsWith('local-') && !id.startsWith('legacy-')) {
      runRemote(updateSharedAlbum(syncContext, id, currentAlbum.title, { title, icon: input.icon }));
    }
  }, [albums, runRemote, syncContext, toast]);

  const removeAlbum = useCallback((id: string) => {
    const currentAlbum = albums.find((album) => album.id === id);
    if (!currentAlbum) return;
    setAlbums((current) => current.filter((album) => album.id !== id));
    setPhotos((current) => current.map((photo) => photo.album === currentAlbum.title || photo.tags.includes(currentAlbum.title) ? { ...photo, album: undefined, tags: photo.tags.filter((tag) => tag !== currentAlbum.title) } : photo));
    if (galleryFilter === currentAlbum.title) setGalleryFilter('All');
    if (syncContext && !id.startsWith('local-') && !id.startsWith('legacy-')) runRemote(deleteSharedAlbum(syncContext, id, currentAlbum.title));
  }, [albums, galleryFilter, runRemote, syncContext]);

  const addFoodEntry = useCallback((entry: Omit<FoodEntry, 'id'>) => {
    setFoodEntries((prev) => [{ ...entry, id: `local-food-${Date.now()}` }, ...prev]);
    if (syncContext) runRemote(addSharedFood(syncContext, entry));
  }, [runRemote, syncContext]);

  const addFavorite = useCallback((body: string) => {
    const value = body.trim();
    if (!value) return;
    setFavorites((current) => [...current, value]);
    if (syncContext) runRemote(addSharedFavorite(syncContext, value));
  }, [runRemote, syncContext]);

  const addMemory = useCallback((input: { title: string; occurredOn: string; story: string; mood: string; location: string; photoDataUrl?: string }) => {
    const memoryId = `local-memory-${crypto.randomUUID()}`;
    const photoId = input.photoDataUrl ? `local-memory-photo-${crypto.randomUUID()}` : '';
    const entry: Memory = {
      id: memoryId,
      date: new Date(`${input.occurredOn}T12:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase(),
      title: input.title.trim(),
      meta: input.location.trim() || 'Written by you',
      mood: input.mood.trim() || '💗',
      story: input.story.trim() || 'No additional story yet.',
      photoIds: photoId ? [photoId] : [],
    };
    setMemories((current) => [entry, ...current]);
    if (photoId && input.photoDataUrl) {
      setPhotos((current) => [{
        id: photoId,
        imageUrl: input.photoDataUrl,
        slotLabel: 'MEMORY PHOTO',
        caption: input.title.trim(),
        meta: input.location.trim() || 'Added to a memory',
        takenAt: new Date().toISOString(),
        location: input.location.trim() || undefined,
        by: 'me',
        tags: ['Photos', 'Memories'],
      }, ...current]);
    }
    if (syncContext) runRemote(addSharedMemory(syncContext, input));
  }, [runRemote, syncContext]);

  const addStoryChapter = useCallback((input: { year: string; title: string; place: string; note: string; icon: string }) => {
    const entry: StoryChapter = {
      id: `local-story-${crypto.randomUUID()}`,
      year: input.year.trim(),
      title: input.title.trim(),
      place: input.place.trim() || 'Place not set',
      note: input.note.trim() || 'No notes yet.',
      icon: input.icon.trim() || '🌱',
    };
    setStoryChapters((current) => [...current, entry]);
    if (syncContext) runRemote(addSharedStoryChapter(syncContext, input));
  }, [runRemote, syncContext]);

  const addCountdown = useCallback((input: { title: string; targetAt: string; icon: string }) => {
    const targetAt = new Date(input.targetAt).toISOString();
    const entry: Countdown = {
      id: `local-countdown-${crypto.randomUUID()}`,
      title: input.title.trim(),
      targetDate: targetAt,
      when: new Date(targetAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      icon: input.icon.trim() || '⏳',
      colorTag: 'pk',
      progressPercent: 45,
    };
    setCountdowns((current) => [...current, entry].sort((a, b) => a.targetDate.localeCompare(b.targetDate)));
    if (syncContext) runRemote(addSharedCountdown(syncContext, { ...input, targetAt }));
  }, [runRemote, syncContext]);

  const addLoveNote = useCallback((input: { preview: string; body: string; unlockAt: string }) => {
    if (!auth.partner) {
      toast('Connect with your partner before sending a note.');
      return false;
    }
    const unlockAt = input.unlockAt ? new Date(input.unlockAt).toISOString() : '';
    const entry: LoveNote = {
      id: `local-note-${crypto.randomUUID()}`,
      tag: unlockAt && new Date(unlockAt).getTime() > Date.now() ? 'SEALED NOTE' : 'A NOTE FOR YOU',
      preview: input.preview.trim(),
      meta: 'From you · just now',
      state: unlockAt && new Date(unlockAt).getTime() > Date.now() ? 'lock' : 'open',
      from: 'me',
      body: input.body.trim(),
      writtenAt: new Date().toISOString(),
    };
    setLoveNotes((current) => [entry, ...current]);
    if (syncContext) runRemote(addSharedLoveNote(syncContext, auth.partner.id, { ...input, unlockAt }));
    return true;
  }, [auth.partner, runRemote, syncContext, toast]);

  const markLoveNoteOpened = useCallback((id: string) => {
    setLoveNotes((current) => current.map((note) => note.id === id ? { ...note, state: 'done' } : note));
    if (syncContext && !id.startsWith('local-')) runRemote(markSharedLoveNoteOpened(syncContext, id));
  }, [runRemote, syncContext]);

  const addPlace = useCallback((input: { title: string; category: string; rating: number; note: string; visitedOn: string; latitude?: number; longitude?: number; photoDataUrl?: string }) => {
    const entry: Place = {
      id: `local-place-${crypto.randomUUID()}`,
      icon: input.category.match(/\p{Extended_Pictographic}/u)?.[0] || '📍',
      title: input.title.trim(),
      meta: input.visitedOn ? `Visited ${new Date(`${input.visitedOn}T12:00:00`).toLocaleDateString('en-US')}` : 'Shared wishlist',
      category: input.category || '📍 Memories',
      rating: input.rating,
      note: input.note.trim() || 'No notes yet.',
      latitude: input.latitude,
      longitude: input.longitude,
      imageUrl: input.photoDataUrl,
    };
    setPlaces((current) => [entry, ...current]);
    if (syncContext) runRemote(addSharedPlace(syncContext, input));
  }, [runRemote, syncContext]);

  const removePlace = useCallback((id: string) => {
    setPlaces((current) => current.filter((place) => place.id !== id));
    if (syncContext && !id.startsWith('local-')) runRemote(removeSharedPlace(syncContext, id));
  }, [runRemote, syncContext]);

  const addTrip = useCallback((input: { title: string; startsOn: string; endsOn: string; flightCode: string; departLabel: string; arriveLabel: string }) => {
    const entry: Trip = {
      id: `local-trip-${crypto.randomUUID()}`,
      title: input.title.trim(),
      meta: [input.startsOn, input.endsOn].filter(Boolean).join(' – ') || 'Date not set',
      coverGradient: 'linear-gradient(145deg,#DDE8F4,#F0D9E4)',
      upcoming: !input.endsOn || input.endsOn >= new Date().toISOString().slice(0, 10),
      flightCode: input.flightCode.trim() || '—',
      departLabel: input.departLabel.trim() || '—',
      arriveLabel: input.arriveLabel.trim() || '—',
      itinerary: [],
    };
    setTrips((current) => [entry, ...current]);
    if (syncContext) runRemote(addSharedTrip(syncContext, input));
  }, [runRemote, syncContext]);

  const updateFoodEntry = useCallback((id: string, patch: Partial<FoodEntry>) => {
    setFoodEntries((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    if (syncContext && !id.startsWith('local-')) runRemote(updateSharedFood(syncContext, id, patch));
  }, [runRemote, syncContext]);
  const removeFoodEntry = useCallback((id: string) => {
    setFoodEntries((prev) => prev.filter((f) => f.id !== id));
    if (syncContext && !id.startsWith('local-')) runRemote(removeSharedFood(syncContext, id));
  }, [runRemote, syncContext]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    setEvents((prev) => [{ ...event, id: `local-event-${Date.now()}` }, ...prev]);
    if (syncContext) runRemote(addSharedEvent(syncContext, event));
  }, [runRemote, syncContext]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item));
    if (syncContext) runRemote(markSharedNotification(syncContext, id));
  }, [runRemote, syncContext]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
    if (syncContext) runRemote(markAllSharedNotifications(syncContext));
  }, [runRemote, syncContext]);

  const toggleOffline = useCallback(() => {
    if (offline) {
      setMessages((current) => current.map((message) => (
        message.status === 'queued' ? { ...message, status: 'sent', read: false } : message
      )));
    }
    setOffline((value) => !value);
  }, [offline]);

  const togglePrivacy = useCallback((key: keyof PrivacyToggles) => {
    const next = { ...privacy, [key]: !privacy[key] };
    setPrivacy(next);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { privacy: next }));
  }, [privacy, runRemote, syncContext]);

  const setFoodStatus = useCallback((status: FoodStatus) => {
    setFoodStatusState(status);
    if (syncContext && status) runRemote(setSharedFoodStatus(syncContext, status));
  }, [runRemote, syncContext]);

  const setMood = useCallback((nextMood: string) => {
    setMoodState(nextMood);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { mood: nextMood }));
  }, [runRemote, syncContext]);

  const setLocation = useCallback((enabled: boolean) => {
    setLocationOn(enabled);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { locationOn: enabled }));
  }, [runRemote, syncContext]);

  const setAnimationLevel = useCallback((level: AnimLevel) => {
    setAnimLevelState(level);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { preferences: { animation: level } }));
  }, [runRemote, syncContext]);

  const setQuietHours = useCallback((hours: { from: string; to: string }) => {
    setQuietHoursState(hours);
    if (syncContext) runRemote(updateSharedProfile(syncContext, { preferences: { quietHours: hours } }));
  }, [runRemote, syncContext]);

  const resetSharedData = useCallback(async () => {
    if (!syncContext) throw new Error('The Supabase space is not active.');
    setSyncStatus('loading');
    await resetSharedSpace(syncContext);
    await refreshSharedData();
  }, [refreshSharedData, syncContext]);

  const viewport = vpForce || viewportFromWidth(width);
  const cssVars = useMemo(() => tokensToCssVars(buildTokens(theme, dark)), [theme, dark]);
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  const value: AppStateApi = {
    dark, theme, vpForce, width, reduced, offline,
    sheet, viewerIndex, toastMsg,
    foodStatus, partnerFoodStatus, mood, activity, partnerMood, partnerActivity,
    papStep, papCaption, papPercent,
    photos, albums, favorites, messages, memories, storyChapters, countdowns, loveNotes, places, trips, draft, typing, foodEntries,
    events, notifications, unreadCount,
    galleryFilter, galleryView, foodCategory, agendaView, placeCategory,
    locationOn, privacy, animLevel, quietHours, syncStatus, syncError,
    viewport, cssVars,
    toggleDark, setTheme, setVpForce,
    toast,
    openSheet: (s) => setSheet(s),
    closeSheet: () => setSheet(''),
    openViewer: (i) => setViewerIndex(i),
    closeViewer: () => setViewerIndex(-1),
    setFoodStatus,
    setMood,
    startPap,
    resetPap,
    papCaptionStep,
    setPapCaption,
    sendMessage,
    retryMessage,
    markMessagesRead,
    setDraft,
    addPhotoMessage,
    addGalleryPhoto,
    updatePhoto,
    removePhoto,
    addAlbum,
    updateAlbum,
    removeAlbum,
    addFavorite,
    addMemory,
    addStoryChapter,
    addCountdown,
    addLoveNote,
    markLoveNoteOpened,
    addPlace,
    removePlace,
    addTrip,
    addFoodEntry,
    updateFoodEntry,
    removeFoodEntry,
    addEvent,
    markNotificationRead,
    markAllNotificationsRead,
    setGalleryFilter,
    setGalleryView,
    setFoodCategory,
    setAgendaView,
    setPlaceCategory,
    toggleLocation: () => setLocation(!locationOn),
    setLocation,
    togglePrivacy,
    setAnimLevel: setAnimationLevel,
    setQuietHours,
    toggleOffline,
    refreshSharedData,
    resetSharedData,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components -- provider and its hook intentionally share one context module.
export function useAppState(): AppStateApi {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
