import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AccountArea from "@/components/account/AccountArea";
import { ACCOUNT_SECTIONS, type AccountSection } from "@/components/account/sections";

export const dynamicParams = false;
export function generateStaticParams() {
  return ACCOUNT_SECTIONS.map((s) => ({ bereich: s ? [s] : [] }));
}

export const metadata: Metadata = { title: "Mein Konto", robots: { index: false, follow: false } };

export default async function KontoPage({ params }: { params: Promise<{ bereich?: string[] }> }) {
  const { bereich = [] } = await params;
  const section = (bereich[0] ?? "") as AccountSection;
  if (bereich.length > 1 || !ACCOUNT_SECTIONS.includes(section)) notFound();
  return <AccountArea section={section} />;
}
