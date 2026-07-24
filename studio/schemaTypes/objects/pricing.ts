import {defineArrayMember, defineField, defineType} from 'sanity'

export const pricingTier = defineType({
  name: 'pricingTier',
  title: 'Pricing tier',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: 'description',
      title: 'One-line descriptor',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'price',
      title: 'Price (NZD, ex GST)',
      type: 'number',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'priceSuffix',
      title: 'Price suffix',
      type: 'string',
      initialValue: 'fixed, ex GST',
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: 'features',
      title: 'Included features',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(3).max(8),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'featured',
      title: 'Featured tier ("Most teams pick this")',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'description'}},
})

// Enforces the never-publish-blocked-pricing rule at the schema level:
// tiers only render when `confirmed` is true, otherwise the
// "scoped individually" fallback card renders (module M18).
export const pricing = defineType({
  name: 'pricing',
  title: 'Pricing',
  type: 'object',
  fields: [
    defineField({
      name: 'confirmed',
      title: 'Pricing confirmed',
      type: 'boolean',
      description: 'Off = the site shows "scoped individually" instead of tiers',
      initialValue: false,
    }),
    defineField({
      name: 'tiers',
      title: 'Tiers',
      type: 'array',
      of: [defineArrayMember({type: 'pricingTier'})],
      hidden: ({parent}) => !parent?.confirmed,
      validation: (rule) =>
        rule.max(3).custom((tiers, context) => {
          const confirmed = (context.parent as {confirmed?: boolean} | undefined)?.confirmed
          if (confirmed && (!tiers || tiers.length === 0)) {
            return 'Confirmed pricing needs at least one tier'
          }
          const featured = (tiers ?? []).filter(
            (tier) => (tier as {featured?: boolean}).featured,
          ).length
          return featured > 1 ? 'Only one tier can be featured' : true
        }),
    }),
    defineField({
      name: 'fallbackText',
      title: 'Fallback text (when not confirmed)',
      type: 'string',
      initialValue: "This one's scoped individually",
      hidden: ({parent}) => Boolean(parent?.confirmed),
      validation: (rule) => rule.max(120),
    }),
  ],
})
