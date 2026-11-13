// Erzeugt Fahrzeugbilder, Illustrations-Fahrzeuge und Logo-Dateien unter /public.
// Bestehende Dateien bleiben erhalten (z. B. später ersetzte echte Fotos). Neu erzeugen: npm run assets:force
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { cutout, listingImage } from "./vehicle-art.mjs";

const force = process.argv.includes("--force");
let created = 0;
function out(rel, content) {
  const file = new URL(`../public/${rel}`, import.meta.url);
  if (!force && existsSync(file)) return;
  mkdirSync(new URL(".", file), { recursive: true });
  writeFileSync(file, content);
  created++;
}

// Muss zu den Bildpfaden in src/data/vehicles.ts passen.
const LISTINGS = [
  ["vw-golf", "hatch", { color: "#3F6E8C" }],
  ["tesla-model-3", "fastback", { color: "#EEF1EF", roof: "#2B3A35", roofDown: true, rim: "#8F9C96" }],
  ["mini-cooper", "mini", { color: "#1F4E3D", roof: "#F4F6F4" }],
  ["mercedes-vito", "van", { color: "#5B6569" }],
  ["skoda-octavia-combi", "wagon", { color: "#B9C3C0" }],
  ["volvo-xc60", "suv", { color: "#4C6379" }],
  ["mazda-mx-5", "roadster", { color: "#B33B3B" }],
  ["fiat-500e", "small", { color: "#A6D8C3" }],
  ["toyota-yaris", "hatch", { color: "#F1F3F2", rim: "#8F9C96" }],
  ["vw-transporter", "panel", { color: "#F1F3F2", accent: "#CFDCD5", rim: "#8F9C96" }],
];
LISTINGS.forEach(([slug, type, o], i) => {
  const [a, b] = i % 2 ? ["berge", "stadt"] : ["stadt", "berge"];
  out(`fahrzeuge/${slug}-1.svg`, listingImage(type, o, a));
  out(`fahrzeuge/${slug}-2.svg`, listingImage(type, o, b));
  out(`fahrzeuge/${slug}-3.svg`, listingImage(type, o, "studio", true));
});

const white = { color: "#FFFFFF", rim: "#9AA7A1", accent: "#E7F8ED", simple: true };
const CUTOUTS = {
  "illustrationen/auto-gruen.svg": ["hatch", { color: "#38A96B" }],
  "illustrationen/auto-mini.svg": ["mini", { color: "#1F4E3D", roof: "#F4F6F4" }],
  "illustrationen/auto-blau.svg": ["hatch", { color: "#3F6E8C" }],
  "illustrationen/auto-kombi.svg": ["wagon", { color: "#B9C3C0" }],
  "illustrationen/auto-suv.svg": ["suv", { color: "#4C6379" }],
  "illustrationen/auto-van.svg": ["van", { color: "#5B6569" }],
  "illustrationen/auto-weiss.svg": ["fastback", { color: "#EEF1EF", roof: "#2B3A35", roofDown: true, rim: "#8F9C96" }],
  "fahrzeuge/kategorie-kleinwagen.svg": ["mini", white],
  "fahrzeuge/kategorie-kombi.svg": ["wagon", white],
  "fahrzeuge/kategorie-suv.svg": ["suv", white],
  "fahrzeuge/kategorie-elektro.svg": ["fastback", white],
  "fahrzeuge/kategorie-cabriolet.svg": ["roadster", white],
  "fahrzeuge/kategorie-transporter.svg": ["panel", white],
  "fahrzeuge/kategorie-familienauto.svg": ["van", white],
};
for (const [rel, [type, o]] of Object.entries(CUTOUTS)) out(rel, cutout(type, o));

try {
  const { brandFiles } = await import("./brand.mjs");
  for (const [name, svg] of Object.entries(brandFiles())) out(`brand/${name}`, svg);
} catch (err) {
  console.warn("Logo-Dateien übersprungen (opentype.js oder @fontsource/manrope fehlt):", err.message);
}
console.log(`Assets: ${created} Datei(en) erzeugt${force ? " (erzwungen)" : ""}.`);
