import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { EmptyState, HeroSurface } from '../components/shared/Atoms';
import { QuickCreatePanel } from '../components/shared/QuickCreatePanel';
import { THEMES } from '../lib/theme';
import type { LoveNoteState } from '../types';
import { useAuthState } from '../state/AuthState';

function cardStyle(state: LoveNoteState) {
  return pcss(`border-radius:22px;padding:16px 17px;background:${state === 'open' ? 'var(--sf2,#FFF4F1)' : 'var(--sf,#fff)'};border:${state === 'open' ? '1px dashed rgba(232,111,135,.5)' : '1px solid var(--ln,rgba(74,74,74,.07))'};box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))`);
}

export default function NotesPage() {
  const { profile, partner } = useAuthState();
  const { theme, reduced, loveNotes, addLoveNote, markLoveNoteOpened, toast } = useAppState();
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [tomorrow] = useState(() => new Date(Date.now() + 86_400_000).toISOString().slice(0, 16));
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px')}>
        <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Sealed love notes ⏳</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>messages that open at exactly the right time</div>
        <button type="button" onClick={() => setCreating((value) => !value)} aria-expanded={creating} style={pcss("margin-top:14px;padding:10px 16px;border:0;border-radius:100px;background:rgba(255,255,255,.64);font:800 11px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}>+ Write a new note</button>
      </HeroSurface>

      {creating && (
        <QuickCreatePanel
          title={`A note for ${partner?.nickname || partner?.name || 'your partner'}`}
          description="Leave the unlock time empty if the note can be read immediately."
          submitLabel="Send note 💌"
          fields={[
            { name: 'preview', label: 'Title / front line', placeholder: 'Open when you miss me…', required: true, wide: true },
            { name: 'unlockAt', label: 'Can be opened from', type: 'datetime-local', defaultValue: tomorrow, wide: true },
            { name: 'body', label: 'Note body', type: 'textarea', placeholder: 'Write everything you want to say…', required: true, wide: true },
          ]}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            const added = addLoveNote({ preview: values.preview, body: values.body, unlockAt: values.unlockAt || '' });
            if (!added) return;
            setCreating(false);
            toast('Note sent and stored securely 💌');
          }}
        />
      )}

      {loveNotes.length === 0 && !creating && <EmptyState tag="NOTES FOR BOTH OF YOU" emoji="💌" title="No notes yet" body="Write your first note to open now or at a time you choose." actionLabel="Write the first note" onAction={() => setCreating(true)} />}

      {loveNotes.map((note) => {
        const lockAnimating = note.state === 'lock' && !reduced;
        const readable = note.state === 'open' || note.state === 'done';
        const expanded = openNoteId === note.id;
        const authorName = note.from === 'partner' ? (partner?.nickname || partner?.name || 'Partner') : (profile?.nickname || profile?.name || 'You');
        return (
          <article key={note.id} style={cardStyle(note.state)}>
            <button
              type="button"
              disabled={!readable}
              title={readable ? undefined : 'This note is still sealed'}
              aria-expanded={readable ? expanded : undefined}
              aria-controls={readable ? `note-${note.id}` : undefined}
              onClick={() => {
                if (!readable) return;
                const nextOpen = !expanded;
                setOpenNoteId(nextOpen ? note.id : null);
                if (nextOpen && note.from === 'partner' && note.state === 'open') markLoveNoteOpened(note.id);
              }}
              style={pcss(`width:100%;padding:0;border:0;background:transparent;text-align:left;color:inherit;cursor:${readable ? 'pointer' : 'not-allowed'}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{note.tag}</div>
                  <div style={pcss("font:600 21px/1.25 'Caveat',cursive;color:var(--ink,#4A4A4A);margin-top:6px")}>{note.preview}</div>
                  <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:6px")}>{note.meta.replace(/pasangan|partner/i, authorName)}</div>
                </div>
                <span style={{ fontSize: 20, flex: 'none', display: 'inline-block', animation: lockAnimating ? 'kk-wiggle 2.4s ease-in-out infinite' : undefined }}>{note.state === 'lock' ? '🔒' : note.state === 'open' ? '🔓' : '💌'}</span>
              </div>
              {readable && <div style={pcss("margin-top:12px;display:inline-block;padding:9px 15px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif")}>{expanded ? 'Close note' : note.state === 'done' ? 'Read again 💌' : 'Open now 💌'}</div>}
              {note.state === 'lock' && <div style={pcss("margin-top:10px;font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Not yet—this note is still sealed! 🤫</div>}
            </button>
            {expanded && <div id={`note-${note.id}`} style={pcss("font:600 19px/1.45 'Caveat',cursive;color:var(--ink,#4A4A4A);background:rgba(255,255,255,.7);border-radius:16px;padding:14px 16px;margin-top:13px")}>{note.body}</div>}
          </article>
        );
      })}
    </ScrollColumn>
  );
}
