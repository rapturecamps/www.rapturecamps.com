/**
 * Pre-build script: fetches all active redirects from Sanity and writes them
 * into vercel.json so Vercel handles them natively (no middleware needed).
 *
 * Run manually:  node scripts/sync-redirects.mjs
 * Runs automatically before every build via the "build" npm script.
 */

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VERCEL_JSON_PATH = resolve(__dirname, "../vercel.json");

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

async function sync() {
  console.log("[sync-redirects] Fetching redirects from Sanity...");

  const redirects = await client.fetch(
    `*[_type == "redirect" && isActive == true]{ fromPath, toPath, statusCode }`
  );

  console.log(`[sync-redirects] Found ${redirects.length} active redirects`);

  // Read current vercel.json
  let config;
  try {
    config = JSON.parse(readFileSync(VERCEL_JSON_PATH, "utf-8"));
  } catch {
    config = {};
  }

  // Build Vercel redirect/rewrite entries
  const vercelRedirects = [];

  for (const r of redirects) {
    if (!r.fromPath) continue;

    // Normalize: strip trailing slash (except root)
    const source =
      r.fromPath.length > 1 ? r.fromPath.replace(/\/+$/, "") : r.fromPath;

    if (r.statusCode === 404) continue;

    if (r.statusCode === 410) {
      vercelRedirects.push({
        source,
        destination: "/410.html",
        statusCode: 410,
      });
    } else {
      vercelRedirects.push({
        source,
        destination: r.toPath,
        statusCode: r.statusCode || 301,
      });
    }
  }

  // Deduplicate by source path
  const seen = new Set();
  const deduped = vercelRedirects.filter((r) => {
    if (seen.has(r.source)) return false;
    seen.add(r.source);
    return true;
  });

  config.redirects = deduped;

  writeFileSync(VERCEL_JSON_PATH, JSON.stringify(config, null, 2) + "\n");
  console.log(
    `[sync-redirects] Wrote ${deduped.length} redirects to vercel.json`
  );
}

sync().catch((err) => {
  console.error("[sync-redirects] Error:", err.message);
  process.exit(1);
});
