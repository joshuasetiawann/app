import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { EmptyState, HeroSurface } from '../components/shared/Atoms';
import { QuickCreatePanel } from '../components/shared/QuickCreatePanel';
import { THEMES } from '../lib/theme';

export default function StoryPage() {
  const { theme, storyChapters, addStoryChapter, toast } = useAppState();
  const [creating, setCreating] = useState(false);
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:26px;padding:20px;text-align:center')}>
        <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Our storybook 🌱</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:4px")}>from the first hello to today</div>
        <button type="button" onClick={() => setCreating((value) => !value)} aria-expanded={creating} style={pcss("margin-top:13px;padding:9px 14px;border:0;border-radius:100px;background:rgba(255,255,255,.64);color:var(--pki,#E86F87);cursor:pointer;font:800 10.5px 'Nunito',sans-serif")}>+ Write chapter</button>
      </HeroSurface>

      {creating && (
        <QuickCreatePanel
          title="Write a new chapter"
          description="This chapter joins your shared timeline and syncs automatically."
          submitLabel="Add to our story 🌱"
          fields={[
            { name: 'year', label: 'Year / period', defaultValue: String(new Date().getFullYear()), required: true },
            { name: 'icon', label: 'Emoji', defaultValue: '🌱' },
            { name: 'title', label: 'Chapter title', placeholder: 'The day we first met', required: true, wide: true },
            { name: 'place', label: 'Place', placeholder: 'Discord / Jakarta / Taipei' },
            { name: 'note', label: 'Short story', type: 'textarea', placeholder: 'What happened that day?', wide: true },
          ]}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            addStoryChapter({ year: values.year, title: values.title, place: values.place || '', note: values.note || '', icon: values.icon || '' });
            setCreating(false);
            toast('New chapter saved for both of you 🌱');
          }}
        />
      )}

      {storyChapters.length === 0 && !creating && <EmptyState tag="YOUR STORY" emoji="🌱" title="Your first chapter has not been written" body="Write the beginning of your journey and your partner will see it immediately." actionLabel="Write the first chapter" onAction={() => setCreating(true)} />}

      <div style={{ paddingLeft: 6 }}>
        {storyChapters.map((chapter, index) => (
          <div key={chapter.id} style={{ display: 'flex', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', width: 34 }}>
              <div style={pcss('width:34px;height:34px;border-radius:50%;background:var(--sf,#fff);box-shadow:0 3px 10px rgba(120,90,100,.12);display:flex;align-items:center;justify-content:center;font-size:15px')}>{chapter.icon}</div>
              {index < storyChapters.length - 1 && <div style={{ flex: 1, width: 2, background: 'var(--ln,rgba(74,74,74,.12))', marginTop: 4 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: 20, minWidth: 0 }}>
              <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{chapter.year}</div>
              <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:3px")}>{chapter.title}</div>
              <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{chapter.place}</div>
              <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:4px")}>{chapter.note}</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollColumn>
  );
}
