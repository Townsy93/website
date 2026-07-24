import {defineArrayMember, defineField, defineType} from 'sanity'

export const insightHubPage = defineType({
  name: 'insightHubPage',
  title: 'Insight Hub page',
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
      name: 'featuredPost',
      title: 'Featured post',
      type: 'reference',
      group: 'content',
      to: [{type: 'blogPost'}],
      description: 'Leave empty to feature the latest post automatically',
    }),
    defineField({
      name: 'resourcesHeading',
      title: 'Resources teaser heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'resources',
      title: 'Resource teaser cards',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          name: 'resourceCard',
          title: 'Resource',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required().max(80),
            }),
            defineField({name: 'link', title: 'Link', type: 'link'}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'newsletterHeading',
      title: 'Newsletter band heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'newsletterText',
      title: 'Newsletter band text',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.max(240),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Insight Hub page'})},
})
