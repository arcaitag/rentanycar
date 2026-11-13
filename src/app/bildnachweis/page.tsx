import type { Metadata } from "next";
import { VEHICLES, vehicleTitle } from "@/data/vehicles";
import { photoOf } from "@/data/photos";
import { LegalPage } from "@/components/pages/Legal";

export const metadata: Metadata = { title: "Bildnachweis", alternates: { canonical: "/bildnachweis" } };

const link = "font-semibold text-leaf-700 underline decoration-leaf-300 decoration-2 underline-offset-4 hover:text-forest";

export default function BildnachweisPage() {
  const list = VEHICLES.flatMap((v) => {
    const p = photoOf(v.slug);
    return p ? [{ v, p }] : [];
  });
  return (
    <LegalPage title="Bildnachweis">
      <section>
        <h2>Fahrzeugfotos</h2>
        <p>
          Die Fahrzeugfotos in dieser Vorschau sind Symbolbilder von Wikimedia Commons. Sie zeigen das jeweilige Modell, nicht das
          angebotene Auto. Die Fotos wurden zugeschnitten und verkleinert und stehen unter der jeweils genannten Lizenz.
        </p>
        <ul>
          {list.map(({ v, p }) => (
            <li key={v.slug}>
              <strong>{vehicleTitle(v)}</strong>: Foto von {p.author}, Lizenz{" "}
              {p.licenseUrl ? <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer" className={link}>{p.license}</a> : p.license}, Quelle:{" "}
              <a href={p.source} target="_blank" rel="noopener noreferrer" className={link}>Wikimedia Commons</a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Illustrationen und Logo</h2>
        <p>Illustrationen, Karten, Symbole und das Logo von rentanycar.ch sind eigene Werke.</p>
      </section>
    </LegalPage>
  );
}
