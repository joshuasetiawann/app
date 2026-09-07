import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../state/AuthState';

type PairMode = 'create' | 'join';

function PairBrand() {
  return (
    <div className="kk-pair-brand">
      <span aria-hidden="true">♥</span>
      <div><strong>KisahKita</strong><small>your private space</small></div>
    </div>
  );
}

function formatExpiry(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
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
  const [spaceName, setSpaceName] = useState(() => `${auth.profile?.name ?? 'Our'} Space`);
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
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'create') {
      if (!startedAt) {
        setError('Choose the date your relationship began.');
        return;
      }
      void run(() => auth.createSpace(spaceName, startedAt));
      return;
    }
    const compactCode = code.replace(/[^a-z0-9]/gi, '');
    if ((auth.mode === 'supabase' && !/^[0-9a-f]{32}$/i.test(compactCode)) || (auth.mode === 'local' && compactCode.length < 10)) {
      setError('Enter the complete invitation code.');
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
      setError('The code could not be copied automatically. Press and hold it to copy.');
    }
  };

  const shareInvite = async () => {
    if (!auth.couple) return;
    const text = `I created our private space in KisahKita. Create your account, then enter code ${auth.couple.coupleCode}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'KisahKita invitation', text });
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
          <button type="button" onClick={logout} disabled={busy}>Sign out</button>
        </div>
      </header>

      {auth.isPaired && auth.profile && auth.partner && auth.couple ? (
        <section className="kk-pair-success kk-pair-card">
          <p className="kk-eyebrow">Connection verified</p>
          <div className="kk-connected-avatars" aria-hidden="true">
            <span>{auth.profile.avatarEmoji}</span><i>♥</i><span>{auth.partner.avatarEmoji}</span>
          </div>
          <h1>You are connected.</h1>
          <p><strong>{auth.profile.name}</strong> and <strong>{auth.partner.name}</strong> now share {auth.couple.spaceName}.</p>
          <button className="kk-pair-primary" type="button" onClick={() => navigate('/', { replace: true })}>Enter our space <span>→</span></button>
          <button className="kk-pair-text-button" type="button" onClick={() => navigate('/profile')}>View couple profile</button>
        </section>
      ) : auth.couple ? (
        <section className="kk-pair-waiting kk-pair-card">
          <div className="kk-waiting-icon" aria-hidden="true"><span>♥</span><i /></div>
          <p className="kk-eyebrow">One last step</p>
          <h1>Invite your partner.</h1>
          <p className="kk-pair-lead">They create their own account and enter the code below. Your shared space opens after the second account connects.</p>

          <div className={`kk-invite-code ${expired ? 'is-expired' : ''}`}>
            <small>{expired ? 'EXPIRED CODE' : 'INVITATION CODE'}</small>
            <strong className={auth.couple.coupleCode.length > 16 ? 'is-long' : undefined}>{displayInviteCode(auth.couple.coupleCode)}</strong>
            {!expired && auth.couple.inviteExpiresAt && <span>Valid until {formatExpiry(auth.couple.inviteExpiresAt)}</span>}
          </div>

          {error && <div className="kk-form-message kk-form-error" role="alert">{error}</div>}

          {expired ? (
            <button className="kk-pair-primary" type="button" disabled={busy} onClick={() => void run(auth.renewInvite)}>
              {busy ? 'Creating code…' : 'Create new code'}
            </button>
          ) : (
            <div className="kk-pair-actions">
              <button className="kk-pair-primary" type="button" onClick={copyInvite}>{copied ? 'Code copied' : 'Copy code'}</button>
              <button className="kk-pair-secondary" type="button" onClick={shareInvite}>Share</button>
            </div>
          )}

          <div className="kk-pair-checking" role="status">
            <span className="kk-mini-spinner" aria-hidden="true" />
            <div><strong>Checking connection</strong><small>Status refreshes automatically every few seconds.</small></div>
            <button type="button" onClick={() => void run(auth.refresh)} disabled={busy}>Check now</button>
          </div>
          <p className="kk-pair-switch-account">Using the same device? <button type="button" onClick={logout}>Sign out, then create the second account</button></p>
        </section>
      ) : (
        <section className="kk-pair-setup">
          <div className="kk-pair-intro">
            <p className="kk-eyebrow">Connect two accounts</p>
            <h1>Build one digital home, together.</h1>
            <p>One person creates the space and receives a code. The other enters it—no password sharing required.</p>
            <ol>
              <li><span>1</span><div><strong>Create your space</strong><small>Your relationship date powers the days-together counter.</small></div></li>
              <li><span>2</span><div><strong>Share the private code</strong><small>The code expires automatically and accepts one partner only.</small></div></li>
              <li><span>3</span><div><strong>Start your story</strong><small>Chat and shared data appear after both accounts connect.</small></div></li>
            </ol>
          </div>

          <div className="kk-pair-card kk-pair-form-card">
            <div className="kk-pair-tabs" role="tablist" aria-label="How partner connection works">
              <button type="button" role="tab" aria-selected={mode === 'create'} onClick={() => { setMode('create'); setError(''); }}>Create space</button>
              <button type="button" role="tab" aria-selected={mode === 'join'} onClick={() => { setMode('join'); setError(''); }}>Enter code</button>
            </div>
            <div className="kk-pair-form-heading">
              <span>{mode === 'create' ? 'For the inviter' : 'For the invited partner'}</span>
              <h2>{mode === 'create' ? 'What should your shared space feel like?' : 'Have a code from your partner?'}</h2>
              <p>{mode === 'create' ? 'You can change this name later.' : 'The code is not case-sensitive.'}</p>
            </div>
            <form className="kk-auth-form" onSubmit={submit}>
              {mode === 'create' ? (
                <>
                  <label><span>Space name</span><input aria-label="Space name" value={spaceName} onChange={(event) => setSpaceName(event.target.value)} maxLength={48} placeholder="Our space" disabled={busy} /></label>
                  <label><span>Relationship started</span><input aria-label="Relationship started" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} type="date" max={new Date().toISOString().slice(0, 10)} disabled={busy} /></label>
                </>
              ) : (
                <label><span>Invitation code</span><input aria-label="Invitation code" className="kk-code-input" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="one-time-code" placeholder={auth.mode === 'supabase' ? 'Paste the 32-character code' : 'KK-ABCD-2345'} disabled={busy} /></label>
              )}
              {error && <div className="kk-form-message kk-form-error" role="alert">{error}</div>}
              <button className="kk-pair-primary" type="submit" disabled={busy}>
                {busy && <span className="kk-button-loader" aria-hidden="true" />}
                {mode === 'create' ? 'Create space & code' : 'Connect account'}
              </button>
            </form>
            <p className="kk-pair-security"><span aria-hidden="true">◇</span> Your passwords stay separate. Never send a password through chat.</p>
          </div>
        </section>
      )}
      <p className="kk-copyright">© 2026 Joshua Setiawan &amp; Kelly Wong</p>
    </main>
  );
}
