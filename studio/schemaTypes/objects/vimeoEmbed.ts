import {defineField, defineType} from 'sanity'

/**
 * A Vimeo video, shared site-wide.
 *
 * Used by careersPage.lifeVideo, aboutPage.brandVideo,
 * caseStudy.videoTestimonial and as a portable-text block in blog bodies —
 * so it is built once here rather than retrofitted per document type.
 *
 * The raw pasted URL is stored rather than an extracted id: editors should
 * never have to pull an id out of a URL by hand, and unlisted videos carry a
 * privacy hash in the URL that has to survive to the embed.
 */
export const vimeoEmbed = defineType({
  name: 'vimeoEmbed',
  title: 'Vimeo video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Vimeo URL',
      type: 'url',
      description:
        'Paste the URL straight from the browser. Unlisted videos look like vimeo.com/123456789/a1b2c3d4e5 — keep the whole thing, the second part is the privacy key.',
      validation: (rule) =>
        rule
          .required()
          .uri({scheme: ['http', 'https']})
          .custom((value?: string) => {
            if (!value) return true
            let host: string
            try {
              host = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
            } catch {
              return 'That is not a valid URL.'
            }
            if (host !== 'vimeo.com' && host !== 'player.vimeo.com') {
              return 'Zippily hosts video on Vimeo — this needs to be a vimeo.com link.'
            }
            if (!/\/\d+/.test(new URL(value).pathname)) {
              return 'That Vimeo link does not point at a video.'
            }
            return true
          }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'Describes the video for screen readers — it becomes the iframe title. Required for accessibility.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      initialValue: 'landscape',
      options: {
        list: [
          {title: 'Landscape (16:9)', value: 'landscape'},
          {title: 'Portrait (9:16)', value: 'portrait'},
          {title: 'Square (1:1)', value: 'square'},
        ],
        layout: 'radio',
      },
      description: 'Sets the frame size so the page does not jump as the video loads.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image',
      type: 'image',
      options: {hotspot: true},
      description:
        'Optional. Shown before the video is played. Falls back to the Vimeo thumbnail if left empty.',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url', media: 'posterImage'},
  },
})
