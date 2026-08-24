import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';

export function Toast() {
  const { toastMsg } = useAppState();
  if (!toastMsg) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 96, display: 'flex', justifyContent: 'center', zIndex: 70, pointerEvents: 'none' }}>
      <div role="status" aria-live="polite" aria-atomic="true" style={pcss("background:#4A3B45;color:#FFF6F3;padding:11px 18px;border-radius:100px;font:700 12px 'Nunito',sans-serif;box-shadow:0 10px 26px rgba(60,45,52,.3);animation:kk-up .28s ease")}>
        {toastMsg}
      </div>
    </div>
  );
}
