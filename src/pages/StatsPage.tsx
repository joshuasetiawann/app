import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppState } from '../state/AppState';
import { MOOD_BARS, PIE_LEGEND, HEATMAP, BIG_STATS } from '../data/mockData';

export default function StatsPage() {
  const { viewport } = useAppState();
  const twoCol = useTwoColTemplate();
  const statCols = viewport === 'mobile' ? '1fr 1fr' : 'repeat(4,1fr)';

  return (
    <ScrollColumn>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Mood bulan ini 🌊</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>Kamu vs Partner</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 120, marginTop: 16 }}>
            {MOOD_BARS.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 3 }}>
                <div style={{ height: m.her * 11, borderRadius: 6, background: '#B5EAD7' }} />
                <div style={{ height: m.me * 11, borderRadius: 6, background: 'var(--pk,#FFB7B2)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--pk,#FFB7B2)' }} />Kamu
            </span>
            <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: '#B5EAD7' }} />Partner
            </span>
          </div>
        </div>

        <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Makanan favorit 🧋</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}>
            <div
              style={{
                width: 118,
                height: 118,
                borderRadius: '50%',
                background: 'conic-gradient(#FFB7B2 0 40%,#B5EAD7 40% 64%,#E3D7F7 64% 82%,#FFE0AC 82% 94%,#E2F0CB 94% 100%)',
                flex: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--sf,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px "Nunito",sans-serif', color: 'var(--ink2,#6B5B60)', textAlign: 'center' }}>
                124
                <br />
                menu
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {PIE_LEGEND.map((p) => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 11px "Nunito",sans-serif', color: 'var(--ink2,#6B5B60)' }}>
                  <span style={{ width: 11, height: 11, borderRadius: 4, flex: 'none', background: p.color }} />
                  <span style={{ flex: 1 }}>{p.label}</span>
                  <span style={{ fontWeight: 800 }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Aktivitas harian</span>
          <span style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>12 minggu terakhir</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24,1fr)', gap: 4, marginTop: 15 }}>
          {HEATMAP.map((lv, i) => (
            <div key={i} style={{ aspectRatio: 1, borderRadius: 4, background: ['#F4E7E4', '#FFD3CE', '#FFB7B2', '#E8899A'][lv] }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Rajin update: 68 dari 84 hari 🌸</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={pcss("font:600 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>sepi</span>
            {['#F4E7E4', '#FFD3CE', '#FFB7B2', '#E8899A'].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            ))}
            <span style={pcss("font:600 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>rame</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 12 }}>
        {BIG_STATS.map((b) => (
          <div key={b.label} style={{ borderRadius: 22, background: b.gradient, padding: 16 }}>
            <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>{b.label}</div>
            <div style={pcss("font:700 26px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:7px")}>{b.value}</div>
            <div style={pcss("font:500 15px 'Caveat',cursive;color:var(--ink2,#6B5B60)")}>{b.note}</div>
          </div>
        ))}
      </div>
    </ScrollColumn>
  );
}
