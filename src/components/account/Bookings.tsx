"use client";
import { useMemo, useState } from "react";
import { demoRequests, demoTrips, type BookingRecord, type BookingStatus } from "@/data/account";
import { useStore, type Session } from "@/lib/store";
import { cn } from "@/lib/cn";
import { BookingItem, Empty } from "./shared";

const NO_BOOKINGS: BookingRecord[] = [];
const NO_OVERRIDES: Record<string, BookingStatus> = {};

export function useRequests(session: Session, today: Date) {
  const [overrides, setOverrides] = useStore("rac:requests", NO_OVERRIDES);
  const list = useMemo(() => demoRequests(session.role, today).map((r) => ({ ...r, status: overrides[r.id] ?? r.status })), [session.role, today, overrides]);
  const decide = (id: string, status: BookingStatus) => setOverrides((o) => ({ ...o, [id]: status }));
  return [list, decide] as const;
}

export function RequestActions({ r, decide }: { r: BookingRecord; decide: (id: string, s: BookingStatus) => void }) {
  if (r.status !== "angefragt") return null;
  return (
    <div className="flex gap-2">
      <button type="button" className="btn btn-outline btn-sm" onClick={() => decide(r.id, "abgelehnt")}>Ablehnen</button>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => decide(r.id, "bestaetigt")}>Annehmen</button>
    </div>
  );
}

export function Bookings({ session, today }: { session: Session; today: Date }) {
  const [own, setOwn] = useStore("rac:bookings", NO_BOOKINGS);
  const [requests, decide] = useRequests(session, today);
  const trips = [...own, ...demoTrips(session.role, today)];
  const [tab, setTab] = useState<"fahrten" | "anfragen">(session.role === "gewerbe" ? "anfragen" : "fahrten");
  const tabs = [
    { id: "fahrten" as const, label: "Meine Fahrten", n: trips.length },
    { id: "anfragen" as const, label: session.role === "gewerbe" ? "Anfragen für die Flotte" : "Anfragen für mein Auto", n: requests.filter((r) => r.status === "angefragt").length },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Buchungen" className="flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => setTab(t.id)} className={cn("inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-bold ring-1 transition", tab === t.id ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-line hover:ring-forest/40")}>
            {t.label}
            {t.n > 0 && <span className={cn("grid min-w-5 place-items-center rounded-full px-1 text-xs", tab === t.id ? "bg-white/20" : "bg-leaf-100 text-forest")}>{t.n}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === "fahrten" ? (
          trips.length ? (
            <ul className="grid gap-3">
              {trips.map((b) => (
                <BookingItem key={b.id} b={b} role="mieter">
                  {own.some((o) => o.id === b.id) && b.status === "angefragt" && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOwn((l) => l.filter((x) => x.id !== b.id))}>Anfrage zurückziehen</button>
                  )}
                </BookingItem>
              ))}
            </ul>
          ) : (
            <Empty title="Noch keine Fahrten" text="Wenn du ein Auto anfragst, erscheint die Anfrage hier." href="/autos" cta="Auto finden" />
          )
        ) : requests.length ? (
          <ul className="grid gap-3">
            {requests.map((r) => (
              <BookingItem key={r.id} b={r} role="vermieter">
                <RequestActions r={r} decide={decide} />
              </BookingItem>
            ))}
          </ul>
        ) : (
          <Empty title="Keine Anfragen" text="Sobald jemand dein Auto anfragt, entscheidest du hier." href="/auto-vermieten/erfassen" cta="Auto inserieren" />
        )}
      </div>
    </div>
  );
}
