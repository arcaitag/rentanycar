// Kleines Ortsverzeichnis für die Demo-Suche (ohne externe API) und Grundlagen der stilisierten Karte.

export interface Place {
  name: string;
  plz: [number, number];
  lat: number;
  lng: number;
  aliases?: string[];
}

export const PLACES: Place[] = [
  { name: "Bern", plz: [3000, 3030], lat: 46.948, lng: 7.447 },
  { name: "Zürich", plz: [8000, 8099], lat: 47.377, lng: 8.54, aliases: ["zurich", "zuerich"] },
  { name: "Basel", plz: [4000, 4059], lat: 47.559, lng: 7.588, aliases: ["bale"] },
  { name: "Luzern", plz: [6000, 6015], lat: 47.05, lng: 8.309, aliases: ["lucerne"] },
  { name: "Lausanne", plz: [1000, 1018], lat: 46.52, lng: 6.633 },
  { name: "Genf", plz: [1200, 1299], lat: 46.204, lng: 6.143, aliases: ["geneve", "geneva"] },
  { name: "Ostermundigen", plz: [3072, 3072], lat: 46.957, lng: 7.49 },
  { name: "St. Gallen", plz: [9000, 9016], lat: 47.424, lng: 9.377, aliases: ["st gallen", "sankt gallen"] },
  { name: "Winterthur", plz: [8400, 8411], lat: 47.5, lng: 8.724 },
  { name: "Thun", plz: [3600, 3645], lat: 46.758, lng: 7.628 },
  { name: "Biel/Bienne", plz: [2500, 2505], lat: 47.137, lng: 7.247, aliases: ["biel", "bienne"] },
  { name: "Fribourg", plz: [1700, 1709], lat: 46.806, lng: 7.162, aliases: ["freiburg"] },
  { name: "Lugano", plz: [6900, 6917], lat: 46.004, lng: 8.951 },
  { name: "Chur", plz: [7000, 7007], lat: 46.85, lng: 9.532 },
  { name: "Aarau", plz: [5000, 5004], lat: 47.39, lng: 8.045 },
  { name: "Solothurn", plz: [4500, 4509], lat: 47.208, lng: 7.537 },
  { name: "Neuchâtel", plz: [2000, 2008], lat: 46.99, lng: 6.931, aliases: ["neuenburg", "neuchatel"] },
  { name: "Burgdorf", plz: [3400, 3401], lat: 47.059, lng: 7.628 },
  { name: "Köniz", plz: [3097, 3098], lat: 46.924, lng: 7.414, aliases: ["koniz", "koeniz", "liebefeld"] },
  { name: "Sion", plz: [1950, 1951], lat: 46.233, lng: 7.36, aliases: ["sitten"] },
  { name: "Zug", plz: [6300, 6304], lat: 47.166, lng: 8.515 },
  { name: "Olten", plz: [4600, 4603], lat: 47.35, lng: 7.907 },
  { name: "Schaffhausen", plz: [8200, 8208], lat: 47.696, lng: 8.635 },
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/sankt/g, "st").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export function findPlace(input: string): Place | null {
  const q = input.trim();
  if (!q) return null;
  const digits = q.match(/\b\d{2,4}\b/)?.[0];
  if (digits) {
    const n = Number(digits);
    if (digits.length === 4) return PLACES.find((p) => n >= p.plz[0] && n <= p.plz[1]) ?? null;
    return PLACES.find((p) => String(p.plz[0]).startsWith(digits)) ?? null;
  }
  const t = norm(q);
  const names = (p: Place) => [norm(p.name), ...(p.aliases ?? [])];
  return (
    PLACES.find((p) => names(p).includes(t)) ??
    PLACES.find((p) => names(p).some((n) => n.startsWith(t) || t.startsWith(n))) ??
    PLACES.find((p) => names(p).some((n) => t.includes(n))) ??
    null
  );
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const nearestPlace = (lat: number, lng: number) =>
  PLACES.reduce((best, p) => (distanceKm({ lat, lng }, p) < distanceKm({ lat, lng }, best) ? p : best), PLACES[0]);

// Stark vereinfachte Landesgrenze und Seen (lng, lat) – nur für die stilisierte Demo-Karte.
export const CH_OUTLINE: [number, number][] = [
  [7.59, 47.59], [7.7, 47.54], [7.95, 47.55], [8.23, 47.61], [8.43, 47.57], [8.56, 47.63], [8.47, 47.72], [8.6, 47.8], [8.73, 47.72], [8.87, 47.7],
  [9.02, 47.68], [9.19, 47.66], [9.4, 47.55], [9.56, 47.5], [9.67, 47.4], [9.53, 47.28], [9.49, 47.06], [9.61, 47.05], [9.87, 47.02], [10.1, 46.86],
  [10.23, 46.87], [10.39, 46.98], [10.49, 46.86], [10.45, 46.64], [10.3, 46.55], [10.1, 46.61], [10.04, 46.44], [10.17, 46.25], [9.97, 46.38],
  [9.72, 46.3], [9.55, 46.3], [9.46, 46.5], [9.28, 46.48], [9.28, 46.3], [9.17, 46.17], [9.04, 45.92], [9.03, 45.82], [8.92, 45.87], [8.79, 46.0],
  [8.72, 46.1], [8.6, 46.13], [8.44, 46.23], [8.45, 46.46], [8.3, 46.41], [8.08, 46.26], [7.99, 46.1], [7.86, 45.92], [7.55, 45.99], [7.17, 45.87],
  [7.04, 45.93], [6.87, 46.09], [6.79, 46.25], [6.85, 46.4], [6.56, 46.43], [6.24, 46.3], [5.96, 46.14], [6.12, 46.39], [6.07, 46.55], [6.44, 46.76],
  [6.46, 46.9], [6.7, 47.04], [6.96, 47.25], [6.87, 47.36], [7.0, 47.5], [7.22, 47.44], [7.38, 47.43], [7.52, 47.5],
];
export const LAKES: [number, number][][] = [
  [[6.15, 46.21], [6.25, 46.3], [6.45, 46.4], [6.65, 46.46], [6.85, 46.44], [6.92, 46.39], [6.8, 46.38], [6.6, 46.41], [6.42, 46.35], [6.25, 46.26]],
  [[6.64, 46.78], [6.8, 46.92], [6.96, 47.01], [7.0, 46.98], [6.86, 46.87], [6.7, 46.77]],
  [[8.54, 47.36], [8.65, 47.28], [8.82, 47.22], [8.84, 47.2], [8.68, 47.25], [8.56, 47.33]],
  [[8.28, 47.05], [8.42, 47.01], [8.6, 46.99], [8.6, 46.95], [8.45, 46.97], [8.34, 46.98]],
  [[7.63, 46.75], [7.75, 46.7], [7.88, 46.69], [8.05, 46.75], [8.02, 46.72], [7.86, 46.66], [7.72, 46.67]],
  [[9.1, 47.68], [9.35, 47.62], [9.55, 47.52], [9.62, 47.54], [9.45, 47.65], [9.2, 47.72]],
  [[8.78, 46.15], [8.84, 46.05], [8.78, 46.02], [8.74, 46.12]],
];

export function project(lat: number, lng: number, w = 800, h = 520): [number, number] {
  const minLng = 5.85, maxLng = 10.6, minLat = 45.75, maxLat = 47.9;
  const k = Math.cos((46.8 * Math.PI) / 180);
  const xs = (maxLng - minLng) * k, ys = maxLat - minLat;
  const s = Math.min(w / xs, h / ys);
  return [(w - xs * s) / 2 + (lng - minLng) * k * s, (h - ys * s) / 2 + (maxLat - lat) * s];
}
