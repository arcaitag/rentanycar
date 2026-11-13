"use client";
import { useRef, useState } from "react";
import { Camera, ChevronDown, Gauge, ImagePlus, Plus, X } from "lucide-react";
import type { BookingRecord } from "@/data/account";
import { chf, fmtDate, fmtTime } from "@/lib/format";
import { EXTRA_PACKAGES, chargeFor, extraRoom, fmtKm, round05, settle, topUpCost, topUpKm, type KmLog, type OdometerReading } from "@/lib/mileage";
import { useSession, useStore } from "@/lib/store";
import { Choice } from "@/components/ui/Choice";
import { KmSummary } from "./MileagePicker";

const NO_LOGS: Record<string, KmLog> = {};
const DAY = 864e5;
const when = (iso: string) => `${fmtDate(new Date(iso))}, ${fmtTime(new Date(iso))}`;
/** Stand der Mehrkilometer-Abrechnung – den Status setzt vorerst der Admin */
const CHARGE_NOTE = {
  offen: "Offen. Wird später automatisch über das hinterlegte Zahlungsmittel oder die Kaution abgerechnet. In dieser Vorschau wird nichts belastet.",
  bezahlt: "Bezahlt.",
  kaution: "Über die Kaution verrechnet.",
} as const;

/** Kilometer einer Buchung – für Mietende und Vermietende mit denselben Angaben */
export function BookingKmPanel({ b, role }: { b: BookingRecord; role: "mieter" | "vermieter" }) {
  const k = b.km!;
  const [logs, setLogs] = useStore("rac:km", NO_LOGS);
  const [session] = useSession();
  const [pkg, setPkg] = useState<number>();
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"pickup" | "dropoff">("pickup");
  const dialog = useRef<HTMLDialogElement>(null);
  const log: KmLog = { ...b.log, ...logs[b.id] };
  const s = settle(k, log);
  const added = topUpKm(log);
  const room = extraRoom(k, added);
  const now = Date.now(), from = new Date(b.from).getTime(), to = new Date(b.to).getTime();
  const confirmed = b.status === "bestaetigt";
  const canPickup = confirmed && !log.pickup && now >= from - DAY;
  const canDropoff = confirmed && !!log.pickup && !log.dropoff;
  const canTopUp = role === "mieter" && confirmed && !k.unlimited && !log.dropoff && now < to;
  // Laufende Mieten starten aufgeklappt; danach bestimmt nur noch die Person, ob der Bereich offen ist
  const [startOpen] = useState(() => !!log.pickup && !log.dropoff);
  const save = (patch: KmLog) => setLogs((l) => ({ ...l, [b.id]: { ...l[b.id], ...patch } }));

  const me = session?.company ?? session?.name ?? "";
  function record(value: number, photo: string) {
    const r: OdometerReading = { km: value, at: new Date().toISOString(), photo, bookingId: b.id, renter: role === "mieter" ? me : b.counterpart, host: role === "mieter" ? b.counterpart : me, by: role };
    if (kind === "pickup") return save({ pickup: r });
    const charge = chargeFor(k, { ...log, dropoff: r });
    save({ dropoff: r, ...(charge ? { charge } : {}) });
  }
  function topUp() {
    if (!pkg) return;
    const t = { km: pkg, cost: round05(pkg * k.extraPrice), at: new Date().toISOString() };
    save({ topUps: [...(log.topUps ?? []), t] });
    setNote(`+${fmtKm(pkg)} hinzugefügt für ${chf(t.cost)}.`);
    setPkg(undefined);
  }
  const open = (x: "pickup" | "dropoff") => {
    setKind(x);
    dialog.current?.showModal();
  };

  const summary = s
    ? s.over ? `${fmtKm(s.over)} Mehrkilometer, ${chf(s.cost)}${log.charge?.status === "bezahlt" ? ", bezahlt" : log.charge?.status === "kaution" ? ", über Kaution" : ""}` : `${fmtKm(s.driven)} gefahren, keine Mehrkilometer`
    : log.pickup ? `Übergabe bei ${fmtKm(log.pickup.km)}`
    : k.unlimited ? "Unbegrenzte Kilometer"
    : `${fmtKm(k.included + k.extra + added)} verfügbar`;
  const pickupHint = b.status === "angefragt" ? "Möglich, sobald die Buchung bestätigt ist." : confirmed ? "Möglich ab 24 Stunden vor Mietbeginn." : "Nicht erfasst.";

  return (
    <details className="group mt-4 border-t border-line pt-2" open={startOpen}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-lg [&::-webkit-details-marker]:hidden">
        <Gauge className="size-5 shrink-0 text-leaf-700" aria-hidden />
        <span className="font-bold text-forest">Kilometer</span>
        <span className="min-w-0 flex-1 text-sm text-ink/75">{summary}</span>
        <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="mt-3 grid gap-5 md:grid-cols-2">
        <div>
          <p className="label">Gebucht</p>
          <KmSummary k={k} topUp={added} topUpCost={topUpCost(log)} />
        </div>
        <div className="grid content-start gap-2.5">
          <p className="label mb-0">Kilometerstand</p>
          <ReadingRow title="Übergabe" r={log.pickup} hint={pickupHint} onAdd={canPickup ? () => open("pickup") : undefined} />
          <ReadingRow title="Rückgabe" r={log.dropoff} hint={log.pickup ? "Noch nicht erfasst." : "Nach der Übergabe möglich."} onAdd={canDropoff ? () => open("dropoff") : undefined} />
          {s && (
            <div className="rounded-xl bg-leaf-50 p-3.5 ring-1 ring-leaf-200">
              <dl className="grid gap-1 text-[0.95rem]">
                <div className="flex justify-between gap-4"><dt className="text-muted">Gefahren</dt><dd className="font-semibold">{fmtKm(s.driven)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">Gebucht</dt><dd className="font-semibold">{s.allowed === null ? "unbegrenzt" : fmtKm(s.allowed)}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-muted">Mehrkilometer</dt><dd className="font-semibold">{s.over ? `${fmtKm(s.over)} × ${chf(s.price)}` : "keine"}</dd></div>
                <div className="mt-1 flex justify-between gap-4 border-t border-leaf-200 pt-2 font-bold text-forest"><dt>Zusätzliche Kilometerkosten</dt><dd>{chf(s.cost)}</dd></div>
              </dl>
              {s.cost > 0 && <p className="mt-1.5 text-sm text-ink/75">{CHARGE_NOTE[log.charge?.status ?? "offen"]}</p>}
            </div>
          )}
        </div>
      </div>
      {canTopUp && (
        <div className="mt-5 rounded-xl p-3.5 ring-1 ring-line">
          <fieldset>
            <legend className="font-bold text-forest">Kilometer hinzufügen</legend>
            <p className="text-sm text-ink/75">Bis zum Mietende am {when(b.to)}, zum Vorabpreis von {chf(k.extraPrice)} pro km.</p>
            {room > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {EXTRA_PACKAGES.filter((n) => n <= room).map((n) => (
                  <Choice key={n} type="radio" name={`${b.id}-nachbuchen`} checked={pkg === n} onChange={() => setPkg(n)}>+{fmtKm(n)} · {chf(n * k.extraPrice)}</Choice>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm">Das Maximum von {fmtKm(k.maxKm!)} pro Buchung ist erreicht.</p>
            )}
          </fieldset>
          {room > 0 && <button type="button" className="btn btn-outline btn-sm mt-3" disabled={!pkg} onClick={topUp}><Plus className="size-4" aria-hidden />Hinzufügen</button>}
          <p className="mt-2 text-sm font-semibold text-leaf-700" aria-live="polite">{note}</p>
        </div>
      )}
      <ReadingDialog dialog={dialog} id={`km-${b.id}`} kind={kind} min={kind === "dropoff" ? log.pickup?.km : undefined} onSave={record} />
    </details>
  );
}

function ReadingRow({ title, r, hint, onAdd }: { title: string; r?: OdometerReading; hint: string; onAdd?: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 ring-1 ring-line">
      <div className="min-w-0">
        <p className="text-sm text-muted">{title}</p>
        {r ? (
          <>
            <p className="font-bold text-forest">{fmtKm(r.km)}</p>
            <p className="text-xs text-muted">{when(r.at)} · Foto: {r.photo}</p>
          </>
        ) : (
          <p className="text-sm text-ink/80">{hint}</p>
        )}
      </div>
      {onAdd && <button type="button" className="btn btn-primary btn-sm" onClick={onAdd}><Camera className="size-4" aria-hidden />{title} erfassen</button>}
    </div>
  );
}

/** Kilometerstand mit Tachofoto erfassen. Datum und Uhrzeit werden automatisch gespeichert. */
function ReadingDialog({ dialog, id, kind, min, onSave }: { dialog: React.RefObject<HTMLDialogElement | null>; id: string; kind: "pickup" | "dropoff"; min?: number; onSave: (km: number, photo: string) => void }) {
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [tried, setTried] = useState(false);
  const title = kind === "pickup" ? "Übergabe" : "Rückgabe";
  const raw = value.replace(/[’' ]/g, "");
  const km = Number(raw);
  const kmErr = !/^\d+$/.test(raw)
    ? "Bitte gib den Kilometerstand als ganze Zahl ein."
    : km > 2000000
      ? "Bitte prüfe den Kilometerstand."
      : min !== undefined && km < min
        ? `Der Stand muss mindestens ${fmtKm(min)} betragen – so viel zeigte der Tacho bei der Übergabe.`
        : "";
  const photoErr = file ? "" : "Bitte füge ein Foto des Tachostands hinzu.";
  const close = () => dialog.current?.close();
  const reset = () => {
    setValue("");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    setTried(false);
  };
  function submit() {
    if (kmErr || photoErr) {
      setTried(true);
      document.getElementById(kmErr ? `${id}-stand` : `${id}-foto`)?.focus();
      return;
    }
    onSave(km, file!.name);
    close();
  }
  return (
    <dialog ref={dialog} className="modal" aria-labelledby={`${id}-titel`} onClose={reset} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 id={`${id}-titel`} className="text-xl font-bold">Kilometerstand bei {title === "Übergabe" ? "der Übergabe" : "der Rückgabe"}</h2>
          <button type="button" className="icon-btn -mr-2" aria-label="Dialog schliessen" onClick={close}><X className="size-6" aria-hidden /></button>
        </div>
        <div className="grid flex-1 gap-5 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-ink/80">Lest den Tacho gemeinsam ab. Datum und Uhrzeit speichert rentanycar.ch automatisch mit der Buchung.</p>
          <div>
            <label htmlFor={`${id}-stand`} className="label">Kilometerstand</label>
            <div className="flex items-center gap-2.5">
              <input id={`${id}-stand`} inputMode="numeric" className="field max-w-[11rem]" placeholder="z. B. 47’320" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d’' ]/g, ""))} aria-invalid={tried && !!kmErr} aria-describedby={tried && kmErr ? `${id}-stand-e` : undefined} />
              <span className="text-muted">km</span>
            </div>
            {tried && kmErr && <p id={`${id}-stand-e`} className="error-text">{kmErr}</p>}
          </div>
          <div>
            <p className="label">Foto des Tachostands</p>
            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-leaf-300 bg-leaf-50 p-4 transition hover:bg-leaf-100 has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid">
              {preview ? <img src={preview} alt="Vorschau des Tachofotos" className="size-16 shrink-0 rounded-lg object-cover" /> : <ImagePlus className="size-8 shrink-0 text-leaf-700" aria-hidden />}
              <span className="min-w-0">
                <span className="block font-bold text-forest">{file ? "Anderes Foto wählen" : "Foto aufnehmen oder auswählen"}</span>
                <span className="block truncate text-sm text-muted">{file ? file.name : "Pflicht. In dieser Vorschau bleibt das Foto auf deinem Gerät."}</span>
              </span>
              <input
                id={`${id}-foto`}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                aria-invalid={tried && !!photoErr}
                aria-describedby={tried && photoErr ? `${id}-foto-e` : undefined}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (preview) URL.revokeObjectURL(preview);
                  setFile(f);
                  setPreview(f ? URL.createObjectURL(f) : "");
                }}
              />
            </label>
            {tried && photoErr && <p id={`${id}-foto-e`} className="error-text">{photoErr}</p>}
          </div>
        </div>
        <div className="flex gap-3 border-t border-line px-5 py-4 sm:px-6">
          <button type="button" className="btn btn-outline" onClick={close}>Abbrechen</button>
          <button type="button" className="btn btn-primary flex-1" onClick={submit}>Speichern</button>
        </div>
      </div>
    </dialog>
  );
}
