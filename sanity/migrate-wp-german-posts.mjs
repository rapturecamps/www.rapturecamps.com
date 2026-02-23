#!/usr/bin/env node

/**
 * Migrate German WordPress blog posts to Sanity and link them
 * to their English counterparts via translation.metadata.
 *
 * Usage:
 *   WP_USER=simon.eiler WP_APP_PASS="..." node sanity/migrate-wp-german-posts.mjs
 */

import { createClient } from "@sanity/client";
import { parse as parseHTML } from "node-html-parser";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const AUTH = "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64");

const MAP_FILE = path.resolve("sanity/wp-image-map.json");
const PAIRS_FILE = path.resolve("sanity/wpml-translation-pairs.json");

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function key() { return randomUUID().slice(0, 12); }
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

// ── Image helpers ───────────────────────────────────────────────────────────

function loadImageMap() {
  if (!existsSync(MAP_FILE)) return {};
  return JSON.parse(readFileSync(MAP_FILE, "utf-8"));
}

function findSanityAssetByUrl(url, imageMap, urlToWpId) {
  const wpId = urlToWpId[url];
  if (wpId && imageMap[wpId]) return imageMap[wpId].sanityId;
  const filename = url.split("/").pop()?.split("?")[0];
  if (!filename) return null;
  const baseFilename = filename.replace(/-\d+x\d+(\.\w+)$/, "$1");
  for (const [, entry] of Object.entries(imageMap)) {
    const ef = entry.sourceUrl?.split("/").pop();
    if (ef === filename || ef === baseFilename) return entry.sanityId;
  }
  return null;
}

// ── HTML → Portable Text (same as main migration) ──────────────────────────

function htmlToPortableText(html, imageMap, urlToWpId) {
  if (!html) return [];
  const root = parseHTML(html, { blockTextElements: { pre: true } });
  const blocks = [];

  function processInlineChildren(node) {
    const spans = [];
    const markDefs = [];
    function walk(n, marks = []) {
      if (n.nodeType === 3) {
        const text = decodeHtmlEntities(n.rawText);
        if (text) spans.push({ _type: "span", _key: key(), text, marks: [...marks] });
        return;
      }
      if (n.nodeType !== 1) return;
      const tag = n.tagName?.toLowerCase();
      if (tag === "br") { spans.push({ _type: "span", _key: key(), text: "\n", marks: [...marks] }); return; }
      if (tag === "strong" || tag === "b") { for (const c of n.childNodes) walk(c, [...marks, "strong"]); return; }
      if (tag === "em" || tag === "i") { for (const c of n.childNodes) walk(c, [...marks, "em"]); return; }
      if (tag === "a") {
        const mk = key();
        markDefs.push({ _type: "link", _key: mk, href: n.getAttribute("href") || "" });
        for (const c of n.childNodes) walk(c, [...marks, mk]);
        return;
      }
      for (const c of n.childNodes) walk(c, marks);
    }
    walk(node);
    return { spans, markDefs };
  }

  function makeBlock(style, node) {
    const { spans, markDefs } = processInlineChildren(node);
    if (!spans.length) return null;
    return { _type: "block", _key: key(), style: style || "normal", markDefs, children: spans };
  }

  function processNode(node) {
    if (node.nodeType === 3) {
      const t = node.rawText.trim();
      if (t) blocks.push({ _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text: t, marks: [] }] });
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName?.toLowerCase();
    if (["h1","h2","h3","h4","h5","h6"].includes(tag)) { const b = makeBlock(tag === "h1" ? "h2" : tag, node); if (b) blocks.push(b); return; }
    if (tag === "p") {
      const imgs = node.querySelectorAll("img");
      if (imgs.length) { for (const img of imgs) { const ib = makeImageBlock(img); if (ib) blocks.push(ib); } }
      const b = makeBlock("normal", node); if (b) blocks.push(b);
      return;
    }
    if (tag === "blockquote") { const b = makeBlock("blockquote", node); if (b) blocks.push(b); return; }
    if (tag === "ul" || tag === "ol") {
      const lt = tag === "ol" ? "number" : "bullet";
      for (const li of node.querySelectorAll(":scope > li")) {
        const { spans, markDefs } = processInlineChildren(li);
        if (spans.length) blocks.push({ _type: "block", _key: key(), style: "normal", listItem: lt, level: 1, markDefs, children: spans });
      }
      return;
    }
    if (tag === "img") { const ib = makeImageBlock(node); if (ib) blocks.push(ib); return; }
    if (tag === "figure") {
      const img = node.querySelector("img");
      if (img) { const ib = makeImageBlock(img, node.querySelector("figcaption")?.textContent?.trim()); if (ib) blocks.push(ib); return; }
    }
    if (["div","section","article","span"].includes(tag)) { for (const c of node.childNodes) processNode(c); return; }
    if (node.childNodes?.length) { for (const c of node.childNodes) processNode(c); }
  }

  function makeImageBlock(imgNode, caption) {
    const src = imgNode.getAttribute("src") || imgNode.getAttribute("data-src") || "";
    const alt = imgNode.getAttribute("alt") || "";
    const id = findSanityAssetByUrl(src, imageMap, urlToWpId);
    if (!id) return null;
    return { _type: "image", _key: key(), asset: { _type: "reference", _ref: id }, ...(alt ? { alt } : {}), ...(caption ? { caption } : {}) };
  }

  for (const child of root.childNodes) processNode(child);
  if (!blocks.length) {
    blocks.push({ _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text: "[Content could not be converted]", marks: [] }] });
  }
  return blocks;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!WP_USER || !WP_APP_PASS) {
    console.error("Set WP_USER and WP_APP_PASS env vars"); process.exit(1);
  }

  console.log("\n=== Migrating German WordPress blog posts ===\n");

  // Load resources
  const imageMap = loadImageMap();
  const urlToWpId = {};
  for (const [id, e] of Object.entries(imageMap)) { if (e.sourceUrl) urlToWpId[e.sourceUrl] = id; }
  console.log(`Image map: ${Object.keys(imageMap).length} entries`);

  const translationPairs = JSON.parse(readFileSync(PAIRS_FILE, "utf-8"));
  const enIdByDeWpId = {};
  const deWpIdByEnWpId = {};
  for (const p of translationPairs) {
    enIdByDeWpId[p.dePostId] = p.enPostId;
    deWpIdByEnWpId[p.enPostId] = p.dePostId;
  }
  console.log(`Translation pairs: ${translationPairs.length}`);

  // Fetch German posts
  console.log("\nFetching German posts...");
  const dePosts = [];
  let page = 1;
  while (true) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&lang=de&status=publish,draft`;
    const res = await fetch(url, { headers: { Authorization: AUTH } });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    dePosts.push(...data);
    const tp = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    if (page >= tp) break;
    page++;
  }
  console.log(`Found ${dePosts.length} German posts (published + drafts)\n`);

  // Fetch WP tags for German
  const wpTags = {};
  let tp = 1;
  while (true) {
    const res = await fetch(`${WP_API}/tags?per_page=100&page=${tp}&lang=de`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    for (const t of data) wpTags[t.id] = t.name;
    if (tp >= parseInt(res.headers.get("X-WP-TotalPages") || "1")) break;
    tp++;
  }

  // Fetch Sanity blog categories
  const cats = await sanityClient.fetch(`*[_type == "blogCategory"]{ _id, slug { current } }`);
  const catBySlug = {};
  for (const c of cats) { if (c.slug?.current) catBySlug[c.slug.current] = c._id; }

  // WP categories for slug lookup
  const wpCatsRes = await fetch(`${WP_API}/categories?per_page=100`);
  const wpCats = await wpCatsRes.json();
  const wpCatSlugMap = {};
  for (const c of wpCats) wpCatSlugMap[c.id] = c.slug;

  // Build lookup: EN WP post ID → Sanity blogPost document ID
  // We need this to create translation.metadata links
  const enPosts = await sanityClient.fetch(
    `*[_type == "blogPost" && (language == "en" || !defined(language))]{ _id, slug { current } }`
  );

  // Also fetch all EN WordPress posts to map WP ID → slug
  const wpEnPosts = [];
  let ePage = 1;
  while (true) {
    const res = await fetch(`${WP_API}/posts?per_page=100&page=${ePage}&lang=en`, { headers: { Authorization: AUTH } });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    wpEnPosts.push(...data);
    if (ePage >= parseInt(res.headers.get("X-WP-TotalPages") || "1")) break;
    ePage++;
  }

  const wpEnIdToSlug = {};
  for (const p of wpEnPosts) wpEnIdToSlug[p.id] = p.slug;

  const sanityEnBySlug = {};
  for (const p of enPosts) { if (p.slug?.current) sanityEnBySlug[p.slug.current] = p._id; }

  // Check existing German blog posts
  const existingDe = new Set();
  const existingDePosts = await sanityClient.fetch(
    `*[_type == "blogPost" && language == "de"]{ slug { current } }`
  );
  for (const p of existingDePosts) { if (p.slug?.current) existingDe.add(p.slug.current); }
  console.log(`Already in Sanity (DE): ${existingDe.size}\n`);

  let created = 0;
  let linked = 0;
  let errors = 0;

  for (const post of dePosts) {
    const title = stripHtml(post.title?.rendered || "Untitled");
    const slug = post.slug || title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, "-").replace(/(^-|-$)/g, "");
    const isDraft = post.status !== "publish";

    if (existingDe.has(slug)) continue;

    const excerpt = stripHtml(post.excerpt?.rendered || "");
    const body = htmlToPortableText(post.content?.rendered || "", imageMap, urlToWpId);

    let featuredImageRef = null;
    if (post.featured_media && imageMap[String(post.featured_media)]) {
      featuredImageRef = { _type: "image", asset: { _type: "reference", _ref: imageMap[String(post.featured_media)].sanityId } };
    }

    const categoryRefs = (post.categories || [])
      .map((id) => wpCatSlugMap[id])
      .filter(Boolean)
      .map((s) => catBySlug[s])
      .filter(Boolean)
      .map((ref) => ({ _type: "reference", _ref: ref, _key: key() }));

    const tagNames = (post.tags || []).map((id) => wpTags[id]).filter(Boolean);

    const yoast = post.yoast_head_json;
    const seo = {};
    if (yoast?.title) seo.metaTitle = yoast.title;
    if (yoast?.description) seo.metaDescription = yoast.description;

    const docId = isDraft ? `drafts.blogPost-de-${slug}` : `blogPost-de-${slug}`;
    const doc = {
      _type: "blogPost",
      _id: docId,
      language: "de",
      title,
      slug: { _type: "slug", current: slug },
      ...(excerpt ? { excerpt } : {}),
      body,
      ...(featuredImageRef ? { featuredImage: featuredImageRef } : {}),
      ...(categoryRefs.length ? { categories: categoryRefs } : {}),
      ...(tagNames.length ? { tags: tagNames } : {}),
      publishedAt: post.date || new Date().toISOString(),
      ...(Object.keys(seo).length ? { seo } : {}),
    };

    try {
      await sanityClient.createOrReplace(doc);
      created++;
      const statusLabel = isDraft ? " [draft]" : "";
      console.log(`  [${created}] "${title}"${statusLabel}`);

      // Create translation.metadata link if we have the pair
      const enWpId = enIdByDeWpId[post.id];
      if (enWpId) {
        const enSlug = wpEnIdToSlug[enWpId];
        const enSanityId = enSlug ? sanityEnBySlug[enSlug] : null;

        if (enSanityId) {
          const actualDeId = isDraft ? docId : docId;
          const metadataId = `translation.metadata.${enSanityId}`;

          try {
            const existingMeta = await sanityClient.fetch(
              `*[_type == "translation.metadata" && references($enId)][0]`,
              { enId: enSanityId }
            );

            if (existingMeta) {
              // Add German translation to existing metadata
              const hasDE = existingMeta.translations?.some(t => t._key === "de");
              if (!hasDE) {
                await sanityClient
                  .patch(existingMeta._id)
                  .append("translations", [{
                    _key: "de",
                    value: { _type: "reference", _ref: actualDeId },
                  }])
                  .commit();
                linked++;
                console.log(`    → Linked to EN: ${enSlug}`);
              }
            } else {
              // Create new translation.metadata
              await sanityClient.create({
                _type: "translation.metadata",
                translations: [
                  { _key: "en", value: { _type: "reference", _ref: enSanityId } },
                  { _key: "de", value: { _type: "reference", _ref: actualDeId } },
                ],
                schemaTypes: ["blogPost"],
              });
              linked++;
              console.log(`    → Linked to EN: ${enSlug}`);
            }
          } catch (err) {
            console.log(`    → Link failed: ${err.message}`);
          }
        }
      }

      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`  ERROR: "${title}": ${err.message}`);
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`  German blog migration complete!`);
  console.log(`  Created: ${created}`);
  console.log(`  Linked to English: ${linked}`);
  console.log(`  Errors: ${errors}`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(console.error);
