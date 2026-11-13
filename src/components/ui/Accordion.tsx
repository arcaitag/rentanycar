"use client";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { Faq } from "@/data/faq";
import { cn } from "@/lib/cn";

export function Accordion({ items, className }: { items: Faq[]; className?: string }) {
  const [open, setOpen] = useState(-1);
  const id = useId();
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q}>
            <h3 className="text-[1.06rem] font-semibold">
              <button
                type="button"
                id={`${id}-b${i}`}
                aria-controls={`${id}-p${i}`}
                aria-expanded={on}
                onClick={() => setOpen(on ? -1 : i)}
                className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left text-forest"
              >
                {it.q}
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-leaf-100 transition-transform duration-300", on && "rotate-45")} aria-hidden>
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              inert={!on}
              className={cn("grid transition-[grid-template-rows] duration-200 ease-out", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 leading-relaxed text-ink/80">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
