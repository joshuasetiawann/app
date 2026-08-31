import { createClient, type User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { prepareNativeGoogle } from './googleIdentityService';

export type AuthMode = 'local' | 'supabase';

export interface AccountProfile {
  id: string;
  email: string;
  name: string;
  nickname: string;
  avatarEmoji: string;
  avatarUrl: string;
  city: string;
  country: string;
  countryFlag: string;
  timezone: string;
  coupleId: string | null;
}

export interface CoupleSpace {
  id: string;
  spaceName: string;
  coupleCode: string;
  startedAt: string;
  inviteExpiresAt: string | null;
  pairedAt: string | null;
  driveFolderId: string | null;
  memberIds: string[];
}

export interface AuthSnapshot {
  profile: AccountProfile;
  couple: CoupleSpace | null;
  partner: AccountProfile | null;
}

export interface ProfilePatch {
  name?: string;
  nickname?: string;
  avatarEmoji?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  countryFlag?: string;
  timezone?: string;
}

export interface SignUpOutcome {
  snapshot: AuthSnapshot | null;
  needsEmailConfirmation: boolean;
}

export interface LocationPing {
  profileId: string;
  coupleId: string;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  speedKmh: number | null;
  recordedAt: string;
}

export interface LocationPingInput {
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
  speedKmh?: number | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
  || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabase = supabaseUrl && supabasePublicKey
  ? createClient(supabaseUrl, supabasePublicKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

// Shared data services reuse the exact authenticated client/session.
export const supabaseClient = supabase;

export const authMode: AuthMode = supabase ? 'supabase' : 'local';

const LOCAL_DB_KEY = 'kk-auth-db-v1';
const LOCAL_SESSION_KEY = 'kk-auth-session-v1';
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface LocalUser extends AccountProfile {
  salt: string;
  passwordHash: string;
}

type LocalCouple = CoupleSpace;

interface LocalDatabase {
  version: 1;
  users: LocalUser[];
  couples: LocalCouple[];
  locationPings: LocationPing[];
}

interface ProfileRow {
  id: string;
  couple_id: string | null;
  email: string | null;
  name: string;
  nickname: string | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  country_flag: string | null;
  timezone: string;
}

interface CoupleRow {
  id: string;
  space_name: string;
  couple_code: string;
  started_at: string;
  invite_expires_at: string | null;
  paired_at: string | null;
  drive_folder_id: string | null;
}

function emptyDatabase(): LocalDatabase {
  return { version: 1, users: [], couples: [], locationPings: [] };
}

function readDatabase(): LocalDatabase {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_DB_KEY) ?? '') as LocalDatabase;
    if (parsed.version === 1 && Array.isArray(parsed.users) && Array.isArray(parsed.couples)) {
      return {
        ...parsed,
        users: parsed.users.map((user) => ({ ...user, avatarUrl: user.avatarUrl ?? '' })),
        couples: parsed.couples.map((couple) => ({ ...couple, driveFolderId: couple.driveFolderId ?? null })),
        locationPings: Array.isArray(parsed.locationPings) ? parsed.locationPings : [],
      };
    }
  } catch {
    // A corrupt local demo store should never lock the user out of the app.
  }
  return emptyDatabase();
}

function writeDatabase(database: LocalDatabase) {
  window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(database));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

function normalizeDriveFolderId(folderId: string) {
  const value = folderId.trim();
  if (!/^[A-Za-z0-9_-]{10,255}$/.test(value)) throw new Error('ID folder Google Drive belum valid.');
  return value;
}

function bytesToBase64(bytes: Uint8Array) {
  let value = '';
  for (const byte of bytes) value += String.fromCharCode(byte);
  return window.btoa(value);
}

function base64ToBytes(value: string) {
  const decoded = window.atob(value);
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

async function passwordDigest(password: string, salt: string) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: base64ToBytes(salt), iterations: 120_000 },
    material,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function createSalt() {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
}

function createInviteCode(database: LocalDatabase) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const token = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
    const code = `KK-${token.slice(0, 4)}-${token.slice(4)}`;
    if (!database.couples.some((couple) => couple.coupleCode === code)) return code;
  }
  throw new Error('Kode undangan belum bisa dibuat. Coba lagi.');
}

function publicLocalProfile(user: LocalUser): AccountProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    nickname: user.nickname,
    avatarEmoji: user.avatarEmoji,
    avatarUrl: user.avatarUrl,
    city: user.city,
    country: user.country,
    countryFlag: user.countryFlag,
    timezone: user.timezone,
    coupleId: user.coupleId,
  };
}

function localSnapshot(database: LocalDatabase, user: LocalUser): AuthSnapshot {
  const couple = user.coupleId
    ? database.couples.find((item) => item.id === user.coupleId) ?? null
    : null;
  const partner = couple
    ? database.users.find((item) => item.id !== user.id && couple.memberIds.includes(item.id)) ?? null
    : null;
  return {
    profile: publicLocalProfile(user),
    couple,
    partner: partner ? publicLocalProfile(partner) : null,
  };
}

function currentLocalUser(database: LocalDatabase) {
  const userId = window.localStorage.getItem(LOCAL_SESSION_KEY);
  return database.users.find((user) => user.id === userId) ?? null;
}

function localRestore(): AuthSnapshot | null {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user) {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
    return null;
  }
  return localSnapshot(database, user);
}

async function localSignUp(emailInput: string, password: string, nameInput: string): Promise<SignUpOutcome> {
  const email = normalizeEmail(emailInput);
  const name = nameInput.trim();
  const database = readDatabase();
  if (database.users.some((user) => user.email === email)) {
    throw new Error('Email ini sudah terdaftar. Coba masuk.');
  }
  const salt = createSalt();
  const user: LocalUser = {
    id: crypto.randomUUID(),
    email,
    name,
    nickname: '',
    avatarEmoji: '🙂',
    avatarUrl: '',
    city: '',
    country: 'Indonesia',
    countryFlag: '🇮🇩',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
    coupleId: null,
    salt,
    passwordHash: await passwordDigest(password, salt),
  };
  database.users.push(user);
  writeDatabase(database);
  window.localStorage.setItem(LOCAL_SESSION_KEY, user.id);
  return { snapshot: localSnapshot(database, user), needsEmailConfirmation: false };
}

async function localSignIn(emailInput: string, password: string) {
  const database = readDatabase();
  const user = database.users.find((item) => item.email === normalizeEmail(emailInput));
  if (!user || (await passwordDigest(password, user.salt)) !== user.passwordHash) {
    throw new Error('Email atau password belum cocok.');
  }
  window.localStorage.setItem(LOCAL_SESSION_KEY, user.id);
  return localSnapshot(database, user);
}

async function localResetPassword(emailInput: string, newPassword?: string) {
  if (!newPassword) throw new Error('Masukkan password baru untuk mode lokal.');
  const database = readDatabase();
  const user = database.users.find((item) => item.email === normalizeEmail(emailInput));
  if (!user) throw new Error('Akun dengan email itu belum ada di perangkat ini.');
  const salt = createSalt();
  user.salt = salt;
  user.passwordHash = await passwordDigest(newPassword, salt);
  writeDatabase(database);
}

async function localUpdatePassword(password: string) {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  const salt = createSalt();
  user.salt = salt;
  user.passwordHash = await passwordDigest(password, salt);
  writeDatabase(database);
}

function localUpdateProfile(patch: ProfilePatch) {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  Object.assign(user, patch);
  writeDatabase(database);
  return localSnapshot(database, user);
}

function localCreateSpace(spaceNameInput: string, startedAt: string) {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  if (user.coupleId) return localSnapshot(database, user);
  const now = new Date();
  const couple: LocalCouple = {
    id: crypto.randomUUID(),
    spaceName: spaceNameInput.trim() || 'Ruang Kita',
    coupleCode: createInviteCode(database),
    startedAt,
    inviteExpiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
    pairedAt: null,
    driveFolderId: null,
    memberIds: [user.id],
  };
  user.coupleId = couple.id;
  database.couples.push(couple);
  writeDatabase(database);
  return localSnapshot(database, user);
}

function localJoinSpace(codeInput: string) {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  const couple = database.couples.find((item) => normalizeCode(item.coupleCode) === normalizeCode(codeInput));
  if (!couple) throw new Error('Kode undangan tidak ditemukan. Periksa lagi huruf dan angkanya.');
  if (user.coupleId === couple.id) return localSnapshot(database, user);
  if (user.coupleId) throw new Error('Akun ini sudah terhubung dengan pasangan lain.');
  if (couple.memberIds.length >= 2) throw new Error('Ruang ini sudah lengkap untuk dua orang.');
  if (couple.inviteExpiresAt && new Date(couple.inviteExpiresAt).getTime() < Date.now()) {
    throw new Error('Kode undangan sudah kedaluwarsa. Minta pasangan membuat kode baru.');
  }
  couple.memberIds.push(user.id);
  couple.pairedAt = new Date().toISOString();
  couple.inviteExpiresAt = null;
  user.coupleId = couple.id;
  writeDatabase(database);
  return localSnapshot(database, user);
}

function localRefreshInvite() {
  const database = readDatabase();
  const user = currentLocalUser(database);
  if (!user?.coupleId) throw new Error('Buat ruang terlebih dahulu.');
  const couple = database.couples.find((item) => item.id === user.coupleId);
  if (!couple) throw new Error('Ruang pasangan tidak ditemukan.');
  if (couple.memberIds.length >= 2) return localSnapshot(database, user);
  couple.coupleCode = createInviteCode(database);
  couple.inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
  writeDatabase(database);
  return localSnapshot(database, user);
}

async function localContinueDemo() {
  const database = readDatabase();
  let me = database.users.find((user) => user.email === 'joshua@demo.kisahkita');
  if (!me) {
    const salt = createSalt();
    const partnerSalt = createSalt();
    const coupleId = crypto.randomUUID();
    me = {
      id: crypto.randomUUID(), email: 'joshua@demo.kisahkita', name: 'Joshua', nickname: 'Jo',
      avatarEmoji: '🧑🏻', city: 'Jakarta', country: 'Indonesia', countryFlag: '🇮🇩',
      avatarUrl: '',
      timezone: 'Asia/Jakarta', coupleId, salt, passwordHash: await passwordDigest('kisahkita-demo', salt),
    };
    const partner: LocalUser = {
      id: crypto.randomUUID(), email: 'mia@demo.kisahkita', name: 'Mia', nickname: 'Mi',
      avatarEmoji: '👩🏻', city: 'Taipei', country: 'Taiwan', countryFlag: '🇹🇼',
      avatarUrl: '',
      timezone: 'Asia/Taipei', coupleId, salt: partnerSalt,
      passwordHash: await passwordDigest('kisahkita-demo', partnerSalt),
    };
    database.users.push(me, partner);
    database.couples.push({
      id: coupleId,
      spaceName: 'Ruang Joshua & Mia',
      coupleCode: createInviteCode(database),
      startedAt: '2026-01-14',
      inviteExpiresAt: null,
      pairedAt: new Date().toISOString(),
      driveFolderId: null,
      memberIds: [me.id, partner.id],
    });
    writeDatabase(database);
  }
  window.localStorage.setItem(LOCAL_SESSION_KEY, me.id);
  return localSnapshot(database, me);
}

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message)) return 'Email atau password belum cocok.';
  if (/email not confirmed/i.test(message)) return 'Email belum diverifikasi. Cek inbox kamu dulu.';
  if (/user already registered/i.test(message)) return 'Email ini sudah terdaftar. Coba masuk.';
  if (/password should be at least/i.test(message)) return 'Password masih terlalu pendek.';
  if (/invalid or (expired|unavailable) couple code|invalid couple code/i.test(message)) return 'Kode undangan tidak valid, sudah kedaluwarsa, atau sudah dipakai.';
  if (/couple is already paired/i.test(message)) return 'Ruang ini sudah lengkap untuk dua orang.';
  if (/profile already belongs to a different couple/i.test(message)) return 'Akun ini sudah terhubung dengan pasangan lain.';
  if (/relationship start date is invalid/i.test(message)) return 'Tanggal hubungan belum valid.';
  if (/space name must contain/i.test(message)) return 'Nama ruang perlu berisi 1–80 karakter.';
  if (/authentication required/i.test(message)) return 'Sesi sudah berakhir. Silakan masuk lagi.';
  if (/profile not found/i.test(message)) return 'Profil akun belum siap. Muat ulang lalu coba lagi.';
  if (/provider.*(disabled|enabled|unsupported)/i.test(message)) return 'Login Google belum diaktifkan di Supabase.';
  return message;
}

function throwRemoteError(error: { message: string } | null) {
  if (error) throw new Error(friendlyError(error.message));
}

function mapRemoteProfile(row: ProfileRow, email = ''): AccountProfile {
  return {
    id: row.id,
    email: email || row.email || '',
    name: row.name,
    nickname: row.nickname ?? '',
    avatarEmoji: row.avatar_emoji ?? '🙂',
    avatarUrl: row.avatar_url ?? '',
    city: row.city ?? '',
    country: row.country ?? '',
    countryFlag: row.country_flag ?? '',
    timezone: row.timezone,
    coupleId: row.couple_id,
  };
}

async function remoteSnapshot(userInput?: User): Promise<AuthSnapshot | null> {
  if (!supabase) return null;
  let user = userInput;
  if (!user) {
    const { data, error } = await supabase.auth.getSession();
    throwRemoteError(error);
    user = data.session?.user;
  }
  if (!user) return null;

  let profileRow: ProfileRow | null = null;
  for (let attempt = 0; attempt < 3 && !profileRow; attempt += 1) {
    const { data, error } = await supabase.from('profiles').select('id,couple_id,email,name,nickname,avatar_emoji,avatar_url,city,country,country_flag,timezone').eq('id', user.id).maybeSingle<ProfileRow>();
    throwRemoteError(error);
    profileRow = data;
    if (!profileRow) await new Promise((resolve) => window.setTimeout(resolve, 150));
  }
  if (!profileRow) throw new Error('Profil belum berhasil dibuat. Muat ulang halaman lalu coba lagi.');
  const profile = mapRemoteProfile(profileRow, user.email ?? '');
  if (!profile.coupleId) return { profile, couple: null, partner: null };

  const [coupleResult, membersResult] = await Promise.all([
    supabase.from('couples').select('id,space_name,couple_code,started_at,invite_expires_at,paired_at,drive_folder_id').eq('id', profile.coupleId).single<CoupleRow>(),
    supabase.from('profiles').select('id,couple_id,email,name,nickname,avatar_emoji,avatar_url,city,country,country_flag,timezone').eq('couple_id', profile.coupleId).returns<ProfileRow[]>(),
  ]);
  throwRemoteError(coupleResult.error);
  throwRemoteError(membersResult.error);
  const members = membersResult.data ?? [];
  const partnerRow = members.find((member) => member.id !== profile.id) ?? null;
  const row = coupleResult.data;
  if (!row) throw new Error('Ruang pasangan belum dapat dimuat. Coba lagi.');
  return {
    profile,
    partner: partnerRow ? mapRemoteProfile(partnerRow) : null,
    couple: {
      id: row.id,
      spaceName: row.space_name,
      coupleCode: row.couple_code,
      startedAt: row.started_at,
      inviteExpiresAt: row.invite_expires_at,
      pairedAt: row.paired_at,
      driveFolderId: row.drive_folder_id,
      memberIds: members.map((member) => member.id),
    },
  };
}

export async function restoreAuth() {
  return supabase ? remoteSnapshot() : localRestore();
}

export async function signUp(email: string, password: string, name: string): Promise<SignUpOutcome> {
  if (!supabase) return localSignUp(email, password, name);
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
    options: { data: { name: name.trim(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } },
  });
  throwRemoteError(error);
  if (!data.session) return { snapshot: null, needsEmailConfirmation: true };
  return { snapshot: await remoteSnapshot(data.user ?? undefined), needsEmailConfirmation: false };
}

export async function signIn(email: string, password: string) {
  if (!supabase) return localSignIn(email, password);
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  throwRemoteError(error);
  return remoteSnapshot(data.user ?? undefined);
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Login Google membutuhkan koneksi Supabase.');

  if (!Capacitor.isNativePlatform()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: { prompt: 'select_account' },
      },
    });
    throwRemoteError(error);
    return null;
  }

  await prepareNativeGoogle();
  try {
    const { result } = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['email', 'profile'] },
    });
    if (result.responseType !== 'online' || !result.idToken) {
      throw new Error('Google tidak mengirim identitas akun. Coba pilih akun lagi.');
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.idToken,
    });
    throwRemoteError(error);
    return remoteSnapshot(data.user ?? undefined);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
    if (code === 'USER_CANCELLED') throw new Error('Pemilihan akun Google dibatalkan.');
    const message = error instanceof Error ? error.message : '';
    if (/28444|developer_error|configuration/i.test(message)) {
      throw new Error('OAuth Google Android belum cocok. Periksa package name, SHA-1, dan Web Client ID.');
    }
    throw error;
  }
}

export async function signOut() {
  if (!supabase) {
    window.localStorage.removeItem(LOCAL_SESSION_KEY);
    return;
  }
  const { error } = await supabase.auth.signOut();
  throwRemoteError(error);
}

export async function resetPassword(email: string, newPassword?: string) {
  if (!supabase) return localResetPassword(email, newPassword);
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: Capacitor.isNativePlatform()
      ? 'kisahkita://auth?mode=reset'
      : `${window.location.origin}/auth?mode=reset`,
  });
  throwRemoteError(error);
}

export async function completeMobileAuthRedirect(callbackUrl: string) {
  if (!supabase) return false;
  const url = new URL(callbackUrl);
  if (url.protocol !== 'kisahkita:' || url.hostname !== 'auth') return false;

  const params = new URLSearchParams(url.search);
  const fragment = new URLSearchParams(url.hash.replace(/^#/, ''));
  const read = (key: string) => params.get(key) || fragment.get(key);
  const code = read('code');
  const accessToken = read('access_token');
  const refreshToken = read('refresh_token');
  const recovery = read('type') === 'recovery' || params.get('mode') === 'reset';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    throwRemoteError(error);
  } else if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    throwRemoteError(error);
  }

  window.history.replaceState(null, '', recovery ? '/auth?mode=reset' : '/auth');
  window.dispatchEvent(new PopStateEvent('popstate'));
  return recovery;
}

export async function updatePassword(password: string) {
  if (!supabase) return localUpdatePassword(password);
  const { error } = await supabase.auth.updateUser({ password });
  throwRemoteError(error);
}

export async function updateAccountProfile(patch: ProfilePatch) {
  if (!supabase) return localUpdateProfile(patch);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  throwRemoteError(userError);
  if (!userData.user) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  const payload = {
    name: patch.name,
    nickname: patch.nickname,
    avatar_emoji: patch.avatarEmoji,
    avatar_url: patch.avatarUrl,
    city: patch.city,
    country: patch.country,
    country_flag: patch.countryFlag,
    timezone: patch.timezone,
  };
  const { error } = await supabase.from('profiles').update(payload).eq('id', userData.user.id);
  throwRemoteError(error);
  return remoteSnapshot(userData.user);
}

export async function createCoupleSpace(spaceName: string, startedAt: string) {
  if (!supabase) return localCreateSpace(spaceName, startedAt);
  const { error } = await supabase.rpc('create_couple_space', { p_space_name: spaceName.trim() || 'Ruang Kita', p_started_at: startedAt });
  throwRemoteError(error);
  const snapshot = await remoteSnapshot();
  if (!snapshot) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  return snapshot;
}

export async function joinCoupleSpace(code: string) {
  if (!supabase) return localJoinSpace(code);
  const { error } = await supabase.rpc('join_couple_by_code', { p_code: normalizeCode(code) });
  throwRemoteError(error);
  const snapshot = await remoteSnapshot();
  if (!snapshot) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  return snapshot;
}

export async function refreshCoupleInvite() {
  if (!supabase) return localRefreshInvite();
  const snapshotBeforeRefresh = await remoteSnapshot();
  if (!snapshotBeforeRefresh?.couple) throw new Error('Buat ruang terlebih dahulu.');
  const { error } = await supabase.rpc('refresh_couple_invite', {
    p_current_code: snapshotBeforeRefresh.couple.coupleCode,
  });
  throwRemoteError(error);
  const snapshot = await remoteSnapshot();
  if (!snapshot) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  return snapshot;
}

export async function updateCoupleDriveFolder(folderIdInput: string) {
  const folderId = normalizeDriveFolderId(folderIdInput);
  if (!supabase) {
    const database = readDatabase();
    const user = currentLocalUser(database);
    if (!user?.coupleId) throw new Error('Hubungkan akun dengan pasangan terlebih dahulu.');
    const couple = database.couples.find((item) => item.id === user.coupleId);
    if (!couple) throw new Error('Ruang pasangan tidak ditemukan.');
    couple.driveFolderId = folderId;
    writeDatabase(database);
    return localSnapshot(database, user);
  }

  const current = await remoteSnapshot();
  if (!current?.couple) throw new Error('Hubungkan akun dengan pasangan terlebih dahulu.');
  const { error } = await supabase
    .from('couples')
    .update({ drive_folder_id: folderId, drive_connected_at: new Date().toISOString() })
    .eq('id', current.couple.id);
  throwRemoteError(error);
  const snapshot = await remoteSnapshot();
  if (!snapshot) throw new Error('Sesi sudah berakhir. Silakan masuk lagi.');
  return snapshot;
}

export async function continueDemo() {
  if (supabase) throw new Error('Mode demo hanya tersedia tanpa konfigurasi Supabase.');
  return localContinueDemo();
}

export async function publishLocationPing(input: LocationPingInput): Promise<LocationPing> {
  if (!supabase) {
    const database = readDatabase();
    const user = currentLocalUser(database);
    if (!user?.coupleId) throw new Error('Hubungkan akun dengan pasangan terlebih dahulu.');
    const ping: LocationPing = {
      profileId: user.id,
      coupleId: user.coupleId,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracyM: input.accuracyM ?? null,
      speedKmh: input.speedKmh ?? null,
      recordedAt: new Date().toISOString(),
    };
    database.locationPings = [
      ping,
      ...database.locationPings.filter((item) => item.profileId !== user.id),
    ].slice(0, 20);
    writeDatabase(database);
    return ping;
  }

  const snapshot = await remoteSnapshot();
  if (!snapshot?.couple) throw new Error('Hubungkan akun dengan pasangan terlebih dahulu.');
  const payload = {
    profile_id: snapshot.profile.id,
    couple_id: snapshot.couple.id,
    lat: input.latitude,
    lng: input.longitude,
    accuracy_m: input.accuracyM ?? null,
    speed_kmh: input.speedKmh ?? null,
    recorded_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('location_pings')
    .upsert(payload, { onConflict: 'profile_id' })
    .select('profile_id,couple_id,lat,lng,accuracy_m,speed_kmh,recorded_at')
    .single();
  throwRemoteError(error);
  if (!data) throw new Error('Lokasi belum berhasil disimpan.');
  return {
    profileId: data.profile_id,
    coupleId: data.couple_id,
    latitude: data.lat,
    longitude: data.lng,
    accuracyM: data.accuracy_m,
    speedKmh: data.speed_kmh,
    recordedAt: data.recorded_at,
  };
}

export async function getLatestLocationPings(): Promise<{ mine: LocationPing | null; partner: LocationPing | null }> {
  if (!supabase) {
    const database = readDatabase();
    const user = currentLocalUser(database);
    if (!user?.coupleId) return { mine: null, partner: null };
    const couplePings = database.locationPings.filter((item) => item.coupleId === user.coupleId);
    return {
      mine: couplePings.find((item) => item.profileId === user.id) ?? null,
      partner: couplePings.find((item) => item.profileId !== user.id) ?? null,
    };
  }

  const snapshot = await remoteSnapshot();
  if (!snapshot?.couple) return { mine: null, partner: null };
  const { data, error } = await supabase
    .from('location_pings')
    .select('profile_id,couple_id,lat,lng,accuracy_m,speed_kmh,recorded_at')
    .eq('couple_id', snapshot.couple.id)
    .order('recorded_at', { ascending: false })
    .limit(20);
  throwRemoteError(error);
  const pings = (data ?? []).map((row) => ({
    profileId: row.profile_id as string,
    coupleId: row.couple_id as string,
    latitude: row.lat as number,
    longitude: row.lng as number,
    accuracyM: row.accuracy_m as number | null,
    speedKmh: row.speed_kmh as number | null,
    recordedAt: row.recorded_at as string,
  }));
  return {
    mine: pings.find((item) => item.profileId === snapshot.profile.id) ?? null,
    partner: pings.find((item) => item.profileId !== snapshot.profile.id) ?? null,
  };
}

export function subscribeToLocationPings(coupleId: string, listener: () => void) {
  if (!supabase) {
    const onStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_DB_KEY) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }
  const channel = supabase
    .channel(`locations:${coupleId}:${crypto.randomUUID()}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'location_pings', filter: `couple_id=eq.${coupleId}` },
      listener,
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

export function subscribeToAuthChanges(listener: (recovery: boolean) => void) {
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      queueMicrotask(() => listener(event === 'PASSWORD_RECOVERY'));
    });
    return () => data.subscription.unsubscribe();
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_DB_KEY || event.key === LOCAL_SESSION_KEY) listener(false);
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function subscribeToAccountData(
  profileId: string,
  coupleId: string | null,
  listener: () => void,
) {
  if (!supabase) return () => undefined;

  let timer: number | undefined;
  const notify = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(listener, 80);
  };
  let channel = supabase
    .channel(`account:${profileId}:${crypto.randomUUID()}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, notify);

  if (coupleId) {
    channel = channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` },
      notify,
    );
  }
  channel.subscribe();

  return () => {
    window.clearTimeout(timer);
    void supabase.removeChannel(channel);
  };
}
