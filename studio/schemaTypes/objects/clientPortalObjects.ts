import {defineArrayMember, defineField, defineType} from 'sanity'

// Objects owned by the `client` document (the portal's client record).

export const stakeholder = defineType({
  name: 'stakeholder',
  title: 'Stakeholder',
  type: 'object',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full name',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'isPortalAdmin',
      title: 'Portal admin',
      type: 'boolean',
      description: 'Can invite other people from the allowed email domains',
      initialValue: false,
    }),
  ],
  preview: {
    select: {title: 'fullName', subtitle: 'email', admin: 'isPortalAdmin'},
    prepare: ({title, subtitle, admin}) => ({
      title: admin ? `${title} · portal admin` : title,
      subtitle,
    }),
  },
})

export const recommendation = defineType({
  name: 'recommendation',
  title: 'Recommendation',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'horizon',
      title: 'Horizon',
      type: 'string',
      options: {
        list: [
          {title: 'Short term', value: 'shortTerm'},
          {title: 'Long term', value: 'longTerm'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Proposed', value: 'proposed'},
          {title: 'Accepted', value: 'accepted'},
          {title: 'Declined', value: 'declined'},
          {title: 'Done', value: 'done'},
        ],
      },
      initialValue: 'proposed',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dateAdded',
      title: 'Date added',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'status'}},
})

export const featureSuggestion = defineType({
  name: 'featureSuggestion',
  title: 'Feature suggestion',
  type: 'object',
  fields: [
    defineField({
      name: 'featureName',
      title: 'Feature name',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'relatedHub',
      title: 'Related Hub',
      type: 'reference',
      to: [{type: 'hubOffering'}],
    }),
    defineField({
      name: 'howItWorks',
      title: 'How it works',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'whyWeSuggestIt',
      title: 'Why we suggest it',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: 'High', value: 'high'},
          {title: 'Medium', value: 'medium'},
          {title: 'Low', value: 'low'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
  ],
  preview: {select: {title: 'featureName', subtitle: 'priority'}},
})

export const meetingRecord = defineType({
  name: 'meetingRecord',
  title: 'Meeting record',
  type: 'object',
  fields: [
    defineField({
      name: 'meetingDate',
      title: 'Date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'recordingUrl',
      title: 'Recording URL',
      type: 'url',
    }),
    defineField({
      name: 'attendees',
      title: 'Attendees',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'meetingDate'},
  },
})

export const hubspotLicensing = defineType({
  name: 'hubspotLicensing',
  title: 'HubSpot licensing',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'hubs',
      title: 'Hubs',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'hubOffering'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: {
        list: [
          {title: 'Free', value: 'free'},
          {title: 'Starter', value: 'starter'},
          {title: 'Professional', value: 'professional'},
          {title: 'Enterprise', value: 'enterprise'},
        ],
      },
    }),
    defineField({
      name: 'seats',
      title: 'Seats',
      type: 'number',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'renewalDate',
      title: 'Renewal date',
      type: 'date',
    }),
  ],
})
