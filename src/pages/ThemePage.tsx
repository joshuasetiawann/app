import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { THEMES, type ThemeKey } from '../lib/theme';
import { ACCENT_SWATCHES } from '../data/mockData';
import type { AnimLevel } from '../state/AppState';

const THEME_LIST: ThemeKey[] = ['sakura', 'midnight', 'matcha', 'taipei'];
const SWATCH_THEME: Record<string, ThemeKey> = {
  '#FFB7B2': 'sakura',
  '#84A9FF': 'midnight',
  '#C7E5AE': 'matcha',
  '#D9B8FF': 'taipei',
  '#FFD3B6': 'sakura',
  '#B5EAD7': 'matcha',
};

function animBtnStyle(active: boolean) {
  return pcss(
    `flex:1;text-align:center;padding:10px 0;border-radius:14px;cursor:pointer;font:700 11.5px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
  );
}

export default function ThemePage() {
  const { viewport, dark, toggleDark, theme, setTheme, animLevel, setAnimLevel, toast } = useAppState();
  const themeCols = viewport === 'mobile' ? '1fr 1fr' : 'repeat(4,1fr)';

  const setLevel = (level: AnimLevel, label: string) => {
    setAnimLevel(level);
    toast(label);
  };

  return (
    <ScrollColumn>
      <div style={pcss('display:flex;justify-content:space-between;align-items:center;border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Mode gelap</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{dark ? 'Nyala · Deep Midnight' : 'Mati · Warm Pearl'}</div>
        </div>
        <button
          type="button"
          style={pcss(`width:48px;height:28px;border:0;border-radius:100px;cursor:pointer;padding:3px;display:flex;justify-content:${dark ? 'flex-end' : 'flex-start'};background:${dark ? 'var(--pk,#FFB7B2)' : 'var(--ln,rgba(74,74,74,.16))'}`)}
          onClick={toggleDark}
          aria-pressed={dark}
          aria-label="Mode gelap"
        >
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.16)' }} />
        </button>
      </div>

      <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:4px 4px 0")}>TEMA KAMI</div>
      <div style={{ display: 'grid', gridTemplateColumns: themeCols, gap: 12 }}>
        {THEME_LIST.map((key) => {
          const t = THEMES[key];
          const active = theme === key;
          return (
            <button
              type="button"
              key={key}
              style={pcss(`border-radius:22px;padding:13px;cursor:pointer;text-align:left;color:inherit;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));border:2px solid ${active ? 'var(--pk,#FFB7B2)' : 'transparent'}`)}
              onClick={() => {
                setTheme(key);
                toast(`Tema: ${t.label}`);
              }}
              aria-pressed={active}
            >
              <div style={{ height: 86, borderRadius: 16, background: t.cardBg, display: 'flex', alignItems: 'flex-end', padding: 9, fontSize: 19 }}>{t.icon}</div>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>{t.label}</div>
              <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{t.sub}</div>
            </button>
          );
        })}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Warna aksen</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 13, flexWrap: 'wrap' }}>
          {ACCENT_SWATCHES.map((c) => (
            <button
              type="button"
              key={c}
              style={pcss(`width:38px;height:38px;border:0;border-radius:50%;cursor:pointer;background:${c};box-shadow:0 0 0 ${theme === SWATCH_THEME[c] ? '3px var(--sf,#fff), 0 0 0 5px var(--pki,#E86F87)' : '0 transparent'}, 0 3px 10px rgba(120,90,100,.16)`)}
              onClick={() => {
                const next = SWATCH_THEME[c];
                setTheme(next);
                toast(`Aksen ${THEMES[next].label} diterapkan`);
              }}
              aria-pressed={theme === SWATCH_THEME[c]}
              aria-label={`Aksen ${c}`}
            />
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--ln,rgba(74,74,74,.08))', margin: '16px 0' }} />
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Level animasi</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="button" style={{ ...animBtnStyle(animLevel === 'full'), border: 0 }} onClick={() => setLevel('full', 'Animasi penuh ✨')} aria-pressed={animLevel === 'full'}>Penuh ✨</button>
          <button type="button" style={{ ...animBtnStyle(animLevel === 'calm'), border: 0 }} onClick={() => setLevel('calm', 'Animasi kalem')} aria-pressed={animLevel === 'calm'}>Kalem</button>
          <button type="button" style={{ ...animBtnStyle(animLevel === 'off'), border: 0 }} onClick={() => setLevel('off', 'Hemat daya 🔋 animasi dimatikan')} aria-pressed={animLevel === 'off'}>Hemat daya 🔋</button>
        </div>
        <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:10px")}>
          Hemat daya mematikan kelopak sakura, pulse hati, dan foto miring — cocok kalau baterai tipis atau kamu sensitif gerakan.
        </div>
      </div>
    </ScrollColumn>
  );
}
