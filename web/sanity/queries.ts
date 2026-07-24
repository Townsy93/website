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

export const SERVICE_SLUGS_QUERY = defineQuery(
  `*[_type == "service" && defined(slug.current)].slug.current`,
);

export const SERVICE_QUERY = defineQuery(
  `*[_type == "service" && slug.current == $slug][0]{
    ...,
    caseStudy->{_id, client, slug, headline, resultLine, photo, status},
    testimonial->{_id, quote, name, role, company, avatar},
    relatedServices[]->{_id, title, slug, icon, shortDescription}
  }`,
);

export const SOLUTIONS_PAGE_QUERY = defineQuery(
  `*[_type == "solutionsPage"][0]{
    ...,
    relatedCaseStudy->{_id, client, slug, headline, resultLine, photo, status, service->{title}}
  }`,
);

export const HUB_OFFERINGS_QUERY = defineQuery(
  `*[_type == "hubOffering"] | order(order asc){
    _id, name, eyebrow, description, icon, isFeatured,
    linkedService->{title, slug}
  }`,
);

export const INDUSTRIES_HUB_QUERY = defineQuery(
  `*[_type == "industriesHubPage"][0]{
    ...,
    industries[]->{_id, title, slug, icon, shortDescription, pageBuilt},
    caseStudies[]->{_id, client, slug, headline, resultLine, photo, status, industry->{title}}
  }`,
);

export const INDUSTRY_SLUGS_QUERY = defineQuery(
  `*[_type == "industry" && defined(slug.current)].slug.current`,
);

export const INDUSTRY_QUERY = defineQuery(
  `*[_type == "industry" && slug.current == $slug][0]{
    ...,
    caseStudy->{_id, client, slug, headline, resultLine, photo, status},
    testimonial->{_id, quote, name, role, company, avatar}
  }`,
);

export const OUR_WORK_QUERY = defineQuery(
  `*[_type == "ourWorkPage"][0]{
    ...,
    caseStudies[]->{_id, client, slug, headline, resultLine, photo, status, service->{title}},
    videoTestimonials[]->{_id, quote, name, company, videoUrl, videoStill},
    googleReviews[]->{_id, quote, name, company}
  }`,
);

export const CASE_STUDY_SLUGS_QUERY = defineQuery(
  `*[_type == "caseStudy" && defined(slug.current)].slug.current`,
);

export const CASE_STUDY_QUERY = defineQuery(
  `*[_type == "caseStudy" && slug.current == $slug][0]{
    ...,
    service->{title, slug},
    industry->{title, slug},
    testimonial->{_id, quote, name, role, company, avatar}
  }`,
);

export const INSIGHT_HUB_QUERY = defineQuery(
  `*[_type == "insightHubPage"][0]{
    ...,
    featuredPost->{
      _id, title, slug, topic, excerpt, coverImage, publishedAt, readTime,
      hubs[]->{name}, author->{name, photo}
    }
  }`,
);

export const ALL_POSTS_QUERY = defineQuery(
  `*[_type == "blogPost"] | order(publishedAt desc){
    _id, title, slug, topic, excerpt, coverImage, publishedAt, readTime,
    hubs[]->{name}
  }`,
);

export const POST_SLUGS_QUERY = defineQuery(
  `*[_type == "blogPost" && defined(slug.current)].slug.current`,
);

export const RESOURCES_QUERY = defineQuery(
  `*[_type == "resource"] | order(order asc){
    _id, title, slug, summaryBullets, updatedAt, readTimeMinutes,
    landingPageHref, category,
    author->{name, photo},
    relatedPost->{title, slug}
  }`,
);

export const LEGAL_PAGE_QUERY = defineQuery(
  `*[_type == "legalPage" && slug.current == $slug][0]`,
);

export const PARTNER_INTEGRATION_QUERY = defineQuery(
  `*[_type == "partnerIntegration" && slug.current == $slug][0]{
    ...,
    caseStudy->{_id, client, slug, headline, resultLine, photo, status},
    testimonial->{_id, quote, name, role, company, avatar}
  }`,
);

export const PARTNER_INTEGRATION_SLUGS_QUERY = defineQuery(
  `*[_type == "partnerIntegration" && defined(slug.current)].slug.current`,
);

export const POST_QUERY = defineQuery(
  `*[_type == "blogPost" && slug.current == $slug][0]{
    ...,
    hubs[]->{name},
    author->{name, role, photo},
    "related": *[_type == "blogPost" && slug.current != $slug] | order(publishedAt desc)[0...3]{
      _id, title, slug, topic, coverImage, publishedAt, readTime
    }
  }`,
);
