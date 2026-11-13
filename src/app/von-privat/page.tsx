import type { Metadata } from "next";
import { ProviderLanding } from "@/components/pages/ProviderLanding";

export const metadata: Metadata = {
  title: "Von Privatpersonen mieten",
  description: "Autos von Privatpersonen aus deiner Region mieten – persönlich und unkompliziert.",
  alternates: { canonical: "/von-privat" },
};

export default function VonPrivatPage() {
  return <ProviderLanding kind="privat" />;
}
