import { pcss } from '../lib/pcss';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { useAppNow, formatTimeInZone, formatDateLabel } from '../lib/appClock';
import { TZ_HOURS } from '../data/mockData';

export default function TimezonePage() {
  const now = useAppNow(30_000);
  const twoCol = useTwoColTemplate();

  return (
    <ScrollColumn>
      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        <div style={pcss('border-radius:26px;padding:20px;background:linear-gradient(160deg,#FFF3DC,#FFE7D3);box-shadow:0 8px 22px rgba(220,160,110,.16)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 12px 'Nunito',sans-serif;color:#7A5A3A")}>🇮🇩 Indonesia · WIB</span>
            <span style={{ fontSize: 20 }}>☀️</span>
          </div>
          <div style={pcss("font:700 46px/1 'Quicksand',sans-serif;color:#5C4126;margin-top:12px")}>{formatTimeInZone(now, 'Asia/Jakarta')}</div>
          <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:#8A6B4A;margin-top:6px")}>{formatDateLabel(now, 'Asia/Jakarta')} 2026 · siang</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#A6805A")}>TERBIT</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#5C4126")}>05:52</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#A6805A")}>TERBENAM</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#5C4126")}>17:48</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#A6805A")}>CUACA</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#5C4126")}>31° cerah</div>
            </div>
          </div>
        </div>
        <div style={pcss('border-radius:26px;padding:20px;background:linear-gradient(160deg,#E5E8FF,#F2E4FF);box-shadow:0 8px 22px rgba(120,110,200,.16)')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={pcss("font:700 12px 'Nunito',sans-serif;color:#4E4A80")}>🇹🇼 Taiwan · CST</span>
            <span style={{ fontSize: 20 }}>🌤️</span>
          </div>
          <div style={pcss("font:700 46px/1 'Quicksand',sans-serif;color:#332F5C;margin-top:12px")}>{formatTimeInZone(now, 'Asia/Taipei')}</div>
          <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:#5F5A94;margin-top:6px")}>{formatDateLabel(now, 'Asia/Taipei')} 2026 · sore</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#807BB5")}>TERBIT</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#332F5C")}>05:08</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#807BB5")}>TERBENAM</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#332F5C")}>18:36</div>
            </div>
            <div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:#807BB5")}>CUACA</div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#332F5C")}>27° berawan</div>
            </div>
          </div>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Jam bareng 24 jam</div>
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
            <span style={{ width: 8, height: 8, borderRadius: 3, background: '#FFD9A8' }} />Dua-duanya bangun
          </span>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: 3, background: '#C9C2E8' }} />Salah satu tidur
          </span>
        </div>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:17px;border:1px dashed rgba(232,111,135,.4)')}>
        <div style={pcss("font:600 21px/1.35 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>
          &ldquo;Di Taiwan udah jam {formatTimeInZone(now, 'Asia/Taipei').split('.')[0]}. Dia baru kelar kelas — pas banget buat nanya udah makan belum 🍜&rdquo;
        </div>
        <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:9px")}>Asisten zona waktu · update tiap jam</div>
      </div>
    </ScrollColumn>
  );
}
