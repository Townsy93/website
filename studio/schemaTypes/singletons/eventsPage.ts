import {defineField, defineType} from 'sanity'

// /events hub. Events themselves are `event` documents, listed
// automatically — this holds the static hero, empty-state and CTA copy.
export const eventsPage = defineType({
  name: 'eventsPage',
  title: 'Events page',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'empty', title: 'Empty calendar state'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'hero',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pastHeading',
      title: 'Past sessions heading',
      type: 'string',
      group: 'content',
      initialValue: "Where we've been",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'pastIntro',
      title: 'Past sessions line',
      type: 'string',
      group: 'content',
      initialValue: "Recaps go up when there's something worth writing down.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'emptyHeading',
      title: 'Heading',
      type: 'string',
      group: 'empty',
      initialValue: 'Nothing on the calendar right now. Want to know when the next one is?',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'emptyText',
      title: 'Text',
      type: 'text',
      rows: 2,
      group: 'empty',
      initialValue:
        "We run a session every few weeks. Leave your email and you'll hear about the next one first — nothing else.",
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'ctaBanner',
      title: 'CTA banner',
      type: 'ctaBanner',
      group: 'content',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Events page'})},
})
