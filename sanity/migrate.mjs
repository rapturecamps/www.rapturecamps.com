/**
 * Migration script: Seeds Sanity with all existing hardcoded data.
 *
 * Run: node sanity/migrate.mjs
 *
 * NOTE: Images are stored as URL strings in temporary fields since the real
 * photos will be uploaded to Sanity later. The Sanity image fields will be
 * populated when real assets are uploaded through the Studio.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {}

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("❌ SANITY_WRITE_TOKEN not found. Add it to .env or pass as env var.");
  process.exit(1);
}

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ─── Country IDs (deterministic for referencing) ───────────────────────────
const countryIds = {
  bali: "country-bali",
  "costa-rica": "country-costa-rica",
  portugal: "country-portugal",
  morocco: "country-morocco",
  nicaragua: "country-nicaragua",
};

// ─── Camp IDs ──────────────────────────────────────────────────────────────
const campIds = {
  "green-bowl": "camp-bali-green-bowl",
  "padang-padang": "camp-bali-padang-padang",
  avellanas: "camp-costa-rica-avellanas",
  "ericeira-lizandro": "camp-portugal-ericeira",
  "ericeira-coxos-surf-villa": "camp-portugal-coxos",
  "alentejo-milfontes": "camp-portugal-milfontes",
  "banana-village": "camp-morocco-banana-village",
  maderas: "camp-nicaragua-maderas",
  "maderas-surf-resort": "camp-nicaragua-surf-resort",
};

// ─── Countries ─────────────────────────────────────────────────────────────
const countries = [
  { name: "Bali", slug: "bali", flag: "🇮🇩" },
  { name: "Costa Rica", slug: "costa-rica", flag: "🇨🇷" },
  { name: "Portugal", slug: "portugal", flag: "🇵🇹" },
  { name: "Morocco", slug: "morocco", flag: "🇲🇦" },
  { name: "Nicaragua", slug: "nicaragua", flag: "🇳🇮" },
];

const countryContent = {
  bali: {
    description:
      "The tropical paradise of Bali is famous for being one of the most popular surfing destinations worldwide. With waves for every level, warm water year-round, and an incredible culture — it's the ultimate surf trip.",
    intro:
      "From the legendary barrels of Padang Padang to the beginner-friendly breaks of Green Bowl, Bali's Bukit Peninsula has it all. We run two camps here — each with its own character, but both sharing that unmistakable Rapture spirit.",
    comparison: {
      heading: "Which Bali Camp Is Right for You?",
      subtitle:
        "Both camps are on the Bukit Peninsula, 15 minutes apart. Here's how they compare.",
      features: [
        "Vibe",
        "Best For",
        "Surf Breaks Nearby",
        "Pool",
        "Rooms",
        "Group Size",
        "Yoga",
        "Nightlife Access",
      ],
    },
    pageBuilder: [
      {
        _type: "contentBlock",
        _key: "bali-cb1",
        heading: "When Is the Best Time to Surf in Bali?",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Bali delivers rideable waves 365 days a year, but the peak season runs from June through September. During the dry season, consistent Indian Ocean swells hit the west-facing reefs of the Bukit Peninsula, creating the powerful barrels Bali is famous for.",
              },
            ],
            markDefs: [],
          },
          {
            _type: "block",
            _key: "b2",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s2",
                text: "The wet season (November–March) brings smaller, more playful waves on the east coast — perfect for progressing your skills without the crowds. Water temperature stays between 26–30°C year-round, so you'll rarely need more than a rash vest.",
              },
            ],
            markDefs: [],
          },
        ],
      },
      {
        _type: "contentBlock",
        _key: "bali-cb2",
        heading: "World-Class Waves for Every Level",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Bali is home to over 60 surf spots. Beginners find their feet at Padang Padang Right, where long unbroken walls roll in at high tide. Intermediate surfers challenge themselves at Dreamland and Balangan, while experts chase the hollow lefts of Uluwatu and the famous Padang Padang barrel.",
              },
            ],
            markDefs: [],
          },
          {
            _type: "block",
            _key: "b2",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s2",
                text: "Our surf instructors know every break on the Bukit and will guide you to the right spot for your level — whether it's your first pop-up or your hundredth tube ride.",
              },
            ],
            markDefs: [],
          },
        ],
        reverse: true,
        background: "dark-lighter",
      },
      {
        _type: "contentBlock",
        _key: "bali-cb3",
        heading: "More Than Just Surfing",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Between sessions, Bali offers an endless menu: explore ancient Hindu temples perched on sea cliffs, hike through emerald rice terraces in Ubud, or simply unwind with a Balinese massage and a fresh coconut by the pool.",
              },
            ],
            markDefs: [],
          },
          {
            _type: "block",
            _key: "b2",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s2",
                text: "Our camps include daily yoga classes, delicious local cuisine prepared by our chefs, and a community of like-minded travellers from around the world. Whether you're here for a week or a month, Bali has a way of feeling like home.",
              },
            ],
            markDefs: [],
          },
        ],
      },
      {
        _type: "surfSpots",
        _key: "bali-ss",
        heading: "Surf Spots Near Our Bali Camps",
        spots: [
          {
            _key: "ss1",
            name: "Padang Padang",
            level: "Advanced",
            description:
              "Bali's most famous barrel. A fast, hollow left that breaks over a sharp reef shelf. Works best on bigger SW swells (6ft+) from June to September.",
          },
          {
            _key: "ss2",
            name: "Uluwatu",
            level: "Intermediate–Advanced",
            description:
              "A world-class left-hander with multiple takeoff zones. Long, walling rides on solid swells — one of Indonesia's most iconic waves.",
          },
          {
            _key: "ss3",
            name: "Dreamland",
            level: "All levels",
            description:
              "A wide beach break with punchy peaks. Forgiving for beginners at high tide, while the outside delivers fun barrels on bigger days.",
          },
          {
            _key: "ss4",
            name: "Balangan",
            level: "Intermediate",
            description:
              "A mellow left-hander over a flat reef shelf. Consistent and fun on mid-sized swells — a great confidence-builder for intermediates.",
          },
          {
            _key: "ss5",
            name: "Green Bowl",
            level: "Intermediate–Advanced",
            description:
              "A secluded spot reached by 300 steps down a cliff. Offers both lefts and rights depending on swell direction. Uncrowded due to the hike.",
          },
          {
            _key: "ss6",
            name: "Bingin",
            level: "Intermediate–Advanced",
            description:
              "A short, intense left tube over shallow reef. Best at mid to low tide with a south swell. Technical and rewarding.",
          },
        ],
      },
      {
        _type: "faqSection",
        _key: "bali-faq",
        heading: "Frequently Asked Questions",
        faqs: [
          {
            _key: "f1",
            question: "Is Bali good for beginner surfers?",
            answer:
              "Absolutely. Bali has dozens of beginner-friendly breaks with sandy bottoms and mellow whitewater. Our Green Bowl camp specialises in taking first-timers from zero to riding green waves within a week.",
          },
          {
            _key: "f2",
            question: "What is the best time to surf in Bali?",
            answer:
              "The peak surf season is June through September when consistent Indian Ocean swells hit the Bukit Peninsula. But Bali has rideable waves 365 days a year.",
          },
          {
            _key: "f3",
            question: "How much does a surf camp in Bali cost?",
            answer:
              "Our Bali camps start from around €500 per week, including accommodation, daily surf lessons or guiding, breakfast and dinner, yoga, video analysis, and airport transfers.",
          },
          {
            _key: "f4",
            question: "Do I need a visa to surf in Bali?",
            answer:
              "Most nationalities can get a Visa on Arrival (VOA) at the airport for 30 days, which can be extended once for another 30 days.",
          },
          {
            _key: "f5",
            question: "What should I bring to a surf camp in Bali?",
            answer:
              "We provide all surf equipment. Bring sunscreen (reef-safe preferred), a hat, light clothing, and mosquito repellent.",
          },
          {
            _key: "f6",
            question: "Can I work remotely from your Bali surf camp?",
            answer:
              "Yes — both camps have fast WiFi and plenty of quiet spots to work between surf sessions. Bali's timezone (GMT+8) works well for European morning meetings.",
          },
        ],
      },
    ],
  },
  "costa-rica": {
    description:
      "Costa Rica offers some of the most consistent surf conditions in Central America. Our camp in Avellanas puts you in the heart of Guanacaste's legendary coastline.",
    intro:
      "Playa Avellanas is one of Costa Rica's best-kept secrets: perfect waves, zero crowds, and a jungle backdrop that feels like a movie set.",
    comparison: {
      heading: "Stay at Our Surf Camp in Costa Rica",
      subtitle:
        "Playa Avellanas is one of Costa Rica's best-kept secrets: perfect waves, zero crowds, and a jungle backdrop that feels like a movie set.",
      features: [
        "Vibe",
        "Best For",
        "Surf Breaks Nearby",
        "Pool",
        "Rooms",
        "Group Size",
        "Meals",
        "Unique Feature",
      ],
    },
    pageBuilder: [
      {
        _type: "contentBlock",
        _key: "cr-cb1",
        heading: "When Is the Best Time to Surf in Costa Rica?",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Costa Rica's Pacific coast fires year-round, but the prime season is May through November when consistent south swells deliver overhead waves to Guanacaste's beaches.",
              },
            ],
            markDefs: [],
          },
        ],
      },
      {
        _type: "contentBlock",
        _key: "cr-cb2",
        heading: "Pura Vida at Playa Avellanas",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Our camp is surrounded by jungle — wake up to howler monkeys, spot sloths in the trees, and watch iguanas sun themselves by the pool.",
              },
            ],
            markDefs: [],
          },
        ],
        reverse: true,
        background: "dark-lighter",
      },
      {
        _type: "surfSpots",
        _key: "cr-ss",
        heading: "Surf Spots in Guanacaste, Costa Rica",
        spots: [
          { _key: "ss1", name: "Playa Avellanas", level: "All levels", description: "Our home break — a long stretch of sandy beach with multiple peaks." },
          { _key: "ss2", name: "Little Hawaii", level: "Intermediate–Advanced", description: "The southern end of Avellanas where a rock shelf creates a powerful, hollow right-hander." },
          { _key: "ss3", name: "Playa Negra", level: "Intermediate–Advanced", description: "One of Costa Rica's best right-hand reef breaks. A fast, hollow wave over a rock shelf." },
          { _key: "ss4", name: "Playa Grande", level: "Beginner–Intermediate", description: "A wide, sandy beach break inside Las Baulas National Park." },
          { _key: "ss5", name: "Tamarindo", level: "Beginner", description: "One of Costa Rica's most famous beginner spots. Wide, gentle waves on a sandy bottom." },
        ],
      },
      {
        _type: "faqSection",
        _key: "cr-faq",
        heading: "Frequently Asked Questions",
        faqs: [
          { _key: "f1", question: "Is Costa Rica good for beginner surfers?", answer: "Excellent. Playa Avellanas has several zones suited to beginners — wide sandy beaches with consistent whitewater for learning." },
          { _key: "f2", question: "What is the best time to surf in Costa Rica?", answer: "The dry season (December–April) brings smaller, clean conditions perfect for learning. May through November sees bigger, more consistent south swells." },
          { _key: "f3", question: "How safe is Costa Rica for solo travellers?", answer: "Costa Rica is one of the safest countries in Central America. Solo travellers make up about 60% of our guests." },
          { _key: "f4", question: "How do I get from San José airport to the camp?", answer: "The camp is about 4.5 hours from San José (SJO) airport. We offer shared shuttle transfers on Saturday arrival/departure days." },
          { _key: "f5", question: "Is the WiFi good enough for remote work?", answer: "Yes — we invested in a dedicated fibre line specifically for digital nomads." },
        ],
      },
    ],
  },
  portugal: {
    description:
      "Portugal's Atlantic coast delivers powerful, consistent surf that attracts riders from around the world. From the World Surfing Reserve of Ericeira to the wild Alentejo coast.",
    intro:
      "Portugal is Europe's surfing capital and for good reason. World-class waves, charming coastal villages, incredible food, and affordable prices.",
    comparison: {
      heading: "Which Portugal Camp Is Right for You?",
      subtitle: "Three distinct experiences across the Portuguese coast.",
      features: [
        "Location",
        "Vibe",
        "Best For",
        "Surf Breaks Nearby",
        "Pool",
        "Rooms",
        "Unique Feature",
      ],
    },
    pageBuilder: [
      {
        _type: "contentBlock",
        _key: "pt-cb1",
        heading: "When Is the Best Time to Surf in Portugal?",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Portugal's surf season never really stops. Summer (June–September) brings smaller, consistent swells ideal for beginners and intermediates. Autumn and winter (October–March) is when the Atlantic unleashes powerful swells.",
              },
            ],
            markDefs: [],
          },
        ],
      },
      {
        _type: "contentBlock",
        _key: "pt-cb2",
        heading: "Ericeira: Europe's World Surfing Reserve",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Ericeira is one of only two World Surfing Reserves in Europe, and our main camp sits oceanfront overlooking Foz do Lizandro beach.",
              },
            ],
            markDefs: [],
          },
        ],
        reverse: true,
        background: "dark-lighter",
      },
      {
        _type: "contentBlock",
        _key: "pt-cb3",
        heading: "The Wild Alentejo Coast",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [
              {
                _type: "span",
                _key: "s1",
                text: "Our Milfontes Eco Surfcamp offers something completely different: a small farm setting in the heart of the Southwest Alentejo Natural Park.",
              },
            ],
            markDefs: [],
          },
        ],
      },
      {
        _type: "surfSpots",
        _key: "pt-ss",
        heading: "Surf Spots on Portugal's Atlantic Coast",
        spots: [
          { _key: "ss1", name: "Coxos", level: "Advanced", description: "Portugal's most famous wave and one of Europe's best right-hand point breaks." },
          { _key: "ss2", name: "Ribeira d'Ilhas", level: "All levels", description: "A long, user-friendly right-hander and WSL event site." },
          { _key: "ss3", name: "Foz do Lizandro", level: "Beginner–Intermediate", description: "Our Ericeira camp's home break — a wide river-mouth beach break." },
          { _key: "ss4", name: "São Lourenço", level: "Intermediate–Advanced", description: "A powerful beach break 5 minutes south of Ericeira." },
          { _key: "ss5", name: "Praia do Malhão", level: "All levels", description: "A wild, empty beach break in the Alentejo near our Milfontes camp." },
          { _key: "ss6", name: "Zambujeira do Mar", level: "Intermediate", description: "A picturesque cove near Milfontes with a consistent left and right peak." },
        ],
      },
      {
        _type: "faqSection",
        _key: "pt-faq",
        heading: "Frequently Asked Questions",
        faqs: [
          { _key: "f1", question: "Is Portugal good for beginner surfers?", answer: "Absolutely. Portugal has a huge variety of beach breaks with sandy bottoms that are perfect for learning." },
          { _key: "f2", question: "What is the best time to surf in Portugal?", answer: "Summer (June–September) is ideal for beginners and intermediates. Autumn/winter brings powerful Atlantic swells for experienced surfers." },
          { _key: "f3", question: "Do I need a wetsuit to surf in Portugal?", answer: "Yes, always. In summer a 3/2mm fullsuit is standard. We provide wetsuits free of charge." },
          { _key: "f4", question: "What's the difference between Ericeira and Milfontes?", answer: "Ericeira is a vibrant surf town with easy access from Lisbon. Milfontes is a rural eco-retreat in a natural park." },
          { _key: "f5", question: "How do I get to your Portugal surf camps?", answer: "Fly into Lisbon (LIS) airport. Ericeira is 45 minutes north. Milfontes is about 2.5 hours south." },
          { _key: "f6", question: "Can I visit multiple camps in one trip?", answer: "Yes — many guests spend a week in Ericeira and a week in Milfontes for the contrast." },
        ],
      },
    ],
  },
  morocco: {
    description:
      "Morocco's southern coast offers incredible right-hand point breaks, warm hospitality, and an unforgettable cultural experience. This is where Rapture started over 20 years ago.",
    intro:
      "Sidi Ifni is where it all began. More than 20 years ago, our founders fell in love with Morocco's waves and culture — and started the very first Rapture camp right here.",
    comparison: {
      heading: "Stay at Our Surf Camp in Morocco",
      subtitle: "Sidi Ifni is where it all began. More than 20 years ago, our founders started the very first Rapture camp right here.",
      features: ["Vibe", "Best For", "Surf Breaks Nearby", "Pool", "Rooms", "Group Size", "Meals", "Unique Feature"],
    },
    pageBuilder: [
      {
        _type: "contentBlock",
        _key: "ma-cb1",
        heading: "When Is the Best Time to Surf in Morocco?",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [{ _type: "span", _key: "s1", text: "Morocco is a true winter surf destination. From October through April, powerful Atlantic swells wrap around the coast, delivering world-class right-hand point breaks." }],
            markDefs: [],
          },
        ],
      },
      {
        _type: "contentBlock",
        _key: "ma-cb2",
        heading: "Culture, Tradition, and Incredible Hospitality",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [{ _type: "span", _key: "s1", text: "Morocco offers something no other surf destination can: a deep immersion into North African culture. Explore Berber villages, wander through ancient medinas, ride camels along the beach." }],
            markDefs: [],
          },
        ],
        reverse: true,
        background: "dark-lighter",
      },
      {
        _type: "surfSpots",
        _key: "ma-ss",
        heading: "Surf Spots Near Sidi Ifni, Morocco",
        spots: [
          { _key: "ss1", name: "Sidi Ifni Main", level: "All levels", description: "The town beach offers a wide, sandy-bottom break with peaks along its length." },
          { _key: "ss2", name: "Legzira", level: "Intermediate–Advanced", description: "A long, walling right-hander in front of Morocco's famous red rock arches." },
          { _key: "ss3", name: "The Camel", level: "Advanced", description: "A powerful, hollow right that peels along a rocky point south of Sidi Ifni." },
          { _key: "ss4", name: "Banana Village", level: "Beginner–Intermediate", description: "Named after our camp, this is a mellow beach break right on the doorstep." },
          { _key: "ss5", name: "Devil's Rock", level: "Advanced", description: "A heavy, shallow reef break that only works on bigger swells." },
        ],
      },
      {
        _type: "faqSection",
        _key: "ma-faq",
        heading: "Frequently Asked Questions",
        faqs: [
          { _key: "f1", question: "Is Morocco safe for surf travellers?", answer: "Yes. Morocco has a well-established surf tourism scene. Our camp has operated here for over 20 years." },
          { _key: "f2", question: "What is the best time to surf in Morocco?", answer: "October through April is prime season — powerful north Atlantic swells deliver consistent overhead waves." },
          { _key: "f3", question: "Do I need a wetsuit in Morocco?", answer: "In winter a 3/2mm wetsuit is recommended. In summer you can often surf in boardshorts." },
          { _key: "f4", question: "What makes Morocco different from other surf destinations?", answer: "Morocco offers world-class right-hand point breaks, North African culture, incredible food, and excellent value." },
          { _key: "f5", question: "How do I get to your Morocco surf camp?", answer: "Fly into Agadir (AGA) airport. The camp is approximately 2.5 hours south in Sidi Ifni." },
        ],
      },
    ],
  },
  nicaragua: {
    description:
      "Nicaragua's Pacific coast delivers powerful beach breaks, 330 days of offshore winds, and a laid-back atmosphere that's hard to beat.",
    intro:
      "Playa Maderas is pure magic — a jungle-fringed bay with consistent surf, warm water, and a vibe that makes you never want to leave.",
    comparison: {
      heading: "Which Nicaragua Camp Is Right for You?",
      subtitle: "Two properties at Playa Maderas, each with a distinct personality.",
      features: ["Vibe", "Best For", "Pool", "Accommodation", "Group Size", "Meals", "Standout Feature"],
    },
    pageBuilder: [
      {
        _type: "contentBlock",
        _key: "ni-cb1",
        heading: "When Is the Best Time to Surf in Nicaragua?",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [{ _type: "span", _key: "s1", text: "Nicaragua is blessed with 330 days of offshore winds per year — one of the most consistent surf destinations on the planet." }],
            markDefs: [],
          },
        ],
      },
      {
        _type: "contentBlock",
        _key: "ni-cb2",
        heading: "A Surf Sanctuary in the Jungle",
        body: [
          {
            _type: "block",
            _key: "b1",
            style: "normal",
            children: [{ _type: "span", _key: "s1", text: "Our main camp sits on a hilltop overlooking the jungle and ocean, with an infinity pool that's become one of the most photographed spots in Nicaraguan surf culture." }],
            markDefs: [],
          },
        ],
        reverse: true,
        background: "dark-lighter",
      },
      {
        _type: "surfSpots",
        _key: "ni-ss",
        heading: "Surf Spots Near Playa Maderas, Nicaragua",
        spots: [
          { _key: "ss1", name: "Playa Maderas", level: "All levels", description: "Our home break — a jungle-fringed bay with a sandy bottom and multiple peaks." },
          { _key: "ss2", name: "Playa Remanso", level: "Beginner–Intermediate", description: "A sheltered bay just south with smaller, mellow waves." },
          { _key: "ss3", name: "Playa Yankee", level: "Intermediate–Advanced", description: "A powerful beach break north of Maderas that picks up more swell." },
          { _key: "ss4", name: "Playa El Coco", level: "Intermediate", description: "A consistent left and right peak over a cobblestone bottom." },
          { _key: "ss5", name: "Punta Teonoste", level: "Advanced", description: "A long, walling left-hander that wraps around a rocky point." },
        ],
      },
      {
        _type: "faqSection",
        _key: "ni-faq",
        heading: "Frequently Asked Questions",
        faqs: [
          { _key: "f1", question: "Is Nicaragua good for beginner surfers?", answer: "Yes. Playa Maderas has a sandy bottom and delivers consistent, forgiving waves ideal for learning." },
          { _key: "f2", question: "What is the best time to surf in Nicaragua?", answer: "Nicaragua gets waves year-round thanks to 330 days of offshore winds." },
          { _key: "f3", question: "How safe is Nicaragua for tourists?", answer: "The San Juan del Sur and Maderas Beach area is well-established for tourism and very safe." },
          { _key: "f4", question: "What's the difference between the hilltop camp and the resort?", answer: "The hilltop camp is larger, more social. The resort is smaller (max 12 guests), more intimate." },
          { _key: "f5", question: "How do I get from Managua airport to the camp?", answer: "The camp is about 2.5 hours from Managua (MGA) airport. We offer shuttle transfers." },
          { _key: "f6", question: "Can I combine surf with volcano hiking?", answer: "Definitely. Nicaragua is the Land of Lakes and Volcanoes — we organise day trips." },
        ],
      },
    ],
  },
};

// ─── Camps ─────────────────────────────────────────────────────────────────
const camps = [
  {
    _id: campIds["green-bowl"],
    name: "Green Bowl",
    slug: "green-bowl",
    countrySlug: "bali",
    location: "Bukit Peninsula, Bali",
    tagline: "Beachfront camp with pool and open-air restaurant",
    rating: 4.8,
    reviewCount: 312,
    amenities: ["pool", "surf-lessons", "yoga", "restaurant", "wifi", "bar"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/bali-green-bowl-surf-stay",
    latitude: -8.81,
    longitude: 115.14,
    elfsightId: "3fe95465-93dd-483e-b5a0-6817fe35a177",
  },
  {
    _id: campIds["padang-padang"],
    name: "Padang Padang",
    slug: "padang-padang",
    countrySlug: "bali",
    location: "Bukit Peninsula, Bali",
    tagline: "Boutique villa steps from Bali's most famous barrel",
    rating: 4.9,
    reviewCount: 187,
    amenities: ["pool", "surf-lessons", "yoga", "restaurant", "wifi"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/bali-padang-padang-surf-stay",
    latitude: -8.81,
    longitude: 115.1,
    elfsightId: "64690298-a208-4a08-a02f-3af3c1c064f0",
  },
  {
    _id: campIds["avellanas"],
    name: "Avellanas",
    slug: "avellanas",
    countrySlug: "costa-rica",
    location: "Guanacaste, Costa Rica",
    tagline: "Jungle retreat with outdoor cinema and recovery centre",
    rating: 4.7,
    reviewCount: 245,
    amenities: ["pool", "surf-lessons", "yoga", "restaurant", "wifi", "gym"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/costa-rica-avellanas-surf-stay",
    latitude: 10.26,
    longitude: -85.84,
    elfsightId: "d7ad8e50-5970-408b-8530-a8cb217f6e48",
  },
  {
    _id: campIds["ericeira-lizandro"],
    name: "Ericeira",
    slug: "ericeira-lizandro",
    countrySlug: "portugal",
    location: "World Surfing Reserve, Portugal",
    tagline: "Oceanfront camp in Europe's World Surfing Reserve",
    rating: 4.8,
    reviewCount: 428,
    amenities: ["surf-lessons", "yoga", "restaurant", "wifi", "bar", "bikes"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/portugal-ericeira-surf-stay",
    latitude: 38.96,
    longitude: -9.42,
    elfsightId: "4b0fc7df-20a4-459a-b38e-28ab56a32099",
  },
  {
    _id: campIds["ericeira-coxos-surf-villa"],
    name: "Coxos Surf Villa",
    slug: "ericeira-coxos-surf-villa",
    countrySlug: "portugal",
    location: "Ericeira, Portugal",
    tagline: "Premium villa with infinity pool and ocean views",
    rating: 4.9,
    reviewCount: 156,
    amenities: ["pool", "surf-lessons", "yoga", "restaurant", "wifi"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/pt-cx-surf-and-stay",
    latitude: 38.98,
    longitude: -9.42,
    elfsightId: "c4ec2428-a8fb-41fb-8308-cbdbc5febca6",
  },
  {
    _id: campIds["alentejo-milfontes"],
    name: "Milfontes",
    slug: "alentejo-milfontes",
    countrySlug: "portugal",
    location: "Alentejo Coast, Portugal",
    tagline: "Eco surf camp on a small farm in a nature park",
    rating: 4.6,
    reviewCount: 98,
    amenities: ["surf-lessons", "yoga", "restaurant", "wifi"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/portugal-milfontes-surf-and-stay",
    latitude: 37.72,
    longitude: -8.79,
    elfsightId: "a6b57b4b-ac51-44a7-889f-75709e21c138",
  },
  {
    _id: campIds["banana-village"],
    name: "Banana Village",
    slug: "banana-village",
    countrySlug: "morocco",
    location: "Sidi Ifni, Morocco",
    tagline: "Intimate surf house with rooftop terrace and ocean panorama",
    rating: 4.7,
    reviewCount: 203,
    amenities: ["surf-lessons", "yoga", "restaurant", "wifi"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/morocco-banana-village-surf-and-stay",
    latitude: 29.38,
    longitude: -10.17,
    elfsightId: "",
  },
  {
    _id: campIds["maderas"],
    name: "Playa Maderas",
    slug: "maderas",
    countrySlug: "nicaragua",
    location: "San Juan del Sur, Nicaragua",
    tagline: "Hilltop camp with infinity pool and glamping tents",
    rating: 4.8,
    reviewCount: 276,
    amenities: ["pool", "surf-lessons", "yoga", "restaurant", "wifi", "bar"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/nicaragua-maderas-surf-stay",
    latitude: 11.16,
    longitude: -85.83,
    elfsightId: "0e05f6aa-1dd8-4c38-9b40-529290504acf",
  },
  {
    _id: campIds["maderas-surf-resort"],
    name: "Maderas Surf Resort",
    slug: "maderas-surf-resort",
    countrySlug: "nicaragua",
    location: "Playa Maderas, Nicaragua",
    tagline: "Boutique resort with direct beach access",
    rating: 4.7,
    reviewCount: 134,
    amenities: ["pool", "surf-lessons", "restaurant", "wifi", "bar"],
    bookingUrl:
      "https://bookings.rapturecamps.com/en/product/nicaragua-surf-resort",
    latitude: 11.16,
    longitude: -85.83,
    elfsightId: "0e05f6aa-1dd8-4c38-9b40-529290504acf",
  },
];

// ─── Run migration ─────────────────────────────────────────────────────────
async function migrate() {
  console.log("🚀 Starting Sanity migration...\n");

  const tx = client.transaction();

  // 1. Site Settings
  console.log("📋 Creating Site Settings...");
  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    title: "Rapture Surfcamps",
    description:
      "A network of 8 unique surf camps in 5 countries on 4 continents.",
    navigation: [
      { _key: "n1", label: "Destinations", href: "/surfcamp" },
      { _key: "n2", label: "Blog", href: "/blog" },
      { _key: "n3", label: "About", href: "/about" },
      { _key: "n4", label: "FAQ", href: "/faq" },
      { _key: "n5", label: "Contact", href: "/contact" },
    ],
    stats: [
      { _key: "s1", label: "EST", value: 2003 },
      { _key: "s2", label: "Happy Customers", value: 80000, suffix: "k" },
      { _key: "s3", label: "TripAdvisor Awards", value: 23 },
      { _key: "s4", label: "Destinations", value: 8 },
      { _key: "s5", label: "Instagram Followers", value: 35000, suffix: "k" },
    ],
    socialLinks: {
      instagram: "https://www.instagram.com/rapturecamps",
      facebook: "https://www.facebook.com/rapturecamps",
      youtube: "https://www.youtube.com/@rapturecamps",
      tiktok: "https://www.tiktok.com/@rapturecamps",
    },
    contact: {
      email: "info@rapturecamps.com",
      phone: "+447700177360",
      whatsapp: "https://wa.me/447700177360",
    },
  });

  // 2. Countries
  console.log("🌍 Creating Countries...");
  for (const c of countries) {
    const content = countryContent[c.slug];
    tx.createOrReplace({
      _id: countryIds[c.slug],
      _type: "country",
      name: c.name,
      slug: { _type: "slug", current: c.slug },
      flag: c.flag,
      description: content.description,
      intro: content.intro,
      comparison: content.comparison,
      pageBuilder: content.pageBuilder,
    });
  }

  // 3. Camps
  console.log("🏄 Creating Camps...");
  for (const camp of camps) {
    tx.createOrReplace({
      _id: camp._id,
      _type: "camp",
      name: camp.name,
      slug: { _type: "slug", current: camp.slug },
      country: { _type: "reference", _ref: countryIds[camp.countrySlug] },
      location: camp.location,
      tagline: camp.tagline,
      rating: camp.rating,
      reviewCount: camp.reviewCount,
      amenities: camp.amenities,
      bookingUrl: camp.bookingUrl,
      latitude: camp.latitude,
      longitude: camp.longitude,
      elfsightId: camp.elfsightId,
    });
  }

  // Commit
  console.log("\n⏳ Committing transaction...");
  const result = await tx.commit();
  console.log(`✅ Migration complete! ${result.documentIds.length} documents created/updated.`);
  console.log("\nDocuments:");
  result.documentIds.forEach((id) => console.log(`  - ${id}`));
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
