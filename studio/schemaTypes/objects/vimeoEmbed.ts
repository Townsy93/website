import {defineField, defineType} from 'sanity'

/**
 * Has the editor actually put a video here?
 *
 * `orientation` is deliberately excluded: it carries an initialValue, so
 * Sanity materialises the object the moment a document is created. Marking
 * `url` and `title` required therefore lit up every optional video field
 * with errors for a video nobody had asked for — the field says "optional"
 * and behaved as mandatory. Requiredness is conditional on this instead.
 */
const isInUse = (parent: unknown): boolean => {
  const v = (parent ?? {}) as Record<string, unknown>
  return Boolean(v.url || v.title || v.posterImage || v.caption)
}

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
          .uri({scheme: ['http', 'https']})
          .custom((value: string | undefined, context) => {
            if (!value) {
              return isInUse(context.parent)
                ? 'Add the Vimeo URL, or clear the other fields to leave this video out.'
                : true
            }
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
        'Describes the video for screen readers — it becomes the iframe title. Required once a URL is added.',
      validation: (rule) =>
        rule.max(120).custom((value: string | undefined, context) => {
          const parent = (context.parent ?? {}) as Record<string, unknown>
          if (!value && parent.url) {
            return 'Needed for accessibility — it becomes the iframe title.'
          }
          return true
        }),
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
