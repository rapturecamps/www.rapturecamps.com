---
name: Host Retreat Landing Page
overview: Add a `pageBuilder` to the `page` schema, create 2 new block types for unique sections, build an Astro template, and populate the Sanity document with all content from the existing retreat page.
todos:
  - id: page-schema
    content: Add pageBuilder, hero fields to page schema + register new block types
    status: in_progress
  - id: itinerary-block
    content: Create retreatItinerary block schema + Astro component
    status: pending
  - id: testimonials-block
    content: Create textTestimonials block schema + Astro component
    status: pending
  - id: block-renderer
    content: Register new blocks in BlockRenderer.astro
    status: pending
  - id: astro-page
    content: Create src/pages/host-a-retreat.astro with hero + BlockRenderer
    status: pending
  - id: sanity-content
    content: Populate Sanity document with all content from the retreat page
    status: pending
isProject: false
---

# Host a Retreat — Full Sanity CMS Landing Page

## Current State

- The `page` schema ([sanity/schemas/page.ts](sanity/schemas/page.ts)) only has `title`, `slug`, `body` (Portable Text), and `seo` — suitable for simple text pages (privacy policy, terms, about)
- The `camp` schema has a `pageBuilder` array with 23 block types and a `BlockRenderer` that maps them to Astro components
- No `pageBuilder` exists on the `page` schema

## What the Retreat Page Needs

The page at https://www.rapturecamps.com/host-a-retreat/ has these sections:

1. **Hero** — tagline, title, subtitle, 2 CTA buttons
2. **Feature cards** ("Why Rapture Camps") — 4 cards with icons, titles, descriptions
3. **What's Included** — 4 cards with icons
4. **Location section** — heading, description, amenity tags, image
5. **8-day itinerary timeline** — each day has a name, theme, and list of timed activities with category tags
6. **Stats bar** — 4 stats (years, guests, locations, awards)
7. **Text testimonials** — 3 quotes with author name, initials, and role
8. **Contact/CTA section** — heading, text, link to contact form

## Mapping to Existing vs New Blocks

**Reuse existing blocks:**
- `cardGrid` — for "Why Rapture Camps" (4 feature cards) and "What's Included" (4 cards)
- `featureBlock` — for the Location section (image + text + amenity-style content)
- `ctaSection` — for the contact CTA at the bottom
- `richText` — for any additional text sections

**New blocks needed (2):**
- `retreatItinerary` — 8-day itinerary with day name, theme, and timed activities with category tags
- `textTestimonials` — text-based testimonials with quote, author name, and role (distinct from existing `videoTestimonials`)

**Stats** — the `StatsSection` component already exists and is used on the homepage. We can either add a `statsSection` block type or hardcode the stats from `src/lib/data.ts` (they're site-wide stats). Adding it as a block gives more flexibility.

## Implementation Steps

### 1. Add `pageBuilder` and hero fields to `page` schema

Add to [sanity/schemas/page.ts](sanity/schemas/page.ts):
- `heroImages` (array of images)
- `heroTitle`, `heroSubtitle`, `heroTagline` (strings)
- `pageBuilder` array with selected block types: `richText`, `cardGrid`, `contentBlock`, `featureBlock`, `imageBreak`, `imageGrid`, `imageCarousel`, `videoBlock`, `highlightsGrid`, `inclusionsGrid`, `faqSection`, `ctaSection`, `retreatItinerary`, `textTestimonials`
- Keep existing `body` field for backward compatibility with simple pages

### 2. Create `retreatItinerary` block schema

New file: `sanity/schemas/blocks/retreatItinerary.ts`

```typescript
// Key structure:
{
  heading: string,
  subtext: string,
  days: [{
    dayNumber: number,
    dayName: string,   // "Saturday"
    theme: string,     // "Arrival", "First Waves"
    activities: [{
      time: string,    // "07:00"
      title: string,   // "2x 2-hour Surf Session"
      category: string // "Surf", "Yoga", "Wellness", "Culture"
    }]
  }]
}
```

### 3. Create `textTestimonials` block schema

New file: `sanity/schemas/blocks/textTestimonials.ts`

```typescript
{
  heading: string,
  testimonials: [{
    quote: string,
    authorName: string,
    authorRole: string
  }]
}
```

### 4. Register new schemas

- Add imports to [sanity/schemas/index.ts](sanity/schemas/index.ts) (or wherever schemas are registered)
- Add block types to the new `pageBuilder` in the `page` schema

### 5. Create Astro block components

- `src/components/blocks/RetreatItineraryBlock.astro` — renders the multi-day timeline with activity cards and category tags
- `src/components/blocks/TextTestimonialsBlock.astro` — renders quote cards with author info

### 6. Update BlockRenderer

Add the two new block types to [src/components/blocks/BlockRenderer.astro](src/components/blocks/BlockRenderer.astro).

### 7. Create Astro page template

Create `src/pages/host-a-retreat.astro` that:
- Fetches the `page` document with slug `host-a-retreat`
- Renders hero from page-level fields
- Uses `BlockRenderer` for the `pageBuilder` content
- Falls back to Portable Text `body` if no pageBuilder blocks

### 8. Populate Sanity document

Run a Node script to create the `page` document in Sanity with:
- `slug: "host-a-retreat"`
- Hero fields populated
- `pageBuilder` array with all sections from the scraped content
- SEO meta data

