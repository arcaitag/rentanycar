import type { Session } from "./store";

/*
 * Feste Zugänge für die Vorschau, z. B. mit Admin-Rechten.
 * Im Code stehen nur SHA-256-Prüfsummen – E-Mail-Adresse und Passwort sind nicht lesbar.
 * Neuer Zugang: mail = sha256("rac-mail:" + email), login = sha256("rac-login:" + email + ":" + passwort), email klein geschrieben.
 * Achtung: Die Prüfung läuft im Browser und ist kein echter Zugriffsschutz. Für den Betrieb braucht es eine
 * serverseitige Anmeldung (z. B. Supabase Auth) mit Rollen in der Datenbank.
 */
interface Account {
  mail: string;
  login: string;
  session: Omit<Session, "email">;
}

const ACCOUNTS: Account[] = [
  {
    // Vermieter (Demo-Flotte von CityDrive Bern GmbH) mit Admin-Rechten
    mail: "2e6921ca052c382b5b00a308305bc62288f8f2e9e34f81e655aadb6b75ec41b1",
    login: "b3e017503e513d7b8c9dd9699ef812f15b46c7e37cf767c7e322dcce91d5e932",
    session: { role: "gewerbe", name: "Admin", company: "CityDrive Bern GmbH", admin: true },
  },
];

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sitzung bei passenden Zugangsdaten, «falsch» bei bekannter E-Mail mit falschem Passwort, sonst null (normale Vorschau-Anmeldung). */
export async function checkAccount(email: string, password: string): Promise<Session | "falsch" | null> {
  const mail = email.trim().toLowerCase();
  const m = await sha256(`rac-mail:${mail}`);
  const found = ACCOUNTS.find((a) => a.mail === m);
  if (!found) return null;
  return (await sha256(`rac-login:${mail}:${password}`)) === found.login ? { ...found.session, email: mail } : "falsch";
}
