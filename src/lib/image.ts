export interface ImageOptions {
  maxSide?: number;
  quality?: number;
  maxFileMb?: number;
}

export async function imageDataUrl(file: File, options: ImageOptions = {}) {
  if (!file.type.startsWith('image/')) throw new Error('Pilih berkas gambar JPG, PNG, atau WebP.');
  const maxFileMb = options.maxFileMb ?? 15;
  if (file.size > maxFileMb * 1024 * 1024) throw new Error(`Foto terlalu besar. Maksimal ${maxFileMb} MB.`);

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Foto belum bisa dibaca. Coba gambar lain.'));
    });
    const maxSide = options.maxSide ?? 1_600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Pemrosesan foto tidak didukung perangkat ini.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', options.quality ?? 0.82);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function fileCaption(file: File) {
  return file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Momen baru';
}
