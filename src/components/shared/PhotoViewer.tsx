import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import { PHOTOS } from '../../data/mockData';

const VIEWER_PHOTOS = PHOTOS.slice(0, 5);

export function PhotoViewer() {
  const { viewerIndex, closeViewer, toast } = useAppState();
  if (viewerIndex < 0) return null;
  const photo = VIEWER_PHOTOS[viewerIndex] ?? VIEWER_PHOTOS[0];

  return (
    <div
      style={pcss('position:absolute;inset:0;z-index:80;background:rgba(30,22,26,.9);backdrop-filter:blur(6px);display:flex;flex-direction:column;animation:kk-fade .2s ease')}
      onClick={closeViewer}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', color: '#fff' }}>
        <div>
          <div style={pcss("font:700 13px 'Quicksand',sans-serif")}>{photo.caption}</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;opacity:.7")}>{photo.meta}</div>
        </div>
        <div
          style={pcss('width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-size:14px')}
          role="button"
          aria-label="Tutup"
        >
          ✕
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <div
          style={pcss('width:100%;max-width:420px;background:#fff;padding:12px 12px 0;border-radius:6px;box-shadow:0 20px 50px rgba(0,0,0,.4)')}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 9px,#F8F2EE 9px 18px);display:flex;align-items:center;justify-content:center;font:700 10px 'Nunito',sans-serif;color:rgba(74,74,74,.35)")}>
            {photo.slotLabel}
          </div>
          <div style={pcss("padding:12px 4px 14px;text-align:center;font:600 21px 'Caveat',cursive;color:#4A4A4A")}>{photo.caption}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '20px 20px 26px' }} onClick={(e) => e.stopPropagation()}>
        <div style={pcss("padding:11px 18px;border-radius:100px;background:#fff;color:#4A4A4A;font:700 12px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Disukai ❤️')}>
          ❤️ Suka
        </div>
        <div style={pcss("padding:11px 18px;border-radius:100px;background:rgba(255,255,255,.16);color:#fff;font:700 12px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Komentar dibuka')}>
          💬 Komen
        </div>
        <div style={pcss("padding:11px 18px;border-radius:100px;background:rgba(255,255,255,.16);color:#fff;font:700 12px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Disimpan ke galeri HP')}>
          ⬇️ Simpan
        </div>
        <div style={pcss("padding:11px 18px;border-radius:100px;background:rgba(255,255,255,.16);color:#fff;font:700 12px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Foto dihapus')}>
          🗑️
        </div>
      </div>
    </div>
  );
}

export { VIEWER_PHOTOS };
