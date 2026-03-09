---
name: Blog Category Restructuring
overview: Create 6 new topic-based blog categories, assign posts based on the user's CSV mapping, and handle remaining posts (generic "Surfing", "Surf Fitness & Training", nature guides) with sensible defaults.
todos:
  - id: create-categories
    content: Create 6 new topic blogCategory documents in Sanity
    status: pending
  - id: build-mapping
    content: Parse CSV and build slug-to-topic-category mapping with merge rules
    status: pending
  - id: assign-posts
    content: Match Sanity posts to CSV, assign topic categories, AI-classify unmatched/generic posts
    status: pending
  - id: generate-report
    content: Generate CSV report of all assignments for user review before applying
    status: pending
  - id: apply-de
    content: Apply topic category assignments to German translations via translation.metadata
    status: pending
  - id: remove-inspiration
    content: Remove Inspiration category from all posts and delete the category document
    status: pending
  - id: fix-hardcoded
    content: Update hardcoded Inspiration references in BlogFeed.tsx and linkin-bio.astro
    status: pending
isProject: false
---

# Blog Category Restructuring (CSV-Driven)

## Current State

- 6 categories: Bali (48), Costa Rica (39), Inspiration (213), Portugal (45), Morocco (5), Nicaragua (17)
- 331 EN posts, 1 uncategorized
- Country categories used by `CTASection` for camp/country page cross-linking

## Source of Truth

The user's CSV (`Topic Cluster_Sheet1.csv`) provides explicit silo assignments for ~370 rows (including drafts/ideas not yet in Sanity). Only rows with Status "Review" and a URL are existing published posts that need category assignment.

## New Categories to Create


| Name                       | Slug                       | Approx Posts (from CSV)                         |
| -------------------------- | -------------------------- | ----------------------------------------------- |
| Surf Science & Conditions  | `surf-science-conditions`  | ~20                                             |
| Surf Health & Safety       | `surf-health-safety`       | ~25 (includes "Surf Fitness & Training" posts)  |
| Surf Culture & Lifestyle   | `surf-culture-lifestyle`   | ~20                                             |
| Surf Equipment & Gear      | `surf-equipment-gear`      | ~28                                             |
| Learn to Surf              | `learn-to-surf`            | ~17                                             |
| Surf Travel & Destinations | `surf-travel-destinations` | ~190 (includes country sub-hubs, nature guides) |


## Merging Decisions

- **"Surf Fitness & Training"** (10 posts: yoga, workouts, swimming skills, surf skate) -- merged into **Surf Health & Safety** (closely related health/fitness content)
- **"Surfing"** (21 generic posts: "Is Surfing Hard?", "Foil Surfing", etc.) -- classified by AI into best-fit topic category
- **"Guide to Nature in Bali/Costa Rica"** (17 posts: volcano hikes, whale watching, waterfalls) -- assigned to **Surf Travel & Destinations** (destination-related activity content)

## Execution Steps

### 1. Create 6 new `blogCategory` documents in Sanity

Simple script to create the documents with name, slug, and description.

### 2. Build slug-to-category mapping from CSV

- Parse the CSV, extract URL slugs and silo assignments
- Map each silo name to the corresponding new category
- Handle merges (Fitness -> Health & Safety, Nature Guides -> Travel & Destinations)

### 3. Match CSV to Sanity posts and assign

- Fetch all EN blog posts from Sanity with their current categories and slugs
- For each post: look up the CSV mapping by slug
- **Add** the new topic category as a reference (keep existing country categories)
- For posts in the generic "Surfing" silo or not in CSV: use AI to suggest best-fit
- Generate a CSV report showing all assignments for review

### 4. Apply to German translations

Use `translation.metadata` to find DE versions and copy the new topic category references.

### 5. Remove "Inspiration" category

- Remove "Inspiration" reference from all posts that have it
- Delete the `blogCategory` document (id: `EGTY8reZ9ETSV34nvD3nul`)

### 6. Update hardcoded references

- `[src/components/sections/BlogFeed.tsx](src/components/sections/BlogFeed.tsx)` -- replace hardcoded `category: "Inspiration"`
- `[src/pages/linkin-bio.astro](src/pages/linkin-bio.astro)` -- replace hardcoded `category: "Inspiration"`

## What stays unchanged

- Country categories (Bali, Costa Rica, Portugal, Morocco, Nicaragua) remain
- `blogCategory` schema, `blogPost.categories` field, GROQ queries, frontend pages -- all unchanged
- Posts can have multiple categories (one country + one topic)

