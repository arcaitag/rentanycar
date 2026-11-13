"use client";
import { useRouter } from "next/navigation";
import { BadgeCheck, CircleDashed, Clock3 } from "lucide-react";
import { VEHICLES } from "@/data/vehicles";
import { resetDemo, useFavorites, useStore, type Session } from "@/lib/store";
import { VehicleGrid } from "@/components/ui/VehicleGrid";
import { Toggle } from "@/components/ui/Choice";
import { Empty } from "./shared";
import { cn } from "@/lib/cn";

export function Favorites() {
  const [favs] = useFavorites();
  const list = VEHICLES.filter((v) => favs.includes(v.slug));
  if (!list.length) return <Empty title="Noch keine Favoriten" text="Tippe bei einem Auto auf das Herz, um es hier zu speichern." href="/autos" cta="Autos ansehen" />;
  return <VehicleGrid slugs={list.map((v) => v.slug)} className="xl:grid-cols-3" />;
}

type VStatus = "ok" | "offen" | "fehlt";
const V_TONE: Record<VStatus, [string, string, typeof BadgeCheck]> = {
  ok: ["Angegeben", "bg-leaf-100 text-leaf-700", BadgeCheck],
  offen: ["Nicht bestätigt", "bg-sun/25 text-[#5c4611]", CircleDashed],
  fehlt: ["Nicht hinterlegt", "bg-line/70 text-ink/75", Clock3],
};

export function ProfileSection({ session }: { session: Session }) {
  const biz = session.role === "gewerbe";
  const checks: [string, string, VStatus][] = [
    ["E-Mail-Adresse", session.email, "ok"],
    ["Telefonnummer", "Bestätigung per SMS", "offen"],
    ["Identität", "Amtlicher Ausweis", "fehlt"],
    ["Führerausweis", "Gültiger Führerausweis", "fehlt"],
    ...(biz ? ([["UID-Nummer", "Format und Prüfziffer geprüft", "ok"], ["Geschäftsadresse", "Angabe bei der Registrierung", "ok"]] as [string, string, VStatus][]) : []),
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="p-daten">
        <h2 id="p-daten" className="text-xl font-semibold">Profil</h2>
        <dl className="mt-4 grid gap-3">
          {[["Kontotyp", biz ? "Unternehmen" : "Privatperson"], ...(biz ? [["Firma", session.company ?? ""]] : []), [biz ? "Ansprechperson" : "Name", session.name], ["E-Mail", session.email]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line pb-2"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-muted">{biz ? "Öffentlich sichtbar: Firmenname, Adresse, Öffnungszeiten und – falls freigegeben – die UID." : "Öffentlich sichtbar: Vorname, Region, Mitglied seit und Bewertungen. Nie deine Adresse."}</p>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="p-verif">
        <h2 id="p-verif" className="text-xl font-semibold">Angaben und Prüfungen</h2>
        <ul className="mt-4 divide-y divide-line">
          {checks.map(([title, text, s]) => {
            const [label, tone, Icon] = V_TONE[s];
            return (
              <li key={title} className="flex items-center justify-between gap-3 py-3">
                <div><p className="font-semibold">{title}</p><p className="text-sm text-muted">{text}</p></div>
                <span className={cn("chip shrink-0", tone)}><Icon className="size-3.5" aria-hidden />{label}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

const DEFAULT_SETTINGS = { anfragen: true, erinnerung: true, news: false };

export function SettingsSection({ session }: { session: Session }) {
  const router = useRouter();
  const [s, setS] = useStore("rac:settings", DEFAULT_SETTINGS);
  return (
    <div className="grid max-w-2xl gap-5">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="s-benach">
        <h2 id="s-benach" className="text-xl font-semibold">Benachrichtigungen</h2>
        <div className="mt-3 divide-y divide-line">
          <Toggle checked={s.anfragen} onChange={(v) => setS({ ...s, anfragen: v })} label={session.role === "gewerbe" ? "E-Mail bei neuen Anfragen für die Flotte" : "E-Mail bei neuen Anfragen"} />
          <Toggle checked={s.erinnerung} onChange={(v) => setS({ ...s, erinnerung: v })} label="Erinnerung vor Abholung und Rückgabe" />
          <Toggle checked={s.news} onChange={(v) => setS({ ...s, news: v })} label="Neuigkeiten zu rentanycar.ch" />
        </div>
      </section>
      <section className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6" aria-labelledby="s-demo">
        <h2 id="s-demo" className="text-xl font-semibold">Gespeicherte Daten</h2>
        <p className="mt-1 text-ink/75">Deine Anfragen, Inserate, Favoriten und Nachrichten sind in diesem Browser gespeichert.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn btn-ghost text-alert" onClick={() => { resetDemo(); router.push("/"); }}>Daten in diesem Browser löschen</button>
        </div>
      </section>
    </div>
  );
}
