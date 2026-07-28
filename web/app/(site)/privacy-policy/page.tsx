import type { Metadata } from "next";
import { sanityFetch } from "@/sanity/fetch";
import { LEGAL_PAGE_QUERY } from "@/sanity/queries";
import { PortableBody } from "@/components/modules/PortableBody";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy" },
};

export default async function PrivacyPolicyPage() {
  const page = await sanityFetch(LEGAL_PAGE_QUERY, {
    slug: "privacy-policy",
  });

  return (
    <>
      <section className="bg-deep-blue text-white">
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-32 sm:px-6">
          <h1 className="text-h1-mobile md:text-h1">
            {page?.title ?? "Privacy Policy"}
          </h1>
        </div>
      </section>
      <section className="bg-off-white-tan">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <PortableBody value={page?.body} />
        </div>
      </section>
    </>
  );
}
