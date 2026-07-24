import {defineField, defineType} from 'sanity'

// Bottom-of-page CTA banner. One per page maximum (locked rule).
export const ctaBanner = defineType({
  name: 'ctaBanner',
  title: 'CTA banner',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'button',
      title: 'Button',
      type: 'link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showMeetingsEmbed',
      title: 'Embed the HubSpot meetings widget',
      type: 'boolean',
      description: 'Replaces the button with the live booking embed (used on Home)',
      initialValue: false,
    }),
  ],
  preview: {select: {title: 'heading'}},
})
