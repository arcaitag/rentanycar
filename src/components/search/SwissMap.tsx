import { CH_OUTLINE, LAKES, PLACES, project } from "@/data/places";

const toPath = (pts: [number, number][]) =>
  pts.map(([lng, lat], i) => {
    const [x, y] = project(lat, lng);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("") + "Z";

const OUTLINE = toPath(CH_OUTLINE);
const LAKE_PATHS = LAKES.map(toPath);
const LABELS = ["Basel", "Zürich", "Bern", "Luzern", "Lausanne", "Genf", "St. Gallen", "Lugano", "Chur", "Thun", "Winterthur", "Sion"];
const ROADS: [string, string][] = [["Genf", "Lausanne"], ["Lausanne", "Bern"], ["Bern", "Zürich"], ["Zürich", "St. Gallen"], ["Basel", "Luzern"], ["Luzern", "Lugano"], ["Zürich", "Chur"], ["Bern", "Thun"], ["Lausanne", "Sion"], ["Basel", "Zürich"]];
const pt = (name: string) => {
  const p = PLACES.find((x) => x.name === name)!;
  return project(p.lat, p.lng);
};

/** Stilisierte, vereinfachte Schweizer Karte ohne externe Kartendaten. */
export function SwissMap({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 800 520" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <rect width="800" height="520" fill="#F1FBF4" />
      <path d={OUTLINE} fill="#E3F5E9" stroke="#B7E3C6" strokeWidth="3" strokeLinejoin="round" />
      {ROADS.map(([a, b]) => {
        const [x1, y1] = pt(a), [x2, y2] = pt(b);
        return <path key={a + b} d={`M${x1} ${y1}Q${(x1 + x2) / 2 + (y2 - y1) * 0.08} ${(y1 + y2) / 2 - (x2 - x1) * 0.08} ${x2} ${y2}`} stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />;
      })}
      {LAKE_PATHS.map((d, i) => <path key={i} d={d} fill="#CFEDE6" stroke="#B9E2D8" strokeWidth="1.5" strokeLinejoin="round" />)}
      {LABELS.map((name) => {
        const [x, y] = pt(name);
        return (
          <g key={name}>
            <circle cx={x} cy={y} r="3.2" fill="#8A9690" />
            <text x={x + 7} y={y + 15} fontSize="13" fontWeight="600" fill="#66736D">{name}</text>
          </g>
        );
      })}
      {children}
    </svg>
  );
}
