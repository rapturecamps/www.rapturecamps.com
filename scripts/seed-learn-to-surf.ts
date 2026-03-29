/**
 * Sanity content seeder for Learn to Surf hub.
 *
 * Usage:
 *   npx tsx scripts/seed-learn-to-surf.ts [--dry-run] [--cluster <slug>]
 *
 * Reads JSON content files from scripts/content/ and creates/updates
 * Sanity documents via the mutation API.
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_TOKEN env vars
 * (or uses defaults from the codebase).
 */

import { createClient } from "@sanity/client";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ID = process.env.SANITY_PROJECT_ID || "ypmt1bmc";
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_TOKEN;
const API_VERSION = "2024-01-01";
const DRY_RUN = process.argv.includes("--dry-run");
const CLUSTER_FILTER = process.argv.includes("--cluster")
  ? process.argv[process.argv.indexOf("--cluster") + 1]
  : null;

if (!TOKEN && !DRY_RUN) {
  console.error(
    "Error: SANITY_TOKEN is required unless --dry-run is specified."
  );
  console.error(
    "Create a token at https://www.sanity.io/manage/project/ypmt1bmc/api"
  );
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  token: TOKEN,
  apiVersion: API_VERSION,
  useCdn: false,
});

interface ClusterData {
  title: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  heroTitle?: string;
  heroSubtitle?: string;
  heroTagline?: string;
  lmsCourseUrl?: string;
  seo?: { metaTitle: string; metaDescription: string };
}

interface LessonData {
  title: string;
  slug: string;
  clusterSlug: string;
  difficulty: string;
  readTime: string;
  excerpt: string;
  order: number;
  keyTakeaways: string[];
  seo: { metaTitle: string; metaDescription: string };
  body: string;
}

// ─── Markdown → Portable Text converter ─────────────────────────────────────

function generateKey(): string {
  return Math.random().toString(36).slice(2, 14);
}

function parseInlineMarkdown(text: string): any {
  const children: any[] = [];

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const parts: { text: string; marks: string[] }[] = [];
  const annotations: any[] = [];

  linkRegex.lastIndex = 0;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), marks: [] });
    }
    const linkKey = generateKey();
    annotations.push({
      _key: linkKey,
      _type: "link",
      href: match[2],
      blank: match[2].startsWith("http"),
    });
    parts.push({ text: match[1], marks: [linkKey] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), marks: [] });
  }

  for (const part of parts) {
    const boldParts = part.text.split(/\*\*([^*]+)\*\*/g);
    for (let j = 0; j < boldParts.length; j++) {
      if (j % 2 === 0) {
        if (boldParts[j]) {
          children.push({
            _type: "span",
            _key: generateKey(),
            text: boldParts[j],
            marks: part.marks,
          });
        }
      } else {
        children.push({
          _type: "span",
          _key: generateKey(),
          text: boldParts[j],
          marks: [...part.marks, "strong"],
        });
      }
    }
  }

  if (children.length === 0) {
    children.push({ _type: "span", _key: generateKey(), text: "", marks: [] });
  }

  return { children, markDefs: annotations };
}

/**
 * Collect lines from a custom block annotation that may span multiple lines.
 * Starts at the line containing the opening `[blockType:` and reads until
 * the closing `]]` is found.
 */
function collectBlockLines(lines: string[], startIdx: number): { raw: string; endIdx: number } {
  const collected: string[] = [];
  let idx = startIdx;
  let depth = 0;
  while (idx < lines.length) {
    const line = lines[idx];
    collected.push(line);
    for (const ch of line) {
      if (ch === "[") depth++;
      if (ch === "]") depth--;
    }
    if (depth <= 0) break;
    idx++;
  }
  return { raw: collected.join("\n"), endIdx: idx };
}

function parseQuotedValue(raw: string): string {
  const m = raw.match(/^"([\s\S]*)"$/);
  return m ? m[1].replace(/\\"/g, '"') : raw;
}

function parseSurfTip(raw: string): any | null {
  const typeM = raw.match(/type="([^"]+)"/);
  const titleM = raw.match(/title="([^"]+)"/);
  const contentM = raw.match(/content="([\s\S]+?)"\s*\]/);
  if (!contentM) return null;
  return {
    _type: "surfTip",
    _key: generateKey(),
    tipType: typeM?.[1] || "tip",
    title: titleM?.[1] || "",
    content: contentM[1],
  };
}

function parseSurfExercise(raw: string): any | null {
  const titleM = raw.match(/title="([^"]+)"/);
  const descM = raw.match(/description="([^"]+)"/);
  const durationM = raw.match(/duration="([^"]+)"/);

  const equipM = raw.match(/equipment=\[([^\]]*)\]/);
  const equipment = equipM
    ? equipM[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || []
    : [];

  const stepsM = raw.match(/steps=\[([^\]]*)\]/);
  const steps = stepsM
    ? stepsM[1].match(/"([^"]+)"/g)?.map((s) => s.replace(/"/g, "")) || []
    : [];

  return {
    _type: "surfExercise",
    _key: generateKey(),
    title: titleM?.[1] || "Exercise",
    description: descM?.[1] || "",
    duration: durationM?.[1] || "",
    equipment,
    steps,
  };
}

function parseLessonStep(raw: string): any | null {
  const headingM = raw.match(/heading="([^"]+)"/);
  const stepsMatch = raw.match(/steps=\[\s*([\s\S]*)\s*\]\]/);
  if (!stepsMatch) return null;

  let steps: any[] = [];
  try {
    const stepsJson = "[" + stepsMatch[1].trim().replace(/,\s*$/, "") + "]";
    const parsed = JSON.parse(stepsJson);
    steps = parsed.map((s: any) => ({
      _key: generateKey(),
      title: s.title || "",
      description: s.description || "",
      tips: s.tips || [],
    }));
  } catch {
    return null;
  }

  return {
    _type: "lessonStep",
    _key: generateKey(),
    heading: headingM?.[1] || "",
    steps,
  };
}

function parseSurfMistake(raw: string): any | null {
  const headingM = raw.match(/heading="([^"]+)"/);
  const mistakesMatch = raw.match(/mistakes=\[\s*([\s\S]*)\s*\]\]/);
  if (!mistakesMatch) return null;

  let mistakes: any[] = [];
  try {
    const json = "[" + mistakesMatch[1].trim().replace(/,\s*$/, "") + "]";
    const parsed = JSON.parse(json);
    mistakes = parsed.map((m: any) => ({
      _key: generateKey(),
      mistake: m.mistake || "",
      correction: m.correction || "",
    }));
  } catch {
    return null;
  }

  return {
    _type: "surfMistake",
    _key: generateKey(),
    heading: headingM?.[1] || "",
    mistakes,
  };
}

function markdownToPortableText(md: string): any[] {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let i = 0;
  let paragraphBuffer: string[] = [];

  function flushParagraph(): void {
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];
    if (!text) return;
    const { children, markDefs } = parseInlineMarkdown(text);
    blocks.push({
      _type: "block",
      _key: generateKey(),
      style: "normal",
      markDefs,
      children,
    });
  }

  while (i < lines.length) {
    const line = lines[i];

    // Custom block: surfTip (always single-line)
    if (line.trimStart().startsWith("[surfTip:")) {
      flushParagraph();
      const { raw, endIdx } = collectBlockLines(lines, i);
      const block = parseSurfTip(raw);
      if (block) blocks.push(block);
      i = endIdx + 1;
      continue;
    }

    // Custom block: surfExercise (single-line)
    if (line.trimStart().startsWith("[surfExercise:")) {
      flushParagraph();
      const { raw, endIdx } = collectBlockLines(lines, i);
      const block = parseSurfExercise(raw);
      if (block) blocks.push(block);
      i = endIdx + 1;
      continue;
    }

    // Custom block: lessonStep (multi-line)
    if (line.trimStart().startsWith("[lessonStep:")) {
      flushParagraph();
      const { raw, endIdx } = collectBlockLines(lines, i);
      const block = parseLessonStep(raw);
      if (block) blocks.push(block);
      i = endIdx + 1;
      continue;
    }

    // Custom block: surfMistake (multi-line)
    if (line.trimStart().startsWith("[surfMistake:")) {
      flushParagraph();
      const { raw, endIdx } = collectBlockLines(lines, i);
      const block = parseSurfMistake(raw);
      if (block) blocks.push(block);
      i = endIdx + 1;
      continue;
    }

    // Headings
    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);
    const h4Match = line.match(/^#### (.+)/);

    if (h2Match || h3Match || h4Match) {
      flushParagraph();
      const text = (h2Match || h3Match || h4Match)![1];
      const style = h2Match ? "h2" : h3Match ? "h3" : "h4";
      const { children, markDefs } = parseInlineMarkdown(text);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style,
        markDefs,
        children,
      });
      i++;
      continue;
    }

    // Unordered list items
    if (line.match(/^[-*] /)) {
      flushParagraph();
      const text = line.replace(/^[-*] /, "").trim();
      const { children, markDefs } = parseInlineMarkdown(text);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "normal",
        listItem: "bullet",
        level: 1,
        markDefs,
        children,
      });
      i++;
      continue;
    }

    // Ordered list items
    if (line.match(/^\d+\.\s/)) {
      flushParagraph();
      const text = line.replace(/^\d+\.\s/, "").trim();
      const { children, markDefs } = parseInlineMarkdown(text);
      blocks.push({
        _type: "block",
        _key: generateKey(),
        style: "normal",
        listItem: "number",
        level: 1,
        markDefs,
        children,
      });
      i++;
      continue;
    }

    // Empty line = paragraph break
    if (!line.trim()) {
      flushParagraph();
      i++;
      continue;
    }

    // Regular text
    paragraphBuffer.push(line);
    i++;
  }

  flushParagraph();
  return blocks;
}

// ─── Document creation ─────────────────────────────────────────────────────

function createClusterDoc(cluster: ClusterData) {
  const docId = `learnToSurfCluster-en-${cluster.slug}`;
  return {
    createOrReplace: {
      _id: docId,
      _type: "learnToSurfCluster",
      language: "en",
      title: cluster.title,
      slug: { _type: "slug", current: cluster.slug },
      description: cluster.description,
      icon: cluster.icon,
      order: cluster.order,
      heroTitle: cluster.heroTitle || cluster.title,
      heroSubtitle: cluster.heroSubtitle || cluster.description,
      heroTagline: cluster.heroTagline || "Learn to Surf",
      lmsCourseUrl: cluster.lmsCourseUrl || undefined,
      seo: cluster.seo
        ? {
            _type: "seo",
            metaTitle: cluster.seo.metaTitle,
            metaDescription: cluster.seo.metaDescription,
          }
        : undefined,
    },
  };
}

function createLessonDoc(lesson: LessonData, clusterDocId: string) {
  const docId = `learnToSurfLesson-en-${lesson.clusterSlug}-${lesson.slug}`;
  const body = markdownToPortableText(lesson.body);

  return {
    createOrReplace: {
      _id: docId,
      _type: "learnToSurfLesson",
      language: "en",
      title: lesson.title,
      slug: { _type: "slug", current: lesson.slug },
      cluster: { _type: "reference", _ref: clusterDocId },
      excerpt: lesson.excerpt,
      difficulty: lesson.difficulty,
      readTime: lesson.readTime,
      keyTakeaways: lesson.keyTakeaways,
      order: lesson.order,
      body,
      seo: {
        _type: "seo",
        metaTitle: lesson.seo.metaTitle,
        metaDescription: lesson.seo.metaDescription,
      },
    },
  };
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const contentDir = join(__dirname, "content");
  if (!existsSync(contentDir)) {
    console.error(`Content directory not found: ${contentDir}`);
    process.exit(1);
  }

  const files = readdirSync(contentDir).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} content file(s)`);

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(contentDir, file), "utf-8"));
    const cluster: ClusterData = data.cluster;
    const lessons: LessonData[] = data.lessons;

    if (CLUSTER_FILTER && cluster.slug !== CLUSTER_FILTER) {
      console.log(`Skipping ${cluster.slug} (filter: ${CLUSTER_FILTER})`);
      continue;
    }

    console.log(
      `\nProcessing: ${cluster.title} (${lessons.length} lessons)`
    );

    const clusterDocId = `learnToSurfCluster-en-${cluster.slug}`;
    const mutations: any[] = [createClusterDoc(cluster)];

    for (const lesson of lessons) {
      mutations.push(createLessonDoc(lesson, clusterDocId));
    }

    console.log(`  → ${mutations.length} mutations prepared`);

    if (DRY_RUN) {
      console.log("  → DRY RUN: skipping Sanity API call");
      for (const m of mutations) {
        const doc = m.createOrReplace;
        console.log(`    - ${doc._type}: ${doc.title} (${doc._id})`);
      }
      continue;
    }

    try {
      const result = await client.mutate(mutations);
      console.log(
        `  → Success: ${result.results.length} documents created/updated`
      );
    } catch (err: any) {
      console.error(`  → Error: ${err.message}`);
      if (err.response?.body) {
        console.error(JSON.stringify(err.response.body, null, 2));
      }
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
