import {createClient} from '@sanity/client'

// Editor-scoped token for scripted content patches (Claude Code). Loaded via
// `--env-file=.env` (see the `content:*` npm scripts) or already present in
// the shell environment. Never log this value or write it anywhere but the
// gitignored `studio/.env` — see scripts/README.md.
const token = process.env.SANITY_API_WRITE_TOKEN
if (!token) {
  throw new Error(
    'SANITY_API_WRITE_TOKEN is not set. Add it to studio/.env (gitignored) — see studio/scripts/README.md.',
  )
}

export const writeClient = createClient({
  projectId: 'phzyp5b1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})
