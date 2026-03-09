---
name: Blog Category Restructuring
overview: Create 6 new topic-based blog categories and assign all ~331 blog posts to them using AI classification, while keeping existing country categories intact for CTASection linking.
todos:
  - id: create-categories
    content: Create 6 new topic blogCategory documents in Sanity
    status: pending
  - id: classify-csv
    content: AI-classify all 331 posts and generate CSV for review
    status: pending
  - id: apply-assignments
    content: Apply approved topic category assignments to all posts (EN + DE)
    status: pending
  - id: remove-inspiration
    content: Remove Inspiration category from posts and delete the category document
    status: pending
  - id: fix-hardcoded
    content: Update hardcoded 'Inspiration' references in BlogFeed.tsx and linkin-bio.astro
    status: pending
isProject: false
---

# Blog Category Restructuring

## Current State

- **6 categories** exist: Bali (48), Costa Rica (39), Inspiration (213), Portugal (45), Morocco (5), Nicaragua (17), plus 1 uncategorized
- 331 EN blog posts total; 306 have a single category, 24 have multiple
- Country categories (Bali, Costa Rica, etc.) are used by `CTASection` on camp/country pages to link to related blog posts via `/blog/category/{slug}`
- "Inspiration" is a catch-all with 213 posts covering a wide range of topics

## Plan

### 1. Create the 6 new topic categories in Sanity

Create `blogCategory` documents for:


| Name                       | Slug                       |
| -------------------------- | -------------------------- |
| Surf Science & Conditions  | `surf-science-conditions`  |
| Surf Health & Safety       | `surf-health-safety`       |
| Surf Culture & Lifestyle   | `surf-culture-lifestyle`   |
| Surf Equipment & Gear      | `surf-equipment-gear`      |
| Learn to Surf              | `learn-to-surf`            |
| Surf Travel & Destinations | `surf-travel-destinations` |


### 2. Keep country categories

The country categories (Bali, Costa Rica, Portugal, Morocco, Nicaragua) remain untouched. They serve a different purpose -- linking country/camp pages to relevant blog content via `CTASection`. Posts will have **both** a country category and a topic category.

### 3. AI-classify all posts and generate CSV for review

Run a script that:

- Fetches all 331 EN blog posts (title, excerpt, current categories)
- Uses AI (Claude or GPT) to suggest the best-fit topic category for each post
- Outputs a CSV: `Post Title, Slug, Current Categories, Suggested Topic Category`
- You review and adjust before applying

### 4. Apply category assignments

After CSV approval, run a script to:

- **Add** the new topic category reference to each post (not replace existing country categories)
- Apply to both EN and DE translations via `translation.metadata`

### 5. Remove "Inspiration" category

Once all former "Inspiration" posts have been reassigned to topic categories:

- Remove the "Inspiration" category reference from all posts
- Delete the "Inspiration" `blogCategory` document

### 6. Update hardcoded references

- [src/components/sections/BlogFeed.tsx](src/components/sections/BlogFeed.tsx) -- has hardcoded `category: "Inspiration"`
- [src/pages/linkin-bio.astro](src/pages/linkin-bio.astro) -- has hardcoded `category: "Inspiration"`

## What stays the same

- `blogCategory` schema (no changes needed)
- `blogPost.categories` field (still array of references)
- GROQ queries (no changes)
- Frontend category pages, pills, and filtering (all work with slugs automatically)
- `CTASection` country linking (unchanged)

