import type {StructureResolver} from 'sanity/structure'
import {SINGLETON_TYPES} from './schemaTypes'

const singleton = (
  S: Parameters<StructureResolver>[0],
  title: string,
  type: string,
) =>
  S.listItem()
    .title(title)
    .id(type)
    .child(S.document().schemaType(type).documentId(type))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              singleton(S, 'Home', 'homePage'),
              singleton(S, 'Services landing', 'servicesLandingPage'),
              singleton(S, 'Platforms', 'solutionsPage'),
              singleton(S, 'About Us', 'aboutPage'),
              singleton(S, 'Industries hub', 'industriesHubPage'),
              singleton(S, 'Our Work', 'ourWorkPage'),
              singleton(S, 'Insight Hub', 'insightHubPage'),
              singleton(S, 'Contact', 'contactPage'),
              singleton(S, 'Careers', 'careersPage'),
              singleton(S, 'Events', 'eventsPage'),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('industry').title('Industries'),
      S.documentTypeListItem('caseStudy').title('Case studies'),
      S.documentTypeListItem('blogPost').title('Blog posts'),
      S.documentTypeListItem('resource').title('Resources'),
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('hubOffering').title('Hub offerings'),
      S.documentTypeListItem('partnerIntegration').title('Partner integrations'),
      S.divider(),
      S.documentTypeListItem('client').title('Clients (portal)'),
      S.divider(),
      S.documentTypeListItem('teamMember').title('Team members'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      S.documentTypeListItem('legalPage').title('Legal pages'),
      S.divider(),
      singleton(S, 'Site settings', 'siteSettings'),
      singleton(S, 'Portal settings', 'portalSettings'),
    ])

// Keep singletons out of the generic "create new document" flows.
export const singletonTypes = new Set<string>(SINGLETON_TYPES)
