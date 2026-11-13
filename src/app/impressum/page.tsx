import type { Metadata } from "next";
import Link from "next/link";
import { LegalFacts, LegalNote, LegalPage, OperatorAddress } from "@/components/pages/Legal";
import { OPERATOR } from "@/lib/operator";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Angaben zur Betreiberin von rentanycar.ch: ${OPERATOR.name}, ${OPERATOR.city}.`,
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <section aria-labelledby="betreiberin">
        <h2 id="betreiberin">Betreiberin der Plattform</h2>
        <OperatorAddress phone />
        <p>
          Web: <Link href="/" className="link">rentanycar.ch</Link>
        </p>
      </section>

      <section aria-labelledby="unternehmen">
        <h2 id="unternehmen">Unternehmensangaben</h2>
        <LegalFacts
          rows={[
            ["Rechtsform", OPERATOR.legalForm],
            ["Sitz", OPERATOR.seat],
            ["UID", OPERATOR.uid],
            ["MWST-Nr.", OPERATOR.vat],
            ["Handelsregister-Nr.", OPERATOR.registerNo],
          ]}
        />
        <p className="mt-3">Eingetragen im {OPERATOR.register}.</p>
      </section>

      <section aria-labelledby="verantwortlich">
        <h2 id="verantwortlich">Verantwortlich für den Inhalt</h2>
        <OperatorAddress />
      </section>

      <section aria-labelledby="plattform">
        <h2 id="plattform">Über die Plattform</h2>
        <p>
          rentanycar.ch (RentAnyCar) ist ein Online-Marktplatz der {OPERATOR.name}. Privatpersonen und Unternehmen bieten darauf Fahrzeuge zur
          Miete an – für einige Tage, für mehrere Monate oder im Auto-Abo. Mietende können diese Angebote suchen, vergleichen und anfragen.
        </p>
        <p>
          Die {OPERATOR.name} stellt die technische Plattform bereit und bringt die Beteiligten zusammen. Sie ist weder Halterin noch Vermieterin der
          angebotenen Fahrzeuge. Der Mietvertrag kommt direkt zwischen der anbietenden und der mietenden Person zustande, sofern im Einzelfall nicht
          ausdrücklich etwas anderes angegeben ist. Versichert sind die Fahrzeuge über die Versicherung der Anbietenden. Einzelheiten regeln die{" "}
          <Link href="/agb" className="link">AGB</Link>.
        </p>
      </section>

      <LegalNote title="Hinweis zur Vorschau">
        <p>
          rentanycar.ch befindet sich im Aufbau. Die angezeigten Fahrzeuge, Personen, Unternehmen, Preise und Bewertungen sind Beispiele. Über die
          Vorschau kommen keine Mietverträge, Buchungen oder Zahlungen zustande.
        </p>
      </LegalNote>

      <section aria-labelledby="haftung">
        <h2 id="haftung">Haftung für Inhalte</h2>
        <p>
          Wir stellen die Inhalte dieser Website sorgfältig zusammen und halten sie so aktuell wie möglich. Für Richtigkeit, Vollständigkeit und
          Aktualität können wir trotzdem keine Gewähr übernehmen.
        </p>
        <p>
          Angaben in Inseraten – etwa zu Fahrzeug, Ausstattung, Verfügbarkeit, Preisen, Kilometern, Kaution, Versicherung oder Standort – stammen
          von den jeweiligen Anbietenden. Für diese Inhalte sind die Anbietenden selbst verantwortlich. Die {OPERATOR.name} prüft sie nicht im
          Einzelnen.
        </p>
        <p>
          Soweit gesetzlich zulässig, haftet die {OPERATOR.name} nicht für Schäden, die aus dem Zugriff auf diese Website oder der Nutzung der
          veröffentlichten Informationen entstehen. Für die Nutzung der Plattform und für Mietverhältnisse gelten die AGB.
        </p>
      </section>

      <section aria-labelledby="links">
        <h2 id="links">Links zu anderen Websites</h2>
        <p>
          Diese Website verweist teilweise auf Websites und Dienste Dritter. Deren Inhalte und Datenbearbeitungen liegen ausserhalb unseres Einflusses;
          verantwortlich sind die jeweiligen Betreiber.
        </p>
        <p>
          Beim Setzen eines Links prüfen wir, ob offensichtliche Rechtsverstösse erkennbar sind. Eine laufende Kontrolle der verlinkten Seiten ist ohne
          konkreten Anlass nicht möglich. Erfahren wir von einem Rechtsverstoss, entfernen wir den Link.
        </p>
      </section>

      <section aria-labelledby="urheberrecht">
        <h2 id="urheberrecht">Urheberrechte und Marken</h2>
        <p>
          Texte, Gestaltung, Logo, Illustrationen und die übrigen Bestandteile von rentanycar.ch sind urheberrechtlich oder durch andere Rechte
          geschützt. Wer sie über das gesetzlich Erlaubte hinaus verwenden, vervielfältigen oder bearbeiten möchte, braucht die vorherige schriftliche
          Zustimmung der Rechteinhaber.
        </p>
        <p>
          Inhalte, die Nutzende hochladen, etwa Fotos und Beschreibungen in Inseraten, bleiben in deren Verantwortung. Die Fotos der
          Beispielfahrzeuge stammen von Wikimedia Commons; Urheberinnen, Urheber und Lizenzen stehen im{" "}
          <Link href="/bildnachweis" className="link">Bildnachweis</Link>. Die Schriften Manrope und Bricolage Grotesque sowie die Icons von Lucide
          stehen unter freien Lizenzen.
        </p>
      </section>

      <section aria-labelledby="datenschutz">
        <h2 id="datenschutz">Datenschutz</h2>
        <p>
          Wie wir Personendaten bearbeiten und welche Rechte du hast, steht in der{" "}
          <Link href="/datenschutz" className="link">Datenschutzerklärung</Link>.
        </p>
      </section>

      <section aria-labelledby="agb">
        <h2 id="agb">Allgemeine Geschäftsbedingungen</h2>
        <p>
          Für die Nutzung von rentanycar.ch gelten die <Link href="/agb" className="link">Allgemeinen Geschäftsbedingungen (AGB)</Link>.
        </p>
      </section>

      <section aria-labelledby="kontakt">
        <h2 id="kontakt">Kontakt</h2>
        <p>Fragen zur Plattform oder zu diesen Angaben beantworten wir gerne:</p>
        <OperatorAddress phone />
      </section>
    </LegalPage>
  );
}
