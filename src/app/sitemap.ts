import type { MetadataRoute } from "next";
import { VEHICLES } from "@/data/vehicles";
import { PROVIDERS } from "@/data/providers";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = ["", "/autos", "/von-privat", "/von-gewerbe", "/auto-vermieten", "/so-funktionierts", "/sicherheit", "/hilfe", "/agb", "/impressum", "/datenschutz", "/bildnachweis"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...VEHICLES.map((v) => ({ url: `${base}/autos/${v.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
    ...PROVIDERS.map((p) => ({ url: `${base}/anbieter/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
