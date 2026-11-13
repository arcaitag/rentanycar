import type { Metadata } from "next";
import { Fragment } from "react";
import { AGB_MD } from "@/data/agb";
import { LegalPage, Placeholder } from "@/components/pages/Legal";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von RentAnyCar: Rolle der Plattform, Versicherung, Pflichten, Haftung, Zahlungen und Stornierungen.",
  alternates: { canonical: "/agb" },
};

type Block = { t: "h1" | "h2" | "h3" | "p"; text: string } | { t: "ul" | "ol"; items: string[] };

/** Zerlegt den AGB-Text in Blöcke. Bewusst einfach: nur die Elemente, die der Text verwendet. */
function parse(md: string): Block[] {
  const out: Block[] = [];
  for (const chunk of md.trim().split(/\n\s*\n/)) {
    const lines = chunk.split("\n");
    const head = /^(#{1,3}) (.+)$/.exec(lines[0]);
    if (head) {
      out.push({ t: (["h1", "h2", "h3"] as const)[head[1].length - 1], text: head[2] });
      continue;
    }
    const kind = lines.every((l) => l.startsWith("- ")) ? "ul" : lines.every((l) => /^\d+\. /.test(l)) ? "ol" : null;
    if (kind) {
      const items = lines.map((l) => l.replace(/^(- |\d+\. )/, ""));
      const prev = out.at(-1);
      // Nummerierte Punkte mit Leerzeilen dazwischen bilden eine Liste
      if (prev && (prev.t === "ul" || prev.t === "ol") && prev.t === kind) prev.items.push(...items);
      else out.push({ t: kind, items });
      continue;
    }
    out.push({ t: "p", text: chunk });
  }
  return out;
}

/** Anker aus der Ziffer: «5. Versicherung …» → ziffer-5, «5.1 …» → ziffer-5-1 */
const anchor = (text: string) => {
  const m = /^(\d+)(?:\.(\d+))?/.exec(text);
  return m ? `ziffer-${m[1]}${m[2] ? `-${m[2]}` : ""}` : undefined;
};

/** **fett**, [Platzhalter] und Zeilenumbruch (zwei Leerzeichen am Zeilenende) */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/ {2}\n/).map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line
            .replace(/\n/g, " ")
            .split(/(\*\*[^*]+\*\*|\[[^\]]+\])/)
            .filter(Boolean)
            .map((part, j) => {
              const bold = part.startsWith("**") && part.endsWith("**");
              const inner = bold ? part.slice(2, -2) : part;
              if (/^\[.+\]$/.test(inner)) return <Placeholder key={j}>{inner.slice(1, -1)}</Placeholder>;
              return bold ? <strong key={j} className="font-semibold text-ink">{inner}</strong> : <Fragment key={j}>{inner}</Fragment>;
            })}
        </Fragment>
      ))}
    </>
  );
}

function render(b: Block, i: number) {
  switch (b.t) {
    case "h3":
      return <h3 key={i} id={anchor(b.text)}><Inline text={b.text} /></h3>;
    case "p":
      return <p key={i}><Inline text={b.text} /></p>;
    case "ul":
    case "ol": {
      const List = b.t;
      return <List key={i}>{b.items.map((x, j) => <li key={j}><Inline text={x} /></li>)}</List>;
    }
    default:
      return null;
  }
}

export default function AgbPage() {
  const blocks = parse(AGB_MD);
  const h1 = blocks.find((b) => b.t === "h1");
  const title = h1 && "text" in h1 ? h1.text : "Allgemeine Geschäftsbedingungen";
  const intro: Block[] = [];
  const sections: { title: string; id?: string; blocks: Block[] }[] = [];
  for (const b of blocks) {
    if (b.t === "h1") continue;
    if (b.t === "h2") sections.push({ title: b.text, id: anchor(b.text), blocks: [] });
    else (sections.at(-1)?.blocks ?? intro).push(b);
  }

  return (
    <LegalPage title={title.replace("Geschäftsbedingungen", "Geschäfts\u00ADbedingungen")}>
      <div>
        <p className="rounded-2xl bg-sun/15 p-5 font-semibold text-[#5c4611]">Entwurf für die Vorschau.</p>
        <div className="mt-5">{intro.map(render)}</div>
      </div>
      <nav aria-labelledby="agb-inhalt" className="rounded-2xl border border-line bg-white p-5">
        <h2 id="agb-inhalt" className="text-lg!">Inhalt</h2>
        <ul className="mt-3! grid list-none! gap-x-6! gap-y-1.5! pl-0! text-[0.95rem] sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.title}>
              <a href={`#${s.id}`} className="hover:text-forest hover:underline">{s.title}</a>
            </li>
          ))}
        </ul>
      </nav>
      {sections.map((s) => (
        <section key={s.title} id={s.id} aria-labelledby={`${s.id}-titel`}>
          <h2 id={`${s.id}-titel`}>{s.title}</h2>
          {s.blocks.map(render)}
        </section>
      ))}
    </LegalPage>
  );
}
