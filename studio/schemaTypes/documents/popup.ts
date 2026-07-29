import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Site popup.
 *
 * One popup is live at a time: the first enabled document wins. A list of
 * competing popups with overlapping page rules is a support problem nobody
 * wants, and "which one is showing?" should never need investigating.
 *
 * Landing pages are excluded structurally rather than by a rule — they live
 * outside the site layout this mounts in. A popup competing with a landing
 * page's own form would be working against the only thing that page is for.
 */
export const popup = defineType({
  name: 'popup',
  title: 'Popup',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'trigger', title: 'When it shows'},
    {name: 'targeting', title: 'Where it shows'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Internal name',
      type: 'string',
      group: 'content',
      description: 'Only for finding it in this list. Never shown to a visitor.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'enabled',
      title: 'Live',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description:
        'Off means no visitor sees it. If more than one popup is live, the most recently updated one wins — so turn the old one off rather than relying on order.',
    }),

    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      description: 'Shown on the left on desktop, above the text on mobile.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description:
            'What the image shows, for screen readers. Leave empty only if it is purely decorative.',
        }),
      ],
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(70),
    }),
    defineField({
      name: 'body',
      title: 'Supporting copy',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: 'mode',
      title: 'What it asks for',
      type: 'string',
      group: 'content',
      initialValue: 'form',
      options: {
        list: [
          {title: 'Email capture form', value: 'form'},
          {title: 'Button to another page', value: 'cta'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Button label',
      type: 'string',
      group: 'content',
      initialValue: 'Send it to me',
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: 'ctaHref',
      title: 'Button link',
      type: 'string',
      group: 'content',
      hidden: ({parent}) => parent?.mode !== 'cta',
      description: 'A path like /services/hubspot-audit, or a full URL.',
      validation: (rule) =>
        rule.custom((value?: string, context) => {
          if ((context.parent as {mode?: string} | undefined)?.mode !== 'cta') return true
          if (!value) return 'A button link is required when the popup links somewhere.'
          if (!value.startsWith('/') && !value.startsWith('http')) {
            return 'Use a path starting with / or a full URL.'
          }
          return true
        }),
    }),
    defineField({
      name: 'successMessage',
      title: 'Message after submitting',
      type: 'string',
      group: 'content',
      initialValue: "Got it — check your inbox.",
      hidden: ({parent}) => parent?.mode !== 'form',
      validation: (rule) => rule.max(120),
    }),

    defineField({
      name: 'triggerType',
      title: 'Show it on',
      type: 'string',
      group: 'trigger',
      initialValue: 'timeOnPage',
      options: {
        list: [
          {title: 'Exit intent — pointer leaves the top of the window', value: 'exitIntent'},
          {title: 'Time on page', value: 'timeOnPage'},
          {title: 'Scroll depth', value: 'scrollDepth'},
        ],
        layout: 'radio',
      },
      description:
        'Exit intent cannot fire on touch devices, which have no pointer to leave the window. A time fallback is applied there so mobile visitors are not simply excluded.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'triggerSeconds',
      title: 'Seconds on the page',
      type: 'number',
      group: 'trigger',
      initialValue: 20,
      hidden: ({parent}) => parent?.triggerType !== 'timeOnPage',
      validation: (rule) => rule.min(1).max(300),
    }),
    defineField({
      name: 'triggerPercent',
      title: 'Percent scrolled',
      type: 'number',
      group: 'trigger',
      initialValue: 50,
      hidden: ({parent}) => parent?.triggerType !== 'scrollDepth',
      validation: (rule) => rule.min(1).max(100),
    }),
    defineField({
      name: 'showAgainAfterDays',
      title: 'Show again after (days)',
      type: 'number',
      group: 'trigger',
      initialValue: 30,
      description:
        'How long a dismissal lasts. 0 means it can reappear on the next page view, which visitors read as broken — leave it at 30 unless there is a reason.',
      validation: (rule) => rule.min(0).max(365),
    }),

    defineField({
      name: 'includePaths',
      title: 'Only on these pages',
      type: 'array',
      group: 'targeting',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Leave empty for every page. Use a full path like /pricing, or a section like /services/* which also covers /services itself.',
    }),
    defineField({
      name: 'excludePaths',
      title: 'Never on these pages',
      type: 'array',
      group: 'targeting',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Always wins over the list above. Worth excluding /contact — a popup over a form someone is already filling in costs you the enquiry.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      enabled: 'enabled',
      triggerType: 'triggerType',
      media: 'image',
    },
    prepare({title, enabled, triggerType, media}) {
      const when: Record<string, string> = {
        exitIntent: 'exit intent',
        timeOnPage: 'time on page',
        scrollDepth: 'scroll depth',
      }
      return {
        title,
        subtitle: `${enabled ? '● Live' : '○ Off'} · ${when[triggerType] ?? ''}`,
        media,
      }
    },
  },
})
