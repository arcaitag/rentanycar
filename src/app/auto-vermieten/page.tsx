import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Camera, Check, HandCoins, UserCheck } from "lucide-react";
import { RENT_FAQ } from "@/data/faq";
import { PageIntro } from "@/components/pages/PageIntro";
import { RentOutArt } from "@/components/illustrations/StepArt";
import { RentOutChoice } from "@/components/home/RentOutChoice";
import { FaqSection, RENT_OUT_STEPS, StepsList } from "@/components/home/Sections";
import { EarningsCalculator } from "@/components/rent/EarningsCalculator";

export const metadata: Metadata = {
  title: "Auto vermieten",
  description: "Vermiete dein Auto privat oder als Unternehmen: Preis und Verfügbarkeit selbst festlegen und über jede Anfrage entscheiden. Auto kostenlos inserieren.",
  alternates: { canonical: "/auto-vermieten" },
};

const CONTROL = [
  { icon: HandCoins, title: "Preis selbst festlegen", text: "Du bestimmst Tagespreis und inklusive Kilometer. Unternehmen pflegen Preise pro Fahrzeug." },
  { icon: CalendarRange, title: "Verfügbarkeit selbst verwalten", text: "Sperre Tage im Kalender, an denen du dein Auto selbst brauchst. Ohne deine Bestätigung wird nichts gebucht." },
  { icon: UserCheck, title: "Du entscheidest, wer mietet", text: "Jede Anfrage zeigt Profil und Bewertungen. Du bestätigst oder lehnst ab." },
  { icon: Camera, title: "Übergabe festhalten", text: "Haltet Zustand, Kilometerstand und Tankfüllung bei Abholung und Rückgabe mit Fotos fest." },
];

const TYPES = [
  { title: "Privat vermieten", text: "Für Privatpersonen, die ihr eigenes Auto ab und zu vermieten.", points: ["Ein oder zwei Autos", "Persönliche oder kontaktlose Übergabe", "Genaue Adresse erst nach der Bestätigung sichtbar", "Einnahmenübersicht im Konto"], href: "/auto-vermieten/erfassen?anbieter=privat", cta: "Privat inserieren" },
  { title: "Als Unternehmen vermieten", text: "Für Autovermietungen, Garagen, Händler und Firmen mit eigener Flotte.", points: ["Flotte mit mehreren Standorten verwalten", "Fahrzeuge duplizieren und pausieren", "Firmenprofil mit Öffnungszeiten", "Anfragen aller Standorte an einem Ort"], href: "/auto-vermieten/erfassen?anbieter=gewerblich", cta: "Als Unternehmen inserieren" },
];

const REQUIREMENTS = ["In der Schweiz eingelöst, mit gültigem Fahrzeugausweis", "Gültige Motorfahrzeugkontrolle (MFK) und verkehrssicherer Zustand", "Keine aktiven Warnleuchten, gepflegter Innenraum"];

export default function AutoVermietenPage() {
  return (
    <>
      <PageIntro title="Vermiete dein Auto" lead="Privat oder als Unternehmen: Lege Preis und Verfügbarkeit selbst fest und entscheide, wer dein Auto mieten darf. Das Inserieren ist kostenlos." art={<RentOutArt className="h-auto w-full" />}>
        <RentOutChoice cta="Auto kostenlos inserieren" secondary={false} />
      </PageIntro>

      <EarningsCalculator />

      <section className="page section pt-0 sm:pt-0" aria-labelledby="kontrolle">
        <h2 id="kontrolle" className="h-section">Du behältst die Kontrolle</h2>
        <ul className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {CONTROL.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-leaf-100 text-forest"><Icon className="size-6" aria-hidden /></span>
              <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 max-w-[46ch] leading-relaxed text-ink/75">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="section border-y border-line bg-white" aria-labelledby="privat-gewerbe">
        <div className="page">
          <h2 id="privat-gewerbe" className="h-section">Privat oder als Unternehmen?</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {TYPES.map((t) => (
              <div key={t.title} className="card flex flex-col p-6 sm:p-8">
                <h3 className="text-[1.4rem] font-bold">{t.title}</h3>
                <p className="mt-2 text-ink/80">{t.text}</p>
                <ul className="mt-5 grid gap-2.5">
                  {t.points.map((x) => <li key={x} className="flex gap-2.5"><Check className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />{x}</li>)}
                </ul>
                <Link href={t.href} className="btn btn-primary mt-7 w-fit">{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page section" aria-labelledby="ablauf-vermieten">
        <h2 id="ablauf-vermieten" className="h-section">So funktioniert das Vermieten</h2>
        <StepsList steps={RENT_OUT_STEPS} />
      </section>

      <section className="page pb-14 sm:pb-20" aria-labelledby="anforderungen">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <h2 id="anforderungen" className="h-section">Das sollte dein Auto mitbringen</h2>
          <ul className="divide-y divide-line border-y border-line">
            {REQUIREMENTS.map((r) => <li key={r} className="flex gap-3 py-4"><Check className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />{r}</li>)}
          </ul>
        </div>
      </section>

      <FaqSection items={RENT_FAQ} title="Fragen zum Vermieten" />

      <section className="page section">
        <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-forest p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <h2 className="max-w-lg text-[1.7rem] leading-tight font-bold text-white sm:text-[2.1rem]">In ungefähr 5 Minuten inseriert – Preis und Verfügbarkeit bestimmst du.</h2>
          <Link href="/auto-vermieten/erfassen" className="btn btn-light shrink-0">Auto kostenlos inserieren</Link>
        </div>
      </section>
    </>
  );
}
