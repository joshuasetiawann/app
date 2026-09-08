import type { CSSProperties } from 'react';

export type ThemeKey = 'sakura' | 'midnight' | 'matcha' | 'taipei';

export interface ThemeDef {
  key: ThemeKey;
  icon: string;
  label: string;
  sub: string;
  cardBg: string;
  pk: string;
  pki: string;
  lav: string;
  hero: string;
}

/** The four accent themes offered in the design's Tema screen. */
export const THEMES: Record<ThemeKey, ThemeDef> = {
  sakura: {
    key: 'sakura',
    icon: '🌸',
    label: 'Sakura Bloom',
    sub: 'Blush pink, little hearts, and soft sparkles',
    cardBg: 'linear-gradient(150deg,#FFE1E4,#F3E1FF)',
    pk: '#FFB7B2',
    pki: '#E86F87',
    lav: '#E3D7F7',
    hero: 'linear-gradient(155deg,#FFE7E4 0%,#FFF1E9 52%,#F3E9FF 100%)',
  },
  midnight: {
    key: 'midnight',
    icon: '🌙',
    label: 'Midnight Call',
    sub: 'Night blue with tiny stars',
    cardBg: 'linear-gradient(150deg,#DCE3FF,#EDE7FA)',
    pk: '#84A9FF',
    pki: '#6B8FEA',
    lav: '#C9D6FF',
    hero: 'linear-gradient(155deg,#E4EAFF 0%,#F1F0FF 52%,#FFE9F3 100%)',
  },
  matcha: {
    key: 'matcha',
    icon: '🍵',
    label: 'Matcha Latte',
    sub: 'Soft matcha green and warm cream',
    cardBg: 'linear-gradient(150deg,#E4F1D4,#F7F4E4)',
    pk: '#C7E5AE',
    pki: '#6E9A55',
    lav: '#E2F0CB',
    hero: 'linear-gradient(155deg,#E8F4DA 0%,#F6F3E4 52%,#DCEFE4 100%)',
  },
  taipei: {
    key: 'taipei',
    icon: '🏮',
    label: 'Taipei Night',
    sub: 'Violet-blue night market glow',
    cardBg: 'linear-gradient(150deg,#EBDCFF,#FFD9EE)',
    pk: '#D9B8FF',
    pki: '#8E5FD1',
    lav: '#FFD3EA',
    hero: 'linear-gradient(155deg,#EFE0FF 0%,#FFEAF6 52%,#DFF0FF 100%)',
  },
};

export interface Tokens {
  bg: string;
  sf: string;
  sf2: string;
  ink: string;
  ink2: string;
  mut: string;
  ln: string;
  sh: string;
  pk: string;
  pki: string;
  lav: string;
}

/** Builds the light/dark token set for a given accent theme, mirroring the design's `tok` object. */
export function buildTokens(theme: ThemeKey, dark: boolean): Tokens {
  const T = THEMES[theme] ?? THEMES.sakura;
  return dark
    ? {
        bg: '#1A1A24',
        sf: '#252536',
        sf2: '#2E2E42',
        ink: '#FDFBF7',
        ink2: '#D8D2DC',
        mut: '#9A93A6',
        ln: 'rgba(255,255,255,.1)',
        sh: '0 6px 20px rgba(12,9,20,.24)',
        pk: T.pk,
        pki: T.pki,
        lav: T.lav,
      }
    : {
        bg: '#FDFBF7',
        sf: '#FFFFFF',
        sf2: '#FFF4F1',
        ink: '#4A4A4A',
        ink2: '#6B5B60',
        mut: '#A99A9E',
        ln: 'rgba(74,74,74,.1)',
        sh: '0 6px 22px rgba(119,76,91,.065)',
        pk: T.pk,
        pki: T.pki,
        lav: T.lav,
      };
}

/** CSS custom properties (--bg, --sf, ...) as a React style object, applied at the app root. */
export function tokensToCssVars(tokens: Tokens): CSSProperties {
  return {
    '--bg': tokens.bg,
    '--sf': tokens.sf,
    '--sf2': tokens.sf2,
    '--ink': tokens.ink,
    '--ink2': tokens.ink2,
    '--mut': tokens.mut,
    '--ln': tokens.ln,
    '--shadow': tokens.sh,
    '--pk': tokens.pk,
    '--pki': tokens.pki,
    '--lav': tokens.lav,
  } as CSSProperties;
}

export type Viewport = 'mobile' | 'tablet' | 'laptop' | 'desktop';

export function viewportFromWidth(w: number): Viewport {
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  if (w < 1440) return 'laptop';
  return 'desktop';
}
