#!/usr/bin/env node

/**
 * Migrate WordPress draft posts to Sanity as unpublished documents.
 *
 * Usage:
 *   WP_USER=simon.eiler WP_APP_PASS="..." node sanity/migrate-wp-drafts.mjs
 */

import { createClient } from "@sanity/client";
import { parse as parseHTML } from "node-html-parser";
import { readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
import path from "path";

const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const WP_USER = process.env.WP_USER;
const WP_APP_PASS = process.env.WP_APP_PASS;
const AUTH = "Basic " + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString("base64");
const MAP_FILE = path.resolve("sanity/wp-image-map.json");

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
    blocks.push({ _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text: "[Draft — no content yet]", marks: [] }] });
  }
  return blocks;
}

async function main() {
  if (!WP_USER || !WP_APP_PASS) {
    console.error("Set WP_USER and WP_APP_PASS env vars"); process.exit(1);
  }

  console.log("\n=== Migrating WordPress drafts to Sanity ===\n");

  const imageMap = loadImageMap();
  const urlToWpId = {};
  for (const [id, e] of Object.entries(imageMap)) { if (e.sourceUrl) urlToWpId[e.sourceUrl] = id; }
  console.log(`Image map: ${Object.keys(imageMap).length} entries`);

  // Fetch drafts
  const drafts = [];
  let page = 1;
  while (true) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&status=draft`;
    const res = await fetch(url, { headers: { Authorization: AUTH } });
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    drafts.push(...data);
    const tp = parseInt(res.headers.get("X-WP-TotalPages") || "1");
    if (page >= tp) break;
    page++;
  }
  console.log(`Found ${drafts.length} drafts\n`);

  // Fetch categories for mapping
  const cats = await sanityClient.fetch(`*[_type == "blogCategory"]{ _id, slug { current } }`);
  const catBySlug = {};
  for (const c of cats) { if (c.slug?.current) catBySlug[c.slug.current] = c._id; }

  // WP categories
  const wpCatsRes = await fetch(`${WP_API}/categories?per_page=100`);
  const wpCats = await wpCatsRes.json();
  const wpCatSlugMap = {};
  for (const c of wpCats) { wpCatSlugMap[c.id] = c.slug; }

  // WP Tags
  const wpTags = {};
  let tp = 1;
  while (true) {
    const res = await fetch(`${WP_API}/tags?per_page=100&page=${tp}`);
    if (!res.ok) break;
    const data = await res.json();
    if (!data.length) break;
    for (const t of data) wpTags[t.id] = t.name;
    if (tp >= parseInt(res.headers.get("X-WP-TotalPages") || "1")) break;
    tp++;
  }

  let created = 0;
  let errors = 0;

  for (const post of drafts) {
    const title = stripHtml(post.title?.rendered || "Untitled Draft");
    const slug = post.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const excerpt = stripHtml(post.excerpt?.rendered || "");
    const body = htmlToPortableText(post.content?.rendered || "", imageMap, urlToWpId);

    let featuredImageRef = null;
    if (post.featured_media && imageMap[String(post.featured_media)]) {
      featuredImageRef = { _type: "image", asset: { _type: "reference", _ref: imageMap[String(post.featured_media)].sanityId } };
    }

    const categoryRefs = (post.categories || [])
      .map((id) => wpCatSlugMap[id])
      .filter(Boolean)
      .map((slug) => catBySlug[slug])
      .filter(Boolean)
      .map((ref) => ({ _type: "reference", _ref: ref, _key: key() }));

    const tagNames = (post.tags || []).map((id) => wpTags[id]).filter(Boolean);

    const doc = {
      _type: "blogPost",
      _id: `drafts.blogPost-draft-${slug}`,
      language: "en",
      title,
      slug: { _type: "slug", current: slug },
      ...(excerpt ? { excerpt } : {}),
      body,
      ...(featuredImageRef ? { featuredImage: featuredImageRef } : {}),
      ...(categoryRefs.length ? { categories: categoryRefs } : {}),
      ...(tagNames.length ? { tags: tagNames } : {}),
      publishedAt: post.date || new Date().toISOString(),
    };

    try {
      await sanityClient.createOrReplace(doc);
      created++;
      console.log(`  [${created}] Draft: "${title}" → drafts.blogPost-draft-${slug}`);
      await sleep(300);
    } catch (err) {
      errors++;
      console.error(`  ERROR: "${title}": ${err.message}`);
    }
  }

  console.log(`\n=== Done! Created: ${created}, Errors: ${errors} ===\n`);
}

main().catch(console.error);
