/**
 * Merge board positioning, paddle technique, and advanced pop-up variations
 * from blog into the pop-up lesson.
 * - Board positioning + paddle technique: inserted BEFORE the step-by-step technique
 * - Advanced pop-up variations: inserted AFTER land-based exercises, BEFORE body type adaptations
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
    `*[_type == "learnToSurfLesson" && slug.current == "pop-up" && (language == "en" || !defined(language))][0]{ _id, body }`
  );
  if (!lesson) throw new Error("Lesson not found");
  console.log(`Lesson: ${lesson._id}, ${lesson.body.length} blocks`);

  const body = [...lesson.body];

  // Find insertion points
  const stepByStepIdx = body.findIndex(
    (b) => b.style === "h2" && b.children?.some((c) => c.text?.includes("Step-by-Step"))
  );
  const adaptingIdx = body.findIndex(
    (b) => b.style === "h2" && b.children?.some((c) => c.text?.includes("Adapting the Pop Up"))
  );

  if (stepByStepIdx === -1) throw new Error("Could not find step-by-step heading");
  if (adaptingIdx === -1) throw new Error("Could not find adapting heading");

  console.log(`Insert position A: before block ${stepByStepIdx} (step-by-step)`);
  console.log(`Insert position B: before block ${adaptingIdx} (adapting)`);

  // --- Block A: Board Positioning + Paddle Technique (before step-by-step) ---
  const preBlocks = [
    heading(2, "Before the Pop Up: Board Position and Paddling"),
    paragraph(
      "The pop up does not start with your hands — it starts well before you catch a wave. Your board position and paddle technique determine whether you are set up for a smooth pop up or fighting an uphill battle from the start."
    ),

    heading(3, "Finding Your Position on the Board"),
    paragraph(
      "Lie centred on your board with your chest aligned to the midpoint. You want the nose of the board sitting about two to three inches above the water line. If the nose is buried, you are too far forward and will nose-dive when a wave pushes you. If too much nose is exposed, you are too far back and the board will drag."
    ),
    bulletItem("Keep your feet together with your toes touching the tail of the board"),
    bulletItem("Arch your back slightly and lift your head to look toward the horizon — this helps you spot incoming waves and keeps weight distributed correctly"),
    bulletItem("Engage your core to hold this position without rocking side to side"),
    paragraph(
      "Think of your board position as building a stable launch pad. Every centimetre matters — even a small shift forward or back changes how the board responds when a wave arrives."
    ),

    heading(3, "Paddle Technique"),
    paragraph(
      "Effective paddling is what gets you into the wave. Without enough speed, the wave will pass under you and there is no pop up to perform."
    ),
    bulletItem("Use long, deep strokes — reach forward and pull the water all the way past your hips for maximum propulsion"),
    bulletItem("Keep your fingers together to create a larger surface area with each stroke"),
    bulletItem("Alternate arms in a steady, rhythmic pattern to maintain speed and direction"),
    bulletItem("As you feel the wave begin to lift your board, accelerate your paddling to match the wave's speed — this is the moment that commits you to the wave"),
    bulletItem("Keep your eyes up and looking in the direction you want to go, not down at the water"),
    paragraph(
      "Once you feel the wave take over and the board starts to glide on its own, that is your signal to initiate the pop up. The transition from paddling to popping up should feel like one continuous movement, not two separate actions."
    ),
  ];

  // --- Block B: Advanced Pop-Up Variations (before adapting) ---
  const advBlocks = [
    heading(2, "Advanced Pop Up Variations"),
    paragraph(
      "Once the basic pop up feels automatic in small whitewater, you can start exploring variations that open up different types of waves and riding styles."
    ),

    heading(3, "The Shortboard Pop Up"),
    paragraph(
      "On a shortboard, the pop up needs to be faster and more explosive because the wave face is steeper and the window is shorter. The mechanics are the same, but the movement is compressed into a single explosive burst rather than a measured sequence. You press and jump in one motion, with your feet landing simultaneously rather than back foot first."
    ),

    heading(3, "The Cross-Step Pop Up"),
    paragraph(
      "Used primarily in longboarding, the cross-step pop up involves stepping forward on the board rather than jumping to your feet. After pressing up, you step your back foot forward first, then walk into position. This suits the slower, more flowing pace of longboard surfing and gives you more control on mellow waves."
    ),

    heading(3, "The Angled Pop Up"),
    paragraph(
      "When the wave is steep or you need to immediately turn upon standing, you can angle your body during the pop up so that you land facing the direction you want to ride rather than straight ahead. Pop up with your shoulders and hips already rotated toward the wave face. This shaves a critical half-second off your first turn and prevents getting caught behind the whitewater."
    ),

    paragraph(
      "None of these variations replace the fundamentals covered above — they build on them. Nail the basic pop up on a foamie in small waves before experimenting with these."
    ),
  ];

  // Build the updated body
  // Insert preBlocks before stepByStepIdx, advBlocks before adaptingIdx (adjusted for preBlocks insertion)
  const updatedBody = [
    ...body.slice(0, stepByStepIdx),
    ...preBlocks,
    ...body.slice(stepByStepIdx, adaptingIdx),
    ...advBlocks,
    ...body.slice(adaptingIdx),
  ];

  console.log(`Body: ${body.length} -> ${updatedBody.length} blocks (+${preBlocks.length + advBlocks.length})`);

  console.log("Patching lesson in Sanity...");
  await client.patch(lesson._id).set({ body: updatedBody }).commit();
  console.log("Done! Lesson updated successfully.");

  console.log("\nNew sections added:");
  console.log("Before step-by-step:");
  for (const b of preBlocks) {
    if (b.style?.startsWith("h")) console.log(`  ${b.style}: ${b.children[0].text}`);
  }
  console.log("Before adapting:");
  for (const b of advBlocks) {
    if (b.style?.startsWith("h")) console.log(`  ${b.style}: ${b.children[0].text}`);
  }
}

main().catch(console.error);
