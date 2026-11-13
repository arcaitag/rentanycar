# rentanycar.ch – Frontend-MVP

Vorschau einer Schweizer Plattform, auf der Privatpersonen und gewerbliche Anbieter Fahrzeuge vermieten. Alle Inserate, Personen, Firmen, Preise und Bewertungen sind fiktive Demo-Daten. Es gibt kein Backend: Anmeldung, Buchungsanfragen, Inserate, Favoriten und Nachrichten werden nur im Browser gespeichert (localStorage/sessionStorage).

## Start

```bash
npm install
npm run dev      # erzeugt zuerst die Grafiken, dann http://localhost:3000
npm run build    # Grafiken erzeugen + Produktions-Build
npm run start
```

Node.js 20.9 oder neuer (getestet mit 22).

## Technik

Next.js 16 (App Router, statisch vorgerendert), React 19, TypeScript, Tailwind CSS 4, Motion (Animationen), Lucide (Icons). Schriften Manrope und Bricolage Grotesque werden selbst gehostet (keine Google-Fonts-Anfragen).

## Navigation auf dem Handy

Die untere Tab-Leiste (`src/components/layout/MobileTabBar.tsx`, nur unter 768 px) hängt vom Anmeldestatus ab. Gäste sehen Suchen, Vermieten, Anmelden und Support; angemeldete Personen Suchen, Buchungen, Vermieten (eigene Inserate), Nachrichten mit Zähler für Ungelesenes, Profil und Support. Der Status kommt aus `useSession()` (Demo: `rac:session` im localStorage bzw. sessionStorage); ohne Anmeldung gilt man als Gast, auch beim ersten Rendern auf dem Server. Mit echtem Login nur `useSession()` anbinden, die Leiste passt sich an. Auf Fahrzeugseiten und im Inserat-Assistenten ist sie ausgeblendet, weil dort eine eigene Aktionsleiste unten steht.

## Struktur

```
scripts/            Erzeugen Logo-Varianten und Fahrzeug-Illustrationen (SVG) beim Build
public/brand/       Logo: horizontal, dunkel, einfarbig, Symbol, App-Icon, Favicon (generiert)
public/fahrzeuge/   Illustrationen und Kategorie-Grafiken (generiert)
public/symbolbilder/ Fahrzeugfotos von Wikimedia Commons (beim Build geladen)
src/app/            Seiten (Startseite, /autos, /autos/[slug], /anbieter/[slug], /auto-vermieten,
                    /auto-vermieten/erfassen, /registrieren, /login, /konto/…, Inhalts- und Rechtsseiten)
src/components/     UI nach Bereichen: layout, ui, home, search, vehicle, rent, account, auth, pages, illustrations
src/data/           Demo-Daten: Fahrzeuge, Anbieter, Orte, FAQ, Kontodaten
src/lib/            Formatierung (CHF), Preisberechnung, Suche/Filter, UID-Prüfung, Browser-Speicher
```

## Kilometerregelung

Vermietende legen die Kilometer im Inserat fest, rentanycar.ch rechnet, zeigt und dokumentiert.

- **Logik:** `src/lib/mileage.ts` – Typen, Berechnung, Validierung und Umwandlung der Formularfelder.
- **Einstellungen (Inserat):** `MileagePolicy` pro Fahrzeug (`vehicles.ts`, Feld `mileage`): inklusive km pro Tag, Preis pro Zusatzkilometer, optional höherer Preis bei Überschreitung, Unlimited-Paket (pro Tag oder pro Buchung, optional Fair-Use-Grenze), optional Maximum pro Buchung. Eingabe im Inserat-Assistenten und über «Kilometer» in der Inseratverwaltung (`components/mileage/MileageSettings.tsx`, Speicher `rac:km-settings`).
- **Staffelung:** vorbereitet über `tiers` (z. B. ab 4 Tagen 150 km pro Tag); `perDayFor()` berücksichtigt sie bereits, eine Eingabemaske fehlt noch.
- **Buchung:** Die Wahl (Paket, eigene Anzahl, Unlimited) fliesst in den Gesamtpreis. Gespeichert wird eine Momentaufnahme `BookingKm` in `BookingRecord.km` – spätere Änderungen am Inserat ändern bestehende Buchungen nicht (vgl. AGB Ziffer 25).
- **Übergabe und Rückgabe:** `OdometerReading` mit Kilometerstand, Zeitpunkt, Tachofoto (Pflicht), Buchung, Mieter und Vermieter. Nachbuchungen (`TopUp`) bis Mietende. Nach der Rückgabe entsteht bei Überschreitung ein `KmCharge` mit Status `offen` – vorbereitet für die Abrechnung über Zahlungsmittel oder Kaution (Status `bezahlt` bzw. `kaution`). Protokoll in `BookingRecord.log`, lokale Änderungen im Speicher `rac:km`.
- **Anzeige:** Fahrzeugseite (`MileageInfo`), Buchungsdialog (`MileagePicker`, `KmSummary`), Konto unter «Buchungen» für Mietende und Vermietende (`BookingKm.tsx`).
- **Datenbank später:** Tabellen etwa `mileage_policies` (pro Inserat), Kilometerfelder in `bookings`, `odometer_readings` (Fotos in einem Speicher mit Zugriffsschutz), `mileage_topups` und `booking_charges`.

## Mietmodelle

Private Anbieter vermieten kurzzeitig mit Tagespreis. Gewerbliche Anbieter wählen pro Fahrzeug Kurzzeitmiete, Langzeitmiete und/oder Auto-Abo (mindestens eines), optional mit Preisstaffel. Die Logik liegt in `src/lib/offers.ts`:

- `Offers` am Fahrzeug (`vehicles.ts`, Feld `offers`): aktive Modelle, Konditionen je Modell (`short`, `long`, `abo`) und Staffel (`tiers`). Ohne Angabe gilt nur Kurzzeitmiete; Tagespreis und Kilometer der Kurzzeitmiete stehen weiterhin in `price` und `mileage`.
- Preisstaffel: Tages-Stufen gelten für die Kurzzeitmiete (`dayPrice`), Monats-Stufen für die Langzeitmiete (`monthPrice`). Der passende Preis wird aus der Mietdauer berechnet.
- Suche: Parameter `dauer` (`tage`, `wochen`, `monate`, `abo`); ohne Angabe wird die Mietdauer aus dem Zeitraum abgeleitet (ab 7 Tagen Wochen, ab 28 Tagen Monate). Karten zeigen den Preis passend zur Mietdauer (`priceTag`).
- Buchung: Langzeitmiete und Auto-Abo speichern die Konditionen als Momentaufnahme (`BookingRecord.plan`). Spätere Änderungen am Angebot verändern bestehende Buchungen nicht.
- Einnahmen-Rechner auf «Auto vermieten» (`src/components/rent/EarningsCalculator.tsx`): eigener Tagespreis × vermietete Tage, klar als Schätzung markiert, ohne Gebühren und Kosten. Sobald Gebühren feststehen, dort abziehen und den Hinweistext anpassen.
- Preisanzeige: Langzeitmiete und Auto-Abo zeigen überall den Preis pro Monat (Karten, Detailseite, Anfrage, Konto, Admin), nie ein Total über die Laufzeit. Die Monatsrate setzt sich aus Grundpreis, Kilometerpaket und Zusatzleistungen zusammen (`Plan.base`, `Plan.extras`); die Startgebühr steht immer separat als einmalige Kosten. `planTotal` (Vertragswert) wird nur intern gespeichert.
- Anbieter-Dashboard: Änderungen im Editor «Mietmodelle» werden in dieser Vorschau lokal gespeichert (`rac:offers`) und wirken nicht auf die öffentlichen Seiten.
- Weiteres Modell ergänzen: `OfferKind` und `OFFER_KINDS` erweitern, Daten in `Offers`, Preisangabe in `priceTag()`, Formularfelder in `OfferForm` und einen Plan für die Buchung. Suche, Karten, Tabs und Dashboard lesen die Modelle aus dem Register.

Rechtliches: Die Angaben zur Betreiberin (Arca-IT AG) stehen zentral in `src/lib/operator.ts` und erscheinen in Impressum, Datenschutzerklärung und AGB. Kommen Dienstleister hinzu (Datenbank, E-Mail, Zahlungen, Analyse), zuerst Ziffer 8 der Datenschutzerklärung (`src/app/datenschutz/page.tsx`) ergänzen und das Stand-Datum anpassen.

Der Bereich «Welches Auto brauchst du?» (`src/components/home/VehicleStory.tsx`) ist eine animierte Szene: Fünf Fahrzeuge fahren nacheinander durch die Landschaft, je mit Text und Link zur Kategorie. Die Fahrzeuge erzeugt beim Build derselbe Generator wie die Hero-Illustration (`scripts/vehicle-art.mjs`, über `storyCars.ts`); die Räder drehen sich passend zur Strecke. Die Szene pausiert ausserhalb des sichtbaren Bereichs und solange man einen Fahrzeugtyp antippt. Nach fünf Durchgängen (`ROUNDS`) parkt das letzte Fahrzeug und bleibt stehen. Bei reduzierter Bewegung steht die Szene still.

Der Ort in der Hero-Headline (`src/components/home/RotatingPlace.tsx`) erscheint mit Schreibmaschinen-Effekt: Bern, Zürich, Basel, Luzern und Lausanne werden Buchstabe für Buchstabe getippt, stehen kurz und werden wieder gelöscht. Der Effekt läuft endlos (`ROUNDS = Infinity`) und pausiert, solange der Hero nicht im Bild ist. Mit einer Zahl für `ROUNDS` endet er nach so vielen Durchgängen auf «deiner Nähe». Screenreader lesen nur «deiner Nähe.», bei reduzierter Bewegung steht der Satz still. Orte und Tempo sind oben in der Datei einstellbar.

## Feste Zugänge und Admin-Bereich

- **Zugänge:** `src/lib/accounts.ts` enthält feste Zugänge für die Vorschau, zurzeit einen Vermieter-Zugang (Demo-Flotte von CityDrive Bern GmbH) mit Admin-Rechten. Gespeichert sind nur SHA-256-Prüfsummen von E-Mail und Passwort. Alle anderen Adressen melden sich wie bisher als Vorschau-Konto an.
- **Admin-Bereich:** `/konto/admin` (`components/account/Admin.tsx`), nur für Sitzungen mit `admin: true` sichtbar: Übersicht, alle Buchungen mit Kilometerstand, Mehrkilometer mit Status (offen, bezahlt, über Kaution verrechnet), Inserate und Nutzer. Den Status sehen Mietende und Vermietende in der Buchung.
- **Wichtig:** Die Prüfung läuft im Browser und ist kein echter Zugriffsschutz. Für den Betrieb braucht es eine serverseitige Anmeldung (z. B. Supabase Auth) mit Rollen in der Datenbank.

## Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Kanonische URL, z. B. `https://www.rentanycar.ch` (sonst Vercel-Produktions-URL) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `true` erlaubt Suchmaschinen. Standard: gesperrt (robots.txt und noindex) |
| `SITE_PASSWORD` | Passwortschutz für die ganze Website (siehe unten). Fehlt die Variable, ist der Schutz aus |

## Passwortschutz der Vorschau

- **Wirkung:** Ist `SITE_PASSWORD` gesetzt, führt jede Seite zuerst zur Passwort-Eingabe unter `/zugang`. Nach dem richtigen Passwort geht es zur ursprünglich aufgerufenen Seite weiter. Code: `src/proxy.ts`, `src/lib/gate.ts`, `src/app/zugang/`.
- **Cookie:** `rac_zugang`, httpOnly, 30 Tage gültig. Darin steht nur eine Prüfsumme, nie das Passwort. Ändert sich das Passwort, werden alle Cookies ungültig und alle müssen es neu eingeben.
- **Passwort ändern:** Vercel → Projekt → Settings → Environment Variables → `SITE_PASSWORD` anpassen, danach neu deployen (Deployments → Redeploy).
- **Schutz aufheben (Go-live):** `SITE_PASSWORD` löschen und neu deployen.
- **Offen ohne Passwort:** `robots.txt` (sperrt Suchmaschinen aus), App-Symbole, Manifest und das Vorschaubild für Link-Vorschauen. Alles andere, auch Bilder und `sitemap.xml`, ist geschützt.
- **Lokal:** Ohne Variable ist der Schutz aus. Zum Testen: `SITE_PASSWORD=test npm run build` und `SITE_PASSWORD=test npm start`.
- Vercels eigener Passwortschutz (Deployment Protection) würde dasselbe tun, kostet aber extra. Darum ist der Schutz hier im Code gelöst.

## Demo-Daten ersetzen

- Fahrzeuge: `src/data/vehicles.ts`, Anbieter: `src/data/providers.ts`, Orte für die Suche: `src/data/places.ts`.
- Echte Fotos: siehe «Echte Inhalte ergänzen» unten.
- Grafiken neu erzeugen: `npm run assets:force`.
- Browser-Speicher (`src/lib/store.ts`) ist die Stelle, an der später ein echtes Backend angebunden wird.

## Nicht enthalten (bewusst)

Echte Anmeldung, Zahlung, Identitäts- und Führerausweisprüfung, UID-Register-Abfrage (nur Formatprüfung mit Prüfziffer), Versicherung, Backend, Tracking.


## Echte Inhalte ergänzen

- **Fahrzeugfotos:** Die Vorschau zeigt Symbolbilder von Wikimedia Commons. Auswahl, Bildnachweis und Zuschnitt stehen in `src/data/photos.json` (`fill: true` zeigt sehr breite Fotos ganz, `crop` wählt einen Ausschnitt). `scripts/fetch-photos.mjs` lädt die Fotos beim Build und legt sie unter `public/symbolbilder/` ab; fehlt ein Foto, bricht der Build auf Vercel ab. Mit `node scripts/fetch-photos.mjs --sheet` entsteht ein Kontrollbogen zum Prüfen des Zuschnitts, `scripts/commons-review.mjs` sucht neue Kandidaten. Echte Fotos der Anbieter haben Vorrang: pro Fahrzeug in `src/data/vehicles.ts` `photos: ["/fotos/<slug>/1.jpg", …]` eintragen (Dateien unter `public/fotos/`, Querformat 3:2, Frontansicht schräg von vorne links wie bei den Symbolbildern).
- **Anbieterlogo und Standortbild:** In `src/data/providers.ts` optional `logo` und `locationImage` setzen.
- **«ab»-Preise:** `priceVaries: true` bei Fahrzeugen, deren Tagespreis vom Zeitraum abhängt.
- **Servicegebühr:** `SERVICE_FEE_RATE` in `src/lib/pricing.ts` (aktuell 0, die Zeile erscheint erst bei einem Wert über 0).
- **Versicherung, Selbstbehalt, Kaution, Auszahlung:** Antworten in `src/data/safety.ts` eintragen, sobald sie verbindlich sind. Einträge ohne Antwort werden auf der Sicherheitsseite nicht angezeigt.
- **AGB:** Der Text liegt als Markdown in `src/data/agb.ts` und kann dort ersetzt werden. Die Seite `/agb` erzeugt daraus Inhaltsverzeichnis und Anker (`/agb#ziffer-5`, `/agb#ziffer-5-1`), Platzhalter in eckigen Klammern werden gelb markiert. Auf die AGB verweisen: Einwilligung bei der Registrierung, Bestätigung im letzten Schritt des Inserat-Assistenten (Ziffer 4 und 5), Sicherheitshinweis und letzter Schritt der Buchungsanfrage, Sicherheitsseite und Hilfe. Laut Ziffer 6, 11, 17 und 19 müssen Versicherungsdeckung, Selbstbehalt, Pannenhilfe und Kaution vor der Buchung sichtbar sein – dafür fehlen im Inserat noch eigene Felder.
- **Vorschau-Hinweis:** Balken oben in `src/components/layout/Header.tsx`, kurzer Hinweis im Footer (`Footer.tsx`).
