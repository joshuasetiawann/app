import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { THEMES } from '../lib/theme';
import {
  enableDeviceNotifications,
  getDeviceNotificationPermission,
  type DeviceNotificationPermission,
} from '../lib/native';

interface SettingRow {
  icon: string;
  label: string;
  value: string;
  onClick?: () => void;
}

interface SettingGroup {
  title: string;
  rows: SettingRow[];
}

function localDataSize() {
  let characters = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith('kk-')) characters += key.length + (window.localStorage.getItem(key)?.length ?? 0);
  }
  const bytes = characters * 2;
  return bytes < 1_024 ? `${bytes} B` : `${(bytes / 1_024).toFixed(1)} KB`;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, dark, animLevel, quietHours, setQuietHours, unreadCount, syncStatus, syncError, resetSharedData, toast } = useAppState();
  const auth = useAuthState();
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [resetPending, setResetPending] = useState(false);
  const [resetError, setResetError] = useState('');
  const [pushPermission, setPushPermission] = useState<DeviceNotificationPermission>('default');
  const [quietOpen, setQuietOpen] = useState(false);
  const [quietDraft, setQuietDraft] = useState(quietHours);
  const startedAt = auth.couple?.startedAt;
  const relationshipDate = startedAt
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(`${startedAt}T00:00:00`))
    : 'Not set';

  useEffect(() => {
    void getDeviceNotificationPermission().then(setPushPermission).catch(() => setPushPermission('unsupported'));
  }, []);

  const enableNotifications = async () => {
    try {
      const permission = await enableDeviceNotifications();
      setPushPermission(permission);
      if (permission === 'granted') toast('Device notifications enabled 🔔');
      else toast(permission === 'denied' ? 'Notifications are blocked in device settings' : 'Notification permission was not granted');
    } catch {
      setPushPermission('unsupported');
      toast('Device notification settings could not be opened');
    }
  };

  const saveQuietHours = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuietHours(quietDraft);
    setQuietOpen(false);
    toast(`Quiet hours ${quietDraft.from}–${quietDraft.to} saved 🌙`);
  };

  const downloadBackup = () => {
    const data: Record<string, string> = {};
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith('kk-')) data[key] = window.localStorage.getItem(key) || '';
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kisahkita-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('Local backup downloaded 💾');
  };

  const groups: SettingGroup[] = [
    {
      title: 'ACCOUNT',
      rows: [
        { icon: auth.profile?.avatarEmoji || '🙂', label: 'Profile', value: auth.profile?.name || 'Not set', onClick: () => navigate('/profile') },
        { icon: '📧', label: 'Email', value: auth.profile?.email || 'Not available', onClick: () => navigate('/profile') },
        { icon: '🛡️', label: 'Account storage', value: auth.mode === 'supabase' ? 'Supabase cloud' : 'Local on device' },
      ],
    },
    {
      title: 'PARTNER',
      rows: [
        { icon: '💗', label: 'Partner', value: auth.partner ? `${auth.partner.name} · connected` : auth.couple ? 'Waiting for partner' : 'Not connected', onClick: () => navigate('/pair') },
        { icon: '🏠', label: 'Space name', value: auth.couple?.spaceName || 'Not created', onClick: () => navigate('/pair') },
        { icon: '📅', label: 'Relationship date', value: relationshipDate, onClick: () => navigate('/pair') },
        { icon: '🔗', label: 'Partner code', value: auth.couple?.coupleCode || 'Create a space first', onClick: () => navigate('/pair') },
      ],
    },
    {
      title: 'NOTIFICATIONS',
      rows: [
        { icon: '🔔', label: 'Notification center', value: unreadCount ? `${unreadCount} unread` : 'All read', onClick: () => navigate('/notif') },
        { icon: '📲', label: 'Device notification permission', value: pushPermission === 'granted' ? 'Active' : pushPermission === 'denied' ? 'Blocked by device' : pushPermission === 'unsupported' ? 'Not supported' : 'Tap to enable', onClick: () => void enableNotifications() },
        { icon: '🌙', label: 'Quiet hours', value: `${quietHours.from}–${quietHours.to}`, onClick: () => { setQuietDraft(quietHours); setQuietOpen((value) => !value); } },
      ],
    },
    {
      title: 'APPEARANCE',
      rows: [
        { icon: THEMES[theme].icon, label: 'Appearance', value: THEMES[theme].label, onClick: () => navigate('/theme') },
        { icon: dark ? '🌙' : '☀️', label: 'Color mode', value: dark ? 'Dark' : 'Light', onClick: () => navigate('/theme') },
        { icon: '✨', label: 'Motion level', value: animLevel === 'full' ? 'Full' : animLevel === 'calm' ? 'Calm' : 'Power saver', onClick: () => navigate('/theme') },
      ],
    },
    {
      title: 'DATA',
      rows: [
        { icon: '💾', label: auth.mode === 'supabase' ? 'Device technical cache' : 'KisahKita data on device', value: auth.mode === 'supabase' ? 'Session + offline queue' : localDataSize() },
        auth.mode === 'supabase'
          ? { icon: '☁️', label: 'Primary data source', value: 'Supabase cloud' }
          : { icon: '📦', label: 'Download local backup', value: 'JSON', onClick: downloadBackup },
        { icon: '🔐', label: 'Account & couple space', value: auth.mode === 'supabase' ? 'Stored in Supabase' : 'This browser only' },
        { icon: '📍', label: 'Live location', value: auth.mode === 'supabase' ? 'Cloud when enabled' : 'This browser only', onClick: () => navigate('/location') },
        { icon: '△', label: 'Google Drive', value: auth.couple?.driveFolderId ? 'Couple folder registered' : 'Optional', onClick: () => navigate('/files') },
        { icon: '☁️', label: 'Chat, schedule & journals', value: auth.mode === 'supabase' ? syncStatus === 'synced' ? 'Realtime active' : syncStatus === 'error' ? 'Needs attention' : 'Syncing…' : 'Stored locally' },
        { icon: '🖼️', label: 'Profile & gallery pictures', value: 'Manage media', onClick: () => navigate('/profile') },
      ],
    },
  ];

  const logout = async () => {
    setLogoutPending(true);
    setLogoutError('');
    try {
      await auth.signOutAccount();
      navigate('/auth', { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Could not sign out. Try again.');
    } finally {
      setLogoutPending(false);
    }
  };

  const resetRoomData = async () => {
    if (!auth.couple || !window.confirm('Clear all activity from this space? Chat, pictures, food journal entries, schedules, notifications, locations, and shared content will be permanently deleted. Accounts, profiles, partner connection, and the Google Drive folder will remain.')) return;
    setResetPending(true);
    setResetError('');
    try {
      await resetSharedData();
      toast('Shared activity cleared');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Shared data could not be cleared.');
    } finally {
      setResetPending(false);
    }
  };

  return (
    <ScrollColumn>
      {groups.map((group) => (
        <section key={group.title}>
          <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:2px 4px 9px")}>{group.title}</div>
          <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            {group.rows.map((row) => (
              <button
                type="button"
                key={row.label}
                disabled={!row.onClick}
                style={pcss(`display:flex;width:100%;align-items:center;gap:12px;padding:13px 0;border:0;border-bottom:1px solid var(--ln,rgba(74,74,74,.06));background:transparent;cursor:${row.onClick ? 'pointer' : 'default'};text-align:left;color:inherit;font:inherit;appearance:none;opacity:1`)}
                onClick={row.onClick}
              >
                <span style={{ fontSize: 15, width: 22, textAlign: 'center', flex: 'none' }}>{row.icon}</span>
                <span style={{ flex: 1, minWidth: 0, font: '700 12.5px "Nunito",sans-serif', color: 'var(--ink,#4A4A4A)' }}>{row.label}</span>
                <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none;max-width:46%;text-align:right;overflow-wrap:anywhere")}>{row.value}</span>
                {row.onClick && <span aria-hidden="true" style={{ color: 'var(--mut,#A99A9E)', fontSize: 13 }}>›</span>}
              </button>
            ))}
          </div>
        </section>
      ))}

      {quietOpen && (
        <form className="kk-quiet-editor" onSubmit={saveQuietHours}>
          <div>
            <strong>Quiet hours</strong>
            <small>This account preference syncs through Supabase; notification permission still follows each device.</small>
          </div>
          <label>From<input type="time" value={quietDraft.from} onChange={(event) => setQuietDraft((current) => ({ ...current, from: event.target.value }))} required /></label>
          <label>To<input type="time" value={quietDraft.to} onChange={(event) => setQuietDraft((current) => ({ ...current, to: event.target.value }))} required /></label>
          <button type="submit">Save quiet hours</button>
        </form>
      )}

      <div style={pcss("border-radius:20px;background:var(--sf2,#FFF4F1);padding:15px 16px;border:1px dashed rgba(232,111,135,.28)")}>
        <div style={pcss("display:flex;align-items:center;justify-content:space-between;gap:12px;font:700 12px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>
          <span>Storage status</span>
          <span style={pcss("padding:5px 9px;border-radius:100px;background:var(--sf,#fff);font:800 9px 'Nunito',sans-serif;color:var(--pki,#E86F87);letter-spacing:.06em")}>
            {auth.mode === 'supabase' ? 'SUPABASE' : 'LOCAL MODE'}
          </span>
        </div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:7px")}>
          {auth.mode === 'supabase'
            ? syncStatus === 'synced'
              ? 'Supabase Realtime is active. Chat, pictures, schedule, food journal, notifications, mood, privacy, and location status update automatically on both accounts.'
              : syncStatus === 'error'
                ? `Sync is not active: ${syncError || 'run the Supabase sync migration, then reload.'}`
                : 'Connecting all shared activity to Supabase Realtime…'
            : 'The demo account, couple space, location, and content are stored in this browser. Opening the same account on another device will not carry that content over.'}
        </div>
        <div style={pcss("font:600 10px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:7px")}>
          Content, profiles, appearance, animations, quiet hours, location, and Drive metadata use your cloud account. Only browser permissions, session tokens, and the temporary offline queue stay on the device.
        </div>
      </div>

      {auth.mode === 'supabase' && auth.couple && (
        <div style={pcss('border-radius:20px;background:#FFF3F3;padding:15px 16px;border:1px solid rgba(194,80,107,.2)')}>
          <div style={pcss("font:700 12px 'Quicksand',sans-serif;color:#9F4057")}>Clear shared activity</div>
          <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:#A26775;margin-top:5px")}>Deletes shared test data without removing either account, the partner connection, profile pictures, or the Google Drive folder.</div>
          {resetError && <div role="alert" style={pcss("font:700 10.5px/1.45 'Nunito',sans-serif;color:#B23D59;margin-top:8px")}>{resetError}</div>}
          <button
            type="button"
            disabled={resetPending}
            onClick={() => void resetRoomData()}
            style={pcss(`margin-top:11px;border:0;border-radius:100px;padding:10px 15px;background:#C95C73;color:#fff;font:800 10.5px 'Nunito',sans-serif;cursor:${resetPending ? 'wait' : 'pointer'};opacity:${resetPending ? '.65' : '1'}`)}
          >
            {resetPending ? 'Clearing…' : 'Clear activity data'}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
        <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>KisahKita v1.0 · a private digital space for two 💗</div>
        {logoutError && <div role="alert" style={pcss("font:700 11.5px/1.4 'Nunito',sans-serif;color:#C2506B;margin-top:10px")}>{logoutError}</div>}
        <button
          type="button"
          disabled={logoutPending}
          style={pcss(`border:0;padding:0;background:transparent;font:700 11.5px 'Nunito',sans-serif;color:#C2506B;margin-top:10px;cursor:${logoutPending ? 'wait' : 'pointer'};opacity:${logoutPending ? '.65' : '1'};appearance:none`)}
          onClick={() => void logout()}
        >
          {logoutPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </ScrollColumn>
  );
}
