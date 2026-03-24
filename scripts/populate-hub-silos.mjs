#!/usr/bin/env node
/**
 * Populate the `silos` array on each contentHub document based on the
 * definitive silo → hub tree.
 *
 * Usage:
 *   node scripts/populate-hub-silos.mjs          # dry-run
 *   node scripts/populate-hub-silos.mjs --apply   # actually patch
 */
import { createClient } from "@sanity/client";
import fs from "fs";

// Load .env manually (no dotenv dependency)
try {
  const envFile = fs.readFileSync(new URL("../.env", import.meta.url), "utf-8");
  for (const line of envFile.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const apply = process.argv.includes("--apply");

// Definitive silo → hub tree
const SILO_HUB_TREE = {
  "silo-bali": ["hub-surf-spots-guides", "hub-travel-culture", "hub-things-to-do"],
  "silo-costa-rica": ["hub-surf-spots-guides", "hub-travel-culture", "hub-things-to-do"],
  "silo-nicaragua": ["hub-surf-spots-guides", "hub-travel-culture", "hub-things-to-do"],
  "silo-morocco": ["hub-surf-spots-guides", "hub-travel-culture", "hub-things-to-do"],
  "silo-portugal": ["hub-surf-spots-guides", "hub-travel-culture", "hub-things-to-do"],
  "silo-learn-to-surf": ["hub-beginner-skills", "hub-etiquette-rules", "hub-intermediate-progression"],
  "silo-surf-culture-lifestyle": ["hub-history-media", "hub-lifestyle-slang"],
  "silo-surf-equipment-gear": ["hub-surfboards", "hub-wetsuits-apparel", "hub-accessories-tech"],
  "silo-surf-fitness-training": ["hub-exercises-warm-up", "hub-yoga-for-surfers"],
  "silo-surf-health-safety": ["hub-injury-prevention-first-aid", "hub-ocean-safety", "hub-sun-skin-protection"],
  "silo-surf-science-conditions": ["hub-waves-breaks", "hub-weather-tides"],
  "silo-surf-travel": ["hub-indonesia", "hub-destinations", "hub-surf-camps", "hub-planning-packing"],
};

// Invert: hub → [silo IDs]
const hubToSilos = {};
for (const [siloId, hubIds] of Object.entries(SILO_HUB_TREE)) {
  for (const hubId of hubIds) {
    if (!hubToSilos[hubId]) hubToSilos[hubId] = [];
    hubToSilos[hubId].push(siloId);
  }
}

async function main() {
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}\n`);

  // Fetch current hubs
  const hubs = await client.fetch(
    `*[_type == "contentHub"] { _id, name, "slug": slug.current, silos }`
  );

  console.log(`Found ${hubs.length} hub documents\n`);

  let patchCount = 0;

  for (const hub of hubs) {
    const targetSiloIds = hubToSilos[hub._id];
    if (!targetSiloIds) {
      console.log(`  SKIP: ${hub.name} (${hub._id}) — not in tree definition`);
      continue;
    }

    const silosArray = targetSiloIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: id,
    }));

    // Check if already correct
    const currentRefs = (hub.silos || []).map((s) => s._ref).sort();
    const targetRefs = targetSiloIds.slice().sort();
    if (JSON.stringify(currentRefs) === JSON.stringify(targetRefs)) {
      console.log(`  OK: ${hub.name} — already has correct silos [${targetRefs.join(", ")}]`);
      continue;
    }

    console.log(`  PATCH: ${hub.name} (${hub._id}) → silos: [${targetSiloIds.join(", ")}]`);

    if (apply) {
      await client.patch(hub._id).set({ silos: silosArray }).commit();
    }
    patchCount++;
  }

  console.log(`\n${apply ? "Patched" : "Would patch"} ${patchCount} hub documents.`);

  // Also clean up the old `silo` field (single reference) if it exists
  if (apply && patchCount > 0) {
    console.log("\nCleaning up old `silo` (single reference) field...");
    for (const hub of hubs) {
      if (hub.silo) {
        await client.patch(hub._id).unset(["silo"]).commit();
      }
    }
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
