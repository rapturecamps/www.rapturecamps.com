# Rapture Surfcamps — www.rapturecamps.com

A network of 8 unique surf camps in 5 countries on 4 continents.

## Tech Stack

- **[Astro](https://astro.build/)** v5 — Static site generator with zero-JS by default
- **[React](https://react.dev/)** — Used as islands for interactive components only
- **[Tailwind CSS](https://tailwindcss.com/)** v4 — Utility-first styling via `@tailwindcss/vite`
- **[Storyblok](https://www.storyblok.com/)** — Headless CMS (integration prepared, pending token)
- **[Vercel](https://vercel.com/)** — Hosting and deployment

## Getting Started

```bash
npm install
npm run dev
```

Opens at [http://localhost:4321](http://localhost:4321).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header (Astro), Footer (Astro)
│   └── sections/        # Hero, About, Stats, CTA, Social (Astro)
│                        # DestinationGrid, BlogFeed (React islands)
├── layouts/
│   └── BaseLayout.astro # HTML shell, fonts, meta
├── lib/
│   ├── data.ts          # Static data (destinations, stats, nav)
│   ├── types.ts         # TypeScript types
│   └── storyblok.ts     # Storyblok client setup
├── pages/               # File-based routing
│   ├── index.astro      # Homepage
│   ├── about.astro
│   ├── contact.astro
│   ├── 404.astro
│   ├── blog/            # Blog listing, post detail, category pages
│   ├── faq/             # FAQ by location
│   └── surfcamp/        # Country + camp pages
└── styles/
    └── globals.css      # Tailwind theme, custom properties
```

## Architecture

- **Static components** (Hero, About, Stats, CTA, Social, Footer) ship zero JavaScript
- **React islands** hydrate only when needed:
  - `DestinationGrid` — `client:visible` (carousel)
  - `BlogFeed` — `client:visible` (carousel)
- **Header** is a pure Astro component with inline JS for scroll detection and mobile menu
- **i18n** configured for `en` (default) and `de` with prefix-free default locale

## Deployment

Configured for Vercel static output. Connect the GitHub repo to Vercel and it will auto-deploy on push to `main`.
