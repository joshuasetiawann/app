import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')];
      }),
  );
}

const env = {
  ...readEnvFile('.env.local'),
  ...readEnvFile('.env.admin.local'),
  ...process.env,
};
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error('Isi SUPABASE_URL dan SUPABASE_SECRET_KEY di .env.admin.local. Secret key tidak boleh memakai awalan VITE_.');
}
if (secretKey === env.VITE_SUPABASE_PUBLISHABLE_KEY || secretKey === env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Reset memerlukan secret/service-role key, bukan publishable atau anon key.');
}

const projectRef = new URL(url).hostname.split('.')[0];
const confirmation = process.argv.find((value) => value.startsWith('--confirm='))?.slice('--confirm='.length);
if (confirmation !== projectRef) {
  throw new Error(`Target reset adalah ${projectRef}. Jalankan ulang dengan --confirm=${projectRef}`);
}

const db = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const [openApiResponse, usersBefore] = await Promise.all([
  fetch(`${url.replace(/\/$/, '')}/rest/v1/`, {
    headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
  }),
  db.auth.admin.listUsers({ page: 1, perPage: 1 }),
]);
if (!openApiResponse.ok) throw new Error(`Secret key tidak dapat membaca proyek ${projectRef}.`);
if (usersBefore.error) throw usersBefore.error;
const openApi = await openApiResponse.json();
if (!openApi.paths?.['/rpc/admin_reset_kisahkita']) {
  throw new Error('Migrasi 20260824_full_cloud.sql belum terpasang; reset dibatalkan sebelum menghapus apa pun.');
}
console.log(`Target terverifikasi: ${projectRef}. Reset permanen dimulai.`);

const emptied = await db.storage.emptyBucket('media');
if (emptied.error && !/not found/i.test(emptied.error.message)) throw emptied.error;

let deletedUsers = 0;
while (true) {
  const listed = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  if (!listed.data.users.length) break;
  for (const user of listed.data.users) {
    const removed = await db.auth.admin.deleteUser(user.id, false);
    if (removed.error) throw removed.error;
    deletedUsers += 1;
  }
}

const reset = await db.rpc('admin_reset_kisahkita');
if (reset.error) throw new Error(`${reset.error.message}. Jalankan migrasi 20260824_full_cloud.sql terlebih dahulu.`);

const [usersAfter, couplesAfter, objectsAfter] = await Promise.all([
  db.auth.admin.listUsers({ page: 1, perPage: 1 }),
  db.from('couples').select('id', { count: 'exact', head: true }),
  db.storage.from('media').list('', { limit: 1 }),
]);
if (usersAfter.error || couplesAfter.error || objectsAfter.error) {
  throw usersAfter.error || couplesAfter.error || objectsAfter.error;
}
if (usersAfter.data.users.length || couplesAfter.count !== 0 || objectsAfter.data.length) {
  throw new Error('Verifikasi reset gagal: masih ada data tersisa. Jangan membuat akun baru sebelum diperiksa.');
}

console.log(`Reset selesai untuk ${projectRef}: ${deletedUsers} akun dihapus, database aplikasi dan bucket media kosong.`);
