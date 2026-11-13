"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Building2, CarFront, UserRound } from "lucide-react";
import type { ProviderFilter } from "@/lib/search";
import { cn } from "@/lib/cn";

const OPTIONS: { value: ProviderFilter; icon: typeof CarFront; label: string; short: string; long: string }[] = [
  { value: "alle", icon: CarFront, label: "Alle Anbieter", short: "Alle", long: "Alle Anbieter" },
  { value: "privat", icon: UserRound, label: "Private Anbieter", short: "Privat", long: "Private Anbieter" },
  { value: "gewerblich", icon: Building2, label: "Gewerbliche Anbieter", short: "Gewerblich", long: "Gewerbliche Anbieter" },
];

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Anbieterart als kompakte Segment-Control (Radiogruppe mit Pfeiltasten-Bedienung).
 * Auf dem Handy volle Breite mit gleich breiten Segmenten, ab sm so breit wie der Inhalt.
 * Weisse Spur, die grüne Pille gleitet zum gewählten Segment; bis sie gemessen ist, trägt das Segment selbst den Hintergrund.
 */
export function ProviderToggle({
  value,
  onChange,
  label = "Wer vermietet das Fahrzeug?",
  wording = "kurz",
  className,
}: {
  value: ProviderFilter;
  onChange: (v: ProviderFilter) => void;
  label?: string;
  wording?: "kurz" | "lang";
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const idx = OPTIONS.findIndex((o) => o.value === value);

  const measure = useCallback(() => {
    const el = refs.current[idx];
    if (el) setPill((p) => (p && p.x === el.offsetLeft && p.w === el.offsetWidth ? p : { x: el.offsetLeft, w: el.offsetWidth }));
  }, [idx]);
  useIsoLayoutEffect(measure, [measure]);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure]);

  const move = (i: number) => {
    const n = (i + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[n].value);
    refs.current[n]?.focus();
  };
  const PILL = "bg-forest shadow-[0_1px_2px_rgb(23_75_56/0.18),0_3px_8px_-3px_rgb(23_75_56/0.35)]";

  return (
    <div
      ref={box}
      role="radiogroup"
      aria-label={label}
      className={cn("relative flex w-full items-center gap-0.5 rounded-full bg-white p-1 ring-1 ring-line sm:w-fit", className)}
    >
      {pill && (
        <span
          aria-hidden
          className={cn("absolute top-1 bottom-1 left-0 rounded-full transition-[transform,width] duration-300 ease-[var(--ease-soft)]", PILL)}
          style={{ transform: `translateX(${pill.x}px)`, width: pill.w }}
        />
      )}
      {OPTIONS.map((o, i) => {
        const on = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(i + 1); }
              if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(i - 1); }
            }}
            className={cn(
              "relative z-10 flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-[0.9rem] leading-none font-semibold whitespace-nowrap transition-colors duration-300 sm:h-9 sm:flex-none sm:px-4",
              on ? "text-white" : "text-muted hover:bg-leaf-50 hover:text-forest",
              on && !pill && PILL,
            )}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2.2} aria-hidden />
            <span className="sm:hidden">{o.short}</span>
            {wording === "lang" ? (
              <>
                <span className="hidden sm:inline md:hidden">{o.label}</span>
                <span className="hidden md:inline">{o.long}</span>
              </>
            ) : (
              <span className="hidden sm:inline">{o.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
