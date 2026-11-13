import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/konto", "/login", "/registrieren", "/auto-vermieten/erfassen"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
