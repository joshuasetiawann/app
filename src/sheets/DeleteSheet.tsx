import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';

export function DeleteSheetContent() {
  const { closeSheet, toast } = useAppState();
  return (
    <>
      <SheetHeading title="Hapus 3 foto?" sub="Foto pindah ke Trash 30 hari" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <SheetPill label="Batal" onClick={closeSheet} />
        <div
          onClick={() => {
            closeSheet();
            toast('3 foto dipindah ke Trash');
          }}
          role="button"
          style={pcss("padding:13px 18px;border-radius:100px;text-align:center;cursor:pointer;font:700 13px 'Nunito',sans-serif;background:#FFE1E1;color:#C2506B")}
        >
          Hapus
        </div>
      </div>
    </>
  );
}
