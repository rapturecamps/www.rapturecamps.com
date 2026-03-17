# Go-Live Plan — Rapture Surfcamps

**Created:** 2026-03-05
**Target:** Launch new Astro + Sanity site, replacing WordPress at www.rapturecamps.com

---

## Phase 1: Content Review (You)

- [ ] Review all **country pages** (Bali, Portugal, Costa Rica) — content, images, backgrounds, block order
- [ ] Review all **camp overview pages** — intro, hero, blocks, comparison tables
- [ ] Review all **camp sub-pages** (surf, rooms, food) — content completeness, images
- [ ] Verify all **meta titles & descriptions** are set in Sanity (SEO tab on each page)
- [ ] Verify all **focus keywords** are set (new field in SEO tab)
- [ ] Check **images have alt text** — use SEO Dashboard > Image Alt Text tab in Sanity Studio
- [ ] Review **blog posts** — content, featured images, excerpts

---

## Phase 2: Translation (You + AI)

- [ ] Translate all **country pages** to German
- [ ] Translate all **camp overview pages** to German
- [ ] Translate all **camp sub-pages** to German
- [ ] Translate all **blog posts** to German
- [ ] Translate **homepage** to German
- [ ] Spot-check 3–4 translated pages for quality (du/Sie, natural flow, no broken formatting)
- [ ] Verify blog post slugs are translated to German
- [ ] Verify location page slugs stay in English with `/de/` prefix

---

## Phase 3: Crawl & Comparison (You + AI)

- [ ] Crawl the **current live site** (www.rapturecamps.com) — use Screaming Frog, Sitebulb, or similar
- [ ] Crawl the **new site** (localhost or Vercel preview URL)
- [ ] Provide both crawl files for comparison
- [ ] AI checks: missing pages, broken redirects, missing meta tags, URL structure changes
- [ ] Verify every indexed URL on old site has a redirect (301) or gone (410) in place
- [ ] Trigger a **fresh build** to regenerate `vercel.json` redirects after any final changes

---

## Phase 4: Pre-Launch Technical Checks (AI)

### Vercel Environment Variables
- [ ] `PUBLIC_SANITY_PROJECT_ID` — set
- [ ] `PUBLIC_SANITY_DATASET` — set
- [ ] `SANITY_WRITE_TOKEN` — set
- [ ] `SANITY_API_VERSION` — set
- [ ] `ANTHROPIC_API_KEY` — set
- [ ] `OPENAI_API_KEY` — set
- [ ] `PUBLIC_SITE_URL` — set to `https://www.rapturecamps.com`

### Forms & Integrations (test on Vercel preview URL)
- [ ] Contact form (Zoho Desk) — submits ticket successfully
- [ ] Popup email capture (Zoho Campaigns) — submits successfully
- [ ] Meet Us booking page (Zoho Bookings) — iframe loads
- [ ] Cookie banner — appears, consent saves, GTM loads after accept
- [ ] GTM fires correctly with analytics consent

### Pages & Routing
- [ ] 404 page — shows proper styled page for unknown URLs
- [ ] 410 page — returns "Page Removed" for deleted URLs
- [ ] `/de/` pages — all German routes accessible
- [ ] Sitemap (`/sitemap-index.xml`) — generates correctly, excludes thank-you pages
- [ ] Robots.txt — allows crawling, references sitemap

### SEO
- [ ] Favicon displays correctly in browser tabs
- [ ] Canonical URLs — no trailing slash issues
- [ ] Hreflang tags — present on all bilingual pages
- [ ] OG images — render in social share previews
- [ ] JSON-LD schema — FAQPage, BlogPosting, LodgingBusiness, Organization all present
- [ ] Noindex pages — thank-you, survey-thank-you, 404 are noindexed
- [ ] Only one H1 per page across all page types

### Performance
- [ ] Run Lighthouse on homepage, one camp page, one blog post
- [ ] Target: Performance > 90, SEO > 95
- [ ] Images use responsive `srcset` and lazy loading
- [ ] Fonts self-hosted with `font-display: swap`

---

## Phase 5: DNS Cutover

### Preparation
- [ ] Note current DNS settings (registrar, nameservers, MX records, TXT records)
- [ ] Confirm Vercel project has custom domain `www.rapturecamps.com` added
- [ ] Confirm Vercel SSL certificate is ready (or will auto-provision)
- [ ] Plan cutover during low-traffic window (early morning EU time)
- [ ] Notify team about planned downtime window (typically < 30 min)

### Execution
- [ ] Point DNS A/CNAME records to Vercel (per Vercel's domain setup instructions)
- [ ] Keep MX records, SPF, DKIM, DMARC records unchanged (email must keep working)
- [ ] Verify SSL certificate provisions successfully
- [ ] Test live site loads at `https://www.rapturecamps.com`
- [ ] Test a few key pages: homepage, one camp page, contact form, German version

### Immediately After
- [ ] Verify all Zoho forms work on the live domain
- [ ] Verify GTM fires on the live domain
- [ ] Verify Elfsight review widgets load
- [ ] Submit new sitemap to Google Search Console
- [ ] Verify old WordPress site is no longer accessible (or redirects to new site)

---

## Phase 6: Post-Launch Monitoring (First 48 Hours)

- [ ] Monitor **Google Search Console** for crawl errors
- [ ] Check **Vercel analytics** for 404 spikes
- [ ] Monitor **Zoho Desk** for incoming form submissions
- [ ] Watch for any **Zoho Campaigns** signup issues
- [ ] Check **Core Web Vitals** in GSC after a few days of data
- [ ] Monitor **organic search traffic** in Google Analytics — expect a brief dip, should recover within 1–2 weeks
- [ ] If any indexed pages return unexpected errors, add redirects or fix immediately

---

## Phase 7: Internal Linking Strategy (2–4 Weeks Post-Launch)

- [ ] Audit current site for contextual in-content links (blog ↔ camp pages, cross-camp references)
- [ ] Design internal linking concept based on topic clusters (align with blog category restructuring)
- [ ] Add contextual links within **blog post body text** — link to relevant camp pages, country pages, and related posts
- [ ] Add contextual links within **camp page content** — link to relevant blog posts and nearby camps
- [ ] Consider adding a **"Related Posts"** section to blog posts
- [ ] Consider adding a **"Related Articles"** section to camp pages
- [ ] Review GSC data to identify pages that need more internal link authority (low impressions despite good content)
- [ ] Verify no orphan pages exist (pages only reachable via sitemap, not through any on-site link)

---

## Notes

- Redirects are synced from Sanity to `vercel.json` at build time. After adding/changing redirects in Sanity, trigger a new Vercel deployment.
- The old WordPress site should be kept accessible (but not publicly) for ~30 days as a safety net, in case content needs to be referenced.
- German pages use the `/de/` prefix with English slugs for location pages and translated slugs for blog posts.
