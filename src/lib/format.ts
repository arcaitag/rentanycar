const group = (n: number) => String(Math.abs(Math.trunc(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "’");

/** Schweizer Schreibweise: CHF 69.– oder CHF 11.05 (auf 5 Rappen gerundet). */
export function chf(amount: number) {
  const r = Math.round(amount * 20) / 20;
  const cents = Math.round((Math.abs(r) % 1) * 100);
  return `CHF ${r < 0 ? "-" : ""}${group(r)}.${cents ? String(cents).padStart(2, "0") : "–"}`;
}

export const num = (n: number) => group(n);

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
export const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDate(d: Date, weekday = false) {
  const s = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  return weekday ? `${WEEKDAYS[d.getDay()]}, ${s}` : s;
}
export const fmtShort = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
/** Kurzform mit Wochentag, z. B. «Di, 29.09.» */
export const fmtDay = (d: Date) => `${WEEKDAYS[d.getDay()]}, ${fmtShort(d)}`;
export const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const toDateInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseLocal(date: string, time = "10:00") {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, h || 0, min || 0);
}
export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
export const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 864e5);
