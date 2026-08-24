import {defineArrayMember, defineField, defineType} from 'sanity'
import {SERVICE_CATEGORIES} from '../constants'

export const servicesLandingPage = defineType({
  name: 'servicesLandingPage',
  title: 'Services landing page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'gridHeading',
      title: 'Service grid heading',
      type: 'string',
      group: 'content',
      description: '11 cards render (Marketing Automation appears twice) — write the copy accordingly',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'gridIntro',
      title: 'Service grid intro',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.max(240),
    }),
    // Cards are separate from service docs because Marketing Automation
    // appears as two cards (Strategy/Discover + Implementation/Build) linking
    // to the same page via anchors. No pricing on cards (ruling D2).
    defineField({
      name: 'serviceCards',
      title: 'Service cards',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          name: 'serviceCard',
          title: 'Service card',
          type: 'object',
          fields: [
            defineField({
              name: 'service',
              title: 'Service',
              type: 'reference',
              to: [{type: 'service'}],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'titleOverride',
              title: 'Title override',
              type: 'string',
              description: 'e.g. "Marketing automation — strategy"',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'descriptionOverride',
              title: 'Description override',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.max(200),
            }),
            defineField({
              name: 'categoryOverride',
              title: 'Category override',
              type: 'string',
              options: {list: [...SERVICE_CATEGORIES], layout: 'radio'},
              description: 'Only needed when it differs from the service’s own category',
            }),
            defineField({
              name: 'anchor',
              title: 'Anchor',
              type: 'string',
              description: 'Optional #anchor appended to the service URL',
              validation: (rule) => rule.max(40),
            }),
          ],
          preview: {
            select: {title: 'titleOverride', serviceTitle: 'service.title'},
            prepare: ({title, serviceTitle}) => ({title: title || serviceTitle}),
          },
        }),
      ],
      validation: (rule) => rule.max(11),
    }),
    defineField({
      name: 'whyHeading',
      title: '"Why Zippily" heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'whyCards',
      title: '"Why Zippily" value cards',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'iconCard'})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'caseStudies',
      title: 'Case studies teaser',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: 'stats',
      title: 'Stats',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'stat'})],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'faqItem'})],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      group: 'content',
      to: [{type: 'testimonial'}],
      description: 'Optional — the quote section is dropped entirely when empty',
    }),
    defineField({name: 'ctaBanner', title: 'CTA banner', type: 'ctaBanner', group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Services landing page'})},
})
