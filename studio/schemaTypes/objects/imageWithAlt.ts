import {defineField, defineType} from 'sanity'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'displayWidth',
      title: 'Display width (px)',
      type: 'number',
      description:
        'Optional. Leave empty and the layout picks the right size for each breakpoint, which is almost always what you want. Set it only to override a specific placement — a value that fights the grid will just be scaled back down.',
      validation: (rule) => rule.min(80).max(2400),
    }),
    defineField({
      name: 'displayHeight',
      title: 'Display height (px)',
      type: 'number',
      description:
        'Optional. Used with display width to set the crop shape. Use the hotspot tool above to choose what stays in frame.',
      validation: (rule) => rule.min(80).max(2400),
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      validation: (rule) => rule.required().max(160),
    }),
  ],
})
