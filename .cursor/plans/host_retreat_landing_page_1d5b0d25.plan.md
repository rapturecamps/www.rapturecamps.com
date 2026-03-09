---
name: Host Retreat Landing Page
overview: Add a `pageBuilder` to the `page` schema, create 2 new block types for unique sections, build an Astro template, and populate the Sanity document with all content from the existing retreat page.
todos:
  - id: page-schema
    content: Add pageBuilder, hero fields to page schema + register new block types
    status: completed
  - id: itinerary-block
    content: Create retreatItinerary block schema + Astro component
    status: completed
  - id: testimonials-block
    content: Create textTestimonials block schema + Astro component
    status: completed
  - id: block-renderer
    content: Register new blocks in BlockRenderer.astro
    status: completed
  - id: astro-page
    content: Create src/pages/host-a-retreat.astro with hero + BlockRenderer
    status: completed
  - id: sanity-content
    content: Populate Sanity document with all content from the retreat page
    status: completed
isProject: false
---

# Host a Retreat — Full Sanity CMS Landing Page

## Current State

- The `page` schema ([sanity/schemas/page.ts](sanity/schemas/page.ts)) only has `title`, `slug`, `body` (Portable Text), and `seo` — suitable for simple text pages (privacy policy, terms, about)
- The `camp` schema has a `pageBuilder` array with 23 block types and a `BlockRenderer` that maps them to Astro components
- No `pageBuilder` exists on the `page` schema
- Camp pages have a sticky sub-navigation ([src/components/layout/CampSubnav.astro](src/components/layout/CampSubnav.astro)) with tabs and a booking button
- Contact page has a Zoho Desk web-to-case form ([src/pages/contact.astro](src/pages/contact.astro)) submitting to `help.rapturecamps.com/support/WebToCase`

## Key Design Decisions

- **Standard site layout**: Uses `BaseLayout` with the main site navigation (header) and footer — same as all other pages
- **Sticky sub-navigation**: Similar to camp pages, with anchor links to page sections (Why Us, What's Included, Location, Itinerary, Get in Touch) plus a CTA button
- **Contact form**: Reuses the existing Zoho Desk form (same as contact page), not a custom form — the "Get in Touch" section embeds this form directly
- **Page is fully CMS-managed**: All content comes from Sanity via `pageBuilder` blocks

## Sections and Block Mapping


| Section                       | Block Type                  | Notes                                                        |
| ----------------------------- | --------------------------- | ------------------------------------------------------------ |
| Hero                          | Page-level fields           | `heroTitle`, `heroSubtitle`, `heroTagline`, hero image/video |
| Sub-navigation                | Hardcoded in template       | Anchor links to sections on the page                         |
| "Why Rapture Camps" (4 cards) | `cardGrid` (existing)       | 4 cards with icons, titles, descriptions                     |
| "What's Included" (4 cards)   | `cardGrid` (existing)       | 4 cards with icons                                           |
| Location (Green Bowl)         | `featureBlock` (existing)   | Image + text + amenity tags                                  |
| 8-day Itinerary               | `retreatItinerary` (NEW)    | Multi-day timeline with timed activities and category tags   |
| Stats bar                     | `retreatStatsBar` (NEW)     | 4 stat items (years, guests, locations, awards)              |
| Testimonials (3 quotes)       | `retreatTestimonials` (NEW) | Quote, author name, role                                     |
| Contact form                  | Hardcoded in template       | Reuses Zoho Desk form from contact page                      |


## Implementation Steps

### 1. Add `pageBuilder` and hero fields to `page` schema

Add to [sanity/schemas/page.ts](sanity/schemas/page.ts):

- `heroImages` (array of images), `heroTitle`, `heroSubtitle`, `heroTagline` (strings)
- `pageBuilder` array with block types: `richText`, `cardGrid`, `contentBlock`, `contentBlockGrid`, `contentBlockVideo`, `contentBlockImageCarousel`, `featureBlock`, `imageBreak`, `imageGrid`, `imageCarousel`, `videoBlock`, `highlightsGrid`, `inclusionsGrid`, `faqSection`, `ctaSection`, `retreatItinerary`, `retreatTestimonials`, `retreatStatsBar`
- Keep existing `body` field for backward compatibility with simple text pages

### 2. Create new block schemas (3 blocks)

`**retreatItinerary`** — `sanity/schemas/blocks/retreatItinerary.ts`:

- `heading`, `subtext` (strings)
- `days[]`: `dayNumber`, `dayName` (e.g. "Saturday"), `theme` (e.g. "Arrival"), `activities[]`: `time`, `title`, `category` (Surf/Yoga/Wellness/Culture)

`**retreatTestimonials`** — `sanity/schemas/blocks/retreatTestimonials.ts`:

- `heading` (string)
- `testimonials[]`: `quote`, `authorName`, `authorRole`

`**retreatStatsBar`** — `sanity/schemas/blocks/retreatStatsBar.ts`:

- `stats[]`: `value`, `label`, `prefix` (optional, e.g. "More than")

### 3. Register schemas and update BlockRenderer

- Add new block type imports to schema index
- Add 3 new cases to [src/components/blocks/BlockRenderer.astro](src/components/blocks/BlockRenderer.astro)

### 4. Create Astro block components (3 components)

- `src/components/blocks/RetreatItineraryBlock.astro` — multi-day timeline with activity cards and color-coded category tags
- `src/components/blocks/RetreatTestimonialsBlock.astro` — quote cards with author initials badge, name, and role
- `src/components/blocks/RetreatStatsBarBlock.astro` — horizontal bar of animated stat counters

### 5. Create Astro page template

Create `src/pages/host-a-retreat.astro`:

- Uses `BaseLayout` (standard header + footer)
- Fetches page document from Sanity by slug `host-a-retreat`
- Renders hero from page-level fields
- Adds sticky sub-navigation with anchor links: Why Us (#why), What's Included (#included), Location (#location), Program (#program), Get in Touch (#contact)
- Uses `BlockRenderer` for `pageBuilder` content (each block gets an `id` attribute for anchor linking)
- Embeds the Zoho Desk contact form at the bottom (reused from contact page)

### 6. Populate Sanity document

Run a Node script to create the page document in Sanity with all content from the existing retreat page:

- Slug: `host-a-retreat`, title: "Host Your Retreat in Paradise"
- Hero fields
- `pageBuilder` with: 2x `cardGrid`, 1x `featureBlock`, 1x `retreatItinerary`, 1x `retreatStatsBar`, 1x `retreatTestimonials`
- SEO meta: title, description

