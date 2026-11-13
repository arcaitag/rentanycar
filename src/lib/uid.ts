/**
 * Formale Prüfung einer Schweizer Unternehmens-Identifikationsnummer (UID, eCH-0097):
 * Format CHE-123.456.789 und Prüfziffer (Modulo 11). Keine Abfrage beim UID-Register.
 */
export function checkUid(input: string): { ok: boolean; formatted?: string; reason?: string } {
  const raw = input.toUpperCase().replace(/[\s.\-]/g, "").replace(/(MWST|TVA|IVA|HR)$/, "");
  if (!/^CHE\d{9}$/.test(raw)) return { ok: false, reason: "Bitte im Format CHE-123.456.789 eingeben." };
  const d = raw.slice(3).split("").map(Number);
  const weights = [5, 4, 3, 2, 7, 6, 5, 4];
  const sum = weights.reduce((s, w, i) => s + w * d[i], 0);
  let check = 11 - (sum % 11);
  if (check === 11) check = 0;
  if (check === 10 || check !== d[8]) return { ok: false, reason: "Die Prüfziffer stimmt nicht. Bitte die Nummer kontrollieren." };
  const s = raw.slice(3);
  return { ok: true, formatted: `CHE-${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6)}` };
}
