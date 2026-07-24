import {defineField, defineType} from 'sanity'

// A CTA button/link. Internal path (e.g. /contact) or external URL.
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'href',
      title: 'URL or path',
      type: 'string',
      description: 'Internal path (/contact) or full URL (https://…)',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          if (value.startsWith('/') || value.startsWith('#')) return true
          try {
            const url = new URL(value)
            return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)
              ? true
              : 'Use http(s), mailto:, tel:, an internal path (/…) or anchor (#…)'
          } catch {
            return 'Use an internal path (/…), anchor (#…) or a full URL'
          }
        }),
    }),
  ],
})
