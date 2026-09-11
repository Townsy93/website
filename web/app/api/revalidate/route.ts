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

    /**
     * Types that are only ever reached through a dereference.
     *
     * Cache tags are derived from the `_type ==` filters in a query, and a
     * dereference does not add one — a service page query says
     * `_type == "service"` and then `pricingTable->{...}`, so it carries
     * `type:service` and nothing else. Publishing a pricing table on its own
     * therefore purged nothing, and the site would keep serving the old
     * price until the hourly window expired.
     *
     * That is not hypothetical: superseded CRM Implementation pricing was
     * live on an indexable page because of exactly this gap. Repricing is
     * the case that most needs to propagate immediately.
     */
    // Built from an audit of every `->` dereference in web/sanity/queries.ts
    // (2026-09-11) — a query using the `*[_type == "x"][0].field` bracket
    // form instead of a dereference already self-tags via the regex above
    // and needs no entry here (used deliberately by vacancy/careersPage/
    // partnerIntegration queries for exactly this reason); only genuine `->`
    // dereferences create this blind spot.
    const FANOUT: Record<string, string[]> = {
      pricingTable: ["service"],
      // homePage, aboutPage, servicesLandingPage and ourWorkPage all
      // dereference testimonials[]/videoTestimonials[]/googleReviews[]
      // directly (their own picks, not just via another document) — same
      // gap as pricingTable above: editing a testimonial published fine but
      // left these pages' cached renders stale indefinitely. Confirmed live:
      // Ido Drent's and Ben Madden-Holmes' quotes, both featured on the
      // homepage, didn't update until homePage's own cache tag was purged.
      testimonial: [
        "service",
        "industry",
        "caseStudy",
        "partnerIntegration",
        "landingPage",
        "homePage",
        "aboutPage",
        "servicesLandingPage",
        "ourWorkPage",
      ],
      // event.host-> and resource.author-> also dereference teamMember.
      teamMember: ["blogPost", "aboutPage", "event", "resource"],
      client: ["caseStudy"],
      hubOffering: ["blogPost"],
      // caseStudy had no entry at all — the widest-reaching gap found:
      // every one of these pages features a case study by reference, so
      // none of them picked up a case study edit (new photos, a rewritten
      // headline, updated stats) until something else happened to also
      // touch that page.
      caseStudy: [
        "homePage",
        "servicesLandingPage",
        "service",
        "solutionsPage",
        "industriesHubPage",
        "industry",
        "ourWorkPage",
        "partnerIntegration",
      ],
      // Also had no entry: homePage's services teaser, the services landing
      // grid, a case study's "service delivered" reference, and the Hub
      // carousel's "linked service" label all dereference service.
      service: ["homePage", "servicesLandingPage", "caseStudy", "hubOffering"],
      // Also had no entry: a recap link (events), a related-post pick
      // (resources), and the Insight Hub's featured post all dereference
      // blogPost.
      blogPost: ["eventsPage", "event", "resource", "insightHubPage"],
      // Also had no entry: a case study's industry tag, the homepage's
      // industries teaser, and the Industries hub's own picks all
      // dereference industry.
      industry: ["caseStudy", "homePage", "industriesHubPage"],
    };
    for (const also of FANOUT[body._type] ?? []) tags.push(`type:${also}`);

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
