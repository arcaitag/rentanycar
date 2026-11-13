import { Check } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { chf } from "@/lib/format";
import { fmtKm } from "@/lib/mileage";
import { ABO_SERVICES, COVERAGE, fmtMonths, offersOf, priceTag } from "@/lib/offers";
import { cn } from "@/lib/cn";

/** Konditionen je Mietmodell – kurze Listen statt Tabellen. Langzeit und Auto-Abo immer pro Monat, einmalige Kosten separat. */
export function OfferDetails({ v }: { v: Vehicle }) {
  const o = offersOf(v);
  const cards: { title: string; price: string; once?: string; lines: string[] }[] = [];
  const tiers = (unit: "tage" | "monate") => (o.tiers ?? []).filter((t) => t.unit === unit).sort((a, b) => a.from - b.from);
  if (o.models.includes("kurzzeit")) {
    const s = o.short ?? {};
    cards.push({
      title: "Kurzzeitmiete",
      price: `${chf(v.price)} pro Tag`,
      lines: [
        ...tiers("tage").map((t) => `ab ${t.from} Tagen: ${chf(t.price)} pro Tag`),
        ...(s.minDays && s.minDays > 1 ? [`Mindestmietdauer ${s.minDays} Tage`] : []),
        ...(s.maxDays ? [`Höchstens ${s.maxDays} Tage`] : []),
        ...(s.coverage ? [`Versicherung: ${COVERAGE[s.coverage]}`] : []),
        ...(s.deductible ? [`Selbstbehalt ${chf(s.deductible)}`] : []),
        ...(s.deposit ? [`Kaution ${chf(s.deposit)}`] : []),
      ],
    });
  }
  if (o.models.includes("langzeit") && o.long) {
    const l = o.long;
    cards.push({
      title: "Langzeitmiete",
      price: `${chf(l.monthly)} pro Monat`,
      lines: [
        ...tiers("monate").map((t) => `ab ${t.from} ${t.from === 1 ? "Monat" : "Monaten"}: ${chf(t.price)} pro Monat`),
        `${fmtKm(l.kmPerMonth)} pro Monat inklusive, Mehrkilometer ${chf(l.extraKmPrice)} pro km`,
        `Mindestmietdauer ${fmtMonths(l.minMonths)}`,
        ...(l.notice ? [`Kündigung: ${l.notice}`] : []),
        ...(l.extension ? [`Verlängerung: ${l.extension}`] : []),
        ...(l.deposit ? [`Kaution ${chf(l.deposit)}`] : []),
      ],
    });
  }
  if (o.models.includes("abo") && o.abo) {
    const a = o.abo;
    const t = priceTag(v, "abo");
    cards.push({
      title: "Auto-Abo",
      price: `${t.from ? "ab " : ""}${chf(a.monthly)} pro Monat`,
      once: t.once,
      lines: [
        `Mindestlaufzeit ${fmtMonths(a.minMonths)}, Kündigungsfrist ${fmtMonths(a.noticeMonths)}${a.maxMonths ? `, höchstens ${fmtMonths(a.maxMonths)}` : ""}`,
        `${fmtKm(a.packages[0].km)} pro Monat inklusive${a.packages.length > 1 ? `, grössere Pakete ab + ${chf(a.packages[1].surcharge)}` : ""}`,
        `Mehrkilometer ${chf(a.extraKmPrice)} pro km`,
        `Inklusive: ${[...a.included.map((k) => ABO_SERVICES[k]), ...(a.includedText ? [a.includedText] : [])].join(", ")}`,
        ...(a.addons?.length ? [`Zusatzleistungen: ${a.addons.map((x) => `${x.label} + ${chf(x.monthly)}`).join(", ")} pro Monat`] : []),
        ...(a.deposit ? [`Kaution ${chf(a.deposit)}`] : []),
      ],
    });
  }
  // Drei Modelle untereinander statt 2 + 1: Preis links, Konditionen rechts
  const stacked = cards.length > 2;
  return (
    <div className={cn("grid items-start gap-4", stacked ? "" : cards.length > 1 ? "md:grid-cols-2" : "max-w-xl")}>
      {cards.map((c) => (
        <div key={c.title} className={cn("rounded-2xl bg-white p-4 ring-1 ring-line sm:p-5", stacked && "md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:gap-6")}>
          <div>
            <h3 className="font-bold text-forest">{c.title}</h3>
            <p className="mt-0.5 font-display text-xl font-semibold text-forest">{c.price}</p>
            {c.once && <p className="text-sm font-semibold text-ink/75">{c.once}</p>}
          </div>
          {c.lines.length > 0 && (
            <ul className={cn("mt-3 grid gap-1.5 text-[0.95rem] text-ink/85", stacked && "md:mt-0")}>
              {c.lines.map((l) => (
                <li key={l} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />{l}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
