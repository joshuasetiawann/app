import { useState, type FormEvent } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, HeroSurface, SectionHeader, Stars } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { FOOD_CATS, FOOD_BARS } from '../data/mockData';
import { useAuthState } from '../state/AuthState';

const FOOD_ALBUM_PREFIX = 'Makanan · ';
const compactInput = pcss("min-height:38px;padding:8px 11px;border:1px solid var(--ln,rgba(74,74,74,.12));border-radius:12px;background:var(--sf,#fff);color:var(--ink,#4A4A4A);font:700 10.5px 'Nunito',sans-serif;outline:none");
const compactButton = pcss("min-height:36px;padding:0 12px;border:0;border-radius:12px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10px 'Nunito',sans-serif;cursor:pointer");

function foodBtnStyle(active: boolean) {
  return pcss(
    `padding:10px 15px;border:0;border-radius:100px;cursor:pointer;font:700 12px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
  );
}

export default function FoodPage() {
  const { profile, partner } = useAuthState();
  const { theme, foodStatus, setFoodStatus, foodCategory, setFoodCategory, foodEntries, albums, addAlbum, updateAlbum, removeAlbum, updateFoodEntry, removeFoodEntry, openSheet, toast } = useAppState();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [managingAlbums, setManagingAlbums] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [editingAlbumId, setEditingAlbumId] = useState('');
  const [editAlbumTitle, setEditAlbumTitle] = useState('');
  const [confirmDeleteAlbumId, setConfirmDeleteAlbumId] = useState('');

  const heroBg = THEMES[theme].hero;
  const foodAlbums = albums.filter((album) => album.title.startsWith(FOOD_ALBUM_PREFIX));
  const foodCategories = [...new Set([
    ...FOOD_CATS.filter((category) => category !== 'Semua'),
    ...foodAlbums.map((album) => album.title.slice(FOOD_ALBUM_PREFIX.length)),
    ...foodEntries.map((entry) => entry.category),
  ])];
  const foodFilters = ['Semua', ...foodCategories];
  const visibleEntries = foodCategory === 'Semua' ? foodEntries : foodEntries.filter((f) => f.category === foodCategory);

  const createFoodAlbum = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newAlbumTitle.trim();
    if (!title) return;
    addAlbum({ title: `${FOOD_ALBUM_PREFIX}${title}`, icon: '🍱' });
    setNewAlbumTitle('');
  };

  const saveFoodAlbum = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const album = foodAlbums.find((item) => item.id === editingAlbumId);
    const title = editAlbumTitle.trim();
    if (!album || !title) return;
    const previousTitle = album.title.slice(FOOD_ALBUM_PREFIX.length);
    updateAlbum(album.id, { title: `${FOOD_ALBUM_PREFIX}${title}`, icon: album.icon || '🍱' });
    foodEntries.filter((entry) => entry.category === previousTitle).forEach((entry) => updateFoodEntry(entry.id, { category: title }));
    if (foodCategory === previousTitle) setFoodCategory(title);
    setEditingAlbumId('');
    toast('Album makanan diperbarui');
  };

  const deleteFoodAlbum = (id: string) => {
    const album = foodAlbums.find((item) => item.id === id);
    if (!album) return;
    const title = album.title.slice(FOOD_ALBUM_PREFIX.length);
    foodEntries.filter((entry) => entry.category === title).forEach((entry) => updateFoodEntry(entry.id, { category: 'Lainnya' }));
    removeAlbum(id);
    if (foodCategory === title) setFoodCategory('Semua');
    setConfirmDeleteAlbumId('');
    toast('Album dihapus; catatannya dipindahkan ke Lainnya');
  };

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px;box-shadow:0 8px 24px rgba(255,140,150,.14)')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Udah makan belum sayang?</div>
            <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>jangan sampai sakit perut ya 🥺</div>
          </div>
          <span style={{ fontSize: 26, animation: 'kk-float 3s ease-in-out infinite' }}>🍜</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 15, flexWrap: 'wrap' }}>
          <button type="button" style={foodBtnStyle(foodStatus === 'ate')} onClick={() => { setFoodStatus('ate'); toast('Makan tercatat · udah kenyang 😋'); }} aria-pressed={foodStatus === 'ate'}>Udah kenyang! 😋</button>
          <button type="button" style={foodBtnStyle(foodStatus === 'now')} onClick={() => { setFoodStatus('now'); toast('Selamat makan sayang 🍜'); }} aria-pressed={foodStatus === 'now'}>Lagi makan 🍜</button>
          <button type="button" style={foodBtnStyle(foodStatus === 'not')} onClick={() => { setFoodStatus('not'); toast('Jangan lupa makan ya 🥺'); }} aria-pressed={foodStatus === 'not'}>Belum nih 🥺</button>
          <button type="button" disabled title="Pengingat makan akan hadir segera" style={pcss("padding:10px 15px;border:0;border-radius:100px;background:rgba(255,255,255,.45);font:700 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E);cursor:not-allowed")}>Nanti · pengingat segera</button>
          <button type="button" disabled title="Status kesehatan akan hadir segera" style={pcss("padding:10px 15px;border:0;border-radius:100px;background:rgba(255,255,255,.45);font:700 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E);cursor:not-allowed")}>Kurang enak badan · segera</button>
        </div>
      </HeroSurface>

      <ChipRow items={foodFilters} active={foodCategory} onSelect={setFoodCategory} />

      <SectionHeader title="Food Journal" action="+ Catat makan" onAction={() => openSheet('food')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {visibleEntries.length === 0 && (
          <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:20px;text-align:center;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <div style={{ fontSize: 32 }}>🍽️</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:8px")}>Belum ada catatan di kategori ini</div>
          </div>
        )}
        {visibleEntries.map((f) => {
          const isOpen = expanded === f.id;
          return (
            <div key={f.id} style={pcss('border-radius:22px;background:var(--sf,#fff);padding:13px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`food-entry-${f.id}`}
                style={pcss("width:100%;display:flex;gap:13px;padding:0;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer")}
                onClick={() => {
                  setExpanded(isOpen ? null : f.id);
                  setNoteDraft(f.note);
                }}
              >
                <div style={pcss('width:76px;height:76px;border-radius:16px;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font-size:22px;flex:none')}>
                  {f.imageUrl ? <img src={f.imageUrl} alt={`Foto ${f.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : f.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={pcss("font:700 13.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{f.name}</span>
                    <span style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none")}>{f.time}</span>
                  </div>
                  <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>
                    {f.by === 'me' ? (profile?.nickname || profile?.name || 'Kamu') : (partner?.nickname || partner?.name || 'Pasangan')} · {f.location} · {f.category} · {f.price}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Stars rating={f.rating} />
                  </div>
                  <div style={pcss("font:500 15px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>{f.note}</div>
                </div>
              </button>

              {isOpen && (
                <div id={`food-entry-${f.id}`} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ln,rgba(74,74,74,.07))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => updateFoodEntry(f.id, { rating: n })}
                        aria-label={`${n} bintang`}
                        aria-pressed={n === f.rating}
                        style={{ padding: 2, border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', color: n <= f.rating ? 'var(--pki,#E86F87)' : 'var(--ln,rgba(74,74,74,.2))' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={2}
                    aria-label="Edit catatan"
                    style={pcss(
                      "width:100%;padding:11px 14px;border-radius:14px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 12.5px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A);resize:none;font-family:inherit",
                    )}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                    <button
                      type="button"
                      style={pcss("flex:1;text-align:center;padding:9px 0;border:0;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
                      onClick={() => {
                        updateFoodEntry(f.id, { note: noteDraft });
                        toast('Catatan diperbarui ✓');
                        setExpanded(null);
                      }}
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      style={pcss("flex:none;padding:9px 15px;border:0;border-radius:100px;background:#FFE1E1;color:#C2506B;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
                      onClick={() => {
                        removeFoodEntry(f.id);
                        toast('Catatan dihapus 🗑️');
                        setExpanded(null);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Album makanan 🍱</span>
        <button type="button" onClick={() => setManagingAlbums((value) => !value)} aria-expanded={managingAlbums} style={pcss("border:0;background:transparent;padding:4px;font:800 11px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}>{managingAlbums ? 'Selesai' : 'Kelola album'}</button>
      </div>

      {managingAlbums && (
        <section style={pcss('padding:14px;border-radius:20px;background:var(--sf2,#FFF4F1);border:1px solid var(--ln,rgba(74,74,74,.1));animation:kk-soft-in .24s ease')}>
          <form onSubmit={createFoodAlbum} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <input value={newAlbumTitle} onChange={(event) => setNewAlbumTitle(event.target.value)} aria-label="Nama album makanan baru" placeholder="Mis. Kuliner Bandung" maxLength={40} required style={compactInput} />
            <button type="submit" style={compactButton}>+ Tambah</button>
          </form>
          <small style={pcss("display:block;margin-top:7;font:600 9.5px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Kategori bawaan selalu tersedia. Album khusus di bawah dapat diubah atau dihapus dan tersinkron ke pasangan.</small>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {foodAlbums.map((album) => {
              const title = album.title.slice(FOOD_ALBUM_PREFIX.length);
              if (editingAlbumId === album.id) return (
                <form key={album.id} onSubmit={saveFoodAlbum} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <input value={editAlbumTitle} onChange={(event) => setEditAlbumTitle(event.target.value)} aria-label={`Ubah nama ${title}`} maxLength={40} required style={compactInput} />
                  <button type="submit" style={compactButton}>Simpan</button>
                </form>
              );
              return (
                <div key={album.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span aria-hidden="true">{album.icon || '🍱'}</span>
                  <strong style={pcss("flex:1;min-width:0;font:800 10.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{title}</strong>
                  <button type="button" style={compactButton} onClick={() => { setEditingAlbumId(album.id); setEditAlbumTitle(title); setConfirmDeleteAlbumId(''); }}>Ubah</button>
                  <button type="button" style={{ ...compactButton, color: '#B5485D' }} onClick={() => confirmDeleteAlbumId === album.id ? deleteFoodAlbum(album.id) : setConfirmDeleteAlbumId(album.id)}>{confirmDeleteAlbumId === album.id ? 'Yakin hapus' : 'Hapus'}</button>
                </div>
              );
            })}
            {!foodAlbums.length && <small style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Belum ada album khusus.</small>}
          </div>
        </section>
      )}

      <div style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '2px 0 6px' }}>
        {foodCategories.map((category, index) => {
          const entries = foodEntries.filter((entry) => entry.category === category);
          const cover = entries.find((entry) => entry.imageUrl)?.imageUrl;
          return (
            <button type="button" key={category} onClick={() => setFoodCategory(category)} style={{ flex: 'none', width: 112, padding: 0, border: 0, background: 'transparent', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
              <div style={{ height: 82, borderRadius: 16, background: `hsl(${8 + index * 31} 58% 91%)`, display: 'flex', alignItems: 'flex-end', padding: 8, fontSize: 18, overflow: 'hidden', position: 'relative' }}>
                {cover ? <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{entries[0]?.icon || '🍱'}</span>}
              </div>
              <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{category}</div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{entries.length} catatan{entries.some((entry) => entry.imageUrl) ? ' · ada foto' : ''}</div>
            </button>
          );
        })}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Ilustrasi menu favorit</div>
        <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>Statistik otomatis dari jurnal · segera</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 96, marginTop: 14 }}>
          {FOOD_BARS.map((b) => (
            <div key={b.icon} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: b.heightPx, borderRadius: 10, background: 'linear-gradient(180deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
              <div style={{ fontSize: 14, marginTop: 7 }}>{b.icon}</div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ScrollColumn>
  );
}
