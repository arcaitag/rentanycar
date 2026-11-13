import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileTabBar from "@/components/layout/MobileTabBar";
import RevealObserver from "@/components/layout/RevealObserver";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SITE_DESCRIPTION, SITE_NAME, indexable, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "rentanycar.ch | Autos von Privatpersonen und Unternehmen mieten", template: "%s | rentanycar.ch" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", locale: "de_CH", siteName: SITE_NAME, url: "/" },
  twitter: { card: "summary_large_image" },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, address: false },
};

export const viewport: Viewport = { themeColor: "#F7F9F8", width: "device-width", initialScale: 1, viewportFit: "cover" };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: siteUrl(),
      inLanguage: "de-CH",
      potentialAction: { "@type": "SearchAction", target: `${siteUrl()}/autos?ort={search_term_string}`, "query-input": "required name=search_term_string" },
    },
    { "@type": "Organization", name: SITE_NAME, url: siteUrl(), logo: `${siteUrl()}/brand/rentanycar-app-icon.svg` },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col pb-[calc(4.4rem+env(safe-area-inset-bottom))] md:pb-0">
        <a href="#inhalt" className="sr-only z-50 rounded-full bg-forest px-4 py-2 font-bold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Zum Inhalt springen
        </a>
        <Providers>
          <SiteChrome>
            <Header />
          </SiteChrome>
          <main id="inhalt" className="flex-1">
            {children}
          </main>
          <SiteChrome>
            <Footer />
            <MobileTabBar />
          </SiteChrome>
          <RevealObserver />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
