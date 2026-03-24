#!/usr/bin/env node

/**
 * Audit internal links on WordPress surfcamp pages.
 *
 * Scrapes live WordPress surfcamp pages, extracts every internal link
 * (anchor text + href), and writes a CSV report grouped by page.
 *
 * Usage:
 *   node scripts/audit-surfcamp-links.mjs
 *
 * Output:
 *   docs/surfcamp-page-links.csv
 */

import { parse as parseHTML } from "node-html-parser";
import { writeFileSync } from "fs";
import path from "path";

const BASE = "https://www.rapturecamps.com";
const OUT_FILE = path.resolve("docs/surfcamp-page-links.csv");

const PAGES = [
  "/surfcamp/",
  "/surfcamp/portugal/",
  "/surfcamp/bali/",
  "/surfcamp/costa-rica/",
  "/surfcamp/nicaragua/",
  "/surfcamp/morocco/",
  "/surfcamp/portugal/ericeira-lizandro/",
  "/surfcamp/portugal/ericeira-lizandro/surf/",
  "/surfcamp/portugal/ericeira-lizandro/rooms/",
  "/surfcamp/portugal/ericeira-lizandro/food/",
  "/surfcamp/portugal/ericeira-coxos-surf-villa/",
  "/surfcamp/portugal/ericeira-coxos-surf-villa/surf/",
  "/surfcamp/portugal/ericeira-coxos-surf-villa/rooms/",
  "/surfcamp/portugal/ericeira-coxos-surf-villa/food/",
  "/surfcamp/portugal/alentejo-milfontes/",
  "/surfcamp/portugal/alentejo-milfontes/surf/",
  "/surfcamp/portugal/alentejo-milfontes/rooms/",
  "/surfcamp/portugal/alentejo-milfontes/food/",
  "/surfcamp/bali/padang-padang/",
  "/surfcamp/bali/padang-padang/surf/",
  "/surfcamp/bali/padang-padang/rooms/",
  "/surfcamp/bali/padang-padang/food/",
  "/surfcamp/bali/green-bowl/",
  "/surfcamp/bali/green-bowl/surf/",
  "/surfcamp/bali/green-bowl/rooms/",
  "/surfcamp/bali/green-bowl/food/",
  "/surfcamp/bali/canggu/",
  "/surfcamp/bali/canggu/surf/",
  "/surfcamp/bali/canggu/rooms/",
  "/surfcamp/bali/canggu/food/",
  "/surfcamp/costa-rica/avellanas/",
  "/surfcamp/costa-rica/avellanas/surf/",
  "/surfcamp/costa-rica/avellanas/rooms/",
  "/surfcamp/costa-rica/avellanas/food/",
  "/surfcamp/nicaragua/maderas/",
  "/surfcamp/nicaragua/maderas/surf/",
  "/surfcamp/nicaragua/maderas/rooms/",
  "/surfcamp/nicaragua/maderas/food/",
  "/surfcamp/morocco/sidi-ifni/",
  "/surfcamp/morocco/sidi-ifni/surf/",
  "/surfcamp/morocco/sidi-ifni/rooms/",
  "/surfcamp/morocco/sidi-ifni/food/",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeEntities(str) {
  if (!str) return "";
  return str
    .replace(/&#(\d+);/g, (_, c) => String.fromCodePoint(Number(c)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&ndash;/g, "\u2013").replace(/&mdash;/g, "\u2014")
    .replace(/&lsquo;/g, "\u2018").replace(/&rsquo;/g, "\u2019")
    .replace(/&ldquo;/g, "\u201C").replace(/&rdquo;/g, "\u201D")
    .replace(/&hellip;/g, "\u2026");
}

function normalizeHref(href) {
  if (!href) return "";
  let h = href.trim();
  try {
    const url = new URL(h, BASE);
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
    const url = new URL(href, BASE);
    if (url.hostname === "www.rapturecamps.com" || url.hostname === "rapturecamps.com") return true;
  } catch {}
  return href.startsWith("/") && !href.startsWith("//");
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

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log("  Surfcamp Pages — Internal Link Audit");
  console.log(`${"=".repeat(60)}\n`);

  const rows = [csvRow(["page_path", "anchor_text", "href", "normalized_href", "link_location"])];
  let totalLinks = 0;

  for (const pagePath of PAGES) {
    const url = BASE + pagePath;
    console.log(`  Fetching ${pagePath}...`);

    let html;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) {
        console.log(`    SKIP — ${res.status}`);
        continue;
      }
      html = await res.text();
    } catch (e) {
      console.log(`    ERROR — ${e.message}`);
      continue;
    }

    const root = parseHTML(html);

    // Remove nav, header, footer to focus on page content
    for (const sel of ["header", "nav", "footer", ".site-header", ".site-footer", "#site-navigation"]) {
      for (const el of root.querySelectorAll(sel)) el.remove();
    }

    const anchors = root.querySelectorAll("a");
    let pageLinks = 0;

    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
      if (!isInternal(href)) continue;

      const text = decodeEntities(a.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) continue;

      const norm = normalizeHref(href);

      // Try to determine context
      let location = "body";
      const parent = a.parentNode;
      if (parent) {
        const cls = (parent.getAttribute?.("class") || "").toLowerCase();
        const tag = (parent.rawTagName || "").toLowerCase();
        if (cls.includes("btn") || cls.includes("button") || cls.includes("cta") || a.getAttribute("class")?.includes("btn")) {
          location = "button/CTA";
        } else if (cls.includes("card") || cls.includes("destination")) {
          location = "card";
        } else if (tag === "li" || tag === "nav") {
          location = "navigation";
        }
      }

      rows.push(csvRow([pagePath.replace(/\/+$/, ""), text, href, norm, location]));
      pageLinks++;
    }

    console.log(`    → ${pageLinks} internal links`);
    totalLinks += pageLinks;
    await sleep(500);
  }

  writeFileSync(OUT_FILE, rows.join("\n") + "\n");

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Done — ${totalLinks} internal links across ${PAGES.length} pages`);
  console.log(`  Report: ${OUT_FILE}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
