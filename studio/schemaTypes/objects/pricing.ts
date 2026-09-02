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
      name: 'custom',
      title: 'Custom / quoted tier',
      type: 'boolean',
      initialValue: false,
      description:
        'Enterprise tiers are scoped per deal. On = the card shows "Custom" instead of a number, so a floor price never gets read as a list price.',
    }),
    defineField({
      name: 'fromPrice',
      title: 'Show as "From $X" (price is a floor, custom quote)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'price',
      title: 'Price (NZD, ex GST)',
      type: 'number',
      hidden: ({parent}) => Boolean(parent?.custom),
      validation: (rule) =>
        rule.custom((price, context) => {
          const custom = (context.parent as {custom?: boolean} | undefined)?.custom
          if (custom) return true
          if (typeof price !== 'number' || price <= 0) return 'A non-custom tier needs a price'
          return true
        }),
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
      validation: (rule) => rule.min(1).max(10),
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
