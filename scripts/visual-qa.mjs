/**
 * Visual + interaction QA sweep.
 *
 * Drives a headless Chromium over every route at four viewport classes,
 * exercises the main interactive flows (chat send, PAP capture, food entry
 * with validation, gallery view modes, photo lightbox, bottom sheets), and
 * fails if the browser logged any console/page error.
 *
 * Usage:
 *   npm run dev              # in one shell
 *   npm run qa:visual        # in another
 *
 * Screenshots are written to .qa-screenshots/ (gitignored) for eyeballing
 * against the approved design.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.QA_BASE_URL ?? 'http://localhost:5173';
const OUT = process.env.QA_OUT_DIR ?? '.qa-screenshots';
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  '/', '/chat', '/gallery', '/food', '/schedule', '/memories', '/story',
  '/places', '/trips', '/files', '/location', '/timezone', '/countdown',
  '/notes', '/stats', '/notif', '/profile', '/settings', '/theme',
  '/privacy', '/states', '/onboard',
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

async function session(viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${viewport.width}px] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${viewport.width}px pageerror] ${e.message}`));
  return { ctx, page };
}

const visit = async (page, route) => {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(350);
};
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
const routeName = (r) => (r === '/' ? 'home' : r.slice(1));

// 1. Every route at desktop width.
{
  const { ctx, page } = await session(VIEWPORTS.desktop);
  for (const r of ROUTES) {
    await visit(page, r);
    await shot(page, `desktop-${routeName(r)}`);
  }
  await ctx.close();
}

// 2. Key routes on mobile (bottom tab bar + PAP FAB layout).
{
  const { ctx, page } = await session(VIEWPORTS.mobile);
  for (const r of ['/', '/chat', '/gallery', '/food', '/memories', '/schedule', '/stats']) {
    await visit(page, r);
    await shot(page, `mobile-${routeName(r)}`);
  }
  await ctx.close();
}

// 3. One reference shot per remaining viewport class.
for (const label of ['tablet', 'laptop', 'uhd']) {
  const { ctx, page } = await session(VIEWPORTS[label]);
  await visit(page, '/');
  await shot(page, `${label}-home`);
  await ctx.close();
}

// 4. Dark scheme and an alternate accent theme.
{
  const { ctx, page } = await session(VIEWPORTS.desktop);
  await visit(page, '/');
  await page.getByTitle('Light / dark').click();
  await page.waitForTimeout(300);
  await shot(page, 'desktop-home-dark');
  await visit(page, '/theme');
  await shot(page, 'desktop-theme-dark');
  await page.getByText('Taipei Night').click();
  await page.waitForTimeout(300);
  await visit(page, '/');
  await shot(page, 'desktop-home-dark-taipei');
  await ctx.close();
}

// 5. Interactive flows.
{
  const { ctx, page } = await session(VIEWPORTS.desktop);

  await visit(page, '/chat');
  await page.fill('input[placeholder="Tulis pesan buat ayang..."]', 'Halo dari QA 👋');
  await page.getByLabel('Kirim pesan').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-chat-sent');

  await visit(page, '/');
  await page.getByText('Lagi makan 🍜').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-food-status');

  // PAP capture: camera → caption → upload progress → sent
  await visit(page, '/chat');
  await page.getByLabel('Kirim PAP').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-pap-1-camera');
  await page.getByLabel('Ambil foto').click();
  await page.waitForTimeout(200);
  await page.fill('input[placeholder="mis. kangen kamu 🥺"]', 'kangen kamu 🥺');
  await shot(page, 'flow-pap-2-caption');
  await page.getByText('Kirim ke Partner 🚀').click();
  await page.waitForTimeout(600);
  await shot(page, 'flow-pap-3-uploading');
  await page.waitForTimeout(1400);
  await shot(page, 'flow-pap-4-sent');

  // Food entry: empty submit must show validation, then a real save
  await visit(page, '/food');
  await page.getByText('+ Catat makan').click();
  await page.waitForTimeout(300);
  await page.getByText('Simpan 🍜').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-food-validation');
  const invalid = await page.locator('input[aria-label="Nama makanan"][aria-invalid="true"]').count();
  if (invalid !== 1) errors.push('Food form did not flag the empty required field');
  await page.fill('input[aria-label="Nama makanan"]', 'Sate Ayam Madura');
  await page.getByText('Simpan 🍜').click();
  await page.waitForTimeout(400);
  await shot(page, 'flow-food-added');
  if (!(await page.getByText('Sate Ayam Madura').count())) errors.push('New food entry did not appear in the journal');

  // Gallery view modes + lightbox
  await visit(page, '/gallery');
  await page.getByLabel('Tampilan polaroid').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-gallery-polaroid');
  await page.getByLabel('Tampilan timeline').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-gallery-timeline');
  await page.getByLabel('Tampilan grid').click();
  await page.waitForTimeout(200);
  await page.getByText('FOTO · PAP MALEM').first().click();
  await page.waitForTimeout(400);
  await shot(page, 'flow-photo-viewer');
  if (!(await page.locator('[role="dialog"][aria-label="Pratinjau foto"]').count())) {
    errors.push('Photo viewer did not open');
  }

  await visit(page, '/schedule');
  await page.getByText('+ Bikin acara baru').click();
  await page.waitForTimeout(300);
  await shot(page, 'flow-event-sheet');

  await visit(page, '/notes');
  await page.getByText('Buka sekarang 💌').click();
  await page.waitForTimeout(400);
  await shot(page, 'flow-love-note');

  await ctx.close();
}

await browser.close();

fs.writeFileSync(path.join(OUT, 'console-errors.txt'), errors.join('\n') || '(none)');
if (errors.length) {
  console.error(`\n✗ visual QA found ${errors.length} problem(s):\n${errors.join('\n')}`);
  process.exit(1);
}
console.log(`✓ visual QA passed — no console errors. Screenshots in ${OUT}/`);
