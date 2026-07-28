import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "@/lib/redirects";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/fetch";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/queries";
import { SanityImage } from "@/components/ui/SanityImage";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PortableBody } from "@/components/modules/PortableBody";
import { NewsletterBand } from "@/components/modules/NewsletterBand";
import { PostPills, formatDate } from "@/components/modules/postCard";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await sanityFetch(POST_QUERY, { slug });
  return {
    title: post?.seo?.metaTitle ?? post?.title ?? "Insight",
    description: post?.seo?.metaDescription ?? post?.excerpt ?? undefined,
    alternates: { canonical: `/insights/${slug}` },
    openGraph: { type: "article", publishedTime: post?.publishedAt ?? undefined },
    ...(post?.seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

// T11 — editorial article template with the "short version" callout.
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await sanityFetch(POST_QUERY, { slug });
  if (!post) {
    // A retired slug redirects rather than 404ing — the old URL keeps its
    // inbound links, and losing them is the usual cost of a rename.
    const moved = await findRedirect(`/insights/${slug}`);
    // 308 for a permanent move, so ranking passes to the new URL. A 307
    // tells search engines the move is temporary and passes nothing, which
    // would defeat the point of recording the redirect at all.
    if (moved) {
      if (moved.permanent) permanentRedirect(moved.to);
      redirect(moved.to);
    }
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/insights/${slug}`,
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    author: {
      "@type": "Person",
      name: post.author?.name,
      jobTitle: post.author?.role,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Insight hub", url: `${SITE_URL}/insights` },
          { name: post.title ?? slug, url: `${SITE_URL}/insights/${slug}` },
        ])}
      />
      {/* Article header (H1f) */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-32 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-caption text-deep-blue-80">
            <Link href="/insights" className="hover:underline">
              Insight hub
            </Link>{" "}
            › <span className="font-semibold text-deep-blue">Blog</span>
          </nav>
          <div className="mt-5">
            <PostPills post={post} />
          </div>
          <h1 className="mt-5 text-h1-mobile md:text-h1">{post.title}</h1>
          {post.dek && (
            <p className="mt-5 text-body-lg text-deep-blue-80">{post.dek}</p>
          )}
          <div className="mt-7 flex items-center gap-4 border-t border-deep-blue-10 pt-6">
            <SanityImage
              image={post.author?.photo}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
              placeholderLabel=""
            />
            <div>
              <p className="text-body font-semibold">{post.author?.name}</p>
              <p className="text-caption text-deep-blue-80">
                {post.author?.role} · {formatDate(post.publishedAt)} ·{" "}
                {post.readTime} min read
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead image */}
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SanityImage
            image={post.coverImage}
            width={1040}
            height={520}
            className="h-72 w-full rounded-2xl object-cover md:h-130"
            placeholderLabel="Lead image — real people"
          />
        </div>
      </section>

      {/* Body with "short version" callout (M31) */}
      <article className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          {(post.shortVersion?.length ?? 0) > 0 && (
            <aside className="mb-10 rounded-r-2xl border-l-4 border-sky-blue bg-white p-7">
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                The short version
              </p>
              <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-deep-blue-80">
                {post.shortVersion?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </aside>
          )}
          <PortableBody value={post.body} />

          {/* Author bio card */}
          <div className="mt-14 flex items-center gap-5 rounded-2xl border border-deep-blue-10 bg-white p-7">
            <SanityImage
              image={post.author?.photo}
              width={72}
              height={72}
              className="h-18 w-18 shrink-0 rounded-full object-cover"
              placeholderLabel=""
            />
            <div>
              <p className="text-caption font-semibold uppercase tracking-[0.08em] text-deep-blue-80">
                Written by
              </p>
              <p className="mt-1 text-body-lg font-semibold">
                {post.author?.name}
              </p>
              <p className="text-body text-deep-blue-80">{post.author?.role}</p>
            </div>
          </div>
        </div>
      </article>

      {/* Article CTA */}
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-h2">Want a hand with this in your portal?</h2>
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-white/65">
            A free 30-minute chat — no pitch deck, no pressure.
          </p>
          <ButtonLink href="/contact" variant="orange-outline" className="mt-8">
            Let&apos;s chat
          </ButtonLink>
        </div>
      </section>

      {/* Keep reading */}
      {(post.related?.length ?? 0) > 0 && (
        <section className="bg-off-white-tan">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-h2">Keep reading</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {post.related?.map((related) => (
                <Link
                  key={related._id}
                  href={`/insights/${related.slug?.current}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <SanityImage
                    image={related.coverImage}
                    width={400}
                    height={190}
                    className="h-40 w-full object-cover"
                    placeholderLabel="Post image"
                  />
                  <div className="p-6">
                    <h3 className="text-h4">{related.title}</h3>
                    <p className="mt-3 text-caption text-deep-blue-80">
                      {formatDate(related.publishedAt)} · {related.readTime} min
                      read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <NewsletterBand heading="One good email a month." />
    </>
  );
}
