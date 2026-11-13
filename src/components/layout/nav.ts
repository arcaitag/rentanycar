/** Hauptmenü, gruppiert für das Hamburger-Menü. «Anmelden» und «Konto erstellen» stehen als Schaltflächen daneben. */
export const NAV_GROUPS = [
  { title: "Mieten", items: [{ href: "/autos", label: "Auto finden" }] },
  { title: "Vermieten", items: [{ href: "/auto-vermieten", label: "Auto vermieten" }] },
  {
    title: "Infos und Hilfe",
    items: [
      { href: "/so-funktionierts", label: "So funktioniert’s" },
      { href: "/sicherheit", label: "Sicherheit" },
      { href: "/hilfe", label: "Hilfe" },
    ],
  },
];

export const NAV = NAV_GROUPS.flatMap((g) => g.items);
