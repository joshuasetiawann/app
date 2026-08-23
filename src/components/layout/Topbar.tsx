import { useLocation, useNavigate } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { SCREEN_TITLES } from '../../lib/nav';
import { useAppState } from '../../state/AppState';
import type { Viewport } from '../../lib/theme';

const iconBtn = pcss(
  'position:relative;width:34px;height:34px;border-radius:50%;background:var(--sf,#fff);box-shadow:0 2px 8px rgba(120,90,100,.1);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;flex:none',
);

function vpBtnStyle(active: boolean) {
  return pcss(
    `width:26px;height:24px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;background:${active ? 'var(--sf,#fff)' : 'transparent'};box-shadow:${active ? '0 2px 6px rgba(120,90,100,.16)' : 'none'}`,
  );
}

const VP_OPTIONS: { key: Viewport; icon: string; label: string }[] = [
  { key: 'mobile', icon: '📱', label: 'Mobile' },
  { key: 'tablet', icon: '📗', label: 'Tablet' },
  { key: 'laptop', icon: '💻', label: 'Laptop' },
  { key: 'desktop', icon: '🖥️', label: 'Desktop' },
];

export function ViewportSwitcher({ floating = false }: { floating?: boolean }) {
  const { viewport, setVpForce } = useAppState();
  return (
    <div
      style={pcss(
        floating
          ? 'display:flex;gap:3px;padding:4px;border-radius:12px;background:rgba(255,255,255,.9);box-shadow:0 4px 14px rgba(90,60,70,.18);position:absolute;top:6px;right:18px;z-index:90'
          : 'display:flex;gap:3px;padding:3px;border-radius:11px;background:var(--sf2,#FFF4F1);flex:none',
      )}
    >
      {VP_OPTIONS.map((opt) => (
        <span
          key={opt.key}
          role="button"
          aria-label={opt.label}
          title={opt.label}
          style={vpBtnStyle(viewport === opt.key)}
          onClick={() => setVpForce(opt.key === 'desktop' ? '' : opt.key)}
        >
          {opt.icon}
        </span>
      ))}
    </div>
  );
}

export function Topbar() {
  const { viewport, dark, toggleDark, openSheet } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = viewport === 'mobile';
  const [title, sub] = SCREEN_TITLES[location.pathname] ?? SCREEN_TITLES['/'];

  return (
    <header
      style={pcss(
        `display:flex;align-items:center;justify-content:space-between;gap:12px;padding:${isMobile ? '14px 16px 10px' : '18px 22px 12px'};flex:none`,
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        {isMobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, cursor: 'pointer' }} onClick={() => openSheet('more')}>
            <div
              style={pcss(
                'width:34px;height:34px;border-radius:12px;background:linear-gradient(140deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7));display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 4px 12px rgba(255,140,150,.28);flex:none',
              )}
            >
              💗
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={pcss("font:700 15px/1.1 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{title}</div>
              <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{sub}</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={pcss("font:700 20px/1.15 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{title}</div>
            <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{sub}</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
        {!isMobile && <ViewportSwitcher />}
        <div style={iconBtn} onClick={toggleDark} title="Light / dark" role="button" aria-label="Toggle tema gelap">
          {dark ? '🌙' : '☀️'}
        </div>
        <div style={iconBtn} onClick={() => navigate('/notif')} title="Notifikasi" role="button" aria-label="Notifikasi">
          🔔
          <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: 'var(--pki,#E86F87)' }} />
        </div>
        <div
          style={pcss(
            'width:34px;height:34px;border-radius:50%;background:linear-gradient(140deg,#FFD9DC,#E3D7F7);display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;flex:none',
          )}
          onClick={() => navigate('/profile')}
          role="button"
          aria-label="Profil"
        >
          🧑🏻
        </div>
      </div>
    </header>
  );
}
