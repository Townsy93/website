import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { revalidateTag } from "next/cache";

/**
 * Sanity publish webhook.
 *
 * Replaces waiting out the hourly revalidate window: a publish shows on the
 * live site within seconds instead. Invalidation is by document type rather
 * than the whole cache, so publishing one blog post does not force every
 * other page to re-render.
 *
 * The signature is verified against SANITY_REVALIDATE_SECRET. Without that
 * check this endpoint would let anyone on the internet flush the cache
 * repeatedly, which is a cheap way to make the site slow.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<{
      _type?: string;
      _id?: string;
      slug?: { current?: string };
    }>(req, secret);

    if (!isValidSignature) {
      return NextResponse.json({ ok: false, message: "Bad signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ ok: false, message: "No document type" }, { status: 400 });
    }

    const tags = [`type:${body._type}`];

    // Singletons and settings feed the layout on every page, so a change to
    // one of those genuinely does need a wider sweep.
    const global = new Set(["siteSettings", "redirect"]);
    if (global.has(body._type)) tags.push("type:siteSettings");

    // Next 16 requires a cache profile. expire: 0 marks the entry stale
    // immediately, which is what an on-demand purge means — a named profile
    // would impose its own lifetime instead.
    for (const tag of tags) revalidateTag(tag, { expire: 0 });

    console.log(`[revalidate] ${body._type} ${body._id ?? ""} -> ${tags.join(", ")}`);
    return NextResponse.json({
      ok: true,
      revalidated: tags,
      slug: body.slug?.current ?? null,
    });
  } catch (error) {
    console.error(`[revalidate] ${String(error)}`);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
