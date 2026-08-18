import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { VACANCY_QUERY, VACANCY_SLUGS_QUERY } from "@/sanity/queries";
import { SITE_URL } from "@/lib/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Icon } from "@/components/ui/Icon";
import { SanityImage } from "@/components/ui/SanityImage";
import { PortableBody } from "@/components/modules/PortableBody";
import { VacancyCard } from "@/components/modules/VacancyCard";
import { ApplicationForm } from "@/components/modules/ApplicationForm";
import { jobPostingJsonLd, salaryRange, vacancyMeta } from "@/lib/careers";

export const revalidate = 3600;

// Closed roles are included: the URL stays live so a shared link still
// lands somewhere useful.
export async function generateStaticParams() {
  const slugs = await client.fetch(VACANCY_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await sanityFetch(VACANCY_QUERY, { slug });
  const closed = vacancy?.status === "closed";
  return {
    title: vacancy?.seo?.metaTitle ?? vacancy?.title ?? "Careers",
    description: vacancy?.seo?.metaDescription ?? vacancy?.summary ?? undefined,
    alternates: { canonical: `/careers/${slug}` },
    // A filled role should stop appearing in search, but the page stays up
    // and its links stay worth following.
    ...(closed || vacancy?.seo?.noIndex
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

const META_ICON = ["building-2", "clock", "map-pin"];

// Template R — vacancy detail.
export default async function VacancyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vacancy = await sanityFetch(VACANCY_QUERY, { slug });
  if (!vacancy) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/careers/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  const closed = vacancy.status === "closed";
  const meta = vacancyMeta(vacancy);
  const salary = salaryRange(vacancy);
  const benefits =
    vacancy.benefitsOverride?.length ? vacancy.benefitsOverride : (vacancy.sharedBenefits ?? []);
  const related = vacancy.related ?? [];

  const jsonLd = jobPostingJsonLd(
    vacancy,
    [
      vacancy.summary ?? "",
      ...(vacancy.responsibilities ?? []),
      ...(vacancy.requirements ?? []),
    ]
      .filter(Boolean)
      .map((line) => `<p>${line}</p>`)
      .join(""),
    { name: "Zippily", url: SITE_URL },
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2 — Hero */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-4xl px-6 py-10 sm:py-16 sm:py-20">
          <nav aria-label="Breadcrumb" className="text-[14px] text-white/70">
            <Link href="/careers" className="hover:text-white">
              Careers
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span>{vacancy.title}</span>
          </nav>

          <h1 className="text-pretty mt-4 text-h1">{vacancy.title}</h1>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {meta.map((item, index) => (
              <li key={item} className="flex items-center gap-2 text-[15px] text-white/85">
                <Icon name={META_ICON[index] ?? "dot"} className="h-4 w-4 text-sky-blue" />
                {item}
              </li>
            ))}
            {salary && (
              <li className="flex items-center gap-2 text-[15px] text-white/85">
                <Icon name="banknote" className="h-4 w-4 text-sky-blue" />
                {salary}
              </li>
            )}
          </ul>

          {closed ? (
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/5 p-6">
              <p className="text-body-lg">This role has been filled.</p>
              <p className="mt-2 text-body text-white/80">
                Have a look at what else is open, or register your interest and
                we&apos;ll come back to you when something fits.
              </p>
              <div className="mt-5">
                <ButtonLink href="/careers" variant="orange">See all open roles</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#apply" variant="orange">Apply now</ButtonLink>
              <ButtonLink href="/careers" variant="ghost-light">
                Back to all roles
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {/* 3–5 — About the role, responsibilities, requirements */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl space-y-12 px-6 py-12 sm:py-20">
          {vacancy.description && (
            <div>
              <h2 className="text-h2 text-deep-blue">About the role</h2>
              <div className="mt-5">
                <PortableBody value={vacancy.description} />
              </div>
            </div>
          )}

          <BulletBlock heading="What you'll do" items={vacancy.responsibilities} />
          <BulletBlock
            heading="What we're looking for"
            items={vacancy.requirements}
          />
          {vacancy.niceToHave?.length ? (
            <BulletBlock heading="Nice to have" items={vacancy.niceToHave} muted />
          ) : null}
        </div>
      </section>

      {/* 6 — What we offer */}
      {benefits.length > 0 && (
        <section className="bg-deep-blue text-white">
          <div className="mx-auto max-w-5xl px-6 py-12 sm:py-20">
            <h2 className="text-h2">What we offer</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit._key ?? index}
                  className="rounded-3xl border border-white/15 bg-white/5 p-6"
                >
                  <Icon name={benefit.icon} className="h-6 w-6 text-sky-blue" />
                  <h3 className="mt-4 text-[18px]">{benefit.heading}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/80">
                    {benefit.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 — About Zippily */}
      <section className="bg-off-white-tan">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-12 sm:py-20 md:grid-cols-2">
          {vacancy.teamPhoto && (
            <SanityImage
              image={vacancy.teamPhoto}
              width={640}
              height={480}
              className="w-full rounded-3xl object-cover"
              placeholderLabel="Team photo to come"
            />
          )}
          <div>
            <h2 className="text-h2 text-deep-blue">About Zippily</h2>
            <p className="mt-4 text-body-lg leading-relaxed text-body">
              We&apos;re a small Auckland HubSpot consultancy. We work with a
              limited number of clients at a time, which means you work directly
              with senior people and see your work land rather than disappear
              into a process.
            </p>
            <Link
              href="/about-us"
              className="mt-5 inline-block font-semibold text-deep-blue underline decoration-sky-blue decoration-2 underline-offset-4"
            >
              More about us
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — Application form, or the closed-role pointer */}
      {!closed && (
        <section id="apply" className="scroll-mt-24 bg-deep-blue text-white">
          <div className="mx-auto max-w-2xl px-6 py-12 sm:py-20">
            <h2 className="text-h2">Apply for this role</h2>
            <div className="mt-8">
              <ApplicationForm roleTitle={vacancy.title ?? ""} />
            </div>
          </div>
        </section>
      )}

      {/* 9 — Related roles. Omitted entirely when there are none. */}
      {related.length > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-4xl px-6 py-12 sm:py-20">
            <h2 className="text-h2 text-deep-blue">Other open roles</h2>
            <div className="mt-8 space-y-4">
              {related.map((role) => (
                <VacancyCard key={role._id} vacancy={role} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function BulletBlock({
  heading,
  items,
  muted = false,
}: {
  heading: string;
  items?: string[] | null;
  muted?: boolean;
}) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className={muted ? "text-h3 text-deep-blue" : "text-h2 text-deep-blue"}>
        {heading}
      </h2>
      <ul className="mt-5 space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-[16px] leading-relaxed text-body">
            <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-deep-blue" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
