---
name: Go live on Vercel
overview: The site is ready to deploy as-is. Sanity code exists but is unused -- no pages import it. A few small cleanup items to address before going live.
todos:
  - id: deploy
    content: Import repo to Vercel with root directory set to 'astro' and deploy
    status: in_progress
isProject: false
---

# Go Live on Vercel

## Current state

The site is fully self-contained with hardcoded content. The Sanity client (`[astro/src/lib/sanity.ts](astro/src/lib/sanity.ts)`) exists but is **not imported by any page or component**, so it won't cause build errors. The `@sanity/client` and `@sanity/image-url` packages in `[astro/package.json](astro/package.json)` add unused bundle weight but won't block deployment.

## What's ready

- All pages (home, 3 blog posts, 4 legal pages) in DE + EN
- Contact form via Formsubmit (needs one-time email activation after first submit)
- Cookie consent banner
- Wistia video embed
- GSAP scroll animations
- SEO redirects from old WordPress URLs in `[astro/vercel.json](astro/vercel.json)`
- Root `/` redirects to `/de/`
- Sitemap via `@astrojs/sitemap`

## Pre-deploy cleanup

Two small things to clean up before deploying:

1. **Remove the Sanity env vars requirement** -- the `.env.example` references Sanity project ID/dataset. Since nothing uses it, no env vars need to be set in Vercel. No code changes needed, just don't add them.
2. **Activate Formsubmit** -- After the first form submission on the live site, Formsubmit sends a confirmation email to `office@buqon.com`. You need to click the link in that email to activate form delivery. Until then, submissions won't arrive.

## Deployment steps

1. Go to [vercel.com](https://vercel.com), import the GitHub repo `Simonsway805/www.buqon.com`
2. Set the **Root Directory** to `astro` (since the Astro project lives in the `astro/` subfolder, not the repo root)
3. Vercel should auto-detect the Astro framework -- no build settings to change
4. No environment variables needed for this version
5. Deploy

## Optional: Connect custom domain

After the first deploy, add `www.buqon.com` as a custom domain in Vercel project settings. You'll need to update DNS (CNAME or A record) at your domain registrar to point to Vercel.