"use client";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/store";
import { cn } from "@/lib/cn";

export function FavoriteButton({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const [favs, setFavs] = useFavorites();
  const on = favs.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `${label} aus Favoriten entfernen` : `${label} zu Favoriten hinzufügen`}
      onClick={() => setFavs((f) => (f.includes(slug) ? f.filter((s) => s !== slug) : [...f, slug]))}
      className={cn("relative z-10 grid size-10 cursor-pointer place-items-center rounded-full bg-white text-forest shadow-sm ring-1 ring-line transition hover:scale-105", className)}
    >
      <Heart key={String(on)} className={cn("size-5", on && "fav-pop fill-[#D8574F] text-[#D8574F]")} aria-hidden />
    </button>
  );
}
