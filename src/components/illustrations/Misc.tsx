import { Car } from "./parts";

export function EmptyArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 150" className={className} aria-hidden="true">
      <path d="M20 112C14 64 54 22 114 20C170 18 208 50 204 96C200 134 150 142 104 140C60 138 24 136 20 112Z" fill="#E7F8ED" />
      <path d="M26 118C80 108 140 108 196 116" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
      <circle cx="96" cy="64" r="30" fill="#FFFFFF" stroke="#174B38" strokeWidth="5" />
      <path d="M118 86l24 24" stroke="#174B38" strokeWidth="8" strokeLinecap="round" />
      <path d="M84 64h24" stroke="#79D99F" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export function RoadEndArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 220" className={className} role="img" aria-labelledby="nf-art">
      <title id="nf-art">Illustration: Ein Auto steht am Ende einer Strasse vor einem Wegweiser mit Fragezeichen.</title>
      <path d="M24 170C14 104 70 40 170 34C270 28 350 50 386 108C414 154 390 196 330 200C250 206 110 210 60 196C38 190 28 184 24 170Z" fill="#E7F8ED" />
      <path d="M0 186C90 172 200 170 300 176" stroke="#FFFFFF" strokeWidth="26" strokeLinecap="round" fill="none" />
      <path d="M296 150v40" stroke="#174B38" strokeWidth="5" strokeLinecap="round" />
      <path d="M268 112h54l14 14-14 14h-54Z" fill="#174B38" />
      <text x="297" y="133" fontSize="20" fontWeight="800" fill="#79D99F" textAnchor="middle">?</text>
      <path d="M330 186h40" stroke="#DDE9E1" strokeWidth="6" strokeLinecap="round" strokeDasharray="2 10" />
      <Car name="weiss" x={40} ground={184} w={210} />
    </svg>
  );
}

export function HorizonArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <path d="M0 150L120 90L190 120L300 50L390 110L470 76L560 126L660 60L760 118L850 84L960 132L1060 70L1200 128V200H0Z" fill="#CDEFD9" />
      <path d="M300 50L322 76L310 73L300 84L289 73L278 76ZM660 60L680 84L668 81L660 90L651 81L640 84ZM1060 70L1078 92L1068 89L1060 98L1052 89L1042 92Z" fill="#FFFFFF" />
      <path d="M0 170C200 146 420 160 640 150C860 140 1020 158 1200 150V200H0Z" fill="#B7E3C6" />
    </svg>
  );
}
