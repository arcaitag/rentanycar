import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "rentanycar.ch",
    short_name: "rentanycar",
    description: "Autos von Privatpersonen und gewerblichen Anbietern in der Schweiz mieten oder vermieten.",
    lang: "de-CH",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FFF9",
    theme_color: "#174B38",
    icons: [{ src: "/brand/rentanycar-app-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
