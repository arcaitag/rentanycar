import Link from "next/link";
import { Check } from "lucide-react";
import { VEHICLES } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import { PageIntro } from "./PageIntro";
import { VehicleGrid } from "@/components/ui/VehicleGrid";
import { GewerbeArt, PrivatArt } from "@/components/illustrations/ProviderArt";
import { FinalCta } from "@/components/home/Sections";

const CONTENT = {
  privat: {
    title: "Von Privatpersonen mieten",
    lead: "Autos von Menschen aus deiner Region – persönlich und unkompliziert.",
    cta: "Private Autos ansehen",
    points: ["Du mietest das Auto direkt von der Person, der es gehört – oft mit einem persönlichen Tipp dazu.", "Abholung meist im Wohnquartier, nahe bei Tram, Bus oder Bahnhof.", "Die genaue Adresse erhältst du erst nach der bestätigten Buchung."],
    other: { href: "/von-gewerbe", label: "Lieber bei einem Unternehmen mieten?" },
    host: { href: "/auto-vermieten/erfassen?anbieter=privat", label: "Du hast selbst ein Auto, das oft steht?" },
  },
  gewerbe: {
    title: "Bei professionellen Anbietern mieten",
    lead: "Autos von regionalen Autovermietungen, Garagen und Mobilitätsanbietern.",
    cta: "Autos von Unternehmen ansehen",
    points: ["Feste Öffnungszeiten und klare Ansprechpersonen für Fragen vor und während der Miete.", "Grössere Auswahl: vom Kleinwagen über den Kleinbus bis zum Transporter.", "Oft kontaktlose Übergabe über einen Schlüsselsafe – auch ausserhalb der Öffnungszeiten."],
    other: { href: "/von-privat", label: "Lieber von einer Privatperson mieten?" },
    host: { href: "/auto-vermieten/erfassen?anbieter=gewerblich", label: "Du vermietest selbst Autos als Unternehmen?" },
  },
};

export function ProviderLanding({ kind }: { kind: "privat" | "gewerbe" }) {
  const c = CONTENT[kind];
  const list = VEHICLES.filter((v) => providerOf(v).kind === kind);
  const filter = kind === "privat" ? "privat" : "gewerblich";
  return (
    <>
      <PageIntro title={c.title} lead={c.lead} tone={kind === "privat" ? "bg-leaf-100" : "bg-sage-100"} art={kind === "privat" ? <PrivatArt className="h-auto w-full" /> : <GewerbeArt className="h-auto w-full" />}>
        <Link href={`/autos?anbieter=${filter}`} className="btn btn-primary">{c.cta}</Link>
      </PageIntro>
      <section className="page pt-12 pb-10" aria-label="Das erwartet dich">
        <ul className="grid gap-6 md:grid-cols-3">
          {c.points.map((p) => <li key={p} className="flex gap-3 text-[1.02rem] leading-relaxed"><Check className="mt-1 size-5 shrink-0 text-leaf-500" aria-hidden />{p}</li>)}
        </ul>
      </section>
      <section className="page pb-16 sm:pb-20" aria-labelledby="angebote">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="angebote" className="h-section">{kind === "privat" ? "Private Anbieter" : "Gewerbliche Anbieter"}</h2>
          <Link href={c.other.href} className="link">{c.other.label}</Link>
        </div>
        <VehicleGrid slugs={list.map((v) => v.slug)} className="mt-6" />
        <div className="card mt-12 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
          <p className="font-display text-xl font-semibold text-forest">{c.host.label}</p>
          <Link href={c.host.href} className="btn btn-outline">Auto inserieren</Link>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
