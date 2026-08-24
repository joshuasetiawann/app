export interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: string;
}

export const NAV_MAIN: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Beranda' },
  { path: '/chat', icon: '💬', label: 'Pesan' },
  { path: '/gallery', icon: '🖼️', label: 'Galeri' },
  { path: '/food', icon: '🍜', label: 'Makan' },
  { path: '/schedule', icon: '🗓️', label: 'Jadwal' },
  { path: '/memories', icon: '📖', label: 'Kenangan' },
  { path: '/places', icon: '📍', label: 'Tempat' },
  { path: '/trips', icon: '✈️', label: 'Perjalanan' },
  { path: '/files', icon: '🗂️', label: 'Berkas' },
];

export const NAV_MORE: NavItem[] = [
  { path: '/story', icon: '🌱', label: 'Cerita Kita' },
  { path: '/location', icon: '🛰️', label: 'Lokasi Langsung' },
  { path: '/timezone', icon: '⏳', label: 'Zona Waktu' },
  { path: '/countdown', icon: '⏰', label: 'Hitung Mundur' },
  { path: '/notes', icon: '💌', label: 'Surat Cinta' },
  { path: '/stats', icon: '📊', label: 'Statistik' },
];

export const NAV_ACCOUNT: NavItem[] = [
  { path: '/profile', icon: '🧑🏻', label: 'Profil' },
  { path: '/theme', icon: '🌸', label: 'Tema' },
  { path: '/notif', icon: '🔔', label: 'Notifikasi' },
  { path: '/privacy', icon: '🔒', label: 'Privasi' },
  { path: '/settings', icon: '⚙️', label: 'Pengaturan' },
];

export const TABS: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Beranda' },
  { path: '/chat', icon: '💬', label: 'Pesan' },
  { path: '/gallery', icon: '🖼️', label: 'Galeri' },
  { path: '/schedule', icon: '🗓️', label: 'Jadwal' },
  { path: '/memories', icon: '📖', label: 'Memori' },
];

export const MORE_SHEET_ITEMS: NavItem[] = [
  { path: '/profile', icon: '🧑🏻', label: 'Profil' },
  { path: '/food', icon: '🍜', label: 'Makan' },
  { path: '/places', icon: '📍', label: 'Tempat' },
  { path: '/trips', icon: '✈️', label: 'Perjalanan' },
  { path: '/files', icon: '🗂️', label: 'Berkas' },
  { path: '/location', icon: '🛰️', label: 'Lokasi' },
  { path: '/timezone', icon: '⏳', label: 'Zona Waktu' },
  { path: '/countdown', icon: '⏰', label: 'Hitung Mundur' },
  { path: '/notes', icon: '💌', label: 'Surat Cinta' },
  { path: '/story', icon: '🌱', label: 'Cerita Kita' },
  { path: '/stats', icon: '📊', label: 'Statistik' },
  { path: '/notif', icon: '🔔', label: 'Notifikasi' },
  { path: '/theme', icon: '🌸', label: 'Tema' },
  { path: '/settings', icon: '⚙️', label: 'Pengaturan' },
  { path: '/privacy', icon: '🔒', label: 'Privasi' },
];

export const RIGHT_RAIL_ROUTES = new Set(['/', '/chat', '/gallery', '/food', '/schedule']);

export const SCREEN_TITLES: Record<string, [string, string]> = {
  '/': ['Ruang Kita', 'Selamat siang ☀️'],
  '/chat': ['Pesan', 'Percakapan kalian berdua 💬'],
  '/gallery': ['Galeri', 'Foto dan video kalian'],
  '/food': ['Jurnal Makan', 'Buku harian kuliner berdua 🍜'],
  '/schedule': ['Jadwal', 'Rencana berdua dan pribadi'],
  '/memories': ['Kenangan', 'Momen yang kalian simpan 🥹'],
  '/story': ['Cerita Kita', 'Bab-bab perjalanan kalian'],
  '/places': ['Tempat Kita', 'Pin dan tempat bermakna 📍'],
  '/trips': ['Perjalanan', 'Rencana dan cerita perjalanan ✈️'],
  '/files': ['Laci Kita', 'Dokumen & berkas berdua 🗂️'],
  '/location': ['Lokasi Langsung', 'Dibagikan hanya dengan izin perangkat'],
  '/timezone': ['Zona Waktu', 'Waktu lokal kalian berdua ⏳'],
  '/countdown': ['Hitung Mundur', 'Menanti momen istimewa'],
  '/notes': ['Surat Cinta', 'Pesan untuk waktu yang tepat 💌'],
  '/stats': ['Statistik Gemes', 'Ringkasan ruang kalian'],
  '/notif': ['Notifikasi', 'Pembaruan dari ruang kalian'],
  '/profile': ['Profil', 'Akun dan pasangan'],
  '/settings': ['Pengaturan', 'Akun, privasi, penyimpanan'],
  '/theme': ['Tema', 'Bikin sesuai selera kamu 🌸'],
  '/privacy': ['Privasi', 'Kamu yang pegang kendali'],
  '/states': ['Status UI', 'Kondisi antarmuka KisahKita'],
  '/auth': ['KisahKita', 'Masuk atau buat akun'],
  '/pair': ['Hubungkan Pasangan', 'Bangun ruang privat berdua'],
  '/onboard': ['Rumah Digital Kita', 'Hubungkan dengan pasangan'],
};
