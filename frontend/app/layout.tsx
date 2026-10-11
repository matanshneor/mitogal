import type { Metadata, Viewport } from "next";
import { Assistant, Fredoka } from "next/font/google";
import Analytics from "@/components/layout/Analytics";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SkipLink from "@/components/layout/SkipLink";
import WhatsAppFab from "@/components/layout/WhatsAppFab";
import { site } from "@/lib/site.config";
import "./globals.css";

/*
 * Two voices. Fredoka's rounded terminals echo the balloons and die-cut
 * corners Gal actually works with; Assistant stays for body copy because it
 * is the most readable Hebrew text face at small sizes.
 *
 * Both are self-hosted by next/font — no render-blocking request to Google at
 * runtime and no layout shift when they load.
 */
const fredoka = Fredoka({
  subsets: ["hebrew", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-assistant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "מיתוג לאירועים",
    "עיצוב אירועים",
    "שילוט לחתונה",
    "מתנות ממותגות",
    "הצעת נישואין",
    "יום הולדת",
    "אירועי קונספט",
    "מיתוגל",
  ],
  authors: [{ name: site.owner }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: site.url,
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF8",
  width: "device-width",
  initialScale: 1,
};

/** Helps Google surface the business, its phone number and its Instagram. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  alternateName: site.nameLatin,
  description: site.description,
  url: site.url,
  telephone: `+${site.phoneIntl}`,
  founder: { "@type": "Person", name: site.owner },
  foundingDate: String(site.foundedYear),
  sameAs: [site.instagram],
  areaServed: { "@type": "Country", name: "IL" },
  knowsLanguage: "he",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${fredoka.variable} ${assistant.variable}`}
    >
      <head>
        {/* Scroll reveals ship as opacity:0 and are animated in by Framer
            Motion. Without JavaScript that animation never runs, so force
            every revealed block visible rather than leaving blank sections. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFab />
        <Analytics />
      </body>
    </html>
  );
}
