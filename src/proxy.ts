import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, GATE_PATH, hasAccess } from "@/lib/gate";

/**
 * Passwortschutz: Ohne gültiges Cookie führt jede Seite zur Passwort-Eingabe unter /zugang,
 * die gewünschte Adresse wird als «weiter» mitgegeben. Aus, solange SITE_PASSWORD fehlt (siehe src/lib/gate.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === GATE_PATH) return NextResponse.next();
  if (await hasAccess(request.cookies.get(GATE_COOKIE)?.value)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;
  url.search = "";
  if (pathname !== "/" || search) url.searchParams.set("weiter", `${pathname}${search}`);
  const res = NextResponse.redirect(url, request.method === "GET" || request.method === "HEAD" ? 307 : 303);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: [
    // Alles schützen ausser den Dateien, die die Passwortseite selbst braucht (Skripte, Schriften, Symbole),
    // und robots.txt, das Suchmaschinen aussperrt.
    "/((?!_next/static|favicon\\.ico|icon\\.svg|apple-icon|manifest\\.webmanifest|robots\\.txt|opengraph-image|twitter-image|brand/).*)",
  ],
};
