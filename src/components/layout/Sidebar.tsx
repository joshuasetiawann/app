import { NavLink, useLocation } from 'react-router-dom';
import { pcss } from '../../lib/pcss';
import { NAV_ACCOUNT, NAV_MAIN, NAV_MORE, type NavItem } from '../../lib/nav';
import { useAppState } from '../../state/AppState';
import { useAuthState } from '../../state/AuthState';

function NavRow({ item, open }: { item: NavItem; open: boolean }) {
  const location = useLocation();
  const on = location.pathname === item.path;
  return (
    <NavLink
      to={item.path}
      title={item.label}
      aria-current={on ? 'page' : undefined}
      style={pcss(
        `display:flex;align-items:center;gap:11px;padding:${open ? '10px 12px' : '11px 0'};margin-bottom:2px;border-radius:14px;cursor:pointer;justify-content:${open ? 'flex-start' : 'center'};background:${on ? 'var(--pk,#FFB7B2)' : 'transparent'};color:${on ? '#5C3A42' : 'var(--ink2,#6B5B60)'};font:${on ? '700' : '600'} 12.5px "Nunito",sans-serif;transition:background .15s;text-decoration:none`,
      )}
    >
      <span style={{ fontSize: 15, width: 20, textAlign: 'center', flex: 'none' }}>{item.icon}</span>
      {open && (
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
      )}
      {open && item.badge && (
        <span
          style={pcss(
            `font:800 9px "Nunito",sans-serif;background:${on ? 'rgba(255,255,255,.7)' : 'var(--pk,#FFB7B2)'};color:#5C3A42;padding:2px 7px;border-radius:100px`,
          )}
        >
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { viewport } = useAppState();
  const { profile, partner, couple } = useAuthState();
  const isTablet = viewport === 'tablet';
  const open = !isTablet;
  const coupleNames = `${profile?.name || 'Kamu'} & ${partner?.name || 'Pasangan'}`;

  return (
    <aside
      style={pcss(
        `display:flex;flex-direction:column;padding:${isTablet ? '16px 12px' : '18px 14px'};border-right:1px solid var(--ln,rgba(74,74,74,.08));background:var(--sf,#fff);overflow-y:auto`,
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 18px' }}>
        <div
          style={pcss(
            'width:38px;height:38px;border-radius:13px;background:linear-gradient(140deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7));display:flex;align-items:center;justify-content:center;font-size:17px;flex:none',
          )}
        >
          💗
        </div>
        {open && (
          <div style={{ minWidth: 0 }}>
            <div style={pcss('font:700 15px/1.15 "Quicksand",sans-serif;color:var(--ink,#4A4A4A)')}>KisahKita</div>
            <div style={pcss('font:600 10.5px "Nunito",sans-serif;color:var(--pki,#E86F87);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{coupleNames}</div>
          </div>
        )}
      </div>

      {open && <div style={pcss('font:700 9.5px "Nunito",sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:4px 10px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>❤️ {couple?.spaceName || 'RUANG KITA'}</div>}
      {NAV_MAIN.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      {open && <div style={pcss('font:700 9.5px "Nunito",sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:16px 10px 8px')}>✨ LAINNYA</div>}
      {NAV_MORE.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      {open && <div style={pcss('font:700 9.5px "Nunito",sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:16px 10px 8px')}>⚙️ AKUN</div>}
      {NAV_ACCOUNT.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        {open && (
          <div style={pcss('border-radius:18px;background:var(--sf2,#FFF4F1);padding:13px 14px')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>☁️</span>
              <span style={pcss('font:700 11px "Nunito",sans-serif;color:var(--ink,#4A4A4A)')}>42,3 / 100 GB</span>
            </div>
            <div style={pcss('height:6px;border-radius:6px;background:var(--ln,rgba(74,74,74,.1));margin-top:9px')}>
              <div style={pcss('width:42%;height:6px;border-radius:6px;background:linear-gradient(90deg,var(--pk,#FFB7B2),var(--lav,#E3D7F7))')} />
            </div>
            <div style={pcss('font:600 10px "Nunito",sans-serif;color:var(--mut,#A99A9E);margin-top:7px')}>Semua memori aman ✨</div>
          </div>
        )}
      </div>
    </aside>
  );
}
