---
name: WP Image Blog Migration
overview: Migrate ~2,500 WordPress images to Sanity using sanity-plugin-media for tagging/browsing, then migrate ~300 blog posts with HTML-to-Portable-Text conversion and image remapping.
todos:
  - id: install-deps
    content: Install sanity-plugin-media, sharp, and node-html-parser
    status: completed
  - id: configure-media-plugin
    content: Add media() plugin to sanity.config.ts, hide media.tag from sidebar
    status: completed
  - id: build-image-script
    content: Build sanity/migrate-wp-images.mjs -- fetch WP media, pre-create tags, resize with sharp, upload to Sanity, tag assets, save mapping file
    status: completed
  - id: run-image-migration
    content: Run the image migration script and verify results in Sanity Studio Media browser
    status: completed
  - id: create-blog-categories
    content: Create blogCategory documents in Sanity from WordPress categories
    status: pending
  - id: build-blog-script
    content: Build sanity/migrate-wp-posts.mjs -- convert HTML to Portable Text, map images, create blog documents
    status: completed
  - id: run-blog-migration
    content: Run the blog post migration and verify results
    status: completed
isProject: false
---

# WordPress Image and Blog Migration (Updated with sanity-plugin-media)

## Key Change from Previous Plan

Sanity's built-in media library is Enterprise-only. We will install **`sanity-plugin-media`** which provides:
- Full media browser in Sanity Studio (standalone tool + custom asset source)
- Tag management via `media.tag` documents (stored in `opt.media.tags[]` on assets)
- Faceted filtering by tag, file size, orientation, type
- Batch tagging, editing of alt text / title / description

This replaces the previous approach of extending `sanity.imageAsset` with custom schema fields. Tags from the plugin are the standard way to organize and filter assets.

---

## Phase 1: Setup

### 1a. Install dependencies

```bash
npm install --save sanity-plugin-media sharp
```

### 1b. Configure the plugin in [sanity.config.ts](sanity.config.ts)

```typescript
import { media } from 'sanity-plugin-media'

// Add to plugins array:
plugins: [
  media(),           // <-- new
  structureTool({ ... }),
  documentInternationalization({ ... }),
  visionTool(),
]
```

Also hide the `media.tag` document type from the sidebar (the plugin manages tags internally). In the `structureTool` structure, filter out `media.tag` from appearing as a loose document list.

---

## Phase 2: Image Migration (~2,500 images)

### Migration script: `sanity/migrate-wp-images.mjs`

#### Step 1 -- Fetch all WordPress media

- Paginate through `https://www.rapturecamps.com/wp-json/wp/v2/media?per_page=100&page=N`
- Collect per image: `id`, `source_url`, `alt_text`, `title.rendered`, `caption.rendered`, `description.rendered`, `media_details.width/height`, `post` (parent post ID)

#### Step 2 -- Fetch WordPress posts and page context for tag derivation

- Fetch all posts (already have helper in [scripts/migrate-wordpress.ts](scripts/migrate-wordpress.ts) line 60-86)
- Build a lookup: WP media ID -> which posts/pages use it -> derive camp name, country, content type
- Use WP category/tag data to enrich context

#### Step 3 -- Pre-create `media.tag` documents in Sanity

Tags will be created as `media.tag` documents with a `name` field (slug type). Examples:

| Tag Type | Example Tags |
|---|---|
| Camp | `camp:bali`, `camp:sri-lanka-ahangama`, `camp:morocco` |
| Country | `country:indonesia`, `country:sri-lanka`, `country:morocco` |
| Content Type | `type:blog`, `type:featured-image`, `type:gallery` |
| Year | `year:2023`, `year:2024` |

The script creates these upfront, then references them during upload.

#### Step 4 -- Download, resize, upload each image

For each WordPress image:
1. **Download** the full-size image via `source_url`
2. **Resize** with `sharp`: if longest side > 1920px, scale down preserving aspect ratio. Keep format (JPEG/PNG/WebP).
3. **Upload** to Sanity via `sanityClient.assets.upload('image', buffer, { filename, ... })`
4. **Set metadata** on the asset document:
   - `title` from WP `title.rendered`
   - `altText` from WP `alt_text`
   - `description` from WP `caption.rendered` or `description.rendered`
5. **Tag the asset** by patching `opt.media.tags` with weak references to the pre-created `media.tag` documents:
   ```javascript
   sanityClient.patch(assetId).set({
     'opt.media.tags': [
       { _type: 'reference', _weak: true, _ref: tagDocId, _key: uniqueKey },
       // ... more tags
     ]
   }).commit()
   ```
6. **Save a mapping** file `sanity/wp-image-map.json`: `{ [wpMediaId]: sanityAssetId }`

#### Resilience

- Process in batches of 10 (parallel downloads/uploads)
- Save progress to a JSON checkpoint file; resume from last successful batch on re-run
- Log skipped/failed items to `sanity/migration-errors.log`
- Rate-limit Sanity API calls (200ms between patches)

---

## Phase 3: Blog Post Migration (~300 posts)

### Prerequisites
- Phase 2 complete (image map file exists)
- WordPress categories already mapped to Sanity `blogCategory` documents

### Migration script: `sanity/migrate-wp-posts.mjs`

#### Step 1 -- Create blog categories in Sanity

- Fetch WP categories via `/wp-json/wp/v2/categories`
- Create `blogCategory` documents in Sanity with `name`, `slug`, `description`
- Build mapping: `{ [wpCategoryId]: sanityCategoryId }`

#### Step 2 -- Fetch all WordPress posts

- Paginate through `/wp-json/wp/v2/posts?per_page=100&page=N`
- For each post: `title`, `slug`, `content.rendered` (HTML), `excerpt`, `date`, `featured_media`, `categories`, `tags`, Yoast SEO data

#### Step 3 -- Convert HTML to Portable Text

For each post's `content.rendered`:
- Parse HTML using a lightweight parser (e.g., `htmlparser2` or `node-html-parser`)
- Convert to Sanity Portable Text blocks:
  - `<p>` -> block (style: "normal")
  - `<h2>`, `<h3>`, `<h4>` -> block (style: "h2"/"h3"/"h4")
  - `<blockquote>` -> block (style: "blockquote")
  - `<strong>`, `<em>` -> marks (decorators)
  - `<a href>` -> mark annotation (link)
  - `<img src>` -> image block (remap `src` to Sanity asset using `wp-image-map.json`)
  - `<ul>/<ol>/<li>` -> list blocks

#### Step 4 -- Create blog post documents

For each post, create a `blogPost` document:
- `title`, `slug`, `excerpt`, `publishedAt` from WP data
- `body` = converted Portable Text
- `featuredImage` = Sanity asset reference from `wp-image-map.json`
- `categories` = array of references to Sanity `blogCategory` docs
- `tags` = array of WP tag names (string tags, as per current schema)
- `seo` = title + description from Yoast data
- `language` = "en"

#### Step 5 -- Verify and report

- Log: total created, skipped, errors
- List any posts with unconverted HTML elements for manual review

---

## File Changes Summary

| File | Change |
|---|---|
| `package.json` | Add `sanity-plugin-media`, `sharp`, `node-html-parser` |
| [sanity.config.ts](sanity.config.ts) | Add `media()` plugin, hide `media.tag` from sidebar |
| `sanity/migrate-wp-images.mjs` | NEW -- image migration script |
| `sanity/migrate-wp-posts.mjs` | NEW -- blog post migration script |
| `sanity/wp-image-map.json` | NEW -- generated mapping file (gitignored) |

---

## Tag Strategy Detail

During image import, each image gets tagged automatically based on WordPress metadata:

- **Camp tags** (`camp:bali`, `camp:morocco`, etc.) -- derived from which camp pages/posts reference the image
- **Country tags** (`country:indonesia`, etc.) -- derived from camp-country mapping
- **Content type tags** (`type:blog`, `type:featured-image`, `type:gallery`) -- based on how the image was used (featured image vs. inline in post body)
- **Year tags** (`year:2023`, etc.) -- extracted from the post publish date or image upload date

After migration, you can browse all images in Sanity Studio under the "Media" tool in the top nav, filter by any combination of these tags, and manage them (re-tag, edit alt text, etc.) all from within the plugin UI.
