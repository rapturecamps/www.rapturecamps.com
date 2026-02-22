/**
 * Migration: Seeds ALL sub-page content (headings, subtexts, image breaks,
 * equipment, inclusions, galleries) into camp documents.
 * Run: node sanity/migrate-subpages-full.mjs
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
if (!token) { console.error("❌ SANITY_WRITE_TOKEN not found."); process.exit(1); }

const client = createClient({
  projectId: "ypmt1bmc", dataset: "production", apiVersion: "2024-01-01", token, useCdn: false,
});

// ═══════════════════════════════════════════════════════════════════
// SURF PAGE — new fields
// ═══════════════════════════════════════════════════════════════════
const surfExtra = {
  imageBreakUrl: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=1920&h=800&fit=crop",
  imageBreakAlt: "Surfer riding a wave",
  imageBreakCaption: "The lineup near camp",

  spotsHeading: "Surf Spots Nearby",
  spotsSubtext: "We rotate between 15+ breaks depending on conditions. Here are some of the highlights.",

  lessonsHeading: "Surf Lessons & Coaching",
  lessonsBody: "Every session starts with a plan. Our ISA-certified instructors analyse the conditions, match you to the right break, and set goals for the session. In the water, they're right there with you — correcting your stance, helping you read the waves, pushing you just enough.\n\nWe keep groups to a maximum of 5 surfers per instructor, so you get genuine one-on-one attention. After each session, we review video footage together so you can see exactly what to work on. It's the fastest way to improve.",
  lessonsImageUrl: "https://images.unsplash.com/photo-1504681869696-d977211a5f4c?w=800&h=600&fit=crop",
  lessonsImageAlt: "Surf coaching session",

  levelsHeading: "Your Surf Level",
  levelsSubtext: "Whether it's your first wave or your thousandth, we have a programme tailored for you.",

  scheduleHeading: "A Typical Surf Day",
  scheduleSubtext: "Every day is different depending on conditions, but here's what a standard day looks like.",

  equipmentHeading: "Boards & Equipment",
  equipmentSubtext: "Everything you need is included. Just bring yourself and a sense of adventure.",
  equipment: [
    { _key: "eq1", item: "Surfboards", desc: "Soft-tops, funboards, shortboards, and longboards — matched to your level" },
    { _key: "eq2", item: "Wetsuits", desc: "Premium wetsuits in all sizes. Thickness matched to water temperature" },
    { _key: "eq3", item: "Rash Vests", desc: "Sun protection for warm-water sessions when you don't need a full suit" },
    { _key: "eq4", item: "Reef Booties", desc: "Available for reef sessions — protects your feet on sharp coral" },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// ROOMS PAGE — new fields
// ═══════════════════════════════════════════════════════════════════
const roomsExtra = {
  imageBreakUrl: "https://images.unsplash.com/photo-1559628233-100c798642d4?w=1920&h=800&fit=crop",
  imageBreakAlt: "Pool area at the camp",
  imageBreakCaption: "The pool & lounge area",

  inclusionsHeading: "Every Booking Includes",
  inclusionsSubtext: "No matter which room you choose, these are always part of the package.",
  inclusions: [
    { _key: "inc1", item: "Daily surf lessons" },
    { _key: "inc2", item: "Three-course breakfast" },
    { _key: "inc3", item: "Dinner (Mon – Fri)" },
    { _key: "inc4", item: "Beach transfers" },
    { _key: "inc5", item: "Yoga sessions" },
    { _key: "inc6", item: "Free WiFi" },
  ],

  facilitiesHeading: "Camp Facilities",
  facilitiesSubtext: "Our camps are designed to feel like home — with a few upgrades.",

  galleryImages: [
    { _key: "rg1", url: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500&h=400&fit=crop", alt: "Lounge area" },
    { _key: "rg2", url: "https://images.unsplash.com/photo-1582610116397-edb318620f90?w=500&h=400&fit=crop", alt: "Outdoor bathroom" },
    { _key: "rg3", url: "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=500&h=400&fit=crop", alt: "Pool at sunset" },
    { _key: "rg4", url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=500&h=400&fit=crop", alt: "Tropical surroundings" },
  ],
};

// ═══════════════════════════════════════════════════════════════════
// FOOD PAGE — new fields
// ═══════════════════════════════════════════════════════════════════
const foodExtra = {
  imageBreakUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=800&fit=crop",
  imageBreakAlt: "Fresh food preparation",
  imageBreakCaption: "Fresh, local ingredients — prepared daily by our chefs",

  menuHeading: "Sample Weekly Menu",
  menuSubtext: "Our menu rotates weekly to keep things fresh. Here's a taste of what a typical dinner week looks like.",

  dietaryHeading: "Dietary Requirements",
  dietarySubtext: "Everyone eats well here. Let us know your needs when booking and our chefs will take care of the rest.",

  galleryImages: [
    { _key: "fg1", url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=400&fit=crop", alt: "Breakfast spread" },
    { _key: "fg2", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop", alt: "Plated dinner" },
    { _key: "fg3", url: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=500&h=400&fit=crop", alt: "Tropical smoothie bowls" },
    { _key: "fg4", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=400&fit=crop", alt: "BBQ night" },
  ],
};

// ═══════════════════════════════════════════════════════════════════

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
  console.log("🚀 Seeding remaining sub-page content...\n");

  const tx = client.transaction();

  for (const id of campIds) {
    console.log(`  → ${id}`);
    tx.patch(id, (patch) =>
      patch.set({
        "surfPage.imageBreakUrl": surfExtra.imageBreakUrl,
        "surfPage.imageBreakAlt": surfExtra.imageBreakAlt,
        "surfPage.imageBreakCaption": surfExtra.imageBreakCaption,
        "surfPage.spotsHeading": surfExtra.spotsHeading,
        "surfPage.spotsSubtext": surfExtra.spotsSubtext,
        "surfPage.lessonsHeading": surfExtra.lessonsHeading,
        "surfPage.lessonsBody": surfExtra.lessonsBody,
        "surfPage.lessonsImageUrl": surfExtra.lessonsImageUrl,
        "surfPage.lessonsImageAlt": surfExtra.lessonsImageAlt,
        "surfPage.levelsHeading": surfExtra.levelsHeading,
        "surfPage.levelsSubtext": surfExtra.levelsSubtext,
        "surfPage.scheduleHeading": surfExtra.scheduleHeading,
        "surfPage.scheduleSubtext": surfExtra.scheduleSubtext,
        "surfPage.equipmentHeading": surfExtra.equipmentHeading,
        "surfPage.equipmentSubtext": surfExtra.equipmentSubtext,
        "surfPage.equipment": surfExtra.equipment,

        "roomsPage.imageBreakUrl": roomsExtra.imageBreakUrl,
        "roomsPage.imageBreakAlt": roomsExtra.imageBreakAlt,
        "roomsPage.imageBreakCaption": roomsExtra.imageBreakCaption,
        "roomsPage.inclusionsHeading": roomsExtra.inclusionsHeading,
        "roomsPage.inclusionsSubtext": roomsExtra.inclusionsSubtext,
        "roomsPage.inclusions": roomsExtra.inclusions,
        "roomsPage.facilitiesHeading": roomsExtra.facilitiesHeading,
        "roomsPage.facilitiesSubtext": roomsExtra.facilitiesSubtext,
        "roomsPage.galleryImages": roomsExtra.galleryImages,

        "foodPage.imageBreakUrl": foodExtra.imageBreakUrl,
        "foodPage.imageBreakAlt": foodExtra.imageBreakAlt,
        "foodPage.imageBreakCaption": foodExtra.imageBreakCaption,
        "foodPage.menuHeading": foodExtra.menuHeading,
        "foodPage.menuSubtext": foodExtra.menuSubtext,
        "foodPage.dietaryHeading": foodExtra.dietaryHeading,
        "foodPage.dietarySubtext": foodExtra.dietarySubtext,
        "foodPage.galleryImages": foodExtra.galleryImages,
      })
    );
  }

  console.log("\n⏳ Committing...");
  await tx.commit();
  console.log("✅ Done! All camps updated with full sub-page content.");
}

migrate().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
