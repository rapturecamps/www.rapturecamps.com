#!/usr/bin/env node

/**
 * WordPress → Sanity Image Migration
 *
 * Fetches all images from WordPress, resizes (max 1920px), uploads to Sanity,
 * tags them via sanity-plugin-media, and saves a mapping file for blog migration.
 *
 * Usage:
 *   node sanity/migrate-wp-images.mjs              # full migration
 *   node sanity/migrate-wp-images.mjs --dry-run    # preview only, no writes
 *
 * Required env vars: SANITY_WRITE_TOKEN, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";
import sharp from "sharp";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

// ── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const MAX_DIMENSION = 1920;
const BATCH_SIZE = 5;
const SANITY_DELAY_MS = 300;
const CHECKPOINT_FILE = path.resolve("sanity/wp-image-checkpoint.json");
const MAP_FILE = path.resolve("sanity/wp-image-map.json");
const REPORT_FILE = path.resolve("sanity/image-size-report.csv");
const ERROR_LOG = path.resolve("sanity/migration-errors.log");

const KNOWN_CAMPS = [
  "green-bowl", "padang-padang", "avellanas", "banana-village",
  "maderas", "ericeira", "milfontes", "coxos", "lizandro",
  "alentejo", "playa-maderas", "surf-villa", "surf-resort",
];

const KNOWN_COUNTRIES = [
  "bali", "indonesia", "costa-rica", "portugal", "morocco",
  "nicaragua", "sri-lanka",
];

const CAMP_TO_COUNTRY = {
  "green-bowl": "indonesia", "padang-padang": "indonesia",
  "avellanas": "costa-rica",
  "banana-village": "morocco",
  "maderas": "nicaragua", "playa-maderas": "nicaragua", "surf-resort": "nicaragua",
  "ericeira": "portugal", "milfontes": "portugal", "coxos": "portugal",
  "lizandro": "portugal", "alentejo": "portugal", "surf-villa": "portugal",
};

const WP_CATEGORY_TO_COUNTRY = {
  bali: "indonesia",
  "costa-rica": "costa-rica", "costa rica": "costa-rica",
  portugal: "portugal",
  morocco: "morocco",
  nicaragua: "nicaragua",
};

// ── Sanity client ───────────────────────────────────────────────────────────

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllPaginated(endpoint) {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${WP_API}/${endpoint}${endpoint.includes("?") ? "&" : "?"}per_page=100&page=${page}`;
    console.log(`  Fetching ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break;
      throw new Error(`Failed: ${endpoint} page ${page} → ${res.status}`);
    }
    const data = await res.json();
    if (!data.length) break;
    all.push(...data);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    if (page >= totalPages) break;
    page++;
    await sleep(200);
  }
  return all;
}

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  writeFileSync(ERROR_LOG, line, { flag: "a" });
  console.error(`  ERROR: ${msg}`);
}

function loadCheckpoint() {
  if (existsSync(CHECKPOINT_FILE)) {
    return JSON.parse(readFileSync(CHECKPOINT_FILE, "utf-8"));
  }
  return { completed: [] };
}

function saveCheckpoint(checkpoint) {
  writeFileSync(CHECKPOINT_FILE, JSON.stringify(checkpoint, null, 2));
}

function loadMap() {
  if (existsSync(MAP_FILE)) {
    return JSON.parse(readFileSync(MAP_FILE, "utf-8"));
  }
  return {};
}

function saveMap(map) {
  writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}

// ── Tag derivation ──────────────────────────────────────────────────────────

function deriveTagsFromFilenameAndUrl(media, postLookup, categoryLookup) {
  const tags = new Set();
  const filename = (media.source_url || "").split("/").pop()?.toLowerCase() || "";
  const urlPath = (media.source_url || "").toLowerCase();

  // Year from upload path: /wp-content/uploads/2024/05/...
  const yearMatch = urlPath.match(/\/uploads\/(\d{4})\//);
  if (yearMatch) tags.add(`year:${yearMatch[1]}`);

  // Camp keywords from filename
  for (const camp of KNOWN_CAMPS) {
    if (filename.includes(camp)) {
      tags.add(`camp:${camp}`);
      if (CAMP_TO_COUNTRY[camp]) tags.add(`country:${CAMP_TO_COUNTRY[camp]}`);
    }
  }

  // Country keywords from filename
  for (const country of KNOWN_COUNTRIES) {
    if (filename.includes(country)) tags.add(`country:${country}`);
  }

  // From parent post
  if (media.post && postLookup[media.post]) {
    const post = postLookup[media.post];
    tags.add("type:blog");

    if (post.featured_media === media.id) tags.add("type:featured-image");

    for (const catId of post.categories || []) {
      const cat = categoryLookup[catId];
      if (cat) {
        const slug = cat.slug?.toLowerCase();
        if (WP_CATEGORY_TO_COUNTRY[slug]) {
          tags.add(`country:${WP_CATEGORY_TO_COUNTRY[slug]}`);
        }
      }
    }
  }

  if (tags.size === 0 || (tags.size === 1 && [...tags][0].startsWith("year:"))) {
    tags.add("type:untagged");
  }

  return [...tags];
}

// ── Media.tag management ────────────────────────────────────────────────────

async function ensureMediaTags(allTagSlugs) {
  console.log(`\n=== Ensuring ${allTagSlugs.length} media.tag documents ===`);

  const existing = await sanityClient.fetch(
    `*[_type == "media.tag"]{ _id, name { current } }`
  );
  const existingMap = {};
  for (const t of existing) {
    if (t.name?.current) existingMap[t.name.current] = t._id;
  }
  console.log(`  Found ${existing.length} existing tags`);

  const tagMap = { ...existingMap };
  const toCreate = allTagSlugs.filter((slug) => !existingMap[slug]);

  if (toCreate.length === 0) {
    console.log("  All tags already exist");
    return tagMap;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would create ${toCreate.length} tags: ${toCreate.join(", ")}`);
    for (const slug of toCreate) tagMap[slug] = `dry-run-${slug}`;
    return tagMap;
  }

  console.log(`  Creating ${toCreate.length} new tags...`);
  for (const slug of toCreate) {
    const doc = {
      _type: "media.tag",
      name: { _type: "slug", current: slug },
    };
    const created = await sanityClient.create(doc);
    tagMap[slug] = created._id;
    console.log(`    Created tag: ${slug} → ${created._id}`);
    await sleep(100);
  }

  return tagMap;
}

// ── Image processing ────────────────────────────────────────────────────────

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function selectBestSizeUrl(media) {
  const { width, height } = media.media_details || {};
  const longest = Math.max(width || 0, height || 0);

  if (longest <= MAX_DIMENSION) {
    return { url: media.source_url, needsResize: false };
  }

  const sizes = media.media_details?.sizes || {};
  if (sizes["1536x1536"]) {
    return { url: sizes["1536x1536"].source_url, needsResize: false };
  }

  return { url: media.source_url, needsResize: true };
}

async function processAndUpload(media, tagMap, derivedTags) {
  const { url, needsResize } = selectBestSizeUrl(media);
  const originalW = media.media_details?.width || 0;
  const originalH = media.media_details?.height || 0;

  let buffer = await downloadImage(url);
  const originalSizeKB = Math.round(buffer.length / 1024);

  let uploadedW = originalW;
  let uploadedH = originalH;

  if (needsResize) {
    const img = sharp(buffer);
    const meta = await img.metadata();
    const isLandscape = (meta.width || 0) >= (meta.height || 0);

    if (isLandscape) {
      buffer = await img.resize({ width: MAX_DIMENSION, withoutEnlargement: true }).toBuffer();
    } else {
      buffer = await img.resize({ height: MAX_DIMENSION, withoutEnlargement: true }).toBuffer();
    }
    const newMeta = await sharp(buffer).metadata();
    uploadedW = newMeta.width || 0;
    uploadedH = newMeta.height || 0;
  } else {
    const sizesMeta = media.media_details?.sizes?.["1536x1536"];
    if (sizesMeta && url !== media.source_url) {
      uploadedW = sizesMeta.width || uploadedW;
      uploadedH = sizesMeta.height || uploadedH;
    }
  }

  const uploadedSizeKB = Math.round(buffer.length / 1024);
  const filename = media.source_url.split("/").pop() || `wp-${media.id}.jpg`;
  const contentType = media.mime_type || "image/jpeg";

  const asset = await sanityClient.assets.upload("image", buffer, {
    filename,
    contentType,
  });

  // Set native metadata
  const patchOps = {};
  if (media.title?.rendered) patchOps.title = media.title.rendered;
  if (media.alt_text) patchOps.altText = media.alt_text;
  const description = media.caption?.rendered?.replace(/<[^>]*>/g, "").trim() ||
    media.description?.rendered?.replace(/<[^>]*>/g, "").trim();
  if (description) patchOps.description = description;

  // Build tag references
  const tagRefs = derivedTags
    .filter((slug) => tagMap[slug])
    .map((slug) => ({
      _type: "reference",
      _weak: true,
      _ref: tagMap[slug],
      _key: randomUUID().slice(0, 12),
    }));

  if (tagRefs.length) patchOps["opt.media.tags"] = tagRefs;

  if (Object.keys(patchOps).length) {
    await sanityClient.patch(asset._id).set(patchOps).commit();
  }

  return {
    sanityId: asset._id,
    filename,
    originalW,
    originalH,
    originalSizeKB,
    uploadedW,
    uploadedH,
    uploadedSizeKB,
    wasResized: needsResize,
    tags: derivedTags,
  };
}

// ── CSV report ──────────────────────────────────────────────────────────────

function writeReport(entries) {
  const header = "filename,wpMediaId,originalWidth,originalHeight,originalSizeKB,uploadedWidth,uploadedHeight,uploadedSizeKB,wasResized,tags";
  const rows = entries
    .sort((a, b) => b.uploadedSizeKB - a.uploadedSizeKB)
    .map((e) =>
      [
        `"${e.filename}"`, e.wpMediaId, e.originalW, e.originalH, e.originalSizeKB,
        e.uploadedW, e.uploadedH, e.uploadedSizeKB, e.wasResized ? "yes" : "no",
        `"${e.tags.join(", ")}"`,
      ].join(",")
    );
  writeFileSync(REPORT_FILE, [header, ...rows].join("\n"));
  console.log(`\n  Size report written to ${REPORT_FILE} (${entries.length} images)`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) {
    console.error("Missing SANITY_WRITE_TOKEN. Set it in .env or export it.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  WordPress → Sanity Image Migration${DRY_RUN ? " [DRY RUN]" : ""}`);
  console.log(`${"=".repeat(60)}\n`);

  // Step 1: Fetch all WordPress media
  console.log("=== Step 1: Fetching WordPress media ===");
  const allMedia = await fetchAllPaginated("media");
  const imageMedia = allMedia.filter((m) =>
    (m.mime_type || "").startsWith("image/")
  );
  console.log(`  Found ${allMedia.length} total media, ${imageMedia.length} images\n`);

  // Step 2: Fetch posts + categories for tag derivation
  console.log("=== Step 2: Fetching posts and categories for tag context ===");
  const posts = await fetchAllPaginated("posts");
  const categories = await fetchAllPaginated("categories");

  const postLookup = {};
  for (const p of posts) postLookup[p.id] = p;

  const categoryLookup = {};
  for (const c of categories) categoryLookup[c.id] = c;

  // Also build reverse lookup: which media IDs are used as featured images
  const featuredMediaIds = new Set(posts.map((p) => p.featured_media).filter(Boolean));

  console.log(`  ${posts.length} posts, ${categories.length} categories loaded\n`);

  // Step 3: Derive all tags + create media.tag documents
  console.log("=== Step 3: Deriving tags ===");
  const allTagSlugs = new Set();
  const mediaTagMap = {};

  for (const media of imageMedia) {
    const tags = deriveTagsFromFilenameAndUrl(media, postLookup, categoryLookup);
    if (featuredMediaIds.has(media.id) && !tags.includes("type:featured-image")) {
      tags.push("type:featured-image");
    }
    mediaTagMap[media.id] = tags;
    for (const t of tags) allTagSlugs.add(t);
  }

  console.log(`  Derived ${allTagSlugs.size} unique tags across ${imageMedia.length} images`);

  const tagDocMap = DRY_RUN
    ? Object.fromEntries([...allTagSlugs].map((s) => [s, `dry-${s}`]))
    : await ensureMediaTags([...allTagSlugs]);

  // Step 4: Upload images
  console.log(`\n=== Step 4: Uploading images${DRY_RUN ? " [DRY RUN — skipping]" : ""} ===`);

  const checkpoint = loadCheckpoint();
  const imageMap = loadMap();
  const reportEntries = [];
  const completedSet = new Set(checkpoint.completed);
  const toProcess = imageMedia.filter((m) => !completedSet.has(String(m.id)));

  console.log(`  Total: ${imageMedia.length}, Already done: ${completedSet.size}, Remaining: ${toProcess.length}`);

  if (DRY_RUN) {
    console.log("\n  [DRY RUN] Sample of first 5 images that would be processed:");
    for (const media of toProcess.slice(0, 5)) {
      const { url, needsResize } = selectBestSizeUrl(media);
      const tags = mediaTagMap[media.id] || [];
      console.log(`    - ${media.source_url.split("/").pop()}`);
      console.log(`      Original: ${media.media_details?.width}x${media.media_details?.height}`);
      console.log(`      Download from: ${needsResize ? "original (will resize)" : url === media.source_url ? "original (fits)" : "1536 size"}`);
      console.log(`      Tags: ${tags.join(", ")}`);
    }
    console.log(`\n  [DRY RUN] Would upload ${toProcess.length} images total`);
    console.log(`  [DRY RUN] Would create ${[...allTagSlugs].length} media.tag documents`);
    console.log("\n  Done (dry run). No changes were made.");
    return;
  }

  let processed = 0;
  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (media) => {
        const derivedTags = mediaTagMap[media.id] || [];
        try {
          const result = await processAndUpload(media, tagDocMap, derivedTags);
          imageMap[String(media.id)] = {
            sanityId: result.sanityId,
            sourceUrl: media.source_url,
            altText: media.alt_text || "",
            tags: result.tags,
          };
          reportEntries.push({ ...result, wpMediaId: media.id });

          checkpoint.completed.push(String(media.id));
          return result;
        } catch (err) {
          logError(`WP media ${media.id} (${media.source_url}): ${err.message}`);
          return null;
        }
      })
    );

    processed += batch.length;
    if (processed % 25 === 0 || processed === toProcess.length) {
      console.log(`  [${completedSet.size + processed}/${imageMedia.length}] Processed ${processed} of ${toProcess.length} remaining`);
    }

    saveCheckpoint(checkpoint);
    saveMap(imageMap);
    await sleep(SANITY_DELAY_MS);
  }

  // Also add previously completed items to report if re-running
  // (report only contains this run's entries)

  writeReport(reportEntries);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Migration complete!`);
  console.log(`  Uploaded: ${reportEntries.length}`);
  console.log(`  Total in map: ${Object.keys(imageMap).length}`);
  console.log(`  Mapping file: ${MAP_FILE}`);
  console.log(`  Size report: ${REPORT_FILE}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
