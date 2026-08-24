import { useEffect, useState } from 'react';

export function appNow(): Date {
  return new Date();
}

/** Live-ticking version of appNow() for components that render a countdown or clock. */
export function useAppNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(appNow);
  useEffect(() => {
    const id = setInterval(() => setNow(appNow()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * Formats as HH:mm with a colon, matching the design's clocks.
 * (`id-ID` would render "15.42" with a dot separator; `en-GB` gives the
 * 24-hour colon form the design uses, with no other locale-visible text.)
 */
export function formatTimeInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(date);
}

/** Full Indonesian weekday name for a date in a given zone, e.g. "Rabu". */
export function weekdayInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone }).format(date);
}

export function formatDateLabel(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', timeZone }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const weekday = get('weekday').replace('.', '');
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${get('day')} ${get('month')}`;
}

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  passed: boolean;
}

export function countdownParts(target: Date | string, now: Date): CountdownParts {
  const targetMs = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
  const totalMs = targetMs - now.getTime();
  const passed = totalMs <= 0;
  const abs = Math.abs(totalMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { totalMs, days, hours, minutes, seconds, passed };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Whole days remaining until `target`, counted the way people say them:
 * a target 6 days and 8 hours out is "7 hari lagi", not 6. Rounding up
 * is what reproduces the design's countdown figures exactly (7 days to
 * the anniversary, 12 to the flight) from genuine date arithmetic.
 */
export function daysUntil(target: Date | string, now: Date): number {
  const targetMs = typeof target === 'string' ? new Date(target).getTime() : target.getTime();
  const diff = targetMs - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / 86_400_000);
}

/**
 * Days elapsed since `start`, counted inclusively so the first day is
 * day 1 — the convention behind the design's "Udah 127 Hari Bareng!".
 */
export function daysSince(start: Date | string, now: Date): number {
  const startMs = typeof start === 'string' ? new Date(start).getTime() : start.getTime();
  return Math.floor((now.getTime() - startMs) / 86_400_000) + 1;
}
