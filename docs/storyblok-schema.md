# Storyblok Schema Blueprint

Complete content architecture for rapturecamps.com. Every current Astro component and data structure is mapped to a Storyblok content type, nestable blok, or shared data entry.

---

## Principles

1. **Reusable data lives in shared folders** — inclusions, amenities, dietary options, FAQs, and reviews are created once and referenced wherever needed.
2. **Pages are content types** — each page type (home, country, camp overview, surf, rooms, food, blog post) is its own content type with a fixed set of fields plus a flexible body area for composable bloks.
3. **Sections are nestable bloks** — Hero, ContentBlock, ImageGrid, ImageBreak, Reviews, CTA, etc. can be dropped into any page's body area in any order.
4. **Camp sub-pages share a parent** — the camp overview story holds shared fields (name, hero images, booking URL, inclusions). Sub-pages (surf, rooms, food) inherit from the parent and add their own content.

---

## Folder Structure (Storyblok space)

```
/
├── home                          ← Page: Homepage
├── about                         ← Page: About
├── contact                       ← Page: Contact
├── blog/
│   ├── post-slug-1               ← Content Type: Blog Post
│   └── post-slug-2
├── surfcamp/
│   ├── bali/                     ← Content Type: Country Page
│   │   ├── green-bowl/           ← Content Type: Camp Page (overview = default)
│   │   │   ├── surf              ← Content Type: Camp Sub-Page
│   │   │   ├── rooms             ← Content Type: Camp Sub-Page
│   │   │   └── food              ← Content Type: Camp Sub-Page
│   │   └── padang-padang/
│   │       ├── surf
│   │       ├── rooms
│   │       └── food
│   ├── costa-rica/
│   │   └── avellanas/
│   │       └── ...
│   ├── portugal/
│   │   ├── ericeira-lizandro/
│   │   ├── ericeira-coxos-surf-villa/
│   │   ├── alentejo-milfontes/
│   │   └── ...
│   ├── morocco/
│   │   └── banana-village/
│   │       └── ...
│   └── nicaragua/
│       ├── maderas/
│       └── maderas-surf-resort/
│           └── ...
├── faq/
│   └── green-bowl                ← Content Type: FAQ Page
├── data/                         ← Not published, used for shared entries
│   ├── inclusions/
│   │   ├── surf-guiding
│   │   ├── breakfast
│   │   ├── dinner
│   │   ├── coffee-tea
│   │   ├── surf-theory
│   │   ├── beach-transfer
│   │   ├── video-analysis
│   │   ├── wifi
│   │   └── yoga
│   ├── amenities/
│   │   ├── pool
│   │   ├── surf-lessons
│   │   ├── yoga
│   │   ├── restaurant
│   │   ├── wifi
│   │   ├── bar
│   │   ├── gym
│   │   └── bikes
│   ├── room-types/
│   │   ├── shared-room
│   │   ├── twin-double
│   │   ├── private-room
│   │   └── glamping-tent
│   ├── dietary-options/
│   │   ├── vegetarian
│   │   ├── vegan
│   │   ├── gluten-free
│   │   ├── lactose-free
│   │   ├── halal
│   │   └── nut-free
│   ├── surf-levels/
│   │   ├── beginner
│   │   ├── intermediate
│   │   └── advanced
│   └── reviews/
│       ├── emma-t-bali
│       ├── lucas-m-bali
│       └── ...
```

---

## Shared Data Content Types

These live in the `data/` folder and are **never published as pages**. They serve as reusable entries that editors pick from when building camp and country pages.

### `inclusion`

| Field         | Type      | Notes                              |
|---------------|-----------|------------------------------------|
| `title`       | Text      | e.g. "Surf Guiding"               |
| `description` | Text      | e.g. "For an extra price"         |
| `icon`        | Textarea  | SVG path data (d attribute)        |
| `icon_image`  | Asset     | Alternative: upload an icon image  |
| `sort_order`  | Number    | Default display order              |

**Usage**: Referenced via multi-option Stories field on Camp Pages.

### `amenity`

| Field   | Type     | Notes                                  |
|---------|----------|----------------------------------------|
| `name`  | Text     | e.g. "Swimming Pool"                   |
| `slug`  | Text     | e.g. "pool" (used for icon mapping)    |
| `icon`  | Textarea | SVG path data                          |

**Usage**: Referenced on Camp Pages for the amenity badges on camp cards.

### `room_type`

| Field         | Type      | Notes                                      |
|---------------|-----------|--------------------------------------------|
| `name`        | Text      | e.g. "Shared Room"                         |
| `description` | Textarea  | Short description                          |
| `tag`         | Text      | e.g. "Most Popular", "Premium" (optional)  |
| `images`      | Multi-asset | Room photos                              |
| `price_from`  | Text      | e.g. "From €35/night" (optional)           |

**Usage**: Referenced on Camp Rooms sub-pages. Camps pick which room types they offer.

### `dietary_option`

| Field  | Type     | Notes                    |
|--------|----------|--------------------------|
| `name` | Text     | e.g. "Vegetarian"        |
| `icon` | Textarea | SVG path data (optional) |

**Usage**: Referenced on Camp Food sub-pages.

### `surf_level`

| Field         | Type     | Notes                    |
|---------------|----------|--------------------------|
| `name`        | Text     | e.g. "Beginner"          |
| `description` | Textarea | What this level means     |
| `icon`        | Textarea | SVG path data (optional) |

**Usage**: Referenced on Camp Surf sub-pages.

### `review`

| Field      | Type   | Notes                          |
|------------|--------|--------------------------------|
| `name`     | Text   | e.g. "Emma T."                 |
| `location` | Text   | e.g. "London, UK" (optional)   |
| `text`     | Textarea | The review body               |
| `rating`   | Number | 1–5 stars                      |
| `camp`     | Story  | Link to the camp this is for   |

**Usage**: Referenced on Country Pages and Camp Pages via multi-option Stories field.

### `faq_item`

| Field      | Type     | Notes                           |
|------------|----------|---------------------------------|
| `question` | Text     | The question                    |
| `answer`   | Richtext | Supports formatting in answer   |
| `category` | Text     | e.g. "Booking", "Surf", "Food" |

**Usage**: Referenced on FAQ Pages and optionally on Camp Pages.

### `stat`

| Field    | Type   | Notes                       |
|----------|--------|-----------------------------|
| `label`  | Text   | e.g. "Happy Customers"      |
| `value`  | Text   | e.g. "80k"                  |
| `prefix` | Text   | e.g. "More than" (optional) |

**Usage**: Referenced by the Stats Section blok.

---

## Page Content Types

### `page_home`

| Field  | Type    | Notes                                    |
|--------|---------|------------------------------------------|
| `hero` | Blok    | Single: `hero_blok`                      |
| `body` | Bloks   | Composable: any section bloks            |
| `seo`  | Group   | title, description, og_image, canonical  |

### `page_country`

| Field              | Type          | Notes                                    |
|--------------------|---------------|------------------------------------------|
| `name`             | Text          | e.g. "Bali"                              |
| `tagline`          | Text          | Short hero tagline                       |
| `description`      | Textarea      | Meta description / intro paragraph       |
| `hero_images`      | Multi-asset   | Rotating hero backgrounds                |
| `intro`            | Richtext      | Introductory paragraph below hero        |
| `camps_heading`    | Text          | e.g. "Stay at Our Surf Camps in Bali"   |
| `body`             | Bloks         | Composable: content_block, image_grid, image_break, reviews_section, etc. |
| `seo`              | Group         | title, description, og_image, canonical  |

### `page_camp` (overview / "The Surfcamp")

| Field              | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| `name`             | Text          | e.g. "Green Bowl"                            |
| `country`          | Story         | Reference to parent country page             |
| `location`         | Text          | e.g. "Bukit Peninsula"                       |
| `tagline`          | Text          | Card tagline                                 |
| `hero_images`      | Multi-asset   | Rotating hero backgrounds                    |
| `booking_url`      | URL           | External booking engine link                 |
| `inclusions`       | Multi-Stories | References to `data/inclusions/*`            |
| `amenities`        | Multi-Stories | References to `data/amenities/*`             |
| `rating`           | Number        | e.g. 4.8                                     |
| `review_count`     | Number        | e.g. 312                                     |
| `card_image`       | Asset         | Thumbnail for camp cards and dropdown        |
| `body`             | Bloks         | Composable section bloks for the overview    |
| `seo`              | Group         | title, description, og_image, canonical      |

### `page_camp_surf` (sub-page)

| Field              | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| `intro`            | Richtext      | "The Waves" intro copy                       |
| `lessons_intro`    | Richtext      | "Surf Lessons & Guiding" copy                |
| `surf_levels`      | Multi-Stories | References to `data/surf-levels/*`           |
| `body`             | Bloks         | Additional composable bloks                  |
| `seo`              | Group         | title, description, og_image, canonical      |

*Inherits hero images, camp name, booking URL from parent `page_camp`.*

### `page_camp_rooms` (sub-page)

| Field              | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| `intro`            | Richtext      | "Where You'll Stay" copy                     |
| `room_types`       | Multi-Stories | References to `data/room-types/*`            |
| `facilities`       | Bloks         | List of facility items (text + icon)         |
| `body`             | Bloks         | Additional composable bloks                  |
| `seo`              | Group         | title, description, og_image, canonical      |

*Inherits hero images, camp name, booking URL from parent `page_camp`.*

### `page_camp_food` (sub-page)

| Field              | Type          | Notes                                        |
|--------------------|---------------|----------------------------------------------|
| `intro`            | Richtext      | "Eat Well, Surf Better" copy                 |
| `meals`            | Bloks         | Nested `meal_blok` items                     |
| `dietary_options`  | Multi-Stories | References to `data/dietary-options/*`        |
| `body`             | Bloks         | Additional composable bloks                  |
| `seo`              | Group         | title, description, og_image, canonical      |

*Inherits hero images, camp name, booking URL from parent `page_camp`.*

### `page_blog_post`

| Field            | Type        | Notes                          |
|------------------|-------------|--------------------------------|
| `title`          | Text        |                                |
| `excerpt`        | Textarea    | Used on listing cards          |
| `featured_image` | Asset       |                                |
| `body`           | Richtext    | Full article content           |
| `categories`     | Multi-option | Tag-style categories          |
| `date`           | Date        |                                |
| `seo`            | Group       | title, description, og_image   |

### `page_faq`

| Field    | Type          | Notes                           |
|----------|---------------|---------------------------------|
| `title`  | Text          |                                 |
| `intro`  | Textarea      | Optional intro copy             |
| `faqs`   | Multi-Stories | References to `data/faq-items/*` |
| `seo`    | Group         |                                 |

### `page_generic`

For About, Contact, 404, and any future static pages.

| Field  | Type  | Notes                                    |
|--------|-------|------------------------------------------|
| `hero` | Blok  | Single: `hero_blok`                      |
| `body` | Bloks | Composable: any section bloks            |
| `seo`  | Group | title, description, og_image, canonical  |

---

## Nestable Bloks (Section Components)

These are the building blocks editors drop into any page's `body` field.

### `hero_blok`

| Field              | Type        | Notes                                  |
|--------------------|-------------|----------------------------------------|
| `title`            | Text        | Supports `\n` for line breaks          |
| `subtitle`         | Text        |                                        |
| `tagline`          | Text        | Small uppercase text above title       |
| `background_images`| Multi-asset | Rotating backgrounds                   |
| `background_video` | Asset       | MP4 video (overrides images)           |
| `cta_text`         | Text        | e.g. "Book Now"                        |
| `cta_link`         | URL         |                                        |
| `rotation_interval`| Number      | Seconds between image transitions (default 6) |
| `show_scroll`      | Boolean     | Show "Or Scroll Down" indicator        |

### `content_block`

| Field       | Type     | Notes                              |
|-------------|----------|------------------------------------|
| `heading`   | Text     |                                    |
| `body`      | Richtext | Formatted paragraphs               |
| `image`     | Asset    | Side image                         |
| `image_alt` | Text     |                                    |
| `reverse`   | Boolean  | Flip image/text sides              |
| `background`| Select   | "dark" or "dark-lighter"           |

### `image_grid`

| Field    | Type        | Notes                                |
|----------|-------------|--------------------------------------|
| `images` | Multi-asset | 2–4 images                           |
| `variant`| Select      | "collage", "two-up", "three-up"     |

### `image_break`

| Field    | Type   | Notes                         |
|----------|--------|-------------------------------|
| `image`  | Asset  | Full-width image              |
| `alt`    | Text   |                               |
| `caption`| Text   | Optional overlay caption      |
| `height` | Select | "short", "medium", "tall"     |

### `reviews_section`

| Field     | Type          | Notes                              |
|-----------|---------------|------------------------------------|
| `heading` | Text          | e.g. "What Our Guests Say"         |
| `reviews` | Multi-Stories | References to `data/reviews/*`     |

### `cta_section`

| Field           | Type | Notes                        |
|-----------------|------|------------------------------|
| `heading`       | Text | e.g. "Ride the Waves."      |
| `body`          | Text | Supporting paragraph          |
| `primary_text`  | Text | e.g. "Book Your Trip"        |
| `primary_link`  | URL  |                              |
| `secondary_text`| Text | e.g. "Get in Touch"          |
| `secondary_link`| URL  |                              |

### `stats_section`

| Field  | Type          | Notes                          |
|--------|---------------|--------------------------------|
| `stats`| Multi-Stories | References to `data/stats/*`   |

### `inclusions_grid`

| Field       | Type          | Notes                              |
|-------------|---------------|------------------------------------|
| `heading`   | Text          | e.g. "Your booking always includes"|
| `inclusions`| Multi-Stories | References to `data/inclusions/*`  |

### `faq_section`

| Field    | Type          | Notes                           |
|----------|---------------|---------------------------------|
| `heading`| Text          |                                 |
| `faqs`   | Multi-Stories | References to `data/faq-items/*`|

### `meal_blok` (nested in food page)

| Field  | Type     | Notes                       |
|--------|----------|-----------------------------|
| `name` | Text     | e.g. "Breakfast"            |
| `time` | Text     | e.g. "7:30 – 9:30"         |
| `desc` | Textarea | Meal description            |

### `facility_item` (nested in rooms page)

| Field  | Type     | Notes                       |
|--------|----------|-----------------------------|
| `name` | Text     | e.g. "Swimming Pool"        |
| `icon` | Textarea | SVG path data (optional)    |

---

## Global Components

### `global_header`

| Field       | Type  | Notes                              |
|-------------|-------|------------------------------------|
| `nav_items` | Bloks | Nested `nav_link` bloks            |
| `cta_text`  | Text  | "Book" button text                 |
| `cta_link`  | URL   | Default booking link               |

The Destinations dropdown is auto-generated from all published `page_camp` stories.

### `global_footer`

| Field            | Type        | Notes                           |
|------------------|-------------|---------------------------------|
| `background`     | Asset       | Water background image          |
| `columns`        | Bloks       | Nested `footer_column` bloks    |
| `social_links`   | Bloks       | Nested `social_link` bloks      |
| `copyright`      | Text        |                                 |

---

## How Reusable References Work (Editor Workflow)

### Adding inclusions to a camp page

1. Editor opens **Bali > Green Bowl** story in Storyblok
2. In the `inclusions` field, clicks "Add stories"
3. Picker opens showing all entries in `data/inclusions/`
4. Editor checks: Surf Guiding, Breakfast, Dinner, WiFi, Yoga
5. Saves — those 5 inclusions render on the camp page
6. Opens **Portugal > Ericeira** story, picks the same or different inclusions

### Updating an inclusion globally

1. Editor opens `data/inclusions/breakfast`
2. Changes description from "Rich breakfast to get started" to "Three-course buffet"
3. Saves — every camp page referencing Breakfast now shows the updated text

### Adding a new room type

1. Editor creates new story in `data/room-types/` called "Surf Lodge"
2. Adds name, description, tag, images
3. Opens any camp's Rooms sub-page, adds "Surf Lodge" to `room_types` field
4. The new room type is immediately available to all camps

---

## Astro Component ↔ Storyblok Blok Mapping

| Astro Component       | Storyblok Blok       | Notes                        |
|-----------------------|----------------------|------------------------------|
| `Hero.astro`          | `hero_blok`          | Supports video + image rotation |
| `ContentBlock.astro`  | `content_block`      | Text + image, reversible     |
| `ImageGrid.astro`     | `image_grid`         | Collage, two-up, three-up   |
| `ImageBreak.astro`    | `image_break`        | Full-width image break       |
| `Reviews.astro`       | `reviews_section`    | References review stories    |
| `CTASection.astro`    | `cta_section`        | Customisable headings + links|
| `StatsSection.astro`  | `stats_section`      | References stat stories      |
| Camp inclusions grid  | `inclusions_grid`    | References inclusion stories |

---

## Migration Order

1. **Set up Storyblok space** — create content types and blok schemas
2. **Populate shared data** — create all entries in `data/` folders (inclusions, amenities, room types, etc.)
3. **Create country pages** — migrate hardcoded `countryContent` from `[country].astro`
4. **Create camp pages** — migrate data from `destinations` array + camp sub-pages
5. **Connect Astro** — install `@storyblok/astro`, map bloks to components, switch from static data to API calls
6. **Blog migration** — move hardcoded posts to Storyblok
7. **Global components** — header/footer from Storyblok (optional, can stay in code)

---

## Technical Notes

- **Astro output mode**: Switch to `output: "hybrid"` for Storyblok visual editor support (preview routes use SSR, production stays static)
- **Storyblok bridge**: Enable for live preview in the visual editor
- **Image handling**: Use Storyblok's image service (`a.storyblok.com`) with transforms for responsive sizes
- **Camp sub-page inheritance**: The `page_camp_surf/rooms/food` content types use the Storyblok API to fetch their parent `page_camp` story for shared fields (hero images, booking URL, camp name). This keeps data DRY.
- **Destinations dropdown**: Auto-generated at build time by querying all `page_camp` stories, grouped by their parent folder (country). No manual menu management needed.
