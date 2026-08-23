import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { RELATIONSHIP } from '../data/mockData';

const authCard = pcss('flex:none;width:288px;border-radius:24px;background:var(--sf,#fff);padding:17px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))');

function StepLabel({ children }: { children: React.ReactNode }) {
  return <div style={pcss("font:700 9px 'Nunito',sans-serif;letter-spacing:.12em;color:var(--pki,#E86F87)")}>{children}</div>;
}

export default function OnboardPage() {
  const navigate = useNavigate();
  const { toast } = useAppState();

  return (
    <ScrollColumn>
      <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
        Alur masuk &amp; menghubungkan pasangan — 6 layar berurutan. Scroll ke samping di HP.
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 2px 14px' }}>
        {/* 1. Welcome */}
        <div style={authCard}>
          <StepLabel>1 · WELCOME</StepLabel>
          <div style={{ textAlign: 'center', padding: '22px 0 10px' }}>
            <div style={pcss('width:74px;height:74px;margin:0 auto;border-radius:26px;background:linear-gradient(140deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7));display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 10px 24px rgba(255,140,150,.35);animation:kk-pulse 3s ease-in-out infinite')}>💗</div>
            <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:16px")}>Selamat datang di KisahKita 🌸</div>
            <div style={pcss("font:500 17px/1.35 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:6px")}>rumah digital buat kalian dua orang aja</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 8 }}>
            <div style={pcss("padding:13px 0;text-align:center;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 12.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Yuk mulai daftar akun baru')} role="button">
              Mulai yuk
            </div>
            <div style={pcss("padding:13px 0;text-align:center;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--ink2,#6B5B60);font:700 12.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Lanjut ke halaman masuk')} role="button">
              Aku udah punya akun
            </div>
          </div>
        </div>

        {/* 2. Login */}
        <div style={authCard}>
          <StepLabel>2 · MASUK</StepLabel>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:16px")}>Selamat datang kembali!</div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>Masuk ke ruang kalian</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
            <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>joshua@email.com</div>
            <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A);display:flex;justify-content:space-between")}>
              <span>••••••••</span>
              <span>👁️</span>
            </div>
            <div style={pcss("padding:12px 14px;border-radius:14px;background:#FFE1E1;font:600 10.5px 'Nunito',sans-serif;color:#C2506B")}>Password salah. Coba lagi ya 🥺</div>
            <div style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);text-align:right;cursor:pointer")} onClick={() => toast('Link reset password dikirim ke email')} role="button">
              Lupa password?
            </div>
            <div style={pcss("padding:13px 0;text-align:center;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 12.5px 'Nunito',sans-serif;cursor:pointer")} onClick={() => toast('Memeriksa kredensial...')} role="button">
              Masuk
            </div>
            <div style={pcss("display:flex;align-items:center;gap:9px;padding:11px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);cursor:pointer")} onClick={() => toast('Face ID diaktifkan')} role="button">
              <span style={{ fontSize: 16 }}>😊</span>
              <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Senyum buat masuk! (Face ID)</span>
            </div>
          </div>
        </div>

        {/* 3. Verify */}
        <div style={authCard}>
          <StepLabel>3 · VERIFIKASI</StepLabel>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:16px")}>Cek email kamu 📮</div>
          <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>Kode 6 angka dikirim ke joshua@email.com. Berlaku 10 menit.</div>
          <div style={{ display: 'flex', gap: 7, marginTop: 16 }}>
            {['4', '8', '2', '1', '', ''].map((digit, i) => (
              <div
                key={i}
                style={pcss(
                  `flex:1;aspect-ratio:1;border-radius:12px;background:${i === 3 ? 'var(--sf,#fff)' : 'var(--sf2,#FFF4F1)'};display:flex;align-items:center;justify-content:center;font:700 17px "Quicksand",sans-serif;color:${i === 3 ? 'var(--pki,#E86F87)' : 'var(--ink,#4A4A4A)'};border:${i === 3 ? '2px solid var(--pk,#FFB7B2)' : 'none'}`,
                )}
              >
                {digit}
              </div>
            ))}
          </div>
          <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:14px;text-align:center")}>Kirim ulang dalam 00:42</div>
          <div style={pcss("margin-top:14px;padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:500 16px 'Caveat',cursive;color:var(--ink2,#6B5B60)")}>
            Lupa password ya? Jangan lupa sama aku aja ya 🥺
          </div>
        </div>

        {/* 4. Create profile */}
        <div style={authCard}>
          <StepLabel>4 · BIKIN PROFIL</StepLabel>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={pcss('width:74px;height:74px;margin:0 auto;border-radius:50%;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:30px;position:relative')}>
              🧑🏻
              <span style={pcss("position:absolute;right:-3px;bottom:-3px;width:26px;height:26px;border-radius:50%;background:var(--pk,#FFB7B2);display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid var(--sf,#fff)")}>📷</span>
            </div>
            <div style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:12px")}>Kenalan dulu yuk</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
            <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Joshua</div>
            <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Panggilan sayang...</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>🇮🇩 Jakarta</div>
              <div style={pcss("padding:12px 14px;border-radius:14px;background:var(--sf2,#FFF4F1);font:600 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>14 Mar</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={pcss("padding:7px 12px;border-radius:100px;background:var(--pk,#FFB7B2);font:700 10.5px 'Nunito',sans-serif;color:#5C3A42")}>💻 Ngoding</span>
              <span style={pcss("padding:7px 12px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>🏀 Basket</span>
              <span style={pcss("padding:7px 12px;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>🍛 Nasi padang</span>
            </div>
          </div>
        </div>

        {/* 5. Connect */}
        <div style={authCard}>
          <StepLabel>5 · HUBUNGKAN</StepLabel>
          <div style={pcss("font:700 17px/1.25 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:16px")}>Bangun Rumah Digital Kita 🏠❤️</div>
          <div style={pcss('margin-top:14px;padding:16px;border-radius:18px;background:var(--sf2,#FFF4F1);text-align:center')}>
            <div style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>KODE UNDANGAN</div>
            <div style={pcss("font:700 21px 'Quicksand',sans-serif;color:var(--pki,#E86F87);margin-top:7px;letter-spacing:.04em")}>{RELATIONSHIP.coupleCode}</div>
            <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 12 }}>
              <span
                style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}
                onClick={() => {
                  navigator.clipboard?.writeText(RELATIONSHIP.coupleCode).catch(() => {});
                  toast('Kode disalin ✓');
                }}
                role="button"
              >
                Copy
              </span>
              <span style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => toast('Membuka opsi share...')} role="button">
                Share
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 13 }}>
            <div style={{ width: 74, height: 74, borderRadius: 14, background: 'repeating-conic-gradient(#4A3B45 0% 25%,#fff 0% 50%) 0 0/16px 16px', flex: 'none', border: '5px solid #fff', boxShadow: '0 3px 10px rgba(120,90,100,.16)' }} />
            <div>
              <div style={pcss("font:700 12px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Atau scan QR Hati 💗</div>
              <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>Minta dia buka kamera KisahKita dan arahkan ke sini</div>
            </div>
          </div>
          <div style={pcss('margin-top:13px;padding:12px 14px;border-radius:14px;background:var(--sf,#fff);border:1px dashed rgba(232,111,135,.45);display:flex;align-items:center;gap:9px')}>
            <span style={{ fontSize: 15, animation: 'kk-pulse 1.6s ease-in-out infinite' }}>👀</span>
            <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)")}>Nunggu ayang masuk...</span>
          </div>
        </div>

        {/* 6. Connected */}
        <div style={authCard}>
          <StepLabel>6 · TERHUBUNG</StepLabel>
          <div style={{ textAlign: 'center', padding: '14px 0 4px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '8%', top: 4, fontSize: 13, animation: 'kk-fall 5s linear infinite' }}>💗</div>
            <div style={{ position: 'absolute', left: '70%', top: 4, fontSize: 11, animation: 'kk-fall 6s linear infinite 1.5s' }}>💗</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
              <div style={pcss('width:56px;height:56px;border-radius:50%;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:24px;border:3px solid #fff')}>🧑🏻</div>
              <div style={pcss('width:30px;height:30px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;margin:0 -7px;z-index:2;box-shadow:0 4px 12px rgba(255,140,150,.35);animation:kk-pop .6s ease')}>💗</div>
              <div style={pcss('width:56px;height:56px;border-radius:50%;background:linear-gradient(140deg,#D9E9FF,#FFD3EA);display:flex;align-items:center;justify-content:center;font-size:24px;border:3px solid #fff')}>👩🏻</div>
            </div>
            <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);margin-top:16px")}>Yay! Kalian terhubung ❤️</div>
            <div style={pcss("font:500 17px/1.35 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:5px")}>Joshua &amp; Partner · welcome home</div>
          </div>
          <div
            style={pcss("margin-top:16px;padding:13px 0;text-align:center;border-radius:100px;background:var(--pk,#FFB7B2);color:#5C3A42;font:700 12.5px 'Nunito',sans-serif;cursor:pointer")}
            onClick={() => navigate('/')}
            role="button"
          >
            Masuk ke Our Space
          </div>
        </div>
      </div>
    </ScrollColumn>
  );
}
