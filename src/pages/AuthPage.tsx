import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthState } from '../state/AuthState';

type AuthView = 'login' | 'signup' | 'forgot' | 'reset';

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function HeartMark() {
  return (
    <div className="kk-brand-mark" aria-hidden="true">
      <span>♥</span>
      <i />
    </div>
  );
}

export default function AuthPage() {
  const auth = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [chosenView, setView] = useState<AuthView>(() => searchParams.get('mode') === 'reset' ? 'reset' : 'login');
  const view: AuthView = auth.recovery ? 'reset' : chosenView;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchView = (next: AuthView) => {
    setView(next);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const destination = (paired: boolean) => {
    const from = (location.state as { from?: string } | null)?.from;
    return paired && from && from !== '/auth' && from !== '/pair' ? from : paired ? '/' : '/pair';
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (view !== 'reset' && !validEmail(email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (view === 'signup' && name.trim().length < 2) {
      setError('Nama perlu setidaknya 2 karakter.');
      return;
    }
    if (view !== 'forgot' && password.length < 8) {
      setError('Gunakan minimal 8 karakter untuk password.');
      return;
    }
    if ((view === 'signup' || view === 'reset') && password !== confirmPassword) {
      setError('Konfirmasi password belum sama.');
      return;
    }
    if (view === 'forgot' && auth.mode === 'local' && password.length < 8) {
      setError('Gunakan minimal 8 karakter untuk password baru.');
      return;
    }

    setBusy(true);
    try {
      if (view === 'login') {
        const snapshot = await auth.signInAccount(email, password);
        navigate(destination(!!snapshot.partner), { replace: true });
      } else if (view === 'signup') {
        const outcome = await auth.signUpAccount(email, password, name);
        if (outcome.needsEmailConfirmation) {
          setSuccess('Tautan verifikasi sudah dikirim. Buka email kamu, lalu kembali untuk masuk.');
          setView('login');
          setPassword('');
          setConfirmPassword('');
        } else {
          navigate('/pair', { replace: true });
        }
      } else if (view === 'forgot') {
        await auth.requestPasswordReset(email, auth.mode === 'local' ? password : undefined);
        setSuccess(auth.mode === 'local'
          ? 'Password lokal sudah diganti. Kamu bisa masuk sekarang.'
          : 'Tautan pemulihan sudah dikirim. Cek inbox dan folder spam.');
        setView('login');
        setPassword('');
      } else {
        await auth.completePasswordRecovery(password);
        setSuccess('Password baru sudah tersimpan.');
        navigate(auth.isPaired ? '/' : '/pair', { replace: true });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Belum berhasil. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  const enterDemo = async () => {
    setBusy(true);
    setError('');
    try {
      await auth.enterDemo();
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Demo belum bisa dibuka.');
    } finally {
      setBusy(false);
    }
  };

  const formTitle = view === 'signup'
    ? 'Bikin akunmu'
    : view === 'forgot'
      ? 'Pulihkan akses'
      : view === 'reset'
        ? 'Pilih password baru'
        : 'Selamat datang kembali';
  const formCopy = view === 'signup'
    ? 'Satu akun untukmu. Pasanganmu membuat akunnya sendiri, lalu kalian terhubung dengan satu kode.'
    : view === 'forgot'
      ? auth.mode === 'local'
        ? 'Mode lokal tidak mengirim email. Tetapkan password baru untuk akun yang tersimpan di perangkat ini.'
        : 'Kami akan mengirim tautan aman ke email akunmu.'
      : view === 'reset'
        ? 'Gunakan kombinasi yang mudah kamu ingat dan sulit ditebak.'
        : 'Masuk untuk melanjutkan cerita kalian.';

  return (
    <main className="kk-auth-page" data-auth-mode={auth.mode}>
      <div className="kk-auth-ambient kk-auth-ambient-one" aria-hidden="true" />
      <div className="kk-auth-ambient kk-auth-ambient-two" aria-hidden="true" />
      <section className="kk-auth-shell" aria-label="Akun KisahKita">
        <aside className="kk-auth-story">
          <div className="kk-auth-brand"><HeartMark /><span>KisahKita</span></div>
          <div className="kk-auth-story-copy">
            <p className="kk-eyebrow">Ruang privat untuk dua orang</p>
            <h1>Jaraknya jauh.<br />Ceritanya tetap dekat.</h1>
            <p>Simpan ritual kecil, rencana pulang, dan momen yang cuma kalian berdua pahami.</p>
          </div>
          <div className="kk-couple-preview" aria-hidden="true">
            <div className="kk-preview-person">
              <span className="kk-preview-avatar kk-preview-avatar-a">🧑🏻</span>
              <div><small>JAKARTA</small><strong>15:42</strong><em>Kangen · ngoding</em></div>
            </div>
            <div className="kk-preview-distance"><i /><span>8.421 km</span><i /></div>
            <div className="kk-preview-person kk-preview-person-right">
              <div><small>TAIPEI</small><strong>16:42</strong><em>Senang · di kelas</em></div>
              <span className="kk-preview-avatar kk-preview-avatar-b">👩🏻</span>
            </div>
          </div>
          <div className="kk-auth-promise">
            <span>01</span><p><strong>Dua akun, satu ruang</strong><br />Data pasangan baru terbuka setelah kode diterima.</p>
          </div>
        </aside>

        <section className="kk-auth-panel">
          <div className="kk-auth-mobile-brand"><HeartMark /><span>KisahKita</span></div>
          {(view === 'login' || view === 'signup') && (
            <div className="kk-auth-tabs" role="tablist" aria-label="Pilih cara masuk">
              <button type="button" role="tab" aria-selected={view === 'login'} onClick={() => switchView('login')}>Masuk</button>
              <button type="button" role="tab" aria-selected={view === 'signup'} onClick={() => switchView('signup')}>Buat akun</button>
            </div>
          )}

          <div className="kk-auth-heading" key={view}>
            <span>{view === 'signup' ? 'Langkah pertama' : view === 'login' ? 'Ruangmu menunggu' : 'Akses akun'}</span>
            <h2>{formTitle}</h2>
            <p>{formCopy}</p>
          </div>

          <form className="kk-auth-form" onSubmit={submit} noValidate>
            {view === 'signup' && (
              <label>
                <span>Nama panggilan</span>
                <input aria-label="Nama panggilan" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Mis. Nara" disabled={busy} />
              </label>
            )}
            {view !== 'reset' && (
              <label>
                <span>Email</span>
                <input aria-label="Email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="kamu@email.com" disabled={busy} />
              </label>
            )}
            {(view !== 'forgot' || auth.mode === 'local') && (
              <label>
                <span>{view === 'forgot' || view === 'reset' ? 'Password baru' : 'Password'}</span>
                <div className="kk-password-field">
                  <input
                    aria-label={view === 'forgot' || view === 'reset' ? 'Password baru' : 'Password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    placeholder="Minimal 8 karakter"
                    disabled={busy}
                  />
                  <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                    {showPassword ? 'Tutup' : 'Lihat'}
                  </button>
                </div>
              </label>
            )}
            {(view === 'signup' || view === 'reset') && (
              <label>
                <span>Ulangi password</span>
                <input aria-label="Ulangi password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" placeholder="Ketik sekali lagi" disabled={busy} />
              </label>
            )}

            {error && <div className="kk-form-message kk-form-error" role="alert">{error}</div>}
            {success && <div className="kk-form-message kk-form-success" role="status">{success}</div>}

            <button className="kk-auth-submit" type="submit" disabled={busy}>
              {busy && <span className="kk-button-loader" aria-hidden="true" />}
              {view === 'login' ? 'Masuk ke ruang kita' : view === 'signup' ? 'Buat akun' : view === 'forgot' ? auth.mode === 'local' ? 'Simpan password baru' : 'Kirim tautan' : 'Simpan password'}
            </button>
          </form>

          <div className="kk-auth-secondary">
            {view === 'login' && <button type="button" onClick={() => switchView('forgot')}>Lupa password?</button>}
            {(view === 'forgot' || view === 'reset') && <button type="button" onClick={() => switchView('login')}>← Kembali ke masuk</button>}
          </div>

          {auth.mode === 'local' && (view === 'login' || view === 'signup') && (
            <div className="kk-demo-entry">
              <span>atau</span>
              <button type="button" onClick={enterDemo} disabled={busy}>Lihat ruang demo <b>→</b></button>
            </div>
          )}

          <p className="kk-auth-mode-note">
            <i aria-hidden="true" />
            {auth.mode === 'supabase' ? 'Terhubung ke Supabase · sesi tersimpan aman' : 'Mode lokal · data akun hanya tersimpan di perangkat ini'}
          </p>
        </section>
      </section>
    </main>
  );
}
