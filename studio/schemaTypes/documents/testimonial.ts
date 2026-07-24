import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(600),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'company',
      title: 'Company',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Direct', value: 'direct'},
          {title: 'Google review', value: 'google'},
          {title: 'HubSpot directory', value: 'hubspot'},
        ],
        layout: 'radio',
      },
      initialValue: 'direct',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'For video testimonial cards (YouTube)',
    }),
    defineField({
      name: 'videoStill',
      title: 'Video still image',
      type: 'imageWithAlt',
      hidden: ({parent}) => !parent?.videoUrl,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'company', media: 'avatar'},
  },
})
