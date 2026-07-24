// One-off: attach a placeholder PDF to the Claude Prompts resource so the
// download gate is testable. Sean replaces it with the real guide in Studio.
// Run: npx sanity exec scripts/attachPlaceholderPdf.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'

const client = getCliClient({apiVersion: '2026-07-01'})

async function run() {
  const asset = await client.assets.upload(
    'file',
    createReadStream(__dirname + '/placeholder.pdf'),
    {filename: 'top-12-claude-prompts-hubspot-mcp.pdf'},
  )
  await client
    .patch('resource-claude-prompts')
    .set({fileAsset: {_type: 'file', asset: {_type: 'reference', _ref: asset._id}}})
    .commit()
  console.log('attached', asset._id)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
