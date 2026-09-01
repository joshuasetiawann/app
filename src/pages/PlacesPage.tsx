import { useCallback, useState, type FormEvent } from 'react';
import { pcss } from '../lib/pcss';
import { imageDataUrl } from '../lib/image';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, EmptyState, Stars } from '../components/shared/Atoms';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';
import { PlaceMap, type MapPoint } from '../components/shared/PlaceMap';
import { PLACE_CATS } from '../data/mockData';

const fieldStyle = pcss("width:100%;min-height:44px;margin-top:6px;padding:10px 12px;border:1px solid var(--ln,rgba(74,74,74,.12));border-radius:13px;outline:none;color:var(--ink,#4A4A4A);background:var(--sf,#fff);font:600 12px 'Nunito',sans-serif");
const actionStyle = pcss("min-height:40px;padding:0 13px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:12px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10.5px 'Nunito',sans-serif;cursor:pointer");

export default function PlacesPage() {
  const { placeCategory, setPlaceCategory, places, addPlace, removePlace, toast } = useAppState();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [creating, setCreating] = useState(false);
  const [draftPoint, setDraftPoint] = useState<MapPoint | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [geoBusy, setGeoBusy] = useState(false);
  const visible = placeCategory === 'All' ? places : places.filter((place) => place.category === placeCategory);
  const selectedPlace = places.find((place) => place.id === selectedPlaceId);
  const today = new Date().toISOString().slice(0, 10);

  const selectPlace = useCallback((id: string) => {
    setSelectedPlaceId(id);
    setPlaceCategory('All');
  }, [setPlaceCategory]);

  const resetDraft = () => {
    setCreating(false);
    setDraftPoint(null);
    setPickMode(false);
    setPhotoDataUrl('');
    setFormError('');
  };

  const choosePhoto = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPhotoBusy(true);
    setFormError('');
    try {
      setPhotoDataUrl(await imageDataUrl(file, { maxSide: 1_600, quality: 0.82 }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The place picture could not be processed.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const useCurrentLocation = () => {
    setFormError('');
    if (!navigator.geolocation) {
      setFormError('This device does not provide location access.');
      return;
    }
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setPickMode(false);
        setGeoBusy(false);
        toast('Current device location selected for this pin');
      },
      (error) => {
        setGeoBusy(false);
        setFormError(error.code === error.PERMISSION_DENIED ? 'Location permission is blocked. Enable it in site settings and try again.' : 'The device location could not be read.');
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 12_000 },
    );
  };

  const startPicking = () => {
    setPickMode(true);
    setFormError('');
    window.setTimeout(() => document.querySelector('.kk-place-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get('title') ?? '').trim();
    if (!title) {
      setFormError('Place name is required.');
      return;
    }
    addPlace({
      title,
      category: String(values.get('category') ?? '❤️ Dates'),
      visitedOn: String(values.get('visitedOn') ?? ''),
      rating: Number(values.get('rating') || 0),
      note: String(values.get('note') ?? ''),
      latitude: draftPoint?.latitude,
      longitude: draftPoint?.longitude,
      photoDataUrl: photoDataUrl || undefined,
    });
    resetDraft();
    toast('Place saved for both of you 📍');
  };

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));position:relative')}>
        <div style={{ height: 300, position: 'relative' }}>
          <PlaceMap
            places={places}
            selectedId={selectedPlaceId}
            draftPoint={draftPoint}
            picking={pickMode}
            onSelect={selectPlace}
            onPick={pickMode ? (point) => { setDraftPoint(point); setPickMode(false); toast('Pin placed at the selected location'); } : undefined}
          />
          <div style={pcss(`position:absolute;z-index:500;left:13px;top:13px;max-width:72%;padding:8px 11px;border-radius:13px;background:rgba(255,255,255,.94);box-shadow:0 5px 16px rgba(70,55,61,.15);font:700 9.5px/1.4 'Nunito',sans-serif;color:${pickMode ? '#B5485D' : '#65585D'}`)}>{pickMode ? 'Tap the map to place a pin' : selectedPlace ? `${selectedPlace.icon} ${selectedPlace.title}` : places.some((place) => place.latitude != null) ? 'Tap a pin to view the place' : 'The map is ready for your first pin'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}><ChipRow items={PLACE_CATS} active={placeCategory} onSelect={setPlaceCategory} /></div>
        <button type="button" onClick={() => creating ? resetDraft() : setCreating(true)} aria-expanded={creating} style={pcss("flex:none;padding:9px 13px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--pki,#E86F87);cursor:pointer;font:800 10.5px 'Nunito',sans-serif")}>{creating ? 'Close' : '+ Add place'}</button>
      </div>

      {creating && (
        <form onSubmit={submit} style={pcss('padding:17px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:22px;background:var(--sf2,#FFF4F1);box-shadow:0 10px 26px rgba(90,65,75,.07);animation:kk-soft-in .28s ease')}>
          <strong style={pcss("display:block;color:var(--ink,#4A4A4A);font:800 15px 'Quicksand',sans-serif")}>Save a shared place</strong>
          <span style={pcss("display:block;margin-top:4px;color:var(--mut,#A99A9E);font:600 10.5px/1.5 'Nunito',sans-serif")}>Add a picture and map pin so your partner can recognize it instantly.</span>
          <div style={{ marginTop: 13 }}>
            {photoDataUrl && <img src={photoDataUrl} alt="Place picture preview" style={{ width: '100%', maxHeight: 210, objectFit: 'cover', borderRadius: 16, marginBottom: 9 }} />}
            <ImageSourcePicker busy={photoBusy} onFiles={choosePhoto} cameraAriaLabel="Take a place picture" galleryAriaLabel="Choose a place picture" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 14 }}>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Place name<input name="title" aria-label="Place name" placeholder="Coffee shop near campus" required maxLength={80} style={fieldStyle} /></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Category<select name="category" aria-label="Place category" defaultValue="❤️ Dates" style={fieldStyle}>{PLACE_CATS.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Date visited<input name="visitedOn" aria-label="Date visited" type="date" max={today} style={fieldStyle} /></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Rating 1–5<input name="rating" aria-label="Place rating" type="number" min="1" max="5" defaultValue="5" style={fieldStyle} /></label>
            <label style={pcss("grid-column:1/-1;font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Notes<textarea name="note" aria-label="Place note" placeholder="What makes this place special?" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} /></label>
          </div>
          <div style={{ marginTop: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" disabled={geoBusy} onClick={useCurrentLocation} style={actionStyle}>{geoBusy ? 'Finding GPS…' : '⌖ My current location'}</button>
              <button type="button" aria-pressed={pickMode} onClick={startPicking} style={actionStyle}>🗺️ Pick on map</button>
            </div>
            <div aria-live="polite" style={pcss("margin-top:8;padding:9px 11px;border-radius:11px;background:var(--sf,#fff);font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{draftPoint ? `Pin: ${draftPoint.latitude.toFixed(5)}, ${draftPoint.longitude.toFixed(5)}` : 'Location optional · no pin yet'}</div>
          </div>
          {formError && <div role="alert" style={pcss("margin-top:10px;font:700 10.5px/1.45 'Nunito',sans-serif;color:#B5485D")}>{formError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 15 }}>
            <button type="button" onClick={resetDraft} style={actionStyle}>Cancel</button>
            <button type="submit" style={{ ...actionStyle, border: 0, background: 'var(--pk,#FFB7B2)', color: '#5C3A42' }}>Save pin 📍</button>
          </div>
        </form>
      )}

      {visible.length === 0 && !creating && <EmptyState tag="OUR PRIVATE MAP" emoji="📍" title={places.length ? 'No places in this category' : 'No saved places yet'} body="Add your first place or choose another category." actionLabel="Add place" onAction={() => setCreating(true)} />}

      {visible.map((place) => {
        const selected = selectedPlaceId === place.id;
        return (
          <article key={place.id} style={pcss(`border-radius:22px;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));border:${selected ? '2px solid var(--pk,#FFB7B2)' : '2px solid transparent'};overflow:hidden`)}>
            <button type="button" aria-pressed={selected} onClick={() => selectPlace(place.id)} style={pcss('width:100%;display:flex;gap:13px;text-align:left;color:inherit;padding:13px;border:0;background:transparent;cursor:pointer')}>
              <div style={pcss('width:84px;height:84px;border-radius:16px;flex:none;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:22px;overflow:hidden')}>{place.imageUrl ? <img src={place.imageUrl} alt={`Picture of ${place.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : place.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={pcss("font:700 13.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{place.title}</span><Stars rating={place.rating} /></div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{place.meta}{place.latitude != null ? ' · Pin saved' : ' · No pin'}</div>
                <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>{place.note}</div>
              </div>
            </button>
            {selected && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 13px 12px' }}>
                <button type="button" disabled={place.latitude == null} onClick={() => document.querySelector('.kk-place-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ ...actionStyle, opacity: place.latitude == null ? 0.5 : 1 }}>View pin</button>
                <button type="button" onClick={() => {
                  if (confirmDeleteId !== place.id) { setConfirmDeleteId(place.id); return; }
                  removePlace(place.id);
                  setSelectedPlaceId(null);
                  setConfirmDeleteId('');
                  toast('Place and cover picture deleted');
                }} style={{ ...actionStyle, color: '#B5485D', background: '#FFF0F2' }}>{confirmDeleteId === place.id ? 'Confirm delete' : '🗑️ Delete'}</button>
              </div>
            )}
          </article>
        );
      })}
    </ScrollColumn>
  );
}
