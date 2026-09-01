import fs from 'node:fs';
import { chromium } from 'playwright';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4174';
const executablePath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((candidate) => fs.existsSync(candidate));
const picture = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=', 'base64');
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  geolocation: { latitude: -6.1754, longitude: 106.8272 },
  permissions: ['geolocation', 'notifications'],
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });

try {
  await page.goto(`${base}/auth`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Preview demo space/i }).click();
  await page.waitForURL((url) => url.pathname === '/');

  await page.goto(`${base}/places`, { waitUntil: 'domcontentloaded' });
  const placeMap = page.locator('.kk-place-map');
  await placeMap.waitFor({ state: 'visible' });
  await placeMap.hover();
  await page.mouse.wheel(0, -700);
  await page.waitForTimeout(500);
  const zoomAfterUserInput = await placeMap.getAttribute('data-zoom');
  await page.getByRole('button', { name: /Lin Dong Fang Beef Noodle/i }).click();
  await page.waitForTimeout(800);
  const zoomAfterSelection = await placeMap.getAttribute('data-zoom');
  if (zoomAfterSelection !== zoomAfterUserInput) throw new Error(`Place selection reset map zoom (${zoomAfterUserInput} -> ${zoomAfterSelection}).`);

  await page.goto(`${base}/memories`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '+ Memory', exact: true }).click();
  await page.getByLabel('Choose a memory picture').setInputFiles({ name: 'memory.png', mimeType: 'image/png', buffer: picture });
  await page.getByRole('button', { name: '⌖ My current location' }).click();
  await page.getByLabel('Memory place').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('[aria-label="Memory place"]')?.value.startsWith('GPS ·'));
  const placeValue = await page.getByLabel('Memory place').inputValue();
  if (!placeValue.startsWith('GPS · -6.17540, 106.82720')) throw new Error(`Memory GPS was not captured: ${placeValue}`);
  await page.getByLabel('Memory title').fill('Production GPS memory');
  await page.getByLabel('Memory story').fill('Picture and coordinates should stay attached.');
  await page.getByRole('button', { name: 'Save memory 📖' }).click();
  await page.getByText('Production GPS memory', { exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /Production GPS memory/ }).click();
  await page.getByRole('img', { name: 'Production GPS memory' }).waitFor({ state: 'visible' });

  if (errors.length) throw new Error(`Browser errors:\n${errors.join('\n')}`);
  console.log('✓ Mobile feature QA passed: stable map zoom, memory GPS, picture upload, and saved preview.');
} finally {
  await context.close();
  await browser.close();
}
