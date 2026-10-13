import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Archivo } from "next/font/google";
import { VisualEditing } from "next-sanity/visual-editing";
import { Analytics, Clarity, HubSpotTracking } from "@/components/Analytics";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No template. The SEO sheet's titles are complete as written and length
  // checked against 60 characters — appending a suffix pushed several over,
  // and pages already ending in "| Zippily" gained a second one.
  title: "zippily — HubSpot implementation & RevOps",
  description:
    "Auckland-based HubSpot implementation and RevOps agency. HubSpot Platinum Partner.",
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
  const [settings, { isEnabled: isDraftMode }] = await Promise.all([
    sanityFetch(SITE_SETTINGS_QUERY),
    draftMode(),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Auckland-based HubSpot implementation and RevOps agency. HubSpot Platinum Partner serving New Zealand and Australia.",
    address: {
      "@type": "PostalAddress",
      ...(settings?.businessAddress?.streetAddress
        ? { streetAddress: settings.businessAddress.streetAddress }
        : {}),
      ...(settings?.businessAddress?.suburb
        ? { addressRegion: settings.businessAddress.suburb }
        : {}),
      addressLocality: settings?.businessAddress?.city ?? "Auckland",
      ...(settings?.businessAddress?.postcode
        ? { postalCode: settings.businessAddress.postcode }
        : {}),
      addressCountry: "NZ",
    },
    areaServed: ["NZ", "AU"],
    ...(settings?.contactEmail ? { email: settings.contactEmail } : {}),
    // sameAs is how a search engine or model ties this site to the same
    // entity elsewhere. The HubSpot listing is the strongest of these: a
    // third party verifying the partner tier, not a profile we wrote.
    sameAs: [
      settings?.linkedInUrl,
      settings?.instagramUrl,
      settings?.youTubeUrl,
      settings?.hubspotDirectoryUrl,
    ].filter(Boolean),
  };

  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-off-white-tan">
        <JsonLd data={organizationJsonLd} />
        <Analytics
          measurementId={process.env.NEXT_PUBLIC_GA_ID}
          isDraftMode={isDraftMode}
        />
        <Clarity
          projectId={process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}
          isDraftMode={isDraftMode}
        />
        <HubSpotTracking
          portalId={process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}
          region={process.env.NEXT_PUBLIC_HUBSPOT_REGION}
          isDraftMode={isDraftMode}
        />
        {children}
        {/* Bridge the Studio's Presentation tool talks to. Only mounted in
            draft mode, so published pages ship no extra JS. */}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
