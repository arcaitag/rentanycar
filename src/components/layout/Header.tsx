"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_GROUPS } from "./nav";
import { useSession } from "@/lib/store";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/cn";

export default function Header() {
  const pathname = usePathname();
  const [session] = useSession();
  const menu = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => menu.current?.close(), [pathname]);
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const initials = session?.name?.slice(0, 1).toUpperCase() ?? "";
  const close = () => menu.current?.close();
  const itemClass = (href: string) =>
    cn("block rounded-xl px-3 py-2.5 text-lg font-semibold transition", active(href) ? "bg-leaf-100 text-forest" : "text-ink hover:bg-leaf-50");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="page flex h-16 items-center gap-3">
          <Link href="/" className="rounded-lg" aria-label="rentanycar.ch – zur Startseite">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            {session ? (
              <>
                <Link href="/konto/nachrichten" className="icon-btn" aria-label="Nachrichten, neue vorhanden">
                  <MessageCircle className="size-5" aria-hidden />
                  <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-leaf-500 ring-2 ring-canvas" aria-hidden />
                </Link>
                <Link href="/konto" className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 hover:bg-leaf-100 sm:pr-3">
                  <span className="grid size-9 place-items-center rounded-full bg-forest text-sm font-bold text-white" aria-hidden>
                    {initials}
                  </span>
                  <span className="sr-only text-sm font-bold whitespace-nowrap text-forest sm:not-sr-only">Mein Konto</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  Anmelden
                </Link>
                <Link href="/registrieren" className="btn btn-primary btn-sm hidden md:inline-flex">
                  Konto erstellen
                </Link>
              </>
            )}
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="hauptmenue"
              onClick={() => {
                menu.current?.showModal();
                // Fokus auf das Menü selbst statt auf das erste Element (Logo): kein Fokusrahmen beim Öffnen
                menu.current?.focus({ preventScroll: true });
                setOpen(true);
              }}
              className="inline-flex size-11 cursor-pointer items-center justify-center gap-2 rounded-full text-forest transition hover:bg-leaf-100 md:w-auto md:px-4 md:ring-1 md:ring-line md:ring-inset"
            >
              <Menu className="size-6 md:size-5" aria-hidden />
              <span className="hidden text-[0.95rem] font-bold md:inline">Menü</span>
              <span className="sr-only md:hidden">Menü öffnen</span>
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={menu}
        id="hauptmenue"
        tabIndex={-1}
        className="drawer"
        aria-label="Menü"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <Link href="/" onClick={close} className="rounded-lg" aria-label="rentanycar.ch – zur Startseite">
              <Logo />
            </Link>
            <button type="button" className="icon-btn" aria-label="Menü schliessen" onClick={close}>
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <nav aria-label="Hauptnavigation" className="flex-1 overflow-y-auto px-3 py-4">
            <Link href="/" onClick={close} aria-current={active("/") ? "page" : undefined} className={itemClass("/")}>
              Start
            </Link>
            {NAV_GROUPS.map((g, gi) => (
              <div key={g.title} className="mt-5">
                <p id={`menue-gruppe-${gi}`} className="px-3 text-sm font-bold text-muted">
                  {g.title}
                </p>
                <ul aria-labelledby={`menue-gruppe-${gi}`} className="mt-1">
                  {g.items.map((n) => (
                    <li key={n.href}>
                      <Link href={n.href} onClick={close} aria-current={active(n.href) ? "page" : undefined} className={itemClass(n.href)}>
                        {n.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="grid gap-2 border-t border-line p-5">
            {session ? (
              <>
                <p className="truncate px-1 text-sm text-muted">Angemeldet als <strong className="font-bold text-ink">{session.company ?? session.name}</strong></p>
                <Link href="/konto" onClick={close} className="btn btn-primary">Mein Konto</Link>
                <LogoutButton onClick={close} className="btn btn-outline" />
              </>
            ) : (
              <>
                <Link href="/registrieren" onClick={close} className="btn btn-primary">Konto erstellen</Link>
                <Link href="/login" onClick={close} className="btn btn-outline">Anmelden</Link>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
