"use client";
import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS, addDays, fmtDate, parseLocal, startOfDay, toDateInput } from "@/lib/format";
import { cn } from "@/lib/cn";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WD_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WD_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const longDate = (d: Date) => `${WD_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const same = (a: Date | null, b: Date | null) => !!a && !!b && toDateInput(a) === toDateInput(b);

export const TIMES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
/** Frühester Halbstunden-Schritt ab einer Uhrzeit plus Versatz in Minuten, z. B. 14:10 → 14:30 */
export const slotFrom = (t: string, offset = 0) => {
  const n = Math.ceil((toMin(t) + offset) / 30) * 30;
  return n >= 1440 ? "24:00" : `${String(Math.floor(n / 60)).padStart(2, "0")}:${n % 60 ? "30" : "00"}`;
};

/** Uhrzeit im 24-Stunden-Format, in 30-Minuten-Schritten. */
export function TimeSelect({ value, onChange, label, id, className }: { value: string; onChange: (v: string) => void; label: string; id?: string; className?: string }) {
  const list = value && !TIMES.includes(value) ? [...TIMES, value].sort() : TIMES;
  return (
    <select id={id} className={cn("field px-3", className)} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {list.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

/**
 * Datumsauswahl im Schweizer Format (TT.MM.JJJJ) mit Monatskalender im Dialog.
 * Mit onTime wird daraus eine Auswahl für Datum und Uhrzeit: Nach dem Klick auf einen Tag erscheint
 * darunter die Uhrzeit, die Wahl einer Uhrzeit schliesst den Dialog. minTime sperrt frühere Zeiten,
 * wenn das gewählte Datum dem Mindestdatum entspricht (z. B. heute oder Rückgabe am Abholtag).
 */
export function DatePicker({
  value,
  onChange,
  label,
  min,
  id,
  invalid,
  onClear,
  describedBy,
  time,
  onTime,
  minTime,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  min?: string;
  id?: string;
  invalid?: boolean;
  onClear?: () => void;
  describedBy?: string;
  time?: string;
  onTime?: (v: string) => void;
  minTime?: string;
}) {
  const uid = useId();
  const dlg = useRef<HTMLDialogElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<Date | null>(null);
  // Uhrzeit erscheint erst, nachdem im geöffneten Dialog ein Tag angeklickt wurde
  const [picked, setPicked] = useState(false);
  const [tFocus, setTFocus] = useState(-1);
  const withTime = !!onTime;
  // Mindestdatum ab Mitternacht – frühere Uhrzeiten am selben Tag sperrt minTime
  const minDate = min ? parseLocal(min, "00:00") : null;
  const selected = value ? parseLocal(value) : null;

  useEffect(() => {
    if (focus && dlg.current?.open && !picked) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${toDateInput(focus)}"]`)?.focus();
  }, [focus]);
  useEffect(() => {
    if (!picked || tFocus < 0) return;
    const box = clock.current;
    const el = box?.querySelector<HTMLButtonElement>(`[data-time="${TIMES[tFocus]}"]`);
    if (!box || !el) return;
    // Gewählte Zeit in der zweiten Reihe, an ganzen Reihen ausgerichtet (4 Spalten, 6 px Abstand)
    box.scrollTop = Math.max(0, Math.floor(tFocus / 4) - 1) * (el.offsetHeight + 6);
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "nearest" });
  }, [picked, tFocus]);

  function open() {
    setPicked(false);
    setFocus(selected ?? minDate ?? startOfDay(new Date()));
    dlg.current?.showModal();
  }
  // Frühere Uhrzeiten sind nur am Mindestdatum gesperrt
  const timeOff = (day: Date | null, t: string) => !!minTime && !!minDate && same(day, minDate) && t < minTime;
  function pickDay(d: Date) {
    onChange(toDateInput(d));
    if (!withTime) return close();
    const keep = time && !timeOff(d, time) ? time : TIMES.find((t) => !timeOff(d, t)) ?? TIMES[0];
    setTFocus(TIMES.indexOf(keep));
    setFocus(d);
    setPicked(true);
  }
  function onTimeKey(e: React.KeyboardEvent) {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 };
    if (!(e.key in step)) return;
    e.preventDefault();
    const n = tFocus + step[e.key];
    if (n >= 0 && n < TIMES.length && !timeOff(selected, TIMES[n])) setTFocus(n);
  }
  const close = () => dlg.current?.close();
  const blocked = (d: Date) => !!minDate && d < minDate;
  const moveTo = (d: Date) => !blocked(d) && setFocus(d);
  const shiftMonth = (n: number) =>
    setFocus((f) => {
      if (!f) return f;
      const x = new Date(f.getFullYear(), f.getMonth() + n, 1);
      x.setDate(Math.min(f.getDate(), new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate()));
      return minDate && x < minDate ? minDate : x;
    });

  function onKey(e: React.KeyboardEvent) {
    if (!focus) return;
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) {
      e.preventDefault();
      moveTo(addDays(focus, step[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      shiftMonth(e.key === "PageUp" ? -1 : 1);
    }
  }

  const month = focus ? new Date(focus.getFullYear(), focus.getMonth(), 1) : null;
  const cells: (Date | null)[] = [];
  if (month) {
    const lead = (month.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  const today = startOfDay(new Date());
  const atMinMonth = !!(month && minDate && month <= new Date(minDate.getFullYear(), minDate.getMonth(), 1));

  return (
    <>
      <button
        type="button"
        id={id}
        onClick={open}
        aria-haspopup="dialog"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-label={`${label}: ${selected ? `${fmtDate(selected)}${withTime && time ? `, ${time} Uhr` : ""}` : "Datum wählen"}`}
        className={cn("field flex cursor-pointer items-center gap-2 px-3 text-left", !selected && "text-muted")}
      >
        <CalendarDays className="size-4 shrink-0 text-leaf-700" aria-hidden />
        <span className="truncate">{selected ? `${fmtDate(selected)}${withTime && time ? `, ${time}` : ""}` : withTime ? "Datum und Uhrzeit" : "Datum wählen"}</span>
      </button>
      <dialog ref={dlg} className="picker" aria-label={`${label}: ${withTime ? "Datum und Uhrzeit" : "Datum"} wählen`} onClose={() => setPicked(false)} onClick={(e) => e.target === e.currentTarget && close()}>
        {month && (
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <button type="button" className="icon-btn size-10" aria-label="Vorheriger Monat" disabled={atMinMonth} onClick={() => shiftMonth(-1)}>
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <p className="font-display text-lg font-semibold text-forest" aria-live="polite">{MONTHS[month.getMonth()]} {month.getFullYear()}</p>
              <button type="button" className="icon-btn size-10" aria-label="Nächster Monat" onClick={() => shiftMonth(1)}>
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted" aria-hidden>
              {WD.map((w) => <span key={w}>{w}</span>)}
            </div>
            <div ref={grid} className="mt-1 grid grid-cols-7 gap-1" onKeyDown={onKey}>
              {cells.map((d, i) =>
                d ? (
                  <button
                    key={i}
                    type="button"
                    data-day={toDateInput(d)}
                    tabIndex={same(d, focus) ? 0 : -1}
                    disabled={blocked(d)}
                    aria-pressed={same(d, selected)}
                    aria-label={longDate(d)}
                    onClick={() => pickDay(d)}
                    className={cn(
                      "grid aspect-square place-items-center rounded-lg text-sm font-semibold transition-colors",
                      blocked(d) ? "cursor-default text-muted/40" : "cursor-pointer text-forest hover:bg-leaf-100",
                      same(d, today) && !same(d, selected) && "ring-1 ring-leaf-300 ring-inset",
                      same(d, selected) && "bg-forest text-white hover:bg-forest",
                    )}
                  >
                    {d.getDate()}
                  </button>
                ) : (
                  <span key={i} />
                ),
              )}
            </div>
            {withTime && !picked && <p className="mt-2 text-center text-sm text-muted">Tippe auf einen Tag, danach wählst du die Uhrzeit.</p>}
            {withTime && picked && selected && (
              <div className="mt-3 border-t border-line pt-3">
                <p id={`${uid}-zeit`} className="text-sm font-bold text-forest">Uhrzeit am {WD_SHORT[selected.getDay()]}, {selected.getDate()}. {MONTHS[selected.getMonth()]}</p>
                <div ref={clock} role="group" aria-labelledby={`${uid}-zeit`} onKeyDown={onTimeKey} className="mt-2 grid max-h-[8.75rem] snap-y grid-cols-4 gap-1.5 overflow-y-auto p-0.5">
                  {TIMES.map((t, i) => {
                    const off = timeOff(selected, t);
                    const on = t === time;
                    return (
                      <button
                        key={t}
                        type="button"
                        data-time={t}
                        tabIndex={i === tFocus ? 0 : -1}
                        disabled={off}
                        aria-pressed={on}
                        aria-label={`${t} Uhr`}
                        onClick={() => {
                          onTime!(t);
                          close();
                        }}
                        className={cn(
                          "min-h-9 snap-start rounded-lg text-sm font-semibold ring-1 transition-colors",
                          off ? "cursor-default text-muted/40 ring-line/60" : on ? "cursor-pointer bg-forest text-white ring-forest" : "cursor-pointer text-forest ring-line hover:bg-leaf-100",
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              {onClear && value ? (
                <button type="button" className="btn btn-ghost btn-sm -ml-2" onClick={() => { onClear(); close(); }}>Datum entfernen</button>
              ) : (
                <span />
              )}
              <button type="button" className="btn btn-outline btn-sm" onClick={close}>Schliessen</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
