import {defineField, defineType} from 'sanity'

/**
 * A permanent redirect from a retired URL.
 *
 * Created automatically when a published document's slug changes — that is
 * the single most common way a CMS migration leaks traffic, because the old
 * URL keeps its inbound links and starts returning 404.
 *
 * Can also be created by hand for URLs retired outside Sanity.
 */
export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From',
      type: 'string',
      description: 'The old path, including the leading slash. e.g. /insights/old-slug',
      validation: (rule) =>
        rule.required().custom((value?: string) => {
          if (!value?.startsWith('/')) return 'Must start with a slash.'
          if (/\s/.test(value)) return 'No spaces.'
          return true
        }),
    }),
    defineField({
      name: 'to',
      title: 'To',
      type: 'string',
      description: 'Where it should land.',
      validation: (rule) =>
        rule.required().custom((value: string | undefined, context) => {
          if (!value?.startsWith('/')) return 'Must start with a slash.'
          const from = (context.document as {from?: string} | undefined)?.from
          if (from && from === value) return 'A redirect to itself does nothing.'
          return true
        }),
    }),
    defineField({
      name: 'permanent',
      title: 'Permanent (301)',
      type: 'boolean',
      initialValue: true,
      description:
        'On = 301, which passes ranking to the new URL and is what a slug change wants. Off = 307, for something genuinely temporary.',
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'string',
      description: 'Why this exists, for whoever finds it in two years.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'createdAt',
      title: 'Created',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {title: 'from', subtitle: 'to', permanent: 'permanent'},
    prepare({title, subtitle, permanent}) {
      return {title, subtitle: `${permanent === false ? '307' : '301'} → ${subtitle}`}
    },
  },
})
