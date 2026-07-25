import {defineArrayMember, defineField, defineType} from 'sanity'

// Partner/integration pages under /solutions (Aircall for now).
export const partnerIntegration = defineType({
  name: 'partnerIntegration',
  title: 'Partner integration',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL: /solutions/[slug]',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pageBuilt',
      title: 'Page is built',
      type: 'boolean',
      initialValue: false,
      description:
        'Off = the page still holds placeholder copy: kept out of the sitemap and marked noindex, so unfinished wording can never be picked up by Google.',
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatItDoes',
      title: 'What the tool does',
      type: 'blockContent',
    }),
    defineField({
      name: 'whatWeSetUp',
      title: 'What Zippily sets up',
      type: 'array',
      of: [defineArrayMember({type: 'iconCard'})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'caseStudy',
      title: 'Case study',
      type: 'reference',
      to: [{type: 'caseStudy'}],
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      to: [{type: 'testimonial'}],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({type: 'faqItem'})],
      validation: (rule) => rule.max(6),
    }),
    defineField({name: 'ctaBanner', title: 'CTA banner', type: 'ctaBanner'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'title'}},
})
