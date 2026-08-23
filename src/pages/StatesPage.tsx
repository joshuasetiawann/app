import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';

export default function StatesPage() {
  const { viewport, offline, toggleOffline, openSheet, toast, setLocation } = useAppState();
  const stateCols = viewport === 'mobile' ? '1fr' : 'repeat(3,1fr)';

  return (
    <ScrollColumn>
      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px')}>
        <div style={pcss("font:700 14px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Kumpulan state buat engineer 🧩</div>
        <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>
          Semua kondisi yang harus dibikin: loading, kosong, error, offline, izin, upload, sukses. Copy langsung dari sini.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={toggleOffline} role="button">
            {offline ? 'Matikan mode offline' : 'Coba mode offline'}
          </div>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => openSheet('pap')} role="button">
            Lihat flow upload
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: stateCols, gap: 12 }}>
        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>LOADING</div>
          <div style={{ textAlign: 'center', padding: '18px 0 6px' }}>
            <div style={pcss('width:76px;height:76px;margin:0 auto;border-radius:50%;border:2px dashed rgba(232,111,135,.4);position:relative;animation:kk-orbit 3s linear infinite')}>
              <div style={{ position: 'absolute', top: -10, left: '50%', marginLeft: -9, fontSize: 17 }}>✈️</div>
            </div>
            <div style={pcss("font:600 16px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:12px")}>Lagi terbang ke Taiwan... ☁️</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
            <div style={pcss('height:10px;border-radius:6px;background:linear-gradient(90deg,#F2ECEA 8%,#FBF7F5 18%,#F2ECEA 33%);background-size:320px 100%;animation:kk-shim 1.3s linear infinite')} />
            <div style={pcss('height:10px;width:70%;border-radius:6px;background:linear-gradient(90deg,#F2ECEA 8%,#FBF7F5 18%,#F2ECEA 33%);background-size:320px 100%;animation:kk-shim 1.3s linear infinite')} />
          </div>
        </div>

        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));text-align:center')}>
          <div style={{ font: '700 9.5px "Nunito",sans-serif', letterSpacing: '.12em', color: 'var(--pki,#E86F87)', textAlign: 'left' }}>EMPTY · GALERI</div>
          <div style={{ fontSize: 38, marginTop: 14 }}>🧸📷</div>
          <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>Belum ada foto nih</div>
          <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>Ayo kirim PAP biar kangennya ilang! 🥺</div>
          <div
            style={pcss("display:inline-block;margin-top:12px;padding:10px 16px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
            onClick={() => openSheet('pap')}
            role="button"
          >
            Kirim PAP
          </div>
        </div>

        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));text-align:center')}>
          <div style={{ font: '700 9.5px "Nunito",sans-serif', letterSpacing: '.12em', color: 'var(--pki,#E86F87)', textAlign: 'left' }}>EMPTY · FOOD</div>
          <div style={{ fontSize: 38, marginTop: 14 }}>🍜😢</div>
          <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>Ayang belum update makan</div>
          <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>Jangan sampai sakit perut ya! 🍜</div>
          <div
            style={pcss("display:inline-block;margin-top:12px;padding:10px 16px;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--ink2,#6B5B60);font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
            onClick={() => toast('Nudge dikirim ke Partner 💌')}
            role="button"
          >
            Tanyain
          </div>
        </div>

        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));text-align:center')}>
          <div style={{ font: '700 9.5px "Nunito",sans-serif', letterSpacing: '.12em', color: '#C2506B', textAlign: 'left' }}>ERROR</div>
          <div style={{ fontSize: 38, marginTop: 14 }}>💔</div>
          <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:10px")}>Koneksi ngambek!</div>
          <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>Coba tap buat refresh ya 🥺</div>
          <div
            style={pcss("display:inline-block;margin-top:12px;padding:10px 16px;border-radius:100px;background:#FFE1E1;color:#C2506B;font:700 11.5px 'Nunito',sans-serif;cursor:pointer")}
            onClick={() => toast('Mencoba lagi... ✓')}
            role="button"
          >
            Coba lagi
          </div>
        </div>

        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>PERMISSION</div>
          <div style={{ fontSize: 30, marginTop: 12 }}>📍</div>
          <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);margin-top:8px")}>Izin lokasi ditolak</div>
          <div style={pcss("font:600 11px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>Buka Setelan HP › Izin › Lokasi buat nyalain lagi. Kamu tetap bisa pakai fitur lain.</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div style={pcss("padding:9px 14px;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 11px 'Nunito',sans-serif;cursor:pointer")} onClick={() => { setLocation(true); toast('Izin lokasi diberikan ✓'); }} role="button">
              Buka setelan
            </div>
            <div style={pcss("padding:9px 14px;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--ink2,#6B5B60);font:700 11px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Oke, nanti aja')} role="button">
              Nanti
            </div>
          </div>
        </div>

        <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
          <div style={pcss("font:700 9.5px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>UPLOADING &amp; SUKSES</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 14 }}>
            <div style={pcss('width:34px;height:34px;border-radius:11px;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:15px')}>⬆️</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 7, borderRadius: 7, background: 'var(--sf2,#FFF4F1)' }}>
                <div style={{ width: '64%', height: 7, borderRadius: 7, background: 'linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))' }} />
              </div>
              <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>Mengunggah 64% · 3 dari 5 foto</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ln,rgba(74,74,74,.07))' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E4F5EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, animation: 'kk-pop .5s ease' }}>✓</div>
            <div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Semua tersimpan!</div>
              <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Sinkron ke cloud · 5 foto</div>
            </div>
          </div>
        </div>
      </div>
    </ScrollColumn>
  );
}
