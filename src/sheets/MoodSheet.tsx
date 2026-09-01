import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { SheetHeading } from '../components/shared/BottomSheet';
import { MOOD_OPTIONS } from '../data/mockData';

export function MoodSheetContent() {
  const { mood, setMood, closeSheet, toast } = useAppState();

  return (
    <>
      <SheetHeading title="How are you feeling today?" sub="Your partner can see this" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
        {MOOD_OPTIONS.map((m) => {
          const on = mood === m;
          const [emoji, ...rest] = m.split(' ');
          return (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMood(m);
                closeSheet();
                toast(`Mood diupdate: ${m}`);
              }}
              aria-pressed={on}
              style={pcss(
                `padding:14px 6px;border:0;border-radius:18px;text-align:center;cursor:pointer;background:${on ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};font:700 11px "Nunito",sans-serif;color:${on ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
              )}
            >
              <div style={{ fontSize: 22, marginBottom: 5 }}>{emoji}</div>
              {rest.join(' ')}
            </button>
          );
        })}
      </div>
    </>
  );
}
