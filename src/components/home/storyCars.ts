// Nur auf dem Server verwenden: erzeugt die Fahrzeuge der Szene «Welches Auto brauchst du?» beim Build
// mit dem gleichen Generator wie die Hero-Illustration.
import { BODIES, car } from "../../../scripts/vehicle-art.mjs";

export interface StoryCar {
  svg: string;
  L: number;
  /** Radradius, für die Drehung passend zur gefahrenen Strecke */
  wr: number;
}

const LIST: [string, { color: string; accent?: string }][] = [
  ["roadster", { color: "#E3B13F" }],
  ["van", { color: "#38A96B" }],
  ["panel", { color: "#F1F4F2", accent: "#79D99F" }],
  ["fastback", { color: "#3F6E8C" }],
  ["suv", { color: "#24594A" }],
];

export function storyCars(): StoryCar[] {
  return LIST.map(([type, o], i) => {
    const c = car(type, { ...o, id: `story${i}`, spin: "rac-spin" });
    return { svg: c.svg, L: c.L, wr: BODIES[type].wr };
  });
}
