import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings"][0]`,
);

export const HOME_PAGE_QUERY = defineQuery(
  `*[_type == "homePage"][0]{
    ...,
    featuredServices[]->{_id, title, slug, icon, shortDescription, whoItsFor},
    featuredCaseStudy->{_id, client, slug, headline, resultLine, stats, photo, videoUrl, service->{title}},
    testimonials[]->{_id, quote, name, role, company, avatar},
    featuredIndustries[]->{_id, title, slug, icon, shortDescription, pageBuilt}
  }`,
);

export const SERVICES_LANDING_QUERY = defineQuery(
  `*[_type == "servicesLandingPage"][0]{
    ...,
    serviceCards[]{
      ...,
      service->{_id, title, slug, category, icon, shortDescription, whoItsFor}
    },
    caseStudies[]->{_id, client, slug, headline, resultLine, photo, status, service->{title}}
  }`,
);

export const ABOUT_PAGE_QUERY = defineQuery(
  `*[_type == "aboutPage"][0]{
    ...,
    team[]->{_id, name, role, photo, bio, outsideWork, skills, favouriteHubSpotFeature, whyTheyLoveHubSpot, linkedIn},
    testimonials[]->{_id, quote, name, role, company, avatar}
  }`,
);

export const CONTACT_PAGE_QUERY = defineQuery(
  `*[_type == "contactPage"][0]`,
);

export const LATEST_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost"] | order(publishedAt desc)[0...3]{
    _id, title, slug, topic, excerpt, coverImage, publishedAt, readTime,
    hubs[]->{name}
  }`,
);
