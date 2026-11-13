"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { unlock, type GateState } from "./actions";

const START: GateState = { error: "" };

export function GateForm({ target }: { target: string }) {
  const [state, action, pending] = useActionState(unlock, START);
  const [password, setPassword] = useState("");
  // Fehler ausblenden, sobald neu getippt wird; bei jeder neuen Antwort wieder zeigen
  const [typed, setTyped] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setTyped(false);
    if (state.error) form.current?.querySelector<HTMLInputElement>("#zugang-passwort")?.select();
  }, [state]);
  const error = typed ? "" : state.error;

  return (
    <form ref={form} action={action} noValidate className="mt-7 grid gap-5">
      <input type="hidden" name="weiter" value={target} />
      <div>
        <label htmlFor="zugang-passwort" className="label">Passwort</label>
        <PasswordInput
          id="zugang-passwort"
          name="passwort"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(v) => {
            setPassword(v);
            setTyped(true);
          }}
          invalid={!!error}
          describedBy={error ? "zugang-fehler" : undefined}
        />
        {error && <p id="zugang-fehler" className="error-text" role="alert">{error}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Wird geprüft …" : "Vorschau öffnen"}
      </button>
    </form>
  );
}
