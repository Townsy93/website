import type { MetadataRoute } from "next";
import { defineQuery } from "next-sanity";
import { client } from "@/sanity/client";
import { SITE_URL } from "@/lib/site";

const SITEMAP_QUERY = defineQuery(
  `{
    "services": *[_type == "service" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "solutions": *[_type == "partnerIntegration" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "industries": *[_type == "industry" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "caseStudies": *[_type == "caseStudy" && defined(slug.current) && status == "live"]{ "slug": slug.current, _updatedAt },
    "posts": *[_type == "blogPost" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
    "events": *[_type == "event" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
    "vacancies": *[_type == "vacancy" && status == "open" && defined(slug.current)]{ "slug": slug.current, _updatedAt }
  }`,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await client.fetch(SITEMAP_QUERY);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/solutions", priority: 0.8 },
    { path: "/about-us", priority: 0.8 },
    { path: "/industries", priority: 0.7 },
    { path: "/our-work", priority: 0.8 },
    { path: "/insights", priority: 0.7 },
    { path: "/resources", priority: 0.7 },
    { path: "/events", priority: 0.7 },
    { path: "/contact", priority: 0.9 },
    { path: "/careers", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority,
  }));

  const entries = (
    prefix: string,
    docs: { slug: string | null; _updatedAt: string }[],
    priority: number,
  ): MetadataRoute.Sitemap =>
    docs
      .filter((doc) => doc.slug)
      .map((doc) => ({
        url: `${SITE_URL}${prefix}/${doc.slug}`,
        lastModified: doc._updatedAt,
        changeFrequency: "monthly" as const,
        priority,
      }));

  return [
    ...staticRoutes,
    ...entries("/services", data.services, 0.8),
    ...entries("/solutions", data.solutions, 0.7),
    ...entries("/industries", data.industries, 0.6),
    ...entries("/our-work", data.caseStudies, 0.6),
    ...entries("/insights", data.posts, 0.5),
    ...entries("/events", data.events, 0.6),
    // Closed roles drop out on the next build — the page stays live, but a
    // filled role should not keep being offered in search.
    ...entries("/careers", data.vacancies, 0.5),
  ];
}
