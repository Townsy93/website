import { sanityFetch } from "@/sanity/fetch";
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
 *
 * Fetched through sanityFetch rather than the bare client so both queries
 * carry cache tags. Without them a publish could never purge the layout: the
 * popup would not appear and a settings change would not reach the footer,
 * with the revalidate webhook reporting success either way.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, popup] = await Promise.all([
    sanityFetch(SITE_SETTINGS_QUERY),
    sanityFetch(POPUP_QUERY),
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
