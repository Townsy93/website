# DNS cutover: Squarespace → Cloudflare

Captured 12 October 2026 from the Squarespace DNS Settings panel, with every
truncated value recovered by live DNS query rather than retyped from the UI.

**The website being late is recoverable. Email going down is not.** This zone
carries Google Workspace mail plus four separate sending services. Treat the
record migration as the main event and the Worker as the easy part.

## Why a nameserver move is unavoidable

A Cloudflare Worker only serves a custom domain if the zone is in your
Cloudflare account. Pointing `www` at `website.sean-fe5.workers.dev` by CNAME
does not work — Cloudflare rejects a foreign `Host` header on a `workers.dev`
domain with a 403 (observed, not assumed).

Registrar and DNS are both Squarespace. The `ns-cloud-e[1-4].googledomains.com`
nameservers are Squarespace's, inherited from their Google Domains acquisition.

## Rollback is not what you think

Record TTLs (4 hrs here) govern records *while Squarespace is authoritative*.
Once nameservers change, propagation is governed by the **.nz registry's NS
TTL**, which you do not control and cannot shorten. Reverting nameservers is
slow and is a last resort.

The safety net is not rollback — it is having the zone correct in Cloudflare
*before* flipping, with low TTLs there so post-flip fixes are fast.

**DNSSEC is off** (no DS, no DNSKEY, verified 12 Oct). Leave it off until well
after cutover: moving nameservers on a signed zone takes the domain down until
the DS record is retracted.

---

## Records to DROP (3)

Squarespace-specific. The Worker custom domain replaces the first two.

| Type | Name | Data |
|---|---|---|
| A | `@` | `198.185.159.144` |
| CNAME | `www` | `ext-sq.squarespace.com` |
| CNAME | `_domainconnect` | `_domainconnect.domains.squarespace.com` |

## Records to KEEP (21)

Every one of these must exist in Cloudflare before the flip. Cloudflare's scan
routinely misses TXT and DKIM entries — **diff this list against the import,
line by line.** That diff is where this goes wrong.

### Google Workspace mail — inbound email dies without these

| Type | Name | Priority | Data |
|---|---|---|---|
| MX | `@` | 1 | `aspmx.l.google.com` |
| MX | `@` | 5 | `alt1.aspmx.l.google.com` |
| MX | `@` | 5 | `alt2.aspmx.l.google.com` |
| MX | `@` | 10 | `alt3.aspmx.l.google.com` |
| MX | `@` | 10 | `alt4.aspmx.l.google.com` |

### Domain verification and policy

| Type | Name | Data |
|---|---|---|
| TXT | `@` | `google-site-verification=rwodH8C9Y7kfpTWBs-V4XSi8FKElUjiyGGsJou4qdC8` |
| TXT | `@` | `brevo-code:f02aeb067f7a6bf148483858f8fa646f` |
| TXT | `@` | `v=spf1 include:_spf.google.com include:441648495.spf06.hubspotemail.net ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com` |

Losing the `google-site-verification` TXT costs you Search Console ownership —
which you need immediately after cutover to submit the sitemap.

### DKIM — signing breaks silently, deliverability degrades over days

| Type | Name | Data |
|---|---|---|
| CNAME | `brevo1._domainkey` | `b1.zippily-co-nz.dkim.brevo.com` |
| CNAME | `brevo2._domainkey` | `b2.zippily-co-nz.dkim.brevo.com` |
| CNAME | `hs1-441648495._domainkey` | `zippily-co-nz.hs14a.dkim.hubspotemail.net` |
| CNAME | `hs2-441648495._domainkey` | `zippily-co-nz.hs14b.dkim.hubspotemail.net` |
| CNAME | `1._domainkey` | `1.domainkey.u55485583.wl084.sendgrid.net` |
| CNAME | `12._domainkey` | `12.domainkey.u55485583.wl084.sendgrid.net` |
| CNAME | `em6991` | `u55485583.wl084.sendgrid.net` |

The three SendGrid records arrived via "Domain Connect to Entri". Nothing in
the website repo uses SendGrid — **find out what does before assuming they are
dead.** Keep them unless you can name the service and confirm it is retired.

### The `mail.` subdomain — this is what sends your portal and health-check email

`health/wrangler.jsonc` sends alerts from `portal@mail.zippily.co.nz`. Break
this and the weekly site check stops being able to tell you anything.

| Type | Name | Priority | Data |
|---|---|---|---|
| MX | `mail` | 10 | `inbound-smtp.ap-northeast-1.amazonaws.com` |
| MX | `send.mail` | 10 | `feedback-smtp.ap-northeast-1.amazonses.com` |
| TXT | `_dmarc.mail` | — | `v=DMARC1; p=none; pct=100; rua=mailto:re+uc3lmvb81ja@dmarc.postmarkapp.com; sp=none; aspf=r` |
| TXT | `send.mail` | — | `v=spf1 include:amazonses.com ~all` |
| TXT | `resend._domainkey.mail` | — | see below — do not retype |

`resend._domainkey.mail` is a 216-character RSA public key and is **truncated
in the Squarespace UI**. Copy it from here, not from the panel:

```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+9ySohKUSGDxMgqJLfr5Ch4tFYQO4tlrxtKlniezLnWfehu7MC/MFtakg3Q4NPW7EgwWOInWLHnHIIgqE1ezpyEHxwDgQ5CjoFt/wZYp8QWT3I3JJ9pFuNUAL0PhWtPPu0jR4uNZCAgEhw9gy9O3yfhFo2z5HX8jmI0fsJiDMrwIDAQAB
```

A single wrong character here does not error — it silently fails signing.

---

## Two pre-existing faults, found while capturing this

Fix both when re-entering in Cloudflare rather than copying the fault across.

**1. The `send.mail` SPF record has a leading tab.** It currently publishes as
`"\tv=spf1 include:amazonses.com ~all"`. An SPF record must begin with `v=spf1`;
a leading whitespace character makes strict parsers skip it, so this record may
be doing nothing today. Re-enter it with no leading whitespace.

**2. A second `send.mail` TXT holds a bare hostname** —
`feedback-smtp.ap-northeast-1.amazonses.com` — with no `v=` prefix. That value
belongs in the MX record, which already exists. It is almost certainly a
mis-entry. Harmless, but do not carry it over.

---

## Two phases, not one

Done as two independently reversible steps rather than one irreversible one:

**Phase 1 — move DNS only.** Recreate the records in Cloudflare exactly as they
were, *including* the Squarespace `A` and `CNAME www`, then change nameservers.
The website carries on serving from Squarespace and mail carries on flowing.
Nothing visibly changes; the only risk in play is the record migration.

**Phase 2 — switch the website.** Once DNS is stable, delete those two records
and attach the Worker. Risk is now the website alone, and it reverses in minutes
by re-adding the Squarespace records at a low TTL.

Splitting them also avoids an ordering problem: Cloudflare generally cannot
issue certificates for a Worker custom domain until the zone is *active*, which
requires the nameservers to have already moved.

## On rollback

Record TTLs govern records only while the current provider is authoritative.
Once nameservers change, propagation is governed by the **.nz registry's NS
TTL**, which you do not control and cannot shorten. Reverting nameservers is
slow and is a last resort.

The safety net is not rollback. It is a verified zone in Cloudflare *before* the
flip, with low TTLs there so post-flip fixes are fast.

## Phase 1 — completed 12 October 2026

1. Connect a domain (not Transfer — registration stays at Squarespace).
2. Automatic import. **It found 16 of the 24 records.** Every missed record was
   one whose name is not guessable, which is exactly what a scanner cannot do:
   `hs1-441648495._domainkey`, `hs2-441648495._domainkey`, `1._domainkey`,
   `12._domainkey`, `em6991`, `MX send.mail`, `TXT send.mail`,
   `TXT resend._domainkey.mail`. Added by hand.
3. **Cloudflare imported every CNAME as Proxied.** That silently breaks DKIM —
   a proxied CNAME stops returning the CNAME chain and returns Cloudflare IPs
   instead, so a verifier never reaches the target. Every record was set to
   DNS-only. Cloudflare then warns the domain is "not fully protected"; that
   warning is correct and should be dismissed, because 21 of the 24 records can
   never be proxied anyway.
4. Verified by querying `leah.ns.cloudflare.com` and `leonard.ns.cloudflare.com`
   **directly**, before the flip. Cloudflare answers for a zone as soon as it is
   set up, even while the registry still points elsewhere — so the whole zone can
   be proven correct with nothing yet committed. Both nameservers agreed on
   every record, and the 218-character Resend DKIM key matched byte for byte.
5. Nameservers changed at Squarespace to `leah` + `leonard`, 10:05 NZDT.

Watch the registry directly rather than a recursive resolver, which caches:

```bash
nslookup -type=NS zippily.co.nz ns1.dns.net.nz
```

### Known-outstanding, deliberately

`TXT send.mail` still carries a leading tab (`"	v=spf1 include:amazonses.com ~all"`),
so strict parsers skip it, and a second `TXT send.mail` holds a bare hostname
that belongs in the MX. Both were carried over from the Squarespace zone despite
several attempts to correct them in Cloudflare.

Neither is a regression — the tab is in the original zone too. They affect only
SES/Resend sending from `mail.zippily.co.nz` (the client portal and the weekly
health-check alerts), not client email, which runs on Google Workspace via the
root SPF. The root SPF was verified as present exactly once; a second SPF record
at the apex would be a hard `permerror` and break mail for Google *and* HubSpot.

## Phase 2 — switching the website to the Worker

Only once the registry shows the Cloudflare nameservers and mail has been
confirmed arriving.

1. Delete `A zippily.co.nz` → `198.185.159.144` and `CNAME www` → `ext-sq.squarespace.com`.
2. Workers → `website` → Custom Domains for `www.zippily.co.nz` and `zippily.co.nz`.
3. Add a redirect rule for apex → www. Squarespace serves that 301 today and it
   leaves with them.
4. Leave the Squarespace site subscribed until the new site has served for a few
   days. Do not cancel during propagation.

**Verify, email first**

```bash
curl -s  https://www.zippily.co.nz/robots.txt                     # MUST say Allow: /
curl -sI https://www.zippily.co.nz | grep -i '^server'            # cloudflare, not Squarespace
curl -s  https://www.zippily.co.nz/sitemap.xml | grep -c '<loc>'  # expect ~61
curl -sI https://zippily.co.nz | grep -i '^location'              # the www 301
```

Then send yourself mail at your `@zippily.co.nz` address and confirm it
arrives. A broken website is visible; broken MX is silent.

`robots.txt` is host-aware and should flip from `Disallow: /` to `Allow: /` the
moment the real hostname serves. That branch is covered by unit test but has
never been exercised by a live request — Cloudflare 403s a spoofed Host header,
so it could not be tested from outside. **If it still says `Disallow`, the site
is live and invisible to search.**

**After**

8. `health/wrangler.jsonc`: `BASE_URL` → `https://www.zippily.co.nz`, redeploy.
   Otherwise the weekly check watches staging forever.
9. Repoint the Sanity revalidate webhook at the production `/api/revalidate`,
   or publishing stops updating the live site.
10. Cloudflare Transform Rule: `X-Robots-Tag: noindex` on `*.workers.dev`.
    robots.txt stops crawling; only this header drops already-indexed staging URLs.
11. Search Console: no Change of Address needed — same domain, only the platform
    moved. Submit the sitemap once you have confirmed it returns ~61 URLs.
12. `npx wrangler tail --name website` for the first day.
