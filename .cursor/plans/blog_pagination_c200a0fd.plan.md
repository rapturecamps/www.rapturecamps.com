---
name: Blog pagination
overview: Add traditional SEO-friendly pagination to the blog index and category pages, generating static pages like /blog/page/2, /blog/category/bali/page/2 etc. with 12 posts per page.
todos:
  - id: blog-card
    content: Extract BlogPostCard component from duplicated markup
    status: completed
  - id: pagination-component
    content: Create reusable Pagination component with prev/next and page numbers
    status: completed
  - id: blog-index
    content: Convert blog/index.astro to blog/[...page].astro with paginate()
    status: completed
  - id: category-page
    content: Convert category/[category].astro to category/[category]/[...page].astro with paginate()
    status: completed
  - id: seo-meta
    content: Add rel prev/next link tags and page number in titles
    status: completed
isProject: false
---

# Blog Pagination

## Approach

Use Astro's built-in `paginate()` function inside `getStaticPaths()` to generate static paginated pages. This is the idiomatic Astro approach -- each page becomes a pre-rendered HTML file with a unique URL.

## URL Structure

- `/blog` -- page 1 (redirects from `/blog/page/1` not needed, Astro handles this)
- `/blog/page/2`, `/blog/page/3`, ...
- `/blog/category/bali` -- page 1 of Bali posts
- `/blog/category/bali/page/2`, ...

**Posts per page:** 12 (3 columns x 4 rows)

## File Changes

### 1. Convert blog index to paginated route

Rename `src/pages/blog/index.astro` to **`src/pages/blog/[...page].astro`**

This is Astro's rest parameter pattern for pagination. It handles both `/blog` (no page param = page 1) and `/blog/page/2` etc.

Key changes:
- Add `getStaticPaths()` using Astro's `paginate()` helper
- Fetch all posts once, let `paginate()` slice them into pages of 12
- Use `page.data` instead of `posts` for the current page's posts
- Add prev/next navigation UI at the bottom
- Add `rel="prev"` / `rel="next"` `<link>` tags in `<head>` for SEO

### 2. Convert category page to paginated route

Rename `src/pages/blog/category/[category].astro` to **`src/pages/blog/category/[category]/[...page].astro`**

Same paginate pattern but filtered by category. The `getStaticPaths()` will iterate all categories and paginate each one.

### 3. Add a reusable Pagination component

Create **`src/components/Pagination.astro`** -- a shared prev/next + page number navigation component that both pages use. Styled to match the existing dark theme.

### 4. Add a reusable BlogPostCard component

Extract the repeated post card markup (currently duplicated in both blog index and category pages) into **`src/components/BlogPostCard.astro`** to keep things DRY.

### 5. SEO enhancements

- Add `rel="canonical"` pointing to the correct paginated URL
- Add `rel="prev"` / `rel="next"` link tags in the page head
- Update page titles to include page number: "Blog - Page 2 | Rapture Surfcamps"

## No query changes needed

The existing `ALL_BLOG_POSTS` and `BLOG_POSTS_BY_CATEGORY` queries already fetch all posts sorted by date. Pagination slicing happens at build time in `getStaticPaths()`, which is the correct approach for Astro SSG.
