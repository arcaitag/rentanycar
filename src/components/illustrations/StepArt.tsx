import { Car, Pin } from "./parts";

const card = { fill: "#FFFFFF", stroke: "#DDE9E1", strokeWidth: 2 };

export function StepSearch() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
      <rect x="58" y="8" width="74" height="126" rx="14" fill="#FFFFFF" stroke="#174B38" strokeWidth="3" />
      <rect x="66" y="20" width="58" height="92" rx="7" fill="#E7F8ED" />
      <path d="M66 60C84 54 104 70 124 62M94 20V112M66 92C80 88 104 96 124 90" stroke="#FFFFFF" strokeWidth="5" fill="none" />
      <rect x="71" y="25" width="48" height="10" rx="5" fill="#FFFFFF" />
      <Pin x={86} y={62} s={0.36} />
      <Pin x={110} y={90} s={0.36} color="#38A96B" inner="#FFFFFF" />
      <g transform="translate(132 66)">
        <rect width="54" height="50" rx="9" {...card} />
        <rect x="1" y="1" width="52" height="13" rx="8" fill="#79D99F" />
        {[0, 1, 2, 3].map((c) => [0, 1].map((r) => <rect key={`${c}${r}`} x={8 + c * 11} y={22 + r * 12} width="7" height="7" rx="2" fill={c === 1 && r === 0 ? "#174B38" : "#E7F8ED"} />))}
      </g>
    </svg>
  );
}

export function StepRequest() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
      <rect x="22" y="12" width="118" height="118" rx="14" {...card} />
      <rect x="30" y="20" width="102" height="48" rx="9" fill="#E7F8ED" />
      <Car name="gruen" x={40} ground={62} w={82} />
      <rect x="30" y="78" width="66" height="8" rx="4" fill="#174B38" />
      <rect x="30" y="92" width="44" height="6" rx="3" fill="#CDEFD9" />
      <rect x="30" y="106" width="62" height="16" rx="8" fill="#174B38" />
      <path d="M100 114C124 108 136 86 150 66" stroke="#79D99F" strokeWidth="2.5" strokeDasharray="1 7" strokeLinecap="round" fill="none" />
      <path d="M146 58L188 34L172 78L162 64Z" fill="#79D99F" stroke="#174B38" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M162 64L188 34" stroke="#174B38" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function StepHandover() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
      <rect x="18" y="16" width="98" height="112" rx="14" fill="#FFFFFF" stroke="#174B38" strokeWidth="3" />
      <rect x="26" y="26" width="82" height="70" rx="8" fill="#E7F8ED" />
      <Car name="gruen" x={30} ground={80} w={76} />
      <path d="M32 40V32h8M94 32h8v8M102 82v8h-8M40 90h-8v-8" stroke="#38A96B" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="67" cy="112" r="8" fill="#174B38" />
      <g transform="translate(108 34)">
        <rect width="78" height="92" rx="12" {...card} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(10 ${14 + i * 26})`}>
            <circle cx="8" cy="8" r="8" fill={i < 2 ? "#38A96B" : "#E7F8ED"} />
            {i < 2 && <path d="M4.5 8.2l2.4 2.4 4.6-5" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="22" y="5" width={i === 1 ? 26 : 34} height="6" rx="3" fill="#CDEFD9" />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function StepDrive() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
      <path d="M0 104C60 94 130 94 200 102V128C130 120 60 120 0 130Z" fill="#FFFFFF" />
      <path d="M8 116C70 108 130 108 196 114" stroke="#CDEFD9" strokeWidth="2.5" strokeDasharray="10 8" fill="none" />
      <path d="M14 70H44M6 84H40M20 56H46" stroke="#79D99F" strokeWidth="4" strokeLinecap="round" />
      <Car name="gruen" x={48} ground={112} w={128} />
      <g transform="translate(160 18)" fill="none" stroke="#174B38" strokeWidth="3" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" fill="#F6E3A6" />
        <path d="M12 21v22M12 33h6M12 40h5" />
      </g>
    </svg>
  );
}

export function RentOutArt({ className }: { className?: string }) {
  const days = [0, 0, 1, 1, 1, 2, 2, 1, 1, 3, 3, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1];
  const tone = ["#F1F5F3", "#79D99F", "#FFFFFF", "#174B38"];
  return (
    <svg viewBox="0 0 520 420" className={className} role="img" aria-labelledby="rent-art">
      <title id="rent-art">Illustration: Auto mit Verfügbarkeitskalender und einer beispielhaften Einnahmenübersicht.</title>
      <path d="M40 222C24 120 104 36 228 34C352 32 416 60 468 124C520 188 508 312 432 360C356 408 204 404 122 370C62 346 48 282 40 222Z" fill="#CDEFD9" opacity=".55" />
      <g transform="translate(34 40)">
        <rect x="4" y="8" width="238" height="198" rx="20" fill="#174B38" opacity=".06" />
        <rect width="238" height="198" rx="20" fill="#FFFFFF" />
        <text x="20" y="34" fontSize="15" fontWeight="700" fill="#174B38">Verfügbarkeit</text>
        <rect x="170" y="18" width="48" height="24" rx="12" fill="#38A96B" />
        <circle cx="206" cy="30" r="8" fill="#FFFFFF" />
        {["M", "D", "M", "D", "F", "S", "S"].map((d, i) => (
          <text key={i} x={30 + i * 30} y="66" fontSize="11" fontWeight="700" fill="#66736D" textAnchor="middle">{d}</text>
        ))}
        {days.map((t, i) => (
          <rect key={i} x={18 + (i % 7) * 30} y={76 + Math.floor(i / 7) * 28} width="24" height="22" rx="6" fill={tone[t]} stroke={t === 2 ? "#DDE9E1" : "none"} />
        ))}
      </g>
      <g transform="translate(276 150)">
        <rect x="4" y="8" width="210" height="164" rx="20" fill="#174B38" opacity=".06" />
        <rect width="210" height="164" rx="20" fill="#FFFFFF" />
        <text x="20" y="34" fontSize="15" fontWeight="700" fill="#174B38">Einnahmen</text>
        <rect x="112" y="19" width="80" height="21" rx="6" fill="#F6E3A6" />
        <text x="152" y="34" fontSize="10.5" fontWeight="700" fill="#6B5213" textAnchor="middle">Beispieldaten</text>
        {[34, 52, 40, 70, 58, 86].map((h, i) => (
          <rect key={i} x={22 + i * 29} y={140 - h} width="17" height={h} rx="5" fill={i === 5 ? "#38A96B" : "#CDEFD9"} />
        ))}
        <path d="M18 146H192" stroke="#DDE9E1" strokeWidth="2" />
      </g>
      <path d="M30 372H500" stroke="#B7E3C6" strokeWidth="4" strokeLinecap="round" />
      <Car name="mini" x={60} ground={372} w={262} />
    </svg>
  );
}
