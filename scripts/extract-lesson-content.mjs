/**
 * Extract lesson content from subagent transcript JSONL files.
 * Reads the last assistant message from each subagent, extracts JSON
 * from markdown code blocks, and compiles into a single content file.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const TRANSCRIPTS_DIR =
  "/Users/simonsway/.cursor/projects/Users-simonsway-Data-Projects-www-rapturecamps-com/agent-transcripts/2677070d-5bc2-4b9d-b574-c2d247ed6c6f/subagents";
const OUTPUT_DIR = join(import.meta.dirname, "content");

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(TRANSCRIPTS_DIR).filter((f) => f.endsWith(".jsonl"));
console.log(`Found ${files.length} subagent transcript files`);

const allLessons = [];

for (const file of files) {
  const filePath = join(TRANSCRIPTS_DIR, file);
  const lines = readFileSync(filePath, "utf-8").trim().split("\n");

  // Find the last assistant message
  let lastAssistantLine = null;
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed.role === "assistant") {
        lastAssistantLine = parsed;
        break;
      }
    } catch (e) {
      continue;
    }
  }

  if (!lastAssistantLine) {
    console.log(`  Skipping ${file} — no assistant message found`);
    continue;
  }

  // Extract text content
  const content = lastAssistantLine.message?.content;
  if (!content) continue;

  let textContent = "";
  if (typeof content === "string") {
    textContent = content;
  } else if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === "text" && block.text) {
        textContent += block.text;
      }
    }
  }

  if (!textContent) {
    console.log(`  Skipping ${file} — no text content`);
    continue;
  }

  // Extract JSON from markdown code blocks
  const jsonBlocks = [];
  const codeBlockRegex = /```json\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(textContent)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        jsonBlocks.push(...parsed);
      } else if (parsed && parsed.slug) {
        jsonBlocks.push(parsed);
      }
    } catch (e) {
      console.log(`  Warning: Failed to parse JSON in ${file}: ${e.message}`);
    }
  }

  if (jsonBlocks.length > 0) {
    console.log(
      `  ${file}: extracted ${jsonBlocks.length} lesson(s) — ${jsonBlocks.map((l) => l.slug).join(", ")}`
    );
    allLessons.push(...jsonBlocks);
  } else {
    console.log(`  ${file}: no lesson JSON found`);
  }
}

// Filter to only surf-fundamentals lessons
const surfFundamentals = allLessons.filter(
  (l) => l.clusterSlug === "surf-fundamentals"
);

// Sort by order
surfFundamentals.sort((a, b) => (a.order || 0) - (b.order || 0));

console.log(
  `\nTotal surf-fundamentals lessons: ${surfFundamentals.length}`
);
console.log("Lessons:", surfFundamentals.map((l) => `${l.order}. ${l.slug}`).join(", "));

// Build the cluster data
const clusterData = {
  cluster: {
    title: "Surf Fundamentals",
    slug: "surf-fundamentals",
    description:
      "Master the essential building blocks of surfing — from your first pop up and finding your natural stance, to balance, board control, and safe falling technique. These fundamentals form the foundation for every skill you will learn in the water.",
    icon: "waves",
    order: 1,
    heroTitle: "Surf Fundamentals",
    heroSubtitle:
      "Build the foundation every surfer needs — technique, balance, and confidence in the water",
    heroTagline: "Learn to Surf",
    seo: {
      metaTitle: "Surf Fundamentals: Essential Skills for Beginner Surfers · Rapture",
      metaDescription:
        "Learn the fundamental surfing skills: pop up technique, stance, balance, board control, and safe falling. Step-by-step guides from ISA-certified coaches at Rapture Surfcamps.",
    },
  },
  lessons: surfFundamentals,
};

const outputPath = join(OUTPUT_DIR, "surf-fundamentals.json");
writeFileSync(outputPath, JSON.stringify(clusterData, null, 2));
console.log(`\nWritten to: ${outputPath}`);
