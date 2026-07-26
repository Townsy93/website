import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A service's pricing ladder, managed in one place.
 *
 * Pricing used to live inline on each service document, which meant a
 * repricing round was an edit per page with no single view of the catalogue.
 * These are documents so every price sits in one list in Studio, and the
 * service page pulls whatever the referenced table says.
 *
 * The `confirmed` switch is the important part. Sean's pricing strategy is
 * explicit that PROPOSED numbers must not reach the website until validated
 * against actual delivered hours — so an unconfirmed table renders the
 * fallback line and the numbers stay internal. The guard is here rather than
 * in anyone's memory.
 */
export const pricingTable = defineType({
  name: 'pricingTable',
  title: 'Pricing table',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal name, e.g. "CRM Implementation".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'service',
      title: 'Applies to',
      type: 'reference',
      to: [{type: 'service'}],
      description: 'The service page this table renders on.',
    }),
    defineField({
      name: 'confirmed',
      title: 'Confirmed — safe to publish',
      type: 'boolean',
      initialValue: false,
      description:
        'Off = the service page shows the fallback line instead of the numbers. Leave off for PROPOSED pricing: unvalidated numbers must not reach the website, HubSpot product library or collateral.',
    }),
    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      of: [defineArrayMember({type: 'pricingTier'})],
      validation: (rule) =>
        rule.max(4).custom((tiers, context) => {
          const confirmed = (context.document as {confirmed?: boolean} | undefined)?.confirmed
          if (confirmed && (!tiers || tiers.length === 0)) {
            return 'A confirmed table needs at least one tier'
          }
          const featured = (tiers ?? []).filter(
            (tier) => (tier as {featured?: boolean}).featured,
          ).length
          return featured > 1 ? 'Only one tier can be featured' : true
        }),
    }),
    defineField({
      name: 'fallbackText',
      title: 'Fallback line (when not confirmed)',
      type: 'string',
      initialValue: "This one's scoped individually",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'internalNote',
      title: 'Internal note',
      type: 'text',
      rows: 4,
      description:
        'Never rendered. Tier gates, implied hours, what still needs validating — the reasoning behind the numbers.',
    }),
  ],
  orderings: [
    {
      title: 'Unconfirmed first',
      name: 'confirmedAsc',
      by: [
        {field: 'confirmed', direction: 'asc'},
        {field: 'title', direction: 'asc'},
      ],
    },
  ],
  preview: {
    select: {title: 'title', confirmed: 'confirmed', service: 'service.title'},
    prepare({title, confirmed, service}) {
      return {
        title,
        subtitle: `${confirmed ? '● Published' : '○ Internal only'}${service ? ` · ${service}` : ' · not linked to a service'}`,
      }
    },
  },
})
