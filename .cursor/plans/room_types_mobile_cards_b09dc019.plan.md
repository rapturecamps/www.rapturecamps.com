---
name: Room types mobile cards
overview: Wrap each room type in a card container on mobile so there's a clear visual boundary between room types, while keeping the current alternating side-by-side layout on desktop.
todos:
  - id: card-wrap
    content: Wrap each room item in a card container with rounded-2xl, bg-dark-lighter, border, overflow-hidden
    status: completed
  - id: mobile-layout
    content: "Restructure mobile layout: image flush to card top, info padded below. Move carousel dots inside card."
    status: completed
  - id: desktop-layout
    content: Keep alternating grid inside the card. Ensure image fills its side flush with card edge.
    status: completed
isProject: false
---

# Room Types: Mobile Card Design

## Problem

On desktop, the alternating image-left / image-right layout creates clear visual separation between room types. On mobile, everything stacks as image-info-image-info with only spacing between them — no clear boundary.

## Approach

Wrap each room type in a card (`rounded-2xl bg-dark-lighter border border-white/5 overflow-hidden`) — the same card pattern used for camp cards on the country pages. The card creates an unmistakable visual boundary between room types on mobile.

### Mobile (single column)

```
+------------------------------+
|  [IMAGE CAROUSEL full-width] |
|------------------------------|
|  Room Name         [Tag]     |
|  Price / Capacity            |
|  Description text...         |
|  * Feature   * Feature       |
|  * Feature   * Feature       |
+------------------------------+
         (gap)
+------------------------------+
|  [IMAGE CAROUSEL full-width] |
|  ...                         |
+------------------------------+
```

### Desktop (keeps current alternating layout)

Two options:

- **Option A — Cards on desktop too:** Each room is a card with image and info side-by-side inside it. Consistent look, slightly more contained.
- **Option B — Cards only on mobile:** Mobile gets the card treatment, desktop stays as-is (open layout, no card border). Uses responsive classes to toggle.

I'd recommend **Option A** since it adds visual structure on desktop too without losing the alternating layout.

## Changes

Single file: [src/components/blocks/RoomTypesBlock.astro](src/components/blocks/RoomTypesBlock.astro)

- Wrap each room's grid in a card container: `rounded-2xl bg-dark-lighter border border-white/5 overflow-hidden`
- Image carousel gets no extra rounding (card's `overflow-hidden` clips it)
- Info section gets `p-5 sm:p-6` padding inside the card
- On desktop, the grid stays `lg:grid-cols-2` with alternating order — just now inside a card
- Carousel dots move inside the card (below the image, above the info on mobile)
- Reduce outer spacing from `space-y-8 lg:space-y-12` to `space-y-6` since the cards themselves create separation

