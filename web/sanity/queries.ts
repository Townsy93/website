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
    caseStudies[]->{_id, client, slug, headline, resultLine, photo, status, service->{title}},
    testimonial->{_id, quote, name, role, company}
  }`,
);

export const ABOUT_PAGE_QUERY = defineQuery(
  `*[_type == "aboutPage"][0]{
    ...,
    team[]->{_id, name, role, pronouns, photo, bio, outsideWork, skills, favouriteHubSpotFeature, whyTheyLoveHubSpot, linkedIn},
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
    pricingTable->{confirmed, tiers, fallbackText},
    caseStudy->{_id, client, slug, headline, resultLine, photo, status, stats, videoUrl},
    testimonial->{_id, quote, name, role, company, avatar},
    relatedServices[]->{_id, title, slug, icon, shortDescription},
    relatedPosts[]->{_id, title, slug, excerpt, coverImage, publishedAt, readTime}
  }`,
);

export const SOLUTIONS_PAGE_QUERY = defineQuery(
  `*[_type == "solutionsPage"][0]{
    ...,
    relatedCaseStudy->{_id, client, slug, headline, resultLine, photo, status, stats, service->{title}},
    "aircall": *[_type == "partnerIntegration" && slug.current == "aircall"][0]{
      title, shortDescription, slug, "image": hero.image
    }
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

// The homepage trust-strip logos, reused inside the retainer page hero.
export const TRUST_LOGOS_QUERY = defineQuery(
  `*[_type == "homePage"][0].trustLogos`,
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

// The three cards that close a case study page — never the page itself.
// "live" sorts after "comingSoon" so status desc leads with live stories;
// coming-soon cards only ever fill out an incomplete row.
export const RELATED_CASE_STUDIES_QUERY = defineQuery(
  `*[_type == "caseStudy" && defined(slug.current) && slug.current != $slug]
    | order(status desc, client asc)[0...3]{
      _id, client, slug, resultLine, photo, status, service->{title}
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

// Shared projection for anything rendering an event card.
const EVENT_CARD_FIELDS = `
  _id, title, slug, categories, startDateTime, endDateTime, venueType,
  shortLocation, shortDescription, cardImage, capacity, spotsRemaining
`;

export const EVENTS_PAGE_QUERY = defineQuery(
  `{
    "page": *[_type == "eventsPage"][0],
    "upcoming": *[_type == "event" && startDateTime >= now()] | order(startDateTime asc){
      ${EVENT_CARD_FIELDS}
    },
    "past": *[_type == "event" && startDateTime < now()] | order(startDateTime desc)[0...5]{
      ${EVENT_CARD_FIELDS},
      recap->{title, slug}
    }
  }`,
);

export const EVENT_SLUGS_QUERY = defineQuery(
  `*[_type == "event" && defined(slug.current)].slug.current`,
);

export const EVENT_QUERY = defineQuery(
  `{
    "event": *[_type == "event" && slug.current == $slug][0]{
      ...,
      host->{name, role, photo, linkedIn},
      recap->{title, slug}
    },
    "others": *[_type == "event" && slug.current != $slug && startDateTime >= now()]
      | order(startDateTime asc)[0...2]{ ${EVENT_CARD_FIELDS} }
  }`,
);

export const RESOURCES_QUERY = defineQuery(
  `*[_type == "resource"] | order(order asc){
    _id, title, slug, summaryBullets, updatedAt, readTimeMinutes,
    landingPageHref, category,
    "fileUrl": fileAsset.asset->url,
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

export const CAREERS_PAGE_QUERY = defineQuery(
  `*[_type == "careersPage"][0]{
    ...,
    "openRoles": *[_type == "vacancy" && status == "open" && defined(slug.current)]
      | order(publishedAt desc){
        _id, title, slug, summary, workArrangement, employmentType, location, department
      }
  }`,
);

export const VACANCY_QUERY = defineQuery(
  `*[_type == "vacancy" && slug.current == $slug][0]{
    ...,
    "sharedBenefits": *[_type == "careersPage"][0].benefits,
    "teamPhoto": *[_type == "careersPage"][0].teamPhoto,
    "registerInterest": *[_type == "careersPage"][0].registerInterest,
    "related": *[_type == "vacancy" && status == "open" && slug.current != $slug]
      | order(publishedAt desc)[0...3]{
        _id, title, slug, summary, workArrangement, employmentType, location
      }
  }`,
);

// Every vacancy, including closed ones: a closed role keeps its URL so the
// page can say the role is filled rather than 404ing a link someone shared.
export const VACANCY_SLUGS_QUERY = defineQuery(
  `*[_type == "vacancy" && defined(slug.current)].slug.current`,
);

// Sitemap and Google Jobs only ever see open roles.
export const OPEN_VACANCY_SLUGS_QUERY = defineQuery(
  `*[_type == "vacancy" && status == "open" && defined(slug.current)]{
    "slug": slug.current, _updatedAt
  }`,
);

export const LANDING_PAGE_QUERY = defineQuery(
  `*[_type == "landingPage" && slug.current == $slug][0]{
    ...,
    testimonial->{_id, quote, name, role, company, avatar}
  }`,
);

export const LANDING_PAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "landingPage" && defined(slug.current)].slug.current`,
);

// Only finished pages. A campaign page still in draft must not be crawled.
export const BUILT_LANDING_PAGES_QUERY = defineQuery(
  `*[_type == "landingPage" && defined(slug.current) && pageBuilt == true]{
    "slug": slug.current, _updatedAt
  }`,
);

// The live popup. Most recently updated wins if more than one is enabled, so
// "which one is showing?" has a definite answer rather than depending on
// document order.
export const POPUP_QUERY = defineQuery(
  `*[_type == "popup" && enabled == true]|order(_updatedAt desc)[0]{
    _id, heading, body, mode, buttonLabel, ctaHref, successMessage,
    triggerType, triggerSeconds, triggerPercent, showAgainAfterDays,
    includePaths, excludePaths,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt
  }`,
);
