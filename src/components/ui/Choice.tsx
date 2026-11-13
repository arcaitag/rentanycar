import { cn } from "@/lib/cn";

/** Auswahl-Chip auf Basis eines echten Radio-/Checkbox-Elements (tastatur- und screenreaderfreundlich). */
export function Choice({
  type = "checkbox",
  name,
  checked,
  onChange,
  children,
}: {
  type?: "checkbox" | "radio";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold ring-1 transition peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest peer-focus-visible:outline-solid",
          checked ? "bg-forest text-white ring-forest" : "bg-white text-ink/85 ring-line hover:ring-forest/40",
        )}
      >
        {children}
      </span>
    </label>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-bold text-ink">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-line transition peer-checked:bg-forest peer-focus-visible:outline-[2.5px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-forest peer-focus-visible:outline-solid" />
        <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
