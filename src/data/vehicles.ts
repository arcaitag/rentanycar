// Zentrale Demo-Inserate. Alle Personen, Firmen, Bewertungen und Inserate sind fiktiv.
// Später durch echte Daten (API/Datenbank) ersetzen – die Struktur bleibt gleich.
import type { MileagePolicy } from "@/lib/mileage";
import type { Offers } from "@/lib/offers";
import { photoOf } from "./photos";

export type ProviderKind = "privat" | "gewerbe";
export type CategoryId = "kleinwagen" | "kombi" | "suv" | "elektro" | "cabriolet" | "transporter" | "familienauto";
export type Fuel = "Benzin" | "Diesel" | "Elektro" | "Hybrid";
export type Gear = "Automatik" | "Manuell";

export interface Review {
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface Vehicle {
  slug: string;
  make: string;
  model: string;
  year: number;
  city: string;
  area: string;
  lat: number;
  lng: number;
  price: number;
  gear: Gear;
  fuel: Fuel;
  seats: number;
  doors: number;
  categories: CategoryId[];
  provider: string;
  rating: number;
  reviewCount: number;
  contactless: boolean;
  /** Abholung heute möglich */
  instant: boolean;
  /** Kilometerregelung des Inserats */
  mileage: MileagePolicy;
  /** Mietmodelle (ohne Angabe: nur Kurzzeitmiete mit Tagespreis) */
  offers?: Offers;
  description: string;
  features: string[];
  rules: string[];
  pickup: string;
  handover: string;
  /** Belegte Tage, relativ zu heute (0 = heute) */
  blocked: number[];
  reviews: Review[];
  popular?: boolean;
  /** Echte Fotos des Anbieters, z. B. ["/fotos/vw-golf/1.jpg", …]. Ohne Fotos werden Illustrationen als Platzhalter gezeigt. */
  photos?: string[];
  /** true, wenn der Tagespreis je nach Zeitraum variiert – dann erscheint «ab CHF …». */
  priceVaries?: boolean;
}

export const CATEGORIES: { id: CategoryId; label: string; hint: string }[] = [
  { id: "kleinwagen", label: "Kleinwagen", hint: "Wendig in der Stadt" },
  { id: "kombi", label: "Kombi", hint: "Viel Platz für Gepäck" },
  { id: "suv", label: "SUV", hint: "Hoch sitzen, oft mit 4x4" },
  { id: "elektro", label: "Elektro", hint: "Leise und lokal emissionsfrei" },
  { id: "cabriolet", label: "Cabriolet", hint: "Für schöne Tage" },
  { id: "transporter", label: "Transporter", hint: "Für Umzug und Grosses" },
  { id: "familienauto", label: "Familienauto", hint: "Mit Platz für alle" },
];
export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const vehicleTitle = (v: Pick<Vehicle, "make" | "model">) => `${v.make} ${v.model}`;
/** Titelbild (600 px): Foto des Anbieters, sonst Symbolbild des Modells, sonst Illustration. */
export const vehicleImage = (v: Pick<Vehicle, "slug" | "photos">, n = 1) =>
  v.photos?.[n - 1] ?? (photoOf(v.slug) ? `/symbolbilder/${v.slug}-600.jpg` : `/fahrzeuge/${v.slug}-${Math.min(Math.max(n, 1), 3)}.svg`);
/** Grosses Titelbild (1200 px), z. B. für die Vorschau in sozialen Netzwerken. */
export const vehicleImageLarge = (v: Pick<Vehicle, "slug" | "photos">) =>
  v.photos?.[0] ?? (photoOf(v.slug) ? `/symbolbilder/${v.slug}.jpg` : `/fahrzeuge/${v.slug}-1.svg`);
/** true, wenn statt eigener Fotos ein Symbolbild des Modells gezeigt wird. */
export const isSymbolImage = (v: Pick<Vehicle, "slug" | "photos">) => !v.photos?.length && !!photoOf(v.slug);
/** Alle Bilder für die Galerie. `placeholder`: nur Illustrationen; `credit`: Symbolbild mit Bildnachweis. */
export function vehicleImages(v: Vehicle) {
  const t = vehicleTitle(v);
  if (v.photos?.length) return { placeholder: false, credit: undefined, images: v.photos.map((src, i) => ({ src, alt: `${t}, Foto ${i + 1}` })) };
  const credit = photoOf(v.slug);
  if (credit) return { placeholder: false, credit, images: [{ src: `/symbolbilder/${v.slug}.jpg`, alt: `${t}, Symbolbild` }] };
  return {
    placeholder: true,
    credit: undefined,
    images: [
      { src: `/fahrzeuge/${v.slug}-1.svg`, alt: `${t}, Seitenansicht (Illustration)` },
      { src: `/fahrzeuge/${v.slug}-2.svg`, alt: `${t}, unterwegs (Illustration)` },
      { src: `/fahrzeuge/${v.slug}-3.svg`, alt: `${t}, Front (Illustration)` },
    ],
  };
}

export const VEHICLES: Vehicle[] = [
  {
    slug: "vw-golf", make: "Volkswagen", model: "Golf 1.5 TSI", year: 2021, city: "Bern", area: "Breitenrain", lat: 46.958, lng: 7.455,
    price: 69, gear: "Automatik", fuel: "Benzin", seats: 5, doors: 5, categories: ["kleinwagen"], provider: "laura",
    rating: 4.9, reviewCount: 38, contactless: false, instant: true, mileage: { perDay: 200, extraPrice: 0.3, overagePrice: 0.4 }, popular: true,
    offers: { models: ["kurzzeit"], short: { deposit: 500, deductible: 1000, coverage: "vollkasko" } },
    description: "Mein Golf ist gepflegt, sparsam und fährt sich angenehm – in der Stadt genauso wie auf der Autobahn. Er steht in einer Tiefgarage im Breitenrain, fünf Minuten vom Tram entfernt. Im Kofferraum haben ein grosser Wocheneinkauf oder das Gepäck für ein Wochenende Platz.",
    features: ["Apple CarPlay und Android Auto", "Sitzheizung vorne", "Rückfahrkamera", "Tempomat", "Isofix auf der Rückbank", "Winterreifen (Oktober bis April)"],
    rules: ["Nichtraucherfahrzeug", "Haustiere nur in einer Transportbox", "Tank bei Rückgabe voll", "Mindestalter 23 Jahre, Führerausweis seit 3 Jahren"],
    pickup: "Bern, Breitenrain – die genaue Adresse erhältst du nach der bestätigten Buchung", handover: "Persönliche Übergabe",
    blocked: [6, 7, 13, 14, 15, 24],
    reviews: [
      { author: "Daniel K.", date: "August 2026", rating: 5, text: "Laura war super unkompliziert, das Auto sauber und vollgetankt. Die Übergabe hat keine zehn Minuten gedauert." },
      { author: "Mira S.", date: "Juli 2026", rating: 5, text: "Perfekt für unseren Ausflug ins Emmental. Gerne wieder." },
      { author: "Jonas R.", date: "Juni 2026", rating: 4, text: "Alles gut. Die Abholung hat sich wegen Verkehr etwas verzögert, Laura hat aber gut informiert." },
    ],
  },
  {
    slug: "tesla-model-3", make: "Tesla", model: "Model 3", year: 2023, city: "Zürich", area: "Wiedikon", lat: 47.371, lng: 8.518,
    price: 119, gear: "Automatik", fuel: "Elektro", seats: 5, doors: 4, categories: ["elektro"], provider: "marco",
    rating: 4.8, reviewCount: 52, contactless: true, instant: false, mileage: { perDay: 250, extraPrice: 0.25, overagePrice: 0.35, unlimited: { price: 25, per: "tag", fairUse: 3000 } }, popular: true,
    offers: { models: ["kurzzeit"], short: { deposit: 1000, deductible: 1500, coverage: "vollkasko" } },
    description: "Mit dem Model 3 kommst du entspannt bis ins Tessin und zurück. Vor der ersten Fahrt erkläre ich dir gerne das Laden und die wichtigsten Funktionen. Das Auto steht in Wiedikon, nahe beim Bahnhof.",
    features: ["Spurhalte- und Abstandsassistent", "Ladekabel Typ 2 inklusive", "Panorama-Glasdach", "Sitzheizung vorne und hinten", "Navigation mit Ladeplanung"],
    rules: ["Nichtraucherfahrzeug", "Keine Haustiere", "Ladestand bei Rückgabe mindestens 60 %", "Mindestalter 25 Jahre"],
    pickup: "Zürich, Wiedikon – die genaue Adresse erhältst du nach der bestätigten Buchung", handover: "Kontaktlos über eine Schlüsselbox",
    blocked: [4, 5, 11, 12, 20],
    reviews: [
      { author: "Selina B.", date: "September 2026", rating: 5, text: "Marco hat mir alles geduldig erklärt. Laden war einfacher als gedacht." },
      { author: "Luca F.", date: "August 2026", rating: 4, text: "Tolles Auto, einzig das Kabel war etwas schwer zu finden. Sonst top." },
    ],
  },
  {
    slug: "mini-cooper", make: "MINI", model: "Cooper", year: 2020, city: "Luzern", area: "Tribschen", lat: 47.043, lng: 8.312,
    price: 79, gear: "Automatik", fuel: "Benzin", seats: 4, doors: 3, categories: ["kleinwagen"], provider: "sarah",
    rating: 4.7, reviewCount: 21, contactless: false, instant: true, mileage: { perDay: 150, extraPrice: 0.3 }, popular: true,
    description: "Klein, wendig und ideal für die Luzerner Altstadt oder einen Abstecher an den Vierwaldstättersee. Mit dem MINI findest du fast überall einen Parkplatz.",
    features: ["Klimaautomatik", "Parksensoren hinten", "Bluetooth", "Sportsitze"],
    rules: ["Nichtraucherfahrzeug", "Tank bei Rückgabe voll", "Mindestalter 21 Jahre"],
    pickup: "Luzern, Tribschen – die genaue Adresse erhältst du nach der bestätigten Buchung", handover: "Persönliche Übergabe",
    blocked: [5, 6, 18, 19],
    reviews: [
      { author: "Nadja P.", date: "August 2026", rating: 5, text: "Sarah ist sehr herzlich, der MINI macht richtig Spass." },
      { author: "Beat H.", date: "Mai 2026", rating: 4, text: "Kofferraum ist klein, aber das wusste ich vorher. Übergabe pünktlich." },
    ],
  },
  {
    slug: "mercedes-vito", make: "Mercedes-Benz", model: "Vito", year: 2022, city: "Basel", area: "Bahnhof SBB", lat: 47.548, lng: 7.589,
    price: 139, gear: "Automatik", fuel: "Diesel", seats: 8, doors: 4, categories: ["transporter", "familienauto"], provider: "baeren-mobility",
    rating: 4.9, reviewCount: 64, contactless: true, instant: true, mileage: { perDay: 300, extraPrice: 0.35, overagePrice: 0.45 }, popular: true,
    offers: {
      models: ["kurzzeit", "langzeit"],
      short: { deposit: 1500, deductible: 1500, coverage: "vollkasko" },
      long: { monthly: 2890, minMonths: 1, kmPerMonth: 2500, extraKmPrice: 0.45, deposit: 2000, notice: "Mit 30 Tagen Frist auf Monatsende kündbar", extension: "Monatsweise verlängerbar" },
    },
    description: "Der Vito bietet Platz für acht Personen und viel Gepäck – ideal für Vereinsausflüge, Familienferien oder die Fahrt an den EuroAirport. Abholung an unserem Standort beim Bahnhof SBB, auch ausserhalb der Öffnungszeiten über unseren Schlüsselsafe.",
    features: ["8 Sitzplätze", "Schiebetüren links und rechts", "Anhängerkupplung", "Navigationssystem", "Rückfahrkamera", "Klimaanlage vorne und hinten"],
    rules: ["Nichtraucherfahrzeug", "Tank bei Rückgabe voll", "Mindestalter 25 Jahre, Führerausweis seit 3 Jahren", "Kaution gemäss Anbieter"],
    pickup: "Bären Mobility AG, Musterstrasse 12, 4051 Basel", handover: "Kontaktlos über den Schlüsselsafe",
    blocked: [8, 9, 10, 22],
    reviews: [
      { author: "FC Riehen Senioren", date: "September 2026", rating: 5, text: "Für unseren Vereinsausflug perfekt. Sauber, pünktlich, alles erklärt." },
      { author: "Tanja M.", date: "Juli 2026", rating: 5, text: "Schlüsselsafe hat problemlos funktioniert, auch am Sonntag." },
    ],
  },
  {
    slug: "skoda-octavia-combi", make: "Škoda", model: "Octavia Combi", year: 2022, city: "Ostermundigen", area: "Zentrum", lat: 46.957, lng: 7.49,
    price: 84, gear: "Automatik", fuel: "Benzin", seats: 5, doors: 5, categories: ["kombi", "familienauto"], provider: "citydrive-bern",
    rating: 5.0, reviewCount: 41, contactless: true, instant: true, mileage: { perDay: 250, extraPrice: 0.3, overagePrice: 0.4, unlimited: { price: 100, per: "buchung", fairUse: 2500 } }, popular: true,
    offers: {
      models: ["kurzzeit", "langzeit", "abo"],
      short: { deposit: 800, deductible: 1000, coverage: "vollkasko" },
      long: { monthly: 1790, minMonths: 1, kmPerMonth: 2000, extraKmPrice: 0.4, deposit: 1500, notice: "Mit 30 Tagen Frist auf Monatsende kündbar", extension: "Monatsweise verlängerbar" },
      abo: {
        monthly: 1590, startFee: 290, deposit: 1500, minMonths: 3, noticeMonths: 1,
        packages: [{ km: 1500, surcharge: 0 }, { km: 2000, surcharge: 90 }, { km: 3000, surcharge: 220 }],
        extraKmPrice: 0.35, included: ["versicherung", "wartung", "service", "reifen", "verkehrssteuer", "zulassung", "pannenhilfe", "vignette"],
        addons: [{ label: "Zusatzfahrer", monthly: 29 }, { label: "Kindersitz", monthly: 15 }],
      },
      tiers: [{ from: 2, unit: "tage", price: 79 }, { from: 7, unit: "tage", price: 69 }, { from: 3, unit: "monate", price: 1690 }, { from: 6, unit: "monate", price: 1590 }],
    },
    description: "Viel Platz, wenig Verbrauch: Der Octavia Combi ist unser Allrounder für kleine Umzüge, Familienausflüge oder Geschäftstermine. Das Fahrzeug steht an unserem Standort in Ostermundigen, zwei Minuten von der Tramhaltestelle.",
    features: ["Kofferraum 640 Liter", "Dachreling", "Apple CarPlay und Android Auto", "Adaptiver Tempomat", "Winterreifen (Oktober bis April)", "Anhängerkupplung"],
    rules: ["Nichtraucherfahrzeug", "Haustiere erlaubt – bitte eine Decke verwenden", "Tank bei Rückgabe voll", "Mindestalter 21 Jahre"],
    pickup: "CityDrive Bern GmbH, Musterweg 5, 3072 Ostermundigen", handover: "Kontaktlos über eine Schlüsselbox",
    blocked: [3, 4, 16, 17],
    reviews: [
      { author: "Reto W.", date: "September 2026", rating: 5, text: "Zugangscode kam pünktlich, Auto war sauber. So stelle ich mir das vor." },
      { author: "Aline G.", date: "August 2026", rating: 5, text: "Für unseren Umzug nach Thun ideal. Das Team war sehr freundlich." },
    ],
  },
  {
    slug: "volvo-xc60", make: "Volvo", model: "XC60", year: 2023, city: "Lausanne", area: "Sous-Gare", lat: 46.516, lng: 6.629,
    price: 125, gear: "Automatik", fuel: "Hybrid", seats: 5, doors: 5, categories: ["suv", "familienauto"], provider: "leman-auto",
    rating: 4.9, reviewCount: 29, contactless: false, instant: true, mileage: { perDay: 250, extraPrice: 0.4, overagePrice: 0.5 }, popular: true,
    offers: {
      models: ["langzeit", "abo"],
      long: { monthly: 2490, minMonths: 1, kmPerMonth: 2000, extraKmPrice: 0.5, deposit: 2500, notice: "Mit 30 Tagen Frist kündbar", extension: "Jederzeit verlängerbar" },
      abo: {
        monthly: 1990, startFee: 390, deposit: 2000, minMonths: 6, noticeMonths: 1, maxMonths: 24,
        packages: [{ km: 1000, surcharge: 0 }, { km: 1500, surcharge: 80 }, { km: 2000, surcharge: 150 }],
        extraKmPrice: 0.45, included: ["versicherung", "wartung", "service", "reifen", "verkehrssteuer", "zulassung", "pannenhilfe", "vignette"],
      },
      tiers: [{ from: 3, unit: "monate", price: 2290 }, { from: 6, unit: "monate", price: 2190 }],
    },
    description: "Komfortabler SUV mit Plug-in-Hybrid: Kurze Strecken fährst du elektrisch, für längere Fahrten ins Wallis oder in den Jura übernimmt der Benzinmotor. Übergabe persönlich an unserem Schalter in Lausanne.",
    features: ["Allradantrieb", "Ladekabel Typ 2", "Standheizung", "360-Grad-Kamera", "Premium-Soundsystem", "Winterreifen (Oktober bis April)"],
    rules: ["Nichtraucherfahrzeug", "Tank bei Rückgabe voll", "Mindestalter 25 Jahre"],
    pickup: "Léman Auto Location SA, Chemin de l’Exemple 8, 1003 Lausanne", handover: "Persönliche Übergabe am Schalter",
    blocked: [2, 12, 13, 14],
    reviews: [
      { author: "Claire D.", date: "August 2026", rating: 5, text: "Très bon service, voiture impeccable. Gerne wieder!" },
      { author: "Samuel T.", date: "Juni 2026", rating: 5, text: "Für die Fahrt nach Zermatt (bis Täsch) perfekt, sehr komfortabel." },
    ],
  },
  {
    slug: "mazda-mx-5", make: "Mazda", model: "MX-5 Roadster", year: 2019, city: "Thun", area: "Lerchenfeld", lat: 46.758, lng: 7.628,
    price: 95, gear: "Manuell", fuel: "Benzin", seats: 2, doors: 2, categories: ["cabriolet"], provider: "nina",
    rating: 4.9, reviewCount: 17, contactless: false, instant: false, mileage: { perDay: 200, extraPrice: 0.4, overagePrice: 0.5, maxKm: 1500 },
    description: "Offen fahren am Thunersee oder über den Gurnigel: Der MX-5 ist kein Auto für den Grosseinkauf, sondern für schöne Tage. Ich übergebe ihn dir persönlich und zeige dir kurz das Verdeck.",
    features: ["Stoffverdeck (manuell)", "Sitzheizung", "Bluetooth", "Sportfahrwerk"],
    rules: ["Nur geschlossen parkieren", "Nichtraucherfahrzeug", "Tank bei Rückgabe voll", "Mindestalter 25 Jahre"],
    pickup: "Thun, Lerchenfeld – die genaue Adresse erhältst du nach der bestätigten Buchung", handover: "Persönliche Übergabe",
    blocked: [1, 2, 3, 9, 10],
    reviews: [{ author: "Patrick Z.", date: "August 2026", rating: 5, text: "Die Fahrt über den Gurnigel war ein Traum. Nina ist super nett." }],
  },
  {
    slug: "fiat-500e", make: "Fiat", model: "500e", year: 2022, city: "St. Gallen", area: "Rotmonten", lat: 47.434, lng: 9.385,
    price: 59, gear: "Automatik", fuel: "Elektro", seats: 4, doors: 3, categories: ["kleinwagen", "elektro"], provider: "jonas",
    rating: 4.8, reviewCount: 12, contactless: true, instant: true, mileage: { perDay: 150, extraPrice: 0.25 },
    description: "Elektrisch durch St. Gallen: Der 500e ist klein, leise und reicht für den Alltag locker. Geladen wird er an meiner Wallbox – bitte gib ihn mit mindestens halb voller Batterie zurück.",
    features: ["Ladekabel Typ 2", "Rückfahrkamera", "Apple CarPlay", "Glasdach"],
    rules: ["Ladestand bei Rückgabe mindestens 50 %", "Nichtraucherfahrzeug", "Mindestalter 21 Jahre"],
    pickup: "St. Gallen, Rotmonten – die genaue Adresse erhältst du nach der bestätigten Buchung", handover: "Kontaktlos über eine Schlüsselbox",
    blocked: [7, 8, 21],
    reviews: [{ author: "Lea V.", date: "Juli 2026", rating: 5, text: "Kleines, feines Auto. Jonas antwortet sehr schnell." }],
  },
  {
    slug: "toyota-yaris", make: "Toyota", model: "Yaris Hybrid", year: 2023, city: "Bern", area: "Wankdorf", lat: 46.963, lng: 7.465,
    price: 64, gear: "Automatik", fuel: "Hybrid", seats: 5, doors: 5, categories: ["kleinwagen"], provider: "citydrive-bern",
    rating: 4.8, reviewCount: 26, contactless: true, instant: true, mileage: { perDay: 200, extraPrice: 0.3, overagePrice: 0.4 },
    offers: {
      models: ["kurzzeit", "abo"],
      short: { deposit: 500, deductible: 1000, coverage: "vollkasko" },
      abo: {
        monthly: 790, startFee: 190, deposit: 1000, minMonths: 3, noticeMonths: 1,
        packages: [{ km: 1000, surcharge: 0 }, { km: 1500, surcharge: 60 }, { km: 2000, surcharge: 110 }],
        extraKmPrice: 0.3, included: ["versicherung", "service", "reifen", "verkehrssteuer", "zulassung", "pannenhilfe", "vignette"],
        addons: [{ label: "Zusatzfahrer", monthly: 29 }],
      },
    },
    description: "Sparsamer Hybrid für die Stadt und die Agglomeration. Abholung an unserem Standort Wankdorf, direkt bei der S-Bahn.",
    features: ["Hybridantrieb", "Rückfahrkamera", "Spurhalteassistent", "Bluetooth"],
    rules: ["Nichtraucherfahrzeug", "Tank bei Rückgabe voll", "Mindestalter 21 Jahre"],
    pickup: "CityDrive Bern GmbH, Standort Wankdorf, 3014 Bern", handover: "Kontaktlos über eine Schlüsselbox",
    blocked: [5, 6, 19],
    reviews: [{ author: "Marc A.", date: "September 2026", rating: 5, text: "Sehr sparsam, Abholung beim Wankdorf ideal mit dem Zug." }],
  },
  {
    slug: "vw-transporter", make: "Volkswagen", model: "Transporter Kastenwagen", year: 2021, city: "Köniz", area: "Liebefeld", lat: 46.932, lng: 7.414,
    price: 109, gear: "Manuell", fuel: "Diesel", seats: 3, doors: 4, categories: ["transporter"], provider: "citydrive-bern",
    rating: 4.9, reviewCount: 18, contactless: false, instant: true, mileage: { perDay: 150, extraPrice: 0.45, overagePrice: 0.55 },
    offers: {
      models: ["kurzzeit", "langzeit"],
      short: { maxDays: 30, deposit: 1000, deductible: 1500, coverage: "vollkasko" },
      long: { monthly: 2190, minMonths: 1, kmPerMonth: 1500, extraKmPrice: 0.55, deposit: 2000 },
      tiers: [{ from: 7, unit: "tage", price: 95 }],
    },
    description: "Für den Umzug in die neue Wohnung oder den Einkauf im Brockenhaus: rund 5.8 m³ Laderaum, bequeme Ladehöhe, Spanngurte inklusive.",
    features: ["Laderaum rund 5.8 m³", "Zurrösen und Spanngurte", "Schiebetür rechts", "Anhängerkupplung", "Rückfahrkamera"],
    rules: ["Tank bei Rückgabe voll", "Führerausweis Kategorie B genügt", "Mindestalter 23 Jahre"],
    pickup: "CityDrive Bern GmbH, Standort Köniz, 3097 Liebefeld", handover: "Persönliche Übergabe",
    blocked: [4, 11, 25],
    reviews: [{ author: "Sandra W.", date: "August 2026", rating: 5, text: "Umzug in einem Tag erledigt. Übergabe und Rückgabe liefen reibungslos." }],
  },
];

export const POPULAR = VEHICLES.filter((v) => v.popular);
export const BRANDS = Array.from(new Set(VEHICLES.map((v) => v.make))).sort((a, b) => a.localeCompare(b, "de"));
export const getVehicle = (slug: string) => VEHICLES.find((v) => v.slug === slug);
