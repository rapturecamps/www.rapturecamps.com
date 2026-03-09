---
name: SEO Audit Findings
overview: Structured SEO audit of rapturecamps.com with prioritized findings across technical SEO, on-page optimization, structured data, and performance — with specific file references and fixes for each issue.
todos:
  - id: sitemap
    content: Delete static sitemaps, update sitemap filter in astro.config.mjs
    status: completed
  - id: h1-hero
    content: Change Hero.astro to render H1 instead of p[role=heading]
    status: pending
  - id: faq-schema-slot
    content: Add slot name=head in BaseLayout.astro head section
    status: completed
  - id: blog-schema
    content: Add BlogPosting JSON-LD to blog post pages
    status: completed
  - id: og-image-camp
    content: Pass heroImages[0] as ogImage in CampLayout
    status: completed
  - id: responsive-images
    content: Add responsiveSrc/srcset to SurfSpotsBlock, MealCardsBlock, ContentBlock
    status: pending
  - id: noindex-404
    content: Add noindex to 404 page
    status: pending
  - id: minor-fixes
    content: Hreflang blog translations, hero auto=format, font-display, alt text fallbacks, meta consistency
    status: pending
isProject: false
---

# SEO Audit: Rapture Surfcamps

## Current Status

The site has a solid SEO foundation: canonical URLs, Open Graph tags, hreflang for EN/DE, breadcrumb schema, and clean URL structure. However, there are several high-impact issues that should be addressed to improve crawlability, indexation, and ranking potential.

---

## HIGH Priority Issues

### 1. Static sitemap overrides auto-generated one

**Impact: HIGH** -- Crawlers see outdated/incomplete URLs

The files `public/sitemap.xml` and `public/sitemap-0.xml` are static and override the sitemap that Astro's `@astrojs/sitemap` would generate at build time.

**Problems:**
- Still lists `/surfcamp/morocco` and `/surfcamp/nicaragua` (removed locations, now 410)
- Only 13 URLs total -- missing all camp sub-pages (`/surf`, `/rooms`, `/food`), FAQ pages, blog posts, and all `/de/` pages
- Crawlers waste budget on dead URLs and can't discover most of the site

**Fix:** Delete both static files. Add `/404` to the sitemap filter in [astro.config.mjs](astro.config.mjs). Astro will generate a complete sitemap from all built routes.

---

### 2. No H1 heading on most pages

**Impact: HIGH** -- Core ranking signal missing

The Hero component in [src/components/sections/Hero.astro](src/components/sections/Hero.astro) renders the main title as `<p role="heading" aria-level="2">` instead of `<h1>`.

**Pages without an H1:**
- Homepage
- Surfcamp index (`/surfcamp`)
- Country pages (`/surfcamp/bali`, etc.)
- About page
- Contact page
- Blog index
- Camp pages (when CMS `introHeadingLevel` is not set to `h1`)

**Pages that DO have H1:** Jobs, FAQ pages, blog posts, camp pages with explicit H1 set in CMS.

**Fix:** Change Hero.astro to render an `<h1>` element for the title. Every page should have exactly one H1.

---

### 3. FAQ schema not injecting into page head

**Impact: HIGH** -- Structured data is generated but never rendered

Country pages ([src/pages/surfcamp/\[country\].astro](src/pages/surfcamp/[country].astro)) generate FAQPage JSON-LD using `slot="head"`, but [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro) has no `<slot name="head" />` inside its `<head>` tag.

**Result:** The FAQ schema markup is silently dropped. Google never sees it.

**Fix:** Add `<slot name="head" />` inside BaseLayout's `<head>` section.

---

## MEDIUM Priority Issues

### 4. No Article schema on blog posts

**Impact: MEDIUM** -- Missing rich results for blog content

[src/pages/blog/\[slug\].astro](src/pages/blog/[slug].astro) has no JSON-LD structured data.

**Fix:** Add `BlogPosting` schema with headline, datePublished, author, image, and description.

---

### 5. Camp pages use generic OG image for social sharing

**Impact: MEDIUM** -- Social shares show default image instead of camp hero

[src/components/layout/CampLayout.astro](src/components/layout/CampLayout.astro) does not pass `heroImages[0]` as the `ogImage` prop to BaseLayout.

**Fix:** Pass `ogImage={heroImages?.[0]}` so social shares show the camp's actual hero image.

---

### 6. Several image components missing responsive srcset

**Impact: MEDIUM** -- Larger-than-needed images served to mobile users

Components that already use `responsiveSrc()` correctly: RoomTypesBlock, ImageGrid, ImageBreak.

Components that need it added:
- [src/components/blocks/SurfSpotsBlock.astro](src/components/blocks/SurfSpotsBlock.astro)
- [src/components/blocks/MealCardsBlock.astro](src/components/blocks/MealCardsBlock.astro)
- [src/components/sections/ContentBlock.astro](src/components/sections/ContentBlock.astro)

**Fix:** Import `responsiveSrc` from `@/lib/image-utils` and add `srcset`/`sizes` attributes.

---

### 7. 404 page is indexable

**Impact: MEDIUM** -- Search engines could index the error page

[src/pages/404.astro](src/pages/404.astro) does not pass `noindex={true}` to BaseLayout.

**Fix:** Add the noindex prop.

---

### 8. Hreflang may be incorrect for translated blog posts

**Impact: MEDIUM** -- Wrong alternate URLs for language switchers

Blog posts with different slugs per language need `translations` data passed to BaseLayout for correct hreflang URLs.

**Fix:** Ensure blog post pages pass translation data when available.

---

## LOW Priority Issues

### 9. Hero background images missing auto=format

Hero slideshow images use raw URLs without `&auto=format` for WebP optimization. Add the parameter to Sanity/Unsplash hero URLs.

### 10. Font display not set for Inter

Could cause invisible text flash (FOIT). Add `font-display: swap` to the `@font-face` declaration.

### 11. Minor meta tag inconsistencies

- Homepage SEO fields from Sanity have no hardcoded fallbacks
- About page uses `seo?.title` instead of `seo?.metaTitle` (inconsistent with other pages)
- Blog index meta description is generic

### 12. ImageGalleryBlock can render empty alt text

Falls back to `""` when no alt is set in Sanity. Should use a descriptive fallback.

---

## What's Already Working Well

- Canonical URLs on all pages
- Open Graph and Twitter Card meta tags
- Hreflang tags for EN/DE with x-default
- BreadcrumbList schema (JSON-LD)
- Organization schema on homepage
- Font preloading with `fetchpriority="high"` for hero images
- Clean URL structure (lowercase, hyphenated slugs)
- 410 Gone redirects via Sanity middleware for removed pages
- Inline scripts (minimal render-blocking JS)
- Image lazy loading on non-critical images

---

## Recommended Fix Order

- **Phase 1 (Quick wins, high impact):** Issues 1, 2, 3
- **Phase 2 (Medium effort, medium impact):** Issues 4, 5, 6, 7
- **Phase 3 (Polish):** Issues 8, 9, 10, 11, 12
