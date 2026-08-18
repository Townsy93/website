import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import {
  CASE_STUDY_QUERY,
  CASE_STUDY_SLUGS_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/queries";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SanityImage } from "@/components/ui/SanityImage";
import { PortableBody } from "@/components/modules/PortableBody";
import { VimeoEmbed } from "@/components/modules/VimeoEmbed";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(CASE_STUDY_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await sanityFetch(CASE_STUDY_QUERY, { slug });
  return {
    title: caseStudy?.seo?.metaTitle ?? caseStudy?.client ?? "Case study",
    description: caseStudy?.seo?.metaDescription ?? caseStudy?.resultLine ?? undefined,
    alternates: { canonical: `/our-work/${slug}` },
    // follow stays true: these pages are redirect targets for the old
    // Squarespace case study URLs, and a nofollow would strand the equity
    // arriving from them rather than passing it on.
    ...(caseStudy?.seo?.noIndex || !caseStudy?.pageBuilt
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

/** Plain-text paragraphs: blank line = new paragraph. */
function paragraphs(text?: string | null): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

// T9 v2 — the designer's case study layout (Aug 2026): centred hero with
// client logo, global stats band, about/challenge/solution, gallery
// straddling into a Deep Blue results section that repeats the case's own
// stats as callouts, the film, a full-bleed photo, and the big quote.
// Headings the design set orange-on-white are Deep Blue (Sean's AA ruling).
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [caseStudy, settings] = await Promise.all([
    sanityFetch(CASE_STUDY_QUERY, { slug }),
    sanityFetch(SITE_SETTINGS_QUERY),
  ]);
  if (!caseStudy || caseStudy.status === "comingSoon") {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/our-work/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  const trustStats = [
    { value: settings?.googleReviewCount, label: "5-star Google reviews" },
    {
      value: settings?.hubspotReviewCount,
      label: "5-star HubSpot Directory reviews",
    },
    { value: settings?.happyClients, label: "Happy clients" },
  ].filter((stat) => (stat.value ?? 0) > 0);

  const aboutParagraphs = paragraphs(caseStudy.aboutBody);
  const hasStorySections =
    aboutParagraphs.length > 0 ||
    (caseStudy.challengeItems?.length ?? 0) > 0 ||
    (caseStudy.solutionItems?.length ?? 0) > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Our work", url: `${SITE_URL}/our-work` },
          {
            name: caseStudy.client ?? slug,
            url: `${SITE_URL}/our-work/${slug}`,
          },
        ])}
      />
      {/* Hero — centred, client logo above the pills. */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-[90rem] px-4 pb-20 pt-28 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-caption text-white/50">
            <Link href="/our-work" className="text-sky-blue hover:underline">
              Our work
            </Link>{" "}
            › <span className="text-white/80">{caseStudy.client}</span>
          </nav>
          <div className="mx-auto max-w-3xl pt-6 text-center">
            {caseStudy.clientLogo ? (
              <span className="inline-flex h-16 items-center rounded-xl bg-white px-7">
                <SanityImage
                  image={caseStudy.clientLogo}
                  width={200}
                  height={56}
                  className="h-9 w-auto object-contain"
                />
              </span>
            ) : (
              <p className="text-h4">{caseStudy.client}</p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {caseStudy.service?.title && (
                <Link
                  href={`/services/${caseStudy.service.slug?.current}`}
                  className="rounded-full bg-sky-blue/15 px-4 py-1.5 text-caption font-semibold text-sky-blue"
                >
                  {caseStudy.service.title}
                </Link>
              )}
              {caseStudy.industry?.title && (
                <span className="rounded-full border border-white/20 px-4 py-1.5 text-caption font-semibold text-white/80">
                  {caseStudy.industry.title}
                </span>
              )}
            </div>
            <h1 className="mt-7 text-h1-mobile md:text-h1">
              {caseStudy.headline ?? caseStudy.client}
            </h1>
            {caseStudy.resultLine && (
              <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/70">
                {caseStudy.resultLine}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Trust stats band — live counts from Site settings. */}
      {trustStats.length > 0 && (
        <section className="bg-off-white-tan/50">
          <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 text-center sm:grid-cols-3 sm:gap-6 sm:px-6">
            {trustStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[clamp(2.5rem,3.5vw,3.25rem)] font-semibold leading-none tracking-[-0.06em] text-deep-blue">
                  {stat.value}
                </p>
                <p className="mx-auto mt-3 max-w-45 text-body text-deep-blue-80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasStorySections ? (
        <>
          {/* About the client — image beside plain paragraphs. */}
          <section className="bg-white">
            <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
              <SanityImage
                image={caseStudy.aboutImage ?? caseStudy.photo}
                width={520}
                height={440}
                className="h-72 w-full rounded-2xl object-cover lg:h-100"
                placeholderLabel={`${caseStudy.client} — from their website`}
              />
              <div>
                <h2 className="text-h2 text-deep-blue">
                  About {caseStudy.client}
                </h2>
                <div className="mt-6 flex max-w-xl flex-col gap-4 text-body text-deep-blue-80">
                  {aboutParagraphs.map((part) => (
                    <p key={part.slice(0, 40)}>{part}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Challenge / Solution — two columns above a hairline. */}
          {((caseStudy.challengeItems?.length ?? 0) > 0 ||
            (caseStudy.solutionItems?.length ?? 0) > 0) && (
            <section className="bg-white">
              <div className="mx-auto max-w-[90rem] px-4 pb-24 sm:px-6">
                <div aria-hidden className="h-px w-full bg-deep-blue/15" />
                <div className="mt-14 grid gap-14 lg:grid-cols-2">
                  {[
                    { title: "The challenge", items: caseStudy.challengeItems },
                    { title: "The solution", items: caseStudy.solutionItems },
                  ].map(
                    (column) =>
                      (column.items?.length ?? 0) > 0 && (
                        <div key={column.title}>
                          <h2 className="text-h2 text-deep-blue">
                            {column.title}
                          </h2>
                          <div className="mt-7 flex flex-col gap-7">
                            {column.items?.map((item) => (
                              <div key={item._key}>
                                {item.heading && (
                                  <h3 className="text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue">
                                    {item.heading}
                                  </h3>
                                )}
                                <div className="mt-2 flex max-w-xl flex-col gap-3 text-body text-deep-blue-80">
                                  {paragraphs(item.text).map((part) => (
                                    <p key={part.slice(0, 40)}>{part}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        /* Legacy layout for case studies written before the v2 fields. */
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
            {caseStudy.body ? (
              <PortableBody value={caseStudy.body} />
            ) : (
              <p className="text-body-lg text-deep-blue-80">
                The full {caseStudy.client} story is being written up — in the
                meantime, the numbers above tell most of it.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Gallery straddling into the results section — the three stills sit
          half on white, half on the Deep Blue below. */}
      <section className="bg-white">
        <div className="relative z-10 mx-auto -mb-28 grid max-w-[90rem] grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6">
          {(caseStudy.gallery?.length
            ? caseStudy.gallery
            : [null, null, null]
          ).map((image, index) => (
            <SanityImage
              key={index}
              image={image}
              width={440}
              height={300}
              className="h-48 w-full rounded-2xl object-cover shadow-lg sm:h-56"
              placeholderLabel="Zippily + client — still from the video"
            />
          ))}
        </div>
      </section>

      {/* The results — Deep Blue; the case's own stats repeat as callout
          rows, per the designer's "repeat stats again for impact". */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 pb-24 pt-44 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-h2">The results</h2>
            {caseStudy.resultsText && (
              <p className="mt-5 max-w-xl text-body-lg text-white/75">
                {caseStudy.resultsText}
              </p>
            )}
            {(caseStudy.resultsBullets?.length ?? 0) > 0 && (
              <>
                <p className="mt-6 text-body text-white/75">
                  Working together brought:
                </p>
                <ul className="mt-3 flex max-w-xl list-disc flex-col gap-2 pl-5 text-body text-white/75">
                  {caseStudy.resultsBullets?.map((bullet) => (
                    <li key={bullet.slice(0, 40)}>{bullet}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          {(caseStudy.stats?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-5">
              {caseStudy.stats?.map((stat) => (
                <div
                  key={stat._key}
                  className="flex items-center gap-6 rounded-xl border border-white/25 px-7 py-5"
                >
                  {/* Orange on Deep Blue — the permitted pairing. */}
                  <p className="shrink-0 text-h2 font-semibold leading-none text-deep-orange">
                    {stat.value}
                  </p>
                  <p className="text-body text-white/85">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The film — click-to-play with sound. The section always renders,
          with a placeholder until the video URL lands in Sanity, so every
          case study carries the full v2 shape. */}
      <section
        className="bg-white bg-cover bg-center"
        style={{ backgroundImage: "url(/intro-background.png)" }}
      >
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-h2 text-deep-blue">
            Watch the full case study
          </h2>
          <div className="mt-10 text-left">
            {caseStudy.videoUrl ? (
              <VimeoEmbed
                url={caseStudy.videoUrl}
                title={`${caseStudy.client} case study`}
              />
            ) : (
              <div
                role="img"
                aria-label="Case study video — coming soon"
                className="flex aspect-video w-full items-center justify-center rounded-3xl bg-[#E0ECF3] text-caption text-deep-blue-80"
              >
                Case study video — coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-bleed photo — always present; labelled placeholder until the
          photo is uploaded. */}
      <SanityImage
        image={caseStudy.fullBleedPhoto ?? caseStudy.photo}
        width={1920}
        height={640}
        className="h-72 w-full object-cover md:h-120"
        placeholderLabel={`${caseStudy.client} — full-width photo to come`}
      />

      {/* The quote — orange glyph on white is fine (it is a decorative mark,
          not text); the attribution is Deep Blue per the AA ruling. */}
      {caseStudy.testimonial?.quote && (
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
            <span
              aria-hidden
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-deep-orange text-h3 font-bold text-white"
            >
              &rdquo;
            </span>
            <blockquote className="mt-8 text-body-lg leading-relaxed text-deep-blue md:text-h4 md:font-normal">
              &ldquo;{caseStudy.testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-8 text-caption font-semibold uppercase tracking-[0.1em] text-deep-blue">
              {[caseStudy.testimonial.name, caseStudy.testimonial.company]
                .filter(Boolean)
                .join(" — ")}
            </p>
          </div>
        </section>
      )}

      {/* CTA — solid orange button and a wider sub-line, per the design
          annotations ("no orphan"). */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-h2">Want a story like this one?</h2>
          <div className="mx-auto mt-6 h-0.5 w-14 bg-sky-blue" aria-hidden />
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/65">
            A free 30-minute chat about where your HubSpot is at — no pitch
            deck, no pressure.
          </p>
          <ButtonLink href="/contact" variant="orange" className="mt-10">
            Book your free chat
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
