"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CalendarDays, Car, Heart, LayoutDashboard, MessageCircle, Settings, ShieldCheck, type LucideIcon } from "lucide-react";
import { useHydrated, useSession } from "@/lib/store";
import { ProviderBadge } from "@/components/ui/ProviderBadge";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/cn";
import { Overview } from "./Overview";
import { Bookings } from "./Bookings";
import { Listings } from "./Listings";
import { Messages } from "./Messages";
import { Favorites, ProfileSection, SettingsSection } from "./Profile";
import { Admin } from "./Admin";
import { Empty } from "./shared";

import type { AccountSection } from "./sections";

export default function AccountArea({ section }: { section: AccountSection }) {
  const hydrated = useHydrated();
  const [session] = useSession();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const path = `/konto${section ? `/${section}` : ""}`;
  // Ohne Anmeldung zum Login (danach zurück hierher); wer sich hier abmeldet, landet auf der Startseite.
  const hadSession = useRef(false);
  useEffect(() => {
    if (session) {
      hadSession.current = true;
      return;
    }
    if (hydrated) router.replace(hadSession.current ? "/" : `/login?weiter=${encodeURIComponent(path)}`);
  }, [hydrated, session, router, path]);

  if (!hydrated || !session) {
    return (
      <div className="page py-16" aria-busy="true">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <p className="mt-4 text-ink/75">Konto wird geladen …</p>
      </div>
    );
  }
  const biz = session.role === "gewerbe";
  const nav: { id: AccountSection; label: string; icon: LucideIcon }[] = [
    { id: "", label: "Übersicht", icon: LayoutDashboard },
    { id: "buchungen", label: "Meine Buchungen", icon: CalendarDays },
    { id: "inserate", label: biz ? "Flotte" : "Meine Inserate", icon: Car },
    { id: "nachrichten", label: "Nachrichten", icon: MessageCircle },
    { id: "favoriten", label: "Favoriten", icon: Heart },
    { id: "profil", label: "Profil", icon: BadgeCheck },
    { id: "einstellungen", label: "Einstellungen", icon: Settings },
    ...(session.admin ? [{ id: "admin" as const, label: "Admin", icon: ShieldCheck }] : []),
  ];
  const current = nav.find((n) => n.id === section);

  return (
    <div className="page pt-6 pb-20 sm:pt-10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <ProviderBadge kind={biz ? "gewerbe" : "privat"} />
            <span className="text-sm font-semibold text-muted">{biz ? `Unternehmenskonto ${session.company}` : "Privatkonto"}</span>
            {session.admin && <span className="chip bg-forest text-white"><ShieldCheck className="size-3.5" aria-hidden />Admin</span>}
          </p>
          <h1 className="mt-2 text-[2rem] leading-tight font-bold sm:text-[2.5rem]">{section ? (current?.label ?? "Kein Zugriff") : `Hallo ${session.name}`}</h1>
        </div>
        {/* Handy und Tablet: die Bereichsnavigation scrollt seitlich, deshalb Abmelden gut sichtbar oben */}
        <LogoutButton className="btn btn-outline btn-sm shrink-0 lg:hidden" />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <nav aria-label="Kontobereich" className="no-scrollbar -mx-5 overflow-x-auto px-5 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="lg:sticky lg:top-24">
            <ul className="flex gap-2 lg:flex-col lg:gap-1">
              {nav.map(({ id, label, icon: Icon }) => (
                <li key={id} className="shrink-0">
                  <Link
                    href={`/konto${id ? `/${id}` : ""}`}
                    aria-current={id === section ? "page" : undefined}
                    className={cn("flex min-h-10 items-center gap-2.5 rounded-full px-4 text-sm font-bold whitespace-nowrap ring-1 transition lg:rounded-xl lg:ring-0", id === section ? "bg-forest text-white ring-forest" : "bg-white text-ink ring-line hover:bg-leaf-50 lg:bg-transparent")}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Desktop: Abmelden am Ende der Seitenleiste, abgesetzt von den Bereichen */}
            <div className="mt-3 hidden border-t border-line pt-3 lg:block">
              <LogoutButton className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-xl px-4 text-sm font-bold text-ink/80 transition hover:bg-leaf-50 hover:text-forest" />
            </div>
          </div>
        </nav>
        <div className="min-w-0">
          {section === "" && <Overview session={session} today={today} />}
          {section === "buchungen" && <Bookings session={session} today={today} />}
          {section === "inserate" && <Listings session={session} today={today} />}
          {section === "nachrichten" && <Messages session={session} />}
          {section === "favoriten" && <Favorites />}
          {section === "profil" && <ProfileSection session={session} />}
          {section === "einstellungen" && <SettingsSection session={session} />}
          {section === "admin" && (session.admin ? <Admin today={today} /> : <Empty title="Kein Zugriff" text="Dieser Bereich ist nur für Admins sichtbar." href="/konto" cta="Zur Übersicht" />)}
        </div>
      </div>
    </div>
  );
}
