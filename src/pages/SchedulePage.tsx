import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { BigButton, Card } from '../components/shared/Atoms';
import { CALENDAR_DOTS, CAL_LEAD_BLANKS, EVENTS, TODAY_DOM } from '../data/mockData';
import { weekdayInZone } from '../lib/appClock';

const AGENDA_TABS = ['Hari', 'Minggu', 'Bulan', 'Agenda'] as const;
const WEEKDAY_LETTERS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

function agBtnStyle(active: boolean) {
  return pcss(
    `flex:1;text-align:center;padding:9px 0;border-radius:14px;cursor:pointer;font:700 11.5px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf,#fff)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'};box-shadow:0 2px 8px rgba(120,90,100,.07)`,
  );
}

export default function SchedulePage() {
  const { agendaView, setAgendaView, openSheet, toast } = useAppState();
  const days = [
    ...Array.from({ length: CAL_LEAD_BLANKS }, () => null),
    ...Array.from({ length: 31 }, (_, i) => i + 1),
  ];

  return (
    <ScrollColumn>
      <Card style={{ padding: 17 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Mei 2026</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={pcss('width:28px;height:28px;border-radius:50%;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer')} role="button" aria-label="Bulan sebelumnya" onClick={() => toast('April 2026')}>
              ‹
            </span>
            <span style={pcss('width:28px;height:28px;border-radius:50%;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer')} role="button" aria-label="Bulan berikutnya" onClick={() => toast('Juni 2026')}>
              ›
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginTop: 14, textAlign: 'center' }}>
          {WEEKDAY_LETTERS.map((l, i) => (
            <div key={`${l}-${i}`} style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);padding-bottom:6px")}>
              {l}
            </div>
          ))}
          {days.map((d, i) => {
            const today = d === TODAY_DOM;
            const dot = d ? CALENDAR_DOTS[d] : '';
            return (
              <div
                key={i}
                onClick={() => d && toast(`${weekdayInZone(new Date(Date.UTC(2026, 4, d)), 'UTC')}, ${d} Mei 2026`)}
                role={d ? 'button' : undefined}
                style={pcss(
                  `aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;cursor:${d ? 'pointer' : 'default'};font:${today ? '800' : '600'} 11.5px "Nunito",sans-serif;color:${today ? '#5C3A42' : d ? 'var(--ink2,#6B5B60)' : 'transparent'};background:${today ? 'var(--pk,#FFB7B2)' : 'transparent'}`,
                )}
              >
                <span>{d ?? ''}</span>
                <span style={dot ? { width: 5, height: 5, borderRadius: '50%', background: dot } : { display: 'none' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pk,#FFB7B2)' }} />Berdua
          </span>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B5EAD7' }} />Pribadi kamu
          </span>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E3D7F7' }} />Pribadi dia
          </span>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 7 }}>
        {AGENDA_TABS.map((t) => (
          <div key={t} style={agBtnStyle(agendaView === t)} onClick={() => setAgendaView(t)} role="button">
            {t}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {EVENTS.map((e) => (
          <div key={e.id} style={pcss('display:flex;gap:12px;border-radius:20px;background:var(--sf,#fff);padding:14px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <div
              style={pcss(
                `width:40px;height:40px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;font-size:17px;background:${e.colorTag === 'pk' ? 'var(--sf2,#FFF4F1)' : '#E2F0CB'}`,
              )}
            >
              {e.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{e.title}</span>
                <span
                  style={pcss(
                    `flex:none;font:800 9px "Nunito",sans-serif;padding:3px 8px;border-radius:100px;background:${e.colorTag === 'pk' ? 'var(--pk,#FFB7B2)' : '#D7EFE2'};color:#5C3A42`,
                  )}
                >
                  {e.scope}
                </span>
              </div>
              <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{e.when}</div>
              {e.tzNote && <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);margin-top:3px")}>{e.tzNote}</div>}
            </div>
          </div>
        ))}
      </div>

      <BigButton label="+ Bikin acara baru" onClick={() => openSheet('event')} />
    </ScrollColumn>
  );
}
