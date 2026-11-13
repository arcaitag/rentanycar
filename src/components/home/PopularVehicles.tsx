"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { POPULAR } from "@/data/vehicles";
import { matchesProvider } from "@/lib/search";
import { PENDING, availabilityOf } from "@/lib/availability";
import { cn } from "@/lib/cn";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { useToday } from "@/components/ui/VehicleGrid";
import { useHomeFilter } from "./HomeFilter";

/**
 * Beliebte Autos – gefiltert nach der Anbieterwahl in der Suche oben.
 * Auf dem Handy eine wischbare Reihe (die nächste Karte schaut hervor), ab Tablet ein Raster.
 */
export default function PopularVehicles() {
  const [filter] = useHomeFilter();
  const today = useToday();
  const items = POPULAR.filter((v) => matchesProvider(v, filter));
  const row = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Neue Anbieterwahl: wieder beim ersten Auto beginnen
  useEffect(() => {
    row.current?.scrollTo({ left: 0 });
    setActive(0);
  }, [filter]);

  const onScroll = () => {
    const el = row.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setActive(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  return (
    <section aria-labelledby="beliebt" className="section border-y border-line bg-white">
      <div className="page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="beliebt" className="h-section">Beliebte Autos</h2>
          <Link href={`/autos?anbieter=${filter}`} className="link inline-flex items-center gap-1.5">Alle Autos ansehen<ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        <ul
          ref={row}
          onScroll={onScroll}
          className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pt-1 pb-3 sm:mx-0 sm:mt-8 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-3"
        >
          {items.map((v) => (
            <li key={v.slug} className="w-[82%] max-w-[21rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <VehicleCard v={v} availability={today ? availabilityOf(v, today) : PENDING} />
            </li>
          ))}
        </ul>
        {/* Nur Anzeige, gewischt wird direkt in der Reihe */}
        {items.length > 1 && (
          <div className="mt-2 flex justify-center gap-1.5 sm:hidden" aria-hidden>
            {items.map((v, i) => (
              <span key={v.slug} className={cn("h-1.5 rounded-full transition-all duration-200", i === active ? "w-5 bg-forest" : "w-1.5 bg-line")} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
