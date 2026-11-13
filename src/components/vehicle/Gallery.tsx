"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PhotoCredit } from "@/data/photos";
import { cn } from "@/lib/cn";

/** Fotogalerie mit fester Bühnengrösse und Vorschaubildern darunter. */
export function Gallery({ images, title, placeholder = false, credit }: { images: { src: string; alt: string }[]; title: string; placeholder?: boolean; credit?: PhotoCredit }) {
  const [i, setI] = useState(0);
  const many = images.length > 1;
  const go = (n: number) => setI((n + images.length) % images.length);
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-2xl border border-line bg-leaf-50"
        role="region"
        aria-roledescription="Bildergalerie"
        aria-label={`Bilder von ${title}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(i + 1);
          if (e.key === "ArrowLeft") go(i - 1);
        }}
      >
        <img src={images[i].src} alt={images[i].alt} width={1200} height={800} className="aspect-[3/2] w-full object-cover lg:aspect-[16/9]" />
        {credit && <span className="absolute bottom-3 left-3 rounded-md bg-ink/65 px-2 py-1 text-xs font-semibold text-white">Symbolbild</span>}
        {many && (
          <>
            <p className="chip absolute bottom-3 left-3 bg-white/95 text-forest" aria-live="polite">Bild {i + 1} von {images.length}</p>
            <div className="absolute inset-y-0 right-3 left-3 flex items-center justify-between">
              <button type="button" className="icon-btn bg-white/95 shadow-sm" aria-label="Vorheriges Bild" onClick={() => go(i - 1)}><ChevronLeft className="size-5" aria-hidden /></button>
              <button type="button" className="icon-btn bg-white/95 shadow-sm" aria-label="Nächstes Bild" onClick={() => go(i + 1)}><ChevronRight className="size-5" aria-hidden /></button>
            </div>
          </>
        )}
      </div>
      {many && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, n) => (
            <li key={img.src} className="w-24 shrink-0">
              <button
                type="button"
                onClick={() => setI(n)}
                aria-label={`Bild ${n + 1} anzeigen`}
                aria-current={n === i}
                className={cn("block w-full cursor-pointer overflow-hidden rounded-lg border-2 transition", n === i ? "border-forest" : "border-transparent opacity-80 hover:opacity-100")}
              >
                <img src={img.src} alt="" width={96} height={64} loading="lazy" className="aspect-[3/2] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {placeholder && <p className="mt-2 text-sm text-muted">Beispielillustration. Im Inserat erscheinen die Fotos der vermietenden Person oder des Unternehmens.</p>}
      {credit && (
        <p className="mt-2 text-sm text-muted">
          Symbolbild des Modells, nicht das vermietete Auto. Foto: {credit.author},{" "}
          {credit.licenseUrl ? <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-forest">{credit.license}</a> : credit.license}, via{" "}
          <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-forest">Wikimedia Commons</a>
        </p>
      )}
    </div>
  );
}
