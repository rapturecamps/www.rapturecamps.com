/**
 * Migration: Converts flat sub-page fields (surfPage, roomsPage, foodPage)
 * into pageBuilder arrays for the new block-based architecture.
 *
 * Run: node sanity/migrate-to-pagebuilder.mjs
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

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

function key() { return crypto.randomBytes(6).toString("hex"); }

function textToPortableText(text) {
  if (!text) return [];
  return text.split("\n\n").map((para) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text: para.trim(), marks: [] }],
  }));
}

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
  console.log("🚀 Migrating sub-page data to pageBuilder arrays...\n");

  for (const id of campIds) {
    console.log(`  Fetching ${id}...`);
    const camp = await client.fetch(
      `*[_type == "camp" && _id == $id][0]{ surfPage, roomsPage, foodPage }`,
      { id }
    );

    if (!camp) { console.log(`    ⚠️  Not found, skipping`); continue; }

    const s = camp.surfPage || {};
    const r = camp.roomsPage || {};
    const f = camp.foodPage || {};

    // ─── Surf Page Builder ────────────────────────────────────────────
    const surfPageBuilder = [
      {
        _key: key(), _type: "surfIntro",
        heading: s.introHeading || "The Waves",
        body: s.introBody || "",
        conditionsCard: (s.conditionsCard || []).map((c) => ({ ...c, _key: c._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "surfForecast",
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "imageBreak",
        alt: s.imageBreakAlt || "Surfer riding a wave",
        height: "md",
        caption: s.imageBreakCaption || "",
      },
      {
        _key: key(), _type: "surfSpots",
        heading: s.spotsHeading || "Surf Spots Nearby",
        subtext: s.spotsSubtext || "",
        surfSpots: (s.surfSpots || []).map((sp) => ({ ...sp, _key: sp._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "contentBlock",
        heading: s.lessonsHeading || "Surf Lessons & Coaching",
        body: textToPortableText(s.lessonsBody || ""),
        imageAlt: s.lessonsImageAlt || "Surf coaching session",
        reverse: false,
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "surfLevels",
        heading: s.levelsHeading || "Your Surf Level",
        subtext: s.levelsSubtext || "",
        levels: (s.levels || []).map((lv) => ({
          ...lv,
          _key: lv._key || key(),
          features: (lv.features || []).map((f) => typeof f === "string" ? f : f),
        })),
        background: "dark",
      },
      {
        _key: key(), _type: "surfSchedule",
        heading: s.scheduleHeading || "A Typical Surf Day",
        subtext: s.scheduleSubtext || "",
        schedule: (s.schedule || []).map((sc) => ({ ...sc, _key: sc._key || key() })),
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "surfEquipment",
        heading: s.equipmentHeading || "Boards & Equipment",
        subtext: s.equipmentSubtext || "",
        equipment: (s.equipment || []).map((eq) => ({ ...eq, _key: eq._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "ctaSection",
        heading: "Ready to Surf?",
        text: "Book your surf camp adventure today and ride the waves of a lifetime.",
        buttonText: "Book Now",
      },
    ];

    // ─── Rooms Page Builder ───────────────────────────────────────────
    const roomsPageBuilder = [
      {
        _key: key(), _type: "contentBlock",
        heading: r.introHeading || "Where You'll Stay",
        body: textToPortableText(r.introBody || ""),
        reverse: false,
        background: "dark",
      },
      {
        _key: key(), _type: "roomTypes",
        rooms: (r.rooms || []).map((rm) => ({ ...rm, _key: rm._key || key() })),
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "imageBreak",
        alt: r.imageBreakAlt || "Pool area at the camp",
        height: "md",
        caption: r.imageBreakCaption || "",
      },
      {
        _key: key(), _type: "roomInclusions",
        heading: r.inclusionsHeading || "Every Booking Includes",
        subtext: r.inclusionsSubtext || "",
        inclusions: (r.inclusions || []).map((inc) => ({ ...inc, _key: inc._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "roomFacilities",
        heading: r.facilitiesHeading || "Camp Facilities",
        subtext: r.facilitiesSubtext || "",
        facilities: (r.facilities || []).map((fc) => ({ ...fc, _key: fc._key || key() })),
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "imageGallery",
        images: (r.galleryImages || []).map((img) => ({ ...img, _key: img._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "ctaSection",
        heading: "Find Your Perfect Room",
        text: "Book your stay today and secure the room that suits you best.",
        buttonText: "Book Now",
      },
    ];

    // ─── Food Page Builder ────────────────────────────────────────────
    const foodPageBuilder = [
      {
        _key: key(), _type: "foodIntro",
        heading: f.introHeading || "Eat Well, Surf Better",
        body: f.introBody || "",
        glanceItems: (f.glanceItems || []).map((g) => ({ ...g, _key: g._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "mealCards",
        meals: (f.meals || []).map((m) => ({ ...m, _key: m._key || key() })),
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "imageBreak",
        alt: f.imageBreakAlt || "Fresh food preparation",
        height: "md",
        caption: f.imageBreakCaption || "",
      },
      {
        _key: key(), _type: "menuTable",
        heading: f.menuHeading || "Sample Weekly Menu",
        subtext: f.menuSubtext || "",
        menu: (f.sampleMenu || []).map((m) => ({ ...m, _key: m._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "dietaryOptions",
        heading: f.dietaryHeading || "Dietary Requirements",
        subtext: f.dietarySubtext || "",
        dietary: (f.dietary || []).map((d) => ({ ...d, _key: d._key || key() })),
        background: "dark-lighter",
      },
      {
        _key: key(), _type: "imageGallery",
        images: (f.galleryImages || []).map((img) => ({ ...img, _key: img._key || key() })),
        background: "dark",
      },
      {
        _key: key(), _type: "ctaSection",
        heading: "Ready to Eat Well?",
        text: "Book your surf camp and enjoy chef-prepared meals every day.",
        buttonText: "Book Now",
      },
    ];

    console.log(`  → Patching ${id} with pageBuilder arrays...`);
    await client.patch(id).set({
      surfPageBuilder,
      roomsPageBuilder,
      foodPageBuilder,
    }).commit();

    console.log(`  ✅ ${id} done\n`);
  }

  console.log("✅ All camps migrated to pageBuilder format!");
}

migrate().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
