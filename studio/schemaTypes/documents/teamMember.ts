import {defineArrayMember, defineField, defineType} from 'sanity'

// Fields mirror the About page team-card hover panel (inventory M13).
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
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
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'imageWithAlt',
      description: 'Circular crop on the About page',
    }),
    defineField({
      name: 'bio',
      title: 'Short bio',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'outsideWork',
      title: 'Outside work',
      type: 'string',
      description: 'e.g. "runs a movie club and plays social football"',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'favouriteHubSpotFeature',
      title: 'Favourite HubSpot feature',
      type: 'string',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'whyTheyLoveHubSpot',
      title: 'Why they love HubSpot',
      type: 'string',
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'linkedIn',
      title: 'LinkedIn URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'photo'},
  },
})
