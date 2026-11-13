"use client";
import { useEffect, useRef, useState } from "react";
import { Gauge, X } from "lucide-react";
import { chf } from "@/lib/format";
import { PER_DAY_OPTIONS, fmtKm, formToPolicy, overagePriceOf, unlimitedLabel, validateMileage, type MileageForm } from "@/lib/mileage";
import { useStore } from "@/lib/store";
import { Choice, Toggle } from "@/components/ui/Choice";
import { cn } from "@/lib/cn";

function Money({ id, value, onChange, invalid, describedBy, suffix = "pro km", placeholder }: { id: string; value: string; onChange: (v: string) => void; invalid: boolean; describedBy?: string; suffix?: string; placeholder: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-muted">CHF</span>
      <input id={id} inputMode="decimal" className="field max-w-[8.5rem]" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))} aria-invalid={invalid} aria-describedby={describedBy} />
      <span className="text-muted">{suffix}</span>
    </div>
  );
}

/** Bereich «Kilometer» für Vermietende. Fehler-IDs folgen dem Muster `${idp}-${feld}`. */
export function MileageSettings({ value: f, onChange, errors, idp, heading = true }: { value: MileageForm; onChange: (p: Partial<MileageForm>) => void; errors: Record<string, string>; idp: string; heading?: boolean }) {
  const [other, setOther] = useState(!PER_DAY_OPTIONS.map(String).includes(f.kmTag));
  const err = (k: string) => errors[k] && <p id={`${idp}-${k}-e`} className="error-text">{errors[k]}</p>;
  const desc = (k: string, hint?: string) => (errors[k] ? `${idp}-${k}-e` : hint);
  const ok = Object.keys(validateMileage(f)).length === 0;
  const p = formToPolicy(f);
  return (
    <section aria-labelledby={heading ? `${idp}-km-titel` : undefined} aria-label={heading ? undefined : "Kilometer"} className={cn("grid gap-6", heading && "rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5")}>
      {heading && (
        <div>
          <h2 id={`${idp}-km-titel`} className="flex items-center gap-2 text-xl font-bold"><Gauge className="size-5 text-leaf-700" aria-hidden />Kilometer</h2>
          <p className="mt-1 text-sm text-muted">Du legst die Bedingungen fest. rentanycar.ch rechnet, zeigt sie in der Buchung und dokumentiert die Kilometerstände.</p>
        </div>
      )}
      <fieldset>
        <legend className="label">Inklusive Kilometer pro Tag</legend>
        <div id={`${idp}-kmTag`} tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
          {PER_DAY_OPTIONS.map((n) => (
            <Choice key={n} type="radio" name={`${idp}-kmtag`} checked={!other && f.kmTag === String(n)} onChange={() => { setOther(false); onChange({ kmTag: String(n) }); }}>
              {n} km
            </Choice>
          ))}
          <Choice type="radio" name={`${idp}-kmtag`} checked={other} onChange={() => { setOther(true); onChange({ kmTag: "" }); }}>Andere</Choice>
        </div>
        {other && (
          <div className="mt-3">
            <label htmlFor={`${idp}-kmTag-eigen`} className="label">Eigene Anzahl pro Tag</label>
            <div className="flex items-center gap-2.5">
              <input id={`${idp}-kmTag-eigen`} inputMode="numeric" className="field max-w-[8.5rem]" placeholder="z. B. 180" value={f.kmTag} onChange={(e) => onChange({ kmTag: e.target.value.replace(/\D/g, "") })} aria-invalid={!!errors.kmTag} aria-describedby={desc("kmTag")} />
              <span className="text-muted">km</span>
            </div>
          </div>
        )}
        {errors.kmTag ? err("kmTag") : <p className="hint">Mietende sehen die Kilometer für ihre Mietdauer: Kilometer pro Tag × Miettage.</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idp}-kmPreis`} className="label">Preis pro zusätzlichem Kilometer</label>
          <Money id={`${idp}-kmPreis`} value={f.kmPreis} onChange={(kmPreis) => onChange({ kmPreis })} invalid={!!errors.kmPreis} describedBy={desc("kmPreis", `${idp}-kmPreis-h`)} placeholder="0.30" />
          {errors.kmPreis ? err("kmPreis") : <p id={`${idp}-kmPreis-h`} className="hint">{f.kmUeberAktiv ? "Gilt für Zusatzkilometer, die vorab gebucht werden." : "Gilt vorab und für Mehrkilometer nach der Rückgabe."}</p>}
        </div>
        {f.kmUeberAktiv && (
          <div>
            <label htmlFor={`${idp}-kmUeber`} className="label">Preis bei Überschreitung</label>
            <Money id={`${idp}-kmUeber`} value={f.kmUeber} onChange={(kmUeber) => onChange({ kmUeber })} invalid={!!errors.kmUeber} describedBy={desc("kmUeber", `${idp}-kmUeber-h`)} placeholder="0.40" />
            {errors.kmUeber ? err("kmUeber") : <p id={`${idp}-kmUeber-h`} className="hint">Für Mehrkilometer, die erst nach der Rückgabe festgestellt werden.</p>}
          </div>
        )}
      </div>

      <div className="divide-y divide-line rounded-2xl bg-white px-4 ring-1 ring-line">
        <Toggle checked={f.kmUeberAktiv} onChange={(kmUeberAktiv) => onChange({ kmUeberAktiv })} label="Anderer Preis bei Überschreitung" hint="Wer vorab bucht, fährt günstiger" />
        <Toggle checked={f.kmUnlimited} onChange={(kmUnlimited) => onChange({ kmUnlimited })} label="Unbegrenzte Kilometer anbieten" hint="Als Paket gegen Aufpreis" />
      </div>

      {f.kmUnlimited && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${idp}-kmUnlimitedPreis`} className="label">Preis Unlimited-Paket</label>
            <Money id={`${idp}-kmUnlimitedPreis`} value={f.kmUnlimitedPreis} onChange={(kmUnlimitedPreis) => onChange({ kmUnlimitedPreis })} invalid={!!errors.kmUnlimitedPreis} describedBy={desc("kmUnlimitedPreis")} suffix="" placeholder="25" />
            {err("kmUnlimitedPreis")}
            <fieldset className="mt-3">
              <legend className="sr-only">Berechnung des Unlimited-Pakets</legend>
              <div className="flex flex-wrap gap-2">
                <Choice type="radio" name={`${idp}-kmUnlimitedPro`} checked={f.kmUnlimitedPro === "tag"} onChange={() => onChange({ kmUnlimitedPro: "tag" })}>pro Miettag</Choice>
                <Choice type="radio" name={`${idp}-kmUnlimitedPro`} checked={f.kmUnlimitedPro === "buchung"} onChange={() => onChange({ kmUnlimitedPro: "buchung" })}>pro Buchung</Choice>
              </div>
            </fieldset>
          </div>
          <div>
            <label htmlFor={`${idp}-kmFairUse`} className="label">Fair-Use-Grenze <span className="font-medium text-muted">(optional)</span></label>
            <div className="flex items-center gap-2.5">
              <input id={`${idp}-kmFairUse`} inputMode="numeric" className="field max-w-[8.5rem]" placeholder="z. B. 3000" value={f.kmFairUse} onChange={(e) => onChange({ kmFairUse: e.target.value.replace(/\D/g, "") })} aria-invalid={!!errors.kmFairUse} aria-describedby={desc("kmFairUse", `${idp}-kmFairUse-h`)} />
              <span className="text-muted">km pro Buchung</span>
            </div>
            {errors.kmFairUse ? err("kmFairUse") : <p id={`${idp}-kmFairUse-h`} className="hint">Darüber gilt der Preis bei Überschreitung.</p>}
          </div>
        </div>
      )}

      <div>
        <label htmlFor={`${idp}-kmMax`} className="label">Maximale Kilometer pro Buchung <span className="font-medium text-muted">(optional)</span></label>
        <div className="flex items-center gap-2.5">
          <input id={`${idp}-kmMax`} inputMode="numeric" className="field max-w-[8.5rem]" placeholder="z. B. 1500" value={f.kmMax} onChange={(e) => onChange({ kmMax: e.target.value.replace(/\D/g, "") })} aria-invalid={!!errors.kmMax} aria-describedby={desc("kmMax", `${idp}-kmMax-h`)} />
          <span className="text-muted">km</span>
        </div>
        {errors.kmMax ? err("kmMax") : <p id={`${idp}-kmMax-h`} className="hint">Leer lassen, wenn es keine Obergrenze gibt.</p>}
      </div>

      {ok && (
        <p className="rounded-xl bg-leaf-50 px-4 py-3 text-sm text-ink/85 ring-1 ring-leaf-200">
          <span className="font-semibold text-forest">So sehen es Mietende: </span>
          {fmtKm(p.perDay)} pro Tag inklusive · Zusatzkilometer {chf(p.extraPrice)} pro km
          {overagePriceOf(p) !== p.extraPrice && `, bei Überschreitung ${chf(overagePriceOf(p))}`}
          {p.unlimited && ` · Unlimited-Paket ${unlimitedLabel(p.unlimited)}`}
          {p.maxKm && ` · höchstens ${fmtKm(p.maxKm)} pro Buchung`}
        </p>
      )}
    </section>
  );
}

const NO_SETTINGS: Record<string, MileageForm> = {};

/** Kilometer eines bestehenden Inserats bearbeiten */
export function MileageEditButton({ id, title, initial, compact = false }: { id: string; title: string; initial: MileageForm; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saved, setSaved] = useStore("rac:km-settings", NO_SETTINGS);
  const [form, setForm] = useState<MileageForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const idp = `km-${id}`;
  const current = saved[id] ?? initial;
  function openEditor() {
    setForm(current);
    setErrors({});
    setDone(false);
    setIsOpen(true);
  }
  // Der Dialog existiert nur, solange er offen ist – so gibt es keine doppelten IDs, wenn der Knopf in Tabelle und Karte vorkommt
  useEffect(() => {
    if (isOpen) dialog.current?.showModal();
  }, [isOpen]);
  function saveForm() {
    const e = validateMileage(form);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => document.getElementById(`${idp}-${Object.keys(e)[0]}`)?.focus());
      return;
    }
    setSaved((s) => ({ ...s, [id]: form }));
    setDone(true);
  }
  const close = () => dialog.current?.close();
  const p = formToPolicy(current);
  return (
    <>
      <button type="button" className={compact ? "btn btn-ghost btn-sm px-3" : "btn btn-outline btn-sm"} onClick={openEditor} aria-label={compact ? `Kilometer von ${title}` : undefined} title={compact ? `${fmtKm(p.perDay)} pro Tag, ${chf(p.extraPrice)} pro Zusatzkilometer` : undefined}>
        <Gauge className="size-4" aria-hidden />
        <span className={compact ? "xl:sr-only" : undefined}>Kilometer</span>
      </button>
      {isOpen && (
        <dialog ref={dialog} className="modal" aria-labelledby={`${idp}-dialog`} onClose={() => setIsOpen(false)} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 id={`${idp}-dialog`} className="text-xl font-bold">Kilometer</h2>
                <p className="text-sm text-muted">{title}</p>
              </div>
              <button type="button" className="icon-btn -mr-2" aria-label="Dialog schliessen" onClick={close}><X className="size-6" aria-hidden /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {done ? (
                <p className="rounded-xl bg-leaf-50 p-4 font-semibold text-forest ring-1 ring-leaf-200" role="status">Gespeichert. Die neuen Bedingungen gelten für neue Buchungen, bestehende Buchungen behalten ihre Bedingungen.</p>
              ) : (
                <MileageSettings
                  value={form}
                  onChange={(patch) => {
                    setErrors((e) => { const n = { ...e }; Object.keys(patch).forEach((k) => delete n[k]); return n; });
                    setForm((x) => ({ ...x, ...patch }));
                  }}
                  errors={errors}
                  idp={idp}
                  heading={false}
                />
              )}
            </div>
            <div className="flex gap-3 border-t border-line px-5 py-4 sm:px-6">
              {done ? (
                <button type="button" className="btn btn-primary flex-1" onClick={close}>Schliessen</button>
              ) : (
                <>
                  <button type="button" className="btn btn-outline" onClick={close}>Abbrechen</button>
                  <button type="button" className="btn btn-primary flex-1" onClick={saveForm}>Speichern</button>
                </>
              )}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
