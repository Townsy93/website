import { client } from "@/sanity/client";
import { POPUP_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Popup } from "@/components/Popup";

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
  const [settings, popup] = await Promise.all([
    client.fetch(SITE_SETTINGS_QUERY),
    client.fetch(POPUP_QUERY),
  ]);
  return (
    <>
      <Header />
      <main className="-mt-17 flex-1">{children}</main>
      <Footer settings={settings} />
      <Popup popup={popup} />
    </>
  );
}
