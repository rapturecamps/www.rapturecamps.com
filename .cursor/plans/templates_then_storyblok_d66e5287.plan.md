---
name: Templates Then Storyblok
overview: Finalize camp page template with 4 sub-pages and sticky subnav, polish country page template, apply to all locations, then migrate to Storyblok CMS.
todos:
  - id: phase1-camp-template
    content: "Phase 1: Build camp sub-pages (The Surfcamp, Surf, Rooms, Food) with CampSubnav and CampLayout components — use Green Bowl as reference"
    status: pending
  - id: phase2-country-template
    content: "Phase 2: Finalize country page template — review Bali, update camp card links to new sub-page URLs"
    status: pending
  - id: phase3-apply-all
    content: "Phase 3: Apply templates to all 9 camps and 5 countries with content"
    status: pending
  - id: phase4-storyblok
    content: "Phase 4: Storyblok setup — enable integration, push final schemas, create folder structure"
    status: pending
  - id: phase5-wire-cms
    content: "Phase 5: Wire pages to Storyblok with fallback pattern"
    status: pending
isProject: false
---

# Finalize Templates, Then Migrate to Storyblok

## Revised Strategy

Finalize all page templates first so the CMS schemas map 1:1 to the final components. No rework, no schema changes mid-migration.

**Order:** Templates first -> Apply everywhere -> Then CMS

---

## Phase 1: Camp Page Template (biggest change)

Each camp currently lives at a single URL (e.g. `/surfcamp/bali/green-bowl`) with mostly placeholder content. This expands into **4 sub-pages** with a shared sticky navigation.

### URL Structure

- `/surfcamp/bali/green-bowl` — The Surfcamp (overview/home)
- `/surfcamp/bali/green-bowl/surf` — Surf spots, conditions, lessons
- `/surfcamp/bali/green-bowl/rooms` — Accommodation options
- `/surfcamp/bali/green-bowl/food` — Meals, dining, dietary info

### New Components

**`CampSubnav.astro`** — Sticky secondary nav bar below the main header
- Camp name on the left, 4 tab links on the right: The Surfcamp | Surf | Rooms | Food
- Active tab highlighted based on current URL
- Book button on the far right (uses context-aware `bookingUrl`)
- Mobile: horizontal scrollable tabs
- Sticks below the blue header bar on scroll (similar approach to header — CSS + data attribute)

**`CampLayout.astro`** — Shared wrapper for all 4 sub-pages
- Wraps `BaseLayout`, adds `CampSubnav` plus shared Hero
- Passes shared camp data (name, country, bookingUrl, heroImages) so sub-pages only define their own content

### Sub-Page Content

- **The Surfcamp** (overview): camp intro, inclusions grid, image grid, reviews, CTA
- **Surf**: surf spots, levels, lesson info as content blocks, image break, CTA
- **Rooms**: room types as content blocks (shared/private/premium), amenities, image grid, CTA
- **Food**: dining concept, meal highlights, dietary info, image grid, CTA

### File Changes

Current `src/pages/surfcamp/[country]/[camp].astro` moves to:

- `src/pages/surfcamp/[country]/[camp]/index.astro` — The Surfcamp
- `src/pages/surfcamp/[country]/[camp]/surf.astro` — Surf
- `src/pages/surfcamp/[country]/[camp]/rooms.astro` — Rooms
- `src/pages/surfcamp/[country]/[camp]/food.astro` — Food

New components:

- `src/components/layout/CampSubnav.astro`
- `src/components/layout/CampLayout.astro`

### Data Structure (per camp)

Organized similar to how `countryContent` works in [src/pages/surfcamp/[country].astro](src/pages/surfcamp/[country].astro):

- `shared`: heroImages, bookingUrl, campName, country, rating, amenities
- `overview`: intro, inclusions, imageGrid, reviews
- `surf`: spots, levels, schedule, contentBlocks
- `rooms`: types, amenities, imageGrid
- `food`: concept, highlights, dietary, imageGrid

Maps directly to Storyblok fields later.

---

## Phase 2: Finalize Country Page Template

Bali is the reference — already has rotating hero, camp cards with ratings/amenities, image grid, content blocks, image break, reviews, CTA. Mostly done.

Remaining: review flow/spacing, update camp card links to new sub-page URLs, any design polish.

---

## Phase 3: Apply to All Locations

Build out one camp fully (Green Bowl as reference), then:

- Populate content for all 9 camps across all 4 sub-pages
- Verify country pages link correctly to new camp URLs
- Test all routes

---

## Phase 4: Storyblok Setup

With templates finalized, schemas match exactly:

- Add preview token to `.env`, enable integration in `astro.config.mjs`
- Switch to `output: "hybrid"` for visual editor
- Update `storyblok/components.json` with all final schemas (add image_grid, image_break, content_block, reviews_section, camp sub-page tabs)
- Push schemas, create folder structure

---

## Phase 5: Wire Pages to Storyblok

Migrate using fallback pattern (fetch CMS, render hardcoded if missing):

- Camp pages first (9 camps x 4 sub-pages)
- Country pages (5 countries)
- Blog, then remaining pages
