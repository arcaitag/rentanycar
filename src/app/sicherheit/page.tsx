import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileCheck2, ReceiptText, Star, UserCheck } from "lucide-react";
import { SAFETY_DETAILS } from "@/data/safety";
import { PageIntro } from "@/components/pages/PageIntro";
import { Accordion } from "@/components/ui/Accordion";
import { StepHandover } from "@/components/illustrations/StepArt";

export const metadata: Metadata = {
  title: "Sicherheit und Vertrauen",
  description: "Wie rentanycar.ch Mieten und Vermieten nachvollziehbar macht: klar gekennzeichnete Anbieter, Preise vor der Anfrage, unverbindliche Anfragen und Tipps für die Übergabe.",
  alternates: { canonical: "/sicherheit" },
};

const PRINCIPLES = [
  { icon: UserCheck, title: "Klar gekennzeichnete Anbieter", text: "Jedes Inserat zeigt, ob eine Privatperson oder ein Unternehmen vermietet. Unternehmen geben bei der Registrierung ihre UID-Nummer an." },
  { icon: ReceiptText, title: "Preise vor der Anfrage", text: "Du siehst den Preis, bevor du eine Anfrage sendest: bei Kurzzeitmieten das Total für deinen Zeitraum, bei Langzeitmiete und Auto-Abo den Preis pro Monat." },
  { icon: FileCheck2, title: "Erst anfragen, dann mieten", text: "Eine Anfrage ist unverbindlich. Die vermietende Seite sieht dein Profil und entscheidet, ob sie bestätigt." },
  { icon: Star, title: "Bewertungen", text: "Profile zeigen Bewertungen aus früheren Mieten. So siehst du, mit wem du es zu tun hast." },
];

const BEFORE_BOOKING = ["Welche Versicherung gilt und wie hoch der Selbstbehalt ist", "Ob eine Kaution anfällt und wie hoch sie ist", "Was bei Unfall, Panne oder Schaden zu tun ist", "Welche Gebühren anfallen"];

const TIPS = [
  { title: "Tipps für Mietende", items: ["Prüfe Profil, Bewertungen und Regeln, bevor du anfragst.", "Kläre Treffpunkt und Übergabezeit über die Nachrichten.", "Fotografiere das Auto rundum, bevor du losfährst – auch Innenraum und Felgen.", "Halte Kilometerstand und Tankfüllung beziehungsweise Ladestand fest."] },
  { title: "Tipps für Vermietende", items: ["Beschreibe Zustand und Besonderheiten deines Autos ehrlich.", "Prüfe Profil und Bewertungen, bevor du eine Anfrage bestätigst.", "Kontrolliere bei der persönlichen Übergabe den Führerausweis.", "Halte die Rückgabe sofort fest und melde Schäden rasch."] },
];

// Nur verbindlich festgelegte Angaben anzeigen
const DETAILS = SAFETY_DETAILS.filter((x): x is { q: string; a: string } => !!x.a);

export default function SicherheitPage() {
  return (
    <>
      <PageIntro
        title="Sicherheit und Vertrauen"
        lead="Wir wollen, dass Mieten und Vermieten für beide Seiten nachvollziehbar und fair sind."
        tone="border border-line bg-white"
        art={<div className="mx-auto aspect-[10/7] max-w-sm rounded-[2rem] bg-leaf-100 p-4"><StepHandover /></div>}
      />
      <section className="page section" aria-labelledby="grundsaetze">
        <h2 id="grundsaetze" className="h-section">So schaffen wir Klarheit</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((t) => (
            <li key={t.title} className="card flex gap-4 p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-100 text-forest"><t.icon className="size-5" aria-hidden /></span>
              <div>
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/75">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="section border-y border-line bg-white" aria-labelledby="versicherung">
        <div className="page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 id="versicherung" className="h-section">Versicherung, Kaution und Schadenfall</h2>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-ink/80">
              Versichert ist das Auto über die Fahrzeugversicherung der vermietenden Seite. rentanycar.ch vermittelt nur und stellt keine eigene Versicherung
              bereit. Diese Punkte gehören zu jeder Miete, die verbindlichen Bedingungen siehst du vor der Buchung.
            </p>
            <Link href="/agb#ziffer-5" className="link mt-3 inline-block">Versicherung und Haftung in den AGB</Link>
          </div>
          {DETAILS.length > 0 ? (
            <Accordion items={DETAILS} />
          ) : (
            <ul className="grid content-start gap-3 text-[1.02rem]">
              {BEFORE_BOOKING.map((t) => <li key={t} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />{t}</li>)}
            </ul>
          )}
        </div>
      </section>
      <section className="page section" aria-label="Tipps">
        <div className="grid gap-10 md:grid-cols-2">
          {TIPS.map((l) => (
            <div key={l.title}>
              <h2 className="text-[1.5rem] font-bold">{l.title}</h2>
              <ul className="mt-5 grid gap-3">
                {l.items.map((i) => <li key={i} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="page pb-16 sm:pb-20">
        <div className="card flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
          <p className="font-display text-xl font-semibold text-forest">Noch Fragen zur Sicherheit?</p>
          <Link href="/hilfe" className="btn btn-primary">Zur Hilfe</Link>
        </div>
      </section>
    </>
  );
}
