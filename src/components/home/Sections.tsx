import Link from "next/link";
import { ArrowRight, Camera, FileCheck2, ShieldCheck, UserCheck } from "lucide-react";
import { HOME_FAQ } from "@/data/faq";
import { Accordion } from "@/components/ui/Accordion";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import { RentOutArt, StepDrive, StepHandover, StepRequest, StepSearch } from "@/components/illustrations/StepArt";
import { HorizonArt } from "@/components/illustrations/Misc";
import HeroSearch from "./HeroSearch";
import { RentOutChoice } from "./RentOutChoice";
import { RotatingPlace } from "./RotatingPlace";
import { VehicleStory } from "./VehicleStory";
import { storyCars } from "./storyCars";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-4" aria-labelledby="hero-title">
      <div className="page grid items-center gap-3 pt-2 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:pt-8">
        <div className="order-2 lg:order-1">
          <h1 id="hero-title" className="h-display text-[1.7rem] min-[360px]:text-[1.95rem] sm:text-[2.75rem] xl:text-[3.25rem]">
            <span className="block">Das passende Auto.</span>{" "}
            <span className="block">
              Direkt in <RotatingPlace />
            </span>
          </h1>
          <p className="lead mt-4 max-w-[34rem]">
            Miete Autos von Privatpersonen und professionellen Anbietern in der ganzen Schweiz. Einfach suchen, vergleichen und anfragen.
          </p>
        </div>
        <div className="order-1 -mx-5 sm:-mx-8 lg:order-2 lg:mx-0">
          <HeroIllustration />
        </div>
      </div>
      <div className="page relative z-10 pt-5 lg:-mt-8">
        <HeroSearch />
      </div>
    </section>
  );
}

/** «Welches Auto brauchst du?» – Fahrzeuge fahren nacheinander durch die Landschaft (Fahrzeuge beim Build erzeugt) */
export function Categories() {
  return <VehicleStory cars={storyCars()} />;
}

export const RENT_STEPS = [
  { Art: StepSearch, title: "Suchen und vergleichen", text: "Gib Ort und Zeitraum ein. Du siehst Autos von Privatpersonen und Unternehmen – mit Preis und Verfügbarkeit." },
  { Art: StepRequest, title: "Anfrage senden", text: "Prüfe Gesamtpreis und Regeln und sende eine Anfrage. Die vermietende Seite bestätigt sie." },
  { Art: StepDrive, title: "Abholen und losfahren", text: "Übernimm den Schlüssel persönlich oder kontaktlos – je nach Inserat. Die Rückgabe läuft gleich ab." },
];

export const RENT_OUT_STEPS = [
  { Art: StepHandover, title: "Auto inserieren", text: "Erfasse Fahrzeug, Standort, Ausstattung, Preis und Fotos in fünf Schritten. Das Inserieren ist kostenlos." },
  { Art: StepRequest, title: "Anfragen prüfen", text: "Du siehst Profil und Bewertungen der mietenden Person und entscheidest selbst." },
  { Art: StepDrive, title: "Übergeben", text: "Persönlich oder kontaktlos. Haltet Zustand und Kilometerstand bei der Übergabe mit Fotos fest." },
];

export function StepsList({ steps }: { steps: { Art: React.ComponentType; title: string; text: string }[] }) {
  return (
    <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
      {steps.map(({ Art, title, text }, i) => (
        <li key={title}>
          <div className="aspect-[10/7] max-w-[15rem] rounded-[1.75rem] bg-leaf-100 p-3">
            <Art />
          </div>
          <div className="mt-5 flex gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-white" aria-hidden>{i + 1}</span>
            <div>
              <h3 className="text-lg leading-snug font-semibold">
                <span className="sr-only">Schritt {i + 1}: </span>
                {title}
              </h3>
              <p className="mt-1 max-w-[34ch] text-[0.95rem] leading-relaxed text-ink/75">{text}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HowItWorks() {
  return (
    <section className="section" aria-labelledby="ablauf">
      <div className="page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="ablauf" className="h-section">So funktioniert’s</h2>
          <Link href="/so-funktionierts" className="link inline-flex items-center gap-1.5">Mehr zum Ablauf<ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <StepsList steps={RENT_STEPS} />
      </div>
    </section>
  );
}

const SAFETY = [
  { icon: UserCheck, title: "Klar, wer vermietet", text: "Jedes Inserat zeigt, ob eine Privatperson oder ein Unternehmen vermietet – mit Profil und Bewertungen." },
  { icon: FileCheck2, title: "Erst anfragen, dann mieten", text: "Deine Anfrage ist unverbindlich. Die vermietende Seite prüft sie und bestätigt." },
  { icon: Camera, title: "Übergabe festhalten", text: "Haltet bei Abholung und Rückgabe Zustand, Kilometerstand und Tankfüllung mit Fotos fest." },
  { icon: ShieldCheck, title: "Versicherung und Kaution", text: "Die verbindlichen Bedingungen zu Versicherung, Selbstbehalt und Kaution siehst du vor jeder Buchung." },
];

export function Safety() {
  return (
    <section className="section border-y border-line bg-white" aria-labelledby="sicherheit">
      <div className="page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="sicherheit" className="h-section">Sicherheit und Versicherung</h2>
          <p className="mt-4 max-w-[46ch] leading-relaxed text-ink/80">Klare Angaben und nachvollziehbare Abläufe – für alle, die mieten, und alle, die vermieten.</p>
          <Link href="/sicherheit" className="link mt-6 inline-flex items-center gap-1.5">Mehr zu Sicherheit und Vertrauen<ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <ul className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          {SAFETY.map((t) => (
            <li key={t.title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-100 text-forest"><t.icon className="size-5" aria-hidden /></span>
              <div>
                <h3 className="text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-ink/75">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function RentOut() {
  return (
    <section className="section" aria-labelledby="vermieten">
      <div className="page">
        <div className="grid items-center gap-10 rounded-[2rem] bg-leaf-100 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-12">
          <div>
            <h2 id="vermieten" className="h-section max-w-[20ch]">Du möchtest dein Auto vermieten?</h2>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-ink/80">Ob ein Auto, das oft steht, oder eine ganze Flotte: Inseriere kostenlos und bestimme Preis und Verfügbarkeit selbst.</p>
            <div className="mt-7">
              <RentOutChoice cta="Auto kostenlos inserieren" />
            </div>
          </div>
          <div className="hidden sm:block">
            <RentOutArt className="h-auto w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection({ items = HOME_FAQ, title = "Häufige Fragen" }: { items?: typeof HOME_FAQ; title?: string }) {
  return (
    <section className="section border-t border-line bg-white" aria-labelledby="faq">
      <div className="page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <h2 id="faq" className="h-section">{title}</h2>
          <p className="mt-4 text-ink/75">
            Weitere Antworten findest du in der <Link href="/hilfe" className="link">Hilfe</Link>.
          </p>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="page section" aria-labelledby="bereit">
      <div className="relative overflow-hidden rounded-[2rem] bg-leaf-100 px-6 pt-12 pb-36 sm:px-12 sm:pb-40">
        <h2 id="bereit" className="h-section max-w-[18ch]">Bereit für deine nächste Fahrt?</h2>
        <div className="relative z-10 mt-7 flex flex-wrap gap-3">
          <Link href="/autos?anbieter=alle" className="btn btn-primary">Auto finden</Link>
          <Link href="/auto-vermieten" className="btn btn-outline">Auto vermieten</Link>
        </div>
        <HorizonArt className="absolute inset-x-0 bottom-0 h-32 w-full sm:h-36" />
      </div>
    </section>
  );
}
