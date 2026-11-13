import type { Vehicle } from "@/data/vehicles";
import { addDays, fmtDay } from "./format";

export interface Availability {
  text: string;
  /** true: sofort bzw. im gewählten Zeitraum frei */
  now: boolean;
  /** Platzhalter, solange das heutige Datum im Browser noch nicht bekannt ist */
  pending?: boolean;
}

export const PENDING: Availability = { text: "Verfügbarkeit", now: false, pending: true };

/** Nächster freier Tag – oder Bestätigung, dass der gewählte Zeitraum frei ist. */
export function availabilityOf(v: Pick<Vehicle, "blocked" | "instant">, today: Date, periodSelected = false): Availability {
  if (periodSelected) return { text: "Im gewählten Zeitraum frei", now: true };
  let d = v.instant ? 0 : 1;
  while (v.blocked.includes(d) && d < 90) d++;
  if (d === 0) return { text: "Heute verfügbar", now: true };
  if (d === 1) return { text: "Ab morgen verfügbar", now: true };
  return { text: `Ab ${fmtDay(addDays(today, d))} verfügbar`, now: false };
}
