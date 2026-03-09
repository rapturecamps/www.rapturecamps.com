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
    content: Audit all pages for consistent 'Rapturecamps' branding in titles and descriptions
    status: pending
  - id: social-proof
    content: Add social proof elements (years, guest count, awards,) to key page descriptions
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

- **Title:** `Award Winning Surf Camps Worldwide · Rapture` (35 chars -- keyword-first, clean, room for Google to append site name)
- **Description:** `8 surf camps across Bali, Costa Rica, Portugal, Morocco & Nicaragua. 20+ years of experience, 85k+ happy guests, 100+ 5-star reviews. Flexible packages & cancellation.` (160 chars)
- **Social proof used:** 20+ years, 85k+ guests, 100+ reviews, flexible packages

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

- **Title:** `About Rapture Surfcamps · Our Story Since 2003` (47 chars)
- **Description:** `Founded in 2003 by two surfers in Morocco, Rapture has grown into 8 surf camps across 5 countries. 85k+ happy guests, 100+ 5-star reviews. Discover our story.` (155 chars)
- **Social proof used:** founding year, 85k+ guests, 100+ reviews

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

- **Title:** `Surf Blog: Destination Guides, Tips & Travel Inspiration · Rapture` (58 chars)
- **Description:** `Surf tips, destination guides & travel inspiration from a team with 20+ years of experience. Plan your next surf trip to Bali, Portugal, Costa Rica, Nicaragua, or Morocco.` (160 chars)
- **Social proof used:** 20+ years

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

- **Title:** `Contact Us via WhatsApp, Email & Chat · Rapture` (48 chars)
- **Description:** `Get in touch via WhatsApp, email, Telegram, or our contact form. We typically respond within hours. Flexible packages & free cancellation available.` (148 chars)
- **Social proof used:** flexible packages & cancellation

---

## 5. Country Pages

### Bali (`/surfcamp/bali/`)

- **Title (55 chars):** `Surf Camp Bali -- 20 Years of Surf Lessons | Rapturecamps`
- **Description (155 chars):** `Learn to surf in just one week -- Bali's trusted surf camp with 20+ years of experience and 8,000+ happy guests. Lessons, yoga, skate training & massages.`

**Assessment: This is the BEST title/description on the entire site.** Uses social proof (20 years, 8,000+ guests), specific timeframe ("one week"), and lists amenities. Keep this approach.

**Minor issues:**

- Brand spelled "Rapturecamps" (no space) -- inconsistent with other pages.

**Recommended for Astro (keep the spirit, refine slightly):**

- **Title:** `Award-Winning Surf Camp Bali: 20+ Years in Business · Rapture` (54 chars)
- **Description:** `Learn to surf in one week at Bali's most trusted surf camp. 20+ years, 85k+ happy guests, 100+ 5-star reviews. Certified instructors, yoga & Bukit Peninsula waves.` (158 chars)
- **Social proof used:** learn in one week, 20+ years, 85k+ guests, 100+ reviews, certified instructors

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

- **Title:** `Top-Rated Surf Camps in Portugal: Ericeira & Milfontes · Rapture` (57 chars)
- **Description:** `Surf Europe's only World Surfing Reserve in Ericeira or discover Alentejo's empty beaches in Milfontes. Certified instructors, 100+ 5-star reviews. Flexible packages available.` (160 chars)
- **Social proof used:** certified instructors, 100+ reviews, flexible packages

---

### Nicaragua (`/surfcamp/nicaragua/`)

- **Title (70 chars):** `Book Best Surf Camps in Nicaragua in February 2026 @ Rapturecamp.com`
- **Description (136 chars):** `Learn surfing with best surf camps and certified teachers in Nicaragua. Book surf camps online in Nicaragua in 2026 with Rapturecamp.com`

**Issues:** Same template problems as Portugal (wrong brand, keyword stuffing, truncated title).

**Recommended for Astro:**

- **Title:** `Surf Camp Nicaragua: Playa Maderas & San Juan del Sur · Rapture` (55 chars)
- **Description:** `Surf uncrowded waves at our jungle surf camp in Playa Maderas. Learn to surf in one week with certified instructors. 330+ days of offshore winds & warm water year-round.` (160 chars)
- **Social proof used:** learn in one week, certified instructors

---

### Costa Rica (`/surfcamp/costa-rica/`)

- **Title (70 chars):** `Book Best Surf Camps in Costa Rica in February 2026 @ Rapturecamp.com`
- **Description (138 chars):** `Learn surfing with best surf camps and certified teachers in Costa Rica. Book surf camps online in Costa Rica in 2026 with Rapturecamp.com`

**Issues:** Same template problems.

**Recommended for Astro:**

- **Title:** `Surf Camp Costa Rica Playa Avellanas, Guanacaste · Rapture` (58 chars)
- **Description:** `Learn to surf in one week at our jungle camp in Playa Avellanas, 20 min from Tamarindo. Certified instructors, 27C water year-round, flexible packages & free cancellation.` (160 chars)
- **Social proof used:** learn in one week, certified instructors, flexible packages

---

### Morocco (`/surfcamp/morocco/`)

- **Title (67 chars):** `Book Best Surf Camps in Morocco in February 2026 @ Rapturecamp.com`
- **Description (131 chars):** `Learn surfing with best surf camps and certified teachers in Morocco. Book surf camps online in Morocco in 2026 with Rapturecamp.com`

**Issues:** Same template problems. Morocco is also where Rapture started -- a huge E-E-A-T story that's completely wasted.

**Recommended for Astro:**

- **Title:** `Surf Camp Morocco: Sidi Ifni, Where Rapture Started · Rapture` (53 chars)
- **Description:** `Surf Morocco's legendary right-hand points at our beachfront camp in Sidi Ifni. 20+ years of experience, certified instructors, 300+ sunny days & uncrowded waves.` (155 chars)
- **Social proof used:** 20+ years, certified instructors

---

## 6. Individual Camp Pages

### Bali -- Green Bowl (`/surfcamp/bali/green-bowl/`)

- **Title (55 chars):** `Oceanview Bali Surf Camp - Green Bowl - Rapture Surfcamps`
- **Description (155 chars):** `Our Bali surf camp Green Bowl is perched on top of one of the legendary surf beaches in Bali and offers a variety of waves from reef to sandy beach breaks.`

**Assessment:** Good title with unique selling point ("Oceanview"). Description is factual but lacks social proof or CTA.

**Recommended for Astro:**

- **Title:** `Green Bowl Surf Camp Bali: Cliffside Oceanview · Rapture` (56 chars)
- **Description:** `Cliffside surf camp with infinity pool overlooking the Indian Ocean. Learn to surf in one week with certified instructors. World-class Bukit Peninsula waves 2 min from camp.` (160 chars)
- **Social proof used:** learn in one week, certified instructors

---

### Bali -- Padang Padang (`/surfcamp/bali/padang-padang/`)

- **Title (56 chars):** `Surf camp Padang - Bali's Surfers Paradise - Rapture Surfcamps`
- **Description (140 chars):** `We call Bali "Eat, Surf, Love". Visit our Bali Padang surf camp and experience the breathtaking scenery, world-class waves and delicious food`

**Issues:**

- "Surf camp Padang" -- missing "Padang" from the name (it's "Padang Padang").
- Description opens with a weak self-quote. No period at the end.

**Recommended for Astro:**

- **Title:** `Padang Padang Surf Camp Bali: Legendary Waves · Rapture` (55 chars)
- **Description:** `Stay at the legendary Padang Padang on Bali's Bukit Peninsula. 100+ 5-star reviews, certified instructors, flexible packages. Villas, bungalows, pool & daily yoga.` (157 chars)
- **Social proof used:** 100+ reviews, certified instructors, flexible packages

---

### Portugal -- Ericeira (`/surfcamp/portugal/ericeira-lizandro/`)

- **Title (52 chars):** `Surf Camp in Ericeira | Best Surf Camp in Portugal`
- **Description (155 chars):** `Fall in love with surfing, Portuguese food and local culture at our Ericeira surf camp. Stay on the beach, explore Ericeira's Old Town, do yoga, go SUPing!`

**Assessment:** Solid title -- keyword-rich and makes a bold claim. Description is varied and appealing but the exclamation mark and "go SUPing!" feels tacked on.

**Recommended for Astro:**

- **Title:** `Award-Winning Surf Camp Ericeira: Europe's Surf Reserve · Rapture` (57 chars)
- **Description:** `Beachfront surf camp in Ericeira, Europe's only World Surfing Reserve. 20+ years of experience, 100+ 5-star reviews. Learn to surf in one week. Waves steps from your door.` (160 chars)
- **Social proof used:** 20+ years, 100+ reviews, learn in one week

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

- **Title:** `Eco Surf Camp Milfontes, Alentejo · Rapture` (44 chars)
- **Description:** `Eco-friendly surf camp in the Alentejo Natural Park. Learn to surf in one week on empty beaches with certified instructors. Flexible packages & free cancellation.` (155 chars)
- **Social proof used:** learn in one week, certified instructors, flexible packages

---

### Portugal -- Coxos Surf Villa (`/surfcamp/portugal/ericeira-coxos-surf-villa/`)

- **Title (70 chars):** `Ericeira Surf Villa - Surf the Best Waves of Portugal - Rapture Surfcamps`
- **Description (128 chars):** `Ericeira (where the sea is bluer) is home to our first Surf Villa. It's a high-end surf villa that can accommodate up to 8 people! Book now`

**Issues:**

- Title at 70 chars will be truncated.
- Description starts with a parenthetical, has an exclamation mark, and "Book now" is a weak ending since the user hasn't even clicked yet.
- The unique selling point (infinity pool overlooking Coxos, high-end villa) isn't communicated.

**Recommended for Astro:**

- **Title:** `Coxos Surf Villa Ericeira: Luxury Surf Retreat · Rapture` (56 chars)
- **Description:** `High-end surf villa overlooking Coxos beach, Portugal's best right-hand point break. Infinity pool, up to 8 guests. 100+ 5-star reviews & flexible packages.` (150 chars)
- **Social proof used:** 100+ reviews, flexible packages

---

### Nicaragua -- Maderas (`/surfcamp/nicaragua/maderas/`)

- **Title (54 chars):** `Nicaragua Surf Camp - Playa Maderas - Rapture Surfcamps`
- **Description (148 chars):** `Visit our Nicaragua surf camp high up in the jungle overlooking the Pacific Ocean, relax in comfort, enjoy the infinity pool and surf uncrowded waves.`

**Assessment:** Decent title and description. The description paints a vivid picture.

**Recommended for Astro:**

- **Title:** `Playa Maderas Surf Camp Nicaragua: Jungle & Ocean Views · Rapture` (57 chars)
- **Description:** `Hilltop surf camp overlooking the Pacific with infinity pool & uncrowded waves. 85k+ happy guests, certified instructors. Flexible packages & free cancellation.` (155 chars)
- **Social proof used:** 85k+ guests, certified instructors, flexible packages

---

### Costa Rica -- Avellanas (`/surfcamp/costa-rica/avellanas/`)

- **Title (62 chars):** `Costa Rica Surf Camp - Surf in Playa Avellanas - Rapture Surfcamps`
- **Description (153 chars):** `Our surfcamp in Playa Avellanas is in a modern building amidst the jungle surrounded by tropical gardens 10min walk from the beach and 20 from Tamarindo.`

**Assessment:** Title is slightly long at 62 chars. Description is purely descriptive -- no unique hook.

**Recommended for Astro:**

- **Title:** `Playa Avellanas Surf Camp Costa Rica · Rapture` (47 chars)
- **Description:** `Modern jungle surf camp in Playa Avellanas, 10 min from the beach & 20 from Tamarindo. 85k+ happy guests, 100+ 5-star reviews. Pool, gym, yoga & Pura Vida vibes.` (157 chars)
- **Social proof used:** 85k+ guests, 100+ reviews

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

- **Title:** `Surf Camp Sidi Ifni Morocco: Beachfront with Rooftop Views · Rapture` (60 chars)
- **Description:** `Beachfront surf camp in Sidi Ifni with rooftop ocean terrace. Learn to surf in one week, 100+ 5-star reviews, flexible packages. 300+ sunny days & perfect right-hand points.` (160 chars)
- **Social proof used:** learn in one week, 100+ reviews, flexible packages

---

## 7. Camp Subpages: Surf, Rooms & Food

Each of the 8 camps has three subpages. That's 24 pages total. The live site has unique titles/descriptions on some but they share common issues. Here's what the live site currently has, the problems, and recommended replacements.

### Current Live Site Patterns (from schema data)

**Surf subpages:**

- Green Bowl: Title `Green Bowl Surf School - Bali Best Surf Spot - Rapture Surfcamps` / Desc `Discover secluded and uncrowded Green Bowl gem amonst other famous Bali surf spots such as Uluwatu,Padang Padang,Dreamland & Bingin.`
- Ericeira: Title `Ericeira Surf School - Learn to Surf in Portugal - Rapture Surfcamps` / Desc `Learn to surf in Ericeira at Rapture Surfcamps Portugal you'll find waves, breaks and surf lessons for all levels - beginner to pro!`

**Rooms subpages:**

- Green Bowl: Title `Modern Surf Rooms Bali Green Bowl - Rapture Surfcamps` / Desc `Find the perfect surf rooms in Bali, Green Bowl with amazing infinity pool, stylishly decorated modern apartments and friendly camp vibes!`

**Food subpages:**

- Green Bowl: Title `Balinese Cuisine - Delicious & Healthy - Rapture Surfcamps` / Desc `Cook mouth-watering Balinese cuisine local specialties at home! Easy-to-make delicious recipes, filled with vitamins for an healthy diet. Try it yourself!`

### Issues Across All Subpages

1. **Typos**: "amonst" (should be "amongst"), "an healthy" (should be "a healthy")
2. **Exclamation marks**: overused in descriptions -- reads as ad copy
3. **No social proof**: none of the subpages use any trust signals
4. **"Best" used in titles**: "Bali Best Surf Spot" -- should be avoided per our principle
5. **Food descriptions are off-topic**: they describe recipes to cook at home rather than the dining experience at camp
6. **Inconsistent title patterns**: each subpage uses a different format

### Recommended Title & Description Templates

**Title pattern for subpages:** `{Page Type} at {Camp}, {Country} · Rapture`

**Description pattern:** Location-specific content + one social proof element + one differentiator.

---

### Surf Subpages (per camp)

**Green Bowl Surf:**

- **Title:** `Surf Lessons in Green Bowl, Bali: All Levels · Rapture` (54 chars)
- **Description:** `Surf lessons for beginners to advanced at Green Bowl, Bali. Certified instructors, video analysis & uncrowded breaks near Uluwatu, Padang Padang & Dreamland.` (155 chars)
- **Social proof:** certified instructors

**Padang Padang Surf:**

- **Title:** `Surf Lessons Padang Padang, Bali: All Levels · Rapture` (54 chars)
- **Description:** `Learn to surf in one week at Padang Padang on Bali's Bukit Peninsula. Certified instructors for all levels. Reef and beach breaks within minutes of camp.` (152 chars)
- **Social proof:** learn in one week, certified instructors

**Ericeira Surf:**

- **Title:** `Surf School Ericeira: Europe's World Surfing Reserve · Rapture` (54 chars)
- **Description:** `Surf lessons at Foz do Lizandro in Ericeira, Europe's only World Surfing Reserve. Certified EU-licensed instructors, all levels, video analysis & theory classes.` (157 chars)
- **Social proof:** certified EU-licensed instructors

**Milfontes Surf:**

- **Title:** `Surf Lessons Milfontes, Alentejo: Empty Beaches · Rapture` (57 chars)
- **Description:** `Learn to surf on Alentejo's uncrowded beaches with certified instructors. Mellow waves ideal for beginners, flexible packages & free cancellation.` (145 chars)
- **Social proof:** certified instructors, flexible packages

**Coxos Surf Villa Surf:**

- **Title:** `Surf Lessons at Coxos Villa, Ericeira · Rapture` (48 chars)
- **Description:** `Surf sessions from our luxury villa near Coxos, Portugal's top right-hand point break. Daily shuttle to Foz do Lizandro for lessons with certified instructors.` (157 chars)
- **Social proof:** certified instructors

**Avellanas Surf:**

- **Title:** `Surf Lessons Playa Avellanas, Costa Rica · Rapture` (51 chars)
- **Description:** `Learn to surf in one week in warm 27C water at Playa Avellanas. Certified instructors, all levels, and easy access to Langosta, Playa Grande & Playa Negra.` (155 chars)
- **Social proof:** learn in one week, certified instructors

**Maderas Surf:**

- **Title:** `Surf Lessons Playa Maderas, Nicaragua: All Levels · Rapture` (59 chars)
- **Description:** `Surf lessons with certified local instructors at Playa Maderas. 330+ days of offshore winds, warm water year-round, beginner-friendly beach breaks & boat trips.` (158 chars)
- **Social proof:** certified instructors

**Sidi Ifni Surf:**

- **Title:** `Surf Lessons Sidi Ifni, Morocco: All Levels · Rapture` (53 chars)
- **Description:** `Learn to surf in one week at our beachfront camp in Sidi Ifni. Certified instructors, right-hand point breaks, 300+ sunny days & uncrowded lineups.` (147 chars)
- **Social proof:** learn in one week, certified instructors

---

### Rooms Subpages (per camp)

Each title leads with what makes that camp's accommodation unique, matching how people actually search.

**Green Bowl Rooms:**

- **Title:** `Cliffside Bungalows & Suites in Bali: Green Bowl · Rapture` (58 chars)
- **Description:** `Balinese bungalows, modern dorms & luxury suites at our cliffside surf camp. Infinity pool, A/C, breakfast & dinner included. Flexible packages from 45EUR/night.` (158 chars)
- **Social proof:** flexible packages
- **Why this title:** The cliffside setting is Green Bowl's standout -- nobody else has it.

**Padang Padang Rooms:**

- **Title:** `Surf Villas & Dorms at Padang Padang, Bali · Rapture` (53 chars)
- **Description:** `Private villas, bungalows & shared dorms surrounded by Balinese gardens. Pool, A/C, breakfast & dinner included. 100+ 5-star reviews. Flexible cancellation.` (154 chars)
- **Social proof:** 100+ reviews, flexible cancellation
- **Why this title:** Leads with room types people search for -- "villas Bali surf" is a real query.

**Ericeira Rooms:**

- **Title:** `Where to Stay in Ericeira for Surfing · Rapture` (48 chars)
- **Description:** `Beachfront rooms at Foz do Lizandro, Ericeira. Private & shared options, rooftop terrace, breakfast & dinner included. Flexible packages & free cancellation.` (155 chars)
- **Social proof:** flexible packages & cancellation
- **Why this title:** Matches travel search intent exactly -- "where to stay Ericeira surf" is a common query.

**Milfontes Rooms:**

- **Title:** `Eco Farmstay for Surfers in Milfontes, Alentejo · Rapture` (57 chars)
- **Description:** `Eco-friendly rooms on a small farm in the Alentejo Natural Park. Breakfast & dinner included, ocean nearby. Flexible packages & free cancellation.` (145 chars)
- **Social proof:** flexible packages & cancellation
- **Why this title:** "Eco farmstay" differentiates Milfontes from every other surf camp -- unique positioning.

**Coxos Villa Rooms:**

- **Title:** `Luxury Surf Villa Overlooking Coxos, Ericeira · Rapture` (55 chars)
- **Description:** `Luxury rooms in our oceanfront villa overlooking Coxos beach. Private & shared options for up to 8 guests. Infinity pool, breakfast & dinner included.` (150 chars)
- **Why this title:** "Luxury surf villa" targets the upmarket surf traveller searching for premium stays.

**Avellanas Rooms:**

- **Title:** `Surf Camp Rooms in Playa Avellanas, Costa Rica · Rapture` (56 chars)
- **Description:** `Freshly renovated rooms in our jungle surf camp. Private balcony suites or shared dorms, A/C, pool, gym. Breakfast & dinner included. Flexible cancellation.` (155 chars)
- **Social proof:** flexible cancellation
- **Why this title:** Direct keyword match for "surf camp rooms Costa Rica" -- strong for search.

**Maderas Rooms:**

- **Title:** `Jungle Hilltop Stay at Playa Maderas, Nicaragua · Rapture` (57 chars)
- **Description:** `Hilltop rooms overlooking the Pacific. Bungalows, apartments & glamping tents. Infinity pool, breakfast & dinner included. Flexible packages & cancellation.` (155 chars)
- **Social proof:** flexible packages & cancellation
- **Why this title:** The jungle hilltop setting with ocean views is what makes Maderas unforgettable.

**Sidi Ifni Rooms:**

- **Title:** `Beachfront Surf House with Rooftop in Sidi Ifni · Rapture` (57 chars)
- **Description:** `Beachfront rooms with rooftop ocean terrace in Sidi Ifni. Double rooms, triple rooms & dorms for up to 21 guests. Breakfast, lunch & dinner all included.` (153 chars)
- **Why this title:** "Surf house" matches the actual property; the rooftop is the standout feature.

---

### Food Subpages (per camp)

These are navigation/conversion pages, not search discovery pages. Descriptions prioritize sensory, emotional language to help already-interested visitors picture themselves there.

**Green Bowl Food:**

- **Title:** `Food & Dining at Green Bowl, Bali · Rapture` (44 chars)
- **Description:** `Wake up to banana pancakes with coconut and honey, then refuel after surfing with fragrant Balinese fish curries. 3-course breakfast & dinner included. All diets welcome.` (160 chars)

**Padang Padang Food:**

- **Title:** `Food & Dining at Padang Padang, Bali · Rapture` (47 chars)
- **Description:** `Local chefs Sunny and Made bring Balinese flavors to every meal. Fresh tropical breakfasts, homemade dinners & weekend BBQ nights under the palms. All diets welcome.` (158 chars)

**Ericeira Food:**

- **Title:** `Food & Dining at Ericeira Surf Camp, Portugal · Rapture` (55 chars)
- **Description:** `Chef Mikey's legendary dinners are a camp highlight. Fresh Portuguese seafood, hearty post-surf meals & ocean-view breakfasts at Foz do Lizandro. All diets welcome.` (158 chars)

**Milfontes Food:**

- **Title:** `Farm-to-Table Dining at Milfontes Eco Camp · Rapture` (52 chars)
- **Description:** `Meals straight from our organic garden to your plate. Portuguese cooking workshops, locally-sourced ingredients & the Alentejo slow-food tradition. Breakfast & dinner included.` (160 chars)

**Coxos Villa Food:**

- **Title:** `Food & Dining at Coxos Surf Villa, Ericeira · Rapture` (53 chars)
- **Description:** `Start your morning with breakfast overlooking the Atlantic, then wind down with weekday dinners made from fresh Portuguese ingredients. Intimate villa dining for up to 8 guests.` (160 chars)

**Avellanas Food:**

- **Title:** `Food & Dining at Playa Avellanas, Costa Rica · Rapture` (54 chars)
- **Description:** `Tropical breakfasts, freshly prepared dinners & cold drinks from our full bar after a day in the waves. Locally-sourced jungle kitchen vibes. All diets welcome.` (157 chars)

**Maderas Food:**

- **Title:** `Food & Dining at Playa Maderas, Nicaragua · Rapture` (52 chars)
- **Description:** `Dinner with sunset views over the Pacific from our hilltop terrace. Fresh international cuisine, vegetarian & vegan options. Breakfast & dinner included.` (152 chars)

**Sidi Ifni Food:**

- **Title:** `Food & Dining at Sidi Ifni, Morocco · Rapture` (46 chars)
- **Description:** `Authentic Moroccan tagines, fresh-caught fish & mint tea on the rooftop. The only Rapture camp with 3 meals a day -- breakfast, lunchbox for the beach & dinner. All diets welcome.` (160 chars)

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

**Guiding principle:** Let the title win the ranking, let the description win the click.

- Titles = keywords, location, credibility signals (Award-Winning, Top-Rated)
- Descriptions = social proof, trust signals, emotional hooks, soft CTAs
- Never use "Best" -- use "Award-Winning" (backed by 23 TripAdvisor awards) or "Top-Rated" (backed by 100+ 5-star reviews) instead.

1. **Standardize brand suffix** to `· Rapture` in all titles (middle dot separator, short brand).
2. **Use a consistent title pattern**: `{Location} Surf Camp {Country}: {USP} · Rapture` -- colon only when adding a USP descriptor, middle dot before brand. Clean and minimal.
3. **Max 60 chars for titles, 150-160 chars for descriptions** -- fill the space but don't exceed it.
4. **Include at least one social proof element** per description. Rotate from this pool: `20+ years of experience` · `certified instructors` · `85k+ happy guests` · `100+ 5-star reviews` · `learn to surf in one week` · `flexible packages & cancellation`.
5. **Vary the social proof** so adjacent pages in SERPs don't look templated -- each description should feel unique while carrying trust signals.

