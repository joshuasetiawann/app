import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import {
  MAX_DRIVE_UPLOAD_BYTES,
  connectGoogleDrive,
  createGoogleDriveFolder,
  deleteGoogleDriveFile,
  disconnectGoogleDrive,
  googleDriveConfigured,
  googleDriveFolderUrl,
  hasGoogleDriveSession,
  listGoogleDriveFiles,
  prepareGoogleDrive,
  shareGoogleDriveFolder,
  uploadGoogleDriveFile,
  type GoogleDriveFile,
} from '../services/googleDriveService';

function formatBytes(value?: string) {
  const bytes = Number(value ?? 0);
  if (!bytes) return 'Google Docs / folder';
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function fileBadge(file: GoogleDriveFile) {
  if (file.mimeType === 'application/vnd.google-apps.folder') return '📁';
  if (file.mimeType.startsWith('image/')) return '🖼️';
  if (file.mimeType.startsWith('video/')) return '🎬';
  if (file.mimeType.includes('pdf')) return 'PDF';
  return file.name.split('.').pop()?.slice(0, 4).toUpperCase() || 'FILE';
}

function message(error: unknown) {
  return error instanceof Error ? error.message : 'Google Drive could not be accessed. Try again.';
}

export default function FilesPage() {
  const auth = useAuthState();
  const { viewport, toast } = useAppState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sdkReady, setSdkReady] = useState(!googleDriveConfigured);
  const [connected, setConnected] = useState(hasGoogleDriveSession);
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const folderId = auth.couple?.driveFolderId ?? '';
  const partnerEmail = auth.partner?.email ?? '';
  const compact = viewport === 'mobile';

  useEffect(() => {
    if (!googleDriveConfigured) return;
    let active = true;
    void prepareGoogleDrive()
      .then(() => active && setSdkReady(true))
      .catch((reason) => active && setError(message(reason)));
    return () => { active = false; };
  }, []);

  const loadFiles = async (targetFolder = folderId) => {
    if (!targetFolder) {
      setFiles([]);
      return;
    }
    setFiles(await listGoogleDriveFiles(targetFolder));
  };

  const connect = async () => {
    setBusy('connect');
    setError('');
    try {
      await connectGoogleDrive(auth.profile?.email);
      let targetFolder = folderId;
      let shareWarning = '';
      if (!targetFolder) {
        const folder = await createGoogleDriveFolder(auth.couple?.spaceName || 'Our Space');
        targetFolder = folder.id;
        await auth.saveDriveFolder(folder.id);
        if (partnerEmail) {
          try {
            await shareGoogleDriveFolder(folder.id, partnerEmail);
          } catch (reason) {
            shareWarning = ` Folder created, but the invitation to ${partnerEmail} failed: ${message(reason)}`;
          }
        }
      }
      await loadFiles(targetFolder);
      setConnected(true);
      if (shareWarning) setError(shareWarning.trim());
      else toast('Google Drive connected ✓');
    } catch (reason) {
      setConnected(false);
      setError(message(reason));
    } finally {
      setBusy('');
    }
  };

  const refresh = async () => {
    setBusy('refresh');
    setError('');
    try {
      await loadFiles();
      toast('File list refreshed ✓');
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy('');
    }
  };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selected.length || !folderId) return;
    if (selected.some((file) => file.size > MAX_DRIVE_UPLOAD_BYTES)) {
      setError('Each file can be up to 5 MB for direct upload from the app.');
      return;
    }
    setBusy('upload');
    setError('');
    try {
      for (const file of selected) await uploadGoogleDriveFile(file, folderId);
      await loadFiles();
      toast(`${selected.length} file${selected.length === 1 ? '' : 's'} saved to Google Drive ✓`);
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy('');
    }
  };

  const share = async () => {
    if (!folderId || !partnerEmail) return;
    setBusy('share');
    setError('');
    try {
      await shareGoogleDriveFolder(folderId, partnerEmail);
      toast(`Drive invitation sent to ${partnerEmail} ✓`);
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy('');
    }
  };

  const remove = async (file: GoogleDriveFile) => {
    if (!window.confirm(`Delete “${file.name}” from Google Drive?`)) return;
    setBusy(`delete:${file.id}`);
    setError('');
    try {
      await deleteGoogleDriveFile(file.id);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      toast('File deleted from Google Drive');
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy('');
    }
  };

  const disconnect = () => {
    disconnectGoogleDrive();
    setConnected(false);
    setFiles([]);
    setError('');
    toast('Google Drive disconnected from this device');
  };

  return (
    <ScrollColumn>
      <section style={pcss('border-radius:26px;background:linear-gradient(145deg,#EFF8F2,#F8F3FF);padding:20px;border:1px solid rgba(86,130,104,.12);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <div aria-hidden="true" style={pcss('width:48px;height:48px;border-radius:17px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:23px;box-shadow:0 7px 18px rgba(80,110,90,.1)')}>△</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Shared Google Drive</div>
              <span style={pcss(`padding:5px 9px;border-radius:100px;background:${connected ? '#D7EFE2' : 'rgba(255,255,255,.72)'};font:800 9px 'Nunito',sans-serif;color:${connected ? '#376858' : 'var(--mut,#A99A9E)'}`)}>
                {connected ? 'CONNECTED' : googleDriveConfigured ? 'NOT CONNECTED' : 'SETUP REQUIRED'}
              </span>
            </div>
            <div style={pcss("font:600 11px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
              One folder for both of you. The app only requests access to files created or selected through KisahKita—not your entire Drive.
            </div>
          </div>
        </div>

        {!googleDriveConfigured ? (
          <div style={pcss("margin-top:16px;padding:14px;border-radius:17px;background:rgba(255,255,255,.76);font:600 11px/1.6 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>
            Add <code>VITE_GOOGLE_DRIVE_CLIENT_ID</code> to <code>.env.local</code>, enable the Google Drive API, then restart the app. Supabase is still required to sync the folder ID between both devices.
          </div>
        ) : !connected ? (
          <div style={{ marginTop: 16 }}>
          <div style={pcss("font:600 10px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);text-align:center;margin:0 8px 10px") }>
            The first connection creates a new folder and sends an editor invitation to {partnerEmail || 'partner email'}.
          </div>
          <button
            type="button"
            disabled={!sdkReady || busy === 'connect'}
            onClick={() => void connect()}
            style={pcss(`width:100%;padding:13px 18px;border:0;border-radius:100px;background:#5C7C66;color:#fff;font:800 12px 'Nunito',sans-serif;cursor:${!sdkReady || busy ? 'wait' : 'pointer'};box-shadow:0 8px 18px rgba(72,110,84,.18)`)}
          >
            {!sdkReady ? 'Preparing Google…' : busy === 'connect' ? 'Connecting…' : 'Connect Google Drive'}
          </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <button type="button" disabled={Boolean(busy)} onClick={() => inputRef.current?.click()} style={pcss("padding:10px 15px;border:0;border-radius:100px;background:#5C7C66;color:#fff;font:800 11px 'Nunito',sans-serif;cursor:pointer")}>{busy === 'upload' ? 'Mengunggah…' : '⬆ Upload file'}</button>
            <button type="button" disabled={Boolean(busy)} onClick={() => void refresh()} style={pcss("padding:10px 15px;border:0;border-radius:100px;background:#fff;color:var(--ink2,#6B5B60);font:800 11px 'Nunito',sans-serif;cursor:pointer")}>{busy === 'refresh' ? 'Memuat…' : '↻ Refresh'}</button>
            {folderId && <a href={googleDriveFolderUrl(folderId)} target="_blank" rel="noreferrer" style={pcss("padding:10px 15px;border-radius:100px;background:#fff;color:var(--ink2,#6B5B60);font:800 11px 'Nunito',sans-serif;text-decoration:none")}>Open folder ↗</a>}
            {folderId && partnerEmail && <button type="button" disabled={Boolean(busy)} onClick={() => void share()} style={pcss("padding:10px 15px;border:0;border-radius:100px;background:#fff;color:var(--ink2,#6B5B60);font:800 11px 'Nunito',sans-serif;cursor:pointer")}>{busy === 'share' ? 'Sharing…' : 'Share with partner'}</button>}
            <button type="button" disabled={Boolean(busy)} onClick={disconnect} style={pcss("padding:10px 13px;border:0;background:transparent;color:var(--mut,#A99A9E);font:800 10.5px 'Nunito',sans-serif;cursor:pointer")}>Putuskan sesi</button>
          </div>
        )}

        <input ref={inputRef} type="file" multiple hidden aria-label="Choose a file for Google Drive" onChange={(event) => void upload(event)} />
        {error && <div role="alert" style={pcss("margin-top:13px;padding:11px 13px;border-radius:14px;background:#FFF0F0;color:#B84F67;font:700 10.5px/1.45 'Nunito',sans-serif")}>{error}</div>}
      </section>

      <section style={pcss('border-radius:24px;background:var(--sf,#fff);padding:6px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.07))' }}>
          <div>
            <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Your shared files</div>
            <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{connected ? `${files.length} item${files.length === 1 ? '' : 's'} · direct upload limit 5 MB` : 'Connect Drive to view this folder'}</div>
          </div>
          {folderId && <span style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E);align-self:center")}>Folder linked to your couple space</span>}
        </div>

        {connected && files.map((file) => (
          <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
            <div style={pcss("width:40px;height:40px;border-radius:13px;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font:800 9px 'Nunito',sans-serif;color:#5C3A42;flex:none")}>{fileBadge(file)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{file.name}</div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{formatBytes(file.size)}{file.modifiedTime ? ` · ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(file.modifiedTime))}` : ''}</div>
            </div>
            <a href={file.webViewLink || `https://drive.google.com/open?id=${encodeURIComponent(file.id)}`} target="_blank" rel="noreferrer" aria-label={`Open ${file.name}`} style={pcss("padding:7px 10px;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--ink2,#6B5B60);font:800 10px 'Nunito',sans-serif;text-decoration:none")}>Open</a>
            <button type="button" disabled={busy === `delete:${file.id}`} onClick={() => void remove(file)} aria-label={`Delete ${file.name}`} style={pcss("padding:7px 9px;border:0;border-radius:100px;background:transparent;color:#B45C70;font:800 10px 'Nunito',sans-serif;cursor:pointer")}>{busy === `delete:${file.id}` ? '…' : 'Delete'}</button>
          </div>
        ))}

        {connected && files.length === 0 && (
          <div style={pcss("padding:30px 12px;text-align:center;font:600 11.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <div aria-hidden="true" style={{ fontSize: 34, marginBottom: 8 }}>🗂️</div>
            This folder is empty. Upload your first picture, ticket, or document.
          </div>
        )}

        {!connected && (
          <div style={pcss("padding:28px 12px;text-align:center;font:600 11px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            {folderId ? 'Your couple folder is registered. Connect a Google account with access to open it.' : 'There is no Google Drive folder for this space yet.'}
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 10 }}>
        <div style={pcss("padding:14px 16px;border-radius:18px;background:var(--sf2,#FFF4F1);font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
          🔐 The Google token stays temporarily in browser memory and is requested again after it expires.
        </div>
        <div style={pcss("padding:14px 16px;border-radius:18px;background:var(--sf2,#FFF4F1);font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
          ☁️ Supabase stores the account and folder ID; file contents remain in the folder owner's Google Drive.
        </div>
      </div>
    </ScrollColumn>
  );
}
