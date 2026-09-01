import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';
import { FOOD_CATS } from '../data/mockData';
import { formatTimeInZone } from '../lib/appClock';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';
import { imageDataUrl } from '../lib/image';

const FOOD_ALBUM_PREFIX = 'Food · ';

const CATEGORY_ICON: Record<string, string> = {
  Breakfast: '🍳',
  Lunch: '🍛',
  Dinner: '🍽️',
  Snacks: '🍪',
  Drinks: '🧋',
  Sarapan: '🍳',
  'Makan Siang': '🍛',
  'Makan Malam': '🍽️',
  Nyemil: '🍪',
  Dessert: '🍰',
  Minuman: '🧋',
};

export function FoodSheetContent() {
  const { closeSheet, toast, addFoodEntry, albums } = useAppState();
  const { profile } = useAuthState();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Lunch');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const categories = [...new Set([
    ...FOOD_CATS.filter((c) => c !== 'All'),
    ...albums.filter((album) => album.title.startsWith(FOOD_ALBUM_PREFIX)).map((album) => album.title.slice(FOOD_ALBUM_PREFIX.length)),
  ])];

  const choosePhoto = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPhotoBusy(true);
    setPhotoError('');
    try {
      setPhotoDataUrl(await imageDataUrl(file, { maxSide: 1_600, quality: 0.82 }));
    } catch (uploadError) {
      setPhotoError(uploadError instanceof Error ? uploadError.message : 'The meal picture could not be processed.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Add the meal name first 🥺');
      return;
    }
    const now = new Date();
    const timeZone = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    addFoodEntry({
      icon: CATEGORY_ICON[category] ?? '🍜',
      imageUrl: photoDataUrl || undefined,
      name: name.trim(),
      time: formatTimeInZone(now, timeZone),
      by: 'me',
      location: profile?.city.trim() || 'Location not set',
      category,
      price: price.trim() || 'Free',
      rating,
      note: note.trim() || 'No note yet',
      date: new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone }).format(now),
    });
    toast('Meal added to your food journal 🍜');
    closeSheet();
  };

  return (
    <>
      <SheetHeading title="Add a meal 🍜" sub="Save a food memory for both of you." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          {photoDataUrl && <img src={photoDataUrl} alt="Meal preview" style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 16, marginBottom: 9 }} />}
          <ImageSourcePicker busy={photoBusy} onFiles={choosePhoto} cameraAriaLabel="Take a meal picture" galleryAriaLabel="Choose a meal picture" />
          {photoError && <div role="alert" style={pcss("margin-top:7;font:700 10.5px/1.4 'Nunito',sans-serif;color:#C2506B")}>{photoError}</div>}
        </div>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Food or drink name"
          aria-label="Meal name"
          aria-invalid={!!error}
          style={pcss(
            `padding:13px 16px;border-radius:16px;border:1px solid ${error ? '#E8899A' : 'var(--ln,rgba(74,74,74,.14))'};background:var(--sf2,#FFF4F1);font:600 13px "Nunito",sans-serif;outline:none;color:var(--ink,#4A4A4A)`,
          )}
        />
        {error && <div style={pcss("font:700 11px 'Nunito',sans-serif;color:#C2506B")}>{error}</div>}

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              style={pcss(
                `padding:8px 13px;border:0;border-radius:100px;background:${category === c ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};font:700 11px "Nunito",sans-serif;color:${category === c ? '#5C3A42' : 'var(--ink2,#6B5B60)'};cursor:pointer`,
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price, e.g. Rp 28,000"
          aria-label="Price"
          style={pcss("padding:13px 16px;border-radius:16px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A)")}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-right:4px")}>Rating</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-pressed={n === rating} aria-label={`${n} stars`} style={{ padding: 1, border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: n <= rating ? 'var(--pki,#E86F87)' : 'var(--ln,rgba(74,74,74,.2))' }}>
              ★
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A short note about this meal"
          aria-label="Meal note"
          rows={2}
          style={pcss(
            "width:100%;padding:13px 16px;border-radius:16px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A);resize:none;font-family:inherit",
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 9, marginTop: 4 }}>
          <SheetPill label="Cancel" onClick={closeSheet} />
          <SheetPill label="Save meal 🍜" onClick={submit} primary />
        </div>
      </div>
    </>
  );
}
