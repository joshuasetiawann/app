# KisahKita — Ruang Kita Berdua

[![CI](https://github.com/joshuasetiawann/app/actions/workflows/ci.yml/badge.svg)](https://github.com/joshuasetiawann/app/actions/workflows/ci.yml)

> Kandidat rilis web produksi untuk pasangan LDR, dengan autentikasi, data privat,
> sinkronisasi dua arah, media cloud, lokasi, dan Google Drive.

KisahKita adalah rumah digital privat untuk satu pasangan jarak jauh. Dua orang
membuat akun masing-masing, terhubung dengan satu kode undangan, lalu memakai
ruang bersama untuk obrolan, galeri, jurnal makan, jadwal, kenangan, dan ritual
kecil sehari-hari.

## Yang sudah berjalan

- Pendaftaran, masuk, pemulihan password, sesi persisten, edit profil, dan
  keluar akun.
- Alur pasangan dua akun: buat ruang, kode undangan tujuh hari, gabung dengan
  kode, batas dua anggota, pembaruan status, dan pencegahan klaim ruang ketiga.
- Proteksi rute: pengunjung diarahkan ke halaman masuk; akun yang belum punya
  pasangan diarahkan ke halaman penyambungan.
- Mode lokal tanpa konfigurasi backend, termasuk akun demo. Password lokal
  disimpan sebagai hash PBKDF2 dengan salt, bukan teks biasa.
- Mode Supabase opsional untuk autentikasi, profil, dan penyambungan pasangan.
  Skema menyertakan trigger profil, RPC penyambungan atomik, batas anggota, dan
  Row Level Security untuk data privat pasangan.
- Shell responsif, tema terang/gelap, animasi yang menghormati
  `prefers-reduced-motion`, transisi halaman, serta skeleton saat aplikasi dan
  rute sedang dimuat.
- Pada mode Supabase, pesan/PAP (typing, antrean offline, dan tanda dibaca),
  galeri, jurnal makan, acara, kenangan, bab cerita, countdown, surat berkunci,
  tempat, perjalanan, notifikasi, mood, privasi, lokasi, dan daftar favorit
  memakai database bersama serta Supabase Realtime.
- Quick PAP, foto profil, galeri, foto makanan, dan sampul tempat menerima gambar
  nyata dari kamera atau galeri lalu mengecilkannya di browser. Tombol kamera
  menyediakan pratinjau langsung melalui `getUserMedia` serta fallback kamera
  sistem. Galeri mendukung pemilihan album, filter pemilik foto, serta
  tambah/edit/hapus kategori album.
- Food Journal menyimpan foto ke Supabase Storage, mendukung edit rating/catatan,
  hapus catatan beserta file medianya, dan album makanan dinamis yang dapat
  ditambah, diubah, atau dihapus.
- Tempat dapat memakai lokasi perangkat saat ini atau pin yang dipilih langsung
  pada peta OpenStreetMap, memakai foto sampul, dan dihapus bersama file medianya.
  Lokasi Langsung memakai Geolocation API serta kanal Realtime dengan polling
  sebagai cadangan.
- Laci berkas dapat memakai satu folder Google Drive bersama: buat folder,
  bagikan ke email pasangan, upload, lihat, dan hapus berkas berukuran sampai 5 MB.

Mode lokal cocok untuk pengembangan dan demo satu perangkat. Ia bukan pengganti
autentikasi produksi dan datanya tidak berpindah antarperangkat. Konten katalog
contoh seperti foto lama, kenangan, tempat, perjalanan, dan surat hanya tampil
pada akun demo; akun biasa dimulai dari empty state dan dapat mengisi datanya
sendiri. Push notification
di luar aplikasi masih memerlukan service worker/provider push; notifikasi di
dalam aplikasi sudah dibuat otomatis oleh aktivitas pasangan.

## Menjalankan aplikasi

Prasyarat: Node.js versi LTS yang masih didukung dan npm.

```bash
npm install
npm run dev
```

Perintah pemeriksaan:

```bash
npm run build       # typecheck + build produksi
npm run lint        # pemeriksaan statis
npm run preview     # pratinjau hasil build
npm run qa:drive    # QA integrasi Google Drive dengan API yang dimock
```

Tanpa variabel lingkungan, aplikasi otomatis memakai mode lokal. Pilih
**Lihat ruang demo** untuk masuk cepat, atau buat dua akun dan hubungkan keduanya
dengan kode pada perangkat yang sama.

## Mengaktifkan Supabase

1. Buat proyek Supabase dan salin `.env.example` menjadi `.env.local`.
2. Isi URL proyek dan publishable key untuk browser:

   ```dotenv
   VITE_SUPABASE_URL=https://PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

   `VITE_SUPABASE_ANON_KEY` tetap diterima sebagai fallback untuk proyek lama.
   Jangan pernah memasukkan `service_role` key ke aplikasi web.

3. Jalankan seluruh [`supabase/schema.sql`](supabase/schema.sql) pada SQL Editor
   proyek. Skrip ini membuat tabel, trigger profil pengguna baru, RPC
   `create_couple_space`, `join_couple_by_code`, dan `refresh_couple_invite`,
   beserta policy RLS-nya.
4. Setelah itu jalankan
   [`supabase/migrations/20260824_realtime_sync.sql`](supabase/migrations/20260824_realtime_sync.sql).
   Migrasi ini mengaktifkan Realtime seluruh menu bersama, bucket PAP privat,
   read receipt chat, notifikasi aktivitas, data favorit pasangan, dan reset
   data uji yang aman.
5. Jalankan
   [`supabase/migrations/20260824_media_library.sql`](supabase/migrations/20260824_media_library.sql).
   Migrasi ini menambahkan album dinamis, koordinat dan foto sampul tempat,
   bucket `media` privat, policy Storage per ruang pasangan, dan Realtime album.
6. Jalankan
   [`supabase/migrations/20260824_full_cloud.sql`](supabase/migrations/20260824_full_cloud.sql).
   Migrasi ini memindahkan tema, mode warna, level animasi, serta jadwal senyap
   ke profil Supabase dan memasang RPC reset khusus service role.
7. Atur Site URL dan redirect URL autentikasi agar mencakup alamat aplikasi,
   termasuk `/auth?mode=reset` untuk pemulihan password.
8. Restart server pengembangan setelah mengubah `.env.local`.

Jika skema lama sudah pernah dipasang, jalankan
[`supabase/migrations/20260824_google_drive.sql`](supabase/migrations/20260824_google_drive.sql)
untuk menambahkan ID folder Drive, email pasangan bagi undangan editor, dan
policy akses tanpa membuat ulang tabel.

Saat konfigurasi Supabase dan migrasi sinkronisasi aktif, seluruh fitur interaktif
yang sudah tersedia memakai ruang pasangan yang sama. Konten bersama, profil,
preferensi tampilan, dan jadwal senyap bersumber dari Supabase. Hanya izin browser,
token sesi Supabase, serta antrean pesan offline sementara yang tinggal di perangkat.
Dalam mode Supabase, file gambar berada di bucket Storage privat dan metadata-nya
berada di database; browser hanya menerima URL bertanda tangan sementara. Dalam
mode demo lokal, gambar hanya disimpan pada perangkat untuk keperluan QA.

## Mengosongkan seluruh cloud

Reset admin menghapus **seluruh akun Auth, pasangan, profil, aktivitas, dan objek
bucket `media`** tanpa menjatuhkan tabel, policy, trigger, atau fungsi. Berkas di
folder Google Drive tidak ikut dihapus karena berada di layanan Google yang terpisah.

1. Pastikan semua migrasi di atas sudah berhasil.
2. Salin `.env.admin.example` menjadi `.env.admin.local`, lalu isi secret key
   proyek. Jangan memakai awalan `VITE_` dan jangan memasukkan key ini ke build.
3. Jalankan dengan project ref yang tercantum pada URL Supabase:

   ```powershell
   npm run reset:cloud -- --confirm=PROJECT_REF
   ```

Skrip mengosongkan Storage melalui API terlebih dahulu, menghapus pengguna lewat
Auth Admin API, membersihkan seluruh tabel aplikasi, lalu memverifikasi semuanya
benar-benar kosong. Operasi ini permanen.

## Mengaktifkan Google Drive

Google Drive memerlukan **OAuth 2.0 Web Client ID**, bukan API key atau client
secret. Integrasi memakai scope terbatas `drive.file`, sehingga KisahKita hanya
dapat mengakses berkas yang dibuat melalui aplikasi.

1. Di Google Cloud Console, aktifkan **Google Drive API**.
2. Konfigurasikan OAuth consent screen dan tambahkan scope
   `https://www.googleapis.com/auth/drive.file`.
3. Buat OAuth Client ID bertipe **Web application**.
4. Tambahkan origin pengembangan `http://localhost:5173` dan domain produksi ke
   **Authorized JavaScript origins**.
5. Isi `.env.local`, lalu restart server:

   ```dotenv
   VITE_GOOGLE_DRIVE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   ```

Saat pengguna menekan **Hubungkan Google Drive**, KisahKita membuat satu folder,
menyimpan ID-nya pada ruang pasangan, dan mencoba membagikannya sebagai editor
ke email akun pasangan. Access token hanya disimpan sementara di memori browser.

## QA visual dan interaksi

Jalankan server dalam **mode lokal** di terminal pertama:

```bash
npm run dev
```

Lalu jalankan di terminal kedua:

```bash
npm run qa:visual
npm run qa:drive
```

Untuk smoke test Supabase asli, project harus sudah kosong dan server `5173`
harus memakai `.env.local` produksi. Skrip membuat dua akun terkonfirmasi,
melakukan pairing dan CRUD lintas dua browser, lalu menghapus seluruh data QA:

```powershell
npm run qa:production -- --confirm=PROJECT_REF
```

Guard project kosong dan argumen `--confirm` mencegah skrip ini menyentuh ruang
yang sudah berisi data pengguna.

Skrip QA memeriksa pengalihan rute tanpa sesi, pendaftaran dua akun, pembuatan
dan klaim kode pasangan, penolakan akun ketiga, persistensi setelah reload,
keluar akun, seluruh rute terproteksi, representasi lima ukuran layar, tema,
chat/PAP bergambar termasuk regresi overlap mobile, jurnal makan, upload galeri,
CRUD album umum dan album makanan, foto/catatan Food, penghapusan media, kalender,
kenangan, cerita, countdown, surat, foto/pin/penghapusan tempat, perjalanan, dan
ping lokasi.
Tangkapan layar serta laporan error ditulis ke `.qa-screenshots/`.

Variabel opsional:

```bash
QA_BASE_URL=http://127.0.0.1:5173 npm run qa:visual
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run qa:visual
```

Pada PowerShell:

```powershell
$env:QA_BASE_URL = 'http://127.0.0.1:5173'
$env:PLAYWRIGHT_CHROMIUM_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run qa:visual
```

## Struktur penting

```text
src/
  pages/AuthPage.tsx          antarmuka masuk, daftar, dan pemulihan
  pages/PairingPage.tsx       buat/gabung ruang pasangan
  services/authService.ts     mode lokal dan adapter Supabase
  services/syncService.ts     data aktivitas bersama + Supabase Realtime
  state/AuthState.tsx         sesi serta status pasangan
  state/AppState.tsx          state UI + hidrasi aktivitas bersama
  components/                 shell dan komponen bersama
  pages/                      layar fitur
  data/mockData.ts            konten contoh yang belum masuk backend
supabase/schema.sql           skema, RPC, grant, dan RLS
supabase/migrations/20260824_realtime_sync.sql  Realtime, PAP, notifikasi, reset
supabase/migrations/20260824_media_library.sql  album, media privat, foto/pin tempat
supabase/migrations/20260824_full_cloud.sql     preferensi cloud + reset admin
scripts/visual-qa.mjs         QA browser dan tangkapan layar
scripts/google-drive-qa.mjs   QA Google Drive tanpa menyentuh Drive asli
scripts/supabase-production-qa.mjs  QA dua akun pada Supabase asli + cleanup
scripts/reset-supabase.mjs    reset permanen Auth, database, dan Storage
```

Kontrol bersama dan alur utama memakai elemen HTML native, label aksesibel,
focus ring, dialog yang dapat ditutup dengan Escape, dan mode pengurangan
animasi. Font Quicksand, Nunito, dan Caveat disimpan lokal di `public/fonts/`
agar tampilan tidak bergantung pada CDN.

## Keamanan dan kesiapan rilis

- Semua tabel pasangan memakai Row Level Security dan hanya dapat dibaca oleh dua
  profil dalam ruang yang sama.
- Bucket `media` bersifat privat; aplikasi membuat signed URL sementara.
- Secret/service-role key hanya dibaca oleh skrip admin lokal dan dilarang memakai
  awalan `VITE_`.
- `.env.local`, `.env.admin.local`, keluaran QA, metadata Supabase CLI, hasil build,
  dan knowledge graph tidak masuk Git.
- Sebelum rilis: jalankan `npm run lint`, `npm run build`, `npm run qa:visual`, dan
  `npm run qa:drive`. Build Android/iOS direncanakan pada tahap berikutnya melalui
  wrapper native setelah pengujian produksi web selesai.
