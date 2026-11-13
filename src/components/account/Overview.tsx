"use client";
import Link from "next/link";
import { CalendarDays, Car, MessageCircle, Plus, Search } from "lucide-react";
import { BUSINESS_REVENUE, DEMO_FLEET, DEMO_THREADS, FLEET_LOCATIONS, PRIVATE_EARNINGS, demoTrips, type FleetItem } from "@/data/account";
import { getVehicle, vehicleTitle } from "@/data/vehicles";
import { chf, fmtDate, num } from "@/lib/format";
import { useStore, type Session } from "@/lib/store";
import { BarChart, BookingItem, Stat } from "./shared";
import { RequestActions, useRequests } from "./Bookings";

function Card({ title, children, note, action }: { title: string; children: React.ReactNode; note?: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {note && <span className="demo-tag">{note}</span>}
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function Overview({ session, today }: { session: Session; today: Date }) {
  const [requests, decide] = useRequests(session, today);
  const open = requests.filter((r) => r.status === "angefragt");
  const [fleet] = useStore<FleetItem[]>("rac:fleet", DEMO_FLEET);
  const unread = DEMO_THREADS[session.role].filter((t) => t.unread).length;

  if (session.role === "gewerbe") {
    const active = fleet.filter((f) => f.status === "aktiv" || f.status === "vermietet");
    const util = Math.round(active.reduce((s, f) => s + f.utilization, 0) / Math.max(active.length, 1));
    const revenue = BUSINESS_REVENUE.reduce((s, d) => s + d.value, 0);
    return (
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Stat label="Fahrzeuge aktiv" value={`${active.length} von ${fleet.length}`} note={`${FLEET_LOCATIONS.length} Standorte`} />
          <Stat label="Offene Anfragen" value={String(open.length)} note="brauchen eine Antwort" />
          <Stat label="Auslastung" value={`${util}%`} note="Beispieldaten" />
          <Stat label="Umsatz 12 Wochen" value={chf(revenue)} note="Beispieldaten" />
        </div>
        <Card title="Umsatz pro Woche" note="Beispieldaten">
          <BarChart data={BUSINESS_REVENUE} label="Umsatz pro Kalenderwoche in CHF, Beispieldaten" />
        </Card>
        <Card title="Offene Anfragen" action={<Link href="/konto/buchungen" className="link text-sm">Alle Buchungen</Link>}>
          {open.length ? (
            <ul className="grid gap-3">{open.map((r) => <BookingItem key={r.id} b={r} role="vermieter"><RequestActions r={r} decide={decide} /></BookingItem>)}</ul>
          ) : (
            <p className="text-ink/75">Keine offenen Anfragen.</p>
          )}
        </Card>
        <div className="flex flex-wrap gap-3">
          <Link href="/auto-vermieten/erfassen?anbieter=gewerblich" className="btn btn-primary"><Plus className="size-4" aria-hidden />Fahrzeug hinzufügen</Link>
          <Link href="/konto/inserate" className="btn btn-outline"><Car className="size-4" aria-hidden />Flotte verwalten</Link>
          <Link href="/konto/nachrichten" className="btn btn-outline"><MessageCircle className="size-4" aria-hidden />Nachrichten{unread > 0 && ` (${unread} neu)`}</Link>
        </div>
      </div>
    );
  }

  const next = demoTrips("privat", today).find((t) => new Date(t.from) > today);
  const nv = next && getVehicle(next.vehicleSlug);
  const earnings = PRIVATE_EARNINGS.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Nächste Fahrt" value={next ? fmtDate(new Date(next.from)) : "Keine"} note={nv ? vehicleTitle(nv) : undefined} />
        <Stat label="Offene Anfragen" value={String(open.length)} note="für dein Auto" />
        <Stat label="Einnahmen 6 Monate" value={chf(earnings)} note="Beispieldaten" />
      </div>
      <Card title="Einnahmen" note="Beispieldaten">
        <BarChart data={PRIVATE_EARNINGS} label="Einnahmen pro Monat in CHF, Beispieldaten" />
        <p className="mt-3 text-sm text-muted">Einnahmen aus bestätigten Mieten, insgesamt {num(earnings)} Franken.</p>
      </Card>
      <Card title="Anfragen für dein Auto" action={<Link href="/konto/buchungen" className="link text-sm">Alle Buchungen</Link>}>
        {open.length ? <ul className="grid gap-3">{open.map((r) => <BookingItem key={r.id} b={r} role="vermieter"><RequestActions r={r} decide={decide} /></BookingItem>)}</ul> : <p className="text-ink/75">Keine offenen Anfragen.</p>}
      </Card>
      <div className="flex flex-wrap gap-3">
        <Link href="/autos" className="btn btn-primary"><Search className="size-4" aria-hidden />Auto finden</Link>
        <Link href="/konto/buchungen" className="btn btn-outline"><CalendarDays className="size-4" aria-hidden />Meine Buchungen</Link>
        <Link href="/konto/nachrichten" className="btn btn-outline"><MessageCircle className="size-4" aria-hidden />Nachrichten{unread > 0 && ` (${unread} neu)`}</Link>
      </div>
    </div>
  );
}
