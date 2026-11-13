"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTHS, toDateInput } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useBooking } from "./Booking";

const WD = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WD_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function Month({ first, pick }: { first: Date; pick: (d: string) => void }) {
  const b = useBooking();
  const lead = (first.getDay() + 6) % 7;
  const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: lead + daysIn }, (_, i) => (i < lead ? null : new Date(first.getFullYear(), first.getMonth(), i - lead + 1)));
  return (
    <div>
      <p className="font-display text-lg font-semibold text-forest">{MONTHS[first.getMonth()]} {first.getFullYear()}</p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted" aria-hidden>
        {WD.map((w) => <span key={w}>{w}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const key = toDateInput(day);
          const past = day < b.today!;
          const blocked = b.isBlocked(day);
          const start = key === b.fd, end = key === b.td;
          const inRange = b.fd && b.td && key > b.fd && key < b.td;
          const label = `${WD_LONG[day.getDay()]}, ${day.getDate()}. ${MONTHS[day.getMonth()]}${blocked ? ", bereits gebucht" : past ? ", vergangen" : ", verfügbar"}${start ? ", Abholung" : end ? ", Rückgabe" : ""}`;
          return (
            <button
              key={i}
              type="button"
              disabled={past || blocked}
              onClick={() => pick(key)}
              aria-label={label}
              aria-pressed={start || end}
              className={cn(
                "grid aspect-square min-h-9 cursor-pointer place-items-center rounded-lg text-sm font-semibold transition",
                past && "cursor-default text-muted/50",
                blocked && !past && "cursor-not-allowed bg-[repeating-linear-gradient(135deg,#eef3f0_0_4px,#ffffff_4px_8px)] text-muted line-through",
                !past && !blocked && !start && !end && !inRange && "text-forest hover:bg-leaf-100",
                inRange && "bg-leaf-200 text-forest",
                (start || end) && "bg-forest text-white",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Verfügbarkeitskalender: zwei Monate ab Desktop, einer auf dem Handy. */
export function AvailabilityCalendar() {
  const b = useBooking();
  const [offset, setOffset] = useState(0);
  if (!b.today) return <div className="skeleton h-80 rounded-2xl" aria-hidden />;
  const month = (n: number) => new Date(b.today!.getFullYear(), b.today!.getMonth() + offset + n, 1);

  function pick(d: string) {
    if (!b.fd || (b.fd && b.td) || d <= b.fd) b.set({ fd: d, td: "" });
    else b.set({ td: d });
  }

  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {MONTHS[month(0).getMonth()]}<span className="hidden sm:inline"> und {MONTHS[month(1).getMonth()]}</span>
        </p>
        <div className="flex gap-1">
          <button type="button" className="icon-btn size-9" aria-label="Frühere Monate" disabled={offset === 0} onClick={() => setOffset((o) => o - 1)}><ChevronLeft className="size-5" aria-hidden /></button>
          <button type="button" className="icon-btn size-9" aria-label="Spätere Monate" disabled={offset === 3} onClick={() => setOffset((o) => o + 1)}><ChevronRight className="size-5" aria-hidden /></button>
        </div>
      </div>
      <div className="mt-2 grid gap-8 sm:grid-cols-2">
        <Month first={month(0)} pick={pick} />
        <div className="hidden sm:block"><Month first={month(1)} pick={pick} /></div>
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
        <li className="flex items-center gap-2"><span className="size-3.5 rounded bg-white ring-1 ring-line" aria-hidden />Verfügbar</li>
        <li className="flex items-center gap-2"><span className="size-3.5 rounded bg-[repeating-linear-gradient(135deg,#dde9e1_0_3px,#ffffff_3px_6px)] ring-1 ring-line" aria-hidden />Belegt</li>
        <li className="flex items-center gap-2"><span className="size-3.5 rounded bg-forest" aria-hidden />Dein Zeitraum</li>
      </ul>
      {b.fd && !b.td && <p className="hint">Wähle jetzt das Rückgabedatum im Kalender.</p>}
    </div>
  );
}
