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
      title: 'Location line',
      type: 'string',
      description: 'e.g. "Auckland, New Zealand / Mon–Fri, 9am–5pm NZT"',
      validation: (rule) => rule.max(120),
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
