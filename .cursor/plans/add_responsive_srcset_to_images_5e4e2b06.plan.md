---
name: Add responsive srcset to images
overview: Add responsive `srcset` and `sizes` attributes to all image components that currently serve full-resolution images, using the existing `responsiveSrc` utility from `src/lib/image-utils.ts`.
todos:
  - id: srcset-surfspots
    content: Add responsiveSrc to SurfSpotsBlock.astro
    status: completed
  - id: srcset-mealcards
    content: Add responsiveSrc to MealCardsBlock.astro
    status: completed
  - id: srcset-contentblock
    content: Add responsiveSrc to ContentBlock.astro
    status: completed
  - id: srcset-cardgrid
    content: Add responsiveSrc to CardGridBlock.astro
    status: completed
  - id: srcset-campsubpages
    content: Add responsiveSrc to CampSubPagesBlock.astro
    status: completed
  - id: srcset-hero
    content: Add resizeWidth/auto=format to Hero.astro background images
    status: completed
isProject: false
---

# Add responsive srcset to image components

## Context

Currently, only `RoomTypesBlock.astro` uses the existing [`src/lib/image-utils.ts`](src/lib/image-utils.ts) `responsiveSrc()` helper to generate responsive `srcset`/`sizes`. Five other block components serve full-resolution Sanity CDN images without any responsive attributes, causing unnecessary bandwidth usage on smaller screens.

The Hero component uses `background-image` CSS which cannot use `srcset` natively, but we can apply `auto=format` to its URLs via `resizeWidth()`.

## Approach

Use the existing `responsiveSrc()` utility -- no new dependencies or helpers needed. For each component, import it, call it on the image URL, and spread the resulting `src`/`srcset` onto the `<img>` tag alongside an appropriate `sizes` attribute.

## Components to update

### 1. [src/components/blocks/SurfSpotsBlock.astro](src/components/blocks/SurfSpotsBlock.astro)
- Import `responsiveSrc`
- Call `responsiveSrc(img)` for each surf spot image
- Add `srcset` and `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"` (3-col grid on lg, 2 on sm, 1 on mobile)

### 2. [src/components/blocks/MealCardsBlock.astro](src/components/blocks/MealCardsBlock.astro)
- Import `responsiveSrc`
- Call `responsiveSrc(getMealImage(meal, i))` for each meal image
- Add `srcset` and `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`

### 3. [src/components/sections/ContentBlock.astro](src/components/sections/ContentBlock.astro)
- Import `responsiveSrc`
- Call `responsiveSrc(image)` once in the frontmatter
- Add `srcset` and `sizes="(min-width: 1024px) 50vw, 100vw"` (2-col layout on lg)

### 4. [src/components/blocks/CardGridBlock.astro](src/components/blocks/CardGridBlock.astro)
- Import `responsiveSrc`
- Call `responsiveSrc(img)` for each card image
- Add `srcset` and `sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"` (adapts to column count)

### 5. [src/components/blocks/CampSubPagesBlock.astro](src/components/blocks/CampSubPagesBlock.astro)
- Import `responsiveSrc`
- Call `responsiveSrc(page.image)` for each sub-page card image
- Add `srcset` and `sizes="(min-width: 1024px) 33vw, 100vw"` (3-col grid on lg)

### 6. [src/components/sections/Hero.astro](src/components/sections/Hero.astro)
- Import `resizeWidth` from image-utils
- Apply `resizeWidth(src, 1920)` to background-image URLs so they get `auto=format` (WebP on supported browsers) and a reasonable cap
- This is the pragmatic approach since `background-image` cannot use `srcset`

## No changes needed
- `RoomTypesBlock.astro` -- already uses `responsiveSrc` with proper `sizes`
