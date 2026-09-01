import type {
  Album, CalendarEvent, Countdown, FileFolder, FileItem, FoodEntry, LocationHistoryEntry,
  LoveNote, Memory, Message, NotificationItem, Photo, Place, Relationship, StoryChapter,
  Trip, UserProfile,
} from '../types';
import * as mock from '../data/mockData';

/**
 * DataService is the single seam between UI and data source.
 *
 * PHASE 1 (current): `mockDataService` below serves in-memory dummy data.
 * PHASE 2+: a `supabaseDataService` implementing this same interface will
 * read from Postgres via the Supabase client (see supabase/schema.sql and
 * README.md "Supabase migration plan"). Because every screen consumes data
 * through this interface — never by importing mock arrays directly — no
 * component needs to change when the swap happens; only src/services/index.ts
 * needs to point at the new implementation.
 */
export interface DataService {
  getProfiles(): Promise<{ me: UserProfile; partner: UserProfile }>;
  getRelationship(): Promise<Relationship>;
  getPhotos(): Promise<Photo[]>;
  getAlbums(): Promise<Album[]>;
  getMessages(): Promise<Message[]>;
  sendMessage(text: string): Promise<Message>;
  getFoodEntries(): Promise<FoodEntry[]>;
  addFoodEntry(entry: Omit<FoodEntry, 'id'>): Promise<FoodEntry>;
  getEvents(): Promise<CalendarEvent[]>;
  addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  getMemories(): Promise<Memory[]>;
  addMemory(memory: Omit<Memory, 'id'>): Promise<Memory>;
  getStory(): Promise<StoryChapter[]>;
  getCountdowns(): Promise<Countdown[]>;
  getLoveNotes(): Promise<LoveNote[]>;
  getPlaces(): Promise<Place[]>;
  addPlace(place: Omit<Place, 'id'>): Promise<Place>;
  getTrips(): Promise<Trip[]>;
  getFileFolders(): Promise<FileFolder[]>;
  getFiles(): Promise<FileItem[]>;
  getNotifications(): Promise<NotificationItem[]>;
  getLocationHistory(): Promise<LocationHistoryEntry[]>;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let messages = [...mock.INITIAL_MESSAGES];
let foodEntries = [...mock.FOOD_ENTRIES];
let events = [...mock.EVENTS];
let memories = [...mock.MEMORIES];
let places = [...mock.PLACES];
let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

export const mockDataService: DataService = {
  getProfiles: () => delay({ me: mock.ME, partner: mock.PARTNER }),
  getRelationship: () => delay(mock.RELATIONSHIP),
  getPhotos: () => delay(mock.PHOTOS),
  getAlbums: () => delay(mock.ALBUMS),
  getMessages: () => delay(messages),
  sendMessage: (text: string) => {
    const msg: Message = { id: nextId('m'), from: 'me', text, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
    messages = [...messages, msg];
    return delay(msg, 60);
  },
  getFoodEntries: () => delay(foodEntries),
  addFoodEntry: (entry) => {
    const created: FoodEntry = { ...entry, id: nextId('f') };
    foodEntries = [created, ...foodEntries];
    return delay(created, 60);
  },
  getEvents: () => delay(events),
  addEvent: (event) => {
    const created: CalendarEvent = { ...event, id: nextId('e') };
    events = [created, ...events];
    return delay(created, 60);
  },
  getMemories: () => delay(memories),
  addMemory: (memory) => {
    const created: Memory = { ...memory, id: nextId('mem') };
    memories = [created, ...memories];
    return delay(created, 60);
  },
  getStory: () => delay(mock.STORY),
  getCountdowns: () => delay(mock.COUNTDOWNS),
  getLoveNotes: () => delay(mock.LOVE_NOTES),
  getPlaces: () => delay(places),
  addPlace: (place) => {
    const created: Place = { ...place, id: nextId('pl') };
    places = [created, ...places];
    return delay(created, 60);
  },
  getTrips: () => delay(mock.TRIPS),
  getFileFolders: () => delay(mock.FILE_FOLDERS),
  getFiles: () => delay(mock.FILES),
  getNotifications: () => delay(mock.NOTIFICATIONS),
  getLocationHistory: () => delay(mock.LOCATION_HISTORY),
};

/**
 * Active implementation. Swap to a Supabase-backed service here once
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are configured — see
 * README.md → "Supabase migration plan".
 */
export const dataService: DataService = mockDataService;
