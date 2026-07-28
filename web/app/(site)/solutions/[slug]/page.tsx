import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import {
  PARTNER_INTEGRATION_QUERY,
  PARTNER_INTEGRATION_SLUGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { PortableBody } from "@/components/modules/PortableBody";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(PARTNER_INTEGRATION_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityFetch(PARTNER_INTEGRATION_QUERY, { slug });
  return {
    title: page?.seo?.metaTitle ?? page?.title ?? "Solutions",
    description:
      page?.seo?.metaDescription ?? page?.hero?.subheading ?? undefined,
    alternates: { canonical: `/solutions/${slug}` },
    // Unbuilt pages still hold placeholder copy — noindexed until real
    // wording lands, but their outbound links are real so follow stays true.
    ...(page?.seo?.noIndex || !page?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

// T5 — partner integration page (Aircall), derived from the module library.
export default async function PartnerIntegrationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await sanityFetch(PARTNER_INTEGRATION_QUERY, { slug });
  if (!page) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/solutions/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  return (
    <>
      {/* Hero — dark breadcrumb (H1c) */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-32 text-center sm:px-6">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/solutions" className="text-sky-blue hover:underline">
              Solutions
            </Link>{" "}
            › <span className="text-white/80">{page.title}</span>
          </nav>
          <h1 className="mt-5 text-h1-mobile md:text-h1">
            <EmphasisedHeading
              heading={page.hero?.heading ?? page.title ?? ""}
              phrase={page.hero?.emphasisPhrase}
              markerStyle={page.hero?.markerStyle}
              color="deep-orange"
            />
          </h1>
          {page.hero?.subheading && (
            <p className="mx-auto mt-6 max-w-xl text-body-lg text-white/70">
              {page.hero.subheading}
            </p>
          )}
          {page.hero?.primaryCta?.href && (
            <ButtonLink
              href={page.hero.primaryCta.href}
              variant="orange"
              className="mt-8"
            >
              {page.hero.primaryCta.label}
            </ButtonLink>
          )}
        </div>
      </section>

      {/* What the tool does */}
      {page.whatItDoes && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
            <PortableBody value={page.whatItDoes} />
          </div>
        </section>
      )}

      {/* What Zippily sets up */}
      {(page.whatWeSetUp?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-h2">What Zippily sets up</h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {page.whatWeSetUp?.map((card) => (
                <div
                  key={card._key}
                  className="rounded-xl bg-off-white-tan p-7"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-deep-blue">
                    <Icon name={card.icon} className="h-5 w-5 text-sky-blue" />
                  </span>
                  <h3 className="mt-4 text-h4">{card.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ (M26) */}
      <FaqAccordion
        heading="Frequently asked questions"
        faqs={page.faqs}
        name={`partner-faq-${slug}`}
      />

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
