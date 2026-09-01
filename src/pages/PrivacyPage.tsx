import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { HeroSurface } from '../components/shared/Atoms';
import { THEMES } from '../lib/theme';

const UPCOMING_PRIVACY = [
  { icon: '🟢', label: 'Online status', sub: 'Realtime presence is not active yet; connected only means both accounts are paired.' },
  { icon: '🕒', label: 'Last seen', sub: 'Active time is not tracked or shared with your partner yet.' },
  { icon: '🌤️', label: 'Activity & mood', sub: 'This preference currently stays local and is not sent to your partner.' },
  { icon: '🖼️', label: 'Partner gallery permission', sub: 'Per-account picture permissions are not available yet.' },
  { icon: '🌙', label: 'Me-time mode', sub: 'Push notifications and presence are not connected yet.' },
];

export default function PrivacyPage() {
  const navigate = useNavigate();
  const auth = useAuthState();
  const { theme, locationOn } = useAppState();
  const heroBg = THEMES[theme].hero;

  return (
    <ScrollColumn>
      <HeroSurface background={heroBg} style={pcss('border-radius:24px;padding:18px')}>
        <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Your private space 🔒</div>
        <div style={pcss("font:500 18px 'Caveat',cursive;color:var(--ink2,#6B5B60);margin-top:3px")}>
          {auth.mode === 'supabase' ? 'Cloud access uses your connected account.' : 'Data stays in this device browser.'}
        </div>
      </HeroSurface>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
          <span style={pcss('width:36px;height:36px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--sf2,#FFF4F1);font-size:16px;flex:none')}>📍</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={pcss("display:flex;align-items:center;gap:7px;font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>
              Location sharing
              <span style={pcss(`padding:3px 7px;border-radius:100px;background:${locationOn ? '#D7EFE2' : 'var(--sf2,#FFF4F1)'};font:800 8.5px 'Nunito',sans-serif;color:${locationOn ? '#376858' : 'var(--mut,#A99A9E)'}`)}>
                {locationOn ? 'ACTIVE' : 'OFF'}
              </span>
            </div>
            <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>
              Manage device permission and actual sharing status from Distance Between Us.
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/location')}
            style={pcss("padding:8px 11px;border:0;border-radius:100px;background:var(--pk,#FFB7B2);font:800 10px 'Nunito',sans-serif;color:#5C3A42;cursor:pointer;flex:none")}
          >
            Manage
          </button>
        </div>

        {UPCOMING_PRIVACY.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))' }}>
            <span style={pcss('width:36px;height:36px;border-radius:13px;display:flex;align-items:center;justify-content:center;background:var(--sf2,#FFF4F1);font-size:15px;flex:none')}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{item.label}</div>
              <div style={pcss("font:600 10px/1.45 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{item.sub}</div>
            </div>
            <button
              type="button"
              disabled
              aria-label={`${item.label}, not available yet`}
              style={pcss("padding:6px 9px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);font:800 8.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none;opacity:1")}
            >
              SOON
            </button>
          </div>
        ))}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px;border:1px dashed rgba(232,111,135,.35)')}>
        <div style={pcss("font:700 12.5px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Space protection 🔐</div>
        <div style={pcss("font:600 10.5px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:5px")}>
          {auth.mode === 'supabase'
            ? 'Account sessions, profiles, couple space, and live location use Supabase with per-space access rules. Shared content is synced through the same private space.'
            : 'Local mode stores accounts, couple space, location, and content in this browser. Data is not sent to KisahKita servers.'}
          {' '}End-to-end encryption is not enabled.
        </div>
      </div>
    </ScrollColumn>
  );
}
