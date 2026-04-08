/**
 * Blog-to-Lesson Content Gap Analysis
 *
 * Fetches blog posts and their corresponding Learn to Surf lessons from Sanity,
 * converts Portable Text to plain text, and uses Claude to compare content depth.
 * Outputs a detailed markdown report with merge recommendations.
 *
 * Usage: node scripts/audit-content-gaps.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env manually (no dotenv dependency)
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) {
    env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
}

const SANITY_TOKEN = env.SANITY_WRITE_TOKEN;
const ANTHROPIC_KEY = env.ANTHROPIC_API_KEY;

if (!SANITY_TOKEN) throw new Error("Missing SANITY_WRITE_TOKEN in .env");
if (!ANTHROPIC_KEY) throw new Error("Missing ANTHROPIC_API_KEY in .env");

const client = createClient({
  projectId: "ypmt1bmc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: SANITY_TOKEN,
  useCdn: false,
});

// 14 redirected blog posts -> 8 unique lessons
const REDIRECT_PAIRS = [
  { blogSlug: "how-to-pop-up-on-a-surfboard", lessonSlug: "pop-up", clusterSlug: "surf-fundamentals" },
  { blogSlug: "8-steps-on-how-to-pop-up-on-a-surfboard", lessonSlug: "pop-up", clusterSlug: "surf-fundamentals" },
  { blogSlug: "how-to-read-waves", lessonSlug: "reading-waves", clusterSlug: "wave-knowledge" },
  { blogSlug: "basics-to-read-a-wave", lessonSlug: "reading-waves", clusterSlug: "wave-knowledge" },
  { blogSlug: "common-surfing-mistakes", lessonSlug: "beginner-mistakes", clusterSlug: "surf-fundamentals" },
  { blogSlug: "mistakes-you-make-as-a-surfer-and-tips-on-how-to-fix-them", lessonSlug: "beginner-mistakes", clusterSlug: "surf-fundamentals" },
  { blogSlug: "learn-how-to-duck-dive", lessonSlug: "duck-dive", clusterSlug: "paddling" },
  { blogSlug: "what-is-duck-diving", lessonSlug: "duck-dive", clusterSlug: "paddling" },
  { blogSlug: "how-to-take-wax-off-a-surfboard", lessonSlug: "waxing-rewax", clusterSlug: "surf-equipment" },
  { blogSlug: "how-to-wax-a-surfboard", lessonSlug: "waxing-rewax", clusterSlug: "surf-equipment" },
  { blogSlug: "surf-etiquette-for-surfers", lessonSlug: "surf-etiquette", clusterSlug: "surf-etiquette" },
  { blogSlug: "what-is-the-diving-reflex", lessonSlug: "staying-calm-underwater", clusterSlug: "surf-mindset" },
  { blogSlug: "barrel-riding-basics", lessonSlug: "barrel-riding", clusterSlug: "surf-maneuvers" },
  { blogSlug: "how-to-surf-barrel-riding-tips", lessonSlug: "barrel-riding", clusterSlug: "surf-maneuvers" },
];

// 9 cross-link blog posts
const CROSSLINK_POSTS = [
  { blogSlug: "surfing-for-beginners", lessons: ["surf-fundamentals/first-waves", "surf-mindset/surf-confidence"] },
  { blogSlug: "surfing-safety-tips-in-costa-rica", lessons: ["surf-etiquette/safety-basics"] },
  { blogSlug: "surfing-safety-in-ocean", lessons: ["surf-etiquette/safety-basics"] },
  { blogSlug: "choosing-beginner-surfboards", lessons: ["surf-equipment/surfboards-for-beginners"] },
  { blogSlug: "how-to-choose-the-right-surfboard-for-you", lessons: ["surf-equipment/surfboards-for-beginners"] },
  { blogSlug: "the-best-soft-top-surfboards", lessons: ["surf-equipment/surfboards-for-beginners"] },
  { blogSlug: "a-guide-to-different-types-of-surfboards", lessons: ["surf-equipment/board-types"] },
  { blogSlug: "how-to-cutback-a-surfers-guide", lessons: ["surf-maneuvers/cutback"] },
  { blogSlug: "beginners-guide-to-ericeira", lessons: ["surf-fundamentals/first-waves"] },
];

function portableTextToPlain(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";
  const parts = [];
  for (const block of blocks) {
    if (block._type === "block" && block.children) {
      const text = block.children.map((c) => c.text || "").join("");
      if (text.trim()) parts.push(text);
    }
  }
  return parts.join("\n\n");
}

function countWords(text) {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

async function askClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

async function compareContent(blogTitle, blogText, blogWordCount, lessonTitle, lessonText, lessonWordCount) {
  const prompt = `You are an SEO content analyst. Compare these two pieces of content about the same surf topic. The blog post is being 301-redirected to the lesson page — we need to ensure no valuable content is lost.

BLOG POST: "${blogTitle}"
Word count: ${blogWordCount}
---
${blogText.slice(0, 8000)}
---

LESSON PAGE: "${lessonTitle}"
Word count: ${lessonWordCount}
---
${lessonText.slice(0, 8000)}
---

Analyze both texts and return ONLY valid JSON (no markdown fences, no explanation outside the JSON):
{
  "topicsCoveredByBoth": ["list of topics/sections covered in both"],
  "topicsOnlyInBlog": ["topics, tips, or sections that appear ONLY in the blog post"],
  "topicsOnlyInLesson": ["topics or sections that appear ONLY in the lesson"],
  "uniqueBlogInsights": ["specific tips, examples, anecdotes, or practical details from the blog that are missing from the lesson — be specific"],
  "contentDepthComparison": "blog-deeper" or "lesson-deeper" or "comparable",
  "mergeRecommendation": "no-action" or "merge-minor" or "merge-significant",
  "mergeReason": "one sentence explaining why",
  "specificContentToMerge": ["if merge recommended: describe exactly what paragraphs/sections should be added to the lesson, with enough detail to act on"],
  "seoNotes": "any keywords, search intent angles, or ranking signals in the blog that the lesson should preserve"
}`;

  const raw = await askClaude(prompt);
  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn(`  Warning: Could not parse Claude response, using raw text`);
    return { raw, parseError: true };
  }
}

async function analyzeCrossLink(blogTitle, blogText, lessonPaths) {
  const prompt = `You are an SEO internal linking specialist. This blog post should NOT be redirected, but should contain internal links to the Learn to Surf lesson pages listed below.

BLOG POST: "${blogTitle}"
---
${blogText.slice(0, 6000)}
---

LESSON PAGES TO LINK TO:
${lessonPaths.map((p) => `- /learn-to-surf/${p}`).join("\n")}

Return ONLY valid JSON (no markdown fences):
{
  "suggestedLinks": [
    {
      "lessonUrl": "/learn-to-surf/...",
      "anchorText": "suggested anchor text for the link",
      "placementContext": "which paragraph/section of the blog post this link should go in",
      "reason": "why this link adds value"
    }
  ],
  "reverseLinks": [
    {
      "fromLesson": "/learn-to-surf/...",
      "anchorText": "suggested anchor text linking back to this blog post",
      "reason": "why linking from the lesson to this blog post adds value"
    }
  ]
}`;

  const raw = await askClaude(prompt);
  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw, parseError: true };
  }
}

async function main() {
  console.log("=== Blog-to-Lesson Content Gap Analysis ===\n");

  // Collect all slugs we need
  const blogSlugs = [
    ...REDIRECT_PAIRS.map((p) => p.blogSlug),
    ...CROSSLINK_POSTS.map((p) => p.blogSlug),
  ];
  const lessonSlugs = [...new Set(REDIRECT_PAIRS.map((p) => p.lessonSlug))];

  console.log(`Fetching ${blogSlugs.length} blog posts from Sanity...`);
  const blogPosts = await client.fetch(
    `*[_type == "blogPost" && slug.current in $slugs && (language == "en" || !defined(language))]{
      title, "slug": slug.current, excerpt, body, tags,
      "seo": seo { metaTitle, metaDescription }
    }`,
    { slugs: blogSlugs }
  );
  console.log(`  Found ${blogPosts.length} blog posts`);

  const blogBySlug = {};
  for (const p of blogPosts) {
    blogBySlug[p.slug] = p;
  }

  console.log(`Fetching ${lessonSlugs.length} lessons from Sanity...`);
  const lessons = await client.fetch(
    `*[_type == "learnToSurfLesson" && slug.current in $slugs && (language == "en" || !defined(language))]{
      title, "slug": slug.current, excerpt, body, keyTakeaways,
      "clusterSlug": cluster->slug.current
    }`,
    { slugs: lessonSlugs }
  );
  console.log(`  Found ${lessons.length} lessons`);

  const lessonBySlug = {};
  for (const l of lessons) {
    lessonBySlug[l.slug] = l;
  }

  // --- Part 1: Redirect pair analysis ---
  console.log(`\nAnalyzing ${REDIRECT_PAIRS.length} redirect pairs with Claude...\n`);

  const results = [];
  for (let i = 0; i < REDIRECT_PAIRS.length; i++) {
    const pair = REDIRECT_PAIRS[i];
    const blog = blogBySlug[pair.blogSlug];
    const lesson = lessonBySlug[pair.lessonSlug];

    if (!blog) {
      console.log(`  [${i + 1}/${REDIRECT_PAIRS.length}] SKIP: Blog "${pair.blogSlug}" not found in Sanity`);
      results.push({ pair, error: "Blog post not found in Sanity", blogFound: false });
      continue;
    }
    if (!lesson) {
      console.log(`  [${i + 1}/${REDIRECT_PAIRS.length}] SKIP: Lesson "${pair.lessonSlug}" not found in Sanity`);
      results.push({ pair, error: "Lesson not found in Sanity", lessonFound: false });
      continue;
    }

    const blogText = portableTextToPlain(blog.body);
    const lessonText = portableTextToPlain(lesson.body);
    const blogWordCount = countWords(blogText);
    const lessonWordCount = countWords(lessonText);

    console.log(`  [${i + 1}/${REDIRECT_PAIRS.length}] "${blog.title}" (${blogWordCount}w) vs "${lesson.title}" (${lessonWordCount}w)...`);

    try {
      const analysis = await compareContent(
        blog.title, blogText, blogWordCount,
        lesson.title, lessonText, lessonWordCount
      );
      results.push({
        pair,
        blogTitle: blog.title,
        blogWordCount,
        lessonTitle: lesson.title,
        lessonWordCount,
        lessonUrl: `/learn-to-surf/${pair.clusterSlug}/${pair.lessonSlug}`,
        analysis,
      });
    } catch (err) {
      console.log(`    Error: ${err.message}`);
      results.push({ pair, error: err.message });
    }

    // Rate limit: ~1 second between calls
    if (i < REDIRECT_PAIRS.length - 1) await new Promise((r) => setTimeout(r, 1200));
  }

  // --- Part 2: Cross-link analysis ---
  console.log(`\nAnalyzing ${CROSSLINK_POSTS.length} cross-link blog posts...\n`);

  const crossResults = [];
  for (let i = 0; i < CROSSLINK_POSTS.length; i++) {
    const item = CROSSLINK_POSTS[i];
    const blog = blogBySlug[item.blogSlug];

    if (!blog) {
      console.log(`  [${i + 1}/${CROSSLINK_POSTS.length}] SKIP: Blog "${item.blogSlug}" not found`);
      crossResults.push({ item, error: "Blog post not found" });
      continue;
    }

    const blogText = portableTextToPlain(blog.body);
    console.log(`  [${i + 1}/${CROSSLINK_POSTS.length}] "${blog.title}" -> ${item.lessons.join(", ")}...`);

    try {
      const analysis = await analyzeCrossLink(blog.title, blogText, item.lessons);
      crossResults.push({
        item,
        blogTitle: blog.title,
        blogWordCount: countWords(blogText),
        analysis,
      });
    } catch (err) {
      console.log(`    Error: ${err.message}`);
      crossResults.push({ item, error: err.message });
    }

    if (i < CROSSLINK_POSTS.length - 1) await new Promise((r) => setTimeout(r, 1200));
  }

  // --- Generate report ---
  console.log("\nGenerating report...");

  const validResults = results.filter((r) => r.analysis && !r.analysis.parseError);
  const mergeSignificant = validResults.filter((r) => r.analysis.mergeRecommendation === "merge-significant");
  const mergeMinor = validResults.filter((r) => r.analysis.mergeRecommendation === "merge-minor");
  const noAction = validResults.filter((r) => r.analysis.mergeRecommendation === "no-action");
  const errors = results.filter((r) => r.error || r.analysis?.parseError);

  let md = `# Blog-to-Lesson Content Gap Analysis\n\n`;
  md += `**Generated:** ${new Date().toISOString().split("T")[0]}\n`;
  md += `**Pairs analyzed:** ${REDIRECT_PAIRS.length} redirect pairs + ${CROSSLINK_POSTS.length} cross-link posts\n\n`;
  md += `---\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `| Category | Count |\n`;
  md += `|----------|-------|\n`;
  md += `| Merge Significant (content at risk) | ${mergeSignificant.length} |\n`;
  md += `| Merge Minor (nice to have) | ${mergeMinor.length} |\n`;
  md += `| No Action (lesson covers everything) | ${noAction.length} |\n`;
  md += `| Errors / Not Found | ${errors.length} |\n`;
  md += `| Cross-Link Posts Analyzed | ${crossResults.filter((r) => !r.error).length} |\n\n`;

  // Overview table
  md += `## Redirect Pairs Overview\n\n`;
  md += `| Blog Post | Words | Lesson | Words | Depth | Recommendation |\n`;
  md += `|-----------|-------|--------|-------|-------|----------------|\n`;
  for (const r of validResults) {
    const rec = r.analysis.mergeRecommendation === "merge-significant" ? "**MERGE SIGNIFICANT**"
      : r.analysis.mergeRecommendation === "merge-minor" ? "Merge Minor"
      : "No Action";
    md += `| ${r.blogTitle} | ${r.blogWordCount} | ${r.lessonTitle} | ${r.lessonWordCount} | ${r.analysis.contentDepthComparison} | ${rec} |\n`;
  }
  md += `\n`;

  // Detailed analysis per pair
  md += `---\n\n## Detailed Analysis\n\n`;

  // Group by lesson to consolidate multiple blog posts pointing to the same lesson
  const byLesson = {};
  for (const r of validResults) {
    const key = r.lessonUrl;
    if (!byLesson[key]) byLesson[key] = { lessonTitle: r.lessonTitle, lessonUrl: r.lessonUrl, lessonWordCount: r.lessonWordCount, blogs: [] };
    byLesson[key].blogs.push(r);
  }

  for (const [lessonUrl, group] of Object.entries(byLesson)) {
    md += `### ${group.lessonTitle}\n`;
    md += `**Lesson:** \`${lessonUrl}\` (${group.lessonWordCount} words)\n\n`;

    for (const r of group.blogs) {
      const a = r.analysis;
      md += `#### Blog: "${r.blogTitle}"\n`;
      md += `**URL:** \`/blog/${r.pair.blogSlug}\` | **Words:** ${r.blogWordCount} | **Recommendation:** ${a.mergeRecommendation}\n\n`;

      if (a.mergeReason) {
        md += `**Why:** ${a.mergeReason}\n\n`;
      }

      md += `**Content depth:** ${a.contentDepthComparison}\n\n`;

      if (a.topicsCoveredByBoth?.length) {
        md += `**Covered by both:**\n`;
        for (const t of a.topicsCoveredByBoth) md += `- ${t}\n`;
        md += `\n`;
      }

      if (a.topicsOnlyInBlog?.length) {
        md += `**Only in blog (potential gaps):**\n`;
        for (const t of a.topicsOnlyInBlog) md += `- ${t}\n`;
        md += `\n`;
      }

      if (a.topicsOnlyInLesson?.length) {
        md += `**Only in lesson (lesson is stronger here):**\n`;
        for (const t of a.topicsOnlyInLesson) md += `- ${t}\n`;
        md += `\n`;
      }

      if (a.uniqueBlogInsights?.length) {
        md += `**Unique blog insights to preserve:**\n`;
        for (const t of a.uniqueBlogInsights) md += `- ${t}\n`;
        md += `\n`;
      }

      if (a.specificContentToMerge?.length) {
        md += `**Specific content to merge into lesson:**\n`;
        for (const t of a.specificContentToMerge) md += `1. ${t}\n`;
        md += `\n`;
      }

      if (a.seoNotes) {
        md += `**SEO notes:** ${a.seoNotes}\n\n`;
      }

      md += `---\n\n`;
    }
  }

  // Errors section
  if (errors.length > 0) {
    md += `## Errors\n\n`;
    for (const r of errors) {
      md += `- \`/blog/${r.pair.blogSlug}\`: ${r.error || "Parse error"}\n`;
    }
    md += `\n`;
  }

  // Cross-link section
  md += `---\n\n## Cross-Link Recommendations\n\n`;
  md += `These blog posts should be kept (not redirected) but should contain internal links to Learn to Surf lessons.\n\n`;

  for (const r of crossResults) {
    if (r.error) {
      md += `### ${r.item.blogSlug}\n`;
      md += `Error: ${r.error}\n\n`;
      continue;
    }

    const a = r.analysis;
    md += `### "${r.blogTitle}"\n`;
    md += `**URL:** \`/blog/${r.item.blogSlug}\` | **Words:** ${r.blogWordCount}\n\n`;

    if (a.suggestedLinks?.length) {
      md += `**Add links from blog to lessons:**\n\n`;
      md += `| Lesson URL | Anchor Text | Where to Place | Reason |\n`;
      md += `|------------|-------------|----------------|--------|\n`;
      for (const link of a.suggestedLinks) {
        md += `| \`${link.lessonUrl}\` | "${link.anchorText}" | ${link.placementContext} | ${link.reason} |\n`;
      }
      md += `\n`;
    }

    if (a.reverseLinks?.length) {
      md += `**Add links from lessons back to blog:**\n\n`;
      md += `| From Lesson | Anchor Text | Reason |\n`;
      md += `|-------------|-------------|--------|\n`;
      for (const link of a.reverseLinks) {
        md += `| \`${link.fromLesson}\` | "${link.anchorText}" | ${link.reason} |\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  }

  // Action checklist
  md += `## Action Checklist\n\n`;
  md += `### Priority 1: Merge Significant\n`;
  if (mergeSignificant.length === 0) {
    md += `_None — all lessons adequately cover the blog content._\n\n`;
  } else {
    for (const r of mergeSignificant) {
      md += `- [ ] Merge content from "${r.blogTitle}" into \`${r.lessonUrl}\`\n`;
    }
    md += `\n`;
  }

  md += `### Priority 2: Merge Minor\n`;
  if (mergeMinor.length === 0) {
    md += `_None._\n\n`;
  } else {
    for (const r of mergeMinor) {
      md += `- [ ] Consider merging from "${r.blogTitle}" into \`${r.lessonUrl}\`\n`;
    }
    md += `\n`;
  }

  md += `### Priority 3: Add Cross-Links\n`;
  for (const r of crossResults.filter((r) => !r.error)) {
    md += `- [ ] Add internal links in \`/blog/${r.item.blogSlug}\`\n`;
  }
  md += `\n`;

  const outputPath = join(__dirname, "..", "docs", "blog-lesson-content-gaps.md");
  writeFileSync(outputPath, md);
  console.log(`\nReport written to: docs/blog-lesson-content-gaps.md`);
  console.log(`  Merge significant: ${mergeSignificant.length}`);
  console.log(`  Merge minor: ${mergeMinor.length}`);
  console.log(`  No action: ${noAction.length}`);
  console.log(`  Cross-link posts: ${crossResults.filter((r) => !r.error).length}`);
}

main().catch(console.error);
