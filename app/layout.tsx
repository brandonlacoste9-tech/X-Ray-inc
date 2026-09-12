import type { Metadata } from "next";
import { Barlow_Semi_Condensed, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileActionBar } from "@/components/MobileActionBar";
import { RfqProvider } from "@/lib/rfq/RfqProvider";
import { site } from "@/lib/site";
import "./globals.css";

const display = Barlow_Semi_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.shortName} | ${site.name}`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  metadataBase: new URL("https://www.pnwx.com"),
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    telephone: site.tollFree,
    email: site.email,
    faxNumber: site.fax,
    address: {
      "@type": "PostalAddress",
      postOfficeBoxNumber: "625",
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: "US",
    },
    openingHours: "Mo-Fr 08:00-17:00",
    areaServed: "United States",
  };

  return (
    <html
      lang="en-US"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="surface-clinical flex min-h-full flex-col font-sans text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <RfqProvider>
          <SiteHeader />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <SiteFooter />
          <MobileActionBar />
        </RfqProvider>
      </body>
    </html>
  );
}
