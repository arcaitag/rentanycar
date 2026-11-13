"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, UserRound } from "lucide-react";
import { checkUid } from "@/lib/uid";
import { useSession } from "@/lib/store";
import { cn } from "@/lib/cn";
import { safeNext } from "./LoginForm";
import { PasswordInput } from "./PasswordInput";

type Typ = "privat" | "unternehmen";
const LEGAL = ["Einzelunternehmen", "GmbH", "AG", "Kollektivgesellschaft", "Genossenschaft", "Verein", "Andere"];
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+0-9 ()-]{9,}$/;

export default function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("weiter"));
  const initial = sp.get("typ");
  const preset = initial === "privat" || initial === "unternehmen" ? initial : null;
  const [typ, setTyp] = useState<Typ | null>(preset);
  const [stage, setStage] = useState<"wahl" | "formular">(preset ? "formular" : "wahl");
  const nextBtn = useRef<HTMLButtonElement>(null);
  // Nach der Auswahl die nächste Schaltfläche sichtbar machen (v. a. auf dem Smartphone)
  useEffect(() => {
    if (typ && stage === "wahl") nextBtn.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [typ, stage]);
  const [, setSession] = useSession();
  const [f, setF] = useState<Record<string, string>>({ rechtsform: "GmbH" });
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const v = (k: string) => (f[k] ?? "").trim();
  const uid = checkUid(v("uid"));

  const errs: Record<string, string | false> =
    typ === "unternehmen"
      ? {
          firma: !v("firma") && "Bitte gib den Firmennamen ein.",
          uid: !uid.ok && (uid.reason ?? "Bitte prüfe die UID-Nummer."),
          kontakt: !v("kontakt") && "Bitte gib eine Ansprechperson an.",
          adresse: v("adresse").length < 6 && "Bitte gib die Geschäftsadresse ein, z. B. Musterstrasse 1, 3000 Bern.",
          email: !MAIL.test(v("email")) && "Bitte gib eine gültige E-Mail-Adresse ein.",
          tel: !PHONE.test(v("tel")) && "Bitte gib eine Telefonnummer ein.",
          pw: (f.pw ?? "").length < 8 && "Das Passwort braucht mindestens 8 Zeichen.",
          pw2: f.pw2 !== f.pw && "Die Passwörter stimmen nicht überein.",
          agree: !agree && "Bitte akzeptiere die AGB und die Datenschutzerklärung.",
        }
      : {
          vorname: !v("vorname") && "Bitte gib deinen Vornamen ein.",
          nachname: !v("nachname") && "Bitte gib deinen Nachnamen ein.",
          email: !MAIL.test(v("email")) && "Bitte gib eine gültige E-Mail-Adresse ein.",
          tel: !PHONE.test(v("tel")) && "Bitte gib eine Telefonnummer ein.",
          wohnort: !v("wohnort") && "Bitte gib deinen Wohnort ein.",
          pw: (f.pw ?? "").length < 8 && "Das Passwort braucht mindestens 8 Zeichen.",
          pw2: f.pw2 !== f.pw && "Die Passwörter stimmen nicht überein.",
          agree: !agree && "Bitte akzeptiere die AGB und die Datenschutzerklärung.",
        };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const first = Object.entries(errs).find(([, x]) => x);
    if (first) {
      setTried(true);
      document.getElementById(`r-${first[0]}`)?.focus();
      return;
    }
    setSession(typ === "unternehmen" ? { role: "gewerbe", name: v("kontakt").split(" ")[0], email: v("email"), company: v("firma") } : { role: "privat", name: v("vorname"), email: v("email") });
    router.push(next);
  }

  const field = (k: string, label: string, opts: { type?: string; auto?: string; hint?: string; ph?: string; span?: boolean } = {}) => (
    <div className={opts.span ? "sm:col-span-2" : undefined}>
      <label htmlFor={`r-${k}`} className="label">{label}</label>
      {opts.type === "password" ? (
        <PasswordInput id={`r-${k}`} autoComplete={opts.auto ?? "new-password"} value={f[k] ?? ""} onChange={(val) => setF({ ...f, [k]: val })} invalid={tried && !!errs[k]} describedBy={tried && errs[k] ? `r-${k}-e` : opts.hint ? `r-${k}-h` : undefined} />
      ) : (
      <input
        id={`r-${k}`}
        type={opts.type ?? "text"}
        autoComplete={opts.auto}
        placeholder={opts.ph}
        className="field"
        value={f[k] ?? ""}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        onBlur={k === "uid" && uid.ok && uid.formatted ? () => setF({ ...f, uid: uid.formatted! }) : undefined}
        aria-invalid={tried && !!errs[k]}
        aria-describedby={tried && errs[k] ? `r-${k}-e` : opts.hint ? `r-${k}-h` : undefined}
      />
      )}
      {tried && errs[k] ? <p id={`r-${k}-e`} className="error-text">{errs[k]}</p> : opts.hint && <p id={`r-${k}-h`} className="hint">{opts.hint}</p>}
    </div>
  );

  const OPTIONS = [
    ["privat", "Als Privatperson", "Autos mieten und dein eigenes Auto ab und zu vermieten.", UserRound, "bg-leaf-100 text-leaf-700"],
    ["unternehmen", "Als Unternehmen", "Als Autovermietung, Garage oder Firma eine Flotte anbieten – und selbst mieten.", Building2, "bg-sage-100 text-sage-800"],
  ] as const;

  if (stage === "wahl") {
    return (
      <div>
        <fieldset>
          <legend className="font-display text-[1.4rem] font-semibold text-forest">Wie möchtest du rentanycar.ch nutzen?</legend>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {OPTIONS.map(([val, l, t, Icon, tone]) => {
              const on = typ === val;
              return (
                <label key={val} className={cn("relative flex cursor-pointer flex-col items-start gap-3 rounded-2xl bg-white p-5 ring-1 transition has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest has-[:focus-visible]:outline-solid", on ? "bg-leaf-50 ring-2 ring-forest" : "ring-line hover:ring-forest/40")}>
                  <input type="radio" name="kontotyp" className="sr-only" checked={on} onChange={() => { setTyp(val); setTried(false); }} />
                  {on && <CheckCircle2 className="absolute top-4 right-4 size-6 text-forest" aria-hidden />}
                  <span className={cn("grid size-12 place-items-center rounded-xl", tone)}><Icon className="size-6" aria-hidden /></span>
                  <span className="font-display text-xl font-semibold text-forest">{l}</span>
                  <span className="text-ink/75">{t}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        {typ && (
          <button ref={nextBtn} type="button" className="btn btn-primary mt-6 w-full scroll-mb-24 sm:w-auto" onClick={() => setStage("formular")}>
            {typ === "privat" ? "Weiter als Privatperson" : "Unternehmenskonto erstellen"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
        <p className="mt-6 text-ink/80">Schon ein Konto? <Link href="/login" className="link">Anmelden</Link></p>
      </div>
    );
  }

  return (
        <form noValidate onSubmit={submit}>
          <button type="button" className="btn btn-ghost btn-sm -ml-3" onClick={() => setStage("wahl")}><ArrowLeft className="size-4" aria-hidden />Kontotyp ändern</button>
          <h2 className="mt-3 flex items-center gap-2 text-2xl font-bold">
            {typ === "privat" ? <UserRound className="size-6 text-leaf-700" aria-hidden /> : <Building2 className="size-6 text-sage-600" aria-hidden />}
            {typ === "privat" ? "Konto als Privatperson" : "Unternehmenskonto"}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {typ === "privat" ? (
              <>
                {field("vorname", "Vorname", { auto: "given-name" })}
                {field("nachname", "Nachname", { auto: "family-name" })}
                {field("email", "E-Mail-Adresse", { type: "email", auto: "email" })}
                {field("tel", "Telefonnummer", { type: "tel", auto: "tel", ph: "079 123 45 67" })}
                {field("wohnort", "Wohnort", { auto: "address-level2", span: true, hint: "Nur die Region wird in deinem Profil angezeigt." })}
              </>
            ) : (
              <>
                {field("firma", "Firmenname", { auto: "organization", span: true })}
                <div>
                  <label htmlFor="r-rechtsform" className="label">Rechtsform</label>
                  <select id="r-rechtsform" className="field" value={f.rechtsform} onChange={(e) => setF({ ...f, rechtsform: e.target.value })}>{LEGAL.map((l) => <option key={l}>{l}</option>)}</select>
                </div>
                {field("uid", "UID-Nummer", { ph: "CHE-123.456.789", hint: "Wir prüfen Format und Prüfziffer." })}
                {field("kontakt", "Ansprechperson", { auto: "name" })}
                {field("tel", "Telefonnummer", { type: "tel", auto: "tel" })}
                {field("adresse", "Geschäftsadresse", { auto: "street-address", span: true, ph: "Strasse Nr., PLZ Ort" })}
                {field("email", "E-Mail-Adresse", { type: "email", auto: "email", span: true })}
              </>
            )}
            {field("pw", "Passwort", { type: "password", auto: "new-password", hint: "Mindestens 8 Zeichen." })}
            {field("pw2", "Passwort bestätigen", { type: "password", auto: "new-password" })}
          </div>
          <label className="mt-6 flex gap-3 text-[0.95rem]">
            <input id="r-agree" type="checkbox" className="check mt-0.5" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={tried && !!errs.agree} />
            <span>
              Ich akzeptiere die <Link href="/agb" target="_blank" className="link">AGB</Link> und habe die{" "}
              <Link href="/datenschutz" target="_blank" className="link">Datenschutzerklärung</Link> gelesen.
              <span className="sr-only"> Die Links öffnen in einem neuen Tab.</span>
            </span>
          </label>
          {tried && errs.agree && <p className="error-text">{errs.agree}</p>}
          <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto">Konto erstellen</button>
          <p className="hint">In dieser Vorschau wird kein Konto auf einem Server erstellt und kein Passwort gespeichert.</p>
        </form>
  );
}
