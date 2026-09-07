/**
 * Destructive production smoke test for an EMPTY Supabase project.
 *
 * It creates two confirmed QA users, pairs them through the real UI, verifies
 * realtime chat/media/food/place flows, then removes the users and all QA data.
 */
import fs from 'node:fs';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const split = line.indexOf('=');
      return [line.slice(0, split).trim(), line.slice(split + 1).trim().replace(/^['"]|['"]$/g, '')];
    }));
}

const env = { ...readEnv('.env.local'), ...readEnv('.env.admin.local'), ...process.env };
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY;
const base = (env.QA_BASE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
if (!url || !secret) throw new Error('SUPABASE_URL dan SUPABASE_SECRET_KEY wajib tersedia di .env.admin.local.');
const projectRef = new URL(url).hostname.split('.')[0];
const confirmation = process.argv.find((value) => value.startsWith('--confirm='))?.slice(10);
if (confirmation !== projectRef) throw new Error(`QA produksi bersifat destruktif. Jalankan dengan --confirm=${projectRef}`);

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
const [usersBefore, couplesBefore, objectsBefore] = await Promise.all([
  admin.auth.admin.listUsers({ page: 1, perPage: 2 }),
  admin.from('couples').select('id', { count: 'exact', head: true }),
  admin.storage.from('media').list('', { limit: 1 }),
]);
if (usersBefore.error || couplesBefore.error || objectsBefore.error) throw usersBefore.error || couplesBefore.error || objectsBefore.error;
if (usersBefore.data.users.length || couplesBefore.count || objectsBefore.data.length) {
  throw new Error('QA produksi hanya boleh dijalankan setelah reset: Auth, couples, dan bucket media harus kosong.');
}

const executablePath = env.PLAYWRIGHT_CHROMIUM_PATH || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((candidate) => fs.existsSync(candidate));
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=', 'base64');
const stamp = Date.now();
const password = `KisahKita-QA-${stamp}!Aa1`;
const accounts = [
  { email: `joshua.qa.${stamp}@example.com`, name: 'Joshua QA' },
  { email: `pasangan.qa.${stamp}@example.com`, name: 'Pasangan QA' },
];
const createdUserIds = [];
let browser;
let contextA;
let contextB;
let qaError;
let cleanupError;

async function waitVisible(locator, label, timeout = 12_000) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
  } catch {
    throw new Error(label);
  }
}

async function signIn(page, account) {
  await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' });
  const mode = await page.locator('[data-auth-mode]').getAttribute('data-auth-mode');
  if (mode !== 'supabase') throw new Error('Server QA tidak berjalan dalam mode Supabase.');
  await page.getByLabel('Email').fill(account.email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Enter our space' }).click();
  await page.waitForURL((target) => target.pathname === '/pair', { timeout: 15_000 });
}

async function reloadUntilVisible(page, locator, label) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 5_000 });
  } catch {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitVisible(locator, label);
  }
}

try {
  for (const account of accounts) {
    const created = await admin.auth.admin.createUser({ email: account.email, password, email_confirm: true, user_metadata: { name: account.name } });
    if (created.error || !created.data.user) throw created.error || new Error('Akun QA gagal dibuat.');
    createdUserIds.push(created.data.user.id);
  }

  browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  contextA = await browser.newContext({ viewport: { width: 412, height: 915 }, geolocation: { latitude: -6.1754, longitude: 106.8272 }, permissions: ['geolocation'] });
  contextB = await browser.newContext({ viewport: { width: 412, height: 915 } });
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  const browserErrors = [];
  for (const [label, page] of [['A', pageA], ['B', pageB]]) {
    page.on('pageerror', (error) => browserErrors.push(`${label}: ${error.message}`));
    page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(`${label}: ${message.text()}`); });
  }

  await signIn(pageA, accounts[0]);
  await pageA.getByLabel('Space name').fill('Production QA Space');
  await pageA.getByLabel('Relationship started').fill('2026-01-01');
  await pageA.getByRole('button', { name: 'Create space & code' }).click();
  const invite = pageA.locator('.kk-invite-code strong');
  await waitVisible(invite, 'Kode pasangan tidak dibuat.');
  const inviteCode = (await invite.textContent())?.trim() || '';
  if (!inviteCode) throw new Error('Kode pasangan kosong.');

  await signIn(pageB, accounts[1]);
  await pageB.getByRole('tab', { name: 'Enter code' }).click();
  await pageB.getByLabel('Invitation code').fill(inviteCode);
  await pageB.getByRole('button', { name: 'Connect account' }).click();
  await pageB.waitForURL((target) => target.pathname === '/', { timeout: 15_000 });
  if (await pageA.getByRole('button', { name: 'Check now' }).count()) {
    await pageA.getByRole('button', { name: 'Check now' }).click();
  }
  await waitVisible(pageA.getByRole('button', { name: /Enter our space/ }), 'The first account did not detect its partner.');
  await pageA.getByRole('button', { name: /Enter our space/ }).click();

  const chatText = `Production realtime message ${stamp}`;
  await pageA.goto(`${base}/chat`, { waitUntil: 'domcontentloaded' });
  await pageB.goto(`${base}/chat`, { waitUntil: 'domcontentloaded' });
  await pageA.getByLabel('Write a message').fill(chatText);
  await pageA.getByLabel('Send message').click();
  await reloadUntilVisible(pageB, pageB.getByText(chatText, { exact: true }), 'Pesan tidak tersinkron ke pasangan.');

  const galleryCaption = `Production picture ${stamp}`;
  await pageA.goto(`${base}/gallery`, { waitUntil: 'domcontentloaded' });
  await pageB.goto(`${base}/gallery`, { waitUntil: 'domcontentloaded' });
  await pageA.getByRole('button', { name: '+ Add pictures' }).click();
  await pageA.getByLabel('Gallery picture caption').fill(galleryCaption);
  await pageA.getByLabel('Choose multiple pictures for the gallery').setInputFiles({ name: 'gallery-qa.png', mimeType: 'image/png', buffer: png });
  await waitVisible(pageA.getByRole('img', { name: galleryCaption }), 'Foto galeri tidak muncul di pengunggah.');
  await reloadUntilVisible(pageB, pageB.getByRole('img', { name: galleryCaption }), 'Foto galeri tidak tersinkron ke pasangan.');
  await pageA.getByRole('img', { name: galleryCaption }).click();
  await pageA.getByRole('button', { name: '🗑️ Delete' }).click();
  await pageA.getByRole('button', { name: 'Confirm delete' }).click();
  await pageB.reload({ waitUntil: 'domcontentloaded' });
  if (await pageB.getByRole('img', { name: galleryCaption }).count()) throw new Error('Foto yang dihapus masih terlihat pada akun pasangan.');

  const foodName = `Production meal ${stamp}`;
  await pageA.goto(`${base}/food`, { waitUntil: 'domcontentloaded' });
  await pageB.goto(`${base}/food`, { waitUntil: 'domcontentloaded' });
  await pageA.getByRole('button', { name: '+ Add a meal' }).click();
  await pageA.getByLabel('Choose a meal picture').setInputFiles({ name: 'food-qa.png', mimeType: 'image/png', buffer: png });
  await pageA.getByLabel('Meal name').fill(foodName);
  await pageA.getByRole('button', { name: 'Save meal 🍜' }).click();
  await reloadUntilVisible(pageB, pageB.getByText(foodName, { exact: true }), 'Food Journal tidak tersinkron ke pasangan.');
  await pageA.getByRole('button', { name: new RegExp(foodName) }).click();
  await pageA.getByRole('button', { name: 'Delete', exact: true }).click();
  await pageB.reload({ waitUntil: 'domcontentloaded' });
  if (await pageB.getByText(foodName, { exact: true }).count()) throw new Error('Catatan Food yang dihapus masih terlihat pada akun pasangan.');

  const placeName = `Production place ${stamp}`;
  await pageA.goto(`${base}/places`, { waitUntil: 'domcontentloaded' });
  await pageB.goto(`${base}/places`, { waitUntil: 'domcontentloaded' });
  await pageA.getByRole('button', { name: '+ Add place' }).click();
  await pageA.getByLabel('Place name').fill(placeName);
  await pageA.getByLabel('Choose a place picture').setInputFiles({ name: 'place-qa.png', mimeType: 'image/png', buffer: png });
  await pageA.getByRole('button', { name: '⌖ My current location' }).click();
  await waitVisible(pageA.getByText(/^Pin:/), 'Geolocation perangkat tidak mengisi pin.');
  await pageA.getByRole('button', { name: 'Save pin 📍' }).click();
  await reloadUntilVisible(pageB, pageB.getByText(placeName, { exact: true }).last(), 'Tempat tidak tersinkron ke pasangan.');
  await pageA.getByRole('button', { name: new RegExp(placeName) }).click();
  await pageA.getByRole('button', { name: '🗑️ Delete' }).click();
  await pageA.getByRole('button', { name: 'Confirm delete' }).click();
  await pageB.reload({ waitUntil: 'domcontentloaded' });
  if (await pageB.getByText(placeName, { exact: true }).count()) throw new Error('Tempat yang dihapus masih terlihat pada akun pasangan.');

  if (browserErrors.length) throw new Error(`Browser errors:\n${browserErrors.join('\n')}`);
  console.log('✓ Production QA passed — real Auth, pairing, Realtime, Storage, chat, gallery delete, Food photo/delete, and place GPS/delete are healthy.');
} catch (error) {
  qaError = error;
} finally {
  await contextA?.close().catch(() => undefined);
  await contextB?.close().catch(() => undefined);
  await browser?.close().catch(() => undefined);
  try { await admin.storage.emptyBucket('media'); } catch { /* verification below remains authoritative */ }
  for (const userId of createdUserIds) {
    try { await admin.auth.admin.deleteUser(userId, false); } catch { /* verification below remains authoritative */ }
  }
  try { await admin.rpc('admin_reset_kisahkita'); } catch { /* verification below remains authoritative */ }
  const [usersAfter, couplesAfter, objectsAfter] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    admin.from('couples').select('id', { count: 'exact', head: true }),
    admin.storage.from('media').list('', { limit: 1 }),
  ]);
  if (usersAfter.data.users.length || couplesAfter.count || objectsAfter.data.length) {
    cleanupError = new Error('Cleanup QA produksi gagal; project belum kembali kosong.');
  }
}

if (cleanupError) throw cleanupError;
if (qaError) throw qaError;
