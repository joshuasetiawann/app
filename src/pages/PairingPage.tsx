import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../state/AuthState';

type PairMode = 'create' | 'join';

function PairBrand() {
  return (
    <div className="kk-pair-brand">
      <span aria-hidden="true">♥</span>
      <div><strong>KisahKita</strong><small>ruang privat kalian</small></div>
    </div>
  );
}

function formatExpiry(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function displayInviteCode(value: string) {
  const compact = value.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(compact)) return value;
  const groups = compact.toUpperCase().match(/.{1,4}/g) ?? [compact];
  return `${groups.slice(0, 4).join('-')}\n${groups.slice(4).join('-')}`;
}

export default function PairingPage() {
  const auth = useAuthState();
  const navigate = useNavigate();
  const [mode, setMode] = useState<PairMode>('create');
  const [spaceName, setSpaceName] = useState(() => `Ruang ${auth.profile?.name ?? 'Kita'}`);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [openedAt] = useState(() => Date.now());
  const expired = !!auth.couple?.inviteExpiresAt && new Date(auth.couple.inviteExpiresAt).getTime() < openedAt;

  const initials = useMemo(() => auth.profile?.name.trim().slice(0, 1).toUpperCase() || 'K', [auth.profile?.name]);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Belum berhasil. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'create') {
      if (!startedAt) {
        setError('Pilih tanggal awal hubungan kalian.');
        return;
      }
      void run(() => auth.createSpace(spaceName, startedAt));
      return;
    }
    const compactCode = code.replace(/[^a-z0-9]/gi, '');
    if ((auth.mode === 'supabase' && !/^[0-9a-f]{32}$/i.test(compactCode)) || (auth.mode === 'local' && compactCode.length < 10)) {
      setError('Masukkan kode undangan lengkap.');
      return;
    }
    void run(async () => {
      const next = await auth.joinSpace(code);
      if (next.partner) navigate('/', { replace: true });
    });
  };

  const copyInvite = async () => {
    if (!auth.couple) return;
    try {
      await navigator.clipboard.writeText(auth.couple.coupleCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Kode belum bisa disalin otomatis. Tekan lama pada kode untuk menyalin.');
    }
  };

  const shareInvite = async () => {
    if (!auth.couple) return;
    const text = `Aku sudah bikin ruang kita di KisahKita. Buat akunmu lalu masukkan kode ${auth.couple.coupleCode}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Undangan KisahKita', text });
        return;
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === 'AbortError') return;
      }
    }
    await copyInvite();
  };

  const logout = () => void run(async () => {
    await auth.signOutAccount();
    navigate('/auth', { replace: true });
  });

  return (
    <main className="kk-pair-page">
      <div className="kk-pair-noise" aria-hidden="true" />
      <header className="kk-pair-topbar">
        <PairBrand />
        <div className="kk-pair-account">
          <span>{initials}</span>
          <div><strong>{auth.profile?.name}</strong><small>{auth.profile?.email}</small></div>
          <button type="button" onClick={logout} disabled={busy}>Keluar</button>
        </div>
      </header>

      {auth.isPaired && auth.profile && auth.partner && auth.couple ? (
        <section className="kk-pair-success kk-pair-card">
          <p className="kk-eyebrow">Koneksi terverifikasi</p>
          <div className="kk-connected-avatars" aria-hidden="true">
            <span>{auth.profile.avatarEmoji}</span><i>♥</i><span>{auth.partner.avatarEmoji}</span>
          </div>
          <h1>Kalian sudah terhubung.</h1>
          <p><strong>{auth.profile.name}</strong> dan <strong>{auth.partner.name}</strong> sekarang berbagi {auth.couple.spaceName}.</p>
          <button className="kk-pair-primary" type="button" onClick={() => navigate('/', { replace: true })}>Masuk ke ruang kita <span>→</span></button>
          <button className="kk-pair-text-button" type="button" onClick={() => navigate('/profile')}>Lihat profil pasangan</button>
        </section>
      ) : auth.couple ? (
        <section className="kk-pair-waiting kk-pair-card">
          <div className="kk-waiting-icon" aria-hidden="true"><span>♥</span><i /></div>
          <p className="kk-eyebrow">Satu langkah lagi</p>
          <h1>Undang pasanganmu masuk.</h1>
          <p className="kk-pair-lead">Dia perlu membuat akun sendiri, lalu memasukkan kode di bawah. Ruang baru terbuka setelah akun kedua terhubung.</p>

          <div className={`kk-invite-code ${expired ? 'is-expired' : ''}`}>
            <small>{expired ? 'KODE KEDALUWARSA' : 'KODE UNDANGAN'}</small>
            <strong className={auth.couple.coupleCode.length > 16 ? 'is-long' : undefined}>{displayInviteCode(auth.couple.coupleCode)}</strong>
            {!expired && auth.couple.inviteExpiresAt && <span>Berlaku sampai {formatExpiry(auth.couple.inviteExpiresAt)}</span>}
          </div>

          {error && <div className="kk-form-message kk-form-error" role="alert">{error}</div>}

          {expired ? (
            <button className="kk-pair-primary" type="button" disabled={busy} onClick={() => void run(auth.renewInvite)}>
              {busy ? 'Membuat kode…' : 'Buat kode baru'}
            </button>
          ) : (
            <div className="kk-pair-actions">
              <button className="kk-pair-primary" type="button" onClick={copyInvite}>{copied ? 'Kode tersalin' : 'Salin kode'}</button>
              <button className="kk-pair-secondary" type="button" onClick={shareInvite}>Bagikan</button>
            </div>
          )}

          <div className="kk-pair-checking" role="status">
            <span className="kk-mini-spinner" aria-hidden="true" />
            <div><strong>Mengecek koneksi</strong><small>Status diperbarui otomatis setiap beberapa detik.</small></div>
            <button type="button" onClick={() => void run(auth.refresh)} disabled={busy}>Cek sekarang</button>
          </div>
          <p className="kk-pair-switch-account">Pasangan memakai perangkat yang sama? <button type="button" onClick={logout}>Keluar, lalu buat akun kedua</button></p>
        </section>
      ) : (
        <section className="kk-pair-setup">
          <div className="kk-pair-intro">
            <p className="kk-eyebrow">Hubungkan dua akun</p>
            <h1>Bangun satu rumah digital, berdua.</h1>
            <p>Yang pertama membuat ruang dan menerima kode. Yang kedua cukup memasukkan kode itu—tanpa berbagi password.</p>
            <ol>
              <li><span>1</span><div><strong>Buat atau pilih ruang</strong><small>Tanggal hubungan dipakai untuk hitung hari bersama.</small></div></li>
              <li><span>2</span><div><strong>Bagikan kode privat</strong><small>Kode kedaluwarsa otomatis dan hanya menerima satu pasangan.</small></div></li>
              <li><span>3</span><div><strong>Mulai cerita kalian</strong><small>Chat dan data pasangan baru muncul setelah terhubung.</small></div></li>
            </ol>
          </div>

          <div className="kk-pair-card kk-pair-form-card">
            <div className="kk-pair-tabs" role="tablist" aria-label="Cara menghubungkan pasangan">
              <button type="button" role="tab" aria-selected={mode === 'create'} onClick={() => { setMode('create'); setError(''); }}>Buat ruang</button>
              <button type="button" role="tab" aria-selected={mode === 'join'} onClick={() => { setMode('join'); setError(''); }}>Masukkan kode</button>
            </div>
            <div className="kk-pair-form-heading">
              <span>{mode === 'create' ? 'Untuk pengundang' : 'Untuk pasangan yang diundang'}</span>
              <h2>{mode === 'create' ? 'Ruang seperti apa yang kalian mau?' : 'Punya kode dari pasangan?'}</h2>
              <p>{mode === 'create' ? 'Nama ini bisa diganti nanti.' : 'Kode tidak peka huruf besar atau kecil.'}</p>
            </div>
            <form className="kk-auth-form" onSubmit={submit}>
              {mode === 'create' ? (
                <>
                  <label><span>Nama ruang</span><input aria-label="Nama ruang" value={spaceName} onChange={(event) => setSpaceName(event.target.value)} maxLength={48} placeholder="Ruang kita" disabled={busy} /></label>
                  <label><span>Mulai hubungan</span><input aria-label="Mulai hubungan" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} type="date" max={new Date().toISOString().slice(0, 10)} disabled={busy} /></label>
                </>
              ) : (
                <label><span>Kode undangan</span><input aria-label="Kode undangan" className="kk-code-input" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="one-time-code" placeholder={auth.mode === 'supabase' ? 'Tempel kode 32 karakter' : 'KK-ABCD-2345'} disabled={busy} /></label>
              )}
              {error && <div className="kk-form-message kk-form-error" role="alert">{error}</div>}
              <button className="kk-pair-primary" type="submit" disabled={busy}>
                {busy && <span className="kk-button-loader" aria-hidden="true" />}
                {mode === 'create' ? 'Buat ruang & kode' : 'Hubungkan akun'}
              </button>
            </form>
            <p className="kk-pair-security"><span aria-hidden="true">◇</span> Password kalian tetap terpisah. Jangan kirim password lewat chat.</p>
          </div>
        </section>
      )}
    </main>
  );
}
