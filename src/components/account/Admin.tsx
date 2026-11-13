"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { STATUS_LABEL, demoRequests, demoTrips, type BookingRecord, type BookingStatus } from "@/data/account";
import { VEHICLES, getVehicle, vehicleTitle } from "@/data/vehicles";
import { PROVIDERS, providerOf, vehiclesOf } from "@/data/providers";
import { chf, fmtDate } from "@/lib/format";
import { allowedKm, fmtKm, overagePriceOf, settle, topUpKm, type KmCharge, type KmLog } from "@/lib/mileage";
import { useStore } from "@/lib/store";
import { fmtMonths, offerLabel, offersOf, priceTag } from "@/lib/offers";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/cn";
import { Stat, StatusBadge } from "./shared";

const NO_BOOKINGS: BookingRecord[] = [];
const NO_OVERRIDES: Record<string, BookingStatus> = {};
const NO_LOGS: Record<string, KmLog> = {};
const CHARGE_LABEL: Record<KmCharge["status"], string> = { offen: "Offen", bezahlt: "Bezahlt", kaution: "Über Kaution verrechnet" };
const TABS = [["uebersicht", "Übersicht"], ["buchungen", "Buchungen"], ["mehrkilometer", "Mehrkilometer"], ["inserate", "Inserate"], ["nutzer", "Nutzer"]] as const;
type Tab = (typeof TABS)[number][0];

interface Row { b: BookingRecord; renter: string; host: string; log: KmLog }

function kmLine({ b, log }: Row) {
  const k = b.km;
  if (!k) return "–";
  const s = settle(k, log);
  if (s) return s.over ? `${fmtKm(s.driven)} gefahren, ${fmtKm(s.over)} zu viel` : `${fmtKm(s.driven)} gefahren, keine Mehrkilometer`;
  if (log.pickup) return `Übergabe bei ${fmtKm(log.pickup.km)}`;
  const a = allowedKm(k, topUpKm(log));
  return k.unlimited ? `Unbegrenzt${a ? `, Fair Use ${fmtKm(a)}` : ""}` : `${fmtKm(a ?? 0)} gebucht`;
}

/** Admin-Bereich der Vorschau: alle Buchungen, Mehrkilometer, Inserate und Nutzer */
export function Admin({ today }: { today: Date }) {
  const [own] = useStore("rac:bookings", NO_BOOKINGS);
  const [overrides] = useStore("rac:requests", NO_OVERRIDES);
  const [logs, setLogs] = useStore("rac:km", NO_LOGS);
  const [tab, setTab] = useState<Tab>("uebersicht");
  const [filter, setFilter] = useState<BookingStatus | "">("");

  const rows = useMemo<Row[]>(() => {
    const row = (b: BookingRecord, renter: string, host: string): Row => ({ b: { ...b, status: overrides[b.id] ?? b.status }, renter, host, log: { ...b.log, ...logs[b.id] } });
    return [
      ...own.map((b) => row(b, "Aus diesem Browser", b.counterpart)),
      ...demoTrips("privat", today).map((b) => row(b, "Laura", b.counterpart)),
      ...demoRequests("privat", today).map((b) => row(b, b.counterpart, "Laura")),
      ...demoRequests("gewerbe", today).map((b) => row(b, b.counterpart, "CityDrive Bern GmbH")),
    ].sort((x, y) => y.b.from.localeCompare(x.b.from));
  }, [own, overrides, logs, today]);

  const charges = rows.flatMap((r) => {
    const s = r.b.km && settle(r.b.km, r.log);
    if (!s || !s.over) return [];
    const c: KmCharge = r.log.charge ?? { km: s.over, price: s.price, amount: s.cost, status: "offen", createdAt: r.log.dropoff!.at };
    return [{ r, c }];
  });
  const open = charges.filter(({ c }) => c.status === "offen");
  const setStatus = (id: string, c: KmCharge, status: KmCharge["status"]) => setLogs((l) => ({ ...l, [id]: { ...l[id], charge: { ...c, status } } }));
  const renters = Array.from(rows.reduce((m, r) => m.set(r.renter, (m.get(r.renter) ?? 0) + 1), new Map<string, number>()));
  const shown = rows.filter((r) => !filter || r.b.status === filter);

  return (
    <div>
      <div role="tablist" aria-label="Admin" className="flex gap-2 overflow-x-auto">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" type="button" id={`admin-tab-${id}`} aria-selected={tab === id} aria-controls={`admin-panel-${id}`} onClick={() => setTab(id)} className={cn("inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition", tab === id ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-line hover:ring-forest/40")}>
            {label}
            {id === "mehrkilometer" && open.length > 0 && <span className={cn("grid min-w-5 place-items-center rounded-full px-1 text-xs", tab === id ? "bg-white/20" : "bg-leaf-100 text-forest")}>{open.length}</span>}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`admin-panel-${tab}`} aria-labelledby={`admin-tab-${tab}`} className="mt-6">
        {tab === "uebersicht" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat label="Buchungen" value={String(rows.length)} note={`${rows.filter((r) => r.b.status === "angefragt").length} offene Anfragen`} />
              <Stat label="Laufende Mieten" value={String(rows.filter((r) => r.log.pickup && !r.log.dropoff).length)} note="Übergabe erfasst, Rückgabe offen" />
              <Stat label="Mehrkilometer offen" value={chf(open.reduce((s, { c }) => s + c.amount, 0))} note={`${open.length} von ${charges.length} Abrechnungen`} />
              <Stat label="Inserate" value={String(VEHICLES.length)} note={`${PROVIDERS.length} Vermietende`} />
            </div>
            <p className="mt-4 text-sm text-muted">Die Zahlen stammen aus den Demo-Daten dieser Vorschau und aus Eingaben in diesem Browser.</p>
          </>
        )}

        {tab === "buchungen" && (
          <>
            <div className="sm:w-56">
              <label htmlFor="admin-filter" className="label">Status</label>
              <select id="admin-filter" className="field min-h-11" value={filter} onChange={(e) => setFilter(e.target.value as BookingStatus | "")}>
                <option value="">Alle</option>
                {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <p className="mt-3 text-sm text-muted" aria-live="polite">{shown.length} von {rows.length} Buchungen</p>
            <ul className="mt-3 grid gap-3">
              {shown.map((r) => {
                const v = getVehicle(r.b.vehicleSlug);
                if (!v) return null;
                // Langzeitmiete und Auto-Abo: Preis pro Monat statt Total über die Laufzeit
                const pl = r.b.plan;
                const facts = [
                  ["Mieter", r.renter], ["Vermieter", r.host],
                  pl ? ["Pro Monat", `${chf(pl.monthly)}, ${pl.model === "abo" ? "Laufzeit " : ""}${fmtMonths(pl.months)}`] : ["Total", chf(r.b.total)],
                  ["Kilometer", pl ? `${fmtKm(pl.kmPerMonth)} pro Monat` : kmLine(r)],
                ];
                return (
                  <li key={r.b.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-bold text-forest"><Link href={`/autos/${v.slug}`} className="hover:underline">{vehicleTitle(v)}</Link></p>
                      <StatusBadge status={r.b.status} />
                    </div>
                    <p className="text-sm text-muted">{fmtDate(new Date(r.b.from))} bis {fmtDate(new Date(r.b.to))} · {pl ? `${offerLabel(pl.model)} · ` : ""}{r.b.id.toUpperCase()}</p>
                    <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                      {facts.map(([a, t]) => (
                        <div key={a}><dt className="inline text-muted">{a}: </dt><dd className="inline font-semibold">{t}</dd></div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {tab === "mehrkilometer" && (
          <>
            {charges.length ? (
              <ul className="grid gap-3">
                {charges.map(({ r, c }) => (
                  <li key={r.b.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-forest">{vehicleTitle(getVehicle(r.b.vehicleSlug)!)} <span className="font-medium text-muted">· {r.b.id.toUpperCase()}</span></p>
                      <p className="text-sm text-muted">{r.renter} bei {r.host} · Rückgabe am {fmtDate(new Date(r.log.dropoff!.at))}</p>
                      <p className="mt-1 text-sm">{fmtKm(c.km)} × {chf(c.price)} = <strong className="text-forest">{chf(c.amount)}</strong></p>
                    </div>
                    <div className="sm:w-60">
                      <label htmlFor={`admin-km-${r.b.id}`} className="label">Status</label>
                      <select id={`admin-km-${r.b.id}`} className="field min-h-11" value={c.status} onChange={(e) => setStatus(r.b.id, c, e.target.value as KmCharge["status"])}>
                        {Object.entries(CHARGE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-white p-6 text-ink/80 ring-1 ring-line">Keine Mehrkilometer.</p>
            )}
            <p className="mt-4 text-sm text-muted">Zahlungsmittel und Kaution sind in dieser Vorschau nicht angebunden. Hier hältst du den Stand fest, Mietende und Vermietende sehen ihn in der Buchung.</p>
          </>
        )}

        {tab === "inserate" && (
          <ul className="grid gap-3">
            {VEHICLES.map((v) => {
              const p = providerOf(v), m = v.mileage, t = priceTag(v), models = offersOf(v).models;
              return (
                <li key={v.slug} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-line sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-forest"><Link href={`/autos/${v.slug}`} className="hover:underline">{vehicleTitle(v)}</Link></p>
                    <p className="text-sm text-muted">{p.name}, {v.city} · {t.from ? "ab " : ""}{chf(t.amount)} pro {t.unit}</p>
                    <p className="text-sm">{models.map(offerLabel).join(", ")}</p>
                    {models.includes("kurzzeit") && <p className="text-sm">
                      {fmtKm(m.perDay)} pro Tag · Zusatzkilometer {chf(m.extraPrice)}
                      {overagePriceOf(m) !== m.extraPrice && `, Überschreitung ${chf(overagePriceOf(m))}`}
                      {m.unlimited && " · Unlimited-Paket"}
                      {m.maxKm && ` · höchstens ${fmtKm(m.maxKm)}`}
                    </p>}
                  </div>
                  <ProviderBadge kind={p.kind} />
                </li>
              );
            })}
          </ul>
        )}

        {tab === "nutzer" && (
          <>
            <h2 className="text-lg font-bold">Vermietende</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {PROVIDERS.map((p) => {
                const n = vehiclesOf(p.slug).length;
                return (
                  <li key={p.slug} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Link href={`/anbieter/${p.slug}`} className="font-bold text-forest hover:underline">{p.name}</Link>
                      <ProviderBadge kind={p.kind} />
                    </div>
                    <p className="text-sm text-muted">{p.city} · dabei seit {p.since} · {n} {n === 1 ? "Inserat" : "Inserate"}</p>
                  </li>
                );
              })}
            </ul>
            <h2 className="mt-8 text-lg font-bold">Mietende</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {renters.map(([name, n]) => (
                <li key={name} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                  <p className="font-bold text-forest">{name}</p>
                  <p className="text-sm text-muted">{n} {n === 1 ? "Buchung" : "Buchungen"}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
