import type { Metadata } from "next";
import { Building2, UserRound } from "lucide-react";
import { PageIntro } from "@/components/pages/PageIntro";
import { HeroCompact } from "@/components/pages/Compare";
import { FinalCta, RENT_OUT_STEPS, RENT_STEPS, StepsList } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "So funktioniert’s",
  description: "So funktioniert das Mieten und Vermieten auf rentanycar.ch – und worin sich private und gewerbliche Anbieter unterscheiden.",
  alternates: { canonical: "/so-funktionierts" },
};

export default function SoFunktioniertsPage() {
  return (
    <>
      <PageIntro title="So funktioniert rentanycar.ch" lead="Eine Plattform für alle, die ein Auto mieten, und alle, die eines vermieten – privat oder als Unternehmen." art={<HeroCompact />} />
      <section className="page section" aria-labelledby="mieten">
        <h2 id="mieten" className="h-section">Mieten</h2>
        <StepsList steps={RENT_STEPS} />
      </section>
      <section className="section border-y border-line bg-white" aria-labelledby="vermieten-ablauf">
        <div className="page">
          <h2 id="vermieten-ablauf" className="h-section">Vermieten</h2>
          <StepsList steps={RENT_OUT_STEPS} />
        </div>
      </section>
      <section className="page section" aria-labelledby="unterschied">
        <h2 id="unterschied" className="h-section max-w-3xl">Private oder gewerbliche Anbieter: Wer vermietet?</h2>
        <p className="lead mt-4">Die Kennzeichnung zeigt, wer ein Auto vermietet – nicht, wofür du es nutzt. Du kannst jedes Auto privat oder geschäftlich mieten.</p>
        <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-line" tabIndex={0} role="region" aria-label="Vergleich private und gewerbliche Anbieter, horizontal scrollbar">
          <table className="w-full min-w-[36rem] bg-white text-left text-[0.95rem]">
            <caption className="sr-only">Vergleich von privaten und gewerblichen Anbietern</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-4 font-bold text-muted">Merkmal</th>
                <th scope="col" className="bg-leaf-50 p-4"><span className="inline-flex items-center gap-2 font-bold text-leaf-700"><UserRound className="size-4" aria-hidden />Private Anbieter</span></th>
                <th scope="col" className="bg-sage-50 p-4"><span className="inline-flex items-center gap-2 font-bold text-sage-800"><Building2 className="size-4" aria-hidden />Gewerbliche Anbieter</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Anbieter", "Privatpersonen mit eigenem Auto", "Autovermietungen, Garagen, Händler, Firmen"],
                ["Autos", "Meist ein Auto pro Person", "Flotte, oft an mehreren Standorten"],
                ["Übergabe", "Persönlich oder über Schlüsselbox", "Am Schalter, per Schlüsselsafe oder Schlüsselbox"],
                ["Erreichbarkeit", "Nach Absprache", "Feste Öffnungszeiten"],
                ["Profil", "Vorname, Region, Bewertungen", "Firmenname, Adresse, Öffnungszeiten, Bewertungen"],
              ].map(([k, a, b]) => (
                <tr key={k}>
                  <th scope="row" className="p-4 font-semibold text-ink">{k}</th>
                  <td className="bg-leaf-50/50 p-4">{a}</td>
                  <td className="bg-sage-50/50 p-4">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
