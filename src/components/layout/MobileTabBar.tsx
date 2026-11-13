"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CircleUserRound, Headset, KeyRound, LogIn, MessageCircle, Search, type LucideIcon } from "lucide-react";
import { DEMO_THREADS } from "@/data/account";
import { useSession, useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

/** Seiten mit eigener Aktionsleiste am unteren Rand: dort keine Tab-Leiste. */
const HIDDEN = [/^\/autos\/[^/]+$/, /^\/auto-vermieten\/erfassen/];
const NO_MSG: Record<string, unknown> = {};

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  on: boolean;
  /** Ungelesenes: eine Zahl zeigt einen Zähler, true einen Punkt. */
  badge?: number | boolean;
}

/**
 * Untere Navigation auf dem Handy (auf Tablet und Desktop ausgeblendet).
 * Gäste sehen Suchen, Vermieten, Anmelden und Support; angemeldete Personen zusätzlich
 * Buchungen, Nachrichten und Profil. Der Status kommt aus der (Demo-)Anmeldung,
 * ohne Anmeldung gilt man als Gast – auch beim ersten Rendern auf dem Server.
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const [session] = useSession();
  const [replied] = useStore("rac:messages", NO_MSG);
  if (HIDDEN.some((r) => r.test(pathname))) return null;

  const is = (...paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const search: Tab = { href: "/autos", label: "Suchen", icon: Search, on: is("/autos") };
  const support: Tab = { href: "/hilfe", label: "Support", icon: Headset, on: is("/hilfe") };

  let tabs: Tab[];
  if (session) {
    // Demo: Eine Unterhaltung gilt als gelesen, sobald darin geantwortet wurde (wie in «Nachrichten»).
    const unread = DEMO_THREADS[session.role].filter((t) => t.unread && !replied[t.id]).length;
    const own = ["/konto/buchungen", "/konto/inserate", "/konto/nachrichten"];
    tabs = [
      search,
      { href: "/konto/buchungen", label: "Buchungen", icon: CalendarCheck, on: is("/konto/buchungen") },
      { href: "/konto/inserate", label: "Vermieten", icon: KeyRound, on: is("/konto/inserate", "/auto-vermieten") },
      { href: "/konto/nachrichten", label: "Nachrichten", icon: MessageCircle, on: is("/konto/nachrichten"), badge: unread },
      { href: "/konto", label: "Profil", icon: CircleUserRound, on: is("/konto") && !is(...own) },
      support,
    ];
  } else {
    tabs = [
      search,
      { href: "/auto-vermieten", label: "Vermieten", icon: KeyRound, on: is("/auto-vermieten") },
      { href: "/login", label: "Anmelden", icon: LogIn, on: is("/login", "/registrieren") },
      support,
    ];
  }

  const six = tabs.length === 6;
  return (
    <nav aria-label="Schnellnavigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      {/* Spalten mindestens so breit wie ihre Beschriftung, der Rest wird gleichmässig verteilt: nichts bricht um oder wird abgeschnitten */}
      <ul className={cn("grid px-1", six ? "grid-cols-[repeat(6,minmax(max-content,1fr))]" : "grid-cols-[repeat(4,minmax(max-content,1fr))]")}>
        {tabs.map(({ href, label, icon: Icon, on, badge }) => (
          <li key={label}>
            <Link
              href={href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-[3px] pt-1 text-[0.7rem] leading-tight font-bold whitespace-nowrap transition-colors",
                six && "max-[350px]:px-0.5 max-[350px]:text-[0.58rem]",
                on ? "text-forest" : "text-muted hover:text-ink",
              )}
            >
              <span className={cn("relative grid h-7 place-items-center rounded-full transition", six ? "w-11" : "w-12", on && "bg-leaf-100")}>
                <Icon className="size-5" strokeWidth={on ? 2.4 : 2} aria-hidden />
                {typeof badge === "number" && badge > 0 && (
                  <span className="absolute -top-1 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-leaf-700 px-1 text-[0.62rem] leading-none font-bold text-white ring-2 ring-white" aria-hidden>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
                {badge === true && <span className="absolute top-0.5 right-2.5 size-2 rounded-full bg-leaf-500 ring-2 ring-white" aria-hidden />}
              </span>
              <span>{label}</span>
              {typeof badge === "number" && badge > 0 && <span className="sr-only">, {badge} ungelesen</span>}
              {badge === true && <span className="sr-only">, neue vorhanden</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
