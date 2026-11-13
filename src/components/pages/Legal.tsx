import { OPERATOR } from "@/lib/operator";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="page max-w-3xl pt-10 pb-20 sm:pt-14">
      <p className="text-sm font-semibold text-leaf-700">Rechtliches</p>
      <h1 className="mt-1.5 text-[2.4rem] leading-tight font-bold sm:text-[3rem]">{title}</h1>
      {updated && <p className="mt-2 text-muted">rentanycar.ch · Stand: {updated}</p>}
      <div className="legal mt-8 grid gap-8 text-[1.02rem] leading-relaxed text-ink/85 [&_h2]:text-2xl [&_h2]:font-bold [&_h2+*]:mt-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3+*]:mt-1.5 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:grid [&_ul]:list-disc [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:grid [&_ol]:list-decimal [&_ol]:gap-1.5 [&_ol]:pl-6 [&_ul+p]:mt-3 [&_ol+p]:mt-3">{children}</div>
    </div>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-sun/25 px-1.5 py-0.5 font-semibold text-[#5c4611]">{children}</span>;
}

/** Hervorgehobener Hinweis, z. B. zum Stand der Vorschau */
export function LegalNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-leaf-50 p-5 ring-1 ring-leaf-200">
      <p className="font-bold text-forest">{title}</p>
      <div className="mt-1.5 text-[0.98rem]">{children}</div>
    </div>
  );
}

/** Inhaltsverzeichnis mit Sprungmarken wie bei den AGB */
export function LegalToc({ items }: { items: { id: string; title: string }[] }) {
  return (
    <nav aria-labelledby="inhalt" className="rounded-2xl border border-line bg-white p-5">
      <h2 id="inhalt" className="text-lg!">Inhalt</h2>
      <ol className="mt-3! grid list-none! gap-x-6! gap-y-1.5! pl-0! text-[0.95rem] sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="hover:text-forest hover:underline">{s.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Zweispaltige Angaben, z. B. Unternehmensdaten oder Dienstleister */
export function LegalFacts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="mt-3 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-line sm:gap-2">
      {rows.map(([k, v]) => (
        <div key={k} className="grid gap-0.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="font-semibold text-ink">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Adresse der Betreiberin mit Kontaktangaben */
export function OperatorAddress({ phone = false, email = OPERATOR.email }: { phone?: boolean; email?: string }) {
  return (
    <p>
      <strong className="font-semibold text-ink">{OPERATOR.name}</strong>
      <br />
      {OPERATOR.street}
      <br />
      {OPERATOR.zip} {OPERATOR.city}
      <br />
      {OPERATOR.country}
      {phone && (
        <>
          <br />
          Telefon: <a href={OPERATOR.phoneHref} className="link">{OPERATOR.phone}</a>
        </>
      )}
      <br />
      E-Mail: <a href={`mailto:${email}`} className="link">{email}</a>
    </p>
  );
}
