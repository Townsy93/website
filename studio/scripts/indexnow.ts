import {INDEXNOW_ENDPOINTS, INDEXNOW_KEY} from '../../web/lib/indexNow.ts'

// Tells Bing and the other IndexNow engines that pages have changed.
//
// The publish webhook does this too, but from a Cloudflare Worker, and Bing
// and the shared endpoint both answer 429 to Workers (their outbound addresses
// are shared); only Yandex takes the webhook's notice. Run from a normal
// machine, all of them accept it. So after publishing something that should
// reach Bing quickly, run this.
//
//   npm run indexnow -- /insights/some-post /insights
//   npm run indexnow -- https://www.zippily.co.nz/services/crm-implementation
//   npm run indexnow -- --sitemap          (every URL in the live sitemap)
const SITE = 'https://www.zippily.co.nz'
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Give paths or URLs, or --sitemap.')
  process.exit(1)
}

let urls: string[]
if (args.includes('--sitemap')) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
} else {
  urls = args.map((a) => (a.startsWith('http') ? a : `${SITE}${a.startsWith('/') ? '' : '/'}${a}`))
}
const stray = urls.filter((u) => !u.startsWith(`${SITE}/`) && u !== SITE)
if (stray.length) {
  console.error(`Not on ${SITE}: ${stray[0]}`)
  process.exit(1)
}

const body = JSON.stringify({
  host: new URL(SITE).host,
  key: INDEXNOW_KEY,
  keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
  urlList: urls,
})
console.log(`${urls.length} URL(s)`)
let accepted = 0
// The shared endpoint and Bing's own: both worth asking, since the shared one
// is not guaranteed to pass it on.
for (const endpoint of INDEXNOW_ENDPOINTS.slice(0, 2)) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body,
  })
  console.log(`  ${new URL(endpoint).host.padEnd(18)} ${res.status}`)
  if (res.ok) accepted++
}
process.exit(accepted > 0 ? 0 : 1)
