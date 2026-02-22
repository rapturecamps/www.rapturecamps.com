/**
 * Migration: Seeds surf, rooms, and food sub-page content into camp documents.
 * Run: node sanity/migrate-subpages.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
  console.error("❌ SANITY_WRITE_TOKEN not found.");
  process.exit(1);
}

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// Shared data across all camps (will be customized per-camp later in Studio)
const surfPage = {
  surfSpots: [
    { _key: "sp1", name: "Main Beach Break", level: "All Levels", type: "Beach Break", desc: "Our go-to spot for daily lessons. Consistent, forgiving waves with a sandy bottom — perfect for building confidence and progressing fast." },
    { _key: "sp2", name: "The Reef", level: "Intermediate+", type: "Reef Break", desc: "A fast, hollow right-hander breaking over coral. Best on mid-tide with a south swell. Booties recommended." },
    { _key: "sp3", name: "Secret Point", level: "Advanced", type: "Point Break", desc: "Long, peeling left-hander wrapping around the headland. Can hold overhead swells and offers 200m+ rides on the right day." },
  ],
  schedule: [
    { _key: "sc1", time: "06:30", activity: "Wake-up & light stretch" },
    { _key: "sc2", time: "07:00", activity: "Breakfast buffet" },
    { _key: "sc3", time: "08:00", activity: "Surf theory & video analysis" },
    { _key: "sc4", time: "08:30", activity: "Morning surf session (2–3 hrs)" },
    { _key: "sc5", time: "12:00", activity: "Lunch & free time" },
    { _key: "sc6", time: "14:00", activity: "Yoga or recovery session" },
    { _key: "sc7", time: "15:00", activity: "Afternoon surf session (2 hrs)" },
    { _key: "sc8", time: "17:30", activity: "Sunset beers & video review" },
    { _key: "sc9", time: "19:00", activity: "Dinner" },
  ],
  levels: [
    {
      _key: "lv1",
      level: "Beginner",
      subtitle: "Never surfed or still learning to stand",
      features: ["Pop-up technique on the beach", "Paddling and wave selection", "Riding whitewater to green waves", "Ocean safety & etiquette"],
      outcome: "By the end of the week, you'll be standing up and riding unbroken green waves.",
    },
    {
      _key: "lv2",
      level: "Intermediate",
      subtitle: "You can stand up and ride the wave face",
      features: ["Bottom turns & top turns", "Reading the lineup & positioning", "Generating speed on the face", "Duck diving & wave selection"],
      outcome: "You'll leave with cleaner turns, better wave reading, and the confidence to surf new spots.",
    },
    {
      _key: "lv3",
      level: "Advanced",
      subtitle: "Experienced surfer looking for the best waves",
      features: ["Guided sessions at reef and point breaks", "Barrel riding techniques", "Aerial progression", "Swell and wind forecasting"],
      outcome: "Our instructors take you to the best breaks for the conditions — spots you'd never find on your own.",
    },
  ],
};

const roomsPage = {
  rooms: [
    {
      _key: "rm1",
      type: "Shared Room",
      tag: "Most Popular",
      price: "From €45 / night",
      capacity: "4–6 guests",
      desc: "Our shared rooms are spacious, clean, and designed for the social surfer. Each bed comes with a privacy curtain, reading light, and personal power outlet. The quickest way to make friends you'll keep for life.",
      features: ["Personal locker & shelf space", "Air conditioning", "Fresh linen & towels", "Shared bathroom"],
    },
    {
      _key: "rm2",
      type: "Twin / Double",
      tag: "",
      price: "From €75 / night",
      capacity: "2 guests",
      desc: "A room for two — ideal for couples or friends travelling together. The same Rapture atmosphere with a bit more privacy. All rooms have their own ensuite bathroom.",
      features: ["Private ensuite bathroom", "Air conditioning", "Balcony or terrace", "Fresh linen & towels"],
    },
    {
      _key: "rm3",
      type: "Private Room",
      tag: "Premium",
      price: "From €95 / night",
      capacity: "1–2 guests",
      desc: "Your own space at the camp. These rooms come with extra touches — a minibar, premium bedding, and a private terrace with a view. Limited availability, so book early.",
      features: ["King-size bed", "Private terrace", "Mini-fridge", "Premium bathroom amenities"],
    },
    {
      _key: "rm4",
      type: "Glamping Tent",
      tag: "Unique",
      price: "From €55 / night",
      capacity: "2 guests",
      desc: "Sleep under the stars without roughing it. Our glamping tents have proper beds, fairy lights, and all the romance of camping with none of the discomfort. Wake up to birdsong and ocean sounds.",
      features: ["Real mattress & bedding", "Fairy lights & lanterns", "Shared facilities nearby", "Surrounded by nature"],
    },
  ],
  facilities: [
    { _key: "fc1", name: "Swimming Pool", desc: "Open-air pool with sun loungers" },
    { _key: "fc2", name: "Yoga Shala", desc: "Dedicated space for daily classes" },
    { _key: "fc3", name: "Outdoor Lounge", desc: "Hammocks, daybeds & chill areas" },
    { _key: "fc4", name: "Surf Storage", desc: "Secure board racks & rinse station" },
    { _key: "fc5", name: "Communal Kitchen", desc: "For those in-between snack cravings" },
    { _key: "fc6", name: "Laundry Service", desc: "Wash & fold available daily" },
  ],
};

const foodPage = {
  meals: [
    {
      _key: "ml1",
      meal: "Breakfast",
      time: "7:30 – 9:30",
      desc: "A proper spread to fuel your morning session. Fresh tropical fruit, eggs any way you like, homemade granola, smoothie bowls, pancakes, toast with local jams, and unlimited coffee and tea.",
      highlights: ["Fresh tropical fruit", "Eggs & pancakes to order", "Smoothie bowls", "Unlimited coffee & tea"],
    },
    {
      _key: "ml2",
      meal: "Lunch",
      time: "On the go",
      desc: "Between surf sessions, we keep it light and energising. Packed snacks, fresh fruit, and energy bars come with you to the beach. Some camps offer an optional light lunch at the camp.",
      highlights: ["Beach snack packs", "Fresh fruit & energy bars", "Hydration station", "Optional camp lunch"],
    },
    {
      _key: "ml3",
      meal: "Dinner",
      time: "19:00 – 20:30",
      desc: "The highlight of the day. Three-course dinners Monday through Friday, featuring a rotating menu of local and international dishes. Think fresh-caught fish, fragrant curries, pasta nights, and BBQ Fridays.",
      highlights: ["Three courses", "Rotating menu", "Local & international", "Mon – Fri"],
    },
  ],
  sampleMenu: [
    { _key: "sm1", day: "Monday", starter: "Watermelon & feta salad", main: "Grilled mahi-mahi with lime rice", dessert: "Coconut panna cotta" },
    { _key: "sm2", day: "Tuesday", starter: "Tom kha soup", main: "Chicken satay with peanut noodles", dessert: "Mango sticky rice" },
    { _key: "sm3", day: "Wednesday", starter: "Bruschetta trio", main: "Homemade pasta with pesto & roast veg", dessert: "Tiramisu" },
    { _key: "sm4", day: "Thursday", starter: "Vietnamese summer rolls", main: "Slow-cooked beef rendang with jasmine rice", dessert: "Banana fritters with ice cream" },
    { _key: "sm5", day: "Friday", starter: "Garden salad with tahini", main: "BBQ mixed grill with grilled corn & slaw", dessert: "Chocolate fondant" },
  ],
  dietary: [
    { _key: "dt1", name: "Vegetarian", desc: "Full veggie options at every meal" },
    { _key: "dt2", name: "Vegan", desc: "Plant-based dishes always available" },
    { _key: "dt3", name: "Gluten-Free", desc: "GF alternatives for every course" },
    { _key: "dt4", name: "Lactose-Free", desc: "Dairy-free options on request" },
    { _key: "dt5", name: "Halal", desc: "Halal-prepared meals available" },
    { _key: "dt6", name: "Nut-Free", desc: "Strict nut-free preparation possible" },
  ],
};

const campIds = [
  "camp-bali-green-bowl",
  "camp-bali-padang-padang",
  "camp-costa-rica-avellanas",
  "camp-portugal-ericeira",
  "camp-portugal-coxos",
  "camp-portugal-milfontes",
  "camp-morocco-banana-village",
  "camp-nicaragua-maderas",
  "camp-nicaragua-surf-resort",
];

async function migrate() {
  console.log("🚀 Seeding sub-page content into camps...\n");

  const tx = client.transaction();

  for (const id of campIds) {
    console.log(`  → ${id}`);
    tx.patch(id, (patch) =>
      patch.set({
        surfPage,
        roomsPage,
        foodPage,
      })
    );
  }

  console.log("\n⏳ Committing...");
  await tx.commit();
  console.log("✅ Done! All 9 camps now have surf, rooms, and food page content.");
}

migrate().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
