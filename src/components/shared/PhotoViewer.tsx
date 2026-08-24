import { useEffect, useRef, useState } from 'react';
import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import type { Photo } from '../../types';

function PhotoActions({ photo }: { photo: Photo }) {
  const { albums, updatePhoto, removePhoto, toast } = useAppState();
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(photo.caption);
  const [album, setAlbum] = useState(photo.album ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ padding: '16px 20px 24px' }} onClick={(event) => event.stopPropagation()}>
      {editing && (
        <div style={pcss('max-width:520px;margin:0 auto 12px;padding:12px;border-radius:16px;background:rgba(255,255,255,.12);backdrop-filter:blur(8px)')}>
          <input value={caption} onChange={(event) => setCaption(event.target.value)} aria-label="Ubah caption foto" maxLength={120} style={pcss("width:100%;min-height:40px;padding:9px 12px;border:0;border-radius:11px;background:#fff;color:#4A4A4A;font:700 11px 'Nunito',sans-serif;outline:none")} />
          <select value={album} onChange={(event) => setAlbum(event.target.value)} aria-label="Pindahkan foto ke album" style={pcss("width:100%;min-height:40px;margin-top:8px;padding:0 12px;border:0;border-radius:11px;background:#fff;color:#4A4A4A;font:700 11px 'Nunito',sans-serif;outline:none")}>
            <option value="">Tanpa album</option>
            {albums.map((item) => <option key={item.id} value={item.title}>{item.icon} {item.title}</option>)}
          </select>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {editing ? (
          <button type="button" onClick={() => { updatePhoto(photo.id, { caption, album }); setEditing(false); toast('Detail foto diperbarui'); }} style={pcss("padding:10px 16px;border:0;border-radius:100px;background:#fff;color:#4A4A4A;font:700 11px 'Nunito',sans-serif;cursor:pointer")}>Simpan perubahan</button>
        ) : (
          <button type="button" onClick={() => setEditing(true)} style={pcss("padding:10px 16px;border:0;border-radius:100px;background:#fff;color:#4A4A4A;font:700 11px 'Nunito',sans-serif;cursor:pointer")}>✏️ Edit</button>
        )}
        {photo.imageUrl && <a href={photo.imageUrl} download={`kisahkita-${photo.id}.jpg`} target="_blank" rel="noreferrer" style={pcss("padding:10px 16px;border:0;border-radius:100px;background:rgba(255,255,255,.16);color:#fff;text-decoration:none;font:700 11px 'Nunito',sans-serif")}>⬇️ Simpan</a>}
        {confirmDelete ? (
          <button type="button" onClick={() => { removePhoto(photo.id); toast('Foto dihapus dari ruang kalian'); }} style={pcss("padding:10px 16px;border:0;border-radius:100px;background:#F9D4DA;color:#8B3045;font:800 11px 'Nunito',sans-serif;cursor:pointer")}>Yakin hapus</button>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} style={pcss("padding:10px 16px;border:0;border-radius:100px;background:rgba(255,255,255,.16);color:#fff;font:700 11px 'Nunito',sans-serif;cursor:pointer")}>🗑️ Hapus</button>
        )}
      </div>
    </div>
  );
}

export function PhotoViewer() {
  const { viewerIndex, photos, closeViewer } = useAppState();
  const isOpen = viewerIndex >= 0;
  const photo = isOpen ? photos[viewerIndex] ?? photos[0] : undefined;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeViewerRef = useRef(closeViewer);

  useEffect(() => {
    closeViewerRef.current = closeViewer;
  }, [closeViewer]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeViewerRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  if (viewerIndex < 0) return null;
  if (!photo) return null;

  return (
    <div
      style={pcss('position:absolute;inset:0;z-index:80;background:rgba(30,22,26,.9);backdrop-filter:blur(6px);display:flex;flex-direction:column;animation:kk-fade .2s ease')}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeViewer();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau foto"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', color: '#fff' }}>
        <div>
          <div style={pcss("font:700 13px 'Quicksand',sans-serif")}>{photo.caption}</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;opacity:.7")}>{photo.meta}</div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeViewer}
          style={pcss('width:34px;height:34px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer')}
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }}>
        <div
          style={pcss('width:100%;max-width:420px;background:#fff;padding:12px 12px 0;border-radius:6px;box-shadow:0 20px 50px rgba(0,0,0,.4)')}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 9px,#F8F2EE 9px 18px);display:flex;align-items:center;justify-content:center;font:700 10px 'Nunito',sans-serif;color:rgba(74,74,74,.35)")}>
            {photo.imageUrl ? <img src={photo.imageUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : photo.slotLabel}
          </div>
          <div style={pcss("padding:12px 4px 14px;text-align:center;font:600 21px 'Caveat',cursive;color:#4A4A4A")}>{photo.caption}</div>
        </div>
      </div>
      <PhotoActions key={photo.id} photo={photo} />
    </div>
  );
}
