"use client";
import { useRef } from "react";
import { CalendarCheck } from "lucide-react";
import type { BookingState } from "@/components/vehicle/Booking";
import { chf, toDateInput } from "@/lib/format";
import { fmtKm } from "@/lib/mileage";
import { ABO_SERVICES, OFFER_KINDS, fmtMonths, offersOf, priceTag } from "@/lib/offers";
import { DatePicker } from "@/components/ui/DatePicker";
import { Choice } from "@/components/ui/Choice";
import { cn } from "@/lib/cn";

/** Umschalter zwischen den Mietmodellen eines Fahrzeugs (Radiogruppe mit Pfeiltasten) */
export function ModelTabs({ b }: { b: BookingState }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const kinds = OFFER_KINDS.filter((k) => b.models.includes(k.id));
  const move = (i: number) => {
    const n = (i + kinds.length) % kinds.length;
    b.setModel(kinds[n].id);
    refs.current[n]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="Mietmodell" className={cn("mb-5 grid gap-1 rounded-xl bg-leaf-50 p-1 ring-1 ring-line", kinds.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {kinds.map((k, i) => {
        const on = b.model === k.id;
        return (
          <button
            key={k.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => b.setModel(k.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") (e.preventDefault(), move(i + 1));
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") (e.preventDefault(), move(i - 1));
            }}
            className={cn("min-h-10 cursor-pointer rounded-lg px-2 text-sm font-bold transition", on ? "bg-forest text-white shadow-sm" : "text-ink hover:bg-white")}
          >
            {k.tab}
          </button>
        );
      })}
    </div>
  );
}

/** Start, Dauer und beim Auto-Abo Kilometerpaket und Zusatzleistungen */
export function PlanFields({ b, idp }: { b: BookingState; idp: string }) {
  const a = offersOf(b.v).abo;
  const abo = b.model === "abo";
  return (
    <div className="grid gap-4">
      <fieldset className="min-w-0">
        <legend className="label">Start</legend>
        <DatePicker id={`${idp}-start`} label="Start" value={b.pl.start} min={b.today ? toDateInput(b.today) : undefined} invalid={!!b.planError} onChange={(start) => b.setPl({ start })} />
      </fieldset>
      {b.planError && <p className="error-text -mt-2" role="alert">{b.planError}</p>}
      <div>
        <label htmlFor={`${idp}-monate`} className="label">{abo ? "Laufzeit" : "Mietdauer"}</label>
        <select id={`${idp}-monate`} className="field" value={b.pl.months} onChange={(e) => b.setPl({ months: Number(e.target.value) })}>
          {b.terms.map((m) => <option key={m} value={m}>{fmtMonths(m)}</option>)}
        </select>
      </div>
      {abo && a && a.packages.length > 1 && (
        <fieldset>
          <legend className="label">Kilometerpaket pro Monat</legend>
          <div className="flex flex-wrap gap-2">
            {a.packages.map((p, i) => (
              <Choice key={p.km} type="radio" name={`${idp}-paket`} checked={b.pl.pkg === i} onChange={() => b.setPl({ pkg: i })}>
                {fmtKm(p.km)}{p.surcharge ? ` · + ${chf(p.surcharge)}` : ""}
              </Choice>
            ))}
          </div>
        </fieldset>
      )}
      {abo && a?.addons?.length ? (
        <fieldset>
          <legend className="label">Zusatzleistungen</legend>
          <div className="flex flex-wrap gap-2">
            {a.addons.map((x, i) => (
              <Choice key={x.label} name={`${idp}-extra`} checked={b.pl.addons.includes(i)} onChange={() => b.setPl({ addons: b.pl.addons.includes(i) ? b.pl.addons.filter((n) => n !== i) : [...b.pl.addons, i] })}>
                {x.label} · + {chf(x.monthly)}
              </Choice>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}

/**
 * Preisübersicht einer Langzeitmiete oder eines Auto-Abos: immer der Preis pro Monat,
 * Aufpreise einzeln, einmalige Kosten separat – kein Total über die ganze Laufzeit.
 */
export function PlanSummary({ b }: { b: BookingState }) {
  const p = b.plan;
  if (!p) return null;
  const abo = p.model === "abo";
  const extras = p.extras ?? [];
  const rows: [string, string, string?][] = [
    [abo ? "Laufzeit" : "Mietdauer", fmtMonths(p.months)],
    ["Kilometer", `${fmtKm(p.kmPerMonth)} pro Monat`],
  ];
  // Zusammensetzung nur, wenn Aufpreise dazukommen
  if (extras.length) {
    rows.push(["Grundpreis", chf(p.base ?? p.monthly - extras.reduce((s, x) => s + x.monthly, 0)), "mt-1 border-t border-line pt-2.5"]);
    for (const x of extras) rows.push([x.label, `+ ${chf(x.monthly)}`]);
  }
  return (
    <div>
      <dl className="grid gap-1.5 text-[0.95rem]">
        {rows.map(([k, v, cls]) => (
          <div key={k} className={cn("flex justify-between gap-4", cls)}>
            <dt className="text-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
        <div className="mt-2 flex items-baseline justify-between gap-4 rounded-xl bg-leaf-50 px-3.5 py-3 ring-1 ring-leaf-200">
          <dt className="font-bold text-forest">Pro Monat</dt>
          <dd className="font-display text-2xl leading-none font-bold text-forest">{chf(p.monthly)}</dd>
        </div>
        {p.startFee ? (
          <div className="mt-1 flex justify-between gap-4">
            <dt className="text-muted">Einmalige Startgebühr</dt>
            <dd className="text-right font-semibold">{chf(p.startFee)}</dd>
          </div>
        ) : null}
      </dl>
      <p className="hint">
        Mehrkilometer {chf(p.extraKmPrice)} pro km.
        {p.deposit ? ` Kaution ${chf(p.deposit)}, wird zurückerstattet.` : ""}
        {abo && p.noticeMonths ? ` Kündigungsfrist ${fmtMonths(p.noticeMonths)}, frühestens auf Ende der Laufzeit.` : ` Mindestmietdauer ${fmtMonths(p.minMonths)}.`}
      </p>
    </div>
  );
}

/** Buchungsbereich für Langzeitmiete und Auto-Abo */
export function PlanWidget({ b, idp = "w" }: { b: BookingState; idp?: string }) {
  const p = b.plan;
  const a = offersOf(b.v).abo;
  if (!p) return null;
  const abo = p.model === "abo";
  // Oben der Einstiegspreis des Modells, unten der Preis pro Monat für die gewählte Variante
  const t = priceTag(b.v, abo ? "abo" : "monate");
  return (
    <>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="font-display text-[1.9rem] leading-none font-bold text-forest">
          {t.from && <span className="text-lg">ab </span>}
          {chf(t.amount)}
        </span>
        <span className="text-muted">pro Monat</span>
      </p>
      <p className="mt-1.5 text-sm text-muted">
        {t.note} · {abo ? "Mindestlaufzeit" : "Mindestdauer"} {fmtMonths(p.minMonths)}
      </p>
      {abo && a && <p className="mt-1 text-sm text-muted">{a.included.slice(0, 3).map((k) => ABO_SERVICES[k]).join(", ")}{a.included.length > 3 ? " und mehr" : ""} inklusive</p>}
      <div className="mt-5"><PlanFields b={b} idp={idp} /></div>
      <div className="mt-5"><PlanSummary b={b} /></div>
      <button type="button" className="btn btn-primary mt-5 w-full" disabled={!!b.planError} onClick={b.open}>
        <CalendarCheck className="size-5" aria-hidden />
        {abo ? "Auto-Abo anfragen" : "Langzeitmiete anfragen"}
      </button>
      <p className="mt-3 text-center text-sm text-muted">Unverbindliche Anfrage – du bezahlst noch nichts.</p>
    </>
  );
}
