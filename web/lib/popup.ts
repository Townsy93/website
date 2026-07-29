// Targeting and trigger logic for the site popup. Pure functions, so the
// rules that decide whether a visitor sees an interruption are testable
// without a browser — this is the part that is annoying when it is wrong.

export type PopupTrigger =
  | { type: "exitIntent" }
  | { type: "timeOnPage"; seconds: number }
  | { type: "scrollDepth"; percent: number };

export type PopupTargeting = {
  includePaths?: string[] | null;
  excludePaths?: string[] | null;
};

/**
 * Does a path match one rule?
 *
 * Supports an exact path (/pricing) and a trailing wildcard (/services/*).
 * A bare "/*" matches everything. Deliberately no regex: these rules are
 * written by whoever is running the campaign, and a mistyped regex that
 * silently matches nothing is worse than a format that cannot express it.
 */
export function matchesRule(path: string, rule: string): boolean {
  const clean = normalisePath(rule);
  if (!clean) return false;

  if (clean.endsWith("/*")) {
    const prefix = clean.slice(0, -2);
    // "/services/*" covers /services itself as well as everything under it.
    // Treating the section root as outside its own wildcard surprises people.
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  return path === clean;
}

export function normalisePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const noQuery = withSlash.split(/[?#]/)[0] || "/";
  return noQuery.length > 1 ? noQuery.replace(/\/+$/, "") : noQuery;
}

/**
 * Should the popup show on this path?
 *
 * Exclude always beats include. An empty include list means "everywhere",
 * because the common case is a site-wide popup with a couple of exceptions,
 * and requiring someone to list every page to get that is a trap.
 */
export function shouldShowOnPath(path: string, targeting: PopupTargeting): boolean {
  const here = normalisePath(path);

  const excludes = (targeting.excludePaths ?? []).filter(Boolean);
  if (excludes.some((rule) => matchesRule(here, rule))) return false;

  const includes = (targeting.includePaths ?? []).filter(Boolean);
  if (includes.length === 0) return true;

  return includes.some((rule) => matchesRule(here, rule));
}

/** How far down the page the visitor has scrolled, 0-100. */
export function scrollPercent(
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  // A page shorter than the viewport cannot be scrolled, so any scroll-depth
  // trigger on it would never fire. Treat it as fully read instead.
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, (scrollY / scrollable) * 100));
}

/** Storage key for a dismissal, scoped per popup so a new campaign shows again. */
export function dismissalKey(popupId: string): string {
  return `zippily-popup-dismissed:${popupId}`;
}
