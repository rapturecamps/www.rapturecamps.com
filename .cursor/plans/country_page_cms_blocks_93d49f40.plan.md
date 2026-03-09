---
name: Country page CMS blocks
overview: Make Image Break and Elfsight Reviews into proper pageBuilder blocks so their position and content can be controlled from Sanity Studio. Keep FAQ fallback and CTA hardcoded at the bottom.
todos:
  - id: create-elfsight-block
    content: Create elfsightReviews block schema, component, and register in BlockRenderer
    status: completed
  - id: register-schemas
    content: Register new block in schema index, and add to country/camp/blogPost pageBuilder arrays
    status: completed
  - id: simplify-en-country
    content: "EN country page: remove hardcoded Image Break and Elfsight, keep FAQ fallback and CTA"
    status: completed
  - id: update-de-country
    content: Update DE country page to use BlockRenderer when pageBuilder has blocks
    status: completed
isProject: false
---

# Country Page CMS Blocks

## Goal

Move the hardcoded Image Break and Elfsight Reviews on country pages into the pageBuilder so they become rearrangeable blocks. The fallback FAQ and CTA stay hardcoded at the bottom.

Image Break already exists as a pageBuilder block type (`imageBreak`) -- it just needs to stop being hardcoded outside the pageBuilder on the country page. Elfsight Reviews needs a new block type.

## Changes

### 1. Create `elfsightReviews` block type

New file: `sanity/schemas/blocks/elfsightReviews.ts`

- `heading` (string, default "What Our Guests Say")
- `elfsightAppId` (string, required -- the Elfsight widget App ID)
- Include `blockLayoutFields` for spacing/divider control

### 2. Register the new block

- Add `elfsightReviews` to `sanity/schemas/index.ts`
- Add `{ type: "elfsightReviews" }` to the `pageBuilder.of` array in:
  - `sanity/schemas/country.ts`
  - `sanity/schemas/camp.ts`
  - `sanity/schemas/blogPost.ts` (so it can be used in blog posts too)

### 3. Create `ElfsightReviewsBlock` component + register in BlockRenderer

New file: `src/components/blocks/ElfsightReviewsBlock.astro`

- Wraps the existing `ElfsightReviews` section component, passing `block.heading` and `block.elfsightAppId`

In `src/components/blocks/BlockRenderer.astro`:

- Import and add: `if (type === "elfsightReviews") return <ElfsightReviewsBlock block={block} />;`

### 4. Simplify EN country page

In `src/pages/surfcamp/[country].astro`:

- Remove the hardcoded `<ImageBreak>` (line 632-637) -- users add this via pageBuilder instead
- Remove the hardcoded `<ElfsightReviews>` (line 639-651) -- users add this via pageBuilder instead
- Keep the fallback FAQ section (line 653-678) as-is
- Keep the hardcoded `<CTASection>` (line 680-681) as-is

Page structure becomes:

```
Hero
Camps Comparison (hardcoded, from Sanity comparison field)
PageBuilder blocks (Image Break, Elfsight, content blocks, etc. -- all rearrangeable)
  OR fallback hardcoded content (for countries not yet set up)
Fallback FAQ (hardcoded, only shows when no Sanity blocks)
CTA (hardcoded, always at bottom)
```

### 5. Update DE country page

In `src/pages/de/surfcamp/[country].astro`:

- Import `BlockRenderer`
- After the camps grid, render `<BlockRenderer>` if pageBuilder blocks exist

### 6. No GROQ changes needed

The `COUNTRY_BY_SLUG` query already uses `...` spread in the pageBuilder projection, so `elfsightAppId` and `heading` are included automatically.