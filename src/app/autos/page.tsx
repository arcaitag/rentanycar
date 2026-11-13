import type { Metadata } from "next";
import { Suspense } from "react";
import AutosClient from "@/components/search/AutosClient";

export const metadata: Metadata = {
  title: "Auto finden",
  description: "Autos von Privatpersonen und gewerblichen Anbietern in deiner Nähe finden und filtern – nach Preis, Kategorie, Antrieb, Sitzplätzen und Übergabe.",
  alternates: { canonical: "/autos" },
};

export default function AutosPage() {
  return (
    <Suspense fallback={<div className="page min-h-[60vh] pt-10"><h1 className="text-[2.6rem] font-bold">Auto finden</h1><p className="mt-2 text-ink/75">Suche wird geladen …</p></div>}>
      <AutosClient />
    </Suspense>
  );
}
