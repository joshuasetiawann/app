import { pcss } from '../lib/pcss';
import { SheetPill } from '../components/shared/BottomSheet';
import { LOVE_NOTES } from '../data/mockData';

export function CapsuleSheetContent() {
  const note = LOVE_NOTES.find((n) => n.state === 'open') ?? LOVE_NOTES.find((n) => n.state === 'done') ?? LOVE_NOTES[0];

  return (
    <div style={{ textAlign: 'center', padding: '6px 0' }}>
      <div style={{ fontSize: 46, animation: 'kk-pop .5s ease' }}>💌</div>
      <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>The note is open!</div>
      <div style={pcss("font:600 21px 'Caveat',cursive;color:var(--ink,#4A4A4A);background:var(--sf2,#FFF4F1);border-radius:18px;padding:16px 18px;margin-top:12px;text-align:left")}>
        {note.body}
      </div>
      <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:10px")}>
        Ditulis {note.from === 'partner' ? 'Partner' : 'Joshua'} · {note.writtenAt}
      </div>
      <div style={{ marginTop: 16 }}>
        <SheetPill label="Save to Memories · not available yet" primary disabled />
      </div>
    </div>
  );
}
