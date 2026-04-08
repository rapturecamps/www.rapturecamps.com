/**
 * Merge tides, swell forecasting, and riding positioning tips from blog
 * into the reading-waves lesson.
 * Inserted after "Closeouts" and before "Practical Exercises for Better Wave Reading".
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
  return { _type: "block", _key: key(), style: `h${level}`, markDefs: [], children: [{ _type: "span", _key: key(), text, marks: [] }] };
}
function paragraph(text) {
  return { _type: "block", _key: key(), style: "normal", markDefs: [], children: [{ _type: "span", _key: key(), text, marks: [] }] };
}
function bulletItem(text) {
  return { _type: "block", _key: key(), style: "normal", listItem: "bullet", level: 1, markDefs: [], children: [{ _type: "span", _key: key(), text, marks: [] }] };
}
function richParagraph(segments) {
  return {
    _type: "block", _key: key(), style: "normal", markDefs: [],
    children: segments.map((seg) => ({ _type: "span", _key: key(), text: seg.text, marks: seg.bold ? ["strong"] : seg.italic ? ["em"] : [] })),
  };
}

async function main() {
  console.log("Fetching lesson...");
  const lesson = await client.fetch(
    `*[_type == "learnToSurfLesson" && slug.current == "reading-waves" && (language == "en" || !defined(language))][0]{ _id, body }`
  );
  if (!lesson) throw new Error("Lesson not found");
  console.log(`Lesson: ${lesson._id}, ${lesson.body.length} blocks`);

  const body = [...lesson.body];

  // Insert before "Practical Exercises for Better Wave Reading"
  const practicalIdx = body.findIndex(
    (b) => b.style === "h2" && b.children?.some((c) => c.text?.includes("Practical Exercises"))
  );
  if (practicalIdx === -1) throw new Error("Could not find 'Practical Exercises' heading");
  console.log(`Inserting before "Practical Exercises" at block index ${practicalIdx}`);

  const newBlocks = [
    heading(2, "Tides and How They Affect Waves"),
    paragraph(
      "The gravitational pull of the moon and sun creates the daily rhythm of tides. As the Earth rotates, the moon's gravity draws water into bulges — one facing the moon, one on the opposite side — producing the cycle of high and low tides that every coastal surfer learns to respect."
    ),
    paragraph(
      "Tides directly affect where and how waves break at any given spot:"
    ),
    richParagraph([
      { text: "High tide ", bold: true },
      { text: "increases the water depth over reefs and sandbars. Waves may break closer to shore and tend to be softer and less hollow, because the extra water cushions the interaction between the swell and the bottom." },
    ]),
    richParagraph([
      { text: "Low tide ", bold: true },
      { text: "exposes more of the reef or sandbar, causing waves to break further out, more abruptly, and often more powerfully. Some spots become dangerously shallow at low tide, with rocks or coral close to the surface." },
    ]),
    richParagraph([
      { text: "Mid-tide (incoming) ", bold: true },
      { text: "is often the sweet spot at many breaks. The water is deep enough to avoid hazards but shallow enough that the bottom still shapes the wave into a clean, rideable face." },
    ]),
    paragraph(
      "Every surf spot has its own relationship with the tide. Some breaks only work at high tide, others only at low. Learning your local break's tidal preferences — through observation, talking to locals, or checking tide charts alongside surf reports — is one of the fastest ways to improve your wave count."
    ),

    heading(2, "Reading Swell Forecasts"),
    paragraph(
      "Before you even reach the beach, a surf forecast gives you a preview of what the ocean is doing. Two numbers matter most: swell height and swell period."
    ),

    heading(3, "Swell Height"),
    paragraph(
      "Swell height measures the size of the incoming waves, typically in feet or metres. Larger swell heights generally produce more powerful waves. However, swell height alone does not tell you the full story — a two-metre swell with a long period can produce better waves than a three-metre swell with a short period."
    ),

    heading(3, "Swell Period"),
    paragraph(
      "Swell period is the time interval between successive waves, measured in seconds. It is arguably more important than swell height for judging wave quality:"
    ),
    bulletItem("Short periods (under 8 seconds) typically produce choppy, disorganised waves that are harder to read and ride"),
    bulletItem("Medium periods (8 to 12 seconds) produce decent, surfable conditions at most breaks"),
    bulletItem("Long periods (over 14 seconds) indicate powerful groundswell energy that has travelled a great distance — these swells produce the cleanest, most well-defined waves with clear sets and lulls"),
    paragraph(
      "When checking a forecast, look at both numbers together. A 1.5-metre swell at 15 seconds will likely produce better surf than a 2-metre swell at 7 seconds. Over time, you will develop a feel for which swell height and period combinations work best at your local break."
    ),

    heading(3, "Swell Direction"),
    paragraph(
      "The direction a swell comes from determines which coastlines and specific breaks it hits. A south-west swell might light up one side of a headland while leaving the other side flat. Surf forecasts show swell direction as a compass bearing — match this against your break's orientation to predict whether the swell will reach it."
    ),

    heading(2, "Positioning Yourself on Different Wave Types"),
    paragraph(
      "Understanding wave types is only useful if you know where to position yourself to ride them. Here are practical positioning tips for common wave types:"
    ),
    richParagraph([
      { text: "Right-hand waves: ", bold: true },
      { text: "Position yourself slightly to the left of where the wave is peaking. As the wave breaks from left to right (from the surfer's perspective), dropping in from this position puts you ahead of the breaking section with a clean face to ride." },
    ]),
    richParagraph([
      { text: "Left-hand waves: ", bold: true },
      { text: "Mirror the approach — sit slightly to the right of the peak. Goofy-footed surfers often prefer lefts because they can ride frontside, facing the wave for better control." },
    ]),
    richParagraph([
      { text: "A-frames: ", bold: true },
      { text: "These peaks break in both directions simultaneously. You can choose to go left or right. Communication matters here — call your direction or make eye contact with other surfers to avoid two people taking the same wave in opposite directions and colliding." },
    ]),
    paragraph(
      "Positioning is dynamic, not static. You should be making constant micro-adjustments based on what you see: how far apart sets are arriving, whether the peak is shifting, and how the tide is changing the break throughout your session. Use landmarks on the beach — a lifeguard tower, a rock, a building — as reference points to track your position relative to where good waves are breaking."
    ),
  ];

  const updatedBody = [
    ...body.slice(0, practicalIdx),
    ...newBlocks,
    ...body.slice(practicalIdx),
  ];

  console.log(`Body: ${body.length} -> ${updatedBody.length} blocks (+${newBlocks.length})`);

  console.log("Patching lesson in Sanity...");
  await client.patch(lesson._id).set({ body: updatedBody }).commit();
  console.log("Done! Lesson updated successfully.");

  console.log("\nNew sections added before 'Practical Exercises':");
  for (const b of newBlocks) {
    if (b.style?.startsWith("h")) console.log(`  ${b.style}: ${b.children[0].text}`);
  }
}

main().catch(console.error);
