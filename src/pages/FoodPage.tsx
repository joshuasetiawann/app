import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { ChipRow, HeroSurface, SectionHeader, Stars } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';
import { FOOD_CATS, FOOD_ALBUMS, FOOD_BARS } from '../data/mockData';

function foodBtnStyle(active: boolean) {
  return pcss(
    `padding:10px 15px;border-radius:100px;cursor:pointer;font:700 12px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
  );
}

export default function FoodPage() {
  const { theme, foodStatus, setFoodStatus, foodCategory, setFoodCategory, foodEntries, updateFoodEntry, removeFoodEntry, openSheet, toast } = useAppState();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const heroBg = THEMES[theme].hero;
  const visibleEntries = foodCategory === 'Semua' ? foodEntries : foodEntries.filter((f) => f.category === foodCategory);

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px;box-shadow:0 8px 24px rgba(255,140,150,.14)')}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Udah makan belum sayang?</div>
            <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>jangan sampai sakit perut ya 🥺</div>
          </div>
          <span style={{ fontSize: 26, animation: 'kk-float 3s ease-in-out infinite' }}>🍜</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 15, flexWrap: 'wrap' }}>
          <div style={foodBtnStyle(foodStatus === 'ate')} onClick={() => { setFoodStatus('ate'); toast('Makan tercatat · udah kenyang 😋'); }} role="button">Udah kenyang! 😋</div>
          <div style={foodBtnStyle(foodStatus === 'now')} onClick={() => { setFoodStatus('now'); toast('Selamat makan sayang 🍜'); }} role="button">Lagi makan 🍜</div>
          <div style={foodBtnStyle(foodStatus === 'not')} onClick={() => { setFoodStatus('not'); toast('Jangan lupa makan ya 🥺'); }} role="button">Belum nih 🥺</div>
          <div style={pcss("padding:10px 15px;border-radius:100px;background:rgba(255,255,255,.7);font:700 12px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => toast('Diingatkan lagi 1 jam lagi ⏰')} role="button">Nanti ⏰</div>
          <div style={pcss("padding:10px 15px;border-radius:100px;background:rgba(255,255,255,.7);font:700 12px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => toast('Semoga cepat sehat lagi 🤒')} role="button">Kurang enak badan 🤒</div>
        </div>
      </HeroSurface>

      <ChipRow items={FOOD_CATS} active={foodCategory} onSelect={setFoodCategory} />

      <SectionHeader title="Food Journal" action="+ Catat makan" onAction={() => openSheet('food')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {visibleEntries.length === 0 && (
          <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:20px;text-align:center;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <div style={{ fontSize: 32 }}>🍽️</div>
            <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:8px")}>Belum ada catatan di kategori ini</div>
          </div>
        )}
        {visibleEntries.map((f) => {
          const isOpen = expanded === f.id;
          return (
            <div key={f.id} style={pcss('border-radius:22px;background:var(--sf,#fff);padding:13px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
              <div
                style={{ display: 'flex', gap: 13, cursor: 'pointer' }}
                onClick={() => {
                  setExpanded(isOpen ? null : f.id);
                  setNoteDraft(f.note);
                }}
                role="button"
              >
                <div style={pcss('width:76px;height:76px;border-radius:16px;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font-size:22px;flex:none')}>
                  {f.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={pcss("font:700 13.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{f.name}</span>
                    <span style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none")}>{f.time}</span>
                  </div>
                  <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>
                    {f.by === 'me' ? 'Joshua' : 'Partner'} · {f.location} · {f.category} · {f.price}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Stars rating={f.rating} />
                  </div>
                  <div style={pcss("font:500 15px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:2px")}>{f.note}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--ln,rgba(74,74,74,.07))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        onClick={() => updateFoodEntry(f.id, { rating: n })}
                        role="button"
                        aria-label={`${n} bintang`}
                        style={{ fontSize: 18, cursor: 'pointer', color: n <= f.rating ? 'var(--pki,#E86F87)' : 'var(--ln,rgba(74,74,74,.2))' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={2}
                    aria-label="Edit catatan"
                    style={pcss(
                      "width:100%;padding:11px 14px;border-radius:14px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 12.5px 'Nunito',sans-serif;outline:none;color:var(--ink,#4A4A4A);resize:none;font-family:inherit",
                    )}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 9 }}>
                    <div
                      style={pcss("flex:1;text-align:center;padding:9px 0;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
                      onClick={() => {
                        updateFoodEntry(f.id, { note: noteDraft });
                        toast('Catatan diperbarui ✓');
                        setExpanded(null);
                      }}
                      role="button"
                    >
                      Simpan
                    </div>
                    <div
                      style={pcss("flex:none;padding:9px 15px;border-radius:100px;background:#FFE1E1;color:#C2506B;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
                      onClick={() => {
                        removeFoodEntry(f.id);
                        toast('Catatan dihapus 🗑️');
                        setExpanded(null);
                      }}
                      role="button"
                    >
                      Hapus
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
        <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Album makanan 🍱</span>
        <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} onClick={() => toast('Kelola album makanan')} role="button">Kelola</span>
      </div>
      <div style={{ display: 'flex', gap: 11, overflowX: 'auto', padding: '2px 0 6px' }}>
        {FOOD_ALBUMS.map((a) => (
          <div key={a.id} style={{ flex: 'none', width: 112 }}>
            <div style={{ height: 82, borderRadius: 16, background: a.bg, display: 'flex', alignItems: 'flex-end', padding: 8, fontSize: 18 }}>{a.icon}</div>
            <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:6px")}>{a.label}</div>
            <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{a.count} foto</div>
          </div>
        ))}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:16px 17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={pcss("font:700 13.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Yang paling sering bulan ini</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height: 96, marginTop: 14 }}>
          {FOOD_BARS.map((b) => (
            <div key={b.icon} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: b.heightPx, borderRadius: 10, background: 'linear-gradient(180deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
              <div style={{ fontSize: 14, marginTop: 7 }}>{b.icon}</div>
              <div style={pcss("font:700 9px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </ScrollColumn>
  );
}
