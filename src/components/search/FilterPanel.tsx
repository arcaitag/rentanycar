"use client";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { DurationMode } from "@/lib/offers";
import { BRANDS, CATEGORIES, type Fuel } from "@/data/vehicles";
import type { Place } from "@/data/places";
import { PRICE_CEIL, type Criteria } from "@/lib/search";
import { chf } from "@/lib/format";
import { Choice, Toggle } from "@/components/ui/Choice";

const FUELS: Fuel[] = ["Benzin", "Diesel", "Elektro", "Hybrid"];
const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

/** Einklappbare Filtergruppe (natives details/summary). */
function Group({ title, count = 0, open = false, children }: { title: string; count?: number; open?: boolean; children: React.ReactNode }) {
  return (
    <details className="group border-b border-line last:border-0" open={open || count > 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 font-bold text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-forest text-[0.7rem] text-white">
              {count}
              <span className="sr-only"> aktiv</span>
            </span>
          )}
        </span>
        <ChevronDown className="size-4 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
      </summary>
      <fieldset className="pb-5">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}

export function FilterPanel({ c, set, place, idPrefix, onReset, mode = "" }: { mode?: DurationMode | ""; c: Criteria; set: (p: Partial<Criteria>) => void; place: Place | null; idPrefix: string; onReset: () => void }) {
  const pct = (v: number) => (v / PRICE_CEIL) * 100;
  const priceActive = c.preisMin > 0 || c.preisMax < PRICE_CEIL;
  // Bei Monaten und Auto-Abo gibt es Monatspreise – dort greift der Tagespreis-Filter nicht
  const daily = !mode || mode === "tage" || mode === "wochen";
  return (
    <div>
      {daily && (
      <Group title="Preis pro Tag" count={priceActive ? 1 : 0} open>
        <p className="text-sm font-semibold text-forest" aria-live="polite">
          {chf(c.preisMin)} bis {c.preisMax >= PRICE_CEIL ? `${chf(PRICE_CEIL)} und mehr` : chf(c.preisMax)}
        </p>
        <div className="range-dual mt-2">
          <div className="absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2 rounded-full bg-line" aria-hidden />
          <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-forest" style={{ left: `${pct(c.preisMin)}%`, right: `${100 - pct(c.preisMax)}%` }} aria-hidden />
          <input type="range" min={0} max={PRICE_CEIL} step={5} value={c.preisMin} aria-label="Mindestpreis pro Tag in CHF" onChange={(e) => set({ preisMin: Math.min(Number(e.target.value), c.preisMax - 10) })} />
          <input type="range" min={0} max={PRICE_CEIL} step={5} value={c.preisMax} aria-label="Höchstpreis pro Tag in CHF" onChange={(e) => set({ preisMax: Math.max(Number(e.target.value), c.preisMin + 10) })} />
        </div>
      </Group>
      )}
      <Group title="Kategorie" count={c.kategorien.length} open>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((k) => (
            <Choice key={k.id} name={`${idPrefix}-kat`} checked={c.kategorien.includes(k.id)} onChange={() => set({ kategorien: toggle(c.kategorien, k.id) })}>
              {k.label}
            </Choice>
          ))}
        </div>
      </Group>
      <Group title="Übergabe" count={Number(c.sofort) + Number(c.kontaktlos)}>
        <Toggle checked={c.sofort} onChange={(sofort) => set({ sofort })} label="Heute verfügbar" hint="Abholung heute möglich" />
        <Toggle checked={c.kontaktlos} onChange={(kontaktlos) => set({ kontaktlos })} label="Kontaktlose Übergabe" hint="zum Beispiel über eine Schlüsselbox" />
      </Group>
      {place && (
        <Group title={`Umkreis um ${place.name}`} count={c.umkreis ? 1 : 0}>
          <label htmlFor={`${idPrefix}-umkreis`} className="sr-only">Umkreis</label>
          <select id={`${idPrefix}-umkreis`} className="field" value={c.umkreis} onChange={(e) => set({ umkreis: Number(e.target.value) })}>
            <option value={0}>Ganze Schweiz</option>
            {[10, 25, 50, 100].map((k) => <option key={k} value={k}>bis {k} km</option>)}
          </select>
        </Group>
      )}
      <Group title="Getriebe" count={c.getriebe ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {([["", "Alle"], ["automatik", "Automatik"], ["manuell", "Manuell"]] as const).map(([v, l]) => (
            <Choice key={v} type="radio" name={`${idPrefix}-getriebe`} checked={c.getriebe === v} onChange={() => set({ getriebe: v })}>{l}</Choice>
          ))}
        </div>
      </Group>
      <Group title="Antrieb" count={c.antrieb.length}>
        <div className="flex flex-wrap gap-2">
          {FUELS.map((f) => (
            <Choice key={f} name={`${idPrefix}-antrieb`} checked={c.antrieb.includes(f)} onChange={() => set({ antrieb: toggle(c.antrieb, f) })}>{f}</Choice>
          ))}
        </div>
      </Group>
      <Group title="Sitzplätze" count={c.sitze ? 1 : 0}>
        <div className="flex flex-wrap gap-2">
          {([[0, "Alle"], [4, "ab 4"], [5, "ab 5"], [7, "ab 7"]] as const).map(([v, l]) => (
            <Choice key={v} type="radio" name={`${idPrefix}-sitze`} checked={c.sitze === v} onChange={() => set({ sitze: v })}>{l}</Choice>
          ))}
        </div>
      </Group>
      <Group title="Marke" count={c.marke ? 1 : 0}>
        <label htmlFor={`${idPrefix}-marke`} className="sr-only">Marke</label>
        <select id={`${idPrefix}-marke`} className="field" value={c.marke} onChange={(e) => set({ marke: e.target.value })}>
          <option value="">Alle Marken</option>
          {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Group>
      <button type="button" className="btn btn-ghost btn-sm mt-3 -ml-2" onClick={onReset}>
        <RotateCcw className="size-4" aria-hidden />
        Alle Filter zurücksetzen
      </button>
    </div>
  );
}
