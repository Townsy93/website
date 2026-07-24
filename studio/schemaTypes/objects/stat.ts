import {defineField, defineType} from 'sanity'

export const stat = defineType({
  name: 'stat',
  title: 'Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'e.g. "23", "40+", "3 weeks". Real values only — no TBC placeholders in production.',
      validation: (rule) =>
        rule
          .required()
          .max(12)
          .custom((value) =>
            value && /tbc|tbd|placeholder/i.test(value)
              ? 'Replace the placeholder with a verified value before publishing'
              : true,
          ),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (rule) => rule.required().max(90),
    }),
  ],
  preview: {select: {title: 'value', subtitle: 'label'}},
})
