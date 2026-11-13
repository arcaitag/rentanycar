import { Building2, UserRound } from "lucide-react";
import type { ProviderKind } from "@/data/vehicles";
import { cn } from "@/lib/cn";

/** Kennzeichnet, WER ein Fahrzeug anbietet – nicht, wie es genutzt wird. */
export function ProviderBadge({ kind, short = false, onTint = false, className }: { kind: ProviderKind; short?: boolean; onTint?: boolean; className?: string }) {
  const privat = kind === "privat";
  const Icon = privat ? UserRound : Building2;
  const tone = privat
    ? onTint ? "bg-white text-leaf-700 ring-1 ring-leaf-300" : "bg-leaf-100 text-leaf-700"
    : onTint ? "bg-white text-sage-800 ring-1 ring-sage-300" : "bg-sage-100 text-sage-800";
  return (
    <span className={cn("chip", tone, className)}>
      <Icon className="size-3.5" aria-hidden />
      {short ? (privat ? "Privat" : "Gewerblich") : privat ? "Privatperson" : "Unternehmen"}
    </span>
  );
}
