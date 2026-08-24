/**
 * Domain models for KisahKita.
 *
 * These mirror the future Postgres schema (see supabase/schema.sql) so the
 * UI can be pointed at Supabase later without changing component code —
 * only the DataService implementation swaps (see src/services/dataService.ts).
 */

export type ID = string;
export type ISODateTime = string;
export type ISODate = string;

export type PartnerSlot = 'me' | 'partner';

export interface UserProfile {
  id: ID;
  slot: PartnerSlot;
  name: string;
  nickname: string;
  avatarEmoji: string;
  avatarGradient: string;
  country: string;
  countryFlag: string;
  city: string;
  timezone: string;
  utcOffset: number; // hours
  birthday: string; // "14 Maret"
  favoriteFood: string;
  favoriteColor: string;
  device: string;
  mood: string;
  activity: string;
  online: boolean;
}

export interface Relationship {
  id: ID;
  spaceName: string;
  startedAt: ISODate;
  coupleCode: string;
  daysTogether: number;
}

export interface Photo {
  id: ID;
  imageUrl?: string;
  slotLabel: string; // placeholder label standing in for the real image
  caption: string;
  meta: string;
  takenAt: ISODateTime;
  location?: string;
  by: PartnerSlot;
  tags: string[];
  rotationDeg?: number;
  album?: string;
}

export interface Album {
  id: ID;
  icon: string;
  title: string;
  countLabel?: string;
  coverGradient?: string;
}

export interface Message {
  id: ID;
  from: PartnerSlot;
  text?: string;
  photoId?: ID;
  photoDataUrl?: string;
  time: string;
  read?: boolean;
  reaction?: string;
  status?: 'sent' | 'queued' | 'failed';
}

export interface Conversation {
  id: ID;
  pinnedMessage?: { text: string; by: string; date: string };
}

export type FoodStatus = 'ate' | 'now' | 'not' | '';

export interface FoodEntry {
  id: ID;
  icon: string;
  imageUrl?: string;
  mediaId?: ID;
  name: string;
  time: string;
  by: PartnerSlot;
  location: string;
  category: string;
  price: string;
  rating: number; // 1-5
  note: string;
  date: ISODate;
}

export interface CalendarEvent {
  id: ID;
  icon: string;
  title: string;
  when: string;
  startsAt?: ISODateTime;
  tzNote?: string;
  scope: 'Berdua' | 'Pribadi';
  colorTag: 'pk' | 'mint';
  dayOfMonth?: number;
}

export interface Memory {
  id: ID;
  date: string;
  title: string;
  meta: string;
  mood: string;
  story: string;
  photoIds: ID[];
}

export interface StoryChapter {
  id: ID;
  year: string;
  title: string;
  place: string;
  note: string;
  icon: string;
  photoSlot?: string;
}

export interface Countdown {
  id: ID;
  icon: string;
  title: string;
  when: string;
  targetDate: ISODateTime;
  colorTag: 'pk' | 'lav' | 'mint';
  /** Decorative progress-toward-event indicator (not a countdown number — those are computed live). */
  progressPercent: number;
}

export type LoveNoteState = 'lock' | 'open' | 'done';

export interface LoveNote {
  id: ID;
  tag: string;
  preview: string;
  meta: string;
  state: LoveNoteState;
  from: PartnerSlot;
  body: string;
  writtenAt: string;
}

export interface Place {
  id: ID;
  icon: string;
  title: string;
  meta: string;
  category: string;
  rating: number;
  note: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  coverMediaId?: ID;
}

export interface Trip {
  id: ID;
  title: string;
  meta: string;
  coverGradient: string;
  upcoming: boolean;
  flightCode?: string;
  departLabel?: string;
  arriveLabel?: string;
  itinerary?: { day: string; title: string; meta: string }[];
}

export interface FileFolder {
  id: ID;
  icon: string;
  label: string;
  countLabel: string;
  color: string;
}

export interface FileItem {
  id: ID;
  ext: string;
  name: string;
  meta: string;
  color: string;
  status: 'synced' | 'uploading' | 'error';
  progress?: number;
}

export interface NotificationItem {
  id: ID;
  icon: string;
  text: string;
  time: string;
  colorTag: 'pk' | 'mint' | 'lav';
  unread: boolean;
  route: string;
}

export interface LocationHistoryEntry {
  id: ID;
  icon: string;
  title: string;
  meta: string;
  time: string;
}

export interface DailyStat {
  label: string;
  value: string;
  note: string;
  gradient: string;
}
