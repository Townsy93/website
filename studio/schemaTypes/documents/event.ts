import {defineArrayMember, defineField, defineType} from 'sanity'
import {slugShape} from '../../lib/slugRules'

// Zippily Sessions — small, free, in-person HubSpot workshops.
// Powers /events (hub) and /events/[slug] (detail).
// All date display and filter bucketing derives from startDateTime.
export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'when', title: 'When & where'},
    {name: 'registration', title: 'Registration'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      description: 'URL: /events/[slug]',
      validation: slugShape,
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Marketing', value: 'Marketing'},
          {title: 'Sales', value: 'Sales'},
          {title: 'AI', value: 'AI'},
        ],
      },
      description: 'A session tagged Sales + Marketing shows under both filters.',
      validation: (rule) => rule.required().min(1).unique(),
    }),

    // When & where
    defineField({
      name: 'startDateTime',
      title: 'Starts',
      type: 'datetime',
      group: 'when',
      description: 'Displayed in Pacific/Auckland. Drives the Upcoming/This month/Past filters.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDateTime',
      title: 'Ends',
      type: 'datetime',
      group: 'when',
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const start = (context.document as {startDateTime?: string} | undefined)?.startDateTime
          return start && value && value < start ? 'End time must be after the start time' : true
        }),
    }),
    defineField({
      name: 'venueType',
      title: 'Venue type',
      type: 'string',
      group: 'when',
      options: {
        list: [
          {title: 'In person', value: 'in-person'},
          {title: 'Online', value: 'online'},
        ],
        layout: 'radio',
      },
      initialValue: 'in-person',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venueName',
      title: 'Venue name',
      type: 'string',
      group: 'when',
      hidden: ({document}) => document?.venueType === 'online',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
      group: 'when',
      description: 'Full address, one line per line break',
      hidden: ({document}) => document?.venueType === 'online',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'shortLocation',
      title: 'Short location (cards)',
      type: 'string',
      group: 'when',
      description: 'e.g. "Newmarket, Auckland" — used in the card meta line',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'geo',
      title: 'Map location',
      type: 'geopoint',
      group: 'when',
      description: 'Drives the map thumbnail and the "Get directions" link',
      hidden: ({document}) => document?.venueType === 'online',
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      group: 'when',
      description: 'e.g. Google Meet, Zoom (online sessions only)',
      hidden: ({document}) => document?.venueType !== 'online',
      validation: (rule) => rule.max(60),
    }),

    // Content
    defineField({
      name: 'heroImage',
      title: 'Header image',
      type: 'imageWithAlt',
      group: 'content',
    }),
    defineField({
      name: 'cardImage',
      title: 'Card image',
      type: 'imageWithAlt',
      group: 'content',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description (cards)',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      group: 'content',
      description:
        'Use the Marker style on a phrase to give it the hand-drawn underline treatment.',
    }),
    defineField({
      name: 'whatToExpect',
      title: 'What to expect',
      type: 'array',
      group: 'content',
      description: 'Optional — the whole module is hidden when empty',
      of: [
        defineArrayMember({
          name: 'expectItem',
          title: 'Item',
          type: 'object',
          fields: [
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
              validation: (rule) => rule.required().max(90),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required().max(300),
            }),
          ],
          preview: {select: {title: 'heading', subtitle: 'body'}},
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'host',
      title: 'Host',
      type: 'reference',
      group: 'content',
      to: [{type: 'teamMember'}],
      description: 'Pulls name, role, photo and LinkedIn from the team member',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hostIntro',
      title: 'Host intro line',
      type: 'string',
      group: 'content',
      description: 'One line of personality for the "Hosted by" card',
      validation: (rule) => rule.max(200),
    }),

    // Registration
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
      group: 'registration',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'spotsRemaining',
      title: 'Spots remaining',
      type: 'number',
      group: 'registration',
      description:
        '0 switches the page to waitlist mode; 3 or fewer shows the "Only N spots left" emphasis.',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'registrationClosesAt',
      title: 'Registrations close at',
      type: 'datetime',
      group: 'registration',
      description: 'Optional — once passed, the panel shows "Registrations have closed"',
    }),
    defineField({
      name: 'price',
      title: 'Price (NZD)',
      type: 'number',
      group: 'registration',
      description: 'Leave empty for free sessions',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'recap',
      title: 'Recap post',
      type: 'reference',
      group: 'content',
      to: [{type: 'blogPost'}],
      description: 'Optional — drives "Read the recap →" on past-session rows',
    }),

    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {
      title: 'Date, soonest first',
      name: 'startAsc',
      by: [{field: 'startDateTime', direction: 'asc'}],
    },
    {
      title: 'Date, newest first',
      name: 'startDesc',
      by: [{field: 'startDateTime', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'title', date: 'startDateTime', media: 'cardImage'},
    prepare: ({title, date, media}) => ({
      title,
      subtitle: date ? new Date(date).toLocaleDateString('en-NZ') : 'No date',
      media,
    }),
  },
})
