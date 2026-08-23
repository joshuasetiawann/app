import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { PRIVACY_ROWS } from '../data/mockData';

export default function PrivacyPage() {
  const { theme, locationOn, toggleLocation, privacy, togglePrivacy, toast } = useAppState();
  const heroBg = THEMES[theme].hero;

  const isOn = (key: (typeof PRIVACY_ROWS)[number]['key']) => {
    if (key === 'locOn') return locationOn;
    if (key === 'ghostMode') return !locationOn;
    return privacy[key];
  };

  const handleToggle = (key: (typeof PRIVACY_ROWS)[number]['key'], label: string) => {
    const wasOn = isOn(key);
    if (key === 'locOn' || key === 'ghostMode') toggleLocation();
    else togglePrivacy(key);
    toast(`${label}${wasOn ? ' dimatikan' : ' dinyalakan'}`);
  };

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px')}>
        <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Ruang privat kalian 🔒</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>cuma kalian dua yang bisa lihat. selalu.</div>
      </HeroSurface>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        {PRIVACY_ROWS.map((p) => {
          const on = isOn(p.key);
          return (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{p.label}</div>
                <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{p.sub}</div>
              </div>
              <div
                style={pcss(`width:48px;height:28px;border-radius:100px;cursor:pointer;padding:3px;display:flex;flex:none;justify-content:${on ? 'flex-end' : 'flex-start'};background:${on ? 'var(--pk,#FFB7B2)' : 'var(--ln,rgba(74,74,74,.16))'}`)}
                onClick={() => handleToggle(p.key, p.label)}
                role="button"
                aria-pressed={on}
                aria-label={p.label}
              >
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.16)' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px;border:1px dashed rgba(232,111,135,.35)')}>
        <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Enkripsi end-to-end 🔐</div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
          Chat, foto, dan berkas kalian dienkripsi. Kami nggak bisa bacanya — ini rumah kalian, bukan rumah kami.
        </div>
      </div>
    </ScrollColumn>
  );
}
