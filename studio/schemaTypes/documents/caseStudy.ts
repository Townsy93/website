import {defineField, defineType} from 'sanity'
import {slugShape} from '../../lib/slugRules'

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'client',
      title: 'Client name',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'client'},
      description: 'URL: /our-work/[slug]',
      validation: slugShape,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      options: {
        list: [
          {title: 'Live', value: 'live'},
          {title: 'Coming soon', value: 'comingSoon'},
        ],
        layout: 'radio',
      },
      initialValue: 'comingSoon',
      description: '"Coming soon" renders the non-clickable card state on Our Work',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageBuilt',
      title: 'Page is built',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description:
        'Off = the body still holds the copywriter brief: the page is kept out of the sitemap and marked noindex, so unfinished wording can never be picked up by Google. Turn on once the real copy has landed. Separate from Status, which only controls how the card looks on Our Work — a story can be worth listing before its write-up is finished.',
    }),
    // Case cards are tagged by service in Our Work/Services contexts and by
    // industry on Industries pages — both references required (spec D11).
    defineField({
      name: 'service',
      title: 'Service delivered',
      type: 'reference',
      group: 'content',
      to: [{type: 'service'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'reference',
      group: 'content',
      to: [{type: 'industry'}],
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      group: 'content',
      description: 'e.g. "HubSpot and Xero, finally talking to each other."',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'resultLine',
      title: 'One-line result (cards)',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'stats',
      title: 'Key stats',
      type: 'array',
      group: 'content',
      of: [{type: 'stat'}],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'photo',
      title: 'Project photo',
      type: 'imageWithAlt',
      group: 'content',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL (legacy)',
      type: 'url',
      group: 'content',
      description:
        'Old YouTube link. Use the Vimeo field below for anything new — Zippily hosts on Vimeo, and that field handles unlisted links and lazy loading properly.',
    }),
    defineField({
      name: 'videoTestimonial',
      title: 'Video testimonial',
      type: 'vimeoEmbed',
      group: 'content',
      description:
        'Optional. The section is left out entirely if this is empty, rather than showing an empty frame.',
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      group: 'content',
      to: [{type: 'testimonial'}],
    }),
    defineField({
      name: 'body',
      title: 'Story',
      type: 'blockContent',
      group: 'content',
      description: 'Full story for the detail page',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'client', subtitle: 'headline', media: 'photo'},
  },
})
