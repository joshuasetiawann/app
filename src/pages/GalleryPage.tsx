import { useState, type FormEvent } from 'react';
import { pcss } from '../lib/pcss';
import { imageDataUrl, fileCaption } from '../lib/image';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, EmptyState, SectionHeader } from '../components/shared/Atoms';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';

function viewBtnStyle(active: boolean) {
  return pcss(`width:28px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;color:var(--ink2,#6B5B60);background:${active ? 'var(--sf,#fff)' : 'transparent'};box-shadow:${active ? '0 2px 6px rgba(120,90,100,.16)' : 'none'}`);
}

const inputStyle = pcss("width:100%;min-height:42px;padding:9px 12px;border:1px solid var(--ln,rgba(74,74,74,.12));border-radius:12px;background:var(--sf,#fff);color:var(--ink,#4A4A4A);font:700 11px 'Nunito',sans-serif;outline:none");
const tinyButton = pcss("min-height:34px;padding:0 11px;border:0;border-radius:10px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10px 'Nunito',sans-serif;cursor:pointer");

export default function GalleryPage() {
  const { profile, partner, mode } = useAuthState();
  const {
    viewport, photos, albums, galleryFilter, setGalleryFilter, galleryView, setGalleryView,
    toast, reduced, syncStatus, addGalleryPhoto, addAlbum, updateAlbum, removeAlbum,
  } = useAppState();
  const isMobile = viewport === 'mobile';
  const partnerLabel = partner?.name || 'Pasangan';
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [managingAlbums, setManagingAlbums] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [caption, setCaption] = useState('');
  const [targetAlbum, setTargetAlbum] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumIcon, setAlbumIcon] = useState('🖼️');
  const [editingAlbumId, setEditingAlbumId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState('');

  const filters = [...new Set(['Semua', 'Kamu', partnerLabel, 'Foto', 'Video', ...albums.map((album) => album.title)])];
  const visiblePhotos = photos.filter((photo) => {
    if (galleryFilter === 'Semua') return true;
    if (galleryFilter === 'Kamu') return photo.by === 'me';
    if (galleryFilter === partnerLabel) return photo.by === 'partner';
    if (galleryFilter === 'Foto') return !photo.slotLabel.startsWith('VIDEO');
    if (galleryFilter === 'Video') return photo.slotLabel.startsWith('VIDEO') || photo.tags.includes('Video');
    return photo.album === galleryFilter || photo.tags.includes(galleryFilter);
  });

  const upload = async (files: File[]) => {
    setUploadBusy(true);
    setUploadError('');
    try {
      for (const [index, file] of files.slice(0, 12).entries()) {
        const dataUrl = await imageDataUrl(file, { maxSide: 1_920, quality: 0.82 });
        const chosenCaption = caption.trim()
          ? `${caption.trim()}${files.length > 1 ? ` · ${index + 1}` : ''}`
          : fileCaption(file);
        addGalleryPhoto({ caption: chosenCaption, dataUrl, album: targetAlbum || undefined });
      }
      toast(`${Math.min(files.length, 12)} foto ditambahkan ke ruang kalian`);
      setAddingPhoto(false);
      setCaption('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Foto belum bisa diproses.');
    } finally {
      setUploadBusy(false);
    }
  };

  const createAlbum = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!albumTitle.trim()) return;
    addAlbum({ title: albumTitle, icon: albumIcon });
    setAlbumTitle('');
    setAlbumIcon('🖼️');
  };

  const beginEdit = (id: string) => {
    const album = albums.find((item) => item.id === id);
    if (!album) return;
    setEditingAlbumId(id);
    setEditTitle(album.title);
    setEditIcon(album.icon);
    setConfirmDeleteId('');
  };

  const finishEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingAlbumId && editTitle.trim()) updateAlbum(editingAlbumId, { title: editTitle, icon: editIcon });
    setEditingAlbumId('');
  };

  return (
    <ScrollColumn>
      <ChipRow items={filters} active={galleryFilter} onSelect={setGalleryFilter} />

      <SectionHeader title="Album kita" action={addingPhoto ? 'Tutup' : '+ Tambah foto'} onAction={() => setAddingPhoto((value) => !value)} />
      {addingPhoto && (
        <section style={pcss('padding:16px;border-radius:21px;background:var(--sf2,#FFF4F1);border:1px solid var(--ln,rgba(74,74,74,.1));animation:kk-soft-in .25s ease')}>
          <strong style={pcss("display:block;font:800 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Tambah dari kamera atau galeri</strong>
          <small style={pcss("display:block;margin:4px 0 12px;font:600 10.5px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Kamera mengambil satu foto. Galeri dapat memilih sampai 12 foto sekaligus.</small>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 9, marginBottom: 10 }}>
            <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption opsional" aria-label="Caption foto galeri" maxLength={120} style={inputStyle} />
            <select value={targetAlbum} onChange={(event) => setTargetAlbum(event.target.value)} aria-label="Pilih album tujuan" style={inputStyle}>
              <option value="">Tanpa album</option>
              {albums.map((album) => <option key={album.id} value={album.title}>{album.icon} {album.title}</option>)}
            </select>
          </div>
          <ImageSourcePicker busy={uploadBusy} multiple onFiles={upload} cameraAriaLabel="Ambil foto galeri dengan kamera" galleryAriaLabel="Pilih banyak foto untuk galeri" />
          {uploadBusy && <div aria-live="polite" style={pcss("margin-top:10px;font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>Mengoptimalkan foto untuk HP…</div>}
          {uploadError && <div role="alert" style={pcss("margin-top:10px;font:700 10.5px 'Nunito',sans-serif;color:#B5485D")}>{uploadError}</div>}
        </section>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setManagingAlbums((value) => !value)} aria-expanded={managingAlbums} style={tinyButton}>{managingAlbums ? 'Selesai kelola' : '⚙️ Kelola album'}</button>
      </div>

      {managingAlbums && (
        <section style={pcss('padding:15px;border-radius:20px;background:var(--sf2,#FFF4F1);border:1px solid var(--ln,rgba(74,74,74,.1))')}>
          <form onSubmit={createAlbum} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 7 }}>
            <input value={albumIcon} onChange={(event) => setAlbumIcon(event.target.value)} aria-label="Ikon album baru" maxLength={8} style={inputStyle} />
            <input value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} aria-label="Nama album baru" placeholder="Nama album baru" maxLength={48} required style={inputStyle} />
            <button type="submit" style={tinyButton}>Tambah</button>
          </form>
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {albums.map((album) => editingAlbumId === album.id ? (
              <form key={album.id} onSubmit={finishEdit} style={{ display: 'grid', gridTemplateColumns: '58px 1fr auto', gap: 7 }}>
                <input value={editIcon} onChange={(event) => setEditIcon(event.target.value)} aria-label={`Ikon ${album.title}`} maxLength={8} style={inputStyle} />
                <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} aria-label={`Ubah nama ${album.title}`} maxLength={48} required style={inputStyle} />
                <button type="submit" style={tinyButton}>Simpan</button>
              </form>
            ) : (
              <div key={album.id} data-album-id={album.id} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 38 }}>
                <span style={{ fontSize: 18 }}>{album.icon}</span>
                <strong style={pcss("flex:1;min-width:0;font:800 11px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);overflow-wrap:anywhere")}>{album.title}</strong>
                <button type="button" style={tinyButton} onClick={() => beginEdit(album.id)}>Ubah</button>
                {confirmDeleteId === album.id ? (
                  <button type="button" style={{ ...tinyButton, color: '#B5485D' }} onClick={() => { removeAlbum(album.id); setConfirmDeleteId(''); }}>Yakin hapus</button>
                ) : (
                  <button type="button" style={{ ...tinyButton, color: '#B5485D' }} onClick={() => setConfirmDeleteId(album.id)}>Hapus</button>
                )}
              </div>
            ))}
            {!albums.length && <small style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Belum ada album. Foto tetap bisa disimpan tanpa album.</small>}
          </div>
        </section>
      )}

      {!!albums.length && (
        <div style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '2px 0 6px' }}>
          {albums.map((album, index) => {
            const albumPhotos = photos.filter((photo) => photo.album === album.title || photo.tags.includes(album.title));
            const cover = albumPhotos[0]?.imageUrl;
            return (
              <button type="button" key={album.id} style={{ flex: 'none', width: 124, cursor: 'pointer', padding: 0, border: 0, background: 'transparent', color: 'inherit', textAlign: 'left' }} onClick={() => setGalleryFilter(album.title)}>
                <div style={{ height: 92, borderRadius: 16, background: album.coverGradient || `hsl(${340 + index * 24} 55% 91%)`, display: 'flex', alignItems: 'flex-end', padding: 9, fontSize: 19, overflow: 'hidden', position: 'relative' }}>
                  {cover && <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <span style={{ position: 'relative', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.24))' }}>{album.icon}</span>
                </div>
                <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:7px")}>{album.title}</div>
                <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{albumPhotos.length} foto</div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <div>
          <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Momen {profile?.name ?? 'Kamu'} &amp; {partnerLabel}</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{visiblePhotos.length} media · filter {galleryFilter}</div>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'var(--sf2,#FFF4F1)' }}>
          <button type="button" style={{ ...viewBtnStyle(galleryView === 'grid'), border: 0 }} onClick={() => setGalleryView('grid')} aria-pressed={galleryView === 'grid'} aria-label="Tampilan grid">▦</button>
          <button type="button" style={{ ...viewBtnStyle(galleryView === 'polaroid'), border: 0 }} onClick={() => setGalleryView('polaroid')} aria-pressed={galleryView === 'polaroid'} aria-label="Tampilan polaroid">🖼️</button>
          <button type="button" style={{ ...viewBtnStyle(galleryView === 'timeline'), border: 0 }} onClick={() => setGalleryView('timeline')} aria-pressed={galleryView === 'timeline'} aria-label="Tampilan timeline">☰</button>
        </div>
      </div>

      {!photos.length && !addingPhoto ? (
        <EmptyState tag="GALERI BARU" emoji="📷" title="Belum ada foto di ruang kalian" body="Ambil lewat kamera atau pilih beberapa foto dari galeri perangkat." actionLabel="Tambah foto pertama" onAction={() => setAddingPhoto(true)} />
      ) : (
        <div style={galleryView === 'polaroid' ? { display: 'flex', flexWrap: 'wrap', gap: 16 } : galleryView === 'timeline' ? { display: 'flex', flexDirection: 'column', gap: 10 } : { display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 3 : 5},1fr)`, gap: 8 }}>
          {visiblePhotos.map((photo, index) => {
            const polaroid = galleryView === 'polaroid';
            const timeline = galleryView === 'timeline';
            const viewerIndex = photos.findIndex((item) => item.id === photo.id);
            const owner = photo.by === 'me' ? 'Kamu' : partnerLabel;
            if (timeline) return (
              <PhotoOpenTarget key={photo.id} index={viewerIndex} style={pcss('display:flex;align-items:center;gap:12px;background:var(--sf,#fff);border-radius:16px;padding:9px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
                <div style={pcss('width:58px;height:58px;border-radius:12px;flex:none;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;overflow:hidden')}>
                  {photo.imageUrl ? <img src={photo.imageUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : photo.slotLabel}
                </div>
                <div style={{ minWidth: 0 }}><strong style={pcss("display:block;font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{photo.caption}</strong><small style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{owner}{photo.album ? ` · ${photo.album}` : ''}</small></div>
              </PhotoOpenTarget>
            );
            if (polaroid) return (
              <PhotoOpenTarget key={photo.id} index={viewerIndex} style={pcss(`width:150px;background:#fff;padding:9px 9px 0;border-radius:5px;box-shadow:0 8px 18px rgba(120,90,100,.15);transform:rotate(${reduced ? 0 : index % 2 ? 1.6 : -1.8}deg)`)}>
                <div style={pcss('aspect-ratio:1;background:#f7efec;display:flex;align-items:center;justify-content:center;overflow:hidden')}>{photo.imageUrl ? <img src={photo.imageUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : photo.slotLabel}</div>
                <div style={pcss("padding:8px 3px 10px;text-align:center;font:600 14px 'Caveat',cursive;color:#4A4A4A")}>{photo.caption}<small style={pcss("display:block;font:700 8px 'Nunito',sans-serif;color:#A99A9E")}>{owner}</small></div>
              </PhotoOpenTarget>
            );
            return (
              <PhotoOpenTarget key={photo.id} index={viewerIndex} style={{ position: 'relative' }}>
                <div style={pcss('aspect-ratio:1;border-radius:14px;background:#f7efec;display:flex;align-items:center;justify-content:center;overflow:hidden')}>{photo.imageUrl ? <img src={photo.imageUrl} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : photo.slotLabel}</div>
                <span style={pcss("position:absolute;left:5px;bottom:5px;padding:3px 6px;border-radius:8px;background:rgba(35,27,31,.7);color:#fff;font:800 7.5px 'Nunito',sans-serif;backdrop-filter:blur(4px)")}>{owner}</span>
              </PhotoOpenTarget>
            );
          })}
        </div>
      )}

      {photos.length > 0 && visiblePhotos.length === 0 && <div style={pcss("border-radius:20px;background:var(--sf,#fff);padding:24px;text-align:center;font:600 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Belum ada media untuk filter {galleryFilter}.</div>}

      <div style={pcss('display:flex;align-items:center;gap:12px;border-radius:22px;background:var(--sf,#fff);padding:15px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <span style={{ fontSize: 26 }}>{mode === 'supabase' ? '☁️' : '📱'}</span>
        <div style={{ flex: 1 }}>
          <div style={pcss("display:flex;justify-content:space-between;gap:10px;font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}><span>{mode === 'supabase' ? 'Supabase Storage privat' : 'Penyimpanan demo perangkat'}</span><span style={{ color: 'var(--mut,#A99A9E)' }}>{syncStatus === 'synced' ? 'Realtime aktif' : mode === 'supabase' ? 'Menyambungkan…' : 'Lokal'}</span></div>
          <div style={pcss("font:500 15px 'Caveat',cursive;color:var(--mut,#A99A9E);margin-top:6px")}>{mode === 'supabase' ? 'File tidak disimpan di localStorage; pasangan menerima perubahan otomatis.' : 'Mode demo memang hanya tersimpan di browser ini.'}</div>
        </div>
      </div>
    </ScrollColumn>
  );
}
