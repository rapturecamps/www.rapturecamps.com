#!/usr/bin/env node

/**
 * Migrate Silo/Hub taxonomy from SeoFluid CSV into Sanity.
 *
 * 1. Creates contentSilo documents (12)
 * 2. Creates contentHub documents (22) with silo references
 * 3. Matches CSV rows to Sanity blogPosts by slug
 * 4. Patches each post with silo + hub references (and topicCluster for country silos)
 *
 * Usage:
 *   node scripts/migrate-silo-hub.mjs --dry-run    # preview (default)
 *   node scripts/migrate-silo-hub.mjs --apply       # write to Sanity
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import path from "path";

// Load .env
try {
  const envFile = readFileSync(path.resolve(".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const APPLY = process.argv.includes("--apply");
const CSV_PATH = "/Users/simonsway/Data/Projects/SeoFluid/docs/content-silo-hub-export.csv";

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// Country name → Sanity country document _id (only existing ones)
const COUNTRY_IDS = {
  "Bali": "country-bali",
  "Costa Rica": "country-costa-rica",
  "Portugal": "country-portugal",
};

const COUNTRY_NAMES = new Set(["Bali", "Costa Rica", "Portugal", "Nicaragua", "Morocco"]);

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        parts.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    if (parts.length >= 4) {
      rows.push({ title: parts[0], url: parts[1], silo: parts[2], hub: parts[3] });
    }
  }
  return rows;
}

function extractSlug(url) {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://www.rapturecamps.com${url}`);
    const segments = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (APPLY && !process.env.SANITY_WRITE_TOKEN) {
    console.error("Missing SANITY_WRITE_TOKEN. Cannot --apply.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Silo/Hub Migration  ${APPLY ? "[APPLY]" : "[DRY RUN]"}`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. Parse CSV
  const csvText = readFileSync(CSV_PATH, "utf-8");
  const rows = parseCSV(csvText);
  console.log(`CSV: ${rows.length} rows parsed\n`);

  // 2. Build unique silos and hubs
  const siloNames = new Set();
  const hubMap = {}; // hub name → silo name
  for (const row of rows) {
    if (row.silo) siloNames.add(row.silo);
    if (row.hub && row.silo) {
      if (!hubMap[row.hub]) hubMap[row.hub] = new Set();
      hubMap[row.hub].add(row.silo);
    }
  }

  console.log(`Silos: ${siloNames.size} unique`);
  console.log(`Hubs: ${Object.keys(hubMap).length} unique\n`);

  // 3. Create/find contentSilo documents
  console.log("=== Creating Silo documents ===");
  const siloIdMap = {}; // silo name → _id

  for (const name of [...siloNames].sort()) {
    const docId = `silo-${slugify(name)}`;
    const isCountry = COUNTRY_NAMES.has(name);

    if (APPLY) {
      await client.createOrReplace({
        _id: docId,
        _type: "contentSilo",
        name,
        slug: { _type: "slug", current: slugify(name) },
        isCountry,
        ...(isCountry && COUNTRY_IDS[name]
          ? { country: { _type: "reference", _ref: COUNTRY_IDS[name] } }
          : {}),
      });
    }
    siloIdMap[name] = docId;
    console.log(`  ${APPLY ? "Created" : "Would create"}: ${name} (${docId})${isCountry ? " [country]" : ""}`);
  }

  // 4. Create/find contentHub documents
  console.log("\n=== Creating Hub documents ===");
  const hubIdMap = {}; // hub name → _id

  for (const [hubName, siloSet] of Object.entries(hubMap).sort((a, b) => a[0].localeCompare(b[0]))) {
    const docId = `hub-${slugify(hubName)}`;
    // A hub can appear in multiple silos (e.g., "Surf Spots & Guides" in Bali, Portugal, etc.)
    // We don't link to a single silo at the document level since it's shared
    // Instead, the silo association is on the blog post itself

    if (APPLY) {
      await client.createOrReplace({
        _id: docId,
        _type: "contentHub",
        name: hubName,
        slug: { _type: "slug", current: slugify(hubName) },
      });
    }
    hubIdMap[hubName] = docId;
    const siloList = [...siloSet].sort().join(", ");
    console.log(`  ${APPLY ? "Created" : "Would create"}: ${hubName} (${docId}) — used in: ${siloList}`);
  }

  // 5. Fetch Sanity blog posts
  console.log("\n=== Fetching Sanity blog posts ===");
  const posts = await client.fetch(
    `*[_type == "blogPost" && (language == "en" || !defined(language))] { _id, title, "slug": slug.current }`
  );
  console.log(`  Found ${posts.length} posts\n`);

  const postBySlug = {};
  for (const p of posts) {
    if (p.slug) postBySlug[p.slug] = p;
  }

  // 6. Match and patch
  console.log("=== Matching and patching posts ===\n");
  let matched = 0;
  let unmatched = 0;
  let noUrl = 0;
  let patched = 0;
  let failed = 0;

  for (const row of rows) {
    const slug = extractSlug(row.url);
    if (!slug) {
      noUrl++;
      continue;
    }

    const post = postBySlug[slug];
    if (!post) {
      unmatched++;
      if (unmatched <= 10) console.log(`  UNMATCHED: ${slug} — "${row.title}"`);
      continue;
    }

    matched++;
    const siloRef = siloIdMap[row.silo];
    const hubRef = hubIdMap[row.hub];

    if (!siloRef) {
      console.log(`  WARN: no silo for "${row.silo}" on ${slug}`);
      continue;
    }

    const patchData = {
      silo: { _type: "reference", _ref: siloRef },
    };
    if (hubRef) {
      patchData.hub = { _type: "reference", _ref: hubRef };
    }
    if (COUNTRY_NAMES.has(row.silo) && COUNTRY_IDS[row.silo]) {
      patchData.topicCluster = { _type: "reference", _ref: COUNTRY_IDS[row.silo] };
    }

    if (APPLY) {
      try {
        await client.patch(post._id).set(patchData).commit();
        patched++;
        if (patched % 25 === 0) console.log(`  Patched ${patched} posts...`);
        await sleep(100);
      } catch (err) {
        failed++;
        console.log(`  ERROR: ${slug} — ${err.message}`);
      }
    } else {
      patched++;
    }
  }

  if (unmatched > 10) console.log(`  ... and ${unmatched - 10} more unmatched`);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Migration Complete  ${APPLY ? "[APPLIED]" : "[DRY RUN]"}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  CSV rows:       ${rows.length}`);
  console.log(`  No URL (skip):  ${noUrl}`);
  console.log(`  Matched:        ${matched}`);
  console.log(`  Unmatched:      ${unmatched}`);
  console.log(`  Patched:        ${patched}`);
  if (APPLY) console.log(`  Failed:         ${failed}`);
  console.log(`  Silos created:  ${siloNames.size}`);
  console.log(`  Hubs created:   ${Object.keys(hubMap).length}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
