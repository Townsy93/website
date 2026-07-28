import "server-only";
import { client } from "@/sanity/client";

/**
 * Resolves a retired URL to its replacement.
 *
 * Called only on the 404 path — when a slug does not match a document — so it
 * costs nothing on the happy path. Doing it here rather than in
 * next.config.ts matters: config redirects are baked at build time, so a slug
 * renamed in Studio would keep 404ing until someone redeployed, which is
 * exactly the window in which the traffic is lost.
 */
export async function findRedirect(path: string): Promise<{
  to: string;
  permanent: boolean;
} | null> {
  try {
    const result = await client.fetch<{ to: string; permanent?: boolean } | null>(
      `*[_type == "redirect" && from == $path][0]{ to, permanent }`,
      { path },
      // Short window: a redirect created by a slug change should start
      // working within a minute, not an hour.
      { next: { revalidate: 60 } },
    );
    if (!result?.to) return null;
    return { to: result.to, permanent: result.permanent !== false };
  } catch {
    // A lookup failure must fall through to a normal 404, never a 500.
    return null;
  }
}
