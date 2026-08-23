import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { Card, HeroSurface, SectionHeader } from '../components/shared/Atoms';
import { useAppNow, formatTimeInZone, formatDateLabel, daysSince, daysUntil } from '../lib/appClock';
import { THEMES } from '../lib/theme';
import { PHOTOS, RELATIONSHIP, COUNTDOWNS } from '../data/mockData';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';

const RECENT_PHOTOS = PHOTOS.slice(0, 4);

function foodLine(status: string) {
  if (status === 'ate') return 'Kamu: udah kenyang · Partner: belum makan 🥺';
  if (status === 'now') return 'Kamu: lagi makan · Partner: belum makan 🥺';
  if (status === 'not') return 'Kalian dua-duanya belum makan! 🥺';
  return 'Partner belum update makan hari ini';
}

function foodBtnStyle(active: boolean) {
  return pcss(
    `padding:10px 15px;border-radius:100px;cursor:pointer;font:700 12px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, foodStatus, setFoodStatus, toast } = useAppState();
  const now = useAppNow(30_000);
  const twoCol = useTwoColTemplate();
  const heroBg = THEMES[theme].hero;
  const daysTogether = daysSince(RELATIONSHIP.startedAt, now);
  const daysToFlight = daysUntil(COUNTDOWNS[0].targetDate, now);
  const daysToAnniversary = daysUntil(COUNTDOWNS[1].targetDate, now);

  return (
    <ScrollColumn>
      {/* Hero: dual clock + status + days-together */}
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:20px 18px 18px;position:relative;overflow:hidden;box-shadow:0 8px 26px rgba(255,140,150,.16)')}>
        <div style={{ position: 'absolute', top: -30, right: -22, width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.55),rgba(255,255,255,0) 70%)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', position: 'relative', gap: 8 }}>
          <div>
            <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>🇮🇩 Jakarta · WIB</div>
            <div style={pcss("font:700 30px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{formatTimeInZone(now, 'Asia/Jakarta')}</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);opacity:.75;margin-top:5px")}>{formatDateLabel(now, 'Asia/Jakarta')} ☀️ 31°</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={pcss('width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 0 0 6px rgba(255,255,255,.4),0 5px 15px rgba(255,140,150,.3);animation:kk-pulse 2.6s ease-in-out infinite')}>💞</div>
            <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);background:rgba(255,255,255,.92);padding:3px 9px;border-radius:100px;white-space:nowrap")}>BEDA 1 JAM ⏳</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Taipei · CST 🇹🇼</div>
            <div style={pcss("font:700 30px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{formatTimeInZone(now, 'Asia/Taipei')}</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);opacity:.75;margin-top:5px")}>🌤️ 27° {formatDateLabel(now, 'Asia/Taipei')}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, position: 'relative' }}>
          <div style={pcss('background:rgba(255,255,255,.72);border-radius:16px;padding:11px 12px')}>
            <div style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>JOSHUA</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:4px")}>🥺 Kangen · 💻 Ngoding</div>
          </div>
          <div style={pcss('background:rgba(255,255,255,.72);border-radius:16px;padding:11px 12px')}>
            <div style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>PARTNER · ONLINE</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:4px")}>🥰 Seneng · 📚 Di kelas</div>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(255,255,255,.85)', textAlign: 'center', position: 'relative' }}>
          <div style={pcss("font:700 26px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>
            Udah <span style={{ color: 'var(--pki,#E86F87)' }}>{daysTogether} Hari</span> Bareng!
          </div>
          <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:5px")}>
            {daysToAnniversary} hari lagi anniv bulan ke-5 🎉
          </div>
        </div>
      </HeroSurface>

      {/* Food check-in */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={pcss("font:700 16px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Udah makan belum sayang?</div>
            <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{foodLine(foodStatus)}</div>
          </div>
          <span style={{ fontSize: 22, animation: 'kk-float 3s ease-in-out infinite' }}>🍜</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={foodBtnStyle(foodStatus === 'ate')} onClick={() => { setFoodStatus('ate'); toast('Makan tercatat · udah kenyang 😋'); }} role="button">Udah kenyang! 😋</div>
          <div style={foodBtnStyle(foodStatus === 'now')} onClick={() => { setFoodStatus('now'); toast('Selamat makan sayang 🍜'); }} role="button">Lagi makan 🍜</div>
          <div style={foodBtnStyle(foodStatus === 'not')} onClick={() => { setFoodStatus('not'); toast('Jangan lupa makan ya 🥺'); }} role="button">Belum nih 🥺</div>
        </div>
      </Card>

      {/* Distance + flight countdown */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>JARAK KITA</span>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={() => navigate('/location')} role="button">Live 📍</span>
          </div>
          <div style={pcss("font:700 24px/1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:8px")}>
            8.421 <span style={{ fontSize: 12, color: 'var(--mut,#A99A9E)' }}>km</span>
          </div>
          <div style={pcss('margin-top:12px;height:74px;border-radius:16px;background:var(--sf2,#FFF4F1);position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 16px;overflow:hidden')}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.16) 0 9px,rgba(255,255,255,0) 9px 18px)' }} />
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--pki,#E86F87)', boxShadow: '0 0 0 5px rgba(232,111,135,.18)', margin: '0 auto' }} />
              <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>JKT</div>
            </div>
            <div style={{ flex: 1, borderTop: '2px dotted rgba(232,111,135,.5)', margin: '0 8px', position: 'relative', top: -6 }}>
              <span style={{ position: 'absolute', left: '44%', top: -12, fontSize: 13, animation: 'kk-float 3.4s ease-in-out infinite' }}>✈️</span>
            </div>
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#84A9FF', boxShadow: '0 0 0 5px rgba(132,169,255,.2)', margin: '0 auto' }} />
              <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>TPE</div>
            </div>
          </div>
          <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:9px")}>Jauh di mata, dekat di hati ✈️</div>
        </Card>

        <div style={pcss('border-radius:24px;padding:16px 17px;background:linear-gradient(155deg,#4A3B45,#2E2530);color:#FFF6F3;box-shadow:0 8px 22px rgba(60,45,52,.25)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 11px 'Nunito',sans-serif;color:rgba(255,246,243,.6)")}>KETEMU LAGI ✈️</span>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;color:#FFB7B2")}>1 Jun</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 10 }}>
            <span style={pcss("font:700 38px/.9 'Quicksand',sans-serif;color:#FFB7B2")}>{daysToFlight}</span>
            <span style={pcss("font:500 17px 'Caveat',cursive;color:rgba(255,246,243,.8);padding-bottom:4px")}>hari lagi</span>
          </div>
          <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,.16)', marginTop: 14 }}>
            <div style={{ width: '64%', height: 6, borderRadius: 6, background: 'linear-gradient(90deg,#FFB7B2,#E3D7F7)' }} />
          </div>
          <div style={pcss("font:600 10px 'Nunito',sans-serif;color:rgba(255,246,243,.6);margin-top:9px")}>CI 761 · Taipei → Jakarta · 06:20</div>
          <div
            style={pcss('margin-top:12px;padding:9px 0;text-align:center;border-radius:100px;background:rgba(255,255,255,.14);font:700 11.5px "Nunito",sans-serif;cursor:pointer')}
            onClick={() => navigate('/countdown')}
            role="button"
          >
            Lihat semua countdown
          </div>
        </div>
      </div>

      {/* Recent photos */}
      <div>
        <SectionHeader title="Recent Photo 📸" action="Lihat semua" onAction={() => navigate('/gallery')} />
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '6px 2px 14px' }}>
          {RECENT_PHOTOS.map((p, i) => (
            <PhotoOpenTarget
              key={p.id}
              index={i}
              style={pcss(`flex:none;width:158px;background:#fff;padding:10px 10px 0;border-radius:5px;box-shadow:0 8px 20px rgba(120,90,100,.16);transform:rotate(${p.rotationDeg ?? 0}deg);cursor:pointer;transition:transform .2s`)}
            >
              <div style={pcss('aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;border-radius:2px')}>
                <span style={pcss("font:700 9px 'Nunito',sans-serif;color:rgba(74,74,74,.32)")}>{p.slotLabel}</span>
              </div>
              <div style={{ padding: '9px 3px 4px', textAlign: 'center' }}>
                <div style={pcss("font:600 16px/1.1 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>{p.caption}</div>
                <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{p.meta}</div>
              </div>
            </PhotoOpenTarget>
          ))}
        </div>
      </div>

      {/* Schedule + love note teaser */}
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Jadwal terdekat</span>
            <span style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={() => navigate('/schedule')} role="button">Kalender</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 13 }}>
            <UpcomingRow icon="📞" bg="var(--sf2,#FFF4F1)" title="Video call malam" meta="21:00 WIB · 22:00 CST" right="5j lagi" rightColor="var(--pki,#E86F87)" />
            <UpcomingRow icon="🎂" bg="#EDE7FA" title="Ulang tahun Partner" meta="28 Mei 2026" right="8 hari" rightColor="var(--mut,#A99A9E)" />
            <UpcomingRow icon="🎉" bg="#E2F0CB" title="Anniversary bulan ke-5" meta="27 Mei 2026" right={`${daysToAnniversary} hari`} rightColor="var(--mut,#A99A9E)" />
          </div>
        </Card>
        <div style={pcss('border-radius:24px;background:var(--sf2,#FFF4F1);border:1px dashed rgba(232,111,135,.45);padding:16px 17px;cursor:pointer')} onClick={() => navigate('/notes')} role="button">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>SURAT TERSEGEL 💌</span>
            <span style={{ fontSize: 17, display: 'inline-block', animation: 'kk-wiggle 2.2s ease-in-out infinite' }}>🔒</span>
          </div>
          <div style={pcss("font:600 21px/1.2 'Caveat',cursive;color:var(--ink,#4A4A4A);margin-top:8px")}>&ldquo;Buka kalau kamu kangen banget sama aku 🥺&rdquo;</div>
          <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:8px")}>dari Partner · 2 surat menunggu</div>
          <div style={pcss("margin-top:12px;display:inline-block;padding:8px 15px;border-radius:100px;background:var(--sf,#fff);font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>
            Eits, sabar belum waktunya 🤫
          </div>
        </div>
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
