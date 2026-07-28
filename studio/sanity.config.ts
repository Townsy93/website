import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './structure'
import {withSlugRedirect} from './actions/publishWithRedirect'
import {TYPE_PATHS} from './lib/slugRules'

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
    actions: (actions, context) => {
      if (singletonTypes.has(context.schemaType)) {
        return actions.filter(
          ({action}) => action !== 'duplicate' && action !== 'delete',
        )
      }
      // Routable types get a publish that records a redirect when a live
      // slug changes. Wrapping publish rather than adding a separate action
      // means it cannot be forgotten.
      if (!(context.schemaType in TYPE_PATHS)) return actions
      return actions.map((action) =>
        action.action === 'publish' ? withSlugRedirect(action) : action,
      )
    },
  },
})
