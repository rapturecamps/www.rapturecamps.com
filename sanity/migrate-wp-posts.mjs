#!/usr/bin/env node

/**
 * WordPress → Sanity Blog Post Migration
 *
 * Migrates blog posts with HTML-to-Portable-Text conversion, image remapping,
 * internal link rewriting, embed stripping, and draft handling.
 *
 * Usage:
 *   node sanity/migrate-wp-posts.mjs              # full migration
 *   node sanity/migrate-wp-posts.mjs --dry-run    # preview only, no writes
 *
 * Prerequisites:
 *   - sanity/wp-image-map.json must exist (from migrate-wp-images.mjs)
 *
 * Required env vars: SANITY_WRITE_TOKEN, PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET
 */

import { createClient } from "@sanity/client";
import { parse as parseHTML } from "node-html-parser";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

// ── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const MAP_FILE = path.resolve("sanity/wp-image-map.json");
const EMBED_LOG = path.resolve("sanity/stripped-embeds.log");
const UNMATCHED_LOG = path.resolve("sanity/unmatched-links.log");
const REDIRECT_MAP_FILE = path.resolve("sanity/wp-redirect-map.json");

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

async function fetchAllPaginated(endpoint) {
  const all = [];
  let page = 1;
  while (true) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${WP_API}/${endpoint}${sep}per_page=100&page=${page}`;
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

function stripHtml(html) {
  if (!html) return "";
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, "")).trim();
}

// ── Image map ───────────────────────────────────────────────────────────────

function loadImageMap() {
  if (!existsSync(MAP_FILE)) {
    console.warn(`  WARNING: ${MAP_FILE} not found. Image references will be skipped.`);
    return {};
  }
  return JSON.parse(readFileSync(MAP_FILE, "utf-8"));
}

function findSanityAssetByUrl(url, imageMap, urlToWpId) {
  const wpId = urlToWpId[url];
  if (wpId && imageMap[wpId]) return imageMap[wpId].sanityId;

  // Try matching by filename
  const filename = url.split("/").pop()?.split("?")[0];
  if (!filename) return null;

  // Check size variants: WP generates -WxH versions
  const baseFilename = filename.replace(/-\d+x\d+(\.\w+)$/, "$1");

  for (const [, entry] of Object.entries(imageMap)) {
    const entryFilename = entry.sourceUrl?.split("/").pop();
    if (entryFilename === filename || entryFilename === baseFilename) {
      return entry.sanityId;
    }
  }
  return null;
}

// ── Embed detection ─────────────────────────────────────────────────────────

const EMBED_PATTERNS = [
  /iframe/i,
  /class="wp-block-embed/i,
  /class="instagram-media/i,
  /class="twitter-tweet/i,
  /class="fb-post/i,
  /data-instgrm/i,
  /youtube\.com\/embed/i,
  /vimeo\.com\/video/i,
  /tiktok\.com/i,
  /spotify\.com\/embed/i,
];

function isEmbedNode(node) {
  const html = node.outerHTML || "";
  return EMBED_PATTERNS.some((p) => p.test(html));
}

function logEmbed(slug, html) {
  const line = `\n--- Post: ${slug} ---\n${html.trim()}\n`;
  writeFileSync(EMBED_LOG, line, { flag: "a" });
}

// ── Internal link remapping ─────────────────────────────────────────────────

function buildLinkRemapper(postSlugs) {
  const slugSet = new Set(postSlugs);

  return function remapUrl(href) {
    if (!href) return href;

    try {
      let url;
      try {
        url = new URL(href);
      } catch {
        if (href.startsWith("/")) return href;
        return href;
      }

      const isInternal =
        url.hostname === "www.rapturecamps.com" ||
        url.hostname === "rapturecamps.com";

      if (!isInternal) return href;

      let pathname = url.pathname.replace(/\/+$/, "") || "/";

      // Blog post: /slug/ -> /blog/slug
      const slug = pathname.replace(/^\//, "");
      if (slugSet.has(slug)) {
        return `/blog/${slug}`;
      }

      // Already correct paths (surfcamp, faq, etc.)
      if (
        pathname.startsWith("/surfcamp") ||
        pathname.startsWith("/faq") ||
        pathname.startsWith("/blog") ||
        pathname.startsWith("/about") ||
        pathname === "/"
      ) {
        return pathname;
      }

      // Unknown internal link — log for review
      return { unmatched: true, original: href, pathname };
    } catch {
      return href;
    }
  };
}

// ── HTML → Portable Text conversion ─────────────────────────────────────────

function htmlToPortableText(html, imageMap, urlToWpId, remapUrl, postSlug) {
  const root = parseHTML(html, { blockTextElements: { pre: true } });
  const blocks = [];
  const unmatchedLinks = [];

  function processInlineChildren(node) {
    const spans = [];
    const markDefs = [];

    function walk(n, activeMarks = []) {
      if (n.nodeType === 3) {
        const text = decodeHtmlEntities(n.rawText);
        if (text) {
          spans.push({ _type: "span", _key: key(), text, marks: [...activeMarks] });
        }
        return;
      }

      if (n.nodeType !== 1) return;

      const tag = n.tagName?.toLowerCase();

      if (tag === "br") {
        spans.push({ _type: "span", _key: key(), text: "\n", marks: [...activeMarks] });
        return;
      }

      if (tag === "strong" || tag === "b") {
        for (const child of n.childNodes) walk(child, [...activeMarks, "strong"]);
        return;
      }
      if (tag === "em" || tag === "i") {
        for (const child of n.childNodes) walk(child, [...activeMarks, "em"]);
        return;
      }

      if (tag === "a") {
        const href = n.getAttribute("href");
        const remapped = remapUrl(href);

        if (remapped?.unmatched) {
          unmatchedLinks.push(remapped);
          const markKey = key();
          markDefs.push({
            _type: "link",
            _key: markKey,
            href: remapped.pathname || remapped.original,
          });
          for (const child of n.childNodes) walk(child, [...activeMarks, markKey]);
        } else {
          const markKey = key();
          const blank = n.getAttribute("target") === "_blank";
          markDefs.push({
            _type: "link",
            _key: markKey,
            href: remapped || href,
            ...(blank ? { blank: true } : {}),
          });
          for (const child of n.childNodes) walk(child, [...activeMarks, markKey]);
        }
        return;
      }

      // Fallback: process children
      for (const child of n.childNodes) walk(child, activeMarks);
    }

    walk(node);
    return { spans, markDefs };
  }

  function makeBlock(style, node) {
    const { spans, markDefs } = processInlineChildren(node);
    if (!spans.length) return null;
    return {
      _type: "block",
      _key: key(),
      style: style || "normal",
      markDefs,
      children: spans,
    };
  }

  function processNode(node) {
    if (node.nodeType === 3) {
      const text = node.rawText.trim();
      if (text) {
        blocks.push({
          _type: "block",
          _key: key(),
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: key(), text, marks: [] }],
        });
      }
      return;
    }

    if (node.nodeType !== 1) return;

    const tag = node.tagName?.toLowerCase();

    // Embed detection
    if (isEmbedNode(node)) {
      logEmbed(postSlug, node.outerHTML);
      return;
    }

    // Headings
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      const block = makeBlock(tag === "h1" ? "h2" : tag, node);
      if (block) blocks.push(block);
      return;
    }

    // Paragraphs
    if (tag === "p") {
      // Check for images inside paragraphs
      const imgs = node.querySelectorAll("img");
      if (imgs.length > 0) {
        for (const img of imgs) {
          const imgBlock = makeImageBlock(img);
          if (imgBlock) blocks.push(imgBlock);
        }
        // Also process remaining text if any
        const textContent = node.textContent?.trim();
        if (textContent && textContent !== "") {
          const block = makeBlock("normal", node);
          if (block) blocks.push(block);
        }
        return;
      }
      const block = makeBlock("normal", node);
      if (block) blocks.push(block);
      return;
    }

    // Blockquotes
    if (tag === "blockquote") {
      const block = makeBlock("blockquote", node);
      if (block) blocks.push(block);
      return;
    }

    // Lists
    if (tag === "ul" || tag === "ol") {
      const listType = tag === "ol" ? "number" : "bullet";
      const items = node.querySelectorAll(":scope > li");
      for (const li of items) {
        const { spans, markDefs } = processInlineChildren(li);
        if (spans.length) {
          blocks.push({
            _type: "block",
            _key: key(),
            style: "normal",
            listItem: listType,
            level: 1,
            markDefs,
            children: spans,
          });
        }
      }
      return;
    }

    // Standalone images
    if (tag === "img") {
      const imgBlock = makeImageBlock(node);
      if (imgBlock) blocks.push(imgBlock);
      return;
    }

    // Figure (often wraps img + figcaption)
    if (tag === "figure") {
      const img = node.querySelector("img");
      if (img) {
        const figcaption = node.querySelector("figcaption");
        const imgBlock = makeImageBlock(img, figcaption?.textContent?.trim());
        if (imgBlock) blocks.push(imgBlock);
        return;
      }
      // Figure might wrap an embed
      if (isEmbedNode(node)) {
        logEmbed(postSlug, node.outerHTML);
        return;
      }
    }

    // Pre/code blocks → treat as a regular paragraph for now
    if (tag === "pre") {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          _type: "block",
          _key: key(),
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: key(), text, marks: [] }],
        });
      }
      return;
    }

    // Div and other containers — recurse
    if (["div", "section", "article", "main", "aside", "header", "footer", "span"].includes(tag)) {
      for (const child of node.childNodes) processNode(child);
      return;
    }

    // Anything else — try to extract text
    if (node.childNodes?.length) {
      for (const child of node.childNodes) processNode(child);
    }
  }

  function makeImageBlock(imgNode, caption) {
    const src = imgNode.getAttribute("src") || imgNode.getAttribute("data-src") || "";
    const alt = imgNode.getAttribute("alt") || "";

    const sanityId = findSanityAssetByUrl(src, imageMap, urlToWpId);
    if (!sanityId) return null;

    return {
      _type: "image",
      _key: key(),
      asset: { _type: "reference", _ref: sanityId },
      ...(alt ? { alt } : {}),
      ...(caption ? { caption } : {}),
    };
  }

  for (const child of root.childNodes) {
    processNode(child);
  }

  // If we got nothing, add a placeholder
  if (!blocks.length) {
    blocks.push({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: key(),
          text: "[Content could not be converted — review WordPress source]",
          marks: [],
        },
      ],
    });
  }

  return { blocks, unmatchedLinks };
}

// ── Blog categories ─────────────────────────────────────────────────────────

async function ensureBlogCategories(wpCategories) {
  console.log(`\n=== Creating blog categories ===`);
  const catMap = {};

  const existing = await sanityClient.fetch(
    `*[_type == "blogCategory"]{ _id, slug { current } }`
  );
  const existingBySlug = {};
  for (const c of existing) {
    if (c.slug?.current) existingBySlug[c.slug.current] = c._id;
  }

  for (const wpCat of wpCategories) {
    if (wpCat.slug === "uncategorized") continue;

    if (existingBySlug[wpCat.slug]) {
      catMap[wpCat.id] = existingBySlug[wpCat.slug];
      console.log(`  Existing: ${wpCat.name} → ${existingBySlug[wpCat.slug]}`);
      continue;
    }

    if (DRY_RUN) {
      catMap[wpCat.id] = `dry-run-${wpCat.slug}`;
      console.log(`  [DRY RUN] Would create: ${wpCat.name}`);
      continue;
    }

    const doc = {
      _type: "blogCategory",
      name: wpCat.name,
      slug: { _type: "slug", current: wpCat.slug },
      description: stripHtml(wpCat.description || ""),
    };
    const created = await sanityClient.create(doc);
    catMap[wpCat.id] = created._id;
    console.log(`  Created: ${wpCat.name} → ${created._id}`);
    await sleep(200);
  }

  return catMap;
}

// ── WP Tags ─────────────────────────────────────────────────────────────────

async function fetchWpTags() {
  console.log("\n=== Fetching WordPress tags ===");
  const tags = await fetchAllPaginated("tags");
  const tagMap = {};
  for (const t of tags) tagMap[t.id] = t.name;
  console.log(`  Found ${tags.length} tags`);
  return tagMap;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) {
    console.error("Missing SANITY_WRITE_TOKEN. Set it in .env or export it.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  WordPress → Sanity Blog Post Migration${DRY_RUN ? " [DRY RUN]" : ""}`);
  console.log(`${"=".repeat(60)}\n`);

  // Load image map
  const imageMap = loadImageMap();
  const urlToWpId = {};
  for (const [wpId, entry] of Object.entries(imageMap)) {
    if (entry.sourceUrl) urlToWpId[entry.sourceUrl] = wpId;
  }
  console.log(`  Image map: ${Object.keys(imageMap).length} entries loaded\n`);

  // Fetch WP data
  console.log("=== Fetching WordPress data ===");
  const posts = await fetchAllPaginated("posts");
  const categories = await fetchAllPaginated("categories");
  const wpTagMap = await fetchWpTags();

  console.log(`  ${posts.length} posts, ${categories.length} categories\n`);

  // Create blog categories
  const catMap = await ensureBlogCategories(categories);

  // Build link remapper
  const allSlugs = posts.map((p) => p.slug);
  const remapUrl = buildLinkRemapper(allSlugs);

  // Build redirect map for Phase 4
  const redirectMap = {};
  for (const p of posts) {
    if (p.status === "publish") {
      redirectMap[p.slug] = {
        fromPath: `/${p.slug}/`,
        toPath: `/blog/${p.slug}`,
      };
    }
  }

  // Check existing blog posts to skip duplicates
  const existingSlugs = new Set();
  const existingPosts = await sanityClient.fetch(
    `*[_type == "blogPost"]{ slug { current } }`
  );
  for (const p of existingPosts) {
    if (p.slug?.current) existingSlugs.add(p.slug.current);
  }

  console.log(`\n=== Migrating ${posts.length} posts${DRY_RUN ? " [DRY RUN]" : ""} ===`);
  console.log(`  Already in Sanity: ${existingSlugs.size}\n`);

  let created = 0;
  let skipped = 0;
  let drafts = 0;
  let errors = 0;
  const allUnmatchedLinks = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    if (existingSlugs.has(post.slug)) {
      skipped++;
      continue;
    }

    const isDraft = post.status !== "publish";
    const title = stripHtml(post.title?.rendered || "Untitled");
    const excerpt = stripHtml(post.excerpt?.rendered || "");

    // Convert HTML to Portable Text
    const { blocks, unmatchedLinks } = htmlToPortableText(
      post.content?.rendered || "",
      imageMap,
      urlToWpId,
      remapUrl,
      post.slug
    );
    allUnmatchedLinks.push(...unmatchedLinks);

    // Featured image
    let featuredImageRef = null;
    if (post.featured_media && imageMap[String(post.featured_media)]) {
      const assetId = imageMap[String(post.featured_media)].sanityId;
      featuredImageRef = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      };
    }

    // Categories
    const categoryRefs = (post.categories || [])
      .filter((id) => catMap[id])
      .map((id) => ({
        _type: "reference",
        _ref: catMap[id],
        _key: key(),
      }));

    // Tags (string array from WP tag names)
    const tagNames = (post.tags || [])
      .map((id) => wpTagMap[id])
      .filter(Boolean);

    // SEO from Yoast
    const yoast = post.yoast_head_json;
    const seo = {};
    if (yoast?.title) seo.metaTitle = yoast.title;
    if (yoast?.description) seo.metaDescription = yoast.description;

    const doc = {
      _type: "blogPost",
      ...(isDraft ? { _id: `drafts.blogPost-${post.slug}` } : {}),
      language: "en",
      title,
      slug: { _type: "slug", current: post.slug },
      excerpt: excerpt || undefined,
      body: blocks,
      ...(featuredImageRef ? { featuredImage: featuredImageRef } : {}),
      ...(categoryRefs.length ? { categories: categoryRefs } : {}),
      ...(tagNames.length ? { tags: tagNames } : {}),
      publishedAt: post.date || new Date().toISOString(),
      ...(Object.keys(seo).length ? { seo } : {}),
    };

    if (DRY_RUN) {
      if (i < 3) {
        console.log(`\n  [DRY RUN] Sample post: "${title}"`);
        console.log(`    Slug: ${post.slug}`);
        console.log(`    Status: ${post.status}${isDraft ? " → will be draft in Sanity" : ""}`);
        console.log(`    Body blocks: ${blocks.length}`);
        console.log(`    Featured image: ${featuredImageRef ? "yes" : "no"}`);
        console.log(`    Categories: ${categoryRefs.length}`);
        console.log(`    Tags: ${tagNames.join(", ") || "none"}`);
        console.log(`    SEO: ${seo.metaTitle ? "yes" : "no"}`);
      }
      created++;
      if (isDraft) drafts++;
      continue;
    }

    try {
      if (isDraft) {
        await sanityClient.createOrReplace(doc);
      } else {
        await sanityClient.create(doc);
      }
      created++;
      if (isDraft) drafts++;

      if ((created + skipped) % 25 === 0) {
        console.log(`  [${created + skipped}/${posts.length}] Created: ${created}, Skipped: ${skipped}`);
      }
      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`  ERROR creating "${title}": ${err.message}`);
    }
  }

  // Save redirect map
  writeFileSync(REDIRECT_MAP_FILE, JSON.stringify(redirectMap, null, 2));

  // Log unmatched links
  if (allUnmatchedLinks.length) {
    const lines = allUnmatchedLinks.map(
      (l) => `${l.original} → ${l.pathname} (unmatched)`
    );
    writeFileSync(UNMATCHED_LOG, lines.join("\n"));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Blog migration ${DRY_RUN ? "[DRY RUN] " : ""}complete!`);
  console.log(`  Created: ${created} (${drafts} as drafts)`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Unmatched internal links: ${allUnmatchedLinks.length}`);
  console.log(`  Stripped embeds: see ${EMBED_LOG}`);
  console.log(`  Redirect map: ${REDIRECT_MAP_FILE}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
