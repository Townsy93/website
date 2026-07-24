import {defineField, defineType} from 'sanity'

// Zippily Sessions etc. Managed manually in Sanity (Humanatix dropped).
// The Events page structure is still pending card-sort — this type covers
// the listing data only.
export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'date',
      title: 'Date & time',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration URL',
      type: 'url',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
    }),
  ],
  orderings: [
    {title: 'Date, newest first', name: 'dateDesc', by: [{field: 'date', direction: 'desc'}]},
  ],
  preview: {select: {title: 'title', subtitle: 'location'}},
})
