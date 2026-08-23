import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { LOVE_NOTES } from '../data/mockData';
import type { LoveNoteState } from '../types';

function cardStyle(state: LoveNoteState) {
  return pcss(
    `border-radius:22px;padding:16px 17px;cursor:pointer;background:${state === 'open' ? 'var(--sf2,#FFF4F1)' : 'var(--sf,#fff)'};border:${state === 'open' ? '1px dashed rgba(232,111,135,.5)' : '1px solid var(--ln,rgba(74,74,74,.07))'};box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))`,
  );
}

export default function NotesPage() {
  const { theme, reduced, openSheet, toast } = useAppState();
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px')}>
        <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Surat berkunci ⏳</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>pesan yang cuma kebuka pas waktunya</div>
        <div
          style={pcss("margin-top:14px;display:inline-block;padding:10px 16px;border-radius:100px;background:var(--sf,#fff);font:700 12px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}
          onClick={() => toast('Tulis suratmu, nanti dikunci ⏳')}
          role="button"
        >
          + Tulis surat baru
        </div>
      </HeroSurface>

      {LOVE_NOTES.map((n) => {
        const lockAnimating = n.state === 'lock' && !reduced;
        const openable = n.state === 'open' || n.state === 'done';
        return (
          <div
            key={n.id}
            style={cardStyle(n.state)}
            onClick={() => (openable ? openSheet('capsule') : toast('Eits, sabar belum waktunya! 🤫'))}
            role="button"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{n.tag}</div>
                <div style={pcss("font:600 21px/1.25 'Caveat',cursive;color:var(--ink,#4A4A4A);margin-top:6px")}>{n.preview}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:6px")}>{n.meta}</div>
              </div>
              <span style={{ fontSize: 20, flex: 'none', display: 'inline-block', animation: lockAnimating ? 'kk-wiggle 2.4s ease-in-out infinite' : undefined }}>
                {n.state === 'lock' ? '🔒' : n.state === 'open' ? '🔓' : '💌'}
              </span>
            </div>
            {n.state === 'open' && (
              <div style={pcss("margin-top:12px;display:inline-block;padding:9px 15px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif")}>
                Buka sekarang 💌
              </div>
            )}
            {n.state === 'lock' && (
              <div style={pcss("margin-top:10px;font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Eits, sabar belum waktunya! 🤫</div>
            )}
          </div>
        );
      })}
    </ScrollColumn>
  );
}
