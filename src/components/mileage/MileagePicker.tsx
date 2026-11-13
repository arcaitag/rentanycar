"use client";
import { Check } from "lucide-react";
import { chf, num } from "@/lib/format";
import { EXTRA_PACKAGES, allowedKm, extraRoom, fmtKm, type BookingKm, type MileageChoice, type MileagePolicy } from "@/lib/mileage";
import { cn } from "@/lib/cn";

export type KmSel = "0" | "100" | "250" | "500" | "eigene" | "unlimited";
export interface KmInput { sel: KmSel; custom: string }
export const KM_INPUT_DEFAULT: KmInput = { sel: "0", custom: "" };

const digits = (s: string) => s.replace(/[’' ]/g, "");

export function kmChoice(i: KmInput): MileageChoice {
  if (i.sel === "unlimited") return { type: "unlimited" };
  if (i.sel === "eigene") return /^\d+$/.test(digits(i.custom)) ? { type: "extra", km: Number(digits(i.custom)) } : { type: "inklusive" };
  return i.sel === "0" ? { type: "inklusive" } : { type: "extra", km: Number(i.sel) };
}

/** Fehler zur Kilometerwahl; leer, wenn alles passt. base = Buchung ohne Zusatzkilometer. */
export function kmInputError(i: KmInput, base: BookingKm | null): string {
  if (!base) return "";
  const room = extraRoom(base);
  const max = base.maxKm ? fmtKm(base.maxKm) : "";
  if (i.sel === "eigene") {
    const n = Number(digits(i.custom));
    if (!/^\d+$/.test(digits(i.custom)) || n < 1) return "Bitte gib die Anzahl zusätzlicher Kilometer als ganze Zahl ein.";
    if (n > 20000) return "Bitte gib höchstens 20’000 zusätzliche Kilometer ein.";
    if (n > room) return `Möglich sind höchstens ${fmtKm(room)} zusätzlich (Maximum ${max} pro Buchung).`;
  } else if (i.sel !== "0" && i.sel !== "unlimited" && Number(i.sel) > room) return `Dieses Paket übersteigt das Maximum von ${max} pro Buchung.`;
  return "";
}

/** Kilometerwahl im Buchungsprozess */
export function MileagePicker({ p, base, k, value, onChange, error, idp }: { p: MileagePolicy; base: BookingKm; k: BookingKm; value: KmInput; onChange: (v: KmInput) => void; error: string; idp: string }) {
  const room = extraRoom(base);
  const opts: { sel: KmSel; title: string; sub: string; off?: boolean }[] = [
    { sel: "0", title: fmtKm(base.included), sub: "inklusive" },
    ...EXTRA_PACKAGES.map((n) => ({ sel: String(n) as KmSel, title: `+${fmtKm(n)}`, sub: `+ ${chf(n * p.extraPrice)}`, off: n > room })),
    { sel: "eigene", title: "Andere Anzahl", sub: `${chf(p.extraPrice)} pro km`, off: room < 1 },
    ...(p.unlimited ? [{ sel: "unlimited" as KmSel, title: "Unbegrenzt", sub: `+ ${chf(p.unlimited.per === "tag" ? p.unlimited.price * base.days : p.unlimited.price)}` }] : []),
  ];
  const capped = base.included < base.perDay * base.days;
  return (
    <div className="grid gap-4">
      <div className="rounded-xl bg-leaf-50 px-3.5 py-3 ring-1 ring-leaf-200">
        <p className="text-sm text-ink/80">{fmtKm(base.perDay)} pro Tag inklusive</p>
        <p className="font-bold text-forest">Für deine Buchung: {fmtKm(base.included)} inklusive</p>
        {capped && <p className="text-sm text-muted">Begrenzt auf das Maximum von {fmtKm(base.maxKm!)} pro Buchung.</p>}
      </div>
      <fieldset>
        <legend className="label">Mehr Kilometer hinzufügen</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {opts.map((o) => {
            const on = value.sel === o.sel;
            return (
              <label
                key={o.sel}
                className={cn(
                  "relative flex min-h-16 flex-col justify-center rounded-xl bg-white px-3.5 py-2.5 ring-1 transition has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid",
                  on ? "bg-leaf-50 ring-2 ring-forest" : "ring-line",
                  o.off ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:ring-forest/40",
                )}
              >
                <input type="radio" name={`${idp}-km`} className="sr-only" checked={on} disabled={o.off} onChange={() => onChange({ ...value, sel: o.sel })} />
                <span className="pr-5 font-bold text-forest">{o.title}</span>
                <span className="text-sm text-ink/75">{o.off ? "über dem Maximum" : o.sub}</span>
                {on && <Check className="absolute top-2.5 right-2.5 size-4 text-forest" aria-hidden />}
              </label>
            );
          })}
        </div>
      </fieldset>
      {value.sel === "eigene" && (
        <div>
          <label htmlFor={`${idp}-km-eigene`} className="label">Zusätzliche Kilometer</label>
          <div className="flex items-center gap-2.5">
            <input
              id={`${idp}-km-eigene`}
              inputMode="numeric"
              className="field max-w-[9rem]"
              placeholder="z. B. 350"
              value={value.custom}
              onChange={(e) => onChange({ ...value, custom: e.target.value.replace(/[^\d’' ]/g, "") })}
              aria-invalid={!!error}
              aria-describedby={error ? `${idp}-km-e` : `${idp}-km-h`}
            />
            <span className="text-muted">km</span>
          </div>
          {!error && (
            <p id={`${idp}-km-h`} className="hint">
              {k.extra ? `${num(k.extra)} × ${chf(p.extraPrice)} = ${chf(k.extraCost)}` : `${chf(p.extraPrice)} pro zusätzlichem Kilometer`}
            </p>
          )}
        </div>
      )}
      {error && <p id={`${idp}-km-e`} className="error-text" role="alert">{error}</p>}
      <div aria-live="polite">
        {k.unlimited ? (
          <p className="text-[0.95rem]">
            <strong className="text-forest">Unbegrenzte Kilometer.</strong> Für diese Buchung gilt keine reguläre Kilometerlimite
            {k.unlimited.cap ? ` – Fair Use bis ${fmtKm(k.unlimited.cap)}.` : "."}
          </p>
        ) : (
          <p className="text-[0.95rem]">Total verfügbar: <strong className="text-forest">{fmtKm(k.included + k.extra)}</strong></p>
        )}
        {!(k.unlimited && !k.unlimited.cap) && <p className="text-sm text-muted">Mehrkilometer nach der Rückgabe: {chf(k.overagePrice)} pro km</p>}
      </div>
    </div>
  );
}

/** Kilometer einer Buchung auf einen Blick – vor dem Senden und im Konto */
export function KmSummary({ k, topUp = 0, topUpCost = 0 }: { k: BookingKm; topUp?: number; topUpCost?: number }) {
  const allowed = allowedKm(k, topUp);
  const rows: [string, string][] = [
    ["Mietdauer", `${k.days} ${k.days === 1 ? "Tag" : "Tage"}`],
    ["Kilometer pro Tag", fmtKm(k.perDay)],
    ["Inklusive Kilometer", fmtKm(k.included)],
  ];
  if (k.unlimited) rows.push(["Unlimited-Paket", chf(k.unlimited.cost)]);
  if (k.extra) rows.push(["Zusatzkilometer", `+${fmtKm(k.extra)}`]);
  if (topUp) rows.push(["Nachgebucht", `+${fmtKm(topUp)}`]);
  rows.push(["Total verfügbar", k.unlimited ? (allowed ? `unbegrenzt, Fair Use bis ${fmtKm(allowed)}` : "unbegrenzt") : fmtKm(allowed ?? 0)]);
  if (k.extraCost + topUpCost > 0) rows.push(["Kosten Zusatzkilometer", chf(k.extraCost + topUpCost)]);
  if (!(k.unlimited && !k.unlimited.cap)) rows.push(["Preis pro Mehrkilometer", chf(k.overagePrice)]);
  return (
    <dl className="grid gap-1.5 text-[0.95rem]">
      {rows.map(([a, b]) => (
        <div key={a} className="flex justify-between gap-4">
          <dt className="text-muted">{a}</dt>
          <dd className={cn("text-right font-semibold", a === "Total verfügbar" && "text-forest")}>{b}</dd>
        </div>
      ))}
    </dl>
  );
}
