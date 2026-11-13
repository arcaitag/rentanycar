import { Gauge, Infinity as Unlimited, Route } from "lucide-react";
import { chf } from "@/lib/format";
import { fmtKm, overagePriceOf, unlimitedLabel, type MileagePolicy } from "@/lib/mileage";

/** Kilometerregelung eines Inserats – kurz und ohne Tabellen */
export function MileageInfo({ p }: { p: MileagePolicy }) {
  const over = overagePriceOf(p);
  return (
    <div className="grid max-w-2xl gap-5">
      <div className="flex items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-100 text-forest"><Gauge className="size-5" aria-hidden /></span>
        <p>
          <span className="block font-display text-xl font-semibold text-forest">{fmtKm(p.perDay)} pro Tag inklusive</span>
          <span className="text-sm text-muted">
            {p.tiers?.length ? p.tiers.map((t) => `ab ${t.fromDays} Tagen ${fmtKm(t.perDay)} pro Tag`).join(", ") : "Für jede Buchung: Kilometer pro Tag × Miettage"}
          </span>
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
        <p className="font-bold text-forest">Zusätzliche Kilometer</p>
        {over === p.extraPrice ? (
          <p className="mt-1 text-ink/85">{chf(p.extraPrice)} pro km, vorab gebucht oder nach der Rückgabe</p>
        ) : (
          <ul className="mt-1 grid gap-0.5 text-ink/85">
            <li>{chf(p.extraPrice)} pro km bei Vorausbuchung</li>
            <li>{chf(over)} pro km bei Überschreitung</li>
          </ul>
        )}
        {(p.unlimited || p.maxKm) && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {p.unlimited && (
              <li className="chip bg-leaf-100 text-leaf-700"><Unlimited className="size-4" aria-hidden />Unlimited-Paket verfügbar: {unlimitedLabel(p.unlimited)}</li>
            )}
            {p.maxKm && <li className="chip bg-line/70 text-ink/80"><Route className="size-4" aria-hidden />Maximal {fmtKm(p.maxKm)} pro Buchung</li>}
          </ul>
        )}
      </div>
      <p className="max-w-[65ch] text-sm leading-relaxed text-muted">
        Zusatzkilometer wählst du direkt bei der Anfrage. Fährst du mehr als gebucht, werden die Mehrkilometer nach der Rückgabe anhand der Kilometerstände
        berechnet.
      </p>
    </div>
  );
}
