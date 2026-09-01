import { useState, type FormEvent } from 'react';
import { pcss } from '../lib/pcss';
import { SheetHeading } from '../components/shared/BottomSheet';
import { useAppState } from '../state/AppState';
import { useAuthState } from '../state/AuthState';

const EVENT_TAGS = [
  { icon: '📞', label: 'Video Call' },
  { icon: '📚', label: 'Kelas' },
  { icon: '🏀', label: 'Olahraga' },
  { icon: '✈️', label: 'Penerbangan' },
  { icon: '🎂', label: 'Ulang tahun' },
  { icon: '🎉', label: 'Anniversary' },
];

function dateInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function eventDate(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatInZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

const fieldStyle = pcss('width:100%;box-sizing:border-box;padding:12px 14px;border-radius:14px;border:1px solid var(--ln,rgba(74,74,74,.14));background:var(--sf2,#FFF4F1);font:600 13px "Nunito",sans-serif;outline:none;color:var(--ink,#4A4A4A)');
const labelStyle = pcss("display:flex;flex-direction:column;gap:6px;font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60)");

export function EventSheetContent() {
  const { addEvent, closeSheet, toast, setAgendaView } = useAppState();
  const { partner } = useAuthState();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => dateInputValue(new Date()));
  const [time, setTime] = useState('21:00');
  const [tag, setTag] = useState(EVENT_TAGS[0].label);
  const [scope, setScope] = useState<'Berdua' | 'Pribadi'>('Berdua');
  const [error, setError] = useState('');
  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const preview = (() => {
    if (!date || !time) return null;
    const value = eventDate(date, time);
    if (Number.isNaN(value.getTime())) return null;
    return {
      partner: partner?.timezone ? formatInZone(value, partner.timezone) : '',
    };
  })();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Event title is required.');
      return;
    }
    if (!date || !time) {
      setError('Choose an event date and time.');
      return;
    }

    const startsAt = eventDate(date, time);
    if (Number.isNaN(startsAt.getTime())) {
      setError('The event date or time is invalid.');
      return;
    }

    const selectedTag = EVENT_TAGS.find((item) => item.label === tag) ?? EVENT_TAGS[0];
    addEvent({
      icon: selectedTag.icon,
      title: cleanTitle,
      when: formatInZone(startsAt, deviceZone),
      startsAt: startsAt.toISOString(),
      tzNote: partner?.timezone
        ? `${partner.nickname || partner.name}: ${formatInZone(startsAt, partner.timezone)} · ${partner.timezone}`
        : `Zona perangkat: ${deviceZone}`,
      scope,
      colorTag: scope === 'Berdua' ? 'pk' : 'mint',
      dayOfMonth: Number(date.slice(8, 10)),
    });
    setAgendaView('Agenda');
    closeSheet();
    toast(`Event “${cleanTitle}” saved ✓`);
  };

  return (
    <form onSubmit={submit} noValidate>
      <SheetHeading title="New event 🗓️" sub="Shared or personal" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={labelStyle}>
          Event title
          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError('');
            }}
            placeholder="e.g. Evening video call"
            aria-label="Event title"
            autoFocus
            maxLength={80}
            required
            style={fieldStyle}
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={labelStyle}>
            Date
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Event date" required style={fieldStyle} />
          </label>
          <label style={labelStyle}>
            Time
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Event time" required style={fieldStyle} />
          </label>
        </div>
        <div style={pcss("padding:12px 14px;border-radius:16px;background:var(--sf2,#FFF4F1);font:600 11px/1.55 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>
          <div>Device time zone: {deviceZone}</div>
          {preview && partner?.timezone && (
            <div style={{ color: 'var(--pki,#E86F87)', marginTop: 2 }}>
              In {partner.nickname || partner.name}'s zone: {preview.partner} ({partner.timezone})
            </div>
          )}
        </div>
        <label style={labelStyle}>
          Label
          <select value={tag} onChange={(event) => setTag(event.target.value)} style={fieldStyle}>
            {EVENT_TAGS.map((item) => (
              <option key={item.label} value={item.label}>{item.icon} {item.label}</option>
            ))}
          </select>
        </label>
        <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
          <legend style={pcss("font:700 10.5px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);margin-bottom:6px")}>Who can see this?</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            {(['Pribadi', 'Berdua'] as const).map((value) => (
              <label
                key={value}
                style={pcss(
                  `display:flex;align-items:center;justify-content:center;gap:7px;padding:12px 14px;border-radius:100px;background:${scope === value ? 'var(--pk,#FFB7B2)' : 'var(--sf2,#FFF4F1)'};font:700 12px "Nunito",sans-serif;color:${scope === value ? '#5C3A42' : 'var(--ink2,#6B5B60)'};cursor:pointer`,
                )}
              >
                <input type="radio" name="event-scope" value={value} checked={scope === value} onChange={() => setScope(value)} />
                {value === 'Pribadi' ? 'Personal' : 'Shared'}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <div role="alert" style={pcss("font:700 11px 'Nunito',sans-serif;color:#C94F68;text-align:center")}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 4 }}>
          <button type="button" onClick={closeSheet} style={pcss("padding:13px 18px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);font:700 13px 'Nunito',sans-serif;color:var(--ink2,#6B5B60);cursor:pointer")}>Cancel</button>
          <button type="submit" style={pcss("padding:13px 18px;border:0;border-radius:100px;background:var(--pk,#FFB7B2);font:700 13px 'Nunito',sans-serif;color:#5C3A42;cursor:pointer")}>Save event</button>
        </div>
      </div>
    </form>
  );
}
