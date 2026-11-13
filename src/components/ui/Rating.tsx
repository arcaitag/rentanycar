import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-bold text-ink", className)}>
      <Star className="size-4 fill-sun text-sun" aria-hidden />
      <span>
        <span className="sr-only">Bewertung </span>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="font-medium text-ink/70">
          ({count}
          <span className="sr-only"> Bewertungen</span>)
        </span>
      )}
    </span>
  );
}
