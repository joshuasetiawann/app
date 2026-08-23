import { useNavigate } from 'react-router-dom';
import { pcss } from '../lib/pcss';
import { MORE_SHEET_ITEMS } from '../lib/nav';
import { useAppState } from '../state/AppState';
import { SheetHeading } from '../components/shared/BottomSheet';

export function MoreSheetContent() {
  const navigate = useNavigate();
  const { closeSheet } = useAppState();

  return (
    <>
      <SheetHeading title="Semua fitur" sub="Ruang kita, lengkap 🌸" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {MORE_SHEET_ITEMS.map((item) => (
          <div
            key={item.path}
            onClick={() => {
              closeSheet();
              navigate(item.path);
            }}
            style={pcss('background:var(--sf2,#FFF4F1);border-radius:18px;padding:13px 6px;text-align:center;cursor:pointer')}
            role="button"
          >
            <div style={{ fontSize: 19 }}>{item.icon}</div>
            <div style={pcss("font:700 10px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-top:5px")}>{item.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
