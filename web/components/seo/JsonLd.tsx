// Renders a JSON-LD structured-data block. Data is built server-side from
// Sanity content only — never from user input.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQPage markup for a page that renders a FaqAccordion.
 *
 * Google requires the marked-up Q&A to be visible on the page, so this
 * applies exactly the same filter the accordion does (both a question and
 * an answer present) and renders nothing when that leaves no items — a
 * page with an empty faqs array shows no accordion, so it must not claim
 * an FAQPage either. One per page: every route here renders a single
 * accordion.
 */
export function FaqJsonLd({
  faqs,
}: {
  faqs?: { question?: string | null; answer?: string | null }[] | null;
}) {
  const items = (faqs ?? []).filter((faq) => faq.question && faq.answer);
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}
