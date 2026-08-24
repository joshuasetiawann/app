import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';

export function DeleteSheetContent() {
  const { closeSheet } = useAppState();
  return (
    <>
      <SheetHeading title="Hapus 3 foto?" sub="Foto pindah ke Trash 30 hari" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <SheetPill label="Batal" onClick={closeSheet} />
        <SheetPill label="Hapus · belum tersedia" disabled />
      </div>
    </>
  );
}
