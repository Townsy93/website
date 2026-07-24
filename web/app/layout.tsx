import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "zippily — HubSpot implementation & RevOps",
    template: "%s — zippily",
  },
  description:
    "Auckland-based HubSpot implementation and RevOps agency. HubSpot Gold Partner.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NZ",
    url: SITE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Auckland-based HubSpot implementation and RevOps agency. HubSpot Gold Partner serving New Zealand and Australia.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Auckland",
      addressCountry: "NZ",
    },
    areaServed: ["NZ", "AU"],
    ...(settings?.contactEmail ? { email: settings.contactEmail } : {}),
    sameAs: [settings?.linkedInUrl, settings?.youTubeUrl].filter(Boolean),
  };

  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-off-white-tan">
        <JsonLd data={organizationJsonLd} />
        <Header />
        <main className="-mt-17 flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
