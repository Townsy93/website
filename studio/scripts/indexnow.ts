import {INDEXNOW_ENDPOINTS, INDEXNOW_KEY} from '../../web/lib/indexNow.ts'

// Tells Bing and the other IndexNow engines that pages have changed.
//
// The publish webhook does this too, but from a Cloudflare Worker, and Bing
// and the shared endpoint both answer 429 to Workers (their outbound addresses
// are shared); only Yandex takes the webhook's notice. Run from a normal
// machine, all of them accept it. So after publishing something that should
// reach Bing quickly, run this.
//
//   npm run indexnow -- https://www.zippily.co.nz/insights/some-post
//   npm run indexnow -- /insights/some-post /insights      (see the warning)
//   npm run indexnow -- --sitemap          (every URL in the live sitemap)
//
// In Git Bash on Windows a bare `/insights/x` argument is rewritten to
// `C:/Program Files/Git/insights/x` before this script sees it. Give full
// URLs, or prefix the command with MSYS_NO_PATHCONV=1. Either way every URL is
// fetched first and anything that is not a live 200 is refused, because
// IndexNow accepts any string with a 200 and says nothing about it. That was
// learned the hard way: two submissions of mangled paths were "accepted".
const SITE = 'https://www.zippily.co.nz'
const args = process.argv.slice(2)

async function run(): Promise<string | null> {
  if (args.length === 0) return 'Give paths or URLs, or --sitemap.'

  let urls: string[]
  if (args.includes('--sitemap')) {
    const xml = await (await fetch(`${SITE}/sitemap.xml`)).text()
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  } else {
    urls = args.map((a) => (a.startsWith('http') ? a : `${SITE}${a.startsWith('/') ? '' : '/'}${a}`))
  }

  const stray = urls.filter(
    (u) => !(u === SITE || u.startsWith(`${SITE}/`)) || /[\s:]/.test(u.slice('https://'.length)),
  )
  if (stray.length) return `Not a ${SITE} URL: ${stray[0]}`

  const dead: string[] = []
  await Promise.all(
    urls.map(async (u) => {
      const res = await fetch(u, {redirect: 'manual', headers: {'User-Agent': 'zippily-indexnow-check'}})
      if (res.status !== 200) dead.push(`${res.status} ${u}`)
    }),
  )
  if (dead.length) {
    return `Refusing to send: ${dead.length} URL(s) are not a live 200:\n  ${dead.slice(0, 5).join('\n  ')}`
  }

  const body = JSON.stringify({
    host: new URL(SITE).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  })
  console.log(`${urls.length} URL(s), all live`)
  let accepted = 0
  // The shared endpoint and Bing's own: both worth asking, since the shared
  // one is not guaranteed to pass it on.
  for (const endpoint of INDEXNOW_ENDPOINTS.slice(0, 2)) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body,
    })
    console.log(`  ${new URL(endpoint).host.padEnd(18)} ${res.status}`)
    if (res.ok) accepted++
  }
  return accepted > 0 ? null : 'No endpoint accepted the submission.'
}

// exitCode, not process.exit(): exiting straight after fetch trips a libuv
// assertion on Windows.
const problem = await run()
if (problem) {
  console.error(problem)
  process.exitCode = 1
}
