// One-off: upload selected staff photography and attach to page hero slots.
// Run: npx sanity exec scripts/attachHeroImages.ts --with-user-token
import {getCliClient} from 'sanity/cli'
import {createReadStream} from 'node:fs'
import {basename} from 'node:path'

const client = getCliClient({apiVersion: '2026-07-01'})

const BASE =
  'C:/Users/sean/AppData/Local/Temp/claude/C--Users-sean--claude/3d797257-224c-4382-94ac-232d2822912c/scratchpad/branding/Branding Assets/Compressed Staff Imagery/March/Stills/'

const JOBS: {file: string; docId: string; alt: string}[] = [
  {
    file: 'STI_3927.jpg',
    docId: 'homePage',
    alt: 'Two Zippily team members working together at a laptop',
  },
  {
    file: 'STI_4210.jpg',
    docId: 'aboutPage',
    alt: 'Zippily team members in the Auckland office',
  },
  {
    file: 'STI_4090.jpg',
    docId: 'contactPage',
    alt: 'Zippily team members in conversation',
  },
  {
    file: 'STI_3759-Edit.jpg',
    docId: 'ourWorkPage',
    alt: 'Zippily team member smiling',
  },
  {
    file: 'STI_4062.jpg',
    docId: 'insightHubPage',
    alt: 'Zippily team members discussing work at a laptop',
  },
]

async function run() {
  for (const job of JOBS) {
    const path = BASE + job.file
    const asset = await client.assets.upload('image', createReadStream(path), {
      filename: basename(path),
    })
    await client
      .patch(job.docId)
      .set({
        'hero.image': {
          _type: 'imageWithAlt',
          asset: {_type: 'reference', _ref: asset._id},
          alt: job.alt,
        },
      })
      .commit()
    console.log(`${job.docId} <- ${job.file} (${asset._id})`)
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
