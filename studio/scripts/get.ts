import {writeClient} from './write-client.ts'

// Fetch a published document by id, for reviewing current field values
// before scripting a patch. Usage:
//   npm run content:get -- <documentId>
const [documentId] = process.argv.slice(2)

if (!documentId) {
  console.error('Usage: npm run content:get -- <documentId>')
  process.exit(1)
}

const doc = await writeClient.getDocument(documentId)
console.log(JSON.stringify(doc, null, 2))
