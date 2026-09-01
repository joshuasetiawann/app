/**
 * Visual + interaction QA sweep for the local-fallback app.
 *
 * Start `npm run dev`, then run `npm run qa:visual`. The sweep verifies the
 * two-account auth/pairing lifecycle, protected routes at five viewport sizes,
 * persisted interactions, dialogs, themes, and browser console health.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.env.QA_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
const OUT = process.env.QA_OUT_DIR ?? '.qa-screenshots';
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_PATH || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((candidate) => fs.existsSync(candidate));
const PAP_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
  'base64',
);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  '/', '/chat', '/gallery', '/food', '/schedule', '/memories', '/story',
  '/places', '/trips', '/files', '/location', '/timezone', '/countdown',
  '/notes', '/stats', '/notif', '/profile', '/settings', '/theme',
  '/privacy', '/states',
];

const VIEWPORTS = {
  mobile: { width: 412, height: 915 },
  tablet: { width: 834, height: 1112 },
  laptop: { width: 1366, height: 900 },
  desktop: { width: 1440, height: 900 },
  uhd: { width: 1920, height: 1080 },
};

const errors = [];
const browser = await chromium.launch({ executablePath: EXECUTABLE, args: ['--no-sandbox'] });

const messageOf = (error) => error instanceof Error ? error.message : String(error);
const routeName = (route) => route === '/' ? 'home' : route.slice(1);
const shot = async (page, name) => {
  await page.waitForTimeout(420);
  return page.screenshot({ path: path.join(OUT, `${name}.png`) });
};

async function visit(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
}

async function expectPath(page, expected, label) {
  await page.waitForURL((url) => url.pathname === expected, { timeout: 10_000 });
  if (new URL(page.url()).pathname !== expected) throw new Error(label);
}

async function expectVisible(locator, label) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 8_000 });
  } catch {
    throw new Error(label);
  }
}

async function expectAttached(locator, label) {
  try {
    await locator.waitFor({ state: 'attached', timeout: 8_000 });
  } catch {
    throw new Error(label);
  }
}

async function withSession(label, viewport, run, contextOptions = {}) {
  const ctx = await browser.newContext({ viewport, ...contextOptions });
  const page = await ctx.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`[${label} console] ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`[${label} pageerror] ${error.message}`));

  try {
    await run(page);
  } catch (error) {
    errors.push(`[${label}] ${messageOf(error)}`);
    try {
      await shot(page, `failed-${label}`);
    } catch {
      // Preserve the original failure when the page itself is no longer usable.
    }
  } finally {
    await ctx.close();
  }
}

async function requireLocalMode(page) {
  const root = page.locator('[data-auth-mode]');
  await expectVisible(root, 'Halaman autentikasi tidak muncul');
  const mode = await root.getAttribute('data-auth-mode');
  if (mode !== 'local') {
    throw new Error('QA akun lokal memerlukan server tanpa variabel VITE_SUPABASE_*');
  }
}

async function bootstrapDemo(page) {
  await visit(page, '/auth');
  await requireLocalMode(page);
  await page.getByRole('button', { name: /^Preview demo space/ }).click();
  await expectPath(page, '/', 'Akun demo tidak masuk ke beranda');
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Shell aplikasi demo tidak selesai dimuat');
}

async function signUp(page, { name, email, password }) {
  await page.getByRole('tab', { name: 'Create account' }).click();
  await page.getByLabel('Display name').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Repeat password').fill(password);
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await expectPath(page, '/pair', `Pendaftaran ${name} tidak membuka halaman pasangan`);
}

// 1. Full local auth lifecycle: guard → two signups → invite → pairing →
// reload persistence → logout guard → login with the first account.
await withSession('auth-pair', VIEWPORTS.desktop, async (page) => {
  const password = 'KisahKita-QA-2026';
  const first = { name: 'Nara QA', email: 'nara.qa@kisahkita.test', password };
  const second = { name: 'Bima QA', email: 'bima.qa@kisahkita.test', password };
  const third = { name: 'Tara QA', email: 'tara.qa@kisahkita.test', password };

  await visit(page, '/chat');
  await expectPath(page, '/auth', 'Rute privat tidak mengalihkan pengunjung ke halaman masuk');
  await requireLocalMode(page);
  await shot(page, 'desktop-auth-login');

  await page.getByRole('tab', { name: 'Create account' }).click();
  await page.waitForTimeout(380);
  await shot(page, 'desktop-auth-signup');
  await page.getByRole('tab', { name: 'Sign in' }).click();

  await signUp(page, first);
  await expectVisible(page.getByText('Build one digital home, together.'), 'Layar pengaturan pasangan tidak muncul');
  await page.waitForTimeout(550);
  await shot(page, 'desktop-pair-setup');

  await page.getByLabel('Space name').fill('Nara & Bima’s Space');
  await page.getByLabel('Relationship started').fill('2025-08-23');
  await page.getByRole('button', { name: 'Create space & code' }).click();
  const invite = page.locator('.kk-invite-code strong');
  await expectVisible(invite, 'Invitation code tidak dibuat');
  const code = (await invite.textContent())?.trim() ?? '';
  if (!/^KK-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code)) throw new Error(`Format kode undangan tidak valid: ${code}`);
  await page.waitForTimeout(550);
  await shot(page, 'desktop-pair-invite');

  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expectPath(page, '/auth', 'Sign out dari akun pertama gagal');
  await signUp(page, second);
  await page.getByRole('tab', { name: 'Enter code' }).click();
  await page.getByLabel('Invitation code').fill(code);
  await page.getByRole('button', { name: 'Connect account' }).click();
  await expectPath(page, '/', 'Akun kedua gagal terhubung ke ruang pasangan');
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Beranda pasangan tidak selesai dimuat');

  await visit(page, '/pair');
  await expectVisible(page.getByText('You are connected.'), 'Status pasangan tidak berubah menjadi terhubung');
  await expectVisible(page.getByText('Nara QA', { exact: true }).first(), 'Nama akun pertama tidak tampil pada pasangan');
  await expectVisible(page.getByText('Bima QA', { exact: true }).first(), 'Nama akun kedua tidak tampil pada pasangan');
  await shot(page, 'desktop-pair-connected');

  await page.getByRole('button', { name: /^Enter our space/ }).click();
  await expectPath(page, '/', 'Tombol masuk ruang tidak membuka beranda');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Sesi tidak bertahan setelah reload');

  await visit(page, '/settings');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expectPath(page, '/auth', 'Sign out dari pengaturan gagal');
  await visit(page, '/');
  await expectPath(page, '/auth', 'Rute privat tetap terbuka setelah logout');

  await signUp(page, third);
  await page.getByRole('tab', { name: 'Enter code' }).click();
  await page.getByLabel('Invitation code').fill(code);
  await page.getByRole('button', { name: 'Connect account' }).click();
  await expectVisible(
    page.getByRole('alert').filter({ hasText: 'This space already has two members.' }),
    'Kode lama masih dapat diklaim oleh akun ketiga',
  );
  await shot(page, 'desktop-pair-third-rejected');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expectPath(page, '/auth', 'Akun ketiga tidak dapat keluar setelah klaim ditolak');

  await page.getByLabel('Email').fill(first.email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Enter our space' }).click();
  await expectPath(page, '/', 'Akun pertama tidak dapat masuk kembali');
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Ruang pasangan tidak tersimpan setelah login ulang');
});

// 2. Auth composition on a phone-sized viewport.
await withSession('auth-mobile', VIEWPORTS.mobile, async (page) => {
  await visit(page, '/auth');
  await requireLocalMode(page);
  await shot(page, 'mobile-auth-login');
});

// 3. Every protected route at desktop width, bootstrapped through the demo.
await withSession('routes-desktop', VIEWPORTS.desktop, async (page) => {
  await bootstrapDemo(page);
  for (const route of ROUTES) {
    await visit(page, route);
    await expectAttached(page.locator('[data-screens-end="1"]'), `Rute ${route} tidak selesai dimuat`);
    await shot(page, `desktop-${routeName(route)}`);
  }
});

// 4. Key routes on mobile (bottom navigation + PAP layout).
await withSession('routes-mobile', VIEWPORTS.mobile, async (page) => {
  await bootstrapDemo(page);
  for (const route of ['/', '/chat', '/gallery', '/food', '/memories', '/schedule', '/stats']) {
    await visit(page, route);
    await expectAttached(page.locator('[data-screens-end="1"]'), `Rute mobile ${route} tidak selesai dimuat`);
    await shot(page, `mobile-${routeName(route)}`);
  }

  await visit(page, '/chat');
  let lastProbe = '';
  for (let index = 1; index <= 10; index += 1) {
    lastProbe = `Pesan mobile overlap QA ${index} — teks panjang untuk menguji composer.`;
    await page.getByLabel('Write a message').fill(lastProbe);
    await page.getByLabel('Send message').click();
  }
  await page.waitForTimeout(600);
  const lastMessageBox = await page.getByText(lastProbe, { exact: true }).boundingBox();
  const composerBox = await page.locator('main form').last().boundingBox();
  const navBox = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox();
  if (!lastMessageBox || !composerBox || lastMessageBox.y + lastMessageBox.height > composerBox.y) {
    throw new Error('Pesan terakhir tertutup composer pada layar mobile');
  }
  if (navBox && composerBox.y + composerBox.height > navBox.y) {
    throw new Error('Composer chat bertumpuk dengan navigasi bawah');
  }
  const horizontalOverflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
  if (horizontalOverflow) throw new Error('Chat membuat overflow horizontal pada layar mobile');
  await shot(page, 'mobile-chat-overlap-regression');
});

// 5. One reference shot per remaining viewport class.
for (const label of ['tablet', 'laptop', 'uhd']) {
  await withSession(`home-${label}`, VIEWPORTS[label], async (page) => {
    await bootstrapDemo(page);
    await shot(page, `${label}-home`);
  });
}

// 6. Dark scheme and an alternate accent theme.
await withSession('themes', VIEWPORTS.desktop, async (page) => {
  await bootstrapDemo(page);
  await page.getByRole('button', { name: 'Use dark appearance' }).click();
  await page.waitForTimeout(300);
  await shot(page, 'desktop-home-dark');
  await visit(page, '/theme');
  await shot(page, 'desktop-theme-dark');
  await page.getByText('Taipei Night', { exact: true }).click();
  await page.waitForTimeout(300);
  await visit(page, '/');
  await shot(page, 'desktop-home-dark-taipei');
});

// 7. Persisted interaction flows.
await withSession('interactions', VIEWPORTS.desktop, async (page) => {
  await bootstrapDemo(page);

  const chatMessage = 'Halo dari QA 👋';
  await visit(page, '/chat');
  await page.getByLabel('Write a message').fill(chatMessage);
  await page.getByLabel('Send message').click();
  await expectVisible(page.getByText(chatMessage, { exact: true }), 'Pesan baru tidak muncul di chat');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(chatMessage, { exact: true }), 'Pesan baru tidak bertahan setelah reload');
  await shot(page, 'flow-chat-sent');

  await visit(page, '/');
  await page.getByText('Eating now 🍜', { exact: true }).click();
  await expectVisible(page.getByText(/You: eating now/), 'Status makan tidak berubah');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(/You: eating now/), 'Status makan tidak bertahan setelah reload');
  await shot(page, 'flow-food-status');

  const papCaption = 'thinking of you from QA 🥺';
  await visit(page, '/chat');
  await page.getByLabel('Send a picture').click();
  await expectVisible(page.getByRole('dialog', { name: 'Action panel' }), 'Picture panel did not open');
  await shot(page, 'flow-pap-1-camera');
  await page.locator('input[aria-label="Choose a picture to send"]').setInputFiles({
    name: 'pap-qa.png',
    mimeType: 'image/png',
    buffer: PAP_PNG,
  });
  await expectVisible(page.getByRole('img', { name: 'Selected picture preview' }), 'Picture preview did not appear');
  await page.getByLabel('Caption').fill(papCaption);
  await shot(page, 'flow-pap-2-caption');
  await page.getByRole('button', { name: 'Send & open chat' }).click();
  await expectPath(page, '/chat', 'PAP tidak kembali ke chat');
  await expectVisible(page.getByText(papCaption, { exact: true }), 'PAP tidak ditambahkan ke percakapan');
  await expectVisible(page.getByRole('img', { name: papCaption }), 'Gambar PAP tidak tampil di percakapan');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(papCaption, { exact: true }), 'PAP tidak bertahan setelah reload');
  await expectVisible(page.getByRole('img', { name: papCaption }), 'Gambar PAP tidak bertahan setelah reload');

  const foodName = 'Sate Ayam Madura QA';
  await visit(page, '/food');
  await page.getByRole('button', { name: '+ Add a meal' }).click();
  await page.getByRole('button', { name: 'Save meal 🍜' }).click();
  await shot(page, 'flow-food-validation');
  if (await page.locator('input[aria-label="Meal name"][aria-invalid="true"]').count() !== 1) {
    throw new Error('Form makanan tidak menandai nama wajib yang kosong');
  }
  await page.getByLabel('Meal name').fill(foodName);
  await expectVisible(page.getByRole('button', { name: 'Take a meal picture' }), 'In-app meal camera button is missing');
  await page.getByLabel('Choose a meal picture').setInputFiles({ name: 'food-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await expectVisible(page.getByRole('img', { name: 'Meal preview' }), 'Picture preview makanan tidak muncul');
  await page.getByRole('button', { name: 'Save meal 🍜' }).click();
  await expectVisible(page.getByText(foodName, { exact: true }), 'Catatan makanan baru tidak muncul');
  await expectVisible(page.getByRole('img', { name: `${foodName}` }), 'Foto makanan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(foodName, { exact: true }), 'Catatan makanan tidak bertahan setelah reload');
  await expectVisible(page.getByRole('img', { name: `${foodName}` }), 'Foto makanan tidak bertahan setelah reload');
  await shot(page, 'flow-food-added');
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByLabel('New meal collection name').fill('Kuliner QA');
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  await expectVisible(page.getByText('Kuliner QA', { exact: true }).first(), 'Album makanan baru tidak muncul');
  await page.getByRole('button', { name: 'Edit' }).last().click();
  await page.getByLabel('Rename Kuliner QA').fill('Kuliner QA Baru');
  await page.getByRole('button', { name: 'Save' }).last().click();
  await expectVisible(page.getByText('Kuliner QA Baru', { exact: true }).first(), 'Album makanan tidak berubah');
  await page.getByRole('button', { name: 'Delete' }).last().click();
  await page.getByRole('button', { name: 'Confirm' }).last().click();
  if (await page.getByText('Kuliner QA Baru', { exact: true }).count()) throw new Error('Album makanan tidak terhapus');
  await page.getByRole('button', { name: new RegExp(foodName) }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  if (await page.getByText(foodName, { exact: true }).count()) throw new Error('Catatan makanan tidak terhapus');

  await visit(page, '/gallery');
  await page.getByRole('button', { name: 'Polaroid view' }).click();
  await shot(page, 'flow-gallery-polaroid');
  await page.getByRole('button', { name: 'Timeline view' }).click();
  await shot(page, 'flow-gallery-timeline');
  await page.getByRole('button', { name: 'Grid view' }).click();
  await page.getByText('PHOTO · LATE-NIGHT STUDY', { exact: true }).first().click();
  await expectVisible(page.getByRole('dialog', { name: 'Picture preview' }), 'Picture preview tidak terbuka');
  await shot(page, 'flow-photo-viewer');
  await page.keyboard.press('Escape');

  const galleryCaption = 'Foto galeri QA';
  await page.getByRole('button', { name: '+ Add pictures' }).click();
  await page.getByLabel('Gallery picture caption').fill(galleryCaption);
  await page.getByLabel('Choose destination album').selectOption('Daily Life');
  await page.getByLabel('Choose multiple pictures for the gallery').setInputFiles({ name: 'gallery-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await expectVisible(page.getByRole('img', { name: galleryCaption }), 'Foto pilihan galeri tidak muncul');
  await page.getByRole('button', { name: '⚙️ Manage albums' }).click();
  await page.getByLabel('New album name').fill('Album QA');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const albumRow = page.locator('[data-album-id]').filter({ hasText: 'Album QA' });
  await expectVisible(albumRow, 'Album baru tidak muncul');
  await albumRow.getByRole('button', { name: 'Delete' }).click();
  await albumRow.getByRole('button', { name: 'Confirm delete' }).click();
  if (await page.locator('[data-album-id]').filter({ hasText: 'Album QA' }).count()) throw new Error('Album tidak terhapus');

  await visit(page, '/profile');
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page.getByLabel('Choose a profile picture').setInputFiles({
    name: 'avatar-qa.png',
    mimeType: 'image/png',
    buffer: PAP_PNG,
  });
  await expectVisible(page.getByRole('img', { name: 'Profile picture Joshua' }), 'Profile picture preview did not appear');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('img', { name: 'Profile picture Joshua' }).first(), 'Profile picture did not persist after reload');
  await shot(page, 'flow-profile-photo');

  await visit(page, '/settings');
  await page.getByRole('button', { name: /Quiet hours/ }).click();
  await page.getByLabel('From', { exact: true }).fill('23:15');
  await page.getByLabel('To', { exact: true }).fill('06:45');
  await page.getByRole('button', { name: 'Save quiet hours' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('button', { name: /Quiet hours.*23:15–06:45/ }), 'Quiet hours tidak bertahan setelah reload');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download local backup/ }).click();
  if (!(await download).suggestedFilename().endsWith('.json')) throw new Error('Cadangan lokal bukan berkas JSON');
  await shot(page, 'flow-settings-working');

  const eventTitle = 'Video call QA';
  await visit(page, '/schedule');
  await page.getByRole('button', { name: '+ Add event' }).click();
  await page.getByLabel('Event title').fill(eventTitle);
  await page.getByLabel('Event date').fill('2026-08-30');
  await page.getByLabel('Event time').fill('20:30');
  await shot(page, 'flow-event-sheet');
  await page.getByRole('button', { name: 'Save event' }).click();
  await expectVisible(page.locator('main').getByText(eventTitle, { exact: true }), 'Acara baru tidak muncul di jadwal');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.locator('main').getByText(eventTitle, { exact: true }), 'Acara baru tidak bertahan setelah reload');
  await shot(page, 'flow-event-added');

  const memoryTitle = 'Synced QA memory';
  await visit(page, '/memories');
  await page.getByRole('button', { name: '+ Memory', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill(memoryTitle);
  await page.getByLabel('Date').fill('2026-08-20');
  await page.getByLabel('The story').fill('This story was created by visual QA.');
  await page.getByRole('button', { name: 'Save memory 📖' }).click();
  await expectVisible(page.getByText(memoryTitle, { exact: true }), 'Kenangan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(memoryTitle, { exact: true }), 'Kenangan baru tidak bertahan setelah reload');

  const storyTitle = 'Our QA chapter';
  await visit(page, '/story');
  await page.getByRole('button', { name: '+ Write chapter' }).click();
  await page.getByLabel('Chapter title').fill(storyTitle);
  await page.getByRole('button', { name: 'Add to our story 🌱' }).click();
  await expectVisible(page.getByText(storyTitle, { exact: true }), 'Bab cerita baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(storyTitle, { exact: true }), 'Bab cerita tidak bertahan setelah reload');

  const countdownTitle = 'QA reunion';
  await visit(page, '/countdown');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await page.getByLabel('Moment name').fill(countdownTitle);
  await page.getByLabel('Date & time').fill('2026-09-30T20:00');
  await page.getByRole('button', { name: 'Start countdown ⏳' }).click();
  await expectVisible(page.getByText(countdownTitle, { exact: true }), 'Hitung mundur baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(countdownTitle, { exact: true }), 'Hitung mundur tidak bertahan setelah reload');

  const placeTitle = 'Our QA place';
  await visit(page, '/places');
  await page.getByRole('button', { name: '+ Add place' }).click();
  await page.getByLabel('Place name').fill(placeTitle);
  await page.getByLabel('Choose a place picture').setInputFiles({ name: 'place-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await page.getByRole('button', { name: '🗺️ Pick on map' }).click();
  await page.locator('.kk-place-map').click({ position: { x: 190, y: 140 } });
  await page.getByRole('button', { name: 'Save pin 📍' }).click();
  await expectVisible(page.getByText(placeTitle, { exact: true }).last(), 'Tempat baru tidak muncul');
  await expectVisible(page.getByRole('img', { name: `Picture of ${placeTitle}` }), 'Foto tempat tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(placeTitle, { exact: true }).last(), 'Tempat tidak bertahan setelah reload');
  await page.getByRole('button', { name: new RegExp(placeTitle) }).click();
  await page.getByRole('button', { name: '🗑️ Delete' }).click();
  await page.getByRole('button', { name: 'Confirm delete' }).click();
  if (await page.getByText(placeTitle, { exact: true }).count()) throw new Error('Tempat tidak terhapus');

  const tripTitle = 'QA couple trip';
  await visit(page, '/trips');
  await page.getByRole('button', { name: '+ Plan a trip' }).click();
  await page.getByLabel('Trip name').fill(tripTitle);
  await page.getByLabel('Start').fill('2026-09-10');
  await page.getByLabel('End').fill('2026-09-12');
  await page.getByRole('button', { name: 'Save trip ✈️' }).click();
  await expectVisible(page.getByText(tripTitle, { exact: true }), 'Perjalanan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(tripTitle, { exact: true }), 'Perjalanan tidak bertahan setelah reload');

  await visit(page, '/notes');
  const noteTitle = 'A QA note for my partner';
  await page.getByRole('button', { name: '+ Write a new note' }).click();
  await page.getByLabel('Title / front line').fill(noteTitle);
  await page.getByLabel('Can be opened from').fill('');
  await page.getByLabel('Note body').fill('This QA note is securely stored for my partner.');
  await page.getByRole('button', { name: 'Send note 💌' }).click();
  await expectVisible(page.getByText(noteTitle, { exact: true }), 'Surat baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(noteTitle, { exact: true }), 'Surat tidak bertahan setelah reload');
  await page.locator('article').filter({ hasText: noteTitle }).getByText('Open now 💌', { exact: true }).click();
  await expectVisible(page.locator('[id^="note-"]'), 'Surat cinta tidak terbuka');
  await shot(page, 'flow-love-note');

  await visit(page, '/location');
  await page.getByRole('button', { name: 'Share location' }).click();
  await expectVisible(page.getByText(/Last location from this device:/), 'Posisi perangkat tidak diperoleh');
  const storedPings = await page.evaluate(() => {
    const database = JSON.parse(window.localStorage.getItem('kk-auth-db-v1') ?? '{}');
    return Array.isArray(database.locationPings) ? database.locationPings.length : 0;
  });
  if (storedPings < 1) throw new Error('Ping lokasi tidak tersimpan di ruang lokal');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(/Last location from this device:/), 'Ping lokasi tidak bertahan setelah reload');
  await shot(page, 'flow-location-shared');
}, {
  permissions: ['geolocation', 'notifications'],
  geolocation: { latitude: -6.2000, longitude: 106.8167, accuracy: 12 },
});

await browser.close();

fs.writeFileSync(path.join(OUT, 'console-errors.txt'), errors.join('\n') || '(none)');
if (errors.length) {
  console.error(`\n✗ visual QA found ${errors.length} problem(s):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`✓ visual QA passed — auth, pairing, persistence, routes, and interactions are healthy. Screenshots in ${OUT}/`);
