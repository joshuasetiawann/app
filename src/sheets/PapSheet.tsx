import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';

export function PapSheetContent() {
  const navigate = useNavigate();
  const { papStep, papCaption, papPercent, setPapCaption, papCaptionStep, resetPap, startPap, closeSheet, addPhotoMessage, toast } = useAppState();

  if (papStep === 0) {
    return (
      <>
        <SheetHeading title="Quick PAP 📸" sub="Cekrek, kasih caption lucu, kirim!" />
        <div style={pcss('aspect-ratio:3/4;border-radius:22px;background:#241D22;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center')}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#2E2429 0 10px,#352A30 10px 20px)' }} />
          <div style={pcss("position:relative;font:700 10px 'Nunito',sans-serif;color:rgba(255,255,255,.4)")}>PREVIEW KAMERA</div>
          <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18, alignItems: 'center' }}>
            <div style={{ color: '#fff', fontSize: 17, opacity: 0.8 }}>🖼️</div>
            <div
              onClick={papCaptionStep}
              role="button"
              aria-label="Ambil foto"
              style={{ width: 62, height: 62, borderRadius: '50%', background: '#fff', border: '5px solid rgba(255,255,255,.35)', cursor: 'pointer' }}
            />
            <div style={{ color: '#fff', fontSize: 17, opacity: 0.8 }}>🔄</div>
          </div>
        </div>
        <div style={pcss("font:500 17px 'Caveat',cursive;color:var(--mut,#A99A9E);text-align:center;margin-top:12px")}>satu foto, satu senyum 🌸</div>
      </>
    );
  }

  if (papStep === 1) {
    return (
      <>
        <SheetHeading title="Kasih caption ✏️" sub="Biar makin gemes" />
        <div style={pcss("background:#fff;padding:10px 10px 0;border-radius:5px;box-shadow:0 10px 26px rgba(120,90,100,.2);transform:rotate(-1.6deg);max-width:260px;margin:0 auto 16px")}>
          <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 9px,#F8F2EE 9px 18px);display:flex;align-items:center;justify-content:center;font:700 9px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>
            FOTO BARU
          </div>
          <div style={pcss("padding:10px 4px 12px;text-align:center;font:600 18px 'Caveat',cursive;color:#4A4A4A")}>{papCaption || 'tulis caption...'}</div>
        </div>
        <input
          value={papCaption}
          placeholder="mis. kangen kamu 🥺"
          onChange={(e) => setPapCaption(e.target.value)}
          aria-label="Caption foto"
          style={pcss(
            "width:100%;padding:13px 16px;border-radius:100px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);outline:none;margin-bottom:10px",
          )}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {['📍 Jakarta', '🍜 Tag makanan', '📖 Simpan ke Memories'].map((t) => (
            <div key={t} style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 9 }}>
          <SheetPill label="Ulang" onClick={resetPap} />
          <SheetPill label="Kirim ke Partner 🚀" onClick={startPap} primary />
        </div>
      </>
    );
  }

  if (papStep === 2) {
    return (
      <>
        <SheetHeading title="Wush! Lagi terbang..." sub="Lagi terbang ke Taiwan ☁️" />
        <div style={{ textAlign: 'center', padding: '18px 0 8px' }}>
          <div style={pcss('width:96px;height:96px;margin:0 auto;border-radius:50%;border:2px dashed rgba(232,111,135,.4);position:relative;animation:kk-orbit 3s linear infinite')}>
            <div style={{ position: 'absolute', top: -11, left: '50%', marginLeft: -11, fontSize: 20 }}>✈️</div>
          </div>
          <div style={pcss("font:700 24px 'Quicksand',sans-serif;color:var(--pki,#E86F87);margin-top:16px")}>{papPercent}%</div>
          <div style={pcss('height:8px;border-radius:8px;background:var(--sf2,#FFF4F1);margin:12px 0 6px')}>
            <div style={pcss(`width:${papPercent}%;height:8px;border-radius:8px;background:linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7));transition:width .12s`)} />
          </div>
          <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Tunggu sebentar ya sayang ☁️</div>
        </div>
      </>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
      <div style={{ fontSize: 52, animation: 'kk-pop .5s ease' }}>💌</div>
      <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>Terkirim!</div>
      <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--mut,#A99A9E);margin-top:4px")}>foto kamu udah nyampe di Taipei 🇹🇼</div>
      <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:12px")}>Otomatis masuk Chat · Galeri · PAP Harian</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 18 }}>
        <SheetPill
          label="Tutup"
          onClick={() => {
            addPhotoMessage({ slotLabel: 'FOTO BARU', caption: papCaption || 'PAP baru 📸' });
            toast('PAP tersimpan ✓');
            resetPap();
            closeSheet();
          }}
        />
        <SheetPill
          label="Buka Chat"
          primary
          onClick={() => {
            addPhotoMessage({ slotLabel: 'FOTO BARU', caption: papCaption || 'PAP baru 📸' });
            resetPap();
            closeSheet();
            navigate('/chat');
          }}
        />
      </div>
    </div>
  );
}
