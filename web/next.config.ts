import type { NextConfig } from "next";

// 301s from the old Squarespace URLs (tracker "Existing URL" column).
// Inert until the domain points at this Worker; preserves rankings at cutover.
const LEGACY_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/home", destination: "/" },
  { source: "/our-solutions", destination: "/services" },
  { source: "/hubspot-crm-implementation", destination: "/services/crm-implementation" },
  { source: "/crm-audit", destination: "/services/hubspot-audit" },
  { source: "/hubspot-training", destination: "/services/hubspot-training" },
  { source: "/marketing-automation", destination: "/services/marketing-automation" },
  { source: "/hubspot-ai-automation-advisory", destination: "/services/ai-solutions" },
  { source: "/revops-retainer", destination: "/services/revops-retainers" },
  { source: "/customer-journey-workshop", destination: "/services/customer-journey-mapping" },
  { source: "/hubspot-integrations", destination: "/services/websites-and-integrations" },
  // Goes to the post rather than the service page: the post covers Xero
  // specifically and is live, where the service page is still a placeholder.
  { source: "/hubspot-integrations/xero", destination: "/insights/hubspot-xero-integration" },
  { source: "/faqs", destination: "/contact" },
  { source: "/platforms", destination: "/solutions" },
  { source: "/platforms/aircall", destination: "/solutions/aircall" },
  // Retired platform pages. Each points at a post commissioned to hold its
  // ranking; until those are published these three land on a 404, so they
  // are the gate on cutover rather than something to discover afterwards.
  { source: "/platforms/attio", destination: "/insights/attio-vs-hubspot" },
  { source: "/platforms/folk", destination: "/insights/folk-vs-hubspot" },
  { source: "/platforms/pandadoc", destination: "/insights/pandadoc-hubspot-integration" },
  { source: "/crm-for-finance", destination: "/industries/financial-services" },
  { source: "/crm-for-non-profits", destination: "/industries/non-profits" },
  { source: "/crm-for-startups-and-saas", destination: "/industries/saas" },
  { source: "/crm-for-property", destination: "/industries/property-development" },
  { source: "/case-studies", destination: "/our-work" },
  { source: "/testimonials", destination: "/our-work" },
  { source: "/case-studies/:slug", destination: "/our-work/:slug" },
  { source: "/blog", destination: "/insights" },
  // The Squarespace post whose slug was an auto-generated id. Renamed for
  // readability, so its old URL needs its own hop — the generic rule below
  // would send it to a slug that no longer exists.
  {
    source: "/blog/5yh0a2hi82nkj6y0w8sonvdqgqtl0e",
    destination: "/insights/mapping-your-tech-ecosystem",
  },
  // Never migrated, so the generic rule below would send each to a slug that
  // does not exist. The hub is a weaker landing than the post would be — if
  // any of these still earn traffic, migrating the post beats this.
  {
    source: "/blog/common-mistakes-when-onboarding-hubspot-and-how-to-prevent-them",
    destination: "/insights",
  },
  {
    source: "/blog/top-hubspot-ai-features-to-accelerate-your-business-in-2025",
    destination: "/insights",
  },
  {
    source: "/blog/why-your-business-needs-marketing-automation-in-2025-before-you-fall-behind",
    destination: "/insights",
  },
  // Squarespace tag archives are two segments, so the post rule cannot match.
  { source: "/blog/tag/:tag*", destination: "/insights" },
  { source: "/blog/:slug", destination: "/insights/:slug" },
  // Events live at /events but sit under About us in the nav.
  { source: "/about-us/events", destination: "/events" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
};

export default nextConfig;
