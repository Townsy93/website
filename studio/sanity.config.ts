import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './structure'

// The site the Presentation tool previews. Local dev preview by default;
// set SANITY_STUDIO_PREVIEW_ORIGIN to the deployed site URL and redeploy
// the studio once the domain is live.
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? 'http://localhost:8787'

export default defineConfig({
  name: 'default',
  title: 'Zippily Website',

  projectId: 'phzyp5b1',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    presentationTool({
      previewUrl: {
        origin: previewOrigin,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Singletons are created/edited only through their pinned desk entries.
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    actions: (actions, context) =>
      singletonTypes.has(context.schemaType)
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },
})
