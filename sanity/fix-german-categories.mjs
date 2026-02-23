#!/usr/bin/env node

/**
 * Fix missing categories on German blog posts by copying them
 * from their English counterparts via translation.metadata links.
 *
 * Root cause: migrate-wp-german-posts.mjs fetched WP categories without
 * &lang=de, so the wpCatSlugMap only had English category IDs. German
 * posts reference WPML-translated category IDs which weren't in the map.
 *
 * Usage:
 *   node sanity/fix-german-categories.mjs              # dry run
 *   node sanity/fix-german-categories.mjs --commit      # actually write
 *
 * Required env vars: SANITY_WRITE_TOKEN
 */

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log(`\n=== Fix German Blog Post Categories${COMMIT ? "" : " [DRY RUN]"} ===\n`);

  const translationMetas = await sanityClient.fetch(
    `*[_type == "translation.metadata" && "blogPost" in schemaTypes]{
      translations[]{ _key, "ref": value._ref }
    }`
  );
  console.log(`Found ${translationMetas.length} blogPost translation pairs`);

  const pairs = [];
  for (const meta of translationMetas) {
    const en = meta.translations?.find((t) => t._key === "en");
    const de = meta.translations?.find((t) => t._key === "de");
    if (en?.ref && de?.ref) {
      pairs.push({ enId: en.ref, deId: de.ref });
    }
  }
  console.log(`Pairs with both EN+DE: ${pairs.length}\n`);

  const enIds = pairs.map((p) => p.enId);
  const deIds = pairs.map((p) => p.deId);

  const enPosts = await sanityClient.fetch(
    `*[_type == "blogPost" && _id in $ids]{
      _id,
      title,
      categories[]{ _type, _ref, _key }
    }`,
    { ids: enIds }
  );
  const enById = {};
  for (const p of enPosts) enById[p._id] = p;

  const dePosts = await sanityClient.fetch(
    `*[_type == "blogPost" && _id in $ids]{
      _id,
      title,
      "hasCats": defined(categories) && length(categories) > 0,
      "catCount": length(categories)
    }`,
    { ids: deIds }
  );
  const deById = {};
  for (const p of dePosts) deById[p._id] = p;

  // Fetch category names for logging
  const cats = await sanityClient.fetch(`*[_type == "blogCategory"]{ _id, name }`);
  const catNameById = {};
  for (const c of cats) catNameById[c._id] = c.name;

  let fixed = 0;
  let skippedAlreadyHas = 0;
  let skippedNoEnCats = 0;
  let skippedNotFound = 0;
  let errors = 0;

  for (const { enId, deId } of pairs) {
    const enPost = enById[enId];
    const dePost = deById[deId];

    if (!enPost || !dePost) {
      skippedNotFound++;
      continue;
    }

    if (dePost.hasCats) {
      skippedAlreadyHas++;
      continue;
    }

    if (!enPost.categories?.length) {
      skippedNoEnCats++;
      console.log(`  SKIP (no EN categories): "${dePost.title}"`);
      continue;
    }

    const catNames = enPost.categories.map((c) => catNameById[c._ref] || c._ref).join(", ");
    console.log(`  FIX: "${dePost.title}"`);
    console.log(`        ← categories: ${catNames}`);

    if (COMMIT) {
      try {
        await sanityClient
          .patch(deId)
          .set({ categories: enPost.categories })
          .commit();
        fixed++;
        await sleep(200);
      } catch (err) {
        errors++;
        console.error(`        ERROR: ${err.message}`);
      }
    } else {
      fixed++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${COMMIT ? "Fixed" : "Would fix"}: ${fixed}`);
  console.log(`  Already had categories: ${skippedAlreadyHas}`);
  console.log(`  EN also missing categories: ${skippedNoEnCats}`);
  console.log(`  Not found in Sanity: ${skippedNotFound}`);
  if (errors) console.log(`  Errors: ${errors}`);
  console.log(`${"=".repeat(50)}\n`);

  if (!COMMIT && fixed > 0) {
    console.log("  Run with --commit to apply changes.\n");
  }
}

main().catch(console.error);
