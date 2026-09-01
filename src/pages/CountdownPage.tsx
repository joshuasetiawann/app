import { useState } from 'react';
import { pcss } from '../lib/pcss';
import { useAppState } from '../state/AppState';
import { ScrollColumn, useTwoColTemplate } from '../components/shared/ScrollColumn';
import { EmptyState } from '../components/shared/Atoms';
import { QuickCreatePanel } from '../components/shared/QuickCreatePanel';
import { countdownParts, daysUntil, pad2, useAppNow } from '../lib/appClock';

export default function CountdownPage() {
  const { countdowns, addCountdown, toast } = useAppState();
  const [creating, setCreating] = useState(false);
  const [defaultTarget] = useState(() => new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 16));
  const now = useAppNow(1000);
  const twoCol = useTwoColTemplate();
  const featuredTarget = [...countdowns]
    .filter((countdown) => new Date(countdown.targetDate).getTime() > now.getTime())
    .sort((a, b) => a.targetDate.localeCompare(b.targetDate))[0] ?? countdowns.at(-1);
  const featured = featuredTarget ? countdownParts(featuredTarget.targetDate, now) : null;
  const flipDigits = featured ? [
    { value: pad2(featured.days), label: 'DAYS' },
    { value: pad2(featured.hours), label: 'HOURS' },
    { value: pad2(featured.minutes), label: 'MINUTES' },
    { value: pad2(featured.seconds), label: 'SECONDS' },
  ] : [];

  return (
    <ScrollColumn>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => setCreating((value) => !value)} aria-expanded={creating} style={pcss("padding:9px 14px;border:0;border-radius:100px;background:var(--sf2,#FFF4F1);color:var(--pki,#E86F87);cursor:pointer;font:800 10.5px 'Nunito',sans-serif")}>+ Countdown</button>
      </div>

      {creating && (
        <QuickCreatePanel
          title="What are you looking forward to?"
          description="The countdown follows device time and updates for your partner in real time."
          submitLabel="Start countdown ⏳"
          fields={[
            { name: 'title', label: 'Moment name', placeholder: 'See each other again', required: true },
            { name: 'icon', label: 'Emoji', defaultValue: '✈️' },
            { name: 'targetAt', label: 'Date & time', type: 'datetime-local', defaultValue: defaultTarget, required: true, wide: true },
          ]}
          onCancel={() => setCreating(false)}
          onSubmit={(values) => {
            addCountdown({ title: values.title, targetAt: values.targetAt, icon: values.icon || '' });
            setCreating(false);
            toast('Countdown is live for both of you ⏳');
          }}
        />
      )}

      {!featuredTarget && !creating && <EmptyState tag="WAITING FOR A MOMENT" emoji="⏳" title="No countdowns yet" body="Add your next meeting, anniversary, or another important moment." actionLabel="Create countdown" onAction={() => setCreating(true)} />}

      {featuredTarget && featured && (
        <div style={pcss('border-radius:26px;padding:22px 20px;background:linear-gradient(155deg,#4A3B45,#2E2530);color:#FFF6F3;box-shadow:0 10px 28px rgba(60,45,52,.28);text-align:center')}>
          <div style={pcss("font:700 10px 'Nunito',sans-serif;letter-spacing:.14em;color:rgba(255,246,243,.6)")}>{featuredTarget.title.toUpperCase()} {featuredTarget.icon}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 9, marginTop: 16, flexWrap: 'wrap' }}>
            {flipDigits.map((digit) => (
              <div key={digit.label} style={{ textAlign: 'center' }}>
                <div style={pcss("width:56px;padding:12px 0;border-radius:14px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);font:700 26px 'Quicksand',sans-serif;color:#FFB7B2;position:relative")}><span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,.18)' }} />{digit.value}</div>
                <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:rgba(255,246,243,.55);margin-top:6px")}>{digit.label}</div>
              </div>
            ))}
          </div>
          <div style={pcss("font:500 19px 'Caveat',cursive;color:rgba(255,246,243,.85);margin-top:16px")}>{featured.passed ? 'This moment has passed' : `${daysUntil(featuredTarget.targetDate, now)} days until this moment ✨`}</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: twoCol, gap: 12 }}>
        {countdowns.map((countdownItem) => {
          const countdown = countdownParts(countdownItem.targetDate, now);
          return (
            <div key={countdownItem.id} style={pcss('border-radius:22px;background:var(--sf,#fff);padding:15px 16px;box-shadow:var(--shadow,0 8px 24px rgba(0,0,0,.04));display:flex;align-items:center;gap:13px')}>
              <div style={pcss(`width:42px;height:42px;border-radius:15px;flex:none;display:flex;align-items:center;justify-content:center;font-size:18px;background:${countdownItem.colorTag === 'pk' ? 'var(--sf2,#FFF4F1)' : countdownItem.colorTag === 'lav' ? '#EDE7FA' : '#E2F0CB'}`)}>{countdownItem.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={pcss("font:700 13px 'Nunito',sans-serif;color:var(--ink,#4A4A4A)")}>{countdownItem.title}</div>
                <div style={pcss("font:600 10.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E);margin-top:2px")}>{countdownItem.when}</div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={pcss("font:700 20px 'Quicksand',sans-serif;color:var(--pki,#E86F87)")}>{countdown.passed ? '✓' : daysUntil(countdownItem.targetDate, now)}</div>
                <div style={pcss("font:700 8.5px 'Nunito',sans-serif;color:var(--mut,#A99A9E)")}>{countdown.passed ? 'DONE' : 'DAYS'}</div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollColumn>
  );
}
