---
name: SEO landing pages
overview: Create 3 SEO landing pages in both DE and EN (6 pages total), using the existing BlogLayout, plus update the slug mapping and cross-link them with existing content.
todos:
  - id: slug-map
    content: Add 3 new slug mappings to i18n/utils.ts
    status: completed
  - id: page-1-de
    content: "Create DE page: grilltisch-kaufen.astro"
    status: completed
  - id: page-1-en
    content: "Create EN page: buying-a-grill-table.astro"
    status: completed
  - id: page-2-de
    content: "Create DE page: grilltisch-vs-klassischer-grill.astro"
    status: completed
  - id: page-2-en
    content: "Create EN page: grill-table-vs-traditional-grill.astro"
    status: completed
  - id: page-3-de
    content: "Create DE page: grillen-auf-balkon-und-terrasse.astro"
    status: completed
  - id: page-3-en
    content: "Create EN page: grilling-on-balcony-and-patio.astro"
    status: completed
  - id: cross-links
    content: Update related articles on existing blog posts to cross-link new pages
    status: completed
  - id: commit
    content: Build, commit and push
    status: completed
isProject: false
---

# Create 3 SEO Landing Pages (DE + EN)

## Pages to Create

### Page 1: Buyer's Guide -- "Grilltisch kaufen"

- DE: `/de/grilltisch-kaufen/` -- `astro/src/pages/de/grilltisch-kaufen.astro`
- EN: `/en/buying-a-grill-table/` -- `astro/src/pages/en/buying-a-grill-table.astro`
- Hero image: `/images/blog/garten-tisch-grill-kaufen.webp`
- Target keywords: "Grilltisch kaufen", "Tisch mit Grill kaufen", "Grilltisch Holzkohle"
- Content structure:
  - Intro: why grill tables are gaining popularity
  - What is a grill table? (explanation for newcomers)
  - 5 things to consider when buying (material, size, fuel type, safety, multifunctionality)
  - Each point naturally highlights Buqon DINE advantages
  - CTA to contact form
  - Related articles section linking to the other 5 blog posts

### Page 2: Comparison -- "Grilltisch vs. klassischer Grill"

- DE: `/de/grilltisch-vs-klassischer-grill/` -- `astro/src/pages/de/grilltisch-vs-klassischer-grill.astro`
- EN: `/en/grill-table-vs-traditional-grill/` -- `astro/src/pages/en/grill-table-vs-traditional-grill.astro`
- Hero image: `/images/grillabend-mit-freunden.webp`
- Target keywords: "Grilltisch vs Grill", "Grilltisch Vergleich", "Grilltisch Vorteile"
- Content structure:
  - Intro: the dilemma -- classic grill or grill table?
  - Side-by-side comparison across 6-7 criteria (space, social aspect, safety, versatility, cleaning, price-value)
  - When a classic grill makes sense (e.g., smoking, low-and-slow)
  - When a grill table wins (entertaining, small spaces, shared experience)
  - Verdict with CTA
  - Related articles section

### Page 3: Use-Case -- "Grillen auf Balkon und Terrasse"

- DE: `/de/grillen-auf-balkon-und-terrasse/` -- `astro/src/pages/de/grillen-auf-balkon-und-terrasse.astro`
- EN: `/en/grilling-on-balcony-and-patio/` -- `astro/src/pages/en/grilling-on-balcony-and-patio.astro`
- Hero image: `/images/blog/gartentisch-set-grill.webp`
- Target keywords: "Grillen auf dem Balkon", "Grillen Terrasse", "Platzsparender Grill Balkon"
- Content structure:
  - Intro: grilling in limited space
  - Legal situation in DACH (when is balcony grilling allowed?)
  - Space-saving solutions (Buqon = table + grill in one)
  - Tips for grilling on balcony/patio (wind, neighbors, safety)
  - Why a grill table is ideal for small spaces
  - CTA
  - Related articles section

## Code Changes Required

### 1. Add slug mappings in `astro/src/i18n/utils.ts`

Add 3 new entries to `slugMap`:

- `"grilltisch-kaufen": "buying-a-grill-table"`
- `"grilltisch-vs-klassischer-grill": "grill-table-vs-traditional-grill"`
- `"grillen-auf-balkon-und-terrasse": "grilling-on-balcony-and-patio"`

### 2. Create 6 page files

All use `BlogLayout` with `heroImage`, `title`, `description`, `publishDate`. Follow the exact structure of existing blog posts like `sicherheit-beim-grillen.astro`.

### 3. Cross-link with existing content

Each new page gets a "Related Articles" section linking to 2 other relevant pages. Also update the existing 3 blog posts' related articles sections to include links to the new pages where relevant.

### 4. Commit and push

