import type {
  Album,
  CalendarEvent,
  Countdown,
  DailyStat,
  FileFolder,
  FileItem,
  FoodEntry,
  LocationHistoryEntry,
  LoveNote,
  Memory,
  Message,
  NotificationItem,
  Photo,
  Place,
  Relationship,
  StoryChapter,
  Trip,
  UserProfile,
} from '../types';

/**
 * Mock/dummy data, ported 1:1 from the approved KisahKita design so the
 * app feels real before Supabase is connected. See src/services/dataService.ts
 * for the abstraction that will later swap this for live Supabase queries.
 */

export const ME: UserProfile = {
  id: 'user-joshua',
  slot: 'me',
  name: 'Joshua',
  nickname: '"Bebeb ngoding"',
  avatarEmoji: '🧑🏻',
  avatarGradient: 'linear-gradient(140deg,#FFD9DC,#E3D7F7)',
  country: 'Indonesia',
  countryFlag: '🇮🇩',
  city: 'Jakarta',
  timezone: 'WIB',
  utcOffset: 7,
  birthday: '14 Maret',
  favoriteFood: 'Nasi padang',
  favoriteColor: 'Biru navy',
  device: 'HP 14s · Android',
  mood: 'Kangen 🥺',
  activity: 'Ngoding 💻',
  online: true,
};

export const PARTNER: UserProfile = {
  id: 'user-partner',
  slot: 'partner',
  name: 'Partner',
  nickname: '"Ayang boba"',
  avatarEmoji: '👩🏻',
  avatarGradient: 'linear-gradient(140deg,#D9E9FF,#FFD3EA)',
  country: 'Taiwan',
  countryFlag: '🇹🇼',
  city: 'Taipei',
  timezone: 'CST',
  utcOffset: 8,
  birthday: '28 Mei',
  favoriteFood: 'Beef noodle',
  favoriteColor: 'Peach',
  device: 'iOS · Web',
  mood: 'Seneng 🥰',
  activity: 'Di kelas 📚',
  online: true,
};

export const RELATIONSHIP: Relationship = {
  id: 'rel-1',
  spaceName: 'Our Space',
  startedAt: '2026-01-14T00:00:00+07:00',
  coupleCode: 'LDR-JOSH-TW-99',
  daysTogether: 127,
};

export const PHOTOS: Photo[] = [
  { id: 'p1', slotLabel: 'PHOTO · LATE-NIGHT STUDY', caption: 'studying until late 🥲', meta: 'PARTNER · 16:38 · TAIPEI', takenAt: '2026-05-19T16:38:00', by: 'partner', tags: ['Daily Life'], album: 'Daily Life', rotationDeg: -2.2 },
  { id: 'p2', slotLabel: 'PHOTO · BEEF NOODLE', caption: 'so good I am dizzy', meta: 'PARTNER · 12:32 · TAIPEI', takenAt: '2026-05-19T12:32:00', by: 'partner', tags: ['Food'], rotationDeg: 1.8 },
  { id: 'p3', slotLabel: 'PHOTO · NASI PADANG', caption: 'having lunch on my own', meta: 'JOSHUA · 12:10 · JAKARTA', takenAt: '2026-05-19T12:10:00', by: 'me', tags: ['Food'], rotationDeg: -1.4 },
  { id: 'p4', slotLabel: 'PHOTO · BOBA RUN', caption: 'third boba this week 🧋', meta: 'PARTNER · MON, MAY 19', takenAt: '2026-05-19T09:40:00', by: 'partner', tags: ['Food'], rotationDeg: 2.4 },
  { id: 'p5', slotLabel: 'PHOTO · CODING SETUP', caption: 'coding and missing you', meta: 'JOSHUA · MON, MAY 19', takenAt: '2026-05-19T08:00:00', by: 'me', tags: ['Daily Life'], rotationDeg: -2 },
  { id: 'p6', slotLabel: 'PHOTO · SUNSET AT HOME', caption: 'Jakarta sky this afternoon', meta: 'Mon May 19 · 17:40 Jakarta', takenAt: '2026-05-19T17:40:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p7', slotLabel: 'PHOTO · NCCU CAMPUS', caption: 'last class today', meta: 'Mon May 19 · 14:20 Taipei', takenAt: '2026-05-19T14:20:00', by: 'partner', tags: ['Daily Life'] },
  { id: 'p8', slotLabel: 'PHOTO · NIGHT MARKET', caption: 'Shilin night market', meta: 'Sat May 17 · 19:10 Taipei', takenAt: '2026-05-17T19:10:00', by: 'partner', tags: ['Travel'] },
  { id: 'p9', slotLabel: 'PHOTO · TAIPEI 101', caption: 'finally made it to the top', meta: 'Sat May 17 · 15:00 Taipei', takenAt: '2026-05-17T15:00:00', by: 'partner', tags: ['Travel'] },
  { id: 'p10', slotLabel: 'VIDEO · GAMING NIGHT', caption: 'playing Nana together 🎮', meta: 'Fri May 16 · 22:40', takenAt: '2026-05-16T22:40:00', by: 'me', tags: ['Video', 'Dates'] },
  { id: 'p11', slotLabel: 'PHOTO · MORNING COFFEE', caption: 'missing you this morning', meta: 'Fri May 16 · 07:15 Jakarta', takenAt: '2026-05-16T07:15:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p12', slotLabel: 'PHOTO · FLIGHT TICKET', caption: 'the ticket is booked!', meta: 'Thu May 15 · 20:05', takenAt: '2026-05-15T20:05:00', by: 'partner', tags: ['Travel', 'Memories'] },
  { id: 'p13', slotLabel: 'PHOTO · HANDWRITTEN NOTE', caption: 'a note from my favorite person 💌', meta: 'Thu May 15 · 09:30', takenAt: '2026-05-15T09:30:00', by: 'partner', tags: ['Memories'] },
  { id: 'p14', slotLabel: 'PHOTO · JAKARTA RAIN', caption: 'it keeps raining here', meta: 'Wed May 14 · 16:00 Jakarta', takenAt: '2026-05-14T16:00:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p15', slotLabel: 'PHOTO · BUBBLE TEA', caption: 'this one needs more sugar', meta: 'Wed May 14 · 11:20 Taipei', takenAt: '2026-05-14T11:20:00', by: 'partner', tags: ['Food'] },
];

export const ALBUMS: Album[] = [
  { id: 'al1', icon: '🥺', title: 'Daily Life', coverGradient: 'linear-gradient(150deg,#FFD9DC,#FFE9F3)' },
  { id: 'al2', icon: '🍜', title: 'Food', coverGradient: 'linear-gradient(150deg,#FFE0DC,#FFD3B6)' },
  { id: 'al3', icon: '✈️', title: 'Travel', coverGradient: 'linear-gradient(150deg,#D9E9FF,#E3D7F7)' },
  { id: 'al4', icon: '❤️', title: 'Dates', coverGradient: 'linear-gradient(150deg,#FFDCE5,#F3E1FF)' },
  { id: 'al5', icon: '🎁', title: 'Memories', coverGradient: 'linear-gradient(150deg,#FFF0D9,#FFE3C9)' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', from: 'partner', text: 'Have you eaten yet? 🍜', time: '16:20' },
  { id: 'm2', from: 'me', text: 'Yep, nasi padang again 😌', time: '16:22' },
  { id: 'm3', from: 'partner', text: 'No fair! I am still in class 🥺', time: '16:24', reaction: '😂' },
  { id: 'm4', from: 'partner', text: 'a little update 📷', photoId: 'p1', time: '16:38' },
  { id: 'm5', from: 'me', text: 'You got this, love. Call you later ❤️', time: '16:41', read: true },
];

export const FOOD_ENTRIES: FoodEntry[] = [
  { id: 'f1', icon: '🍜', name: 'Taiwan Beef Noodle', time: '12:32', by: 'partner', location: 'Taipei', category: 'Lunch', price: 'NT$180', rating: 4, note: 'so good I am dizzy', date: '2026-05-20' },
  { id: 'f2', icon: '🍛', name: 'Nasi Padang Sederhana', time: '12:10', by: 'me', location: 'Jakarta', category: 'Lunch', price: 'Rp 28.000', rating: 5, note: 'the rendang is amazing', date: '2026-05-20' },
  { id: 'f3', icon: '🧋', name: 'Brown Sugar Boba', time: '09:40', by: 'partner', location: 'Taipei', category: 'Drinks', price: 'NT$65', rating: 4, note: '30% less sugar', date: '2026-05-20' },
  { id: 'f4', icon: '🍰', name: 'Basque Cheesecake', time: '20:15', by: 'me', location: 'Jakarta', category: 'Dessert', price: 'Rp 45.000', rating: 3, note: 'tried it yesterday', date: '2026-05-19' },
];

export const FOOD_ALBUMS = [
  { id: 'fa1', icon: '🇹🇼', label: 'Taiwan Food', count: 96, bg: 'linear-gradient(150deg,#FFE0DC,#FFD3B6)' },
  { id: 'fa2', icon: '🇮🇩', label: 'Indonesia Food', count: 132, bg: 'linear-gradient(150deg,#E2F0CB,#D7EFE2)' },
  { id: 'fa3', icon: '🧋', label: 'Drinks', count: 58, bg: 'linear-gradient(150deg,#D9E9FF,#E3D7F7)' },
  { id: 'fa4', icon: '🍰', label: 'Dessert', count: 41, bg: 'linear-gradient(150deg,#FFDCE5,#F3E1FF)' },
  { id: 'fa5', icon: '🏮', label: 'Restaurants', count: 27, bg: 'linear-gradient(150deg,#FFF0D9,#FFE3C9)' },
  { id: 'fa6', icon: '📝', label: 'Want to Try', count: 19, bg: 'linear-gradient(150deg,#E7E7F7,#F7E7F0)' },
];

export const FOOD_BARS = [
  { icon: '🧋', label: '40%', heightPx: 86 },
  { icon: '🍜', label: '24%', heightPx: 56 },
  { icon: '🍛', label: '18%', heightPx: 42 },
  { icon: '🍰', label: '12%', heightPx: 30 },
  { icon: '🥗', label: '6%', heightPx: 18 },
];

function demoEventDate(daysAhead: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function demoEventWhen(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

const DEMO_EVENT_DATES = [
  demoEventDate(0, 21),
  demoEventDate(0, 9),
  demoEventDate(2, 19, 30),
  demoEventDate(7, 9),
  demoEventDate(12, 6, 20),
];

export const EVENTS: CalendarEvent[] = [
  { id: 'e1', icon: '📞', title: 'Evening video call', when: demoEventWhen(DEMO_EVENT_DATES[0]), startsAt: DEMO_EVENT_DATES[0].toISOString(), tzNote: 'Together · time zones update automatically', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[0].getDate() },
  { id: 'e2', icon: '📚', title: 'Database class', when: demoEventWhen(DEMO_EVENT_DATES[1]), startsAt: DEMO_EVENT_DATES[1].toISOString(), tzNote: 'Campus · private', scope: 'Pribadi', colorTag: 'mint', dayOfMonth: DEMO_EVENT_DATES[1].getDate() },
  { id: 'e3', icon: '🏀', title: 'Basketball with friends', when: demoEventWhen(DEMO_EVENT_DATES[2]), startsAt: DEMO_EVENT_DATES[2].toISOString(), tzNote: 'Private', scope: 'Pribadi', colorTag: 'mint', dayOfMonth: DEMO_EVENT_DATES[2].getDate() },
  { id: 'e4', icon: '🎉', title: 'Weekly date night', when: demoEventWhen(DEMO_EVENT_DATES[3]), startsAt: DEMO_EVENT_DATES[3].toISOString(), tzNote: 'Reminder is not enabled yet', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[3].getDate() },
  { id: 'e5', icon: '✈️', title: 'Our next trip', when: demoEventWhen(DEMO_EVENT_DATES[4]), startsAt: DEMO_EVENT_DATES[4].toISOString(), tzNote: 'Flight details have not been added', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[4].getDate() },
];

export const MEMORIES: Memory[] = [
  { id: 'mem1', date: 'MAY 20, 2026', title: 'Mobile Legends night with Nana 🎮', meta: 'Online · together · 8 pictures', mood: '🥰', story: 'We played while on a video call. We lost, but could not stop laughing.', photoIds: ['p10'] },
  { id: 'mem2', date: 'MAY 17, 2026', title: 'Exploring Shilin Night Market 🏮', meta: 'Taipei, Taiwan · 14 pictures', mood: '😋', story: 'We video-called through the market and picked food together from two cities.', photoIds: ['p8', 'p9'] },
  { id: 'mem3', date: 'MAY 3, 2026', title: 'Our first handwritten note 💌', meta: 'Jakarta → Taipei · 5 pictures', mood: '🥹', story: 'It took nine days to arrive and was opened on the train.', photoIds: ['p13'] },
  { id: 'mem4', date: 'JAN 14, 2026', title: 'Our first LDR day ✈️', meta: 'Soekarno-Hatta Airport · 11 pictures', mood: '😢', story: 'I walked you to the gate. From here, we count every day until we meet again.', photoIds: [] },
];

export const STORY: StoryChapter[] = [
  { id: 'st1', year: '2024', title: 'The first time we met 👀', place: 'University · Jakarta', note: 'We were assigned to the same group and started talking.', icon: '👀', photoSlot: 'PHOTO · CLASS OF 2024' },
  { id: 'st2', year: '2024', title: 'Talking every night until morning 💬', place: 'WhatsApp', note: 'We pretended it was about homework, but really just wanted to talk.', icon: '💬' },
  { id: 'st3', year: '2025', title: 'We made it official! ❤️', place: 'Campus garden · Sep 14', note: 'The sweetest, most nervous confession by the library.', icon: '❤️', photoSlot: 'PHOTO · OUR DAY' },
  { id: 'st4', year: '2025', title: 'Our first trip together ✈️', place: 'Bandung', note: 'It rained all day and was still the best trip.', icon: '✈️', photoSlot: 'PHOTO · BANDUNG' },
  { id: 'st5', year: '2026', title: 'Our LDR began 🇮🇩🇹🇼', place: 'Jakarta – Taipei · Jan 14', note: 'A scholarship brought us to two cities. Bittersweet, but so proud.', icon: '🛫', photoSlot: 'PHOTO · AIRPORT' },
  { id: 'st6', year: '2026', title: '127 days and still strong 💪', place: 'Today', note: 'Daily meals, moods, and little updates keep us close.', icon: '🌸' },
];

export const COUNTDOWNS: Countdown[] = [
  { id: 'cd1', icon: '❤️', title: 'Meet in Jakarta', when: 'Jun 1, 2026 · CI 761', targetDate: '2026-06-01T10:05:00+07:00', colorTag: 'pk', progressPercent: 64 },
  { id: 'cd2', icon: '🎉', title: 'Five-month anniversary', when: 'May 27, 2026', targetDate: '2026-05-27T00:00:00+07:00', colorTag: 'pk', progressPercent: 78 },
  { id: 'cd3', icon: '🎂', title: "Partner's birthday", when: 'May 28, 2026', targetDate: '2026-05-28T00:00:00+07:00', colorTag: 'lav', progressPercent: 74 },
  { id: 'cd4', icon: '📞', title: "Tonight's video call", when: '21:00 WIB', targetDate: '2026-05-20T21:00:00+07:00', colorTag: 'mint', progressPercent: 96 },
  { id: 'cd5', icon: '🎓', title: "Partner's graduation", when: 'Jun 12, 2027', targetDate: '2027-06-12T00:00:00+07:00', colorTag: 'lav', progressPercent: 12 },
];

export const LOVE_NOTES: LoveNote[] = [
  { id: 'ln1', tag: 'READY TO OPEN', preview: '"Open when you really miss me 🥺"', meta: 'from Partner · sealed May 3 · condition met', state: 'open', from: 'partner', writtenAt: 'May 3, 2026', body: 'If you are reading this, you must miss me. I miss you too. Every day makes the distance a little shorter. Just a little longer, love 🥺❤️' },
  { id: 'ln2', tag: 'SEALED', preview: '"Open on your birthday 🎂"', meta: 'from Partner · opens May 28, 2026', state: 'lock', from: 'partner', writtenAt: '', body: '' },
  { id: 'ln3', tag: 'SEALED', preview: '"Open when you are feeling down 😢"', meta: 'from Joshua · opens when your mood is sad', state: 'lock', from: 'me', writtenAt: '', body: '' },
  { id: 'ln4', tag: 'OPENED', preview: '"Open on your first day in Taipei 🇹🇼"', meta: 'opened Jan 15, 2026 · 1 picture + voice note', state: 'done', from: 'partner', writtenAt: 'Jan 15, 2026', body: 'Happy first day in Taipei! I am so proud of you. Have a great day at university, and remember to eat 🥺' },
];

export const LOCATION_HISTORY: LocationHistoryEntry[] = [
  { id: 'lh1', icon: '🏫', title: 'NCCU · Database class', meta: 'Taipei · 2.4 km from home', time: '16:10' },
  { id: 'lh2', icon: '🧋', title: 'Boba stand near campus', meta: 'Taipei', time: '09:40' },
  { id: 'lh3', icon: '🏠', title: 'Wenshan home', meta: 'Taipei', time: '07:20' },
  { id: 'lh4', icon: '🚇', title: 'MRT Taipei Zoo', meta: 'Taipei', time: '07:05' },
];

export const TZ_HOURS: { label: string; both: boolean }[] = [
  { label: '00', both: false }, { label: '02', both: false }, { label: '04', both: false },
  { label: '06', both: true }, { label: '08', both: true }, { label: '10', both: true },
  { label: '12', both: true }, { label: '14', both: true }, { label: '16', both: true },
  { label: '18', both: true }, { label: '20', both: true }, { label: '22', both: false },
];

export const PLACES: Place[] = [
  { id: 'pl1', icon: '🍜', title: 'Lin Dong Fang Beef Noodle', meta: 'Taipei · Restaurant · visited May 12', category: '🍜 Restaurants', rating: 5, note: 'we have to try this together again' },
  { id: 'pl2', icon: '🏫', title: 'NCCU Wenshan', meta: 'Taipei · Campus · every day', category: '🏫 Campus', rating: 4, note: 'where my partner studies every morning' },
  { id: 'pl3', icon: '❤️', title: 'Kafe first date', meta: 'Jakarta · Dates · 14 Sep 2025', category: '❤️ Dates', rating: 5, note: 'bangku pojok, masih ada' },
  { id: 'pl4', icon: '🏮', title: 'Shilin Night Market', meta: 'Taipei · Travel · 17 Mei', category: '✈️ Travel', rating: 4, note: 'VC sambil keliling, seru' },
  { id: 'pl5', icon: '🏠', title: 'Wenshan home', meta: 'Taipei · Home', category: '🏠 Home', rating: 3, note: 'small but cozy' },
];

export const TRIPS: Trip[] = [
  {
    id: 'tr1', title: 'Partner visits Jakarta 🇮🇩', meta: 'Jun 1–14, 2026 · 14 days · Jakarta & Bandung',
    coverGradient: 'repeating-linear-gradient(135deg,#E4EAF5 0 10px,#EFF3F9 10px 20px)', upcoming: true,
    flightCode: 'CI 761', departLabel: '06:20 TPE', arriveLabel: '10:05 CGK',
    itinerary: [
      { day: '01', title: 'Land at CGK at 10:05', meta: 'Joshua picks up · nasi padang for lunch' },
      { day: '02', title: 'Old Town & Museum', meta: 'Rent bikes · take lots of pictures' },
      { day: '05', title: 'Leave for Bandung', meta: 'Depart at 06:00 · stay for 3 days' },
      { day: '12', title: 'Balik ke Jakarta', meta: 'Beli oleh-oleh buat keluarga' },
    ],
  },
  { id: 'tr2', title: 'Taiwan trip 🇹🇼', meta: 'Jan 2026 · 9 days · 186 pictures', coverGradient: 'repeating-linear-gradient(135deg,#E4EAF5 0 10px,#EFF3F9 10px 20px)', upcoming: false },
  { id: 'tr3', title: 'Bandung 2025 🏔️', meta: 'Dec 2025 · 3 days · 74 pictures', coverGradient: 'repeating-linear-gradient(135deg,#E6F0E2 0 10px,#F2F7EF 10px 20px)', upcoming: false },
];

export const FILE_FOLDERS: FileFolder[] = [
  { id: 'fo1', icon: '📄', label: 'Personal Documents', countLabel: '12 files', color: '#FFF0D9' },
  { id: 'fo2', icon: '✈️', label: 'Tiket & Itinerary', countLabel: '8 file', color: '#D9E9FF' },
  { id: 'fo3', icon: '🎁', label: 'Ide Kado & Wishlist', countLabel: '5 file', color: '#FFE0EC' },
  { id: 'fo4', icon: '💌', label: 'Love Notes', countLabel: '21 files', color: '#FFE1E6' },
  { id: 'fo5', icon: '🖼️', label: 'Pictures', countLabel: '1,245 files', color: '#F0E4FA' },
  { id: 'fo6', icon: '🎥', label: 'Video', countLabel: '38 file', color: '#E2F0CB' },
  { id: 'fo7', icon: '🗜️', label: 'Arsip ZIP', countLabel: '3 file', color: '#EDEDF5' },
];

export const FILES: FileItem[] = [
  { id: 'fi1', ext: 'PDF', name: 'Visa_Student_Taiwan.pdf', meta: '2,4 MB · 12 Mei · tersinkron', color: '#FFE1E6', status: 'synced' },
  { id: 'fi2', ext: 'JPG', name: 'Tiket_CI761_Partner.jpg', meta: '1,1 MB · 10 Mei · tersinkron', color: '#D9E9FF', status: 'synced' },
  { id: 'fi3', ext: 'PDF', name: 'NCCU_Scholarship_Letter.pdf', meta: '860 KB · May 2 · synced', color: '#FFF0D9', status: 'synced' },
  { id: 'fi4', ext: 'DOC', name: 'Wishlist_Kado_Ultah.docx', meta: '48 KB · 28 Apr · tersinkron', color: '#E2F0CB', status: 'synced' },
  { id: 'fi5', ext: 'ZIP', name: 'Taiwan_Trip_Pictures.zip', meta: '1.8 GB · Jan 20 · in the cloud', color: '#EDEDF5', status: 'synced' },
];

export const MOOD_BARS: { me: number; her: number }[] = [
  { me: 4, her: 5 }, { me: 5, her: 4 }, { me: 3, her: 4 }, { me: 5, her: 3 }, { me: 2, her: 3 },
  { me: 4, her: 5 }, { me: 5, her: 4 }, { me: 5, her: 5 }, { me: 3, her: 4 }, { me: 4, her: 2 },
  { me: 5, her: 5 }, { me: 2, her: 3 }, { me: 4, her: 5 }, { me: 5, her: 4 },
];

export const PIE_LEGEND = [
  { label: '🧋 Boba', value: '40%', color: '#FFB7B2' },
  { label: '🍜 Noodles', value: '24%', color: '#B5EAD7' },
  { label: '🍛 Rice', value: '18%', color: '#E3D7F7' },
  { label: '🍰 Dessert', value: '12%', color: '#FFE0AC' },
  { label: '🥗 Healthy', value: '6%', color: '#E2F0CB' },
];

const HEAT_PATTERN = [0, 1, 2, 3, 3, 2, 1, 2, 3, 3, 1, 0, 2, 3, 3, 2];
export const HEATMAP: number[] = Array.from({ length: 72 }, (_, i) => HEAT_PATTERN[i % 16]);

export const BIG_STATS: DailyStat[] = [
  { label: 'DAYS TOGETHER', value: '127', note: 'since Jan 14, 2026', gradient: 'linear-gradient(150deg,#FFE7E4,#FFF1E9)' },
  { label: 'PICTURES SENT', value: '342', note: '2.7 per day on average', gradient: 'linear-gradient(150deg,#E8F4DA,#F6F3E4)' },
  { label: 'VIDEO CALLS', value: '96', note: '214 hours total', gradient: 'linear-gradient(150deg,#E4EAFF,#F1F0FF)' },
  { label: 'MEALS TRIED', value: '124', note: '40% boba 🧋', gradient: 'linear-gradient(150deg,#FFE0EC,#F3E1FF)' },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', icon: '❤️', text: 'Your partner sent you a picture!', time: '4 minutes ago', colorTag: 'pk', unread: true, route: '/chat' },
  { id: 'n2', icon: '🍜', text: 'Your partner just had lunch. Have you eaten?', time: '1 hour ago', colorTag: 'pk', unread: true, route: '/food' },
  { id: 'n3', icon: '🗓️', text: 'Your video call starts in 30 minutes!', time: '2 hours ago', colorTag: 'mint', unread: true, route: '/schedule' },
  { id: 'n4', icon: '💌', text: 'Psst... a new love note is ready to open!', time: '5 hours ago', colorTag: 'lav', unread: false, route: '/notes' },
  { id: 'n5', icon: '📸', text: '12 new pictures synced to Gallery', time: 'Yesterday at 21:40', colorTag: 'lav', unread: false, route: '/gallery' },
  { id: 'n6', icon: '✈️', text: "Your partner's flight is tomorrow at 06:20 — remember the alarm", time: 'Yesterday at 18:02', colorTag: 'pk', unread: false, route: '/trips' },
  { id: 'n7', icon: '🎉', text: 'Your five-month anniversary is seven days away', time: 'Yesterday at 09:00', colorTag: 'mint', unread: false, route: '/countdown' },
];

export const SETTINGS_GROUPS: { title: string; rows: { icon: string; label: string; value: string }[] }[] = [
  { title: 'ACCOUNT', rows: [
    { icon: '📧', label: 'Email', value: 'joshua@email.com' },
    { icon: '🔑', label: 'Password', value: 'Changed May 12' },
    { icon: '🛡️', label: 'Two-step verification', value: 'Active' },
    { icon: '📱', label: 'Signed-in devices', value: '2 devices' },
    { icon: '😊', label: 'Biometric login', value: 'Face ID active' },
  ]},
  { title: 'COUPLE', rows: [
    { icon: '💗', label: 'Partner', value: 'Connected' },
    { icon: '🏠', label: 'Space name', value: 'Our Space' },
    { icon: '📅', label: 'Relationship date', value: 'Jan 14, 2026' },
    { icon: '🔗', label: 'Pairing code', value: 'LDR-JOSH-TW-99' },
  ]},
  { title: 'NOTIFICATIONS', rows: [
    { icon: '💬', label: 'Messages', value: 'Sound on' },
    { icon: '📸', label: 'Pictures', value: 'Sound on' },
    { icon: '🍜', label: 'Food', value: 'Muted' },
    { icon: '🗓️', label: 'Schedule', value: 'Sound on' },
    { icon: '💌', label: 'Love Notes', value: 'Sound on' },
    { icon: '🌙', label: 'Quiet hours', value: '23:00–06:00' },
  ]},
  { title: 'APPEARANCE', rows: [
    { icon: '🌸', label: 'Theme', value: 'Sakura Bloom' },
    { icon: '🎨', label: 'Accent color', value: 'Blush pink' },
    { icon: '🌗', label: 'Dark mode', value: 'Follow system' },
    { icon: '✨', label: 'Animation level', value: 'Full' },
  ]},
  { title: 'STORAGE', rows: [
    { icon: '☁️', label: 'Storage', value: '42.3 / 100 GB' },
    { icon: '🔄', label: 'Automatic sync', value: 'Wi-Fi only' },
    { icon: '🖼️', label: 'Upload quality', value: 'Original' },
    { icon: '⬇️', label: 'Downloads', value: 'Save to device gallery' },
  ]},
];

export const PRIVACY_ROWS: { label: string; sub: string; key: 'locOn' | 'ghostMode' | 'onlineOn' | 'lastSeenOn' | 'actOn' | 'galOn' | 'meTime' }[] = [
  { label: 'Share location', sub: 'Your partner can see your live location', key: 'locOn' },
  { label: 'Ghost mode', sub: 'Hide your location when planning a surprise 🎁', key: 'ghostMode' },
  { label: 'Online status', sub: 'Show a green dot while you are active', key: 'onlineOn' },
  { label: 'Last seen', sub: 'Show when you were last active', key: 'lastSeenOn' },
  { label: 'Activity & mood', sub: 'Your partner can see your activity updates', key: 'actOn' },
  { label: 'Gallery permission', sub: 'Allow your partner to add pictures to shared albums', key: 'galOn' },
  { label: 'Me-time mode', sub: 'Temporarily mute notifications and status updates', key: 'meTime' },
];

export const ACCENT_SWATCHES = ['#FFB7B2', '#84A9FF', '#C7E5AE', '#D9B8FF', '#FFD3B6', '#B5EAD7'];

export const MOOD_OPTIONS = ['🥰 Loved', '😊 Happy', '😌 Calm', '😴 Sleepy', '🥺 Missing you', '😢 Sad', '😡 Upset', '🤒 Sick', '📚 Busy'];

export const FAVORITE_THINGS = [
  'They always remember to ask whether I have eaten.',
  'Their laugh makes any distance feel smaller.',
  'They patiently wait for me to finish coding.',
];

export const GALLERY_CHIPS = ['All', 'Photos', 'Video', 'Food', 'Memories', 'Travel', 'Dates', 'Daily Life'];
export const FOOD_CATS = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert', 'Drinks'];
export const PLACE_CATS = ['All', '❤️ Dates', '🍜 Restaurants', '🏫 Campus', '🏠 Home', '✈️ Travel', '📸 Memories'];
export const ATTACH_MENU: { label: string; route?: string; sheet?: string; disabled?: boolean }[] = [
  { label: '📷 Send a picture', sheet: 'pap' },
  { label: '🖼️ Gallery', route: '/gallery' },
  { label: '📍 Location', route: '/location' },
  { label: '🗂️ Files', route: '/files' },
  { label: '💌 Love note', route: '/notes' },
];
