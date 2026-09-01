import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';

export default function NotifPage() {
  const navigate = useNavigate();
  const { toast, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAppState();

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={pcss("font:700 15px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Today</span>
        <button
          type="button"
          style={pcss("padding:7px 10px;border:0;border-radius:100px;background:transparent;font:700 11px 'Nunito',sans-serif;color:var(--pki,#E86F87);cursor:pointer")}
          disabled={unreadCount === 0}
          onClick={() => {
            markAllNotificationsRead();
            toast('All notifications marked as read ✓');
          }}
        >
          {unreadCount > 0 ? `Mark all read (${unreadCount})` : 'All read'}
        </button>
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf,#fff);padding:4px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
        {notifications.map((n) => {
          const unread = n.unread;
          return (
            <button
              type="button"
              key={n.id}
              style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 0', border: 0, borderBottom: '1px solid var(--ln,rgba(74,74,74,.06))', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                markNotificationRead(n.id);
                navigate(n.route);
              }}
              aria-label={`${unread ? 'Unread. ' : ''}${n.text}`}
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
            </button>
          );
        })}
        {notifications.length === 0 && (
          <div style={pcss("padding:28px 8px;text-align:center;font:600 11.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            No new notifications.
          </div>
        )}
      </div>

      <div style={pcss('border-radius:22px;background:var(--sf2,#FFF4F1);padding:16px 17px')}>
        <div style={pcss("font:700 13px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>Notification preferences</div>
        <div style={pcss("font:600 10.5px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>
          Choose which updates make a sound, especially during class, work, or sleep.
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" style={pcss("padding:8px 13px;border:0;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => navigate('/settings')}>
            Open settings
          </button>
          <button type="button" style={pcss("padding:8px 13px;border:0;border-radius:100px;background:var(--sf,#fff);font:700 11px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")} onClick={() => navigate('/settings')}>
            🌙 Set quiet hours
          </button>
        </div>
      </div>
    </ScrollColumn>
  );
}
