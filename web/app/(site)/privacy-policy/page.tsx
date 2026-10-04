import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { LEGAL_PAGE_QUERY } from "@/sanity/queries";
import { PortableBody } from "@/components/modules/PortableBody";

export const revalidate = 3600;

// Same shape as every other route: Studio's SEO fields win, with a written
// fallback behind them. Without a description here the page silently
// inherited the root layout's homepage one, which read as a duplicate.
export async function generateMetadata(): Promise<Metadata> {
  const page = await sanityFetch(LEGAL_PAGE_QUERY, {
    slug: "privacy-policy",
  });
  return {
    title: page?.seo?.metaTitle ?? "Privacy Policy",
    description:
      page?.seo?.metaDescription ??
      "How Zippily collects, uses and protects the personal information you share with us.",
    alternates: { canonical: "/privacy-policy" },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await sanityFetch(LEGAL_PAGE_QUERY, {
    slug: "privacy-policy",
  });

  return (
    <>
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-6 pb-10 pt-24 sm:pb-16 sm:pt-32">
          <h1 className="text-pretty text-h1-mobile md:text-h1">
            {page?.title ?? "Privacy Policy"}
          </h1>
        </div>
      </section>
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
          <PortableBody value={page?.body} />
        </div>
      </section>
    </>
  );
}
