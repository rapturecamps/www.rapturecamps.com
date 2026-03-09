---
name: AI SEO Toolkit
overview: Build 9 AI-powered SEO tools into Sanity Studio, all leveraging Claude API. Grouped into Document Actions (per-page tools), Custom Studio Tools (site-wide dashboards), and a Publish Gate -- all following the proven translate action architecture.
todos:
  - id: shared-infra
    content: "Build shared infrastructure: _seo-shared.ts (Sanity client, content extraction, Claude factory), seoActions.tsx (shared UI components), seoInsight.ts schema"
    status: completed
  - id: meta-generator
    content: "Feature 1: AI Meta Tag Generator -- API route seo-meta.ts + document action generateMetaAction.tsx"
    status: completed
  - id: seo-scoring
    content: "Feature 3: Content Quality Scoring -- API route seo-score.ts + document action seoScoreAction.tsx"
    status: completed
  - id: internal-links
    content: "Feature 2: Internal Link Suggestions -- API route seo-links.ts + document action suggestLinksAction.tsx"
    status: completed
  - id: alt-text
    content: "Feature 4: Alt Text Generator -- API route seo-alt.ts + custom input component AltTextGenerator.tsx"
    status: completed
  - id: publish-gate
    content: "Feature 8: On-Publish SEO Gate -- API route seo-precheck.ts + action seoPublishAction.tsx"
    status: completed
  - id: content-brief
    content: "Feature 5: Content Brief Generator -- API route seo-brief.ts + Studio tool ContentBriefTool.tsx"
    status: completed
  - id: seo-dashboard
    content: "Feature 6: Site-Wide SEO Dashboard -- API route seo-dashboard.ts + Studio tool SeoDashboardTool.tsx"
    status: completed
  - id: competitor
    content: "Feature 7: Competitor Analysis -- API route seo-competitor.ts + Studio tool CompetitorTool.tsx"
    status: completed
  - id: register-all
    content: Register all actions + tools in sanity.config.ts and test end-to-end
    status: completed
isProject: false
---

# AI SEO Toolkit for Sanity Studio

## Architecture

All features follow the same proven pattern as the existing translation system:

```
Sanity Studio (React UI) --> POST /api/seo-* --> Claude API + Sanity Read --> Response
```

**Shared infrastructure to build first:**
- `src/pages/api/_seo-shared.ts` -- shared Sanity client, content extraction helpers, Claude client factory (reused across all API routes)
- `sanity/actions/seoActions.tsx` -- shared UI components (loading spinner, result cards, score badges) used by all document actions
- `sanity/schemas/seoInsight.ts` -- new document type to persist analysis results for the dashboard

**Registration pattern:** All document actions registered in `sanity.config.ts` alongside `TranslateAction`. Studio tools registered as plugins.

---

## Group 1: Document Actions (per-page, toolbar buttons)

### 1. AI Meta Tag Generator
**Action button:** "Generate Meta Tags" on all content types with an `seo` field
**API route:** `src/pages/api/seo-meta.ts`
**Flow:**
- Extract page title, headings, body text from the current document
- Send to Claude with prompt: generate an SEO-optimized `metaTitle` (max 60 chars) and `metaDescription` (max 160 chars) targeting surf camp keywords
- Show preview in dialog with character counts
- On confirm, patch the document's `seo.metaTitle` and `seo.metaDescription` via Sanity write API
**UI:** Dialog with editable preview fields + "Apply" button
**Effort:** Low -- closest to existing translate pattern

### 2. Internal Link Suggestions
**Action button:** "Suggest Internal Links" on blog posts, camp pages, and content pages
**API route:** `src/pages/api/seo-links.ts`
**Flow:**
- Fetch the current document's body text (Portable Text -> plain text)
- Fetch all published pages site-wide via GROQ: `*[_type in ["camp", "country", "blogPost", "campSurfPage", "campRoomsPage", "campFoodPage", "page"] && (language == "en" || !defined(language))] { _type, title, name, "slug": slug.current, "url": ... }`
- Send both to Claude: "Identify phrases in this content that should link to these internal pages. Return [{phrase, targetUrl, reason}]"
- Display results as a checklist in a dialog
**UI:** Scrollable list of suggestions with the phrase highlighted, target page, and reason. Each has a copy button for the URL.
**Effort:** Low-Medium

### 3. Content Quality / SEO Scoring
**Action button:** "SEO Check" on all content types
**API route:** `src/pages/api/seo-score.ts`
**Flow:**
- Extract: title, meta title/description, body text, heading structure, image count + alt text coverage, internal link count, word count
- Send structured data to Claude: "Score this page's SEO on a scale of 1-10 across these categories and provide specific recommendations"
- Categories: Keyword Optimization, Content Depth, Heading Structure, Meta Tags, Internal Links, Image SEO, Readability
**UI:** Scorecard dialog with colored progress bars per category (green/yellow/red), overall score, and expandable recommendation sections
**Effort:** Medium

### 4. Alt Text Generator
**Implementation:** Custom Input Component on image fields (not a document action)
**File:** `sanity/components/AltTextGenerator.tsx` -- wraps the default image input, adds a "Generate Alt Text" button
**API route:** `src/pages/api/seo-alt.ts`
**Flow:**
- When button clicked, send the image URL + surrounding content context to Claude
- Claude returns contextual alt text (not just "a photo of a beach" but "Surfers walking toward the lineup at Padang Padang reef break in Bali")
- Show preview, user can edit before applying
**Registration:** Override image field in relevant schemas or create a custom `imageWithAlt` object type
**Effort:** Low-Medium

---

## Group 2: Custom Studio Tools (sidebar tabs)

These appear as top-level tabs in Sanity Studio alongside "Content", "Media", "Vision".

### 5. Content Brief Generator
**Tool name:** "Content Briefs" tab in Studio
**File:** `sanity/tools/ContentBriefTool.tsx`
**API route:** `src/pages/api/seo-brief.ts`
**Flow:**
- Input form: target keyword, content type (blog post / landing page / FAQ), target audience
- Fetch existing site content via GROQ to understand what's already covered
- Send to Claude: "Generate a content brief for [keyword] considering existing content on the site"
- Claude returns: suggested title, H1, H2/H3 outline, key topics, target word count, internal pages to link to/from, competitor angles
**UI:** Form input at top, generated brief below with copy/export functionality
**Effort:** Medium

### 6. Site-Wide SEO Dashboard
**Tool name:** "SEO Dashboard" tab in Studio
**File:** `sanity/tools/SeoDashboardTool.tsx`
**API route:** `src/pages/api/seo-dashboard.ts`
**Storage:** Results stored in `seoInsight` documents (one per audit run)
**Flow:**
- "Run Audit" button fetches ALL content via GROQ
- Sends batched content to Claude for analysis
- Categories checked:
  - Pages with missing/weak meta descriptions
  - Orphan pages (no internal links pointing to them -- cross-reference body content)
  - Thin content (word count below threshold)
  - Keyword cannibalization (multiple pages targeting same terms)
  - Content freshness (last updated dates)
  - Missing alt text on images
  - Heading hierarchy issues
- Results stored in `seoInsight` document for persistence
**UI:** Dashboard with summary cards at top (score, issues found), filterable table of issues grouped by category, click-through to edit each page
**Effort:** Medium-High (largest feature)

### 7. Competitor Content Analysis
**Tool name:** "Competitor Analysis" tab in Studio (or sub-tab within SEO Dashboard)
**File:** `sanity/tools/CompetitorTool.tsx`
**API route:** `src/pages/api/seo-competitor.ts`
**Flow:**
- Input: competitor URL (e.g., `https://www.perfectwavetravel.com/surf-camps/bali`)
- API route fetches the HTML via `fetch()`, strips to text content
- Fetches your corresponding page content from Sanity
- Sends both to Claude: "Compare these two pages. What does the competitor cover that we don't? What keywords are they targeting? What content structure do they use?"
- Returns: content gaps, keyword opportunities, structural suggestions
**UI:** Side-by-side comparison view with your content vs. competitor highlights
**Effort:** Medium-High (HTML fetching + parsing adds complexity)

---

## Group 3: Publish Workflow

### 8. On-Publish SEO Gate
**Implementation:** Custom publish action that wraps the default
**File:** `sanity/actions/seoPublishAction.tsx`
**API route:** `src/pages/api/seo-precheck.ts`
**Flow:**
- Intercepts the publish action
- Runs a lightweight SEO check (faster than full audit): meta tags set? H1 present? Min word count? At least 1 internal link?
- Shows results in a dialog:
  - All green: "SEO looks good! Publish?" with publish button
  - Warnings: "2 SEO issues found" with details + "Publish anyway" / "Fix first" buttons
- Does NOT block publish -- warnings only, user can always proceed
**Registration:** Replace default publish action for content types in `sanity.config.ts`
**Effort:** Medium

---

## File Structure

```
sanity/
  actions/
    translateAction.tsx        (existing)
    seoActions.tsx             (shared UI components for SEO actions)
    generateMetaAction.tsx     (Feature 1)
    suggestLinksAction.tsx     (Feature 2)
    seoScoreAction.tsx         (Feature 3)
    seoPublishAction.tsx       (Feature 8)
  components/
    PathInput.tsx              (existing)
    AltTextGenerator.tsx       (Feature 4)
  tools/
    ContentBriefTool.tsx       (Feature 5)
    SeoDashboardTool.tsx       (Feature 6)
    CompetitorTool.tsx         (Feature 7)
  schemas/
    seoInsight.ts              (new - stores dashboard results)

src/pages/api/
  translate.ts                 (existing)
  seo-meta.ts                  (Feature 1)
  seo-links.ts                 (Feature 2)
  seo-score.ts                 (Feature 3)
  seo-alt.ts                   (Feature 4)
  seo-brief.ts                 (Feature 5)
  seo-dashboard.ts             (Feature 6)
  seo-competitor.ts            (Feature 7)
  seo-precheck.ts              (Feature 8)
  _seo-shared.ts               (shared utilities)
```

## Implementation Order

Build in this sequence to maximize reuse and test incrementally:

1. **Shared infrastructure** (`_seo-shared.ts`, `seoActions.tsx`, `seoInsight.ts`)
2. **Meta Tag Generator** -- simplest, validates the pattern
3. **Content Quality Scoring** -- builds on content extraction from #2
4. **Internal Link Suggestions** -- adds site-wide content fetching
5. **Alt Text Generator** -- standalone custom component
6. **On-Publish SEO Gate** -- reuses scoring logic from #3
7. **Content Brief Generator** -- first Studio tool
8. **SEO Dashboard** -- combines everything into site-wide view
9. **Competitor Analysis** -- adds external HTML fetching

## Key Decisions

- **Claude model:** Use `claude-sonnet-4-20250514` (same as translate) for all features -- good balance of quality/speed/cost
- **Max tokens:** 4096 for meta/alt/links, 8192 for scoring/briefs/dashboard
- **Rate limiting:** Each API route should have basic error handling for Claude rate limits
- **Storage:** Dashboard results stored in `seoInsight` documents; per-page actions are ephemeral (results shown in dialog, applied on confirm)
- **Schema types for actions:** Meta Generator + SEO Score + Links apply to all content types with `seo` field. Alt Text applies to all image fields. Publish gate applies to all i18n types.
