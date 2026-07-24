import {defineArrayMember, defineField, defineType} from 'sanity'

export const solutionsPage = defineType({
  name: 'solutionsPage',
  title: 'Solutions page',
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
      name: 'carouselHeading',
      title: 'Carousel heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'carouselIntro',
      title: 'Carousel intro',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.max(240),
    }),
    // The 8 hubOffering docs render in their own `order` — no ref list needed here.
    defineField({
      name: 'optimiseHeading',
      title: '"How we optimise" heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'optimiseIntro',
      title: '"How we optimise" intro',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'optimiseCards',
      title: '"How we optimise" cards',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'iconCard'})],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'relatedCaseStudy',
      title: 'Related case study',
      type: 'reference',
      group: 'content',
      to: [{type: 'caseStudy'}],
    }),
    defineField({name: 'ctaBanner', title: 'CTA banner', type: 'ctaBanner', group: 'content'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Solutions page'})},
})
