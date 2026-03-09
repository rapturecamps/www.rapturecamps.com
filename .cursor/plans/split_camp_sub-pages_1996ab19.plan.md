---
name: Split camp sub-pages
overview: Refactor camp sub-pages (Surf, Rooms, Food) from tabs within a single camp document into standalone Sanity document types, each referencing their parent camp. This enables independent translation, cleaner editing, and lighter data fetching.
todos:
  - id: create-schemas
    content: "Create 3 new Sanity schemas: campSurfPage, campRoomsPage, campFoodPage with camp reference + pageBuilder + seo"
    status: completed
  - id: register-schemas
    content: Register new schemas in index.ts and add to i18n plugin config
    status: completed
  - id: clean-camp-schema
    content: Remove surfPageBuilder/roomsPageBuilder/foodPageBuilder and related fields from camp.ts
    status: completed
  - id: update-structure
    content: Update Studio structure builder in sanity.config.ts for nested camp > sub-pages hierarchy
    status: completed
  - id: new-queries
    content: Add CAMP_SURF_PAGE, CAMP_ROOMS_PAGE, CAMP_FOOD_PAGE GROQ queries and simplify CAMP_BY_SLUG
    status: completed
  - id: new-data-fns
    content: Add getCampSurfPage/getCampRoomsPage/getCampFoodPage functions in sanity-data.ts
    status: completed
  - id: update-astro-pages
    content: Update all 6 Astro sub-page files (EN + DE) to use new data fetchers
    status: completed
  - id: migration-script
    content: Create and run migration script to move existing sub-page content from camp documents to new documents
    status: completed
  - id: verify
    content: Test all camp sub-pages load correctly in both EN and DE, verify translation works independently per sub-page
    status: completed
isProject: false
---

# Split Camp Sub-Pages Into Separate Sanity Documents

## Architecture Change

```mermaid
graph TD
  subgraph current [Current: Single Document]
    CampDoc["camp document"]
    CampDoc --> Overview["pageBuilder (Overview)"]
    CampDoc --> SurfTab["surfPageBuilder (tab)"]
    CampDoc --> RoomsTab["roomsPageBuilder (tab)"]
    CampDoc --> FoodTab["foodPageBuilder (tab)"]
  end

  subgraph proposed [Proposed: Separate Documents]
    Camp["camp document"]
    Surf["campSurfPage document"]
    Rooms["campRoomsPage document"]
    Food["campFoodPage document"]
    Surf -->|"references"| Camp
    Rooms -->|"references"| Camp
    Food -->|"references"| Camp
  end
```



## New Sanity Schemas

### 1. `campSurfPage` schema ([sanity/schemas/campSurfPage.ts](sanity/schemas/campSurfPage.ts))

- `language` (string, hidden)
- `camp` (reference to `camp`, required) — the parent camp
- `heroTitle` (string) — override for surf hero headline
- `pageBuilder` (array) — same blocks currently in `surfPageBuilder`: surfIntro, surfForecast, surfSpots, surfLevels, surfSchedule, surfEquipment + universal blocks
- `seo` (seo type)

### 2. `campRoomsPage` schema ([sanity/schemas/campRoomsPage.ts](sanity/schemas/campRoomsPage.ts))

- Same structure: `camp` reference, `heroTitle`, `pageBuilder` with roomTypes, roomInclusions, roomFacilities + universal blocks, `seo`

### 3. `campFoodPage` schema ([sanity/schemas/campFoodPage.ts](sanity/schemas/campFoodPage.ts))

- Same structure: `camp` reference, `heroTitle`, `pageBuilder` with foodIntro, mealCards, menuTable, dietaryOptions + universal blocks, `seo`

## Clean Up Camp Schema

In [sanity/schemas/camp.ts](sanity/schemas/camp.ts):

- Remove `surfPageBuilder`, `roomsPageBuilder`, `foodPageBuilder` fields
- Remove `surfHeroTitle`, `roomsHeroTitle`, `foodHeroTitle` fields
- Remove the `surfPage`, `roomsPage`, `foodPage` groups
- Keep only `overview` and `seo` groups

## Update Studio Structure

In [sanity.config.ts](sanity.config.ts), update the structure builder so camps display as a nested hierarchy:

- Camps > [Camp Name] > Overview / Surf / Rooms / Food

This makes it intuitive — click a camp, see its sub-pages listed underneath.

## New GROQ Queries

In [src/lib/queries.ts](src/lib/queries.ts):

- Add `CAMP_SURF_PAGE` query: fetches `campSurfPage` by camp slug + language, dereferences the parent camp for shared data (name, country, heroImages, bookingUrl, etc.)
- Add `CAMP_ROOMS_PAGE` and `CAMP_FOOD_PAGE` similarly
- Simplify `CAMP_BY_SLUG` — remove surfPageBuilder/roomsPageBuilder/foodPageBuilder projections

## New Data Functions

In [src/lib/sanity-data.ts](src/lib/sanity-data.ts):

- Add `getCampSurfPage(campSlug, lang)`, `getCampRoomsPage(campSlug, lang)`, `getCampFoodPage(campSlug, lang)`
- Simplify `getCampBySlug` — no longer needs to attach sub-page builders

## Update Astro Pages

Update the 6 sub-page files to use the new fetchers:

- [src/pages/surfcamp/[country]/[camp]/surf.astro](src/pages/surfcamp/[country]/[camp]/surf.astro) — call `getCampSurfPage(camp)` instead of extracting from camp data
- [src/pages/surfcamp/[country]/[camp]/rooms.astro](src/pages/surfcamp/[country]/[camp]/rooms.astro)
- [src/pages/surfcamp/[country]/[camp]/food.astro](src/pages/surfcamp/[country]/[camp]/food.astro)
- Same for DE versions in `src/pages/de/surfcamp/...`

## Data Migration

Create a one-time migration script ([sanity/migrate-subpages.mjs](sanity/migrate-subpages.mjs)) that:

1. Fetches all existing camp documents
2. For each camp that has `surfPageBuilder` / `roomsPageBuilder` / `foodPageBuilder` content, creates the corresponding new sub-page documents
3. Copies the page builder arrays and hero titles to the new documents
4. Preserves `_key` values on blocks so references stay intact
5. Links translation metadata if German versions exist

## Register New Types

In [sanity/schemas/index.ts](sanity/schemas/index.ts), register the 3 new schema types and add them to the document internationalization plugin config.