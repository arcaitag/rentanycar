import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarRange, Repeat } from "lucide-react";

const ENTRIES = [
  { icon: CalendarDays, title: "Auto für ein paar Tage", text: "Private und gewerbliche Fahrzeuge für die Kurzzeitmiete.", cta: "Auto finden", href: "/autos?anbieter=alle&dauer=tage" },
  { icon: CalendarRange, title: "Auto für mehrere Wochen oder Monate", text: "Flexible Langzeitmiete zum Monatspreis.", cta: "Langzeitangebote ansehen", href: "/autos?anbieter=alle&dauer=monate" },
  { icon: Repeat, title: "Auto-Abo", text: "Monatlicher Fixpreis mit Laufzeit und Leistungen.", cta: "Auto-Abos entdecken", href: "/autos?anbieter=alle&dauer=abo" },
];

/** Drei Einstiege nach Mietdauer */
export function Durations() {
  return (
    <section className="page pt-12 sm:pt-16" aria-labelledby="mietdauer">
      <h2 id="mietdauer" className="h-section">Wie lange brauchst du ein Auto?</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {ENTRIES.map(({ icon: Icon, title, text, cta, href }) => (
          <li key={title} className="card flex flex-col p-5 sm:p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-leaf-100 text-forest"><Icon className="size-5" aria-hidden /></span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-ink/75">{text}</p>
            <Link href={href} className="link mt-auto inline-flex items-center gap-1.5 self-start pt-4 font-semibold">
              {cta}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
