import {defineField, defineType} from 'sanity'

// Privacy policy, terms — rich text only, template applies site chrome.
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL: /[slug] (e.g. privacy-policy)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {select: {title: 'title'}},
})
