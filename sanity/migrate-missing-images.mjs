#!/usr/bin/env node

/**
 * Migrate the ~874 WordPress images that were missed in the initial migration
 * (because the original script used unauthenticated API calls).
 *
 * Fetches media by ID with authentication, reuses the same processing/upload
 * logic, and appends to the existing wp-image-map.json.
 *
 * Usage:
 *   node sanity/migrate-missing-images.mjs --dry-run
 *   node sanity/migrate-missing-images.mjs
 */

import { createClient } from "@sanity/client";
import sharp from "sharp";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const MAX_DIMENSION = 1920;
const MAP_FILE = path.resolve("sanity/wp-image-map.json");
const MISSING_IDS_FILE = path.resolve("sanity/missing-image-ids.json");
const ERROR_LOG = path.resolve("sanity/migration-errors.log");

const WP_USER = process.env.WP_USER || "simon.eiler";
const WP_APP_PASS = process.env.WP_APP_PASS || "DNKX xjDB QsQy sI6n zarR eeab";
const WP_AUTH = "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64");

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
  "avellanas": "costa-rica", "banana-village": "morocco",
  "maderas": "nicaragua", "playa-maderas": "nicaragua", "surf-resort": "nicaragua",
  "ericeira": "portugal", "milfontes": "portugal", "coxos": "portugal",
  "lizandro": "portugal", "alentejo": "portugal", "surf-villa": "portugal",
};
const WP_CATEGORY_TO_COUNTRY = {
  bali: "indonesia", "costa-rica": "costa-rica", "costa rica": "costa-rica",
  portugal: "portugal", morocco: "morocco", nicaragua: "nicaragua",
};

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  writeFileSync(ERROR_LOG, line, { flag: "a" });
  console.error(`  ERROR: ${msg}`);
}

function loadMap() {
  if (existsSync(MAP_FILE)) return JSON.parse(readFileSync(MAP_FILE, "utf-8"));
  return {};
}

function saveMap(map) {
  writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
}

async function fetchWpMedia(id) {
  const url = `${WP_API}/media/${id}`;
  const res = await fetch(url, { headers: { Authorization: WP_AUTH } });
  if (!res.ok) throw new Error(`WP API ${res.status} for media/${id}`);
  return res.json();
}

async function fetchAllAuthPaginated(endpoint) {
  const all = [];
  let page = 1;
  while (true) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${WP_API}/${endpoint}${sep}per_page=100&page=${page}`;
    const res = await fetch(url, { headers: { Authorization: WP_AUTH } });
    if (!res.ok) { if (res.status === 400) break; throw new Error(`${res.status} ${url}`); }
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

function deriveTagsFromFilenameAndUrl(media, postLookup, categoryLookup) {
  const tags = new Set();
  const filename = (media.source_url || "").split("/").pop()?.toLowerCase() || "";
  const urlPath = (media.source_url || "").toLowerCase();

  const yearMatch = urlPath.match(/\/uploads\/(\d{4})\//);
  if (yearMatch) tags.add(`year:${yearMatch[1]}`);

  for (const camp of KNOWN_CAMPS) {
    if (filename.includes(camp)) {
      tags.add(`camp:${camp}`);
      if (CAMP_TO_COUNTRY[camp]) tags.add(`country:${CAMP_TO_COUNTRY[camp]}`);
    }
  }

  for (const country of KNOWN_COUNTRIES) {
    if (filename.includes(country)) tags.add(`country:${country}`);
  }

  if (media.post && postLookup[media.post]) {
    const post = postLookup[media.post];
    tags.add("type:blog");
    if (post.featured_media === media.id) tags.add("type:featured-image");
    for (const catId of post.categories || []) {
      const cat = categoryLookup[catId];
      if (cat) {
        const slug = cat.slug?.toLowerCase();
        if (WP_CATEGORY_TO_COUNTRY[slug]) tags.add(`country:${WP_CATEGORY_TO_COUNTRY[slug]}`);
      }
    }
  }

  if (tags.size === 0 || (tags.size === 1 && [...tags][0].startsWith("year:"))) {
    tags.add("type:untagged");
  }

  return [...tags];
}

async function ensureMediaTags(allTagSlugs) {
  const existing = await sanityClient.fetch(`*[_type == "media.tag"]{ _id, name { current } }`);
  const tagMap = {};
  for (const t of existing) {
    if (t.name?.current) tagMap[t.name.current] = t._id;
  }

  const toCreate = allTagSlugs.filter((slug) => !tagMap[slug]);
  if (toCreate.length && !DRY_RUN) {
    console.log(`  Creating ${toCreate.length} new tags...`);
    for (const slug of toCreate) {
      const doc = { _type: "media.tag", name: { _type: "slug", current: slug } };
      const created = await sanityClient.create(doc);
      tagMap[slug] = created._id;
      await sleep(100);
    }
  } else if (toCreate.length) {
    console.log(`  [DRY] Would create ${toCreate.length} tags: ${toCreate.join(", ")}`);
    for (const slug of toCreate) tagMap[slug] = `dry-${slug}`;
  }

  return tagMap;
}

async function downloadImage(url) {
  const res = await fetch(url, { headers: { Authorization: WP_AUTH } });
  if (!res.ok) throw new Error(`Download failed: ${url} → ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function selectBestSizeUrl(media) {
  const { width, height } = media.media_details || {};
  const longest = Math.max(width || 0, height || 0);
  if (longest <= MAX_DIMENSION) return { url: media.source_url, needsResize: false };
  const sizes = media.media_details?.sizes || {};
  if (sizes["1536x1536"]) return { url: sizes["1536x1536"].source_url, needsResize: false };
  return { url: media.source_url, needsResize: true };
}

async function processAndUpload(media, tagMap, derivedTags) {
  const { url, needsResize } = selectBestSizeUrl(media);
  let buffer = await downloadImage(url);

  if (needsResize) {
    const img = sharp(buffer);
    const meta = await img.metadata();
    const isLandscape = (meta.width || 0) >= (meta.height || 0);
    buffer = isLandscape
      ? await img.resize({ width: MAX_DIMENSION, withoutEnlargement: true }).toBuffer()
      : await img.resize({ height: MAX_DIMENSION, withoutEnlargement: true }).toBuffer();
  }

  const filename = media.source_url.split("/").pop() || `wp-${media.id}.jpg`;
  const contentType = media.mime_type || "image/jpeg";

  const asset = await sanityClient.assets.upload("image", buffer, { filename, contentType });

  const patchOps = {};
  if (media.title?.rendered) patchOps.title = media.title.rendered;
  if (media.alt_text) patchOps.altText = media.alt_text;
  const desc = media.caption?.rendered?.replace(/<[^>]*>/g, "").trim() ||
    media.description?.rendered?.replace(/<[^>]*>/g, "").trim();
  if (desc) patchOps.description = desc;

  const tagRefs = derivedTags
    .filter((slug) => tagMap[slug])
    .map((slug) => ({ _type: "reference", _weak: true, _ref: tagMap[slug], _key: randomUUID().slice(0, 12) }));
  if (tagRefs.length) patchOps["opt.media.tags"] = tagRefs;

  if (Object.keys(patchOps).length) {
    await sanityClient.patch(asset._id).set(patchOps).commit();
  }

  return { sanityId: asset._id, sourceUrl: media.source_url, filename };
}

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) {
    console.error("Missing SANITY_WRITE_TOKEN.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Migrate Missing WordPress Images${DRY_RUN ? " [DRY RUN]" : ""}`);
  console.log(`${"=".repeat(60)}\n`);

  if (!existsSync(MISSING_IDS_FILE)) {
    console.error(`Missing ${MISSING_IDS_FILE}. Run the ID comparison script first.`);
    process.exit(1);
  }

  const missingIds = JSON.parse(readFileSync(MISSING_IDS_FILE, "utf-8"));
  console.log(`  ${missingIds.length} missing image IDs to process\n`);

  // Fetch posts & categories for tag derivation (authenticated)
  console.log("  Fetching posts & categories for tag context...");
  const posts = await fetchAllAuthPaginated("posts");
  const categories = await fetchAllAuthPaginated("categories");
  const postLookup = {};
  for (const p of posts) postLookup[p.id] = p;
  const categoryLookup = {};
  for (const c of categories) categoryLookup[c.id] = c;
  console.log(`  ${posts.length} posts, ${categories.length} categories\n`);

  // Pre-derive all tags to create them upfront
  console.log("  Pre-deriving tags for all missing media...");
  const allTagSlugs = new Set();
  const mediaDataCache = [];

  for (let i = 0; i < missingIds.length; i++) {
    const id = missingIds[i];
    try {
      const media = await fetchWpMedia(id);
      if (!(media.mime_type || "").startsWith("image/")) continue;
      const tags = deriveTagsFromFilenameAndUrl(media, postLookup, categoryLookup);
      tags.forEach((t) => allTagSlugs.add(t));
      mediaDataCache.push({ media, tags });
      if (i % 50 === 0 && i > 0) console.log(`    Fetched ${i} / ${missingIds.length}...`);
      await sleep(100);
    } catch (err) {
      logError(`Fetch media/${id}: ${err.message}`);
    }
  }

  console.log(`  ${mediaDataCache.length} valid images to upload, ${allTagSlugs.size} unique tags\n`);

  if (DRY_RUN) {
    console.log("  [DRY RUN] Tags:", [...allTagSlugs].sort().join(", "));
    console.log(`\n  Would upload ${mediaDataCache.length} images. Exiting dry run.\n`);
    return;
  }

  const tagMap = await ensureMediaTags([...allTagSlugs]);
  const imageMap = loadMap();

  let uploaded = 0;
  let failed = 0;

  for (let i = 0; i < mediaDataCache.length; i++) {
    const { media, tags } = mediaDataCache[i];
    const wpId = String(media.id);

    if (imageMap[wpId]) { continue; }

    try {
      const result = await processAndUpload(media, tagMap, tags);
      imageMap[wpId] = { sanityId: result.sanityId, sourceUrl: result.sourceUrl };
      uploaded++;

      if (uploaded % 10 === 0) {
        saveMap(imageMap);
        console.log(`  ✓ ${uploaded} uploaded (${i + 1} / ${mediaDataCache.length}) — ${result.filename}`);
      }

      await sleep(300);
    } catch (err) {
      failed++;
      logError(`Upload wp:${wpId} (${media.source_url}): ${err.message}`);
    }
  }

  saveMap(imageMap);

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Done!`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Total in map: ${Object.keys(imageMap).length}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
