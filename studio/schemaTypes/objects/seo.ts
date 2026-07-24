import {defineField, defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      validation: (rule) => rule.max(60).warning('Keep under 60 characters'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep under 160 characters'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
