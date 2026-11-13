"use client";
import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import { project } from "@/data/places";
import { providerOf } from "@/data/providers";
import { vehicleImage, vehicleTitle } from "@/data/vehicles";
import type { Result } from "@/lib/search";
import { chf } from "@/lib/format";
import { priceTag, type DurationMode } from "@/lib/offers";
import { cn } from "@/lib/cn";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { SwissMap } from "./SwissMap";

function place(results: Result[]) {
  const placed: { r: Result; x: number; y: number }[] = [];
  [...results]
    .map((r) => ({ r, xy: project(r.v.lat, r.v.lng) }))
    .sort((a, b) => a.xy[1] - b.xy[1])
    .forEach(({ r, xy: [x, y] }) => {
      let ny = y;
      while (placed.some((p) => Math.abs(p.x - x) < 70 && Math.abs(p.y - ny) < 30)) ny += 32;
      placed.push({ r, x, y: ny });
    });
  return placed;
}

export function MapView({ results, selected, onSelect, mode = "" }: { results: Result[]; selected?: string; onSelect: (slug: string) => void; mode?: DurationMode | "" }) {
  const label = (r: Result) => { const t = priceTag(r.v, mode); return `${t.from ? "ab " : ""}${chf(t.amount)} pro ${t.unit}`; };
  const pts = place(results);
  const sel = results.find((r) => r.v.slug === selected);
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      <div className="relative aspect-[800/520]">
        <SwissMap className="absolute inset-0 size-full" />
        {pts.map(({ r, x, y }) => {
          const on = r.v.slug === selected;
          const privat = providerOf(r.v).kind === "privat";
          const Icon = privat ? UserRound : Building2;
          return (
            <button
              key={r.v.slug}
              type="button"
              onClick={() => onSelect(r.v.slug)}
              aria-pressed={on}
              aria-label={`${vehicleTitle(r.v)}, ${privat ? "Privatperson" : "Unternehmen"}, ${label(r)}`}
              style={{ left: `${(x / 800) * 100}%`, top: `${(y / 520) * 100}%` }}
              className={cn(
                "absolute inline-flex -translate-x-1/2 -translate-y-full cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-[0.72rem] font-bold whitespace-nowrap shadow-sm ring-1 transition sm:text-xs",
                on ? "z-10 scale-110 bg-forest text-white ring-forest" : privat ? "bg-white text-leaf-700 ring-leaf-300 hover:ring-forest" : "bg-white text-sage-800 ring-sage-300 hover:ring-forest",
              )}
            >
              <Icon className="size-3" aria-hidden />
              {chf(priceTag(r.v, mode).amount)}
            </button>
          );
        })}
        <span className="chip absolute top-3 left-3 bg-white/95 text-muted ring-1 ring-line">Vereinfachte Karte</span>
      </div>
      {sel && (
        <div className="flex items-center gap-4 border-t border-line p-3 sm:p-4">
          <img src={vehicleImage(sel.v)} alt="" width={160} height={104} className="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-20 sm:w-32" />
          <div className="min-w-0 flex-1">
            <ProviderBadge kind={providerOf(sel.v).kind} />
            <p className="mt-1.5 truncate font-bold text-forest">{vehicleTitle(sel.v)}</p>
            <p className="text-sm text-muted">{sel.v.city}, {label(sel)}</p>
          </div>
          <Link href={`/autos/${sel.v.slug}`} className="btn btn-primary btn-sm shrink-0">Details</Link>
        </div>
      )}
    </div>
  );
}
