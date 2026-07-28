import { EXPECTED_REDIRECTS, EXPECTED_UNCHANGED } from "./expected.ts";
import {
  formatReport,
  inBatches,
  pageProblems,
  parseSitemap,
  redirectProblems,
  unchangedProblems,
  type Failure,
} from "./checks.ts";

type Env = {
  BASE_URL: string;
  ALERT_FROM: string;
  ALERT_TO: string;
  RESEND_API_KEY: string;
  /** Optional. When absent, the on-demand endpoint is disabled rather than open. */
  HEALTH_RUN_TOKEN?: string;
};

// Eight at a time. The whole run is ~150 requests against a Worker that is
// serving real traffic; there is no reason to make it a load test.
const CONCURRENCY = 8;

async function head(url: string): Promise<{ status: number; location: string | null }> {
  // GET rather than HEAD: Next only emits the redirect on a real request, and
  // some edge caches treat HEAD differently enough to give a misleading answer.
  const res = await fetch(url, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") };
}

export async function runCheck(env: Env): Promise<{ failures: Failure[]; checked: number }> {
  const base = env.BASE_URL.replace(/\/+$/, "");
  const failures: Failure[] = [];
  let checked = 0;

  // 1. The sitemap itself. If this is broken nothing else is worth reporting,
  //    because every downstream result would be an artefact of it.
  let sitemapPaths: string[] = [];
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    checked++;
    if (res.status !== 200) {
      return { failures: [{ url: "/sitemap.xml", problem: `returned ${res.status}` }], checked };
    }
    sitemapPaths = parseSitemap(await res.text());
    if (sitemapPaths.length === 0) {
      return { failures: [{ url: "/sitemap.xml", problem: "is empty" }], checked };
    }
  } catch (error) {
    return {
      failures: [{ url: "/sitemap.xml", problem: `could not be fetched: ${String(error)}` }],
      checked,
    };
  }

  // 2. Every page the sitemap claims is indexable.
  await inBatches(sitemapPaths, CONCURRENCY, async (path) => {
    try {
      const res = await fetch(`${base}${path}`);
      const html = res.status === 200 ? await res.text() : "";
      checked++;
      for (const problem of pageProblems(res.status, html)) failures.push({ url: path, problem });
    } catch (error) {
      failures.push({ url: path, problem: `request failed: ${String(error)}` });
    }
  });

  // 3. Every redirect from the approved launch mapping.
  await inBatches(EXPECTED_REDIRECTS, CONCURRENCY, async ([from, to]) => {
    try {
      const hop = await head(`${base}${from}`);
      let destinationStatus: number | null = null;
      if (hop.location) {
        const dest = await fetch(`${base}${hop.location.replace(/^https?:\/\/[^/]*/i, "")}`);
        destinationStatus = dest.status;
      }
      checked++;
      for (const problem of redirectProblems(hop.status, hop.location, to, destinationStatus)) {
        failures.push({ url: from, problem });
      }
    } catch (error) {
      failures.push({ url: from, problem: `request failed: ${String(error)}` });
    }
  });

  // 4. The four old URLs that keep their path. A redirect appearing here would
  //    mean a rule was added that should not have been.
  await inBatches(EXPECTED_UNCHANGED, CONCURRENCY, async (path) => {
    try {
      const hop = await head(`${base}${path}`);
      checked++;
      for (const problem of unchangedProblems(hop.status)) failures.push({ url: path, problem });
    } catch (error) {
      failures.push({ url: path, problem: `request failed: ${String(error)}` });
    }
  });

  return { failures, checked };
}

async function sendAlert(env: Env, body: string, count: number): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.ALERT_FROM,
      to: [env.ALERT_TO],
      subject: `zippily.co.nz — ${count} site problem${count === 1 ? "" : "s"} found`,
      text: body,
    }),
  });
  if (!res.ok) {
    // Throwing marks the cron run as failed in the Cloudflare dashboard, which
    // is the only remaining signal once the email itself is what broke.
    throw new Error(`Resend rejected the alert: ${res.status} ${await res.text()}`);
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const { failures, checked } = await runCheck(env);
        if (failures.length === 0) {
          console.log(`OK — ${checked} checks passed against ${env.BASE_URL}`);
          return;
        }
        const report = formatReport(failures, checked, env.BASE_URL);
        if (!env.RESEND_API_KEY) {
          // Log rather than throw. A missing key is a setup gap, and losing the
          // findings on top of it would make the run useless twice over.
          console.log(`No RESEND_API_KEY set, so the report is only logged:\n${report}`);
          return;
        }
        console.log(`${failures.length} problems across ${checked} checks`);
        await sendAlert(env, report, failures.length);
      })(),
    );
  },

  // Lets the check be run on demand rather than waiting a week to find out
  // whether it works. Returns the report as text and never emails.
  //
  // Gated on a token, and disabled entirely when that token is not set: an
  // open endpoint here would let anyone fire ~150 requests at the live site on
  // repeat. Failing closed means forgetting the secret disables the endpoint
  // rather than exposing it.
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname !== "/run") {
      return new Response("POST /run to check now. The weekly run emails only on failure.\n", {
        status: 404,
      });
    }
    if (!env.HEALTH_RUN_TOKEN) {
      return new Response("On-demand runs are disabled: HEALTH_RUN_TOKEN is not set.\n", {
        status: 503,
      });
    }
    if (request.headers.get("authorization") !== `Bearer ${env.HEALTH_RUN_TOKEN}`) {
      return new Response("Unauthorised.\n", { status: 401 });
    }
    const { failures, checked } = await runCheck(env);
    return new Response(
      failures.length === 0
        ? `OK — ${checked} checks passed against ${env.BASE_URL}\n`
        : formatReport(failures, checked, env.BASE_URL) + "\n",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  },
};
