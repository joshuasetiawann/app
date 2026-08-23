export interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: string;
}

export const NAV_MAIN: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/chat', icon: '💬', label: 'Chat', badge: '2' },
  { path: '/gallery', icon: '🖼️', label: 'Galeri' },
  { path: '/food', icon: '🍜', label: 'Food' },
  { path: '/schedule', icon: '🗓️', label: 'Jadwal' },
  { path: '/memories', icon: '📖', label: 'Memories' },
  { path: '/places', icon: '📍', label: 'Tempat' },
  { path: '/trips', icon: '✈️', label: 'Trips' },
  { path: '/files', icon: '🗂️', label: 'Berkas' },
];

export const NAV_MORE: NavItem[] = [
  { path: '/story', icon: '🌱', label: 'Our Story' },
  { path: '/location', icon: '🛰️', label: 'Live Location' },
  { path: '/timezone', icon: '⏳', label: 'Zona Waktu' },
  { path: '/countdown', icon: '⏰', label: 'Countdown' },
  { path: '/notes', icon: '💌', label: 'Love Notes', badge: '2' },
  { path: '/stats', icon: '📊', label: 'Statistik' },
];

export const NAV_ACCOUNT: NavItem[] = [
  { path: '/profile', icon: '🧑🏻', label: 'Profil' },
  { path: '/theme', icon: '🌸', label: 'Tema' },
  { path: '/notif', icon: '🔔', label: 'Notifikasi', badge: '3' },
  { path: '/privacy', icon: '🔒', label: 'Privasi' },
  { path: '/settings', icon: '⚙️', label: 'Pengaturan' },
  { path: '/states', icon: '🧩', label: 'UI States' },
];

export const TABS: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/gallery', icon: '🖼️', label: 'Galeri' },
  { path: '/schedule', icon: '🗓️', label: 'Jadwal' },
  { path: '/memories', icon: '📖', label: 'Memori' },
];

export const MORE_SHEET_ITEMS: NavItem[] = [
  { path: '/profile', icon: '🧑🏻', label: 'Profil' },
  { path: '/food', icon: '🍜', label: 'Food' },
  { path: '/places', icon: '📍', label: 'Tempat' },
  { path: '/trips', icon: '✈️', label: 'Trips' },
  { path: '/files', icon: '🗂️', label: 'Berkas' },
  { path: '/location', icon: '🛰️', label: 'Location' },
  { path: '/timezone', icon: '⏳', label: 'Zona Waktu' },
  { path: '/countdown', icon: '⏰', label: 'Countdown' },
  { path: '/notes', icon: '💌', label: 'Love Notes' },
  { path: '/story', icon: '🌱', label: 'Our Story' },
  { path: '/stats', icon: '📊', label: 'Statistik' },
  { path: '/notif', icon: '🔔', label: 'Notifikasi' },
  { path: '/theme', icon: '🌸', label: 'Tema' },
  { path: '/settings', icon: '⚙️', label: 'Setelan' },
  { path: '/privacy', icon: '🔒', label: 'Privasi' },
  { path: '/states', icon: '🧩', label: 'UI States' },
];

export const RIGHT_RAIL_ROUTES = new Set(['/', '/chat', '/gallery', '/food', '/schedule']);

export const SCREEN_TITLES: Record<string, [string, string]> = {
  '/': ['Our Space', 'Selamat siang, Joshua ☀️'],
  '/chat': ['Chat', 'Partner lagi online 💬'],
  '/gallery': ['Galeri', '1.245 foto · 38 video'],
  '/food': ['Food Journal', 'Buku harian kuliner berdua 🍜'],
  '/schedule': ['Jadwal', 'Mei 2026 · 2 acara berdua'],
  '/memories': ['Memories', '52 kenangan tersimpan 🥹'],
  '/story': ['Our Story', 'Dari 2024 sampai sekarang'],
  '/places': ['Tempat Kita', '24 pin tersimpan 📍'],
  '/trips': ['Trips', '2 trip · 1 mendatang ✈️'],
  '/files': ['Laci Kita', 'Dokumen & berkas berdua 🗂️'],
  '/location': ['Live Location', 'Partner lagi jalan 🚶‍♀️'],
  '/timezone': ['Zona Waktu', 'Beda 1 jam ⏳'],
  '/countdown': ['Countdown', '4 hitungan aktif'],
  '/notes': ['Love Notes', '2 surat tersegel 💌'],
  '/stats': ['Statistik Gemes', 'Mei 2026'],
  '/notif': ['Notifikasi', '3 baru'],
  '/profile': ['Profil', 'Joshua & Partner'],
  '/settings': ['Pengaturan', 'Akun, privasi, storage'],
  '/theme': ['Tema', 'Bikin sesuai selera kamu 🌸'],
  '/privacy': ['Privasi', 'Kamu yang pegang kendali'],
  '/states': ['UI States', 'Untuk hand-off ke engineer'],
  '/onboard': ['Rumah Digital Kita', 'Hubungkan dengan pasangan'],
};
