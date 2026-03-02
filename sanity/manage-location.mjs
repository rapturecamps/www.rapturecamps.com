#!/usr/bin/env node
/**
 * Safely remove a camp or country from Sanity CMS.
 *
 * Usage:
 *   node sanity/manage-location.mjs remove --camp <slug>              # dry run
 *   node sanity/manage-location.mjs remove --camp <slug> --confirm    # actually delete
 *   node sanity/manage-location.mjs remove --country <slug>           # dry run (all camps in country)
 *   node sanity/manage-location.mjs remove --country <slug> --confirm # actually delete
 *
 * Requires SANITY_WRITE_TOKEN env var (reads from .env if present).
 *
 * What this script does (in order):
 *   1. Patches shared FAQs to remove camp references; deletes exclusive FAQs
 *   2. Patches the homepage to remove camp from featuredDestinations
 *   3. Deletes camp subpages (surf, rooms, food) and their translation metadata
 *   4. Breaks circular camp <-> country references
 *   5. Deletes the camp document(s) and their translation metadata
 *   6. If country has no remaining camps, deletes the country document(s)
 *   7. Creates 410 Gone redirects for all old URLs
 *
 * What this script NEVER does:
 *   - Delete shared documents (homepage, other camps, blog posts)
 *   - Modify code files (data.ts, meta descriptions, etc.)
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Load .env if present ──────────────────────────────────────────────────
try {
  const envPath = resolve(import.meta.dirname, "..", ".env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.+)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  }
} catch {}

// ─── Parse args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];
const campFlag = args.indexOf("--camp");
const countryFlag = args.indexOf("--country");
const confirm = args.includes("--confirm");
const campSlug = campFlag !== -1 ? args[campFlag + 1] : null;
const countrySlug = countryFlag !== -1 ? args[countryFlag + 1] : null;

if (command !== "remove" || (!campSlug && !countrySlug)) {
  console.log(`
  Usage:
    node sanity/manage-location.mjs remove --camp <slug>              # dry run
    node sanity/manage-location.mjs remove --camp <slug> --confirm    # execute
    node sanity/manage-location.mjs remove --country <slug>           # dry run
    node sanity/manage-location.mjs remove --country <slug> --confirm # execute

  Examples:
    node sanity/manage-location.mjs remove --camp banana-village
    node sanity/manage-location.mjs remove --country morocco --confirm
  `);
  process.exit(0);
}

const DRY = !confirm;
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!TOKEN && !DRY) {
  console.error("ERROR: SANITY_WRITE_TOKEN is required for --confirm mode.");
  console.error("Set it in .env or export it before running.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc",
  dataset: process.env.PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: TOKEN,
  useCdn: false,
});

// ─── Helpers ───────────────────────────────────────────────────────────────
const log = (msg) => console.log(`  ${msg}`);
const heading = (msg) => console.log(`\n=== ${msg} ===\n`);

async function patchDoc(id, patchFn, description) {
  log(`PATCH: ${description} (${id})`);
  if (!DRY) await patchFn(client.patch(id)).commit();
}

async function deleteDoc(id, description) {
  log(`DELETE: ${description} (${id})`);
  if (!DRY) {
    try { await client.delete(id); } catch {}
    try { await client.delete(`drafts.${id}`); } catch {}
  }
}

async function deleteWithTranslations(id, description) {
  const metas = await client.fetch(
    `*[_type == "translation.metadata" && references($id)]{ _id }`,
    { id }
  );
  for (const m of metas) {
    await deleteDoc(m._id, `translation metadata for ${id}`);
  }
  await deleteDoc(id, description);
}

async function createRedirect(path) {
  const docId = `redirect-410-${path.replace(/\//g, "-").replace(/^-/, "")}`;
  log(`410: ${path}`);
  if (!DRY) {
    await client.createOrReplace({
      _id: docId,
      _type: "redirect",
      fromPath: path,
      statusCode: 410,
      isActive: true,
      note: `Location removed via manage-location script`,
    });
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function removeCamp(campDoc) {
  const campId = campDoc._id;
  const campName = campDoc.name;
  const campSlug = campDoc.slug;
  const countrySlug = campDoc.countrySlug;

  heading(`Removing camp: ${campName} (${campId})`);

  // --- 1. Clean up FAQs ---
  heading("Step 1: Clean up FAQs");

  const faqs = await client.fetch(
    `*[_type == "faq" && $campId in camps[]._ref]{
      _id, question, language, "campRefs": camps[]{ _ref, _key }
    }`,
    { campId }
  );

  for (const faq of faqs) {
    const remaining = (faq.campRefs || []).filter((r) => r._ref !== campId);
    const lang = faq.language ? ` (${faq.language.toUpperCase()})` : "";

    if (remaining.length === 0) {
      await deleteWithTranslations(faq._id, `FAQ${lang}: "${faq.question}"`);
    } else {
      await patchDoc(
        faq._id,
        (p) => p.set({ camps: remaining }),
        `FAQ${lang}: "${faq.question}" — remove camp ref, keep ${remaining.length} others`
      );
    }
  }

  if (faqs.length === 0) log("No FAQs to clean up.");

  // --- 2. Patch homepage featuredDestinations ---
  heading("Step 2: Patch homepage");

  const homepages = await client.fetch(
    `*[_type == "homepage" && $campId in featuredDestinations[]._ref]{
      _id, "refs": featuredDestinations[]{ _ref, _key, _type }
    }`,
    { campId }
  );

  for (const hp of homepages) {
    const remaining = (hp.refs || []).filter((r) => r._ref !== campId);
    await patchDoc(
      hp._id,
      (p) => p.set({ featuredDestinations: remaining }),
      `Remove ${campName} from homepage featuredDestinations`
    );
  }

  if (homepages.length === 0) log("Camp not in any homepage featuredDestinations.");

  // --- 3. Delete camp subpages ---
  heading("Step 3: Delete camp subpages");

  for (const subType of ["campSurfPage", "campRoomsPage", "campFoodPage"]) {
    const subpages = await client.fetch(
      `*[_type == $type && camp._ref == $campId]{ _id }`,
      { type: subType, campId }
    );
    for (const sp of subpages) {
      await deleteWithTranslations(sp._id, `${subType}`);
    }
    if (subpages.length === 0) log(`No ${subType} found.`);
  }

  // --- 4. Break circular reference: unset country on camp ---
  heading("Step 4: Break circular references");

  await patchDoc(
    campId,
    (p) => p.unset(["country"]),
    `Unset country reference on ${campName}`
  );

  // --- 5. Delete camp document ---
  heading("Step 5: Delete camp document");

  await deleteWithTranslations(campId, `Camp: ${campName}`);

  // --- 6. Create 410 redirects ---
  heading("Step 6: Create 410 redirects");

  const basePaths = [
    `/surfcamp/${countrySlug}/${campSlug}`,
    `/surfcamp/${countrySlug}/${campSlug}/surf`,
    `/surfcamp/${countrySlug}/${campSlug}/rooms`,
    `/surfcamp/${countrySlug}/${campSlug}/food`,
    `/faq/${campSlug}`,
  ];

  for (const path of basePaths) {
    await createRedirect(path);
    await createRedirect(`/de${path}`);
  }
}

async function removeCountry(slug) {
  heading(`Looking up country: ${slug}`);

  const country = await client.fetch(
    `*[_type == "country" && slug.current == $slug && (language == "en" || !defined(language))][0]{
      _id, name, "slug": slug.current
    }`,
    { slug }
  );

  if (!country) {
    console.error(`ERROR: Country with slug "${slug}" not found in Sanity.`);
    process.exit(1);
  }

  const camps = await client.fetch(
    `*[_type == "camp" && country._ref == $countryId && (language == "en" || !defined(language))]{
      _id, name, "slug": slug.current, "countrySlug": $slug
    }`,
    { countryId: country._id, slug }
  );

  log(`Country: ${country.name} (${country._id})`);
  log(`Camps found: ${camps.length}`);
  for (const c of camps) log(`  - ${c.name} (${c.slug})`);

  // Remove each camp
  for (const camp of camps) {
    await removeCamp(camp);
  }

  // Break circular: unset camps array on country
  heading("Removing country document");

  await patchDoc(
    country._id,
    (p) => p.unset(["camps"]),
    `Unset camps array on ${country.name}`
  );

  await deleteWithTranslations(country._id, `Country: ${country.name}`);

  // Also delete any German translation
  const deCountries = await client.fetch(
    `*[_type == "country" && slug.current == $slug && language == "de"]{ _id }`,
    { slug }
  );
  for (const de of deCountries) {
    await deleteWithTranslations(de._id, `Country (DE): ${slug}`);
  }

  // Country-level 410 redirect
  await createRedirect(`/surfcamp/${slug}`);
  await createRedirect(`/de/surfcamp/${slug}`);
}

async function removeSingleCamp(slug) {
  const camp = await client.fetch(
    `*[_type == "camp" && slug.current == $slug && (language == "en" || !defined(language))][0]{
      _id, name, "slug": slug.current, "countrySlug": country->slug.current
    }`,
    { slug }
  );

  if (!camp) {
    console.error(`ERROR: Camp with slug "${slug}" not found in Sanity.`);
    process.exit(1);
  }

  await removeCamp(camp);

  // Check if country has remaining camps
  const countryDoc = await client.fetch(
    `*[_type == "country" && slug.current == $slug && (language == "en" || !defined(language))][0]{
      _id, name,
      "campCount": count(*[_type == "camp" && country._ref == ^._id && (language == "en" || !defined(language))])
    }`,
    { slug: camp.countrySlug }
  );

  if (countryDoc && countryDoc.campCount === 0) {
    log(`\nCountry "${countryDoc.name}" has no remaining camps.`);
    heading("Also removing empty country");

    await patchDoc(
      countryDoc._id,
      (p) => p.unset(["camps"]),
      `Unset camps array on ${countryDoc.name}`
    );
    await deleteWithTranslations(countryDoc._id, `Country: ${countryDoc.name}`);

    const deCountries = await client.fetch(
      `*[_type == "country" && slug.current == $cSlug && language == "de"]{ _id }`,
      { cSlug: camp.countrySlug }
    );
    for (const de of deCountries) {
      await deleteWithTranslations(de._id, `Country (DE)`);
    }

    await createRedirect(`/surfcamp/${camp.countrySlug}`);
    await createRedirect(`/de/surfcamp/${camp.countrySlug}`);
  } else if (countryDoc) {
    log(`\nCountry "${countryDoc.name}" still has ${countryDoc.campCount} camp(s) — keeping it.`);
  }
}

// ─── Entry point ───────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${DRY ? "DRY RUN" : "LIVE"} — ${DRY ? "no changes will be made" : "changes WILL be written to Sanity"}\n`);

  if (countrySlug) {
    await removeCountry(countrySlug);
  } else {
    await removeSingleCamp(campSlug);
  }

  heading("Summary");

  if (DRY) {
    log("This was a DRY RUN. No changes were made.");
    log("To execute, re-run with --confirm");
  } else {
    log("All changes applied successfully.");
    log("");
    log("REMINDER: You may also want to update these code files:");
    log("  - src/lib/data.ts (remove fallback camp/country entries)");
    log("  - src/pages/contact.astro (remove contact form option)");
    log("  - src/layouts/BaseLayout.astro (update meta description if needed)");
    log("  - src/components/sections/AboutSection.astro (update heading numbers)");
  }

  console.log();
}

main().catch((err) => {
  console.error("\nERROR:", err.message);
  process.exit(1);
});
