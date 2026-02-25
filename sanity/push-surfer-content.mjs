/**
 * Pushes Surfer SEO markdown content to the Bali country page in Sanity.
 * Run: node sanity/push-surfer-content.mjs
 */

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || "ypmt1bmc";
const DATASET = process.env.PUBLIC_SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const DOC_ID = "country-bali";

let keyCounter = 0;
function k(prefix = "k") {
  return `${prefix}${++keyCounter}`;
}

// --- Inline markdown → Portable Text spans ---
function parseInline(text) {
  const spans = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) {
      spans.push({ _key: k("s"), _type: "span", text: text.slice(last, m.index), marks: [] });
    }
    if (m[1]) {
      spans.push({ _key: k("s"), _type: "span", text: m[1], marks: ["strong"] });
    } else if (m[2]) {
      spans.push({ _key: k("s"), _type: "span", text: m[2], marks: ["em"] });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    spans.push({ _key: k("s"), _type: "span", text: text.slice(last), marks: [] });
  }
  if (spans.length === 0) {
    spans.push({ _key: k("s"), _type: "span", text, marks: [] });
  }
  return spans;
}

function makeBlock(text, style = "normal", listItem = null) {
  const b = {
    _key: k("b"),
    _type: "block",
    children: parseInline(text),
    markDefs: [],
    style,
  };
  if (listItem) {
    b.listItem = listItem;
    b.level = 1;
  }
  return b;
}

// --- Parse a markdown section's body lines into Portable Text blocks ---
function parseBody(lines) {
  const blocks = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("![")) continue; // skip image placeholders

    if (line.startsWith("### ")) {
      blocks.push(makeBlock(line.slice(4), "h3"));
    } else if (line.startsWith("* ")) {
      blocks.push(makeBlock(line.slice(2), "normal", "bullet"));
    } else if (line.startsWith("- ")) {
      blocks.push(makeBlock(line.slice(2), "normal", "bullet"));
    } else {
      blocks.push(makeBlock(line));
    }
  }
  return blocks;
}

// --- Split the full markdown into H2 sections ---
function splitByH2(md) {
  const lines = md.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      // Lines before first H2 → intro section
      if (!sections._intro) sections._intro = [];
      (sections._intro = sections._intro || []).push(line);
    }
  }
  if (current) sections.push(current);
  return sections;
}

// --- Build surf spots from the markdown section ---
function buildSurfSpots(section) {
  const spots = [];
  let currentSpot = null;

  for (const raw of section.lines) {
    const line = raw.trim();
    if (!line || line.startsWith("![")) continue;

    if (line.startsWith("### ")) {
      if (currentSpot) spots.push(currentSpot);
      currentSpot = { _key: k("sp"), name: line.slice(4), level: "", type: "", desc: "" };
    } else if (currentSpot && line.startsWith("* ")) {
      const item = line.slice(2).replace(/^\*\*/, "").replace(/\*\*/, "");
      const [label, ...rest] = item.split(":");
      const value = rest.join(":").trim();
      const key = label.trim().toLowerCase();
      if (key === "level") currentSpot.level = value;
      else if (key === "type") currentSpot.type = value;
      else if (key === "best time") currentSpot.desc += `Best time: ${value}. `;
      else if (key === "highlight") currentSpot.desc += value;
    } else if (!line.startsWith("### ") && !currentSpot) {
      // Subtext before any H3 spot
      section._subtext = (section._subtext || "") + line + " ";
    }
  }
  if (currentSpot) spots.push(currentSpot);

  return {
    _key: k("ss"),
    _type: "surfSpots",
    heading: section.heading,
    subtext: (section._subtext || "").trim(),
    surfSpots: spots,
    background: "dark",
  };
}

// --- Build FAQ section ---
function buildFaq(section) {
  const faqs = [];
  let currentQ = null;

  for (const raw of section.lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("### ")) {
      if (currentQ) faqs.push(currentQ);
      currentQ = { _key: k("fq"), question: line.slice(4).trim(), answer: "" };
    } else if (currentQ) {
      currentQ.answer += (currentQ.answer ? " " : "") + line;
    }
  }
  if (currentQ) faqs.push(currentQ);

  return {
    _key: k("faq"),
    _type: "faqSection",
    heading: "FAQs",
    faqs,
  };
}

// --- Build CTA section ---
function buildCta(section) {
  const bodyLines = section.lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("![") && !l.startsWith("* ") && !l.startsWith("- "));

  const bullets = section.lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith("* ") || l.startsWith("- "))
    .map((l) => l.replace(/^\*\s+|^-\s+/, "").replace(/\*\*/g, ""));

  const text = [...bodyLines, ...bullets].join(" ").trim();

  return {
    _key: k("cta"),
    _type: "ctaSection",
    heading: section.heading,
    text: text.slice(0, 500),
    buttonText: "Book Now",
  };
}

// --- Build a contentBlock ---
function buildContentBlock(section, bg, reverse) {
  return {
    _key: k("cb"),
    _type: "contentBlock",
    label: section.heading,
    heading: section.heading,
    body: parseBody(section.lines),
    background: bg,
    reverse,
  };
}

// --- Main ---
import { readFileSync } from "fs";

const mdPath = process.argv[2];
if (!mdPath) {
  console.error("Usage: node sanity/push-surfer-content.mjs <path-to-markdown>");
  process.exit(1);
}

const md = readFileSync(mdPath, "utf-8");

// Extract intro (text between H1 and first H2)
const introMatch = md.match(/^#\s+.+\n+(?:!\[.+\]\(.*\)\n+)?([\s\S]*?)(?=\n## )/);
const introText = introMatch ? introMatch[1].trim() : "";

const sections = splitByH2(md);

// Map each section to the appropriate block type
const pageBuilder = [];
let blockIndex = 0;

for (const section of sections) {
  const h = section.heading.toLowerCase();

  if (h.startsWith("faq")) {
    pageBuilder.push(buildFaq(section));
  } else if (h.includes("best surf spots") || h.includes("surf spots around")) {
    pageBuilder.push(buildSurfSpots(section));
  } else if (h.startsWith("ready to")) {
    pageBuilder.push(buildCta(section));
  } else {
    const bg = blockIndex % 2 === 0 ? "dark" : "dark-lighter";
    const reverse = blockIndex % 2 === 1;
    pageBuilder.push(buildContentBlock(section, bg, reverse));
    blockIndex++;
  }
}

console.log(`\nParsed ${sections.length} sections → ${pageBuilder.length} blocks:`);
pageBuilder.forEach((b, i) => {
  const label = b.heading || b._type;
  const type = b._type;
  const extra =
    type === "faqSection"
      ? ` (${b.faqs.length} questions)`
      : type === "surfSpots"
        ? ` (${b.spots.length} spots)`
        : type === "contentBlock"
          ? ` [${b.background}${b.reverse ? ", reversed" : ""}]`
          : "";
  console.log(`  ${i + 1}. ${type}: "${label}"${extra}`);
});

// Build the Sanity mutation
const mutations = [
  {
    patch: {
      id: DOC_ID,
      set: {
        intro: introText,
        pageBuilder,
      },
    },
  },
];

console.log(`\nPushing to Sanity (${DOC_ID})...`);

const res = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  }
);

const result = await res.json();

if (res.ok) {
  console.log("Done! Updated successfully.");
  console.log(`  Transaction: ${result.transactionId}`);
} else {
  console.error("Failed:", JSON.stringify(result, null, 2));
  process.exit(1);
}
