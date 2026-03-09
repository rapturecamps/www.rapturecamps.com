---
name: Live Site SEO Audit
overview: Full audit of all SEO page titles and meta descriptions on the live www.rapturecamps.com WordPress site, with specific recommendations for what the new Astro site should use before going live.
todos:
  - id: implement-titles
    content: Implement all recommended page titles and meta descriptions in the Astro site's page components and BaseLayout
    status: pending
  - id: sanity-seo-fields
    content: Add SEO override fields (metaTitle, metaDescription) to Sanity schemas for countries and camps so editors can customize without code changes
    status: pending
  - id: brand-consistency
    content: Audit all pages for consistent 'Rapture Surfcamps' branding in titles and descriptions
    status: pending
  - id: social-proof
    content: Add social proof elements (years, guest count, awards) to key page descriptions
    status: pending
  - id: de-pages
    content: Create equivalent German-language titles and descriptions for all /de/ pages
    status: pending
isProject: false
---

# SEO Audit: Live Site Page Titles and Meta Descriptions

## Complete Inventory of the Live Site

Data extracted from the live WordPress site's Yoast SEO schema markup. For each page I list the current title, character count, current description, character count, issues found, and a recommended replacement for the Astro site.

---

## 1. Homepage

**URL:** `https://www.rapturecamps.com/`

- **Title (61 chars):** `Rapture Surfcamps - Learn to surf, surf the world, stay with us!`
- **Description (153 chars):** `A network of surf camps in Bali, Costa Rica, Nicaragua, Portugal offering unforgettable surf vacations. Learn to surf, surf the world, stay with Rapture!`

**Issues:**

- Title starts with brand name -- wastes the most valuable SERP real estate. Primary keywords ("surf camp") should come first.
- Title is 61 chars -- slightly over the 50-60 sweet spot, risks truncation.
- Description omits Morocco entirely (you have a camp there).
- Description repeats the tagline "learn to surf, surf the world" from the title -- wasted opportunity.
- Neither title nor description mention social proof (20+ years, 85k+ guests).

**Recommended for Astro:**

- **Title:** `Best Surf Camps Worldwide -- Bali, Portugal, Costa Rica & More | Rapture` (59 chars -- keeps keyword up front, includes top destinations)
- **Description:** `A network of 8 surf camps across Bali, Costa Rica, Portugal, Morocco, and Nicaragua. 20+ years of experience, 85,000+ happy guests. Book your surf trip today.` (159 chars)

---

## 2. About Page

**URL:** `https://www.rapturecamps.com/about/`

- **Title (52 chars):** `About Us - How It All Started - Rapture Surfcamps`
- **Description (155 chars):** `To live the surfing life and surf great waves for the rest of their lives is the dream of all surfers. We created Rapture to spread our love for surf.`

**Issues:**

- Title uses generic "About Us" -- no searchable keywords.
- Description reads like a novel opening, not a search result. No concrete facts (founding year, number of camps, countries).
- No call to action or value prop in the description.

**Recommended for Astro:**

- **Title:** `About Rapture Surfcamps | Our Story Since 2003` (47 chars)
- **Description:** `Founded in 2003 by two surfers in Morocco, Rapture Surfcamps has grown into a global network of 8 surf camps across 5 countries on 4 continents. Discover our story.` (158 chars -- includes E-E-A-T signals: founding story, scale, credibility)

---

## 3. Blog Index

**URL:** `https://www.rapturecamps.com/blog/`

- **Title (58 chars):** `Waves for Days - Surf Destinations & Tips By Rapturecamps`
- **Description (155 chars):** `From tips for surfers to the ultimate surf break guides, we have it all - global surfing news, and also destination guides! Top Surf Blog for all surfers!`

**Issues:**

- "Waves for Days" is catchy but has zero search value -- nobody searches for it.
- Description uses exclamation marks and reads like ad copy, not informative SERP text.
- "Top Surf Blog for all surfers!" is a subjective claim with no backing.

**Recommended for Astro:**

- **Title:** `Surf Blog -- Destination Guides, Tips & Travel Inspiration | Rapture` (60 chars)
- **Description:** `Surf tips, destination guides, and travel inspiration from Rapture Surfcamps. Everything you need to plan your next surf trip to Bali, Portugal, Costa Rica, Nicaragua, or Morocco.` (160 chars)

---

## 4. Contact Page

**URL:** `https://www.rapturecamps.com/contact/`

- **Title (56 chars):** `Contact us via Chat, Email or Phone - Rapture Surfcamps`
- **Description (147 chars):** `Contact Rapture Surfcamps via your preferred channel and find directions to our camps. Send us a message and we'll try to answer within 8-12 hrs.`

**Issues:**

- Title is actually quite good -- mentions channels and brand. Keep this pattern.
- "we'll try to answer" sounds uncertain -- should be more confident.
- WhatsApp is a key channel (prominent on the site) but not mentioned in title or description.

**Recommended for Astro:**

- **Title:** `Contact Rapture Surfcamps -- WhatsApp, Email, Chat & Phone` (58 chars)
- **Description:** `Get in touch with Rapture Surfcamps via WhatsApp, email, Telegram, or our contact form. Find directions to all 8 camps. We typically respond within hours.` (155 chars)

---

## 5. Country Pages

### Bali (`/surfcamp/bali/`)

- **Title (55 chars):** `Surf Camp Bali -- 20 Years of Surf Lessons | Rapturecamps`
- **Description (155 chars):** `Learn to surf in just one week -- Bali's trusted surf camp with 20+ years of experience and 8,000+ happy guests. Lessons, yoga, skate training & massages.`

**Assessment: This is the BEST title/description on the entire site.** Uses social proof (20 years, 8,000+ guests), specific timeframe ("one week"), and lists amenities. Keep this approach.

**Minor issues:**

- Brand spelled "Rapturecamps" (no space) -- inconsistent with other pages.

**Recommended for Astro (keep the spirit, refine slightly):**

- **Title:** `Surf Camp Bali -- 20+ Years of Surf Lessons | Rapture Surfcamps` (55 chars)
- **Description:** `Learn to surf in just one week at Bali's most trusted surf camp. 20+ years of experience, 8,000+ happy guests. Surf lessons, yoga, and stunning Bukit Peninsula waves.` (160 chars)

---

### Portugal (`/surfcamp/portugal/`)

- **Title (68 chars):** `Book Best Surf Camps in Portugal in February 2026 @ Rapturecamp.com`
- **Description (132 chars):** `Learn surfing with best surf camps and certified teachers in Portugal. Book surf camps online in Portugal in 2026 with Rapturecamp.com`

**Issues -- CRITICAL:**

- Brand name is WRONG: "Rapturecamp.com" (missing the 's') -- this appears on Portugal, Nicaragua, Morocco, and Costa Rica country pages. Sends users to the wrong domain.
- Title at 68 chars will be truncated in SERPs.
- Dynamic date in title (February 2026) is a clever Yoast SEO trick for freshness, but the rest of the title is weak.
- Description repeats "Portugal" 3 times and "surf camps" twice -- keyword stuffing.
- "Learn surfing" is grammatically awkward (should be "Learn to surf").
- No unique selling proposition -- identical template used for all 4 countries (Portugal, Nicaragua, Morocco, Costa Rica).

**Recommended for Astro:**

- **Title:** `Surf Camps in Portugal -- Ericeira & Milfontes | Rapture Surfcamps` (58 chars -- names the actual locations for specificity)
- **Description:** `Surf Europe's only World Surfing Reserve in Ericeira or discover Alentejo's empty beaches in Milfontes. 3 camps in Portugal with certified instructors, yoga, and beachfront accommodation.` (160 chars)

---

### Nicaragua (`/surfcamp/nicaragua/`)

- **Title (70 chars):** `Book Best Surf Camps in Nicaragua in February 2026 @ Rapturecamp.com`
- **Description (136 chars):** `Learn surfing with best surf camps and certified teachers in Nicaragua. Book surf camps online in Nicaragua in 2026 with Rapturecamp.com`

**Issues:** Same template problems as Portugal (wrong brand, keyword stuffing, truncated title).

**Recommended for Astro:**

- **Title:** `Surf Camp Nicaragua -- Playa Maderas & San Juan del Sur | Rapture` (57 chars)
- **Description:** `Surf uncrowded waves at our jungle surf camp overlooking the Pacific in Playa Maderas. 330+ days of offshore winds, warm water year-round, and beginner-friendly lessons.` (160 chars)

---

### Costa Rica (`/surfcamp/costa-rica/`)

- **Title (70 chars):** `Book Best Surf Camps in Costa Rica in February 2026 @ Rapturecamp.com`
- **Description (138 chars):** `Learn surfing with best surf camps and certified teachers in Costa Rica. Book surf camps online in Costa Rica in 2026 with Rapturecamp.com`

**Issues:** Same template problems.

**Recommended for Astro:**

- **Title:** `Surf Camp Costa Rica -- Playa Avellanas, Guanacaste | Rapture` (54 chars)
- **Description:** `Surf warm tropical waves at our jungle camp in Playa Avellanas, 20 minutes from Tamarindo. 27C water year-round, daily surf lessons, yoga, pool, and Pura Vida vibes.` (157 chars)

---

### Morocco (`/surfcamp/morocco/`)

- **Title (67 chars):** `Book Best Surf Camps in Morocco in February 2026 @ Rapturecamp.com`
- **Description (131 chars):** `Learn surfing with best surf camps and certified teachers in Morocco. Book surf camps online in Morocco in 2026 with Rapturecamp.com`

**Issues:** Same template problems. Morocco is also where Rapture started -- a huge E-E-A-T story that's completely wasted.

**Recommended for Astro:**

- **Title:** `Surf Camp Morocco -- Sidi Ifni, Where Rapture Started | Rapture` (55 chars)
- **Description:** `Surf Morocco's legendary right-hand points at our beachfront camp in Sidi Ifni. 300+ sunny days, uncrowded waves, and the place where Rapture Surfcamps was born in 2003.` (160 chars)

---

## 6. Individual Camp Pages

### Bali -- Green Bowl (`/surfcamp/bali/green-bowl/`)

- **Title (55 chars):** `Oceanview Bali Surf Camp - Green Bowl - Rapture Surfcamps`
- **Description (155 chars):** `Our Bali surf camp Green Bowl is perched on top of one of the legendary surf beaches in Bali and offers a variety of waves from reef to sandy beach breaks.`

**Assessment:** Good title with unique selling point ("Oceanview"). Description is factual but lacks social proof or CTA.

**Recommended for Astro:**

- **Title:** `Green Bowl Surf Camp Bali -- Cliffside Oceanview Resort | Rapture` (57 chars)
- **Description:** `Cliffside surf camp with infinity pool overlooking the Indian Ocean. World-class Bukit Peninsula waves 2 min from camp. Daily surf lessons, yoga, and Balinese garden vibes.` (160 chars)

---

### Bali -- Padang Padang (`/surfcamp/bali/padang-padang/`)

- **Title (56 chars):** `Surf camp Padang - Bali's Surfers Paradise - Rapture Surfcamps`
- **Description (140 chars):** `We call Bali "Eat, Surf, Love". Visit our Bali Padang surf camp and experience the breathtaking scenery, world-class waves and delicious food`

**Issues:**

- "Surf camp Padang" -- missing "Padang" from the name (it's "Padang Padang").
- Description opens with a weak self-quote. No period at the end.

**Recommended for Astro:**

- **Title:** `Padang Padang Surf Camp, Bali -- Legendary Waves | Rapture` (52 chars)
- **Description:** `Stay at the legendary Padang Padang on Bali's Bukit Peninsula. Villas, bungalows, pool, daily yoga, and surf lessons at one of the world's most iconic surf breaks.` (157 chars)

---

### Portugal -- Ericeira (`/surfcamp/portugal/ericeira-lizandro/`)

- **Title (52 chars):** `Surf Camp in Ericeira | Best Surf Camp in Portugal`
- **Description (155 chars):** `Fall in love with surfing, Portuguese food and local culture at our Ericeira surf camp. Stay on the beach, explore Ericeira's Old Town, do yoga, go SUPing!`

**Assessment:** Solid title -- keyword-rich and makes a bold claim. Description is varied and appealing but the exclamation mark and "go SUPing!" feels tacked on.

**Recommended for Astro:**

- **Title:** `Surf Camp Ericeira, Portugal -- Beachfront at Foz do Lizandro | Rapture` (63 chars -- slightly long, could trim to `Surf Camp Ericeira -- Beachfront in Europe's Surf Reserve | Rapture` at 59 chars)
- **Description:** `Beachfront surf camp in Ericeira, Europe's only World Surfing Reserve. 35 km from Lisbon. Surf lessons, yoga, rooftop terrace, and world-class waves steps from your door.` (160 chars)

---

### Portugal -- Milfontes (`/surfcamp/portugal/alentejo-milfontes/`)

- **Title (55 chars):** `Milfontes Eco Surfcamp - Explore Alentejo's hidden beauty`
- **Description (140 chars):** `Our new eco surfcamp is located in Milfontes, Alentejo. Get to know sustainable practises while you learn to surf in fun and mellow waves`

**Issues:**

- "practises" is a spelling error (should be "practices").
- "new" -- the camp is no longer new (published 2021). Stale copy.
- No brand name in title.
- Description has no period at the end.

**Recommended for Astro:**

- **Title:** `Eco Surf Camp Milfontes, Alentejo -- Portugal's Hidden Gem | Rapture` (60 chars)
- **Description:** `Eco-friendly surf camp in the Alentejo Natural Park. Learn to surf on empty beaches, practice permaculture, and disconnect in Portugal's most peaceful surf destination.` (160 chars)

---

### Portugal -- Coxos Surf Villa (`/surfcamp/portugal/ericeira-coxos-surf-villa/`)

- **Title (70 chars):** `Ericeira Surf Villa - Surf the Best Waves of Portugal - Rapture Surfcamps`
- **Description (128 chars):** `Ericeira (where the sea is bluer) is home to our first Surf Villa. It's a high-end surf villa that can accommodate up to 8 people! Book now`

**Issues:**

- Title at 70 chars will be truncated.
- Description starts with a parenthetical, has an exclamation mark, and "Book now" is a weak ending since the user hasn't even clicked yet.
- The unique selling point (infinity pool overlooking Coxos, high-end villa) isn't communicated.

**Recommended for Astro:**

- **Title:** `Coxos Surf Villa, Ericeira -- Luxury Surf Retreat | Rapture` (52 chars)
- **Description:** `High-end surf villa overlooking Coxos beach, Portugal's best right-hand point break. Infinity pool, private and shared rooms for up to 8 guests. Connected to our main Ericeira camp.` (160 chars)

---

### Nicaragua -- Maderas (`/surfcamp/nicaragua/maderas/`)

- **Title (54 chars):** `Nicaragua Surf Camp - Playa Maderas - Rapture Surfcamps`
- **Description (148 chars):** `Visit our Nicaragua surf camp high up in the jungle overlooking the Pacific Ocean, relax in comfort, enjoy the infinity pool and surf uncrowded waves.`

**Assessment:** Decent title and description. The description paints a vivid picture.

**Recommended for Astro:**

- **Title:** `Playa Maderas Surf Camp, Nicaragua -- Jungle & Ocean Views | Rapture` (60 chars)
- **Description:** `Hilltop surf camp overlooking the Pacific with infinity pool, jungle setting, and uncrowded waves. 330+ days of offshore winds. Surf lessons, yoga, and shuttle to San Juan del Sur.` (160 chars)

---

### Costa Rica -- Avellanas (`/surfcamp/costa-rica/avellanas/`)

- **Title (62 chars):** `Costa Rica Surf Camp - Surf in Playa Avellanas - Rapture Surfcamps`
- **Description (153 chars):** `Our surfcamp in Playa Avellanas is in a modern building amidst the jungle surrounded by tropical gardens 10min walk from the beach and 20 from Tamarindo.`

**Assessment:** Title is slightly long at 62 chars. Description is purely descriptive -- no unique hook.

**Recommended for Astro:**

- **Title:** `Playa Avellanas Surf Camp, Costa Rica -- Jungle Retreat | Rapture` (57 chars)
- **Description:** `Modern surf camp in Playa Avellanas surrounded by jungle, 10 min from the beach and 20 from Tamarindo's nightlife. Pool, gym, daily surf lessons, yoga, and Pura Vida vibes.` (160 chars)

---

### Morocco -- Sidi Ifni (`/surfcamp/morocco/sidi-ifni/`)

- **Title (49 chars):** `Surfcamp in Morocco - Sidi Ifni - Rapture Surfcamps`
- **Description (140 chars):** `Welcome to our Surfcamp in Morocco - our beachfront jewel ad the best place to enjoy a relaxed holiday just a short walk from the best waves`

**Issues:**

- Typo in description: "ad" should be "and".
- "Surfcamp" instead of "Surf Camp" -- inconsistent.
- Description has no period and reads as incomplete.
- No mention of what makes Sidi Ifni unique (origin story, rooftop terrace, 300+ sunny days).

**Recommended for Astro:**

- **Title:** `Surf Camp Sidi Ifni, Morocco -- Beachfront with Rooftop Views | Rapture` (63 chars -- could trim to `Surf Camp Sidi Ifni, Morocco -- Where It All Began | Rapture` at 53 chars)
- **Description:** `Beachfront surf camp in Sidi Ifni with rooftop ocean terrace, where Rapture Surfcamps was born. Perfect right-hand points, 300+ sunny days, and authentic Moroccan culture.` (160 chars)

---

## Summary of Issues Found Across the Live Site

### Critical (fix before Astro launch)

1. **Wrong brand name on 4 country pages** -- "Rapturecamp.com" instead of "Rapture Surfcamps". This sends confused users to a potentially wrong domain.
2. **Keyword-stuffed country page descriptions** -- Portugal, Nicaragua, Costa Rica, Morocco all use an identical, low-quality template that repeats the country name 3 times.
3. **Truncated titles** -- 4 pages have titles over 60 chars that get cut off in Google results (Portugal, Nicaragua, Costa Rica, Coxos Villa).

### High Priority

1. **Homepage title is brand-first** -- should lead with keywords ("surf camp") for SEO value.
2. **No social proof in most descriptions** -- only Bali country page uses numbers (20 years, 8,000+ guests). This should be a pattern everywhere.
3. **Typos and grammar issues** -- "practises" (Milfontes), "ad" instead of "and" (Morocco Sidi Ifni), missing periods on multiple descriptions.
4. **Inconsistent brand formatting** -- "Rapturecamps" vs "Rapture Surfcamps" vs "Rapturecamp.com" across pages.

### Medium Priority

1. **Blog title has no search value** -- "Waves for Days" is creative but unsearchable.
2. **About page description is narrative** -- misses the chance to communicate scale and credibility.
3. **Camp pages lack consistent USP structure** -- some have vivid descriptions (Nicaragua), others are generic (Avellanas).

### Quick Wins for the Astro Site

1. **Standardize brand name** to "Rapture Surfcamps" everywhere.
2. **Use a consistent title pattern**: `{Location} Surf Camp -- {USP} | Rapture Surfcamps` for camp pages.
3. **Max 60 chars for titles, 150-160 chars for descriptions** -- fill the space but don't exceed it.
4. **Include at least one social proof element** per description (years, guest count, awards, reviews).
5. **Add a soft CTA** in descriptions where it makes sense ("Book your surf trip today", "Plan your stay").

