import type { Metadata } from "next";
import { Suspense } from "react";
import ListingWizard from "@/components/rent/ListingWizard";

export const metadata: Metadata = {
  title: "Auto inserieren",
  description: "Auto in fünf Schritten inserieren: Fahrzeug, Standort, Ausstattung, Preis und Verfügbarkeit, Fotos. Dauert ungefähr 5 Minuten.",
  alternates: { canonical: "/auto-vermieten/erfassen" },
};

export default function ErfassenPage() {
  return (
    <div className="page pt-8 pb-10 sm:pt-12">
      <Suspense fallback={<p className="mx-auto max-w-3xl text-ink/75">Auto inserieren</p>}>
        <ListingWizard />
      </Suspense>
    </div>
  );
}
