import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Konto erstellen", description: "Konto bei rentanycar.ch erstellen – als Privatperson oder als Unternehmen.", alternates: { canonical: "/registrieren" }, robots: { index: false } };

export default function RegistrierenPage() {
  return (
    <div className="page max-w-3xl pt-10 pb-20 sm:pt-16">
      <h1 className="text-[2.1rem] leading-tight font-bold sm:text-[2.4rem]">Konto erstellen</h1>
      <p className="lead mt-2 mb-8">Mit einem Konto kannst du Autos mieten und dein eigenes Auto vermieten.</p>
      <Suspense><RegisterForm /></Suspense>
    </div>
  );
}
