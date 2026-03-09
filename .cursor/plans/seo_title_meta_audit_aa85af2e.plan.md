---
name: SEO Title Meta Audit
overview: Comprehensive audit of all SEO page titles and meta descriptions across the live WordPress site and the new Astro codebase, with actionable optimization recommendations for the new version.
todos:
  - id: country-seo
    content: Add explicit SEO title and description to each country in the `countryContent` object in `src/pages/surfcamp/[country].astro`, and pass them as props to BaseLayout
    status: pending
  - id: camp-seo
    content: Add unique SEO title/description fields to Sanity camp schema and use them in `CampLayout.astro` instead of the generic template
    status: pending
  - id: blog-index-seo
    content: Add explicit meta description to the blog index page in `src/pages/blog/[...page].astro`
    status: pending
  - id: homepage-title
    content: Optimize homepage title to be keyword-forward (e.g., `Best Surf Camps Worldwide | Rapture Surfcamps`)
    status: pending
  - id: about-title
    content: Expand About page title and description to use full SERP character allowance
    status: pending
  - id: contact-title
    content: Expand Contact page title with channel keywords (WhatsApp, Email, Chat)
    status: pending
  - id: faq-title
    content: Add 'Surf Camp' keyword to FAQ page title
    status: pending
  - id: noindex-utility
    content: Verify all utility pages (thank-you, survey-thank-you, linkin-bio, legal) have `noindex` where appropriate
    status: pending
  - id: sanity-seo-fields
    content: Add SEO fields (metaTitle, metaDescription) to Sanity schemas for countries and camps so editors can customize without code
    status: pending
  - id: de-pages-audit
    content: Audit German (/de/) pages to ensure they have unique German-language titles and descriptions, not English defaults
    status: pending
isProject: false
---

# SEO Page Titles and Meta Descriptions Audit

## Current State: Live Site (WordPress) vs. New Site (Astro)

Your site currently runs on WordPress (with Yoast SEO) and you're rebuilding it in Astro with Sanity CMS. Below is a page-by-page audit of titles and descriptions from both versions, followed by issues and recommendations.

---

## Page-by-Page Title and Description Inventory

### Homepage (`/`)


|                 | Title                                                            | Description                                                                                                                                               |
| --------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live (WP)**   | Rapture Surfcamps - Learn to surf, surf the world, stay with us! | A network of surf camps in Bali, Costa Rica, Nicaragua, Portugal offering unforgettable surf vacations. Learn to surf, surf the world, stay with Rapture! |
| **New (Astro)** | Rapture Surfcamps - Learn to Surf, Surf the World, Stay with Us! | A network of 8 unique surf camps in 5 countries on 4 continents. Surf the world with Rapture in Bali, Costa Rica, Portugal, Morocco, and Nicaragua.       |


- **Issue**: Title is 61 chars (slightly over the 50-60 char ideal). No primary keyword like "surf camp" at the beginning.
- **Issue**: Neither version includes Morocco in the title. The Astro description is improved (includes Morocco and specific numbers).
- **Recommendation**: Consider a title like `Best Surf Camps Worldwide | Rapture Surfcamps` (45 chars) -- keyword-forward, concise.

---

### About (`/about/`)


|                 | Title                                             | Description                                                                                                                                            |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Live (WP)**   | About Us - How It All Started - Rapture Surfcamps | To live the surfing life and surf great waves for the rest of their lives is the dream of all surfers. We created Rapture to spread our love for surf. |
| **New (Astro)** | About Us                                          | Rapture Surfcamps                                                                                                                                      |


- **Issue (Live)**: Title is 52 chars -- OK length. Description (155 chars) is narrative but lacks clear value prop.
- **Issue (New)**: Title is only 29 chars -- wastes SERP real estate. Description is 101 chars -- too short, leaves ~50 chars unused.
- **Recommendation**: New title: `About Rapture Surfcamps | 20+ Years of Surf Adventures` (54 chars). New description: `Founded in 2003, Rapture Surfcamps is a global network of 8 surf camps across Bali, Costa Rica, Portugal, Morocco, and Nicaragua. Discover our story.` (152 chars).

---

### Blog (`/blog/`)


|                 | Title                                                     | Description                                                                                                                                                |
| --------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live (WP)**   | Waves for Days - Surf Destinations & Tips By Rapturecamps | From tips for surfers to the ultimate surf break guides, we have it all - global surfing news, and also destination guides! Top Surf Blog for all surfers! |
| **New (Astro)** | Blog - Waves for Days                                     | Rapture Surfcamps                                                                                                                                          |


- **Issue (New)**: No custom meta description for the blog index page. It will fall back to the site-wide default about "8 unique surf camps" which is wrong for a blog page.
- **Recommendation**: Add explicit description, e.g. `Surf tips, destination guides, and travel inspiration from Rapture Surfcamps. Everything you need for your next surf trip.` (136 chars).

---

### Contact (`/contact/`)


|                 | Title                                                   | Description                                                                                                                                       |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live (WP)**   | Contact us via Chat, Email or Phone - Rapture Surfcamps | Contact Rapture Surfcamps via your preferred channel and find directions to our camps. Send us a message and we'll try to answer within 8-12 hrs. |
| **New (Astro)** | Contact Us                                              | Rapture Surfcamps                                                                                                                                 |


- **Issue (New)**: Title is 31 chars -- too short. The live version's title is more descriptive.
- **Recommendation**: New title: `Contact Us via WhatsApp, Email or Chat | Rapture Surfcamps` (57 chars). Description is fine at 121 chars but could add a CTA: `...or our contact form. We typically respond within hours.`

---

### Surfcamp Overview (`/surfcamp/`)


|                 | Title                              | Description       |
| --------------- | ---------------------------------- | ----------------- |
| **Live (WP)**   | *(no dedicated page on live site)* | N/A               |
| **New (Astro)** | Surf Camps Worldwide               | Rapture Surfcamps |


- **Good**: This is a new page. Title is concise (42 chars), keyword-forward. Description is clear but a bit short (115 chars).
- **Recommendation**: Extend description: `Choose your surf camp destination from 8 camps across 5 countries. Rapture Surfcamps operates in Bali, Costa Rica, Portugal, Morocco, and Nicaragua since 2003.` (159 chars).

---

### Country Pages (pattern: `/surfcamp/[country]/`)

**Bali:**


|                 | Title                                      | Description       |
| --------------- | ------------------------------------------ | ----------------- |
| **Live (WP)**   | Surf Camp Bali -- 20 Years of Surf Lessons | Rapturecamps      |
| **New (Astro)** | Surf Camps in Bali                         | Rapture Surfcamps |


- **Issue**: Live Bali title is excellent -- uses social proof ("20 Years", "8,000+ happy guests"). New version loses all of this.
- **Issue**: New version likely falls back to the BaseLayout default description since no `description` prop is explicitly passed.

**Portugal:**


|                 | Title                                                               | Description                                                                                                                            |
| --------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Live (WP)**   | Book Best Surf Camps in Portugal in February 2026 @ Rapturecamp.com | Learn surfing with best surf camps and certified teachers in Portugal. Book surf camps online in Portugal in 2026 with Rapturecamp.com |
| **New (Astro)** | *(same pattern as Bali -- generated from country data)*             | *(same issue)*                                                                                                                         |


- **Issue (Live)**: Dynamic month/year in title is a good SEO tactic but uses "Rapturecamp.com" (wrong branding -- missing the 's'). Title is 68 chars (truncated in SERP).
- **Issue (Live)**: Description repeats "Portugal" 3 times and "surf camps" twice -- keyword stuffing.

**Nicaragua:**


|               | Title                                                                | Description                                                                                                                              |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Live (WP)** | Book Best Surf Camps in Nicaragua in February 2026 @ Rapturecamp.com | Learn surfing with best surf camps and certified teachers in Nicaragua. Book surf camps online in Nicaragua in 2026 with Rapturecamp.com |


- Same issues as Portugal -- wrong branding, keyword-stuffed description.

**Morocco:**


|               | Title                                                              | Description                                                                                                                          |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Live (WP)** | Book Best Surf Camps in Morocco in February 2026 @ Rapturecamp.com | Learn surfing with best surf camps and certified teachers in Morocco. Book surf camps online in Morocco in 2026 with Rapturecamp.com |


- Same template as above -- identical issues.

**Costa Rica:**


|               | Title                                                                 | Description                                                                                                                                |
| ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Live (WP)** | Book Best Surf Camps in Costa Rica in February 2026 @ Rapturecamp.com | Learn surfing with best surf camps and certified teachers in Costa Rica. Book surf camps online in Costa Rica in 2026 with Rapturecamp.com |


- Same template -- identical issues.

---

### Individual Camp Pages (pattern: `/surfcamp/[country]/[camp]/`)


|                 | Title                        | Description       |
| --------------- | ---------------------------- | ----------------- |
| **New (Astro)** | Rapture Surf Camp {campName} | Rapture Surfcamps |


- **Issue**: Generic template title/description used for ALL camps. Loses unique selling points per location.
- **Issue**: "Rapture" appears twice in the title template.
- **Recommendation**: Each camp should have a unique, keyword-rich title and description sourced from Sanity CMS (just like blog posts use `seo.metaTitle` and `seo.metaDescription`).

---

### FAQ (`/faq/`)


|                 | Title | Description       |
| --------------- | ----- | ----------------- |
| **New (Astro)** | FAQ   | Rapture Surfcamps |


- **Good**: Functional. Title is short (25 chars) but acceptable for FAQ.
- **Recommendation**: Could be `Surf Camp FAQ | Rapture Surfcamps` to include keyword.

---

### Jobs (`/jobs/`)


|                 | Title | Description                      |
| --------------- | ----- | -------------------------------- |
| **New (Astro)** | Jobs  | Work With Us - Rapture Surfcamps |


- **Good**: Title and description are reasonable. 40 chars title, 136 chars description.

---

### Legal / Utility Pages

- **Privacy Policy**, **Terms**, **Legal**: All use the BaseLayout default fallback. They should have `noindex` set and unique titles.
- **Thank You** pages: Should have `noindex` set.

---

## Summary of Key Issues

### Critical Issues (High Impact)

1. **Country pages have no explicit meta descriptions in the new Astro site** -- they fall back to the generic site description. This is the most impactful problem since country pages are your highest-value SEO landing pages. See `[src/pages/surfcamp/[country].astro](src/pages/surfcamp/[country].astro)`.
2. **Individual camp pages use a generic template** for title/description with no unique content per camp. See `[src/components/layout/CampLayout.astro](src/components/layout/CampLayout.astro)` line 46-47.
3. **Blog index has no custom meta description** -- falls back to site default. See `[src/pages/blog/[...page].astro](src/pages/blog/[...page].astro)`.

### Medium Issues

1. **Homepage title is keyword-weak** -- starts with brand name instead of primary keyword ("surf camp").
2. **About page title wastes SERP space** -- only 29 chars used out of 60.
3. **Live site has branding typo** in country page titles ("Rapturecamp.com" instead of "Rapturecamps").
4. **Live site country page descriptions are keyword-stuffed** -- repeat country name 3x and "surf camps" 2x.
5. **Missing hreflang for German pages** in the new Astro site needs verification for all page types (currently set up in BaseLayout).

### Quick Wins

1. Add unique `title` and `description` props to every page component that currently relies on BaseLayout defaults.
2. Add SEO fields (metaTitle, metaDescription) to Sanity schemas for country and camp content types so content editors can optimize them without code changes.
3. Ensure all utility pages (thank-you, survey-thank-you, linkin-bio) have `noindex` set.

---

## Recommended Title/Description Structure for New Site

- **Homepage**: `Best Surf Camps in Bali, Portugal, Costa Rica & More | Rapture` -- 60 chars
- **Country pages**: `Surf Camp {Country} - {USP snippet} | Rapture Surfcamps` -- unique per country
- **Camp pages**: `{Camp Name} Surf Camp, {Country} | Rapture Surfcamps` -- unique per camp, with Sanity CMS override
- **Blog**: `Surf Blog - Tips, Guides & Destinations | Rapture Surfcamps`
- **Blog posts**: Pull from Sanity `seo.metaTitle` / `seo.metaDescription` (already working)
- **About**: `About Rapture Surfcamps | 20+ Years of Surf Adventures`

---

## Implementation Plan

To fix these issues in the new Astro codebase: