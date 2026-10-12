import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_URL } from "@/lib/site";
import { isIndexableHost } from "@/lib/indexable";
import { headers } from "next/headers";

/**
 * /llms.txt — a curated map of the site for language models.
 *
 * The convention (llmstxt.org) is a plain-text index a model can read in one
 * request instead of crawling and guessing. The value is editorial: it says
 * which pages actually answer a question, in our words, rather than leaving a
 * retriever to rank them itself.
 *
 * Generated from Sanity for the same reason the sitemap is — a hand-written
 * file goes stale the first time a service is renamed, and a stale map is
 * worse than none because it confidently points at the wrong thing.
 *
 * Host-aware like robots.txt: a preview URL should not advertise itself.
 */
export const revalidate = 3600;

const LLMS_QUERY = defineQuery(`{
  "services": *[_type == "service" && defined(slug.current) && pageBuilt == true]
    | order(title asc){ title, "slug": slug.current, shortDescription },
  "industries": *[_type == "industry" && defined(slug.current) && pageBuilt == true]
    | order(title asc){ title, "slug": slug.current, shortDescription },
  "caseStudies": *[_type == "caseStudy" && defined(slug.current) && status == "live" && pageBuilt == true]
    | order(client asc){ client, "slug": slug.current, resultLine },
  "posts": *[_type == "blogPost" && defined(slug.current)]
    | order(publishedAt desc){ title, "slug": slug.current, excerpt },
  "resources": *[_type == "resource"] | order(order asc){ title, summaryBullets }
}`);

const line = (name: string, path: string, desc?: string | null) => {
  const clean = (desc ?? "").replace(/\s+/g, " ").trim();
  return `- [${name}](${SITE_URL}${path})${clean ? `: ${clean}` : ""}`;
};

export async function GET() {
  const host = (await headers()).get("host");
  if (!isIndexableHost(host)) {
    return new Response("# Not the live site\n", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const d = await sanityFetch(LLMS_QUERY);

  const out = [
    "# Zippily",
    "",
    "> HubSpot implementation and RevOps consultancy in Auckland, New Zealand.",
    "> HubSpot Platinum Solutions Partner, working across New Zealand and Australia.",
    "> We scope, build and maintain HubSpot portals: implementations, audits,",
    "> marketing automation, integrations, training and ongoing RevOps retainers.",
    "",
    "## Services",
    ...(d.services ?? []).map((s) =>
      line(s.title ?? "", `/services/${s.slug}`, s.shortDescription),
    ),
    "",
    "## Industries",
    ...(d.industries ?? []).map((i) =>
      line(i.title ?? "", `/industries/${i.slug}`, i.shortDescription),
    ),
    "",
    "## Case studies",
    ...(d.caseStudies ?? []).map((c) =>
      line(c.client ?? "", `/our-work/${c.slug}`, c.resultLine),
    ),
    "",
    "## Guides",
    ...(d.resources ?? []).map(
      (r) => `- ${r.title}: ${(r.summaryBullets ?? []).join("; ")}`,
    ),
    "",
    "## Insights",
    ...(d.posts ?? []).map((p) =>
      line(p.title ?? "", `/insights/${p.slug}`, p.excerpt),
    ),
    "",
    "## Contact",
    `- [Contact](${SITE_URL}/contact): book a free 30-minute scoping call.`,
    `- [About](${SITE_URL}/about-us): who we are and how we work.`,
    "- Email: hello@zippily.co.nz",
    "",
  ].join("\n");

  return new Response(out, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
