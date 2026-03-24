#!/usr/bin/env node

/**
 * Blog Link Audit: WordPress vs Sanity
 *
 * Compares internal/external links in WordPress blog posts against their
 * Sanity counterparts. Outputs two CSV reports:
 *   - docs/blog-link-audit.csv        — per-post summary
 *   - docs/blog-link-audit-details.csv — every missing link with context
 *
 * Usage:
 *   node scripts/audit-blog-links.mjs
 *   node scripts/audit-blog-links.mjs --lang=de   # audit German posts
 *
 * Read-only — no writes to either CMS.
 */

import { createClient } from "@sanity/client";
import { parse as parseHTML } from "node-html-parser";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";

// Load .env manually (no dotenv dependency)
try {
  const envFile = readFileSync(path.resolve(".env"), "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}


// ── Config ──────────────────────────────────────────────────────────────────

const LANG = process.argv.find((a) => a.startsWith("--lang="))?.split("=")[1] || "en";
const WP_API = "https://www.rapturecamps.com/wp-json/wp/v2";
const SUMMARY_FILE = path.resolve(`docs/blog-link-audit${LANG === "de" ? "-de" : ""}.csv`);
const DETAILS_FILE = path.resolve(`docs/blog-link-audit-details${LANG === "de" ? "-de" : ""}.csv`);

const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&hellip;/g, "\u2026")
    .replace(/&trade;/g, "\u2122")
    .replace(/&copy;/g, "\u00A9")
    .replace(/&reg;/g, "\u00AE");
}

// ── Link extraction ─────────────────────────────────────────────────────────

function normalizeHref(href) {
  if (!href) return "";
  let h = href.trim();
  try {
    const url = new URL(h, "https://www.rapturecamps.com");
    if (
      url.hostname === "www.rapturecamps.com" ||
      url.hostname === "rapturecamps.com"
    ) {
      h = url.pathname;
    }
  } catch {}
  h = h.replace(/\/+$/, "") || "/";
  h = h.replace(/\?.*$/, "");
  return h.toLowerCase();
}

function classifyHref(href) {
  if (!href) return "unknown";
  try {
    const url = new URL(href, "https://www.rapturecamps.com");
    if (
      url.hostname === "www.rapturecamps.com" ||
      url.hostname === "rapturecamps.com"
    ) {
      return "internal";
    }
  } catch {}
  if (href.startsWith("/") || href.startsWith("#")) return "internal";
  return "external";
}

function extractWpLinks(html) {
  if (!html) return [];
  const root = parseHTML(html);
  const links = [];
  const anchors = root.querySelectorAll("a");
  for (const a of anchors) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const text = decodeHtmlEntities(a.textContent || "").trim();
    links.push({
      text,
      href: decodeHtmlEntities(href),
      normalized: normalizeHref(href),
      type: classifyHref(href),
    });
  }
  return links;
}

function extractSanityLinks(body) {
  if (!body || !Array.isArray(body)) return [];
  const links = [];

  for (const block of body) {
    if (block._type !== "block") continue;
    const markDefs = block.markDefs || [];
    const linkDefs = markDefs.filter((m) => m._type === "link");
    if (!linkDefs.length) continue;

    const defMap = {};
    for (const def of linkDefs) {
      defMap[def._key] = def.href;
    }

    const children = block.children || [];
    for (const child of children) {
      if (child._type !== "span" || !child.marks?.length) continue;
      for (const markKey of child.marks) {
        if (defMap[markKey]) {
          const href = defMap[markKey];
          if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
          links.push({
            text: (child.text || "").trim(),
            href,
            normalized: normalizeHref(href),
            type: classifyHref(href),
          });
        }
      }
    }
  }
  return links;
}

// ── CSV helpers ─────────────────────────────────────────────────────────────

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

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Blog Link Audit: WordPress vs Sanity [${LANG.toUpperCase()}]`);
  console.log(`${"=".repeat(60)}\n`);

  // 1. Fetch WordPress posts
  console.log("=== Fetching WordPress posts ===");
  const wpPosts = await fetchAllWpPosts();
  console.log(`  Found ${wpPosts.length} published posts\n`);

  // 2. Fetch Sanity posts
  console.log("=== Fetching Sanity posts ===");
  const sanityPosts = await sanityClient.fetch(
    `*[_type == "blogPost" && (language == $lang || (!defined(language) && $lang == "en"))] {
      _id,
      title,
      "slug": slug.current,
      body[] {
        _type,
        markDefs,
        children
      }
    }`,
    { lang: LANG }
  );
  console.log(`  Found ${sanityPosts.length} posts\n`);

  // 3. Build lookup maps
  const wpBySlug = {};
  for (const p of wpPosts) wpBySlug[p.slug] = p;
  const sanityBySlug = {};
  for (const p of sanityPosts) {
    if (p.slug) sanityBySlug[p.slug] = p;
  }

  // 4. Compare
  console.log("=== Comparing links ===\n");

  const summaryRows = [
    csvRow([
      "slug",
      "title",
      "wp_total_links",
      "wp_internal_links",
      "wp_external_links",
      "sanity_total_links",
      "sanity_internal_links",
      "sanity_external_links",
      "missing_count",
      "extra_in_sanity",
      "status",
      "matched_in",
    ]),
  ];

  const detailRows = [
    csvRow([
      "slug",
      "title",
      "issue",
      "link_text",
      "href",
      "normalized_href",
      "link_type",
    ]),
  ];

  let totalPosts = 0;
  let postsOk = 0;
  let postsMissing = 0;
  let postsWpOnly = 0;
  let postsSanityOnly = 0;
  let totalMissingLinks = 0;

  const allSlugs = new Set([
    ...Object.keys(wpBySlug),
    ...Object.keys(sanityBySlug),
  ]);

  for (const slug of [...allSlugs].sort()) {
    const wp = wpBySlug[slug];
    const sanity = sanityBySlug[slug];

    if (!wp && sanity) {
      postsSanityOnly++;
      summaryRows.push(
        csvRow([slug, sanity.title || "", 0, 0, 0, 0, 0, 0, 0, 0, "SANITY_ONLY", "sanity"])
      );
      continue;
    }

    if (wp && !sanity) {
      postsWpOnly++;
      const wpLinks = extractWpLinks(wp.content?.rendered);
      summaryRows.push(
        csvRow([
          slug,
          decodeHtmlEntities(wp.title?.rendered || ""),
          wpLinks.length,
          wpLinks.filter((l) => l.type === "internal").length,
          wpLinks.filter((l) => l.type === "external").length,
          0, 0, 0,
          wpLinks.length,
          0,
          "WP_ONLY_NOT_IN_SANITY",
          "wordpress",
        ])
      );
      continue;
    }

    totalPosts++;
    const title = decodeHtmlEntities(wp.title?.rendered || "");
    const wpLinks = extractWpLinks(wp.content?.rendered);
    const sanityLinks = extractSanityLinks(sanity.body);

    const wpNormalized = new Set(wpLinks.map((l) => l.normalized));
    const sanityNormalized = new Set(sanityLinks.map((l) => l.normalized));

    const missingInSanity = wpLinks.filter(
      (l) => !sanityNormalized.has(l.normalized)
    );
    const extraInSanity = sanityLinks.filter(
      (l) => !wpNormalized.has(l.normalized)
    );

    const wpInternal = wpLinks.filter((l) => l.type === "internal").length;
    const wpExternal = wpLinks.filter((l) => l.type === "external").length;
    const sInternal = sanityLinks.filter((l) => l.type === "internal").length;
    const sExternal = sanityLinks.filter((l) => l.type === "external").length;

    let status;
    if (wpLinks.length === 0 && sanityLinks.length === 0) {
      status = "NO_LINKS";
      postsOk++;
    } else if (missingInSanity.length === 0) {
      status = "OK";
      postsOk++;
    } else {
      status = "MISSING_LINKS";
      postsMissing++;
      totalMissingLinks += missingInSanity.length;
    }

    summaryRows.push(
      csvRow([
        slug,
        title,
        wpLinks.length,
        wpInternal,
        wpExternal,
        sanityLinks.length,
        sInternal,
        sExternal,
        missingInSanity.length,
        extraInSanity.length,
        status,
        "both",
      ])
    );

    for (const link of missingInSanity) {
      detailRows.push(
        csvRow([
          slug,
          title,
          "MISSING_IN_SANITY",
          link.text,
          link.href,
          link.normalized,
          link.type,
        ])
      );
    }

    for (const link of extraInSanity) {
      detailRows.push(
        csvRow([
          slug,
          title,
          "EXTRA_IN_SANITY",
          link.text,
          link.href,
          link.normalized,
          link.type,
        ])
      );
    }
  }

  // 5. Write reports
  mkdirSync(path.dirname(SUMMARY_FILE), { recursive: true });
  writeFileSync(SUMMARY_FILE, summaryRows.join("\n") + "\n");
  writeFileSync(DETAILS_FILE, detailRows.join("\n") + "\n");

  // 6. Print summary
  console.log(`${"=".repeat(60)}`);
  console.log(`  Audit Complete [${LANG.toUpperCase()}]`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Posts matched (in both):  ${totalPosts}`);
  console.log(`  Posts OK (no missing):    ${postsOk}`);
  console.log(`  Posts with missing links: ${postsMissing}`);
  console.log(`  Total missing links:      ${totalMissingLinks}`);
  console.log(`  WP-only (not in Sanity):  ${postsWpOnly}`);
  console.log(`  Sanity-only (not in WP):  ${postsSanityOnly}`);
  console.log();
  console.log(`  Summary: ${SUMMARY_FILE}`);
  console.log(`  Details: ${DETAILS_FILE}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
