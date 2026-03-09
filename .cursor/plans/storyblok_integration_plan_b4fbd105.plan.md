---
name: Storyblok integration plan
overview: Phased migration from hardcoded content to Storyblok CMS, starting now while the design is finalized. The approach is incremental — no big-bang switch — so the site stays functional at every step.
todos:
  - id: phase-0
    content: "Phase 0: Create Storyblok space, set API token, push updated component schemas via CLI"
    status: pending
  - id: phase-1
    content: "Phase 1: Build data abstraction layer (src/lib/content.ts) with CMS/hardcoded toggle + mapper functions"
    status: pending
  - id: phase-2
    content: "Phase 2: Populate shared data entries in Storyblok (inclusions, amenities, room types, dietary options, surf levels, reviews, FAQs)"
    status: pending
  - id: phase-3
    content: "Phase 3: Migrate camp pages — start with Green Bowl as proof-of-concept, then remaining 8 camps"
    status: pending
  - id: phase-4
    content: "Phase 4: Migrate country pages, homepage, blog, FAQ, and static pages"
    status: pending
  - id: phase-5
    content: "Phase 5 (optional): Enable visual editor (hybrid output), Storyblok Bridge, and wire popup/FOMO content to CMS"
    status: pending
isProject: false
---

# Storyblok Integration Plan

## Why now is the right time

You have everything locked in:
- Design is finalized across all pages
- All Astro components exist and are tested
- `@storyblok/astro` and `storyblok-js-client` are already installed
- [src/lib/storyblok.ts](src/lib/storyblok.ts) has `fetchStory`/`fetchStories` helpers ready
- Storyblok integration is pre-wired (commented out) in [astro.config.mjs](astro.config.mjs)
- A comprehensive schema blueprint exists at [docs/storyblok-schema.md](docs/storyblok-schema.md)
- Image domain `a.storyblok.com` is already whitelisted

Starting now means the design won't drift while we wire up the CMS. The existing `storyblok/components.json` is outdated (simpler than the blueprint), so we'll replace it.

---

## Phase 0: Storyblok Space Setup (no code changes)

This is manual work in the Storyblok dashboard:
- Create the Storyblok space (EU region, matching the API config)
- Set the API token in `.env` as `PUBLIC_STORYBLOK_TOKEN`
- Create the folder structure from the blueprint (`surfcamp/`, `blog/`, `faq/`, `data/`)
- Push updated component schemas using the Storyblok CLI (`storyblok push-components`)

This phase is zero-risk — no code changes, the live site is unaffected.

---

## Phase 1: Data Abstraction Layer

Before touching any pages, create a thin abstraction so every page can read from **either** hardcoded data or Storyblok, controlled by a single flag.

Create `src/lib/content.ts`:
```typescript
const USE_CMS = !!import.meta.env.PUBLIC_STORYBLOK_TOKEN;

export async function getDestinations() {
  if (USE_CMS) {
    const stories = await fetchStories({ starts_with: "surfcamp/", content_type: "page_camp" });
    return stories.map(mapStoryToDestination);
  }
  return destinations; // from data.ts
}

export async function getCampPage(country: string, camp: string) {
  if (USE_CMS) {
    return fetchStory(`surfcamp/${country}/${camp}`);
  }
  return getHardcodedCampData(country, camp);
}
```

This is the key architectural decision: **one function per data need, with a CMS/hardcoded toggle**. Pages import from `content.ts` instead of `data.ts` directly.

---

## Phase 2: Shared Data Population

Populate the `data/` folder entries in Storyblok first (inclusions, amenities, room types, dietary options, surf levels, reviews, FAQ items). These are small, self-contained records that:
- Can be tested in isolation
- Are referenced by multiple pages later
- Establish the editorial workflow early

---

## Phase 3: Camp Pages Migration (biggest surface area)

Migrate in this order, one camp at a time:
1. **Camp overview pages** — the `page_camp` content type with hero images, booking URL, inclusions, body sections
2. **Camp sub-pages** (surf, rooms, food) — these inherit from the parent camp story

For each camp, the workflow is:
- Create the story in Storyblok with all content
- The page already reads from `content.ts`, which auto-switches when CMS data exists
- Verify the rendered output matches the hardcoded version
- Move to the next camp

Start with **one camp** (e.g., Green Bowl) as the proof-of-concept before doing the rest.

---

## Phase 4: Remaining Pages

Once camps are migrated:
- **Country pages** (`[country].astro`) — content blocks, hero, description
- **Homepage** — hero, about section, stats, destination grid
- **Blog** — posts, categories
- **FAQ pages** — already structured with `FAQSection.astro`
- **Static pages** (about, contact) — lowest priority, least content churn

---

## Phase 5: Visual Editor + Dynamic Features (optional)

- Switch `output` from `"static"` to `"hybrid"` in [astro.config.mjs](astro.config.mjs) for Storyblok visual editor preview routes
- Enable the Storyblok Bridge for live preview
- Wire popup content (exit intent, spinning wheel, special offers) to Storyblok so editors can configure them per page
- Wire FOMO messages and room profiles to Storyblok

---

## What stays in code (not in Storyblok)

These should remain hardcoded — they're structural, not editorial:
- Layout components (Header, Footer, CampLayout, CampSubnav)
- Contact widget configuration and behavior
- Popup system logic (manager, timing, priority)
- Payment methods section
- FOMO script logic (the message templates and number ranges could later move to Storyblok, but the rendering logic stays in code)
- SEO structured data generation (JSON-LD for FAQPage, TouristTrip)
- Navigation structure (auto-generated from camp stories at build time)

---

## Estimated effort per phase

- **Phase 0**: ~1 hour (dashboard setup, CLI push)
- **Phase 1**: ~2-3 hours (abstraction layer, mapper functions)
- **Phase 2**: ~1-2 hours (populating shared data entries)
- **Phase 3**: ~4-6 hours (9 camps x 4 pages each, but templated)
- **Phase 4**: ~3-4 hours (homepage, countries, blog, FAQ)
- **Phase 5**: ~2-3 hours (visual editor, popup CMS wiring)

Total: roughly 2-3 focused sessions of work. The site remains fully functional throughout — at no point do you need to "flip a switch" and hope everything works.

---

## The `storyblok/components.json` gap

The current file has basic schemas from an earlier draft. The detailed blueprint in [docs/storyblok-schema.md](docs/storyblok-schema.md) is much more complete (multi-asset hero images, SEO groups, room type references, etc.). Phase 0 will regenerate `components.json` to match the blueprint before pushing to Storyblok.
