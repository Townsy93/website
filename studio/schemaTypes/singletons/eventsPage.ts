import {defineField, defineType} from 'sanity'

// Structure pending card-sort (tracker). Events themselves are `event`
// documents, listed automatically — this holds page-level copy only.
export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events page',
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
  preview: {prepare: () => ({title: 'Events page'})},
})
