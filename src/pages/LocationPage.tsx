import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { LOCATION_HISTORY } from '../data/mockData';

export default function LocationPage() {
  const { locationOn, toggleLocation, setLocation, toast } = useAppState();

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ height: 260, position: 'relative', background: 'var(--sf2,#FFF4F1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.13) 0 12px,rgba(255,255,255,0) 12px 24px)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg,rgba(181,234,215,.14) 0 12px,rgba(255,255,255,0) 12px 24px)' }} />
          <div style={{ position: 'absolute', left: '16%', top: '58%', textAlign: 'center' }}>
            <div style={pcss('width:44px;height:44px;border-radius:50%;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 6px 16px rgba(120,90,100,.25);border:3px solid #fff')}>🧑🏻</div>
            <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-top:5px;background:#fff;padding:3px 7px;border-radius:100px;box-shadow:0 2px 6px rgba(120,90,100,.14)")}>Joshua · Kemang</div>
          </div>
          <div style={{ position: 'absolute', right: '14%', top: '22%', textAlign: 'center' }}>
            <div style={pcss('width:44px;height:44px;border-radius:50%;background:linear-gradient(140deg,#D9E9FF,#FFD3EA);display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 6px 16px rgba(120,90,100,.25);border:3px solid #fff;animation:kk-float 3.4s ease-in-out infinite')}>👩🏻</div>
            <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-top:5px;background:#fff;padding:3px 7px;border-radius:100px;box-shadow:0 2px 6px rgba(120,90,100,.14)")}>Partner 🚶‍♀️ NCCU</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '44%', borderTop: '2px dotted rgba(232,111,135,.45)', margin: '0 24%' }} />
          <div style={{ position: 'absolute', right: 14, bottom: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={pcss('width:34px;height:34px;border-radius:11px;background:#fff;box-shadow:0 3px 10px rgba(120,90,100,.16);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer')} role="button" aria-label="Perbesar">＋</div>
            <div style={pcss('width:34px;height:34px;border-radius:11px;background:#fff;box-shadow:0 3px 10px rgba(120,90,100,.16);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer')} role="button" aria-label="Perkecil">－</div>
            <div style={pcss('width:34px;height:34px;border-radius:11px;background:#fff;box-shadow:0 3px 10px rgba(120,90,100,.16);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer')} role="button" aria-label="Pusatkan" onClick={() => toast('Peta dipusatkan ke Partner')}>🎯</div>
          </div>
        </div>
        <div style={{ padding: '16px 17px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Partner lagi jalan 🚶‍♀️</span>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;color:#5FA97F;background:#E4F5EB;padding:4px 9px;border-radius:100px")}>LIVE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9, marginTop: 13 }}>
            {[
              ['JARAK', '8.421 km'],
              ['KECEPATAN', '4,2 km/j'],
              ['AKURASI', '±12 m'],
              ['UPDATE', '2 mnt lalu'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{label}</div>
                <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Bagikan lokasi</div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>
              {locationOn ? 'Aktif · Partner bisa lihat lokasi kamu' : 'Ghost mode · lokasi kamu disembunyiin 👻'}
            </div>
          </div>
          <div
            style={pcss(`width:48px;height:28px;border-radius:100px;cursor:pointer;padding:3px;display:flex;justify-content:${locationOn ? 'flex-end' : 'flex-start'};background:${locationOn ? 'var(--pk,#FFB7B2)' : 'var(--ln,rgba(74,74,74,.16))'};transition:background .2s`)}
            onClick={() => {
              toggleLocation();
              toast(locationOn ? 'Ghost mode nyala 👻' : 'Lokasi dibagikan lagi 📍');
            }}
            role="button"
            aria-pressed={locationOn}
            aria-label="Bagikan lokasi"
          >
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.16)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} role="button" onClick={() => toast('Bagikan lokasi selama 1 jam')}>1 jam</div>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} role="button" onClick={() => toast('Bagikan lokasi selama 8 jam')}>8 jam</div>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--pk,#FFB7B2);font:700 11px 'Nunito',sans-serif;color:#5C3A42;cursor:pointer")} role="button" onClick={() => setLocation(true)}>Selalu</div>
          <div
            style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}
            onClick={() => {
              setLocation(false);
              toast('Ghost mode nyala 👻 cocok buat surprise');
            }}
            role="button"
          >
            👻 Ghost mode
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);border:1px dashed rgba(232,111,135,.4);padding:16px 17px')}>
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Izin lokasi dibutuhkan 📍</div>
        <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
          Kami cuma pakai lokasi buat nunjukin jarak kalian, dan kamu bisa matiin kapan aja. Nggak ada yang lihat selain pasangan kamu.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
          <div style={pcss("padding:10px 16px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => { setLocation(true); toast('Izin lokasi diberikan ✓'); }} role="button">Izinkan</div>
          <div style={pcss("padding:10px 16px;border-radius:100px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:700 11.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Oke, nanti aja')} role="button">Nanti aja</div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-bottom:12px")}>Riwayat perjalanan dia</div>
        {LOCATION_HISTORY.map((h) => (
          <div key={h.id} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--ln,rgba(74,74,74,.07))' }}>
            <span style={{ fontSize: 15, width: 22, textAlign: 'center' }}>{h.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{h.title}</div>
              <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{h.meta}</div>
            </div>
            <span style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{h.time}</span>
          </div>
        ))}
      </div>
    </ScrollColumn>
  );
}
