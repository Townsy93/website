import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './structure'

// The site the Presentation tool previews. Defaults to the deployed site;
// set SANITY_STUDIO_PREVIEW_ORIGIN (e.g. http://localhost:8787) before
// `sanity dev` to preview a local build, and update this default when the
// real domain goes live.
const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN ?? 'https://website.sean-fe5.workers.dev'

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
