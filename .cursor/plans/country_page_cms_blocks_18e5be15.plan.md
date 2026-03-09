---
name: Country page CMS blocks
overview: Convert all hardcoded sections on country pages (image break, Elfsight reviews, fallback FAQ, CTA) into Sanity pageBuilder blocks so every section between the hero and footer is editable and rearrangeable in the Studio.
todos:
  - id: create-elfsight-block
    content: Create elfsightReviews block schema, component, and register in BlockRenderer
    status: completed
  - id: register-schemas
    content: Register new block in schema index, country.ts and camp.ts pageBuilder arrays
    status: completed
  - id: simplify-en-country
    content: "Simplify EN country page: remove hardcoded sections after pageBuilder, keep fallback"
    status: completed
  - id: update-de-country
    content: Update DE country page to use BlockRenderer when pageBuilder has blocks
    status: completed
isProject: false
---

# Make Country Pages Fully CMS-Driven

## Current State

On `src/pages/surfcamp/[country].astro`, the page structure is:

1. **Hero** -- uses Sanity data (heroTitle, heroImages, etc.)
2. **Camps comparison section** -- uses Sanity `comparison` field + live camp data (always first, stays hardcoded since it depends on camp references)
3. **PageBuilder blocks** OR **hardcoded fallback** -- the `if/else` at line 582
4. **Image Break** (line 632) -- HARDCODED from fallback data, always renders
5. **Elfsight Reviews** (line 640) -- HARDCODED, always renders if camp has elfsightId
6. **Fallback FAQ** (line 654) -- HARDCODED, only when no Sanity blocks
7. **CTA** (line 680) -- HARDCODED, always renders

The German page (`src/pages/de/surfcamp/[country].astro`) is a thin wrapper that doesn't use pageBuilder at all yet.

## What Needs to Change

### 1. Create an `elfsightReviews` block type

New file: `sanity/schemas/blocks/elfsightReviews.ts`
- Fields: `heading` (string), `elfsightAppId` (string, description: "The Elfsight widget App ID")
- This lets the user place the reviews widget anywhere in the page order
- Add layout fields via `blockLayoutFields`

### 2. Register the new block

- Import and add `elfsightReviews` to `sanity/schemas/index.ts`
- Add `{ type: "elfsightReviews" }` to the `pageBuilder.of` array in `sanity/schemas/country.ts`
- Also add to `camp.ts` pageBuilder if not already there

### 3. Add ElfsightReviewsBlock component

New file: `src/components/blocks/ElfsightReviewsBlock.astro`
- Accepts `block.heading` and `block.elfsightAppId`
- Renders the existing `ElfsightReviews` section component

### 4. Register in BlockRenderer

In `src/components/blocks/BlockRenderer.astro`:
- Import `ElfsightReviewsBlock`
- Add: `if (type === "elfsightReviews") return <ElfsightReviewsBlock block={block} />;`

### 5. Simplify the country page template

In `src/pages/surfcamp/[country].astro`:
- Remove the hardcoded `<ImageBreak>` (line 632-637)
- Remove the hardcoded `<ElfsightReviews>` (line 639-651)
- Remove the hardcoded fallback FAQ section (line 653-678)
- Remove the hardcoded `<CTASection>` (line 680-681)
- Change the rendering logic: when `hasSanityBlocks`, render BlockRenderer and nothing else after it. The CTA, image break, reviews, and FAQ should all be added as blocks in the Sanity pageBuilder.
- Keep the fallback `else` branch for countries that haven't been set up in Sanity yet (with the existing hardcoded ImageBreak, FAQ, CTA, etc.)

The simplified structure becomes:

```
Hero
Camps Comparison (always, from Sanity comparison field)
if hasSanityBlocks:
  BlockRenderer (renders everything including image breaks, reviews, FAQ, CTA)
else:
  fallback hardcoded content (existing behavior, unchanged)
```

### 6. Update German country page

In `src/pages/de/surfcamp/[country].astro`:
- Import `BlockRenderer`
- After the camps grid, render `<BlockRenderer blocks={pageBuilder} />` if blocks exist
- Keep the hardcoded CTA as fallback only when no blocks

### 7. No GROQ query changes needed

The existing `COUNTRY_BY_SLUG` query already fetches `pageBuilder[]` with all necessary projections including the `...` spread, so `elfsightAppId` and `heading` will be included automatically. No additional projection needed for the new block type since it has no image/reference fields to resolve.
