import type { Metadata } from "next";
import { ProviderLanding } from "@/components/pages/ProviderLanding";

export const metadata: Metadata = {
  title: "Bei professionellen Anbietern mieten",
  description: "Autos von regionalen Autovermietungen, Garagen und Mobilitätsanbietern mieten – in der ganzen Schweiz.",
  alternates: { canonical: "/von-gewerbe" },
};

export default function VonGewerbePage() {
  return <ProviderLanding kind="gewerbe" />;
}
