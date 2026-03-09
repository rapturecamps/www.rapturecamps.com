---
name: OG images per page
overview: Pass a unique OG image to every page by wiring up the existing `ogImage` prop in BaseLayout, using each page's hero/background image as the source. No dynamic image generation needed -- just plumbing existing images through.
todos:
  - id: baselayout-meta
    content: Add og:url, twitter:image/title/description, and default fallback ogImage to BaseLayout
    status: completed
  - id: camp-og
    content: Pass heroImage as ogImage through CampLayout to BaseLayout
    status: completed
  - id: country-og
    content: Pass heroImage as ogImage on country pages
    status: completed
  - id: static-og
    content: Pass backgroundImage as ogImage on static pages (about, contact, jobs, blog index, surfcamp index, homepage)
    status: completed
  - id: dynamic-og
    content: Pass per-item ogImage on blog posts, FAQ locations, blog categories
    status: completed
  - id: default-og
    content: Add a default OG image file to public/images/
    status: pending
isProject: false
---

# OG Image Per Page

## Current State

[BaseLayout.astro](src/layouts/BaseLayout.astro) already has an `ogImage` prop and renders `<meta property="og:image">` when it's set (line 62). However, **no page currently passes `ogImage`**, so every shared link is missing a preview image.

## Approach

Use each page's existing hero/background image as its OG image. No dynamic generation needed -- the hero images are already hosted URLs. For OG best practice, we'll resize them to `1200x630` via the Unsplash `w=` / `h=` parameters (or keep as-is for non-Unsplash URLs).

We also need to add `og:url` and `twitter:image` meta tags to BaseLayout for complete social card support.

## Changes

### 1. Enhance BaseLayout meta tags

In [BaseLayout.astro](src/layouts/BaseLayout.astro):
- Add `og:url` using the existing `canonicalUrl`
- Add `twitter:title`, `twitter:description`, `twitter:image` tags mirroring the OG values
- Add a default fallback OG image (e.g., a branded Rapture Camps share image at `/images/og-default.jpg`) when no `ogImage` is provided

### 2. Pass `ogImage` from every page

- **Camp pages** ([CampLayout.astro](src/components/layout/CampLayout.astro)): Use `heroImage` (first hero image). Thread through to BaseLayout's `ogImage` prop.
- **Country pages** ([surfcamp/[country].astro](src/pages/surfcamp/[country].astro)): Use `data.heroImage`
- **Static pages with Hero** (about, contact, jobs, blog index, surfcamp index): Use the `backgroundImage` value already hardcoded in each file
- **Blog posts** ([blog/[slug].astro](src/pages/blog/[slug].astro)): Use the post's featured image URL
- **Blog categories** ([blog/category/[category].astro](src/pages/blog/category/[category].astro)): Use the default fallback
- **FAQ pages** ([faq/index.astro](src/pages/faq/index.astro), [faq/[location].astro](src/pages/faq/[location].astro)): Use camp image for location pages, default for index
- **Legal pages** (legal, privacy-policy, terms): Use the default fallback
- **Homepage** ([index.astro](src/pages/index.astro)): Use the default fallback (or a dedicated homepage share image)

### 3. Default fallback image

Add a branded default OG image at `public/images/og-default.jpg` (1200x630). This will be used as the fallback when no page-specific image is provided, ensuring every page always has an OG image.

> **Note:** You'll need to provide or create a branded 1200x630 image for the default. For now, we can use one of the hero images resized to 1200x630 as a placeholder.
