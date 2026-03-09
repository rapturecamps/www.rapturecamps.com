---
name: Blog Category Restructuring
overview: Replace "Inspiration" with 7 focused topic categories, keep country categories as-is, distribute generic "Surfing" posts, and use a lean "Surf Travel" category for worldwide-only content while country categories handle destination-specific posts.
todos:
  - id: create-categories
    content: Create 7 new topic blogCategory documents in Sanity
    status: completed
  - id: build-mapping
    content: Parse CSV, build slug-to-category mapping with distribution rules for Surfing/Guide to Nature/Travel
    status: completed
  - id: classify-unmatched
    content: AI-classify the 35 posts not in CSV
    status: completed
  - id: generate-review-csv
    content: Generate review CSV with all 331 posts and their proposed assignments for user approval
    status: completed
  - id: apply-en
    content: Apply topic category assignments to all EN posts and remove Inspiration references
    status: completed
  - id: apply-de
    content: Copy topic category references to DE translations via translation.metadata
    status: completed
  - id: cleanup
    content: Delete Inspiration category, add redirects, fix hardcoded references
    status: completed
isProject: false
---

# Blog Category Restructuring

## Final Category Structure

### Topic Categories (new -- replace "Inspiration")


| Category                  | Slug                      | ~Posts | Content                                                                                   |
| ------------------------- | ------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| Surf Science & Conditions | `surf-science-conditions` | 20     | Waves, tides, swells, forecasts, surf reports                                             |
| Surf Health & Safety      | `surf-health-safety`      | 19     | Injuries, sunscreen, etiquette, safety tips, diet                                         |
| Surf Culture & Lifestyle  | `surf-culture-lifestyle`  | 25     | History, lingo, movies, legends, alt surf styles (foil, windsurf)                         |
| Surf Fitness & Training   | `surf-fitness-training`   | 9      | Yoga, workouts, swim skills, surf skate                                                   |
| Surf Equipment & Gear     | `surf-equipment-gear`     | 30     | Boards, wetsuits, accessories, packing                                                    |
| Learn to Surf             | `learn-to-surf`           | 22     | Beginner tips, pop-ups, duck diving, surf lessons                                         |
| Surf Travel               | `surf-travel`             | 28     | Worldwide/multi-destination posts only (best surf camps, budget trips, family surf trips) |


### Country Categories (keep unchanged)

Bali, Costa Rica, Portugal, Morocco, Nicaragua -- these handle all destination-specific content. Posts about "Surf Spots in Bali" or "Things to Do in Ericeira" stay in their country category.

### Dual Tagging

Posts get one topic category + one country category where applicable:

- "How to Wax a Surfboard" -> Surf Equipment & Gear (no country)
- "Best Surf Spots in Bali" -> Surf Travel + Bali
- "10 Best Places to Surf in 2025" -> Surf Travel (no country -- worldwide)
- "Surfing Safely in Bali" -> Surf Health & Safety + Bali

### "Surfing" (generic) Distribution

The 18 posts currently in the CSV's "Surfing" silo get distributed:

- **Learn to Surf:** "6 Ways to Improve Surfing Skills", "6 Best Tips for Beginner Surfers", "Learning to Surf: A Beginners Guide", "7 Things You Should Know Before You Learn To Surf", "From Wipeouts To Wave Riding", "Is Surfing Hard?", "Do Surfers Struggle On Surfboards?"
- **Surf Culture & Lifestyle:** "Foil Surfing", "Windsurfing", "Bodyboarding", "Longboard Surf", "Surfing at the Paris Olympics", "What Is A Kook", "Goofy Foot Surfing", "New Year's Resolutions for Surfers"
- **Surf Equipment & Gear:** "Best Surf Bikinis"
- **Surf Travel + Bali:** "Surfing in Green Bowl", "Beginners Paradise: Bali's Off-Peak Season"

### "Guide to Nature" (11 posts)

Keep in their existing country categories (Costa Rica, Bali). Add **Surf Travel** as topic category since they're destination activity content.

### 35 Posts Not in CSV

AI classifies these into best-fit topic category based on title. Most are drafts or near-duplicates already in the CSV under different status.

## Redirects

- `/blog/category/inspiration/` -> `/blog/` (301)
- `/de/blog/category/inspiration/` -> `/de/blog/` (301)

No other redirects needed. Country category URLs unchanged. New topic categories are new URLs.

## Execution Steps

### 1. Create 7 `blogCategory` documents

Script to create all 7 with name, slug, description.

### 2. Build assignment mapping

- Parse CSV, map each silo to new category using rules above
- For "Surf Travel & Destinations" posts: if Hub = country name, assign topic = **Surf Travel** only for "Worldwide" hub; otherwise just keep country category
- For "Surfing" posts: use the manual distribution above
- For 35 unmatched posts: AI classification

### 3. Generate review CSV

Output: `Title, Slug, Current Categories, New Topic Category, Keep Country Category` for user review before applying.

### 4. Apply to EN posts

- Add new topic category reference
- Remove "Inspiration" reference
- Keep country category references

### 5. Apply to DE translations

Copy topic category references via `translation.metadata`.

### 6. Clean up

- Delete "Inspiration" category document (`EGTY8reZ9ETSV34nvD3nul`)
- Add 2 redirects
- Update hardcoded "Inspiration" refs in `[src/components/sections/BlogFeed.tsx](src/components/sections/BlogFeed.tsx)` and `[src/pages/linkin-bio.astro](src/pages/linkin-bio.astro)`

