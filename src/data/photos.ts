import raw from "./photos.json";

/** Symbolbild eines Modells von Wikimedia Commons (Auswahl und Bildnachweis in photos.json). */
export interface PhotoCredit {
  slug: string;
  /** Dateiname auf Commons, z. B. "File:2020 Volkswagen Golf Life 1.0 Front.jpg" */
  file: string;
  author: string;
  license: string;
  licenseUrl: string;
  /** Dateiseite auf Commons */
  source: string;
  /** Optionaler Bildausschnitt (Anteile der Bildbreite/-höhe), sonst mittig */
  crop?: { left: number; top: number; width: number };
  /** Ganzes Bild zeigen und Ränder gespiegelt ergänzen (für sehr breite Fotos) */
  fill?: boolean;
}

export const PHOTOS = raw as PhotoCredit[];
export const photoOf = (slug: string) => PHOTOS.find((p) => p.slug === slug);
