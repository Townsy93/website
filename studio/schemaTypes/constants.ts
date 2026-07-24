// Shared taxonomies — see docs/functional-spec.md §5.
// These drive the Services landing filter pills and the Insight Hub filters.

export const SERVICE_CATEGORIES = [
  {title: 'Discover', value: 'discover'},
  {title: 'Build', value: 'build'},
  {title: 'Scale', value: 'scale'},
] as const

export const BLOG_TOPICS = [
  {title: 'Feature spotlights', value: 'feature-spotlights'},
  {title: 'Best practices', value: 'best-practices'},
  {title: 'News and events', value: 'news-and-events'},
  {title: 'Our approach', value: 'our-approach'},
  {title: 'AI developments', value: 'ai-developments'},
] as const

export const MARKER_STYLES = [
  {title: 'Circle', value: 'circle'},
  {title: 'Underline', value: 'underline'},
  {title: 'None', value: 'none'},
] as const
