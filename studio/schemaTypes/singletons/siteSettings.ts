import {defineField, defineType} from 'sanity'

// Site-wide values referenced across templates. Nav structure and footer
// link lists are fixed in code (locked IA) — not editable here.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({
      name: 'contactEmail',
      title: 'Contact email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact phone',
      type: 'string',
      validation: (rule) => rule.max(20),
    }),
    defineField({
      name: 'address',
      title: 'Location & hours line',
      type: 'string',
      description:
        'Short line for the contact card, e.g. "Auckland, New Zealand / Mon–Fri, 9am–5pm NZT"',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'businessAddress',
      title: 'Business address',
      type: 'object',
      description: 'Structured address — shown on the Contact page and used for local SEO',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({
          name: 'streetAddress',
          title: 'Street address',
          type: 'string',
          validation: (rule) => rule.max(120),
        }),
        defineField({
          name: 'suburb',
          title: 'Suburb',
          type: 'string',
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
          initialValue: 'Auckland',
          validation: (rule) => rule.max(60),
        }),
        defineField({
          name: 'postcode',
          title: 'Postcode',
          type: 'string',
          validation: (rule) => rule.max(10),
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
          initialValue: 'New Zealand',
          validation: (rule) => rule.max(60),
        }),
      ],
    }),
    defineField({
      name: 'portalUrl',
      title: 'Client portal URL',
      type: 'url',
      description:
        'Adds a "Client login" link to the footer. Leave empty and the link does not appear at all — so this can stay blank until the portal is on its real domain and clients actually have access.',
    }),
    defineField({
      name: 'meetingsUrl',
      title: 'HubSpot meetings URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkedInUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'youTubeUrl',
      title: 'YouTube URL',
      type: 'url',
    }),
    defineField({
      name: 'googleReviewCount',
      title: 'Google review count',
      type: 'number',
      description: 'Verify before publish — used in trust bars site-wide',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'serviceCtaImage',
      title: 'Service-page CTA photo',
      type: 'imageWithAlt',
      description:
        'Background photo behind the "View more services" banner on every service page; plain Deep Blue until set',
    }),
    defineField({
      name: 'happyClients',
      title: 'Happy clients (count)',
      type: 'number',
      description: 'Shown in the About page stats band',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'hubspotReviewCount',
      title: 'HubSpot directory review count',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'newsletterHeading',
      title: 'Footer newsletter heading',
      type: 'string',
      initialValue: 'One useful HubSpot tip a month',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
