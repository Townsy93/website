import { readFileSync } from 'fs'
import { writeClient } from './write-client.ts'

/**
 * Bulk-fill seo.metaTitle / seo.metaDescription from a filled-in CSV.
 *
 * Companion to docs/seo-gaps.csv, which lists every page-backed document
 * missing either field. Fill the two NEW_ columns, leave the rest alone,
 * then run this. Blank NEW_ cells are skipped, so the file can be returned
 * in batches rather than all at once.
 *
 *   npm run seo:import -- ../docs/seo-gaps.csv          # dry run (default)
 *   npm run seo:import -- ../docs/seo-gaps.csv --apply  # write to Sanity
 *
 * Dry run by default because this writes straight to published documents —
 * there is no draft step to review first.
 */

// Minimal RFC-4180 parse: quoted fields may contain commas, newlines and "".
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((c) => c.trim()))
}

const [path, ...flags] = process.argv.slice(2)
if (!path) {
  console.error('Usage: npm run seo:import -- <csv> [--apply]')
  process.exit(1)
}
const apply = flags.includes('--apply')

const rows = parseCsv(readFileSync(path, 'utf8'))
const header = rows.shift()!
const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase().startsWith(name))
const iId = col('_id')
const iPage = col('page')
const iTitle = col('new_metatitle')
const iDesc = col('new_metadescription')
if (iId < 0 || iTitle < 0 || iDesc < 0) {
  console.error('CSV is missing _id / NEW_metaTitle / NEW_metaDescription columns')
  process.exit(1)
}

let filled = 0
let skipped = 0
const warnings: string[] = []
const writes: { id: string; page: string; set: Record<string, string> }[] = []

for (const r of rows) {
  const id = (r[iId] ?? '').trim()
  const page = (r[iPage] ?? '').trim()
  const t = (r[iTitle] ?? '').trim()
  const d = (r[iDesc] ?? '').trim()
  if (!id) continue
  if (!t && !d) { skipped++; continue }
  const set: Record<string, string> = {}
  if (t) {
    set['seo.metaTitle'] = t
    if (t.length > 60) warnings.push(`${page}: metaTitle ${t.length} chars (over 60)`)
  }
  if (d) {
    set['seo.metaDescription'] = d
    if (d.length > 160) warnings.push(`${page}: metaDescription ${d.length} chars (over 160)`)
  }
  writes.push({ id, page, set })
  filled++
}

console.log(`${filled} row(s) filled in, ${skipped} left blank (skipped)`)
if (warnings.length) {
  console.log('\nLength warnings (Sanity treats these as warnings, not errors):')
  warnings.forEach((w) => console.log('  ! ' + w))
}

if (!apply) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to commit:')
  writes.forEach((w) => {
    console.log(`\n  ${w.page}  [${w.id}]`)
    for (const [k, v] of Object.entries(w.set)) console.log(`     ${k}: ${JSON.stringify(v)}`)
  })
  process.exit(0)
}

let done = 0
for (const w of writes) {
  await writeClient.patch(w.id).set(w.set).commit()
  done++
  console.log(`  ✓ ${w.page}`)
}
console.log(`\nWrote ${done} document(s) to the published dataset.`)
