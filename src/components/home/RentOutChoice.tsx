"use client";
import Link from "next/link";
import { useState } from "react";
import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "privat", label: "Privat vermieten", text: "Du vermietest dein eigenes Auto ab und zu.", icon: UserRound },
  { value: "gewerblich", label: "Als Unternehmen vermieten", text: "Als Autovermietung, Garage oder Firma mit eigener Flotte.", icon: Building2 },
] as const;

export function RentOutChoice({ cta = "Auto kostenlos inserieren", secondary = true }: { cta?: string; secondary?: boolean }) {
  const [sel, setSel] = useState<"privat" | "gewerblich">("privat");
  return (
    <div>
      <fieldset>
        <legend className="font-semibold text-forest">Wie möchtest du vermieten?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((o) => {
            const on = sel === o.value;
            return (
              <label
                key={o.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-2xl bg-white p-4 ring-1 transition has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid",
                  on ? "ring-2 ring-forest" : "ring-line hover:ring-forest/40",
                )}
              >
                <input type="radio" name="vermieten-als" value={o.value} checked={on} onChange={() => setSel(o.value)} className="sr-only" />
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", o.value === "privat" ? "bg-leaf-100 text-leaf-700" : "bg-sage-100 text-sage-800")}>
                  <o.icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-bold text-forest">{o.label}</span>
                  <span className="text-sm text-ink/75">{o.text}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href={`/auto-vermieten/erfassen?anbieter=${sel}`} className="btn btn-primary">
          {cta}
        </Link>
        {secondary && (
          <Link href="/auto-vermieten" className="btn btn-outline">
            Mehr zum Vermieten
          </Link>
        )}
      </div>
    </div>
  );
}
