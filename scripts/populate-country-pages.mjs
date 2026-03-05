/**
 * Populates Portugal and Costa Rica country pages with rich content
 * matching the Bali page structure.
 *
 * Run: node scripts/populate-country-pages.mjs
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function textBlock(key, text, style = "normal") {
  return {
    _key: key,
    _type: "block",
    children: [{ _key: `${key}s`, _type: "span", marks: [], text }],
    markDefs: [],
    style,
  };
}

function boldTextBlock(key, segments) {
  return {
    _key: key,
    _type: "block",
    children: segments.map((seg, i) => ({
      _key: `${key}s${i}`,
      _type: "span",
      marks: seg.bold ? ["strong"] : [],
      text: seg.text,
    })),
    markDefs: [],
    style: "normal",
  };
}

function bulletBlock(key, segments) {
  return {
    ...boldTextBlock(key, segments),
    level: 1,
    listItem: "bullet",
  };
}

// ─── PORTUGAL ───────────────────────────────────────────────────────────────

const portugalBlocks = [
  // 1. SEO Intro
  {
    _key: "pt-intro",
    _type: "contentBlock",
    background: "dark-lighter",
    heading: "Surf Camp Portugal – Europe's Best Waves with Rapturecamps",
    label: "Surf Camp Portugal – SEO Intro",
    reverse: false,
    body: [
      textBlock(
        "pi1",
        "Discover the best surf camps in Portugal with Rapturecamps. From the World Surfing Reserve of Ericeira to the wild Alentejo coast, our three Portugal locations offer world-class waves, professional surf coaching, and an authentic Portuguese surf experience for every level."
      ),
    ],
  },

  // 2. Why Choose
  {
    _key: "pt-why",
    _type: "contentBlock",
    background: "dark",
    heading: "Why Choose Rapturecamps Surf Camps in Portugal",
    label: "Why Choose Rapturecamps Portugal",
    reverse: false,
    spacingBottom: "xs",
    body: [
      textBlock(
        "pw0",
        "Portugal has become Europe's top surf destination, and for good reason. Consistent Atlantic swells, a mild climate, and incredible culture make it the ideal base for a surf trip. Here's why our camps stand out."
      ),
      textBlock("pw1", "1. Three Distinct Locations", "h3"),
      textBlock(
        "pw2",
        "Choose between the vibrant World Surfing Reserve of Ericeira with our oceanfront Lizandro camp, the premium Coxos Surf Villa with infinity pool, or the wild eco-retreat in Milfontes on the Alentejo coast. Each offers a completely different surf experience."
      ),
      textBlock("pw3", "2. Professional Surf Coaching for All Levels", "h3"),
      textBlock(
        "pw4",
        "Whether you're catching your first whitewater wave or perfecting your barrel technique at Coxos, our ISA-certified surf instructors and experienced local guides adapt every session to your ability. We run dedicated beginner, intermediate, and advanced surf programs."
      ),
      textBlock("pw5", "3. World Surfing Reserve Access", "h3"),
      textBlock(
        "pw6",
        "Ericeira is one of only two World Surfing Reserves in Europe, featuring 7 world-class surf breaks within walking distance. Our camps put you right in the heart of this unique stretch of coastline."
      ),
      textBlock("pw7", "4. Authentic Portuguese Culture", "h3"),
      textBlock(
        "pw8",
        "Enjoy fresh seafood in cobblestone fishing villages, sip pastel de nata with your morning coffee, and explore historic Lisbon on day trips. Portugal offers incredible value and a warm, welcoming atmosphere."
      ),
      textBlock("pw9", "5. Year-Round Surf Conditions", "h3"),
      textBlock(
        "pw10",
        "Unlike tropical destinations, Portugal's Atlantic coast delivers surf 365 days a year. Summer brings mellow, consistent waves for learning, while autumn and winter unleash powerful swells that attract pro surfers from around the world."
      ),
    ],
  },

  // 3. Our Portugal Surf Camps intro
  {
    _key: "pt-camps-intro",
    _type: "contentBlock",
    background: "dark",
    heading: "Our Surf Camps in Portugal: Ericeira & Alentejo",
    label: "Our Portugal Surf Camps Intro",
    reverse: true,
    spacingBottom: "small",
    body: [
      textBlock(
        "pci1",
        "We run three surf camps across two of Portugal's best surf regions. In Ericeira, choose between our oceanfront Lizandro camp for an authentic surf community vibe, or the premium Coxos Surf Villa for a boutique luxury experience. Further south, our Milfontes Eco Surfcamp offers wild beaches and total disconnection on the Alentejo coast."
      ),
    ],
  },

  // 4. Ericeira Lizandro camp details (contentBlockGrid)
  {
    _key: "pt-lizandro",
    _type: "contentBlockGrid",
    background: "dark-lighter",
    heading: "Ericeira Lizandro Surf Camp",
    headingLevel: "h3",
    reverse: true,
    spacingBottom: "small",
    spacingTop: "small",
    topDivider: false,
    body: [
      textBlock(
        "pl1",
        "Our flagship Portugal surf camp sits directly on the oceanfront overlooking Foz do Lizandro beach — one of Ericeira's most consistent beginner-friendly breaks. Walk to 7 different surf spots, explore the charming old town with its cobblestone streets and seafood restaurants, and enjoy the social energy of a true surf community."
      ),
      bulletBlock("pl2", [
        { text: "Surf level: ", bold: true },
        { text: "All levels — from first-timers to advanced surfers chasing Coxos", bold: false },
      ]),
      bulletBlock("pl3", [
        { text: "Highlights: ", bold: true },
        { text: "Oceanfront location, walk to 7 surf breaks, vibrant social scene, ocean-view yoga deck", bold: false },
      ]),
      bulletBlock("pl4", [
        { text: "Nearby attractions: ", bold: true },
        { text: "Ericeira old town, Lisbon day trips (45 min), Mafra Palace, Sintra", bold: false },
      ]),
    ],
  },

  // 5. Coxos Surf Villa details (contentBlockGrid)
  {
    _key: "pt-coxos",
    _type: "contentBlockGrid",
    background: "dark-lighter",
    heading: "Coxos Surf Villa",
    headingLevel: "h3",
    reverse: false,
    spacingBottom: "small",
    spacingTop: "small",
    topDivider: false,
    body: [
      textBlock(
        "pc1",
        "For a more premium surf experience, our Coxos Surf Villa offers boutique accommodation with an infinity pool overlooking the Atlantic Ocean — just steps from Coxos, one of Europe's most famous right-hand point breaks. A daily shuttle connects to the Lizandro camp and all our surf programs."
      ),
      bulletBlock("pc2", [
        { text: "Surf level: ", bold: true },
        { text: "Intermediate to advanced — ideal for surfers looking to push their limits", bold: false },
      ]),
      bulletBlock("pc3", [
        { text: "Highlights: ", bold: true },
        { text: "Infinity pool with ocean view, premium suites, exclusive atmosphere, proximity to Europe's best wave", bold: false },
      ]),
      bulletBlock("pc4", [
        { text: "Nearby attractions: ", bold: true },
        { text: "Coxos point break, Crazy Left, Cave, wine tasting tours, coastal hiking trails", bold: false },
      ]),
    ],
  },

  // 6. Milfontes Eco Surfcamp details (contentBlockGrid)
  {
    _key: "pt-milfontes",
    _type: "contentBlockGrid",
    background: "dark-lighter",
    heading: "Milfontes Eco Surfcamp",
    headingLevel: "h3",
    reverse: true,
    spacingBottom: "small",
    spacingTop: "small",
    topDivider: false,
    body: [
      textBlock(
        "pm1",
        "Our Alentejo surf camp offers something completely different: a small farm setting in the heart of the Southwest Alentejo Natural Park. This is for surfers who want to disconnect — permaculture gardens, Portuguese cooking workshops, and empty lineups on uncrowded beaches that most tourists never see."
      ),
      bulletBlock("pm2", [
        { text: "Surf level: ", bold: true },
        { text: "All levels — perfect for beginners with uncrowded beach breaks and intermediates looking for space", bold: false },
      ]),
      bulletBlock("pm3", [
        { text: "Highlights: ", bold: true },
        { text: "Eco-friendly farm setting, empty lineups, Rota Vicentina hiking, Portuguese cooking workshops", bold: false },
      ]),
      bulletBlock("pm4", [
        { text: "Nearby attractions: ", bold: true },
        { text: "Rota Vicentina trail, hidden coves, Zambujeira do Mar, Vila Nova de Milfontes old town", bold: false },
      ]),
    ],
  },

  // 7. Surf Lessons & Guiding
  {
    _key: "pt-lessons",
    _type: "contentBlock",
    background: "dark",
    heading: "Surf Lessons & Guiding in Portugal",
    label: "Surf Lessons & Guiding Portugal",
    reverse: false,
    body: [
      textBlock(
        "psl1",
        "All our Portugal surf camps include professional surf instruction from ISA-certified coaches and experienced local guides who've surfed these waves their entire lives."
      ),
      textBlock(
        "psl2",
        "Beginners start on the gentle beach breaks of Foz do Lizandro or Praia do Malhão, learning to read waves, paddle efficiently, and pop up with confidence. Intermediates work on bottom turns, cutbacks, and wave selection at breaks like Ribeira d'Ilhas. Advanced surfers get guided sessions at Coxos, São Lourenço, and other powerful reef breaks."
      ),
      textBlock(
        "psl3",
        "Every session includes video analysis, safety briefings, and post-surf feedback. We also run surf theory workshops covering ocean safety, wave reading, and surf etiquette."
      ),
    ],
  },

  // Keep existing blocks: 1st contentBlock (Best Time), 2nd (Ericeira WSR), 3rd (Alentejo)
  // These will be repositioned after surf lessons

  // 8. Surf Spots (keep existing pt-ss)

  // 9. Accommodation & Amenities
  {
    _key: "pt-accom",
    _type: "contentBlock",
    background: "dark",
    heading: "Accommodation & Amenities",
    label: "Accommodation Portugal",
    reverse: false,
    body: [
      textBlock(
        "pa1",
        "From oceanfront rooms at Ericeira Lizandro to premium suites at Coxos Surf Villa and eco-friendly farm stays in Milfontes — we have accommodation to match every preference and budget."
      ),
      textBlock(
        "pa2",
        "All camps include hearty breakfast, cozy common areas, fast WiFi for digital nomads, and the kind of laid-back atmosphere where friendships form naturally. The Coxos Surf Villa features an infinity pool and terrace with panoramic ocean views, while the Milfontes camp offers an authentic farm-to-table experience with produce from our own permaculture garden."
      ),
    ],
  },

  // 10. Activities Beyond Surfing
  {
    _key: "pt-activities",
    _type: "contentBlock",
    background: "dark-lighter",
    heading: "Activities Beyond Surfing in Portugal",
    label: "Activities Beyond Surfing Portugal",
    reverse: false,
    body: [
      textBlock(
        "pat1",
        "Portugal offers a wealth of experiences beyond the waves. From Ericeira, take a day trip to Lisbon (45 minutes by car) to explore the historic Alfama district, ride vintage trams, and enjoy world-class pastéis de nata. Visit the fairy-tale palaces of Sintra or the massive Mafra Palace nearby."
      ),
      textBlock(
        "pat2",
        "In Milfontes, hike the famous Rota Vicentina coastal trail, discover hidden coves accessible only by foot, and experience traditional Alentejo cuisine paired with regional wines. Both regions offer daily yoga classes, stand-up paddleboarding, and mountain biking."
      ),
      textBlock(
        "pat3",
        "Portugal's incredible food scene deserves special mention — fresh grilled seafood, hearty cataplana stews, and the world's best pastries are part of everyday life here."
      ),
    ],
  },

  // 11. Surf Seasons
  {
    _key: "pt-seasons",
    _type: "surfSeasons",
    heading: "Best Time to Surf in Portugal",
    background: "dark",
    body: [
      textBlock(
        "pss1",
        "Portugal's Atlantic coast delivers surf year-round, but conditions vary significantly by season. Summer offers smaller, consistent waves ideal for learning, while autumn and winter bring powerful swells that light up world-class breaks."
      ),
      textBlock(
        "pss2",
        "The shoulder seasons of April–May and September–October are often considered the sweet spot — warm enough for comfortable sessions, consistent swell, and smaller crowds than peak summer. Water temperatures range from 14°C in winter to 20°C in late summer."
      ),
    ],
    seasons: [
      {
        _key: "pss-summer",
        name: "Summer",
        startMonth: 6,
        endMonth: 9,
        waveConsistency: 3,
        waveSize: "small",
        crowdLevel: 4,
        bestFor: "beginner-intermediate",
        color: "amber",
        description: "Smaller, consistent NW swells. Warm weather, long days, and ideal conditions for beginners. Crowds peak in August.",
      },
      {
        _key: "pss-autumn",
        name: "Autumn",
        startMonth: 10,
        endMonth: 11,
        waveConsistency: 5,
        waveSize: "large",
        crowdLevel: 2,
        bestFor: "all",
        color: "green",
        description: "The sweet spot — big Atlantic swells arrive, water is still warm from summer, and tourist crowds thin out. Best overall conditions.",
      },
      {
        _key: "pss-winter",
        name: "Winter",
        startMonth: 12,
        endMonth: 3,
        waveConsistency: 4,
        waveSize: "xl",
        crowdLevel: 1,
        bestFor: "intermediate-advanced",
        color: "purple",
        description: "Powerful NW/W swells deliver heavy surf at reef breaks. Cold water (14–16°C) but uncrowded world-class waves for experienced surfers.",
      },
      {
        _key: "pss-spring",
        name: "Spring",
        startMonth: 4,
        endMonth: 5,
        waveConsistency: 3,
        waveSize: "medium",
        crowdLevel: 2,
        bestFor: "all",
        color: "green",
        description: "Transitional period with a mix of remaining winter swell and warming temperatures. Great for all levels with few crowds.",
      },
    ],
    airTemp: { low: 10, high: 29 },
    waterTemp: { low: 14, high: 20 },
    wetsuitNote: "3/2mm fullsuit in summer, 4/3mm with boots in winter. Wetsuits provided free at all camps.",
  },

  // 12. Climate Info
  {
    _key: "pt-climate",
    _type: "climateInfo",
    heading: "Air & Water Temperatures in Portugal",
    background: "dark-lighter",
    body: [
      textBlock(
        "pcl1",
        "Portugal's climate is one of the mildest in Europe, making it a comfortable surf destination year-round. Summer days reach 28–30°C with cool ocean breezes, while winter rarely drops below 10°C on the coast."
      ),
      textBlock(
        "pcl2",
        "The Atlantic water is cooler than tropical destinations — ranging from 14°C in February to 20°C in September. A good wetsuit is essential, but the trade-off is uncrowded lineups and some of Europe's most powerful waves."
      ),
    ],
    months: [
      { _key: "m1", month: 1, airTempHigh: 15, airTempLow: 8, waterTemp: 15, rainyDays: 10 },
      { _key: "m2", month: 2, airTempHigh: 16, airTempLow: 8, waterTemp: 14, rainyDays: 9 },
      { _key: "m3", month: 3, airTempHigh: 18, airTempLow: 10, waterTemp: 14, rainyDays: 7 },
      { _key: "m4", month: 4, airTempHigh: 19, airTempLow: 11, waterTemp: 15, rainyDays: 8 },
      { _key: "m5", month: 5, airTempHigh: 21, airTempLow: 13, waterTemp: 16, rainyDays: 5 },
      { _key: "m6", month: 6, airTempHigh: 24, airTempLow: 15, waterTemp: 17, rainyDays: 3 },
      { _key: "m7", month: 7, airTempHigh: 27, airTempLow: 17, waterTemp: 18, rainyDays: 1 },
      { _key: "m8", month: 8, airTempHigh: 28, airTempLow: 17, waterTemp: 19, rainyDays: 1 },
      { _key: "m9", month: 9, airTempHigh: 26, airTempLow: 16, waterTemp: 20, rainyDays: 4 },
      { _key: "m10", month: 10, airTempHigh: 22, airTempLow: 14, waterTemp: 19, rainyDays: 8 },
      { _key: "m11", month: 11, airTempHigh: 18, airTempLow: 11, waterTemp: 17, rainyDays: 10 },
      { _key: "m12", month: 12, airTempHigh: 15, airTempLow: 9, waterTemp: 15, rainyDays: 10 },
    ],
    wetsuitNote: "3/2mm in summer, 4/3mm with boots in winter — all provided free at our camps.",
  },

  // 13. How to Get There
  {
    _key: "pt-travel",
    _type: "contentBlock",
    background: "dark",
    heading: "How to Get to Our Portugal Surf Camps",
    label: "How to Get to Portugal",
    reverse: false,
    body: [
      textBlock(
        "ptr1",
        "Fly into Lisbon Humberto Delgado Airport (LIS), one of Europe's best-connected airports with direct flights from most major European cities, the US, and beyond. From the airport:"
      ),
      textBlock(
        "ptr2",
        "Ericeira is just 45 minutes north by car or shuttle. We arrange shared airport transfers on check-in and check-out days, or you can easily rent a car. The A8 motorway makes the drive straightforward."
      ),
      textBlock(
        "ptr3",
        "Milfontes is approximately 2.5 hours south of Lisbon via the A2 motorway. We arrange shared transfers on check-in days, and having a rental car opens up exploration of the Alentejo coast."
      ),
      textBlock(
        "ptr4",
        "Many guests combine both locations — spend a week in Ericeira for the world-class surf and vibrant town life, then head south to Milfontes for the wild coastline and total disconnection. We offer multi-camp discounts and arrange inter-camp shuttle transfers."
      ),
    ],
  },
];

// ─── COSTA RICA ─────────────────────────────────────────────────────────────

const costaRicaBlocks = [
  // 1. SEO Intro
  {
    _key: "cr-intro",
    _type: "contentBlock",
    background: "dark-lighter",
    heading: "Surf Camp Costa Rica – Pura Vida Waves with Rapturecamps",
    label: "Surf Camp Costa Rica – SEO Intro",
    reverse: false,
    body: [
      textBlock(
        "ci1",
        "Experience the ultimate Pura Vida surf holiday at our Costa Rica surf camp in Playa Avellanas, Guanacaste. Whether you're a beginner catching your first wave or an advanced surfer chasing powerful reef breaks, our surf school and local guides will take your surfing to the next level in one of Central America's most consistent surf destinations."
      ),
    ],
  },

  // 2. Why Choose
  {
    _key: "cr-why",
    _type: "contentBlock",
    background: "dark",
    heading: "Why Choose Rapturecamps Surf Camp in Costa Rica",
    label: "Why Choose Rapturecamps Costa Rica",
    reverse: false,
    spacingBottom: "xs",
    body: [
      textBlock(
        "cw0",
        "Costa Rica is one of the world's premier surf destinations, and our camp at Playa Avellanas puts you in the heart of Guanacaste's legendary coastline. Here's what makes our Costa Rica surf camp special."
      ),
      textBlock("cw1", "1. Consistent Year-Round Waves", "h3"),
      textBlock(
        "cw2",
        "Guanacaste's Pacific coast receives swell year-round. The dry season (December–April) delivers clean, mellow waves perfect for learning, while the wet season (May–November) brings powerful south swells with overhead surf for experienced riders."
      ),
      textBlock("cw3", "2. Jungle-Meets-Ocean Setting", "h3"),
      textBlock(
        "cw4",
        "Our camp is nestled in the jungle — wake up to howler monkeys, spot sloths in the trees, and watch iguanas sun themselves by the pool. It's a surf experience surrounded by incredible wildlife and nature you won't find anywhere else."
      ),
      textBlock("cw5", "3. Professional Surf Coaching for All Levels", "h3"),
      textBlock(
        "cw6",
        "From complete beginners to advanced surfers, our bilingual ISA-certified instructors and local surf guides adapt sessions to your level. Daily video analysis, surf theory workshops, and personalised feedback ensure rapid progression."
      ),
      textBlock("cw7", "4. World-Class Facilities", "h3"),
      textBlock(
        "cw8",
        "Our recently renovated property features a swimming pool, jacuzzi, outdoor cinema, recovery centre with ice baths, and blazing-fast fibre internet for digital nomads. It's the perfect balance of adventure and comfort."
      ),
      textBlock("cw9", "5. Pura Vida Community", "h3"),
      textBlock(
        "cw10",
        "Join a global community of surfers and travellers. Share meals prepared by our local chefs, swap surf stories around the fire pit, and experience Costa Rica's famous Pura Vida lifestyle — a philosophy of living that makes every day feel like a gift."
      ),
    ],
  },

  // 3. Our Costa Rica Camp intro
  {
    _key: "cr-camp-intro",
    _type: "contentBlock",
    background: "dark",
    heading: "Our Surf Camp: Playa Avellanas, Guanacaste",
    label: "Our Costa Rica Surf Camp Intro",
    reverse: true,
    spacingBottom: "small",
    body: [
      textBlock(
        "cci1",
        "Playa Avellanas is one of Costa Rica's best-kept surf secrets — a long stretch of golden sand with multiple peaks, offshore mornings, and a fraction of the crowds you'll find at other popular breaks. Our camp sits minutes from the beach, surrounded by tropical jungle and wildlife."
      ),
    ],
  },

  // 4. Avellanas camp details (contentBlockGrid)
  {
    _key: "cr-avellanas",
    _type: "contentBlockGrid",
    background: "dark-lighter",
    heading: "Avellanas Surf Camp",
    headingLevel: "h3",
    reverse: true,
    spacingBottom: "small",
    spacingTop: "small",
    topDivider: false,
    body: [
      textBlock(
        "ca1",
        "Our Costa Rica surf camp is located just minutes from Playa Avellanas — a consistently firing beach break with options for every level. The property has been freshly renovated with a focus on community, comfort, and the ultimate surf lifestyle. With up to 30 guests, it's big enough to meet amazing people but small enough to feel personal."
      ),
      bulletBlock("ca2", [
        { text: "Surf level: ", bold: true },
        { text: "All levels — from complete beginners to advanced surfers hunting reef breaks", bold: false },
      ]),
      bulletBlock("ca3", [
        { text: "Highlights: ", bold: true },
        { text: "Pool & jacuzzi, outdoor cinema, recovery centre, fibre internet, jungle setting", bold: false },
      ]),
      bulletBlock("ca4", [
        { text: "Room types: ", bold: true },
        { text: "5 room types from shared dorms to private suites", bold: false },
      ]),
      bulletBlock("ca5", [
        { text: "Nearby attractions: ", bold: true },
        { text: "Tamarindo (20 min), Rincón de la Vieja volcano, Playa Negra, Las Baulas National Park", bold: false },
      ]),
    ],
  },

  // 5. Surf Lessons & Guiding
  {
    _key: "cr-lessons",
    _type: "contentBlock",
    background: "dark",
    heading: "Surf Lessons & Guiding in Costa Rica",
    label: "Surf Lessons Costa Rica",
    reverse: false,
    body: [
      textBlock(
        "csl1",
        "All surf camp packages include professional surf instruction from our team of bilingual ISA-certified coaches and experienced local guides who know every break along the Guanacaste coast."
      ),
      textBlock(
        "csl2",
        "Beginners learn the fundamentals on the forgiving inside section of Playa Avellanas — warm water, sandy bottom, and consistent whitewater make it one of the best learning environments in Central America. Intermediate surfers progress at multiple peaks along the beach, working on wave selection, bottom turns, and cutbacks."
      ),
      textBlock(
        "csl3",
        "Advanced surfers get guided to power spots like Little Hawaii, Playa Negra, and secret reef breaks along the coast. Every session includes water photography, video analysis, and personalised coaching feedback."
      ),
    ],
  },

  // Keep existing blocks: cr-cb1 (Best Time), cr-cb2 (Pura Vida)
  // These will be repositioned after lessons

  // 6. Surf Spots (keep existing cr-ss)

  // 7. Accommodation & Amenities
  {
    _key: "cr-accom",
    _type: "contentBlock",
    background: "dark",
    heading: "Accommodation & Amenities",
    label: "Accommodation Costa Rica",
    reverse: false,
    body: [
      textBlock(
        "cra1",
        "Our freshly renovated Costa Rica surf camp offers five room types — from social shared dorms to private suites with air conditioning. Every room is designed for comfort in the tropical climate, with quality mattresses, fans, and mosquito nets."
      ),
      textBlock(
        "cra2",
        "The communal areas are where the magic happens: a pool and jacuzzi for post-surf recovery, an outdoor cinema for movie nights under the stars, a fire pit area for evening gatherings, and a recovery centre with ice baths and stretching areas. The dedicated fibre internet and quiet workspaces make it a favourite among digital nomads doing month-long workation stays."
      ),
    ],
  },

  // 8. Activities Beyond Surfing
  {
    _key: "cr-activities",
    _type: "contentBlock",
    background: "dark-lighter",
    heading: "Activities Beyond Surfing in Costa Rica",
    label: "Activities Beyond Surfing Costa Rica",
    reverse: false,
    body: [
      textBlock(
        "cat1",
        "Costa Rica is one of the most biodiverse countries on Earth, and there's no shortage of adventure between surf sessions. Take a day trip to Rincón de la Vieja National Park to hike volcanic trails, swim in hot springs, and spot wildlife."
      ),
      textBlock(
        "cat2",
        "Our camp runs regular yoga sessions at sunset, stand-up paddleboard trips on the Tamarindo estuary, and horseback riding on the beach. For nightlife and restaurants, Tamarindo is just 20 minutes away — though most guests find everything they need right here at camp."
      ),
      textBlock(
        "cat3",
        "Wildlife enthusiasts will love spotting howler monkeys, sloths, toucans, and iguanas right from the camp. During nesting season (October–March), witness leatherback sea turtles laying eggs at nearby Playa Grande — a truly unforgettable experience."
      ),
    ],
  },

  // 9. Surf Seasons
  {
    _key: "cr-seasons",
    _type: "surfSeasons",
    heading: "Best Time to Surf in Costa Rica",
    background: "dark",
    body: [
      textBlock(
        "css1",
        "Costa Rica's Pacific coast delivers surf year-round, making it one of the most reliable surf destinations in the Americas. The type of waves you'll find depends on the season."
      ),
      textBlock(
        "css2",
        "The dry season (December–April) is peak tourist season with hot, sunny weather and smaller, cleaner surf — perfect for beginners. The green season (May–November) brings bigger south swells, warmer water, and fewer crowds. September and October often deliver the best waves of the year."
      ),
    ],
    seasons: [
      {
        _key: "css-dry",
        name: "Dry Season",
        startMonth: 12,
        endMonth: 4,
        waveConsistency: 3,
        waveSize: "small",
        crowdLevel: 4,
        bestFor: "beginner-intermediate",
        color: "amber",
        description: "Clean, consistent NW swell. Offshore mornings, hot and sunny weather. Ideal for beginners. Peak tourist season.",
      },
      {
        _key: "css-trans1",
        name: "Early Green Season",
        startMonth: 5,
        endMonth: 7,
        waveConsistency: 4,
        waveSize: "medium",
        crowdLevel: 2,
        bestFor: "all",
        color: "green",
        description: "South swells start arriving, size builds. Afternoon rain showers but warm and lush. Great balance of waves and fewer crowds.",
      },
      {
        _key: "css-peak",
        name: "Peak Swell Season",
        startMonth: 8,
        endMonth: 10,
        waveConsistency: 5,
        waveSize: "large",
        crowdLevel: 1,
        bestFor: "intermediate-advanced",
        color: "blue",
        description: "Consistent overhead south swells, offshore mornings. The best waves of the year. Fewer tourists, green jungle, wildlife everywhere.",
      },
      {
        _key: "css-trans2",
        name: "Late Season",
        startMonth: 11,
        endMonth: 11,
        waveConsistency: 4,
        waveSize: "medium",
        crowdLevel: 2,
        bestFor: "all",
        color: "green",
        description: "Transitional month — south swell tapering off, NW swell starting. Good waves, cooling temperatures, turtle nesting season begins.",
      },
    ],
    airTemp: { low: 22, high: 35 },
    waterTemp: { low: 26, high: 29 },
    wetsuitNote: "No wetsuit needed — boardshorts or a rash vest for sun protection is all you need year-round.",
  },

  // 10. Climate Info
  {
    _key: "cr-climate",
    _type: "climateInfo",
    heading: "Air & Water Temperatures in Costa Rica",
    background: "dark-lighter",
    body: [
      textBlock(
        "ccl1",
        "Costa Rica's tropical climate means warm conditions year-round. Guanacaste is the driest, hottest province — perfect for a surf trip any month of the year. Expect temperatures between 25–35°C during the day."
      ),
      textBlock(
        "ccl2",
        "Water temperatures are beautifully warm at 26–29°C year-round, meaning you'll never need a wetsuit. The dry season (December–April) has clear blue skies and minimal rain. The green season (May–November) brings afternoon showers that cool things down and keep the jungle lush — mornings are typically sunny and perfect for surfing."
      ),
    ],
    months: [
      { _key: "m1", month: 1, airTempHigh: 34, airTempLow: 22, waterTemp: 27, rainyDays: 1 },
      { _key: "m2", month: 2, airTempHigh: 35, airTempLow: 22, waterTemp: 27, rainyDays: 0 },
      { _key: "m3", month: 3, airTempHigh: 35, airTempLow: 23, waterTemp: 27, rainyDays: 0 },
      { _key: "m4", month: 4, airTempHigh: 35, airTempLow: 24, waterTemp: 28, rainyDays: 3 },
      { _key: "m5", month: 5, airTempHigh: 33, airTempLow: 24, waterTemp: 28, rainyDays: 12 },
      { _key: "m6", month: 6, airTempHigh: 32, airTempLow: 24, waterTemp: 28, rainyDays: 14 },
      { _key: "m7", month: 7, airTempHigh: 33, airTempLow: 23, waterTemp: 28, rainyDays: 10 },
      { _key: "m8", month: 8, airTempHigh: 32, airTempLow: 23, waterTemp: 29, rainyDays: 13 },
      { _key: "m9", month: 9, airTempHigh: 31, airTempLow: 23, waterTemp: 29, rainyDays: 17 },
      { _key: "m10", month: 10, airTempHigh: 31, airTempLow: 23, waterTemp: 28, rainyDays: 19 },
      { _key: "m11", month: 11, airTempHigh: 32, airTempLow: 23, waterTemp: 28, rainyDays: 10 },
      { _key: "m12", month: 12, airTempHigh: 33, airTempLow: 22, waterTemp: 27, rainyDays: 3 },
    ],
    wetsuitNote: "No wetsuit needed — warm tropical water year-round. Bring a rash vest for sun protection.",
  },

  // 11. How to Get There
  {
    _key: "cr-travel",
    _type: "contentBlock",
    background: "dark",
    heading: "How to Get to Our Costa Rica Surf Camp",
    label: "How to Get to Costa Rica",
    reverse: false,
    body: [
      textBlock(
        "ctr1",
        "There are two main airports serving our Costa Rica surf camp:"
      ),
      textBlock(
        "ctr2",
        "Liberia Airport (LIR) in Guanacaste is the closest — just 1.5 hours to camp. It receives direct flights from major US cities (Los Angeles, Miami, Houston, Dallas, New York) and select European routes. This is the fastest option."
      ),
      textBlock(
        "ctr3",
        "San José Airport (SJO), the main international hub, is about 4.5 hours from camp via paved roads. It has the widest selection of international flights. We recommend breaking the journey with a night in San José if arriving late."
      ),
      textBlock(
        "ctr4",
        "We arrange shared shuttle transfers every Saturday (check-in/check-out day) from both airports. Alternatively, renting a 4x4 gives you the freedom to explore — the drive from Liberia passes through beautiful Guanacaste countryside. The last stretch to camp is on an unpaved road, which adds to the adventure."
      ),
    ],
  },
];

async function run() {
  console.log("Updating Portugal...");

  // Build the full Portugal page builder in the correct order
  const ptFull = [
    portugalBlocks[0],  // SEO Intro
    portugalBlocks[1],  // Why Choose
    portugalBlocks[2],  // Our Camps Intro
    portugalBlocks[3],  // Ericeira Lizandro grid
    portugalBlocks[4],  // Coxos grid
    portugalBlocks[5],  // Milfontes grid
    portugalBlocks[6],  // Surf Lessons
    // Keep existing content blocks (best time, Ericeira WSR, Alentejo)
    {
      _key: "pt-cb1",
      _type: "contentBlock",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [
            {
              _key: "s1",
              _type: "span",
              marks: [],
              text: "Portugal's surf season never really stops. Summer (June–September) brings smaller, consistent swells ideal for beginners and intermediates — plus warm weather and long days. Autumn and winter (October–March) is when the Atlantic unleashes powerful swells that light up world-class breaks like Coxos and Supertubos.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
        {
          _key: "b2",
          _type: "block",
          children: [
            {
              _key: "s2",
              _type: "span",
              marks: [],
              text: "Water temperatures range from 15°C in winter to 20°C in summer — wetsuits are standard, but the waves are absolutely worth it.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      heading: "When Is the Best Time to Surf in Portugal?",
    },
    {
      _key: "pt-cb2",
      _type: "contentBlock",
      background: "dark-lighter",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [
            {
              _key: "s1",
              _type: "span",
              marks: [],
              text: "Ericeira is one of only two World Surfing Reserves in Europe, and our main camp sits oceanfront overlooking Foz do Lizandro beach. Walk to 7 different surf breaks, explore the charming old town with its cobblestone streets and seafood restaurants, and enjoy the best of Portuguese village life.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
        {
          _key: "b2",
          _type: "block",
          children: [
            {
              _key: "s2",
              _type: "span",
              marks: [],
              text: "For a more premium experience, our Coxos Surf Villa offers an infinity pool facing the ocean, just steps from one of Europe's most famous waves. A shuttle connects both properties throughout the day.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      heading: "Ericeira: Europe's World Surfing Reserve",
      reverse: true,
    },
    {
      _key: "pt-cb3",
      _type: "contentBlock",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [
            {
              _key: "s1",
              _type: "span",
              marks: [],
              text: "Our Milfontes Eco Surfcamp offers something completely different: a small farm setting in the heart of the Southwest Alentejo Natural Park. This is for surfers who want to disconnect — permaculture gardens, Portuguese cooking workshops, and empty lineups on uncrowded beaches.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
        {
          _key: "b2",
          _type: "block",
          children: [
            {
              _key: "s2",
              _type: "span",
              marks: [],
              text: "Hike the Rota Vicentina trail, explore hidden coves, and experience a side of Portugal most tourists never see.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      heading: "The Wild Alentejo Coast",
    },
    // Existing surf spots (keep as is — with type label for re-creation)
    {
      _key: "pt-ss",
      _type: "surfSpots",
      heading: "Surf Spots on Portugal's Atlantic Coast",
      spots: [
        { _key: "ss1", name: "Coxos", level: "Advanced", description: "Portugal's most famous wave and one of Europe's best right-hand point breaks. A powerful, hollow barrel that breaks over a rocky shelf. Located in Ericeira's World Surfing Reserve — serious wave for serious surfers." },
        { _key: "ss2", name: "Ribeira d'Ilhas", level: "All levels", description: "A long, user-friendly right-hander and WSL event site. Multiple sections allow beginners to ride the inside while advanced surfers work the outer peak. One of Ericeira's most consistent spots." },
        { _key: "ss3", name: "Foz do Lizandro", level: "Beginner–Intermediate", description: "Our Ericeira camp's home break — a wide river-mouth beach break with sandy bottom. Mellow waves ideal for learning. Walk to the lineup in 2 minutes from the camp." },
        { _key: "ss4", name: "São Lourenço", level: "Intermediate–Advanced", description: "A powerful beach break 5 minutes south of Ericeira. Heavy shorebreak and barrel sections make it exciting on solid swells. Best for confident surfers." },
        { _key: "ss5", name: "Praia do Malhão", level: "All levels", description: "A wild, empty beach break in the Alentejo near our Milfontes camp. Multiple peaks along a long stretch of sand, often uncrowded even in summer. Perfect for surfers who want space." },
        { _key: "ss6", name: "Zambujeira do Mar", level: "Intermediate", description: "A picturesque cove near Milfontes with a consistent left and right peak. Works well on NW and W swells. Also home to the Sudoeste music festival in summer." },
      ],
    },
    portugalBlocks[7],  // Accommodation
    portugalBlocks[8],  // Activities
    portugalBlocks[9],  // Surf Seasons
    portugalBlocks[10], // Climate Info
    portugalBlocks[11], // How to Get There
    // Existing FAQ (keep as is)
    {
      _key: "pt-faq",
      _type: "faqSection",
      heading: "Frequently Asked Questions",
      faqs: [
        { _key: "f1", question: "Is Portugal good for beginner surfers?", answer: "Absolutely. Portugal has a huge variety of beach breaks with sandy bottoms that are perfect for learning. Our Ericeira camp and Milfontes Eco camp both run structured beginner programs. The consistency of Atlantic swells means you'll get waves every day." },
        { _key: "f2", question: "What is the best time to surf in Portugal?", answer: "Summer (June–September) is ideal for beginners and intermediates — smaller, consistent swells plus warm weather. Autumn/winter (October–March) brings powerful Atlantic swells for experienced surfers. The water is cooler (15–20°C) so wetsuits are required year-round." },
        { _key: "f3", question: "Do I need a wetsuit to surf in Portugal?", answer: "Yes, always. In summer a 3/2mm fullsuit is standard, and in winter you'll want a 4/3mm with boots. We provide wetsuits free of charge at all our Portugal camps." },
        { _key: "f4", question: "What's the difference between Ericeira and Milfontes?", answer: "Ericeira is a vibrant surf town with restaurants, nightlife, and easy access from Lisbon (45 min). Milfontes is a rural eco-retreat in a natural park — think farm-to-table meals, empty beaches, and total disconnection. Both have excellent waves." },
        { _key: "f5", question: "How do I get to your Portugal surf camps?", answer: "Fly into Lisbon (LIS) airport. Ericeira is 45 minutes north by car/shuttle. Milfontes is about 2.5 hours south. We arrange shared transfers on check-in/check-out days, or you can rent a car." },
        { _key: "f6", question: "Can I visit multiple camps in one trip?", answer: "Yes — it's a popular option. Many guests spend a week in Ericeira and a week in Milfontes for the contrast. We can arrange shuttle transfers between camps and offer multi-camp discounts." },
      ],
    },
  ];

  await client
    .patch("country-portugal")
    .set({ pageBuilder: ptFull })
    .commit();
  console.log(`  ✓ Portugal updated — ${ptFull.length} blocks`);

  // ─── Costa Rica ───────────────────────────────────────────────────────────

  console.log("Updating Costa Rica...");

  const crFull = [
    costaRicaBlocks[0],  // SEO Intro
    costaRicaBlocks[1],  // Why Choose
    costaRicaBlocks[2],  // Camp Intro
    costaRicaBlocks[3],  // Avellanas grid
    costaRicaBlocks[4],  // Surf Lessons
    // Keep existing content blocks
    {
      _key: "cr-cb1",
      _type: "contentBlock",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [
            {
              _key: "s1",
              _type: "span",
              marks: [],
              text: "Costa Rica's Pacific coast fires year-round, but the prime season is May through November when consistent south swells deliver overhead waves to Guanacaste's beaches. The dry season (December–April) brings smaller, cleaner conditions perfect for learning.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
        {
          _key: "b2",
          _type: "block",
          children: [
            {
              _key: "s2",
              _type: "span",
              marks: [],
              text: "Water temperatures hover around 27–29°C, and you'll surf in boardshorts every session. Offshore winds are common in the mornings, grooming the waves to perfection before the afternoon sea breeze kicks in.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      heading: "When Is the Best Time to Surf in Costa Rica?",
    },
    {
      _key: "cr-cb2",
      _type: "contentBlock",
      background: "dark-lighter",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [
            {
              _key: "s1",
              _type: "span",
              marks: [],
              text: "Our camp is surrounded by jungle — wake up to howler monkeys, spot sloths in the trees, and watch iguanas sun themselves by the pool. The freshly renovated property features an outdoor cinema, recovery centre, and blazing-fast internet for digital nomads.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
        {
          _key: "b2",
          _type: "block",
          children: [
            {
              _key: "s2",
              _type: "span",
              marks: [],
              text: "Playa Tamarindo is just 20 minutes away for nightlife, restaurants, and shopping. But most guests find everything they need right here: great waves, incredible food, yoga at sunset, and new friends from around the world.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      heading: "Pura Vida at Playa Avellanas",
      reverse: true,
    },
    // Existing surf spots
    {
      _key: "cr-ss",
      _type: "surfSpots",
      heading: "Surf Spots in Guanacaste, Costa Rica",
      spots: [
        { _key: "ss1", name: "Playa Avellanas", level: "All levels", description: "Our home break — a long stretch of sandy beach with multiple peaks. Beginners take the inside whitewater, while experienced surfers find hollow sections on the outer sandbars. Consistent and offshore most mornings." },
        { _key: "ss2", name: "Little Hawaii", level: "Intermediate–Advanced", description: "The southern end of Avellanas where a rock shelf creates a powerful, hollow right-hander. Named by locals for its Hawaiian-like intensity. Best on a rising tide with south swell." },
        { _key: "ss3", name: "Playa Negra", level: "Intermediate–Advanced", description: "One of Costa Rica's best right-hand reef breaks. A fast, hollow wave over a rock shelf — technical but incredibly fun. 10 minutes south of camp." },
        { _key: "ss4", name: "Playa Grande", level: "Beginner–Intermediate", description: "A wide, sandy beach break inside Las Baulas National Park. Long, mellow waves ideal for longboarding and building confidence. Also a major leatherback turtle nesting site." },
        { _key: "ss5", name: "Tamarindo", level: "Beginner", description: "One of Costa Rica's most famous beginner spots. Wide, gentle waves on a sandy bottom. 20 minutes north of camp — also great for an evening out." },
      ],
    },
    costaRicaBlocks[5],  // Accommodation
    costaRicaBlocks[6],  // Activities
    costaRicaBlocks[7],  // Surf Seasons
    costaRicaBlocks[8],  // Climate Info
    costaRicaBlocks[9],  // How to Get There
    // Existing FAQ
    {
      _key: "cr-faq",
      _type: "faqSection",
      heading: "Frequently Asked Questions",
      faqs: [
        { _key: "f1", question: "Is Costa Rica good for beginner surfers?", answer: "Excellent. Playa Avellanas has several zones suited to beginners — wide sandy beaches with consistent whitewater for learning. The water is warm (27–29°C) year-round, so you can focus on surfing without worrying about cold water." },
        { _key: "f2", question: "What is the best time to surf in Costa Rica?", answer: "The dry season (December–April) brings smaller, clean conditions perfect for learning. May through November sees bigger, more consistent south swells for intermediate and advanced surfers. Offshore mornings are common in both seasons." },
        { _key: "f3", question: "How safe is Costa Rica for solo travellers?", answer: "Costa Rica is one of the safest countries in Central America and a well-trodden surf travel route. Our camp has 24/7 security and the Avellanas community is very welcoming. Solo travellers make up about 60% of our guests." },
        { _key: "f4", question: "How do I get from San José airport to the camp?", answer: "The camp is about 4.5 hours from San José (SJO) airport, or 1.5 hours from Liberia (LIR) airport. We offer shared shuttle transfers on Saturday arrival/departure days from both airports, or you can rent a 4x4 for the drive." },
        { _key: "f5", question: "Is the WiFi good enough for remote work?", answer: "Yes — we invested in a dedicated fibre line specifically for digital nomads. There are quiet workspaces, power outlets, and strong coverage across the property. Many guests do month-long workation stays." },
        { _key: "f6", question: "What's included in the surf camp package?", answer: "All packages include accommodation, daily surf lessons or guiding, breakfast and dinner, yoga sessions, video analysis, and airport transfers on check-in/check-out days. Boards and equipment are provided — just bring your swim gear." },
      ],
    },
  ];

  await client
    .patch("country-costa-rica")
    .set({ pageBuilder: crFull })
    .commit();
  console.log(`  ✓ Costa Rica updated — ${crFull.length} blocks`);

  console.log("\nDone! Both country pages have been updated.");
}

run().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
