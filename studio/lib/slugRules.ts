import type {SlugRule} from 'sanity'

/**
 * Slugs that would collide with a real route.
 *
 * A document slugged "services" would sit at /services/services, but more
 * importantly these are the words most likely to be typed by someone who has
 * not thought about where the page lands.
 */
export const RESERVED_SLUGS = new Set([
  'about-us',
  'api',
  'careers',
  'contact',
  'events',
  'industries',
  'insights',
  'lp',
  'our-work',
  'privacy-policy',
  'resources',
  'services',
  'solutions',
  'studio',
])

/** Which URL prefix each routable type lives under. */
export const TYPE_PATHS: Record<string, string> = {
  service: '/services',
  industry: '/industries',
  caseStudy: '/our-work',
  blogPost: '/insights',
  event: '/events',
  vacancy: '/careers',
  partnerIntegration: '/solutions',
  landingPage: '/lp',
  resource: '/resources',
}

export function pathFor(type: string, slug?: string): string | null {
  const base = TYPE_PATHS[type]
  if (!base || !slug) return null
  return `${base}/${slug}`
}

/**
 * Shape rules, shared by every routable type.
 *
 * Deliberately strict. A slug is a permanent public URL, and every allowance
 * here — an uppercase letter, a trailing hyphen, an underscore — becomes a
 * URL someone has to live with or redirect away from later.
 */
export function slugShape(rule: SlugRule) {
  return rule.required().custom((value?: {current?: string}) => {
    const slug = value?.current
    if (!slug) return 'A slug is required.'
    if (slug.length > 60) return 'Keep it to 60 characters or fewer.'
    if (RESERVED_SLUGS.has(slug)) {
      return `"${slug}" is a site section and cannot be used as a slug.`
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return 'Lowercase letters, numbers and hyphens only.'
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return 'Cannot start or end with a hyphen.'
    }
    if (slug.includes('--')) return 'No double hyphens.'
    return true
  })
}

// Uniqueness is not defined here: Sanity's default slug uniqueness check is
// already dataset-wide, which is exactly what is wanted where two types share
// a URL namespace.
