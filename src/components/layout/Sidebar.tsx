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
  const { viewport, syncStatus } = useAppState();
  const { profile, partner, mode } = useAuthState();
  const isTablet = viewport === 'tablet';
  const open = !isTablet;
  const coupleNames = `${profile?.name || 'You'} & ${partner?.name || 'Partner'}`;
  const syncCopy = mode === 'supabase'
    ? syncStatus === 'loading'
      ? { icon: '↻', title: 'Syncing with Supabase…', detail: 'Updating your private shared space' }
      : syncStatus === 'error'
        ? { icon: '!', title: 'Sync needs attention', detail: 'Open Settings to retry the connection' }
        : { icon: '✓', title: 'Supabase synced', detail: 'Your shared changes are up to date' }
    : { icon: '◌', title: 'Preview on this device', detail: 'Connect Supabase for shared sync' };

  return (
    <aside
      style={pcss(
        `display:flex;flex-direction:column;padding:${isTablet ? '16px 12px' : '18px 14px'};border-right:1px solid var(--ln,rgba(74,74,74,.08));background:var(--sf,#fff);overflow-y:auto`,
      )}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 16px' }}>
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
      {NAV_MAIN.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      {open && <div style={pcss('font:700 9.5px "Nunito",sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:16px 10px 8px')}>✨ MORE</div>}
      {NAV_MORE.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      {open && <div style={pcss('font:700 9.5px "Nunito",sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:16px 10px 8px')}>⚙️ ACCOUNT</div>}
      {NAV_ACCOUNT.map((item) => (
        <NavRow key={item.path} item={item} open={open} />
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 14 }}>
        {open && (
          <NavLink to="/settings" style={pcss('display:block;border-radius:18px;background:var(--sf2,#FFF4F1);padding:13px 14px;text-decoration:none')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span aria-hidden="true" style={pcss(`width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:${syncStatus === 'error' ? '#FFE1E6' : '#DDF2E7'};color:${syncStatus === 'error' ? '#B84F67' : '#376858'};font:900 10px 'Nunito',sans-serif`)}>{syncCopy.icon}</span>
              <span style={pcss('font:700 11px "Nunito",sans-serif;color:var(--ink,#4A4A4A)')}>{syncCopy.title}</span>
            </div>
            <div style={pcss('font:600 10px/1.4 "Nunito",sans-serif;color:var(--mut,#A99A9E);margin-top:7px')}>{syncCopy.detail}</div>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
