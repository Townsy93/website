import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Careers hub (/careers). Structure locked by the Careers brief, which
 * replaced the outstanding card-sort.
 *
 * The hero reuses the shared `hero` object rather than a careers-only shape:
 * it already carries emphasisPhrase and markerStyle, which is exactly the
 * marker-underline treatment the brief asks for on one word of the H1.
 */
export const careersPage = defineType({
  name: 'careersPage',
  title: 'Careers page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'roles', title: 'Open roles'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'pageBuilt',
      title: 'Page is built',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description:
        'Off = the page still holds placeholder copy: kept out of the sitemap and served noindex, so unfinished wording cannot be picked up by Google. The page stays reachable for anyone reviewing it. Turn on once the real copy has landed.',
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      group: 'content',
      description:
        'H1 should carry the keyword and the city — e.g. "Careers at Zippily — HubSpot roles in Auckland". Set the emphasis phrase to the one word carrying the marker.',
    }),

    defineField({
      name: 'storyRows',
      title: 'Who we are',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'storyRow',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Eyebrow',
              type: 'string',
              description: 'Uppercase, e.g. OUR STORY or WHAT SETS US APART.',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 5,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              type: 'imageWithAlt',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'imagePosition',
              title: 'Image position',
              type: 'string',
              initialValue: 'left',
              options: {
                list: [
                  {title: 'Image left', value: 'left'},
                  {title: 'Image right', value: 'right'},
                ],
                layout: 'radio',
              },
              description: 'Alternate these down the page.',
            }),
          ],
          preview: {select: {title: 'eyebrow', media: 'image'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),

    defineField({
      name: 'values',
      title: 'Our values',
      type: 'array',
      group: 'content',
      description:
        'Three at most. The five core values read slightly corporate in full — pick the three strongest and warm the wording.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'valueBlock',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required().max(300),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'body'}},
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'valuesImage',
      title: 'Values image',
      type: 'imageWithAlt',
      group: 'content',
    }),

    defineField({
      name: 'whyIntro',
      title: 'Why work at Zippily — intro',
      type: 'text',
      rows: 4,
      group: 'content',
    }),
    defineField({
      name: 'teamPhoto',
      title: 'Team photo',
      type: 'imageWithAlt',
      group: 'content',
      description: 'Real team photography, not stock. Also reused on vacancy pages.',
    }),
    defineField({
      name: 'benefits',
      title: 'Benefits',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'benefit'})],
      description: 'Shown as a three-column grid. Vacancies fall back to this list.',
    }),

    defineField({
      name: 'lifeVideo',
      title: 'Life at Zippily video',
      type: 'vimeoEmbed',
      group: 'content',
      description:
        'Optional. The whole section is left out if this is empty — better nothing than an empty frame.',
    }),

    defineField({
      name: 'openRolesHeading',
      title: 'Open roles heading',
      type: 'string',
      group: 'roles',
      initialValue: 'Open positions',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'emptyStateMessage',
      title: 'Message when nothing is open',
      type: 'text',
      rows: 2,
      group: 'roles',
      initialValue:
        "No roles open right now — we're always keen to hear from experienced HubSpot people.",
      description: 'Shown with the register-interest form. This section never renders empty.',
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: 'registerInterest',
      title: 'Register interest',
      type: 'object',
      group: 'roles',
      description: 'Always shown, whether or not anything is open.',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          initialValue: 'No role that fits? Tell us anyway.',
          validation: (rule) => rule.max(80),
        }),
        defineField({name: 'body', title: 'Body', type: 'text', rows: 3}),
      ],
    }),

    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Careers page'})},
})
