export interface Faq {
  q: string;
  a: string;
}

/** Die vier zentralen Fragen auf der Startseite. Alle weiteren stehen in der Hilfe. */
export const HOME_FAQ: Faq[] = [
  { q: "Wie funktioniert die Fahrzeugmiete?", a: "Du suchst nach Ort und Zeitraum, vergleichst die Autos und siehst den Preis. Dann sendest du eine Anfrage. Sobald die vermietende Person oder das Unternehmen bestätigt, vereinbart ihr die Übergabe – persönlich oder kontaktlos, je nach Inserat." },
  { q: "Wie sind Mieter und Vermieter abgesichert?", a: "Jedes Inserat zeigt, wer vermietet und welche Regeln gelten. Eine Anfrage ist unverbindlich, bis die vermietende Seite sie bestätigt. Der Mietvertrag kommt direkt zwischen dir und der vermietenden Seite zustande. Versichert ist das Auto über deren Fahrzeugversicherung, rentanycar.ch stellt keine eigene Versicherung bereit. Deckung, Selbstbehalt und Kaution siehst du vor jeder Buchung. Mehr dazu findest du unter «Sicherheit» und in den AGB." },
  { q: "Welche Kosten entstehen?", a: "Den Preis bestimmt die vermietende Seite. Bei einer Kurzzeitmiete siehst du vor der Anfrage das Total für deinen Zeitraum, bei Langzeitmiete und Auto-Abo den Preis pro Monat und eine allfällige einmalige Startgebühr. Weitere Gebühren und eine Kaution werden vor der verbindlichen Buchung ausgewiesen. Das Inserieren eines Autos ist kostenlos." },
  { q: "Wie kann ich mein Auto vermieten?", a: "Wähle «Auto vermieten» und erfasse dein Auto in fünf Schritten: Fahrzeug, Standort, Ausstattung, Preis und Verfügbarkeit sowie Fotos. Preis und Verfügbarkeit bestimmst du selbst, und du entscheidest über jede Anfrage." },
];

export const RENT_FAQ: Faq[] = [
  { q: "Was kostet das Inserieren?", a: "Das Inserieren ist kostenlos. Allfällige Gebühren für eine Vermietung siehst du, bevor du dein Inserat veröffentlichst." },
  { q: "Wie ist mein Auto während der Miete versichert?", a: "Über deine eigene Motorfahrzeugversicherung, rentanycar.ch stellt keine Versicherung bereit. Kläre vor der ersten Vermietung, ob deine Versicherung die entgeltliche Vermietung an Dritte deckt. Eine Versicherung für die private Nutzung reicht möglicherweise nicht aus. Im Zweifel brauchst du eine schriftliche Bestätigung deiner Versicherung. Einzelheiten stehen in den AGB unter Ziffer 4 und 5." },
  { q: "Wie lege ich die Kilometer fest?", a: "Im Inserat unter «Kilometer»: inklusive Kilometer pro Tag, Preis pro zusätzlichem Kilometer und auf Wunsch ein höherer Preis bei Überschreitung, ein Unlimited-Paket oder ein Maximum pro Buchung. Zusatzkilometer buchen Mietende direkt mit der Anfrage. rentanycar.ch rechnet, dokumentiert die Kilometerstände bei Übergabe und Rückgabe und berechnet allfällige Mehrkilometer." },
  { q: "Muss ich jede Anfrage annehmen?", a: "Nein. Du siehst Profil und Bewertungen der mietenden Person und entscheidest selbst, ob du eine Anfrage annimmst." },
  { q: "Brauche ich als Unternehmen eine UID-Nummer?", a: "Ja. Für ein Unternehmenskonto brauchst du die UID-Nummer. Bei der Registrierung prüfen wir Format und Prüfziffer." },
];

const RENT_MORE: Faq[] = [
  { q: "Wer darf ein Auto mieten?", a: "Du brauchst einen gültigen Führerausweis und musst das Mindestalter erfüllen, das im Inserat steht – meist zwischen 21 und 25 Jahren. Die Voraussetzungen findest du im Inserat unter «Regeln des Anbieters»." },
  { q: "Was ist der Unterschied zwischen privaten und gewerblichen Anbietern?", a: "Es geht darum, wer das Auto vermietet – nicht darum, wofür du es nutzt. Private Anbieter vermieten ihr eigenes Auto gelegentlich. Gewerbliche Anbieter sind Autovermietungen, Garagen oder andere Unternehmen mit eigener Flotte, oft mit festen Öffnungszeiten. Jedes Inserat ist entsprechend gekennzeichnet." },
  { q: "Wie läuft die Übergabe ab?", a: "Je nach Inserat persönlich oder kontaktlos, zum Beispiel über eine Schlüsselbox. Haltet bei der Übergabe Zustand und Tankfüllung mit Fotos fest. Den Kilometerstand erfasst ihr bei Übergabe und Rückgabe im Konto unter «Buchungen», zusammen mit einem Foto des Tachos. So ist später klar, in welchem Zustand das Auto übergeben wurde und wie viele Kilometer gefahren wurden." },
  { q: "Was passiert, wenn ich mehr Kilometer brauche?", a: "Im Inserat steht, wie viele Kilometer pro Tag inklusive sind. Bei der Anfrage kannst du Zusatzkilometer dazubuchen oder, falls angeboten, unbegrenzte Kilometer wählen – der Preis erscheint sofort im Total. Bis zum Mietende kannst du im Konto unter «Buchungen» Kilometer nachbuchen. Fährst du mehr als gebucht, werden die Mehrkilometer nach der Rückgabe anhand der Kilometerstände zum Preis im Inserat berechnet." },
  { q: "Was passiert, wenn ich mich verspäte?", a: "Melde dich so früh wie möglich über die Nachrichten bei der vermietenden Seite. Es gelten die Regeln im Inserat." },
  { q: "Kann ich eine Buchung stornieren?", a: "Die Stornobedingungen siehst du vor jeder verbindlichen Buchung." },
];

const HOST_MORE: Faq[] = [
  { q: "Können Unternehmen mehrere Autos anbieten?", a: "Ja. Gewerbliche Anbieter verwalten ihre Flotte in einem eigenen Bereich: mehrere Standorte, Fahrzeuge duplizieren oder pausieren, Preise und Verfügbarkeit pro Fahrzeug." },
];

export const HELP_TOPICS: { id: string; title: string; items: Faq[] }[] = [
  { id: "mieten", title: "Mieten", items: [HOME_FAQ[0], ...RENT_MORE, HOME_FAQ[2]] },
  { id: "vermieten", title: "Vermieten", items: [HOME_FAQ[3], ...RENT_FAQ, ...HOST_MORE] },
  {
    id: "konto",
    title: "Konto und Sicherheit",
    items: [
      HOME_FAQ[1],
      { q: "Kann ich mit einem Konto mieten und vermieten?", a: "Ja. Mit demselben Konto kannst du Autos mieten und dein eigenes Auto vermieten." },
      { q: "Wo werden meine Daten gespeichert?", a: "In dieser Vorschau bleiben deine Eingaben nur in deinem Browser. Unter «Konto › Einstellungen» kannst du sie jederzeit löschen." },
    ],
  },
  {
    id: "zahlung",
    title: "Preise und Zahlung",
    items: [
      { q: "Muss ich eine Kaution hinterlegen?", a: "Ob eine Kaution anfällt und wie hoch sie ist, siehst du vor der verbindlichen Buchung." },
      { q: "Warum steht bei manchen Autos «ab»?", a: "Bei diesen Autos hängt der Preis von deiner Wahl ab: der Tagespreis vom Zeitraum, der Monatspreis von Mietdauer, Kilometerpaket oder Zusatzleistungen. Sobald du gewählt hast, siehst du den genauen Preis – bei Kurzzeitmieten als Total, bei Langzeitmiete und Auto-Abo pro Monat." },
    ],
  },
];
