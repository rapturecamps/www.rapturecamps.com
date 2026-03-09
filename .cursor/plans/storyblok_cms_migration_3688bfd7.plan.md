---
name: Storyblok CMS Migration
overview: Migrate the Rapture Surfcamps site from hardcoded data to Storyblok CMS, starting with foundation setup and camp pages (highest impact), then expanding to country pages, blog, and remaining pages.
todos:
  - id: phase1-setup
    content: "Phase 1: Foundation — enable Storyblok integration, update schemas, push to Storyblok, create folder structure"
    status: pending
  - id: phase2-camps
    content: "Phase 2: Camp pages — create bridge component, update page to fetch from CMS with fallback, populate 9 camp stories"
    status: pending
  - id: phase3-countries
    content: "Phase 3: Country pages — create bridge component, move countryContent to CMS, populate 5 country stories"
    status: pending
  - id: phase4-blog
    content: "Phase 4: Blog — set up blog content type, create posts, wire up listing and detail pages"
    status: pending
  - id: phase5-remaining
    content: "Phase 5: Remaining pages — homepage, about, contact, FAQ, global settings"
    status: pending
isProject: false
---

# Storyblok CMS Migration Plan

## Current State

A lot of groundwork already exists:
- `@storyblok/astro@^7.3.9` and `storyblok-js-client@^7.2.3` installed
- Component schemas defined in `storyblok/components.json` (16 components)
- Client library at `src/lib/storyblok.ts` with `fetchStory()` and `fetchStories()`
- Astro config has Storyblok integration commented out, ready to enable
- `.env` has empty token placeholders
- Image domain `a.storyblok.com` already allowed

## What Needs Updating

The existing schema in `storyblok/components.json` was written before the new components were built. These are **missing** from the schema and need to be added:
- `image_grid` (maps to `ImageGrid.astro` — collage/two-up/three-up variants)
- `image_break` (maps to `ImageBreak.astro` — full-width atmospheric image)
- `content_block` (maps to `ContentBlock.astro` — text + image section with reverse/background options)
- `reviews_section` (maps to `Reviews.astro` — testimonials with star ratings)
- `review_item` (nested blok for individual reviews)

The `hero_section` schema needs updating for:
- `background_images` (multi-asset for rotating images)
- `background_video` (asset for video background)
- `rotation_interval` (number field)

The `camp_page` schema needs new fields:
- `rating`, `review_count`, `amenities`, `tagline` (matching the Destination type)
- `hero_images` (multi-asset for rotating hero)

## Architecture Decision: Static vs Server

Currently `output: "static"`. For Storyblok's **visual editor** to work, preview pages need to be server-rendered. The recommended approach:

- Switch to `output: "hybrid"` — pages default to static (prerendered at build time)
- Preview/draft routes opt into SSR via `export const prerender = false`
- Production deploys still get full static performance via Vercel ISR
- This gives you the best of both: fast production pages + live visual editor in Storyblok

## Phased Approach

### Phase 1: Foundation (do first)

1. Add the Storyblok preview token to `.env`
2. Uncomment and configure the Storyblok integration in `astro.config.mjs`
3. Switch output to `"hybrid"` for visual editor support
4. Update `storyblok/components.json` with the missing component schemas
5. Push schemas to Storyblok using the CLI (`npx storyblok push-components`)
6. Create the folder structure in Storyblok: `surfcamp/`, `surfcamp/bali/`, `blog/`, `faq/`
7. Build a `StoryblokPage.astro` resolver component that maps Storyblok blok names to Astro components

### Phase 2: Camp Pages (highest impact)

Camp pages are the best starting point because:
- They already have placeholder content ("will be populated from Storyblok")
- 9 camps is a manageable amount to populate
- The `bookingUrl`, `amenities`, `rating` fields are already structured

Steps:
1. Create a Storyblok bridge component at `src/storyblok/CampPage.astro`
2. Update `src/pages/surfcamp/[country]/[camp].astro` to fetch from Storyblok, falling back to current hardcoded data if the story doesn't exist yet
3. Create the 9 camp stories in Storyblok with real content
4. The `destinations` array in `data.ts` stays for now (nav dropdown, destination grid) — Storyblok enriches it, doesn't replace it yet

### Phase 3: Country Pages

Move the large inline `countryContent` (currently ~250 lines in the page file) into Storyblok:
1. Create a Storyblok bridge at `src/storyblok/CountryPage.astro`
2. Update `src/pages/surfcamp/[country].astro` to fetch content, with hardcoded fallback
3. Create 5 country stories, each using: hero, image_grid, content_block, image_break, reviews_section bloks
4. Eventually remove the inline `countryContent` object

### Phase 4: Blog

1. Create blog post stories in Storyblok (or use the existing `scripts/migrate-wordpress.ts` if migrating from WP)
2. Update `src/pages/blog/index.astro` to fetch post listings
3. Update `src/pages/blog/[slug].astro` to render individual posts
4. Category pages follow the same pattern

### Phase 5: Remaining Pages

- Homepage — wire up the block-based body (Hero, DestinationGrid, AboutSection, BlogFeed, StatsSection, SocialGrid)
- About, Contact, FAQ — each already has a matching schema
- Global settings story for navigation, footer content, social links

## Component Mapping

Storyblok blok name -> Astro component:

- `hero_section` -> `Hero.astro`
- `content_block` / `text_section` -> `ContentBlock.astro`
- `image_grid` -> `ImageGrid.astro`
- `image_break` -> `ImageBreak.astro`
- `reviews_section` -> `Reviews.astro`
- `stats_section` -> `StatsSection.astro`
- `cta_section` -> `CTASection.astro`
- `destination_grid` -> `DestinationGrid.tsx`

## Key Files to Modify

- `astro.config.mjs` — enable integration, switch to hybrid
- `.env` — add real token
- `storyblok/components.json` — add missing schemas
- `src/lib/storyblok.ts` — may need enrichment for resolving relations
- `src/storyblok/` — new folder for bridge components (one per content type)
- `src/pages/surfcamp/[country]/[camp].astro` — fetch from CMS
- `src/pages/surfcamp/[country].astro` — fetch from CMS

## Rollout Strategy

Each phase uses a **fallback pattern**: if the Storyblok story exists, use it; otherwise, render the current hardcoded version. This means:
- No content is lost during migration
- Pages can be migrated one at a time
- The site works even if Storyblok is temporarily unavailable
