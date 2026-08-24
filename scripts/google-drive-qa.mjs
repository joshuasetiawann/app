import { chromium } from 'playwright';
import { createServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

process.env.VITE_SUPABASE_URL = '';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = '';
process.env.VITE_SUPABASE_ANON_KEY = '';
process.env.VITE_GOOGLE_DRIVE_CLIENT_ID = 'qa-client.apps.googleusercontent.com';

const port = 4179;
const base = `http://127.0.0.1:${port}`;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((candidate) => fs.existsSync(candidate));
const output = '.qa-screenshots';
fs.mkdirSync(output, { recursive: true });

const server = await createServer({
  logLevel: 'error',
  server: { host: '127.0.0.1', port, strictPort: true },
});
let browser;

try {
  await server.listen();
  browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    window.google = {
      accounts: {
        oauth2: {
          initTokenClient(config) {
            return { requestAccessToken: () => config.callback({ access_token: 'qa-token', expires_in: 3600 }) };
          },
          revoke() {},
        },
      },
    };
  });

  const driveFiles = [];
  await context.route('https://www.googleapis.com/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const json = (value, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });

    if (url.pathname.includes('/permissions') && request.method() === 'POST') return json({ id: 'permission-qa' });
    if (url.pathname.includes('/upload/drive/v3/files') && request.method() === 'POST') {
      const file = {
        id: 'file-qa-123456',
        name: 'tiket-qa.pdf',
        mimeType: 'application/pdf',
        size: '2048',
        modifiedTime: new Date().toISOString(),
        webViewLink: 'https://drive.google.com/open?id=file-qa-123456',
      };
      driveFiles.unshift(file);
      return json(file);
    }
    if (url.pathname.endsWith('/drive/v3/files') && request.method() === 'POST') {
      return json({ id: 'folder-qa-1234567890', name: 'KisahKita — Ruang Joshua & Mia', mimeType: 'application/vnd.google-apps.folder' });
    }
    if (url.pathname.endsWith('/drive/v3/files') && request.method() === 'GET') return json({ files: driveFiles });
    if (url.pathname.includes('/drive/v3/files/') && request.method() === 'DELETE') {
      driveFiles.splice(0, driveFiles.length);
      return route.fulfill({ status: 204 });
    }
    return json({ error: { message: `Unhandled QA request: ${request.method()} ${url.pathname}` } }, 500);
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (entry) => entry.type() === 'error' && consoleErrors.push(entry.text()));
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${base}/auth`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /Lihat ruang demo/i }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await page.goto(`${base}/files`);
  await page.getByRole('button', { name: 'Hubungkan Google Drive' }).click();
  await page.getByText('TERHUBUNG', { exact: true }).waitFor();
  await page.getByText('Folder masih kosong.', { exact: false }).waitFor();

  const storedFolderId = await page.evaluate(() => {
    const database = JSON.parse(localStorage.getItem('kk-auth-db-v1') || '{}');
    return database.couples?.[0]?.driveFolderId;
  });
  if (storedFolderId !== 'folder-qa-1234567890') throw new Error('ID folder Drive tidak tersimpan pada ruang pasangan.');

  await page.getByLabel('Pilih berkas untuk Google Drive').setInputFiles({
    name: 'tiket-qa.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('KisahKita Drive QA'),
  });
  await page.getByText('tiket-qa.pdf', { exact: true }).waitFor();
  await page.screenshot({ path: path.join(output, 'drive-mocked-connected.png') });

  await page.reload();
  await page.getByText('BELUM TERHUBUNG', { exact: true }).waitFor();
  await page.getByText('Folder pasangan sudah terdaftar.', { exact: false }).waitFor();
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`);

  console.log('✓ Google Drive QA passed — connect, folder sharing metadata, upload, listing, and reload persistence are healthy.');
} finally {
  await browser?.close();
  await server.close();
}
