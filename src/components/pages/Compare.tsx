import { Car, Pin, Person } from "@/components/illustrations/parts";

/** Kompakte Szene für Inhaltsseiten. */
export function HeroCompact() {
  return (
    <svg viewBox="0 0 420 260" className="h-auto w-full" aria-hidden="true">
      <path d="M30 200C18 120 80 50 190 44C300 38 380 80 398 150C414 214 360 240 280 242C190 246 60 250 30 200Z" fill="#CDEFD9" opacity=".6" />
      <path d="M10 220C120 206 260 204 410 214V240C260 232 120 232 10 244Z" fill="#FFFFFF" />
      <path d="M26 228C150 218 270 218 396 226" stroke="#CDEFD9" strokeWidth="2.5" strokeDasharray="12 9" fill="none" />
      <Car name="gruen" x={40} ground={226} w={200} />
      <Pin x={300} y={226} s={1.1} />
      <Person x={352} y={222} s={0.95} jacket="#38A96B" pants="#174B38" skin="#E3B08F" hair="#6B4A2E" />
    </svg>
  );
}
