"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { House, Tree } from "@/components/illustrations/parts";
import { cn } from "@/lib/cn";
import type { StoryCar } from "./storyCars";

const STORY = [
  { cat: "cabriolet", label: "Cabriolet", title: "Ein Auto für den Sommer.", text: "Offen fahren, Sonne geniessen und einfach unterwegs sein." },
  { cat: "familienauto", label: "Familienauto", title: "Ein Auto für die ganze Familie.", text: "Mehr Platz für Kinder, Gepäck und gemeinsame Ausflüge." },
  { cat: "transporter", label: "Transporter", title: "Ein Auto für den Umzug.", text: "Mehr Platz für Möbel, Material und alles, was mit muss." },
  { cat: "elektro", label: "Elektro", title: "Ein Auto für den Alltag.", text: "Leise, modern und ideal für Stadt und kurze Wege." },
  { cat: "suv", label: "SUV", title: "Ein Auto fürs Wochenende.", text: "Komfortabel unterwegs, egal wohin die Reise geht." },
] as const;

/** Dauer pro Fahrzeug in Millisekunden */
const D = 6000;
/** Nach so vielen Durchgängen parkt das letzte Fahrzeug und bleibt stehen */
const ROUNDS = 5;
/** Anteil der Fahrt bis zur Parkposition – zwischen Abbremsen und langsamem Weiterrollen */
const PARK = 0.48;
/** Massstab der Fahrzeuge und Höhe der Fahrbahn in der Szene */
const S = 0.58;
const GROUND = 404;
/** Sichtbarer Ausschnitt: weit auf dem Desktop, näher und höher auf dem Handy */
const VIEW = { lg: [0, 0, 1200, 440], md: [150, 20, 900, 420], sm: [300, 60, 600, 380] } as const;
type Size = keyof typeof VIEW;
/** Einfahren und abbremsen, langsam weiterrollen, sanft beschleunigen und hinausfahren */
const TIMES = [0, 0.32, 0.64, 1];
const TEXT = [
  { opacity: 0, transform: "translateY(10px)", offset: 0, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { opacity: 1, transform: "none", offset: 0.14 },
  { opacity: 1, transform: "none", offset: 0.8, easing: "ease-in" },
  { opacity: 0, transform: "translateY(-6px)", offset: 0.92 },
  { opacity: 0, transform: "translateY(-6px)", offset: 1 },
];

/** Ruhige Landschaft im Stil der Hero-Illustration: Berge, Dorf, Bäume und eine Strasse */
const LANDSCAPE = (
  <>
    <rect x="-20" y="-20" width="1240" height="480" fill="#EEF8F2" />
    <circle cx="812" cy="98" r="30" fill="#F6E3A6" />
    <path d="M690 118c0-12 10-20 22-20 8 0 14 4 18 10 3-2 6-3 10-3 10 0 17 7 17 16v1H690Z" fill="#FFFFFF" />
    <path d="M1010 160c0-10 8-16 18-16 7 0 12 3 15 8 2-2 5-2 8-2 8 0 14 6 14 13v1h-55Z" fill="#FFFFFF" />
    <path d="M0 338C130 312 260 314 390 326V360H0Z" fill="#DDF1E4" />
    <path d="M370 330L470 226L522 266L628 152L712 248L790 198L880 274L960 216L1080 302L1200 254V360H370Z" fill="#D3EEDD" />
    <path d="M628 152L652 180L638 177L628 188L617 177L604 180ZM790 198L808 218L796 215L788 224L779 215L770 218ZM470 226L486 246L476 243L470 252L462 243L454 246ZM960 216L976 234L966 231L960 240L953 231L944 234Z" fill="#FFFFFF" />
    <path d="M0 352C170 326 340 340 520 330C700 320 880 338 1200 322V380H0Z" fill="#C3E7D0" />
    <House x={560} y={352} w={40} h={30} roof="#38A96B" />
    <House x={610} y={350} w={50} h={36} roof="#79D99F" />
    <g>
      <rect x="672" y="296" width="18" height="54" fill="#FFFFFF" />
      <path d="M668 298L681 262L694 298Z" fill="#38A96B" />
      <circle cx="681" cy="312" r="4.5" fill="#CDEFD9" />
    </g>
    <House x={900} y={348} w={46} h={32} roof="#79D99F" />
    <House x={956} y={350} w={38} h={28} roof="#38A96B" />
    <Tree x={120} y={352} r={15} color="#79D99F" />
    <Tree x={148} y={356} r={11} color="#38A96B" />
    <Tree x={430} y={360} r={18} color="#79D99F" />
    <Tree x={458} y={362} r={13} color="#38A96B" />
    <Tree x={770} y={358} r={16} color="#38A96B" />
    <Tree x={1064} y={354} r={18} color="#79D99F" />
    <Tree x={1094} y={358} r={12} color="#38A96B" />
    <path d="M0 364H1200V440H0Z" fill="#DAF2E2" />
    <path d="M0 374H1200V414H0Z" fill="#FFFFFF" />
    <path d="M0 394H1200" stroke="#CDEFD9" strokeWidth="3" strokeDasharray="14 11" />
    <path d="M0 418H1200V440H0Z" fill="#D3EEDD" />
  </>
);

/**
 * «Welches Auto brauchst du?» als kleine Geschichte: Nacheinander fährt ein Fahrzeug durch die Landschaft,
 * dazu erscheint ein kurzer Text. Die Räder drehen sich passend zur gefahrenen Strecke. Die Animation pausiert
 * ausserhalb des sichtbaren Bereichs und solange der Fokus im Bereich liegt (z. B. nach Tippen auf einen
 * Fahrzeugtyp – das Fahrzeug bleibt dann stehen). Nach ROUNDS Durchgängen fährt das letzte Fahrzeug ein und parkt;
 * ein Tipp auf einen Fahrzeugtyp zeigt dann dieses Fahrzeug, ohne die Schleife neu zu starten.
 * Bei reduzierter Bewegung steht das Fahrzeug still.
 */
export function VehicleStory({ cars }: { cars: StoryCar[] }) {
  const [i, setI] = useState(0);
  // Bisher abgelaufene Fahrten; die letzte endet auf der Parkposition
  const [n, setN] = useState(0);
  const final = n >= ROUNDS * STORY.length - 1;
  const [size, setSize] = useState<Size>("lg");
  const [reduce, setReduce] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const anims = useRef<Animation[]>([]);
  const hold = useRef({ focus: false, visible: false });

  const [vx, vy, vw, vh] = VIEW[size];
  const c = cars[i];
  const carW = c.L * S;
  const x0 = vx - carW - 24;
  const x1 = vx + vw * 0.45 - carW / 2;
  const x2 = x1 + vw * 0.1;
  const x3 = vx + vw + 24;
  const s = STORY[i];

  // Läuft nur, wenn die Szene sichtbar ist, der Tab aktiv ist und der Fokus nicht im Bereich liegt
  const sync = useCallback(() => {
    const run = hold.current.visible && !hold.current.focus && !document.hidden;
    anims.current.forEach((a) => (run ? a.play() : a.pause()));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setReduce(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      setSize(w < 640 ? "sm" : w < 1024 ? "md" : "lg");
    });
    const io = new IntersectionObserver(([e]) => {
      hold.current.visible = e.isIntersecting;
      sync();
    }, { threshold: 0.35 });
    if (box.current) {
      ro.observe(box.current);
      io.observe(box.current);
    }
    document.addEventListener("visibilitychange", sync);
    return () => {
      mq.removeEventListener("change", onMq);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [sync]);

  useEffect(() => {
    const car = carRef.current, text = textRef.current;
    if (reduce || !car || !text) return;
    // Übergänge ohne Ruck: Die Kurven enden bzw. beginnen mit der Geschwindigkeit des langsamen Rollens
    const cruise = (x2 - x1) / 0.32;
    const s1 = cruise / ((x1 - x0) / 0.32);
    const s3 = cruise / ((x3 - x2) / 0.36);
    const ease = [`cubic-bezier(0.25, 0.34, 0.6, ${(1 - 0.4 * s1).toFixed(3)})`, "linear", `cubic-bezier(0.4, ${(0.4 * s3).toFixed(3)}, 0.75, 0.625)`];
    const xs = [x0, x1, x2, x3];
    const frames = (f: (x: number) => string) => xs.map((x, k) => ({ transform: f(x), offset: TIMES[k], easing: ease[k] ?? "linear" }));
    const tire = (c.wr + 4) * S;
    // Die letzte Fahrt spielt nur bis zur Parkposition und hält dort an
    const timing: KeyframeAnimationOptions = { duration: D, iterations: final ? PARK : 1, fill: "both" };
    const list: Animation[] = [car.animate(frames((x) => `translateX(${x.toFixed(1)}px)`), timing)];
    car.querySelectorAll(".rac-spin").forEach((w) =>
      list.push(w.animate(frames((x) => `rotate(${(((x - x0) / tire) * 180 / Math.PI).toFixed(1)}deg)`), timing)),
    );
    list.push(text.animate(TEXT, timing));
    const bar = bars.current[i];
    // Tailwind setzt die Skalierung über die Eigenschaft «scale» – darum diese animieren, nicht «transform»
    if (bar) list.push(bar.animate([{ scale: "0 1" }, { scale: "1 1" }], { duration: final ? D * PARK : D, fill: "both" }));
    list[0].onfinish = () => {
      // Am Ende nichts mehr fortsetzen – sonst würde ein erneutes play() die Fahrt neu starten
      if (final) return void (anims.current = []);
      setN((k) => k + 1);
      setI((k) => (k + 1) % STORY.length);
    };
    anims.current = list;
    // Liegt der Fokus im Bereich, steht das gewählte Fahrzeug gleich auf der Strasse
    if (hold.current.focus) list.forEach((a) => (a.currentTime = D * 0.45));
    sync();
    return () => {
      list.forEach((a) => a.cancel());
      anims.current = [];
    };
  }, [i, size, reduce, final, c, x0, x1, x2, x3, sync]);

  const go = (k: number) => {
    if (k !== i) return setI(k);
    if (hold.current.focus) anims.current.forEach((a) => (a.currentTime = D * 0.45));
  };
  const park = (x1 + x2) / 2;

  return (
    <section
      aria-labelledby="kategorien"
      className="mt-12 border-y border-line bg-white sm:mt-16 lg:mt-0 lg:border-0 lg:bg-transparent"
      onFocus={() => {
        hold.current.focus = true;
        sync();
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        hold.current.focus = false;
        sync();
      }}
    >
      <div className="page py-14 sm:py-16 lg:pt-16 lg:pb-20">
      <h2 id="kategorien" className="h-section">Welches Auto brauchst du?</h2>
      <p className="mt-3 text-ink/75 lg:mt-2">Für jeden Moment das passende Fahrzeug.</p>

      {/* Handy und Tablet: Text im «Himmel» der Szene über der Landschaft; Desktop: Text links über der Szene */}
      <div ref={box} className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-[#EEF8F2] ring-1 ring-line/70 lg:mt-6">
        <div ref={textRef} className="min-h-[9rem] px-5 pt-6 sm:min-h-[6.75rem] sm:px-8 sm:pt-8 lg:absolute lg:top-[10%] lg:left-[5%] lg:z-10 lg:min-h-0 lg:max-w-[27rem] lg:p-0">
          <p className="font-display text-[1.45rem] leading-tight font-bold text-forest sm:text-[1.9rem]">{s.title}</p>
          <p className="mt-2 text-[1rem] leading-relaxed text-ink/75 sm:text-[1.02rem]">{s.text}</p>
        </div>
        <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className="block h-auto w-full" aria-hidden="true" focusable="false">
          {LANDSCAPE}
          <g ref={carRef} style={{ transform: `translateX(${reduce ? park : x0}px)` }}>
            <g transform={`translate(0 ${GROUND}) scale(${S})`} dangerouslySetInnerHTML={{ __html: c.svg }} />
          </g>
        </svg>
      </div>

      <div className="mt-5 flex flex-col gap-5 sm:mt-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div role="group" aria-label="Fahrzeugtyp wählen" className="flex gap-2.5 sm:gap-4">
          {STORY.map((x, k) => (
            <button key={x.cat} type="button" onClick={() => go(k)} aria-pressed={k === i} aria-label={`${x.label}: ${x.title}`} className="group min-w-0 flex-auto cursor-pointer py-2 text-left sm:flex-none">
              <span className={cn("block truncate text-xs font-semibold sm:text-sm", k === i ? "text-forest" : "text-muted group-hover:text-forest")}>{x.label}</span>
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-line sm:w-24">
                <span
                  ref={(el) => {
                    bars.current[k] = el;
                  }}
                  className={cn("block h-full origin-left bg-forest", k < i || (k === i && reduce) ? "scale-x-100" : "scale-x-0")}
                />
              </span>
            </button>
          ))}
        </div>
        <Link href={`/autos?anbieter=alle&kategorie=${s.cat}`} className="btn btn-outline w-full sm:w-auto sm:self-start lg:self-auto" aria-label={`Passende Fahrzeuge ansehen: ${s.label}`}>
          Passende Fahrzeuge ansehen
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      </div>
    </section>
  );
}
