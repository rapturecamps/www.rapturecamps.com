# Rapturecamps.com — Blog & Utility Pages Audit

## Table of Contents

1. [Blog Listing Page](#1-blog-listing-page)
2. [Blog Post Detail Pages](#2-blog-post-detail-pages)
3. [Blog Category Pages](#3-blog-category-pages)
4. [Blog Categories & Post Count](#4-blog-categories--post-count)
5. [Contact Page](#5-contact-page)
6. [FAQ System](#6-faq-system)
7. [Surfcamp Overview Page](#7-surfcamp-overview-page)
8. [About Page](#8-about-page)
9. [Privacy Policy Page](#9-privacy-policy-page)
10. [Global Elements](#10-global-elements)
11. [Site-Wide Navigation Structure](#11-site-wide-navigation-structure)

---

## 1. Blog Listing Page

**URL:** `/blog/`
**Title:** "Waves for Days - Surf Destinations & Tips By Rapturecamps"
**Layout:** Paginated listing (no sidebar)

### Content Blocks

1. **Hero/Intro Section**
   - Heading: "Waves for Days"
   - Intro paragraph with internal links to `/surfcamp/` and a blog post about booking surf camps
   - Tone: Casual, adventure-oriented

2. **Post Grid/List**
   - 9 posts per page
   - Each post card shows:
     - Post title (H2, linked)
     - Category label (linked to category archive)
     - Date (format: `DD. Month YYYY`, e.g., "10. May 2025")
     - Excerpt (truncated with ellipsis `…`)
   - No featured images visible in fetched markup (likely loaded via JS/lazy load)
   - No author shown on listing

3. **Pagination**
   - URL pattern: `/blog/page/2/`, `/blog/page/3/`, etc.
   - 34 pages total (page 34 has 3 posts, page 35 is empty)
   - **Estimated total: ~300 blog posts**

4. **Footer Contact Widget** (global)

### Unique Notes
- The intro text is the same across all paginated blog pages
- No visible search functionality
- No sidebar/filter UI
- Posts span from Oct 2018 to May 2025

---

## 2. Blog Post Detail Pages

### 2a. Bioluminescence In Costa Rica

**URL:** `/blog/bioluminescence-in-costa-rica/`
**Title:** "Bioluminescence In Costa Rica - Rapture Surfcamps"
**Layout:** Single-column long-form article

#### Content Structure

1. **H1 Title:** "Bioluminescence In Costa Rica"
2. **Article Body** — Long-form content with:
   - Multiple H2 subheadings (7 sections):
     - "When to visit for the best bioluminescent display"
     - "Getting to Isla de Cedros"
     - "Camping permits and regulations"
     - "Essential camping gear for your trip"
     - "Best camping locations on the island"
     - "Experiencing the bioluminescence safely"
     - "Wildlife and additional activities"
     - "Local etiquette and sustainability"
     - "The magic never fades"
   - Bulleted lists within sections
   - External links (e.g., GetYourGuide, Bali.com)
   - Internal link at the end to relevant surfcamp: `/surfcamp/costa-rica/avellanas/`
3. **CTA Banner** — "RIDE THE WAVES FIND YOUR ZEN"
   - Brand value proposition paragraph
   - "Book Now!" button linking to homepage
4. **Horizontal rule separator**
5. **Footer contact widget** (global)

#### Missing/Not Visible
- No author name
- No publication date on the detail page
- No category breadcrumb on the detail page
- No related posts section
- No comments section
- No social share buttons (in fetched content)
- No table of contents
- No sidebar

### 2b. Surfing Uluwatu

**URL:** `/blog/surfing-uluwatu/`
**Title:** "Surfing Uluwatu | 5 Reef Breaks for Experienced Surfers"
**Layout:** Single-column long-form article

#### Content Structure

1. **H1 Title:** "Surfing Uluwatu in Bali – World-Class Reef Breaks in Bali"
2. **Article Body** — More structured than the Costa Rica post:
   - Mix of H2, H3, bold text
   - Blockquote from external source (Surfertoday.com)
   - Structured info for each surf break:
     - Best Tide
     - Wave Type
   - Internal links to other blog posts (`/blog/surfing-padang-padang/`, `/best-beginner-surf-spots-in-bali/`)
   - Promotional links to specific surfcamp pages
   - Language switcher link: `[de]` → German version at `/de/blog/surfen-uluwatu/`
3. **Reviews Section** — "Reviews From Our Guests" (heading only, likely JS-loaded)
4. **Surfcamp Promotion Block** — Padang Padang camp description with link
5. **CTA Banner** — "RIDE THE WAVES FIND YOUR ZEN" (same as other post)
6. **Footer contact widget** (global)

#### Unique Elements
- German language toggle (`/de/` prefix)
- Guest reviews section
- Surfcamp promotion block with camp-specific details
- More keyword-optimized title pattern (includes "| 5 Reef Breaks for Experienced Surfers")

### Blog Post Patterns Summary

| Feature | Pattern |
|---|---|
| Layout | Single column, no sidebar |
| Headings | H1 title, H2 sections, H3 subsections |
| Author | Not displayed |
| Date | Not displayed on detail page |
| Categories | Not displayed on detail page |
| Tags | None observed |
| Related Posts | None observed |
| Comments | None |
| Social Sharing | Not in HTML (may be JS) |
| CTA Banner | Present at bottom — "RIDE THE WAVES FIND YOUR ZEN" + "Book Now!" |
| Internal Links | To relevant surfcamp pages and other blog posts |
| External Links | To authority sources (surf sites, tour operators) |
| Images | Not visible in fetch (likely lazy-loaded) |
| i18n | German versions available (`/de/blog/...`) |

---

## 3. Blog Category Pages

### Category URL Pattern
`/blog/category/{category-slug}/`

### Categories Discovered

| Category | URL | Intro Text | Est. Posts on Page |
|---|---|---|---|
| **Costa Rica** | `/blog/category/costa-rica/` | "Are you after the perfect reef breaks..." | 12 shown |
| **Bali** | `/blog/category/bali/` | "The tropical paradise of Bali..." with links to surf spots articles | 12 shown |
| **Inspiration** | `/blog/category/inspiration/` | "Are you still after that perfect surf break?..." | 12 shown |
| **Portugal** | `/blog/category/portugal/` | "Are you looking for the perfect reef breaks..." | 12 shown |
| **Nicaragua** | `/blog/category/nicaragua/` | "Nicaragua is the dream place for surfers..." | 12 shown |
| **Morocco** | `/blog/category/morocco/` | "Inspire yourself before you visit the gem of Northern Africa..." | 5 shown |

### Category Page Layout
- Same as blog listing but with category-specific intro
- Heading is the category name (H1)
- Custom intro paragraph per category with relevant internal links
- Same post card format: title, category tag, date, excerpt
- Cross-category posts appear (e.g., "6 Best Places to Surf in August 2025" tagged Bali appears in Costa Rica, Nicaragua, Morocco, Portugal categories)
- Posts appear to have multiple category assignments

### Estimated Post Distribution
- **Inspiration:** ~100+ (most common category)
- **Bali:** ~30-40
- **Costa Rica:** ~25-35
- **Portugal:** ~20-25
- **Nicaragua:** ~12-15
- **Morocco:** ~5

---

## 4. Blog Categories & Post Count

### Total Blog Posts: ~300 (across 34 paginated pages, 9 per page)

### Date Range
- **Oldest post found:** October 2018
- **Newest post found:** May 10, 2025
- **Publishing frequency:** Heavy burst in 2023-2025; sparse before that (2019-2022 gap)

### Content Types
1. **Destination guides** — Location-specific surf/travel guides (Uluwatu, Padang Padang, Ericeira, etc.)
2. **Surf education** — How-to articles (pop-ups, reading waves, choosing boards, etc.)
3. **Travel inspiration** — Best-of lists, packing guides, trip planning
4. **Lifestyle/culture** — Surf movies, surfer diet, surf fashion, yoga for surfers
5. **News/events** — Olympics surfing, camp announcements (older posts)
6. **Promotional** — Camp-specific articles linking to booking

---

## 5. Contact Page

**URL:** `/contact/`
**Title:** "Contact us via Chat, Email or Phone - Rapture Surfcamps"
**Layout:** Multi-section utility page

### Content Blocks

1. **H1:** "Contact"

2. **WhatsApp CTA Button** — "WhatsApp us" linking to `wa.me/+447700177360`

3. **Contact/Booking Form** with fields:
   - Phone number with international extension dropdown (full country list)
   - Location dropdown:
     - Bali - Green Bowl
     - Bali - Padang Padang
     - Bali - Canggu
     - Bali - Seminyak
     - Costa Rica - Avellanas
     - Morocco - Banana Village
     - Nicaragua - Maderas
     - Portugal - Ericeira
     - Portugal - Milfontes
     - Portugal - Coxos Surf Villa
   - Traveling Partner: Solo / Group
   - Preferred Room: Private / Shared
   - Surf Lessons Level: 1 / 2 / 3 / 4
   - Submit button with "Required Fields" note
   - CAPTCHA/loading indicator: "Loading... Refresh"

4. **Free Callback/Meeting Section**
   - H2: "Free Phone Callback. Free Online Meeting."
   - Staff profile: **Ana Isa** — "Surf Trip Expert"
   - Language toggle to German (`/de/kontakt/`)

5. **"How to get there" Section** — Directions for every camp location:
   - **Bali - Green Bowl** — Detailed driving directions from airport, Google Maps link, phone, hours
   - **Bali - Padang Padang** — Same format
   - **Costa Rica - Playa Avellanas** — Driving directions, Maps link
   - **Morocco - Sidi Ifni** — Airport pickup available, Maps link
   - **Nicaragua - Playa Maderas** — Transfer options from San Juan del Sur, Managua/Liberia airports
   - **Portugal - Ericeira** — Car and public transport directions (Carris bus), Maps link
   - **Portugal - Milfontes** — Shuttle bus from Lisbon, Maps link
   - **Portugal - Ericeira - Coxos Villa** — Same as Ericeira with different pin

   Each location block includes:
   - Google Maps embed link
   - Phone number
   - Hours (typically 8am-10pm local time)
   - "Usually replies within 24 hrs"

### Unique Notes
- All 10 camp locations listed in the form dropdown (including Canggu and Seminyak which don't appear elsewhere as active camps)
- Detailed per-location directions is unusual — likely high SEO/practical value
- Phone numbers vary by region (Indonesia, Portugal, UK)

---

## 6. FAQ System

### FAQ Index Page

**URL:** `/faq/`
**Title:** "Know More About our Surfcamps - Rapture Surfcamps"
**Layout:** Location selector (list of links)

#### Structure
- Language toggle: `/de/faq/`
- List of 8 camp location links:
  1. [Morocco – Banana Village](/faq/morocco-banana-village/)
  2. [Bali – Green Bowl](/faq/bali-green-bowl/)
  3. [Bali – Padang Padang](/faq/bali-padang-padang/)
  4. [Costa Rica – Avellanas](/faq/costa-rica-avellanas/)
  5. [Nicaragua – Maderas](/faq/nicaragua-maderas/)
  6. [Portugal – Ericeira](/faq/portugal-ericeira/)
  7. [Portugal – Milfontes](/faq/portugal-milfontes/)
  8. [Portugal – Coxos Surf Villa](/faq/portugal-coxos-surf-villa/)

### FAQ Location Page (Bali - Green Bowl example)

**URL:** `/faq/bali-green-bowl/`
**Title:** "Bali - Green Bowl - FAQ - Rapture Surfcamps"
**Layout:** Two-part — category navigation + accordion-style Q&A

#### Sidebar/Navigation
- Same 8 location links (current location highlighted)
- Language toggle: `/de/faq/bali-green-bowl/`

#### FAQ Categories (with question counts)

| Category | Count | URL Pattern |
|---|---|---|
| Booking & Prices | 11 | `/faq/bali-green-bowl/booking-prices/` |
| Rooms | 9 | `/faq/bali-green-bowl/rooms/` |
| Surfing And Lessons | 10 | `/faq/bali-green-bowl/surfing-and-lessons/` |
| How To Reach Us | 3 | `/faq/bali-green-bowl/how-to-reach-us/` |
| Sightseeing & Things Todo | 1 | `/faq/bali-green-bowl/sightseeing-things-todo/` |
| Food & Beverages | 2 | `/faq/bali-green-bowl/food-beverages/` |
| Other | 7 | `/faq/bali-green-bowl/other/` |
| **Total** | **43** | |

#### FAQ Question Structure
- Each category lists all questions as links
- Individual FAQ URLs: `/faq/bali-green-bowl/{category}/{question-slug}/`
- Below the category links, ALL questions are displayed with answers inline (accordion/expandable)
- Each inline answer shows:
  - Category label (e.g., "Booking & Prices")
  - Question as H2
  - Answer paragraph(s) — truncated with `…` in some cases

#### URL Architecture (3-level hierarchy)
```
/faq/                                    → Location selector
/faq/{location}/                         → All FAQs for that location
/faq/{location}/{category}/              → Category-filtered FAQs
/faq/{location}/{category}/{question}/   → Individual FAQ page
```

### FAQ Content Themes (from Bali Green Bowl)
- **Booking:** Cancellation, payments, minimum stay, availability, check-in/out, extras, packages
- **Rooms:** Dorm sizes, private rooms, suites, twins, safes, towels, bathrooms, late check-in
- **Surfing:** Beginner suitability, lesson times, surf guiding vs lessons, board types, reef booties, rain policy
- **Getting There:** Airport pickup, parking, directions
- **Sightseeing:** Day trip recommendations (Ubud, Uluwatu)
- **Food:** Dietary requirements, kitchen access
- **Other:** Weather, visas, immunizations, safety, currency, sun protection, camp comparison

---

## 7. Surfcamp Overview Page

**URL:** `/surfcamp/`
**Title:** "Surfcamps - Rapture Surfcamps"
**Layout:** Destination card grid

### Content Blocks

1. **H1:** "Choose your Destination."

2. **Destination Cards** (5 cards, each with):
   - "More info" text (likely hover state)
   - Destination name as H2
   - "Visit" button link
   - Visual card (images loaded via JS)

3. **Destinations Listed:**
   | Destination | URL |
   |---|---|
   | Surf Camps Morocco | `/surfcamp/morocco/` |
   | Surf Camps Costa Rica | `/surfcamp/costa-rica/` |
   | Nicaragua Surfcamps | `/surfcamp/nicaragua/` |
   | Surf Camps Portugal | `/surfcamp/portugal/` |
   | Surf Camps in Bali | `/surfcamp/bali/` |

4. **"New camp opening soon..."** — Teaser text after the last card

### Unique Notes
- Very minimal page — acts as a routing page to country-level surfcamp pages
- Naming inconsistency: "Surf Camps" vs "Surfcamps" vs "Nicaragua Surfcamps"
- Each country then has sub-pages for individual camp locations

---

## 8. About Page

**URL:** `/about/`
**Title:** "About Us - How It All Started - Rapture Surfcamps"
**Layout:** Narrative single-column page

### Content Blocks

1. **H1:** "About Us"

2. **Opening Statement:** "To live and surf great waves for the rest of their lives. That is the dream of all surfers."

3. **Destination Links:** Internal links to Bali, Costa Rica, Nicaragua, Portugal surfcamp pages

4. **Origin Story** — Narrative paragraphs about:
   - Winter 2003/2004 meeting in North Africa
   - Australian co-founder: Sydney surf photographer, later Portugal big wave photographer
   - Austrian co-founder: Snowboarder turned surfer, entrepreneur
   - How they met surfing in Morocco

5. **H2: "The Camps of Rapture — A Network of Surf Camps"**
   - Vision: "set up surf camps that are safe and easy to get to, located in exotic countries, and affordable"

6. **H2: "Morocco — A Fun Place To Be"**
   - First camp story: Taghazout/Tamraght village
   - Staff mentions: Fatiha and Youssef

7. **H2: "Surf Camps in Bali and Portugal"**
   - Expansion to Padang Padang (Bali) and Ericeira (Portugal) after 2004/2005

8. **Acknowledgements** — Thanks to friends, family, management helpers

### Unique Notes
- Heavily narrative/story-driven — no photos visible in fetch
- Positions Rapturecamps as passion project, not corporate
- Covers history from 2003/2004 to establishment of multiple camps
- No team photos or structured team section visible

---

## 9. Privacy Policy Page

**URL:** `/privacy-policy/`
**Title:** "Privacy Policy & GDPR - Rapture Surfcamps"
**Layout:** Minimal — appears to be mostly empty or content loaded dynamically

### Content
- **H1:** "Privacy Policy – Data Security"
- No visible body content in the fetch (likely the policy text is loaded via JS or is embedded in a way not captured by the fetch)

### Notes
- `/legal/` returns 404 — does not exist
- The privacy policy is the only legal page confirmed
- Content appears to be dynamically loaded or minimal

---

## 10. Global Elements

### Footer Contact Widget
Present on **every page**. Contains:

```
Ask questions via...
- Chat (likely live chat widget, JS-loaded)
- Email → /contact/
- Telegram → https://t.me/rapturecampsbot
- Whats App → https://wa.me/+447700177360
```

### Analytics/Tracking
- **Google Tag Manager:** GTM-KQ66LK
- **Async Hide** class for Google Optimize A/B testing

### Internationalization (i18n)
- German language versions available at `/de/` prefix
- Language toggle links observed on:
  - FAQ pages
  - Some blog posts (e.g., Surfing Uluwatu)
  - Contact page
- Not all pages show language toggle

---

## 11. Site-Wide Navigation Structure

### Primary Site Sections

```
/                          → Homepage
/surfcamp/                 → Destination overview
  /surfcamp/bali/          → Bali camps
  /surfcamp/costa-rica/    → Costa Rica camps
  /surfcamp/nicaragua/     → Nicaragua camps
  /surfcamp/portugal/      → Portugal camps
  /surfcamp/morocco/       → Morocco camps
/blog/                     → Blog listing
  /blog/{post-slug}/       → Blog post detail
  /blog/category/{cat}/    → Category archive
  /blog/page/{n}/          → Pagination
/faq/                      → FAQ location selector
  /faq/{location}/         → Location FAQ
  /faq/{location}/{cat}/   → Category FAQ
  /faq/{location}/{cat}/{q}/ → Individual FAQ
/contact/                  → Contact + directions
/about/                    → About us
/privacy-policy/           → Privacy policy
/de/...                    → German translations
```

### Content Relationships

```
Blog Post ← belongs to → Category (can be multiple)
FAQ Question ← belongs to → FAQ Category ← belongs to → Camp Location
Surfcamp ← belongs to → Country ← has → Blog posts, FAQs, Contact directions
```

### Camp Locations (Complete List)

| Country | Camp | Has FAQ | In Contact Form |
|---|---|---|---|
| Bali | Green Bowl | Yes | Yes |
| Bali | Padang Padang | Yes | Yes |
| Bali | Canggu | No | Yes |
| Bali | Seminyak | No | Yes |
| Costa Rica | Avellanas | Yes | Yes* |
| Morocco | Banana Village | Yes | Yes* |
| Nicaragua | Maderas | Yes | Yes |
| Portugal | Ericeira | Yes | Yes |
| Portugal | Milfontes | Yes | Yes |
| Portugal | Coxos Surf Villa | Yes | Yes |

*Contact form names differ slightly from FAQ/surfcamp names (e.g., "Playa Avellanas" vs "Avellanas")

### Key Observations for Rebuild

1. **Blog is the largest content section** (~300 posts) — needs efficient pagination, category filtering, and potentially search
2. **No author or date shown on blog detail pages** — consider adding for SEO (structured data)
3. **FAQ is deeply nested** (4-level URL hierarchy) — consider flattening or using accordion on single page per location
4. **Contact page doubles as directions page** — very long; consider splitting or using tabs
5. **German translations exist** but coverage is inconsistent — need to audit which pages have `/de/` versions
6. **Some camps in contact dropdown have no FAQ or surfcamp pages** (Canggu, Seminyak) — orphaned or upcoming
7. **No visible search** across blog or FAQ
8. **CTA consistency** — "RIDE THE WAVES FIND YOUR ZEN" banner appears on blog posts; needs to be componentized
9. **Category system is simple** — 6 categories matching the 5 destination countries + "Inspiration" as a catch-all
10. **Posts can belong to multiple categories** — cross-posted content appears in multiple category archives
