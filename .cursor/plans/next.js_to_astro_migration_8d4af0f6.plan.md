---
name: Next.js to Astro Migration
overview: Migrate the Rapture Surfcamps project from Next.js 16 to Astro, keeping all existing design work (Tailwind theme, components, content) while gaining zero-JS static output, built-in i18n routing, and better performance for this content-heavy site.
todos:
  - id: init-astro
    content: Initialize Astro project with React, Tailwind v4, Sitemap, and Vercel integrations. Bring over globals.css theme, data, types, and public assets.
    status: completed
  - id: layout-header-footer
    content: Create BaseLayout.astro with HTML shell, fonts, meta. Convert Footer to Astro component. Keep Header as React island with client:load.
    status: completed
  - id: homepage
    content: Build index.astro homepage. Convert Hero, AboutSection, StatsSection to Astro components. Wire up DestinationGrid and BlogFeed as React islands with client:visible.
    status: completed
  - id: convert-social
    content: Convert SocialGrid to pure Astro component (just a div + script tag, no React needed).
    status: completed
  - id: static-pages
    content: Convert about, contact, 404 pages to .astro files.
    status: completed
  - id: dynamic-pages
    content: Convert blog listing, blog/[slug], blog/category/[category], surfcamp pages, FAQ pages to .astro with getStaticPaths.
    status: completed
  - id: storyblok
    content: Set up @storyblok/astro integration, update lib/storyblok.ts helpers.
    status: completed
  - id: i18n
    content: Configure Astro i18n for en/de routing, wire up language toggle in Header.
    status: completed
  - id: deploy-config
    content: Set up @astrojs/vercel adapter, verify redirects, security headers, sitemap generation.
    status: completed
isProject: false
---

# Next.js to Astro Migration Plan

## What stays the same

- **All Tailwind CSS / design work** -- colors, typography, spacing, globals.css theme
- **Static data** -- `src/lib/data.ts` (destinations, stats, navigation, countries)
- **TypeScript types** -- `src/lib/types.ts`
- **Public assets** -- `public/images/`, `public/videos/`, robots.txt, sitemaps
- **Storyblok component schemas** -- `storyblok/components.json`
- **WordPress migration script** -- `scripts/migrate-wordpress.ts`
- **All copy/content** -- no content changes needed

## What changes

### 1. Project setup -- new Astro project in place

Replace `package.json`, configs, and install:

- `astro` (core)
- `@astrojs/react` (for interactive islands)
- `@astrojs/tailwind` (Tailwind v4 integration)
- `@astrojs/sitemap` (replaces next-sitemap)
- `@storyblok/astro` (replaces @storyblok/react)
- `react`, `react-dom` (only for island components)
- `lucide-react` (icons, used in interactive components)

Remove Next.js-specific files:

- `next.config.ts`, `next-sitemap.config.js`, `next-env.d.ts`
- `eslint-config-next`

New config files:

- `astro.config.mjs` -- integrations, i18n, image domains, Vercel adapter
- Updated `tsconfig.json` for Astro

### 2. Layout conversion

**Current:** `src/app/layout.tsx` (React)
**New:** `src/layouts/BaseLayout.astro`

- Move HTML shell, font imports, metadata into Astro layout
- Header and Footer become Astro components (static HTML, no JS)
- Header scroll effect + mobile menu stays as a React island (`client:load`)

### 3. Page conversions

Each Next.js `page.tsx` becomes an `.astro` file:


| Current (Next.js)                            | New (Astro)                                 |
| -------------------------------------------- | ------------------------------------------- |
| `src/app/page.tsx`                           | `src/pages/index.astro`                     |
| `src/app/about/page.tsx`                     | `src/pages/about.astro`                     |
| `src/app/blog/page.tsx`                      | `src/pages/blog/index.astro`                |
| `src/app/blog/[slug]/page.tsx`               | `src/pages/blog/[slug].astro`               |
| `src/app/blog/category/[category]/page.tsx`  | `src/pages/blog/category/[category].astro`  |
| `src/app/contact/page.tsx`                   | `src/pages/contact.astro`                   |
| `src/app/faq/[location]/page.tsx`            | `src/pages/faq/[location].astro`            |
| `src/app/surfcamp/page.tsx`                  | `src/pages/surfcamp/index.astro`            |
| `src/app/surfcamp/[country]/page.tsx`        | `src/pages/surfcamp/[country].astro`        |
| `src/app/surfcamp/[country]/[camp]/page.tsx` | `src/pages/surfcamp/[country]/[camp].astro` |
| `src/app/not-found.tsx`                      | `src/pages/404.astro`                       |


### 4. Component conversion -- static vs interactive

**Convert to Astro components (zero JS shipped):**

- `Hero.tsx` -> `Hero.astro` -- pure HTML/CSS, video autoplay is native
- `AboutSection.tsx` -> `AboutSection.astro` -- static text + links
- `StatsSection.tsx` -> `StatsSection.astro` -- static display
- `CTASection.tsx` -> `CTASection.astro` -- static links
- `Footer.tsx` -> `Footer.astro` -- static HTML

**Keep as React islands (interactive, hydrated on client):**

- `Header.tsx` -- scroll detection + mobile menu toggle (`client:load`)
- `DestinationGrid.tsx` -- horizontal scroll carousel (`client:visible`)
- `BlogFeed.tsx` -- horizontal scroll carousel (`client:visible`)
- `SocialGrid.tsx` -> `SocialGrid.astro` -- actually just a `<div>` + `<script>`, can be pure Astro

### 5. Image handling

Replace `next/image` with Astro's built-in `<Image>` component from `astro:assets`:

- Remote images: configure `image.domains` in `astro.config.mjs` for `images.unsplash.com`, `www.rapturecamps.com`, `a.storyblok.com`
- Local images: import directly
- Interactive components (React islands) that use images: use standard `<img>` tags since Astro `<Image>` can't be used inside React

### 6. Built-in i18n setup

Configure in `astro.config.mjs`:

```javascript
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'de'],
  routing: {
    prefixDefaultLocale: false  // /about (en), /de/about (de)
  }
}
```

This gives us `/en/` and `/de/` routing for free -- the "de" toggle in the header can link to the German version of each page.

### 7. Storyblok integration

Replace `@storyblok/react` with `@storyblok/astro`:

- Update `src/lib/storyblok.ts` to use Astro SDK
- Storyblok components can be Astro components (static) or React islands (interactive)
- The component schemas in `storyblok/components.json` remain unchanged

### 8. Deployment

Replace Vercel adapter:

- Install `@astrojs/vercel`
- Set `output: 'static'` for full SSG (or `'hybrid'` if some pages need SSR)
- Move security headers from `vercel.json` to Astro middleware or keep in `vercel.json`
- Redirects can stay in `vercel.json` or move to Astro config

## Migration order

The migration is best done as a clean swap -- reinitialize the project as Astro and bring over the existing code file by file. This avoids fighting leftover Next.js config.