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
  { source: "/hubspot-integrations/xero", destination: "/services/websites-and-integrations" },
  { source: "/platforms/aircall", destination: "/solutions/aircall" },
  { source: "/crm-for-finance", destination: "/industries/financial-services" },
  { source: "/crm-for-non-profits", destination: "/industries/non-profits" },
  { source: "/crm-for-startups-and-saas", destination: "/industries/saas" },
  { source: "/crm-for-property", destination: "/industries/property-development" },
  { source: "/case-studies", destination: "/our-work" },
  { source: "/testimonials", destination: "/our-work" },
  { source: "/case-studies/:slug", destination: "/our-work/:slug" },
  { source: "/blog", destination: "/insights" },
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
