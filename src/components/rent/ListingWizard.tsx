"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Clock3, Copy, Eye, EyeOff, ImagePlus, Plus, Save, Trash2, UserRound } from "lucide-react";
import { CATEGORIES, type CategoryId, type Fuel, type Gear } from "@/data/vehicles";
import { FLEET_LOCATIONS } from "@/data/account";
import { chf } from "@/lib/format";
import { useSession, useStore, writeStore } from "@/lib/store";
import { Choice, Toggle } from "@/components/ui/Choice";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { cn } from "@/lib/cn";
import { MILEAGE_FORM_DEFAULT, fmtKm, type MileageForm } from "@/lib/mileage";
import { OFFER_FORM_DEFAULT, formToOffers, offerLabel, priceTag, validateOffers, type OfferForm } from "@/lib/offers";
import { OfferSettings } from "@/components/offers/OfferSettings";

/** Kilometer-Felder (kmTag, kmPreis …) stammen aus MileageForm, Mietmodelle (modelle, lzPreis, aboPreis …) aus OfferForm */
export interface Draft extends MileageForm, OfferForm {
  anbieter: "" | "privat" | "gewerblich";
  marke: string;
  modell: string;
  kategorie: CategoryId;
  baujahr: string;
  km: string;
  plz: string;
  ort: string;
  strasse: string;
  standort: string;
  getriebe: Gear;
  antrieb: Fuel;
  sitze: string;
  extras: string[];
  beschreibung: string;
  preis: string;
  tage: string[];
  sofort: boolean;
  kontaktlos: boolean;
  bilder: string[];
  demoBild: boolean;
  /** Bestätigung gemäss AGB Ziffer 4: Berechtigung, Zulassung und Versicherung */
  bestaetigt?: boolean;
}
export interface SavedListing extends Draft {
  id: string;
  createdAt: string;
}

const EMPTY: Draft = {
  anbieter: "", marke: "", modell: "", kategorie: "kleinwagen", baujahr: "", km: "", plz: "", ort: "", strasse: "", standort: FLEET_LOCATIONS[0],
  getriebe: "Automatik", antrieb: "Benzin", sitze: "5", extras: [], beschreibung: "", preis: "", ...MILEAGE_FORM_DEFAULT, ...OFFER_FORM_DEFAULT, tage: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"], sofort: false, kontaktlos: false, bilder: [], demoBild: false, bestaetigt: false,
};
const STEPS = ["Anbieter und Fahrzeug", "Standort und Fahrzeugdaten", "Ausstattung und Beschreibung", "Preis und Verfügbarkeit", "Bilder und Vorschau"];
const SHORT = ["Fahrzeug", "Standort", "Ausstattung", "Preis", "Bilder"];
const MAKES = ["Audi", "BMW", "Citroën", "Cupra", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", "Kia", "Mazda", "Mercedes-Benz", "MINI", "Nissan", "Opel", "Peugeot", "Renault", "Seat", "Škoda", "Subaru", "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo"];
const EXTRAS = ["Navigationssystem", "Apple CarPlay / Android Auto", "Rückfahrkamera", "Sitzheizung", "Tempomat", "Isofix", "Anhängerkupplung", "Dachträger", "Winterreifen", "Allradantrieb", "Ladekabel Typ 2", "Kindersitz auf Anfrage"];
const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const PHOTO_TIPS = ["Front schräg von vorne", "Heck schräg von hinten", "Seitenansicht", "Innenraum vorne"];
const NOW_YEAR = 2026;
const MAX_TEXT = 600;
const NO_LISTINGS: SavedListing[] = [];
type State = { step: number; data: Draft };
const START: State = { step: 0, data: EMPTY };
const num = (s: string) => Number(s.replace(/[’' ]/g, ""));

function validate(step: number, d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (step === 0) {
    if (!d.anbieter) e.anbieter = "Bitte wähle, ob du privat oder als Unternehmen vermietest.";
    if (!d.marke) e.marke = "Bitte wähle eine Marke.";
    if (!d.modell.trim()) e.modell = "Bitte gib das Modell ein, z. B. Golf 1.5 TSI.";
  }
  if (step === 1) {
    if (!/^\d{4}$/.test(d.plz)) e.plz = "Bitte gib eine vierstellige Schweizer PLZ ein.";
    if (!d.ort.trim()) e.ort = "Bitte gib den Ort ein.";
    const y = Number(d.baujahr);
    if (!/^\d{4}$/.test(d.baujahr) || y < 1990 || y > NOW_YEAR) e.baujahr = `Bitte gib ein Baujahr zwischen 1990 und ${NOW_YEAR} ein.`;
    if (!/^\d+$/.test(d.km.replace(/[’' ]/g, "")) || num(d.km) > 400000) e.km = "Bitte gib den Kilometerstand als Zahl ein (höchstens 400’000 km).";
  }
  if (step === 2 && d.beschreibung.length > MAX_TEXT) e.beschreibung = `Bitte kürze die Beschreibung auf höchstens ${MAX_TEXT} Zeichen.`;
  if (step === 3) {
    Object.assign(e, validateOffers(d, d.anbieter === "gewerblich"));
    if (!d.tage.length) e.tage = "Wähle mindestens einen Wochentag, an dem das Auto verfügbar ist.";
  }
  if (step === 4 && !d.bilder.length && !d.demoBild) e.bilder = "Füge mindestens ein Foto hinzu oder verwende vorerst die Platzhalter-Illustration.";
  if (step === 4 && !d.bestaetigt) e.bestaetigt = "Bitte bestätige die Angaben zu Berechtigung und Versicherung.";
  return e;
}

export default function ListingWizard() {
  const sp = useSearchParams();
  const [session] = useSession();
  const [state, setState] = useStore<State>("rac:wizard", START, "session");
  const [, setListings] = useStore<SavedListing[]>("rac:listings", NO_LISTINGS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previews, setPreviews] = useState<string[]>([]);
  const [saved, setSaved] = useState<SavedListing | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Ältere Zwischenstände (acht Schritte) sauber übernehmen
  const step = Math.min(Math.max(state.step, 0), STEPS.length - 1);
  const d: Draft = { ...EMPTY, ...state.data };
  const last = step === STEPS.length - 1;

  useEffect(() => {
    const a = sp.get("anbieter");
    if ((a === "privat" || a === "gewerblich") && !state.data.anbieter) setState({ step: 0, data: { ...EMPTY, ...state.data, anbieter: a } });
    // nur beim ersten Laden auswerten
  }, []);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const set = (patch: Partial<Draft>) => {
    setErrors((e) => {
      const n = { ...e };
      Object.keys(patch).forEach((k) => delete n[k]);
      return n;
    });
    setState((s) => ({ step: Math.min(s.step, STEPS.length - 1), data: { ...EMPTY, ...s.data, ...patch } }));
  };
  const goto = (n: number) => {
    setErrors({});
    setState((s) => ({ ...s, step: n }));
    requestAnimationFrame(() => {
      heading.current?.focus();
      window.scrollTo({ top: 0 });
    });
  };
  const next = () => {
    const e = validate(step, d);
    if (Object.keys(e).length) {
      setErrors(e);
      requestAnimationFrame(() => document.getElementById(`w-${Object.keys(e)[0]}`)?.focus());
      return;
    }
    if (!last) return goto(step + 1);
    const item: SavedListing = { ...d, id: `l-${Date.now()}`, createdAt: new Date().toISOString() };
    setListings((l) => [item, ...l]);
    setSaved(item);
  };
  const again = (mode: "neu" | "kopie") => {
    setSaved(null);
    setPreviews([]);
    const base = mode === "kopie" ? { ...d } : { ...EMPTY, anbieter: d.anbieter, standort: d.standort, plz: d.plz, ort: d.ort };
    writeStore("rac:wizard", { step: 0, data: base }, "session");
  };

  const err = (k: string) => errors[k] && <p id={`w-${k}-e`} className="error-text">{errors[k]}</p>;
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `w-${k}-e` : undefined });
  const gewerbe = d.anbieter === "gewerblich";
  const price = Number(d.preis);
  // Preis für die Vorschau: Tagespreis oder, ohne Kurzzeitmiete, der Monatspreis
  const tag = priceTag({ price: price || 0, mileage: { perDay: Number(d.kmTag) || 200 }, offers: formToOffers(d, gewerbe) });

  if (saved) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <CheckCircle2 className="mx-auto size-16 text-leaf-500" aria-hidden />
        <h1 className="mt-4 text-3xl font-bold">Inserat gespeichert</h1>
        <p className="mt-3 text-ink/75">Dein {saved.marke} {saved.modell} ist in diesem Browser gespeichert. In dieser Vorschau wird es nicht veröffentlicht.</p>
        <div className="mt-8 grid gap-3">
          {session ? (
            <Link href="/konto/inserate" className="btn btn-primary">{gewerbe ? "Zur Flottenverwaltung" : "Zu meinen Inseraten"}</Link>
          ) : (
            <Link href={`/registrieren?typ=${gewerbe ? "unternehmen" : "privat"}&weiter=/konto/inserate`} className="btn btn-primary">Konto erstellen und Inserat verwalten</Link>
          )}
          {gewerbe ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" className="btn btn-outline" onClick={() => again("neu")}><Plus className="size-4" aria-hidden />Weiteres Auto erfassen</button>
              <button type="button" className="btn btn-outline" onClick={() => again("kopie")}><Copy className="size-4" aria-hidden />Auto duplizieren</button>
            </div>
          ) : (
            <button type="button" className="btn btn-outline" onClick={() => again("neu")}>Weiteres Auto erfassen</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 text-sm">
        <p className="font-bold text-leaf-700">Auto inserieren</p>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
          <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden />Dauert ungefähr 5 Minuten</span>
          <span className="inline-flex items-center gap-1.5"><Save className="size-4" aria-hidden />Wird in diesem Tab automatisch zwischengespeichert</span>
        </p>
      </div>

      <ol className="mt-5 grid grid-cols-5 gap-2" aria-label="Fortschritt">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className="min-w-0">
            <span className={cn("block h-1.5 rounded-full transition-colors duration-200", i < step ? "bg-leaf-500" : i === step ? "bg-forest" : "bg-line")} aria-hidden />
            <span className={cn("mt-2 flex items-center gap-1.5 text-sm font-bold", i === step ? "text-forest" : "text-muted")}>
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-xs", i < step ? "bg-leaf-500 text-white" : i === step ? "bg-forest text-white" : "bg-line text-ink/70")} aria-hidden>
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden truncate md:inline">{SHORT[i]}</span>
              <span className="sr-only">{`Schritt ${i + 1}: ${s}${i < step ? ", erledigt" : ""}`}</span>
            </span>
          </li>
        ))}
      </ol>

      <div key={step} className="step-in mt-8">
        <p className="text-sm font-bold text-leaf-700">Schritt {step + 1} von {STEPS.length}</p>
        <h1 ref={heading} tabIndex={-1} className="mt-1 text-[1.8rem] leading-tight font-bold outline-none sm:text-[2.1rem]">{step === 3 && gewerbe ? "Mietmodelle und Preise" : STEPS[step]}</h1>

        <div className="mt-6 grid gap-6">
          {step === 0 && (
            <>
              <fieldset>
                <legend className="label">Wer vermietet?</legend>
                <div id="w-anbieter" tabIndex={-1} className="grid gap-3 outline-none sm:grid-cols-2" {...inv("anbieter")}>
                  {([["privat", "Privat vermieten", "Du vermietest dein eigenes Auto ab und zu.", UserRound], ["gewerblich", "Als Unternehmen vermieten", "Autovermietung, Garage oder Firma mit eigener Flotte.", Building2]] as const).map(([v, l, t, Icon]) => (
                    <label key={v} className={cn("flex cursor-pointer gap-3 rounded-2xl bg-white p-4 ring-1 transition has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid", d.anbieter === v ? "ring-2 ring-forest" : "ring-line hover:ring-forest/40")}>
                      <input type="radio" name="w-anbieter" className="sr-only" checked={d.anbieter === v} onChange={() => set({ anbieter: v })} />
                      <Icon className="mt-0.5 size-6 shrink-0 text-leaf-700" aria-hidden />
                      <span className="min-w-0 flex-1"><span className="block font-bold text-forest">{l}</span><span className="text-sm text-ink/75">{t}</span></span>
                      {d.anbieter === v && <CheckCircle2 className="size-5 shrink-0 text-forest" aria-hidden />}
                    </label>
                  ))}
                </div>
                {err("anbieter")}
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="w-marke" className="label">Marke</label>
                  <select id="w-marke" className="field" value={d.marke} onChange={(e) => set({ marke: e.target.value })} {...inv("marke")}>
                    <option value="">Marke wählen</option>
                    {MAKES.map((mk) => <option key={mk}>{mk}</option>)}
                    <option>Andere Marke</option>
                  </select>
                  {err("marke")}
                </div>
                <div>
                  <label htmlFor="w-modell" className="label">Modell und Ausführung</label>
                  <input id="w-modell" className="field" value={d.modell} onChange={(e) => set({ modell: e.target.value })} placeholder="z. B. Golf 1.5 TSI" {...inv("modell")} />
                  {err("modell")}
                </div>
                <div>
                  <label htmlFor="w-kat" className="label">Kategorie</label>
                  <select id="w-kat" className="field" value={d.kategorie} onChange={(e) => set({ kategorie: e.target.value as CategoryId })}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {gewerbe && (
                <div className="sm:max-w-sm">
                  <label htmlFor="w-standort" className="label">Standort</label>
                  <select id="w-standort" className="field" value={d.standort} onChange={(e) => set({ standort: e.target.value })}>
                    {FLEET_LOCATIONS.map((l) => <option key={l}>{l}</option>)}
                    <option>Neuer Standort</option>
                  </select>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
                <div>
                  <label htmlFor="w-plz" className="label">PLZ</label>
                  <input id="w-plz" inputMode="numeric" maxLength={4} className="field" value={d.plz} onChange={(e) => set({ plz: e.target.value.replace(/\D/g, "") })} autoComplete="postal-code" {...inv("plz")} />
                  {err("plz")}
                </div>
                <div>
                  <label htmlFor="w-ort" className="label">Ort</label>
                  <input id="w-ort" className="field" value={d.ort} onChange={(e) => set({ ort: e.target.value })} autoComplete="address-level2" {...inv("ort")} />
                  {err("ort")}
                </div>
              </div>
              <div>
                <label htmlFor="w-strasse" className="label">Strasse und Hausnummer <span className="font-medium text-muted">(optional)</span></label>
                <input id="w-strasse" className="field" value={d.strasse} onChange={(e) => set({ strasse: e.target.value })} autoComplete="street-address" />
                <p className="hint">{gewerbe ? "Die Geschäftsadresse erscheint im Inserat." : "Nicht öffentlich. Mietende erhalten die Adresse erst nach einer bestätigten Buchung."}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="w-baujahr" className="label">Baujahr</label>
                  <input id="w-baujahr" inputMode="numeric" maxLength={4} className="field" value={d.baujahr} onChange={(e) => set({ baujahr: e.target.value.replace(/\D/g, "") })} placeholder="z. B. 2021" {...inv("baujahr")} />
                  {err("baujahr")}
                </div>
                <div>
                  <label htmlFor="w-km" className="label">Kilometerstand</label>
                  <input id="w-km" inputMode="numeric" className="field" value={d.km} onChange={(e) => set({ km: e.target.value.replace(/[^\d’' ]/g, "") })} placeholder="z. B. 45’000" {...inv("km")} />
                  {errors.km ? err("km") : <p className="hint">Nicht öffentlich.</p>}
                </div>
              </div>
              <fieldset>
                <legend className="label">Getriebe</legend>
                <div className="flex flex-wrap gap-2">{(["Automatik", "Manuell"] as Gear[]).map((g) => <Choice key={g} type="radio" name="w-getriebe" checked={d.getriebe === g} onChange={() => set({ getriebe: g })}>{g}</Choice>)}</div>
              </fieldset>
              <fieldset>
                <legend className="label">Antrieb</legend>
                <div className="flex flex-wrap gap-2">{(["Benzin", "Diesel", "Elektro", "Hybrid"] as Fuel[]).map((f) => <Choice key={f} type="radio" name="w-antrieb" checked={d.antrieb === f} onChange={() => set({ antrieb: f })}>{f}</Choice>)}</div>
              </fieldset>
              <div className="max-w-[12rem]">
                <label htmlFor="w-sitze" className="label">Sitzplätze</label>
                <select id="w-sitze" className="field" value={d.sitze} onChange={(e) => set({ sitze: e.target.value })}>{["2", "3", "4", "5", "6", "7", "8", "9"].map((s) => <option key={s}>{s}</option>)}</select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <fieldset>
                <legend className="label">Ausstattung</legend>
                <div className="flex flex-wrap gap-2">
                  {EXTRAS.map((x) => <Choice key={x} name="w-extras" checked={d.extras.includes(x)} onChange={() => set({ extras: d.extras.includes(x) ? d.extras.filter((y) => y !== x) : [...d.extras, x] })}>{x}</Choice>)}
                </div>
              </fieldset>
              <div>
                <label htmlFor="w-beschreibung" className="label">Beschreibung <span className="font-medium text-muted">(optional)</span></label>
                <textarea id="w-beschreibung" rows={5} className="field py-3" value={d.beschreibung} onChange={(e) => set({ beschreibung: e.target.value })} placeholder="Was macht dein Auto aus? Zustand, Besonderheiten, Hinweise zur Übergabe." {...inv("beschreibung")} />
                {errors.beschreibung ? err("beschreibung") : <p className="hint">{d.beschreibung.length} von {MAX_TEXT} Zeichen</p>}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <OfferSettings value={d} onChange={set} errors={errors} idp="w" gewerbe={gewerbe} />
              <fieldset>
                <legend className="label">Verfügbar an diesen Wochentagen</legend>
                <div id="w-tage" tabIndex={-1} className="flex flex-wrap gap-2 outline-none" {...inv("tage")}>
                  {DAYS.map((t) => <Choice key={t} name="w-tage" checked={d.tage.includes(t)} onChange={() => set({ tage: d.tage.includes(t) ? d.tage.filter((x) => x !== t) : DAYS.filter((x) => x === t || d.tage.includes(x)) })}>{t}</Choice>)}
                </div>
                {errors.tage ? err("tage") : <p className="hint">Einzelne Tage sperrst du später im Kalender deines Kontos.</p>}
              </fieldset>
              <div className="divide-y divide-line rounded-2xl bg-white px-4 ring-1 ring-line">
                <Toggle checked={d.sofort} onChange={(sofort) => set({ sofort })} label="Kurzfristig verfügbar" hint="Abholung am gleichen Tag möglich" />
                <Toggle checked={d.kontaktlos} onChange={(kontaktlos) => set({ kontaktlos })} label="Kontaktlose Übergabe" hint="zum Beispiel über eine Schlüsselbox" />
              </div>
              <p className="text-sm text-muted">Das Inserieren ist kostenlos. Allfällige Gebühren für eine Vermietung siehst du, bevor du dein Inserat veröffentlichst.</p>
            </>
          )}

          {step === 4 && (
            <>
              <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                <p className="font-bold text-forest">So gelingen deine Fotos</p>
                <p className="mt-1 text-sm text-ink/75">Mindestens vier Perspektiven, im Querformat und bei Tageslicht:</p>
                <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {PHOTO_TIPS.map((t) => <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />{t}</li>)}
                </ul>
              </div>
              <div>
                <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-leaf-300 bg-leaf-50 px-6 py-8 text-center transition hover:bg-leaf-100 has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid">
                  <ImagePlus className="size-9 text-leaf-700" aria-hidden />
                  <span className="mt-2 font-bold text-forest">Fotos auswählen</span>
                  <span className="text-sm text-muted">JPG, PNG oder HEIC, bis zu 8 Fotos. In dieser Vorschau bleiben sie auf deinem Gerät.</span>
                  <input
                    id="w-bilder"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []).slice(0, 8);
                      setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))].slice(0, 8));
                      set({ bilder: [...d.bilder, ...files.map((f) => f.name)].slice(0, 8) });
                    }}
                    {...inv("bilder")}
                  />
                </label>
                {err("bilder")}
              </div>
              {d.bilder.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {d.bilder.map((name, i) => (
                    <li key={name + i} className="relative overflow-hidden rounded-xl bg-leaf-50 ring-1 ring-line">
                      {previews[i] ? <img src={previews[i]} alt={`Foto ${i + 1}: ${name}`} className="aspect-[3/2] w-full object-cover" /> : <p className="grid aspect-[3/2] place-items-center p-2 text-center text-xs text-muted">{name}</p>}
                      <button type="button" className="icon-btn absolute top-1 right-1 size-8 bg-white/95" aria-label={`Foto ${i + 1} entfernen`} onClick={() => { set({ bilder: d.bilder.filter((_, n) => n !== i) }); setPreviews((p) => p.filter((_, n) => n !== i)); }}>
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="flex gap-3 text-[0.95rem]">
                <input type="checkbox" className="check mt-0.5" checked={d.demoBild} onChange={(e) => set({ demoBild: e.target.checked })} />
                Vorerst eine Platzhalter-Illustration verwenden und Fotos später ergänzen
              </label>

              <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                <label className="flex gap-3 text-[0.95rem]">
                  <input id="w-bestaetigt" type="checkbox" className="check mt-0.5" checked={!!d.bestaetigt} onChange={(e) => set({ bestaetigt: e.target.checked })} {...inv("bestaetigt")} />
                  <span>
                    Ich bestätige, dass ich das Auto vermieten darf, dass es immatrikuliert und betriebssicher ist und dass meine Versicherung die entgeltliche
                    Vermietung an Dritte deckt. Es gelten die <Link href="/agb#ziffer-4" target="_blank" className="link">AGB, insbesondere Ziffer 4 und 5</Link>.
                  </span>
                </label>
                {err("bestaetigt")}
                <p className="hint">Eine Versicherung für die private Nutzung reicht möglicherweise nicht aus. Kläre das vor der ersten Vermietung mit deiner Versicherung und hole im Zweifel eine schriftliche Bestätigung ein.</p>
              </div>

              <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-[1fr_1.1fr]">
                <div>
                  <p className="label">So sieht dein Inserat aus</p>
                  <div className="card overflow-hidden">
                    <div className="relative aspect-[3/2] bg-leaf-50">
                      <img src={previews[0] ?? `/fahrzeuge/kategorie-${d.kategorie}.svg`} alt="Vorschaubild des Inserats" className={cn("size-full", previews[0] ? "object-cover" : "object-contain p-8")} />
                      <ProviderBadge kind={gewerbe ? "gewerbe" : "privat"} onTint className="absolute top-3 left-3" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold text-muted">{CATEGORIES.find((c) => c.id === d.kategorie)?.label}</p>
                      <p className="font-display text-lg font-semibold text-forest">{d.marke} {d.modell}</p>
                      <p className="text-sm text-muted">{gewerbe ? `${session?.company ?? "Dein Unternehmen"}, ${d.standort}` : d.ort}</p>
                      <p className="mt-3"><span className="font-display text-xl font-bold text-forest">{tag.from && "ab "}{chf(tag.amount)}</span><span className="text-sm text-muted"> pro {tag.unit}</span></p>
                      {tag.once && <p className="text-sm font-semibold text-ink/75">{tag.once}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid content-start gap-4 text-[0.95rem]">
                  <div>
                    <p className="flex items-center gap-2 font-bold text-forest"><Eye className="size-4" aria-hidden />Im Inserat sichtbar</p>
                    <p className="mt-1 text-ink/80">Modell, Kategorie, Fotos, Preis, Ausstattung, Beschreibung, Verfügbarkeit und {gewerbe ? "die Adresse deines Standorts" : "der Ort mit ungefährer Lage"}.</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-bold text-forest"><EyeOff className="size-4" aria-hidden />Nicht öffentlich</p>
                    <p className="mt-1 text-ink/80">Kilometerstand{gewerbe ? "." : " und genaue Adresse – diese erhalten Mietende erst nach einer bestätigten Buchung."}</p>
                  </div>
                  <dl className="grid gap-2 border-t border-line pt-4">
                    {[["Standort", `${d.plz} ${d.ort}`], ["Baujahr", d.baujahr], ["Getriebe und Antrieb", `${d.getriebe}, ${d.antrieb}`], ["Verfügbar", d.tage.join(", ")], ...(gewerbe ? [["Mietmodelle", d.modelle.map(offerLabel).join(", ") || "–"]] : []), ...(!gewerbe || d.modelle.includes("kurzzeit") ? [["Kilometer", `${fmtKm(Number(d.kmTag) || 200)} pro Tag inklusive`]] : []), ["Übergabe", d.kontaktlos ? "Kontaktlos möglich" : "Persönlich"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
                    ))}
                  </dl>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-between gap-3 border-t border-line bg-canvas py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:bg-transparent">
        <button type="button" className={cn("btn btn-outline", step === 0 && "invisible")} onClick={() => goto(step - 1)} aria-hidden={step === 0} tabIndex={step === 0 ? -1 : undefined}>
          <ArrowLeft className="size-4" aria-hidden />
          Zurück
        </button>
        <button type="button" className="btn btn-primary min-w-[9.5rem]" onClick={next}>
          {last ? "Inserat speichern" : "Weiter"}
          {!last && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
