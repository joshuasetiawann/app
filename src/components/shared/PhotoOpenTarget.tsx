import type { CSSProperties, ReactNode } from 'react';
import { useAppState } from '../../state/AppState';

/** Wraps a photo thumbnail so clicking (or Enter/Space) opens the lightbox viewer at `index`. */
export function PhotoOpenTarget({ index, style, children }: { index: number; style?: CSSProperties; children: ReactNode }) {
  const { openViewer } = useAppState();
  return (
    <div
      onClick={() => openViewer(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openViewer(index);
      }}
      style={style}
    >
      {children}
    </div>
  );
}
