import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'phzyp5b1',
    dataset: 'production'
  },
  studioHost: 'zippily',
  deployment: {
    appId: 'k6aw2y0nd5su7dsq3fet3pge',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
