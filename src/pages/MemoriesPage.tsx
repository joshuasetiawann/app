import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { EmptyState } from '../components/shared/Atoms';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { QuickCreatePanel } from '../components/shared/QuickCreatePanel';

export default function MemoriesPage() {
  const { memories, photos, reduced, addMemory, toast } = useAppState();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Your memories</div>
          <div style={pcss("font:500 17px 'Caveat',cursive;color:var(--mut,#A99A9E)")}>little stories you keep together ✈️</div>
        </div>
        <button type="button" onClick={() => setCreating((value) => !value)} aria-expanded={creating} style={pcss("padding:9px 14px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--pki,#E86F87);font:800 11px 'Nunito',sans-serif;cursor:pointer")}>+ Memory</button>
      </div>

      {creating && (
        <QuickCreatePanel
          title="Save a new memory"
          description="This story appears on your partner’s device immediately. Pictures can be added from Send a picture or Gallery."
          submitLabel="Save memory 📖"
          fields={[
            { name: 'title', label: 'Title', placeholder: 'Video call until we fell asleep', required: true },
            { name: 'occurredOn', label: 'Date', type: 'date', defaultValue: today, max: today, required: true },
            { name: 'location', label: 'Place', placeholder: 'Jakarta ↔ Taipei' },
            { name: 'mood', label: 'Mood emoji', placeholder: '🥹', defaultValue: '💗' },
            { name: 'story', label: 'The story', type: 'textarea', placeholder: 'Write the details you both want to remember…', wide: true },
          ]}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            addMemory({ title: values.title, occurredOn: values.occurredOn, story: values.story || '', mood: values.mood || '', location: values.location || '' });
            setCreating(false);
            toast('Memory saved and synced 📖');
          }}
        />
      )}

      {memories.length === 0 && !creating && (
        <EmptyState tag="YOUR MEMORIES" emoji="📖" title="No saved memories yet" body="Save your first story and it will be available to both accounts." actionLabel="Create your first memory" onAction={() => setCreating(true)} />
      )}

      {memories.map((memory) => {
        const open = openId === memory.id;
        const pictureEntries = memory.photoIds
          .map((id) => ({ photo: photos.find((photo) => photo.id === id), index: photos.findIndex((photo) => photo.id === id) }))
          .filter((entry) => entry.photo && entry.index >= 0);
        return (
          <article key={memory.id} style={pcss('border-radius:26px;background:var(--sf,#fff);padding:16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <button type="button" aria-expanded={open} aria-controls={`memory-${memory.id}`} onClick={() => setOpenId(open ? null : memory.id)} style={pcss("width:100%;display:flex;gap:10px;align-items:flex-start;padding:0;border:0;background:transparent;text-align:left;color:inherit;cursor:pointer")}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{memory.date}</div>
                <div style={pcss("font:700 17px/1.25 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:5px")}>{memory.title}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{memory.meta}</div>
              </div>
              <span style={{ fontSize: 20, flex: 'none' }}>{memory.mood}</span>
              <span style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{open ? '−' : '+'}</span>
            </button>
            {open && (
              <div id={`memory-${memory.id}`}>
                {pictureEntries.length > 0 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 14, overflowX: 'auto', padding: '4px 0' }}>
                    {pictureEntries.map(({ photo, index }, pictureIndex) => (
                      <PhotoOpenTarget key={photo!.id} index={index} style={pcss(`flex:none;width:120px;background:#fff;padding:8px 8px 0;border-radius:4px;box-shadow:0 6px 16px rgba(120,90,100,.16);transform:rotate(${reduced ? 0 : pictureIndex % 2 ? 1.6 : -1.6}deg)`)}>
                        {photo!.imageUrl ? <img src={photo!.imageUrl} alt={photo!.caption} style={{ display: 'block', width: '100%', aspectRatio: 1, objectFit: 'cover' }} /> : <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>{photo!.slotLabel}</div>}
                        <div style={pcss("padding:7px 3px 8px;text-align:center;font:600 13px 'Caveat',cursive;color:#4A4A4A")}>#{pictureIndex + 1}</div>
                      </PhotoOpenTarget>
                    ))}
                  </div>
                )}
                <div style={pcss("font:500 17px/1.5 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:8px")}>{memory.story}</div>
              </div>
            )}
          </article>
        );
      })}
    </ScrollColumn>
  );
}
