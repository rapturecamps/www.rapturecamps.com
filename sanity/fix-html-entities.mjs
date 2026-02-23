#!/usr/bin/env node
/**
 * Fix HTML entities in all blogPost documents in Sanity.
 * Decodes &#8217; &#8220; &#8221; &#8230; and all other numeric/named HTML entities
 * in body (Portable Text spans), title, and excerpt fields.
 *
 * Usage:
 *   node sanity/fix-html-entities.mjs --dry-run   # preview changes
 *   node sanity/fix-html-entities.mjs              # apply changes
 */

import { createClient } from "@sanity/client";

const DRY_RUN = process.argv.includes("--dry-run");

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const NAMED_ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&apos;": "'", "&nbsp;": " ", "&ndash;": "\u2013", "&mdash;": "\u2014",
  "&lsquo;": "\u2018", "&rsquo;": "\u2019", "&ldquo;": "\u201C", "&rdquo;": "\u201D",
  "&hellip;": "\u2026", "&trade;": "\u2122", "&copy;": "\u00A9", "&reg;": "\u00AE",
  "&euro;": "\u20AC", "&pound;": "\u00A3", "&yen;": "\u00A5", "&cent;": "\u00A2",
  "&frac12;": "\u00BD", "&frac14;": "\u00BC", "&frac34;": "\u00BE",
  "&deg;": "\u00B0", "&times;": "\u00D7", "&divide;": "\u00F7",
  "&laquo;": "\u00AB", "&raquo;": "\u00BB",
};

function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return str;

  let result = str;

  // Decode numeric entities: &#8217; &#x2019;
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

  // Decode named entities
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    result = result.replaceAll(entity, char);
  }

  return result;
}

function hasEntities(str) {
  if (!str || typeof str !== "string") return false;
  return /&[#a-zA-Z][a-zA-Z0-9]*;/.test(str);
}

function fixPortableTextBody(body) {
  if (!Array.isArray(body)) return { changed: false, body };

  let changed = false;
  const fixed = body.map((block) => {
    if (block._type === "block" && Array.isArray(block.children)) {
      const fixedChildren = block.children.map((child) => {
        if (child._type === "span" && hasEntities(child.text)) {
          changed = true;
          return { ...child, text: decodeHtmlEntities(child.text) };
        }
        return child;
      });
      return { ...block, children: fixedChildren };
    }
    return block;
  });

  return { changed, body: fixed };
}

async function main() {
  console.log(`\n  Fix HTML Entities in Sanity blogPosts`);
  console.log(`  Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}\n`);

  const posts = await client.fetch(
    `*[_type == "blogPost"]{ _id, _rev, title, excerpt, body }`
  );
  console.log(`  Found ${posts.length} blogPost documents\n`);

  let patchCount = 0;
  let fieldStats = { title: 0, excerpt: 0, body: 0 };

  for (const post of posts) {
    const patch = {};
    let needsPatch = false;

    if (hasEntities(post.title)) {
      patch.title = decodeHtmlEntities(post.title);
      fieldStats.title++;
      needsPatch = true;
    }

    if (hasEntities(post.excerpt)) {
      patch.excerpt = decodeHtmlEntities(post.excerpt);
      fieldStats.excerpt++;
      needsPatch = true;
    }

    const { changed: bodyChanged, body: fixedBody } = fixPortableTextBody(post.body);
    if (bodyChanged) {
      patch.body = fixedBody;
      fieldStats.body++;
      needsPatch = true;
    }

    if (needsPatch) {
      patchCount++;
      const fields = Object.keys(patch).join(", ");

      if (DRY_RUN) {
        console.log(`  [DRY] Would patch ${post._id} (${fields})`);
        if (patch.title) {
          console.log(`         title: "${post.title}" → "${patch.title}"`);
        }
      } else {
        await client.patch(post._id).set(patch).commit();
        console.log(`  ✓ Patched ${post._id} (${fields})`);
      }
    }
  }

  console.log(`\n  Summary:`);
  console.log(`    Posts needing fixes: ${patchCount} / ${posts.length}`);
  console.log(`    Title fixes:   ${fieldStats.title}`);
  console.log(`    Excerpt fixes: ${fieldStats.excerpt}`);
  console.log(`    Body fixes:    ${fieldStats.body}`);
  console.log(`    Mode: ${DRY_RUN ? "DRY RUN (no changes made)" : "LIVE (changes applied)"}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
