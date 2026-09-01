import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppState } from '../state/AppState';
import { MOOD_BARS, HEATMAP } from '../data/mockData';
import { useAuthState } from '../state/AuthState';
import { daysSince } from '../lib/appClock';

export default function StatsPage() {
  const { profile, partner, couple } = useAuthState();
  const { viewport, foodEntries, messages, events } = useAppState();
  const twoCol = useTwoColTemplate();
  const statCols = viewport === 'mobile' ? '1fr 1fr' : 'repeat(4,1fr)';
  const meName = profile?.nickname || profile?.name || 'You';
  const partnerName = partner?.nickname || partner?.name || 'Partner';
  const foodColors = ['#FFB7B2', '#B5EAD7', '#E3D7F7', '#FFE0AC', '#E2F0CB'];
  const sortedCategoryCounts = Object.entries(foodEntries.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const categoryCounts: [string, number][] = sortedCategoryCounts.length <= 5
    ? sortedCategoryCounts
    : [...sortedCategoryCounts.slice(0, 4), ['Lainnya', sortedCategoryCounts.slice(4).reduce((sum, [, count]) => sum + count, 0)]];
  const foodTotal = foodEntries.length;
  const pieSegments = categoryCounts.map(([label, count], index) => {
    const earlierCount = categoryCounts.slice(0, index).reduce((sum, [, itemCount]) => sum + itemCount, 0);
    const start = foodTotal ? (earlierCount / foodTotal) * 100 : 0;
    const end = foodTotal ? ((earlierCount + count) / foodTotal) * 100 : 0;
    return { label, count, color: foodColors[index], start, end };
  });
  const pieBackground = pieSegments.length
    ? `conic-gradient(${pieSegments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(',')})`
    : 'var(--sf2,#FFF4F1)';
  const actualStats = [
    { label: 'DAYS TOGETHER', value: couple?.startedAt ? String(Math.max(1, daysSince(couple.startedAt, new Date()))) : '—', note: couple?.startedAt ? `since ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(couple.startedAt))}` : 'date not set', gradient: 'linear-gradient(150deg,#FFE7E4,#FFF1E9)' },
    { label: 'SAVED MESSAGES', value: String(messages.length), note: 'on this device', gradient: 'linear-gradient(150deg,#E8F4DA,#F6F3E4)' },
    { label: 'SCHEDULE', value: String(events.length), note: 'your shared agenda', gradient: 'linear-gradient(150deg,#E4EAFF,#F1F0FF)' },
    { label: 'MENU DICATAT', value: String(foodEntries.length), note: 'food journal', gradient: 'linear-gradient(150deg,#FFE0EC,#F3E1FF)' },
  ];

  return (
    <ScrollColumn>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>This month's mood 🌊</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>Trend preview · mood history coming soon</div>
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
              <span style={{ width: 8, height: 8, borderRadius: 3, background: 'var(--pk,#FFB7B2)' }} />{meName}
            </span>
            <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: '#B5EAD7' }} />{partnerName}
            </span>
          </div>
        </div>

        <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Favorite food 🧋</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 16 }}>
            <div
              style={{
                width: 118,
                height: 118,
                borderRadius: '50%',
                background: pieBackground,
                flex: 'none',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'var(--sf,#fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 11px "Nunito",sans-serif', color: 'var(--ink2,#6B5B60)', textAlign: 'center' }}>
                {foodTotal}
                <br />
                entries
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {pieSegments.map((segment) => (
                <div key={segment.label} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '600 11px "Nunito",sans-serif', color: 'var(--ink2,#6B5B60)' }}>
                  <span style={{ width: 11, height: 11, borderRadius: 4, flex: 'none', background: segment.color }} />
                  <span style={{ flex: 1 }}>{segment.label}</span>
                  <span style={{ fontWeight: 800 }}>{foodTotal ? `${Math.round((segment.count / foodTotal) * 100)}%` : '0%'}</span>
                </div>
              ))}
              {pieSegments.length === 0 && <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>No food entries yet.</div>}
            </div>
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Daily activity</span>
          <span style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Visual preview</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24,1fr)', gap: 4, marginTop: 15 }}>
          {HEATMAP.map((lv, i) => (
            <div key={i} style={{ aspectRatio: 1, borderRadius: 4, background: ['#F4E7E4', '#FFD3CE', '#FFB7B2', '#E8899A'][lv] }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Automatic daily history · coming soon</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={pcss("font:600 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>quiet</span>
            {['#F4E7E4', '#FFD3CE', '#FFB7B2', '#E8899A'].map((c) => (
              <span key={c} style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
            ))}
            <span style={pcss("font:600 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>busy</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: statCols, gap: 12 }}>
        {actualStats.map((b) => (
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
