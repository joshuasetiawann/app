import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ThemeKey, Viewport } from '../lib/theme';
import { buildTokens, tokensToCssVars, viewportFromWidth } from '../lib/theme';
import type { FoodEntry, Message, Photo } from '../types';
import { FOOD_ENTRIES, INITIAL_MESSAGES } from '../data/mockData';

export type SheetKind = '' | 'more' | 'pap' | 'mood' | 'event' | 'delete' | 'capsule' | 'food';
export type GalleryView = 'grid' | 'polaroid' | 'timeline';
export type FoodStatus = '' | 'ate' | 'now' | 'not';
export type AnimLevel = 'full' | 'calm' | 'off';

interface PrivacyToggles {
  onlineOn: boolean;
  lastSeenOn: boolean;
  actOn: boolean;
  galOn: boolean;
  meTime: boolean;
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
  mood: string;
  activity: string;
  // pap flow
  papStep: 0 | 1 | 2 | 3;
  papCaption: string;
  papPercent: number;
  // chat
  messages: Message[];
  draft: string;
  typing: boolean;
  // food journal
  foodEntries: FoodEntry[];
  // filters
  galleryFilter: string;
  galleryView: GalleryView;
  foodCategory: string;
  agendaView: 'Hari' | 'Minggu' | 'Bulan' | 'Agenda';
  placeCategory: string;
  // privacy / location
  locationOn: boolean;
  privacy: PrivacyToggles;
  animLevel: AnimLevel;
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
  setDraft: (d: string) => void;
  addPhotoMessage: (photo: Pick<Photo, 'slotLabel' | 'caption'>) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id'>) => void;
  updateFoodEntry: (id: string, patch: Partial<FoodEntry>) => void;
  removeFoodEntry: (id: string) => void;
  setGalleryFilter: (f: string) => void;
  setGalleryView: (v: GalleryView) => void;
  setFoodCategory: (c: string) => void;
  setAgendaView: (v: AppStateShape['agendaView']) => void;
  setPlaceCategory: (c: string) => void;
  toggleLocation: () => void;
  setLocation: (on: boolean) => void;
  togglePrivacy: (key: keyof PrivacyToggles) => void;
  /** Mirrors the design: "Penuh"/"Kalem" both leave motion on, only "Hemat daya" flips `reduced`. */
  setAnimLevel: (l: AnimLevel) => void;
  toggleOffline: () => void;
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

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(readStoredDark);
  const [theme, setThemeState] = useState<ThemeKey>(readStoredTheme);
  const [vpForce, setVpForce] = useState<Viewport | ''>('');
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440));
  const [reduced, setReduced] = useState(readStoredReduced);
  const [offline, setOffline] = useState(false);

  const [sheet, setSheet] = useState<SheetKind>('');
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [toastMsg, setToastMsg] = useState('');

  const [foodStatus, setFoodStatusState] = useState<FoodStatus>('');
  const [mood, setMoodState] = useState('Kangen 🥺');
  const [activity] = useState('Ngoding 💻');

  const [papStep, setPapStep] = useState<0 | 1 | 2 | 3>(0);
  const [papCaption, setPapCaption] = useState('');
  const [papPercent, setPapPercent] = useState(0);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(FOOD_ENTRIES);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(true);

  const [galleryFilter, setGalleryFilter] = useState('Semua');
  const [galleryView, setGalleryView] = useState<GalleryView>('grid');
  const [foodCategory, setFoodCategory] = useState('Semua');
  const [agendaView, setAgendaView] = useState<AppStateShape['agendaView']>('Agenda');
  const [placeCategory, setPlaceCategory] = useState('Semua');

  const [locationOn, setLocationOn] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacyToggles>({ onlineOn: true, lastSeenOn: true, actOn: true, galOn: true, meTime: false });
  const [animLevel, setAnimLevel] = useState<AnimLevel>('full');

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const papTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const typingTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    typingTimer.current = setInterval(() => setTyping((t) => !t), 4200);
    return () => clearInterval(typingTimer.current);
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2400);
  }, []);

  const toggleDark = useCallback(() => {
    setDark((d) => {
      window.localStorage.setItem('kk-dark', d ? '0' : '1');
      return !d;
    });
  }, []);

  const setTheme = useCallback((t: ThemeKey) => {
    setThemeState(t);
    window.localStorage.setItem('kk-theme', t);
  }, []);

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
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, from: 'me', text: t, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
    setDraft('');
    return true;
  }, []);

  const addPhotoMessage = useCallback((photo: Pick<Photo, 'slotLabel' | 'caption'>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: 'me',
        photoId: 'local-pap',
        text: photo.caption,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const addFoodEntry = useCallback((entry: Omit<FoodEntry, 'id'>) => {
    setFoodEntries((prev) => [{ ...entry, id: `local-food-${Date.now()}` }, ...prev]);
  }, []);
  const updateFoodEntry = useCallback((id: string, patch: Partial<FoodEntry>) => {
    setFoodEntries((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);
  const removeFoodEntry = useCallback((id: string) => {
    setFoodEntries((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const togglePrivacy = useCallback((key: keyof PrivacyToggles) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const viewport = vpForce || viewportFromWidth(width);
  const cssVars = useMemo(() => tokensToCssVars(buildTokens(theme, dark)), [theme, dark]);

  const value: AppStateApi = {
    dark, theme, vpForce, width, reduced, offline,
    sheet, viewerIndex, toastMsg,
    foodStatus, mood, activity,
    papStep, papCaption, papPercent,
    messages, draft, typing, foodEntries,
    galleryFilter, galleryView, foodCategory, agendaView, placeCategory,
    locationOn, privacy, animLevel,
    viewport, cssVars,
    toggleDark, setTheme, setVpForce,
    toast,
    openSheet: (s) => setSheet(s),
    closeSheet: () => setSheet(''),
    openViewer: (i) => setViewerIndex(i),
    closeViewer: () => setViewerIndex(-1),
    setFoodStatus: (s) => setFoodStatusState(s),
    setMood: (m) => setMoodState(m),
    startPap,
    resetPap,
    papCaptionStep,
    setPapCaption,
    sendMessage,
    setDraft,
    addPhotoMessage,
    addFoodEntry,
    updateFoodEntry,
    removeFoodEntry,
    setGalleryFilter,
    setGalleryView,
    setFoodCategory,
    setAgendaView,
    setPlaceCategory,
    toggleLocation: () => setLocationOn((v) => !v),
    setLocation: (on) => setLocationOn(on),
    togglePrivacy,
    setAnimLevel: (l: AnimLevel) => {
      setAnimLevel(l);
      setReduced(l === 'off');
    },
    toggleOffline: () => setOffline((v) => !v),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateApi {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
