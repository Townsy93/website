import {defineField, defineType} from 'sanity'

// Generic title+text card used by: process steps, pain points, value cards,
// numbered value props, checklist-style trios (modules M6, M19, M20, M22).
// The rendering template decides the visual treatment.
export const iconCard = defineType({
  name: 'iconCard',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: 'icon',
      title: 'Icon name',
      type: 'string',
      description: 'Lucide icon name (e.g. "bar-chart-3"). Optional — some card styles have no icon.',
      validation: (rule) => rule.max(40),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})
