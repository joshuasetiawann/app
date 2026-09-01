import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ATTACH_MENU } from '../data/mockData';
import { PhotoOpenTarget } from '../components/shared/PhotoOpenTarget';
import { formatDateLabel, useAppNow } from '../lib/appClock';
import { useAuthState } from '../state/AuthState';

export default function ChatPage() {
  const navigate = useNavigate();
  const {
    viewport,
    photos,
    messages,
    typing,
    draft,
    setDraft,
    sendMessage,
    retryMessage,
    markMessagesRead,
    toast,
    openSheet,
    offline,
    reduced,
    syncStatus,
    syncError,
    refreshSharedData,
  } = useAppState();
  const { profile } = useAuthState();
  const endMarkerRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);
  const firstScrollRef = useRef(true);
  const isMobile = viewport === 'mobile';
  const today = formatDateLabel(
    useAppNow(60_000),
    profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  ).toUpperCase();
  const gap = isMobile ? 14 : 16;
  const pad = isMobile ? 16 : 22;
  const attachItems = ATTACH_MENU.filter((item) => !item.disabled).slice(0, 4);

  useEffect(() => {
    const marker = endMarkerRef.current;
    let scrollParent = marker?.parentElement;
    while (scrollParent) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && scrollParent.scrollHeight > scrollParent.clientHeight) break;
      scrollParent = scrollParent.parentElement;
    }
    if (!scrollParent) return;
    const updateFollowState = () => {
      const distance = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
      followLatestRef.current = distance < 180;
    };
    updateFollowState();
    scrollParent.addEventListener('scroll', updateFollowState, { passive: true });
    return () => scrollParent.removeEventListener('scroll', updateFollowState);
  }, []);

  useEffect(() => {
    const latest = messages.at(-1);
    const shouldFollow = firstScrollRef.current || latest?.from === 'me' || followLatestRef.current;
    firstScrollRef.current = false;
    if (!shouldFollow) return;
    const frame = window.requestAnimationFrame(() => {
      endMarkerRef.current?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'end',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, reduced, typing]);

  useEffect(() => {
    if (messages.some((message) => message.from === 'partner' && !message.read)) markMessagesRead();
  }, [markMessagesRead, messages]);

  const handleSend = () => {
    if (!sendMessage(draft)) {
      toast('Write a message first 🥺');
      return;
    }
    toast(offline ? 'Message queued and will send when you reconnect' : 'Sending message…');
  };

  return (
    <div className="kk-chat-page" style={{ gap, padding: `4px ${pad}px 8px`, maxWidth: 760, width: '100%', margin: '0 auto', animation: 'kk-fade .22s ease' }}>
      <div className="kk-chat-scroll" style={{ gap }}>
      <div style={pcss("display:flex;align-items:center;justify-content:center;gap:7px;text-align:center;font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);letter-spacing:.1em;margin:4px 0 12px")}>
        <span>TODAY · {today}</span>
        {syncStatus !== 'local' && (
          <span
            aria-label={syncStatus === 'synced' ? 'Chat synced in real time' : syncStatus === 'loading' ? 'Syncing chat' : 'Chat sync needs attention'}
            title={syncStatus === 'synced' ? 'Realtime active' : syncStatus === 'loading' ? 'Syncing' : 'Sync needs attention'}
            style={{ width: 6, height: 6, borderRadius: '50%', background: syncStatus === 'synced' ? '#72B88A' : syncStatus === 'error' ? '#D45D70' : '#E0B557', animation: syncStatus === 'loading' ? 'kk-pulse 1s ease-in-out infinite' : undefined }}
          />
        )}
      </div>

      {syncStatus === 'error' && (
        <div role="alert" style={pcss("display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid rgba(190,73,94,.14);border-radius:16px;background:#FCEBED;color:#944659;font:700 10.5px/1.45 'Nunito',sans-serif") }>
          <span aria-hidden="true">📡</span>
          <span style={{ flex: 1, minWidth: 0 }}>Chat is not synced. {syncError}</span>
          <button type="button" onClick={() => void refreshSharedData().catch(() => undefined)} style={pcss("flex:none;min-height:34px;padding:0 11px;border:0;border-radius:10px;background:#fff;color:#944659;cursor:pointer;font:800 9.5px 'Nunito',sans-serif")}>Try again</button>
        </div>
      )}

      <div role="log" aria-live="polite" aria-relevant="additions" aria-label="Your conversation" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {syncStatus === 'loading' && messages.length === 0 && (
          <div aria-label="Loading messages" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {[62, 76, 54].map((width, index) => (
              <div key={width} className="kk-skeleton" style={{ alignSelf: index % 2 ? 'flex-end' : 'flex-start', width: `${width}%`, height: 48, borderRadius: 18 }} />
            ))}
          </div>
        )}

        {syncStatus !== 'loading' && messages.length === 0 && (
          <div style={pcss("display:grid;place-items:center;min-height:250px;padding:32px 20px;border:1px dashed var(--ln,rgba(74,74,74,.12));border-radius:24px;background:color-mix(in srgb,var(--sf,#fff) 72%,transparent);text-align:center") }>
            <div>
              <div style={{ fontSize: 35, animation: reduced ? undefined : 'kk-float 2.8s ease-in-out infinite' }}>💌</div>
              <strong style={pcss("display:block;margin-top:12px;color:var(--ink,#4A4A4A);font:800 15px 'Quicksand',sans-serif")}>Start your conversation</strong>
              <span style={pcss("display:block;max-width:32ch;margin:6px auto 0;color:var(--mut,#A99A9E);font:600 11px/1.55 'Nunito',sans-serif")}>Messages, pictures, and read receipts appear on both devices in real time.</span>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const me = message.from === 'me';
          const isPhoto = !!message.photoId;
          const photoIndex = isPhoto ? photos.findIndex((photo) => photo.id === message.photoId) : -1;
          const photoFrameStyle = pcss('display:block;background:#fff;padding:8px 8px 0;border-radius:4px;box-shadow:0 6px 16px rgba(120,90,100,.18);transform:rotate(-1.5deg);width:min(186px,65vw);cursor:pointer;text-decoration:none');
          const photoContents = message.photoDataUrl ? (
            <>
              <img src={message.photoDataUrl} alt={message.text || 'Picture from your partner'} style={{ display: 'block', width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
              <div style={pcss("padding:8px 3px 10px;text-align:center;font:600 15px 'Caveat',cursive;color:#4A4A4A")}>{message.text}</div>
            </>
          ) : (
            <>
              <div style={pcss("aspect-ratio:1;background:repeating-linear-gradient(135deg,#EFE6E2 0 8px,#F8F2EE 8px 16px);display:flex;align-items:center;justify-content:center;font:700 8.5px 'Nunito',sans-serif;color:rgba(74,74,74,.3)")}>NEW PICTURE</div>
              <div style={pcss("padding:8px 3px 10px;text-align:center;font:600 15px 'Caveat',cursive;color:#4A4A4A")}>{message.text}</div>
            </>
          );

          return (
            <div key={message.id} style={{ display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', animation: reduced ? undefined : 'kk-up .22s ease' }}>
              <div style={{ maxWidth: '82%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', position: 'relative' }}>
                {isPhoto && photoIndex >= 0 ? (
                  <PhotoOpenTarget index={photoIndex} style={photoFrameStyle}>{photoContents}</PhotoOpenTarget>
                ) : isPhoto && message.photoDataUrl ? (
                  <a href={message.photoDataUrl} target="_blank" rel="noreferrer" aria-label="Open picture full size" style={photoFrameStyle}>{photoContents}</a>
                ) : isPhoto ? (
                  <div style={photoFrameStyle}>{photoContents}</div>
                ) : (
                  <div style={pcss(`max-width:100%;padding:11px 15px;border-radius:${me ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};background:${me ? 'var(--pk,#FFB7B2)' : 'var(--sf,#fff)'};color:${me ? '#5C3A42' : 'var(--ink,#4A4A4A)'};font:600 13px/1.45 "Nunito",sans-serif;box-shadow:${me ? 'none' : 'var(--shadow,0 8px 24px rgba(0,0,0,.04))'};white-space:pre-wrap;overflow-wrap:anywhere`)}>
                    {message.text}
                  </div>
                )}
                <div style={pcss("display:flex;align-items:center;gap:5px;font:600 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px;padding:0 4px") }>
                  <span>{message.time}{me ? message.status === 'queued' ? ' · sending…' : message.status === 'failed' ? ' · failed' : message.read ? ' ✓✓' : ' ✓' : ''}</span>
                  {message.status === 'failed' && (
                    <button type="button" onClick={() => retryMessage(message.id)} style={pcss("border:0;padding:1px 4px;background:transparent;color:var(--pki,#E86F87);cursor:pointer;font:800 9.5px 'Nunito',sans-serif")}>Retry</button>
                  )}
                </div>
                {message.reaction && (
                  <div style={pcss(`position:absolute;bottom:16px;${me ? 'left:-10px' : 'right:-10px'};background:var(--sf,#fff);border-radius:100px;padding:2px 6px;font-size:11px;box-shadow:0 2px 8px rgba(120,90,100,.16)`) }>{message.reaction}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {typing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <div aria-label="Your partner is typing" style={pcss('padding:11px 15px;border-radius:20px 20px 20px 6px;background:var(--sf,#fff);box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));display:flex;gap:4px;align-items:center')}>
            {[0, 0.18, 0.36].map((delay) => <span key={delay} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--pk,#FFB7B2)', animation: `kk-pulse 1s ease-in-out infinite ${delay}s` }} />)}
          </div>
          <span style={pcss("font:500 16px 'Caveat',cursive;color:var(--mut,#A99A9E)")}>Your partner is typing… 💭</span>
        </div>
      )}

      <div ref={endMarkerRef} aria-hidden="true" style={{ height: 1, flex: 'none' }} />
      </div>

      <form onSubmit={(event) => { event.preventDefault(); handleSend(); }} style={{ position: 'relative', zIndex: 6, flex: 'none', padding: '8px 0 0', background: 'var(--bg,#FDFBF7)' }}>
        <div className="kk-chat-attachments" aria-label="Chat attachments">
          {attachItems.map((item) => (
            <button type="button" key={item.label} onClick={() => (item.sheet ? openSheet(item.sheet as 'pap') : item.route ? navigate(item.route) : undefined)} style={pcss("flex:none;min-height:34px;border:none;padding:7px 12px;border-radius:100px;background:var(--sf,#fff);box-shadow:0 2px 8px rgba(120,90,100,.08);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}>{item.label}</button>
          ))}
        </div>
        <div style={pcss('display:flex;align-items:center;gap:7px;min-height:52px;background:var(--sf,#fff);border:1px solid var(--ln,rgba(74,74,74,.07));border-radius:26px;padding:6px 7px 6px 12px;box-shadow:0 7px 24px rgba(120,90,100,.12)')}>
          <button type="button" style={{ fontSize: 17, cursor: 'pointer', border: 0, background: 'transparent', padding: 4 }} aria-label="Add a smile emoji" onClick={() => setDraft(`${draft}😊`)}>😊</button>
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" aria-label="Write a message" autoComplete="off" maxLength={2000} style={pcss("flex:1;min-width:0;border:none;outline:none;background:transparent;font:600 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")} />
          <button type="button" style={{ fontSize: 17, cursor: 'pointer', border: 0, background: 'transparent', padding: 4 }} aria-label="Send a picture" onClick={() => openSheet('pap')}>📷</button>
          <button type="submit" disabled={!draft.trim()} style={pcss('width:40px;height:40px;flex:none;border:0;border-radius:50%;background:linear-gradient(150deg,#FF8FA3,var(--pk,#FFB7B2));display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;box-shadow:0 4px 12px rgba(255,140,150,.35)')} aria-label="Send message">↑</button>
        </div>
      </form>
    </div>
  );
}
