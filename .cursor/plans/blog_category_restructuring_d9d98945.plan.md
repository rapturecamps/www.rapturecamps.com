---
name: Blog Category Restructuring
overview: Replace the "Inspiration" catch-all category with 8 focused topic categories that align with planned topic cluster landing pages, assign all 331 posts using the CSV mapping, and set up redirects -- all before starting translations.
todos:
  - id: create-8-categories
    content: Create 8 new topic blogCategory documents in Sanity
    status: pending
  - id: parse-csv-mapping
    content: Parse CSV and build slug-to-topic-category mapping, handle merges and AI classification for unmatched posts
    status: pending
  - id: review-csv
    content: Generate review CSV for user approval before applying
    status: pending
  - id: apply-en
    content: Apply topic category assignments to EN posts and remove Inspiration references
    status: pending
  - id: apply-de
    content: Copy topic category assignments to DE translations
    status: pending
  - id: delete-inspiration
    content: Delete Inspiration category document and add redirects
    status: pending
  - id: fix-hardcoded
    content: Update hardcoded Inspiration references in BlogFeed.tsx and linkin-bio.astro
    status: pending
isProject: false
---

# Blog Category Restructuring Before Translation

## Why Now

Restructuring before translation means each post is categorized correctly once. Doing it after would require re-categorizing 300+ posts across two languages.

## Current State

- 6 categories: Bali (48), Costa Rica (39), **Inspiration (213)**, Portugal (45), Morocco (5), Nicaragua (17)
- 195 posts have ONLY "Inspiration" as their category (no country tag)
- 18 posts have both "Inspiration" and a country category
- Category URLs: `/blog/category/{slug}/` -- all 6 are live and potentially indexed

## New Category Structure

8 topic categories (replacing "Inspiration"):

- **Surf Science & Conditions** (~20 posts)
- **Surf Health & Safety** (~25 posts)
- **Surf Culture & Lifestyle** (~20 posts)
- **Surf Fitness & Training** (~10 posts)
- **Surf Equipment & Gear** (~28 posts)
- **Learn to Surf** (~17 posts)
- **Surf Travel & Destinations** (~190 posts -- includes nature guides)
- ~~Surfing~~ -- the 21 generic "Surfing" posts from the CSV will be distributed into the 7 categories above (best fit)

**Kept as-is:** Country categories (Bali, Costa Rica, Portugal, Morocco, Nicaragua). Posts will have both a topic category AND a country category where applicable.

## Assignment Logic

```
CSV "Silo" column              -->  New Sanity Category
────────────────────────────────────────────────────────
Surf Science & Condittions      -->  Surf Science & Conditions
Surf Health & Safety            -->  Surf Health & Safety
Surf Culture & Lifestyle        -->  Surf Culture & Lifestyle
Surf Fitness & Training         -->  Surf Fitness & Training
Surf Equipment & Gear           -->  Surf Equipment & Gear
Learn to Surf                   -->  Learn to Surf
Surf Travel & Destinations      -->  Surf Travel & Destinations
Guide to Nature in Bali         -->  Surf Travel & Destinations
Guide to Nature in Costa Rica   -->  Surf Travel & Destinations
Surfing (generic)               -->  AI classifies into best-fit
(no silo in CSV / not in CSV)   -->  AI classifies into best-fit
```

Posts in "Surf Travel & Destinations" with a Hub value (Bali, Portugal, Costa Rica) also **keep** their existing country category.

## Redirects

Only 1 redirect needed:

- `/blog/category/inspiration/` --> `/blog/` (301)
- `/de/blog/category/inspiration/` --> `/de/blog/` (301)

All country category URLs remain unchanged. New topic category URLs are new pages (no redirect needed).

## Execution Steps

### 1. Create 8 `blogCategory` documents in Sanity

Script to create documents with `name`, `slug`, and `description`.

### 2. Parse CSV and match to Sanity posts

- Extract URL slug from each CSV row's URL column
- Map CSV silo to new category
- Only process rows with Status "Review" and a URL (existing published posts)
- For posts under generic "Surfing" or not in CSV: use AI classification based on title/excerpt

### 3. Generate review CSV

Before applying, output a CSV: `Title, Slug, Current Categories, New Topic Category` for user review.

### 4. Apply assignments

- **Add** new topic category reference to each post (don't remove country categories)
- **Remove** "Inspiration" reference from all posts that have it
- Apply to both EN posts directly

### 5. Apply to German translations

Use `translation.metadata` to find DE versions and copy the same topic category references.

### 6. Delete "Inspiration" category and add redirects

- Delete `blogCategory` document `EGTY8reZ9ETSV34nvD3nul`
- Add 2 redirects to `[vercel.json](vercel.json)` (or middleware)

### 7. Update hardcoded references

- `[src/components/sections/BlogFeed.tsx](src/components/sections/BlogFeed.tsx)` -- hardcoded `category: "Inspiration"`
- `[src/pages/linkin-bio.astro](src/pages/linkin-bio.astro)` -- hardcoded `category: "Inspiration"`

## What stays unchanged

- `blogCategory` schema (`[sanity/schemas/blogCategory.ts](sanity/schemas/blogCategory.ts)`) -- no changes needed
- `blogPost.categories` field -- still array of references
- All GROQ queries -- work with any categories
- Frontend blog pages, category filtering, pills -- all driven by slugs, auto-adapt
- `CTASection` country linking -- unchanged

