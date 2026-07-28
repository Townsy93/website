import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Chrome for the main site.
 *
 * Landing pages sit outside this group deliberately: they suppress the nav
 * entirely so the only thing a visitor can do is convert or leave. Keeping
 * that split in the routing rather than in a conditional means a landing
 * page cannot accidentally inherit a nav bar.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);
  return (
    <>
      <Header />
      <main className="-mt-17 flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}
