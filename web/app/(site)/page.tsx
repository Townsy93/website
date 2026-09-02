import type { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";
import {
  HOME_PAGE_QUERY,
  LATEST_POSTS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading, Marker } from "@/components/ui/Marker";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { HeroVideo } from "@/components/modules/HeroVideo";
import { LogoTicker } from "@/components/modules/LogoTicker";
import { FaqAccordion } from "@/components/modules/FaqAccordion";
import { NewsletterBand } from "@/components/modules/NewsletterBand";
import { StatsBand } from "@/components/modules/StatsBand";
import { ValuesBand } from "@/components/modules/ValuesBand";
import { TestimonialCards } from "@/components/modules/TestimonialCards";

export const revalidate = 3600;

// The three service stages, from the v2 design. Copy is designer-final and
// mirrors the locked service catalogue (11 services), so it changes when the
// catalogue changes — which is a code change anyway. Move to Sanity only if
// the stages themselves become editable content.
const SERVICE_STAGES = [
  {
    title: "Discover",
    icon: "zl-stage-discover",
    text: "Not sure what you need? Figure it out with HubSpot audits, customer journey mapping, and marketing automation strategy.",
  },
  {
    title: "Build",
    icon: "zl-stage-build",
    text: "Get the platforms and tools to support your strategy, with CRM implementation, websites, landing pages, post-sales, and automation.",
  },
  {
    title: "Scale",
    icon: "zl-stage-scale",
    text: "Need a bit of extra support as you grow? We're here with RevOps retainers, AI solutions, and HubSpot training.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(HOME_PAGE_QUERY);
  return {
    title:
      page?.seo?.metaTitle ?? "zippily — HubSpot implementation & RevOps",
    description:
      page?.seo?.metaDescription ??
      "Auckland-based HubSpot implementation and RevOps agency. HubSpot Platinum Partner.",
    alternates: { canonical: "/" },
  };
}

export default async function Home() {
  const [page, posts, settings] = await Promise.all([
    sanityFetch(HOME_PAGE_QUERY),
    sanityFetch(LATEST_POSTS_QUERY),
    sanityFetch(SITE_SETTINGS_QUERY),
  ]);

  if (!page) {
    return (
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">Home page content not found in Sanity.</p>
      </section>
    );
  }

  const trustStats = [
    { value: settings?.googleReviewCount, label: "5-star Google reviews" },
    {
      value: settings?.hubspotReviewCount,
      label: "5-star HubSpot Directory reviews",
    },
    { value: settings?.happyClients, label: "Happy clients" },
  ];

  return (
    <>
      {/* Hero — dark split (H1b). Unchanged in the v2 pass: the orange marker
          circle on the emphasis phrase is correct. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-6 pb-10 pt-24 sm:pb-16 sm:pt-32 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {page.hero?.eyebrow && (
              <p className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
                {page.hero.eyebrow}
              </p>
            )}
            <h1 className="text-pretty mt-6 text-h1-mobile md:text-h1">
              <EmphasisedHeading
                heading={page.hero?.heading ?? ""}
                phrase={page.hero?.emphasisPhrase}
                markerStyle={page.hero?.markerStyle}
                color="deep-orange"
              />
            </h1>
            {page.hero?.subheading && (
              <p className="mt-6 max-w-xl text-body-lg text-white/70">
                {page.hero.subheading}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {page.hero?.primaryCta?.href && (
                <ButtonLink href={page.hero.primaryCta.href} variant="orange">
                  {page.hero.primaryCta.label}
                </ButtonLink>
              )}
              {page.hero?.secondaryCta?.href && (
                <ButtonLink
                  href={page.hero.secondaryCta.href}
                  variant="ghost-light"
                >
                  {page.hero.secondaryCta.label}
                </ButtonLink>
              )}
            </div>
          </div>
          {page.hero?.videoUrl ? (
            <HeroVideo url={page.hero.videoUrl} />
          ) : (
            <SanityImage
              image={page.hero?.image}
              width={560}
              height={420}
              className="h-72 w-full rounded-2xl object-cover lg:h-105"
              placeholderLabel="Hero photo — the team, real people at work"
            />
          )}
        </div>
      </section>

      {/* Trust strip — "HubSpot Platinum Partner" as real, indexable text, then a
          ticker-tape carousel of client logos (designer's call; the review
          counts moved out of this strip and live under the testimonials
          heading instead). The track holds the logo set twice so the loop is
          seamless; it pauses entirely for reduced-motion users. Placeholder
          blocks scroll until we have logos with display permission. */}
      <section className="bg-deep-blue">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-8 gap-y-4 px-6 pb-14 pt-2">
          <p className="shrink-0 text-body font-semibold text-white">
            Other brands we&apos;ve made unreasonably excited about CRM
          </p>
          <LogoTicker logos={page.trustLogos} />
        </div>
      </section>

      {/* Intro — v2 pass: headline Deep Blue (was orange-on-white, banned),
          Sky Blue hand-drawn underline on "HubSpot implementation", copy
          rewritten. The three slots are for real people imagery — team or
          client photography, not stock, not product screenshots. */}
      <section
        className="bg-white bg-cover bg-center"
        style={{ backgroundImage: "url(/intro-background.png)" }}
      >
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24 text-center">
          <p className="text-body-lg font-medium italic text-deep-blue-80">
            One sec. Just need to keep the algorithms happy:
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-h2">
            <Marker style="underline" color="sky-blue">
              HubSpot implementation
            </Marker>{" "}
            for NZ and Australian businesses
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-deep-blue-80">
            Our implementation services fit the tooling around your business,
            so B2B teams get more out of HubSpot and the surrounding GTM
            tools.
          </p>
          <ButtonLink href="/services" variant="navy" className="mt-8">
            See the services
          </ButtonLink>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <SanityImage
                key={i}
                image={page.introImages?.[i]}
                width={400}
                height={300}
                className="aspect-4/3 w-full rounded-2xl object-cover"
                placeholderLabel="Team / client photo — real people, not stock"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services overview — v2 pass: three Sky Blue stage cards plus a
          fourth in solid Deep Blue (was orange). Orange appears only on the
          button inside the Deep Blue card, which is the permitted pairing. */}
      {/* Tan at 50% — designer: softer so it doesn't compete with the
          blues and orange. */}
      <section className="bg-off-white-tan/50">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
            Our services
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-h2">
            Start us where you need us.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_STAGES.map((stage) => (
              <div
                key={stage.title}
                className="rounded-2xl bg-sky-blue p-8 text-center"
              >
                <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-white">
                  <Icon name={stage.icon} className="h-8 w-8 text-deep-blue" />
                </span>
                <h3 className="mt-5 text-h4">{stage.title}</h3>
                <p className="mt-3 text-body text-deep-blue/80">{stage.text}</p>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl bg-deep-blue p-8 text-center text-white">
              <p className="text-body-lg font-semibold">
                Ten services across three stages. Not sure which? That&apos;s
                what the free chat is for.
              </p>
              <ButtonLink href="/contact" variant="orange">
                Let&apos;s chat
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* Featured case study — v2 pass: eyebrow removed, the stat pair is the
          dominant element (roughly double) with a full-height Sky Blue
          divider, and the button reads "View case study". */}
      {page.featuredCaseStudy && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <div className="grid gap-0 overflow-hidden rounded-3xl bg-deep-blue text-white lg:grid-cols-[1.05fr_1fr]">
              <div className="p-10 lg:p-14">
                <p className="text-caption font-semibold uppercase tracking-[0.14em] text-sky-blue">
                  {page.featuredCaseStudy.client}
                </p>
                <h2 className="mt-4 max-w-md text-h2">
                  {page.featuredCaseStudy.headline}
                </h2>
                {(page.featuredCaseStudy.stats?.length ?? 0) > 0 && (
                  <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-stretch sm:gap-9">
                    {page.featuredCaseStudy.stats?.map((stat, index) => (
                      <div key={stat._key} className="contents">
                        {index > 0 && (
                          <span
                            aria-hidden
                            className="h-px w-full bg-sky-blue/40 sm:h-auto sm:w-px sm:self-stretch"
                          />
                        )}
                        <div>
                          {/* Orange on Deep Blue — the permitted pairing */}
                          <p className="text-[clamp(3rem,4.8vw,4.25rem)] font-semibold leading-none tracking-[-0.06em] text-deep-orange">
                            {stat.value}
                          </p>
                          <p className="mt-3 max-w-40 text-caption text-white/65">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <ButtonLink
                  href={`/our-work/${page.featuredCaseStudy.slug?.current}`}
                  variant="orange"
                  className="mt-10"
                >
                  View case study
                </ButtonLink>
              </div>
              <SanityImage
                image={page.featuredCaseStudy.photo}
                width={640}
                height={520}
                className="order-first h-64 w-full object-cover lg:order-none lg:h-full"
                placeholderLabel="Case study photo / video still"
              />
            </div>
          </div>
        </section>
      )}

      {/* Why Zippily — the shared numbered values block (also on the
          Services landing, per the designer's Aug 2026 pass). */}
      <ValuesBand
        heading="Don't let the cute name fool you"
        aside="Adorable name, serious smarts — and a painfully sensible approach to working with clients"
        intro="Here's how we make the work, well, work:"
        action={{ label: "Get the full Zippily story", href: "/about-us" }}
        cards={page.whyCards}
        padding="pb-14 sm:pb-24 pt-4"
      />

      {/* Trust stats — the shared band, leading into the quotes. The
          subheading that used to repeat these counts in prose is gone: the
          same numbers twice in one viewport reads as padding. */}
      <StatsBand stats={trustStats} />

      {/* Testimonials — v2 pass: outline cards, "See our work" beside the
          heading, and the CLIENT FEEDBACK watermark finished rather than
          accidentally clipped. */}
      <TestimonialCards
        heading="Don't forget to check the reviews"
        subheading="Nice words from some of our favourite clients"
        testimonials={page.testimonials}
        action={{ label: "See our work", href: "/our-work" }}
        watermark="Client feedback"
        appearance="outline"
      />

      {/* Industries — v2 pass: outline cards with Deep Blue icon chips that
          flip to Sky Blue on hover; card hover fill is Sky Blue at 12% (a
          token, not an arbitrary grey); pill button instead of a text link. */}
      {(page.featuredIndustries?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-h2">
                  Let&apos;s face it, one size never really fits all
                </h2>
                <p className="mt-3 max-w-xl text-body-lg text-deep-blue-80">
                  Custom builds fit your business and your industry — with
                  plenty of sector-specific experience to guide us.
                </p>
              </div>
              {/* Orange on a white section: an explicit owner+designer
                  exception to brief rule 1, for button consistency across
                  the homepage. Label contrast (Deep Blue on orange) is
                  what carries AA and is unaffected by the background. */}
              <ButtonLink href="/industries" variant="orange">
                Find out more
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.featuredIndustries?.map((industry) => (
                <Link
                  key={industry._id}
                  href={
                    industry.pageBuilt
                      ? `/industries/${industry.slug?.current}`
                      : "/services/crm-implementation"
                  }
                  className="group rounded-2xl border border-deep-blue/20 p-8 text-center transition hover:bg-sky-blue/12"
                >
                  <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-deep-blue transition group-hover:bg-sky-blue">
                    <Icon
                      name={industry.icon}
                      className="h-8 w-8 text-white transition group-hover:text-deep-blue"
                    />
                  </span>
                  <h3 className="mt-4 text-h4">{industry.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">
                    {industry.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Insights teaser — two large cards per the v2 design. Read-time sits
          in Deep Blue at 80%, never orange on a light section. */}
      {(posts?.length ?? 0) > 0 && (
        <section
          className="bg-off-white-tan/50 bg-cover bg-center"
          style={{ backgroundImage: "url(/blog-background.png)" }}
        >
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-center text-h2">Hot off the (virtual) press</h2>
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
              {posts.slice(0, 2).map((post) => (
                <Link
                  key={post._id}
                  href={`/insights/${post.slug?.current}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <SanityImage
                    image={post.coverImage}
                    width={560}
                    height={245}
                    className="h-52 w-full object-cover"
                    placeholderLabel="Post image"
                  />
                  <div className="p-7">
                    <p className="text-caption text-deep-blue-80">
                      {post.publishedAt} · {post.readTime} min read
                    </p>
                    <h3 className="mt-2 text-h4">{post.title}</h3>
                    {post.excerpt && (
                      <p className="mt-3 text-body text-deep-blue-80">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ preview (M26) — unchanged: heading left, accordion right */}
      <FaqAccordion
        heading="Things people usually ask us"
        faqs={page.faqs}
        name="home-faq"
      />

      {/* CTA banner (M3) — restored between the FAQ and the newsletter, per
          the v2 pass. One reusable component, one per page template. */}
      <CtaBanner data={page.ctaBanner} meetingsUrl={settings?.meetingsUrl} />

      {/* Newsletter — the single capture. The footer's duplicate signup was
          removed; this band is where "Stay in the loop" lives. */}
      <NewsletterBand
        heading="Stay in the loop."
        text="Our newsletter aims to keep you informed on all things CRM, AI and Automation."
      />
    </>
  );
}
