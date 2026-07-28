import {defineArrayMember, defineField, defineType} from 'sanity'
import {slugShape} from '../../lib/slugRules'
import {BLOG_TOPICS} from '../constants'

// Downloadable resource — listed on the /resources library hub.
// The hub is indexable; download CTAs route to each resource's own
// gated landing page (noindex), never a direct file link.
export const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: slugShape,
    }),
    defineField({
      name: 'summaryBullets',
      title: '"What\'s inside" bullets',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description: '2–3 short teasers so visitors can self-qualify before the gate',
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Last updated',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'readTimeMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      validation: (rule) => rule.required().integer().min(1).max(120),
    }),
    defineField({
      name: 'fileAsset',
      title: 'File (PDF)',
      type: 'file',
      description:
        'The downloadable PDF. To update a guide, just replace this file and publish — the site picks it up automatically. While it\'s uploaded, "Get the guide" opens the email gate and then downloads this file.',
      options: {accept: '.pdf'},
    }),
    defineField({
      name: 'landingPageHref',
      title: 'Fallback link (no file uploaded)',
      type: 'string',
      description:
        'Only used when no PDF is uploaded — the CTA links here instead (defaults to /contact).',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'author',
      title: 'Put together by',
      type: 'reference',
      to: [{type: 'teamMember'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {list: [...BLOG_TOPICS]},
      description: 'Matches the Insight Hub topic taxonomy (drives filter pills once there are enough resources)',
    }),
    defineField({
      name: 'relatedPost',
      title: 'Related Insight Hub post',
      type: 'reference',
      to: [{type: 'blogPost'}],
      description: 'Optional — one small cross-link under the resource row',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'category'},
  },
})
