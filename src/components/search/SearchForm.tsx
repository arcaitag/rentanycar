"use client";
import { useEffect, useId, useState } from "react";
import { LocateFixed, MapPin, Search } from "lucide-react";
import { PLACES, nearestPlace } from "@/data/places";
import { addDays, parseLocal, toDateInput } from "@/lib/format";
import { DatePicker, slotFrom } from "@/components/ui/DatePicker";
import { cn } from "@/lib/cn";

export interface SearchValues {
  ort: string;
  fd: string;
  ft: string;
  td: string;
  tt: string;
}

/** Ein Feld für Datum und Uhrzeit: nach dem Klick auf einen Tag erscheint die Uhrzeit */
function DateTime({ legend, date, time, min, minTime, onDate, onTime, onClear }: { legend: string; date: string; time: string; min?: string; minTime?: string; onDate: (v: string) => void; onTime: (v: string) => void; onClear?: () => void }) {
  return (
    <div className="min-w-0">
      <p className="label">{legend}</p>
      <DatePicker label={legend} value={date} time={time} min={min} minTime={minTime} onChange={onDate} onTime={onTime} onClear={onClear} />
    </div>
  );
}

/** Suche nach Ort und Zeitraum – auf der Startseite und auf /autos. */
export function SearchForm({
  initial,
  onSearch,
  top,
  autoDates = true,
  className,
}: {
  initial?: Partial<SearchValues>;
  onSearch: (v: SearchValues) => void;
  top?: React.ReactNode;
  autoDates?: boolean;
  className?: string;
}) {
  const id = useId();
  const [v, setV] = useState<SearchValues>({ ort: "", fd: "", ft: "10:00", td: "", tt: "10:00", ...initial });
  const [today, setToday] = useState<string>();
  // Früheste Abholzeit heute (nächste halbe Stunde)
  const [nowSlot, setNowSlot] = useState<string>();
  const [error, setError] = useState("");
  const [geo, setGeo] = useState("");
  useEffect(() => {
    const now = new Date();
    setToday(toDateInput(now));
    setNowSlot(slotFrom(now.toTimeString().slice(0, 5)));
    if (autoDates) setV((x) => (x.fd ? x : { ...x, fd: toDateInput(addDays(now, 1)), td: toDateInput(addDays(now, 3)) }));
  }, [autoDates]);
  const set = (patch: Partial<SearchValues>) => {
    setError("");
    setV((x) => ({ ...x, ...patch }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!!v.fd !== !!v.td) return setError("Bitte wähle sowohl Abholung als auch Rückgabe – oder lass beide leer.");
    if (v.fd && v.td) {
      const a = new Date(`${v.fd}T${v.ft || "10:00"}`), b = new Date(`${v.td}T${v.tt || "10:00"}`);
      if (a.getTime() < Date.now() - 36e5) return setError("Die Abholung liegt in der Vergangenheit. Bitte wähle ein späteres Datum.");
      if (b <= a) return setError("Die Rückgabe muss nach der Abholung liegen.");
    }
    onSearch(v);
  }

  function locate() {
    setGeo("");
    if (!navigator.geolocation) return setGeo("Dein Browser kann den Standort nicht ermitteln. Bitte gib Ort oder PLZ ein.");
    navigator.geolocation.getCurrentPosition(
      (p) => set({ ort: nearestPlace(p.coords.latitude, p.coords.longitude).name }),
      () => setGeo("Standort nicht freigegeben. Bitte gib Ort oder PLZ ein."),
      { timeout: 8000 },
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Auto suchen" className={cn("rounded-[1.5rem] bg-white p-3 ring-1 ring-line sm:p-4", className)}>
      {top}
      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
        <div className="min-w-0">
          <label htmlFor={`${id}-ort`} className="label">Ort, Adresse oder PLZ</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-leaf-700" aria-hidden />
            <input
              id={`${id}-ort`}
              className="field pr-12 pl-11"
              list={`${id}-orte`}
              placeholder="z. B. Bern oder 3011"
              autoComplete="off"
              value={v.ort}
              onChange={(e) => set({ ort: e.target.value })}
            />
            <button type="button" onClick={locate} className="icon-btn absolute top-0.5 right-0.5" aria-label="Meinen Standort verwenden" title="Meinen Standort verwenden">
              <LocateFixed className="size-5" aria-hidden />
            </button>
            <datalist id={`${id}-orte`}>
              {PLACES.map((p) => <option key={p.name} value={p.name} />)}
            </datalist>
          </div>
        </div>
        <DateTime legend="Abholung" date={v.fd} time={v.ft} min={today} minTime={nowSlot} onDate={(fd) => set({ fd, td: v.td && v.td <= fd ? toDateInput(addDays(parseLocal(fd)!, 1)) : v.td })} onTime={(ft) => set({ ft })} onClear={autoDates ? undefined : () => set({ fd: "" })} />
        <DateTime legend="Rückgabe" date={v.td} time={v.tt} min={v.fd || today} minTime={v.fd ? slotFrom(v.ft || "10:00", 30) : undefined} onDate={(td) => set({ td })} onTime={(tt) => set({ tt })} onClear={autoDates ? undefined : () => set({ td: "" })} />
        <button type="submit" className="btn btn-primary min-h-12 lg:px-7">
          <Search className="size-5" aria-hidden />
          Auto finden
        </button>
      </div>
      <div aria-live="polite">
        {(error || geo) && <p className="error-text">{error || geo}</p>}
      </div>
    </form>
  );
}
