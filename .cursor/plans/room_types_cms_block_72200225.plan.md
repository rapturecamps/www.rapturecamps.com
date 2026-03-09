---
name: Room Types CMS Block
overview: Upgrade the Room Types block to be fully CMS-driven with an editable heading, and replace the single image per room with a media carousel that supports both images and Bunny CDN videos.
todos:
  - id: schema
    content: "Update roomTypes.ts schema: add heading field, add media array with image + video item types"
    status: completed
  - id: query
    content: Update CAMP_ROOMS_PAGE GROQ query to resolve media URLs inside rooms[]
    status: completed
  - id: component
    content: Rebuild RoomTypesBlock.astro with CMS heading and per-room media carousel (images + Bunny CDN videos)
    status: completed
  - id: test
    content: Verify on localhost that existing rooms pages still render and new media carousel works
    status: completed
isProject: false
---

# Room Types CMS Block with Media Carousel

## Current State

The `roomTypes` block already exists as a CMS block in [sanity/schemas/blocks/roomTypes.ts](sanity/schemas/blocks/roomTypes.ts) — it has editable rooms with type, tag, price, capacity, description, features, and a **single image**. The heading "Room Types" is hardcoded in the component. The GROQ query resolves `rooms[] { ..., "resolvedImageUrl": image.asset->url }`.

## Changes

### 1. Update Sanity Schema

In [sanity/schemas/blocks/roomTypes.ts](sanity/schemas/blocks/roomTypes.ts):

- Add a `heading` field (string, default "Room Types")
- Replace the single `image` field with a `media` array that accepts two object types:
  - **Image item**: an image from the media library (with hotspot)
  - **Video item**: a Bunny CDN video ID (string) + optional poster image
- Keep the existing `image` field but mark it hidden (backward compatibility — old data won't break)

```
media[] of:
  - { type: "object", name: "mediaImage", fields: [image, alt] }
  - { type: "object", name: "mediaVideo", fields: [videoId, poster] }
```

### 2. Update GROQ Query

In [src/lib/queries.ts](src/lib/queries.ts), update the `rooms[]` projection in `CAMP_ROOMS_PAGE` to resolve media URLs:

```
rooms[] {
  ...,
  "resolvedImageUrl": image.asset->url,
  media[] {
    ...,
    _type == "mediaImage" => { ..., "resolvedUrl": image.asset->url },
    _type == "mediaVideo" => { ..., "resolvedPosterUrl": poster.asset->url }
  }
}
```

### 3. Update the Astro Component

In [src/components/blocks/RoomTypesBlock.astro](src/components/blocks/RoomTypesBlock.astro):

- Use `block.heading` instead of hardcoded "Room Types"
- Replace the single `<img>` with an inline carousel (reusing the pattern from `ContentBlockImageCarousel.astro`):
  - Each slide is either an `<img>` (for mediaImage) or a Bunny CDN `<iframe>` (for mediaVideo)
  - Arrows, dots, and counter when more than 1 media item
  - Falls back to the old single `image` field or placeholder if no `media` array
- Import `bunnyEmbedUrl` from `@/lib/sanity` for video slides
- Unique carousel ID per room (e.g. `rt-{roomIndex}-{uid}`)

### 4. No Other Files Need Changes

- The block is already registered in `schemas/index.ts` and all relevant `pageBuilder` arrays
- `BlockRenderer.astro` already renders it via `<RoomTypesBlock block={block} />`
- The block is only used in `campRoomsPage`, so only `CAMP_ROOMS_PAGE` query needs updating
