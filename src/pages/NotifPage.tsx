import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { NOTIFICATIONS } from '../data/mockData';

export default function NotifPage() {
  const navigate = useNavigate();
  const { toast } = useAppState();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [allRead, setAllRead] = useState(false);

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Hari ini</span>
        <span
          style={pcss("font:700 11px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}
          onClick={() => {
            setAllRead(true);
            toast('Semua notifikasi dibaca ✓');
          }}
          role="button"
        >
          Tandai sudah dibaca
        </span>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        {NOTIFICATIONS.map((n) => {
          const unread = n.unread && !allRead && !readIds.has(n.id);
          return (
            <div
              key={n.id}
              style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 0', borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))', cursor: 'pointer' }}
              onClick={() => {
                setReadIds((prev) => new Set(prev).add(n.id));
                navigate(n.route);
              }}
              role="button"
            >
              <div
                style={pcss(
                  `width:36px;height:36px;border-radius:13px;flex:none;display:flex;align-items:center;justify-content:center;font-size:16px;background:${n.colorTag === 'pk' ? 'var(--sf2,#FFF4F1)' : n.colorTag === 'lav' ? '#EDE7FA' : '#E2F0CB'}`,
                )}
              >
                {n.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: `${unread ? '700' : '600'} 12px/1.45 "Nunito",sans-serif`, color: 'var(--ink,#4A4A4A)' }}>{n.text}</div>
                <div style={pcss("font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{n.time}</div>
              </div>
              {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pki,#E86F87)', flex: 'none', marginTop: 5 }} />}
            </div>
          );
        })}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px')}>
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Atur notifikasi</div>
        <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>
          Bisa pilih mana yang bunyi, mana yang diem — terutama pas jam kuliah atau tidur.
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => navigate('/settings')} role="button">
            Buka pengaturan
          </div>
          <div style={pcss("padding:8px 13px;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => toast('Jam tidur: 23:00–06:00')} role="button">
            🌙 Jam tidur: 23:00–06:00
          </div>
        </div>
      </div>
    </ScrollColumn>
  );
}
