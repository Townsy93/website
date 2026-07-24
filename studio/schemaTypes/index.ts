// Objects
import {blockContent} from './objects/blockContent'
import {ctaBanner} from './objects/ctaBanner'
import {faqItem} from './objects/faqItem'
import {hero} from './objects/hero'
import {iconCard} from './objects/iconCard'
import {imageWithAlt} from './objects/imageWithAlt'
import {link} from './objects/link'
import {pricing, pricingTier} from './objects/pricing'
import {seo} from './objects/seo'
import {stat} from './objects/stat'

// Documents
import {blogPost} from './documents/blogPost'
import {caseStudy} from './documents/caseStudy'
import {event} from './documents/event'
import {hubOffering} from './documents/hubOffering'
import {industry} from './documents/industry'
import {legalPage} from './documents/legalPage'
import {partnerIntegration} from './documents/partnerIntegration'
import {resource} from './documents/resource'
import {service} from './documents/service'
import {teamMember} from './documents/teamMember'
import {testimonial} from './documents/testimonial'

// Singletons
import {aboutPage} from './singletons/aboutPage'
import {careersPage} from './singletons/careersPage'
import {contactPage} from './singletons/contactPage'
import {eventsPage} from './singletons/eventsPage'
import {homePage} from './singletons/homePage'
import {industriesHubPage} from './singletons/industriesHubPage'
import {insightHubPage} from './singletons/insightHubPage'
import {ourWorkPage} from './singletons/ourWorkPage'
import {servicesLandingPage} from './singletons/servicesLandingPage'
import {siteSettings} from './singletons/siteSettings'
import {solutionsPage} from './singletons/solutionsPage'

export const SINGLETON_TYPES = [
  'homePage',
  'servicesLandingPage',
  'solutionsPage',
  'aboutPage',
  'industriesHubPage',
  'ourWorkPage',
  'insightHubPage',
  'contactPage',
  'careersPage',
  'eventsPage',
  'siteSettings',
] as const

export const schemaTypes = [
  // objects
  link,
  imageWithAlt,
  hero,
  ctaBanner,
  faqItem,
  stat,
  pricingTier,
  pricing,
  iconCard,
  seo,
  blockContent,
  // documents
  service,
  industry,
  caseStudy,
  blogPost,
  teamMember,
  hubOffering,
  partnerIntegration,
  resource,
  testimonial,
  event,
  legalPage,
  // singletons
  homePage,
  servicesLandingPage,
  solutionsPage,
  aboutPage,
  industriesHubPage,
  ourWorkPage,
  insightHubPage,
  contactPage,
  careersPage,
  eventsPage,
  siteSettings,
]
