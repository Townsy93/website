import {defineArrayMember, defineField, defineType} from 'sanity'

// Settings for the client portal. Notification destinations live here rather
// than in code so they can change without a deploy.
export const portalSettings = defineType({
  name: 'portalSettings',
  title: 'Portal settings',
  type: 'document',
  groups: [
    {name: 'notifications', title: 'Notifications', default: true},
    {name: 'copy', title: 'Copy'},
  ],
  fields: [
    defineField({
      name: 'notificationRecipients',
      title: 'Who gets notified of new requests',
      type: 'array',
      group: 'notifications',
      of: [defineArrayMember({type: 'string'})],
      description: 'Zippily addresses. Never hardcoded in the app.',
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .unique()
          .custom((emails?: string[]) => {
            const bad = (emails ?? []).filter((email) => !email.includes('@'))
            return bad.length ? `Not email addresses: ${bad.join(', ')}` : true
          }),
    }),
    defineField({
      name: 'fromName',
      title: 'From name',
      type: 'string',
      group: 'notifications',
      initialValue: 'Zippily',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'fromEmail',
      title: 'From address',
      type: 'string',
      group: 'notifications',
      description: 'Must be on a domain verified in Resend.',
      initialValue: 'portal@zippily.co.nz',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'replyToEmail',
      title: 'Reply-to address',
      type: 'string',
      group: 'notifications',
      initialValue: 'hello@zippily.co.nz',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'portalUrl',
      title: 'Portal URL',
      type: 'url',
      group: 'notifications',
      initialValue: 'https://portal.zippily.co.nz',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'supportEmail',
      title: 'Support address shown to clients',
      type: 'string',
      group: 'copy',
      initialValue: 'hello@zippily.co.nz',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'scopeBoundaryNote',
      title: 'Scope boundary note (footer)',
      type: 'text',
      rows: 2,
      group: 'copy',
      description:
        'Shown in the portal footer — recommendations are not quotes, requests are not automatically in scope.',
      initialValue:
        'Recommendations here are suggestions, not quotes. A request being logged does not mean it is in scope — we will confirm before starting anything that changes your hours.',
      validation: (rule) => rule.max(400),
    }),
  ],
  preview: {prepare: () => ({title: 'Portal settings'})},
})
