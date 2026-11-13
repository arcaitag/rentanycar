// Individuelle Duoton-Icons für die Vorteile.
const S = { stroke: "#174B38", strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconNearby({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="27" fill="#E7F8ED" />
      <ellipse cx="28" cy="42" rx="17" ry="5" fill="none" stroke="#79D99F" strokeWidth="2.4" />
      <path d="M28 42c-2-5-10-10-10-17a10 10 0 1 1 20 0c0 7-8 12-10 17Z" fill="#79D99F" {...S} />
      <circle cx="28" cy="25" r="3.6" fill="#FFFFFF" stroke="#174B38" strokeWidth="2.4" />
    </svg>
  );
}

export function IconFlexible({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="27" fill="#E7F8ED" />
      <rect x="11" y="14" width="26" height="24" rx="5" fill="#FFFFFF" {...S} />
      <path d="M11 22h26M18 11v6M30 11v6" fill="none" {...S} />
      <circle cx="37" cy="36" r="9.5" fill="#79D99F" {...S} />
      <path d="M37 31.5V36l3 2" fill="none" {...S} />
    </svg>
  );
}

export function IconTransparent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden="true">
      <circle cx="28" cy="28" r="27" fill="#E7F8ED" />
      <path d="M15 11h24v32l-4-3-4 3-4-3-4 3-4-3-4 3Z" fill="#FFFFFF" {...S} />
      <path d="M20 19h14M20 25h14M20 31h8" fill="none" {...S} />
      <circle cx="39" cy="38" r="8" fill="#38A96B" stroke="#174B38" strokeWidth="2.6" />
      <path d="M35.5 38.2l2.4 2.4 4.4-4.8" stroke="#FFFFFF" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
