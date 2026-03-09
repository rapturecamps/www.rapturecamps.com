---
name: Extend Content Block Media
overview: Extend the existing Content Block to support three media types (single image, image grid, or embedded video) in the 50/50 text+media layout, controlled by a "Media Type" selector in Sanity Studio.
todos:
  - id: schema
    content: Add mediaType selector, images array, and video fields to contentBlock schema with conditional visibility
    status: completed
  - id: queries
    content: Update all pageBuilder GROQ projections to resolve contentBlock images array and video poster assets
    status: completed
  - id: component
    content: Extend ContentBlock.astro to render image grid and video in the media column based on mediaType
    status: pending
  - id: renderer
    content: Update BlockRenderer.astro to pass new media fields to ContentBlock
    status: completed
  - id: translate
    content: Add video fields to translation skip list
    status: completed
isProject: false
---

# Extend Content Block with Image Grid and Video Support

## Approach

Instead of creating separate blocks, extend the existing `contentBlock` to support three media types via a dropdown selector. The CMS author picks "Image", "Image Grid", or "Video" and the relevant fields appear. The 50/50 layout stays the same — text on one side, media on the other (reversible).

## Schema Changes — `sanity/schemas/blocks/contentBlock.ts`

Add a `mediaType` field and new media-specific fields:

- `**mediaType**` (string, dropdown): `"image"` (default) | `"imageGrid"` | `"video"`
- `**images**` (array of images): Shown when `mediaType === "imageGrid"`. Supports 2-4 images.
- `**videoType**` (string): `"youtube"` | `"vimeo"` | `"file"` — shown when `mediaType === "video"`
- `**videoId**` (string): Video ID or URL — shown when `mediaType === "video"`
- `**videoPoster**` (image): Optional poster — shown when `mediaType === "video"`

Use Sanity's `hidden` function on each field so only the relevant fields appear based on `mediaType`:

- `image` field: hidden when mediaType is not `"image"` (or undefined)
- `images` field: hidden when mediaType is not `"imageGrid"`
- `videoType`, `videoId`, `videoPoster`: hidden when mediaType is not `"video"`

The existing `image` field stays as-is for backward compatibility.

## GROQ Query Changes — `src/lib/queries.ts`

In every `pageBuilder[]` projection that handles `contentBlock`, add resolution for the new fields:

```groq
_type == "contentBlock" => {
  ...,
  "resolvedImageUrl": image.asset->url,
  "resolvedImageAlt": image.asset->altText,
  images[] { ..., "resolvedUrl": asset->url, "resolvedAlt": asset->altText },
  "resolvedVideoPosterUrl": videoPoster.asset->url
}
```

This must be updated in all `pageBuilder[]` projections across the file (approx 7 locations). The `contentBlock` must be removed from the existing `_type in ["imageBreak", "contentBlock", "featureBlock"]` group and given its own projection.

## Component Changes — `src/components/sections/ContentBlock.astro`

Extend the Props interface and rendering:

- Add `mediaType`, `images` (array), `videoType`, `videoSrc`, `videoPoster` props
- In the media column (right/left side), render based on `mediaType`:
  - `**"image"**` (default): Current single image with `aspect-[4/3]` — unchanged
  - `**"imageGrid"**`: A compact grid layout fitting 2-4 images in the half-width space (2x2 grid for 4 images, or 2-column for 2-3 images)
  - `**"video"**`: Embedded YouTube/Vimeo/file video player with `aspect-video` ratio

## BlockRenderer Changes — `src/components/blocks/BlockRenderer.astro`

Pass the new fields through to `ContentBlock`:

```astro
<ContentBlock
  ...existing props...
  mediaType={block.mediaType || "image"}
  images={(block.images || []).map(img => ({ src: img.resolvedUrl, alt: img.resolvedAlt || "" }))}
  videoType={block.videoType}
  videoSrc={block.videoId}
  videoPoster={block.resolvedVideoPosterUrl}
/>
```

## Image Grid Layout (within half-width)

A compact version of the existing `ImageGrid` layouts, adapted for the constrained 50% column:

- **2 images**: 2-column grid, each `aspect-[4/3]`
- **3 images**: 1 wide on top + 2 below
- **4 images**: 2x2 grid

## Translation Skip Fields — `src/pages/api/translate.ts`

Add `"videoType"`, `"videoId"` to `SKIP_FIELDS` (these are not translatable content).