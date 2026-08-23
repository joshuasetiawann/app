import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, SectionHeader, ProgressBar } from '../components/shared/Atoms';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { GALLERY_CHIPS, ALBUMS, PHOTOS } from '../data/mockData';

const VIEWER_LENGTH = 5;

function viewBtnStyle(active: boolean) {
  return pcss(
    `width:28px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;color:var(--ink2,#6B5B60);background:${active ? 'var(--sf,#fff)' : 'transparent'};box-shadow:${active ? '0 2px 6px rgba(120,90,100,.16)' : 'none'}`,
  );
}

export default function GalleryPage() {
  const { viewport, galleryFilter, setGalleryFilter, galleryView, setGalleryView, toast, reduced } = useAppState();
  const isMobile = viewport === 'mobile';

  return (
    <ScrollColumn>
      <ChipRow items={GALLERY_CHIPS} active={galleryFilter} onSelect={setGalleryFilter} />

      <SectionHeader title="Album kita" action="+ Album baru" onAction={() => toast('Album baru dibuat ✨')} />
      <div style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '2px 0 6px' }}>
        {ALBUMS.map((a) => (
          <div key={a.id} style={{ flex: 'none', width: 124, cursor: 'pointer' }} onClick={() => toast(`Album: ${a.title}`)} role="button">
            <div style={{ height: 92, borderRadius: 16, background: a.coverGradient, display: 'flex', alignItems: 'flex-end', padding: 9, fontSize: 19 }}>{a.icon}</div>
            <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:7px")}>{a.title}</div>
            <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{a.countLabel}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div>
          <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Hari ini · Jakarta &amp; Taipei</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>Tap buat buka · tekan lama buat pilih banyak</div>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'var(--sf2,#FFF4F1)' }}>
          <span style={viewBtnStyle(galleryView === 'grid')} onClick={() => setGalleryView('grid')} role="button" aria-label="Tampilan grid">▦</span>
          <span style={viewBtnStyle(galleryView === 'polaroid')} onClick={() => setGalleryView('polaroid')} role="button" aria-label="Tampilan polaroid">🖼️</span>
          <span style={viewBtnStyle(galleryView === 'timeline')} onClick={() => setGalleryView('timeline')} role="button" aria-label="Tampilan timeline">☰</span>
        </div>
      </div>

      <div
        style={
          galleryView === 'polaroid'
            ? { display: 'flex', flexWrap: 'wrap', gap: 16 }
            : galleryView === 'timeline'
              ? { display: 'flex', flexDirection: 'column', gap: 10 }
              : { display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 5},1fr)`, gap: 8 }
        }
      >
        {PHOTOS.map((p, i) => {
          const pol = galleryView === 'polaroid';
          const tl = galleryView === 'timeline';
          const viewerIndex = i % VIEWER_LENGTH;
          if (tl) {
            return (
              <PhotoOpenTarget
                key={p.id}
                index={viewerIndex}
                style={pcss('display:flex;align-items:center;gap:12px;background:var(--sf,#fff);border-radius:16px;padding:9px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')}
              >
                <div style={pcss("width:58px;height:58px;border-radius:12px;flex:none;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;overflow:hidden")}>
                  <span style={pcss("font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{p.slotLabel}</span>
                </div>
                <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>
                  {p.caption} · {new Date(p.takenAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </PhotoOpenTarget>
            );
          }
          if (pol) {
            return (
              <PhotoOpenTarget
                key={p.id}
                index={viewerIndex}
                style={pcss(`width:150px;background:#fff;padding:9px 9px 0;border-radius:5px;box-shadow:0 8px 18px rgba(120,90,100,.15);transform:rotate(${reduced ? 0 : i % 2 ? 1.6 : -1.8}deg);cursor:pointer`)}
              >
                <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center")}>
                  <span style={pcss("font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{p.slotLabel}</span>
                </div>
                <div style={pcss("padding:8px 3px 10px;text-align:center;font:600 14px 'Caveat',cursive;color:#4A4A4A")}>{p.caption}</div>
              </PhotoOpenTarget>
            );
          }
          return (
            <PhotoOpenTarget key={p.id} index={viewerIndex} style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={pcss("aspect-ratio:1;border-radius:14px;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;overflow:hidden")}>
                <span style={pcss("font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{p.slotLabel}</span>
              </div>
            </PhotoOpenTarget>
          );
        })}
      </div>

      <div style={pcss('display:flex;align-items:center;gap:12px;border-radius:22px;background:var(--sf,#fff);padding:15px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <span style={{ fontSize: 26 }}>☁️</span>
        <div style={{ flex: 1 }}>
          <div style={pcss("display:flex;justify-content:space-between;font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>
            <span>42,3 GB / 100 GB</span>
            <span style={{ color: 'var(--mut,#A99A9E)' }}>Sinkron ✓</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <ProgressBar percent={42} />
          </div>
          <div style={pcss("font:500 15px 'Caveat',cursive;color:var(--mut,#A99A9E);margin-top:6px")}>semua memori aman tersimpan ✨</div>
        </div>
      </div>
    </ScrollColumn>
  );
}
