import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { THEMES, type ThemeKey } from '../lib/theme';
import { ACCENT_SWATCHES } from '../data/mockData';
import type { AnimLevel } from '../state/AppState';

const THEME_LIST: ThemeKey[] = ['sakura', 'midnight', 'matcha', 'taipei'];

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
        <div
          style={pcss(`width:48px;height:28px;border-radius:100px;cursor:pointer;padding:3px;display:flex;justify-content:${dark ? 'flex-end' : 'flex-start'};background:${dark ? 'var(--pk,#FFB7B2)' : 'var(--ln,rgba(74,74,74,.16))'}`)}
          onClick={toggleDark}
          role="button"
          aria-pressed={dark}
          aria-label="Mode gelap"
        >
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.16)' }} />
        </div>
      </div>

      <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:4px 4px 0")}>TEMA KAMI</div>
      <div style={{ display: 'grid', gridTemplateColumns: themeCols, gap: 12 }}>
        {THEME_LIST.map((key) => {
          const t = THEMES[key];
          const active = theme === key;
          return (
            <div
              key={key}
              style={pcss(`border-radius:22px;padding:13px;cursor:pointer;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));border:2px solid ${active ? 'var(--pk,#FFB7B2)' : 'transparent'}`)}
              onClick={() => {
                setTheme(key);
                toast(`Tema: ${t.label}`);
              }}
              role="button"
            >
              <div style={{ height: 86, borderRadius: 16, background: t.cardBg, display: 'flex', alignItems: 'flex-end', padding: 9, fontSize: 19 }}>{t.icon}</div>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>{t.label}</div>
              <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{t.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Warna aksen</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 13, flexWrap: 'wrap' }}>
          {ACCENT_SWATCHES.map((c) => (
            <div
              key={c}
              style={pcss(`width:38px;height:38px;border-radius:50%;cursor:pointer;background:${c};box-shadow:0 0 0 0px transparent, 0 3px 10px rgba(120,90,100,.16)`)}
              onClick={() => toast('Aksen diganti')}
              role="button"
              aria-label={`Aksen ${c}`}
            />
          ))}
        </div>
        <div style={{ height: 1, background: 'var(--ln,rgba(74,74,74,.08))', margin: '16px 0' }} />
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Level animasi</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <div style={animBtnStyle(animLevel === 'full')} onClick={() => setLevel('full', 'Animasi penuh ✨')} role="button">Penuh ✨</div>
          <div style={animBtnStyle(animLevel === 'calm')} onClick={() => setLevel('calm', 'Animasi kalem')} role="button">Kalem</div>
          <div style={animBtnStyle(animLevel === 'off')} onClick={() => setLevel('off', 'Hemat daya 🔋 animasi dimatikan')} role="button">Hemat daya 🔋</div>
        </div>
        <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:10px")}>
          Hemat daya mematikan kelopak sakura, pulse hati, dan foto miring — cocok kalau baterai tipis atau kamu sensitif gerakan.
        </div>
      </div>
    </ScrollColumn>
  );
}
