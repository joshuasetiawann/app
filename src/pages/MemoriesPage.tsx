import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { PHOTOS, MEMORIES } from '../data/mockData';

export default function MemoriesPage() {
  const { toast, reduced } = useAppState();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>2026</div>
          <div style={pcss("font:500 17px 'Caveat',cursive;color:var(--mut,#A99A9E)")}>tahun kita mulai LDR ✈️</div>
        </div>
        <div
          style={pcss("padding:8px 14px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
          onClick={() => toast('Kenangan baru dibuat 📖')}
          role="button"
        >
          + Kenangan
        </div>
      </div>

      {MEMORIES.map((m) => {
        const open = openId === m.id;
        const pics = m.photoIds.map((id) => PHOTOS.find((p) => p.id === id)).filter(Boolean) as typeof PHOTOS;
        return (
          <div
            key={m.id}
            style={pcss('border-radius:26px;background:var(--sf,#fff);padding:16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')}
            onClick={() => setOpenId(open ? null : m.id)}
            role="button"
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.1em;color:var(--pki,#E86F87)")}>{m.date}</div>
                <div style={pcss("font:700 17px/1.25 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:5px")}>{m.title}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{m.meta}</div>
              </div>
              <span style={{ fontSize: 20, flex: 'none' }}>{m.mood}</span>
            </div>
            {pics.length > 0 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14, overflowX: 'auto', padding: '4px 0' }}>
                {pics.map((p, i) => (
                  <div key={p.id} style={pcss(`flex:none;width:120px;background:#fff;padding:8px 8px 0;border-radius:4px;box-shadow:0 6px 16px rgba(120,90,100,.16);transform:rotate(${reduced ? 0 : i % 2 ? 1.6 : -1.6}deg)`)}>
                    <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>
                      {p.slotLabel}
                    </div>
                    <div style={pcss("padding:7px 3px 8px;text-align:center;font:600 13px 'Caveat',cursive;color:#4A4A4A")}>#{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={pcss("font:500 17px/1.5 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:8px")}>{m.story}</div>
          </div>
        );
      })}
    </ScrollColumn>
  );
}
