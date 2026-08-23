import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ATTACH_MENU } from '../data/mockData';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { useAppNow, weekdayInZone } from '../lib/appClock';

export default function ChatPage() {
  const navigate = useNavigate();
  const { viewport, messages, typing, draft, setDraft, sendMessage, toast, openSheet } = useAppState();
  const isMobile = viewport === 'mobile';
  const today = weekdayInZone(useAppNow(3_600_000), 'Asia/Jakarta').toUpperCase();
  const gap = isMobile ? 14 : 16;
  const pad = isMobile ? 16 : 22;

  const handleSend = () => {
    if (!sendMessage(draft)) toast('Tulis pesannya dulu 🥺');
    else toast('Terkirim 🚀');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, padding: `4px ${pad}px 8px`, maxWidth: 760, width: '100%', margin: '0 auto', animation: 'kk-fade .22s ease' }}>
      <div style={pcss('display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:18px;background:var(--sf2,#FFF4F1);margin-bottom:12px')}>
        <span style={{ fontSize: 14 }}>📌</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>Pesan dipin: &ldquo;Jangan lupa print visa ya sayang&rdquo;</div>
          <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>Partner · 12 Mei</div>
        </div>
        <span style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")} role="button" onClick={() => toast('Menampilkan pesan yang dipin')}>
          Lihat
        </span>
      </div>

      <div style={pcss("text-align:center;font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);letter-spacing:.1em;margin:4px 0 12px")}>
        HARI INI · {today} 20 MEI
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => {
          const me = m.from === 'me';
          const isPhoto = !!m.photoId;
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', position: 'relative' }}>
                {isPhoto ? (
                  <PhotoOpenTarget index={0} style={pcss('background:#fff;padding:8px 8px 0;border-radius:4px;box-shadow:0 6px 16px rgba(120,90,100,.18);transform:rotate(-1.5deg);width:186px;cursor:pointer')}>
                    <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>
                      FOTO BARU
                    </div>
                    <div style={pcss("padding:8px 3px 10px;text-align:center;font:600 15px 'Caveat',cursive;color:#4A4A4A")}>{m.text}</div>
                  </PhotoOpenTarget>
                ) : (
                  <div
                    style={pcss(
                      `padding:11px 15px;border-radius:${me ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};background:${me ? 'var(--pk,#FFB7B2)' : 'var(--sf,#fff)'};color:${me ? '#5C3A42' : 'var(--ink,#4A4A4A)'};font:600 13px/1.45 "Nunito",sans-serif;box-shadow:${me ? 'none' : 'var(--shadow,0 8px 24px rgba(0,0,0,.04))'}`,
                    )}
                  >
                    {m.text}
                  </div>
                )}
                <div style={pcss("font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px;padding:0 4px")}>
                  {m.time}
                  {me ? (m.read ? ' ✓✓' : ' ✓') : ''}
                </div>
                {m.reaction && (
                  <div
                    key={`reaction-${i}`}
                    style={pcss(
                      `position:absolute;bottom:16px;${me ? 'left:-10px' : 'right:-10px'};background:var(--sf,#fff);border-radius:100px;padding:2px 6px;font-size:11px;box-shadow:0 2px 8px rgba(120,90,100,.16)`,
                    )}
                  >
                    {m.reaction}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {typing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <div style={pcss('padding:11px 15px;border-radius:20px 20px 20px 6px;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));display:flex;gap:4px;align-items:center')}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pk,#FFB7B2)', animation: 'kk-pulse 1s ease-in-out infinite' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pk,#FFB7B2)', animation: 'kk-pulse 1s ease-in-out infinite .18s' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pk,#FFB7B2)', animation: 'kk-pulse 1s ease-in-out infinite .36s' }} />
          </div>
          <span style={pcss("font:500 16px 'Caveat',cursive;color:var(--mut,#A99A9E)")}>Ayang lagi ngetik... 💭</span>
        </div>
      )}

      <div style={{ height: 16 }} />

      <div style={{ position: 'sticky', bottom: 0, paddingTop: 10, background: 'linear-gradient(to top,var(--bg,#FDFBF7) 65%,transparent)' }}>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 9 }}>
          {ATTACH_MENU.map((a) => (
            <div
              key={a.label}
              onClick={() => (a.sheet ? openSheet(a.sheet as 'pap') : a.route ? navigate(a.route) : toast(`Lampiran: ${a.label}`))}
              style={pcss("flex:none;padding:7px 12px;border-radius:100px;background:var(--sf,#fff);box-shadow:0 2px 8px rgba(120,90,100,.08);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}
              role="button"
            >
              {a.label}
            </div>
          ))}
        </div>
        <div style={pcss('display:flex;align-items:center;gap:9px;background:var(--sf,#fff);border-radius:100px;padding:7px 8px 7px 16px;box-shadow:0 4px 16px rgba(120,90,100,.1)')}>
          <span style={{ fontSize: 16, cursor: 'pointer' }} role="button" aria-label="Emoji" onClick={() => toast('Emoji picker')}>😊</span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tulis pesan buat ayang..."
            aria-label="Tulis pesan"
            style={pcss("flex:1;min-width:0;border:none;outline:none;background:transparent;font:600 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}
          />
          <span style={{ fontSize: 16, cursor: 'pointer' }} role="button" aria-label="Kirim PAP" onClick={() => openSheet('pap')}>📸</span>
          <span style={{ fontSize: 16, cursor: 'pointer' }} role="button" aria-label="Voice note" onClick={() => toast('Rekam voice note')}>🎤</span>
          <div
            style={pcss('width:38px;height:38px;border-radius:50%;background:linear-gradient(150deg,#FF8FA3,var(--pk,#FFB7B2));display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;box-shadow:0 4px 12px rgba(255,140,150,.35)')}
            onClick={handleSend}
            role="button"
            aria-label="Kirim pesan"
          >
            🚀
          </div>
        </div>
      </div>
    </div>
  );
}
