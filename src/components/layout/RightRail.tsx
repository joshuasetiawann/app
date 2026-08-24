import { useNavigate } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import { useAuthState } from '../../state/AuthState';
import { useAppNow, weekdayInZone } from '../../lib/appClock';

export function RightRail() {
  const navigate = useNavigate();
  const { events, setDraft } = useAppState();
  const { partner, couple } = useAuthState();
  const today = weekdayInZone(useAppNow(3_600_000), Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const partnerName = partner?.nickname || partner?.name || 'Pasangan';
  const partnerPlace = partner ? [partner.city, partner.countryFlag].filter(Boolean).join(' ') : '';
  const connectionLabel = partner
    ? ['Terhubung', partnerPlace].filter(Boolean).join(' · ')
    : couple
      ? 'Menunggu pasangan bergabung'
      : 'Belum terhubung';
  const upcoming = events.slice(0, 3);

  const greetPartner = () => {
    if (!partner) {
      navigate('/pair');
      return;
    }
    setDraft(`Hai ${partnerName.replaceAll('"', '')} 👋`);
    navigate('/chat');
  };

  return (
    <aside style={pcss('display:flex;flex-direction:column;gap:14px;padding:18px 18px 26px;border-left:1px solid var(--ln,rgba(74,74,74,.08));background:var(--bg,#FDFBF7);overflow-y:auto')}>
      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={pcss('width:42px;height:42px;border-radius:15px;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:19px;position:relative')}>
            {partner?.avatarEmoji || '👤'}
            {partner && <span aria-hidden="true" style={{ position: 'absolute', right: -1, bottom: -1, width: 12, height: 12, borderRadius: '50%', background: '#7BD3A8', border: '2px solid var(--sf,#fff)' }} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{partnerName}</div>
            <div style={pcss(`font:600 10.5px 'Nunito',sans-serif;color:${partner ? '#5FA97F' : 'var(--mut,#A99A9E)'}`)}>{connectionLabel}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 13 }}>
          {[
            ['🍜 Makan', 'Belum ada update'],
            ['🥰 Mood', 'Tanya di Chat'],
            ['📚 Aktivitas', 'Tanya di Chat'],
            ['📍 Lokasi', partner ? 'Lihat ping terbaru' : 'Belum tersedia'],
          ].map(([label, value]) => (
            <div key={label} style={pcss("display:flex;justify-content:space-between;gap:12px;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
              <span>{label}</span>
              <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700, textAlign: 'right' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={pcss("flex:1;text-align:center;padding:9px 0;border:0;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer;appearance:none")}
            onClick={greetPartner}
          >
            {partner ? `Sapa ${partnerName} 💬` : 'Hubungkan pasangan'}
          </button>
          <button
            type="button"
            disabled
            title="Push notification akan tersedia setelah layanan notifikasi diaktifkan"
            style={pcss("flex:none;padding:9px 13px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);cursor:not-allowed;opacity:.68;appearance:none")}
          >
            Push nanti
          </button>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 11 }}>
          <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Jadwal · {today}</div>
          <button type="button" onClick={() => navigate('/schedule')} style={pcss("border:0;background:transparent;padding:2px;color:var(--pki,#E86F87);font:800 10px 'Nunito',sans-serif;cursor:pointer")}>Lihat semua</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {upcoming.map((event) => (
            <button
              type="button"
              key={event.id}
              onClick={() => navigate('/schedule')}
              style={pcss('display:flex;gap:10px;width:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer;color:inherit;appearance:none')}
            >
              <div aria-hidden="true" style={pcss("width:28px;height:28px;flex:none;border-radius:10px;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:13px")}>{event.icon}</div>
              <div style={{ flex: 1, minWidth: 0, borderLeft: `3px solid ${event.colorTag === 'pk' ? 'var(--pk,#FFB7B2)' : '#B5EAD7'}`, paddingLeft: 9 }}>
                <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{event.title}</div>
                <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{event.when}</div>
              </div>
            </button>
          ))}
          {upcoming.length === 0 && (
            <button type="button" onClick={() => navigate('/schedule')} style={pcss("width:100%;padding:12px;border:1px dashed var(--ln,rgba(74,74,74,.12));border-radius:14px;background:transparent;color:var(--mut,#A99A9E);font:600 10.5px/1.45 'Nunito',sans-serif;cursor:pointer")}>Belum ada acara. Buat jadwal pertama kalian.</button>
          )}
        </div>
      </div>

      <button
        type="button"
        aria-label={partner ? `Buka lokasi ${partnerName}` : 'Hubungkan pasangan'}
        style={pcss('display:block;width:100%;border:0;padding:0;border-radius:22px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer;text-align:left;color:inherit;font:inherit;appearance:none')}
        onClick={() => navigate(partner ? '/location' : '/pair')}
      >
        <div style={pcss('height:132px;background:var(--sf2,#FFF4F1);position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 22px')}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.14) 0 10px,rgba(255,255,255,0) 10px 20px)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--pki,#E86F87)', boxShadow: '0 0 0 6px rgba(232,111,135,.16)', position: 'relative' }} />
          <div style={{ flex: 1, borderTop: '2px dotted rgba(232,111,135,.45)', margin: '0 6px', position: 'relative', top: -4 }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '38%', top: -11, fontSize: 12 }}>✈️</span>
          </div>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#84A9FF', boxShadow: '0 0 0 6px rgba(132,169,255,.18)', position: 'relative' }} />
        </div>
        <div style={{ padding: '13px 16px' }}>
          <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{partner ? `Lokasi ${partnerName}` : 'Lokasi pasangan'}</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{partner ? 'Buka untuk melihat ping terbaru atau mulai berbagi' : 'Hubungkan pasangan untuk berbagi lokasi dengan izin'}</div>
        </div>
      </button>
    </aside>
  );
}
