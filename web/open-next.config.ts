import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

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
/**
 * Tag cache.
 *
 * The incremental cache above stores rendered pages. It does not store which
 * cache tags each page carries, so revalidateTag has nothing to look up and
 * silently purges nothing. That is a quiet failure of exactly the kind this
 * codebase keeps hitting: the publish webhook arrived, validated its
 * signature, logged "revalidate service -> type:service" and returned 200,
 * and the page still served the old copy 165 seconds later.
 *
 * KV rather than D1 or Durable Objects: this is a key/value lookup with no
 * schema to migrate, and tag purges are infrequent enough that KV's eventual
 * consistency is not a factor.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: kvNextTagCache,
});
