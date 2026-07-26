import {defineField, defineType} from 'sanity'

/**
 * A single benefit card.
 *
 * The icon is a key mapping to a component rather than an uploaded SVG, so
 * the set stays visually consistent and inherits the site's colours — an
 * uploaded file would carry its own fill and break the Deep Blue tile rule.
 */
export const benefit = defineType({
  name: 'benefit',
  title: 'Benefit',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon name',
      type: 'string',
      description: 'Lucide icon name, e.g. "heart", "graduation-cap", "calendar".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
  ],
  preview: {select: {title: 'heading', subtitle: 'body'}},
})
