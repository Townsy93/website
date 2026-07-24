import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "zippily — HubSpot implementation & RevOps",
  description:
    "Auckland-based HubSpot implementation and RevOps agency. HubSpot Gold Partner.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);
  return (
    <html lang="en" className={`${archivo.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-off-white-tan">
        <Header />
        <main className="-mt-17 flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
