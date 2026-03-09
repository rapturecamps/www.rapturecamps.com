---
name: Storyblok CMS Migration
overview: First finalize country and camp page templates (including new camp sub-pages with sticky nav), apply to all locations, then migrate to Storyblok CMS.
todos:
  - id: phase1-camp-template
    content: "Phase 1: Build camp page template with 4 sub-pages (The Surfcamp, Surf, Rooms, Food) and sticky subnav component"
    status: pending
  - id: phase2-country-template
    content: "Phase 2: Finalize country page template - review Bali as reference, polish until ready"
    status: pending
  - id: phase3-apply-all
    content: "Phase 3: Apply both templates to all 9 camps and 5 countries with real placeholder content"
    status: pending
  - id: phase4-storyblok-setup
    content: "Phase 4: Storyblok setup - enable integration, update schemas to match final components, push to CMS"
    status: pending
  - id: phase5-storyblok-content
    content: "Phase 5: Wire pages to Storyblok - camp pages first, then country pages, blog, and remaining"
    status: pending
isProject: false
---

# Finalize Templates, Then Migrate to Storyblok

## Revised Strategy

Instead of migrating to Storyblok immediately, finalize all page templates first so the CMS schemas map 1:1 to the final components. No rework, no schema changes mid-migration.

Order: Templates first, apply everywhere, then CMS.

## Phase 1: Camp Page Template

Each camp currently lives at a single URL like /surfcamp/bali/green-bowl with mostly placeholder content. This will expand into 4 sub-pages with a shared sticky navigation.

### URL Structure

- /surfcamp/bali/green-bowl - The Surfcamp (overview/home)
- /surfcamp/bali/green-bowl/surf - Surf spots, conditions, lessons
- /surfcamp/bali/green-bowl/rooms - Accommodation options
- /surfcamp/bali/green-bowl/food - Meals, dining, dietary info

### New Components

**CampSubnav.astro** - Sticky secondary navigation bar that sits below the main header. Shows camp name on the left, 4 tab links on the right (The Surfcamp, Surf, Rooms, Food), active tab highlighted. Book button on the far right using the context-aware bookingUrl. On mobile: horizontal scrollable tabs.

**CampLayout.astro** - Shared wrapper for all 4 sub-pages. Wraps BaseLayout and adds the CampSubnav plus shared hero. Avoids duplicating the subnav in each sub-page file.

### Sub-Page Content

**The Surfcamp** (overview): Hero with rotating images, camp intro, inclusions grid, image grid, reviews, CTA.

**Surf**: Surf spots description, surf levels, lesson schedule, content blocks with images, image break, CTA.

**Rooms**: Room types as content blocks (shared, private, premium), amenities, image grid, CTA.

**Food**: Dining concept, meal highlights, dietary info, image grid, CTA.

### File Structure

Current file `src/pages/surfcamp/[country]/[camp].astro` moves to:

- `src/pages/surfcamp/[country]/[camp]/index.astro` - The Surfcamp
- `src/pages/surfcamp/[country]/[camp]/surf.astro` - Surf
- `src/pages/surfcamp/[country]/[camp]/rooms.astro` - Rooms
- `src/pages/surfcamp/[country]/[camp]/food.astro` - Food

New layout components:

- `src/components/layout/CampSubnav.astro`
- `src/components/layout/CampLayout.astro`

### Data Shape (per camp)

Content will live in a data structure like countryContent does for country pages:

- shared: heroImages, bookingUrl, campName, country
- overview: intro, inclusions, imageGrid, reviews
- surf: spots, levels, schedule, contentBlocks
- rooms: types, amenities, imageGrid
- food: concept, highlights, dietary, imageGrid

This maps directly to Storyblok later.

## Phase 2: Finalize Country Page Template

Bali is the current reference. Already has: hero with rotating images, camp cards with ratings/amenities, image grid, content blocks, image break, reviews, CTA.

Remaining work: review flow and spacing, ensure camp cards link to new sub-page URLs, any design tweaks.

## Phase 3: Apply to All Locations

Once the camp template is finalized on one camp (e.g. Green Bowl):

- Populate content data for all 9 camps across 4 sub-pages
- Ensure country pages reference correct URLs
- Test all routes

## Phase 4: Storyblok Setup

With templates finalized, schemas match exactly:

- Add preview token to .env, enable integration in astro.config.mjs
- Switch to output: hybrid for visual editor support
- Update storyblok/components.json with all final schemas
- Add missing bloks: image_grid, image_break, content_block, reviews_section, camp_subnav tabs
- Update hero_section with background_images, background_video, rotation_interval
- Update camp_page to include sub-page sections
- Push schemas, create folder structure

## Phase 5: Wire Pages to Storyblok

Migrate in this order using the fallback pattern (fetch from CMS, render hardcoded if story missing):

- Camp pages (9 camps x 4 sub-pages, highest impact)
- Country pages (5 countries, move inline countryContent to CMS)
- Blog (posts, categories)
- Remaining (homepage, about, contact, FAQ, global settings)
