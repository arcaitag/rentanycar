"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const COLS = [
  { title: "Mieten", links: [["/autos", "Auto finden"], ["/von-privat", "Private Anbieter"], ["/von-gewerbe", "Gewerbliche Anbieter"], ["/so-funktionierts", "So funktioniert’s"]] },
  { title: "Vermieten", links: [["/auto-vermieten", "Auto vermieten"], ["/auto-vermieten/erfassen", "Auto inserieren"], ["/registrieren", "Konto erstellen"]] },
  { title: "Hilfe und Rechtliches", links: [["/hilfe", "Hilfe"], ["/sicherheit", "Sicherheit"], ["/agb", "AGB"], ["/impressum", "Impressum"], ["/datenschutz", "Datenschutz"], ["/bildnachweis", "Bildnachweis"]] },
];
const year = new Date().getFullYear();

export default function Footer() {
  const pathname = usePathname();
  // Während der Fahrzeugerfassung nur eine schlanke Fusszeile
  if (pathname.startsWith("/auto-vermieten/erfassen")) {
    return (
      <footer className="border-t border-line bg-white">
        <div className="page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-sm text-muted">
          <p>© {year} rentanycar.ch · Vorschau mit Beispieldaten</p>
          <p className="flex gap-4">
            <Link href="/hilfe" className="hover:text-forest hover:underline">Hilfe</Link>
            <Link href="/agb" className="hover:text-forest hover:underline">AGB</Link>
            <Link href="/datenschutz" className="hover:text-forest hover:underline">Datenschutz</Link>
            <Link href="/impressum" className="hover:text-forest hover:underline">Impressum</Link>
          </p>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-forest text-white/80">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">Autos von Privatpersonen und Unternehmen in der ganzen Schweiz mieten – oder das eigene Auto vermieten.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-sm font-bold text-white">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="rounded transition hover:text-white hover:underline">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="page flex flex-col gap-2 py-6 text-xs leading-relaxed text-white/70 sm:flex-row sm:justify-between">
          <p>© {year} rentanycar.ch</p>
          <p>Vorschau mit Beispieldaten. Preise in CHF.</p>
        </div>
      </div>
    </footer>
  );
}
