"use client";
import { useEffect, useRef, useState } from "react";
import { Layers, X } from "lucide-react";
import { chf } from "@/lib/format";
import { fmtKm, MILEAGE_FORM_DEFAULT, type MileageForm } from "@/lib/mileage";
import {
  ABO_KM_STEPS, ABO_SERVICES, ABO_TERMS, COVERAGE, MONTH_STEPS, OFFER_KINDS, STAFFEL, fmtMonths, pickOffers, validateOffers,
  type AboService, type Coverage, type OfferForm, type Offers,
} from "@/lib/offers";
import { useStore } from "@/lib/store";
import { Choice, Toggle } from "@/components/ui/Choice";
import { MileageSettings } from "@/components/mileage/MileageSettings";
import { cn } from "@/lib/cn";

type Full = OfferForm & MileageForm & { preis: string };
type Set = (p: Partial<Full>) => void;
const numeric = (s: string) => s.replace(/[^\d’' ]/g, "");
const decimal = (s: string) => s.replace(/[^\d.,’' ]/g, "");

function Field({ id, label, value, onChange, error, hint, prefix, suffix, placeholder, optional, kind = "decimal" }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; prefix?: string; suffix?: string; placeholder?: string; optional?: boolean; kind?: "decimal" | "numeric" | "text";
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="label">{label}{optional && <span className="font-medium text-muted"> (optional)</span>}</label>
      <div className="flex items-center gap-2.5">
        {prefix && <span className="text-muted">{prefix}</span>}
        <input
          id={id}
          inputMode={kind === "text" ? undefined : kind}
          className={cn("field", kind !== "text" && "max-w-[9rem]")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(kind === "text" ? e.target.value : kind === "numeric" ? numeric(e.target.value) : decimal(e.target.value))}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        />
        {suffix && <span className="shrink-0 text-muted">{suffix}</span>}
      </div>
      {error ? <p id={`${id}-e`} className="error-text">{error}</p> : hint && <p id={`${id}-h`} className="hint">{hint}</p>}
    </div>
  );
}

function Select({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="grid gap-5 rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

const MONTH_OPTIONS: [string, string][] = MONTH_STEPS.map((m) => [String(m), fmtMonths(m)]);

/**
 * Preise und Mietmodelle eines Inserats. Private Anbieter: Tagespreis, Kilometer, Kaution und Versicherung.
 * Gewerbliche Anbieter: Kurzzeitmiete, Langzeitmiete und Auto-Abo frei kombinierbar, optional mit Preisstaffel.
 * base: Tagespreis und Kilometer mit anzeigen (im Flotten-Editor werden sie separat bearbeitet).
 */
export function OfferSettings({ value: f, onChange: set, errors, idp, gewerbe, base = true }: { value: Full; onChange: Set; errors: Record<string, string>; idp: string; gewerbe: boolean; base?: boolean }) {
  const id = (k: string) => `${idp}-${k}`;
  const on = (k: (typeof OFFER_KINDS)[number]["id"]) => !gewerbe ? k === "kurzzeit" : f.modelle.includes(k);
  const price = Number(f.preis);
  const packs = [...f.aboPakete].sort((a, b) => Number(a) - Number(b));

  const shortFields = (
    <>
      {gewerbe && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id("minTage")} label="Mindestmietdauer" suffix="Tage" kind="numeric" value={f.minTage} onChange={(minTage) => set({ minTage })} error={errors.minTage} />
          <Field id={id("maxTage")} label="Maximale Mietdauer" optional suffix="Tage" kind="numeric" placeholder="z. B. 30" value={f.maxTage} onChange={(maxTage) => set({ maxTage })} error={errors.maxTage} />
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("kaution")} label="Kaution" optional prefix="CHF" placeholder="z. B. 500" value={f.kaution} onChange={(kaution) => set({ kaution })} error={errors.kaution} />
        <Field id={id("selbstbehalt")} label="Selbstbehalt" optional prefix="CHF" placeholder="z. B. 1000" value={f.selbstbehalt} onChange={(selbstbehalt) => set({ selbstbehalt })} error={errors.selbstbehalt} hint="Bei einem Schaden, gemäss deiner Versicherung." />
      </div>
      <div className="sm:max-w-xs">
        <Select id={id("deckung")} label="Versicherung" value={f.deckung} onChange={(deckung) => set({ deckung: deckung as "" | Coverage })} options={[["", "Bitte wählen"], ...(Object.entries(COVERAGE) as [string, string][])]} />
      </div>
    </>
  );

  if (!gewerbe) {
    return (
      <>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={id("preis")} label="Preis pro Tag" prefix="CHF" kind="numeric" placeholder="z. B. 75" value={f.preis} onChange={(preis) => set({ preis })} error={errors.preis} hint="Du bestimmst den Preis selbst und kannst ihn jederzeit ändern." />
        </div>
        {price >= 20 && price <= 1000 && (
          <p className="rounded-xl border border-line bg-white p-4 text-[0.95rem] text-ink/80">
            <span className="font-semibold text-forest">Zur Orientierung:</span> Bei vier vermieteten Tagen im Monat wären das {chf(price * 4)} – unverbindlich gerechnet, vor allfälligen Gebühren.
          </p>
        )}
        <MileageSettings value={f} onChange={set} errors={errors} idp={idp} />
        <Block title="Kaution und Versicherung" hint="Mietende sehen diese Angaben vor der Anfrage.">{shortFields}</Block>
      </>
    );
  }

  return (
    <>
      <fieldset>
        <legend className="text-xl font-bold">Wie möchtest du dieses Fahrzeug vermieten?</legend>
        <p className="mt-1 text-sm text-muted">Mehrfachauswahl möglich. Du kannst die Modelle später jederzeit ändern.</p>
        <div id={id("modelle")} tabIndex={-1} className={cn("mt-3 grid gap-3 outline-none", base && "sm:grid-cols-3")}>
          {OFFER_KINDS.map((k) => (
            <label key={k.id} className={cn("flex cursor-pointer gap-3 rounded-2xl bg-white p-4 ring-1 transition", on(k.id) ? "ring-2 ring-forest" : "ring-line hover:ring-forest/40")}>
              <input
                type="checkbox"
                className="check mt-0.5"
                checked={on(k.id)}
                onChange={() => set({ modelle: OFFER_KINDS.map((x) => x.id).filter((x) => (x === k.id ? !on(x) : f.modelle.includes(x))) })}
                aria-describedby={errors.modelle ? id("modelle-e") : undefined}
              />
              <span>
                <span className="block font-bold text-forest">{k.label}</span>
                <span className="text-sm text-ink/75">{k.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.modelle && <p id={id("modelle-e")} className="error-text">{errors.modelle}</p>}
      </fieldset>

      {on("kurzzeit") && (
        <Block title="Kurzzeitmiete" hint="Preis pro Tag, für Tage bis einige Wochen.">
          {base ? (
            <div className="sm:max-w-xs">
              <Field id={id("preis")} label="Preis pro Tag" prefix="CHF" kind="numeric" placeholder="z. B. 129" value={f.preis} onChange={(preis) => set({ preis })} error={errors.preis} />
            </div>
          ) : (
            <p className="text-sm text-muted">Tagespreis und Kilometer bearbeitest du direkt in der Flottenliste.</p>
          )}
          {base && (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Kilometer</h3>
              <MileageSettings value={f} onChange={set} errors={errors} idp={idp} heading={false} />
            </div>
          )}
          {shortFields}
        </Block>
      )}

      {on("langzeit") && (
        <Block title="Langzeitmiete" hint="Ab 28 Tagen, Preis pro Monat.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={id("lzPreis")} label="Monatspreis" prefix="CHF" placeholder="z. B. 1790" value={f.lzPreis} onChange={(lzPreis) => set({ lzPreis })} error={errors.lzPreis} />
            <Select id={id("lzMin")} label="Mindestmietdauer" value={f.lzMin} onChange={(lzMin) => set({ lzMin })} options={MONTH_OPTIONS} />
            <Field id={id("lzKm")} label="Kilometer pro Monat inklusive" suffix="km" kind="numeric" placeholder="z. B. 2000" value={f.lzKm} onChange={(lzKm) => set({ lzKm })} error={errors.lzKm} />
            <Field id={id("lzKmPreis")} label="Preis pro Mehrkilometer" prefix="CHF" suffix="pro km" placeholder="0.40" value={f.lzKmPreis} onChange={(lzKmPreis) => set({ lzKmPreis })} error={errors.lzKmPreis} />
            <Field id={id("lzKaution")} label="Kaution" optional prefix="CHF" placeholder="z. B. 1500" value={f.lzKaution} onChange={(lzKaution) => set({ lzKaution })} error={errors.lzKaution} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={id("lzKuendigung")} label="Kündigungsbedingungen" optional kind="text" placeholder="z. B. 30 Tage auf Monatsende" value={f.lzKuendigung} onChange={(lzKuendigung) => set({ lzKuendigung })} />
            <Field id={id("lzVerlaengerung")} label="Verlängerung" optional kind="text" placeholder="z. B. monatsweise verlängerbar" value={f.lzVerlaengerung} onChange={(lzVerlaengerung) => set({ lzVerlaengerung })} />
          </div>
        </Block>
      )}

      {on("abo") && (
        <Block title="Auto-Abo" hint="Fixer Monatspreis mit Laufzeit und Leistungen.">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field id={id("aboPreis")} label="Monatspreis" prefix="CHF" placeholder="z. B. 1590" value={f.aboPreis} onChange={(aboPreis) => set({ aboPreis })} error={errors.aboPreis} />
            <Field id={id("aboStart")} label="Startgebühr" optional prefix="CHF" placeholder="einmalig" value={f.aboStart} onChange={(aboStart) => set({ aboStart })} error={errors.aboStart} />
            <Field id={id("aboKaution")} label="Kaution" optional prefix="CHF" value={f.aboKaution} onChange={(aboKaution) => set({ aboKaution })} error={errors.aboKaution} />
          </div>
          <fieldset>
            <legend className="label">Mindestlaufzeit</legend>
            <div className="flex flex-wrap gap-2">
              {ABO_TERMS.map((t) => <Choice key={t} type="radio" name={id("aboMin")} checked={f.aboMin === String(t)} onChange={() => set({ aboMin: String(t) })}>{fmtMonths(t)}</Choice>)}
            </div>
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select id={id("aboFrist")} label="Kündigungsfrist" value={f.aboFrist} onChange={(aboFrist) => set({ aboFrist })} options={[["1", "1 Monat"], ["2", "2 Monate"], ["3", "3 Monate"]]} />
            <Field id={id("aboMax")} label="Maximale Laufzeit" optional suffix="Monate" kind="numeric" placeholder="z. B. 24" value={f.aboMax} onChange={(aboMax) => set({ aboMax })} error={errors.aboMax} />
          </div>
          <fieldset>
            <legend className="label">Kilometerpakete pro Monat</legend>
            <div id={id("aboPakete")} tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
              {ABO_KM_STEPS.map((km) => {
                const k = String(km), sel = f.aboPakete.includes(k);
                return <Choice key={k} name={id("pakete")} checked={sel} onChange={() => set({ aboPakete: sel ? f.aboPakete.filter((x) => x !== k) : [...f.aboPakete, k] })}>{fmtKm(km)}</Choice>;
              })}
            </div>
            {errors.aboPakete ? <p className="error-text">{errors.aboPakete}</p> : <p className="hint">Das kleinste Paket ist im Monatspreis enthalten. Für grössere Pakete legst du einen Aufpreis fest.</p>}
            {packs.length > 1 && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {packs.slice(1).map((k) => (
                  <Field key={k} id={id(`aufpreis-${k}`)} label={`Aufpreis für ${fmtKm(Number(k))}`} prefix="CHF" suffix="pro Monat" value={f.aboAufpreis[k] ?? ""} onChange={(v) => set({ aboAufpreis: { ...f.aboAufpreis, [k]: v } })} />
                ))}
              </div>
            )}
          </fieldset>
          <div className="sm:max-w-xs">
            <Field id={id("aboKmPreis")} label="Preis pro Mehrkilometer" prefix="CHF" suffix="pro km" placeholder="0.35" value={f.aboKmPreis} onChange={(aboKmPreis) => set({ aboKmPreis })} error={errors.aboKmPreis} />
          </div>
          <fieldset>
            <legend className="label">Im Abo enthalten</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(ABO_SERVICES) as [AboService, string][]).map(([k, l]) => (
                <Choice key={k} name={id("leistungen")} checked={f.aboLeistungen.includes(k)} onChange={() => set({ aboLeistungen: f.aboLeistungen.includes(k) ? f.aboLeistungen.filter((x) => x !== k) : [...f.aboLeistungen, k] })}>{l}</Choice>
              ))}
            </div>
          </fieldset>
          <Field id={id("aboText")} label="Weitere Leistungen" optional kind="text" placeholder="z. B. Reifenwechsel und Einlagerung" value={f.aboText} onChange={(aboText) => set({ aboText })} />
        </Block>
      )}

      {(on("kurzzeit") || on("langzeit")) && (
        <Block title="Preisstaffel" hint="Optional. Längere Mieten günstiger anbieten – rentanycar.ch wählt den passenden Preis automatisch nach Mietdauer.">
          <div className="divide-y divide-line rounded-2xl px-4 ring-1 ring-line">
            <Toggle checked={f.staffel} onChange={(staffel) => set({ staffel })} label="Preisstaffel verwenden" hint="Leere Stufen gelten nicht" />
          </div>
          {f.staffel && (
            <div id={id("staffel")} tabIndex={-1} className="grid gap-4 outline-none sm:grid-cols-2">
              {STAFFEL.filter((s) => (s.unit === "tage" ? on("kurzzeit") : on("langzeit"))).map((s) => (
                <Field key={s.key} id={id(s.key)} label={s.label} optional prefix="CHF" suffix={s.unit === "tage" ? "pro Tag" : "pro Monat"} value={f[s.key]} onChange={(v) => set({ [s.key]: v } as Partial<Full>)} />
              ))}
            </div>
          )}
          {errors.staffel && <p className="error-text">{errors.staffel}</p>}
        </Block>
      )}
    </>
  );
}

/** Kurze Übersicht der aktiven Modelle mit Preisen, z. B. für die Flottenliste */
const fromMonths = (n: number) => (n === 1 ? "ab 1 Monat" : `ab ${n} Monaten`);
export function offerSummary(o: Offers, dayPrice: number): string[] {
  const out = o.models.map((k) => {
    if (k === "kurzzeit") return `Kurzzeit ${chf(dayPrice)} pro Tag${o.short?.minDays && o.short.minDays > 1 ? `, ab ${o.short.minDays} Tagen` : ""}`;
    if (k === "langzeit") return `Langzeit ${chf(o.long?.monthly ?? 0)} pro Monat, ${fromMonths(o.long?.minMonths ?? 1)}`;
    const p = o.abo?.packages ?? [];
    const km = p.length ? `, ${fmtKm(p[0].km)}${p.length > 1 ? ` bis ${fmtKm(p[p.length - 1].km)}` : ""}` : "";
    return `Auto-Abo ${chf(o.abo?.monthly ?? 0)} pro Monat, ${fromMonths(o.abo?.minMonths ?? 1)}${km}`;
  });
  if (o.tiers?.length) out.push("mit Preisstaffel");
  return out;
}

const NO_OFFERS: Record<string, OfferForm> = {};

/** Mietmodelle eines Fahrzeugs der Flotte bearbeiten, aktivieren oder deaktivieren */
export function OfferEditButton({ id, title, initial }: { id: string; title: string; initial: OfferForm }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useStore("rac:offers", NO_OFFERS);
  const [form, setForm] = useState<Full>({ ...MILEAGE_FORM_DEFAULT, preis: "", ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const idp = `mm-${id}`;
  useEffect(() => {
    if (isOpen) dialog.current?.showModal();
  }, [isOpen]);
  const close = () => dialog.current?.close();
  function open() {
    setForm({ ...MILEAGE_FORM_DEFAULT, preis: "", ...(saved[id] ?? initial) });
    setErrors({});
    setDone(false);
    setIsOpen(true);
  }
  function save() {
    const e = validateOffers(form, true, false);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => document.getElementById(`${idp}-${Object.keys(e)[0]}`)?.focus());
      return;
    }
    setSaved((s) => ({ ...s, [id]: pickOffers(form) }));
    setDone(true);
  }
  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm px-3" onClick={open} aria-label={`Mietmodelle von ${title}`}>
        <Layers className="size-4" aria-hidden />
        <span className="xl:sr-only">Mietmodelle</span>
      </button>
      {isOpen && (
        <dialog ref={dialog} className="modal" aria-labelledby={`${idp}-titel`} onClose={() => setIsOpen(false)} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 id={`${idp}-titel`} className="text-xl font-bold">Mietmodelle</h2>
                <p className="text-sm text-muted">{title}</p>
              </div>
              <button type="button" className="icon-btn -mr-2" aria-label="Dialog schliessen" onClick={close}><X className="size-6" aria-hidden /></button>
            </div>
            <div className="grid flex-1 gap-6 overflow-y-auto px-5 py-5 sm:px-6">
              {done ? (
                <p className="rounded-xl bg-leaf-50 p-4 font-semibold text-forest ring-1 ring-leaf-200" role="status">Gespeichert. Die Änderungen gelten für neue Buchungen, bestehende Buchungen behalten ihre Konditionen.</p>
              ) : (
                <OfferSettings
                  value={form}
                  onChange={(patch) => {
                    setErrors((e) => { const n = { ...e }; Object.keys(patch).forEach((k) => delete n[k]); return n; });
                    setForm((x) => ({ ...x, ...patch }));
                  }}
                  errors={errors}
                  idp={idp}
                  gewerbe
                  base={false}
                />
              )}
            </div>
            <div className="flex gap-3 border-t border-line px-5 py-4 sm:px-6">
              {done ? (
                <button type="button" className="btn btn-primary flex-1" onClick={close}>Schliessen</button>
              ) : (
                <>
                  <button type="button" className="btn btn-outline" onClick={close}>Abbrechen</button>
                  <button type="button" className="btn btn-primary flex-1" onClick={save}>Speichern</button>
                </>
              )}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
