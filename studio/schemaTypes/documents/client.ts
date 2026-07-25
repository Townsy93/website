import {defineArrayMember, defineField, defineType} from 'sanity'

// The portal's client record. Lives in the main Sanity project so the portal
// and the marketing site share one source of truth for team members and hubs.
//
// Two fields are load-bearing for security, not just content:
//   portalStatus — 'suspended' cuts access immediately, with no deploy.
//   emailDomains — the invite allowlist. An admin cannot invite outside it.
export const client = defineType({
  name: 'client',
  title: 'Client',
  type: 'document',
  groups: [
    {name: 'engagement', title: 'Engagement', default: true},
    {name: 'people', title: 'People'},
    {name: 'systems', title: 'Systems'},
    {name: 'billing', title: 'Billing'},
    {name: 'portal', title: 'Portal content'},
  ],
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client name',
      type: 'string',
      group: 'engagement',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'engagement',
      options: {source: 'clientName'},
      description: 'Internal identifier. Portal URLs never carry a client identifier.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'clientLogo',
      title: 'Client logo',
      type: 'image',
      group: 'engagement',
      options: {hotspot: true},
    }),
    defineField({
      name: 'engagementType',
      title: 'Engagement type',
      type: 'string',
      group: 'engagement',
      options: {
        list: [
          {title: 'Project', value: 'project'},
          {title: 'Retainer', value: 'retainer'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      // Not in the original field list, but the Overview screen's engagement
      // summary reads "Retainer · 20 hours a month · Started June 2026".
      name: 'retainerHoursPerMonth',
      title: 'Retainer hours per month',
      type: 'number',
      group: 'engagement',
      hidden: ({document}) => document?.engagementType !== 'retainer',
      validation: (rule) => rule.min(0).max(500),
    }),
    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'date',
      group: 'engagement',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'date',
      group: 'engagement',
      validation: (rule) =>
        rule.custom((value, context) => {
          const start = (context.document as {startDate?: string} | undefined)?.startDate
          return value && start && value < start
            ? 'End date must be after the start date'
            : true
        }),
    }),
    defineField({
      name: 'portalStatus',
      title: 'Portal status',
      type: 'string',
      group: 'engagement',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Suspended', value: 'suspended'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      description:
        'Suspended blocks portal access immediately — no deploy required.',
      validation: (rule) => rule.required(),
    }),

    // People
    defineField({
      name: 'emailDomains',
      title: 'Allowed email domains',
      type: 'array',
      group: 'people',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Invite allowlist. Domain only, no @ — e.g. "novatedleaseaustralia.com.au". An admin cannot invite an address outside these.',
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .unique()
          .custom((domains?: string[]) => {
            const bad = (domains ?? []).filter(
              (domain) => domain.includes('@') || !domain.includes('.'),
            )
            return bad.length
              ? `Domain only, without the @: ${bad.join(', ')}`
              : true
          }),
    }),
    defineField({
      name: 'stakeholders',
      title: 'Stakeholders',
      type: 'array',
      group: 'people',
      of: [defineArrayMember({type: 'stakeholder'})],
      validation: (rule) =>
        rule.custom((stakeholders?: {isPortalAdmin?: boolean}[]) => {
          if (!stakeholders?.length) return true
          return stakeholders.some((person) => person.isPortalAdmin)
            ? true
            : 'At least one stakeholder must be the portal admin'
        }),
    }),
    defineField({
      name: 'zippilySpecialists',
      title: 'Zippily specialists',
      type: 'array',
      group: 'people',
      of: [defineArrayMember({type: 'reference', to: [{type: 'teamMember'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'pointOfContact',
      title: 'Point of contact',
      type: 'reference',
      group: 'people',
      to: [{type: 'teamMember'}],
      description: 'The specialist shown on every portal screen',
    }),
    defineField({
      name: 'meetingLink',
      title: 'Meeting link',
      type: 'url',
      group: 'people',
      description: 'Powers "Book time with…" in the portal sidebar',
    }),

    // Systems
    defineField({
      name: 'asanaPortfolioId',
      title: 'Asana portfolio ID',
      type: 'string',
      group: 'systems',
      validation: (rule) =>
        rule
          .required()
          .custom((value?: string) =>
            value && !/^\d+$/.test(value) ? 'Asana GIDs are numeric' : true,
          ),
    }),
    defineField({
      name: 'asanaLegacyProjectIds',
      title: 'Asana legacy project IDs',
      type: 'array',
      group: 'systems',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Projects outside the portfolio to include in history. Template projects are still excluded.',
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'hubspotCompanyId',
      title: 'HubSpot company ID',
      type: 'string',
      group: 'systems',
    }),
    defineField({
      name: 'xeroContactId',
      title: 'Xero contact ID',
      type: 'string',
      group: 'systems',
    }),
    defineField({
      name: 'hubspotLicensing',
      title: 'HubSpot licensing',
      type: 'hubspotLicensing',
      group: 'systems',
    }),

    // Billing
    defineField({
      name: 'billingDayOfMonth',
      title: 'Billing day of month',
      type: 'number',
      group: 'billing',
      initialValue: 20,
      validation: (rule) => rule.required().integer().min(1).max(28),
    }),
    defineField({
      name: 'billingNotes',
      title: 'Billing notes',
      type: 'array',
      group: 'billing',
      of: [defineArrayMember({type: 'block'})],
    }),

    // Portal content
    defineField({
      name: 'portalWelcomeNote',
      title: 'Portal welcome note',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'goals',
      title: 'Goals',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'challenges',
      title: 'Challenges',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'recommendations',
      title: 'Recommendations',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'recommendation'})],
    }),
    defineField({
      name: 'featureSuggestions',
      title: 'Feature suggestions',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'featureSuggestion'})],
    }),
    defineField({
      name: 'meetingRecords',
      title: 'Meeting records',
      type: 'array',
      group: 'portal',
      of: [defineArrayMember({type: 'meetingRecord'})],
    }),
  ],
  orderings: [
    {title: 'Client name', name: 'nameAsc', by: [{field: 'clientName', direction: 'asc'}]},
  ],
  preview: {
    select: {
      title: 'clientName',
      status: 'portalStatus',
      engagement: 'engagementType',
      media: 'clientLogo',
    },
    prepare: ({title, status, engagement, media}) => ({
      title,
      subtitle: [engagement, status !== 'active' ? status : null]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
