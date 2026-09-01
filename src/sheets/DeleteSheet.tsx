import { useAppState } from '../state/AppState';
import { SheetHeading, SheetPill } from '../components/shared/BottomSheet';

export function DeleteSheetContent() {
  const { closeSheet } = useAppState();
  return (
    <>
      <SheetHeading title="Delete 3 pictures?" sub="Pictures move to Trash for 30 days" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        <SheetPill label="Cancel" onClick={closeSheet} />
        <SheetPill label="Delete · not available yet" disabled />
      </div>
    </>
  );
}
