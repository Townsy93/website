import {defineField, defineType} from 'sanity'

// Structure pending card-sort (tracker). Minimal fields for now — expand
// once the section order is confirmed. Do not build ahead of that decision.
export const careersPage = defineType({
  name: 'careersPage',
  title: 'Careers page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
    }),
    defineField({
      name: 'intro',
      title: 'Intro copy',
      type: 'blockContent',
    }),
    defineField({name: 'ctaBanner', title: 'CTA banner', type: 'ctaBanner'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Careers page'})},
})
