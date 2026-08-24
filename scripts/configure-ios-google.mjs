import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const envPath = resolve('.env.local');
const plistPath = resolve('ios/App/App/Info.plist');

function parseEnv(source) {
  const values = new Map();
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equals = line.indexOf('=');
    if (equals < 1) continue;
    const key = line.slice(0, equals).trim();
    const value = line.slice(equals + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    values.set(key, value);
  }
  return values;
}

function replaceMarkedSection(source, name, body) {
  const start = `<!-- ${name}_BEGIN -->`;
  const end = `<!-- ${name}_END -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(source)) throw new Error(`Marker ${name} tidak ditemukan di Info.plist.`);
  return source.replace(pattern, `${start}\n${body}\n  ${end}`);
}

const env = parseEnv(await readFile(envPath, 'utf8').catch(() => ''));
const clientId = env.get('VITE_GOOGLE_DRIVE_IOS_CLIENT_ID')?.trim();
const serverClientId = env.get('VITE_GOOGLE_DRIVE_CLIENT_ID')?.trim();

if (!clientId?.endsWith('.apps.googleusercontent.com')) {
  throw new Error('Isi VITE_GOOGLE_DRIVE_IOS_CLIENT_ID dengan OAuth Client ID bertipe iOS terlebih dahulu.');
}

const reversedClientId = clientId.split('.').reverse().join('.');
let plist = await readFile(plistPath, 'utf8');
const config = [
  '  <key>GIDClientID</key>',
  `  <string>${clientId}</string>`,
  ...(serverClientId ? ['  <key>GIDServerClientID</key>', `  <string>${serverClientId}</string>`] : []),
].join('\n');
const urlType = [
  '    <dict>',
  '      <key>CFBundleURLName</key>',
  '      <string>com.googleusercontent.apps.kisahkita</string>',
  '      <key>CFBundleURLSchemes</key>',
  '      <array>',
  `        <string>${reversedClientId}</string>`,
  '      </array>',
  '    </dict>',
].join('\n');

plist = replaceMarkedSection(plist, 'GOOGLE_OAUTH_CONFIG', config);
plist = replaceMarkedSection(plist, 'GOOGLE_OAUTH_URL', urlType);
await writeFile(plistPath, plist, 'utf8');

console.log('Google OAuth iOS berhasil ditulis ke Info.plist. Jalankan npm run ios:sync sebelum membuka Xcode.');
