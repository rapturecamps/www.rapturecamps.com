/**
 * Migrates hardcoded comparison data into Sanity country documents.
 * Run: node sanity/migrate-comparison.mjs
 */
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const comparisonData = {
  bali: {
    heading: "Which Bali Camp Is Right for You?",
    subtitle: "Both camps are on the Bukit Peninsula, 15 minutes apart. Here's how they compare.",
    features: ["Vibe", "Best For", "Surf Breaks Nearby", "Pool", "Rooms", "Group Size", "Yoga", "Nightlife Access"],
    camps: [
      { campSlug: "green-bowl", values: ["Social & lively", "All levels", "Green Bowl, Dreamland, Balangan", "Yes — large pool area", "4 room types", "Up to 35 guests", "Daily", "15 min to Uluwatu bars"] },
      { campSlug: "padang-padang", values: ["Boutique & intimate", "Intermediate+", "Padang Padang, Uluwatu, Impossibles", "Yes — private villa pool", "3 room types", "Up to 16 guests", "Daily", "5 min walk to Padang Padang"] },
    ],
  },
  "costa-rica": {
    heading: "Stay at Our Surf Camp in Costa Rica",
    subtitle: "Playa Avellanas is one of Costa Rica's best-kept secrets: perfect waves, zero crowds, and a jungle backdrop that feels like a movie set.",
    features: ["Vibe", "Best For", "Surf Breaks Nearby", "Pool", "Rooms", "Group Size", "Meals", "Unique Feature"],
    camps: [
      { campSlug: "avellanas", values: ["Pura Vida & adventurous", "All levels", "Avellanas, Little Hawaii, Playa Negra", "Yes — pool & jacuzzi", "5 room types", "Up to 30 guests", "Breakfast & dinner included", "Jungle setting, outdoor cinema, recovery centre"] },
    ],
  },
  portugal: {
    heading: "Which Portugal Camp Is Right for You?",
    subtitle: "Three distinct experiences across the Portuguese coast. Here's how they compare.",
    features: ["Location", "Vibe", "Best For", "Surf Breaks Nearby", "Pool", "Rooms", "Unique Feature"],
    camps: [
      { campSlug: "ericeira-lizandro", values: ["Ericeira", "Beachfront social hub", "All levels", "Foz do Lizandro, Coxos, Ribeira d'Ilhas", "No — ocean is your pool", "6 room types", "Oceanfront location, walk to town"] },
      { campSlug: "ericeira-coxos-surf-villa", values: ["Ericeira (Coxos)", "Premium & exclusive", "Intermediate+", "Coxos, Crazy Left, Cave", "Yes — infinity pool ocean view", "4 premium suites", "Infinity pool facing Europe's best wave"] },
      { campSlug: "alentejo-milfontes", values: ["Milfontes, Alentejo", "Eco retreat & nature", "All levels", "Milfontes, Almograve, Zambujeira", "No — outdoor shower!", "Eco rooms & tents", "Permaculture farm, empty lineups"] },
    ],
  },
  morocco: {
    heading: "Stay at Our Surf Camp in Morocco",
    subtitle: "Sidi Ifni is where it all began. More than 20 years ago, our founders started the very first Rapture camp right here.",
    features: ["Vibe", "Best For", "Surf Breaks Nearby", "Pool", "Rooms", "Group Size", "Meals", "Unique Feature"],
    camps: [
      { campSlug: "banana-village", values: ["Intimate & cultural", "All levels", "Sidi Ifni Main, Legzira, The Camel", "No — rooftop terrace instead", "3 room types", "Max 21 guests", "3 meals a day included", "Rooftop ocean views, Berber village trips, 20+ years history"] },
    ],
  },
  nicaragua: {
    heading: "Which Nicaragua Camp Is Right for You?",
    subtitle: "Two properties at Playa Maderas, each with a distinct personality.",
    features: ["Vibe", "Best For", "Pool", "Accommodation", "Group Size", "Meals", "Standout Feature"],
    camps: [
      { campSlug: "maderas", values: ["Backpacker chic & social", "All levels", "Yes — infinity pool with jungle views", "Private rooms & glamping tents", "Up to 30 guests", "Breakfast & dinner included", "Hilltop infinity pool, outdoor cinema"] },
      { campSlug: "maderas-surf-resort", values: ["Boutique & relaxed", "Intermediate+", "Yes — plunge pool", "Premium private rooms", "Up to 12 guests", "Breakfast included", "Small & intimate, beachfront access"] },
    ],
  },
};

async function run() {
  for (const [countrySlug, data] of Object.entries(comparisonData)) {
    console.log(`\n--- ${countrySlug} ---`);

    // Find the EN country document
    const countryDoc = await client.fetch(
      `*[_type == "country" && slug.current == $slug && (language == "en" || !defined(language))][0]{ _id }`,
      { slug: countrySlug }
    );
    if (!countryDoc) {
      console.log(`  ✗ Country "${countrySlug}" not found, skipping.`);
      continue;
    }
    console.log(`  Country doc: ${countryDoc._id}`);

    // Resolve camp references
    const campEntries = [];
    for (const campData of data.camps) {
      const campDoc = await client.fetch(
        `*[_type == "camp" && slug.current == $slug && (language == "en" || !defined(language))][0]{ _id }`,
        { slug: campData.campSlug }
      );
      if (!campDoc) {
        console.log(`  ✗ Camp "${campData.campSlug}" not found, skipping.`);
        continue;
      }
      console.log(`  Camp "${campData.campSlug}" → ${campDoc._id}`);
      campEntries.push({
        _type: "object",
        _key: campData.campSlug.replace(/[^a-z0-9]/g, ""),
        camp: { _type: "reference", _ref: campDoc._id },
        values: campData.values,
      });
    }

    const comparison = {
      _type: "object",
      heading: data.heading,
      subtitle: data.subtitle,
      features: data.features,
      camps: campEntries,
    };

    // Patch published document
    await client
      .patch(countryDoc._id)
      .set({ comparison })
      .commit();
    console.log(`  ✓ Patched published: ${countryDoc._id}`);

    // Patch draft if it exists
    const draftId = `drafts.${countryDoc._id}`;
    const draft = await client.fetch(`*[_id == $id][0]{ _id }`, { id: draftId });
    if (draft) {
      await client.patch(draftId).set({ comparison }).commit();
      console.log(`  ✓ Patched draft: ${draftId}`);
    }
  }

  console.log("\n✅ Migration complete!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
