import { cn } from "@/lib/cn";

/** Symbol: Strasse, die ein «r» bildet und an einem Ziel-Punkt endet. Identisch mit /public/brand. */
export function LogoMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="17" fill={dark ? "#79D99F" : "#174B38"} />
      <path d="M18.5 47V31.5C18.5 24.6 24.1 19 31 19H32" fill="none" stroke={dark ? "#174B38" : "#79D99F"} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="45" cy="19" r="6" fill={dark ? "#174B38" : "#fff"} />
    </svg>
  );
}

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9 shrink-0" dark={dark} />
      <span className="text-[1.3rem] leading-none font-extrabold tracking-[-0.02em]">
        <span className={dark ? "text-white" : "text-forest"}>rentany</span>
        <span className={dark ? "text-leaf-300" : "text-leaf-500"}>car.ch</span>
      </span>
    </span>
  );
}
