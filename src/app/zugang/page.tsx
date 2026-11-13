import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { GATE_COOKIE, hasAccess, safeTarget } from "@/lib/gate";
import { GateForm } from "./GateForm";

export const metadata: Metadata = {
  title: "Geschützte Vorschau",
  description: "Diese Vorschau von rentanycar.ch ist mit einem Passwort geschützt.",
  robots: { index: false, follow: false },
};

export default async function GatePage({ searchParams }: { searchParams: Promise<{ weiter?: string | string[] }> }) {
  const { weiter } = await searchParams;
  const target = safeTarget(Array.isArray(weiter) ? weiter[0] : weiter);
  // Schutz aus oder schon freigeschaltet: direkt weiter
  if (await hasAccess((await cookies()).get(GATE_COOKIE)?.value)) redirect(target);

  return (
    <div className="grid min-h-[82dvh] place-items-center px-5 py-12 sm:py-16">
      <div className="w-full max-w-[25rem]">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="card mt-8 p-6 sm:p-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-leaf-100 text-forest">
            <LockKeyhole className="size-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-center text-[1.75rem] leading-tight font-bold">Geschützte Vorschau</h1>
          <p className="mt-2 text-center leading-relaxed text-ink/80">
            rentanycar.ch ist noch nicht öffentlich. Gib das Passwort ein, um die Vorschau zu öffnen.
          </p>
          <GateForm target={target} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">Danach bleibt dieses Gerät 30 Tage freigeschaltet.</p>
      </div>
    </div>
  );
}
