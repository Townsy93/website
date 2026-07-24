import {defineField, defineType} from 'sanity'
import {MARKER_STYLES} from '../constants'

// Hero content. The layout variant (dark centred / split / breadcrumb / light)
// is decided by the page template, not the editor — see inventory §3.
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'emphasisPhrase',
      title: 'Emphasised phrase',
      type: 'string',
      description: 'Exact phrase within the heading that gets the hand-drawn marker treatment',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true
          const heading = (context.parent as {heading?: string} | undefined)?.heading
          return heading && !heading.includes(value)
            ? 'Must appear verbatim inside the heading'
            : true
        }),
    }),
    defineField({
      name: 'markerStyle',
      title: 'Marker style',
      type: 'string',
      options: {list: [...MARKER_STYLES], layout: 'radio'},
      initialValue: 'circle',
      hidden: ({parent}) => !parent?.emphasisPhrase,
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      description: 'Only rendered by split/light hero templates',
    }),
    defineField({name: 'primaryCta', title: 'Primary CTA', type: 'link'}),
    defineField({name: 'secondaryCta', title: 'Secondary CTA', type: 'link'}),
  ],
  preview: {
    select: {title: 'heading', subtitle: 'eyebrow'},
  },
})
