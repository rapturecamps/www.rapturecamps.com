---
name: LodgingBusiness JSON-LD schema
overview: Add LodgingBusiness JSON-LD structured data with aggregateRating to each camp page, using existing rating/reviewCount/location data from data.ts. This enables rich snippets with star ratings in Google search results.
todos:
  - id: camp-jsonld
    content: Add LodgingBusiness JSON-LD to CampLayout for overview pages using existing camp data
    status: pending
isProject: false
---

# LodgingBusiness JSON-LD Schema

## What This Achieves

Google can display rich snippets with star ratings, review counts, and business details directly in search results for each camp page. This significantly improves click-through rates for searches like "Surf Camp Bali".

## Where to Add It

**Camp overview pages only** (`/surfcamp/[country]/[camp]/`) -- this is where the business entity lives. Sub-pages (rooms, food, surf) don't need their own schema since they describe the same business.

The schema will be injected in [CampLayout.astro](src/components/layout/CampLayout.astro) but only rendered when `activePage === "overview"`.

## Schema Structure

Each camp gets a `LodgingBusiness` entity with:

- `@type`: "LodgingBusiness"
- `name`: "Rapture Surf Camp {campName}"
- `description`: from BaseLayout description prop
- `url`: canonical URL of the camp page
- `image`: hero image
- `address`: country + location from data.ts
- `geo`: latitude/longitude from data.ts
- `aggregateRating`: rating + reviewCount from data.ts
- `amenityFeature`: mapped from amenities array

## Data Source

All fields come from the existing `destinations` array in [data.ts](src/lib/data.ts), which already has `rating`, `reviewCount`, `latitude`, `longitude`, `amenities`, and `location` for every camp.

## Implementation

Single change in [CampLayout.astro](src/components/layout/CampLayout.astro):
- Import `destinations` from data.ts
- Look up the camp data using `basePath`
- Render a `<script type="application/ld+json">` block in the BaseLayout `head` slot when `activePage === "overview"`

No changes needed to individual camp pages or data structures.
