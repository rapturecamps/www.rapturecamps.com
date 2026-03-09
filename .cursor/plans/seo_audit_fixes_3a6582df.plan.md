---
name: SEO Audit Fixes
overview: Prioritized action plan from the full SEO audit of rapturecamps.com, covering 15 findings across critical, high, medium, and low priority tiers. Several items from a prior audit session have already been fixed.
todos:
  - id: hero-h1
    content: "Fix H1: CMS field for homepage/country, hero-as-h1 for contact"
    status: completed
  - id: multiple-h1
    content: Fix multiple H1s on camp sub-pages (SurfIntro, SurfConditions, FoodIntro)
    status: completed
  - id: noindex-sanity
    content: Pass seo.noindex from Sanity to BaseLayout on all page types
    status: completed
  - id: canonical-trailing
    content: Normalize canonical URLs by stripping trailing slashes
    status: completed
  - id: de-blog-og
    content: Fix DE blog posts missing seo.ogImageUrl
    status: completed
  - id: sitemap-thankyou
    content: Filter /thank-you and /survey-thank-you from sitemap
    status: completed
  - id: camp-schema
    content: Add LodgingBusiness JSON-LD to camp overview pages
    status: completed
  - id: jobs-footer
    content: Add /jobs link to footer
    status: completed
  - id: img-dimensions
    content: Add width/height to above-the-fold images
    status: completed
  - id: srcset-remaining
    content: Add srcset to remaining image components
    status: completed
  - id: airtable-defer
    content: Add defer to Airtable script on jobs page
    status: completed
  - id: blog-author
    content: Add author fields to blog posts in Sanity
    status: completed
  - id: keyword-meta
    content: Set unique meta titles/descriptions per page type in Sanity
    status: completed
  - id: content-gaps
    content: Plan content pages for high-value search intents
    status: completed
  - id: linkinbio-font
    content: Remove Google Fonts import from linkin-bio
    status: completed
isProject: false
---

# SEO Audit -- Rapture Surfcamps

**Date:** March 3, 2026
**Site:** rapturecamps.com (Astro, Sanity CMS, Tailwind, Vercel)
**Focus keywords:** "surf camp" + location terms

---

## Already Fixed (This Session)

- Static sitemaps overriding auto-generated sitemap
- FAQ schema not injectable into `<head>`
- Blog posts missing BlogPosting JSON-LD
- Camp pages use generic OG image for social sharing
- 5 image components missing responsive srcset
- 404 page indexable (now has noindex)
- Hreflang incorrect for untranslated blog posts
- Hero background images missing auto=format
- Font display already set (`font-display: swap`)

---

## Critical -- Blocking Ranking

### 1. No H1 on homepage, country pages, and contact page

[src/components/sections/Hero.astro](src/components/sections/Hero.astro) line 104 renders the main heading as `<p role="heading" aria-level="2">` -- intentionally, since the hero text is a visual slogan, not the SEO heading. The real SEO H1 should live elsewhere.

**Mixed approach (confirmed by user):**

- **Homepage** -- Add an optional `seoH1` field to the homepage schema in Sanity. Render it as a visible `<h1>` in the first content section below the hero (above DestinationGrid). Example: "Surf Camps in Bali, Costa Rica & Portugal". If not set in CMS, fall back to DestinationGrid's heading as H1.
- **Country pages** -- Add an optional `seoH1` field to the country schema in Sanity. Render it as a visible `<h1>` at the top of the first content section (the comparison/camps intro). Example: "Surf Camps in Bali". If not set, promote the comparison heading to H1.
- **Contact page** -- "Get in Touch" works fine as an H1 here. Add a `headingTag` prop to Hero so it can optionally render its title as `<h1>` instead of `<p>`. Pass `headingTag="h1"` from the contact page.
- **Hero toggle** -- Add a `useHeroAsH1` boolean toggle to the Hero-related CMS fields (homepage, country). When enabled, the hero title renders as `<h1>` instead of `<p>`, and the separate `seoH1` field is ignored. This gives flexibility for pages where the hero text IS the right H1.

**Files to change:**

- [sanity/schemas/homepage.ts](sanity/schemas/homepage.ts) -- add `seoH1` field and `useHeroAsH1` toggle
- [sanity/schemas/country.ts](sanity/schemas/country.ts) -- add `seoH1` field and `useHeroAsH1` toggle
- [src/lib/queries.ts](src/lib/queries.ts) -- include `seoH1` and `useHeroAsH1` in GROQ projections
- [src/components/sections/Hero.astro](src/components/sections/Hero.astro) -- add optional `headingTag` prop; when `"h1"`, render title as `<h1>` instead of `<p>`
- [src/pages/index.astro](src/pages/index.astro) -- if `useHeroAsH1`, pass `headingTag="h1"` to Hero; otherwise render `seoH1` as visible `<h1>` above DestinationGrid
- [src/pages/surfcamp/[country].astro](src/pages/surfcamp/[country].astro) -- same logic: `useHeroAsH1` toggles Hero H1, otherwise `seoH1` or promoted comparison heading
- [src/pages/contact.astro](src/pages/contact.astro) -- pass `headingTag="h1"` to Hero (hardcoded, no CMS toggle needed)

### 2. Multiple H1s possible on camp sub-pages

- [src/components/blocks/SurfIntroBlock.astro](src/components/blocks/SurfIntroBlock.astro) line 23 -- hardcoded `<h1>`
- [src/components/blocks/SurfConditionsBlock.astro](src/components/blocks/SurfConditionsBlock.astro) line 23 -- hardcoded `<h1>`
- [src/components/blocks/FoodIntroBlock.astro](src/components/blocks/FoodIntroBlock.astro) line 18 -- hardcoded `<h1>`

If multiple blocks appear on the same page, there are multiple H1s.

**Fix:** Change these to `<h2>` by default. Use BlockRenderer's existing `isH1` logic (first block gets H1) to pass the heading level down.

---

## High Priority

### 3. Sanity `seo.noindex` field is ignored

The [sanity/schemas/objects/seo.ts](sanity/schemas/objects/seo.ts) schema defines a `noindex` boolean, but no page template passes it to `BaseLayout`.

**Fix:** Pass `noindex={data?.seo?.noindex}` from camp pages (via CampLayout), blog posts, country pages, and generic pages to `BaseLayout`.

### 4. Canonical URL not normalized for trailing slashes

[src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) line 51 uses `Astro.url.pathname` directly. `/surfcamp/bali/` and `/surfcamp/bali` produce different canonicals.

**Fix:** Normalize: `const normalizedPath = pathname.replace(/\/+$/, "") || "/";` before building `canonicalUrl`.

### 5. DE blog posts missing `seo.ogImageUrl`

[src/pages/de/blog/[slug].astro](src/pages/de/blog/[slug].astro) line 38 passes `ogImage={post.featuredImageUrl}` without checking `post.seo?.ogImageUrl` first (unlike the EN version we already fixed).

**Fix:** Change to `ogImage={post.seo?.ogImageUrl || post.featuredImageUrl}`.

### 6. Thank-you pages still in sitemap

`/thank-you` and `/survey-thank-you` have noindex but are not excluded from sitemap in [astro.config.mjs](astro.config.mjs).

**Fix:** Add them to the sitemap filter.

---

## Medium Priority

### 7. Missing structured data on camp pages

Camp overview pages have no JSON-LD schema. They would benefit from `LodgingBusiness` schema with name, description, location, images, and aggregate rating.

**Fix:** Add JSON-LD to [src/pages/surfcamp/[country]/[camp]/index.astro](src/pages/surfcamp/[country]/[camp]/index.astro) using `slot="head"`.

### 8. `/jobs` page is orphaned

Only linked from `/linkin-bio` (which is noindex). Not in header or footer navigation -- invisible to crawlers.

**Fix:** Add a `/jobs` link to [src/components/layout/Footer.astro](src/components/layout/Footer.astro).

### 9. Images missing width/height attributes (CLS)

Most `<img>` tags lack explicit `width` and `height`. While `aspect-`* containers help, explicit dimensions improve CLS scores.

**Fix:** Add width/height to above-the-fold images (blog hero, camp hero poster, BlogPostCard).

### 10. More images still missing srcset/sizes

Secondary components not yet updated: `PortableImage`, `VideoTestimonialsBlock`, `ImageGalleryBlock`, `FeatureBlock`, `BlogPostCard`, `Header` (camp thumbnails), blog hero images, FAQ index images, country page camp cards.

**Fix:** Apply `responsiveSrc()` from [src/lib/image-utils.ts](src/lib/image-utils.ts) to these components.

### 11. Airtable script render-blocking on jobs page

[src/pages/jobs.astro](src/pages/jobs.astro) line 90 loads the Airtable embed script without `defer` or `async`.

**Fix:** Add `defer` attribute to the script tag.

---

## Low Priority / Content Recommendations

### 12. Blog author is always "Organization"

BlogPosting schema uses Organization as author. Individual author names/bios would strengthen E-E-A-T signals.

**Fix:** Add author fields to blog posts in Sanity schema.

### 13. Keyword cannibalization risk

Camp overview and sub-pages share similar fallback titles/descriptions when CMS meta is not set.

**Fix:** Set unique, keyword-specific meta titles and descriptions per page type in Sanity CMS.

### 14. Content gap opportunities

No pages exist for high-value search intents:

- "Best surf camps in [country]" / "Surf camps for beginners"
- Seasonal guides ("Best time to surf in Bali")
- Competitor comparison pages
- Location-specific landing pages ("Surf camps near Ericeira")

**Fix:** Use content-strategy and programmatic-seo skills to plan these.

### 15. Linkin-bio duplicates Inter via Google Fonts

[src/pages/linkin-bio.astro](src/pages/linkin-bio.astro) line 57 imports Inter from Google Fonts, duplicating the self-hosted version.

**Fix:** Remove the Google Fonts import.