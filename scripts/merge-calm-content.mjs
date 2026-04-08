/**
 * Merge diving reflex science from blog into the staying-calm-underwater lesson.
 * Adds a new section on the physiology behind underwater calm, placed after
 * "Why Panic Happens" and before "The Ragdoll Technique".
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

function richParagraph(segments) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: segments.map((seg) => ({
      _type: "span",
      _key: key(),
      text: seg.text,
      marks: seg.bold ? ["strong"] : seg.italic ? ["em"] : [],
    })),
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
    `*[_type == "learnToSurfLesson" && slug.current == "staying-calm-underwater" && (language == "en" || !defined(language))][0]{ _id, body }`
  );

  if (!lesson) throw new Error("Lesson not found");
  console.log(`Lesson: ${lesson._id}, ${lesson.body.length} blocks`);

  const body = [...lesson.body];

  // Insert before "The Ragdoll Technique" (h2)
  const ragdollIdx = body.findIndex(
    (b) =>
      b.style === "h2" &&
      b.children?.some((c) => c.text?.includes("Ragdoll Technique"))
  );

  if (ragdollIdx === -1) throw new Error("Could not find 'The Ragdoll Technique' heading");
  console.log(`Inserting before "The Ragdoll Technique" at block index ${ragdollIdx}`);

  const newBlocks = [
    heading(2, "Your Body's Built-In Survival Response"),
    paragraph(
      "Before we get into techniques, it helps to understand something remarkable: your body already has a built-in mechanism for surviving underwater. It is called the mammalian diving reflex, and it activates automatically when your face is submerged in water."
    ),

    heading(3, "What the Diving Reflex Does"),
    paragraph(
      "The moment cold water contacts your face, sensory receptors trigger the trigeminal nerve, which sends a signal to your brainstem. This kicks off a chain of physiological changes designed to conserve oxygen:"
    ),
    richParagraph([
      { text: "Bradycardia: ", bold: true },
      { text: "Your heart rate slows significantly, reducing the body's overall oxygen demand. In extreme cases, heart rates have been recorded as low as 5.6 beats per minute — though during a typical surf hold-down the effect is more modest but still meaningful." },
    ]),
    richParagraph([
      { text: "Peripheral vasoconstriction: ", bold: true },
      { text: "Blood vessels in your arms, legs, and skin constrict, redirecting blood flow toward your brain and heart. Your body is prioritising the organs that matter most." },
    ]),
    richParagraph([
      { text: "Oxygen conservation: ", bold: true },
      { text: "With a slower heart rate and reduced blood flow to the extremities, your available oxygen lasts longer. Your body is buying you time — more time than you probably realise." },
    ]),
    paragraph(
      "This reflex is strongest when your face is submerged in cold water while holding your breath — exactly the situation you find yourself in during a wipeout. In other words, the very conditions that trigger panic are also the conditions that activate your body's oxygen-saving mode."
    ),

    heading(3, "Why This Matters for the Techniques Below"),
    paragraph(
      "Understanding the diving reflex gives scientific backing to the techniques covered in this lesson. When you ragdoll and go limp, you are not just reducing muscular oxygen burn — you are also allowing the diving reflex to work without interference. When you count or focus on a mantra instead of panicking, you are keeping your heart rate closer to the bradycardic state rather than spiking it with a stress response. The calmer you stay, the more effectively your body conserves oxygen on its own."
    ),

    heading(3, "Training the Reflex"),
    paragraph(
      "While the diving reflex is automatic, you can strengthen your comfort with it through deliberate practice:"
    ),
    bulletItem("Cold water facial immersion — fill a basin with cold water and submerge your face for 15 to 30 seconds while holding your breath. This triggers the reflex in a controlled, safe environment and helps you recognise the sensation of your heart rate dropping."),
    bulletItem("Breath-hold exercises — practise holding your breath while sitting still to increase your CO2 tolerance. Over time, you will notice the urge to breathe arrives later and feels less urgent."),
    bulletItem("Gradual cold water exposure — regular exposure to cold water (cold showers, ocean swims) reduces the initial shock response and allows the diving reflex to activate more smoothly."),
    paragraph(
      "None of these replace the pool and ocean drills covered later in this lesson, but they build a physiological foundation that makes every other technique more effective."
    ),
  ];

  const updatedBody = [
    ...body.slice(0, ragdollIdx),
    ...newBlocks,
    ...body.slice(ragdollIdx),
  ];

  console.log(`Body: ${body.length} -> ${updatedBody.length} blocks (+${newBlocks.length})`);

  console.log("Patching lesson in Sanity...");
  await client.patch(lesson._id).set({ body: updatedBody }).commit();
  console.log("Done! Lesson updated successfully.");

  console.log("\nNew sections added before 'The Ragdoll Technique':");
  for (const b of newBlocks) {
    if (b.style?.startsWith("h")) {
      console.log(`  ${b.style}: ${b.children[0].text}`);
    }
  }
}

main().catch(console.error);
