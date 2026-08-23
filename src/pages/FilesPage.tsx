import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { FILE_FOLDERS, FILES } from '../data/mockData';

export default function FilesPage() {
  const { viewport, toast } = useAppState();
  const fileCols = viewport === 'mobile' ? 2 : 4;

  return (
    <ScrollColumn>
      <div style={pcss("display:flex;align-items:center;gap:7px;font:700 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
        <span style={{ color: 'var(--pki,#E86F87)', cursor: 'pointer' }}>🗂️ Laci Kita</span>
        <span>›</span>
        <span style={{ color: 'var(--ink,#4A4A4A)' }}>Semua berkas</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${fileCols},1fr)`, gap: 11 }}>
        {FILE_FOLDERS.map((f) => (
          <div key={f.id} style={pcss('border-radius:20px;background:var(--sf,#fff);padding:15px 14px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')} onClick={() => toast(`Buka folder: ${f.label}`)} role="button">
            <div style={{ width: 38, height: 38, borderRadius: 13, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{f.icon}</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:11px")}>{f.label}</div>
            <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{f.countLabel}</div>
          </div>
        ))}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:6px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        {FILES.map((f) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))', cursor: 'pointer' }} onClick={() => toast(f.name)} role="button">
            <div style={{ width: 38, height: 38, borderRadius: 12, background: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 9px "Nunito",sans-serif', color: '#5C3A42', flex: 'none' }}>{f.ext}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{f.name}</div>
              <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{f.meta}</div>
            </div>
            <span style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none")}>⋯</span>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
          <div style={pcss('width:38px;height:38px;border-radius:12px;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:15px;flex:none')}>⬆️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Visa_Taiwan_2026.pdf</div>
            <div style={{ height: 6, borderRadius: 6, background: 'var(--sf2,#FFF4F1)', marginTop: 7 }}>
              <div style={{ width: '72%', height: 6, borderRadius: 6, background: 'linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
            </div>
            <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>Mengunggah 72% · 1,8 MB / 2,5 MB</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
          <div style={pcss('width:38px;height:38px;border-radius:12px;background:#FFE1E1;display:flex;align-items:center;justify-content:center;font-size:15px;flex:none')}>⚠️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={pcss("font:700 12px 'Nunito',sans-serif;color:#C2506B")}>Itinerary_Bandung.docx</div>
            <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>Upload gagal. Tap buat coba lagi 🥺</div>
          </div>
          <span
            style={pcss("padding:7px 12px;border-radius:100px;background:#FFE1E1;color:#C2506B;font:700 10.5px 'Nunito',sans-serif;cursor:pointer")}
            onClick={() => toast('Mengunggah ulang... ⬆️')}
            role="button"
          >
            Coba lagi
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <div style={pcss("padding:11px 17px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 12px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Pilih berkas dari HP kamu')} role="button">
          ⬆️ Unggah berkas
        </div>
        <div style={pcss("padding:11px 17px;border-radius:100px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:700 12px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(120,90,100,.08)")} onClick={() => toast('Folder baru dibuat 📁')} role="button">
          📁 Folder baru
        </div>
        <div style={pcss("padding:11px 17px;border-radius:100px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:700 12px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(120,90,100,.08)")} onClick={() => toast('Menyiapkan unduhan ZIP...')} role="button">
          🗜️ Unduh sebagai ZIP
        </div>
      </div>
    </ScrollColumn>
  );
}
