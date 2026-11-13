import { chf } from "./format";
import { fmtKm, validateMileage, type MileageForm } from "./mileage";

/*
 * Mietmodelle
 * Private Anbieter vermieten kurzzeitig mit Tagespreis. Gewerbliche Anbieter wählen pro Fahrzeug Kurzzeitmiete,
 * Langzeitmiete und/oder Auto-Abo, optional mit Preisstaffel. Ein weiteres Modell braucht einen Eintrag in OfferKind
 * und OFFER_KINDS, seine Daten in Offers, eine Preisangabe in priceTag() und einen Plan für die Buchung.
 * Buchungen speichern die Konditionen als Momentaufnahme – spätere Änderungen wirken nicht rückwirkend.
 * Langzeitmiete und Auto-Abo zeigen den Preis immer pro Monat, einmalige Kosten separat – nie ein Total über die Laufzeit.
 */

export type OfferKind = "kurzzeit" | "langzeit" | "abo";
export const OFFER_KINDS: { id: OfferKind; label: string; tab: string; hint: string }[] = [
  { id: "kurzzeit", label: "Kurzzeitmiete", tab: "Kurzzeit", hint: "Tage bis einige Wochen, Preis pro Tag" },
  { id: "langzeit", label: "Langzeitmiete", tab: "Langzeit", hint: "Ab einem Monat, Preis pro Monat" },
  { id: "abo", label: "Auto-Abo", tab: "Auto-Abo", hint: "Fixer Monatspreis mit Laufzeit und Leistungen" },
];
export const offerLabel = (k: OfferKind) => OFFER_KINDS.find((o) => o.id === k)!.label;

export type Coverage = "vollkasko" | "teilkasko" | "haftpflicht";
export const COVERAGE: Record<Coverage, string> = { vollkasko: "Vollkasko", teilkasko: "Teilkasko", haftpflicht: "Haftpflicht" };

export type AboService = "versicherung" | "wartung" | "service" | "reifen" | "verkehrssteuer" | "zulassung" | "pannenhilfe" | "vignette";
export const ABO_SERVICES: Record<AboService, string> = {
  versicherung: "Versicherung", wartung: "Wartung", service: "Service", reifen: "Reifen",
  verkehrssteuer: "Verkehrssteuer", zulassung: "Zulassung", pannenhilfe: "Pannenhilfe", vignette: "Vignette",
};

/** Kurzzeitmiete. Tagespreis (price) und Kilometer (mileage) stehen direkt am Fahrzeug. */
export interface ShortTerms { minDays?: number; maxDays?: number; deposit?: number; deductible?: number; coverage?: Coverage }
export interface LongOffer { monthly: number; minMonths: number; kmPerMonth: number; extraKmPrice: number; deposit?: number; notice?: string; extension?: string }
export interface KmPackage { km: number; surcharge: number }
export interface AboOffer {
  monthly: number;
  startFee?: number;
  deposit?: number;
  minMonths: number;
  noticeMonths: number;
  maxMonths?: number;
  /** Kilometerpakete pro Monat; das erste ist im Monatspreis enthalten */
  packages: KmPackage[];
  extraKmPrice: number;
  included: AboService[];
  includedText?: string;
  addons?: { label: string; monthly: number }[];
}
/** Preisstaffel: ab «from» Tagen gilt ein Tagespreis (Kurzzeit), ab «from» Monaten ein Monatspreis (Langzeit) */
export interface PriceTier { from: number; unit: "tage" | "monate"; price: number }
export interface Offers { models: OfferKind[]; short?: ShortTerms; long?: LongOffer; abo?: AboOffer; tiers?: PriceTier[] }

type Priced = { price: number; priceVaries?: boolean; mileage: { perDay: number }; offers?: Offers };
const ONLY_SHORT: Offers = { models: ["kurzzeit"] };
export const offersOf = (v: Priced): Offers => v.offers ?? ONLY_SHORT;
export const hasModel = (v: Priced, k: OfferKind) => offersOf(v).models.includes(k);

const tierFor = (o: Offers, unit: PriceTier["unit"], n: number) => (o.tiers ?? []).filter((t) => t.unit === unit && n >= t.from).sort((a, b) => b.from - a.from)[0];
const tierPrices = (o: Offers, unit: PriceTier["unit"]) => (o.tiers ?? []).filter((t) => t.unit === unit).map((t) => t.price);

/** Tagespreis für eine Mietdauer, mit Preisstaffel */
export const dayPrice = (v: Priced, days: number) => tierFor(offersOf(v), "tage", days)?.price ?? v.price;
export const minDayPrice = (v: Priced) => Math.min(v.price, ...tierPrices(offersOf(v), "tage"));
/** Monatspreis der Langzeitmiete für eine Dauer, mit Preisstaffel */
export const monthPrice = (v: Priced, months: number) => tierFor(offersOf(v), "monate", months)?.price ?? offersOf(v).long?.monthly ?? 0;
export const minMonthPrice = (v: Priced) => Math.min(offersOf(v).long?.monthly ?? Infinity, ...tierPrices(offersOf(v), "monate"));

export const MONTH_STEPS = [1, 2, 3, 6, 12];
export const ABO_TERMS = [1, 3, 6, 12];
export const ABO_KM_STEPS = [1000, 1500, 2000, 3000];
export const monthChoices = (min: number, max?: number) => {
  const l = MONTH_STEPS.filter((m) => m >= min && (!max || m <= max));
  return l.length ? l : [min];
};
export const fmtMonths = (n: number) => `${n} ${n === 1 ? "Monat" : "Monate"}`;

/** Momentaufnahme einer Langzeitmiete oder eines Auto-Abos in der Buchung */
export interface Plan {
  model: "langzeit" | "abo";
  months: number;
  /** Preis pro Monat inklusive Kilometerpaket und Zusatzleistungen */
  monthly: number;
  /** Grundpreis pro Monat; monthly = base + extras */
  base?: number;
  /** Aufpreise pro Monat: grösseres Kilometerpaket, Zusatzleistungen */
  extras?: { label: string; monthly: number }[];
  kmPerMonth: number;
  extraKmPrice: number;
  minMonths: number;
  noticeMonths?: number;
  /** Einmalig, wird nie in den Monatspreis eingerechnet */
  startFee?: number;
  deposit?: number;
}
export function longPlan(v: Priced, months: number): Plan {
  const l = offersOf(v).long!;
  const monthly = monthPrice(v, months);
  return { model: "langzeit", months, monthly, base: monthly, kmPerMonth: l.kmPerMonth, extraKmPrice: l.extraKmPrice, minMonths: l.minMonths, ...(l.deposit ? { deposit: l.deposit } : {}) };
}
export function aboPlan(v: Priced, months: number, pkg = 0, addons: number[] = []): Plan {
  const a = offersOf(v).abo!;
  const p = a.packages[pkg] ?? a.packages[0];
  const extras = [
    ...(p.surcharge ? [{ label: `Kilometerpaket ${fmtKm(p.km)}`, monthly: p.surcharge }] : []),
    ...(a.addons ?? []).filter((_, i) => addons.includes(i)),
  ];
  return {
    model: "abo", months, monthly: a.monthly + extras.reduce((s, x) => s + x.monthly, 0), base: a.monthly, kmPerMonth: p.km, extraKmPrice: a.extraKmPrice,
    minMonths: a.minMonths, noticeMonths: a.noticeMonths, ...(extras.length ? { extras } : {}), ...(a.startFee ? { startFee: a.startFee } : {}), ...(a.deposit ? { deposit: a.deposit } : {}),
  };
}
/** Vertragswert über die ganze Laufzeit – nur intern gespeichert, angezeigt wird der Preis pro Monat */
export const planTotal = (p: Plan) => p.monthly * p.months + (p.startFee ?? 0);

/* Suche nach Mietdauer */
export type DurationMode = "tage" | "wochen" | "monate" | "abo";
export const DURATIONS: { id: DurationMode; label: string }[] = [
  { id: "tage", label: "Tage" }, { id: "wochen", label: "Wochen" }, { id: "monate", label: "Monate" }, { id: "abo", label: "Auto-Abo" },
];
export const modeForDays = (days: number): DurationMode => (days >= 28 ? "monate" : days >= 7 ? "wochen" : "tage");
/** Passt das Fahrzeug zur gesuchten Mietdauer? days: Anzahl Miettage, falls Daten gewählt sind */
export function fitsMode(v: Priced, mode: DurationMode, days?: number) {
  const o = offersOf(v);
  if (mode === "abo") return o.models.includes("abo");
  if (mode === "monate") return o.models.includes("langzeit") || o.models.includes("abo");
  if (!o.models.includes("kurzzeit")) return false;
  const s = o.short ?? {};
  const d = days ?? (mode === "wochen" ? 7 : 1);
  return (days === undefined || !s.minDays || d >= s.minDays) && (!s.maxDays || d <= s.maxDays);
}

/** Preisangabe für Fahrzeugkarten, passend zur gesuchten Mietdauer. once: einmalige Kosten, z. B. die Startgebühr eines Auto-Abos */
export interface PriceTag { kind: OfferKind; amount: number; unit: "Tag" | "Monat"; from: boolean; note: string; extra?: string; once?: string }
export function priceTag(v: Priced, mode?: DurationMode | ""): PriceTag {
  const o = offersOf(v);
  const order: OfferKind[] = mode === "abo" ? ["abo"] : mode === "monate" ? ["langzeit", "abo"] : ["kurzzeit", "langzeit", "abo"];
  const kind = order.find((k) => o.models.includes(k)) ?? o.models[0];
  if (kind === "langzeit" && o.long) {
    const m = minMonthPrice(v);
    return { kind, amount: m, unit: "Monat", from: m < o.long.monthly, note: `${fmtKm(o.long.kmPerMonth)} pro Monat inklusive` };
  }
  if (kind === "abo" && o.abo) {
    const a = o.abo;
    // «ab», sobald grössere Kilometerpakete oder Zusatzleistungen den Monatspreis erhöhen können
    return {
      kind, amount: a.monthly, unit: "Monat", from: a.packages.length > 1 || !!a.addons?.length, note: `${fmtKm(a.packages[0].km)} pro Monat inklusive`, extra: `Mindestlaufzeit ${fmtMonths(a.minMonths)}`,
      ...(a.startFee ? { once: `+ einmalige Startgebühr ${chf(a.startFee)}` } : {}),
    };
  }
  const d = minDayPrice(v);
  return { kind: "kurzzeit", amount: d, unit: "Tag", from: d < v.price || !!v.priceVaries, note: `${fmtKm(v.mileage.perDay)} pro Tag inklusive` };
}

/* Eingaben im Inserat-Assistenten (Zeichenketten wie in den Feldern) */
export interface OfferForm {
  modelle: OfferKind[];
  minTage: string; maxTage: string; kaution: string; selbstbehalt: string; deckung: "" | Coverage;
  lzPreis: string; lzMin: string; lzKm: string; lzKmPreis: string; lzKaution: string; lzKuendigung: string; lzVerlaengerung: string;
  aboPreis: string; aboStart: string; aboKaution: string; aboMin: string; aboFrist: string; aboMax: string;
  aboPakete: string[]; aboAufpreis: Record<string, string>; aboKmPreis: string; aboLeistungen: AboService[]; aboText: string;
  staffel: boolean; stTage2: string; stTage7: string; stMonat1: string; stMonat3: string; stMonat6: string;
}
export const OFFER_FORM_DEFAULT: OfferForm = {
  modelle: ["kurzzeit"], minTage: "1", maxTage: "", kaution: "", selbstbehalt: "", deckung: "",
  lzPreis: "", lzMin: "1", lzKm: "2000", lzKmPreis: "", lzKaution: "", lzKuendigung: "", lzVerlaengerung: "",
  aboPreis: "", aboStart: "", aboKaution: "", aboMin: "3", aboFrist: "1", aboMax: "",
  aboPakete: ["1500"], aboAufpreis: {}, aboKmPreis: "", aboLeistungen: ["versicherung", "service", "reifen"], aboText: "",
  staffel: false, stTage2: "", stTage7: "", stMonat1: "", stMonat3: "", stMonat6: "",
};
/** Feste Stufen der Preisstaffel im Formular */
export const STAFFEL: { key: "stTage2" | "stTage7" | "stMonat1" | "stMonat3" | "stMonat6"; label: string; from: number; unit: PriceTier["unit"] }[] = [
  { key: "stTage2", label: "2 bis 6 Tage", from: 2, unit: "tage" },
  { key: "stTage7", label: "7 bis 27 Tage", from: 7, unit: "tage" },
  { key: "stMonat1", label: "ab 28 Tagen", from: 1, unit: "monate" },
  { key: "stMonat3", label: "ab 3 Monaten", from: 3, unit: "monate" },
  { key: "stMonat6", label: "ab 6 Monaten", from: 6, unit: "monate" },
];

const money = (s: string) => Number(s.trim().replace(",", "."));
const whole = (s: string) => Number(s.replace(/[’' ]/g, ""));
const isMoney = (s: string, min: number, max: number) => /^\d+([.,]\d{1,2})?$/.test(s.replace(/[’' ]/g, "").trim()) && money(s.replace(/[’' ]/g, "")) >= min && money(s.replace(/[’' ]/g, "")) <= max;
const isWhole = (s: string, min: number, max: number) => /^\d+$/.test(s.replace(/[’' ]/g, "")) && whole(s) >= min && whole(s) <= max;
const opt = (s: string) => (s.trim() ? money(s.replace(/[’' ]/g, "")) : undefined);

type Full = OfferForm & MileageForm & { preis: string };
/**
 * Prüft die Angaben. base: Tagespreis und Kilometer der Kurzzeitmiete mitprüfen (im Assistenten ja,
 * im Editor der Flotte nein – dort werden Preis und Kilometer separat bearbeitet).
 */
export function validateOffers(f: Full, gewerbe: boolean, base = true): Record<string, string> {
  const e: Record<string, string> = {};
  const models = gewerbe ? f.modelle : ["kurzzeit"];
  const deposit = "Bitte gib einen Betrag in Franken ein oder lass das Feld leer.";
  if (gewerbe && !models.length) e.modelle = "Bitte wähle mindestens ein Mietmodell.";
  if (models.includes("kurzzeit")) {
    if (base) {
      const p = Number(f.preis);
      if (!p || p < 20 || p > 1000) e.preis = "Bitte gib einen Tagespreis zwischen CHF 20.– und CHF 1’000.– ein.";
      Object.assign(e, validateMileage(f));
    }
    if (gewerbe) {
      if (!isWhole(f.minTage, 1, 30)) e.minTage = "Bitte gib die Mindestmietdauer in Tagen ein (1 bis 30).";
      else if (f.maxTage.trim() && (!isWhole(f.maxTage, 1, 365) || whole(f.maxTage) < whole(f.minTage))) e.maxTage = "Die maximale Mietdauer muss mindestens der Mindestmietdauer entsprechen.";
    }
    if (f.kaution.trim() && !isMoney(f.kaution, 0, 20000)) e.kaution = deposit;
    if (f.selbstbehalt.trim() && !isMoney(f.selbstbehalt, 0, 20000)) e.selbstbehalt = deposit;
  }
  if (models.includes("langzeit")) {
    if (!isMoney(f.lzPreis, 100, 20000)) e.lzPreis = "Bitte gib einen Monatspreis zwischen CHF 100.– und CHF 20’000.– ein.";
    if (!isWhole(f.lzKm, 100, 20000)) e.lzKm = "Bitte gib die inklusiven Kilometer pro Monat ein, z. B. 2000.";
    if (!isMoney(f.lzKmPreis, 0.05, 5)) e.lzKmPreis = "Bitte gib einen Preis zwischen CHF 0.05 und CHF 5.– pro km ein.";
    if (f.lzKaution.trim() && !isMoney(f.lzKaution, 0, 20000)) e.lzKaution = deposit;
  }
  if (models.includes("abo")) {
    if (!isMoney(f.aboPreis, 100, 20000)) e.aboPreis = "Bitte gib einen Monatspreis zwischen CHF 100.– und CHF 20’000.– ein.";
    if (f.aboStart.trim() && !isMoney(f.aboStart, 0, 5000)) e.aboStart = deposit;
    if (f.aboKaution.trim() && !isMoney(f.aboKaution, 0, 20000)) e.aboKaution = deposit;
    if (f.aboMax.trim() && (!isWhole(f.aboMax, 1, 60) || whole(f.aboMax) < whole(f.aboMin))) e.aboMax = "Die maximale Laufzeit muss mindestens der Mindestlaufzeit entsprechen.";
    const pk = [...f.aboPakete].sort((a, b) => Number(a) - Number(b));
    if (!pk.length) e.aboPakete = "Bitte wähle mindestens ein Kilometerpaket.";
    else if (pk.slice(1).some((k) => !isMoney(f.aboAufpreis[k] ?? "", 0, 5000))) e.aboPakete = "Bitte gib für jedes grössere Paket den Aufpreis pro Monat ein.";
    if (!isMoney(f.aboKmPreis, 0.05, 5)) e.aboKmPreis = "Bitte gib einen Preis zwischen CHF 0.05 und CHF 5.– pro km ein.";
  }
  if (gewerbe && f.staffel) {
    const used = STAFFEL.filter((s) => (s.unit === "tage" ? models.includes("kurzzeit") : models.includes("langzeit")));
    if (!used.some((s) => f[s.key].trim())) e.staffel = "Bitte gib mindestens einen Staffelpreis ein oder schalte die Preisstaffel aus.";
    else if (used.some((s) => f[s.key].trim() && !isMoney(f[s.key], 1, 20000))) e.staffel = "Bitte gib die Staffelpreise in Franken ein.";
  }
  return e;
}

export function formToOffers(f: OfferForm, gewerbe: boolean): Offers {
  const models = gewerbe ? OFFER_KINDS.map((k) => k.id).filter((k) => f.modelle.includes(k)) : (["kurzzeit"] as OfferKind[]);
  const o: Offers = { models };
  if (models.includes("kurzzeit")) {
    const s: ShortTerms = {};
    if (gewerbe && whole(f.minTage) > 1) s.minDays = whole(f.minTage);
    if (gewerbe && f.maxTage.trim()) s.maxDays = whole(f.maxTage);
    if (opt(f.kaution)) s.deposit = opt(f.kaution);
    if (opt(f.selbstbehalt)) s.deductible = opt(f.selbstbehalt);
    if (f.deckung) s.coverage = f.deckung;
    if (Object.keys(s).length) o.short = s;
  }
  if (models.includes("langzeit")) {
    o.long = { monthly: opt(f.lzPreis) ?? 0, minMonths: whole(f.lzMin) || 1, kmPerMonth: whole(f.lzKm) || 0, extraKmPrice: opt(f.lzKmPreis) ?? 0 };
    if (opt(f.lzKaution)) o.long.deposit = opt(f.lzKaution);
    if (f.lzKuendigung.trim()) o.long.notice = f.lzKuendigung.trim();
    if (f.lzVerlaengerung.trim()) o.long.extension = f.lzVerlaengerung.trim();
  }
  if (models.includes("abo")) {
    const pk = [...f.aboPakete].sort((a, b) => Number(a) - Number(b));
    o.abo = {
      monthly: opt(f.aboPreis) ?? 0, minMonths: whole(f.aboMin) || 1, noticeMonths: whole(f.aboFrist) || 1,
      packages: pk.map((k, i) => ({ km: Number(k), surcharge: i ? (opt(f.aboAufpreis[k] ?? "") ?? 0) : 0 })),
      extraKmPrice: opt(f.aboKmPreis) ?? 0, included: f.aboLeistungen,
    };
    if (opt(f.aboStart)) o.abo.startFee = opt(f.aboStart);
    if (opt(f.aboKaution)) o.abo.deposit = opt(f.aboKaution);
    if (f.aboMax.trim()) o.abo.maxMonths = whole(f.aboMax);
    if (f.aboText.trim()) o.abo.includedText = f.aboText.trim();
  }
  if (gewerbe && f.staffel) {
    const tiers = STAFFEL.filter((s) => f[s.key].trim() && (s.unit === "tage" ? models.includes("kurzzeit") : models.includes("langzeit"))).map((s) => ({ from: s.from, unit: s.unit, price: opt(f[s.key])! }));
    if (tiers.length) o.tiers = tiers;
  }
  return o;
}

export function offersToForm(o: Offers): OfferForm {
  const s = o.short ?? {}, l = o.long, a = o.abo;
  const two = (n?: number) => (n === undefined ? "" : Number.isInteger(n) ? String(n) : n.toFixed(2));
  const tier = (unit: PriceTier["unit"], from: number) => two(o.tiers?.find((t) => t.unit === unit && t.from === from)?.price);
  return {
    ...OFFER_FORM_DEFAULT,
    modelle: [...o.models],
    minTage: String(s.minDays ?? 1), maxTage: two(s.maxDays), kaution: two(s.deposit), selbstbehalt: two(s.deductible), deckung: s.coverage ?? "",
    ...(l ? { lzPreis: two(l.monthly), lzMin: String(l.minMonths), lzKm: String(l.kmPerMonth), lzKmPreis: l.extraKmPrice.toFixed(2), lzKaution: two(l.deposit), lzKuendigung: l.notice ?? "", lzVerlaengerung: l.extension ?? "" } : {}),
    ...(a
      ? {
          aboPreis: two(a.monthly), aboStart: two(a.startFee), aboKaution: two(a.deposit), aboMin: String(a.minMonths), aboFrist: String(a.noticeMonths), aboMax: two(a.maxMonths),
          aboPakete: a.packages.map((p) => String(p.km)), aboAufpreis: Object.fromEntries(a.packages.slice(1).map((p) => [String(p.km), two(p.surcharge)])),
          aboKmPreis: a.extraKmPrice.toFixed(2), aboLeistungen: [...a.included], aboText: a.includedText ?? "",
        }
      : {}),
    staffel: !!o.tiers?.length, stTage2: tier("tage", 2), stTage7: tier("tage", 7), stMonat1: tier("monate", 1), stMonat3: tier("monate", 3), stMonat6: tier("monate", 6),
  };
}

/** Offer-Felder aus einem gespeicherten Inserat übernehmen (ältere Inserate ergänzt mit Standardwerten) */
export function pickOffers(x: Partial<OfferForm>): OfferForm {
  const f: Record<string, unknown> = { ...OFFER_FORM_DEFAULT };
  for (const key of Object.keys(OFFER_FORM_DEFAULT) as (keyof OfferForm)[]) if (x[key] !== undefined) f[key] = x[key];
  return f as unknown as OfferForm;
}
