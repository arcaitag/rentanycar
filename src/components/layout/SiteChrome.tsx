"use client";
import { usePathname } from "next/navigation";

/** Seiten ganz ohne Kopfzeile, Fusszeile und Tab-Leiste, z. B. die Passwort-Eingabe der Vorschau. */
const BARE = ["/zugang"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return BARE.includes(pathname) ? null : <>{children}</>;
}
