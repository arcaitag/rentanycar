// Demo-Daten für Benutzerkonten. Keine realen Buchungen, Umsätze oder Personen.
import type { CategoryId, ProviderKind } from "./vehicles";
import { addDays, startOfDay } from "@/lib/format";
import { getVehicle } from "./vehicles";
import { quote, rentalDays } from "@/lib/pricing";
import { aboPlan, dayPrice, longPlan, planTotal, type OfferKind, type Plan } from "@/lib/offers";
import { bookingKm, chargeFor, kmCost, type BookingKm, type KmLog, type MileageChoice, type OdometerReading } from "@/lib/mileage";

export type BookingStatus = "angefragt" | "bestaetigt" | "abgeschlossen" | "abgelehnt";
export interface BookingRecord {
  id: string;
  vehicleSlug: string;
  from: string;
  to: string;
  status: BookingStatus;
  counterpart: string;
  counterpartKind: ProviderKind;
  total: number;
  message?: string;
  /** Kilometerbedingungen zum Zeitpunkt der Buchung */
  km?: BookingKm;
  /** Mietmodell (ohne Angabe: Kurzzeitmiete) und Konditionen einer Langzeitmiete oder eines Auto-Abos */
  model?: OfferKind;
  plan?: Plan;
  /** Kilometerstände, Nachbuchungen und Mehrkilometer (lokale Änderungen liegen im Speicher «rac:km») */
  log?: KmLog;
}
export const STATUS_LABEL: Record<BookingStatus, string> = {
  angefragt: "Anfrage offen",
  bestaetigt: "Bestätigt",
  abgeschlossen: "Abgeschlossen",
  abgelehnt: "Abgelehnt",
};

interface Demo {
  /** Langzeitmiete oder Auto-Abo statt Kurzzeitmiete */
  plan?: { model: "langzeit" | "abo"; months: number; pkg?: number };
  km?: MileageChoice;
  /** Kilometerstand bei Übergabe und optional bei Rückgabe */
  odo?: [number, number?];
  renter?: string;
  host?: string;
}

function rec(id: string, slug: string, start: number, days: number, status: BookingStatus, counterpart: string, kind: ProviderKind, today: Date, o: Demo = {}): BookingRecord {
  const from = addDays(startOfDay(today), start);
  from.setHours(9);
  const to = addDays(from, days);
  const v = getVehicle(slug)!;
  if (o.plan) {
    const plan = o.plan.model === "langzeit" ? longPlan(v, o.plan.months) : aboPlan(v, o.plan.months, o.plan.pkg);
    const end = new Date(from);
    end.setMonth(end.getMonth() + plan.months);
    return { id, vehicleSlug: slug, from: from.toISOString(), to: end.toISOString(), status, counterpart, counterpartKind: kind, total: planTotal(plan), model: plan.model, plan };
  }
  const q = quote(dayPrice(v, rentalDays(from, to)), from, to);
  const km = bookingKm(v.mileage, q.days, o.km);
  const r: BookingRecord = { id, vehicleSlug: slug, from: from.toISOString(), to: to.toISOString(), status, counterpart, counterpartKind: kind, total: q.total + kmCost(km), km };
  if (o.odo) {
    const read = (value: number, at: Date, photo: string): OdometerReading => ({ km: value, at: at.toISOString(), photo, bookingId: id, renter: o.renter ?? "", host: o.host ?? "", by: "vermieter" });
    const log: KmLog = { pickup: read(o.odo[0], new Date(from.getTime() + 6 * 6e4), "tacho-uebergabe.jpg") };
    if (o.odo[1] !== undefined) {
      log.dropoff = read(o.odo[1], new Date(to.getTime() - 12 * 6e4), "tacho-rueckgabe.jpg");
      const charge = chargeFor(km, log);
      if (charge) log.charge = charge;
    }
    r.log = log;
  }
  return r;
}

/** Fahrten, die das Demo-Konto selbst gemietet hat. */
export function demoTrips(role: "privat" | "gewerbe", today: Date): BookingRecord[] {
  if (role === "gewerbe") return [];
  return [
    rec("t-3", "tesla-model-3", -1, 3, "bestaetigt", "Marco", "privat", today, { km: { type: "extra", km: 250 }, odo: [38410], renter: "Laura", host: "Marco" }),
    rec("t-1", "skoda-octavia-combi", 9, 2, "bestaetigt", "CityDrive Bern GmbH", "gewerbe", today, { km: { type: "unlimited" } }),
    rec("t-2", "mazda-mx-5", -40, 1, "abgeschlossen", "Nina", "privat", today, { odo: [23150, 23392], renter: "Laura", host: "Nina" }),
  ];
}

/** Eingehende Anfragen für die eigenen Fahrzeuge. */
export function demoRequests(role: "privat" | "gewerbe", today: Date): BookingRecord[] {
  if (role === "privat")
    return [
      rec("r-1", "vw-golf", 3, 2, "angefragt", "Daniel K.", "privat", today, { km: { type: "extra", km: 100 } }),
      rec("r-2", "vw-golf", 20, 1, "bestaetigt", "Mira S.", "privat", today),
      rec("r-7", "vw-golf", -12, 3, "abgeschlossen", "Lea B.", "privat", today, { km: { type: "extra", km: 100 }, odo: [47320, 48075], renter: "Lea B.", host: "Laura" }),
    ];
  return [
    rec("r-3", "skoda-octavia-combi", 2, 2, "angefragt", "Reto W.", "privat", today, { km: { type: "extra", km: 250 } }),
    rec("r-4", "vw-transporter", 6, 1, "angefragt", "Sandra W.", "privat", today),
    rec("r-5", "toyota-yaris", 1, 1, "bestaetigt", "Marc A.", "privat", today),
    rec("r-6", "toyota-yaris", -10, 2, "abgeschlossen", "Aline G.", "privat", today, { odo: [61200, 61540], renter: "Aline G.", host: "CityDrive Bern GmbH" }),
    rec("r-8", "skoda-octavia-combi", 14, 0, "bestaetigt", "Nadia F.", "privat", today, { plan: { model: "langzeit", months: 3 } }),
    rec("r-9", "toyota-yaris", 21, 0, "angefragt", "Samuel T.", "privat", today, { plan: { model: "abo", months: 6, pkg: 1 } }),
  ];
}

export interface Message {
  from: "ich" | "sie";
  text: string;
  time: string;
}
export interface Thread {
  id: string;
  with: string;
  vehicleSlug: string;
  unread?: boolean;
  messages: Message[];
}
export const DEMO_THREADS: Record<"privat" | "gewerbe", Thread[]> = {
  privat: [
    { id: "m-1", with: "CityDrive Bern GmbH", vehicleSlug: "skoda-octavia-combi", unread: true, messages: [
      { from: "sie", text: "Hallo Laura, deine Buchung ist bestätigt. Den Zugangscode für die Schlüsselbox erhältst du am Vortag.", time: "Gestern, 16:12" },
      { from: "ich", text: "Super, danke! Kann ich den Kombi auch schon um 8 Uhr abholen?", time: "Gestern, 18:40" },
      { from: "sie", text: "Ja, das Fahrzeug steht ab 7 Uhr bereit.", time: "Heute, 07:55" },
    ] },
    { id: "m-2", with: "Daniel K.", vehicleSlug: "vw-golf", messages: [
      { from: "sie", text: "Hoi Laura, wäre der Golf von Freitag bis Sonntag frei? Wir möchten ins Berner Oberland.", time: "Mo, 12:03" },
      { from: "ich", text: "Hoi Daniel, ja, das passt. Ich bestätige die Anfrage heute Abend.", time: "Mo, 12:20" },
    ] },
  ],
  gewerbe: [
    { id: "m-3", with: "Reto W.", vehicleSlug: "skoda-octavia-combi", unread: true, messages: [
      { from: "sie", text: "Guten Tag, kann ich am Octavia einen Veloträger für die Anhängerkupplung montieren?", time: "Heute, 09:14" },
    ] },
    { id: "m-4", with: "Sandra W.", vehicleSlug: "vw-transporter", messages: [
      { from: "sie", text: "Sind Spanngurte im Transporter dabei?", time: "Di, 17:30" },
      { from: "ich", text: "Ja, sechs Spanngurte und zwei Decken sind im Laderaum.", time: "Di, 17:42" },
    ] },
  ],
};

export type FleetStatus = "aktiv" | "pausiert" | "vermietet" | "entwurf";
export interface FleetItem {
  id: string;
  name: string;
  category: CategoryId;
  location: string;
  status: FleetStatus;
  price: number;
  utilization: number;
  slug?: string;
}
export const FLEET_STATUS: Record<FleetStatus, string> = { aktiv: "Aktiv", pausiert: "Pausiert", vermietet: "In Miete", entwurf: "Entwurf" };
export const FLEET_LOCATIONS = ["Ostermundigen", "Bern Wankdorf", "Köniz Liebefeld"];
export const DEMO_FLEET: FleetItem[] = [
  { id: "cd-01", name: "Škoda Octavia Combi", category: "kombi", location: "Ostermundigen", status: "aktiv", price: 84, utilization: 72, slug: "skoda-octavia-combi" },
  { id: "cd-02", name: "Toyota Yaris Hybrid", category: "kleinwagen", location: "Bern Wankdorf", status: "vermietet", price: 64, utilization: 81, slug: "toyota-yaris" },
  { id: "cd-03", name: "Volkswagen Transporter Kastenwagen", category: "transporter", location: "Köniz Liebefeld", status: "aktiv", price: 109, utilization: 58, slug: "vw-transporter" },
  { id: "cd-04", name: "Škoda Octavia Combi", category: "kombi", location: "Bern Wankdorf", status: "pausiert", price: 84, utilization: 0 },
  { id: "cd-05", name: "Toyota Yaris Hybrid", category: "kleinwagen", location: "Ostermundigen", status: "aktiv", price: 64, utilization: 66 },
  { id: "cd-06", name: "Hyundai Kona Elektro", category: "elektro", location: "Bern Wankdorf", status: "aktiv", price: 89, utilization: 54 },
  { id: "cd-07", name: "Ford Tourneo Custom", category: "familienauto", location: "Köniz Liebefeld", status: "entwurf", price: 129, utilization: 0 },
  { id: "cd-08", name: "Volkswagen ID.3", category: "elektro", location: "Ostermundigen", status: "aktiv", price: 79, utilization: 61 },
];

export const DEMO_STAFF = [
  { name: "Tobias Meier", role: "Inhaber, alle Rechte" },
  { name: "Nora Kälin", role: "Disposition: Buchungen und Übergaben" },
  { name: "Yves Rüegg", role: "Werkstatt: Fahrzeugstatus" },
];

export const PRIVATE_EARNINGS = [
  { label: "Apr", value: 0 }, { label: "Mai", value: 138 }, { label: "Jun", value: 276 },
  { label: "Jul", value: 414 }, { label: "Aug", value: 345 }, { label: "Sep", value: 207 },
];
export const BUSINESS_REVENUE = [3180, 3420, 3950, 3710, 4260, 4480, 4120, 4890, 5230, 4970, 5410, 5120].map((value, i) => ({ label: `KW ${27 + i}`, value }));
