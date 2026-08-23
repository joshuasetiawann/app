import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppNow, countdownParts, daysUntil, pad2 } from '../lib/appClock';
import { COUNTDOWNS } from '../data/mockData';

export default function CountdownPage() {
  const now = useAppNow(1000);
  const twoCol = useTwoColTemplate();
  const flightTarget = COUNTDOWNS[0];
  const flight = countdownParts(flightTarget.targetDate, now);
  const daysToFlight = daysUntil(flightTarget.targetDate, now);
  const flipDigits = [
    { v: pad2(flight.days), l: 'HARI' },
    { v: pad2(flight.hours), l: 'JAM' },
    { v: pad2(flight.minutes), l: 'MENIT' },
    { v: pad2(flight.seconds), l: 'DETIK' },
  ];

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:26px;padding:22px 20px;background:linear-gradient(155deg,#4A3B45,#2E2530);color:#FFF6F3;box-shadow:0 10px 28px rgba(60,45,52,.28);text-align:center')}>
        <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:rgba(255,246,243,.6)")}>KETEMU DI JAKARTA ✈️</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginTop: 16 }}>
          {flipDigits.map((d) => (
            <div key={d.l} style={{ textAlign: 'center' }}>
              <div style={pcss("width:56px;padding:12px 0;border-radius:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);font:700 26px 'Quicksand',sans-serif;color:#FFB7B2;position:relative")}>
                <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,.18)' }} />
                {d.v}
              </div>
              <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:rgba(255,246,243,.55);margin-top:6px")}>{d.l}</div>
            </div>
          ))}
        </div>
        <div style={pcss("font:500 19px 'Caveat',cursive;color:rgba(255,246,243,.85);margin-top:16px")}>{daysToFlight} hari lagi peluk kamu 🥺</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {COUNTDOWNS.map((c) => {
          const daysLeft = daysUntil(c.targetDate, now);
          return (
            <div key={c.id} style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));display:flex;align-items:center;gap:13px;cursor:pointer')}>
              <div
                style={pcss(
                  `width:42px;height:42px;border-radius:15px;flex:none;display:flex;align-items:center;justify-content:center;font-size:18px;background:${c.colorTag === 'pk' ? 'var(--sf2,#FFF4F1)' : c.colorTag === 'lav' ? '#EDE7FA' : '#E2F0CB'}`,
                )}
              >
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{c.title}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{c.when}</div>
                <div style={{ height: 5, borderRadius: 5, background: 'var(--sf2,#FFF4F1)', marginTop: 8 }}>
                  <div style={{ width: `${c.progressPercent}%`, height: 5, borderRadius: 5, background: 'linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--pki,#E86F87)")}>{daysLeft}</div>
                <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>HARI</div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollColumn>
  );
}
