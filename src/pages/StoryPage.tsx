import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { STORY } from '../data/mockData';

export default function StoryPage() {
  const { theme } = useAppState();
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:20px;text-align:center')}>
        <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Buku sejarah kita 🌱</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:4px")}>dari pertama ketemu sampai hari ini</div>
      </HeroSurface>
      <div style={{ paddingLeft: 6 }}>
        {STORY.map((st, i) => (
          <div key={st.id} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 34 }}>
              <div style={pcss('width:34px;height:34px;border-radius:50%;background:var(--sf,#fff);box-shadow:0 3px 10px rgba(120,90,100,.12);display:flex;align-items:center;justify-content:center;font-size:15px')}>
                {st.icon}
              </div>
              {i < STORY.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--ln,rgba(74,74,74,.12))', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 20, minWidth: 0 }}>
              <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{st.year}</div>
              <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{st.title}</div>
              <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{st.place}</div>
              <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:4px")}>{st.note}</div>
              {st.photoSlot && (
                <div style={{ marginTop: 10, background: '#fff', padding: 8, borderRadius: 6, boxShadow: '0 6px 16px rgba(120,90,100,.13)', maxWidth: 260 }}>
                  <div style={pcss("aspect-ratio:16/10;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>
                    {st.photoSlot}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollColumn>
  );
}
