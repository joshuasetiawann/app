import type { CSSProperties, ReactNode } from 'react';
import { useAppState } from '../../state/AppState';

/** The standard per-screen content column: matches the design's `colStyle`. */
export function ScrollColumn({ children, style, maxWidth = 860 }: { children: ReactNode; style?: CSSProperties; maxWidth?: number }) {
  const { viewport } = useAppState();
  const isMobile = viewport === 'mobile';
  const gap = isMobile ? 14 : 16;
  const pad = isMobile ? 16 : 22;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        padding: `4px ${pad}px 8px`,
        maxWidth,
        width: '100%',
        margin: '0 auto',
        animation: 'kk-fade .22s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Matches `homeTwoCol`: two columns on tablet+, single column on mobile. */
export function useTwoColTemplate(): string {
  const { viewport } = useAppState();
  return viewport === 'mobile' ? '1fr' : '1fr 1fr';
}
