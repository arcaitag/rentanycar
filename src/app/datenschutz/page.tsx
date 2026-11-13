import type { Metadata } from "next";
import Link from "next/link";
import { LegalFacts, LegalNote, LegalPage, LegalToc, OperatorAddress } from "@/components/pages/Legal";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Welche Personendaten rentanycar.ch bearbeitet, wozu, an wen sie gehen und welche Rechte du hast.",
  alternates: { canonical: "/datenschutz" },
};

const MAIL = <a href={`mailto:${OPERATOR.privacyEmail}`} className="link">{OPERATOR.privacyEmail}</a>;

/** Ziffern der Datenschutzerklärung – Inhaltsverzeichnis und Sprungmarken (#ziffer-8) entstehen daraus */
const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Verantwortliche Stelle",
    body: (
      <>
        <p>Verantwortlich für die Bearbeitung von Personendaten auf rentanycar.ch ist:</p>
        <OperatorAddress email={OPERATOR.privacyEmail} />
        <p>Bei Fragen zum Datenschutz oder zu deinen Daten erreichst du uns jederzeit unter dieser Adresse.</p>
      </>
    ),
  },
  {
    title: "Geltungsbereich",
    body: (
      <>
        <p>
          Diese Erklärung gilt für die Website rentanycar.ch und alle Funktionen der Plattform: Suche, Benutzerkonto, Inserate, Anfragen und
          Buchungen, Nachrichten, Bewertungen sowie Übergabe und Kilometererfassung.
        </p>
        <p>
          Personendaten sind alle Angaben, die sich auf eine bestimmte oder bestimmbare Person beziehen. «Bearbeiten» meint jeden Umgang damit, etwa
          das Erheben, Speichern, Verwenden, Weitergeben und Löschen.
        </p>
        <p>
          Bearbeiten Anbietende Daten ausserhalb der Plattform selbst, zum Beispiel in einem eigenen Mietvertrag oder gegenüber ihrer Versicherung,
          sind sie dafür selbst verantwortlich.
        </p>
      </>
    ),
  },
  {
    title: "Welche Daten wir bearbeiten",
    body: (
      <>
        <p>Welche Daten anfallen, hängt davon ab, wie du rentanycar.ch nutzt.</p>
        <h3>Konto und Profil</h3>
        <ul>
          <li>Vor- und Nachname, E-Mail-Adresse und Telefonnummer</li>
          <li>Passwort – nur verschlüsselt gespeichert, wir kennen es nicht im Klartext</li>
          <li>Kontoart (privat oder gewerblich), bei Unternehmen Firmenname, Adresse und UID</li>
          <li>Profilbild, Kurzbeschreibung und Einstellungen</li>
          <li>Zeitpunkt der Registrierung und der letzten Anmeldung</li>
        </ul>
        <h3>Führerausweis und Identität</h3>
        <p>
          Wer ein Fahrzeug mietet, bestätigt, einen gültigen Führerausweis für dieses Fahrzeug zu besitzen. Zur Sicherheit der Plattform können wir
          Nachweise zu Identität, Adresse, Fahrzeug oder Führerausweis verlangen (siehe <Link href="/agb" className="link">AGB</Link>). Solche
          Nachweise verwenden wir nur für die Prüfung sowie zur Klärung von Schadenfällen, Bussen oder Missbrauch. Bei der Übergabe dürfen die
          Anbietenden den Führerausweis einsehen.
        </p>
        <h3>Fahrzeuge und Inserate</h3>
        <p>
          Wenn du ein Fahrzeug inserierst, bearbeiten wir deine Angaben dazu: Marke, Modell, Jahrgang, Kategorie, Ausstattung, Fotos und
          Beschreibung, den Standort, die Mietmodelle (Kurzzeit, Langzeit, Auto-Abo) mit Preisen, Mindestdauer, Kilometerregeln, Kaution und
          Zusatzleistungen, Angaben zur Versicherung sowie die Verfügbarkeit. Öffentlich zeigen wir nur die ungefähre Lage, nicht die genaue Adresse.
        </p>
        <h3>Anfragen, Buchungen und Mieten</h3>
        <ul>
          <li>Fahrzeug, Mietmodell und Zeitraum mit Datum und Uhrzeit</li>
          <li>Bei Langzeitmiete und Auto-Abo: Start, Laufzeit, Kilometerpaket und Zusatzleistungen</li>
          <li>Gewählte Kilometer, Preise und Total</li>
          <li>Status der Anfrage oder Buchung (angefragt, bestätigt, abgelehnt, storniert, abgeschlossen) mit Zeitpunkten</li>
          <li>Deine Nachricht an die Anbietenden</li>
        </ul>
        <h3>Übergabe, Kilometer und Zustand</h3>
        <p>
          Bei Abholung und Rückgabe können Kilometerstand, Tankfüllung oder Ladestand, der Zustand des Fahrzeugs und Fotos erfasst werden, etwa vom
          Tacho oder von Schäden. Daraus ergeben sich allfällige Mehrkilometer. Die Angaben dienen beiden Seiten als Beleg und helfen, Schäden zu
          klären.
        </p>
        <h3>Nachrichten und Bewertungen</h3>
        <p>
          Nachrichten, die über rentanycar.ch ausgetauscht werden, speichern wir mit dem Zeitpunkt. Bewertungen nach einer Miete (Sterne und
          Kommentar) erscheinen im Profil beziehungsweise im Inserat.
        </p>
        <h3>Zahlungen</h3>
        <p>
          Derzeit gibt es auf rentanycar.ch keine integrierte Zahlungsabwicklung. Wir bearbeiten deshalb keine Kreditkarten- oder Bankdaten. Führen wir
          Zahlungen ein, ergänzen wir diese Erklärung vorher.
        </p>
        <h3>Kontakt und Support</h3>
        <p>Wenn du uns schreibst, bearbeiten wir Name, E-Mail-Adresse, den Inhalt deiner Nachricht und allfällige Anhänge, um dein Anliegen zu beantworten.</p>
        <h3>Standort</h3>
        <p>
          Wählst du in der Suche «Meinen Standort verwenden», fragt dein Browser um Erlaubnis. Der Standort wird nur in deinem Browser verwendet, um
          den nächstgelegenen Ort vorzuschlagen. Wir speichern ihn nicht und übermitteln ihn nicht. Orte oder Postleitzahlen, die du in der Suche
          eingibst, verwenden wir nur, um passende Fahrzeuge anzuzeigen.
        </p>
        <h3>Technische Daten</h3>
        <p>
          Beim Aufruf der Website fallen technisch bedingt Daten an: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, zuvor besuchte Seite, Browser,
          Betriebssystem und Gerätetyp sowie Fehlermeldungen. Wir brauchen sie, um die Website auszuliefern, sie zu schützen und Fehler zu beheben.
        </p>
      </>
    ),
  },
  {
    title: "Zwecke der Bearbeitung",
    body: (
      <>
        <p>Wir bearbeiten Personendaten, um</p>
        <ul>
          <li>rentanycar.ch bereitzustellen und zu betreiben,</li>
          <li>Benutzerkonten zu verwalten,</li>
          <li>Inserate zu veröffentlichen und durchsuchbar zu machen,</li>
          <li>Anbietende und Mietende zusammenzubringen,</li>
          <li>Anfragen, Buchungen, Übergaben und die Abrechnung von Kilometern zu ermöglichen,</li>
          <li>die Kommunikation zwischen den Beteiligten zu ermöglichen,</li>
          <li>Support zu leisten,</li>
          <li>die Sicherheit zu gewährleisten sowie Missbrauch und Betrug zu verhindern,</li>
          <li>Schadenfälle, Bussen und Streitigkeiten zu klären,</li>
          <li>die Plattform weiterzuentwickeln und</li>
          <li>gesetzliche Pflichten zu erfüllen.</li>
        </ul>
        <p>Für andere Zwecke verwenden wir Personendaten nur, wenn du eingewilligt hast oder wir dich vorher darüber informieren.</p>
      </>
    ),
  },
  {
    title: "Rechtliche Grundlagen",
    body: (
      <>
        <p>
          Wir bearbeiten Personendaten nach den Grundsätzen des Schweizer Datenschutzgesetzes (DSG): rechtmässig, nach Treu und Glauben,
          verhältnismässig und nur für Zwecke, die für dich erkennbar sind.
        </p>
        <p>
          Soweit im Einzelfall die Datenschutz-Grundverordnung der EU (DSGVO) anwendbar ist, stützen wir uns auf die Erfüllung eines Vertrags oder
          vorvertragliche Massnahmen (Art. 6 Abs. 1 lit. b DSGVO), auf rechtliche Pflichten (lit. c), auf unser berechtigtes Interesse an einem
          sicheren und funktionierenden Marktplatz (lit. f) und, wo nötig, auf deine Einwilligung (lit. a).
        </p>
      </>
    ),
  },
  {
    title: "Öffentliche Angaben",
    body: (
      <>
        <p>Einige Angaben sind für andere sichtbar:</p>
        <ul>
          <li>Vorname und Anfangsbuchstabe des Nachnamens, bei Unternehmen der Firmenname</li>
          <li>Profilbild und Kontoart (privat oder gewerblich)</li>
          <li>Bewertungen und seit wann du dabei bist</li>
          <li>Inserate mit Fotos, Beschreibung, Preisen, Konditionen und ungefährem Standort</li>
        </ul>
        <p>E-Mail-Adresse, Telefonnummer und genaue Adresse sind nicht öffentlich.</p>
      </>
    ),
  },
  {
    title: "Weitergabe zwischen Mietenden und Anbietenden",
    body: (
      <>
        <p>Damit eine Miete zustande kommt, erhalten die Beteiligten nur die Angaben, die sie dafür brauchen:</p>
        <ul>
          <li>Mit einer Anfrage sehen die Anbietenden deinen Namen, dein Profil, den gewünschten Zeitraum und deine Nachricht.</li>
          <li>Nach der Bestätigung erhalten beide Seiten die Kontaktangaben für die Übergabe. Mietende erfahren zudem die genaue Abholadresse.</li>
          <li>Bei der Übergabe dürfen die Anbietenden den Führerausweis einsehen und die Angaben für ihren Mietvertrag festhalten.</li>
        </ul>
        <p>
          Bei Schäden, Mehrkilometern oder Verkehrsbussen kann es nötig sein, dass Anbietende als Halterinnen und Halter die Personalien der mietenden
          Person ihrer Versicherung oder einer Behörde bekannt geben, etwa um die Lenkerin oder den Lenker bei einer Busse zu nennen. Auf begründete
          Anfrage stellen wir ihnen dafür die Angaben zur betreffenden Buchung zur Verfügung.
        </p>
        <p>Die Anbietenden dürfen Daten, die sie so erhalten, nur für die Abwicklung der Miete verwenden.</p>
      </>
    ),
  },
  {
    title: "Dienstleister",
    body: (
      <>
        <p>Für den Betrieb setzen wir Dienstleister ein, die Daten in unserem Auftrag und nur nach unseren Weisungen bearbeiten. Aktuell sind das:</p>
        <LegalFacts
          rows={[
            ["Hosting", "Vercel Inc., USA – Auslieferung der Website, Serverfunktionen und Server-Protokolle"],
            ["Datenbank und Konten", "keine – in der Vorschau bleiben diese Daten in deinem Browser"],
            ["E-Mail-Versand", "keiner"],
            ["Karten", "eigene Grafiken, kein Kartendienst von Drittanbietern"],
            ["Schriften", "werden von rentanycar.ch selbst ausgeliefert, keine Verbindung zu Google Fonts"],
            ["Bilder", "Fotos von Wikimedia Commons, von rentanycar.ch selbst ausgeliefert"],
            ["Analyse und Werbung", "keine"],
            ["Zahlungen", "keine"],
          ]}
        />
        <p className="mt-3">
          Kommen Dienstleister hinzu, zum Beispiel für Datenbank, Benutzerkonten, E-Mail-Versand oder Zahlungen, ergänzen wir diese Liste vorher.
        </p>
      </>
    ),
  },
  {
    title: "Bekanntgabe ins Ausland",
    body: (
      <>
        <p>
          Unser Hosting-Anbieter hat seinen Sitz in den USA, und die Website wird über ein weltweites Servernetz ausgeliefert. Daten können deshalb
          auch ausserhalb der Schweiz bearbeitet werden.
        </p>
        <p>
          Für Unternehmen, die unter dem Swiss-U.S. Data Privacy Framework zertifiziert sind, gelten die USA als Staat mit angemessenem Datenschutz.
          Fehlt eine solche Zertifizierung oder bearbeitet ein Dienstleister Daten in einem Staat ohne angemessenen Schutz, sichern wir die
          Bekanntgabe mit Standardvertragsklauseln ab, die vom Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) anerkannt sind,
          oder mit anderen gesetzlich vorgesehenen Garantien.
        </p>
      </>
    ),
  },
  {
    title: "Hosting und Server-Protokolle",
    body: (
      <p>
        Beim Aufruf übermittelt dein Browser die technischen Daten aus Ziffer 3 an die Server unseres Hosting-Anbieters. Sie werden in Protokollen
        gespeichert, damit die Website ausgeliefert, vor Angriffen geschützt und bei Fehlern untersucht werden kann. Wir werten diese Protokolle nicht
        für Werbung aus und bewahren sie nur so lange auf, wie es dafür nötig ist.
      </p>
    ),
  },
  {
    title: "Cookies und Speicher im Browser",
    body: (
      <>
        <p>rentanycar.ch setzt derzeit keine Cookies und verwendet keine Analyse-, Tracking- oder Werbetechnologien.</p>
        <p>
          Die Vorschau speichert Konto, Favoriten, Inserate, Anfragen, Nachrichten, Kilometerangaben und Entwürfe im Speicher deines Browsers
          (localStorage und sessionStorage). Diese Daten verlassen dein Gerät nicht. Du kannst sie jederzeit löschen: im Konto unter «Einstellungen»
          mit «Daten in diesem Browser löschen» oder in den Einstellungen deines Browsers.
        </p>
        <p>
          Im Echtbetrieb können technisch notwendige Cookies hinzukommen, etwa damit du angemeldet bleibst. Optionale Analyse- oder
          Marketingtechnologien setzen wir nur ein, nachdem wir diese Erklärung ergänzt und, wo nötig, deine Einwilligung eingeholt haben.
        </p>
      </>
    ),
  },
  {
    title: "E-Mails und Benachrichtigungen",
    body: (
      <>
        <p>Im Echtbetrieb senden wir Mitteilungen, die direkt mit der Nutzung zusammenhängen, zum Beispiel:</p>
        <ul>
          <li>Bestätigung der Registrierung</li>
          <li>neue Anfragen sowie Bestätigungen, Absagen und Änderungen einer Buchung</li>
          <li>Nachrichten anderer Nutzerinnen und Nutzer</li>
          <li>Erinnerungen zu Übergabe und Rückgabe</li>
          <li>Hinweise zur Sicherheit deines Kontos</li>
        </ul>
        <p>Newsletter oder Werbung erhältst du nur, wenn du zugestimmt hast. Du kannst dich jederzeit wieder abmelden.</p>
      </>
    ),
  },
  {
    title: "Datensicherheit",
    body: (
      <p>
        Wir schützen Personendaten mit angemessenen technischen und organisatorischen Massnahmen, unter anderem mit verschlüsselter Übertragung
        (HTTPS), beschränkten Zugriffsrechten, verschlüsselt gespeicherten Passwörtern und Datensicherungen. Eine vollständig sichere Übertragung im
        Internet kann allerdings niemand garantieren.
      </p>
    ),
  },
  {
    title: "Aufbewahrung",
    body: (
      <>
        <p>Wir bewahren Personendaten nur so lange auf, wie es für den jeweiligen Zweck nötig ist oder das Gesetz es verlangt:</p>
        <ul>
          <li>Kontodaten, solange dein Konto besteht. Danach löschen oder anonymisieren wir sie, soweit wir sie nicht mehr brauchen.</li>
          <li>
            Buchungs-, Übergabe- und Nachrichtendaten, solange nach einer Miete noch Schäden, Mehrkilometer, Verkehrsbussen oder andere Ansprüche
            geltend gemacht werden können. Bussen treffen oft erst Wochen nach der Fahrt ein.
          </li>
          <li>Nachweise zu Identität und Führerausweis nur so lange, wie es für die Prüfung, Schadenfälle oder Missbrauchsabklärungen nötig ist.</li>
          <li>Geschäftsunterlagen wie Rechnungen zehn Jahre, wie es das Obligationenrecht verlangt (Art. 958f OR).</li>
          <li>Server-Protokolle nur kurz, soweit es für Betrieb und Sicherheit nötig ist.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Deine Rechte",
    body: (
      <>
        <p>Im Rahmen des Datenschutzrechts kannst du insbesondere</p>
        <ul>
          <li>Auskunft verlangen, ob und welche Personendaten wir über dich bearbeiten,</li>
          <li>unrichtige Daten berichtigen lassen,</li>
          <li>die Löschung deiner Daten verlangen oder einer Bearbeitung widersprechen,</li>
          <li>deine Daten in einem gängigen elektronischen Format herausverlangen oder übertragen lassen und</li>
          <li>eine Einwilligung jederzeit für die Zukunft widerrufen.</li>
        </ul>
        <p>
          Schreib uns dafür an {MAIL}. Damit niemand unberechtigt Auskunft über dich erhält, können wir einen Nachweis deiner Identität verlangen.
          Gesetzliche Ausnahmen, etwa Aufbewahrungspflichten, bleiben vorbehalten.
        </p>
        <p>
          Du kannst dich ausserdem beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten beschweren:{" "}
          <a href="https://www.edoeb.admin.ch" className="link" rel="noopener">edoeb.admin.ch</a>.
        </p>
      </>
    ),
  },
  {
    title: "Mindestalter",
    body: (
      <p>
        rentanycar.ch richtet sich an Personen, die selbständig Verträge abschliessen können. Wer ein Fahrzeug mietet, braucht zudem einen gültigen
        Führerausweis; Anbietende können ein höheres Mindestalter verlangen. Daten von Kindern bearbeiten wir nicht wissentlich.
      </p>
    ),
  },
  {
    title: "Missbrauch und Behörden",
    body: (
      <p>
        Wir können Personendaten bearbeiten und an Behörden, Versicherungen oder andere berechtigte Stellen weitergeben, wenn dies nötig ist, um
        Missbrauch, Betrug oder Straftaten aufzuklären, Verkehrsdelikte zu klären, Rechtsansprüche durchzusetzen oder abzuwehren, oder wenn wir
        gesetzlich dazu verpflichtet sind.
      </p>
    ),
  },
  {
    title: "Automatisierte Entscheidungen",
    body: (
      <p>
        Wir treffen keine Entscheidungen, die ausschliesslich automatisiert erfolgen und für dich rechtliche Folgen haben oder dich erheblich
        beeinträchtigen. Ob eine Anfrage angenommen wird, entscheiden die Anbietenden. Sollte sich das ändern, informieren wir dich vorher.
      </p>
    ),
  },
  {
    title: "Links zu anderen Websites",
    body: (
      <p>
        Für Websites und Dienste Dritter, auf die wir verlinken, sind deren Betreiber verantwortlich. Bitte beachte dort die jeweiligen
        Datenschutzerklärungen.
      </p>
    ),
  },
  {
    title: "Änderungen",
    body: (
      <p>
        Wir passen diese Erklärung an, wenn sich die Plattform, unsere Datenbearbeitungen oder das Recht ändern. Es gilt die jeweils auf rentanycar.ch
        veröffentlichte Fassung. Über wesentliche Änderungen informieren wir registrierte Nutzerinnen und Nutzer zusätzlich per E-Mail oder auf der
        Plattform.
      </p>
    ),
  },
  {
    title: "Kontakt",
    body: (
      <>
        <p>Fragen, Anliegen oder Begehren zum Datenschutz richtest du an:</p>
        <OperatorAddress email={OPERATOR.privacyEmail} />
        <p>
          Siehe auch <Link href="/agb" className="link">AGB</Link> und <Link href="/impressum" className="link">Impressum</Link>.
        </p>
      </>
    ),
  },
];

export default function DatenschutzPage() {
  const items = SECTIONS.map((s, i) => ({ id: `ziffer-${i + 1}`, title: `${i + 1}. ${s.title}` }));
  return (
    <LegalPage title={"Datenschutz\u00ADerklärung"} updated="30. September 2026">
      <div>
        <p>
          Der Schutz deiner Personendaten ist uns wichtig. Hier erfährst du, welche Daten bei der Nutzung von rentanycar.ch bearbeitet werden, wozu wir
          sie brauchen, an wen sie gehen und welche Rechte du hast. Massgebend ist das Schweizer Datenschutzgesetz (DSG).
        </p>
      </div>
      <LegalNote title="Stand der Vorschau">
        <p>
          rentanycar.ch läuft derzeit als Vorschau mit Beispieldaten. Konto, Favoriten, Inserate, Anfragen, Nachrichten und Kilometerangaben speichert
          die Vorschau nur im Speicher deines Browsers; sie werden nicht an uns übermittelt. Die Ziffern 3 bis 7 und 12 beschreiben, wie wir diese
          Daten im Echtbetrieb bearbeiten. Die dann eingesetzten Dienstleister ergänzen wir vorher in <a href="#ziffer-8" className="link">Ziffer 8</a>.
        </p>
      </LegalNote>
      <LegalToc items={items} />
      {SECTIONS.map((s, i) => (
        <section key={s.title} id={items[i].id} aria-labelledby={`${items[i].id}-titel`} className="scroll-mt-24">
          <h2 id={`${items[i].id}-titel`}>{items[i].title}</h2>
          {s.body}
        </section>
      ))}
    </LegalPage>
  );
}
