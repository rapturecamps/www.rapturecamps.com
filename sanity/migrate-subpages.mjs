/**
 * Migration script: moves surfPageBuilder, roomsPageBuilder, foodPageBuilder
 * from camp documents into separate campSurfPage, campRoomsPage, campFoodPage documents.
 *
 * Usage: node sanity/migrate-subpages.mjs
 *
 * Requires SANITY_WRITE_TOKEN env var (or set it inline below for one-time use).
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

async function migrate() {
  console.log("Fetching all camp documents (including drafts)...");

  const camps = await client.fetch(`*[_type == "camp"] {
    _id,
    name,
    language,
    surfHeroTitle,
    roomsHeroTitle,
    foodHeroTitle,
    surfPageBuilder,
    roomsPageBuilder,
    foodPageBuilder
  }`);

  console.log(`Found ${camps.length} camp documents.`);

  let created = 0;
  let skipped = 0;

  for (const camp of camps) {
    const campId = camp._id.replace(/^drafts\./, "");
    const isDraft = camp._id.startsWith("drafts.");
    const lang = camp.language || "en";

    const subPages = [
      {
        type: "campSurfPage",
        label: "Surf",
        heroTitle: camp.surfHeroTitle,
        pageBuilder: camp.surfPageBuilder,
      },
      {
        type: "campRoomsPage",
        label: "Rooms",
        heroTitle: camp.roomsHeroTitle,
        pageBuilder: camp.roomsPageBuilder,
      },
      {
        type: "campFoodPage",
        label: "Food",
        heroTitle: camp.foodHeroTitle,
        pageBuilder: camp.foodPageBuilder,
      },
    ];

    for (const sub of subPages) {
      if (!sub.pageBuilder?.length && !sub.heroTitle) {
        skipped++;
        continue;
      }

      const existing = await client.fetch(
        `*[_type == $type && camp._ref == $campId && (language == $lang || (!defined(language) && $lang == "en"))][0]._id`,
        { type: sub.type, campId, lang }
      );

      if (existing) {
        console.log(`  ⏭  ${sub.label} for "${camp.name}" (${lang}) already exists, skipping.`);
        skipped++;
        continue;
      }

      const newId = `${sub.type}-${campId}-${lang}`;
      const doc = {
        _id: isDraft ? `drafts.${newId}` : newId,
        _type: sub.type,
        camp: { _type: "reference", _ref: campId },
        ...(lang !== "en" && { language: lang }),
        ...(sub.heroTitle && { heroTitle: sub.heroTitle }),
        ...(sub.pageBuilder?.length && { pageBuilder: sub.pageBuilder }),
      };

      try {
        await client.createOrReplace(doc);
        console.log(`  ✅ Created ${sub.label} page for "${camp.name}" (${lang}) → ${doc._id}`);
        created++;
      } catch (createErr) {
        if (createErr.statusCode === 403) {
          console.error(`\n❌ Token lacks create permissions. Go to https://www.sanity.io/manage/project/ypmt1bmc/api#tokens`);
          console.error(`   Create a new token with "Editor" or "Deploy Studio" role and run:`);
          console.error(`   SANITY_WRITE_TOKEN=<new-token> node sanity/migrate-subpages.mjs\n`);
          process.exit(1);
        }
        throw createErr;
      }
    }
  }

  console.log(`\nDone! Created ${created} sub-page documents. Skipped ${skipped}.`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
