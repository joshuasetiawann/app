import { useNavigate } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import { useAppNow, weekdayInZone } from '../../lib/appClock';

export function RightRail() {
  const navigate = useNavigate();
  const { toast } = useAppState();
  const today = weekdayInZone(useAppNow(3_600_000), 'Asia/Jakarta');

  return (
    <aside style={pcss('display:flex;flex-direction:column;gap:14px;padding:18px 18px 26px;border-left:1px solid var(--ln,rgba(74,74,74,.08));background:var(--bg,#FDFBF7);overflow-y:auto')}>
      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={pcss('width:42px;height:42px;border-radius:15px;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:19px;position:relative')}>
            👩🏻
            <span style={{ position: 'absolute', right: -1, bottom: -1, width: 12, height: 12, borderRadius: '50%', background: '#7BD3A8', border: '2px solid var(--sf,#fff)' }} />
          </div>
          <div>
            <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Partner</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:#5FA97F")}>Online · Taipei 🇹🇼</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 13 }}>
          <div style={pcss("display:flex;justify-content:space-between;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span>🍜 Makan</span>
            <span style={{ color: 'var(--pki,#E86F87)', fontWeight: 700 }}>Belum nih 🥺</span>
          </div>
          <div style={pcss("display:flex;justify-content:space-between;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span>🥰 Mood</span>
            <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700 }}>Seneng</span>
          </div>
          <div style={pcss("display:flex;justify-content:space-between;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span>📚 Aktivitas</span>
            <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700 }}>Di kelas</span>
          </div>
          <div style={pcss("display:flex;justify-content:space-between;font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span>📍 Lokasi</span>
            <span style={{ color: 'var(--ink,#4A4A4A)', fontWeight: 700 }}>NCCU</span>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <div style={pcss("flex:1;text-align:center;padding:9px 0;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => navigate('/chat')}>
            Sapa dia 💬
          </div>
          <div
            style={pcss("flex:none;padding:9px 13px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}
            onClick={() => toast('Nudge dikirim ke Partner 💌')}
          >
            Nudge
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-bottom:11px")}>Hari ini · {today}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);width:38px;flex:none;padding-top:2px")}>09:00</div>
            <div style={{ flex: 1, borderLeft: '3px solid #B5EAD7', paddingLeft: 9 }}>
              <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Kelas Basis Data</div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Kampus · pribadi</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);width:38px;flex:none;padding-top:2px")}>19:30</div>
            <div style={{ flex: 1, borderLeft: '3px solid #E2F0CB', paddingLeft: 9 }}>
              <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Gym</div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>pribadi</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--pki,#E86F87);width:38px;flex:none;padding-top:2px")}>21:00</div>
            <div style={{ flex: 1, borderLeft: '3px solid var(--pk,#FFB7B2)', paddingLeft: 9 }}>
              <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Video call ❤️</div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>berdua · 22:00 di Taipei</div>
            </div>
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')} onClick={() => navigate('/location')}>
        <div style={pcss('height:132px;background:var(--sf2,#FFF4F1);position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 22px')}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.14) 0 10px,rgba(255,255,255,0) 10px 20px)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--pki,#E86F87)', boxShadow: '0 0 0 6px rgba(232,111,135,.16)', position: 'relative' }} />
          <div style={{ flex: 1, borderTop: '2px dotted rgba(232,111,135,.45)', margin: '0 6px', position: 'relative', top: -4 }}>
            <span style={{ position: 'absolute', left: '38%', top: -11, fontSize: 12 }}>✈️</span>
          </div>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#84A9FF', boxShadow: '0 0 0 6px rgba(132,169,255,.18)', position: 'relative' }} />
        </div>
        <div style={{ padding: '13px 16px' }}>
          <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Live location aktif</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>Partner lagi jalan · 4,2 km/j · 2 mnt lalu</div>
        </div>
      </div>
    </aside>
  );
}
