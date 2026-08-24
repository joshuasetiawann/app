import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn } from '../components/shared/ScrollColumn';
import { BigButton, Card } from '../components/shared/Atoms';

const AGENDA_TABS = ['Hari', 'Minggu', 'Bulan', 'Agenda'] as const;
const WEEKDAY_LETTERS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
const DAY_FORMATTER = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function agBtnStyle(active: boolean) {
  return pcss(
    `flex:1;text-align:center;padding:9px 0;border:0;border-radius:14px;cursor:pointer;font:700 11.5px "Nunito",sans-serif;background:${active ? 'var(--pk,#FFB7B2)' : 'var(--sf,#fff)'};color:${active ? '#5C3A42' : 'var(--ink2,#6B5B60)'};box-shadow:0 2px 8px rgba(120,90,100,.07)`,
  );
}

function sameMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

export default function SchedulePage() {
  const { agendaView, setAgendaView, openSheet, toast, events } = useAppState();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const now = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = sameMonth(now, year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const calendarDots = events.reduce<Record<number, string>>((dots, event) => {
    const parsed = event.startsAt ? new Date(event.startsAt) : null;
    const belongsHere = parsed && !Number.isNaN(parsed.getTime()) && sameMonth(parsed, year, month);
    const day = belongsHere ? parsed.getDate() : !event.startsAt && isCurrentMonth ? event.dayOfMonth : undefined;
    if (day) dots[day] = event.colorTag === 'pk' ? 'var(--pk,#FFB7B2)' : '#B5EAD7';
    return dots;
  }, {});

  const visibleEvents = (() => {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dayEnd = dayStart + 86_400_000;
    const weekEnd = dayStart + 7 * 86_400_000;

    return events
      .filter((event) => {
        if (agendaView === 'Agenda') return true;
        if (!event.startsAt) return agendaView === 'Hari' ? event.when.toLocaleLowerCase().startsWith('hari ini') : true;
        const startsAt = new Date(event.startsAt);
        if (Number.isNaN(startsAt.getTime())) return false;
        if (agendaView === 'Hari') return startsAt.getTime() >= dayStart && startsAt.getTime() < dayEnd;
        if (agendaView === 'Minggu') return startsAt.getTime() >= dayStart && startsAt.getTime() < weekEnd;
        return sameMonth(startsAt, year, month);
      })
      .slice()
      .sort((a, b) => {
        const aTime = a.startsAt ? new Date(a.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.startsAt ? new Date(b.startsAt).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  })();

  const moveMonth = (amount: number) => {
    setViewDate(new Date(year, month + amount, 1));
    setSelectedDay(null);
  };
  const previousMonth = MONTH_FORMATTER.format(new Date(year, month - 1, 1));
  const nextMonth = MONTH_FORMATTER.format(new Date(year, month + 1, 1));

  return (
    <ScrollColumn>
      <Card style={{ padding: 17 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={pcss("font:700 17px 'Quicksand',sans-serif;color:var(--ink,#4A4A4A);text-transform:capitalize")}>{MONTH_FORMATTER.format(viewDate)}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button type="button" style={pcss('width:28px;height:28px;padding:0;border:0;border-radius:50%;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;color:var(--ink2,#6B5B60)')} aria-label={`Lihat ${previousMonth}`} onClick={() => moveMonth(-1)}>
              ‹
            </button>
            <button type="button" style={pcss('width:28px;height:28px;padding:0;border:0;border-radius:50%;background:var(--sf2,#FFF4F1);display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;color:var(--ink2,#6B5B60)')} aria-label={`Lihat ${nextMonth}`} onClick={() => moveMonth(1)}>
              ›
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginTop: 14, textAlign: 'center' }}>
          {WEEKDAY_LETTERS.map((letter, index) => (
            <div key={`${letter}-${index}`} style={pcss("font:700 9.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);padding-bottom:6px")}>
              {letter}
            </div>
          ))}
          {days.map((day, index) => {
            const today = Boolean(day && isCurrentMonth && day === now.getDate());
            const selected = Boolean(day && day === selectedDay);
            const dot = day ? calendarDots[day] : '';
            const fullDate = day ? new Date(year, month, day) : null;
            const label = fullDate ? DAY_FORMATTER.format(fullDate) : '';
            return (
              <button
                type="button"
                key={`${day ?? 'blank'}-${index}`}
                onClick={() => {
                  if (!day || !fullDate) return;
                  setSelectedDay(day);
                  toast(label);
                }}
                disabled={!day}
                aria-label={day ? `${label}${dot ? ', ada acara' : ''}` : undefined}
                aria-pressed={day ? selected : undefined}
                style={pcss(
                  `height:clamp(38px,6vw,58px);padding:0;border:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:12px;cursor:${day ? 'pointer' : 'default'};font:${today ? '800' : '600'} 11.5px "Nunito",sans-serif;color:${today ? '#5C3A42' : day ? 'var(--ink2,#6B5B60)' : 'transparent'};background:${today ? 'var(--pk,#FFB7B2)' : selected ? 'var(--sf2,#FFF4F1)' : 'transparent'}`,
                )}
              >
                <span>{day ?? ''}</span>
                <span style={dot ? { width: 5, height: 5, borderRadius: '50%', background: dot } : { display: 'none' }} />
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pk,#FFB7B2)' }} />Berdua
          </span>
          <span style={pcss("display:flex;align-items:center;gap:6px;font:600 10px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B5EAD7' }} />Pribadi kamu
          </span>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 7 }}>
        {AGENDA_TABS.map((tab) => (
          <button type="button" key={tab} style={agBtnStyle(agendaView === tab)} onClick={() => setAgendaView(tab)} aria-pressed={agendaView === tab}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {visibleEvents.map((event) => (
          <div key={event.id} style={pcss('display:flex;gap:12px;border-radius:20px;background:var(--sf,#fff);padding:14px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04))')}>
            <div
              style={pcss(
                `width:40px;height:40px;border-radius:14px;flex:none;display:flex;align-items:center;justify-content:center;font-size:17px;background:${event.colorTag === 'pk' ? 'var(--sf2,#FFF4F1)' : '#E2F0CB'}`,
              )}
            >
              {event.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{event.title}</span>
                <span
                  style={pcss(
                    `flex:none;font:800 9px "Nunito",sans-serif;padding:3px 8px;border-radius:100px;background:${event.colorTag === 'pk' ? 'var(--pk,#FFB7B2)' : '#D7EFE2'};color:#5C3A42`,
                  )}
                >
                  {event.scope}
                </span>
              </div>
              <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:4px")}>{event.when}</div>
              {event.tzNote && <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--pki,#E86F87);margin-top:3px")}>{event.tzNote}</div>}
            </div>
          </div>
        ))}
        {visibleEvents.length === 0 && (
          <div style={pcss("padding:24px;border-radius:20px;background:var(--sf,#fff);text-align:center;font:600 12px/1.5 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
            Tidak ada acara untuk tampilan {agendaView.toLocaleLowerCase('id-ID')} ini.
          </div>
        )}
      </div>

      <BigButton label="+ Bikin acara baru" onClick={() => openSheet('event')} />
    </ScrollColumn>
  );
}
