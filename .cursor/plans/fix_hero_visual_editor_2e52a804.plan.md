---
name: Fix hero Visual Editor
overview: Add missing storyblokEditable attributes to activity_group bloks in the hero component, and map the activity_group component in astro.config.mjs, so the Visual Editor can fully reconcile the hero's content tree with the DOM.
todos:
  - id: add-editable
    content: Add storyblokEditable(group) to activity_group divs in Hero.astro
    status: completed
  - id: deploy-test
    content: Commit, push to main, verify hero is editable in Visual Editor
    status: completed
isProject: false
---

# Fix Hero Section Not Editable in Visual Editor

## Root Cause

The hero component's `activity_groups` field contains `activity_group` bloks that are rendered **without `storyblokEditable`** — they're just plain `<div>` elements. Meanwhile, `activity_item` bloks nested inside them DO have `data-blok-c` attributes. This creates a content tree / DOM tree mismatch:

- Storyblok content tree: `hero > activity_group > activity_item`
- DOM tree: `hero[data-blok-c] > div.activity-card (NO data-blok-c) > activity_item[data-blok-c]`

The Visual Editor likely cannot reconcile this mismatch and skips the hero component, falling back to selecting the parent `<main>` (page) element.

**Evidence:** All 44 Storyblok components that exist in the DOM have `data-blok-c`, except `activity_group` (which exists in the content tree but has 0 `data-blok-c` elements in the DOM). Every other section on the page works perfectly.

## Fix

Two files need changes:

### 1. Add `storyblokEditable` to activity_group rendering in [src/storyblok/Hero.astro](src/storyblok/Hero.astro)

Lines 83-90 currently render activity groups as plain divs:

```astro
{blok.activity_groups?.map((group: any) => (
    <div class="activity-card">
        ...
    </div>
))}
```

Change to include `storyblokEditable(group)`:

```astro
{blok.activity_groups?.map((group: any) => (
    <div class="activity-card" {...storyblokEditable(group)}>
        ...
    </div>
))}
```

### 2. Add `activity_group` to the component mapping in [astro.config.mjs](astro.config.mjs)

Add `activity_group` to the nested bloks section. Since we render it manually in the hero (not via StoryblokComponent), we can create a minimal `ActivityGroup.astro` component, or simply add it to the mapping pointing to a minimal wrapper. The important thing is that `storyblokEditable` on the div in step 1 is what actually fixes the DOM tree.

### 3. Commit and push to deploy

Push to `main` branch, Vercel auto-deploys, test in Visual Editor.