import type { CSSProperties } from 'react';

/**
 * Parses a CSS declaration string (e.g. "display:flex;gap:8px;color:red")
 * into a React style object. This lets screen code carry the exact same
 * inline-style strings as the approved design source, instead of a
 * hand-translated (and error-prone) object literal per element.
 *
 * Only splits on the first ":" of each declaration, so values containing
 * ":" (rare in this design — none of the design's values do) are still
 * safe as long as they don't also contain ";".
 */
export function pcss(css: string | undefined | null): CSSProperties {
  if (!css) return {};
  const style: Record<string, string> = {};
  for (const rule of css.split(';')) {
    const idx = rule.indexOf(':');
    if (idx === -1) continue;
    const prop = rule.slice(0, idx).trim();
    const val = rule.slice(idx + 1).trim();
    if (!prop || !val) continue;
    const camel = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = val;
  }
  return style as CSSProperties;
}

/** Merge multiple style sources (css strings or objects) into one style object. */
export function mergeStyle(...parts: (string | CSSProperties | undefined | null | false)[]): CSSProperties {
  const out: CSSProperties = {};
  for (const part of parts) {
    if (!part) continue;
    Object.assign(out, typeof part === 'string' ? pcss(part) : part);
  }
  return out;
}
