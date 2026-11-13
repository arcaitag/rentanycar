// Bausteine für die eigenen SVG-Illustrationen von rentanycar.ch.

const CARS = {
  gruen: [2.84, 0.926],
  blau: [2.84, 0.926],
  mini: [2.642, 0.9245],
  kombi: [3.171, 0.927],
  suv: [2.688, 0.935],
  van: [2.455, 0.945],
  weiss: [3.165, 0.924],
} as const;

/** Freigestelltes Fahrzeug aus /public/illustrationen, am Boden (ground) ausgerichtet. */
export function Car({ name, x, ground, w }: { name: keyof typeof CARS; x: number; ground: number; w: number }) {
  const [ratio, g] = CARS[name];
  const h = w / ratio;
  return <image href={`/illustrationen/auto-${name}.svg`} x={x} y={ground - h * g} width={w} height={h} />;
}

export function Pin({ x, y, s = 1, color = "#174B38", inner = "#79D99F" }: { x: number; y: number; s?: number; color?: string; inner?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="1" rx="12" ry="3.5" fill="#174B38" opacity=".18" />
      <path d="M0 0C-4 -9 -22 -22 -22 -39A22 22 0 1 1 22 -39C22 -22 4 -9 0 0Z" fill={color} />
      <circle cy="-39" r="8.5" fill={inner} />
    </g>
  );
}

export function House({ x, y, w, h, roof = "#38A96B", wall = "#FFFFFF" }: { x: number; y: number; w: number; h: number; roof?: string; wall?: string }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      <path d={`M${x - 6} ${y - h + 3}L${x + w / 2} ${y - h - w * 0.4}L${x + w + 6} ${y - h + 3}Z`} fill={roof} />
      <rect x={x + w * 0.16} y={y - h + h * 0.22} width={w * 0.22} height={h * 0.26} rx="2" fill="#CDEFD9" />
      <rect x={x + w * 0.62} y={y - h + h * 0.22} width={w * 0.22} height={h * 0.26} rx="2" fill="#CDEFD9" />
      <rect x={x + w * 0.4} y={y - h * 0.46} width={w * 0.2} height={h * 0.46} rx="2" fill="#79D99F" />
    </g>
  );
}

export function Tree({ x, y, r = 18, color = "#79D99F" }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      <rect x={x - 2.2} y={y - r * 0.9} width="4.4" height={r * 0.9} rx="2" fill="#2E6B4E" />
      <circle cx={x} cy={y - r * 1.25} r={r} fill={color} />
    </g>
  );
}

type Hold = "phone" | "key" | "none" | "reach";
/** Stilisierte Person, Blick nach links. y = Standfläche. hold="reach": Arm nach vorne ausgestreckt (z. B. Schlüsselübergabe). */
export function Person({
  x, y, s = 1, jacket = "#174B38", pants = "#2F5D78", skin = "#D9A27E", hair = "#2E2621", hold = "phone", flip = false, long = false,
}: { x: number; y: number; s?: number; jacket?: string; pants?: string; skin?: string; hair?: string; hold?: Hold; flip?: boolean; long?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cy="1" rx="19" ry="3.5" fill="#174B38" opacity=".15" />
      <rect x="-11" y="-55" width="10" height="53" rx="5" fill={pants} />
      <rect x="1" y="-55" width="10" height="53" rx="5" fill={pants} />
      <rect x="-17" y="-5" width="16" height="6" rx="3" fill="#17251F" />
      <rect x="-3" y="-5" width="16" height="6" rx="3" fill="#17251F" />
      <path d="M-16 -52C-18 -74 -14 -92 -3 -96H5C16 -92 19 -74 17 -52Z" fill={jacket} />
      {long && <path d="M-4 -121C9 -123 16 -112 15 -98C14 -91 12 -86 8 -83C9 -91 7 -99 2 -105C-1 -109 -4 -112 -7 -114Z" fill={hair} />}
      <rect x="-3.5" y="-102" width="7" height="8" rx="2" fill={skin} />
      <circle cx="-1" cy="-109" r="11" fill={skin} />
      <path d="M-12 -110C-12 -124 10 -125 11 -111C11 -105 9 -100 7 -98C8 -104 5 -110 -3 -112C-7 -112 -10 -112 -12 -110Z" fill={hair} />
      {hold === "none" ? (
        <path d="M-9 -88L-13 -62" stroke={jacket} strokeWidth="8" strokeLinecap="round" fill="none" />
      ) : hold === "reach" ? (
        <path d="M-8 -88L-21 -74L-35 -77" stroke={jacket} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      ) : (
        <path d="M-8 -88L-18 -70L-22 -83" stroke={jacket} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      )}
      {hold === "phone" && (
        <g>
          <rect x="-29" y="-101" width="9" height="15" rx="2" fill="#17251F" />
          <rect x="-27.5" y="-99" width="6" height="10" rx="1" fill="#79D99F" />
        </g>
      )}
      {hold === "key" && (
        <g fill="none" stroke="#174B38" strokeWidth="2.6" strokeLinecap="round">
          <circle cx="-26" cy="-96" r="4.5" fill="#F6E3A6" />
          <path d="M-26 -91.5V-80M-26 -84h3M-26 -81h2.5" />
        </g>
      )}
      {hold === "reach" && <circle cx="-37" cy="-77" r="3.6" fill={skin} />}
      {(hold === "phone" || hold === "key") && <circle cx="-22.5" cy="-84.5" r="3.6" fill={skin} />}
      <path d="M11 -88L15 -62" stroke={jacket} strokeWidth="8" strokeLinecap="round" fill="none" />
      <circle cx="15.5" cy="-59" r="3.6" fill={skin} />
    </g>
  );
}
