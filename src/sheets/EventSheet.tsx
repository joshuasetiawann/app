import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';

const EVENT_TAGS = ['📞 Video Call', '📚 Kelas', '🏀 Gym', '✈️ Flight', '🎂 Ultah', '🎉 Anniv'];

export function EventSheetContent() {
  const { closeSheet, toast } = useAppState();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');

  const submit = (scope: 'Pribadi' | 'Berdua ❤️') => {
    if (!title.trim()) {
      setError('Judul acara wajib diisi ya 🥺');
      return;
    }
    closeSheet();
    toast(scope === 'Pribadi' ? 'Acara pribadi disimpan' : 'Acara berdua disimpan · Partner dikabari');
  };

  return (
    <>
      <SheetHeading title="Acara baru 🗓️" sub="Berdua atau pribadi" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="Judul acara"
          aria-label="Judul acara"
          aria-invalid={!!error}
          style={pcss(
            `padding:13px 16px;border-radius:16px;border:1px solid ${error ? '#E8899A' : 'var(--ln,rgba(74,74,74,.14))'};background:var(--sf2,#FFF4F1);font:600 13px "Nunito",sans-serif;outline:none;color:var(--ink,#4A4A4A)`,
          )}
        />
        {error && <div style={pcss("font:700 11px 'Nunito',sans-serif;color:#C2506B")}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={pcss("padding:13px 16px;border-radius:16px;background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>📅 20 Mei 2026</div>
          <div style={pcss("padding:13px 16px;border-radius:16px;background:var(--sf2,#FFF4F1);font:600 13px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>🕘 21:00 WIB</div>
        </div>
        <div style={pcss("padding:12px 16px;border-radius:16px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
          Di Taipei jadi 22:00 CST ⏳
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EVENT_TAGS.map((t) => (
            <div
              key={t}
              onClick={() => setTag(t)}
              role="button"
              style={pcss(
                `padding:8px 13px;border-radius:100px;background:${tag === t ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};font:700 11px "Nunito",sans-serif;color:${tag === t ? '#5C3A42' : 'var(--ink2,#6B5B60)'};cursor:pointer`,
              )}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 4 }}>
          <SheetPill label="Pribadi" onClick={() => submit('Pribadi')} />
          <SheetPill label="Berdua ❤️" onClick={() => submit('Berdua ❤️')} primary />
        </div>
      </div>
    </>
  );
}
