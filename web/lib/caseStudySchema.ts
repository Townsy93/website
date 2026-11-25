/**
 * schema.org Article markup for a case study page.
 *
 * A case study is a written account, and Ahrefs classes the page as an
 * "Article" and flags it for carrying none. The author and publisher are the
 * site's own Organization node, referenced by @id so it is one entity. The
 * dates are the Sanity document's: it has no separate publish date.
 *
 * Keys with no value are left out rather than sent empty.
 */
export function caseStudyArticleJsonLd({
  siteUrl,
  slug,
  client,
  headline,
  description,
  imageUrl,
  createdAt,
  updatedAt,
}: {
  siteUrl: string;
  slug: string;
  client?: string | null;
  headline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}): Record<string, unknown> {
  const url = `${siteUrl}/our-work/${slug}`;
  const org = { "@id": `${siteUrl}/#organization` };
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headline ?? (client ? `${client} case study` : "Case study"),
    description: description ?? undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: createdAt ?? undefined,
    dateModified: updatedAt ?? createdAt ?? undefined,
    author: org,
    publisher: org,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
}
