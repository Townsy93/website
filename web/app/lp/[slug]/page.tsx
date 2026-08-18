import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import {
  LANDING_PAGE_QUERY,
  LANDING_PAGE_SLUGS_QUERY,
} from "@/sanity/queries";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { LandingForm } from "@/components/modules/LandingForm";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(LANDING_PAGE_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityFetch(LANDING_PAGE_QUERY, { slug });
  return {
    title: page?.seo?.metaTitle ?? page?.hero?.heading ?? "Zippily",
    description: page?.seo?.metaDescription ?? page?.hero?.subheading ?? undefined,
    alternates: { canonical: `/lp/${slug}` },
    // Unbuilt pages hold placeholder copy. follow stays true — the links out
    // are real, only the wording is not.
    ...(page?.seo?.noIndex || !page?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

/**
 * T14 — campaign landing page.
 *
 * No nav, by design. A landing page exists to do one thing, and a nav bar is
 * an invitation to do something else. The logo is not even a link home: the
 * only routes out are the form and the footer's legal links.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await sanityFetch(LANDING_PAGE_QUERY, { slug });
  if (!page) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/lp/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  const valueProps = page.valueProps ?? [];

  return (
    <div className="flex min-h-full flex-col">
      {/* Slim header — logo and the Platinum Partner pill, nothing clickable
          except the form below. */}
      <header className="bg-deep-blue">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <Image
            src="/logo-white.png"
            alt="Zippily"
            width={124}
            height={30}
            priority
          />
          <span className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
            HubSpot Platinum Partner
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero and form together — the form is above the fold on desktop,
            because a landing page that makes you scroll to convert is a
            landing page that does not convert. */}
        <section className="bg-deep-blue text-white">
          <div className="mx-auto grid max-w-5xl gap-12 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <h1 className="text-h1-mobile md:text-h1">
                <EmphasisedHeading
                  heading={page.hero?.heading ?? ""}
                  phrase={page.hero?.emphasisPhrase}
                  markerStyle={page.hero?.markerStyle}
                  color="deep-orange"
                />
              </h1>
              {page.hero?.subheading && (
                <p className="mt-6 max-w-xl text-body-lg text-white/75">
                  {page.hero.subheading}
                </p>
              )}

              {valueProps.length > 0 && (
                <ul className="mt-10 flex flex-col gap-5">
                  {valueProps.map((item) => (
                    <li key={item._key} className="flex gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Icon name={item.icon} className="h-5 w-5 text-sky-blue" />
                      </span>
                      <div>
                        <p className="text-body font-semibold">{item.title}</p>
                        {item.text && (
                          <p className="mt-1 text-body text-white/70">{item.text}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:pt-2">
              <LandingForm
                heading={page.formHeading}
                body={page.formBody}
                campaign={page.campaignName ?? page.title ?? slug}
                successHeading={page.successHeading}
                successBody={page.successBody}
              />
            </div>
          </div>
        </section>

        {/* Proof. Dropped entirely when there is nothing to show, rather than
            rendering an empty band. */}
        {(page.proofStat?.value || page.testimonial) && (
          <section className="bg-off-white-tan">
            <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
              {page.proofStat?.value && (
                <>
                  <p className="text-h1 text-deep-blue">{page.proofStat.value}</p>
                  {page.proofStat.label && (
                    <p className="mx-auto mt-3 max-w-md text-body-lg text-deep-blue-80">
                      {page.proofStat.label}
                    </p>
                  )}
                </>
              )}
              {page.testimonial?.quote && (
                <figure className={page.proofStat?.value ? "mt-12" : ""}>
                  <blockquote className="mx-auto max-w-2xl text-h4 text-deep-blue">
                    &ldquo;{page.testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-body text-deep-blue-80">
                    {page.testimonial.name}
                    {page.testimonial.company && ` · ${page.testimonial.company}`}
                  </figcaption>
                </figure>
              )}
            </div>
          </section>
        )}

        <FaqAccordion heading="Questions" faqs={page.faqs} name="lp-faqs" />
      </main>

      {/* Slim footer (M2b) — legal only. No navigation back into the site. */}
      <footer className="bg-deep-blue text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 sm:px-6">
          <p className="text-caption text-white/60">
            © {new Date().getFullYear()} zippily ltd · Auckland, New Zealand
          </p>
          <Link
            href="/privacy-policy"
            className="text-caption text-sky-blue hover:underline"
          >
            Privacy policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
