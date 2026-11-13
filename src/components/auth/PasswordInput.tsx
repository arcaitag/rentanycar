"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Passwortfeld mit Schaltfläche zum Anzeigen oder Ausblenden. */
export function PasswordInput({ id, name, value, onChange, autoComplete, autoFocus, invalid, describedBy }: { id: string; name?: string; value: string; onChange: (v: string) => void; autoComplete: string; autoFocus?: boolean; invalid?: boolean; describedBy?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} autoFocus={autoFocus} className="field pr-12" value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={invalid} aria-describedby={describedBy} />
      <button type="button" className="icon-btn absolute top-0.5 right-0.5" aria-label={show ? "Passwort ausblenden" : "Passwort anzeigen"} aria-pressed={show} onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
