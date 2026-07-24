import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Zippily Website',

  projectId: 'phzyp5b1',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

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
