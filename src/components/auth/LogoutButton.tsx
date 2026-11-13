"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/lib/store";

/**
 * Abmelden: entfernt die Sitzung (auch «Angemeldet bleiben») und führt zur Startseite.
 * Gespeicherte Anfragen, Inserate und Favoriten bleiben im Browser – löschen lassen sie sich unter «Einstellungen».
 */
export function LogoutButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const router = useRouter();
  const [, setSession] = useSession();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onClick?.();
        setSession(null);
        router.push("/");
      }}
    >
      <LogOut className="size-4 shrink-0" aria-hidden />
      Abmelden
    </button>
  );
}
