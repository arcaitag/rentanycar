"use client";
import Link from "next/link";
import { MileageEditButton } from "@/components/mileage/MileageSettings";
import { pickMileage, policyToForm } from "@/lib/mileage";
import { OfferEditButton, offerSummary } from "@/components/offers/OfferSettings";
import { OFFER_FORM_DEFAULT, formToOffers, offersOf, offersToForm, pickOffers, type OfferForm } from "@/lib/offers";
import { Fragment, useMemo, useState } from "react";
import { CalendarDays, Copy, Pause, Play, Plus, Users } from "lucide-react";
import { CATEGORIES, categoryLabel, getVehicle, vehicleImage, type CategoryId } from "@/data/vehicles";
import { DEMO_FLEET, DEMO_STAFF, FLEET_LOCATIONS, FLEET_STATUS, demoRequests, type BookingStatus, type FleetItem, type FleetStatus } from "@/data/account";
import type { SavedListing } from "@/components/rent/ListingWizard";
import { MONTHS, addDays, chf, startOfDay } from "@/lib/format";
import { useStore, type Session } from "@/lib/store";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/cn";
import { Empty } from "./shared";

const NO_LISTINGS: SavedListing[] = [];
const NO_AVAIL: Record<string, number[]> = {};
const NO_PAUSED: string[] = [];

/** Verfügbarkeit der nächsten 4 Wochen – Tage antippen zum Sperren oder Freigeben. */
function AvailabilityEditor({ id, today }: { id: string; today: Date }) {
  const [avail, setAvail] = useStore("rac:availability", NO_AVAIL);
  const blocked = avail[id] ?? [];
  const start = startOfDay(today);
  const days = Array.from({ length: 28 }, (_, i) => addDays(start, i));
  const toggle = (i: number) => setAvail((a) => ({ ...a, [id]: blocked.includes(i) ? blocked.filter((x) => x !== i) : [...blocked, i] }));
  return (
    <div className="rounded-2xl bg-leaf-50 p-4 ring-1 ring-line">
      <p className="text-sm font-bold text-forest">Verfügbarkeit: {MONTHS[start.getMonth()]} bis {MONTHS[days[27].getMonth()]}</p>
      <p className="text-sm text-muted">Tippe auf einen Tag, um ihn zu sperren oder freizugeben.</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const off = blocked.includes(i);
          return (
            <button key={i} type="button" aria-pressed={off} aria-label={`${d.getDate()}. ${MONTHS[d.getMonth()]}: ${off ? "gesperrt" : "verfügbar"}`} onClick={() => toggle(i)} className={cn("grid aspect-square cursor-pointer place-items-center rounded-lg text-sm font-semibold ring-1 transition", off ? "bg-[repeating-linear-gradient(135deg,#dde9e1_0_4px,#ffffff_4px_8px)] text-muted line-through ring-line" : "bg-white text-forest ring-line hover:ring-forest")}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted" aria-live="polite">{blocked.length} {blocked.length === 1 ? "Tag" : "Tage"} gesperrt</p>
    </div>
  );
}

function PrivateListings({ session, today }: { session: Session; today: Date }) {
  const [saved] = useStore("rac:listings", NO_LISTINGS);
  const [paused, setPaused] = useStore("rac:paused", NO_PAUSED);
  const [open, setOpen] = useState<string>();
  const golf = getVehicle("vw-golf")!;
  const items = [
    ...(session.name === "Laura" ? [{ id: "vw-golf", title: "Volkswagen Golf", sub: `${golf.city}, ${chf(golf.price)} pro Tag`, img: vehicleImage(golf), href: "/autos/vw-golf", demo: true, km: policyToForm(golf.mileage) }] : []),
    ...saved.filter((l) => l.anbieter === "privat").map((l) => ({ id: l.id, title: `${l.marke} ${l.modell}`, sub: `${l.ort}, ${chf(Number(l.preis))} pro Tag`, img: `/fahrzeuge/kategorie-${l.kategorie}.svg`, href: "", demo: false, km: pickMileage(l) })),
  ];
  if (!items.length) return <Empty title="Noch kein Inserat" text="Erfasse dein Auto in wenigen Minuten. Preis und Verfügbarkeit bestimmst du." href="/auto-vermieten/erfassen?anbieter=privat" cta="Auto inserieren" />;
  return (
    <div className="grid gap-4">
      {items.map((it) => {
        const isPaused = paused.includes(it.id);
        return (
          <div key={it.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <img src={it.img} alt="" width={160} height={104} className={cn("h-24 w-full rounded-xl bg-leaf-50 sm:h-20 sm:w-32", it.demo ? "object-cover" : "object-contain p-2")} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <ProviderBadge kind="privat" />
                  <span className={cn("chip", isPaused ? "bg-line/70 text-ink/75" : "bg-leaf-100 text-leaf-700")}>{isPaused ? "Pausiert" : "Aktiv"}</span>
                  {!it.demo && <span className="chip bg-line/70 text-ink/75">Nicht veröffentlicht</span>}
                </div>
                <p className="mt-1.5 font-bold text-forest">{it.title}</p>
                <p className="text-sm text-muted">{it.sub}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-outline btn-sm" aria-expanded={open === it.id} onClick={() => setOpen(open === it.id ? undefined : it.id)}><CalendarDays className="size-4" aria-hidden />Verfügbarkeit</button>
                <MileageEditButton id={it.id} title={it.title} initial={it.km} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setPaused((p) => (isPaused ? p.filter((x) => x !== it.id) : [...p, it.id]))}>
                  {isPaused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                  {isPaused ? "Aktivieren" : "Pausieren"}
                </button>
                {it.href && <Link href={it.href} className="btn btn-ghost btn-sm">Ansehen</Link>}
              </div>
            </div>
            {open === it.id && <div className="mt-4"><AvailabilityEditor id={it.id} today={today} /></div>}
          </div>
        );
      })}
      <Link href="/auto-vermieten/erfassen?anbieter=privat" className="btn btn-outline w-fit"><Plus className="size-4" aria-hidden />Weiteres Auto inserieren</Link>
    </div>
  );
}

const NO_OFFER_EDITS: Record<string, OfferForm> = {};
const NO_OVERRIDES: Record<string, BookingStatus> = {};

function Fleet({ today }: { today: Date }) {
  const [fleet, setFleet] = useStore<FleetItem[]>("rac:fleet", DEMO_FLEET);
  const [saved] = useStore("rac:listings", NO_LISTINGS);
  const [offerEdits] = useStore("rac:offers", NO_OFFER_EDITS);
  const [overrides] = useStore("rac:requests", NO_OVERRIDES);
  const requests = useMemo(() => demoRequests("gewerbe", today), [today]);
  const [loc, setLoc] = useState("");
  const [status, setStatus] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<string>();
  const all: FleetItem[] = useMemo(
    () => [
      ...fleet,
      ...saved.filter((l) => l.anbieter === "gewerblich" && !fleet.some((f) => f.id === l.id)).map((l) => ({ id: l.id, name: `${l.marke} ${l.modell}`, category: l.kategorie, location: l.standort, status: "entwurf" as FleetStatus, price: Number(l.preis), utilization: 0 })),
    ],
    [fleet, saved],
  );
  const rows = all.filter((f) => (!loc || f.location === loc) && (!status || f.status === status) && (!cat || f.category === cat));
  const upsert = (item: FleetItem) => setFleet((list) => (list.some((f) => f.id === item.id) ? list.map((f) => (f.id === item.id ? item : f)) : [...list, item]));
  const duplicate = (f: FleetItem) => setFleet((list) => [...list, { ...f, id: `${f.id}-k${Date.now().toString(36).slice(-3)}`, status: "entwurf", utilization: 0, slug: undefined }]);
  const locations = Array.from(new Set([...FLEET_LOCATIONS, ...all.map((f) => f.location)]));
  const statusTone: Record<FleetStatus, string> = { aktiv: "bg-leaf-100 text-leaf-700", vermietet: "bg-sage-100 text-sage-800", pausiert: "bg-line/70 text-ink/75", entwurf: "bg-sun/25 text-[#5c4611]" };

  // Fahrzeuge mit eigenem Inserat zeigen dessen Regelung, neu erfasste die Werte aus dem Assistenten
  const fleetMileage = (f: FleetItem) => {
    const v = f.slug ? getVehicle(f.slug) : undefined;
    return v ? policyToForm(v.mileage) : pickMileage(saved.find((l) => l.id === f.id) ?? { kmPreis: "0.30" });
  };
  // Mietmodelle: im Dashboard geänderte Werte, sonst das Inserat
  const fleetOffers = (f: FleetItem): OfferForm => {
    if (offerEdits[f.id]) return offerEdits[f.id];
    const v = f.slug ? getVehicle(f.slug) : undefined;
    if (v) return offersToForm(offersOf(v));
    const l = saved.find((x) => x.id === f.id);
    return l ? pickOffers(l) : OFFER_FORM_DEFAULT;
  };
  // Aktive Modelle mit Preisen, Mindestlaufzeiten und Paketen sowie bestätigte Buchungen auf einen Blick
  const offerChips = (f: FleetItem) => {
    const n = f.slug ? requests.filter((r) => r.vehicleSlug === f.slug && (overrides[r.id] ?? r.status) === "bestaetigt").length : 0;
    return (
      <ul className="flex flex-wrap gap-1.5" aria-label={`Mietmodelle von ${f.name}`}>
        {offerSummary(formToOffers(fleetOffers(f), true), f.price).map((x) => <li key={x} className="chip bg-white text-ink/80 ring-1 ring-line">{x}</li>)}
        {n > 0 && <li className="chip bg-leaf-100 text-leaf-700">{n} aktive {n === 1 ? "Buchung" : "Buchungen"}</li>}
      </ul>
    );
  };
  const actions = (f: FleetItem) => (
    <div className="flex flex-wrap gap-1.5 xl:flex-nowrap xl:gap-0.5">
      <button type="button" className="btn btn-ghost btn-sm px-3" onClick={() => duplicate(f)} aria-label={`${f.name} (${f.id}) duplizieren`}><Copy className="size-4" aria-hidden /><span className="xl:sr-only">Duplizieren</span></button>
      {f.status !== "vermietet" && (
        <button type="button" className="btn btn-ghost btn-sm px-3" onClick={() => upsert({ ...f, status: f.status === "pausiert" || f.status === "entwurf" ? "aktiv" : "pausiert" })} aria-label={`${f.name} (${f.id}) ${f.status === "aktiv" ? "pausieren" : "aktivieren"}`}>
          {f.status === "aktiv" ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          <span className="xl:sr-only">{f.status === "aktiv" ? "Pausieren" : "Aktivieren"}</span>
        </button>
      )}
      <button type="button" className="btn btn-ghost btn-sm px-3" aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? undefined : f.id)} aria-label={`Verfügbarkeit von ${f.name} (${f.id})`}><CalendarDays className="size-4" aria-hidden /><span className="xl:sr-only">Verfügbarkeit</span></button>
      <MileageEditButton id={f.id} title={`${f.name} (${f.id.toUpperCase()})`} initial={fleetMileage(f)} compact />
      <OfferEditButton id={f.id} title={`${f.name} (${f.id.toUpperCase()})`} initial={fleetOffers(f)} />
    </div>
  );
  const priceInput = (f: FleetItem) => (
    <label className="inline-flex items-center gap-1.5 text-sm">
      <span className="sr-only">Tagespreis {f.name} ({f.id}) in CHF</span>
      <span className="text-muted">CHF</span>
      <input type="number" min={20} max={1000} step={1} value={f.price} onChange={(e) => upsert({ ...f, price: Math.max(0, Number(e.target.value)) })} className="field min-h-9 w-20 rounded-lg px-2 py-1 text-sm" />
    </label>
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {([["Standort", loc, setLoc, locations.map((l) => [l, l])], ["Status", status, setStatus, Object.entries(FLEET_STATUS)], ["Kategorie", cat, setCat, CATEGORIES.map((c) => [c.id, c.label])]] as const).map(([label, val, setter, opts]) => (
          <div key={label} className="sm:w-48">
            <label htmlFor={`f-${label}`} className="label">{label}</label>
            <select id={`f-${label}`} className="field min-h-11" value={val} onChange={(e) => (setter as (v: string) => void)(e.target.value)}>
              <option value="">Alle</option>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
        <Link href="/auto-vermieten/erfassen?anbieter=gewerblich" className="btn btn-primary sm:ml-auto"><Plus className="size-4" aria-hidden />Fahrzeug hinzufügen</Link>
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">{rows.length} von {all.length} Fahrzeugen. Die Auslastung ist ein Beispielwert.</p>

      <div className="mt-3 hidden overflow-x-auto rounded-2xl bg-white ring-1 ring-line lg:block">
        <table className="w-full text-left text-[0.93rem]">
          <caption className="sr-only">Fahrzeugflotte</caption>
          <thead className="border-b border-line text-sm text-muted">
            <tr>
              <th scope="col" className="p-3 pl-4 font-bold">Fahrzeug</th>
              <th scope="col" className="p-3 font-bold">Standort</th>
              <th scope="col" className="p-3 font-bold">Status</th>
              <th scope="col" className="p-3 font-bold">Preis pro Tag</th>
              <th scope="col" className="p-3 font-bold">Auslastung</th>
              <th scope="col" className="p-3 pr-4 font-bold"><span className="sr-only">Aktionen</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((f) => (
              <Fragment key={f.id}>
                <tr className="border-b-0">
                  <td className="p-3 pl-4">
                    <p className="font-bold text-forest">{f.name}</p>
                    <p className="text-sm text-muted">{categoryLabel(f.category as CategoryId)}, {f.id.toUpperCase()}</p>
                  </td>
                  <td className="p-3">{f.location}</td>
                  <td className="p-3"><span className={cn("chip", statusTone[f.status])}>{FLEET_STATUS[f.status]}</span></td>
                  <td className="p-3">{priceInput(f)}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full rounded-full bg-leaf-500" style={{ width: `${f.utilization}%` }} /></div>
                      <span className="text-sm">{f.utilization}%</span>
                    </div>
                  </td>
                  <td className="p-3 pr-4">{actions(f)}</td>
                </tr>
                <tr>
                  <td colSpan={6} className="px-4 pt-0 pb-3.5">{offerChips(f)}</td>
                </tr>
                {open === f.id && (
                  <tr><td colSpan={6} className="p-4"><div className="max-w-md"><AvailabilityEditor id={f.id} today={today} /></div></td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 grid gap-3 lg:hidden">
        {rows.map((f) => (
          <li key={f.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-forest">{f.name}</p>
                <p className="text-sm text-muted">{f.location}, {f.id.toUpperCase()}</p>
                <div className="mt-2">{offerChips(f)}</div>
              </div>
              <span className={cn("chip shrink-0", statusTone[f.status])}>{FLEET_STATUS[f.status]}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {priceInput(f)}
              <span className="text-sm text-muted">Auslastung {f.utilization}%</span>
            </div>
            <div className="mt-3 border-t border-line pt-3">{actions(f)}</div>
            {open === f.id && <div className="mt-3"><AvailabilityEditor id={f.id} today={today} /></div>}
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line" aria-labelledby="standorte">
          <h3 id="standorte" className="text-lg font-semibold">Standorte</h3>
          <ul className="mt-3 divide-y divide-line">
            {locations.map((l) => <li key={l} className="flex justify-between py-2.5"><span>{l}</span><span className="font-semibold text-forest">{all.filter((f) => f.location === l).length} Fahrzeuge</span></li>)}
          </ul>
          <button type="button" className="btn btn-outline btn-sm mt-4" disabled>Standort hinzufügen</button>
        </section>
        <section className="rounded-2xl bg-white p-5 ring-1 ring-line" aria-labelledby="team">
          <div className="flex items-center justify-between gap-3">
            <h3 id="team" className="flex items-center gap-2 text-lg font-semibold"><Users className="size-5 text-sage-600" aria-hidden />Mitarbeitende und Rechte</h3>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {DEMO_STAFF.map((s) => <li key={s.name} className="py-2.5"><p className="font-semibold">{s.name}</p><p className="text-sm text-muted">{s.role}</p></li>)}
          </ul>
          <button type="button" className="btn btn-outline btn-sm mt-4" disabled>Person einladen</button>
        </section>
      </div>
    </div>
  );
}

export function Listings({ session, today }: { session: Session; today: Date }) {
  return session.role === "gewerbe" ? <Fleet today={today} /> : <PrivateListings session={session} today={today} />;
}
