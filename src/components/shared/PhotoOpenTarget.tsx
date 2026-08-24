import type { CSSProperties, ReactNode } from 'react';
import { useAppState } from '../../state/AppState';

/** Wraps a photo thumbnail so clicking (or Enter/Space) opens the lightbox viewer at `index`. */
export function PhotoOpenTarget({ index, style, children }: { index: number; style?: CSSProperties; children: ReactNode }) {
  const { openViewer } = useAppState();
  return (
    <button
      type="button"
      onClick={() => openViewer(index)}
      style={{ display: 'block', padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'inherit', cursor: 'pointer', ...style }}
    >
      {children}
    </button>
  );
}
