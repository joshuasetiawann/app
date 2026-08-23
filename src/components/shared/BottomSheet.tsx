import type { ReactNode } from 'react';
import { pcss } from '../../lib/pcss';
import { useAppState } from '../../state/AppState';
import { MoreSheetContent } from '../../sheets/MoreSheet';
import { PapSheetContent } from '../../sheets/PapSheet';
import { MoodSheetContent } from '../../sheets/MoodSheet';
import { EventSheetContent } from '../../sheets/EventSheet';
import { DeleteSheetContent } from '../../sheets/DeleteSheet';
import { CapsuleSheetContent } from '../../sheets/CapsuleSheet';
import { FoodSheetContent } from '../../sheets/FoodSheet';

export function SheetHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={pcss("font:700 18px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A)")}>{title}</div>
      {sub && <div style={pcss("font:600 11.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:3px")}>{sub}</div>}
    </div>
  );
}

export function SheetPill({ label, onClick, primary }: { label: ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <div
      onClick={onClick}
      role="button"
      style={pcss(
        `padding:13px 18px;border-radius:100px;text-align:center;cursor:pointer;font:700 13px "Nunito",sans-serif;background:${primary ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};color:${primary ? '#5C3A42' : 'var(--ink2,#6B5B60)'}`,
      )}
    >
      {label}
    </div>
  );
}

function SheetBody() {
  const { sheet } = useAppState();
  switch (sheet) {
    case 'more':
      return <MoreSheetContent />;
    case 'pap':
      return <PapSheetContent />;
    case 'mood':
      return <MoodSheetContent />;
    case 'event':
      return <EventSheetContent />;
    case 'delete':
      return <DeleteSheetContent />;
    case 'capsule':
      return <CapsuleSheetContent />;
    case 'food':
      return <FoodSheetContent />;
    default:
      return null;
  }
}

export function BottomSheet() {
  const { sheet, closeSheet } = useAppState();
  if (!sheet) return null;

  return (
    <div
      style={pcss('position:absolute;inset:0;z-index:75;background:rgba(40,28,33,.42);display:flex;align-items:flex-end;justify-content:center;animation:kk-fade .18s ease')}
      onClick={closeSheet}
      role="presentation"
    >
      <div
        style={pcss(
          "width:100%;max-width:520px;background:var(--sf,#fff);border-radius:26px 26px 0 0;padding:12px 20px 26px;box-shadow:0 -14px 40px rgba(60,40,50,.24);animation:kk-up .26s cubic-bezier(.2,.9,.25,1);max-height:86%;overflow-y:auto",
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div style={pcss('width:44px;height:5px;border-radius:5px;background:var(--ln,rgba(74,74,74,.16));margin:0 auto 14px')} />
        <SheetBody />
      </div>
    </div>
  );
}
