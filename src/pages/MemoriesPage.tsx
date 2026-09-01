import { useCallback, useState, type FormEvent } from 'react';
import { pcss } from '../lib/pcss';
import { coordinateLabel, currentDeviceLocation } from '../lib/geolocation';
import { imageDataUrl } from '../lib/image';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { EmptyState } from '../components/shared/Atoms';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';
import { PlaceMap, type MapPoint } from '../components/shared/PlaceMap';

const fieldStyle = pcss("width:100%;min-height:44px;margin-top:6px;padding:10px 12px;border:1px solid var(--ln,rgba(74,74,74,.12));border-radius:13px;outline:none;color:var(--ink,#4A4A4A);background:var(--sf,#fff);font:600 12px 'Nunito',sans-serif");
const actionStyle = pcss("min-height:40px;padding:0 13px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:12px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10.5px 'Nunito',sans-serif;cursor:pointer");

export default function MemoriesPage() {
  const { memories, photos, reduced, addMemory, toast } = useAppState();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [location, setLocation] = useState('');
  const [draftPoint, setDraftPoint] = useState<MapPoint | null>(null);
  const [pickMode, setPickMode] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [formError, setFormError] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const ignoreMapSelection = useCallback(() => undefined, []);

  const resetDraft = () => {
    setCreating(false);
    setLocation('');
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
      setFormError(error instanceof Error ? error.message : 'The memory picture could not be processed.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const selectCurrentLocation = async () => {
    setGeoBusy(true);
    setFormError('');
    try {
      const point = await currentDeviceLocation();
      setDraftPoint(point);
      setLocation(coordinateLabel(point));
      setPickMode(false);
      toast('Current GPS location added to this memory');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The device location could not be read.');
    } finally {
      setGeoBusy(false);
    }
  };

  const submitMemory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = String(values.get('title') ?? '').trim();
    const occurredOn = String(values.get('occurredOn') ?? '');
    if (!title || !occurredOn) {
      setFormError('Title and date are required.');
      return;
    }
    addMemory({
      title,
      occurredOn,
      story: String(values.get('story') ?? ''),
      mood: String(values.get('mood') ?? ''),
      location,
      photoDataUrl: photoDataUrl || undefined,
    });
    resetDraft();
    toast('Memory, location, and picture synced 📖');
  };

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Your memories</div>
          <div style={pcss("font:500 17px 'Caveat',cursive;color:var(--mut,#A99A9E)")}>little stories you keep together ✈️</div>
        </div>
        <button type="button" onClick={() => creating ? resetDraft() : setCreating(true)} aria-expanded={creating} style={pcss("padding:9px 14px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--pki,#E86F87);font:800 11px 'Nunito',sans-serif;cursor:pointer")}>{creating ? 'Close' : '+ Memory'}</button>
      </div>

      {creating && (
        <form onSubmit={submitMemory} style={pcss('padding:17px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:22px;background:var(--sf2,#FFF4F1);box-shadow:0 10px 26px rgba(90,65,75,.07);animation:kk-soft-in .28s ease')}>
          <strong style={pcss("display:block;color:var(--ink,#4A4A4A);font:800 15px 'Quicksand',sans-serif")}>Save a new memory</strong>
          <span style={pcss("display:block;margin-top:4px;color:var(--mut,#A99A9E);font:600 10.5px/1.5 'Nunito',sans-serif")}>Add a picture and either use GPS, choose a pin, or type the place yourself.</span>

          <div style={{ marginTop: 13 }}>
            {photoDataUrl && (
              <div style={{ position: 'relative', marginBottom: 9 }}>
                <img src={photoDataUrl} alt="Memory picture preview" style={{ display: 'block', width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 16 }} />
                <button type="button" onClick={() => setPhotoDataUrl('')} aria-label="Remove memory picture" style={pcss("position:absolute;right:9px;top:9px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(42,30,35,.75);color:#fff;cursor:pointer;font:800 13px 'Nunito',sans-serif")}>✕</button>
              </div>
            )}
            <ImageSourcePicker busy={photoBusy} onFiles={choosePhoto} cameraAriaLabel="Take a memory picture" galleryAriaLabel="Choose a memory picture" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginTop: 14 }}>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Title<input name="title" aria-label="Memory title" placeholder="Video call until we fell asleep" required maxLength={100} style={fieldStyle} /></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Date<input name="occurredOn" aria-label="Memory date" type="date" defaultValue={today} max={today} required style={fieldStyle} /></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Place<input aria-label="Memory place" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Type a place or use GPS" maxLength={140} style={fieldStyle} /></label>
            <label style={pcss("font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Mood emoji<input name="mood" aria-label="Memory mood" placeholder="🥹" defaultValue="💗" maxLength={12} style={fieldStyle} /></label>
            <label style={pcss("grid-column:1/-1;font:800 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>The story<textarea name="story" aria-label="Memory story" placeholder="Write the details you both want to remember…" rows={4} maxLength={2_000} style={{ ...fieldStyle, resize: 'vertical' }} /></label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 13 }}>
            <button type="button" disabled={geoBusy} onClick={() => void selectCurrentLocation()} style={actionStyle}>{geoBusy ? 'Finding GPS…' : '⌖ My current location'}</button>
            <button type="button" aria-pressed={pickMode} onClick={() => setPickMode((value) => !value)} style={actionStyle}>🗺️ Pick on map</button>
          </div>

          {(pickMode || draftPoint) && (
            <div style={{ height: 250, marginTop: 10, overflow: 'hidden', borderRadius: 16, border: '1px solid var(--ln,rgba(74,74,74,.1))' }}>
              <PlaceMap
                places={[]}
                selectedId={null}
                draftPoint={draftPoint}
                picking={pickMode}
                onSelect={ignoreMapSelection}
                onPick={pickMode ? (point) => {
                  setDraftPoint(point);
                  setLocation(coordinateLabel(point, 'Map pin'));
                  setPickMode(false);
                  toast('Map location added to this memory');
                } : undefined}
              />
            </div>
          )}

          {formError && <div role="alert" style={pcss("margin-top:10px;font:700 10.5px/1.45 'Nunito',sans-serif;color:#B5485D")}>{formError}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 15 }}>
            <button type="button" onClick={resetDraft} style={actionStyle}>Cancel</button>
            <button type="submit" disabled={photoBusy || geoBusy} style={{ ...actionStyle, border: 0, background: 'var(--pk,#FFB7B2)', color: '#5C3A42', opacity: photoBusy || geoBusy ? 0.6 : 1 }}>Save memory 📖</button>
          </div>
        </form>
      )}

      {memories.length === 0 && !creating && (
        <EmptyState tag="YOUR MEMORIES" emoji="📖" title="No saved memories yet" body="Save your first story and it will be available to both accounts." actionLabel="Create your first memory" onAction={() => setCreating(true)} />
      )}

      {memories.map((memory) => {
        const open = openId === memory.id;
        const pictureEntries = memory.photoIds
          .map((id) => ({ photo: photos.find((photo) => photo.id === id), index: photos.findIndex((photo) => photo.id === id) }))
          .filter((entry) => entry.photo && entry.index >= 0);
        return (
          <article key={memory.id} style={pcss('border-radius:26px;background:var(--sf,#fff);padding:16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <button type="button" aria-expanded={open} aria-controls={`memory-${memory.id}`} onClick={() => setOpenId(open ? null : memory.id)} style={pcss("width:100%;display:flex;gap:10px;align-items:flex-start;padding:0;border:0;background:transparent;text-align:left;color:inherit;cursor:pointer")}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{memory.date}</div>
                <div style={pcss("font:700 17px/1.25 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:5px")}>{memory.title}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{memory.meta}</div>
              </div>
              <span style={{ fontSize: 20, flex: 'none' }}>{memory.mood}</span>
              <span style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{open ? '−' : '+'}</span>
            </button>
            {open && (
              <div id={`memory-${memory.id}`}>
                {pictureEntries.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 14, overflowX: 'auto', padding: '4px 0' }}>
                    {pictureEntries.map(({ photo, index }, pictureIndex) => (
                      <PhotoOpenTarget key={photo!.id} index={index} style={pcss(`flex:none;width:120px;background:#fff;padding:8px 8px 0;border-radius:4px;box-shadow:0 6px 16px rgba(120,90,100,.16);transform:rotate(${reduced ? 0 : pictureIndex % 2 ? 1.6 : -1.6}deg)`)}>
                        {photo!.imageUrl ? <img src={photo!.imageUrl} alt={photo!.caption} style={{ display: 'block', width: '100%', aspectRatio: 1, objectFit: 'cover' }} /> : <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{photo!.slotLabel}</div>}
                        <div style={pcss("padding:7px 3px 8px;text-align:center;font:600 13px 'Caveat',cursive;color:#4A4A4A")}>#{pictureIndex + 1}</div>
                      </PhotoOpenTarget>
                    ))}
                  </div>
                )}
                <div style={pcss("font:500 17px/1.5 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:8px")}>{memory.story}</div>
              </div>
            )}
          </article>
        );
      })}
    </ScrollColumn>
  );
}
