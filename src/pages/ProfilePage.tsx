import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { useAppNow, daysSince } from '../lib/appClock';
import { ProfileAvatar } from '../components/shared/ProfileAvatar';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';
import { imageDataUrl } from '../lib/image';

interface ProfileDraft {
  name: string;
  nickname: string;
  avatarEmoji: string;
  avatarUrl: string;
  city: string;
  timezone: string;
}

const EMPTY_PROFILE: ProfileDraft = { name: '', nickname: '', avatarEmoji: '🙂', avatarUrl: '', city: '', timezone: '' };
const fieldStyle = pcss("width:100%;padding:10px 13px;border-radius:14px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf,#fff);font:600 12.5px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A)");
const pillButton = pcss("border:0;padding:9px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer;appearance:none");

export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme, favorites, addFavorite, toast } = useAppState();
  const auth = useAuthState();
  const twoCol = useTwoColTemplate();
  const heroBg = THEMES[theme].hero;
  const now = useAppNow(3_600_000);
  const daysTogether = auth.couple ? daysSince(auth.couple.startedAt, now) : null;
  const [favoriteDraft, setFavoriteDraft] = useState('');
  const [addingFavorite, setAddingFavorite] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(EMPTY_PROFILE);
  const [profilePending, setProfilePending] = useState(false);
  const [profileError, setProfileError] = useState('');
  const partnerName = auth.partner?.name || 'Pasangan';
  const locationSummary = [auth.profile?.city, auth.partner?.city].filter(Boolean).join(' – ');
  const relationshipSummary = auth.couple
    ? `${daysTogether} hari${locationSummary ? ` · ${locationSummary}` : ''}`
    : 'Belum ada ruang pasangan';
  const profiles = auth.profile
    ? [
        { profile: auth.profile, self: true, avatarBg: 'linear-gradient(140deg,#FFD9DC,#E3D7F7)' },
        ...(auth.partner ? [{ profile: auth.partner, self: false, avatarBg: 'linear-gradient(140deg,#D9E9FF,#FFD3EA)' }] : []),
      ]
    : [];

  const openEditor = () => {
    if (!auth.profile) return;
    setProfileDraft({
      name: auth.profile.name,
      nickname: auth.profile.nickname,
      avatarEmoji: auth.profile.avatarEmoji,
      avatarUrl: auth.profile.avatarUrl,
      city: auth.profile.city,
      timezone: auth.profile.timezone,
    });
    setProfileError('');
    setEditing(true);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = profileDraft.name.trim();
    const timezone = profileDraft.timezone.trim();
    if (name.length < 2) {
      setProfileError('Nama minimal 2 karakter.');
      return;
    }
    if (profileDraft.nickname.trim().length > 32) {
      setProfileError('Panggilan maksimal 32 karakter.');
      return;
    }
    try {
      new Intl.DateTimeFormat('id-ID', { timeZone: timezone }).format();
    } catch {
      setProfileError('Zona waktu belum valid, misalnya Asia/Jakarta.');
      return;
    }

    setProfilePending(true);
    setProfileError('');
    try {
      await auth.updateProfile({
        name,
        nickname: profileDraft.nickname.trim(),
        avatarEmoji: profileDraft.avatarEmoji.trim() || '🙂',
        avatarUrl: profileDraft.avatarUrl,
        city: profileDraft.city.trim(),
        timezone,
      });
      setEditing(false);
      toast('Profil berhasil diperbarui ✓');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Profil belum bisa disimpan. Coba lagi.');
    } finally {
      setProfilePending(false);
    }
  };

  const choosePhoto = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setProfilePending(true);
    setProfileError('');
    try {
      const avatarUrl = await imageDataUrl(file, { maxSide: 360, quality: 0.72, maxFileMb: 8 });
      setProfileDraft((current) => ({ ...current, avatarUrl }));
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Foto belum bisa diproses.');
    } finally {
      setProfilePending(false);
    }
  };

  const saveFavorite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = favoriteDraft.trim();
    if (value) {
      addFavorite(value);
      toast('Ditambahkan ke daftar 🥰');
    }
    setFavoriteDraft('');
    setAddingFavorite(false);
  };

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:22px 20px;text-align:center;box-shadow:0 8px 24px rgba(255,140,150,.14)')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} aria-hidden="true">
          <ProfileAvatar profile={auth.profile} size={64} radius={32} className="kk-avatar-hero" />
          <div style={pcss('width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;margin:0 -8px;z-index:2;box-shadow:0 4px 12px rgba(255,140,150,.3);animation:kk-pulse 2.6s ease-in-out infinite')}>💗</div>
          <ProfileAvatar profile={auth.partner} size={64} radius={32} background="linear-gradient(140deg,#D9E9FF,#FFD3EA)" className="kk-avatar-hero" />
        </div>
        <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:14px")}>{auth.profile?.name || 'Kamu'} &amp; {partnerName}</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>{relationshipSummary}</div>
        {auth.couple && <div style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);margin-top:5px")}>{auth.couple.spaceName}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" style={pillButton} onClick={openEditor} disabled={!auth.profile}>
            Edit profil
          </button>
          <button type="button" style={pillButton} onClick={() => navigate('/pair')}>
            {auth.couple ? `Kode pasangan: ${auth.couple.coupleCode}` : 'Hubungkan pasangan'}
          </button>
        </div>
      </HeroSurface>

      {editing && (
        <form onSubmit={saveProfile} style={pcss('border-radius:24px;background:var(--sf2,#FFF4F1);padding:17px;border:1px solid var(--ln,rgba(74,74,74,.1))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-bottom:12px")}>Edit profil kamu</div>
          <div className="kk-profile-photo-editor">
            <ProfileAvatar profile={{ name: profileDraft.name || 'Kamu', avatarEmoji: profileDraft.avatarEmoji, avatarUrl: profileDraft.avatarUrl }} size={72} radius={24} />
            <div>
              <strong>Foto profil</strong>
              <small>Otomatis diperkecil agar tetap cepat di HP.</small>
              <div className="kk-profile-photo-actions">
                {profileDraft.avatarUrl && <button type="button" disabled={profilePending} onClick={() => setProfileDraft((current) => ({ ...current, avatarUrl: '' }))}>Hapus</button>}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <ImageSourcePicker
                busy={profilePending}
                onFiles={choosePhoto}
                accept="image/jpeg,image/png,image/webp"
                cameraAriaLabel="Ambil foto profil dengan kamera"
                galleryAriaLabel="Pilih foto profil dari galeri"
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 10 }}>
            <label style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              Nama
              <input value={profileDraft.name} onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))} maxLength={48} disabled={profilePending} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              Panggilan
              <input value={profileDraft.nickname} onChange={(event) => setProfileDraft((current) => ({ ...current, nickname: event.target.value }))} maxLength={32} disabled={profilePending} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              Emoji profil
              <input value={profileDraft.avatarEmoji} onChange={(event) => setProfileDraft((current) => ({ ...current, avatarEmoji: event.target.value }))} maxLength={8} disabled={profilePending} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              Kota
              <input value={profileDraft.city} onChange={(event) => setProfileDraft((current) => ({ ...current, city: event.target.value }))} maxLength={64} disabled={profilePending} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
            <label style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);grid-column:1/-1")}>
              Zona waktu
              <input value={profileDraft.timezone} onChange={(event) => setProfileDraft((current) => ({ ...current, timezone: event.target.value }))} placeholder="Asia/Jakarta" autoCapitalize="none" spellCheck={false} disabled={profilePending} style={{ ...fieldStyle, marginTop: 5 }} />
            </label>
          </div>
          {profileError && <div role="alert" style={pcss("font:700 11.5px/1.4 'Nunito',sans-serif;color:#C2506B;margin-top:10px")}>{profileError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button type="button" style={pillButton} disabled={profilePending} onClick={() => setEditing(false)}>Batal</button>
            <button type="submit" disabled={profilePending} style={pcss(`border:0;padding:9px 15px;border-radius:100px;background:var(--pk,#FFB7B2);font:700 11.5px 'Nunito',sans-serif;color:#5C3A42;cursor:${profilePending ? 'wait' : 'pointer'};opacity:${profilePending ? '.65' : '1'};appearance:none`)}>
              {profilePending ? 'Menyimpan…' : 'Simpan profil'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {profiles.map(({ profile, self, avatarBg }) => {
          const rows = [
            ...(self ? [['Email', profile.email]] : []),
            ['Negara', [profile.countryFlag, profile.country].filter(Boolean).join(' ') || 'Belum diisi'],
            ['Kota', profile.city || 'Belum diisi'],
            ['Zona waktu', profile.timezone || 'Belum diisi'],
          ];
          return (
            <div key={profile.id} style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <ProfileAvatar profile={profile} size={46} radius={16} background={avatarBg} />
                <div>
                  <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{profile.name}</div>
                  <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>{profile.nickname || (self ? 'Profil kamu' : 'Pasanganmu')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
                {rows.map(([label, value]) => (
                  <div key={label} style={pcss("display:flex;justify-content:space-between;gap:10px;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
                    <span>{label}</span>
                    <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700, textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={pcss('border-radius:24px;background:var(--sf2,#FFF4F1);padding:18px;border:1px dashed rgba(232,111,135,.4)')}>
        <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Hal yang kami suka dari satu sama lain 🥰</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
          {favorites.map((line, index) => (
            <div key={`${line}-${index}`} style={pcss("font:600 19px/1.4 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>
              &ldquo;{line}&rdquo;
            </div>
          ))}
        </div>
        {addingFavorite ? (
          <form onSubmit={saveFavorite} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={favoriteDraft}
              onChange={(event) => setFavoriteDraft(event.target.value)}
              placeholder="Tulis satu hal yang kamu suka..."
              aria-label="Hal yang disukai"
              maxLength={140}
              style={pcss("flex:1;padding:10px 14px;border-radius:100px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf,#fff);font:600 12.5px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A)")}
            />
            <button type="submit" style={pcss("border:0;padding:10px 15px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer;appearance:none")}>Simpan</button>
          </form>
        ) : (
          <button
            type="button"
            style={pcss("margin-top:14px;padding:9px 15px;border:0;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer;appearance:none")}
            onClick={() => setAddingFavorite(true)}
          >
            + Tambah satu lagi
          </button>
        )}
      </div>
    </ScrollColumn>
  );
}
