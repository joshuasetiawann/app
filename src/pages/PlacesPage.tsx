import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, BigButton, Stars } from '../components/shared/Atoms';
import { PLACE_CATS, PLACES } from '../data/mockData';

const MAP_PINS = [
  { emoji: '❤️', left: '22%', top: '30%' },
  { emoji: '🍜', left: '52%', top: '52%' },
  { emoji: '🏫', left: '72%', top: '26%' },
  { emoji: '🏠', left: '36%', top: '70%' },
  { emoji: '📸', left: '64%', top: '74%' },
];

export default function PlacesPage() {
  const { placeCategory, setPlaceCategory, toast } = useAppState();
  const visible = placeCategory === 'Semua' ? PLACES : PLACES.filter((p) => p.category === placeCategory);

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:26px;overflow:hidden;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ height: 210, position: 'relative', background: 'var(--sf2,#FFF4F1)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,rgba(255,183,178,.12) 0 14px,rgba(255,255,255,0) 14px 28px)' }} />
          {MAP_PINS.map((pin, i) => (
            <div key={i} style={{ position: 'absolute', left: pin.left, top: pin.top, fontSize: 19, cursor: 'pointer' }} onClick={() => toast('Menampilkan pin di peta')} role="button">
              {pin.emoji}
            </div>
          ))}
          <div style={pcss("position:absolute;left:14px;bottom:14px;background:#fff;border-radius:100px;padding:7px 13px;font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);box-shadow:0 3px 10px rgba(120,90,100,.16)")}>
            Tap pin buat lihat foto &amp; catatan
          </div>
        </div>
      </div>

      <ChipRow items={PLACE_CATS} active={placeCategory} onSelect={setPlaceCategory} />

      {visible.map((p) => (
        <div key={p.id} style={pcss('display:flex;gap:13px;border-radius:22px;background:var(--sf,#fff);padding:13px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));cursor:pointer')} onClick={() => toast(p.title)} role="button">
          <div style={pcss('width:84px;height:84px;border-radius:16px;flex:none;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font-size:22px')}>{p.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={pcss("font:700 13.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{p.title}</span>
              <Stars rating={p.rating} />
            </div>
            <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{p.meta}</div>
            <div style={pcss("font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>{p.note}</div>
          </div>
        </div>
      ))}

      <BigButton label="+ Tambah tempat" onClick={() => toast('Tempat baru ditambahkan 📍')} />
    </ScrollColumn>
  );
}
