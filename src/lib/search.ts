import { VEHICLES, type CategoryId, type Fuel, type Vehicle } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import { distanceKm, findPlace, type Place } from "@/data/places";
import { dayDiff } from "./format";
import { rentalDays } from "./pricing";
import { DURATIONS, dayPrice, fitsMode, modeForDays, priceTag, type DurationMode } from "./offers";

export type ProviderFilter = "alle" | "privat" | "gewerblich";
export type SortKey = "empfohlen" | "preis-auf" | "preis-ab" | "bewertung" | "entfernung";

export interface Criteria {
  ort: string;
  von: string;
  bis: string;
  anbieter: ProviderFilter;
  preisMin: number;
  preisMax: number;
  kategorien: CategoryId[];
  marke: string;
  getriebe: "" | "automatik" | "manuell";
  antrieb: Fuel[];
  sitze: number;
  sofort: boolean;
  kontaktlos: boolean;
  umkreis: number;
  sort: SortKey | "";
  ansicht: "liste" | "karte";
  /** Mietdauer: Tage, Wochen, Monate oder Auto-Abo (leer: aus dem Zeitraum abgeleitet) */
  dauer: "" | DurationMode;
}

export const PRICE_CEIL = 200;
export const DEFAULT_CRITERIA: Criteria = {
  ort: "", von: "", bis: "", anbieter: "alle", preisMin: 0, preisMax: PRICE_CEIL, kategorien: [], marke: "",
  getriebe: "", antrieb: [], sitze: 0, sofort: false, kontaktlos: false, umkreis: 0, sort: "", ansicht: "liste", dauer: "",
};
const FUELS: Fuel[] = ["Benzin", "Diesel", "Elektro", "Hybrid"];
const CATS: CategoryId[] = ["kleinwagen", "kombi", "suv", "elektro", "cabriolet", "transporter", "familienauto"];
const SORTS: SortKey[] = ["empfohlen", "preis-auf", "preis-ab", "bewertung", "entfernung"];
const isDT = (s: string | null) => (s && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? s : "");
const list = (s: string | null) => (s ? s.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean) : []);
const int = (s: string | null, d: number) => (s && /^\d+$/.test(s) ? Number(s) : d);

export function parseCriteria(sp: URLSearchParams): Criteria {
  const a = sp.get("anbieter");
  const g = sp.get("getriebe");
  const s = sp.get("sortierung") as SortKey | null;
  return {
    ort: (sp.get("ort") ?? "").slice(0, 80),
    von: isDT(sp.get("von")),
    bis: isDT(sp.get("bis")),
    anbieter: a === "privat" || a === "gewerblich" ? a : "alle",
    preisMin: Math.min(int(sp.get("preis-min"), 0), PRICE_CEIL),
    preisMax: Math.min(int(sp.get("preis-max"), PRICE_CEIL), PRICE_CEIL),
    kategorien: list(sp.get("kategorie")).filter((c): c is CategoryId => CATS.includes(c as CategoryId)),
    marke: sp.get("marke") ?? "",
    getriebe: g === "automatik" || g === "manuell" ? g : "",
    antrieb: list(sp.get("antrieb")).map((f) => FUELS.find((x) => x.toLowerCase() === f)).filter((f): f is Fuel => !!f),
    sitze: int(sp.get("sitze"), 0),
    sofort: sp.get("sofort") === "1",
    kontaktlos: sp.get("kontaktlos") === "1",
    umkreis: int(sp.get("umkreis"), 0),
    sort: s && SORTS.includes(s) ? s : "",
    ansicht: sp.get("ansicht") === "karte" ? "karte" : "liste",
    dauer: DURATIONS.some((d) => d.id === sp.get("dauer")) ? (sp.get("dauer") as DurationMode) : "",
  };
}

export function serializeCriteria(c: Criteria) {
  const p = new URLSearchParams();
  if (c.ort) p.set("ort", c.ort);
  if (c.von) p.set("von", c.von);
  if (c.bis) p.set("bis", c.bis);
  p.set("anbieter", c.anbieter);
  if (c.preisMin > 0) p.set("preis-min", String(c.preisMin));
  if (c.preisMax < PRICE_CEIL) p.set("preis-max", String(c.preisMax));
  if (c.kategorien.length) p.set("kategorie", c.kategorien.join(","));
  if (c.marke) p.set("marke", c.marke);
  if (c.getriebe) p.set("getriebe", c.getriebe);
  if (c.antrieb.length) p.set("antrieb", c.antrieb.map((f) => f.toLowerCase()).join(","));
  if (c.sitze) p.set("sitze", String(c.sitze));
  if (c.sofort) p.set("sofort", "1");
  if (c.kontaktlos) p.set("kontaktlos", "1");
  if (c.umkreis) p.set("umkreis", String(c.umkreis));
  if (c.sort) p.set("sortierung", c.sort);
  if (c.ansicht === "karte") p.set("ansicht", "karte");
  if (c.dauer) p.set("dauer", c.dauer);
  return p.toString();
}

/** Anzahl aktiver Zusatzfilter (ohne Ort, Datum, Anbieterart, Sortierung, Ansicht). */
export function activeFilterCount(c: Criteria) {
  return [c.preisMin > 0 || c.preisMax < PRICE_CEIL, c.kategorien.length > 0, !!c.marke, !!c.getriebe, c.antrieb.length > 0, c.sitze > 0, c.sofort, c.kontaktlos, c.umkreis > 0].filter(Boolean).length;
}

export interface Result {
  v: Vehicle;
  distance?: number;
}

export function matchesProvider(v: Vehicle, filter: ProviderFilter) {
  const kind = providerOf(v).kind;
  return filter === "alle" || (filter === "privat" ? kind === "privat" : kind === "gewerbe");
}

export function applyCriteria(c: Criteria, today: Date): { results: Result[]; place: Place | null; unavailable: number; sort: SortKey; mode: DurationMode | "" } {
  const place = findPlace(c.ort);
  const from = c.von ? new Date(c.von) : null;
  const to = c.bis ? new Date(c.bis) : null;
  const days = from && to && to > from ? rentalDays(from, to) : undefined;
  // Mietdauer: ausdrücklich gewählt oder aus dem Zeitraum abgeleitet
  const mode: DurationMode | "" = c.dauer || (days ? modeForDays(days) : "");
  let unavailable = 0;
  const results: Result[] = [];
  for (const v of VEHICLES) {
    const distance = place ? distanceKm(place, v) : undefined;
    if (!matchesProvider(v, c.anbieter)) continue;
    if (mode && !fitsMode(v, mode, days)) continue;
    // Der Preisfilter gilt für Tagespreise; Monatspreise (Langzeit, Auto-Abo) filtert er nicht
    const tag = priceTag(v, mode);
    const perDay = tag.unit === "Tag" ? (days ? dayPrice(v, days) : tag.amount) : null;
    if (perDay !== null && (perDay < c.preisMin || (c.preisMax < PRICE_CEIL && perDay > c.preisMax))) continue;
    if (c.kategorien.length && !c.kategorien.some((k) => v.categories.includes(k))) continue;
    if (c.marke && v.make !== c.marke) continue;
    if (c.getriebe && v.gear.toLowerCase() !== c.getriebe) continue;
    if (c.antrieb.length && !c.antrieb.includes(v.fuel)) continue;
    if (c.sitze && v.seats < c.sitze) continue;
    if (c.sofort && !v.instant) continue;
    if (c.kontaktlos && !v.contactless) continue;
    if (place && c.umkreis && distance! > c.umkreis) continue;
    if (from && to) {
      const a = dayDiff(today, from), b = dayDiff(today, to);
      if (v.blocked.some((d) => d >= a && d <= b)) {
        unavailable++;
        continue;
      }
    }
    results.push({ v, distance });
  }
  const sort: SortKey = c.sort || (place ? "entfernung" : "empfohlen");
  // Sortiert wird nach dem Preis auf der Karte; Monatspreise zwischen Tagespreisen umgerechnet auf einen Tag
  const monthly = mode === "monate" || mode === "abo";
  const amount = (r: Result) => {
    const t = priceTag(r.v, mode);
    return t.unit === "Monat" && !monthly ? t.amount / 30 : t.amount;
  };
  const by: Record<SortKey, (a: Result, b: Result) => number> = {
    empfohlen: (a, b) => Number(!!b.v.popular) - Number(!!a.v.popular) || b.v.rating - a.v.rating,
    "preis-auf": (a, b) => amount(a) - amount(b),
    "preis-ab": (a, b) => amount(b) - amount(a),
    bewertung: (a, b) => b.v.rating - a.v.rating || b.v.reviewCount - a.v.reviewCount,
    entfernung: (a, b) => (a.distance ?? 0) - (b.distance ?? 0),
  };
  results.sort(by[sort === "entfernung" && !place ? "empfohlen" : sort]);
  return { results, place, unavailable, sort, mode };
}
