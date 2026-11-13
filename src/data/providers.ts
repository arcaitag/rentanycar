// Fiktive Demo-Anbieter. Keine realen Personen oder Unternehmen.
import { VEHICLES, type ProviderKind } from "./vehicles";

export interface Provider {
  slug: string;
  kind: ProviderKind;
  name: string;
  city: string;
  region: string;
  since: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  bio: string;
  initials: string;
  // nur gewerblich
  legalForm?: string;
  address?: string;
  hours?: [string, string][];
  contact?: string;
  uid?: string;
  uidPublic?: boolean;
  website?: string;
  locations?: string[];
  /** Optional: Firmenlogo (z. B. "/anbieter/citydrive-logo.svg") und Bild des Standorts. */
  logo?: string;
  locationImage?: string;
}

export const PROVIDERS: Provider[] = [
  { slug: "laura", kind: "privat", name: "Laura", city: "Bern", region: "Bern, Breitenrain", since: "März 2024", rating: 4.9, reviewCount: 38, responseTime: "meist innert einer Stunde", initials: "L",
    bio: "Unter der Woche fahre ich meistens mit dem Velo zur Arbeit. Mein Golf steht deshalb oft in der Garage – bei dir ist er besser aufgehoben." },
  { slug: "marco", kind: "privat", name: "Marco", city: "Zürich", region: "Zürich, Wiedikon", since: "Mai 2023", rating: 4.8, reviewCount: 52, responseTime: "meist innert zwei Stunden", initials: "M",
    bio: "Ich fahre seit vier Jahren elektrisch und helfe gerne beim Einstieg. Fragen zum Laden beantworte ich dir vor der Fahrt." },
  { slug: "sarah", kind: "privat", name: "Sarah", city: "Luzern", region: "Luzern, Tribschen", since: "Januar 2025", rating: 4.7, reviewCount: 21, responseTime: "meist am gleichen Tag", initials: "S",
    bio: "Ich arbeite im Homeoffice und brauche den MINI nur am Wochenende. Unter der Woche darf er gerne unterwegs sein." },
  { slug: "nina", kind: "privat", name: "Nina", city: "Thun", region: "Thun, Lerchenfeld", since: "Juni 2024", rating: 4.9, reviewCount: 17, responseTime: "meist innert drei Stunden", initials: "N",
    bio: "Der MX-5 ist mein Sommerauto. Ich freue mich, wenn er auch an Tagen bewegt wird, an denen ich arbeite." },
  { slug: "jonas", kind: "privat", name: "Jonas", city: "St. Gallen", region: "St. Gallen, Rotmonten", since: "Februar 2025", rating: 4.8, reviewCount: 12, responseTime: "meist innert einer Stunde", initials: "J",
    bio: "Ich pendle mit dem Zug. Der 500e steht darum oft vor dem Haus – geladen und bereit." },
  { slug: "baeren-mobility", kind: "gewerbe", name: "Bären Mobility AG", city: "Basel", region: "Basel-Stadt", since: "2023", rating: 4.9, reviewCount: 64, responseTime: "meist innert 30 Minuten", initials: "BM",
    bio: "Wir vermieten Kleinbusse und Transporter für Vereine, Familien und Firmen in der Region Basel. Abholung am Bahnhof SBB, rund um die Uhr über unseren Schlüsselsafe.",
    legalForm: "AG", address: "Musterstrasse 12, 4051 Basel", contact: "Lea Brunner, Disposition", 
    locations: ["Basel, Bahnhof SBB"],
    hours: [["Montag–Freitag", "07:30–18:30"], ["Samstag", "08:00–14:00"], ["Sonntag", "geschlossen (Schlüsselsafe)"]] },
  { slug: "citydrive-bern", kind: "gewerbe", name: "CityDrive Bern GmbH", city: "Ostermundigen", region: "Region Bern", since: "2022", rating: 4.9, reviewCount: 85, responseTime: "meist innert 20 Minuten", initials: "CD",
    bio: "Regionale Autovermietung mit drei Standorten rund um Bern. Vom sparsamen Kleinwagen bis zum Transporter für den Umzug – viele Fahrzeuge mit kontaktloser Übergabe.",
    legalForm: "GmbH", address: "Musterweg 5, 3072 Ostermundigen", contact: "Tobias Meier, Geschäftsführung",
    locations: ["Ostermundigen", "Bern Wankdorf", "Köniz Liebefeld"],
    hours: [["Montag–Freitag", "07:00–19:00"], ["Samstag", "08:00–16:00"], ["Sonntag", "nur Rückgabe über Schlüsselbox"]] },
  { slug: "leman-auto", kind: "gewerbe", name: "Léman Auto Location SA", city: "Lausanne", region: "Waadt", since: "2024", rating: 4.9, reviewCount: 29, responseTime: "meist innert einer Stunde", initials: "LA",
    bio: "Familiengeführte Autovermietung am Genfersee mit Fokus auf komfortable SUV und Hybridfahrzeuge. Beratung auf Französisch, Deutsch und Englisch.",
    legalForm: "SA", address: "Chemin de l’Exemple 8, 1003 Lausanne", contact: "Camille Favre, Vermietung", 
    locations: ["Lausanne, Sous-Gare"],
    hours: [["Montag–Freitag", "08:00–18:00"], ["Samstag", "09:00–13:00"], ["Sonntag", "geschlossen"]] },
];

export const getProvider = (slug: string) => PROVIDERS.find((p) => p.slug === slug);
export const providerOf = (v: { provider: string }) => getProvider(v.provider)!;
export const vehiclesOf = (slug: string) => VEHICLES.filter((v) => v.provider === slug);
