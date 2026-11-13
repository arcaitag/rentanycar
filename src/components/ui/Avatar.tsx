import type { Provider } from "@/data/providers";
import { cn } from "@/lib/cn";

/** Profilbild: Firmenlogo, falls hinterlegt – sonst Initialen bzw. Monogramm. */
export function ProviderAvatar({ p, size = "md" }: { p: Pick<Provider, "kind" | "initials" | "name" | "logo">; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "size-20 text-2xl" : size === "sm" ? "size-10 text-sm" : "size-14 text-lg";
  if (p.logo) return <img src={p.logo} alt={`Logo ${p.name}`} className={cn("shrink-0 rounded-2xl border border-line bg-white object-contain p-1.5", dim)} />;
  return p.kind === "privat" ? (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-leaf-200 font-display font-bold text-forest", dim)} aria-hidden>{p.initials}</span>
  ) : (
    <span className={cn("grid shrink-0 place-items-center rounded-2xl bg-sage-800 font-display font-bold tracking-tight text-sage-100", dim)} aria-hidden>{p.initials}</span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={cn("size-4", i <= Math.round(value) ? "fill-sun" : "fill-line")} aria-hidden="true">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7 4.9 17.4l1-5.6-4.1-4 5.7-.8z" />
        </svg>
      ))}
    </span>
  );
}
