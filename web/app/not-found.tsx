import type { Metadata } from "next";
import Link from "next/link";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page not found | Zippily",
  // A 404 has nothing worth indexing, and letting it in wastes crawl budget
  // on URLs that will never rank. follow stays on so the links out are still
  // discovered.
  robots: { index: false, follow: true },
};

/**
 * The 404.
 *
 * Lives at the app root rather than inside the (site) group, because a URL
 * matching no route at all never reaches a group layout — so this renders the
 * nav and footer itself. Without them a 404 is a dead end, which is the whole
 * problem with most of them.
 *
 * Next returns a real HTTP 404 for this automatically. A soft 404 — a "not
 * found" page served with a 200 — keeps the URL indexed and is worse than
 * useless.
 */
export default async function NotFound() {
  const settings = await client.fetch(SITE_SETTINGS_QUERY);

  const destinations = [
    {
      href: "/services",
      label: "Services",
      text: "Everything we do, from audits to full implementations.",
    },
    {
      href: "/services/crm-implementation",
      label: "CRM implementation",
      text: "HubSpot set up properly the first time.",
    },
    {
      href: "/our-work",
      label: "Our work",
      text: "Real projects for New Zealand and Australian clients.",
    },
    {
      href: "/contact",
      label: "Talk to us",
      text: "A free 30-minute chat with a consultant, not a salesperson.",
    },
  ];

  return (
    <>
      <Header />
      <main className="-mt-17 flex-1">
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-3xl px-4 pb-20 pt-40 text-center sm:px-6">
            <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
              404
            </p>
            <h1 className="mt-4 text-h1-mobile md:text-h1">
              That page isn&apos;t here.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">
              It may have moved, or the link might be wrong. Here&apos;s where
              most people are heading.
            </p>
          </div>
        </section>

        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {destinations.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-deep-blue-20 bg-white p-7 transition hover:-translate-y-0.5 hover:border-deep-blue hover:shadow-lg"
                >
                  <p className="text-h4 text-deep-blue">{item.label}</p>
                  <p className="mt-2 text-body text-deep-blue-80">{item.text}</p>
                </Link>
              ))}
            </div>

            <p className="mt-10 text-center text-body text-deep-blue-80">
              Looking for something we&apos;ve written?{" "}
              <Link
                href="/insights"
                className="font-semibold text-deep-blue underline decoration-sky-blue decoration-2 underline-offset-4"
              >
                Browse the Insight Hub
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
