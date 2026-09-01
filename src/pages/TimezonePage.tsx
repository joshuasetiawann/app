import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppNow, formatTimeInZone, formatDateLabel } from '../lib/appClock';
import { TZ_HOURS } from '../data/mockData';
import { useAuthState } from '../state/AuthState';

function timePart(date: Date, timeZone: string, type: 'hour' | 'year') {
  const options: Intl.DateTimeFormatOptions = type === 'hour'
    ? { hour: 'numeric', hourCycle: 'h23', timeZone }
    : { year: 'numeric', timeZone };
  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
  return Number(parts.find((part) => part.type === type)?.value ?? 0);
}

function dayPeriod(date: Date, timeZone: string) {
  const hour = timePart(date, timeZone, 'hour');
  if (hour < 5) return 'late night';
  if (hour < 11) return 'morning';
  if (hour < 15) return 'afternoon';
  if (hour < 18) return 'evening';
  return 'night';
}

function zoneOffset(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}

export default function TimezonePage() {
  const { profile, partner } = useAuthState();
  const now = useAppNow(30_000);
  const twoCol = useTwoColTemplate();
  const myZone = profile?.timezone || 'Asia/Jakarta';
  const partnerZone = partner?.timezone || 'Asia/Taipei';
  const myPlace = profile?.city || profile?.country || 'Your location';
  const partnerPlace = partner?.city || partner?.country || "Partner's location";

  return (
    <ScrollColumn>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <div style={pcss('border-radius:26px;padding:20px;background:linear-gradient(160deg,#FFF3DC,#FFE7D3);box-shadow:0 8px 22px rgba(220,160,110,.16)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 12px 'Nunito',sans-serif;color:#7A5A3A")}>{profile?.countryFlag || '📍'} {myPlace}</span>
            <span style={{ fontSize: 20 }}>{timePart(now, myZone, 'hour') >= 18 || timePart(now, myZone, 'hour') < 6 ? '🌙' : '☀️'}</span>
          </div>
          <div style={pcss("font:700 46px/1 'Quicksand',sans-serif;color:#5C4126;margin-top:12px")}>{formatTimeInZone(now, myZone)}</div>
          <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:#8A6B4A;margin-top:6px")}>{formatDateLabel(now, myZone)} {timePart(now, myZone, 'year')} · {dayPeriod(now, myZone)}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#A6805A")}>ZONE</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#5C4126")}>{zoneOffset(now, myZone)}</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#A6805A")}>SOURCE</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#5C4126")}>Device clock</div>
            </div>
          </div>
        </div>
        <div style={pcss('border-radius:26px;padding:20px;background:linear-gradient(160deg,#E5E8FF,#F2E4FF);box-shadow:0 8px 22px rgba(120,110,200,.16)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 12px 'Nunito',sans-serif;color:#4E4A80")}>{partner?.countryFlag || '💞'} {partnerPlace}</span>
            <span style={{ fontSize: 20 }}>{timePart(now, partnerZone, 'hour') >= 18 || timePart(now, partnerZone, 'hour') < 6 ? '🌙' : '☀️'}</span>
          </div>
          <div style={pcss("font:700 46px/1 'Quicksand',sans-serif;color:#332F5C;margin-top:12px")}>{formatTimeInZone(now, partnerZone)}</div>
          <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:#5F5A94;margin-top:6px")}>{formatDateLabel(now, partnerZone)} {timePart(now, partnerZone, 'year')} · {dayPeriod(now, partnerZone)}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#807BB5")}>ZONE</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#332F5C")}>{zoneOffset(now, partnerZone)}</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#807BB5")}>SOURCE</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#332F5C")}>Device clock</div>
            </div>
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Estimated shared awake hours</div>
        <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>General 06:00–22:00 pattern · personal sleep schedules are not applied yet</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
          {TZ_HOURS.map((h) => (
            <div key={h.label} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: h.both ? 46 : 22, borderRadius: 8, background: h.both ? '#FFD9A8' : '#C9C2E8' }} />
              <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>{h.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: '#FFD9A8' }} />Both awake
          </span>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: '#C9C2E8' }} />One asleep
          </span>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:17px;border:1px dashed rgba(232,111,135,.4)')}>
        <div style={pcss("font:600 21px/1.35 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>
          &ldquo;It is {formatTimeInZone(now, partnerZone)} in {partnerPlace} — {dayPeriod(now, partnerZone) === 'night' ? 'a good time to say good night' : 'a good time to check in'} 💞&rdquo;
        </div>
        <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:9px")}>Based on both profiles · updates every 30 seconds</div>
      </div>
    </ScrollColumn>
  );
}
