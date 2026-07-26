import {defineArrayMember, defineField, defineType} from 'sanity'

export const WORK_ARRANGEMENTS = [
  {title: 'On site', value: 'onSite'},
  {title: 'Hybrid', value: 'hybrid'},
  {title: 'Remote', value: 'remote'},
] as const

export const EMPLOYMENT_TYPES = [
  {title: 'Full time', value: 'fullTime'},
  {title: 'Part time', value: 'partTime'},
  {title: 'Contract', value: 'contract'},
  {title: 'Internship', value: 'internship'},
] as const

/**
 * An open role. URL: /careers/[slug]
 *
 * A closed role keeps its URL rather than 404ing — the page has usually
 * earned backlinks by then, and a dead link is worse than a page that says
 * the role is filled. Closing swaps the form for a pointer back to /careers
 * and drops the page from the sitemap.
 */
export const vacancy = defineType({
  name: 'vacancy',
  title: 'Vacancy',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'details', title: 'Details'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Role title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      description: 'URL: /careers/[slug]',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'content',
      initialValue: 'open',
      options: {
        list: [
          {title: 'Open', value: 'open'},
          {title: 'Closed', value: 'closed'},
        ],
        layout: 'radio',
      },
      description:
        'Closed keeps the page live for anyone holding the link, but removes the application form and hides it from the careers list, the sitemap and Google.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'workArrangement',
      title: 'Work arrangement',
      type: 'string',
      group: 'details',
      options: {list: [...WORK_ARRANGEMENTS], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'employmentType',
      title: 'Employment type',
      type: 'string',
      group: 'details',
      options: {list: [...EMPLOYMENT_TYPES], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      group: 'details',
      initialValue: 'Auckland, New Zealand',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'department',
      title: 'Department',
      type: 'string',
      group: 'details',
      options: {
        list: [
          {title: 'Delivery', value: 'delivery'},
          {title: 'Marketing', value: 'marketing'},
          {title: 'Operations', value: 'operations'},
          {title: 'Engineering', value: 'engineering'},
        ],
      },
    }),
    defineField({
      name: 'summary',
      title: 'Card summary',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'The one or two lines shown on the careers list card.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'description',
      title: 'About the role',
      type: 'blockContent',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'responsibilities',
      title: "What you'll do",
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'requirements',
      title: "What we're looking for",
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'niceToHave',
      title: 'Nice to have',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'benefitsOverride',
      title: 'Benefits (override)',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({type: 'benefit'})],
      description:
        'Leave empty to use the shared benefits from the Careers page. Only fill this in if this role genuinely differs.',
    }),
    defineField({
      name: 'salaryMin',
      title: 'Salary — minimum',
      type: 'number',
      group: 'details',
      description: 'Both minimum and maximum must be set for a range to appear anywhere.',
    }),
    defineField({
      name: 'salaryMax',
      title: 'Salary — maximum',
      type: 'number',
      group: 'details',
      validation: (rule) =>
        rule.custom((max, context) => {
          const min = (context.document as {salaryMin?: number} | undefined)?.salaryMin
          if (typeof max === 'number' && typeof min === 'number' && max < min) {
            return 'Maximum cannot be below the minimum.'
          }
          return true
        }),
    }),
    defineField({
      name: 'salaryCurrency',
      title: 'Currency',
      type: 'string',
      group: 'details',
      initialValue: 'NZD',
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'salaryPeriod',
      title: 'Period',
      type: 'string',
      group: 'details',
      initialValue: 'YEAR',
      options: {
        list: [
          {title: 'Year', value: 'YEAR'},
          {title: 'Month', value: 'MONTH'},
          {title: 'Hour', value: 'HOUR'},
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'validThrough',
      title: 'Applications close',
      type: 'datetime',
      group: 'details',
      description: 'Feeds the JobPosting listing in Google Jobs. Optional.',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {
      title: 'Status, then newest',
      name: 'statusPublished',
      by: [
        {field: 'status', direction: 'asc'},
        {field: 'publishedAt', direction: 'desc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', status: 'status', location: 'location'},
    prepare({title, status, location}) {
      return {
        title,
        subtitle: `${status === 'open' ? '● Open' : '○ Closed'} · ${location ?? ''}`,
      }
    },
  },
})
