import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { pcss } from '../../lib/pcss';

export function ImageSourcePicker({
  onFiles,
  busy = false,
  multiple = false,
  galleryAriaLabel = 'Choose a photo from your library',
  cameraAriaLabel = 'Take a photo with the in-app camera',
  accept = 'image/*',
}: {
  onFiles: (files: File[]) => void | Promise<void>;
  busy?: boolean;
  multiple?: boolean;
  galleryAriaLabel?: string;
  cameraAriaLabel?: string;
  accept?: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
    setCameraOpen(false);
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => setCameraError('The camera preview could not start.'));
  }, [cameraOpen]);

  const startCamera = async (mode: 'user' | 'environment') => {
    setCameraError('');
    setCameraReady(false);
    setFacingMode(mode);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraOpen(true);
      setCameraError('This browser cannot open an in-app camera. Choose a photo from your library instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: mode }, width: { ideal: 1_920 }, height: { ideal: 1_080 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => setCameraError('The camera preview could not start.'));
      }
    } catch {
      setCameraOpen(true);
      setCameraError('Camera access is blocked. Allow camera access in your browser settings, then try again.');
    }
  };

  const openCamera = () => startCamera(facingMode);

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (facingMode === 'user') {
      context?.translate(canvas.width, 0);
      context?.scale(-1, 1);
    }
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setCameraError('The photo could not be captured. Please try again.');
      return;
    }
    stopCamera();
    await onFiles([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })]);
  };

  const changed = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length) void onFiles(files);
  };

  const buttonStyle = pcss("min-height:42px;padding:0 14px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:13px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10.5px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 5px 14px rgba(90,65,75,.07)");

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <input ref={galleryRef} type="file" accept={accept} multiple={multiple} aria-label={galleryAriaLabel} onChange={changed} hidden />
      <button type="button" disabled={busy} aria-label={cameraAriaLabel} style={buttonStyle} onClick={() => void openCamera()}>📷 Camera</button>
      <button type="button" disabled={busy} style={buttonStyle} onClick={() => galleryRef.current?.click()}>🖼️ Photo library{multiple ? ' · multiple' : ''}</button>
      {cameraOpen && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Take a photo" style={pcss('position:fixed;inset:0;z-index:1000;padding:max(14px,env(safe-area-inset-top)) 14px max(14px,env(safe-area-inset-bottom));background:rgba(24,18,21,.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:kk-fade .2s ease')} onClick={(event) => { if (event.target === event.currentTarget) stopCamera(); }}>
          <div style={pcss('width:min(520px,100%);padding:14px;border-radius:24px;background:#171317;box-shadow:0 24px 70px rgba(0,0,0,.45)')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 11 }}>
              <div><strong style={pcss("display:block;color:#fff;font:800 14px 'Quicksand',sans-serif")}>In-app camera</strong><small style={pcss("color:rgba(255,255,255,.62);font:600 10px 'Nunito',sans-serif")}>Frame your moment, then tap the shutter.</small></div>
              <button type="button" onClick={stopCamera} aria-label="Close camera" style={pcss('width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer')}>✕</button>
            </div>
            {!cameraError && <video ref={videoRef} playsInline muted onLoadedMetadata={() => setCameraReady(true)} style={{ display: 'block', width: '100%', maxHeight: '68vh', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 18, background: '#080708', transform: facingMode === 'user' ? 'scaleX(-1)' : undefined }} />}
            {cameraError && <div role="alert" style={pcss("min-height:220px;padding:24px;border-radius:18px;background:#2A2226;color:#FFDCE2;display:flex;align-items:center;text-align:center;font:700 12px/1.55 'Nunito',sans-serif")}>{cameraError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: cameraError ? '1fr' : '1fr 1.35fr', gap: 9, marginTop: 11 }}>
              {cameraError ? (
                <button type="button" onClick={() => { stopCamera(); window.setTimeout(() => galleryRef.current?.click(), 0); }} style={pcss("min-height:44px;border:0;border-radius:14px;background:rgba(255,255,255,.11);color:#fff;font:800 11px 'Nunito',sans-serif;cursor:pointer")}>Choose from library</button>
              ) : (
                <button type="button" onClick={() => void startCamera(facingMode === 'user' ? 'environment' : 'user')} style={pcss("min-height:44px;border:0;border-radius:14px;background:rgba(255,255,255,.11);color:#fff;font:800 11px 'Nunito',sans-serif;cursor:pointer")}>↻ Switch camera</button>
              )}
              {!cameraError && <button type="button" disabled={!cameraReady} onClick={() => void capturePhoto()} style={pcss(`min-height:44px;border:0;border-radius:14px;background:#FFB7B2;color:#5C3A42;font:800 11px 'Nunito',sans-serif;cursor:${cameraReady ? 'pointer' : 'wait'};opacity:${cameraReady ? '1' : '.55'}`)}>● Take photo</button>}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
