import { chf, num } from "@/lib/format";

/*
 * Kilometerregelung
 * Vermietende legen die Bedingungen im Inserat fest (MileagePolicy). Bei der Buchung wird daraus eine
 * Momentaufnahme (BookingKm), die unverändert gilt, auch wenn das Inserat später geändert wird.
 * Kilometerstände, Nachbuchungen und der Betrag für Mehrkilometer stehen im Protokoll der Buchung (KmLog).
 * Beträge in CHF, gerundet auf 5 Rappen.
 */

/** Einstellungen eines Inserats */
export interface MileagePolicy {
  /** Inklusive Kilometer pro Miettag */
  perDay: number;
  /** Staffelung für längere Mieten, z. B. ab 4 Tagen 150 km pro Tag. Vorbereitet, noch ohne Eingabemaske. */
  tiers?: { fromDays: number; perDay: number }[];
  /** Preis pro Zusatzkilometer bei Vorausbuchung */
  extraPrice: number;
  /** Preis pro Mehrkilometer nach der Rückgabe. Fehlt er, gilt extraPrice. */
  overagePrice?: number;
  /** Unlimited-Paket mit optionaler Fair-Use-Grenze pro Buchung */
  unlimited?: { price: number; per: "tag" | "buchung"; fairUse?: number };
  /** Maximal zulässige Kilometer pro Buchung */
  maxKm?: number;
}

export const DEFAULT_PER_DAY = 200;
export const PER_DAY_OPTIONS = [100, 150, 200, 250, 300, 500];
export const EXTRA_PACKAGES = [100, 250, 500];

export const round05 = (x: number) => Math.round(x * 20) / 20;
/** «1’500 km» – mit geschütztem Leerzeichen, damit Zahl und Einheit nicht getrennt umbrechen */
export const fmtKm = (n: number) => `${num(n)}\u00a0km`;
export const overagePriceOf = (p: MileagePolicy) => p.overagePrice ?? p.extraPrice;
export const unlimitedLabel = (u: NonNullable<MileagePolicy["unlimited"]>) => `${chf(u.price)} ${u.per === "tag" ? "pro Miettag" : "pro Buchung"}`;

/** Kilometer pro Tag für eine Mietdauer, mit allfälliger Staffelung */
export function perDayFor(p: MileagePolicy, days: number) {
  const tier = [...(p.tiers ?? [])].sort((a, b) => a.fromDays - b.fromDays).filter((t) => days >= t.fromDays).at(-1);
  return tier ? tier.perDay : p.perDay;
}

/** Wahl der mietenden Person */
export type MileageChoice = { type: "inklusive" } | { type: "extra"; km: number } | { type: "unlimited" };

/** Kilometerbedingungen einer Buchung */
export interface BookingKm {
  days: number;
  perDay: number;
  /** perDay × days, höchstens maxKm */
  included: number;
  /** Vorab gebuchte Zusatzkilometer */
  extra: number;
  extraCost: number;
  extraPrice: number;
  overagePrice: number;
  unlimited?: { cost: number; cap?: number };
  maxKm?: number;
}

export function bookingKm(p: MileagePolicy, days: number, choice: MileageChoice = { type: "inklusive" }): BookingKm {
  const perDay = perDayFor(p, days);
  const k: BookingKm = { days, perDay, included: Math.min(perDay * days, p.maxKm ?? Infinity), extra: 0, extraCost: 0, extraPrice: p.extraPrice, overagePrice: overagePriceOf(p) };
  if (p.maxKm) k.maxKm = p.maxKm;
  if (choice.type === "unlimited" && p.unlimited) {
    const cap = p.unlimited.fairUse ?? p.maxKm;
    k.unlimited = { cost: round05(p.unlimited.per === "tag" ? p.unlimited.price * days : p.unlimited.price), ...(cap ? { cap } : {}) };
  } else if (choice.type === "extra" && choice.km > 0) {
    k.extra = Math.round(choice.km);
    k.extraCost = round05(k.extra * p.extraPrice);
  }
  return k;
}

/** Kosten der Kilometerwahl bei der Buchung */
export const kmCost = (k: BookingKm) => k.unlimited?.cost ?? k.extraCost;
/** Erlaubte Kilometer total; null bei unbegrenzten Kilometern ohne Grenze */
export const allowedKm = (k: BookingKm, topUpKm = 0) => (k.unlimited ? (k.unlimited.cap ?? null) : k.included + k.extra + topUpKm);
/** Wie viele Zusatzkilometer bis zum Maximum noch möglich sind */
export const extraRoom = (k: BookingKm, topUpKm = 0) => (k.maxKm ? Math.max(0, k.maxKm - k.included - k.extra - topUpKm) : Infinity);

/** Kilometerstand bei Übergabe oder Rückgabe */
export interface OdometerReading {
  km: number;
  /** Zeitpunkt der Erfassung (ISO) */
  at: string;
  /** Dateiname des Tachofotos. In der Vorschau bleibt das Foto auf dem Gerät. */
  photo: string;
  bookingId: string;
  renter: string;
  host: string;
  by: "mieter" | "vermieter";
}
export interface TopUp { km: number; cost: number; at: string }
/** Betrag für Mehrkilometer. Vorbereitet für die spätere Abrechnung über Zahlungsmittel oder Kaution. */
export interface KmCharge { km: number; price: number; amount: number; status: "offen" | "bezahlt" | "kaution"; createdAt: string }
export interface KmLog { pickup?: OdometerReading; dropoff?: OdometerReading; topUps?: TopUp[]; charge?: KmCharge }

export const topUpKm = (log: KmLog) => (log.topUps ?? []).reduce((s, t) => s + t.km, 0);
export const topUpCost = (log: KmLog) => (log.topUps ?? []).reduce((s, t) => s + t.cost, 0);

/** Abrechnung nach der Rückgabe */
export function settle(k: BookingKm, log: KmLog) {
  if (!log.pickup || !log.dropoff) return null;
  const driven = Math.max(0, log.dropoff.km - log.pickup.km);
  const allowed = allowedKm(k, topUpKm(log));
  const over = allowed === null ? 0 : Math.max(0, driven - allowed);
  return { driven, allowed, over, price: k.overagePrice, cost: round05(over * k.overagePrice) };
}

export function chargeFor(k: BookingKm, log: KmLog): KmCharge | undefined {
  const s = settle(k, log);
  return s && s.over > 0 ? { km: s.over, price: s.price, amount: s.cost, status: "offen", createdAt: log.dropoff!.at } : undefined;
}

/* Eingaben der Vermietenden (Zeichenketten wie in den Feldern) */
export interface MileageForm {
  kmTag: string;
  kmPreis: string;
  kmUeberAktiv: boolean;
  kmUeber: string;
  kmUnlimited: boolean;
  kmUnlimitedPreis: string;
  kmUnlimitedPro: "tag" | "buchung";
  kmFairUse: string;
  kmMax: string;
}

export const MILEAGE_FORM_DEFAULT: MileageForm = {
  kmTag: String(DEFAULT_PER_DAY), kmPreis: "", kmUeberAktiv: false, kmUeber: "", kmUnlimited: false, kmUnlimitedPreis: "", kmUnlimitedPro: "tag", kmFairUse: "", kmMax: "",
};

const money = (s: string) => Number(s.trim().replace(",", "."));
const whole = (s: string) => Number(s.replace(/[’' ]/g, ""));
const isMoney = (s: string, min: number, max: number) => /^\d+([.,]\d{1,2})?$/.test(s.trim()) && money(s) >= min && money(s) <= max;
const isWhole = (s: string, min: number, max: number) => /^\d+$/.test(s.replace(/[’' ]/g, "")) && whole(s) >= min && whole(s) <= max;

export function validateMileage(f: MileageForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!isWhole(f.kmTag, 10, 2000)) e.kmTag = "Bitte gib zwischen 10 und 2’000 km pro Tag ein.";
  if (!isMoney(f.kmPreis, 0.05, 5)) e.kmPreis = "Bitte gib einen Preis zwischen CHF 0.05 und CHF 5.– pro km ein, z. B. 0.30.";
  if (f.kmUeberAktiv && !isMoney(f.kmUeber, 0.05, 5)) e.kmUeber = "Bitte gib einen Preis zwischen CHF 0.05 und CHF 5.– pro km ein, z. B. 0.40.";
  if (f.kmUnlimited) {
    if (!isMoney(f.kmUnlimitedPreis, 1, 1000)) e.kmUnlimitedPreis = "Bitte gib einen Preis zwischen CHF 1.– und CHF 1’000.– ein.";
    if (f.kmFairUse.trim() && !isWhole(f.kmFairUse, 100, 100000)) e.kmFairUse = "Bitte gib die Grenze in ganzen Kilometern ein (mindestens 100 km) oder lass das Feld leer.";
  }
  if (f.kmMax.trim()) {
    if (!isWhole(f.kmMax, 100, 100000)) e.kmMax = "Bitte gib das Maximum in ganzen Kilometern ein (mindestens 100 km) oder lass das Feld leer.";
    else if (!e.kmTag && whole(f.kmMax) < whole(f.kmTag)) e.kmMax = `Das Maximum muss mindestens einem Miettag entsprechen (${fmtKm(whole(f.kmTag))}).`;
  }
  return e;
}

/** Kilometer-Felder aus einem gespeicherten Inserat übernehmen (ältere Inserate ergänzt mit Standardwerten) */
export function pickMileage(x: Partial<MileageForm>): MileageForm {
  const f: Record<string, unknown> = { ...MILEAGE_FORM_DEFAULT };
  for (const key of Object.keys(MILEAGE_FORM_DEFAULT) as (keyof MileageForm)[]) if (x[key] !== undefined) f[key] = x[key];
  return f as unknown as MileageForm;
}

export function formToPolicy(f: MileageForm): MileagePolicy {
  const p: MileagePolicy = { perDay: whole(f.kmTag) || DEFAULT_PER_DAY, extraPrice: money(f.kmPreis) || 0 };
  if (f.kmUeberAktiv && f.kmUeber.trim()) p.overagePrice = money(f.kmUeber);
  if (f.kmUnlimited && f.kmUnlimitedPreis.trim()) p.unlimited = { price: money(f.kmUnlimitedPreis), per: f.kmUnlimitedPro, ...(f.kmFairUse.trim() ? { fairUse: whole(f.kmFairUse) } : {}) };
  if (f.kmMax.trim()) p.maxKm = whole(f.kmMax);
  return p;
}

export function policyToForm(p: MileagePolicy): MileageForm {
  const two = (n: number) => n.toFixed(2);
  const split = p.overagePrice !== undefined && p.overagePrice !== p.extraPrice;
  return {
    kmTag: String(p.perDay), kmPreis: two(p.extraPrice), kmUeberAktiv: split, kmUeber: split ? two(p.overagePrice!) : "",
    kmUnlimited: !!p.unlimited, kmUnlimitedPreis: p.unlimited ? String(p.unlimited.price) : "", kmUnlimitedPro: p.unlimited?.per ?? "tag",
    kmFairUse: p.unlimited?.fairUse ? String(p.unlimited.fairUse) : "", kmMax: p.maxKm ? String(p.maxKm) : "",
  };
}
