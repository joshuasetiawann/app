import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { daysSince } from '../lib/appClock';

export default function StatsPage() {
  const { profile, partner, couple } = useAuthState();
  const { viewport, foodEntries, messages, events, photos, memories, mood, partnerMood, activity, partnerActivity } = useAppState();
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
    : [...sortedCategoryCounts.slice(0, 4), ['Other', sortedCategoryCounts.slice(4).reduce((sum, [, count]) => sum + count, 0)]];
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
    { label: 'MESSAGES', value: String(messages.length), note: 'in your shared conversation', gradient: 'linear-gradient(150deg,#E8F4DA,#F6F3E4)' },
    { label: 'PICTURES', value: String(photos.length), note: `${memories.length} saved memories`, gradient: 'linear-gradient(150deg,#E4EAFF,#F1F0FF)' },
    { label: 'SHARED PLANS', value: String(events.length), note: `${foodEntries.length} food journal entries`, gradient: 'linear-gradient(150deg,#FFE0EC,#F3E1FF)' },
  ];

  return (
    <ScrollColumn>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <div style={pcss('border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>How you both feel right now 🌊</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>Live from your shared Supabase space</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 15 }}>
            {[[meName, mood], [partnerName, partnerMood]].map(([name, value], index) => (
              <div key={name} style={pcss('display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-radius:16px;background:var(--sf2,#FFF4F1)')}>
                <span style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>{name}</span>
                <span style={pcss(`font:700 12px 'Nunito',sans-serif;color:${index === 0 ? 'var(--pki,#E86F87)' : '#5C8B70'};text-align:right`)}>{value || 'Not set'}</span>
              </div>
            ))}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Current activity</span>
          <span style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Synced automatically</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 10, marginTop: 14 }}>
          {[[meName, activity], [partnerName, partnerActivity]].map(([name, value]) => (
            <div key={name} style={pcss('padding:14px 15px;border-radius:17px;background:var(--sf2,#FFF4F1)')}>
              <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{name}</div>
              <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:4px")}>{value || 'Not set'}</div>
            </div>
          ))}
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
