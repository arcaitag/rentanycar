export const SITE_NAME = "rentanycar.ch";
export const SITE_DESCRIPTION =
  "Miete Autos von Privatpersonen und professionellen Anbietern in der ganzen Schweiz. Einfach suchen, vergleichen und anfragen. Vorschau mit Beispieldaten.";

/** Basis-URL für Metadaten. Nach dem Domain-Umzug NEXT_PUBLIC_SITE_URL=https://rentanycar.ch setzen. */
export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** Solange Demo-Daten live sind, bleibt die Seite für Suchmaschinen gesperrt. */
export const indexable = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
