import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { Card, HeroSurface, SectionHeader } from '../components/shared/Atoms';
import { useAppNow, formatTimeInZone, formatDateLabel, daysSince, daysUntil } from '../lib/appClock';
import { THEMES } from '../lib/theme';
import { RELATIONSHIP, COUNTDOWNS } from '../data/mockData';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { useAuthState } from '../state/AuthState';

function foodStatusLabel(status: string) {
  if (status === 'ate') return 'already ate';
  if (status === 'now') return 'eating now';
  if (status === 'not') return 'has not eaten';
  return 'no check-in yet';
}

function foodLine(status: string, partnerStatus: string) {
  return `You: ${foodStatusLabel(status)} · Partner: ${foodStatusLabel(partnerStatus)}`;
}

function zoneAbbreviation(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}

function zoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return (Date.UTC(value('year'), value('month') - 1, value('day'), value('hour') % 24, value('minute'), value('second')) - date.getTime()) / 60_000;
}

function foodBtnStyle(active: boolean) {
  return pcss(
    `padding:10px 15px;border:0;border-radius:100px;cursor:pointer;font:700 12px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, partner, couple } = useAuthState();
  const { theme, foodStatus, partnerFoodStatus, setFoodStatus, toast, mood, activity, partnerMood, partnerActivity, events, photos } = useAppState();
  const now = useAppNow(30_000);
  const twoCol = useTwoColTemplate();
  const heroBg = THEMES[theme].hero;
  const isDemo = profile?.email.endsWith('@demo.kisahkita') ?? false;
  const myZone = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const partnerZone = partner?.timezone || myZone;
  const myCity = profile?.city || 'Your city';
  const partnerCity = partner?.city || "Partner's city";
  const zoneDifference = Math.abs(zoneOffsetMinutes(now, partnerZone) - zoneOffsetMinutes(now, myZone)) / 60;
  const zoneDifferenceLabel = zoneDifference === 0 ? 'SAME TIME ZONE' : `${Number.isInteger(zoneDifference) ? zoneDifference : zoneDifference.toFixed(1)} HOURS APART ⏳`;
  const daysTogether = Math.max(1, daysSince(couple?.startedAt || RELATIONSHIP.startedAt, now));
  const nextCountdown = [...COUNTDOWNS]
    .filter((countdown) => new Date(countdown.targetDate).getTime() > now.getTime())
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];
  const daysToNext = nextCountdown ? daysUntil(nextCountdown.targetDate, now) : 0;

  return (
    <ScrollColumn>
      {/* Hero: dual clock + status + days-together */}
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:20px 18px 18px;position:relative;overflow:hidden;box-shadow:0 8px 26px rgba(255,140,150,.16)')}>
        <div style={{ position: 'absolute', top: -30, right: -22, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.55),rgba(255,255,255,0) 70%)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', position: 'relative', gap: 8 }}>
          <div>
            <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>{profile?.countryFlag || '📍'} {myCity} · {zoneAbbreviation(now, myZone)}</div>
            <div style={pcss("font:700 30px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{formatTimeInZone(now, myZone)}</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);opacity:.75;margin-top:5px")}>{formatDateLabel(now, myZone)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={pcss('width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 0 6px rgba(255,255,255,.4),0 5px 15px rgba(255,140,150,.3);animation:kk-pulse 2.6s ease-in-out infinite')}>💞</div>
            <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);background:rgba(255,255,255,.92);padding:3px 9px;border-radius:100px;white-space:nowrap")}>{zoneDifferenceLabel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>{partnerCity} · {zoneAbbreviation(now, partnerZone)} {partner?.countryFlag || '📍'}</div>
            <div style={pcss("font:700 30px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{formatTimeInZone(now, partnerZone)}</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);opacity:.75;margin-top:5px")}>{formatDateLabel(now, partnerZone)}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, position: 'relative' }}>
          <div style={pcss('background:rgba(255,255,255,.72);border-radius:16px;padding:11px 12px')}>
            <div style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{(profile?.nickname || profile?.name || 'YOU').toUpperCase()}</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:4px")}>{mood} · {activity}</div>
          </div>
          <div style={pcss('background:rgba(255,255,255,.72);border-radius:16px;padding:11px 12px')}>
            <div style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{(partner?.nickname || partner?.name || 'PARTNER').toUpperCase()}</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:4px")}>{partnerMood} · {partnerActivity}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(255,255,255,.85)', textAlign: 'center', position: 'relative' }}>
          <div style={pcss("font:700 26px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>
            <span style={{ color: 'var(--pki,#E86F87)' }}>{daysTogether} days</span> together!
          </div>
          <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:5px")}>
            Since {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(`${couple?.startedAt || RELATIONSHIP.startedAt}T00:00:00`))} 💗
          </div>
        </div>
      </HeroSurface>

      {/* Food check-in */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={pcss("font:700 16px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Have you eaten yet?</div>
            <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{foodLine(foodStatus, partnerFoodStatus)}</div>
          </div>
          <span style={{ fontSize: 22, animation: 'kk-float 3s ease-in-out infinite' }}>🍜</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <button type="button" style={foodBtnStyle(foodStatus === 'ate')} onClick={() => { setFoodStatus('ate'); toast('Meal saved · feeling full 😋'); }} aria-pressed={foodStatus === 'ate'}>I already ate 😋</button>
          <button type="button" style={foodBtnStyle(foodStatus === 'now')} onClick={() => { setFoodStatus('now'); toast('Enjoy your meal 🍜'); }} aria-pressed={foodStatus === 'now'}>Eating now 🍜</button>
          <button type="button" style={foodBtnStyle(foodStatus === 'not')} onClick={() => { setFoodStatus('not'); toast('Remember to eat something 🥺'); }} aria-pressed={foodStatus === 'not'}>Not yet 🥺</button>
        </div>
      </Card>

      {/* Distance + flight countdown */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{isDemo ? 'CONTOH JARAK' : 'JARAK KITA'}</span>
            <button type="button" style={pcss("border:0;background:transparent;padding:4px;font:700 10px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={() => navigate('/location')}>Open distance map 📍</button>
          </div>
          <div style={pcss("font:700 24px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:8px")}>
            {isDemo ? '8.421' : '—'} <span style={{ fontSize: 12, color: 'var(--mut,#A99A9E)' }}>km</span>
          </div>
          <div style={pcss('margin-top:12px;height:74px;border-radius:16px;background:var(--sf2,#FFF4F1);position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 16px;overflow:hidden')}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.16) 0 9px,rgba(255,255,255,0) 9px 18px)' }} />
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--pki,#E86F87)', boxShadow: '0 0 0 5px rgba(232,111,135,.18)', margin: '0 auto' }} />
              <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>{myCity.slice(0, 3).toUpperCase()}</div>
            </div>
            <div style={{ flex: 1, borderTop: '2px dotted rgba(232,111,135,.5)', margin: '0 8px', position: 'relative', top: -6 }}>
              <span style={{ position: 'absolute', left: '44%', top: -12, fontSize: 13, animation: 'kk-float 3.4s ease-in-out infinite' }}>✈️</span>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#84A9FF', boxShadow: '0 0 0 5px rgba(132,169,255,.2)', margin: '0 auto' }} />
              <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>{partnerCity.slice(0, 3).toUpperCase()}</div>
            </div>
          </div>
          <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:9px")}>Jauh di mata, dekat di hati ✈️</div>
        </Card>

        <div style={pcss('border-radius:24px;padding:16px 17px;background:linear-gradient(155deg,#4A3B45,#2E2530);color:#FFF6F3;box-shadow:0 8px 22px rgba(60,45,52,.25)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 11px 'Nunito',sans-serif;color:rgba(255,246,243,.6)")}>{isDemo && nextCountdown ? nextCountdown.title.toUpperCase() : 'MOMEN BERIKUTNYA'} {isDemo && nextCountdown ? nextCountdown.icon : '✨'}</span>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;color:#FFB7B2")}>{isDemo && nextCountdown ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(new Date(nextCountdown.targetDate)) : 'Not set'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
            <span style={pcss("font:700 38px/.9 'Quicksand',sans-serif;color:#FFB7B2")}>{isDemo && nextCountdown ? daysToNext : '—'}</span>
            <span style={pcss("font:500 17px 'Caveat',cursive;color:rgba(255,246,243,.8);padding-bottom:4px")}>{isDemo && nextCountdown ? 'days left' : 'create your first countdown'}</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,.16)', marginTop: 14 }}>
            <div style={{ width: '64%', height: 6, borderRadius: 6, background: 'linear-gradient(90deg,#FFB7B2,#E3D7F7)' }} />
          </div>
          <div style={pcss("font:600 10px 'Nunito',sans-serif;color:rgba(255,246,243,.6);margin-top:9px")}>{isDemo && nextCountdown ? nextCountdown.when : 'Add an important moment to see it here.'}</div>
          <button
            type="button"
            style={pcss('width:100%;border:0;color:inherit;margin-top:12px;padding:9px 0;text-align:center;border-radius:100px;background:rgba(255,255,255,.14);font:700 11.5px "Nunito",sans-serif;cursor:pointer')}
            onClick={() => navigate('/countdown')}
          >
            View all countdown
          </button>
        </div>
      </div>

      {/* Recent photos */}
      <div>
        <SectionHeader title="Latest pictures 📸" action="View all" onAction={() => navigate('/gallery')} />
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '6px 2px 14px' }}>
          {photos.slice(0, 4).map((p, i) => (
            <PhotoOpenTarget
              key={p.id}
              index={i}
              style={pcss(`flex:none;width:158px;background:#fff;padding:10px 10px 0;border-radius:5px;box-shadow:0 8px 20px rgba(120,90,100,.16);transform:rotate(${p.rotationDeg ?? 0}deg);cursor:pointer;transition:transform .2s`)}
            >
              <div style={pcss('aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;border-radius:2px')}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={pcss("font:700 9px 'Nunito',sans-serif;color:rgba(74,74,74,.32)")}>{p.slotLabel}</span>}
              </div>
              <div style={{ padding: '9px 3px 4px', textAlign: 'center' }}>
                <div style={pcss("font:600 16px/1.1 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>{p.caption}</div>
                <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{p.meta}</div>
              </div>
            </PhotoOpenTarget>
          ))}
          {photos.length === 0 && (
            <button
              type="button"
              onClick={() => navigate('/chat')}
              style={pcss("width:100%;padding:24px;border:1px dashed var(--ln,rgba(74,74,74,.14));border-radius:20px;background:var(--sf,#fff);font:600 11.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);cursor:pointer")}
            >
              No pictures in this space yet. Send your first picture from Chat 📷
            </button>
          )}
        </div>
      </div>

      {/* Schedule + love note teaser */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Coming up</span>
            <button type="button" style={pcss("border:0;background:transparent;padding:4px;font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={() => navigate('/schedule')}>Kalender</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 13 }}>
            {events.slice(0, 3).map((event) => (
              <UpcomingRow
                key={event.id}
                icon={event.icon}
                bg={event.colorTag === 'mint' ? '#E2F0CB' : 'var(--sf2,#FFF4F1)'}
                title={event.title}
                meta={`${event.when}${event.tzNote ? ` · ${event.tzNote}` : ''}`}
                right={event.scope}
                rightColor={event.scope === 'Berdua' ? 'var(--pki,#E86F87)' : 'var(--mut,#A99A9E)'}
              />
            ))}
            {events.length === 0 && (
              <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>No plans yet. Add one from Schedule.</div>
            )}
          </div>
        </Card>
        <button type="button" style={pcss('border-radius:24px;background:var(--sf2,#FFF4F1);border:1px dashed rgba(232,111,135,.45);padding:16px 17px;cursor:pointer;text-align:left;color:inherit')} onClick={() => navigate('/notes')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>SEALED NOTE 💌</span>
            <span style={{ fontSize: 17, display: 'inline-block', animation: 'kk-wiggle 2.2s ease-in-out infinite' }}>🔒</span>
          </div>
          <div style={pcss("font:600 21px/1.2 'Caveat',cursive;color:var(--ink,#4A4A4A);margin-top:8px")}>&ldquo;{isDemo ? 'Open when you really miss me 🥺' : 'There are no sealed notes in this space yet.'}&rdquo;</div>
          <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:8px")}>{isDemo ? 'from Partner · 2 notes waiting' : 'Open Love Notes to see this feature.'}</div>
          <div style={pcss("margin-top:12px;display:inline-block;padding:8px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>
            {isDemo ? 'Not yet—this one is still sealed 🤫' : 'View love note'}
          </div>
        </button>
      </div>
    </ScrollColumn>
  );
}

function UpcomingRow({ icon, bg, title, meta, right, rightColor }: { icon: string; bg: string; title: string; meta: string; right: string; rightColor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flex: 'none' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{title}</div>
        <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{meta}</div>
      </div>
      <div style={{ font: '700 10px "Nunito",sans-serif', color: rightColor, flex: 'none' }}>{right}</div>
    </div>
  );
}
