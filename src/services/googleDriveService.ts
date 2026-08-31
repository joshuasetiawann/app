import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  googleNativeConfigurationError,
  prepareNativeGoogle,
} from './googleIdentityService';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GIS_SCRIPT_ID = 'google-identity-services';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const nativePlatform = Capacitor.getPlatform();
const isNative = Capacitor.isNativePlatform();

export const googleDriveConfigured = Boolean(
  GOOGLE_WEB_CLIENT_ID && (nativePlatform !== 'ios' || GOOGLE_IOS_CLIENT_ID),
);
export const MAX_DRIVE_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string; hint?: string }) => void;
}

interface GoogleOAuthApi {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: { type?: string }) => void;
  }) => GoogleTokenClient;
  revoke: (token: string, done?: () => void) => void;
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleOAuthApi } };
  }
}

let scriptPromise: Promise<void> | null = null;
let accessToken = '';
let tokenExpiresAt = 0;

function configurationError() {
  return googleNativeConfigurationError()
    ?? new Error('Google Drive belum dikonfigurasi. Isi VITE_GOOGLE_DRIVE_CLIENT_ID lalu restart aplikasi.');
}

export function prepareGoogleDrive() {
  if (!GOOGLE_WEB_CLIENT_ID) return Promise.reject(configurationError());
  if (isNative) {
    return prepareNativeGoogle();
  }
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(GIS_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');
    const loaded = () => window.google?.accounts.oauth2
      ? resolve()
      : reject(new Error('Google Identity Services belum siap. Coba muat ulang.'));
    script.addEventListener('load', loaded, { once: true });
    script.addEventListener('error', () => reject(new Error('Layanan Google belum dapat dimuat. Periksa koneksi internet.')), { once: true });
    if (!existing) {
      script.id = GIS_SCRIPT_ID;
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });
  return scriptPromise;
}

export function hasGoogleDriveSession() {
  return Boolean(accessToken && tokenExpiresAt > Date.now() + 30_000);
}

export async function connectGoogleDrive(loginHint?: string) {
  await prepareGoogleDrive();
  if (isNative) {
    try {
      const { result } = await SocialLogin.login({
        provider: 'google',
        options: { scopes: [DRIVE_SCOPE], forceRefreshToken: true },
      });
      if (result.responseType !== 'online' || !result.accessToken?.token) {
        throw new Error('Google belum memberikan token akses Drive. Periksa konfigurasi OAuth Android/iOS dan izinnya.');
      }
      accessToken = result.accessToken.token;
      const expires = result.accessToken.expires ? Date.parse(result.accessToken.expires) : Number.NaN;
      tokenExpiresAt = Number.isFinite(expires) ? expires : Date.now() + 3_600_000;
      return;
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      if (code === 'USER_CANCELLED') throw new Error('Pemilihan akun Google dibatalkan.');
      const message = error instanceof Error ? error.message : '';
      if (/10|developer_error|configuration/i.test(message)) {
        throw new Error('OAuth Google native belum cocok. Periksa package/bundle ID serta SHA-1 aplikasi di Google Cloud Console.');
      }
      throw error;
    }
  }
  if (!GOOGLE_WEB_CLIENT_ID || !window.google?.accounts.oauth2) throw configurationError();
  const oauth2 = window.google.accounts.oauth2;

  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Jendela Google tidak selesai. Coba hubungkan lagi.')), 120_000);
    const finish = (action: () => void) => {
      window.clearTimeout(timeout);
      action();
    };
    const client = oauth2.initTokenClient({
      client_id: GOOGLE_WEB_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          finish(() => reject(new Error(response.error_description || 'Izin Google Drive belum diberikan.')));
          return;
        }
        accessToken = response.access_token;
        tokenExpiresAt = Date.now() + (response.expires_in ?? 3_600) * 1_000;
        finish(resolve);
      },
      error_callback: (error) => finish(() => reject(new Error(error.type === 'popup_closed'
        ? 'Jendela Google ditutup sebelum selesai.'
        : 'Google Drive belum dapat dihubungkan.'))),
    });
    client.requestAccessToken({ prompt: accessToken ? '' : 'consent', hint: loginHint });
  });
}

export function disconnectGoogleDrive() {
  const token = accessToken;
  accessToken = '';
  tokenExpiresAt = 0;
  if (isNative) {
    void SocialLogin.logout({ provider: 'google' }).catch(() => undefined);
    return;
  }
  if (token && window.google?.accounts.oauth2) window.google.accounts.oauth2.revoke(token);
}

async function driveError(response: Response) {
  let detail = '';
  try {
    const payload = await response.json() as { error?: { message?: string } };
    detail = payload.error?.message ?? '';
  } catch {
    detail = await response.text().catch(() => '');
  }
  if (response.status === 401) {
    accessToken = '';
    tokenExpiresAt = 0;
    return new Error('Sesi Google Drive berakhir. Hubungkan kembali.');
  }
  if (response.status === 403) return new Error(detail || 'Akun Google ini belum memiliki izin ke folder pasangan.');
  if (response.status === 404) return new Error('Folder Google Drive tidak ditemukan atau sudah dipindahkan.');
  return new Error(detail || `Google Drive gagal merespons (${response.status}).`);
}

async function driveFetch<T>(url: string, init?: RequestInit): Promise<T> {
  if (!hasGoogleDriveSession()) throw new Error('Hubungkan Google Drive terlebih dahulu.');
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...init?.headers },
  });
  if (!response.ok) throw await driveError(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function createGoogleDriveFolder(spaceName: string) {
  const folder = await driveFetch<GoogleDriveFile>('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `KisahKita — ${spaceName.trim() || 'Ruang Kita'}`,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  return folder;
}

export async function listGoogleDriveFiles(folderId: string) {
  const params = new URLSearchParams({
    q: `'${folderId.replaceAll("'", "\\'")}' in parents and trashed = false`,
    orderBy: 'modifiedTime desc',
    pageSize: '100',
    fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink)',
  });
  const result = await driveFetch<{ files?: GoogleDriveFile[] }>(`https://www.googleapis.com/drive/v3/files?${params}`);
  return result.files ?? [];
}

export async function uploadGoogleDriveFile(file: File, folderId: string) {
  if (file.size > MAX_DRIVE_UPLOAD_BYTES) throw new Error('Ukuran maksimal upload langsung adalah 5 MB. Gunakan Google Drive untuk berkas yang lebih besar.');
  const boundary = `kisahkita_${crypto.randomUUID()}`;
  const body = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
    JSON.stringify({ name: file.name, parents: [folderId] }),
    `\r\n--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
    file,
    `\r\n--${boundary}--`,
  ]);
  return driveFetch<GoogleDriveFile>('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink', {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
}

export async function shareGoogleDriveFolder(folderId: string, email: string) {
  try {
    await driveFetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(folderId)}/permissions?sendNotificationEmail=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'user', role: 'writer', emailAddress: email.trim().toLowerCase() }),
    });
  } catch (error) {
    if (error instanceof Error && /already has access|existing permission/i.test(error.message)) return;
    throw error;
  }
}

export async function deleteGoogleDriveFile(fileId: string) {
  await driveFetch<void>(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' });
}

export function googleDriveFolderUrl(folderId: string) {
  return `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
}
