// One-off: point the Insight Hub resource-teaser cards at /resources.
// Run: npx sanity exec scripts/patchResourceLinks.ts --with-user-token
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-07-01'})

async function run() {
  const doc = await client.getDocument('insightHubPage')
  const resources = (doc?.resources ?? []) as {
    _key: string
    link?: {href?: string}
  }[]
  const patched = resources.map((card) => ({
    ...card,
    link: {...(card.link ?? {}), _type: 'link', label: 'Browse', href: '/resources'},
  }))
  await client.patch('insightHubPage').set({resources: patched}).commit()
  console.log(`patched ${patched.length} resource card links -> /resources`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
