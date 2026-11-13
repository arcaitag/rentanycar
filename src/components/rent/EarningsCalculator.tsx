"use client";
import Link from "next/link";
import { useId, useState } from "react";
import { chf } from "@/lib/format";

/*
 * Einnahmen-Rechner «Was verdient mein Auto?»
 * Bewusst einfach: eigener Tagespreis × vermietete Tage. Keine Marktdaten, keine Gebühren –
 * beides ist noch nicht festgelegt. Die Startwerte sind nur Beispiele und frei verschiebbar.
 */
const PRICE = { min: 20, max: 300, step: 5, start: 70 };
const DAYS = { min: 1, max: 25, step: 1, start: 6 };
const fill = (v: number, r: { min: number; max: number }) => ({ "--fill": `${((v - r.min) / (r.max - r.min)) * 100}%` }) as React.CSSProperties;
const tage = (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"}`;

function Slider({ id, label, value, display, range, onChange, valueText }: {
  id: string;
  label: string;
  value: number;
  display: string;
  range: { min: number; max: number; step: number };
  onChange: (v: number) => void;
  valueText: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label mb-0">{label}</label>
        <output htmlFor={id} className="font-display text-xl font-bold text-forest">{display}</output>
      </div>
      <input
        id={id}
        type="range"
        className="range mt-2"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        style={fill(value, range)}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function EarningsCalculator() {
  const id = useId();
  const [price, setPrice] = useState(PRICE.start);
  const [days, setDays] = useState(DAYS.start);
  const month = price * days;
  return (
    <section className="page section" aria-labelledby={`${id}-titel`}>
      <div className="card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:p-10">
        <div>
          <h2 id={`${id}-titel`} className="h-section">Was verdient mein Auto?</h2>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-ink/80">
            Stell deinen Tagespreis ein und wie viele Tage im Monat du dein Auto vermieten möchtest. Du siehst sofort, was das ungefähr ergibt.
          </p>
          <div className="mt-8 grid gap-7">
            <Slider id={`${id}-preis`} label="Dein Tagespreis" value={price} display={chf(price)} range={PRICE} onChange={setPrice} valueText={`${chf(price)} pro Tag`} />
            <Slider id={`${id}-tage`} label="Vermietete Tage pro Monat" value={days} display={tage(days)} range={DAYS} onChange={setDays} valueText={`${tage(days)} pro Monat`} />
          </div>
        </div>
        <div className="flex flex-col rounded-2xl bg-leaf-50 p-6 ring-1 ring-leaf-200 sm:p-7">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-leaf-700">
            Geschätzte Einnahmen
            <span className="demo-tag">Schätzung</span>
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2" aria-live="polite">
            <span className="font-display text-[2.6rem] leading-none font-bold text-forest">{chf(month)}</span>
            <span className="text-muted">pro Monat</span>
          </p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/85">
            {tage(days)} × {chf(price)}. Läuft es jeden Monat so, sind das rund <strong className="text-forest">{chf(month * 12)}</strong> im Jahr.
          </p>
          <p className="mt-auto pt-5 text-sm leading-relaxed text-muted">
            Unverbindliche Schätzung, keine Garantie. Wie oft dein Auto gebucht wird, hängt von Ort, Preis, Saison und Nachfrage ab. Allfällige Gebühren und
            deine eigenen Kosten, zum Beispiel für Reinigung, Abnutzung oder Versicherung, sind nicht abgezogen.
          </p>
          <Link href="/auto-vermieten/erfassen" className="btn btn-primary mt-5 w-full sm:w-fit">Auto kostenlos inserieren</Link>
        </div>
      </div>
    </section>
  );
}
