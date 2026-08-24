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
  await page.getByRole('button', { name: /^Lihat ruang demo/ }).click();
  await expectPath(page, '/', 'Akun demo tidak masuk ke beranda');
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Shell aplikasi demo tidak selesai dimuat');
}

async function signUp(page, { name, email, password }) {
  await page.getByRole('tab', { name: 'Buat akun' }).click();
  await page.getByLabel('Nama panggilan').fill(name);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Ulangi password').fill(password);
  await page.getByRole('button', { name: 'Buat akun', exact: true }).click();
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

  await page.getByRole('tab', { name: 'Buat akun' }).click();
  await page.waitForTimeout(380);
  await shot(page, 'desktop-auth-signup');
  await page.getByRole('tab', { name: 'Masuk' }).click();

  await signUp(page, first);
  await expectVisible(page.getByText('Bangun satu rumah digital, berdua.'), 'Layar pengaturan pasangan tidak muncul');
  await page.waitForTimeout(550);
  await shot(page, 'desktop-pair-setup');

  await page.getByLabel('Nama ruang').fill('Ruang Nara & Bima');
  await page.getByLabel('Mulai hubungan').fill('2025-08-23');
  await page.getByRole('button', { name: 'Buat ruang & kode' }).click();
  const invite = page.locator('.kk-invite-code strong');
  await expectVisible(invite, 'Kode undangan tidak dibuat');
  const code = (await invite.textContent())?.trim() ?? '';
  if (!/^KK-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code)) throw new Error(`Format kode undangan tidak valid: ${code}`);
  await page.waitForTimeout(550);
  await shot(page, 'desktop-pair-invite');

  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await expectPath(page, '/auth', 'Keluar dari akun pertama gagal');
  await signUp(page, second);
  await page.getByRole('tab', { name: 'Masukkan kode' }).click();
  await page.getByLabel('Kode undangan').fill(code);
  await page.getByRole('button', { name: 'Hubungkan akun' }).click();
  await expectPath(page, '/', 'Akun kedua gagal terhubung ke ruang pasangan');
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Beranda pasangan tidak selesai dimuat');

  await visit(page, '/pair');
  await expectVisible(page.getByText('Kalian sudah terhubung.'), 'Status pasangan tidak berubah menjadi terhubung');
  await expectVisible(page.getByText('Nara QA', { exact: true }).first(), 'Nama akun pertama tidak tampil pada pasangan');
  await expectVisible(page.getByText('Bima QA', { exact: true }).first(), 'Nama akun kedua tidak tampil pada pasangan');
  await shot(page, 'desktop-pair-connected');

  await page.getByRole('button', { name: /^Masuk ke ruang kita/ }).click();
  await expectPath(page, '/', 'Tombol masuk ruang tidak membuka beranda');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectAttached(page.locator('[data-screens-end="1"]'), 'Sesi tidak bertahan setelah reload');

  await visit(page, '/settings');
  await page.getByRole('button', { name: 'Keluar dari akun' }).click();
  await expectPath(page, '/auth', 'Keluar dari pengaturan gagal');
  await visit(page, '/');
  await expectPath(page, '/auth', 'Rute privat tetap terbuka setelah logout');

  await signUp(page, third);
  await page.getByRole('tab', { name: 'Masukkan kode' }).click();
  await page.getByLabel('Kode undangan').fill(code);
  await page.getByRole('button', { name: 'Hubungkan akun' }).click();
  await expectVisible(
    page.getByRole('alert').filter({ hasText: 'Ruang ini sudah lengkap untuk dua orang.' }),
    'Kode lama masih dapat diklaim oleh akun ketiga',
  );
  await shot(page, 'desktop-pair-third-rejected');
  await page.getByRole('button', { name: 'Keluar', exact: true }).click();
  await expectPath(page, '/auth', 'Akun ketiga tidak dapat keluar setelah klaim ditolak');

  await page.getByLabel('Email').fill(first.email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Masuk ke ruang kita' }).click();
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
    await page.getByLabel('Tulis pesan').fill(lastProbe);
    await page.getByLabel('Kirim pesan').click();
  }
  await page.waitForTimeout(600);
  const lastMessageBox = await page.getByText(lastProbe, { exact: true }).boundingBox();
  const composerBox = await page.locator('main form').last().boundingBox();
  const navBox = await page.getByRole('navigation', { name: 'Navigasi utama' }).boundingBox();
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
  await page.getByRole('button', { name: 'Gunakan tema gelap' }).click();
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
  await page.getByLabel('Tulis pesan').fill(chatMessage);
  await page.getByLabel('Kirim pesan').click();
  await expectVisible(page.getByText(chatMessage, { exact: true }), 'Pesan baru tidak muncul di chat');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(chatMessage, { exact: true }), 'Pesan baru tidak bertahan setelah reload');
  await shot(page, 'flow-chat-sent');

  await visit(page, '/');
  await page.getByText('Lagi makan 🍜', { exact: true }).click();
  await expectVisible(page.getByText(/Kamu: lagi makan/), 'Status makan tidak berubah');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(/Kamu: lagi makan/), 'Status makan tidak bertahan setelah reload');
  await shot(page, 'flow-food-status');

  const papCaption = 'kangen kamu dari QA 🥺';
  await visit(page, '/chat');
  await page.getByLabel('Kirim PAP').click();
  await expectVisible(page.getByRole('dialog', { name: 'Panel tindakan' }), 'Panel PAP tidak terbuka');
  await shot(page, 'flow-pap-1-camera');
  await page.locator('input[aria-label="Pilih foto PAP"]').setInputFiles({
    name: 'pap-qa.png',
    mimeType: 'image/png',
    buffer: PAP_PNG,
  });
  await expectVisible(page.getByRole('img', { name: 'Pratinjau PAP yang dipilih' }), 'Pratinjau foto PAP tidak muncul');
  await page.getByLabel('Caption foto').fill(papCaption);
  await shot(page, 'flow-pap-2-caption');
  await page.getByRole('button', { name: 'Siapkan untuk Chat 🚀' }).click();
  await page.waitForTimeout(500);
  await shot(page, 'flow-pap-3-preparing');
  await expectVisible(page.getByText('Foto siap!'), 'Pemrosesan PAP tidak selesai');
  await shot(page, 'flow-pap-4-ready');
  await page.getByRole('button', { name: 'Tambahkan & Buka Chat' }).click();
  await expectPath(page, '/chat', 'PAP tidak kembali ke chat');
  await expectVisible(page.getByText(papCaption, { exact: true }), 'PAP tidak ditambahkan ke percakapan');
  await expectVisible(page.getByRole('img', { name: papCaption }), 'Gambar PAP tidak tampil di percakapan');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(papCaption, { exact: true }), 'PAP tidak bertahan setelah reload');
  await expectVisible(page.getByRole('img', { name: papCaption }), 'Gambar PAP tidak bertahan setelah reload');

  const foodName = 'Sate Ayam Madura QA';
  await visit(page, '/food');
  await page.getByRole('button', { name: '+ Catat makan' }).click();
  await page.getByRole('button', { name: 'Simpan 🍜' }).click();
  await shot(page, 'flow-food-validation');
  if (await page.locator('input[aria-label="Nama makanan"][aria-invalid="true"]').count() !== 1) {
    throw new Error('Form makanan tidak menandai nama wajib yang kosong');
  }
  await page.getByLabel('Nama makanan').fill(foodName);
  if (await page.getByLabel('Ambil foto makanan dengan kamera').getAttribute('capture') !== 'environment') {
    throw new Error('Input kamera makanan tidak meminta kamera belakang perangkat');
  }
  await page.getByLabel('Pilih foto makanan dari galeri').setInputFiles({ name: 'food-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await expectVisible(page.getByRole('img', { name: 'Pratinjau makanan' }), 'Pratinjau foto makanan tidak muncul');
  await page.getByRole('button', { name: 'Simpan 🍜' }).click();
  await expectVisible(page.getByText(foodName, { exact: true }), 'Catatan makanan baru tidak muncul');
  await expectVisible(page.getByRole('img', { name: `Foto ${foodName}` }), 'Foto makanan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(foodName, { exact: true }), 'Catatan makanan tidak bertahan setelah reload');
  await expectVisible(page.getByRole('img', { name: `Foto ${foodName}` }), 'Foto makanan tidak bertahan setelah reload');
  await shot(page, 'flow-food-added');
  await page.getByRole('button', { name: 'Kelola album' }).click();
  await page.getByLabel('Nama album makanan baru').fill('Kuliner QA');
  await page.getByRole('button', { name: '+ Tambah' }).click();
  await expectVisible(page.getByText('Kuliner QA', { exact: true }).first(), 'Album makanan baru tidak muncul');
  await page.getByRole('button', { name: 'Ubah' }).last().click();
  await page.getByLabel('Ubah nama Kuliner QA').fill('Kuliner QA Baru');
  await page.getByRole('button', { name: 'Simpan' }).last().click();
  await expectVisible(page.getByText('Kuliner QA Baru', { exact: true }).first(), 'Album makanan tidak berubah');
  await page.getByRole('button', { name: 'Hapus' }).last().click();
  await page.getByRole('button', { name: 'Yakin hapus' }).last().click();
  if (await page.getByText('Kuliner QA Baru', { exact: true }).count()) throw new Error('Album makanan tidak terhapus');
  await page.getByRole('button', { name: new RegExp(foodName) }).click();
  await page.getByRole('button', { name: 'Hapus', exact: true }).click();
  if (await page.getByText(foodName, { exact: true }).count()) throw new Error('Catatan makanan tidak terhapus');

  await visit(page, '/gallery');
  await page.getByRole('button', { name: 'Tampilan polaroid' }).click();
  await shot(page, 'flow-gallery-polaroid');
  await page.getByRole('button', { name: 'Tampilan timeline' }).click();
  await shot(page, 'flow-gallery-timeline');
  await page.getByRole('button', { name: 'Tampilan grid' }).click();
  await page.getByText('FOTO · PAP MALEM', { exact: true }).first().click();
  await expectVisible(page.getByRole('dialog', { name: 'Pratinjau foto' }), 'Pratinjau foto tidak terbuka');
  await shot(page, 'flow-photo-viewer');
  await page.keyboard.press('Escape');

  const galleryCaption = 'Foto galeri QA';
  await page.getByRole('button', { name: '+ Tambah foto' }).click();
  await page.getByLabel('Caption foto galeri').fill(galleryCaption);
  await page.getByLabel('Pilih album tujuan').selectOption('Daily Life');
  await page.getByLabel('Pilih banyak foto untuk galeri').setInputFiles({ name: 'gallery-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await expectVisible(page.getByRole('img', { name: galleryCaption }), 'Foto pilihan galeri tidak muncul');
  await page.getByRole('button', { name: '⚙️ Kelola album' }).click();
  await page.getByLabel('Nama album baru').fill('Album QA');
  await page.getByRole('button', { name: 'Tambah', exact: true }).click();
  const albumRow = page.locator('[data-album-id]').filter({ hasText: 'Album QA' });
  await expectVisible(albumRow, 'Album baru tidak muncul');
  await albumRow.getByRole('button', { name: 'Hapus' }).click();
  await albumRow.getByRole('button', { name: 'Yakin hapus' }).click();
  if (await page.locator('[data-album-id]').filter({ hasText: 'Album QA' }).count()) throw new Error('Album tidak terhapus');

  await visit(page, '/profile');
  await page.getByRole('button', { name: 'Edit profil' }).click();
  await page.getByLabel('Pilih foto profil dari galeri').setInputFiles({
    name: 'avatar-qa.png',
    mimeType: 'image/png',
    buffer: PAP_PNG,
  });
  await expectVisible(page.getByRole('img', { name: 'Foto profil Joshua' }), 'Pratinjau foto profil tidak muncul');
  await page.getByRole('button', { name: 'Simpan profil' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('img', { name: 'Foto profil Joshua' }).first(), 'Foto profil tidak bertahan setelah reload');
  await shot(page, 'flow-profile-photo');

  await visit(page, '/settings');
  await page.getByRole('button', { name: /Jadwal senyap/ }).click();
  await page.getByLabel('Mulai').fill('23:15');
  await page.getByLabel('Selesai').fill('06:45');
  await page.getByRole('button', { name: 'Simpan jadwal' }).click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByRole('button', { name: /Jadwal senyap.*23:15–06:45/ }), 'Jadwal senyap tidak bertahan setelah reload');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Unduh cadangan lokal/ }).click();
  if (!(await download).suggestedFilename().endsWith('.json')) throw new Error('Cadangan lokal bukan berkas JSON');
  await shot(page, 'flow-settings-working');

  const eventTitle = 'Video call QA';
  await visit(page, '/schedule');
  await page.getByRole('button', { name: '+ Bikin acara baru' }).click();
  await page.getByLabel('Judul acara').fill(eventTitle);
  await page.getByLabel('Tanggal acara').fill('2026-08-30');
  await page.getByLabel('Waktu acara').fill('20:30');
  await shot(page, 'flow-event-sheet');
  await page.getByRole('button', { name: 'Simpan acara' }).click();
  await expectVisible(page.locator('main').getByText(eventTitle, { exact: true }), 'Acara baru tidak muncul di jadwal');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.locator('main').getByText(eventTitle, { exact: true }), 'Acara baru tidak bertahan setelah reload');
  await shot(page, 'flow-event-added');

  const memoryTitle = 'Kenangan QA tersinkron';
  await visit(page, '/memories');
  await page.getByRole('button', { name: '+ Kenangan', exact: true }).click();
  await page.getByLabel('Judul', { exact: true }).fill(memoryTitle);
  await page.getByLabel('Tanggal').fill('2026-08-20');
  await page.getByLabel('Ceritanya').fill('Cerita ini dibuat oleh visual QA.');
  await page.getByRole('button', { name: 'Simpan kenangan 📖' }).click();
  await expectVisible(page.getByText(memoryTitle, { exact: true }), 'Kenangan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(memoryTitle, { exact: true }), 'Kenangan baru tidak bertahan setelah reload');

  const storyTitle = 'Bab QA berdua';
  await visit(page, '/story');
  await page.getByRole('button', { name: '+ Tulis bab' }).click();
  await page.getByLabel('Judul bab').fill(storyTitle);
  await page.getByRole('button', { name: 'Tambahkan ke cerita 🌱' }).click();
  await expectVisible(page.getByText(storyTitle, { exact: true }), 'Bab cerita baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(storyTitle, { exact: true }), 'Bab cerita tidak bertahan setelah reload');

  const countdownTitle = 'Pertemuan QA';
  await visit(page, '/countdown');
  await page.getByRole('button', { name: '+ Hitung mundur' }).click();
  await page.getByLabel('Nama momen').fill(countdownTitle);
  await page.getByLabel('Tanggal & waktu').fill('2026-09-30T20:00');
  await page.getByRole('button', { name: 'Mulai menghitung ⏳' }).click();
  await expectVisible(page.getByText(countdownTitle, { exact: true }), 'Hitung mundur baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(countdownTitle, { exact: true }), 'Hitung mundur tidak bertahan setelah reload');

  const placeTitle = 'Tempat QA berdua';
  await visit(page, '/places');
  await page.getByRole('button', { name: '+ Tempat' }).click();
  await page.getByLabel('Nama tempat').fill(placeTitle);
  await page.getByLabel('Pilih foto tempat dari galeri').setInputFiles({ name: 'place-qa.png', mimeType: 'image/png', buffer: PAP_PNG });
  await page.getByRole('button', { name: '🗺️ Pilih di peta' }).click();
  await page.locator('.kk-place-map').click({ position: { x: 190, y: 140 } });
  await page.getByRole('button', { name: 'Simpan pin 📍' }).click();
  await expectVisible(page.getByText(placeTitle, { exact: true }).last(), 'Tempat baru tidak muncul');
  await expectVisible(page.getByRole('img', { name: `Foto ${placeTitle}` }), 'Foto tempat tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(placeTitle, { exact: true }).last(), 'Tempat tidak bertahan setelah reload');
  await page.getByRole('button', { name: new RegExp(placeTitle) }).click();
  await page.getByRole('button', { name: '🗑️ Hapus' }).click();
  await page.getByRole('button', { name: 'Yakin hapus' }).click();
  if (await page.getByText(placeTitle, { exact: true }).count()) throw new Error('Tempat tidak terhapus');

  const tripTitle = 'Trip QA pasangan';
  await visit(page, '/trips');
  await page.getByRole('button', { name: '+ Rencanakan trip' }).click();
  await page.getByLabel('Nama perjalanan').fill(tripTitle);
  await page.getByLabel('Mulai').fill('2026-09-10');
  await page.getByLabel('Selesai').fill('2026-09-12');
  await page.getByRole('button', { name: 'Simpan perjalanan ✈️' }).click();
  await expectVisible(page.getByText(tripTitle, { exact: true }), 'Perjalanan baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(tripTitle, { exact: true }), 'Perjalanan tidak bertahan setelah reload');

  await visit(page, '/notes');
  const noteTitle = 'Surat QA untuk pasangan';
  await page.getByRole('button', { name: '+ Tulis surat baru' }).click();
  await page.getByLabel('Judul / kalimat depan').fill(noteTitle);
  await page.getByLabel('Isi surat').fill('Isi surat QA yang tersimpan untuk pasangan.');
  await page.getByRole('button', { name: 'Kirim surat 💌' }).click();
  await expectVisible(page.getByText(noteTitle, { exact: true }), 'Surat baru tidak muncul');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(noteTitle, { exact: true }), 'Surat tidak bertahan setelah reload');
  await page.getByText('Buka sekarang 💌', { exact: true }).click();
  await expectVisible(page.locator('[id^="note-"]'), 'Surat cinta tidak terbuka');
  await shot(page, 'flow-love-note');

  await visit(page, '/location');
  await page.getByRole('button', { name: 'Bagikan lokasi' }).click();
  await expectVisible(page.getByText(/Posisi terakhir perangkatmu:/), 'Posisi perangkat tidak diperoleh');
  const storedPings = await page.evaluate(() => {
    const database = JSON.parse(window.localStorage.getItem('kk-auth-db-v1') ?? '{}');
    return Array.isArray(database.locationPings) ? database.locationPings.length : 0;
  });
  if (storedPings < 1) throw new Error('Ping lokasi tidak tersimpan di ruang lokal');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expectVisible(page.getByText(/Posisi terakhir perangkatmu:/), 'Ping lokasi tidak bertahan setelah reload');
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
