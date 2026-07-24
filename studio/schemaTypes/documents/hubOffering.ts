import {defineField, defineType} from 'sanity'

// The 8 Solutions carousel entries: Sales/Service/Marketing/Content/Revenue/
// Data Hub + Breeze AI + Claude. Also referenced by blogPost.hubs for the
// Insight Hub filter (Claude is excluded from that filter in the UI).
export const hubOffering = defineType({
  name: 'hubOffering',
  title: 'Hub offering',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      initialValue: 'HubSpot Hub',
      description: 'Claude uses "Connected AI partner"',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'One tight paragraph — rendered in page HTML for SEO',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'icon',
      title: 'Icon name',
      type: 'string',
      description: 'Lucide icon name',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'linkedService',
      title: 'Linked service',
      type: 'reference',
      to: [{type: 'service'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured card style (Claude)',
      type: 'boolean',
      initialValue: false,
      description: 'Deep Blue card with orange accents',
    }),
    defineField({
      name: 'order',
      title: 'Carousel order',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {title: 'Carousel order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {select: {title: 'name', subtitle: 'eyebrow'}},
})
