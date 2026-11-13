import type { Metadata } from "next";
import { HelpCenter } from "@/components/pages/HelpCenter";

export const metadata: Metadata = {
  title: "Hilfe",
  description: "Antworten zu Mieten, Vermieten, Konto, Zahlung und Sicherheit auf rentanycar.ch.",
  alternates: { canonical: "/hilfe" },
};

export default function HilfePage() {
  return (
    <div className="page pt-8 pb-20 sm:pt-12">
      <h1 className="text-[2.4rem] leading-tight font-bold sm:text-[3.2rem]">Wie können wir helfen?</h1>
      <p className="lead mt-3 mb-8 max-w-2xl">Finde Antworten zu Mieten, Vermieten, Konto und Sicherheit.</p>
      <HelpCenter />
    </div>
  );
}
