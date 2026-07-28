import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * Incremental cache backend.
 *
 * Without this, every route carrying `revalidate` silently re-renders on each
 * request: the ISR annotations are present and none of the benefit is, with
 * no error to say so. It was measurable — x-nextjs-cache returned MISS on
 * consecutive requests to the same static page, and TTFB sat around 450ms.
 *
 * Verified against @opennextjs/cloudflare 1.20.2 rather than assumed: this
 * override reads the R2 bucket from the NEXT_INC_CACHE_R2_BUCKET binding,
 * which is declared in wrangler.jsonc.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
