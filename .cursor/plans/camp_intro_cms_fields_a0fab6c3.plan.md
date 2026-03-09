---
name: Camp intro CMS fields
overview: Add CMS fields for the camp overview intro section (description text and sidebar stats) and display amenities, so the hardcoded intro block is fully editable from Sanity while staying at the top of every camp page.
todos:
  - id: add-camp-fields
    content: Add introText, surfLevels, minStay, groupSize, languages fields to camp schema
    status: completed
  - id: update-query
    content: Add new fields to CAMP_BY_SLUG GROQ query
    status: completed
  - id: update-en-template
    content: Update EN camp overview intro section to use CMS data + show amenities
    status: completed
  - id: update-de-template
    content: Update DE camp overview intro section similarly
    status: completed
isProject: false
---

# Camp Overview Intro — CMS Editable

## Problem

The intro section at the top of camp overview pages (`/surfcamp/[country]/[camp]`) has hardcoded description text and sidebar stats. Amenities from the CMS are also not displayed.

## Schema Changes — `sanity/schemas/camp.ts`

Add the following fields to the `overview` group:

- **`introText`** (type: `text`, rows: 6) — Rich description text for the left column. Falls back to the current generic text if empty.
- **`surfLevels`** (type: `string`) — e.g. "All Levels", "Intermediate+". Default: "All Levels"
- **`minStay`** (type: `string`) — e.g. "3 nights", "7 nights". Default: "3 nights"
- **`groupSize`** (type: `string`) — e.g. "Max 5:1 ratio". Default: "Max 5:1 ratio"
- **`languages`** (type: `string`) — e.g. "EN, DE, PT, ES". Default: "EN, DE, PT, ES"

These go in a new fieldset `introSection` (collapsible, titled "Intro Section") to keep the schema tidy.

## Query Change — `src/lib/queries.ts`

Add `introText, surfLevels, minStay, groupSize, languages` to the `CAMP_BY_SLUG` projection (they'll be auto-included by the `...` spread in pageBuilder, but need to be explicitly listed at the top-level camp query).

## Template Changes — `src/pages/surfcamp/[country]/[camp]/index.astro`

In the intro `<section>` (lines 130-188):

- **Left column**: Replace the two hardcoded `<p>` tags with `campData.introText` (split on double newline for paragraphs), falling back to the current hardcoded text
- **Sidebar stats**: Replace hardcoded values with `campData.surfLevels`, `campData.minStay`, `campData.groupSize`, `campData.languages` — each with sensible defaults
- **Amenities**: Render `campData.amenities` as a row of tags/pills below the sidebar stats card (or below the intro text), similar to how they appear on country camp cards

## DE Template — `src/pages/de/surfcamp/[country]/[camp]/index.astro`

Apply the same CMS-driven intro pattern so German camp overview pages also show editable content.

## No migration needed

All new fields are optional with sensible template-level fallbacks, so existing camps continue to work unchanged.
