import {writeClient} from '../write-client.ts'

/**
 * One-off, 10 October 2026 — the public FAQs for /services/revops-retainers.
 *
 * Historical record, not a tool. It is kept for provenance: which copy was
 * published, where each fact came from, and what was deliberately withheld.
 * `content:patch` is the general-purpose script; this is the audit trail for
 * one content change.
 *
 * Run (from studio/):
 *   node --env-file=.env --experimental-strip-types scripts/one-off/retainer-faqs.ts
 *   node --env-file=.env --experimental-strip-types scripts/one-off/retainer-faqs.ts --apply
 *
 * Dry run by default, because this `.set()`s the whole faqs array — re-running
 * it with --apply discards any edits made in Studio since. The _key guard
 * below additionally refuses to run when the document holds FAQs this script
 * did not write, which catches items added in Studio. It does NOT catch an
 * existing item edited in place, since Studio keeps its _key: the dry-run
 * default is the only protection there, so read the BEFORE output.
 *
 * Sourcing — Knowledge/Services-And-Pricing/service-brief-retainers.md in the
 * AI Brain repo, with every figure verified against PRICING-CHANGELOG.md, the
 * sole authority per the repo root CLAUDE.md:
 *   - Momentum $4,000 / 20 hrs, Partner $5,500 / 30 hrs — "Release: 2
 *     September 2026 — Momentum reprice to $4,000" (Partner unchanged).
 *   - $207/hr overage — "Release: 19 August 2026 — Retainer reprice".
 *   - 6-month initial term, 30 days' notice, month 1 in advance against the
 *     onboarding audit, monthly expiry with Partner carry-forward — the
 *     brief's "Commercial Terms".
 *
 * Deliberately NOT published, both still open on Sean's side:
 *   1. Partner's 4-business-hour SLA. The brief: "should not be published
 *      until the escalation plan exists", tied to the unresolved September
 *      cover. Publishing only Momentum's 12-hour SLA would read oddly, so
 *      response times are omitted altogether.
 *   2. The build-vs-engagement hour split (~12.5 of Momentum's 20). An
 *      internal estimate with an open decision attached (the brief's
 *      recommendation to move Momentum to a monthly WIP plus a written
 *      fortnightly check-in). The brief's own guidance is that the site must
 *      not imply "20 hours of HubSpot work" — FAQ 2 frames it as hours of
 *      engagement without publishing the number.
 *
 * Adding these FAQs also turned on this page's FAQPage markup: `FaqJsonLd`
 * reads the same field the accordion does, so the structured data appeared
 * without a deploy.
 */

const DOC_ID = 'service-revops-retainers'
const KEY_PREFIX = 'retainerFaq'

const faqs = [
  {
    _type: 'faqItem',
    _key: `${KEY_PREFIX}1`,
    question: 'What does it cost?',
    answer:
      'Momentum is $4,000 a month for 20 hours, Partner is $5,500 for 30. Six-month initial term, then 30 days’ notice — and every price agreed before we start.',
  },
  {
    _type: 'faqItem',
    _key: `${KEY_PREFIX}2`,
    question: 'What do the hours actually cover?',
    answer:
      'Everything we spend on you — the WIPs, the monthly report, the emails back and forth — not just time in the portal. It’s 20 hours of senior HubSpot engagement, not 20 hours of config. Better you hear that now than find out in month three.',
  },
  {
    _type: 'faqItem',
    _key: `${KEY_PREFIX}3`,
    question: 'What’s the difference between Momentum and Partner?',
    answer:
      'Momentum keeps your portal healthy: data stays clean, workflows keep working, improvements land every month, and you set the agenda. Partner adds a roadmap we own jointly with you, quarterly planning, and new capability built against it each quarter. Momentum maintains. Partner builds.',
  },
  {
    _type: 'faqItem',
    _key: `${KEY_PREFIX}4`,
    question: 'What happens in the first month?',
    answer:
      'Month one is paid up front and goes on a portal audit, access and integrations, a documentation baseline and your roadmap. Business as usual starts in month two, with us already knowing where everything lives.',
  },
  {
    _type: 'faqItem',
    _key: `${KEY_PREFIX}5`,
    question: 'What if we need more hours than that?',
    answer:
      'Unused hours expire at the end of each month, though Partner clients can carry one month forward. Go over and the extra hours are $207 each, agreed before the work starts — we’d rather do that than quietly drop something or push you into a tier you don’t need.',
  },
]

// Schema limits from studio/schemaTypes/objects/faqItem.ts and service.ts.
for (const f of faqs) {
  if (f.question.length > 120) throw new Error(`question over 120 chars: ${f.question}`)
  if (f.answer.length > 700) throw new Error(`answer over 700 chars: ${f.question}`)
}
if (faqs.length > 6) throw new Error('service.faqs allows at most 6')

const apply = process.argv.includes('--apply')
const before: {_key?: string; question?: string}[] | null = await writeClient.fetch(
  `*[_id=="${DOC_ID}"][0].faqs`,
)

// Only ever replace nothing, or this script's own earlier output.
const foreign = (before ?? []).filter((f) => !f._key?.startsWith(KEY_PREFIX))
if (foreign.length > 0) {
  console.error(
    `Refusing to overwrite ${foreign.length} FAQ(s) not written by this script:\n` +
      foreign.map((f) => `  - ${f.question}`).join('\n') +
      `\nEdit them in Studio, or use content:patch deliberately.`,
  )
  process.exit(1)
}

console.log('BEFORE:', before ? `${before.length} FAQ(s)` : 'none')
if (!apply) {
  console.log('\nWould set:')
  for (const f of faqs) console.log(`  - ${f.question}`)
  console.log('\nDry run. Re-run with --apply to write.')
} else {
  await writeClient.patch(DOC_ID).set({faqs}).commit()
  const after: {question: string}[] = await writeClient.fetch(
    `*[_id=="${DOC_ID}"][0].faqs[]{question}`,
  )
  console.log('\nAFTER:')
  for (const f of after) console.log(`  - ${f.question}`)
}
