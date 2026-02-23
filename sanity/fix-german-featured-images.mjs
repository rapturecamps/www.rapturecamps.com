#!/usr/bin/env node

/**
 * Fix missing featured images on German blog posts by copying them
 * from their English counterparts via translation.metadata links.
 *
 * Usage:
 *   node sanity/fix-german-featured-images.mjs              # dry run
 *   node sanity/fix-german-featured-images.mjs --commit      # actually write
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
  console.log(`\n=== Fix German Blog Post Featured Images${COMMIT ? "" : " [DRY RUN]"} ===\n`);

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
      "hasImage": defined(featuredImage),
      featuredImage
    }`,
    { ids: enIds }
  );
  const enById = {};
  for (const p of enPosts) enById[p._id] = p;

  const dePosts = await sanityClient.fetch(
    `*[_type == "blogPost" && _id in $ids]{
      _id,
      title,
      "hasImage": defined(featuredImage)
    }`,
    { ids: deIds }
  );
  const deById = {};
  for (const p of dePosts) deById[p._id] = p;

  let fixed = 0;
  let skippedAlreadyHas = 0;
  let skippedNoEnImage = 0;
  let skippedNotFound = 0;
  let errors = 0;

  for (const { enId, deId } of pairs) {
    const enPost = enById[enId];
    const dePost = deById[deId];

    if (!enPost || !dePost) {
      skippedNotFound++;
      continue;
    }

    if (dePost.hasImage) {
      skippedAlreadyHas++;
      continue;
    }

    if (!enPost.hasImage || !enPost.featuredImage) {
      skippedNoEnImage++;
      console.log(`  SKIP (no EN image): "${dePost.title}"`);
      continue;
    }

    console.log(`  FIX: "${dePost.title}"`);
    console.log(`        ← EN: "${enPost.title}"`);

    if (COMMIT) {
      try {
        await sanityClient
          .patch(deId)
          .set({ featuredImage: enPost.featuredImage })
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
  console.log(`  Already had image: ${skippedAlreadyHas}`);
  console.log(`  EN also missing image: ${skippedNoEnImage}`);
  console.log(`  Not found in Sanity: ${skippedNotFound}`);
  if (errors) console.log(`  Errors: ${errors}`);
  console.log(`${"=".repeat(50)}\n`);

  if (!COMMIT && fixed > 0) {
    console.log("  Run with --commit to apply changes.\n");
  }
}

main().catch(console.error);
