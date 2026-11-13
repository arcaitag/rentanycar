/*
 * Passwortschutz für die Vorschau.
 * Aktiv, sobald die Umgebungsvariable SITE_PASSWORD gesetzt ist (Vercel → Settings → Environment Variables).
 * Aufheben: Variable löschen und neu deployen. Wer das richtige Passwort eingibt, erhält ein Cookie für 30 Tage.
 * Im Cookie steht nur eine Prüfsumme, nie das Passwort. Ändert sich das Passwort, werden alle Cookies ungültig.
 */
export const GATE_PATH = "/zugang";
export const GATE_COOKIE = "rac_zugang";
export const GATE_MAX_AGE = 60 * 60 * 24 * 30;

/** Das Passwort aus der Umgebung, null = Schutz aus. */
export function gatePassword(): string | null {
  const pw = process.env.SITE_PASSWORD?.trim();
  return pw ? pw : null;
}

export async function gateToken(password: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`rentanycar-zugang:v1:${password}`));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vergleich in konstanter Zeit, damit die Antwortzeit nichts verrät. */
export function sameToken(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** true, wenn der Schutz aus ist oder das Cookie zum aktuellen Passwort passt. */
export async function hasAccess(cookie: string | undefined) {
  const pw = gatePassword();
  if (!pw) return true;
  return !!cookie && sameToken(cookie, await gateToken(pw));
}

/** Nach der Eingabe nur zu Seiten dieser Website weiterleiten, nie zu fremden Adressen. */
export function safeTarget(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  const base = "http://rentanycar.invalid";
  try {
    const u = new URL(value, base);
    if (u.origin !== base || u.pathname === GATE_PATH || u.pathname.startsWith(`${GATE_PATH}/`)) return "/";
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return "/";
  }
}
