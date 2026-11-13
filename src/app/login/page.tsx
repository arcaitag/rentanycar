import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Anmelden", description: "Bei rentanycar.ch anmelden.", alternates: { canonical: "/login" }, robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="page grid max-w-xl pt-10 pb-20 sm:pt-16">
      <h1 className="text-[2.1rem] leading-tight font-bold sm:text-[2.4rem]">Anmelden</h1>
      <p className="lead mt-2 mb-8">Ein Konto für beides: Autos mieten und dein Auto vermieten.</p>
      <Suspense><LoginForm /></Suspense>
    </div>
  );
}
