import { useLocation, useNavigate } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { TABS } from '../../lib/nav';
import { useAppState } from '../../state/AppState';

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openSheet } = useAppState();

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, pointerEvents: 'none' }}>
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        <button
          type="button"
          aria-label="Kirim PAP"
          onClick={() => openSheet('pap')}
          style={pcss(
            'position:absolute;right:18px;top:-64px;width:58px;height:58px;border-radius:50%;background:linear-gradient(150deg,#FF8FA3,#FFB7B2);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(255,120,140,.5);color:#fff;border:none;cursor:pointer',
          )}
        >
          <span style={{ fontSize: 21, lineHeight: 1 }}>📸</span>
          <span style={pcss("font:800 7.5px 'Nunito',sans-serif;letter-spacing:.06em")}>PAP</span>
        </button>
        <nav
          aria-label="Navigasi utama"
          style={pcss(
            'background:var(--sf,#fff);border-top:1px solid var(--ln,rgba(74,74,74,.08));display:grid;grid-template-columns:repeat(5,1fr);padding:9px 4px 16px;text-align:center;box-shadow:0 -6px 20px rgba(120,90,100,.07)',
          )}
        >
          {TABS.map((t) => {
            const on = location.pathname === t.path;
            return (
              <div key={t.path} onClick={() => navigate(t.path)} style={{ cursor: 'pointer' }} role="button" aria-current={on ? 'page' : undefined}>
                <div
                  style={pcss(
                    `width:40px;height:30px;margin:0 auto;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;background:${on ? 'var(--pk,#FFB7B2)' : 'transparent'};opacity:${on ? '1' : '.5'}`,
                  )}
                >
                  {t.icon}
                </div>
                <div
                  style={pcss(
                    `font:${on ? '800' : '700'} 9.5px "Nunito",sans-serif;margin-top:3px;color:${on ? 'var(--pki,#E86F87)' : 'var(--mut,#A99A9E)'}`,
                  )}
                >
                  {t.label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
