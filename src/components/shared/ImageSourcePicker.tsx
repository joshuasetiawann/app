import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { pcss } from '../../lib/pcss';

export function ImageSourcePicker({
  onFiles,
  busy = false,
  multiple = false,
  galleryAriaLabel = 'Pilih foto dari galeri',
  cameraAriaLabel = 'Ambil foto dengan kamera',
  accept = 'image/*',
}: {
  onFiles: (files: File[]) => void | Promise<void>;
  busy?: boolean;
  multiple?: boolean;
  galleryAriaLabel?: string;
  cameraAriaLabel?: string;
  accept?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

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
    void videoRef.current.play().catch(() => setCameraError('Pratinjau kamera belum dapat diputar.'));
  }, [cameraOpen]);

  const openCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1_920 }, height: { ideal: 1_080 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraOpen(true);
      setCameraError('Izin kamera belum diberikan. Izinkan kamera, atau gunakan tombol kamera sistem di bawah.');
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setCameraError('Foto belum berhasil diambil. Coba sekali lagi.');
      return;
    }
    stopCamera();
    await onFiles([new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })]);
  };

  const changed = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length) void onFiles(files);
  };

  const buttonStyle = pcss("min-height:42px;padding:0 14px;border:1px solid var(--ln,rgba(74,74,74,.1));border-radius:13px;background:var(--sf,#fff);color:var(--ink2,#6B5B60);font:800 10.5px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 5px 14px rgba(90,65,75,.07)");

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <input ref={cameraRef} type="file" accept={accept} capture="environment" aria-label={cameraAriaLabel} onChange={changed} hidden />
      <input ref={galleryRef} type="file" accept={accept} multiple={multiple} aria-label={galleryAriaLabel} onChange={changed} hidden />
      <button type="button" disabled={busy} style={buttonStyle} onClick={() => void openCamera()}>📷 Kamera</button>
      <button type="button" disabled={busy} style={buttonStyle} onClick={() => galleryRef.current?.click()}>🖼️ Galeri{multiple ? ' (banyak)' : ''}</button>
      {cameraOpen && createPortal(
        <div role="dialog" aria-modal="true" aria-label="Ambil foto dengan kamera" style={pcss('position:fixed;inset:0;z-index:1000;padding:18px;background:rgba(24,18,21,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:kk-fade .2s ease')} onClick={(event) => { if (event.target === event.currentTarget) stopCamera(); }}>
          <div style={pcss('width:min(520px,100%);padding:14px;border-radius:24px;background:#171317;box-shadow:0 24px 70px rgba(0,0,0,.45)')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 11 }}>
              <div><strong style={pcss("display:block;color:#fff;font:800 14px 'Quicksand',sans-serif")}>Kamera perangkat</strong><small style={pcss("color:rgba(255,255,255,.62);font:600 10px 'Nunito',sans-serif")}>Posisikan foto, lalu ketuk Ambil foto.</small></div>
              <button type="button" onClick={stopCamera} aria-label="Tutup kamera" style={pcss('width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;cursor:pointer')}>✕</button>
            </div>
            {!cameraError && <video ref={videoRef} playsInline muted onLoadedMetadata={() => setCameraReady(true)} style={{ display: 'block', width: '100%', maxHeight: '68vh', aspectRatio: '3 / 4', objectFit: 'cover', borderRadius: 18, background: '#080708' }} />}
            {cameraError && <div role="alert" style={pcss("min-height:220px;padding:24px;border-radius:18px;background:#2A2226;color:#FFDCE2;display:flex;align-items:center;text-align:center;font:700 12px/1.55 'Nunito',sans-serif")}>{cameraError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: cameraError ? '1fr' : '1fr 1.35fr', gap: 9, marginTop: 11 }}>
              <button type="button" onClick={() => { stopCamera(); window.setTimeout(() => cameraRef.current?.click(), 0); }} style={pcss("min-height:44px;border:0;border-radius:14px;background:rgba(255,255,255,.11);color:#fff;font:800 11px 'Nunito',sans-serif;cursor:pointer")}>Kamera sistem</button>
              {!cameraError && <button type="button" disabled={!cameraReady} onClick={() => void capturePhoto()} style={pcss(`min-height:44px;border:0;border-radius:14px;background:#FFB7B2;color:#5C3A42;font:800 11px 'Nunito',sans-serif;cursor:${cameraReady ? 'pointer' : 'wait'};opacity:${cameraReady ? '1' : '.55'}`)}>● Ambil foto</button>}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
