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
  { id: 'p1', slotLabel: 'FOTO · PAP MALEM', caption: 'library sampe malem 🥲', meta: 'PARTNER · 16:38 · TAIPEI', takenAt: '2026-05-19T16:38:00', by: 'partner', tags: ['Daily Life'], album: 'Daily Life', rotationDeg: -2.2 },
  { id: 'p2', slotLabel: 'FOTO · BEEF NOODLE', caption: 'enak banget pusing', meta: 'PARTNER · 12:32 · TAIPEI', takenAt: '2026-05-19T12:32:00', by: 'partner', tags: ['Makanan'], rotationDeg: 1.8 },
  { id: 'p3', slotLabel: 'FOTO · NASI PADANG', caption: 'makan siang sendirian', meta: 'JOSHUA · 12:10 · JAKARTA', takenAt: '2026-05-19T12:10:00', by: 'me', tags: ['Makanan'], rotationDeg: -1.4 },
  { id: 'p4', slotLabel: 'FOTO · BOBA RUN', caption: 'boba ke-3 minggu ini 🧋', meta: 'PARTNER · SEN, 19 MEI', takenAt: '2026-05-19T09:40:00', by: 'partner', tags: ['Makanan'], rotationDeg: 2.4 },
  { id: 'p5', slotLabel: 'FOTO · SETUP NGODING', caption: 'lagi ngoding, kangen', meta: 'JOSHUA · SEN, 19 MEI', takenAt: '2026-05-19T08:00:00', by: 'me', tags: ['Daily Life'], rotationDeg: -2 },
  { id: 'p6', slotLabel: 'FOTO · SUNSET KOS', caption: 'langit Jakarta sore', meta: 'Sen 19 Mei · 17:40 Jakarta', takenAt: '2026-05-19T17:40:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p7', slotLabel: 'FOTO · KAMPUS NCCU', caption: 'kelas terakhir hari ini', meta: 'Sen 19 Mei · 14:20 Taipei', takenAt: '2026-05-19T14:20:00', by: 'partner', tags: ['Daily Life'] },
  { id: 'p8', slotLabel: 'FOTO · PASAR MALAM', caption: 'Shilin night market', meta: 'Sab 17 Mei · 19:10 Taipei', takenAt: '2026-05-17T19:10:00', by: 'partner', tags: ['Travel'] },
  { id: 'p9', slotLabel: 'FOTO · TAIPEI 101', caption: 'akhirnya naik juga', meta: 'Sab 17 Mei · 15:00 Taipei', takenAt: '2026-05-17T15:00:00', by: 'partner', tags: ['Travel'] },
  { id: 'p10', slotLabel: 'VIDEO · MABAR ML', caption: 'mabar pakai Nana 🎮', meta: 'Jum 16 Mei · 22:40', takenAt: '2026-05-16T22:40:00', by: 'me', tags: ['Video', 'Dates'] },
  { id: 'p11', slotLabel: 'FOTO · KOPI PAGI', caption: 'pagi-pagi kangen', meta: 'Jum 16 Mei · 07:15 Jakarta', takenAt: '2026-05-16T07:15:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p12', slotLabel: 'FOTO · TIKET PESAWAT', caption: 'tiket udah dibeli!', meta: 'Kam 15 Mei · 20:05', takenAt: '2026-05-15T20:05:00', by: 'partner', tags: ['Travel', 'Memories'] },
  { id: 'p13', slotLabel: 'FOTO · SURAT TANGAN', caption: 'surat dari dia 💌', meta: 'Kam 15 Mei · 09:30', takenAt: '2026-05-15T09:30:00', by: 'partner', tags: ['Memories'] },
  { id: 'p14', slotLabel: 'FOTO · HUJAN JAKARTA', caption: 'hujan terus di sini', meta: 'Rab 14 Mei · 16:00 Jakarta', takenAt: '2026-05-14T16:00:00', by: 'me', tags: ['Daily Life'] },
  { id: 'p15', slotLabel: 'FOTO · BUBBLE TEA', caption: 'yang ini kurang manis', meta: 'Rab 14 Mei · 11:20 Taipei', takenAt: '2026-05-14T11:20:00', by: 'partner', tags: ['Makanan'] },
];

export const ALBUMS: Album[] = [
  { id: 'al1', icon: '🥺', title: 'Daily Life', coverGradient: 'linear-gradient(150deg,#FFD9DC,#FFE9F3)' },
  { id: 'al2', icon: '🍜', title: 'Makanan', coverGradient: 'linear-gradient(150deg,#FFE0DC,#FFD3B6)' },
  { id: 'al3', icon: '✈️', title: 'Travel', coverGradient: 'linear-gradient(150deg,#D9E9FF,#E3D7F7)' },
  { id: 'al4', icon: '❤️', title: 'Dates', coverGradient: 'linear-gradient(150deg,#FFDCE5,#F3E1FF)' },
  { id: 'al5', icon: '🎁', title: 'Memories', coverGradient: 'linear-gradient(150deg,#FFF0D9,#FFE3C9)' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', from: 'partner', text: 'Udah makan belum? 🍜', time: '16:20' },
  { id: 'm2', from: 'me', text: 'Udah dong, nasi padang lagi 😌', time: '16:22' },
  { id: 'm3', from: 'partner', text: 'Curang! aku masih di kelas 🥺', time: '16:24', reaction: '😂' },
  { id: 'm4', from: 'partner', text: 'pap', photoId: 'p1', time: '16:38' },
  { id: 'm5', from: 'me', text: 'Semangat sayang, nanti VC ya ❤️', time: '16:41', read: true },
];

export const FOOD_ENTRIES: FoodEntry[] = [
  { id: 'f1', icon: '🍜', name: 'Taiwan Beef Noodle', time: '12:32', by: 'partner', location: 'Taipei', category: 'Makan Siang', price: 'NT$180', rating: 4, note: 'enak banget pusing', date: '2026-05-20' },
  { id: 'f2', icon: '🍛', name: 'Nasi Padang Sederhana', time: '12:10', by: 'me', location: 'Jakarta', category: 'Makan Siang', price: 'Rp 28.000', rating: 5, note: 'rendangnya juara', date: '2026-05-20' },
  { id: 'f3', icon: '🧋', name: 'Boba Brown Sugar', time: '09:40', by: 'partner', location: 'Taipei', category: 'Minuman', price: 'NT$65', rating: 4, note: 'gula dikurangin 30%', date: '2026-05-20' },
  { id: 'f4', icon: '🍰', name: 'Basque Cheesecake', time: '20:15', by: 'me', location: 'Jakarta', category: 'Dessert', price: 'Rp 45.000', rating: 3, note: 'kemarin, nyobain sendiri', date: '2026-05-19' },
];

export const FOOD_ALBUMS = [
  { id: 'fa1', icon: '🇹🇼', label: 'Taiwan Food', count: 96, bg: 'linear-gradient(150deg,#FFE0DC,#FFD3B6)' },
  { id: 'fa2', icon: '🇮🇩', label: 'Indonesia Food', count: 132, bg: 'linear-gradient(150deg,#E2F0CB,#D7EFE2)' },
  { id: 'fa3', icon: '🧋', label: 'Minuman', count: 58, bg: 'linear-gradient(150deg,#D9E9FF,#E3D7F7)' },
  { id: 'fa4', icon: '🍰', label: 'Dessert', count: 41, bg: 'linear-gradient(150deg,#FFDCE5,#F3E1FF)' },
  { id: 'fa5', icon: '🏮', label: 'Restoran', count: 27, bg: 'linear-gradient(150deg,#FFF0D9,#FFE3C9)' },
  { id: 'fa6', icon: '📝', label: 'Mau Dicoba', count: 19, bg: 'linear-gradient(150deg,#E7E7F7,#F7E7F0)' },
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
  return new Intl.DateTimeFormat('id-ID', {
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
  { id: 'e1', icon: '📞', title: 'Video call malam', when: demoEventWhen(DEMO_EVENT_DATES[0]), startsAt: DEMO_EVENT_DATES[0].toISOString(), tzNote: 'Berdua · zona waktu tampil otomatis', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[0].getDate() },
  { id: 'e2', icon: '📚', title: 'Kelas Basis Data', when: demoEventWhen(DEMO_EVENT_DATES[1]), startsAt: DEMO_EVENT_DATES[1].toISOString(), tzNote: 'Kampus · pribadi', scope: 'Pribadi', colorTag: 'mint', dayOfMonth: DEMO_EVENT_DATES[1].getDate() },
  { id: 'e3', icon: '🏀', title: 'Basket bareng anak kos', when: demoEventWhen(DEMO_EVENT_DATES[2]), startsAt: DEMO_EVENT_DATES[2].toISOString(), tzNote: 'Pribadi', scope: 'Pribadi', colorTag: 'mint', dayOfMonth: DEMO_EVENT_DATES[2].getDate() },
  { id: 'e4', icon: '🎉', title: 'Date night mingguan', when: demoEventWhen(DEMO_EVENT_DATES[3]), startsAt: DEMO_EVENT_DATES[3].toISOString(), tzNote: 'Pengingat belum diaktifkan', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[3].getDate() },
  { id: 'e5', icon: '✈️', title: 'Rencana perjalanan berikutnya', when: demoEventWhen(DEMO_EVENT_DATES[4]), startsAt: DEMO_EVENT_DATES[4].toISOString(), tzNote: 'Detail penerbangan belum ditambahkan', scope: 'Berdua', colorTag: 'pk', dayOfMonth: DEMO_EVENT_DATES[4].getDate() },
];

export const MEMORIES: Memory[] = [
  { id: 'mem1', date: '20 MEI 2026', title: 'Mabar Mobile Legends pakai Nana 🎮', meta: 'Online · berdua · 8 foto', mood: '🥰', story: 'malem-malem mabar sambil VC. dia pakai Nana terus, aku jungler. kalah tapi ketawa terus.', photoIds: ['p10'] },
  { id: 'mem2', date: '17 MEI 2026', title: 'Jalan-jalan Shilin Night Market 🏮', meta: 'Taipei, Taiwan · 14 foto', mood: '😋', story: 'dia video call sambil keliling pasar malam. aku ikut milih makanan dari Jakarta. jadi berasa ikut jalan.', photoIds: ['p8', 'p9'] },
  { id: 'mem3', date: '3 MEI 2026', title: 'Surat pertama yang dikirim pos 💌', meta: 'Jakarta → Taipei · 5 foto', mood: '🥹', story: '9 hari sampai. dibuka pas dia lagi di kereta, katanya nangis dikit di MRT.', photoIds: ['p13'] },
  { id: 'mem4', date: '14 JAN 2026', title: 'Hari pertama LDR ✈️', meta: 'Bandara Soekarno-Hatta · 11 foto', mood: '😢', story: 'nganterin dia ke gate. dari sini 127 hari kita hitung satu-satu.', photoIds: [] },
];

export const STORY: StoryChapter[] = [
  { id: 'st1', year: '2024', title: 'Pertama kali ketemu 👀', place: 'Universitas · Jakarta', note: 'satu kelompok tugas. dia diem aja, aku yang cerewet.', icon: '👀', photoSlot: 'FOTO · KELAS 2024' },
  { id: 'st2', year: '2024', title: 'Chat tiap malam sampai pagi 💬', place: 'WhatsApp', note: 'pura-pura nanya tugas padahal cuma pengen ngobrol.', icon: '💬' },
  { id: 'st3', year: '2025', title: 'Jadian! ❤️', place: 'Taman kampus · 14 Sep', note: 'nembak di bangku belakang perpus. gemeteran parah.', icon: '❤️', photoSlot: 'FOTO · JADIAN' },
  { id: 'st4', year: '2025', title: 'Trip pertama berdua ✈️', place: 'Bandung', note: 'hujan seharian, tapi paling seru.', icon: '✈️', photoSlot: 'FOTO · BANDUNG' },
  { id: 'st5', year: '2026', title: 'LDR dimulai 🇮🇩🇹🇼', place: 'Jakarta – Taipei · 14 Jan', note: 'dia dapet beasiswa NCCU. sedih tapi bangga.', icon: '🛫', photoSlot: 'FOTO · BANDARA' },
  { id: 'st6', year: '2026', title: '127 hari dan masih kuat 💪', place: 'Sekarang', note: 'tiap hari update makan, mood, dan muka kangen.', icon: '🌸' },
];

export const COUNTDOWNS: Countdown[] = [
  { id: 'cd1', icon: '❤️', title: 'Ketemu di Jakarta', when: '1 Jun 2026 · CI 761', targetDate: '2026-06-01T10:05:00+07:00', colorTag: 'pk', progressPercent: 64 },
  { id: 'cd2', icon: '🎉', title: 'Anniversary bulan ke-5', when: '27 Mei 2026', targetDate: '2026-05-27T00:00:00+07:00', colorTag: 'pk', progressPercent: 78 },
  { id: 'cd3', icon: '🎂', title: 'Ulang tahun Partner', when: '28 Mei 2026', targetDate: '2026-05-28T00:00:00+07:00', colorTag: 'lav', progressPercent: 74 },
  { id: 'cd4', icon: '📞', title: 'Video call malam ini', when: '21:00 WIB', targetDate: '2026-05-20T21:00:00+07:00', colorTag: 'mint', progressPercent: 96 },
  { id: 'cd5', icon: '🎓', title: 'Wisuda Partner', when: '12 Jun 2027', targetDate: '2027-06-12T00:00:00+07:00', colorTag: 'lav', progressPercent: 12 },
];

export const LOVE_NOTES: LoveNote[] = [
  { id: 'ln1', tag: 'SIAP DIBUKA', preview: '"Buka kalau kamu kangen banget sama aku 🥺"', meta: 'dari Partner · terkunci 3 Mei · syarat sudah terpenuhi', state: 'open', from: 'partner', writtenAt: '3 Mei 2026', body: 'Kalau kamu baca ini berarti kamu kangen. Aku juga. Inget ya, tiap hari jaraknya makin pendek. 12 hari lagi aku peluk kamu di Soekarno-Hatta. Sabar sedikit lagi ya sayang 🥺❤️' },
  { id: 'ln2', tag: 'TERKUNCI', preview: '"Buka pas ulang tahun kamu 🎂"', meta: 'dari Partner · kebuka 28 Mei 2026', state: 'lock', from: 'partner', writtenAt: '', body: '' },
  { id: 'ln3', tag: 'TERKUNCI', preview: '"Buka pas kamu lagi sedih banget 😢"', meta: 'dari Joshua · kebuka kalau mood = sedih', state: 'lock', from: 'me', writtenAt: '', body: '' },
  { id: 'ln4', tag: 'SUDAH DIBUKA', preview: '"Buka pas hari pertama di Taipei 🇹🇼"', meta: 'dibuka 15 Jan 2026 · 1 foto + voice note', state: 'done', from: 'partner', writtenAt: '15 Jan 2026', body: 'Selamat hari pertama di Taipei! Aku bangga banget sama kamu. Semangat kuliahnya, jangan lupa makan 🥺' },
];

export const LOCATION_HISTORY: LocationHistoryEntry[] = [
  { id: 'lh1', icon: '🏫', title: 'NCCU · Kelas Basis Data', meta: 'Taipei · 2,4 km dari kos', time: '16:10' },
  { id: 'lh2', icon: '🧋', title: 'Boba stand depan kampus', meta: 'Taipei', time: '09:40' },
  { id: 'lh3', icon: '🏠', title: 'Kos Wenshan', meta: 'Taipei', time: '07:20' },
  { id: 'lh4', icon: '🚇', title: 'MRT Taipei Zoo', meta: 'Taipei', time: '07:05' },
];

export const TZ_HOURS: { label: string; both: boolean }[] = [
  { label: '00', both: false }, { label: '02', both: false }, { label: '04', both: false },
  { label: '06', both: true }, { label: '08', both: true }, { label: '10', both: true },
  { label: '12', both: true }, { label: '14', both: true }, { label: '16', both: true },
  { label: '18', both: true }, { label: '20', both: true }, { label: '22', both: false },
];

export const PLACES: Place[] = [
  { id: 'pl1', icon: '🍜', title: 'Lin Dong Fang Beef Noodle', meta: 'Taipei · Restoran · dikunjungi 12 Mei', category: '🍜 Restoran', rating: 5, note: 'yang harus dicoba lagi bareng' },
  { id: 'pl2', icon: '🏫', title: 'NCCU Wenshan', meta: 'Taipei · Kampus · tiap hari', category: '🏫 Kampus', rating: 4, note: 'tempat dia belajar tiap pagi' },
  { id: 'pl3', icon: '❤️', title: 'Kafe first date', meta: 'Jakarta · Dates · 14 Sep 2025', category: '❤️ Dates', rating: 5, note: 'bangku pojok, masih ada' },
  { id: 'pl4', icon: '🏮', title: 'Shilin Night Market', meta: 'Taipei · Travel · 17 Mei', category: '✈️ Travel', rating: 4, note: 'VC sambil keliling, seru' },
  { id: 'pl5', icon: '🏠', title: 'Kos Wenshan', meta: 'Taipei · Rumah', category: '🏠 Rumah', rating: 3, note: 'kamar kecil tapi hangat' },
];

export const TRIPS: Trip[] = [
  {
    id: 'tr1', title: 'Partner ke Jakarta 🇮🇩', meta: '1 – 14 Juni 2026 · 14 hari · Jakarta & Bandung',
    coverGradient: 'repeating-linear-gradient(135deg,#E4EAF5 0 10px,#EFF3F9 10px 20px)', upcoming: true,
    flightCode: 'CI 761', departLabel: '06:20 TPE', arriveLabel: '10:05 CGK',
    itinerary: [
      { day: '01', title: 'Mendarat di CGK 10:05', meta: 'Dijemput Joshua · makan siang nasi padang' },
      { day: '02', title: 'Kota Tua & Museum', meta: 'Sewa sepeda · foto banyak' },
      { day: '05', title: 'Berangkat ke Bandung', meta: 'Travel 06:00 · nginep 3 hari' },
      { day: '12', title: 'Balik ke Jakarta', meta: 'Beli oleh-oleh buat keluarga' },
    ],
  },
  { id: 'tr2', title: 'Trip Taiwan 🇹🇼', meta: 'Jan 2026 · 9 hari · 186 foto', coverGradient: 'repeating-linear-gradient(135deg,#E4EAF5 0 10px,#EFF3F9 10px 20px)', upcoming: false },
  { id: 'tr3', title: 'Bandung 2025 🏔️', meta: 'Des 2025 · 3 hari · 74 foto', coverGradient: 'repeating-linear-gradient(135deg,#E6F0E2 0 10px,#F2F7EF 10px 20px)', upcoming: false },
];

export const FILE_FOLDERS: FileFolder[] = [
  { id: 'fo1', icon: '📄', label: 'Dokumen Pribadi', countLabel: '12 file', color: '#FFF0D9' },
  { id: 'fo2', icon: '✈️', label: 'Tiket & Itinerary', countLabel: '8 file', color: '#D9E9FF' },
  { id: 'fo3', icon: '🎁', label: 'Ide Kado & Wishlist', countLabel: '5 file', color: '#FFE0EC' },
  { id: 'fo4', icon: '💌', label: 'Surat Cinta', countLabel: '21 file', color: '#FFE1E6' },
  { id: 'fo5', icon: '🖼️', label: 'Foto', countLabel: '1.245 file', color: '#F0E4FA' },
  { id: 'fo6', icon: '🎥', label: 'Video', countLabel: '38 file', color: '#E2F0CB' },
  { id: 'fo7', icon: '🗜️', label: 'Arsip ZIP', countLabel: '3 file', color: '#EDEDF5' },
];

export const FILES: FileItem[] = [
  { id: 'fi1', ext: 'PDF', name: 'Visa_Student_Taiwan.pdf', meta: '2,4 MB · 12 Mei · tersinkron', color: '#FFE1E6', status: 'synced' },
  { id: 'fi2', ext: 'JPG', name: 'Tiket_CI761_Partner.jpg', meta: '1,1 MB · 10 Mei · tersinkron', color: '#D9E9FF', status: 'synced' },
  { id: 'fi3', ext: 'PDF', name: 'Surat_Beasiswa_NCCU.pdf', meta: '860 KB · 2 Mei · tersinkron', color: '#FFF0D9', status: 'synced' },
  { id: 'fi4', ext: 'DOC', name: 'Wishlist_Kado_Ultah.docx', meta: '48 KB · 28 Apr · tersinkron', color: '#E2F0CB', status: 'synced' },
  { id: 'fi5', ext: 'ZIP', name: 'Foto_Trip_Taiwan.zip', meta: '1,8 GB · 20 Jan · di cloud', color: '#EDEDF5', status: 'synced' },
];

export const MOOD_BARS: { me: number; her: number }[] = [
  { me: 4, her: 5 }, { me: 5, her: 4 }, { me: 3, her: 4 }, { me: 5, her: 3 }, { me: 2, her: 3 },
  { me: 4, her: 5 }, { me: 5, her: 4 }, { me: 5, her: 5 }, { me: 3, her: 4 }, { me: 4, her: 2 },
  { me: 5, her: 5 }, { me: 2, her: 3 }, { me: 4, her: 5 }, { me: 5, her: 4 },
];

export const PIE_LEGEND = [
  { label: '🧋 Boba', value: '40%', color: '#FFB7B2' },
  { label: '🍜 Mie', value: '24%', color: '#B5EAD7' },
  { label: '🍛 Nasi', value: '18%', color: '#E3D7F7' },
  { label: '🍰 Dessert', value: '12%', color: '#FFE0AC' },
  { label: '🥗 Sehat', value: '6%', color: '#E2F0CB' },
];

const HEAT_PATTERN = [0, 1, 2, 3, 3, 2, 1, 2, 3, 3, 1, 0, 2, 3, 3, 2];
export const HEATMAP: number[] = Array.from({ length: 72 }, (_, i) => HEAT_PATTERN[i % 16]);

export const BIG_STATS: DailyStat[] = [
  { label: 'HARI BERSAMA', value: '127', note: 'sejak 14 Jan 2026', gradient: 'linear-gradient(150deg,#FFE7E4,#FFF1E9)' },
  { label: 'PAP DIKIRIM', value: '342', note: 'rata-rata 2,7/hari', gradient: 'linear-gradient(150deg,#E8F4DA,#F6F3E4)' },
  { label: 'VIDEO CALL', value: '96', note: 'total 214 jam', gradient: 'linear-gradient(150deg,#E4EAFF,#F1F0FF)' },
  { label: 'MENU DICOBA', value: '124', note: '40% boba 🧋', gradient: 'linear-gradient(150deg,#FFE0EC,#F3E1FF)' },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', icon: '❤️', text: 'Ayang ngirimin PAP nih! Coba cek muka lucunya.', time: '4 menit lalu', colorTag: 'pk', unread: true, route: '/chat' },
  { id: 'n2', icon: '🍜', text: 'Partner kamu baru aja makan siang. Kamu udah belum?', time: '1 jam lalu', colorTag: 'pk', unread: true, route: '/food' },
  { id: 'n3', icon: '🗓️', text: 'Siap-siap, 30 menit lagi jadwal Video Call!', time: '2 jam lalu', colorTag: 'mint', unread: true, route: '/schedule' },
  { id: 'n4', icon: '💌', text: 'Psst... Ada Love Note yang baru kebuka nih!', time: '5 jam lalu', colorTag: 'lav', unread: false, route: '/notes' },
  { id: 'n5', icon: '📸', text: '12 foto baru disinkron ke Galeri', time: 'Kemarin 21:40', colorTag: 'lav', unread: false, route: '/gallery' },
  { id: 'n6', icon: '✈️', text: 'Flight Partner besok jam 06:20 — jangan lupa alarm', time: 'Kemarin 18:02', colorTag: 'pk', unread: false, route: '/trips' },
  { id: 'n7', icon: '🎉', text: 'Anniversary bulan ke-5 tinggal 7 hari', time: 'Kemarin 09:00', colorTag: 'mint', unread: false, route: '/countdown' },
];

export const SETTINGS_GROUPS: { title: string; rows: { icon: string; label: string; value: string }[] }[] = [
  { title: 'AKUN', rows: [
    { icon: '📧', label: 'Email', value: 'joshua@email.com' },
    { icon: '🔑', label: 'Password', value: 'Diubah 12 Mei' },
    { icon: '🛡️', label: 'Verifikasi 2 langkah', value: 'Aktif' },
    { icon: '📱', label: 'Perangkat masuk', value: '2 perangkat' },
    { icon: '😊', label: 'Login biometrik', value: 'Face ID aktif' },
  ]},
  { title: 'COUPLE', rows: [
    { icon: '💗', label: 'Pasangan', value: 'Partner · terhubung' },
    { icon: '🏠', label: 'Nama ruang', value: 'Our Space' },
    { icon: '📅', label: 'Tanggal jadian', value: '14 Jan 2026' },
    { icon: '🔗', label: 'Kode couple', value: 'LDR-JOSH-TW-99' },
  ]},
  { title: 'NOTIFIKASI', rows: [
    { icon: '💬', label: 'Pesan', value: 'Bunyi' },
    { icon: '📸', label: 'PAP', value: 'Bunyi' },
    { icon: '🍜', label: 'Food', value: 'Diem' },
    { icon: '🗓️', label: 'Jadwal', value: 'Bunyi' },
    { icon: '💌', label: 'Love Notes', value: 'Bunyi' },
    { icon: '🌙', label: 'Jam tidur', value: '23:00–06:00' },
  ]},
  { title: 'TAMPILAN', rows: [
    { icon: '🌸', label: 'Tema', value: 'Sakura Bloom' },
    { icon: '🎨', label: 'Warna aksen', value: 'Blush pink' },
    { icon: '🌗', label: 'Mode gelap', value: 'Ikut sistem' },
    { icon: '✨', label: 'Level animasi', value: 'Penuh' },
  ]},
  { title: 'STORAGE', rows: [
    { icon: '☁️', label: 'Penyimpanan', value: '42,3 / 100 GB' },
    { icon: '🔄', label: 'Sinkron otomatis', value: 'Hanya WiFi' },
    { icon: '🖼️', label: 'Kualitas upload', value: 'Original' },
    { icon: '⬇️', label: 'Unduhan', value: 'Simpan ke galeri HP' },
  ]},
];

export const PRIVACY_ROWS: { label: string; sub: string; key: 'locOn' | 'ghostMode' | 'onlineOn' | 'lastSeenOn' | 'actOn' | 'galOn' | 'meTime' }[] = [
  { label: 'Bagikan lokasi', sub: 'Partner bisa lihat lokasi live kamu', key: 'locOn' },
  { label: 'Ghost mode', sub: 'Sembunyiin lokasi buat kasih surprise 🎁', key: 'ghostMode' },
  { label: 'Status online', sub: 'Tampilin titik hijau saat kamu aktif', key: 'onlineOn' },
  { label: 'Last seen', sub: 'Tampilin terakhir dilihat', key: 'lastSeenOn' },
  { label: 'Aktivitas & mood', sub: 'Partner bisa lihat update aktivitas kamu', key: 'actOn' },
  { label: 'Izin galeri', sub: 'Partner boleh nambah foto ke album kamu', key: 'galOn' },
  { label: 'Me-time mode', sub: 'Matiin semua notif & status sementara', key: 'meTime' },
];

export const ACCENT_SWATCHES = ['#FFB7B2', '#84A9FF', '#C7E5AE', '#D9B8FF', '#FFD3B6', '#B5EAD7'];

export const MOOD_OPTIONS = ['🥰 Loved', '😊 Seneng', '😌 Kalem', '😴 Ngantuk', '🥺 Kangen', '😢 Sedih', '😡 Kesel', '🤒 Sakit', '📚 Sibuk'];

export const FAVORITE_THINGS = [
  'Dia selalu inget nanya aku udah makan atau belum.',
  'Ketawanya kedengeran sampai Jakarta.',
  'Sabar banget nungguin aku selesai ngoding.',
];

export const GALLERY_CHIPS = ['Semua', 'Foto', 'Video', 'Makanan', 'Memories', 'Travel', 'Dates', 'Daily Life'];
export const FOOD_CATS = ['Semua', 'Sarapan', 'Makan Siang', 'Makan Malam', 'Nyemil', 'Dessert', 'Minuman'];
export const PLACE_CATS = ['Semua', '❤️ Dates', '🍜 Restoran', '🏫 Kampus', '🏠 Rumah', '✈️ Travel', '📸 Memories'];
export const ATTACH_MENU: { label: string; route?: string; sheet?: string; disabled?: boolean }[] = [
  { label: '📸 PAP', sheet: 'pap' },
  { label: '🖼️ Galeri', route: '/gallery' },
  { label: '🎤 Voice · segera', disabled: true },
  { label: '📍 Lokasi', route: '/location' },
  { label: '🗂️ Berkas', route: '/files' },
  { label: '🎁 Stiker · segera', disabled: true },
  { label: '💌 Love note', route: '/notes' },
];
