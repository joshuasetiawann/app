import type { CSSProperties, ReactNode } from 'react';
import { pcss } from '../../lib/pcss';

/** Filter chip row, e.g. gallery/food/place category filters. */
export function ChipRow({ items, active, onSelect }: { items: string[]; active: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 0 4px' }}>
      {items.map((label) => (
        <div
          key={label}
          onClick={() => onSelect(label)}
          role="button"
          aria-pressed={active === label}
          style={pcss(
            `flex:none;padding:8px 14px;border-radius:100px;cursor:pointer;font:700 11.5px "Nunito",sans-serif;background:${active === label ? 'var(--pk,#FFB7B2)' : 'var(--sf,#fff)'};color:${active === label ? '#5C3A42' : 'var(--ink2,#6B5B60)'};box-shadow:0 2px 8px rgba(120,90,100,.07)`,
          )}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

/**
 * A hero panel painted with one of the theme's light `hero` gradients.
 *
 * Those gradients are defined once per theme and stay light in both color
 * schemes (see THEMES in src/lib/theme.ts). Text inside them, however, reads
 * from --ink/--ink2/--mut, which flip to near-white in dark mode — which
 * would leave the hero's headline nearly invisible on its pale background.
 *
 * So this surface re-pins the neutral tokens to their light-scheme values
 * for its subtree only. The gradient renders exactly as specified in both
 * schemes, every child keeps using the same var() names as the design, and
 * the contrast inside the panel stays correct. Accent tokens (--pk/--pki/
 * --lav) are intentionally left alone: they're identical across schemes.
 */
export function HeroSurface({ background, children, style }: { background: string; children: ReactNode; style?: CSSProperties }) {
  const lightNeutrals = {
    '--ink': '#4A4A4A',
    '--ink2': '#6B5B60',
    '--mut': '#A99A9E',
    '--sf': '#FFFFFF',
    '--sf2': '#FFF4F1',
    '--ln': 'rgba(74,74,74,.1)',
  } as CSSProperties;
  return <div style={{ ...lightNeutrals, background, ...style }}>{children}</div>;
}

export function Card({ children, style, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        borderRadius: 24,
        background: 'var(--sf,#fff)',
        padding: '16px 17px',
        boxShadow: 'var(--shadow,0 8px 24px rgba(0,0,0,.04))',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 2px 12px' }}>
      <span style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{title}</span>
      {action && (
        <span style={pcss("font:700 11.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={onAction} role="button">
          {action}
        </span>
      )}
    </div>
  );
}

/** Photo placeholder — matches the design's repeating diagonal pattern used everywhere in lieu of real images. */
export function PhotoPlaceholder({ label, style }: { label: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        aspectRatio: 1,
        background: 'repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      <span style={pcss("font:700 9px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{label}</span>
    </div>
  );
}

export function PolaroidPhoto({
  label,
  caption,
  meta,
  rotationDeg = 0,
  width = 158,
  onClick,
}: {
  label: string;
  caption: string;
  meta?: string;
  rotationDeg?: number;
  width?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={pcss(
        `flex:none;width:${width}px;background:#fff;padding:10px 10px 0;border-radius:5px;box-shadow:0 8px 20px rgba(120,90,100,.16);transform:rotate(${rotationDeg}deg);cursor:${onClick ? 'pointer' : 'default'};transition:transform .2s`,
      )}
    >
      <PhotoPlaceholder label={label} style={{ borderRadius: 2 }} />
      <div style={{ padding: '9px 3px 4px', textAlign: 'center' }}>
        <div style={pcss("font:600 16px/1.1 'Caveat',cursive;color:var(--ink,#4A4A4A)")}>{caption}</div>
        {meta && <div style={pcss("font:700 8px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{meta}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ percent, height = 7 }: { percent: number; height?: number }) {
  return (
    <div style={{ height, borderRadius: height, background: 'var(--sf2,#FFF4F1)' }}>
      <div style={{ width: `${percent}%`, height, borderRadius: height, background: 'linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return <span style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87)")}>{'★'.repeat(rating) + '☆'.repeat(5 - rating)}</span>;
}

export function EmptyState({
  tag,
  tagColor = 'var(--pki,#E86F87)',
  emoji,
  title,
  body,
  actionLabel,
  onAction,
  actionStyle = 'primary',
}: {
  tag: string;
  tagColor?: string;
  emoji: string;
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  actionStyle?: 'primary' | 'muted';
}) {
  return (
    <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));text-align:center')}>
      <div style={{ font: '700 9.5px "Nunito",sans-serif', letterSpacing: '.12em', color: tagColor, textAlign: 'left' }}>{tag}</div>
      <div style={{ fontSize: 38, marginTop: 14 }}>{emoji}</div>
      <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>{title}</div>
      <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{body}</div>
      <div
        onClick={onAction}
        role="button"
        style={pcss(
          `display:inline-block;margin-top:12px;padding:10px 16px;border-radius:100px;background:${actionStyle === 'primary' ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${actionStyle === 'primary' ? '#5C3A42' : 'var(--ink2,#6B5B60)'};font:700 11.5px "Nunito",sans-serif;cursor:pointer`,
        )}
      >
        {actionLabel}
      </div>
    </div>
  );
}

export function BigButton({ label, onClick }: { label: ReactNode; onClick: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 10px' }}>
      <div
        onClick={onClick}
        role="button"
        style={pcss("padding:13px 22px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 13px 'Nunito',sans-serif;cursor:pointer;box-shadow:0 8px 20px rgba(255,140,150,.3)")}
      >
        {label}
      </div>
    </div>
  );
}
