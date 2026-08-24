import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';

const UPCOMING_PRIVACY = [
  { icon: '🟢', label: 'Status online', sub: 'Presence real-time belum diaktifkan; status terhubung hanya berarti kedua akun sudah dipasangkan.' },
  { icon: '🕒', label: 'Terakhir dilihat', sub: 'Waktu aktif belum dilacak atau dibagikan ke pasangan.' },
  { icon: '🌤️', label: 'Aktivitas & mood', sub: 'Perubahan saat ini tersimpan lokal dan belum dikirim ke perangkat pasangan.' },
  { icon: '🖼️', label: 'Izin galeri pasangan', sub: 'Galeri bersama belum memiliki izin tambah foto per akun.' },
  { icon: '🌙', label: 'Mode me-time', sub: 'Belum terhubung ke push notification maupun presence.' },
];

export default function PrivacyPage() {
  const navigate = useNavigate();
  const auth = useAuthState();
  const { theme, locationOn } = useAppState();
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px')}>
        <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Ruang privat kalian 🔒</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>
          {auth.mode === 'supabase' ? 'akses cloud memakai akun yang terhubung.' : 'data tetap di browser perangkat ini.'}
        </div>
      </HeroSurface>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
          <span style={pcss('width:36px;height:36px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--sf2,#FFF4F1);font-size:16px;flex:none')}>📍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={pcss("display:flex;align-items:center;gap:7px;font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>
              Berbagi lokasi
              <span style={pcss(`padding:3px 7px;border-radius:100px;background:${locationOn ? '#D7EFE2' : 'var(--sf2,#FFF4F1)'};font:800 8.5px 'Nunito',sans-serif;color:${locationOn ? '#376858' : 'var(--mut,#A99A9E)'}`)}>
                {locationOn ? 'PREFERENSI AKTIF' : 'PREFERENSI MATI'}
              </span>
            </div>
            <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>
              Kelola izin perangkat dan lihat status pengiriman sebenarnya di halaman Lokasi.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/location')}
            style={pcss("padding:8px 11px;border:0;border-radius:100px;background:var(--pk,#FFB7B2);font:800 10px 'Nunito',sans-serif;color:#5C3A42;cursor:pointer;flex:none")}
          >
            Kelola
          </button>
        </div>

        {UPCOMING_PRIVACY.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
            <span style={pcss('width:36px;height:36px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--sf2,#FFF4F1);font-size:15px;flex:none')}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{item.label}</div>
              <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{item.sub}</div>
            </div>
            <button
              type="button"
              disabled
              aria-label={`${item.label}, belum tersedia`}
              style={pcss("padding:6px 9px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);font:800 8.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none;opacity:1")}
            >
              SEGERA
            </button>
          </div>
        ))}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px;border:1px dashed rgba(232,111,135,.35)')}>
        <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Perlindungan ruang 🔐</div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
          {auth.mode === 'supabase'
            ? 'Sesi akun, profil, ruang pasangan, dan lokasi live memakai Supabase dengan pembatasan akses per ruang. Konten lainnya masih tersimpan lokal di browser ini.'
            : 'Mode lokal menyimpan akun, ruang pasangan, lokasi, dan konten di browser ini. Data tidak dikirim ke server KisahKita.'}
          {' '}Enkripsi end-to-end belum diaktifkan.
        </div>
      </div>
    </ScrollColumn>
  );
}
