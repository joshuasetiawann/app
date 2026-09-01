export interface NavItem {
  path: string;
  icon: string;
  label: string;
  badge?: string;
}

export const NAV_MAIN: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/gallery', icon: '🖼️', label: 'Gallery' },
  { path: '/food', icon: '🍜', label: 'Food' },
  { path: '/schedule', icon: '🗓️', label: 'Schedule' },
  { path: '/memories', icon: '📖', label: 'Memories' },
  { path: '/places', icon: '📍', label: 'Places' },
  { path: '/trips', icon: '✈️', label: 'Trips' },
  { path: '/files', icon: '🗂️', label: 'Files' },
];

export const NAV_MORE: NavItem[] = [
  { path: '/story', icon: '🌱', label: 'Our Story' },
  { path: '/location', icon: '🛰️', label: 'Live Location' },
  { path: '/timezone', icon: '⏳', label: 'Time Zones' },
  { path: '/countdown', icon: '⏰', label: 'Countdowns' },
  { path: '/notes', icon: '💌', label: 'Love Notes' },
  { path: '/stats', icon: '📊', label: 'Insights' },
];

export const NAV_ACCOUNT: NavItem[] = [
  { path: '/profile', icon: '🧑🏻', label: 'Profile' },
  { path: '/theme', icon: '🌸', label: 'Appearance' },
  { path: '/notif', icon: '🔔', label: 'Notifications' },
  { path: '/privacy', icon: '🔒', label: 'Privacy' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export const TABS: NavItem[] = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/gallery', icon: '🖼️', label: 'Gallery' },
  { path: '/schedule', icon: '🗓️', label: 'Schedule' },
  { path: '/memories', icon: '📖', label: 'Memories' },
];

export const MORE_SHEET_ITEMS: NavItem[] = [...NAV_ACCOUNT, ...NAV_MAIN.filter((item) => item.path !== '/'), ...NAV_MORE];

export const RIGHT_RAIL_ROUTES = new Set(['/', '/chat', '/gallery', '/food', '/schedule']);

export const SCREEN_TITLES: Record<string, [string, string]> = {
  '/': ['Our Space', 'Good afternoon ☀️'],
  '/chat': ['Chat', 'Your private conversation 💬'],
  '/gallery': ['Gallery', 'Your shared photos and videos'],
  '/food': ['Food Journal', 'A shared diary of every bite 🍜'],
  '/schedule': ['Schedule', 'Shared and personal plans'],
  '/memories': ['Memories', 'Moments worth keeping 🥹'],
  '/story': ['Our Story', 'Every chapter of your journey'],
  '/places': ['Our Places', 'Pins and meaningful places 📍'],
  '/trips': ['Trips', 'Plans and travel stories ✈️'],
  '/files': ['Shared Files', 'Documents for both of you 🗂️'],
  '/location': ['Distance Between Us', 'Shared only with device permission'],
  '/timezone': ['Time Zones', 'Both of your local times ⏳'],
  '/countdown': ['Countdowns', 'Looking forward to something special'],
  '/notes': ['Love Notes', 'Messages for the right moment 💌'],
  '/stats': ['Insights', 'A little summary of your space'],
  '/notif': ['Notifications', 'Updates from your shared space'],
  '/profile': ['Profile', 'You and your partner'],
  '/settings': ['Settings', 'Account, privacy, and storage'],
  '/theme': ['Appearance', 'Make the app feel like yours 🌸'],
  '/privacy': ['Privacy', 'You stay in control'],
  '/states': ['UI States', 'KisahKita interface states'],
  '/auth': ['KisahKita', 'Sign in or create an account'],
  '/pair': ['Connect Your Partner', 'Create a private space for two'],
  '/onboard': ['Our Digital Home', 'Connect with your partner'],
};
