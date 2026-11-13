import { Car, House, Person, Tree } from "./parts";

export function PrivatArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 190" className={className} aria-hidden="true">
      <path d="M22 160C10 104 52 46 126 40C196 34 236 18 280 44C326 72 334 126 314 160Z" fill="#CDEFD9" opacity=".6" />
      <rect x="18" y="158" width="304" height="5" rx="2.5" fill="#B7E3C6" />
      <House x={40} y={160} w={82} h={64} roof="#38A96B" />
      <Tree x={138} y={160} r={15} color="#38A96B" />
      <Person x={176} y={160} s={0.78} hold="key" jacket="#38A96B" pants="#174B38" skin="#E3B08F" hair="#6B4A2E" flip />
      <Car name="blau" x={196} ground={160} w={132} />
    </svg>
  );
}

export function GewerbeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 190" className={className} aria-hidden="true">
      <path d="M20 160C12 98 58 42 132 38C204 34 244 16 286 44C330 74 334 128 314 160Z" fill="#CFE8E1" opacity=".7" />
      <rect x="18" y="158" width="304" height="5" rx="2.5" fill="#B5D9CF" />
      <rect x="54" y="56" width="214" height="102" fill="#FFFFFF" />
      <rect x="48" y="48" width="226" height="12" rx="3" fill="#2A7D6C" />
      <rect x="84" y="68" width="152" height="20" rx="5" fill="#1B5347" />
      <rect x="98" y="75" width="70" height="6" rx="3" fill="#9DD3C6" />
      <rect x="174" y="75" width="46" height="6" rx="3" fill="#E2F2EE" />
      <rect x="66" y="98" width="96" height="60" fill="#E2F2EE" />
      {[108, 118, 128, 138, 148].map((y) => (
        <rect key={y} x="66" y={y} width="96" height="2" fill="#C3DED6" />
      ))}
      <rect x="176" y="100" width="76" height="34" rx="3" fill="#CFE8E1" />
      <rect x="226" y="112" width="20" height="46" rx="2" fill="#9DD3C6" />
      <Car name="kombi" x={14} ground={170} w={150} />
      <Car name="suv" x={170} ground={170} w={150} />
    </svg>
  );
}
