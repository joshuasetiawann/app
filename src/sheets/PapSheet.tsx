import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';
import { ImageSourcePicker } from '../components/shared/ImageSourcePicker';
import { imageDataUrl } from '../lib/image';

export function PapSheetContent() {
  const navigate = useNavigate();
  const { albums, closeSheet, addPhotoMessage, toast } = useAppState();
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [album, setAlbum] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choosePhoto = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      setPhotoDataUrl(await imageDataUrl(file));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The picture could not be processed.');
    } finally {
      setBusy(false);
    }
  };

  const send = (openChat: boolean) => {
    if (!photoDataUrl) return;
    addPhotoMessage({
      slotLabel: 'NEW PICTURE',
      caption: caption.trim() || 'A little moment for you 📷',
      dataUrl: photoDataUrl,
      album,
    });
    toast('Picture sent to your chat ✓');
    closeSheet();
    if (openChat) navigate('/chat');
  };

  return (
    <>
      <SheetHeading title="Send a picture 📷" sub="Capture it here or choose one from your photo library." />

      {!photoDataUrl ? (
        <div className="kk-picture-source-card">
          <div className="kk-picture-source-visual" aria-hidden="true"><span>💞</span></div>
          <strong>Share a moment, without leaving the app</strong>
          <small>The in-app camera supports front and rear cameras. Your photo is optimized before it is securely synced.</small>
          <ImageSourcePicker
            busy={busy}
            onFiles={choosePhoto}
            galleryAriaLabel="Choose a picture to send"
            cameraAriaLabel="Take a picture to send"
          />
          {busy && <div className="kk-picture-status" aria-live="polite">Optimizing your picture…</div>}
          {error && <div className="kk-picture-error" role="alert">{error}</div>}
        </div>
      ) : (
        <div className="kk-picture-compose">
          <div className="kk-picture-preview">
            <img src={photoDataUrl} alt="Selected picture preview" />
            <button type="button" onClick={() => setPhotoDataUrl('')} aria-label="Choose another picture">↻ Replace</button>
          </div>

          <label>
            Caption
            <input value={caption} placeholder="Add a sweet note…" onChange={(event) => setCaption(event.target.value)} maxLength={160} />
          </label>
          <label>
            Save to an album too
            <select value={album} onChange={(event) => setAlbum(event.target.value)} aria-label="Picture album">
              <option value="">No album</option>
              {albums.map((item) => <option key={item.id} value={item.title}>{item.icon} {item.title}</option>)}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 9 }}>
            <SheetPill label="Send & close" onClick={() => send(false)} />
            <SheetPill label="Send & open chat" primary onClick={() => send(true)} />
          </div>
        </div>
      )}
    </>
  );
}
