import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { SETTINGS_GROUPS } from '../data/mockData';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useAppState();

  return (
    <ScrollColumn>
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title}>
          <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:var(--mut,#A99A9E);padding:2px 4px 9px")}>{group.title}</div>
          <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            {group.rows.map((row) => (
              <div
                key={row.label}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))', cursor: 'pointer' }}
                onClick={() => {
                  if (row.label === 'Tema') navigate('/theme');
                  else if (row.label === 'Penyimpanan') navigate('/files');
                  else toast(`${row.label}: ${row.value}`);
                }}
                role="button"
              >
                <span style={{ fontSize: 15, width: 22, textAlign: 'center', flex: 'none' }}>{row.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={pcss("font:700 12.5px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{row.label}</div>
                </div>
                <span style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E);flex:none;max-width:44%;text-align:right")}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', padding: '6px 0 14px' }}>
        <div style={pcss("font:600 11px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>KisahKita v1.0 · dibuat buat dua orang aja 💗</div>
        <div style={pcss("font:700 11.5px 'Nunito',sans-serif;color:#C2506B;margin-top:10px;cursor:pointer")} onClick={() => toast('Sampai jumpa lagi 💗')} role="button">
          Keluar dari akun
        </div>
      </div>
    </ScrollColumn>
  );
}
