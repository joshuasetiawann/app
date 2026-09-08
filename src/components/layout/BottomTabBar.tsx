import { useLocation, useNavigate } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { TABS } from '../../lib/nav';

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, pointerEvents: 'none' }}>
      <div style={{ position: 'relative', pointerEvents: 'auto' }}>
        <nav
          aria-label="Main navigation"
          style={pcss(
            'background:var(--sf,#fff);border-top:1px solid var(--ln,rgba(74,74,74,.08));display:grid;grid-template-columns:repeat(5,1fr);padding:9px 4px max(16px,env(safe-area-inset-bottom));text-align:center;box-shadow:0 -6px 20px rgba(120,90,100,.07)',
          )}
        >
          {TABS.map((t) => {
            const on = location.pathname === t.path;
            return (
              <button
                className="kk-tab"
                key={t.path}
                type="button"
                onClick={() => navigate(t.path)}
                aria-current={on ? 'page' : undefined}
                style={{ width: '100%', padding: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit', cursor: 'pointer' }}
              >
                <div
                  className="kk-tab-icon"
                  style={pcss(
                    `width:40px;height:30px;margin:0 auto;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;background:${on ? 'var(--pk,#FFB7B2)' : 'transparent'};opacity:${on ? '1' : '.5'}`,
                  )}
                >
                  <span>{t.icon}</span>
                </div>
                <div
                  style={pcss(
                    `font:${on ? '800' : '700'} 9.5px "Nunito",sans-serif;margin-top:3px;color:${on ? 'var(--pki,#E86F87)' : 'var(--mut,#A99A9E)'}`,
                  )}
                >
                  {t.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
