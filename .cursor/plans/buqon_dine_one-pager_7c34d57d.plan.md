---
name: Buqon DINE One-Pager
overview: Build a dark-themed, animated one-page website for Buqon DINE (BBQ table with integrated grill) using Astro, Tailwind CSS, GSAP, and Sanity CMS, with German/English bilingual support, deployed on Vercel.
todos:
  - id: scaffold-astro
    content: Scaffold Astro project with Tailwind CSS, configure astro.config.mjs with Vercel adapter and i18n
    status: completed
  - id: dark-theme
    content: Set up Tailwind dark theme tokens, global CSS, and typography (font selection)
    status: completed
  - id: sanity-studio
    content: "Scaffold Sanity Studio with schemas: homepage (singleton), testimonial, siteSettings"
    status: completed
  - id: sanity-client
    content: Create Sanity client in Astro (lib/sanity.ts) with GROQ queries for fetching localized content
    status: completed
  - id: i18n-setup
    content: Set up i18n routing (/de/, /en/), UI string translations, language switcher, and redirect from /
    status: completed
  - id: layout-navbar
    content: Build Layout.astro (base HTML, GSAP initialization, fonts) and Navbar component with scroll behavior
    status: completed
  - id: hero-section
    content: Build Hero section with full-viewport layout, background media, GSAP text reveal and parallax
    status: completed
  - id: feature-sections
    content: Build the 4 feature sections (Community, Grill Control, Style, Quality) with scroll animations
    status: completed
  - id: testimonials
    content: Build Testimonials section with carousel/cards and staggered GSAP entrance
    status: completed
  - id: safety-cta
    content: Build Safety section and CTA/inquiry form section
    status: completed
  - id: footer
    content: Build Footer with nav links, social icons, payment icons, legal links
    status: completed
  - id: connect-sanity
    content: Wire all components to fetch real content from Sanity instead of hardcoded text
    status: completed
  - id: polish-deploy
    content: "Final polish: responsive testing, animation tuning, SEO meta tags, Vercel deployment config"
    status: completed
isProject: false
---

# Buqon DINE One-Pager Website

## Tech Stack

- **Framework**: Astro (SSG mode, `@astrojs/vercel` adapter for deployment)
- **Styling**: Tailwind CSS v4 with a custom dark theme
- **Animations**: GSAP + ScrollTrigger for scroll-driven animations
- **CMS**: Sanity v3 (Studio embedded as a separate folder in the monorepo)
- **i18n**: Astro's built-in i18n routing (`/de/` and `/en/` prefixes, German as default)
- **Deployment**: Vercel

## Project Structure

```
www.buqon.com/
├── astro/                    # Astro website
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   ├── package.json
│   ├── src/
│   │   ├── layouts/
│   │   │   └── Layout.astro          # Base layout (dark theme, fonts, GSAP init)
│   │   ├── components/
│   │   │   ├── Navbar.astro           # Sticky nav with lang switcher
│   │   │   ├── Hero.astro             # Hero with video/image + headline
│   │   │   ├── FeatureCenter.astro    # "Freunde, Familie, Essen"
│   │   │   ├── FeatureGrill.astro     # "Bestimme deine Garstufe"
│   │   │   ├── FeatureStyle.astro     # "Get Together mit Stil"
│   │   │   ├── FeatureQuality.astro   # "Made in Europe"
│   │   │   ├── Safety.astro           # "Sicherheit beim Grillen"
│   │   │   ├── Testimonials.astro     # Customer reviews carousel
│   │   │   ├── CTA.astro             # "Hol dir das perfekte Grillerlebnis" + inquiry form
│   │   │   ├── Footer.astro           # Footer with links, social, payment icons
│   │   │   └── LanguageSwitcher.astro
│   │   ├── i18n/
│   │   │   ├── ui.ts                  # Static UI strings (nav labels, buttons)
│   │   │   └── utils.ts              # getLangFromUrl, useTranslations helpers
│   │   ├── lib/
│   │   │   └── sanity.ts             # Sanity client + GROQ queries
│   │   ├── pages/
│   │   │   ├── de/
│   │   │   │   └── index.astro       # German version
│   │   │   ├── en/
│   │   │   │   └── index.astro       # English version
│   │   │   └── index.astro           # Redirect to /de/
│   │   └── styles/
│   │       └── global.css            # Tailwind directives + custom dark theme vars
│   └── public/
│       └── fonts/                    # Self-hosted fonts
├── studio/                   # Sanity Studio
│   ├── package.json
│   ├── sanity.config.ts
│   ├── sanity.cli.ts
│   └── schemas/
│       ├── index.ts
│       ├── homepage.ts               # Single document for the one-pager
│       ├── testimonial.ts            # Repeatable testimonial documents
│       └── siteSettings.ts           # Logo, social links, contact info
└── package.json              # Root workspace config
```

## Page Sections (top to bottom)

Based on the Framer prototype, the one-pager will have these sections:

1. **Navbar** -- Sticky, transparent-to-solid on scroll. Logo left, nav links (smooth-scroll anchors), language switcher + CTA button right. GSAP: fade-in on load.
2. **Hero** -- Full-viewport section with background video/image. Large headline "DINE -- Ein Tisch Um Sie zu Vereinen" with subtitle. GSAP: text reveal animation, parallax on background.
3. **Feature: Community** -- "Freunde, Familie und Essen im Mittelpunkt". Image + text split layout. GSAP: slide-in from left/right on scroll.
4. **Feature: Grill Control** -- "Bestimme deine Garstufe selbst". Shows the table conversion (table to grill). GSAP: image sequence or crossfade animation.
5. **Feature: Style** -- "Get Together mit Stil". Image gallery with multiple settings (rooftop, garden, etc.). GSAP: staggered fade-in.
6. **Feature: Quality** -- "Made in Europe". Emphasize craftsmanship. GSAP: counter animation or reveal.
7. **Testimonials** -- Customer reviews from Karim and Susanne. Auto-scrolling carousel or cards. GSAP: staggered entrance.
8. **Safety** -- "Sicherheit beim Grillen". Temperature-neutral exterior, easy assembly. GSAP: reveal animation.
9. **CTA / Inquiry** -- "Hol dir das perfekte Grillerlebnis". Contact/inquiry form (name, email, message). GSAP: fade-in.
10. **Footer** -- Logo, navigation, social links, payment icons, legal links.

## Sanity CMS Schema Design

Content will be managed at the **field level** for i18n (each text field has `de` and `en` variants using Sanity's `internationalizedArrayString` or a simpler object approach):

- **Homepage (singleton document)**:
  - `hero`: { title_de, title_en, subtitle_de, subtitle_en, backgroundImage, backgroundVideo }
  - `sections[]`: Array of section objects, each with localized title, body, and images
  - `cta`: { title_de, title_en, body_de, body_en }
- **Testimonial (repeatable)**:
  - `name`, `location`, `avatar`, `quote_de`, `quote_en`
- **Site Settings (singleton)**:
  - `logo`, `socialLinks[]`, `contactEmail`, `phone`, `footerLinks[]`

## Dark Theme Approach

- Base background: near-black (`#0a0a0a` or `#111111`)
- Surface/card backgrounds: dark grays (`#1a1a1a`, `#222222`)
- Primary accent: warm amber/orange (evoking fire/grill) -- something like `#d4a053` or similar
- Text: off-white (`#f5f5f5`) for body, white for headings
- Subtle gradients and glow effects on hover states
- All defined as Tailwind CSS custom theme tokens

## GSAP Animation Plan

- Load GSAP + ScrollTrigger via npm (`gsap` package)
- Initialize in a `<script>` tag in `Layout.astro`
- Each section component includes a `<script>` block registering its own ScrollTrigger animations
- Key animation patterns:
  - **Text reveals**: clip-path or translateY with opacity
  - **Image parallax**: subtle Y-axis movement on scroll
  - **Staggered entrances**: children of a container animate in sequence
  - **Navbar**: background opacity transition on scroll
  - **Smooth anchor scrolling**: GSAP ScrollToPlugin for nav links

## i18n Strategy

- Astro's file-based routing: `/de/index.astro` and `/en/index.astro`
- Root `index.astro` redirects to `/de/` (German default)
- Static UI strings (button labels, nav items) in `src/i18n/ui.ts`
- CMS content fetched with locale parameter from Sanity
- Language switcher component toggles between `/de/` and `/en/`
- `astro.config.mjs` configured with `i18n: { defaultLocale: 'de', locales: ['de', 'en'] }`

## Deployment

- `@astrojs/vercel` adapter
- Sanity Studio deployed separately (either on Sanity's hosted studio or as a Vercel sub-project)
- Sanity webhook triggers Vercel rebuild on content change
