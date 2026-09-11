import {writeClient} from './write-client.ts'

// Apply a `.set()` patch to a single published document and print the
// result. For scripted, reviewed one-off content fixes (e.g. a hero
// heading) — not a bulk migration tool. Usage:
//   npm run content:patch -- <documentId> '<json object of field: value>'
// Field paths use Sanity's dotted/bracket patch syntax, e.g.:
//   npm run content:patch -- homePage '{"hero.heading": "New heading"}'
// Always run content:get first to confirm the current value and the exact
// field path (block/portable-text fields need the matching _key, not a bare
// path) before patching.
const [documentId, patchJson] = process.argv.slice(2)

if (!documentId || !patchJson) {
  console.error("Usage: npm run content:patch -- <documentId> '<json patch>'")
  process.exit(1)
}

const patch = JSON.parse(patchJson)

const result = await writeClient.patch(documentId).set(patch).commit()
console.log(JSON.stringify(result, null, 2))
