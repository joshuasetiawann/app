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
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${startedAt}T00:00:00`))
    : 'Belum diatur';

  useEffect(() => {
    void getDeviceNotificationPermission().then(setPushPermission).catch(() => setPushPermission('unsupported'));
  }, []);

  const enableNotifications = async () => {
    try {
      const permission = await enableDeviceNotifications();
      setPushPermission(permission);
      if (permission === 'granted') toast('Izin notifikasi perangkat aktif 🔔');
      else toast(permission === 'denied' ? 'Izin notifikasi diblokir di pengaturan perangkat' : 'Izin notifikasi belum diberikan');
    } catch {
      setPushPermission('unsupported');
      toast('Pengaturan notifikasi perangkat belum dapat dibuka');
    }
  };

  const saveQuietHours = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuietHours(quietDraft);
    setQuietOpen(false);
    toast(`Mode senyap ${quietDraft.from}–${quietDraft.to} tersimpan 🌙`);
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
    toast('Cadangan lokal berhasil diunduh 💾');
  };

  const groups: SettingGroup[] = [
    {
      title: 'AKUN',
      rows: [
        { icon: auth.profile?.avatarEmoji || '🙂', label: 'Profil', value: auth.profile?.name || 'Belum diisi', onClick: () => navigate('/profile') },
        { icon: '📧', label: 'Email', value: auth.profile?.email || 'Belum tersedia', onClick: () => navigate('/profile') },
        { icon: '🛡️', label: 'Penyimpanan akun', value: auth.mode === 'supabase' ? 'Supabase cloud' : 'Lokal di perangkat' },
      ],
    },
    {
      title: 'PASANGAN',
      rows: [
        { icon: '💗', label: 'Pasangan', value: auth.partner ? `${auth.partner.name} · terhubung` : auth.couple ? 'Menunggu pasangan' : 'Belum terhubung', onClick: () => navigate('/pair') },
        { icon: '🏠', label: 'Nama ruang', value: auth.couple?.spaceName || 'Belum dibuat', onClick: () => navigate('/pair') },
        { icon: '📅', label: 'Tanggal hubungan', value: relationshipDate, onClick: () => navigate('/pair') },
        { icon: '🔗', label: 'Kode pasangan', value: auth.couple?.coupleCode || 'Buat ruang dulu', onClick: () => navigate('/pair') },
      ],
    },
    {
      title: 'NOTIFIKASI',
      rows: [
        { icon: '🔔', label: 'Pusat notifikasi', value: unreadCount ? `${unreadCount} belum dibaca` : 'Semua terbaca', onClick: () => navigate('/notif') },
        { icon: '📲', label: 'Izin notifikasi perangkat', value: pushPermission === 'granted' ? 'Aktif' : pushPermission === 'denied' ? 'Diblokir perangkat' : pushPermission === 'unsupported' ? 'Tidak didukung' : 'Ketuk untuk aktifkan', onClick: () => void enableNotifications() },
        { icon: '🌙', label: 'Jadwal senyap', value: `${quietHours.from}–${quietHours.to}`, onClick: () => { setQuietDraft(quietHours); setQuietOpen((value) => !value); } },
      ],
    },
    {
      title: 'TAMPILAN',
      rows: [
        { icon: THEMES[theme].icon, label: 'Tema', value: THEMES[theme].label, onClick: () => navigate('/theme') },
        { icon: dark ? '🌙' : '☀️', label: 'Mode warna', value: dark ? 'Gelap' : 'Terang', onClick: () => navigate('/theme') },
        { icon: '✨', label: 'Level animasi', value: animLevel === 'full' ? 'Penuh' : animLevel === 'calm' ? 'Kalem' : 'Hemat daya', onClick: () => navigate('/theme') },
      ],
    },
    {
      title: 'DATA',
      rows: [
        { icon: '💾', label: auth.mode === 'supabase' ? 'Cache teknis perangkat' : 'Data KisahKita di perangkat', value: auth.mode === 'supabase' ? 'Sesi + antrean offline' : localDataSize() },
        auth.mode === 'supabase'
          ? { icon: '☁️', label: 'Sumber data utama', value: 'Supabase cloud' }
          : { icon: '📦', label: 'Unduh cadangan lokal', value: 'JSON', onClick: downloadBackup },
        { icon: '🔐', label: 'Akun & ruang pasangan', value: auth.mode === 'supabase' ? 'Tersimpan di Supabase' : 'Hanya browser ini' },
        { icon: '📍', label: 'Lokasi live', value: auth.mode === 'supabase' ? 'Cloud saat diaktifkan' : 'Hanya browser ini', onClick: () => navigate('/location') },
        { icon: '△', label: 'Google Drive', value: auth.couple?.driveFolderId ? 'Folder pasangan terdaftar' : 'Opsional', onClick: () => navigate('/files') },
        { icon: '☁️', label: 'Chat, jadwal & jurnal', value: auth.mode === 'supabase' ? syncStatus === 'synced' ? 'Realtime aktif' : syncStatus === 'error' ? 'Perlu diperiksa' : 'Menyinkronkan…' : 'Tersimpan lokal' },
        { icon: '🖼️', label: 'Foto profil & galeri', value: 'Kelola media', onClick: () => navigate('/profile') },
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
      setLogoutError(error instanceof Error ? error.message : 'Belum bisa keluar. Coba lagi.');
    } finally {
      setLogoutPending(false);
    }
  };

  const resetRoomData = async () => {
    if (!auth.couple || !window.confirm('Bersihkan seluruh aktivitas ruang ini? Chat, PAP, jurnal makanan, jadwal, notifikasi, lokasi, dan konten bersama akan dihapus permanen. Akun, profil, pasangan, dan folder Google Drive tetap ada.')) return;
    setResetPending(true);
    setResetError('');
    try {
      await resetSharedData();
      toast('Aktivitas ruang berhasil dibersihkan');
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Data ruang belum berhasil dibersihkan.');
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
            <strong>Jadwal senyap</strong>
            <small>Preferensi akun ini tersinkron ke Supabase; izin notifikasi tetap mengikuti perangkat.</small>
          </div>
          <label>Mulai<input type="time" value={quietDraft.from} onChange={(event) => setQuietDraft((current) => ({ ...current, from: event.target.value }))} required /></label>
          <label>Selesai<input type="time" value={quietDraft.to} onChange={(event) => setQuietDraft((current) => ({ ...current, to: event.target.value }))} required /></label>
          <button type="submit">Simpan jadwal</button>
        </form>
      )}

      <div style={pcss("border-radius:20px;background:var(--sf2,#FFF4F1);padding:15px 16px;border:1px dashed rgba(232,111,135,.28)")}>
        <div style={pcss("display:flex;align-items:center;justify-content:space-between;gap:12px;font:700 12px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>
          <span>Status penyimpanan</span>
          <span style={pcss("padding:5px 9px;border-radius:100px;background:var(--sf,#fff);font:800 9px 'Nunito',sans-serif;color:var(--pki,#E86F87);letter-spacing:.06em")}>
            {auth.mode === 'supabase' ? 'SUPABASE' : 'MODE LOKAL'}
          </span>
        </div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:7px")}>
          {auth.mode === 'supabase'
            ? syncStatus === 'synced'
              ? 'Supabase Realtime aktif. Chat, PAP, jadwal, jurnal makanan, notifikasi, mood, privasi, dan status lokasi diperbarui otomatis di kedua akun.'
              : syncStatus === 'error'
                ? `Sinkronisasi belum aktif: ${syncError || 'jalankan migrasi sinkronisasi Supabase lalu muat ulang.'}`
                : 'Menghubungkan seluruh aktivitas ruang ke Supabase Realtime…'
            : 'Akun demo, ruang pasangan, lokasi, dan seluruh konten tersimpan di browser perangkat ini. Membuka akun yang sama di perangkat lain tidak akan membawa konten tersebut.'}
        </div>
        <div style={pcss("font:600 10px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:7px")}>
          Konten, profil, tema, animasi, jadwal senyap, lokasi, dan metadata Drive memakai akun cloud. Hanya izin browser, token sesi, dan antrean offline sementara yang tetap di perangkat.
        </div>
      </div>

      {auth.mode === 'supabase' && auth.couple && (
        <div style={pcss('border-radius:20px;background:#FFF3F3;padding:15px 16px;border:1px solid rgba(194,80,107,.2)')}>
          <div style={pcss("font:700 12px 'Quicksand',sans-serif;color:#9F4057")}>Bersihkan aktivitas ruang</div>
          <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:#A26775;margin-top:5px")}>Menghapus data uji bersama tanpa menghapus dua akun, hubungan pasangan, foto profil, atau folder Google Drive.</div>
          {resetError && <div role="alert" style={pcss("font:700 10.5px/1.45 'Nunito',sans-serif;color:#B23D59;margin-top:8px")}>{resetError}</div>}
          <button
            type="button"
            disabled={resetPending}
            onClick={() => void resetRoomData()}
            style={pcss(`margin-top:11px;border:0;border-radius:100px;padding:10px 15px;background:#C95C73;color:#fff;font:800 10.5px 'Nunito',sans-serif;cursor:${resetPending ? 'wait' : 'pointer'};opacity:${resetPending ? '.65' : '1'}`)}
          >
            {resetPending ? 'Membersihkan…' : 'Bersihkan data aktivitas'}
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
        <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>KisahKita v1.0 · ruang digital untuk dua orang 💗</div>
        {logoutError && <div role="alert" style={pcss("font:700 11.5px/1.4 'Nunito',sans-serif;color:#C2506B;margin-top:10px")}>{logoutError}</div>}
        <button
          type="button"
          disabled={logoutPending}
          style={pcss(`border:0;padding:0;background:transparent;font:700 11.5px 'Nunito',sans-serif;color:#C2506B;margin-top:10px;cursor:${logoutPending ? 'wait' : 'pointer'};opacity:${logoutPending ? '.65' : '1'};appearance:none`)}
          onClick={() => void logout()}
        >
          {logoutPending ? 'Sedang keluar…' : 'Keluar dari akun'}
        </button>
      </div>
    </ScrollColumn>
  );
}
