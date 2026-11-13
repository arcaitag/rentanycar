"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, GATE_MAX_AGE, gatePassword, gateToken, safeTarget, sameToken } from "@/lib/gate";

export interface GateState {
  error: string;
}

/** Prüft das Passwort, setzt das Cookie und führt zur gewünschten Seite. */
export async function unlock(_prev: GateState, form: FormData): Promise<GateState> {
  const target = safeTarget(form.get("weiter"));
  const password = gatePassword();
  if (!password) redirect(target);

  const input = String(form.get("passwort") ?? "").trim().slice(0, 200);
  if (!input) return { error: "Bitte gib das Passwort ein." };

  const [given, expected] = await Promise.all([gateToken(input), gateToken(password)]);
  if (!sameToken(given, expected)) {
    // Kurze Pause bremst automatisches Durchprobieren
    await new Promise((r) => setTimeout(r, 700));
    return { error: "Das Passwort stimmt nicht." };
  }

  (await cookies()).set(GATE_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
  redirect(target);
}
