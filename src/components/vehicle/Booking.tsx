"use client";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CalendarCheck, Check, CheckCircle2, ShieldCheck, X } from "lucide-react";
import type { Vehicle } from "@/data/vehicles";
import { vehicleTitle } from "@/data/vehicles";
import type { BookingRecord } from "@/data/account";
import { addDays, chf, dayDiff, fmtDate, fmtTime, parseLocal, startOfDay, toDateInput } from "@/lib/format";
import { quote, rentalDays } from "@/lib/pricing";
import { useSession, useStore } from "@/lib/store";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { DatePicker, slotFrom } from "@/components/ui/DatePicker";
import { cn } from "@/lib/cn";
import { bookingKm, fmtKm, kmCost, type BookingKm } from "@/lib/mileage";
import { KM_INPUT_DEFAULT, KmSummary, MileagePicker, kmChoice, kmInputError, type KmInput } from "@/components/mileage/MileagePicker";
import { ABO_TERMS, aboPlan, dayPrice, fmtMonths, longPlan, monthChoices, offerLabel, offersOf, planTotal, priceTag, type OfferKind, type Plan } from "@/lib/offers";
import { ModelTabs, PlanFields, PlanSummary, PlanWidget } from "@/components/offers/PlanBooking";

interface Dates { fd: string; ft: string; td: string; tt: string }
interface Ctx extends Dates {
  set: (p: Partial<Dates>) => void;
  today: Date | null;
  isBlocked: (d: Date) => boolean;
  error: string;
  q: ReturnType<typeof quote> | null;
  open: () => void;
  v: Vehicle;
  providerName: string;
  providerKind: "privat" | "gewerbe";
  kmIn: KmInput;
  setKmIn: (x: KmInput) => void;
  /** Kilometer ohne Zusatzwahl und mit der gewählten Option */
  kmBase: BookingKm | null;
  k: BookingKm | null;
  kmError: string;
  /** Total inklusive Zusatzkilometer oder Unlimited-Paket */
  grand: number | null;
  models: OfferKind[];
  model: OfferKind;
  setModel: (m: OfferKind) => void;
  /** Tagespreis gemäss Preisstaffel */
  dayRate: number;
  pl: PlanInput;
  setPl: (p: Partial<PlanInput>) => void;
  /** Wählbare Monate für Langzeitmiete oder Auto-Abo */
  terms: number[];
  plan: Plan | null;
  planError: string;
}
export type BookingState = Ctx;
export interface PlanInput { start: string; months: number; pkg: number; addons: number[] }
const BookingCtx = createContext<Ctx | null>(null);
export const useBooking = () => useContext(BookingCtx)!;
const NO_BOOKINGS: BookingRecord[] = [];
const days = (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"}`;

export function BookingProvider({ v, providerName, providerKind, children }: { v: Vehicle; providerName: string; providerKind: "privat" | "gewerbe"; children: React.ReactNode }) {
  const [d, setD] = useState<Dates>({ fd: "", ft: "10:00", td: "", tt: "10:00" });
  const [today, setToday] = useState<Date | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const o = offersOf(v);
  const [model, setModel] = useState<OfferKind>(o.models[0]);
  const [pl, setPlRaw] = useState<PlanInput>({ start: "", months: 0, pkg: 0, addons: [] });
  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);
    let s = 1;
    while ([s, s + 1, s + 2].some((x) => v.blocked.includes(x))) s++;
    setD((x) => (x.fd ? x : { ...x, fd: toDateInput(addDays(now, s)), td: toDateInput(addDays(now, s + 2)) }));
    setPlRaw((x) => (x.start ? x : { ...x, start: toDateInput(addDays(now, 7)) }));
    // Link von einer Fahrzeugkarte, z. B. ?modell=abo
    const m = new URLSearchParams(window.location.search).get("modell") as OfferKind | null;
    if (m && o.models.includes(m)) setModel(m);
  }, [v.blocked]);
  const isBlocked = useMemo(() => (day: Date) => !!today && v.blocked.includes(dayDiff(today, day)), [today, v.blocked]);
  const from = d.fd ? parseLocal(d.fd, d.ft) : null;
  const to = d.td ? parseLocal(d.td, d.tt) : null;
  let error = "";
  if (from && !to) error = "Wähle noch das Rückgabedatum.";
  else if (from && to && to <= from) error = "Die Rückgabe muss nach der Abholung liegen.";
  else if (from && today && from < today) error = "Die Abholung liegt in der Vergangenheit.";
  else if (from && to) {
    for (let x = startOfDay(from); x <= to; x = addDays(x, 1)) if (isBlocked(x)) { error = "In diesem Zeitraum ist das Auto bereits gebucht. Wähle andere Daten."; break; }
  }
  const shortDays = from && to && to > from ? rentalDays(from, to) : 0;
  if (!error && shortDays && o.short?.minDays && shortDays < o.short.minDays) error = `Die Mindestmietdauer beträgt ${o.short.minDays} Tage.`;
  if (!error && shortDays && o.short?.maxDays && shortDays > o.short.maxDays) error = `Höchstens ${o.short.maxDays} Tage${o.models.includes("langzeit") ? " – für längere Mieten gibt es die Langzeitmiete" : ""}.`;
  // Tagespreis gemäss Preisstaffel
  const dayRate = shortDays ? dayPrice(v, shortDays) : v.price;
  const q = from && to && !error ? quote(dayRate, from, to) : null;
  const [kmIn, setKmIn] = useState<KmInput>(KM_INPUT_DEFAULT);
  const kmBase = q ? bookingKm(v.mileage, q.days) : null;
  const kmError = kmInputError(kmIn, kmBase);
  const k = q ? (kmError ? kmBase : bookingKm(v.mileage, q.days, kmChoice(kmIn))) : null;
  const grand = q && k ? q.total + kmCost(k) : null;
  // Langzeitmiete und Auto-Abo: Start, Dauer, Paket und Zusatzleistungen ergeben den Plan
  const aboTerms = o.abo ? ABO_TERMS.filter((t) => t >= o.abo!.minMonths && (!o.abo!.maxMonths || t <= o.abo!.maxMonths)) : [];
  const terms = model === "langzeit" && o.long ? monthChoices(o.long.minMonths) : model === "abo" && o.abo ? (aboTerms.length ? aboTerms : [o.abo.minMonths]) : [];
  const months = terms.includes(pl.months) ? pl.months : (terms[0] ?? 0);
  const start = pl.start ? parseLocal(pl.start, "10:00") : null;
  const planError = model === "kurzzeit" ? "" : !start ? "Wähle ein Startdatum." : today && start < today ? "Der Start liegt in der Vergangenheit." : "";
  const plan = model === "langzeit" && o.long ? longPlan(v, months) : model === "abo" && o.abo ? aboPlan(v, months, pl.pkg, pl.addons) : null;
  const value: Ctx = {
    ...d,
    // Datumsauswahl (auch im Kalender) gehört zur Kurzzeitmiete
    set: (p) => {
      setD((x) => ({ ...x, ...p }));
      if (o.models.includes("kurzzeit")) setModel("kurzzeit");
    },
    today, isBlocked, error, q, open: () => dialog.current?.showModal(), v, providerName, providerKind, kmIn, setKmIn, kmBase, k, kmError, grand,
    models: o.models, model, setModel, dayRate, pl: { ...pl, months }, setPl: (x) => setPlRaw((y) => ({ ...y, ...x })), terms, plan, planError,
  };
  return (
    <BookingCtx.Provider value={value}>
      {children}
      <BookingDialog dialog={dialog} />
    </BookingCtx.Provider>
  );
}

export function DateFields({ idp }: { idp: string }) {
  const b = useBooking();
  const min = b.today ? toDateInput(b.today) : undefined;
  // Heute sind nur künftige Uhrzeiten wählbar, die Rückgabe am Abholtag erst nach der Abholzeit
  const nowSlot = b.today ? slotFrom(new Date().toTimeString().slice(0, 5)) : undefined;
  return (
    <div className="grid gap-3">
      {([["Abholung", "fd", "ft"], ["Rückgabe", "td", "tt"]] as const).map(([label, dk, tk]) => (
        <fieldset key={label} className="min-w-0">
          <legend className="label">{label}</legend>
          <DatePicker
            id={`${idp}-${dk}`}
            label={label}
            value={b[dk]}
            time={b[tk]}
            onTime={(val) => b.set({ [tk]: val })}
            min={dk === "td" ? b.fd || min : min}
            minTime={dk === "td" ? (b.fd ? slotFrom(b.ft, 30) : undefined) : nowSlot}
            invalid={!!b.error && dk === "td"}
            onChange={(val) => b.set(dk === "fd" && b.td && b.td < val ? { fd: val, td: "" } : { [dk]: val })}
          />
        </fieldset>
      ))}
    </div>
  );
}

export function PriceBreakdown() {
  const { q, error, dayRate, k, grand } = useBooking();
  if (error) return <p className="error-text" role="alert">{error}</p>;
  if (!q) return <p className="hint">Wähle Abholung und Rückgabe, um den Gesamtpreis zu sehen.</p>;
  return (
    <dl className="text-[0.95rem]">
      <div className="flex justify-between gap-4"><dt>{days(q.days)} × {chf(dayRate)}</dt><dd>{chf(q.rent)}</dd></div>
      {k && kmCost(k) > 0 && <div className="mt-2 flex justify-between gap-4"><dt>{k.unlimited ? "Unbegrenzte Kilometer" : `Zusatzkilometer (+${fmtKm(k.extra)})`}</dt><dd>{chf(kmCost(k))}</dd></div>}
      {q.service > 0 && <div className="mt-2 flex justify-between gap-4"><dt>Servicegebühr</dt><dd>{chf(q.service)}</dd></div>}
      <div className="mt-3 flex items-baseline justify-between gap-4 rounded-xl bg-leaf-50 px-3.5 py-3 ring-1 ring-leaf-200">
        <dt className="font-bold text-forest">Total</dt>
        <dd className="font-display text-2xl leading-none font-bold text-forest">{chf(grand ?? q.total)}</dd>
      </div>
    </dl>
  );
}

/** idp: Präfix für IDs – das Widget steht für Handy und Desktop je einmal auf der Seite */
export function BookingWidget({ idp = "w" }: { idp?: string }) {
  const b = useBooking();
  const t = priceTag(b.v, "tage");
  return (
    <div className="card p-5 sm:p-6">
      {b.models.length > 1 && <ModelTabs b={b} />}
      {b.model !== "kurzzeit" ? (
        <PlanWidget b={b} idp={idp} />
      ) : (
        <>
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="font-display text-[1.9rem] leading-none font-bold text-forest">
              {t.from && <span className="text-lg">ab </span>}
              {chf(t.amount)}
            </span>
            <span className="text-muted">pro Tag</span>
          </p>
          <p className="mt-1.5 text-sm text-muted">{fmtKm(b.v.mileage.perDay)} pro Tag inklusive</p>
          <div className="mt-5"><DateFields idp={idp} /></div>
          {b.kmBase && b.k && (
            <p className="mt-4 rounded-xl bg-leaf-50 px-3.5 py-2.5 text-sm ring-1 ring-leaf-200">
              Für deine Buchung: <strong className="text-forest">{fmtKm(b.kmBase.included)} inklusive</strong>
              {b.k.unlimited ? ", unbegrenzte Kilometer gewählt." : b.k.extra ? `, dazu +${fmtKm(b.k.extra)}.` : ". Mehr Kilometer kannst du bei der Anfrage hinzufügen."}
            </p>
          )}
          <div className="mt-5"><PriceBreakdown /></div>
          <button type="button" className="btn btn-primary mt-5 w-full" disabled={!b.q} onClick={b.open}>
            <CalendarCheck className="size-5" aria-hidden />
            Buchung anfragen
          </button>
          <p className="mt-3 text-center text-sm text-muted">Unverbindliche Anfrage – du bezahlst noch nichts.</p>
        </>
      )}
    </div>
  );
}

/** Sicherheits- und Versicherungsangaben direkt bei der Buchung. */
export function SafetyNote() {
  const b = useBooking();
  const items = [
    `Deine Anfrage ist unverbindlich, bis ${b.providerName} sie bestätigt. Der Mietvertrag kommt direkt mit ${b.providerName} zustande.`,
    `Versichert ist das Auto über die Fahrzeugversicherung von ${b.providerName}. rentanycar.ch stellt keine eigene Versicherung bereit.`,
    "Deckung, Selbstbehalt, Kaution, Pannenhilfe und allfällige Gebühren siehst du vor der verbindlichen Buchung.",
    `Übergabe: ${b.v.handover}.`,
  ];
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="flex items-center gap-2 font-bold text-forest">
        <ShieldCheck className="size-5 text-leaf-700" aria-hidden />
        Sicherheit und Versicherung
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-ink/80">
        {items.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />{t}</li>)}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/sicherheit" className="link">Mehr zu Sicherheit und Vertrauen</Link>
        <Link href="/agb#ziffer-5" className="link">AGB zur Versicherung</Link>
      </p>
    </div>
  );
}

export function MobileBookingBar() {
  const b = useBooking();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0">
          {b.model !== "kurzzeit" && b.plan ? (
            <>
              <span className="font-display text-xl font-bold text-forest">{chf(b.plan.monthly)}</span>
              <span className="block truncate text-sm text-muted">pro Monat, {fmtMonths(b.plan.months)}</span>
            </>
          ) : b.q ? (
            <>
              <span className="font-display text-xl font-bold text-forest">{chf(b.grand ?? b.q.total)}</span>
              <span className="block truncate text-sm text-muted">Total für {days(b.q.days)}</span>
            </>
          ) : (
            <>
              <span className="font-display text-xl font-bold text-forest">{priceTag(b.v).from && "ab "}{chf(priceTag(b.v).amount)}</span>
              <span className="text-sm text-muted"> pro {priceTag(b.v).unit}</span>
            </>
          )}
        </p>
        <button type="button" className="btn btn-primary shrink-0" onClick={b.open}>Buchung anfragen</button>
      </div>
    </div>
  );
}

function BookingDialog({ dialog }: { dialog: React.RefObject<HTMLDialogElement | null> }) {
  const b = useBooking();
  const [session] = useSession();
  const [, setBookings] = useStore<BookingRecord[]>("rac:bookings", NO_BOOKINGS);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ vorname: "", nachname: "", email: "", tel: "", nachricht: "", ausweis: false });
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (session) setF((x) => ({ ...x, vorname: x.vorname || session.name, email: x.email || session.email }));
  }, [session]);
  const errs = {
    vorname: !f.vorname.trim() && "Bitte gib deinen Vornamen ein.",
    nachname: !f.nachname.trim() && "Bitte gib deinen Nachnamen ein.",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) && "Bitte gib eine gültige E-Mail-Adresse ein.",
    tel: !/^[+0-9 ()-]{9,}$/.test(f.tel) && "Bitte gib eine Telefonnummer ein, z. B. 079 123 45 67.",
    ausweis: !f.ausweis && "Bitte bestätige, dass du einen gültigen Führerausweis hast.",
  };
  const valid1 = !Object.values(errs).some(Boolean);
  const close = () => dialog.current?.close();
  const reset = () => { setStep(0); setDone(false); setTried(false); };
  const title = vehicleTitle(b.v);
  const planned = b.model !== "kurzzeit";
  const steps = [planned ? (b.model === "abo" ? "Start, Laufzeit und Paket" : "Start und Mietdauer") : "Zeitraum und Kilometer", "Deine Angaben", "Prüfen und senden"];

  function next() {
    if (step === 0 && (planned ? !b.plan || !!b.planError : !b.q || !!b.kmError)) return;
    if (step === 1 && !valid1) return setTried(true);
    if (step === 2 && planned) {
      // Langzeitmiete oder Auto-Abo: Konditionen als Momentaufnahme speichern (angezeigt wird der Preis pro Monat)
      const plan = b.plan;
      if (!plan) return;
      const from = parseLocal(b.pl.start, "10:00")!, to = new Date(from);
      to.setMonth(to.getMonth() + plan.months);
      setBookings((list) => [{ id: `b-${Date.now()}`, vehicleSlug: b.v.slug, from: from.toISOString(), to: to.toISOString(), status: "angefragt", counterpart: b.providerName, counterpartKind: b.providerKind, total: planTotal(plan), message: f.nachricht, model: plan.model, plan }, ...list]);
      return setDone(true);
    }
    if (step === 2) {
      if (!b.q) return;
      const from = parseLocal(b.fd, b.ft)!, to = parseLocal(b.td, b.tt)!;
      setBookings((list) => [{ id: `b-${Date.now()}`, vehicleSlug: b.v.slug, from: from.toISOString(), to: to.toISOString(), status: "angefragt", counterpart: b.providerName, counterpartKind: b.providerKind, total: b.grand ?? b.q!.total, message: f.nachricht, ...(b.k ? { km: b.k } : {}) }, ...list]);
      return setDone(true);
    }
    setTried(false);
    setStep((s) => s + 1);
  }
  const field = (k: "vorname" | "nachname" | "email" | "tel", label: string, type = "text", auto?: string) => (
    <div>
      <label htmlFor={`bk-${k}`} className="label">{label}</label>
      <input id={`bk-${k}`} type={type} autoComplete={auto} className="field" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={tried && !!errs[k]} aria-describedby={tried && errs[k] ? `bk-${k}-e` : undefined} />
      {tried && errs[k] && <p id={`bk-${k}-e`} className="error-text">{errs[k]}</p>}
    </div>
  );

  return (
    <dialog ref={dialog} className="modal" aria-labelledby="bk-title" onClose={() => done && reset()} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id="bk-title" className="text-xl font-bold">{done ? "Anfrage gespeichert" : "Buchung anfragen"}</h2>
            {!done && <p className="text-sm text-muted">Schritt {step + 1} von 3: {steps[step]}</p>}
          </div>
          <button type="button" className="icon-btn -mr-2" aria-label="Dialog schliessen" onClick={close}><X className="size-6" aria-hidden /></button>
        </div>
        {!done && (
          <ol className="grid grid-cols-3 gap-1.5 px-5 pt-4 sm:px-6" aria-hidden>
            {steps.map((s, i) => <li key={s} className={cn("h-1.5 rounded-full transition-colors duration-200", i <= step ? "bg-forest" : "bg-line")} />)}
          </ol>
        )}
        <div key={done ? "done" : step} className="step-in flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-14 text-leaf-500" aria-hidden />
              <p className="mt-4 text-lg font-semibold text-forest">Deine Anfrage für den {title} ist in deinem Konto gespeichert.</p>
              <p className="mt-2 text-ink/75">In dieser Vorschau wird sie nicht an {b.providerName} übermittelt. Es wurde nichts gebucht und nichts bezahlt.</p>
              <div className="mt-6 grid gap-2">
                {session ? <Link href="/konto/buchungen" className="btn btn-primary">Zu meinen Buchungen</Link> : <Link href="/registrieren?weiter=/konto/buchungen" className="btn btn-primary">Konto erstellen und Anfrage sehen</Link>}
                <button type="button" className="btn btn-outline" onClick={close}>Schliessen</button>
              </div>
            </div>
          ) : step === 0 && planned ? (
            <div className="grid gap-5">
              <PlanFields b={b} idp="d" />
              <PlanSummary b={b} />
            </div>
          ) : step === 0 ? (
            <div className="grid gap-5">
              <DateFields idp="d" />
              {b.kmBase && b.k && <MileagePicker p={b.v.mileage} base={b.kmBase} k={b.k} value={b.kmIn} onChange={b.setKmIn} error={b.kmError} idp="d" />}
              <PriceBreakdown />
            </div>
          ) : step === 1 ? (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">{field("vorname", "Vorname", "text", "given-name")}{field("nachname", "Nachname", "text", "family-name")}</div>
              {field("email", "E-Mail-Adresse", "email", "email")}
              {field("tel", "Telefonnummer", "tel", "tel")}
              <div>
                <label htmlFor="bk-msg" className="label">Nachricht an {b.providerName} <span className="font-medium text-muted">(optional)</span></label>
                <textarea id="bk-msg" rows={3} className="field py-3" value={f.nachricht} onChange={(e) => setF({ ...f, nachricht: e.target.value })} placeholder="Wofür brauchst du das Auto?" />
              </div>
              <label className="flex gap-3 text-[0.95rem]">
                <input type="checkbox" className="check mt-0.5" checked={f.ausweis} onChange={(e) => setF({ ...f, ausweis: e.target.checked })} aria-describedby={tried && errs.ausweis ? "bk-aus-e" : undefined} />
                Ich habe einen gültigen Führerausweis und halte mich an die Regeln des Anbieters.
              </label>
              {tried && errs.ausweis && <p id="bk-aus-e" className="error-text -mt-2">{errs.ausweis}</p>}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="rounded-2xl bg-leaf-50 p-4 ring-1 ring-line">
                <ProviderBadge kind={b.providerKind} />
                <p className="mt-2 font-bold text-forest">{title}</p>
                <p className="text-sm text-muted">{b.providerName}, {b.v.city}</p>
                {planned && b.plan && <p className="mt-2 text-sm">{offerLabel(b.plan.model)} ab {fmtDate(parseLocal(b.pl.start, "10:00")!, true)} · {b.plan.model === "abo" ? "Laufzeit" : "Mietdauer"} {fmtMonths(b.plan.months)}</p>}
                {!planned && b.q && (
                  <p className="mt-2 text-sm">
                    {fmtDate(parseLocal(b.fd, b.ft)!, true)}, {fmtTime(parseLocal(b.fd, b.ft)!)} bis {fmtDate(parseLocal(b.td, b.tt)!, true)}, {fmtTime(parseLocal(b.td, b.tt)!)}
                  </p>
                )}
              </div>
              {!planned && b.k && (
                <div className="rounded-2xl p-4 ring-1 ring-line">
                  <p className="mb-2 font-bold text-forest">Kilometer</p>
                  <KmSummary k={b.k} />
                </div>
              )}
              {planned ? <PlanSummary b={b} /> : <PriceBreakdown />}
              <p className="text-sm text-muted">Mit dem Senden fragst du das Auto unverbindlich an. {b.providerName} bestätigt oder lehnt ab. Du bezahlst noch nichts. Es gelten die{" "}
                <Link href="/agb" target="_blank" className="link">AGB</Link>.
              </p>
            </div>
          )}
        </div>
        {!done && (
          <div className="flex gap-3 border-t border-line px-5 py-4 sm:px-6">
            <button type="button" className={cn("btn btn-outline", step === 0 && "invisible")} onClick={() => { setTried(false); setStep((s) => s - 1); }}>Zurück</button>
            <button type="button" className="btn btn-primary flex-1" onClick={next} disabled={step === 0 && (planned ? !b.plan || !!b.planError : !b.q || !!b.kmError)}>
              {step === 2 ? "Anfrage senden" : "Weiter"}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
