---
name: Surf Conditions Block
overview: Create a single reusable "Surf Conditions" block type that renders heading + rich text body on the left, and a key-value data card on the right. Usable multiple times on any page for Wave Type, Skill Level, Best Season, Swell & Wind, Crowd Factor, or anything else.
todos:
  - id: schema
    content: Create sanity/schemas/blocks/surfConditions.ts with all fields
    status: completed
  - id: register
    content: Register in index.ts and add to camp.ts pageBuilder array
    status: completed
  - id: component
    content: Create SurfConditionsBlock.astro with 2-col layout + data card
    status: completed
  - id: renderer
    content: Wire up in BlockRenderer.astro
    status: completed
isProject: false
---

# Surf Conditions Block

## Why one block instead of five

All 5 sections (Wave Type, Skill Level, Best Season, Swell & Wind, Crowd Factor) share identical structure: heading + rich text + data card. Creating a single reusable `surfConditions` block means:

- Add it 5 times to the page builder with different content per instance
- No schema duplication to maintain
- Works on any page (overview, surf, food, rooms)
- The CMS preview shows the heading so each instance is distinguishable

## Layout

Same 2-column grid as existing blocks (`SurfSeasonsBlock`, `ClimateInfoBlock`, `SurfIntroBlock`):

- **Left**: heading (with H1/H2/H3/H4 selector) + rich text body
- **Right**: sticky card with optional card title + array of label/value rows + optional footer note
- Card design: `rounded-2xl border border-white/5 bg-dark-lighter/50 p-6` (matches existing cards)
- `reverse` toggle to swap left/right

## Sanity schema — `surfConditions`

**File**: [sanity/schemas/blocks/surfConditions.ts](sanity/schemas/blocks/surfConditions.ts) (new)

Fields:

- `category` — string dropdown: Wave Type, Skill Level, Best Season, Swell & Wind, Crowd Factor
- `heading` — string
- `headingLevel` — string (H1/H2/H3/H4), default H2
- `body` — array of block (Portable Text rich text)
- `cardTitle` — string (optional override; auto-derived from category if left empty)
- `cardItems` — array of `{ label: string, value: string }` (the key-value rows)
- `cardNote` — string (optional footer note with info icon, e.g. "No wetsuit needed")
- `reverse` — boolean (swap text/card sides)
- `background` — string (dark / dark-lighter)
- `...blockLayoutFields` (shared spacing/divider controls)

## Default card data per category

The Astro component holds fallback data per category. When `cardItems` is empty, the defaults for the selected category are used. This means you get pre-filled data on the frontend immediately — just override in the CMS when you need camp-specific values.

- **Wave Type** (card title: "Wave Summary"): Wave Type, Size Range, Best Section, Reef Depth, Hazards
- **Skill Level** (card title: "Skill Overview"): Recommended Level, Main Break, Coaching Available, Beginner Options, Best For
- **Best Season** (card title: "Season Overview"): Peak Season, Swell Source, Off-Season, Year-Round Surfing, Daily Spot Check
- **Swell & Wind** (card title: "Swell & Wind"): Optimal Swell, Tide, Offshore Wind, Best Window, Backup Spots
- **Crowd Factor** (card title: "Crowd Overview"): Crowd Level, Localism, Access, Camp Advantage, Atmosphere

## Registration

- Import in [sanity/schemas/index.ts](sanity/schemas/index.ts) and add to `schemaTypes`
- Add `{ type: "surfConditions" }` to the `pageBuilder` array in [sanity/schemas/camp.ts](sanity/schemas/camp.ts)

## Astro component

**File**: [src/components/blocks/SurfConditionsBlock.astro](src/components/blocks/SurfConditionsBlock.astro) (new)

Follows the same pattern as `SurfSeasonsBlock.astro` and `ClimateInfoBlock.astro`:

- Accepts `block` prop
- Includes inline `portableTextToHtml` helper (same as other blocks)
- Renders 2-column grid with text left, card right (or reversed)
- Card is `lg:sticky lg:top-28`
- Card rows render as label/value pairs with `border-b border-white/5` separators

## Block Renderer

Update [src/components/blocks/BlockRenderer.astro](src/components/blocks/BlockRenderer.astro):

- Import `SurfConditionsBlock`
- Add mapping: `if (type === "surfConditions") return <SurfConditionsBlock block={block} />;`

