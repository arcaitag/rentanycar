"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { List, Map as MapIcon, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { categoryLabel } from "@/data/vehicles";
import { PRICE_CEIL, applyCriteria, activeFilterCount, parseCriteria, serializeCriteria, type Criteria, type SortKey } from "@/lib/search";
import { availabilityOf } from "@/lib/availability";
import { quote, rentalDays } from "@/lib/pricing";
import { DURATIONS, dayPrice, hasModel } from "@/lib/offers";
import { chf, fmtDate, fmtTime, startOfDay } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ProviderToggle } from "@/components/ui/ProviderToggle";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { EmptyArt } from "@/components/illustrations/Misc";
import { SearchForm } from "./SearchForm";
import { FilterPanel } from "./FilterPanel";
import { MapView } from "./MapView";

const SORT_LABELS: Record<SortKey, string> = { empfohlen: "Empfohlen", "preis-auf": "Preis aufsteigend", "preis-ab": "Preis absteigend", bewertung: "Beste Bewertung", entfernung: "Entfernung" };
const NO_FILTERS: Partial<Criteria> = { anbieter: "alle", preisMin: 0, preisMax: PRICE_CEIL, kategorien: [], marke: "", getriebe: "", antrieb: [], sitze: 0, sofort: false, kontaktlos: false, umkreis: 0 };

/** Aktive Filter als entfernbare Chips. */
function chipsOf(c: Criteria, hasPlace: boolean) {
  const out: { key: string; label: string; clear: Partial<Criteria> }[] = [];
  if (c.anbieter !== "alle") out.push({ key: "anbieter", label: c.anbieter === "privat" ? "Private Anbieter" : "Gewerbliche Anbieter", clear: { anbieter: "alle" } });
  if (c.preisMin > 0 || c.preisMax < PRICE_CEIL) out.push({ key: "preis", label: `${chf(c.preisMin)} bis ${c.preisMax >= PRICE_CEIL ? `${chf(PRICE_CEIL)}+` : chf(c.preisMax)}`, clear: { preisMin: 0, preisMax: PRICE_CEIL } });
  c.kategorien.forEach((k) => out.push({ key: `k-${k}`, label: categoryLabel(k), clear: { kategorien: c.kategorien.filter((x) => x !== k) } }));
  if (c.sofort) out.push({ key: "sofort", label: "Heute verfügbar", clear: { sofort: false } });
  if (c.kontaktlos) out.push({ key: "kontaktlos", label: "Kontaktlose Übergabe", clear: { kontaktlos: false } });
  if (c.umkreis && hasPlace) out.push({ key: "umkreis", label: `bis ${c.umkreis} km`, clear: { umkreis: 0 } });
  if (c.getriebe) out.push({ key: "getriebe", label: c.getriebe === "automatik" ? "Automatik" : "Manuell", clear: { getriebe: "" } });
  c.antrieb.forEach((f) => out.push({ key: `a-${f}`, label: f, clear: { antrieb: c.antrieb.filter((x) => x !== f) } }));
  if (c.sitze) out.push({ key: "sitze", label: `ab ${c.sitze} Plätze`, clear: { sitze: 0 } });
  if (c.marke) out.push({ key: "marke", label: c.marke, clear: { marke: "" } });
  return out;
}

/** Kurzer Zeitraum für die Suchzeile: «13.–15.10.», «30.10.–2.11.» oder «13.10., 10:00–18:00» */
function shortRange(a: Date, b: Date) {
  const dm = (x: Date) => `${x.getDate()}.${x.getMonth() + 1}.`;
  if (a.getFullYear() !== b.getFullYear()) return `${dm(a)}${a.getFullYear()}–${dm(b)}${b.getFullYear()}`;
  if (a.getMonth() !== b.getMonth()) return `${dm(a)}–${dm(b)}`;
  if (a.getDate() !== b.getDate()) return `${a.getDate()}.–${dm(b)}`;
  return `${dm(a)}, ${fmtTime(a)}–${fmtTime(b)}`;
}

/** Handy und Tablet: nach einer Suche nur eine Zeile, «Ändern» öffnet die ganze Suchmaske. */
function SearchSummary({ where, when, onEdit }: { where: string; when: string; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-expanded={false}
      aria-controls="suchmaske"
      className="mt-5 flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-left shadow-[var(--shadow-card)] ring-1 ring-line transition hover:ring-forest/40 lg:hidden"
    >
      <Search className="size-5 shrink-0 text-leaf-700" aria-hidden />
      <span className="min-w-0 flex-1 truncate">
        <span className="sr-only">Deine Suche: </span>
        <span className="font-bold text-forest">{where}</span>
        <span className="text-ink/75"> · {when}</span>
      </span>
      <span className="shrink-0 text-sm font-bold text-leaf-700 underline decoration-leaf-300 decoration-2 underline-offset-4">Ändern</span>
    </button>
  );
}

export default function AutosClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const c = useMemo(() => parseCriteria(new URLSearchParams(sp.toString())), [sp]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const { results, place, unavailable, sort, mode } = useMemo(() => applyCriteria(c, today), [c, today]);
  const [selected, setSelected] = useState<string>();
  const sheet = useRef<HTMLDialogElement>(null);

  const set = useCallback(
    (patch: Partial<Criteria>) => router.replace(`${pathname}?${serializeCriteria({ ...c, ...patch })}`, { scroll: false }),
    [c, pathname, router],
  );
  const resetFilters = () => set(NO_FILTERS);
  const count = activeFilterCount(c);
  const chips = chipsOf(c, !!place);
  const from = c.von ? new Date(c.von) : null;
  const to = c.bis ? new Date(c.bis) : null;
  const period = !!(from && to && to > from);
  const n = results.length;
  const found = `${n} ${n === 1 ? "Auto" : "Autos"} gefunden`;

  // Nach einer Suche ist die Maske auf Handy und Tablet zugeklappt
  const searched = !!(c.ort || c.von || c.bis);
  const [editing, setEditing] = useState(false);
  const [formRev, setFormRev] = useState(0);
  const formBox = useRef<HTMLDivElement>(null);
  const collapsed = searched && !editing;
  useEffect(() => {
    // Fokus an den Anfang der Maske, ohne gleich die Tastatur zu öffnen
    if (editing) formBox.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [editing]);
  const closeForm = () => {
    setEditing(false);
    setFormRev((r) => r + 1); // nicht abgeschickte Eingaben verwerfen
  };

  return (
    <div className="page pt-6 pb-20 sm:pt-8">
      <h1 className="text-[1.9rem] leading-tight font-bold sm:text-[2.3rem]">{place ? `Autos in der Nähe von ${place.name}` : "Auto finden"}</h1>

      {collapsed && <SearchSummary where={place?.name ?? (c.ort || "Ganze Schweiz")} when={period ? shortRange(from!, to!) : "Beliebiger Zeitraum"} onEdit={() => setEditing(true)} />}
      <div id="suchmaske" ref={formBox} className={cn(collapsed && "hidden lg:block")}>
        <SearchForm
          key={`${c.ort}|${c.von}|${c.bis}|${formRev}`}
          className="mt-5 shadow-[var(--shadow-card)]"
          autoDates={false}
          top={
            searched && editing ? (
              <div className="mb-2 flex items-center justify-between gap-3 lg:hidden">
                <p data-autofocus tabIndex={-1} className="font-bold text-forest outline-none">Suche ändern</p>
                <button type="button" className="icon-btn -my-1 -mr-1 size-10" aria-label="Suche schliessen" onClick={closeForm}>
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            ) : undefined
          }
          initial={{ ort: c.ort, fd: c.von.slice(0, 10), ft: c.von.slice(11) || "10:00", td: c.bis.slice(0, 10), tt: c.bis.slice(11) || "10:00" }}
          onSearch={(v) => {
            set({ ort: v.ort.trim(), von: v.fd ? `${v.fd}T${v.ft || "10:00"}` : "", bis: v.td ? `${v.td}T${v.tt || "10:00"}` : "", umkreis: 0, sort: "" });
            setEditing(false);
          }}
        />
      </div>
      {c.ort && !place && (
        <p className="mt-3 rounded-xl bg-sun/15 px-4 py-3 text-sm font-semibold text-[#5c4611]">Zu «{c.ort}» haben wir keinen Ort gefunden. Du siehst alle passenden Autos in der Schweiz.</p>
      )}

      <div className="mt-6 grid gap-8 sm:mt-8 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filter">
          <FilterPanel c={c} set={set} place={place} idPrefix="d" onReset={resetFilters} mode={mode} />
        </aside>

        <section aria-labelledby="ergebnis" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div>
              <p id="ergebnis" className="text-lg font-bold text-forest" aria-live="polite">{found}</p>
              {/* Auf dem Handy steht der Zeitraum schon in der Suchzeile */}
              {period && <p className={cn("text-sm text-muted", collapsed && "hidden lg:block")}>{fmtDate(from!)}, {fmtTime(from!)} bis {fmtDate(to!)}, {fmtTime(to!)}</p>}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <button type="button" className="btn btn-outline btn-sm shrink-0 lg:hidden" onClick={() => sheet.current?.showModal()} aria-haspopup="dialog">
                <SlidersHorizontal className="size-4" aria-hidden />
                Filter
                {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-forest text-[0.7rem] text-white">{count}</span>}
              </button>
              <label className="sr-only" htmlFor="sortierung">Sortierung</label>
              <select id="sortierung" className="field min-h-10 w-auto min-w-0 py-0 text-sm font-semibold" value={sort} onChange={(e) => set({ sort: e.target.value as SortKey })}>
                {(Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== "entfernung" || place).map((k) => <option key={k} value={k}>{SORT_LABELS[k]}</option>)}
              </select>
              <div className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-line" role="group" aria-label="Ansicht">
                {([["liste", List, "Liste"], ["karte", MapIcon, "Karte"]] as const).map(([v, Icon, l]) => (
                  <button key={v} type="button" aria-pressed={c.ansicht === v} onClick={() => set({ ansicht: v })} className={cn("inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-sm font-bold transition-colors sm:px-3", c.ansicht === v ? "bg-forest text-white" : "text-muted hover:text-forest")}>
                    <Icon className="size-4" aria-hidden />
                    <span className="hidden sm:inline">{l}</span>
                    <span className="sr-only sm:hidden">{l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ProviderToggle value={c.anbieter} onChange={(anbieter) => set({ anbieter })} wording="lang" className="mt-4 w-full sm:max-w-[36rem]" />
          <div role="group" aria-labelledby="dauer-titel" className="mt-3 flex flex-wrap items-center gap-2">
            {/* Handy: die vier Wahlmöglichkeiten passen ohne Überschrift in eine Zeile */}
            <span id="dauer-titel" className="sr-only text-sm font-bold text-ink/80 sm:not-sr-only sm:mr-1">Mietdauer</span>
            {DURATIONS.map((d) => {
              const on = mode === d.id;
              return (
                <button key={d.id} type="button" aria-pressed={on} onClick={() => set({ dauer: on && c.dauer ? "" : d.id })} className={cn("inline-flex min-h-9 cursor-pointer items-center rounded-full px-3 text-sm font-semibold ring-1 transition sm:px-3.5", on ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-line hover:ring-forest/40")}>
                  {d.label}
                </button>
              );
            })}
            {!c.dauer && mode && <span className="hidden text-sm text-muted sm:inline">passend zu deinem Zeitraum</span>}
          </div>

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Aktive Filter" role="group">
              {chips.map((ch) => (
                <button key={ch.key} type="button" onClick={() => set(ch.clear)} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-leaf-100 px-3 text-sm font-semibold text-forest transition-colors hover:bg-leaf-200" aria-label={`Filter entfernen: ${ch.label}`}>
                  {ch.label}
                  <X className="size-3.5" aria-hidden />
                </button>
              ))}
              <button type="button" onClick={resetFilters} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-bold text-forest underline decoration-leaf-300 decoration-2 underline-offset-4 hover:decoration-forest">
                <RotateCcw className="size-3.5" aria-hidden />
                Alle zurücksetzen
              </button>
            </div>
          )}

          <div className="mt-6">
            {n === 0 ? (
              <div className="card flex flex-col items-center px-6 py-12 text-center">
                <EmptyArt className="h-28 w-auto" />
                <h2 className="mt-4 text-2xl font-bold">Keine passenden Autos</h2>
                <p className="mt-2 max-w-md text-ink/75">
                  {unavailable > 0 ? "Im gewählten Zeitraum sind die passenden Autos bereits gebucht. Versuche andere Daten oder lockere die Filter." : "Mit diesen Filtern gibt es keine Treffer. Lockere die Filter oder wähle alle Anbieter."}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {(count > 0 || c.anbieter !== "alle") && <button type="button" className="btn btn-primary" onClick={resetFilters}>Alle Filter zurücksetzen</button>}
                  {(c.von || c.bis) && <button type="button" className="btn btn-outline" onClick={() => set({ von: "", bis: "" })}>Zeitraum entfernen</button>}
                </div>
              </div>
            ) : (
              <>
                {c.ansicht === "karte" && <div className="mb-6"><MapView results={results} selected={selected} onSelect={setSelected} mode={mode} /></div>}
                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((r, i) => {
                    // Gesamtpreis nur für Kurzzeitmieten; der Tagespreis folgt der Preisstaffel
                    const short = period && (!mode || mode === "tage" || mode === "wochen") && hasModel(r.v, "kurzzeit");
                    const rate = short ? dayPrice(r.v, rentalDays(from!, to!)) : 0;
                    const q = short ? quote(rate, from!, to!) : null;
                    return (
                      <li key={r.v.slug}>
                        <VehicleCard v={r.v} mode={mode} distance={r.distance} availability={availabilityOf(r.v, today, period)} total={q ? { days: q.days, total: q.total, rate } : undefined} eager={i < 3} />
                      </li>
                    );
                  })}
                </ul>
                {/* Hinweis nach der Liste, damit die Treffer oben gleich sichtbar sind */}
                {period && unavailable > 0 && (
                  <p className="mt-5 text-sm text-muted">{unavailable} {unavailable === 1 ? "weiteres Auto ist" : "weitere Autos sind"} in diesem Zeitraum bereits gebucht.</p>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <dialog ref={sheet} className="sheet lg:hidden" aria-labelledby="filter-titel" onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}>
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="filter-titel" className="text-xl font-bold">Filter</h2>
            <button type="button" className="icon-btn" aria-label="Filter schliessen" onClick={() => sheet.current?.close()}>
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-1 pb-4">
            <FilterPanel c={c} set={set} place={place} idPrefix="m" onReset={resetFilters} mode={mode} />
          </div>
          <div className="flex gap-3 border-t border-line p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button type="button" className="btn btn-outline" onClick={resetFilters}>Zurücksetzen</button>
            <button type="button" className="btn btn-primary flex-1" onClick={() => sheet.current?.close()}>
              {n} {n === 1 ? "Auto" : "Autos"} anzeigen
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
