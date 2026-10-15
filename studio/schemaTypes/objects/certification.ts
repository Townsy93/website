import {defineField, defineType} from 'sanity'

/**
 * A credential we hold — a HubSpot specialist badge, say — shown as a small
 * panel on the pages it is relevant to.
 *
 * Lives on the industry document rather than on each page that shows it. A
 * case study displays its industry's certifications, so a badge earned for
 * property and construction work appears on that industry page and on every
 * case study in the industry from one edit, and cannot drift between them.
 */
export const certification = defineType({
  name: 'certification',
  title: 'Certification',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Badge',
      type: 'imageWithAlt',
      description:
        'Use the badge artwork exactly as HubSpot supplies it. Square with a transparent background is ideal.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "HubSpot Construction Industry Specialist"',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'text',
      title: 'Supporting line',
      type: 'string',
      description: 'Optional. One short sentence.',
      validation: (rule) => rule.max(140),
    }),
  ],
  preview: {
    select: {title: 'title', media: 'image'},
  },
})
