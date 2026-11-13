"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Building2, CheckCircle2, UserRound } from "lucide-react";
import { useSession, type Session } from "@/lib/store";
import { PasswordInput } from "./PasswordInput";
import { checkAccount } from "@/lib/accounts";

export const DEMO_PRIVAT: Session = { role: "privat", name: "Laura", email: "laura@example.com" };
export const DEMO_GEWERBE: Session = { role: "gewerbe", name: "Tobias", email: "vermietung@example.com", company: "CityDrive Bern GmbH" };
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function safeNext(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/konto";
}

export default function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("weiter"));
  const [, setSession] = useSession();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [reset, setReset] = useState<"zu" | "offen" | "gesendet">("zu");
  const [resetMail, setResetMail] = useState("");
  const [resetError, setResetError] = useState("");
  const login = (s: Session) => {
    setSession(s, remember);
    router.push(next);
  };
  const register = `/registrieren${next !== "/konto" ? `?weiter=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="grid gap-8">
      <form
        noValidate
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!MAIL.test(email)) return setError("Bitte gib eine gültige E-Mail-Adresse ein.");
          if (pw.length < 8) return setError("Das Passwort hat mindestens 8 Zeichen.");
          // Feste Zugänge (z. B. Admin) werden geprüft, alle anderen Adressen melden sich wie bisher als Vorschau-Konto an
          const account = await checkAccount(email, pw);
          if (account === "falsch") return setError("E-Mail-Adresse oder Passwort stimmt nicht.");
          login(account ?? { role: "privat", name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase()), email });
        }}
      >
        <div>
          <label htmlFor="l-mail" className="label">E-Mail-Adresse</label>
          <input id="l-mail" type="email" autoComplete="email" className="field" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
        </div>
        <div>
          <label htmlFor="l-pw" className="label">Passwort</label>
          <PasswordInput id="l-pw" autoComplete="current-password" value={pw} onChange={(v) => { setPw(v); setError(""); }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2.5 text-[0.95rem]">
            <input type="checkbox" className="check" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Angemeldet bleiben
          </label>
          <button type="button" className="cursor-pointer text-[0.95rem] font-semibold text-leaf-700 underline decoration-leaf-300 decoration-2 underline-offset-4 hover:text-forest" aria-expanded={reset !== "zu"} aria-controls="pw-reset" onClick={() => { setReset(reset === "zu" ? "offen" : "zu"); setResetMail(email); }}>
            Passwort vergessen?
          </button>
        </div>
        {error && <p className="error-text" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary">Anmelden</button>
      </form>

      {reset !== "zu" && (
        <section id="pw-reset" className="card p-5" aria-labelledby="pw-reset-titel">
          <h2 id="pw-reset-titel" className="text-lg font-bold">Passwort zurücksetzen</h2>
          {reset === "gesendet" ? (
            <p className="mt-3 flex gap-2.5 text-ink/80" role="status">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
              Wenn ein Konto mit dieser E-Mail-Adresse besteht, erhältst du einen Link zum Zurücksetzen. In dieser Vorschau wird keine E-Mail versendet.
            </p>
          ) : (
            <form
              noValidate
              className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (!MAIL.test(resetMail)) return setResetError("Bitte gib eine gültige E-Mail-Adresse ein.");
                setReset("gesendet");
              }}
            >
              <div>
                <label htmlFor="l-reset" className="label">E-Mail-Adresse</label>
                <input id="l-reset" type="email" autoComplete="email" className="field" value={resetMail} onChange={(e) => { setResetMail(e.target.value); setResetError(""); }} aria-invalid={!!resetError} aria-describedby={resetError ? "l-reset-e" : undefined} />
              </div>
              <button type="submit" className="btn btn-outline">Link anfordern</button>
              {resetError && <p id="l-reset-e" className="error-text sm:col-span-2">{resetError}</p>}
            </form>
          )}
        </section>
      )}

      <p className="text-ink/80">Noch kein Konto? <Link href={register} className="link">Konto erstellen</Link></p>

      <div className="border-t border-line pt-6">
        <p className="text-sm font-bold text-muted">Schnellzugang zur Vorschau</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button type="button" className="btn btn-outline btn-sm justify-start" onClick={() => login(DEMO_PRIVAT)}><UserRound className="size-4 text-leaf-700" aria-hidden />Als Privatperson</button>
          <button type="button" className="btn btn-outline btn-sm justify-start" onClick={() => login(DEMO_GEWERBE)}><Building2 className="size-4 text-sage-600" aria-hidden />Als Unternehmen</button>
        </div>
      </div>
    </div>
  );
}
