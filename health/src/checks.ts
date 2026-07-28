// Pure checking logic. Nothing here fetches, so all of it is testable without
// a network or a deployed site.

export type Failure = { url: string; problem: string };

/** Pull the <loc> values out of a sitemap, as paths. */
export function parseSitemap(xml: string): string[] {
  const out: string[] = [];
  for (const [, loc] of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    out.push(pathOf(loc));
  }
  return out;
}

/** Reduce an absolute or relative URL to its path, so comparisons survive a
 *  domain change. The whole point of BASE_URL being configurable is that this
 *  check keeps working after cutover. */
export function pathOf(url: string): string {
  const stripped = url.replace(/^https?:\/\/[^/]*/i, "");
  const noQuery = stripped.split(/[?#]/)[0] || "/";
  // A trailing slash is the same page; treat it as such rather than reporting
  // a mismatch on a difference nobody would call a fault.
  return noQuery.length > 1 ? noQuery.replace(/\/+$/, "") : noQuery;
}

/**
 * What is wrong with a page that the sitemap says should be indexable.
 *
 * noindex is treated as a fault rather than ignored: a URL cannot both be
 * submitted to Google and be marked "do not index", and that contradiction is
 * exactly the kind of thing that happens when a pageBuilt toggle is flipped
 * the wrong way.
 */
export function pageProblems(status: number, html: string): string[] {
  if (status !== 200) return [`returned ${status}`];

  const problems: string[] = [];

  const description = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  if (!description || description[1].trim().length === 0) {
    problems.push("no meta description");
  }

  const robots = /<meta\s+name=["']robots["'][^>]*content=["']([^"']*)["']/i.exec(html);
  if (robots && /noindex/i.test(robots[1])) {
    problems.push("marked noindex but is in the sitemap");
  }

  if (!/<title[^>]*>\s*\S/i.test(html)) problems.push("no title");

  return problems;
}

/** What is wrong with a redirect that should be permanent and land somewhere real. */
export function redirectProblems(
  status: number,
  location: string | null,
  expected: string,
  destinationStatus: number | null,
): string[] {
  if (status !== 301 && status !== 308) {
    return [`returned ${status}, expected a permanent redirect`];
  }

  const problems: string[] = [];
  const landed = location ? pathOf(location) : null;

  if (landed !== pathOf(expected)) {
    problems.push(`redirects to ${landed ?? "nowhere"}, expected ${expected}`);
  }

  // Checked even when the destination is unexpected: knowing the place it
  // actually lands is also broken is more useful than one fault at a time.
  if (destinationStatus !== null && destinationStatus !== 200) {
    problems.push(`destination ${landed} returns ${destinationStatus}`);
  }

  return problems;
}

/** An old URL that keeps its path must serve the page, not redirect away. */
export function unchangedProblems(status: number): string[] {
  if (status === 200) return [];
  if (status === 301 || status === 308) {
    return [`redirects away, but this URL is supposed to keep its path`];
  }
  return [`returned ${status}`];
}

/** Run tasks with a ceiling on how many are in flight at once. */
export async function inBatches<T, R>(
  items: readonly T[],
  size: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return out;
}

export function formatReport(failures: Failure[], checked: number, baseUrl: string): string {
  const lines = [
    `${failures.length} problem${failures.length === 1 ? "" : "s"} found across ${checked} checks.`,
    ``,
    `Site: ${baseUrl}`,
    ``,
  ];
  for (const f of failures) lines.push(`${f.url}`, `    ${f.problem}`, ``);
  lines.push(
    `Nothing here is necessarily urgent, but each one is invisible to visitors`,
    `until it costs you traffic. Send this to Claude and it can diagnose them.`,
  );
  return lines.join("\n");
}
