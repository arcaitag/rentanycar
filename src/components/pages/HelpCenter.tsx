"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, Search } from "lucide-react";
import { HELP_TOPICS } from "@/data/faq";
import { Accordion } from "@/components/ui/Accordion";
import { Choice } from "@/components/ui/Choice";

export function HelpCenter() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("alle");
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ name: "", email: "", thema: HELP_TOPICS[0].title, text: "" });
  const [tried, setTried] = useState(false);
  const topics = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return HELP_TOPICS.filter((t) => topic === "alle" || t.id === topic)
      .map((t) => ({ ...t, items: t.items.filter((i) => !needle || `${i.q} ${i.a}`.toLowerCase().includes(needle)) }))
      .filter((t) => t.items.length);
  }, [q, topic]);
  const hits = topics.reduce((n, t) => n + t.items.length, 0);
  const errs = { name: !f.name.trim(), email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email), text: f.text.trim().length < 10 };

  return (
    <>
      <div className="relative max-w-2xl">
        <label htmlFor="hilfe-suche" className="sr-only">Hilfe durchsuchen</label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-leaf-700" aria-hidden />
        <input id="hilfe-suche" type="search" className="field min-h-14 pl-12 text-base" placeholder="Wonach suchst du? z. B. Kaution, Übergabe, UID" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Themen">
        <Choice type="radio" name="thema" checked={topic === "alle"} onChange={() => setTopic("alle")}>Alle Themen</Choice>
        {HELP_TOPICS.map((t) => <Choice key={t.id} type="radio" name="thema" checked={topic === t.id} onChange={() => setTopic(t.id)}>{t.title}</Choice>)}
      </div>
      <p className="mt-4 text-sm text-muted" aria-live="polite">{hits} {hits === 1 ? "Antwort" : "Antworten"}</p>
      <div className="mt-6 grid gap-12">
        {topics.map((t) => (
          <section key={t.id} aria-labelledby={`t-${t.id}`}>
            <h2 id={`t-${t.id}`} className="mb-2 text-2xl font-bold">{t.title}</h2>
            <Accordion key={q + topic} items={t.items} />
          </section>
        ))}
        {!hits && <p className="rounded-2xl bg-white p-6 text-ink/75 ring-1 ring-line">Keine Antwort gefunden. Versuche einen anderen Begriff oder schreib uns unten.</p>}
      </div>

      <section className="mt-16 rounded-[2rem] bg-white p-6 ring-1 ring-line sm:p-10" aria-labelledby="kontakt">
        <h2 id="kontakt" className="text-2xl font-bold">Kontakt</h2>
        <p className="mt-2 text-ink/75">Keine passende Antwort gefunden? Schreib uns.</p>
        {sent ? (
          <p className="mt-6 flex items-start gap-3 rounded-2xl bg-leaf-100 p-5 font-semibold text-forest" role="status"><CheckCircle2 className="size-6 shrink-0" aria-hidden />Danke, {f.name}. In dieser Vorschau wird die Nachricht nicht versendet.</p>
        ) : (
          <form
            className="mt-6 grid max-w-2xl gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (Object.values(errs).some(Boolean)) return setTried(true);
              setSent(true);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="k-name" className="label">Name</label>
                <input id="k-name" className="field" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-invalid={tried && errs.name} />
                {tried && errs.name && <p className="error-text">Bitte gib deinen Namen ein.</p>}
              </div>
              <div>
                <label htmlFor="k-mail" className="label">E-Mail-Adresse</label>
                <input id="k-mail" type="email" className="field" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={tried && errs.email} />
                {tried && errs.email && <p className="error-text">Bitte gib eine gültige E-Mail-Adresse ein.</p>}
              </div>
            </div>
            <div>
              <label htmlFor="k-thema" className="label">Thema</label>
              <select id="k-thema" className="field" value={f.thema} onChange={(e) => setF({ ...f, thema: e.target.value })}>{HELP_TOPICS.map((t) => <option key={t.id}>{t.title}</option>)}</select>
            </div>
            <div>
              <label htmlFor="k-text" className="label">Nachricht</label>
              <textarea id="k-text" rows={5} className="field py-3" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} aria-invalid={tried && errs.text} />
              {tried && errs.text && <p className="error-text">Bitte beschreibe dein Anliegen in mindestens 10 Zeichen.</p>}
            </div>
            <button type="submit" className="btn btn-primary w-fit">Nachricht senden</button>
          </form>
        )}
      </section>
    </>
  );
}
