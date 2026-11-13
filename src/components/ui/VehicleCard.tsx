import Link from "next/link";
import { MapPin } from "lucide-react";
import { type Vehicle, categoryLabel, isSymbolImage, vehicleImage, vehicleTitle } from "@/data/vehicles";
import { providerOf } from "@/data/providers";
import type { Availability } from "@/lib/availability";
import { chf } from "@/lib/format";
import { offerLabel, offersOf, priceTag, type DurationMode } from "@/lib/offers";
import { cn } from "@/lib/cn";
import { ProviderBadge } from "./ProviderBadge";
import { Rating } from "./Rating";
import { FavoriteButton } from "./FavoriteButton";

export function VehicleCard({
  v,
  distance,
  availability,
  total,
  mode = "",
  eager = false,
}: {
  v: Vehicle;
  distance?: number;
  availability?: Availability;
  total?: { days: number; total: number; rate?: number };
  /** Gesuchte Mietdauer – bestimmt, welcher Preis erscheint */
  mode?: DurationMode | "";
  eager?: boolean;
}) {
  const p = providerOf(v);
  const title = vehicleTitle(v);
  const tag = priceTag(v, mode);
  const models = offersOf(v).models;
  // Weitere Modelle knapp erwähnen, Details erst auf der Fahrzeugseite
  const more = models.filter((k) => k !== tag.kind).map((k) => (k === "kurzzeit" ? "Kurzzeit" : k === "langzeit" ? "Langzeit" : "Auto-Abo"));
  const href = `/autos/${v.slug}${tag.kind !== models[0] ? `?modell=${tag.kind}` : ""}`;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)] transition duration-200 hover:border-forest/30 hover:shadow-[var(--shadow-float)]">
      <div className="relative aspect-[3/2] overflow-hidden bg-leaf-50">
        <img src={vehicleImage(v)} alt="" width={600} height={400} loading={eager ? "eager" : "lazy"} decoding="async" className="size-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        <ProviderBadge kind={p.kind} onTint className="absolute top-3 left-3 shadow-sm" />
        <FavoriteButton slug={v.slug} label={title} className="absolute top-2.5 right-2.5" />
        {isSymbolImage(v) && <span className="absolute bottom-2.5 left-2.5 rounded-md bg-ink/65 px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">Symbolbild</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-muted">{categoryLabel(v.categories[0])}</span>
          <Rating value={v.rating} count={v.reviewCount} />
        </div>
        <h3 className="mt-1 text-[1.1rem] leading-snug font-semibold">
          <Link href={href} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-[2.5px] focus-visible:after:outline-forest focus-visible:after:outline-solid">
            {title}
          </Link>
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-ink/80">
          <MapPin className="size-4 shrink-0 text-leaf-700" aria-hidden />
          <span className="truncate">
            {v.city}
            {distance !== undefined && ` · ca. ${distance < 1 ? 1 : Math.round(distance)} km entfernt`}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted">{v.gear} · {v.fuel} · {v.seats} Plätze</p>
        {availability && (
          <p className={cn("mt-2.5 flex items-center gap-2 text-sm font-semibold", availability.now ? "text-leaf-700" : "text-ink/75", availability.pending && "invisible")}>
            <span className={cn("size-2 shrink-0 rounded-full", availability.now ? "bg-leaf-500" : "bg-muted/60")} aria-hidden />
            {availability.text}
          </p>
        )}
        <div className="mt-auto pt-4">
          {total ? (
            <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
              <p>
                <span className="block text-sm text-muted">Total für {total.days} {total.days === 1 ? "Tag" : "Tage"}</span>
                <span className="font-display text-[1.45rem] leading-tight font-bold text-forest">{chf(total.total)}</span>
              </p>
              <p className="text-right text-sm text-muted">{chf(total.rate ?? v.price)} pro Tag</p>
            </div>
          ) : (
            <div className="border-t border-line pt-3">
              {tag.kind !== "kurzzeit" && <p className="mb-1.5"><span className="chip bg-leaf-100 text-leaf-700">{offerLabel(tag.kind)}</span></p>}
              <p className="flex flex-wrap items-baseline gap-x-1">
                <span className="font-display text-[1.45rem] leading-tight font-bold text-forest">
                  {tag.from && <span className="text-base font-semibold">ab </span>}
                  {chf(tag.amount)}
                </span>
                <span className="text-sm text-muted">pro {tag.unit}</span>
              </p>
              {tag.once && <p className="text-sm font-semibold text-ink/75">{tag.once}</p>}
              <p className="text-sm text-muted">{tag.note}{tag.extra && ` · ${tag.extra}`}</p>
              {more.length > 0 && <p className="mt-0.5 text-xs text-muted">Auch {more.join(" und ")}</p>}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
