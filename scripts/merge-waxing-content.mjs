/**
 * Merge wax removal content from blog into the waxing-rewax lesson.
 * Expands the existing "How to Strip Wax" section with detailed removal techniques.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, "..", ".env"), "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i > 0) env[t.slice(0, i)] = t.slice(i + 1);
}

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

function key() {
  return randomBytes(6).toString("hex");
}

function heading(level, text) {
  return {
    _type: "block",
    _key: key(),
    style: `h${level}`,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function paragraph(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function boldParagraph(segments) {
  const markDefs = [];
  const children = segments.map((seg) => ({
    _type: "span",
    _key: key(),
    text: seg.text,
    marks: seg.bold ? ["strong"] : [],
  }));
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs,
    children,
  };
}

function bulletItem(text) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

async function main() {
  console.log("Fetching lesson...");
  const lesson = await client.fetch(
    `*[_type == "learnToSurfLesson" && slug.current == "waxing-rewax" && (language == "en" || !defined(language))][0]{ _id, body }`
  );

  if (!lesson) throw new Error("Lesson not found");
  console.log(`Lesson: ${lesson._id}, ${lesson.body.length} blocks`);

  // Find insertion point: after the current "How to Strip Wax" content, before "Wax Alternatives"
  const body = [...lesson.body];

  const waxAltIdx = body.findIndex(
    (b) =>
      b.style === "h2" &&
      b.children?.some((c) => c.text?.includes("Wax Alternatives"))
  );

  if (waxAltIdx === -1) throw new Error("Could not find 'Wax Alternatives' heading");
  console.log(`Inserting before "Wax Alternatives" at block index ${waxAltIdx}`);

  // New content blocks to insert
  const newBlocks = [
    heading(3, "The Sun-Melt Method"),
    paragraph(
      "On warm, sunny days the sun-melt method makes wax removal almost effortless. Place your board deck-up in direct sunlight for 15 to 20 minutes, allowing the wax to soften to a pliable consistency. In cooler climates or overcast conditions you may need a little longer. Be careful not to leave your board out for extended periods — excessive heat can damage the foam core."
    ),
    paragraph(
      "Once the wax is soft, use the flat edge of your wax comb to scrape from nose to tail in long, straight strokes. Avoid diagonal movements, which tend to spread wax around rather than lifting it off. Clean the comb with a paper towel between strokes to keep it effective."
    ),

    heading(3, "Deep Cleaning After Stripping"),
    paragraph(
      "Scraping off the bulk of the wax is just the first step. A thorough deep clean ensures your fresh coat adheres properly and performs well:"
    ),
    bulletItem("Start with the wax comb's straight edge to remove the softened bulk"),
    bulletItem("Switch to the comb's teeth to break up any remaining patches"),
    bulletItem("Use a plastic scraper or old credit card for stubborn spots"),
    bulletItem("Apply a small amount of coconut oil, wax remover, or mineral spirits to dissolve residual film"),
    bulletItem("Wipe down thoroughly with paper towels or a clean cloth"),
    bulletItem("Repeat the cleaning step if any tacky spots remain"),
    paragraph(
      "A properly cleaned board should feel completely smooth to the touch, with no sticky residue anywhere on the deck."
    ),

    heading(3, "Specialty Situations"),
    boldParagraph([
      { text: "Longboards: ", bold: true },
      { text: "The larger deck area means more time and effort. Break the job into sections — nose, middle, tail — and work through each methodically rather than trying to tackle the whole board at once." },
    ]),
    boldParagraph([
      { text: "Cold weather: ", bold: true },
      { text: "When temperatures drop below 15°C (60°F) and the sun is not strong enough to soften the wax, use a hair dryer on low heat instead. Keep the dryer moving constantly to avoid overheating any single area of the board." },
    ]),
    boldParagraph([
      { text: "Vintage or delicate boards: ", bold: true },
      { text: "Avoid metal scrapers on older boards with fragile finishes. Stick to plastic tools and gentle cleaning solutions like coconut oil to prevent surface damage." },
    ]),
    boldParagraph([
      { text: "Frequent changes (competition or travel): ", bold: true },
      { text: "If you rewax often — for competitions or when travelling between different water temperatures — develop a quick but thorough routine with quality tools. Having a dedicated wax removal kit saves time." },
    ]),

    heading(3, "Common Removal Mistakes"),
    bulletItem("Rushing the process — proper removal takes time, and shortcuts leave residue that undermines your new wax"),
    bulletItem("Using metal scrapers on boards with delicate finishes or thin glass jobs"),
    bulletItem("Leaving the board in the sun too long — the goal is to soften the wax, not cook the foam"),
    bulletItem("Scraping in random directions instead of consistent nose-to-tail strokes"),
    bulletItem("Skipping the cleaning step — wax residue left behind prevents the new base coat from bonding"),

    heading(3, "Environmental Disposal"),
    paragraph(
      "Old wax should not be left on the beach or thrown into general waste where it can end up in the ocean. Many surf shops collect used wax for recycling, turning it into new products or repurposing the paraffin. Choose biodegradable cleaning solutions when possible, and consider eco-friendly wax brands that use natural ingredients. Taking care of our equipment and the environment go hand in hand."
    ),
  ];

  // Insert new blocks before "Wax Alternatives"
  const updatedBody = [
    ...body.slice(0, waxAltIdx),
    ...newBlocks,
    ...body.slice(waxAltIdx),
  ];

  console.log(`Body: ${body.length} -> ${updatedBody.length} blocks (+${newBlocks.length})`);

  // Patch the document
  console.log("Patching lesson in Sanity...");
  await client.patch(lesson._id).set({ body: updatedBody }).commit();
  console.log("Done! Lesson updated successfully.");

  // Show what was added
  console.log("\nNew sections added before 'Wax Alternatives':");
  for (const b of newBlocks) {
    if (b.style?.startsWith("h")) {
      console.log(`  ${b.style}: ${b.children[0].text}`);
    }
  }
}

main().catch(console.error);
