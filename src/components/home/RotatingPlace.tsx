"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Orte, die nacheinander getippt werden */
const PLACES = ["Bern", "Zürich", "Basel", "Luzern", "Lausanne"];
/** Steht zu Beginn und am Ende – auch für Suchmaschinen, Screenreader und bei reduzierter Bewegung */
const HOME = "deiner Nähe";
/** Anzahl Durchgänge – Infinity = endlos. Bei einer Zahl wird danach «deiner Nähe» getippt und der Cursor blendet aus. */
const ROUNDS: number = Infinity;
/** Zeiten in Millisekunden: ruhiges Tippen mit leichter Variation, etwas schnelleres Löschen */
const T = { start: 1600, type: 120, jitter: 35, erase: 60, hold: 2000, gap: 450, cursorOut: 2600 };

/**
 * Ort in der Hero-Headline mit Schreibmaschinen-Effekt: Buchstabe für Buchstabe tippen, kurz stehen lassen,
 * wieder löschen, nächster Ort. Der Cursor steht beim Tippen ruhig und blinkt in den Pausen.
 * Pausiert, solange der Hero nicht im Bild ist oder der Tab im Hintergrund liegt.
 */
export function RotatingPlace() {
  const [text, setText] = useState(HOME);
  const [busy, setBusy] = useState(false);
  const [cursor, setCursor] = useState(true);
  const caret = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCursor(false);
      return;
    }
    let alive = true;
    let timer = 0;
    const wait = (ms: number) => new Promise<void>((r) => { timer = window.setTimeout(r, ms); });
    // Weiter erst, wenn der Hero sichtbar und der Tab aktiv ist
    let inView = true;
    let wake: (() => void) | null = null;
    const check = () => {
      if (wake && inView && !document.hidden) {
        const w = wake;
        wake = null;
        w();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      check();
    });
    if (box.current) io.observe(box.current);
    document.addEventListener("visibilitychange", check);
    const ready = () => new Promise<void>((r) => { wake = r; check(); });

    let current = HOME;
    const show = async (word: string) => {
      setBusy(true);
      for (let n = current.length - 1; n >= 0; n--) {
        await wait(T.erase);
        if (!alive) return;
        setText(current.slice(0, n));
      }
      await wait(T.gap);
      for (let n = 1; n <= word.length; n++) {
        await wait(T.type + Math.random() * T.jitter);
        if (!alive) return;
        setText(word.slice(0, n));
      }
      setBusy(false);
      current = word;
    };

    (async () => {
      await wait(T.start);
      for (let r = 0; r < ROUNDS; r++) {
        for (const word of PLACES) {
          await ready();
          if (!alive) return;
          await show(word);
          if (!alive) return;
          await wait(T.hold);
        }
      }
      await ready();
      if (!alive) return;
      await show(HOME);
      await wait(T.cursorOut);
      if (alive) setCursor(false);
    })();
    return () => {
      alive = false;
      window.clearTimeout(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  // Weiches Blinken nur in den Pausen; beim Tippen und Löschen steht der Cursor
  useEffect(() => {
    const el = caret.current;
    if (!el || busy || !cursor) return;
    const a = el.animate(
      [{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0, offset: 0.58 }, { opacity: 0, offset: 0.9 }, { opacity: 1 }],
      { duration: 1100, iterations: Infinity, easing: "ease-in-out" },
    );
    return () => a.cancel();
  }, [busy, cursor]);

  return (
    <>
      <span className="sr-only">{HOME}.</span>
      <span ref={box} aria-hidden="true" className="whitespace-nowrap">
        <span className="text-leaf-700">{text}</span>
        <span
          ref={caret}
          className={cn(
            "ml-[0.05em] inline-block h-[0.82em] w-[0.07em] min-w-[2px] translate-y-[0.06em] rounded-full bg-leaf-500 transition-opacity duration-700",
            !cursor && "opacity-0",
          )}
        />
        .
      </span>
    </>
  );
}
