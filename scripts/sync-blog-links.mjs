#!/usr/bin/env node

/**
 * Sync Missing Blog Links from WordPress to Sanity
 *
 * Patches truly missing links into Sanity blog post bodies (Portable Text).
 * A link is "truly missing" when the anchor text has NO link annotation at all
 * in Sanity (not just a different URL).
 *
 * Usage:
 *   node scripts/sync-blog-links.mjs --dry-run          # preview (default)
 *   node scripts/sync-blog-links.mjs --apply             # write to Sanity
 *   node scripts/sync-blog-links.mjs --apply --include-external
 *
 * Outputs:
 *   docs/link-sync-changes.csv   — every link added/skipped
 *   docs/link-sync-backup.jsonl  — pre-patch body backup per document
 */

import { createClient } from "@sanity/client";
import { parse as parseHTML } from "node-html-parser";
import { writeFileSync, appendFileSync, readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

// Load .env
try {
  const envFile = readFileSync(path.resolve(".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

// ── Config ──────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes("--apply");
const INCLUDE_EXTERNAL = process.argv.includes("--include-external");
const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const CHANGES_FILE = path.resolve("docs/link-sync-changes.csv");
const BACKUP_FILE = path.resolve("docs/link-sync-backup.jsonl");

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

function key() {
  return randomUUID().slice(0, 12);
}

async function fetchAllWpPosts() {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_fields=id,slug,title,content,status&status=publish`;
    console.log(`  WP: page ${page}...`);
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) break;
      throw new Error(`WP API failed: page ${page} → ${res.status}`);
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

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&ndash;/g, "\u2013").replace(/&mdash;/g, "\u2014")
    .replace(/&lsquo;/g, "\u2018").replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C").replace(/&rdquo;/g, "\u201D")
    .replace(/&hellip;/g, "\u2026").replace(/&trade;/g, "\u2122")
    .replace(/&copy;/g, "\u00A9").replace(/&reg;/g, "\u00AE");
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(fields) {
  return fields.map(csvEscape).join(",");
}

// ── Link classification ─────────────────────────────────────────────────────

function normalizeHref(href) {
  if (!href) return "";
  let h = href.trim();
  try {
    const url = new URL(h, "https://www.rapturecamps.com");
    if (url.hostname === "www.rapturecamps.com" || url.hostname === "rapturecamps.com") {
      h = url.pathname;
    }
  } catch {}
  h = h.replace(/\/+$/, "") || "/";
  h = h.replace(/\?.*$/, "");
  return h.toLowerCase();
}

function isInternal(href) {
  if (!href) return false;
  try {
    const url = new URL(href, "https://www.rapturecamps.com");
    if (url.hostname === "www.rapturecamps.com" || url.hostname === "rapturecamps.com") return true;
  } catch {}
  return href.startsWith("/");
}

// ── URL remapping for old WordPress paths ───────────────────────────────────

function buildRemapper(wpSlugs) {
  const slugSet = new Set(wpSlugs);

  const STATIC_MAP = {
    "/meet-us-online": "/meet-us",
    "/destinations/bali": "/surfcamp/bali",
    "/costa-rica-surfcamp": "/surfcamp/costa-rica",
    "/portugal-surfcamp": "/surfcamp/portugal",
    "/bali-surfcamp/uluwatu": "/surfcamp/bali",
    "/bali-surfcamp/surf-lessons": "/surfcamp/bali",
    "/bali-surf-lessons-promo": "/surfcamp/bali",
  };

  return function remap(href) {
    const norm = normalizeHref(href);

    if (STATIC_MAP[norm]) return STATIC_MAP[norm];

    // Already a valid new-site path
    if (norm.startsWith("/surfcamp/") || norm.startsWith("/blog/") ||
        norm.startsWith("/faq/") || norm.startsWith("/de/") ||
        norm === "/contact" || norm === "/about" || norm === "/surfcamp" ||
        norm === "/meet-us" || norm === "/jobs" || norm === "/") {
      return norm;
    }

    // Root-level slug that matches a blog post → /blog/slug
    const slug = norm.replace(/^\//, "");
    if (slugSet.has(slug)) {
      return `/blog/${slug}`;
    }

    // Unknown internal path — keep as-is
    return norm;
  };
}

// ── WordPress link extraction ───────────────────────────────────────────────

function extractWpLinks(html) {
  if (!html) return [];
  const root = parseHTML(html);
  const links = [];
  for (const a of root.querySelectorAll("a")) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const text = decodeHtmlEntities(a.textContent || "").trim();
    if (!text) continue;
    links.push({
      text,
      href: decodeHtmlEntities(href),
      isInternal: isInternal(href),
    });
  }
  return links;
}

// ── Sanity: extract linked anchor texts ─────────────────────────────────────

function getSanityLinkedTexts(body) {
  const texts = new Set();
  if (!body || !Array.isArray(body)) return texts;
  for (const block of body) {
    if (block._type !== "block") continue;
    const linkKeys = new Set((block.markDefs || []).filter((m) => m._type === "link").map((m) => m._key));
    if (!linkKeys.size) continue;
    for (const child of block.children || []) {
      if (child._type !== "span" || !child.marks?.length) continue;
      if (child.marks.some((m) => linkKeys.has(m))) {
        texts.add((child.text || "").trim().toLowerCase());
      }
    }
  }
  return texts;
}

// ── Portable Text: add link to a span ───────────────────────────────────────

function addLinkToBody(body, anchorText, href) {
  const target = anchorText.trim();
  if (!target) return false;

  for (const block of body) {
    if (block._type !== "block") continue;

    const children = block.children || [];
    const linkKeys = new Set((block.markDefs || []).filter((m) => m._type === "link").map((m) => m._key));

    for (let i = 0; i < children.length; i++) {
      const span = children[i];
      if (span._type !== "span") continue;
      // Skip spans that already have a link
      if (span.marks?.some((m) => linkKeys.has(m))) continue;

      const spanText = span.text || "";
      const idx = spanText.indexOf(target);
      if (idx === -1) continue;

      const markKey = key();
      if (!block.markDefs) block.markDefs = [];
      block.markDefs.push({ _type: "link", _key: markKey, href });

      if (spanText === target) {
        // Exact match — just add the mark
        if (!span.marks) span.marks = [];
        span.marks.push(markKey);
        return true;
      }

      // Partial match — split into up to 3 spans
      const before = spanText.slice(0, idx);
      const after = spanText.slice(idx + target.length);
      const existingMarks = span.marks || [];

      const newSpans = [];
      if (before) {
        newSpans.push({ _type: "span", _key: key(), text: before, marks: [...existingMarks] });
      }
      newSpans.push({ _type: "span", _key: key(), text: target, marks: [...existingMarks, markKey] });
      if (after) {
        newSpans.push({ _type: "span", _key: key(), text: after, marks: [...existingMarks] });
      }

      children.splice(i, 1, ...newSpans);
      return true;
    }
  }
  return false;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (APPLY && !process.env.SANITY_WRITE_TOKEN) {
    console.error("Missing SANITY_WRITE_TOKEN. Cannot --apply without it.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Sync Missing Blog Links  ${APPLY ? "[APPLY]" : "[DRY RUN]"}`);
  console.log(`  Internal only: ${!INCLUDE_EXTERNAL}`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. Fetch WordPress posts
  console.log("=== Fetching WordPress posts ===");
  const wpPosts = await fetchAllWpPosts();
  console.log(`  Found ${wpPosts.length} posts\n`);

  const allSlugs = wpPosts.map((p) => p.slug);
  const remap = buildRemapper(allSlugs);

  // 2. Fetch Sanity posts (full body for patching)
  console.log("=== Fetching Sanity posts ===");
  const sanityPosts = await sanityClient.fetch(
    `*[_type == "blogPost" && (language == "en" || !defined(language))] {
      _id,
      title,
      "slug": slug.current,
      body
    }`
  );
  console.log(`  Found ${sanityPosts.length} posts\n`);

  const wpBySlug = {};
  for (const p of wpPosts) wpBySlug[p.slug] = p;
  const sanityBySlug = {};
  for (const p of sanityPosts) {
    if (p.slug) sanityBySlug[p.slug] = p;
  }

  // 3. Init output files
  writeFileSync(CHANGES_FILE, csvRow(["slug", "title", "action", "anchor_text", "href", "remapped_href", "link_type"]) + "\n");
  if (!existsSync(BACKUP_FILE)) writeFileSync(BACKUP_FILE, "");

  let totalLinksAdded = 0;
  let totalLinksSkipped = 0;
  let postsPatched = 0;
  let postsFailed = 0;

  console.log("=== Processing posts ===\n");

  for (const slug of allSlugs) {
    const wp = wpBySlug[slug];
    const sanity = sanityBySlug[slug];
    if (!wp || !sanity || !sanity.body) continue;

    const wpLinks = extractWpLinks(wp.content?.rendered);
    if (!wpLinks.length) continue;

    // Get all anchor texts that already have links in Sanity
    const sanityLinkedTexts = getSanityLinkedTexts(sanity.body);

    // Find truly missing links
    const trulyMissing = wpLinks.filter((link) => {
      if (!INCLUDE_EXTERNAL && !link.isInternal) return false;
      return !sanityLinkedTexts.has(link.text.trim().toLowerCase());
    });

    if (!trulyMissing.length) continue;

    // Deep clone the body for patching
    const patchedBody = JSON.parse(JSON.stringify(sanity.body));
    let addedForPost = 0;

    for (const link of trulyMissing) {
      const remappedHref = link.isInternal ? remap(link.href) : link.href;

      const added = addLinkToBody(patchedBody, link.text, remappedHref);
      const action = added ? "ADDED" : "SKIPPED_NOT_FOUND";

      appendFileSync(
        CHANGES_FILE,
        csvRow([slug, sanity.title || "", action, link.text, link.href, remappedHref, link.isInternal ? "internal" : "external"]) + "\n"
      );

      if (added) {
        addedForPost++;
        totalLinksAdded++;
      } else {
        totalLinksSkipped++;
      }
    }

    if (addedForPost === 0) continue;

    console.log(`  ${slug}: +${addedForPost} links ${APPLY ? "" : "(dry run)"}`);

    if (APPLY) {
      // Backup current body
      appendFileSync(BACKUP_FILE, JSON.stringify({ _id: sanity._id, slug, body: sanity.body }) + "\n");

      try {
        await sanityClient.patch(sanity._id).set({ body: patchedBody }).commit();
        postsPatched++;
        await sleep(300);
      } catch (err) {
        postsFailed++;
        console.error(`    ERROR patching ${slug}: ${err.message}`);
      }
    } else {
      postsPatched++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Sync Complete  ${APPLY ? "[APPLIED]" : "[DRY RUN]"}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Links added:      ${totalLinksAdded}`);
  console.log(`  Links skipped:    ${totalLinksSkipped} (anchor text not found in body)`);
  console.log(`  Posts patched:    ${postsPatched}`);
  if (APPLY) console.log(`  Posts failed:     ${postsFailed}`);
  console.log(`  Changes log:      ${CHANGES_FILE}`);
  if (APPLY) console.log(`  Backup:           ${BACKUP_FILE}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
