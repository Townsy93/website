import type { MetadataRoute } from "next";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_URL } from "@/lib/site";

const SITEMAP_QUERY = defineQuery(
  `{
    "services": *[_type == "service" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "platforms": *[_type == "partnerIntegration" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "industries": *[_type == "industry" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "caseStudies": *[_type == "caseStudy" && defined(slug.current) && status == "live" && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "posts": *[_type == "blogPost" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
    "events": *[_type == "event" && defined(slug.current)]{ "slug": slug.current, _updatedAt },
    "careersBuilt": *[_type == "careersPage"][0].pageBuilt,
    "landingPages": *[_type == "landingPage" && defined(slug.current) && pageBuilt == true]{ "slug": slug.current, _updatedAt },
    "vacancies": *[_type == "vacancy" && status == "open" && defined(slug.current) && seo.noIndex != true]{ "slug": slug.current, _updatedAt }
  }`,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Tagged, so a deleted or newly published document changes the sitemap at
  // once. With the bare client it never purged, and the sitemap went on
  // advertising two posts that had been deleted - telling Google to crawl
  // 404s, which is worse than omitting them.
  const data = await sanityFetch(SITEMAP_QUERY);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/platforms", priority: 0.8 },
    { path: "/about-us", priority: 0.8 },
    { path: "/industries", priority: 0.7 },
    { path: "/our-work", priority: 0.8 },
    { path: "/insights", priority: 0.7 },
    { path: "/resources", priority: 0.7 },
    { path: "/events", priority: 0.7 },
    { path: "/contact", priority: 0.9 },
    // Only once the placeholder copy has been replaced.
    ...(data.careersBuilt ? [{ path: "/careers", priority: 0.6 }] : []),
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
    ...entries("/platforms", data.platforms, 0.7),
    ...entries("/industries", data.industries, 0.6),
    ...entries("/our-work", data.caseStudies, 0.6),
    ...entries("/insights", data.posts, 0.5),
    ...entries("/events", data.events, 0.6),
    // Closed roles drop out on the next build — the page stays live, but a
    // filled role should not keep being offered in search.
    ...entries("/careers", data.vacancies, 0.5),
    // Campaign pages, only once finished.
    ...entries("/lp", data.landingPages, 0.4),
  ];
}
