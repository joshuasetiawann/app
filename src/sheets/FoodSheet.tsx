import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';
import { FOOD_CATS } from '../data/mockData';

const CATEGORY_ICON: Record<string, string> = {
  Sarapan: '🍳',
  'Makan Siang': '🍛',
  'Makan Malam': '🍽️',
  Nyemil: '🍪',
  Dessert: '🍰',
  Minuman: '🧋',
};

export function FoodSheetContent() {
  const { closeSheet, toast, addFoodEntry } = useAppState();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Makan Siang');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const categories = FOOD_CATS.filter((c) => c !== 'Semua');

  const submit = () => {
    if (!name.trim()) {
      setError('Nama makanannya dulu ya 🥺');
      return;
    }
    addFoodEntry({
      icon: CATEGORY_ICON[category] ?? '🍜',
      name: name.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      by: 'me',
      location: 'Jakarta',
      category,
      price: price.trim() || 'Gratis',
      rating,
      note: note.trim() || 'Belum ada catatan',
      date: '2026-05-20',
    });
    toast('Makan tercatat di Food Journal 🍜');
    closeSheet();
  };

  return (
    <>
      <SheetHeading title="Catat makan 🍜" sub="Simpan biar jadi kenangan kuliner" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Nama makanan / minuman"
          aria-label="Nama makanan"
          aria-invalid={!!error}
          style={pcss(
            `padding:13px 16px;border-radius:16px;border:1px solid ${error ? '#E8899A' : 'var(--ln,rgba(74,74,74,.14))'};background:var(--sf2,#FFF4F1);font:600 13px "Nunito",sans-serif;outline:none;color:var(--ink,#4A4A4A)`,
          )}
        />
        {error && <div style={pcss("font:700 11px 'Nunito',sans-serif;color:#C2506B")}>{error}</div>}

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <div
              key={c}
              onClick={() => setCategory(c)}
              role="button"
              style={pcss(
                `padding:8px 13px;border-radius:100px;background:${category === c ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};font:700 11px "Nunito",sans-serif;color:${category === c ? '#5C3A42' : 'var(--ink2,#6B5B60)'};cursor:pointer`,
              )}
            >
              {c}
            </div>
          ))}
        </div>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Harga, mis. Rp 28.000"
          aria-label="Harga"
          style={pcss("padding:13px 16px;border-radius:16px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A)")}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-right:4px")}>Rating</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} onClick={() => setRating(n)} role="button" aria-label={`${n} bintang`} style={{ fontSize: 20, cursor: 'pointer', color: n <= rating ? 'var(--pki,#E86F87)' : 'var(--ln,rgba(74,74,74,.2))' }}>
              ★
            </span>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan singkat, mis. enak banget pusing"
          aria-label="Catatan"
          rows={2}
          style={pcss(
            "width:100%;padding:13px 16px;border-radius:16px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A);resize:none;font-family:inherit",
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 9, marginTop: 4 }}>
          <SheetPill label="Batal" onClick={closeSheet} />
          <SheetPill label="Simpan 🍜" onClick={submit} primary />
        </div>
      </div>
    </>
  );
}
