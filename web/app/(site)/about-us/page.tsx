import type { Metadata } from "next";
import Image from "next/image";
import { PortableText } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { ABOUT_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmphasisedHeading } from "@/components/ui/Marker";
import { SanityImage } from "@/components/ui/SanityImage";
import { CtaBanner } from "@/components/modules/CtaBanner";
import { StatsBand } from "@/components/modules/StatsBand";
import { TeamGrid } from "@/components/modules/TeamGrid";
import { TestimonialCards } from "@/components/modules/TestimonialCards";
import { VimeoEmbed } from "@/components/modules/VimeoEmbed";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(ABOUT_PAGE_QUERY);
  return {
    title: page?.seo?.metaTitle ?? "About Us",
    description: page?.seo?.metaDescription ?? "A small, senior Auckland team that's spent years inside HubSpot — and likes it that way.",
    alternates: { canonical: "/about-us" },
    ...(page?.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

// About v2, per the designer's August pass. Section headings that the design
// set in orange on white are Deep Blue throughout — Sean's ruling: orange
// text on white is ~2.7:1 and fails WCAG AA. Orange stays where it sits on
// Deep Blue, and on button fills where the Deep Blue label carries contrast.
export default async function AboutPage() {
  const [page, settings] = await Promise.all([
    sanityFetch(ABOUT_PAGE_QUERY),
    sanityFetch(SITE_SETTINGS_QUERY),
  ]);
  if (!page) {
    return (
      <section className="bg-deep-blue pb-14 sm:pb-24 pt-40 text-center text-white">
        <p className="text-body-lg">About page content not found in Sanity.</p>
      </section>
    );
  }

  // The stats band renders live counts from Site settings — the design's
  // hardcoded 23 was already stale by the time it arrived, which is the
  // argument for never baking these numbers into a layout.
  const stats = [
    { value: settings?.googleReviewCount, label: "5-star Google reviews" },
    {
      value: settings?.hubspotReviewCount,
      label: "5-star HubSpot Directory reviews",
    },
    { value: settings?.happyClients, label: "Happy clients" },
  ];

  return (
    <>
      {/* Hero — dark split. Anchor pills styled like homepage buttons (no
          down arrows), plus the standard CTA pair beneath. The eyebrow no
          longer says Gold Partner — the badge band right below carries it. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-14 px-6 pb-12 pt-24 sm:pb-20 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            {/* No eyebrow and no anchor pills — Sean's call (Aug 2026): the
                hero carries just the heading and the standard CTA pair. */}
            <h1 className="text-h1-mobile md:text-h1">
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
              <ButtonLink href="/contact" variant="orange">
                Book a free chat
              </ButtonLink>
              <ButtonLink href="/our-work" variant="ghost-light">
                See our work
              </ButtonLink>
            </div>
          </div>
          <SanityImage
            image={page.hero?.image}
            width={540}
            height={480}
            className="h-72 w-full rounded-2xl object-cover lg:h-110"
            placeholderLabel="Real team photo — not an illustration"
          />
        </div>
      </section>

      {/* Why you'll trust us — one image, stacked promises. Heading Deep
          Blue (design had orange-on-white; fails AA). */}
      {(page.trustPillars?.length ?? 0) > 0 && (
        <section id="trust" className="scroll-mt-24 bg-white">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2">
            <SanityImage
              image={page.trustPillars?.[0]?.image}
              width={560}
              height={460}
              className="h-72 w-full rounded-2xl object-cover lg:h-110"
              placeholderLabel="Client + Zippily photo"
            />
            <div>
              <h2 className="text-h2 text-deep-blue">
                Why you&apos;ll trust us
              </h2>
              <div className="mt-8 flex flex-col divide-y divide-deep-blue/15">
                {page.trustPillars?.map((row) => (
                  <div key={row._key} className="py-6 first:pt-0 last:pb-0">
                    <h3 className="text-h4">{row.heading}</h3>
                    <p className="mt-2 max-w-lg text-body text-deep-blue-80">
                      {row.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Gold Partner credential band — pale blue so it reads as its own
          strip between the white sections. */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 pb-8">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-sky-blue/15 p-8 text-center sm:flex-row sm:text-left">
            <Image
              src="/hubspot-gold-badge.png"
              alt="HubSpot Gold Solutions Partner badge"
              width={96}
              height={96}
              className="h-24 w-auto shrink-0"
            />
            <div>
              <h2 className="text-h3 text-deep-blue">HubSpot Gold Partner</h2>
              <p className="mt-2 text-body text-deep-blue-80">
                Certified and delivering across New Zealand &amp; Australia,
                from Auckland.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the team — cards open the bio dialog. The old hover-reveal was
          unreachable on touch; the pop-up is for those who WANT the bios. */}
      {(page.team?.length ?? 0) > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
            <h2 className="text-center text-h2">
              {page.teamHeading ?? "Meet the team"}
            </h2>
            <p className="mt-3 text-center text-caption text-white/50">
              Select a card to read their bio.
            </p>
            <div className="mt-12">
              <TeamGrid team={page.team ?? []} />
            </div>
          </div>
        </section>
      )}

      {/* Why you'll love us — team shot beside the three promises. */}
      {(page.lovePillars?.length ?? 0) > 0 && (
        <section id="love" className="scroll-mt-24 bg-white">
          <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2">
            <SanityImage
              image={page.culturePhotos?.[0]}
              width={560}
              height={460}
              className="h-72 w-full rounded-2xl object-cover lg:h-110"
              placeholderLabel="Zippily team shot"
            />
            <div>
              <h2 className="text-h2 text-deep-blue">
                Why you&apos;ll love us
              </h2>
              <div className="mt-8 flex flex-col gap-7">
                {page.lovePillars?.map((pillar) => (
                  <div key={pillar._key}>
                    <h3 className="text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 max-w-lg text-body text-deep-blue-80">
                      {pillar.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values we work by — numbered outline cards. Numerals Deep Blue. */}
      {(page.values?.length ?? 0) > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[90rem] px-6 pb-14 sm:pb-24">
            <div className="flex items-center gap-6">
              <h2 className="shrink-0 text-h2 text-deep-blue">
                Values we work by
              </h2>
              <div aria-hidden className="h-px flex-1 bg-deep-blue/15" />
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {page.values?.map((value, index) => (
                <div
                  key={value._key}
                  className="rounded-2xl border border-deep-blue/20 p-7"
                >
                  <p className="text-h3 font-semibold text-deep-blue">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4">{value.title}</h3>
                  <p className="mt-2 text-body text-deep-blue-80">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats band — the shared component. */}
      <StatsBand stats={stats} />

      {/* Testimonials with the finished watermark, matching home. */}
      <TestimonialCards
        heading="Don't take our word for it"
        testimonials={page.testimonials}
        action={{ label: "See our work", href: "/our-work" }}
        watermark="Client feedback"
        appearance="outline"
      />

      {/* Our story — the film when we have it (click-to-play, sound belongs
          behind a click and browsers allow nothing else), the photo-and-text
          layout until then. */}
      {page.storyVideoUrl ? (
        <section
          className="bg-off-white-tan/50 bg-cover bg-center"
          style={{ backgroundImage: "url(/blog-background.png)" }}
        >
          <div className="mx-auto max-w-4xl px-6 py-14 sm:py-24 text-center">
            <p className="text-caption font-semibold uppercase tracking-[0.14em] text-deep-blue-80">
              Our story
            </p>
            <h2 className="mt-3 text-h2 text-deep-blue">
              {page.storyHeading ?? "Why we started Zippily"}
            </h2>
            <div className="mt-10 text-left">
              <VimeoEmbed
                url={page.storyVideoUrl}
                title={page.storyHeading ?? "Why we started Zippily"}
              />
            </div>
          </div>
        </section>
      ) : (
        page.storyBody && (
          <section
            className="bg-off-white-tan/50 bg-cover bg-center"
            style={{ backgroundImage: "url(/blog-background.png)" }}
          >
            <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-6 py-14 sm:py-24 lg:grid-cols-2">
              <SanityImage
                image={page.storyImage}
                width={560}
                height={560}
                className="h-80 w-full rounded-2xl object-cover lg:h-130"
                placeholderLabel="Real photo of Sean / the early team"
              />
              <div>
                <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                  Our story
                </p>
                <h2 className="mt-3 text-h2">
                  {page.storyHeading ?? "Why we started Zippily"}
                </h2>
                <div className="mt-5 flex max-w-lg flex-col gap-4 text-body-lg text-deep-blue-80">
                  <PortableText value={page.storyBody} />
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Clients we've worked with — greyscale logo grid. Placeholders until
          logos with display permission land in Sanity; the same permission
          gate as the homepage ticker. */}
      <section className="bg-white">
        <div className="mx-auto max-w-[90rem] px-6 py-14 sm:py-24">
          <h2 className="text-center text-h2 text-deep-blue">
            Clients we&apos;ve worked with
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 items-center gap-x-10 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
            {(page.clientLogos?.length ?? 0) > 0
              ? page.clientLogos?.map((logo) => (
                  <SanityImage
                    key={logo._key}
                    image={logo}
                    width={140}
                    height={48}
                    className="mx-auto h-10 w-auto object-contain opacity-70 grayscale"
                  />
                ))
              : Array.from({ length: 10 }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="mx-auto h-10 w-28 rounded bg-deep-blue/10"
                  />
                ))}
          </div>
        </div>
      </section>

      <CtaBanner data={page.ctaBanner} />
    </>
  );
}
