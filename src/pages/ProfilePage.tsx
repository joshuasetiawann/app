import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { ME, PARTNER, RELATIONSHIP, FAVORITE_THINGS } from '../data/mockData';
import { useAppNow, daysSince } from '../lib/appClock';

const PROFILE_LIST = [
  { profile: ME, avatarBg: 'linear-gradient(140deg,#FFD9DC,#E3D7F7)' },
  { profile: PARTNER, avatarBg: 'linear-gradient(140deg,#D9E9FF,#FFD3EA)' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { theme, toast } = useAppState();
  const twoCol = useTwoColTemplate();
  const heroBg = THEMES[theme].hero;
  const now = useAppNow(3_600_000);
  const daysTogether = daysSince(RELATIONSHIP.startedAt, now);
  const [favorites, setFavorites] = useState(FAVORITE_THINGS);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:22px 20px;text-align:center;box-shadow:0 8px 24px rgba(255,140,150,.14)')}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={pcss('width:64px;height:64px;border-radius:50%;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:28px;border:3px solid #fff;box-shadow:0 6px 16px rgba(120,90,100,.2)')}>🧑🏻</div>
          <div style={pcss('width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;margin:0 -8px;z-index:2;box-shadow:0 4px 12px rgba(255,140,150,.3);animation:kk-pulse 2.6s ease-in-out infinite')}>💗</div>
          <div style={pcss('width:64px;height:64px;border-radius:50%;background:linear-gradient(140deg,#D9E9FF,#FFD3EA);display:flex;align-items:center;justify-content:center;font-size:28px;border:3px solid #fff;box-shadow:0 6px 16px rgba(120,90,100,.2)')}>👩🏻</div>
        </div>
        <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:14px")}>Joshua &amp; Partner</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>{daysTogether} hari · Jakarta 🇮🇩 – Taipei 🇹🇼</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={pcss("padding:9px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => toast('Edit profil')} role="button">
            Edit profil
          </div>
          <div
            style={pcss("padding:9px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}
            onClick={() => navigate('/onboard')}
            role="button"
          >
            Kode couple: {RELATIONSHIP.coupleCode}
          </div>
        </div>
      </HeroSurface>

      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {PROFILE_LIST.map(({ profile, avatarBg }) => (
          <div key={profile.id} style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 46, height: 46, borderRadius: 16, background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, flex: 'none' }}>{profile.avatarEmoji}</div>
              <div>
                <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{profile.name}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>{profile.nickname}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
              {[
                ['Negara', `${profile.countryFlag} ${profile.country}`],
                ['Kota', profile.city],
                ['Zona waktu', `${profile.timezone} (UTC+${profile.utcOffset})`],
                ['Ulang tahun', profile.birthday],
                ['Makanan favorit', profile.favoriteFood],
                ['Warna favorit', profile.favoriteColor],
                ['Perangkat', profile.device],
              ].map(([k, v]) => (
                <div key={k} style={pcss("display:flex;justify-content:space-between;gap:10px;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
                  <span>{k}</span>
                  <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={pcss('border-radius:24px;background:var(--sf2,#FFF4F1);padding:18px;border:1px dashed rgba(232,111,135,.4)')}>
        <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Hal yang kami suka dari satu sama lain 🥰</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
          {favorites.map((line, i) => (
            <div key={i} style={pcss("font:600 19px/1.4 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>
              &ldquo;{line}&rdquo;
            </div>
          ))}
        </div>
        {adding ? (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tulis satu hal yang kamu suka..."
              aria-label="Hal yang disukai"
              style={pcss("flex:1;padding:10px 14px;border-radius:100px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf,#fff);font:600 12.5px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A)")}
            />
            <div
              style={pcss("padding:10px 15px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
              onClick={() => {
                if (draft.trim()) {
                  setFavorites((prev) => [...prev, draft.trim()]);
                  toast('Ditambahin ke daftar 🥰');
                }
                setDraft('');
                setAdding(false);
              }}
              role="button"
            >
              Simpan
            </div>
          </div>
        ) : (
          <div
            style={pcss("margin-top:14px;display:inline-block;padding:9px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}
            onClick={() => setAdding(true)}
            role="button"
          >
            + Tambah satu lagi
          </div>
        )}
      </div>
    </ScrollColumn>
  );
}
