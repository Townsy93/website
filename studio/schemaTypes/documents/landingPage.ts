import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Campaign landing page. URL: /lp/[slug]
 *
 * Deliberately not part of the main site's navigation, and the template
 * suppresses the nav entirely — the only things a visitor can do are convert
 * or leave. That is the whole point of a landing page, so there is no field
 * to turn the nav back on.
 */
export const landingPage = defineType({
  name: 'landingPage',
  title: 'Landing page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'form', title: 'Form'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Only for finding it in this list. Not rendered.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      description: 'URL: /lp/[slug]',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageBuilt',
      title: 'Page is built',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description:
        'Off = placeholder copy, so the page is noindexed and kept out of the sitemap. It still loads, so a campaign link can be tested before launch.',
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'valueProps',
      title: 'What they get',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'iconCard'})],
      description: 'Three or four. Concrete deliverables, not adjectives.',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'proofStat',
      title: 'Proof stat',
      type: 'stat',
      group: 'content',
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      group: 'content',
      to: [{type: 'testimonial'}],
      description: 'Optional. The section is left out entirely when empty.',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'faqItem'})],
      description:
        'Objection handling. On a landing page these earn their place — every unanswered doubt is a lost conversion.',
      validation: (rule) => rule.max(6),
    }),

    defineField({
      name: 'formHeading',
      title: 'Form heading',
      type: 'string',
      group: 'form',
      initialValue: 'Book your free HubSpot audit',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'formBody',
      title: 'Form supporting line',
      type: 'text',
      rows: 2,
      group: 'form',
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'campaignName',
      title: 'Campaign name',
      type: 'string',
      group: 'form',
      description:
        'Submitted to HubSpot as zippily_campaign so leads from this page can be told apart from general contact enquiries.',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'successHeading',
      title: 'Success heading',
      type: 'string',
      group: 'form',
      initialValue: "Got it — we'll be in touch.",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'successBody',
      title: 'Success message',
      type: 'text',
      rows: 2,
      group: 'form',
      validation: (rule) => rule.max(240),
    }),

    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', built: 'pageBuilt'},
    prepare({title, slug, built}) {
      return {
        title,
        subtitle: `${built ? '● Live' : '○ Placeholder'} · /lp/${slug ?? ''}`,
      }
    },
  },
})
